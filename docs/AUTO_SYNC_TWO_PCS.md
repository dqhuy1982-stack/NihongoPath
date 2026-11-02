# NIHONGO PATH — Two-PC Auto Sync

Status: scripts are in the private source repository on develop. They are NOT enabled on either PC until installed there. The source main, original ChatGPT Site, Public Demo and database remain untouched.

## How this works

- Windows Task Scheduler invokes scripts/nihongo-autosync.py every 2 minutes through Python 3.
- After an edit is saved and unchanged for 90 seconds, AutoSync runs basic safety/syntax checks, commits existing tracked files to PRIVATE develop, and pushes through GitHub.
- The second PC pulls automatically only when it has no local edits in progress.
- Delays after saving can be approximately 2–4 minutes; this is not live shared editing.
- Offline or sleeping machines cannot sync until online and the scheduled task runs again.
- AutoSync never force-pushes, resets files, commits deletions, auto-adds untracked files, changes source main or deploys the public website.
- If only untracked files exist, AutoSync may still safely pull remote commits, but it never commits those files. If untracked files and tracked edits coexist, auto-commit pauses for manual review. Git refuses a Pull that would overwrite an untracked file.
- On an automatic rebase conflict it aborts the rebase (retains local commits) and creates a marker in .git/nihongo-autosync.conflict. Further automatic commits/merges pause until the user resolves it.
- JavaScript syntax, JSON syntax, staged whitespace and a few common secret patterns are checked. This is NOT a substitute for testing, review or secret scanning.
- Progress saved in a browser's localStorage, databases, passwords and unsaved editor text are NOT synchronized through Git.

## First-time installation on SECOND PC

Both PCs already have Git and Python 3; Node.js is required for automatic JS syntax checking.

    cd C:\Dev\NihongoPath
    git status -sb
    git pull --ff-only origin develop
    py -3 .\scripts\nihongo-autosync.py --status
    & ".\scripts\Install-Nihongo-Sync.cmd"
    schtasks /Query /TN "NihongoPath-Develop-AutoSync"

The task is registered for the current Windows user and executes every 2 minutes. It does not modify PowerShell ExecutionPolicy. The task runner performs Git operations using existing Git credentials. Run a cycle right away if needed:

    schtasks /Run /TN "NihongoPath-Develop-AutoSync"

Read task output here after first run:

    Get-Content "C:\Dev\NihongoPath\.git\nihongo-autosync.log" -Tail 25

## First-time installation on HOME PC

Warning: home PC previously downloaded 46 Kana MP3s as untracked files, and the branch now tracks those same paths. Do not overwrite them or force the Pull.

Start:

    cd C:\Dev\NihongoPath
    git status -sb

IF and ONLY IF all untracked files are in source/public/assets/kana-audio and have .mp3 or pack.json names, move them aside into a backup outside the repo before the Pull:

    $src="C:\Dev\NihongoPath\source\public\assets\kana-audio"
    $backup="C:\Dev\NihongoPath-Audio-Backup"
    if (Test-Path $backup) { throw "Backup already exists; review it first." }
    New-Item -ItemType Directory -Path $backup | Out-Null
    Get-ChildItem $src -File | Where-Object {
      $_.Extension -eq ".mp3" -or $_.Name -eq "pack.json"
    } | Move-Item -Destination $backup

Do not run this backup step when those files are already tracked. If there are other modified or untracked source files, review them before Pull; never delete files or reset Git automatically.

With the working tree clean:

    git pull --ff-only origin develop
    py -3 .\scripts\nihongo-autosync.py --status
    & ".\scripts\Install-Nihongo-Sync.cmd"

Check 46 audio files are now tracked and playable before removing your backup.

## Everyday rules on both PCs

1. Edit one PC at a time. Save files before switching PC.
2. The edited PC waits until the automatic Commit/Push finishes. Confirm by checking git status and the AutoSync log.
3. The other PC picks up changes automatically if its working tree is clean. Wait for the scheduled cycle or run one manually before editing.
4. New files are not automatically staged. Review them, then explicitly run git add -- path/to/file, or use manual commit/push. Deletions require manual review too.
5. If both PCs change the same file at the same time, automatic sync may stop with a conflict. Resolve it manually, test, then clear the marker after reconciliation.
6. Do not put tokens, passwords, actual family data, or private environment files into auto-committed source.
7. Updating private develop NEVER automatically updates GitHub Pages. Public Demo releases remain a separate reviewed operation.

## Useful commands

Read-only status:

    cd C:\Dev\NihongoPath
    git status -sb
    py -3 .\scripts\nihongo-autosync.py --status
    Get-Content .git\nihongo-autosync.log -Tail 30

Start one safe synchronization cycle:

    py -3 .\scripts\nihongo-autosync.py --once

Inspect the Windows task:

    schtasks /Query /TN "NihongoPath-Develop-AutoSync" /V /FO LIST

Uninstall scheduled automation (keeps all files and Git history):

    & .\scripts\Uninstall-Nihongo-Sync.cmd

Never run git push --force, git reset --hard, or git clean to solve sync failures. The conflict marker is a deliberate stop condition and should only be removed after the conflict and Git history have been manually reconciled.

## Optional: pause during complex development

If you need more than a few minutes for a larger or sensitive edit, temporarily pause automation rather than risking an unfinished change being auto-committed:

    New-Item -ItemType File -Path "C:\Dev\NihongoPath\.git\nihongo-autosync.pause" -Force | Out-Null

When tests pass and you are ready to share saved changes, resume:

    Remove-Item "C:\Dev\NihongoPath\.git\nihongo-autosync.pause"
    py -3 "C:\Dev\NihongoPath\scripts\nihongo-autosync.py" --once

This does not pause GitHub or the other PC. It pauses automation on the CURRENT PC only. Do not delete the separate conflict marker as a workaround.
