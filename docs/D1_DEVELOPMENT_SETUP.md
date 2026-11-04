# Nihongo Path — D1 development database binding (Step 3B)
**Date:** 2026-11-04 · **Repository:** `dqhuy1982-stack/NihongoPath` · **Branch:** `develop` after review

## Configured, not yet remotely connected

| Item | Value |
| --- | --- |
| Database name | `nihongopath-dev` |
| Database ID | `8504e0d8-c7a5-490d-ab40-a7590cd9af9d` (provided by the account owner; remote existence not independently verified) |
| Worker binding | `DB` |
| Config file | `wrangler.backend.jsonc` (INACTIVE development config) |
| Original migrations | `source/drizzle/0000_tranquil_korg.sql`, `source/drizzle/0001_many_blackheart.sql` |
| Production config | `wrangler.jsonc` — unchanged static deployment |

The development config has a **different Worker name** (`nihongopath-d1-sandbox`) to avoid accidental replacement of the public `nihongopath` Worker. No second Worker has been deployed; no remote D1 tables or data have been modified.

Do not run `npx wrangler deploy --config wrangler.backend.jsonc` until Cloudflare Access and the authorization flow are configured and verified. The gateway fails closed without `ACCESS_TEAM_DOMAIN`, `ACCESS_AUD`, `ACCESS_ALLOWED_EMAILS` and `DB`. **Never store Access tokens, API tokens or user passwords in GitHub.**

## Step 3B scope

- Reuse the original Sites API and migrations without rewriting their storage or altering a real user's records.
- The separate database is a **development D1**, not the shared learner production database.
- `docs/schema/family-accounts-v1.proposed.sql` is a design/test proposal only. It is NOT included in `migrations_dir`, so Wrangler will not apply it to the remote database.
- The proposal models `family_accounts`, `families`, `family_memberships`, and `family_learner_links`. Account IDs are derived from verified identity, and the link to the existing composite key `learners(owner,id)` is explicit.
- A parent/manager role in the proposed schema **does not yet grant access**. Actual server-side membership/permissions checks, account invitations, revocation, and independent child logins must be implemented and tested before family accounts are activated.
- The original API currently permits access to profiles within one verified **owner** only. Adding another Cloudflare Access email creates an **independent owner namespace**, not automatically a member of the same family.

## Read-only verification on the user's Windows PC

After pulling latest `develop`, from `C:\Dev\NihongoPath`:

```powershell
cd C:\Dev\NihongoPath
npx wrangler d1 info nihongopath-dev --config wrangler.backend.jsonc
npx wrangler d1 migrations list nihongopath-dev --remote --config wrangler.backend.jsonc
```

These commands inspect the remote database and pending migrations; they **do not apply migrations**. If Wrangler asks to log in to Cloudflare, complete the account authentication in the browser. Verify the returned D1 UUID matches the ID above. Do not share tokens, cookies or session files.

Do **not** run `migrations apply --remote`, `d1 execute --remote`, `d1 reset`, or `wrangler deploy` at this step. Before remote schema changes, confirm that `nihongopath-dev` is empty or backed up, review the two original migration SQL files, and agree on the family authorization model.

## Local test and deployment checks

CI tests `tests/d1-dev-config.test.mjs` with Node 24's in-memory SQLite:
- Config contains exactly the supplied development D1 ID and binding.
- The live Worker config stays static and has no remote D1 binding.
- Both current original migrations load successfully in memory.
- The proposed family schema adds tables without destroying an existing learning state.
- Foreign keys and role constraints reject invalid references.
- The backend and the public static build can still be bundled.

**Passing tests do NOT mean the remote D1 has been connected or data has been synchronized.**

## Steps still required before a real family app

1. Confirm Cloudflare Access protected login policy (team domain and app audience) and permitted accounts. Neither value should be guessed.
2. Decide between one parent-managed login with four learner avatars, or four independent logins with a family permissions model. The latter requires backend authorization work not yet delivered.
3. Apply only reviewed base migrations to `nihongopath-dev` after a separate non-destructive test and explicit go-ahead.
4. Implement and test authoritative family membership and learner permissions on the API, not just the frontend.
5. Safely enable the live API adapter after backing up browser-local progress from each origin; do not silently replace any records.
6. Verify real save/sync/reload on PC and iPhone before promoting to production.

See `docs/CLOUDFLARE_BACKEND_CUTOVER.md` for the overall cutover and rollback plan.
