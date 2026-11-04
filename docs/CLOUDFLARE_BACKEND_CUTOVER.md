# Nihongo Path — Cloudflare backend and D1 cutover plan
**Prepared:** 2026-11-04 · **Authoritative repo:** `dqhuy1982-stack/NihongoPath`

## Current state — do not confuse with production readiness
- Public Worker `nihongopath` still deploys static assets via the unchanged root `wrangler.jsonc`: `node scripts/build-site.cjs` then `npx wrangler deploy --assets ./dist/site`.
- Browser-local data is not account-synchronized; existing avatar/password demo is NOT authentication.
- Original ChatGPT Site's `oai-authenticated-user-id` was supplied by a trusted Sites gateway. It must **never** be accepted from an arbitrary request on the new Worker.
- Repository already has D1-shaped server API, schema and two original migrations. They are **reused**, not rewritten.

## Completed in this preparatory increment
- `workers/access-identity.mjs`: cryptographic Cloudflare Access JWT verification with trusted issuer, audience, RS256 and rotating Access signing-key URL; deny any email not on the explicit allowlist; use verified `sub` as stable owner (`cf-access:<sub>`).
- `workers/nihongopath-api.mjs`: explicitly overwrite all legacy Sites auth headers after JWT verification, then reuse `source/server/pilot.js` for owner-scoped D1 queries. Browser-supplied `oai-*` headers alone can NEVER authorize access.
- `wrangler.backend.jsonc`: deliberately inactive Worker+assets build **template**. Existing `wrangler.jsonc` is unchanged. Missing Access config or DB fails closed.
- `tests/cloudflare-access-gateway.test.mjs`: signed-token verification, invalid/expired/spoofed claims, API routing, owner isolation with real in-memory SQLite migrations, unauthenticated requests and no-config denial.
- GitHub QA: tests, content audit, existing static build, and Wrangler backend bundle `--dry-run`. No Cloudflare API actions, database creation, hosted migration or public deployment by this increment.

## Architecture decision: parent-managed pilot (first secure increment)
A trusted **parent account** signs in through Cloudflare Access. One owner has multiple learner **profiles**, selected by avatar. Avatar selection is NOT an independent login or permission boundary. A learner may use the same protected parent session on more than one authorized device, but this does **not** provide private, independent accounts for children.

Independent child logins require a separate family-membership and delegated-permissions model (`families`, `family_members`, `learner_access`) and an explicit migration; don't pretend adding four emails to the Access allowlist gives access to the same family. Every authorized email currently becomes a **separate owner space**.

The app must not be switched to server-backed mode until the parent explicitly approves this limitation or independent login design is implemented.

## Next gate — Cloudflare setup by the account owner

### A. Access: protect the existing Worker (user-controlled action)
Cloudflare Dashboard → **Workers & Pages** → `nihongopath` → **Access** → **Protect this Worker behind Access** → choose **All traffic**, with an explicit, narrowly scoped email allow policy. Do not use `Everyone` or a broad email domain.

This action changes website access and requires the account owner's approval. Once enabled, opening the site will require Cloudflare Access login before the current demo can be viewed.

From the Access application settings, identify `ACCESS_TEAM_DOMAIN` (for example `https://team.cloudflareaccess.com`) and `ACCESS_AUD` (Access application audience). Do not guess either value; do not share access JWT, cookies or credentials in chat.

**Important platform caveat:** With Static Assets, the Cloudflare internal assets router does not propagate `ctx.access` to the user Worker; therefore the API independently verifies `Cf-Access-Jwt-Assertion` using signed JWT and Access public keys.

### B. D1: create a NEW nonproduction database
In Cloudflare D1 create `nihongopath-dev`; use the APAC placement hint if desired (placement hint does not guarantee all data resides in Japan). Record the real database ID. No production user data or demo history should be inserted.

For D1 integration add a binding to the approved active config only **after** remote database setup has been verified. Intended binding:
```json
{
  "binding": "DB",
  "database_name": "nihongopath-dev",
  "database_id": "<actual-UUID>",
  "migrations_dir": "source/drizzle"
}
```
Do **not** use the fixture `source/public/demo-data/nihongo-demo.sqlite` as a real learner database. The two migrations under `source/drizzle/` are **schema only**.

### C. Staging deployment plan (not executed)
1. Review exact Access allowlist, expected owner/learner flow, secure storage of environment variables and the D1 ID. Set `ACCESS_TEAM_DOMAIN`, `ACCESS_AUD`, `ACCESS_ALLOWED_EMAILS` (comma-separated exact addresses) under the reviewed Worker runtime config.
2. Use `wrangler.backend.jsonc` as a template only. Do not replace the currently working root `wrangler.jsonc` or run `wrangler deploy` before the security gate and migration plan pass.
3. Confirm D1 migrations against **only the named dev database**. `wrangler d1 migrations list nihongopath-dev --remote --config <reviewed-config>` is read-only; applying migrations to a remote DB changes it and requires explicit review.
4. Smoke test backend `GET /api/pilot/bootstrap`: without valid Access token → denied; with correct parent Access token and D1 → empty profile list, then explicitly initialize profiles. Check CSRF, owner separation, duplicate event ID, revisions and Kana draft reload.
5. Make separate backup of **each browser origin's localStorage** before enabling live adapter. Same Site URL does not automatically import old prototype data into D1. Explicitly map historical records, versioned content, avatar associations and user consent before import.
6. Activate `pilot-online.js` against the server only in a reviewed build. At cutover the UI must reflect server-acknowledged writes and display a deliberate migration message instead of silently replacing local state.
7. Test PC and iPhone, rollback static build if needed. Never run a destructive reset of the original ChatGPT Site. D1 Time Travel/backup plan is mandatory before production edits.

## Acceptance checklist for secure cutover
- [ ] Cloudflare Access policy verified on production Worker, not just preview.
- [ ] Token verified cryptographically, exact issuer+audience+RS256+expiry; all client-provided Sites headers overwritten.
- [ ] Parent account/learner membership decision accepted; no accidental cross-user sharing.
- [ ] Separate dev D1 created, binding `DB` confirmed and migrations applied only after inspection.
- [ ] App server writes are durable, idempotent, revision checked and owner scoped.
- [ ] Existing browser-only progress backed up before cutover; migration/no-import decision recorded.
- [ ] Mobile sign-in, logout, network failure and resume tested end to end.
- [ ] Static production fallback remains available; original Site unchanged.

## Developer verification (does not deploy)
```powershell
cd C:\Dev\NihongoPath
npm install
node --test tests/cloudflare-access-gateway.test.mjs source/tests/pilot-api.test.mjs
node scripts/build-site.cjs
npx wrangler@4.157.0 deploy --dry-run --config wrangler.backend.jsonc
```

GitHub's automatic branch QA performs these tests; no manual local execution is necessary merely to confirm code builds.
