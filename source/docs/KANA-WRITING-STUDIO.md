# Foundation — Kana Writing Studio

Scope agreed 01/11/2026: complete the writing foundation before expanding N5 lessons. Functional reference: `Nihongo_Path_V7_2_15_PC_Standalone.html` and the user's three-column screenshot. The old reference was inspected; its full application's patched globals/theme are not copied into the new application. Existing N5 pilot data and lesson definitions are preserved.

## Delivered workflow

- 46 Hiragana + 46 Katakana: choose a glyph, ordered stroke guide, numbered stroke previews, exact starting-point marker and moving pen marker.
- Play, pause, continue, previous/next stroke, direct stroke selection, replay and 0.5/1/1.5 speed. Explicit playback only; no automatic animation on entry.
- Write using pointer events on a normalized vector canvas; independent of display pixel density. Undo one stroke, clear the current draft, autosave completed strokes and explicitly record an ungraded self-practice.
- A tap without a meaningful path cannot confirm practice. Cancelling a pointer does not confirm a stroke. Confirm does not validate stroke order, glyph shape or proficiency.
- Per-learner selected script/glyph, playback speed, per-character draft and practice counts. Notes/quiz attempts/retention scores are not altered by writing confirmation.
- Desktop keeps the three columns, using the existing Atelier tokens. On phones the same workspace is split into Choose/Watch/Write steps with a visible step navigator and no horizontal overflow. Switching a step reveals the panel below the sticky controls; selecting a stroke does not rebuild the whole app or canvas.

## Source data

The original standalone reference embedded 20 median sets and fetched other glyphs on demand. This increment bundles all 92 original AnimCJK Kana SVGs, ordered path extraction and source notices. There are 212 stroke groups. Each source SVG has a SHA-256 checksum in `content/kana-catalog.v1.json`; regeneration refuses to accept different bytes without a content review. The upstream reference was retrieved from `master`; reproducibility is pinned by the included source bytes/checksums, not a claimed Git commit.

`public/assets/kana-strokes/` contains original SVG source, COPYING, LGPL v3 and GPL v3 texts, and a notice describing the extracted path representation/custom renderer. `public/kana-data.js` is the generated browser dataset. No remote third-party executable code or runtime request for an individual stroke guide is required. This does not make the whole authenticated application an offline PWA.

## Persistence

`/api/pilot/learners/:id/kana` checks the existing Sites identity and learner ownership before handling any request. POST also inherits JSON/origin restrictions from the API boundary.

The new, additive migration creates `kana_states`, `kana_drawings` and `kana_practices`; it does not rewrite any applied migration or old learning row. Drawings use normalized [0,1] coordinates, bounded strokes/points and four-decimal precision. A practice stores `self-reported-writing`, never a correctness score. Command receipts are namespaced and checked for matching payloads. Conditional revision updates, draft upsert and practice inserts are batched; replaying the same command does not add another practice. Stale revisions preserve the local draft and expose export/reload recovery instead of silently overwriting another device.

The browser controller keeps a separate workspace per learner. Profile switching waits for the current writing draft to save. Failed or pending writes trigger an unload warning. Export preserves the current ungraded vector draft in a JSON file. The retained demo mode uses the same UI/model with its own clearly labelled browser-local data; it never submits those practice records as real learner evidence.

## Verification

- All 92 characters, grouped paths, source checksums and representative stroke counts checked.
- API SQLite integration checks draft reload, preserving separate drafts for different glyphs, learner/account isolation, revision conflicts, duplicate confirmation, payload mismatch, invalid/out-of-bounds drawings, blank confirmation and separation from scored learning attempts.
- Browser walkthrough in the actual local demo player: desktop three-column layout, direct stroke selection, play/pause/continue, mobile glyph selection beyond the old embedded subset, Katakana シ with three numbered strokes, canvas input, undo, confirmation and reloading a saved vector draft.
- 390 × 844 browser frame: 46 selectable cells in each script; no horizontal overflow. The writing panel and main controls fit the focused step. This is Chromium validation; physical iPhone/Safari remains a user acceptance check.
- Existing engine/content tests remain part of the checks. Authenticated browser production QA remains limited by the browser's separate sign-in session; no authentication bypass was added.

No additional N5 lessons, audio, automatic handwriting grading or new AI assistant were developed in this increment.
