# Nihongo Path — Development log

## 2026-11-01 — Foundation → Kana Writing Studio entry (develop)

Source: the existing Nihongo Path v15 handoff. This is a development-only update, not a Site release.

### Changed
- `source/public/app.js`: added reusable `foundationStudioCard()` and exposed the Studio from the demo Learn page.
- `source/public/pilot-online.js`: reused the same card on the live pilot Learn/Foundation listing without modifying the lesson catalogue or API.
- `START-NIHONGO.cmd`: local Windows preview launcher targeting `source/public`.

### Behavior
- The new card opens the existing `#kana` route, not a new module.
- Copy explicitly states that written self-practice is **not handwriting accuracy or mastery scoring**.
- Existing app shell, responsive CSS, profiles, server routes, database and progress logic are unchanged.
- The site and production database have **not** been deployed, modified or migrated.

### Checks
- `node --check` succeeded for both modified JS files.
- `node --test tests/*.test.cjs tests/*.test.mjs`: 71 passed, 0 failed.
- `python -m unittest discover -s tests -p 'test_*.py'`: 3 passed.
- Visual checks are still required on Windows and iPhone.

### Local review
1. Select `develop` in GitHub Desktop and Pull origin.
2. Double-click `START-NIHONGO.cmd` from repository root (port 8081 must be free).
3. Visit `http://127.0.0.1:8081/?mode=demo#learn` and open Kana Writing Studio from its new card.

### Later Site integration
Compare `develop` against original v15 Site source. Port only the reviewed card and its `Learn` insertion; never replace original Site files wholesale with a sanitized handoff. Validate before publishing.
