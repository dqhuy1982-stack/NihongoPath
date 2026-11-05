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

### One shared learning database, no demo migration

Git syncs source, **not** study history. Home D1 learning was explicitly
confirmed to be disposable **demo data**; no transfer is needed.

The existing remote Cloudflare D1 database `nihongopath-dev` is the intended
single source for new learning. It had 0 records across all seven learning
tables when last checked on 2026-11-05. A single family key is entered once on
each trusted device; thereafter both machines and iPhone use the same public
website and server-backed learning. No Cloudflare Access policy is required.
Do not put family keys or SQL backups on the company computer or GitHub.

### Release approach

Publish the same existing `nihongopath` Worker, not a new environment.
The root `wrangler.jsonc` is the only deploy config; the build must use
`NP_FAMILY_SYNC_BUILD=1 node scripts/build-site.cjs`. See
`docs/FAMILY_D1_SYNC.md` for the safe ordered deployment steps.
Configure Cloudflare Workers Builds production branch to `develop` so
future commits cannot overwrite the deployed D1-backed site with old `main`
static-only assets.
