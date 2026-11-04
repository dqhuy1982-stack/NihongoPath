# NIHONGO PATH - One source, one public website

## Decision (2026-11-04)

- **Single authoritative source**: private GitHub `dqhuy1982-stack/NihongoPath`, branch `develop`.
- **Two PCs**: each uses its own clone at `C:\Dev\NihongoPath`. GitHub is the synchronization mechanism; local copies are necessary development worktrees, not divergent sources.
- **One public website**: Cloudflare Pages connected DIRECTLY to the private GitHub repo. Each reviewed commit pushed to `develop` automatically builds/deploys the static website.
- **No second GitHub publication repository or manual public-copy process** for future work. The existing GitHub Public-Demo repository is retained only until the new site works.
- The protected source `main` and original ChatGPT Site are left unchanged. Git branches are history, not independent sites.

## One-time Cloudflare Pages setup

1. Open Cloudflare dashboard > Workers & Pages > Create application > Pages > Connect to Git.
2. Connect GitHub, grant access to only `dqhuy1982-stack/NihongoPath` (private).
3. Choose a clean public site/project name, such as `nihongo-path` if available.
4. Configure:
   - Production branch: **develop**
   - Framework preset: **None**
   - Root directory: `/` (repository root, NOT `source`)
   - Build command: `node scripts/build-site.cjs`
   - Build output directory: `dist/site`
   - Environment variable: `NODE_VERSION=24` if the build environment needs an explicit version
5. Deploy. Confirm successful build: 3 Kana test files, verified static export, all 46 MP3 files; review public URL from Cloudflare dashboard. Never guess a `pages.dev` URL before deployment.
6. Test on PC and iPhone mobile data: login UI, Kana Studio, stroke numbers, audio playback, Recall Lab. Check that opening root public URL does not append `?mode=demo`.

This is CURRENTLY A CLIENT-ONLY SITE. It is public, but it has **no production authentication and no server-backed learner progress synchronization**. Browser-local study data from the old URL is NOT migrated to the new origin. Existing `PATH-DEMO` sample codes and local profiles are NOT passwords or security isolation. Do not enter real passwords or personal data.

When real database and authentication become ready, switch the **same repository** to a server-capable hosting/deployment pipeline after integration tests, permissions and data migration checks. Do not claim live multi-device progress before that.

## Daily workflow on either PC

1. On PC A: `Fetch/Pull develop` in GitHub Desktop before editing.
2. Edit and test; commit, then `Push origin` when changes are ready to publish.
3. On PC B: `Fetch/Pull develop` before continuing.
4. Cloudflare automatically deploys validated commits. If build/tests fail, inspect deployment logs and fix source; do not promote broken output.
5. Avoid enabling the optional 2-minute AutoSync scheduled task on the production-connected branch; it may push unfinished changes and trigger public deployments.

## Remove old copies - only after new public URL is working

Once the Cloudflare site is working on PC and iPhone, the old local GitHub Pages working directories are redundant:

- `C:\Dev\NihongoPath-Public-Demo`
- `C:\Dev\NihongoPath-Public-Release`
- `C:\Dev\NihongoPath-Public-Demo-Backup-*` (review each backup first)

**Do not delete** `C:\Dev\NihongoPath` on either PC, or the private repo. Do not remove MP3/audio backups until source tracks all 46 clips and a new local setup plays them correctly. Do not remove any local directory with independent work or uncommitted changes until reviewed.

After the new public URL is confirmed and saved, the old **GitHub** repository `NihongoPath-Public-Demo` may be deleted manually in its own Settings > General > Danger Zone > Delete this repository. GitHub deletion also breaks the old Pages URL; do not do this before successful cutover. Deleting a public repo does not remove any data already downloaded by others.

## Local verification command (source only)

```powershell
cd C:\Dev\NihongoPath
git status -sb
node scripts/build-site.cjs
```

Output: `dist/site/index.html`, 46 audio MP3s, and `SITE_STATUS.txt`. Build does not publish or alter the original `source/public` files.
