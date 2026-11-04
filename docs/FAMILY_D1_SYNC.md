# Nihongo Path — optional four-person D1 sync (development only)

## Decision and current state
- Public site and Cloudflare Preview remain open without Cloudflare Access, email or OTP.
- Existing avatar-first entry works for local/browser learning; **do not break it**.
- Cross-device learning requires a capability to distinguish this household from anonymous Internet traffic. A random family key is entered **once per device only when enabling sync**; no daily login.
- Everyone holding the family key can read and edit all four learners. This is household-level authorization, not child-to-child isolation.
- The D1 sandbox is separate from live Sites and the public static Worker. No existing learner data is migrated, reset or overwritten by these changes.

## Design / files
- `workers/family-identity.mjs`: SHA-256 constant-size comparison for `FAMILY_SYNC_KEY`; no key/short secret/missing DB fail closed. All authenticated family records have stable D1 owner `family:primary`.
- `workers/nihongopath-api.mjs`: uses household identity when `FAMILY_SYNC_KEY` is configured; otherwise retains Cloudflare Access JWT verification. User-supplied legacy owner headers are replaced.
- `source/public/pilot-online.js`: optional connection on unpaired devices; verifies key against `GET /api/pilot/bootstrap` before saving it locally, then uses the existing revision-guarded APIs. Local mode stays accessible without a key.
- `scripts/build-site.cjs`: default public output remains **local-only**. Only `NP_FAMILY_SYNC_BUILD=1` produces a frontend capable of calling D1.
- `wrangler.backend.jsonc`: private sandbox Worker (`nihongopath-d1-sandbox`), existing `nihongopath-dev` D1 binding; `workers_dev=false` and preview URLs disabled. Do **not** edit `wrangler.jsonc` production or deploy this over `nihongopath`.

## Local verification on Windows (safe; does not affect hosted D1)

Run from `C:\Dev\NihongoPath` after committing or backing up any uncommitted changes.
Use only the reviewed branch; do not discard existing local work.

```powershell
git fetch origin
git switch feature/family-one-tap-entry
git pull --ff-only origin feature/family-one-tap-entry

# Generate a random family code. Store it in your password manager; do not paste in chat.
$bytes = New-Object byte[] 32
[System.Security.Cryptography.RandomNumberGenerator]::Create().GetBytes($bytes)
$key = [Convert]::ToBase64String($bytes)
"FAMILY_SYNC_KEY=`"$key`"" | Out-File -FilePath .dev.vars -Encoding ascii

$env:NP_FAMILY_SYNC_BUILD = '1'
node .\scripts\build-site.cjs
Remove-Item Env:\NP_FAMILY_SYNC_BUILD

npx wrangler d1 migrations apply nihongopath-dev --local --config wrangler.backend.jsonc
npx wrangler dev --config wrangler.backend.jsonc
```

Open local Wrangler URL, normally `http://127.0.0.1:8787`. It should show the public four-avatar entry. If you do not pair, local practice still works. To test D1: choose **Bật đồng bộ gia đình**, paste the locally generated `$key`, then initialize the empty sandbox family. Refresh and confirm a test lesson / Kana practice reappears for the same learner. Test two browser profiles on the same local endpoint; this is **not** yet proof of PC/iPhone cloud sync.

Local D1 uses Wrangler's separate emulation, not `nihongopath-dev` remote. Never copy `.dev.vars` into git, screenshots, or a public issue.

## Before any Internet-facing test
1. Complete GitHub learning QA, family key tests and Worker dry-run build. Confirm all pass.
2. Do not assume Cloudflare Access policies protect the public preview; they were removed at user request.
3. Create and configure only the isolated sandbox Worker, **never** `nihongopath` production. Add `FAMILY_SYNC_KEY` as a Worker secret; do not use plaintext `vars` or an URL parameter.
4. `wrangler secret put` can deploy a Worker immediately; review Worker name and routing before running it. Keep `workers_dev=false` until the secret is installed and tested. A deployment should fail closed if missing or weak.
5. Enable a sandbox URL only as a separate, reviewed change after tests and backup of remote D1. Re-test unauthorized GET and POST, authorized bootstrap, revisions/conflicts, Kana, Safari playback and PC/iPhone reload.
6. Only then plan moving the tested flow to the main Worker in a separate change. Existing public browser-only data must not silently migrate or overwrite D1.

## Limitations / security
- The public static Preview is **not** the D1-sync sandbox. Its data remains device-local.
- The family key in `localStorage` is a bearer credential. Anyone with the key (or compromised browser/extension) can access family progress; do not place it in public source or share it.
- This is suitable for a small, low-sensitivity family project; it is not individual account authentication or per-child private access.
- Lost keys can be rotated on the Worker without changing `family:primary` records, but each device needs pairing again.
- Existing lesson engine supports conflict detection and Kana evidence; end-to-end multi-device verification is still required.
