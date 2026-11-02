#!/usr/bin/env python3
"""Nihongo Path safe two-PC source synchronization.

Run by Windows Task Scheduler every two minutes:
  py -3 scripts\nihongo-autosync.py --once
Inspect without changing files:
  py -3 scripts\nihongo-autosync.py --status

Invariants: only private source repo on develop, never main, no force/reset,
never auto-add untracked files or auto-commit deletions, no public deployment.
"""
import argparse
import datetime as dt
import os
from pathlib import Path
import re
import subprocess
import sys
import time

ROOT = Path(__file__).resolve().parent.parent
QUIET_SECONDS = 90
LOG_LIMIT = 250_000
SECRET_RE = re.compile(
    rb"(?:gh[pousr]_[A-Za-z0-9]{25,}|github_pat_[A-Za-z0-9_]{30,}"
    rb"|AIza[A-Za-z0-9_-]{30,}|-----BEGIN [A-Z ]*PRIVATE KEY-----"
    rb"|sk-(?:proj-)?[A-Za-z0-9_-]{30,})"
)
BLOCK_NAMES = {".env", ".dev.vars", "id_rsa"}
BLOCK_SUFFIXES = {".pem", ".pfx", ".p12", ".key"}
TASK = "NihongoPath-Develop-AutoSync"


def run(*args, timeout=45, check=True):
    proc = subprocess.run(
        ["git", *args], cwd=ROOT, stdout=subprocess.PIPE,
        stderr=subprocess.PIPE, timeout=timeout
    )
    if check and proc.returncode:
        msg = proc.stderr.decode("utf-8", "replace").strip()
        raise RuntimeError(f"git {args[0]} failed ({proc.returncode}): {msg[:350]}")
    return proc.stdout


def log(message):
    now = dt.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    entry = f"[{now}] {message}"
    print(entry, flush=True)
    try:
        gitdir = Path(run("rev-parse", "--absolute-git-dir").decode().strip())
        dest = gitdir / "nihongo-autosync.log"
        if dest.exists() and dest.stat().st_size > LOG_LIMIT:
            dest.write_bytes(dest.read_bytes()[-80_000:])
        with dest.open("a", encoding="utf-8") as fh:
            fh.write(entry + "\n")
    except (OSError, RuntimeError):
        pass


def zfiles(*args):
    value = run(*args)
    return [Path(x.decode("utf-8", "surrogateescape")) for x in value.split(b"\0") if x]


def simple_files(*args):
    return [line for line in run(*args).decode("utf-8", "replace").splitlines() if line]


def changes():
    return {
        "unstaged": zfiles("diff", "--name-only", "-z"),
        "staged": zfiles("diff", "--cached", "--name-only", "-z"),
        "untracked": zfiles("ls-files", "--others", "--exclude-standard", "-z"),
        "deleted": zfiles("ls-files", "--deleted", "-z"),
    }


def validate_context():
    top = Path(run("rev-parse", "--show-toplevel").decode().strip()).resolve()
    if top != ROOT.resolve():
        raise RuntimeError("Not the original NihongoPath source checkout.")
    branch = run("branch", "--show-current").decode().strip()
    if branch != "develop":
        raise RuntimeError(f"Stopped on branch '{branch}'. AutoSync uses develop only.")
    remote = run("remote", "get-url", "origin").decode().strip()
    match = re.fullmatch(
        r"(?:https://github\.com/|git@github\.com:)"
        r"dqhuy1982-stack/NihongoPath(?:\.git)?/?", remote, re.I
    )
    if not match:
        raise RuntimeError("Origin does not match the private NihongoPath source repository.")
    gitdir = Path(run("rev-parse", "--absolute-git-dir").decode().strip())
    if any((gitdir / part).exists() for part in
           ("index.lock", "MERGE_HEAD", "CHERRY_PICK_HEAD", "rebase-merge", "rebase-apply")):
        raise RuntimeError("Other Git operation in progress. No automated changes.")
    return gitdir


def quiet_and_safe(paths):
    for rel in paths:
        name = rel.name.lower()
        if name in BLOCK_NAMES or name.startswith(".env.") or rel.suffix.lower() in BLOCK_SUFFIXES:
            raise RuntimeError(f"Sensitive/config path requires manual review: {rel}")
        path = ROOT / rel
        if not path.is_file():
            raise RuntimeError(f"Deleted or missing file requires manual review: {rel}")
        if time.time() - path.stat().st_mtime < QUIET_SECONDS:
            return False
    return True


def preflight_staged():
    # Detect a few common secrets in newly added text. Not a replacement
    # for human review or secret scanning in GitHub.
    patch = run("diff", "--cached", "--unified=0", "--no-ext-diff", timeout=40)
    if len(patch) > 8_000_000:
        raise RuntimeError("Large staged patch requires manual review.")
    additions = b"\n".join(
        line[1:] for line in patch.splitlines()
        if line.startswith(b"+") and not line.startswith(b"+++")
    )
    if SECRET_RE.search(additions):
        raise RuntimeError("Possible secret in staged changes. Manual review required.")
    check = subprocess.run(
        ["git", "diff", "--cached", "--check"], cwd=ROOT,
        stdout=subprocess.PIPE, stderr=subprocess.PIPE, timeout=20
    )
    if check.returncode:
        raise RuntimeError("git diff --cached --check found whitespace errors.")
    for path in zfiles("diff", "--cached", "--name-only", "-z"):
        if path.suffix.lower() in (".js", ".cjs", ".mjs"):
            # Optional, but on both devices Node.js should now be installed.
            proc = subprocess.run(
                ["node", "--check", str(ROOT / path)], cwd=ROOT,
                stdout=subprocess.PIPE, stderr=subprocess.PIPE, timeout=15
            )
            if proc.returncode:
                raise RuntimeError(f"JavaScript syntax check failed: {path}")
        elif path.suffix.lower() in (".json", ".webmanifest"):
            import json
            with (ROOT / path).open("r", encoding="utf-8-sig") as file:
                json.load(file)


