# Start here — source development handoff

Baseline audited 1 November 2026 (Asia/Tokyo). Site v15, commit `6e70f8eb5fdd7dd7737d37e3a23f600928e883b7`.
Site: https://nihongo-path-flow-review.aceticlotus.chatgpt.site
Project: `appgprj_6ae5d9599a0c819181446dd84e6553a9`.
This is an export for continued development of the same product. No Site publishing, access changes, live-data export or database migration was performed by this handoff task.

## What is in the package
`source/` is the original tracked project tree with documented privacy redactions, not a new implementation. Six requested specification/architecture/design/data/checklist/handoff documents are alongside it. `BASELINE_MANIFEST.json` records each exported source hash, original hash where safe, and changed/omitted status; `FILE_MANIFEST.sha256` covers archive payload files. `REDACTIONS.json` lists export changes. Tests/build/HTTP evidence is included. No `.git`, node_modules, build output, environment files, hosted DB, local runtime DB or user-uploaded personal portraits are shipped.

## Fastest route for Studio UI development
Install Python 3, then from the extracted package:

```sh
python3 -m http.server 8080 --bind 127.0.0.1 --directory source/public
```

Open `http://127.0.0.1:8080/?mode=demo#kana` in your browser. The existing demo flag intentionally skips `pilot-online.js` and uses browser-local sample data. This is the existing app served as static assets. It is not a single-file app and it does not connect to real progress. Use HTTP rather than double-clicking `index.html`; local file restrictions and runtime path checks can differ. Clear only this local origin's demo data if needed. Never use live-site reset actions as part of development.

Static HTTP/browser walkthrough was not newly completed in this resumed audit; source demo gating and bundled assets are verified, while built Worker asset serving was checked over HTTP. Check the Studio visually in your own browser before accepting UI edits.

## Framework / local database development
Use Linux or WSL2 for the existing shell wrappers; package includes Bash/flock/timeout-dependent scripts. Native Windows setup and clean native macOS setup were not tested. Install Node >=22.13.0 (verification used 24.22.1), pnpm 11.25.0 and Python 3, with package registry access.

```sh
cd source
pnpm install --frozen-lockfile
node ../tools/init-local-db.mjs
pnpm dev
```

A clean clone defaults to portable execution profile and dev port 5173. Its vendored Sites plugin provides local sign-in at `/signin-with-chatgpt?return_to=/` on localhost using a synthetic local identity; this is not real OAuth or live account access. The portable dev launch was attempted in this environment but not confirmed as a working end-to-end dev server. Do not mistake that for a verified native-device setup.

Verification achieved in this managed Linux environment: dependencies installed; a bounded managed profile production build succeeded. Portable direct build reached SSR phase without a recorded completion. If `pnpm build` does not finish in your environment, preserve logs; do not alter framework versions or restructure source just to hide it. Managed execution selection is checkout-local and intentionally excluded from this ZIP.

After a successful build the existing script starts a local built Worker:

```sh
pnpm start -- --port 4175
```

It uses `dist/server/wrangler.json`, local emulated D1 and `.wrangler/state`. Real ChatGPT sign-in is not part of that built local server. Our HTTP smoke test supplied explicit synthetic identity headers from a test client against loopback to test application behavior; those are not a production auth adapter and were not inserted into exported app code. Missing identity correctly returns 401. New external production hosting needs its own trusted auth layer and deployment configuration; not provided by standalone HTML.

`tools/init-local-db.mjs` is a handoff-only helper applying packaged migrations to LOCAL emulated D1, with a placeholder database ID and `--local`. It does not migrate the existing Site. No local test data is bundled.

## Test commands
From `source/`:

```sh
node --test tests/*.test.cjs tests/pilot-api.test.mjs
python3 -m unittest discover -s tests -p 'test_*.py'
```

Do not equate these SQLite-shaped unit/API checks with a full hosted identity or Safari check. `HTTP_VERIFICATION.json` records the separate built-Worker/local-D1 smoke check.

## How to continue without creating a second product
1. Keep this ZIP unchanged as the v15 handoff baseline. Put the sanitized working tree under your own local development Git if needed; record the upstream baseline SHA. This ZIP deliberately contains no original Git object database or credentials.
2. Keep changes scoped to Studio files: principally `public/kana-studio.js`, `public/kana-studio.css`, and only when necessary `public/kana-model.js` with mirrored `server/kana-model.cjs`, API/schema/tests. Preserve index load order, shared tokens, route `#kana`, existing data IDs and schema.
3. Keep a changed-files list and rationale. Commit changes separately from redactions; do not touch demo profile setup just to get a new layout. Do not copy the whole public folder back.
4. At reintegration time open the SAME Site's current source repository. Verify project ID and current deployment/version. If HEAD moved beyond v15, compare and merge from `6e70f8e…`; do not reset to v15 or replace newer work.
5. Three-way apply intended edits against upstream baseline. `public/app.js`, `public/pilot-online.js`, certain tests/docs and sample SQLite were sanitized: never wholesale overwrite those originals. Preserve original profile defaults, avatar mappings/assets and real data. Use `BASELINE_MANIFEST.json` to locate all export differences.
6. Keep already applied SQL migrations immutable. Any genuinely required schema change must be additive, reviewed and backed by data-preservation checks. No runtime data reset, fixture import or schema migration is authorized by this handoff.
7. Run engine/API tests, build and the baseline checklist. Review UI in upstream Site's preview using authorized identity; compare PC and physical phone. Only a later explicit development/deployment request authorizes publishing. This export did not publish, commit or push anything.

## Important source findings
- Runtime product is classic JS inside a Vinext/Cloudflare wrapper; converting everything into one HTML file would discard server/auth/database behavior.
- The old README and descriptive metadata lag current backend implementation. Use this audit and actual code for current capability, historical docs for context.
- Current course/library live cards lack a distinct Studio entry even though `#kana` works. Make discoverability a deliberate future edit, not part of backup.
- Original stroke SVGs, generated data, content checksums and LGPL/GPL notices are included. Retain notices and source availability obligations when distributing modifications.
- No full standalone authenticated app, portable dev workflow, external production hosting or disaster-recovery restore is claimed as verified.
