# Nihongo Path — one website, one remote database

## Decision (5 November 2026)
The user confirmed all completed home PC learning is **demo data** and may be
discarded. We will start fresh in the existing Cloudflare D1 remote database;
**NO local SQL transfer, import, migration, or local D1 reset is necessary**.
Both computers work from `develop` in the same GitHub repository.

| Item | Single source |
| --- | --- |
| Source | `dqhuy1982-stack/NihongoPath`, branch `develop` |
| Published website | `https://nihongopath.dqhuy1982.workers.dev` |
| Worker | `nihongopath` (existing, **not** a new Worker) |
| Database | `nihongopath-dev` (existing D1 ID `8504e0d8-c7a5-490d-ab40-a7590cd9af9d`) |
| Runtime/deployment config | root `wrangler.jsonc` |
| Build | `NP_FAMILY_SYNC_BUILD=1 node scripts/build-site.cjs` |
| Learners | Four profiles managed under verified owner `family:primary` |
| Authentication | Public website; optional first-time device pairing through family secret; **no Cloudflare Access/OTP** |

Remote D1 was verified to have **zero records in all seven learning tables**
before this decision. Recheck if there has been any intervening use.

## Deploy in controlled order (never put secret in git)

1. Complete GitHub Learning QA and Security Gate. Update both PCs by running
   `git pull --ff-only origin develop` on their `develop` branches.
2. In Cloudflare Dashboard → Workers & Pages → existing **nihongopath** →
   Settings → Variables and Secrets, add a `Secret` named `FAMILY_SYNC_KEY`
   (32–256 random characters) and keep its value in a PERSONAL password manager,
   **not** in source, a corporate OneDrive, chat, screenshots or `wrangler.jsonc`.
   Adding/updating the Worker secret can itself create a deployment; do not
   confuse that with a code deployment. The backend deliberately rejects API
   requests if the key is absent. Do not enable access policies.
3. Dry run from the single source:
   ```powershell
   cd C:\Dev\NihongoPath
   git switch develop
   git pull --ff-only origin develop
   powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\Deploy-NihongoPath.ps1
   ```
4. Once the secret has been configured, deploy the **existing** Worker only:
   ```powershell
   powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\Deploy-NihongoPath.ps1 -Publish
   ```
   The script refuses a different Worker, missing D1, missing secret name, or
   unexpected branch/config. It requests final `PUBLISH` confirmation.
5. Without any family key, `https://nihongopath.dqhuy1982.workers.dev/api/pilot/bootstrap`
   should respond **401**. Missing server secret results in **503** and must
   be fixed before connecting a device. Never put family code in URL.
6. Open the **same website URL**, tap **Bật đồng bộ gia đình**, enter the same
   key once on the first device, then **Khởi tạo không gian học** (once only).
   Edit the four learner names/goals as desired. On the other PC/iPhone, open
   the exact same URL and enter the same code once; it must download the
   existing four profiles and progress instead of asking to create them again.
7. Verify lesson completion and Kana practice survive refresh and appear from
   the second device. If the API fails, do not wipe remote D1 or initialize a
   duplicate owner. The underlying home local demo stays untouched, unused.

## Prevent future auto-deploy rollback

The Worker is GitHub-connected. In Cloudflare Worker → Settings → Build,
set **production branch** to `develop`, **build command** to
`npm install --no-audit --no-fund && NP_FAMILY_SYNC_BUILD=1 node scripts/build-site.cjs`,
**deploy command** to `npx wrangler deploy --config wrangler.jsonc` and
**root directory** to repository root. The connected repo may originally
track `main`; do not leave a second branch able to redeploy the older
static-only site over the manually deployed Worker. Disable previews if no
longer needed. Apply these settings only after the secret exists.

## Security and limits

Anyone can open the public UI, but D1 API data read/write requires a valid
household secret. Anyone holding the secret can access/edit all four profiles:
avatars are **not** separate authentication boundaries. Treat the code like
a password, stored only in trusted personal devices. Avoid using shared or
managed business devices for secret storage when company policy disallows it.
Browser-local demo progress is not cloud progress, even if the UI looks alike.
Do not import any home local SQL; this was specifically discarded as demo.
