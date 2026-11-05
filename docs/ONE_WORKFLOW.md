# Nihongo Path — One source of truth

## Daily development (home PC and office PC)

- **One GitHub repository:** `dqhuy1982-stack/NihongoPath`.
- **One active working branch:** `develop`. No separate home/office/phone branches.
- **One checkout per PC:** `C:\Dev\NihongoPath`; both checkouts pull/push `origin/develop`.
- `main` is a release/reference branch, **not** a second codebase to edit in parallel.
- Old `feature/*` and `fix/*` branches are historical, not places to continue work. Do not delete without confirming whether they contain unique commits.
- One planned public app: `nihongopath.dqhuy1982.workers.dev`. The original ChatGPT Site stays preserved as its historical baseline, not a second actively developed app.
- One planned shared learning database: Cloudflare D1 `nihongopath-dev`, initially development; remote data synchronization **is not live yet**.

### On each PC before starting work

```powershell
cd C:\Dev\NihongoPath
git status -sb
git fetch origin
git switch develop
git pull --ff-only origin develop
git log -1 --oneline
```

Do not switch branches when there are local edits you need to save first. For script
restriction on managed Windows, use `npm.cmd` / `npx.cmd` where permitted by IT policy.

### After finishing an approved code change

```powershell
git status --short
git add <the-specific-files-you-changed>
git commit -m "feat: describe change"
git push origin develop
```

On the other PC, use `git pull --ff-only origin develop`. Never edit both
PCs concurrently without pulling first. Do not commit generated files,
`node_modules`, `.dev.vars`, `.wrangler`, or `.private-backups`.

### Data does not follow Git

Git syncs source, **not** study history. Completed learning is saved in HOME
local D1 and local SQL backup. Remote D1 had **0 records in all 7 learning tables**
at the last verified check on 2026-11-05. Do not reset home local D1 or
initialize fresh remote learner profiles before a verified migration.

Use remote D1 as the eventual single place for all family study progress only
after a guarded data transfer and backend activation. Do not store Cloudflare
account tokens, personal study backups or family sync key on the work computer.

### Release approach

Do **not** create another public demo/site just to test sync. Keep the current
one-URL website. Before switching its static frontend to D1-backed mode,
validate API access control, remote backup, all four learner records and
successful PC/iPhone sync/rollback. The separate Wrangler sandbox config is a
local/build safety tool, not a second user-facing site or a second dataset
to maintain.
