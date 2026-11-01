# Nihongo Path — Development log

## 2026-11-01 — Kana Writing Studio Compact v3 + Mobile Audio Fix (develop)

Scope: existing Foundation Kana Writing Studio only. No rebuild or site release.

### Updated files
- `source/public/kana-studio.js`: shortened the header description, added the `ks-compact` scope, moved detailed guidance and ungraded-practice explanation into accessible native `details` disclosures. Preserved attribution links and existing data contracts.
- `source/public/kana-studio.js`: speech now attempts `ja-JP` with system voice on Apple touch devices when Safari's voice list is incomplete; keeps utterances referenced, retains direct touch/click speech activation, avoids unnecessary idle `cancel()`, reports delayed or failed speech clearly.
- `source/public/kana-studio.css`: compact header/toolbar, contained-scroll Kana grid on wide desktop, smaller stroke sample, horizontally scrollable thumbnails, centered writing canvas, adaptive mobile spacing; preserves the three-step mobile workflow and theme variables.

### Safety and boundaries
- `main`, the published ChatGPT Site, server, D1 database, learner profiles and writing progress schemas were not modified.
- The UI is more compact, but smaller/shorter viewports may still require internal scrolling. Do not force a 100%-no-scroll claim.
- iOS sound depends on Safari voice availability and device audio policy; it is **not yet confirmed on a physical iPhone**. A real licensed audio pack is the planned fallback if iOS still fails.

### Validation performed
- Full JavaScript parsed successfully.
- Source checks confirmed the existing stroke controls, audio direct-click handler, mobile layout, storage and API paths remain.
- Simulated speech unit scenarios passed for iOS incomplete/empty voices, desktop absent Japanese voice and desktop present Japanese voice.
- Compact CSS brace and selector checks passed.
- Browser visual QA, physical iPhone pronunciation and full repository test suite are pending. Do not merge to `main` yet.

### Local acceptance checklist
1. GitHub Desktop: Fetch/Pull origin on `develop`; refresh local port 8081.
2. PC at 100% zoom: Kana chooser scrolls inside its panel, playback controls fit, notes are collapsed but discoverable; no sideways overflow.
3. Mobile Safari: select `あ` then tap **Nghe âm** manually. Check actual sound and no warning. Repeat with `か`, `し`, and Katakana `ア`. Try auto-read when selecting a new glyph.
4. Verify three mobile steps, stroke badges, play/pause/replay, canvas writing, undo/clear and saved draft.
5. If iOS remains silent, capture the warning shown below the toolbar; confirm iPhone volume, Japanese voice and Safari version. Do not publish until diagnosed.


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