def remote_sync():
    gitdir = Path(run("rev-parse", "--absolute-git-dir").decode().strip())
    blocked = gitdir / "nihongo-autosync.conflict"
    if blocked.exists():
        raise RuntimeError("Earlier sync detected a Git conflict. "
                           "Review log and resolve manually before enabling automatic updates.")
    run("fetch", "--quiet", "origin", "develop", timeout=60)
    local = run("rev-parse", "HEAD").strip()
    remote = run("rev-parse", "origin/develop").strip()
    if local == remote:
        return "Already synchronized"
    base = run("merge-base", "HEAD", "origin/develop").strip()
    if base == local:
        run("merge", "--ff-only", "origin/develop", timeout=40)
        return "Fast-forwarded remote changes"
    if base != remote:
        # Two machines changed the branch independently. Rebase only while
        # local tree is clean; abort if any conflict, preserving local commits.
        result = subprocess.run(
            ["git", "rebase", "origin/develop"], cwd=ROOT,
            stdout=subprocess.PIPE, stderr=subprocess.PIPE, timeout=60
        )
        if result.returncode:
            abort = subprocess.run(["git", "rebase", "--abort"], cwd=ROOT,
                                   stdout=subprocess.PIPE, stderr=subprocess.PIPE, timeout=40)
            if abort.returncode:
                raise RuntimeError("Git rebase abort failed. Inspect repository manually.")
            blocked.write_text("A rebase conflict was aborted; local commits are preserved.\n"
                               "Resolve divergence manually, then delete this marker.\n",
                               encoding="utf-8")
            raise RuntimeError("Both PCs edited conflicting history; local commits preserved. "
                               "AutoSync now paused until conflict is resolved.")
    result = subprocess.run(
        ["git", "push", "origin", "develop"], cwd=ROOT,
        stdout=subprocess.PIPE, stderr=subprocess.PIPE, timeout=60
    )
    if result.returncode:
        raise RuntimeError("Push not accepted (another update or network issue). "
                           "Will safely retry on next cycle.")
    return "Local commits pushed to origin/develop"


def cycle(status_only=False):
    gitdir = validate_context()
    if not status_only and (gitdir / "nihongo-autosync.pause").exists():
        raise RuntimeError("Paused intentionally for a larger edit; remove pause marker when ready.")
    if not status_only and (gitdir / "nihongo-autosync.conflict").exists():
        raise RuntimeError("AutoSync paused by an earlier Git conflict. Review the log and resolve manually.")
    c = changes()
    local = c["unstaged"] + c["staged"]
    if status_only:
        log("STATUS branch=develop: "
            + ", ".join(f"{key}={len(files)}" for key, files in c.items()))
        return
    # A simple lock prevents overlapping 2-minute scheduled invocations.
    lockfile = gitdir / "nihongo-autosync.lock"
    try:
        fd = os.open(lockfile, os.O_CREAT | os.O_EXCL | os.O_WRONLY)
    except FileExistsError:
        if lockfile.exists() and time.time() - lockfile.stat().st_mtime > 600:
            raise RuntimeError("Stale sync lock; inspect .git/nihongo-autosync.lock manually.")
        return
    try:
        with os.fdopen(fd, "w") as lock:
            lock.write(str(os.getpid()))
        if c["untracked"] and local:
            raise RuntimeError(
                f"{len(c['untracked'])} untracked file(s) alongside tracked edits: "
                "manual review required before auto-commit.")
        if c["untracked"] and not local:
            # Untracked-only state is not a reason to block fetching safe
            # remote updates. Git fast-forward refuses to overwrite an
            # untracked collision, so user files remain protected.
            log(f"{len(c['untracked'])} untracked file(s) ignored for auto-commit; "
                "remote sync allowed if Git can fast-forward safely.")
        if c["deleted"]:
            raise RuntimeError(
                f"{len(c['deleted'])} deleted file(s): manual review required; auto-sync paused.")
        if c["staged"] and c["unstaged"]:
            raise RuntimeError("Mixed staged and unstaged edits: review and commit manually.")
        if local:
            if not quiet_and_safe(local):
                # An editor is still changing files; wait for the next cycle.
                return
            if not c["staged"]:
                run("add", "-u", "--")
            try:
                preflight_staged()
            except Exception:
                # Avoid leaving a surprise staged state if we staged automatically.
                if not c["staged"]:
                    run("restore", "--staged", "--", *[str(x) for x in c["unstaged"]])
                raise
            count = len(zfiles("diff", "--cached", "--name-only", "-z"))
            if count:
                run("commit", "-m", f"autosync(develop): {count} tracked file(s)", timeout=60)
                log(f"Auto-committed {count} reviewed tracked file(s)")
        message = remote_sync()
        if message != "Already synchronized":
            log(message)
    finally:
        try:
            lockfile.unlink(missing_ok=True)
        except OSError:
            pass


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--once", action="store_true", help="Run one safe synchronization cycle")
    parser.add_argument("--status", action="store_true", help="Read-only status, no network writes")
    args = parser.parse_args()
    try:
        cycle(status_only=args.status)
        return 0
    except (RuntimeError, OSError, subprocess.TimeoutExpired, FileNotFoundError, ValueError) as exc:
        log("PAUSED: " + str(exc).replace("\n", " ")[:500])
        return 2


if __name__ == "__main__":
    sys.exit(main())
