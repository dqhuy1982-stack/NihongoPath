# Nihongo Path — Development log

## 2026-11-01 — Kana Writing Studio controls v2 (develop)

This is a continuation of the existing Studio, not a redesign or a second module.

- `source/public/kana-studio.js`: playback uses compact, theme-colored line icons; stroke-step buttons show stroke order; numbered markers are positioned near the start of each stroke path; animation and thumbnails update their active stroke together; writing undo/clear buttons use concise icons.
- `source/public/kana-studio.css`: scoped responsive toolbar with controlled single-row buttons, color variables, stroke states and keyboard-focus visibility.
- Audio Integrated v1, local draft storage, profiles, lesson APIs, database schema and mobile three-step navigation are unchanged.
- JavaScript syntax parsing and code-presence checks completed. **Browser, audio and real mobile QA are pending** and must be completed locally before considering this accepted.
- Changes exist on `develop` only. The `main` branch and published ChatGPT Site remain unchanged.

### Acceptance checks on localhost
1. At `?mode=demo#kana`, use Hiragana and Katakana (try `あ` and `ア`).
2. Test Play/Pause/Resume, Previous, Next, Replay, speed, clickable numbered stroke buttons and thumbnails.
3. Verify the stroke-start badge and active number change together. Test the three mobile steps on a physical phone.
4. Confirm audio, canvas undo/clear, local drafts and practice confirmation still work.
5. Capture desktop/mobile screenshots before merging to `main` or the original Site.


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
