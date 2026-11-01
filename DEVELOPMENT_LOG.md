# Nihongo Path — Development log

## 2026-11-01 — Public Demo export + local Kana audio preparation (develop)

User requested access from iPhone outside the LAN. Current screenshot still showed the pre-v3 header and expanded notes, so the device was likely using an earlier JS/CSS revision; confirm local Pull before concluding v4 layout is broken.

**Prepared, NOT published:** `scripts/build-public-preview.cjs`, `scripts/Prepare-GitHub-Pages.ps1` and `docs/PUBLIC_PREVIEW_DEPLOY.md`.
- Export copies only static `source/public` assets, removes outdated compare pages, forces demo mode, adjusts PWA manifest for a GitHub Pages subpath, and writes a preview notice. Excludes server, D1 and infrastructure configuration.
- Primary repo `NihongoPath` remains private on main/develop. GitHub Free requires a different PUBLIC static deployment repo for GitHub Pages; Cloudflare Pages may connect the private GitHub repo instead.
- Site is not remotely deployed yet. Manual GitHub Desktop publish and Pages Settings, or Cloudflare connection, require user authorization/UI actions.
- Export output `dist/public-preview` is ignored by git.

**Audio improvement prepared, binary download still pending:** `scripts/Download-Kana-Audio.ps1` downloads 46 public-domain Wikimedia MP3 files with hash + MP3 signature checks and only emits `assets/kana-audio/pack.json` after all files are present. `kana-studio.js` automatically prefers local same-origin MP3 when this manifest is detected; otherwise it uses the existing Commons stream with TTS fallback. The user must run the downloader, commit reviewed MP3 files on develop and physically test iPhone audio.

Acceptance before any real-site integration: successful local Pull, mobile listening of `あ`, `か`, `し`, `ア` over HTTPS, PC non-scrolling workspace with v4 header, clean route navigation and unchanged learner progress behavior. Do not merge to main or original ChatGPT Site.


## 2026-11-01 — Kana v4: viewport workspace + recorded pronunciation (develop)

User QA for v3: **desktop still scrolls too much; iPhone Safari produces no sound**. v3 was not accepted.

### Changes
- `source/public/kana-studio.css`: implement real single-viewport workbench on desktop >=1024 px wide and >=680 px tall. Route-scoped main frame and shell use viewport height; three equal-height panels keep internal scrolling for long grids/notes. Hide only decorative footer and redundant three-step desktop tab while preserving all essential controls. Smaller or short viewports fall back to normal scrolling rather than clipping.
- `source/public/kana-studio.js`: toggle `ks-page-focus` only for the active Studio route. On mobile, replace primary `speechSynthesis` with direct-click `HTMLAudioElement.play()` of public-domain Japanese syllable recordings from Wikimedia Commons. Keep TTS fallback for unavailable Audio API/unknown kana and show an actionable error if remote MP3 cannot play.
- `source/public/assets/kana-audio/README.md`: document creators, PD-self status, Wikimedia MP3 transcode URLs and limitations.
- `tests/kana-v4-layout-audio.test.cjs`: checks all 92 Kana mappings to 46 unique sounds, Wikimedia filename hashes, direct play wiring, route scoping and progress-flow markers.

### Verification
- GitHub read-back: `develop` JS parses and 46/46 Kana sounds are mapped.
- HTMLAudio playback is triggered within the same user gesture; no promise/await precedes `audio.play()`.
- **Physical iPhone and desktop visual QA still pending**; access to remote MP3 transcodes is not guaranteed without testing actual network.
- Added test file has **not been executed by this assistant**. User may run `node --test tests/kana-v4-layout-audio.test.cjs` after pulling to local, and report any failure.
- Do not merge to main or original ChatGPT Site until layout and audio pass on PC and iPhone.

### Acceptance
1. Pull `develop`. PC at 100% zoom, 1366x768 or larger: full 3-panel studio fits page viewport without BODY scrolling. Kana grid may scroll *inside* its panel.
2. iPhone Safari on LAN `http://192.168.1.187:8081/?mode=demo#kana` (assuming same home PC IP): tap speaker manually for `あ`, `か`, `し`, `ア`. A working Internet connection is required for this version.
3. Test auto-pronunciation, player pauses, previous/next/replay, canvas touch drawing and learner progress/draft retention. Verify switching routes restores normal page scrolling.
4. If audio fails, capture the warning shown in Studio; test the "Nguồn ghi âm" source link from the collapsed source note.
5. No redeployment or database changes are part of this patch.


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
