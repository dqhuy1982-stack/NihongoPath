# HORIZON N5 — VISUAL GAP ANALYSIS & REBUILD CONDITIONS

**Version:** 2.1 · **Date:** 2026-11-09 · **Source branch audited:** `develop`  
**Purpose:** approve an implementation-ready visual rebuild contract **before** replacing the current HORIZON N5 interface.  
**References:** approved richly illustrated HORIZON N5 mockups (course overview, Lesson 01 overview, situation, content, practice, results, character library), and the user's current-v2 screenshot in the design conversation.  
**Related baseline:** [HORIZON N5 Master Implementation Spec v2.0](HORIZON-N5-UI-REBUILD-MASTER-IMPLEMENTATION-SPEC-v2.0.md).

> **Decision:** The deployed v2.00 is an architectural proof of concept, **not an approved visual implementation**. Freeze it as a rollback target; replace its N5 visual presentation with a clean, isolated frontend. Do not patch additional CSS into v2.00. Do not touch Foundation/Kana, profile IDs, saved assessment attempts, or the underlying content engine.

## 1. Evidence and comparison method

This is a qualitative, file-verified gap audit, **not** a measured visual-regression test. The two screenshots provided by the user are different native resolutions (approved mockup: **1672 × 941**, current site screenshot: **2048 × 1224**), so pixel-difference percentages or claims of a measured "visual match" would be misleading. Repeat a controlled screenshot comparison at identical viewport and browser/font conditions during acceptance.

Source inspection on `develop` confirms:

- `source/public/horizon-n5-rebuild-v2.js` and `.css` implement a distinct N5 UI controller and responsive shell; it is a valid technical foundation to retain as reference, **not** a visual design to patch.
- `source/public/world-data.js` + `n5-cast-extension-v149.js` provide 30 fictional character records. They are character **metadata**, not 30 approved portraits.
- The `portrait(id)` implementation in `horizon-n5-rebuild-v2.js` maps raster art only to IDs **keiko, yamada, mike**. For the other 27 identities it displays letter initials. The source list even contains an empty third slot; do not infer a valid fourth identity from the atlas.
- `source/public/assets/n5-v2/` currently includes only `portrait-atlas.webp` (3,876 bytes in the repo listing). The entire proposed 30-person illustration system is **not present**.
- The current hero CSS uses `assets/horizon-v9-fuji-desktop.svg`, a restrained mountain graphic rather than the approved Sakura/Fuji/pagoda/character composition.
- The N5 content model already includes **six situations, 30 selected vocabulary items, six grammar points, one reading with three paragraphs, three TTS listening dialogues, 16 practice questions and 20 check questions**. These must be preserved and improved without confusing "present in data" with "complete according to textbook".
- N5 has routes for course, Lesson 01 overview/story/content/practice/check/result/review, character library and context library. Bài 02–25 are not authored full lessons and must not appear as published.
- Existing CI and successful GitHub Pages deployment prove build, route/assets and code checks; they **do not** prove pixel/illustration fidelity, correct character portrait mapping or usability on real iPhones.

## 2. Priority visual-gap matrix

Severity: **P0 = blocks approval**, **P1 = blocks educational UX completion**, **P2 = polish after functional sign-off**.

| Area | Approved mockup | Observed v2.00 | Severity | Required corrective action |
|---|---|---|---|---|
| Overall composition | Compact but rich full-width learning canvas, three balanced columns, meaningful illustrations | Narrow, sparse central cluster with large unused space, lower visual density | **P0** | New responsive grid; tune column ratios and content bounding boxes against normalized screenshots |
| Character portraits | Distinct anime-editorial faces, identity-specific clothes, hair, expression and occupation | Only 3 identity-matched raster mappings, 27 initial-letter fallback faces | **P0** | Create & approve 30 ID-mapped portraits, no visible fallback in production |
| Situation art | Each scene shows the correct cast in a recognizable setting and action | Generic art/placeholders and limited bespoke narrative imagery | **P0** | Original raster scene illustration for each of 6 authored Lesson 01 situations |
| Hero and decorative background | Sakura, Fuji, Japanese urban landscape, subtle pagoda, character in composition | Muted geometric mountain and text-only hero | **P0** | New multi-layer hero assets with mobile-safe art direction and quiet reading surfaces |
| Canonical story identity | Sato/Yamada/Mike coherently located within the same story universe | Mockup uses IMC Osaka; repository describes fictional Minato-no-Machi, Nagi Riverside Hotel and Kaze Systems | **P0** | Approve a Story Bible, align cast/organization/scene mapping without silently rewriting historical IDs |
| Colors and hierarchy | Warm ivory, dark readable navy, dusty rose CTA, sage progress, disciplined accents | Similar color names, but too flat, small and visually unfinished | **P1** | One tokenized design system; color used by semantic role, contrast checked |
| Typography & scale | Strong Japanese headline, clear learning labels and readable sentences | Labels and text often tiny at current screenshot scale | **P1** | Typography scale with Japanese font fallback, min legible sizes and line height |
| Course/lesson navigation | Current lesson clear, single primary next action, left course tree + compact lesson tabs | Menu structure exists but lacks visual affordance and contextual continuity | **P1** | New information architecture and resume behavior, no duplicated competing menus |
| Right contextual rail | Related real characters, setting, smart next actions, based on current page | Initial-letter avatars and generic contextual panels | **P1** | Context-derived rail that changes by page and collapses to drawer on mobile |
| Vocabulary/grammar/reading/listening | Connected to scenes and examples, one-click lookup, genuine skill tasks | Content exists but is rendered with an austere technical interface | **P1** | Rebuild study components linked by IDs, preserve all authored content |
| Practice & result | Visual task modes, specific remediation, evidence-based progress | Functional engine, but cannot be equated to the mockup's illustrated states | **P1** | New task components; only real scores/skill records, no fabricated "excellent" |
| Icons & details | Consistent thin/filled icon family, refined borders, softly layered cards | Generic shapes and lower-fidelity details | **P2** | Normalize icon family, card corners, spacing, shadows and decorations after P0/P1 |
| Mobile | Useful full-width reading view, situational tabs, prominent next action, accessible sheets | Responsive CSS exists but needs actual device comparison | **P1** | Full mobile-specific layouts and iOS Safari/Android QA |

The baseline **passes architectural existence, fails visual acceptance**. No claim such as "100% matching" should be made without art approval, normalized screenshots and learner-flow testing.

## 3. Visual target & design tokens

**Art direction:** warm premium Japanese illustrated learning environment. Playful in scenes, restrained in text-heavy study views. Personality must come from illustrations and content, **not from excessive decorative color behind text**.

**Suggested draft tokens; final numbers must be sampled and adjusted from approved references, not arbitrarily copied from current v2:**

| Token | Intended value | Rule |
|---|---|---|
| Background | warm off-white `#FAF8F5` | never decorative behind dense Japanese text |
| Card | near-white `#FFFDFC` | subtle low-contrast border |
| Main text | deep navy `#223448` | WCAG contrast ≥4.5:1 for standard text |
| Primary CTA | muted cherry rose `#BD4B64` | reserve for next action; not every button |
| Positive/progress | subdued sage `#4B8767` | progress only when backed by actual records |
| Caution | muted amber `#AA7132` | missing review/listening evidence |
| Borders | warm gray `#E6E0DC` | 1px |
| Reading text | Japanese glyphs ≥17px in learning passages | coherent `ja-JP` font; generous line-height |
| Tap targets | ≥44 × 44 CSS px | especially speaker play, glossary, next and dialog close |

Use local licensed fonts with Japanese coverage, consistent 4/8px spacing rhythm, 12–18px radii, subtle shadows, low-repetition background ornaments. Avoid artificial “glassy” effects that lower contrast.

## 4. Asset Master List — actual deliverables, not generic placeholders

### 4.1 People / character universe
**30 canonical IDs.** For every person, require:

- `portrait` front/three-quarter, 1:1 or 4:5 source, designed at ≥768px on the short side.
- `bust` half-body suitable for dialogue/hero, transparent or cleanly masked.
- `expressions` minimum neutral, friendly, question/surprise for the six recurring Lesson 01 leads; optional for lower-priority cast until the library is completed.
- Identity-lock attributes: facial proportions, hair, attire, role, approximate age, nationality as **metadata** (do not encode nationality through stereotypes).
- Official `characterId` mapping, caption, alt text, license/provenance, contentVersion and review status.

**Release gate: 30/30 approved portrait files, zero initials and zero geometric-face fallbacks in visible N5 pages.** At least six leading characters need approved bust/scene poses before Lesson 01 visual sign-off.

### 4.2 Situations & settings
- **6/6 original Lesson 01 story illustrations**, each mapping `sceneId → settingId → castIds → poseIds`; do not reuse unrelated people in a scene.
- **8 reusable environment backgrounds**: office, Japanese classroom, hotel lobby, café, railway station, shop, street, home/community space.
- **1 approved N5 lesson hero composition** and separate desktop/mobile crops; Sakura/Fuji/pagoda decorative layers adapted for contrast.
- **3–5 low-distraction decorative elements**, SVG only for scalable silhouettes, icons, blossoms, dividers and ornaments—not for imitating richly painted portraits.
- Optional small scene thumbnails derived from approved **original scene artwork** rather than cropping screenshots with baked-in text.

### 4.3 Recommended rendering pipeline
1. Lock character/story identities and a visual style guide from the approved mockups.
2. Create **original high-resolution raster illustration assets** (WebP/AVIF with source PNG; transparent busts where practical). Reference photos can guide pose and physical environments when rights permit.
3. Reuse the *same* reference identity and approved art for portraits, busts, expressions and scene thumbnails; review consistency before export.
4. Optimize and provide `srcset` for PC/iPhone, lazy-load below-fold imagery, preload only essential hero assets.
5. Use SVG for iconography, scenic ornaments and simple line illustration only. **Automatic photo/vector tracing cannot be expected to reproduce the painterly human art in the mockups.** Professional vector illustration is a separate deliverable if editable SVG people are explicitly required.
6. Deliver an asset manifest (`id`, dimensions, version, hash, `license`, `approvedBy`, `usage`, `alt`), and a missing-asset report in CI.

**Do not** ship screenshots as UI components, cut copyrighted publisher illustrations or UI text out of mockup screenshots, import watermarked imagery or imply stock photographs depict the fictional character identities.

## 5. Character & Story Bible — mandatory before art generation

A character profile must match **all** of its appearances in the course. This needs explicit editorial reconciliation:

- The approved mockup depicts **Sato Keiko at IMC (Osaka)** with Yamada and Mike in a workplace introduction.
- The current `n5-cast-extension-v149.js` sets **Keiko at Nagi Riverside Hotel** and **Mike at Kaze Systems**.
- `world-data.js` defines the fictional setting **Minato-no-Machi**, not IMC Osaka.

These are not visual-only discrepancies. They alter dialogue context, workplaces, character relationships and quiz content. **Do not silently change historical character IDs or rewrite user-completed attempts to make the UI resemble a mockup.**

Default editorial direction for the rebuild: **prioritize the approved workplace mockup’s story universe for Lesson 01**, then produce an explicit mapping/versioning table from current content; no destructive migration until reviewed. All future Lesson 02–25 characters and settings must point to this story bible. Store character ID, displayNameJP, reading, Vietnamese name, nationality, occupation, company, relationship, clothing/style reference, visual asset IDs, scene IDs and narration notes.

## 6. Page-by-page UI build contract

### A. Course dashboard
Full-width N5 hero, continue/resume, real learning progress, 5 chapter groups/25 lessons with publishing state, separate skill practice and mock-exam references. No pretend unlocked Lesson 02.

### B. Lesson 01 overview
Approved illustrated hero with character, goal card, four real steps Học/Luyện/Kiểm tra/Ôn, six scene thumbnails in order, compact cards for 30 vocabulary / 6 grammar / authored reading / 3 TTS listening passages, prominent character/context rail, one next CTA. The course sidebar is navigational, not a second content page.

### C. Situation / conversation
Scene illustration with the correct speaking cast; explicit *where, when, who, relationship, communication goal*; speaker chips open ID-correct profiles; per-line TTS (marked as synthesis); optional translation and accessible tap/focus phrase notes; contextual vocabulary/grammar links; guided response, substitution, sentence/dialogue ordering, user-composed output; persist scene checkpoint and return location.

### D. Knowledge / lookup
Vocabulary with glyph/kana/meaning/context/audio, grammar with pattern/explanation/typical error, original model sentences, reading with comprehension, listening with transcript toggles. Search/reference does not accidentally mark a skill passed.

### E. Practice & check
Clearly distinct modes. Multiple genuine task types, feedback in practice and end-of-test explanations in check, never reveal check answers prematurely. Wrong answers link to the exact scene/grammar. Keep listening performance separate from aggregate score and audio-play request.

### F. Result & review
Actual score and attempts, per-skill feedback, pending audio/readiness status, targeted remedial cards, review scheduling when genuinely implemented and a next action. Never show 96/100, “memory retention 94%”, course completion or Lesson 02 unlocked without records.

### G. Character library
30 approved unique portraits; searchable/categorized listing; real names and bios from the approved story bible; popup/bottom sheet with full identity, job, country, speech style, related scenes and working deep links.

### H. Context library
Eight approved environment images with short descriptions and links to *released* story scenes. Context categories with no authored lesson remain informational, not clickable fake lessons.

**All UI controls must have an actual action, disabled/unavailable state, or deliberate read-only appearance.** No decorative fake play buttons, PDF/MP3 downloads, timers or lesson unlocks.

## 7. Navigation and interaction contract

Use a **single source of route state** and no competing visual routers. From any page the learner must be able to:

- open course → Lesson 01 overview → resume the correct scene;
- open character profile → close (Escape, outside tap and visible button) → return to the same scene and scroll position;
- open a highlighted grammar/vocabulary explanation → return to the exact question or line;
- start/interrupt/reload a practice attempt → resume safely where supported, with no false submission;
- finish check → see actual result → targeted review → revisit scene → resume next action;
- navigate backward/forward via browser and refresh deep links without changing completion state.

Mobile: one main reading column, collapsible course menu, contextual drawer/bottom sheet, safe-area sticky CTA (does not cover answer options or iOS keyboard), controls ≥44px, no nested horizontal scrollbar over Japanese text.

## 8. Engineering constraints / separation of responsibility

- **Current UI source:** freeze v2.00 as rollback/benchmark. Do not layer more overrides onto `horizon-n5-rebuild-v2.css`.
- **New implementation:** feature branch (`feat/n5-visual-rebuild`) with clean componentized styles and data adapters. Merge to `develop` only after screenshot and interaction sign-off.
- **Keep:** existing canonical IDs, original Lesson 01 content and assessment records, current family profiles and Foundation/Kana behavior.
- **Introduce:** stable asset manifest, story bible, reusable card/scene/dialogue/profile/step/progress UI components, UI-state adapter and dedicated visual QA.
- **Prevent:** data resets, route breaks, hidden legacy CSS collisions, hardcoded completion data, unlicensed textbook art/audio or conflating static site demo with an authenticated backend.
- **Access and hosting:** existing GitHub Pages static demo remains the release target. No need for a new hosting platform merely to improve visual fidelity.
- **Content editorial sign-off:** the selected Minna no Nihongo textbook edition must be confirmed before asserting edition-complete vocabulary/coverage. Original educational dialogue remains distinct from publisher text/audio.

## 9. Release gates / definition of done

| Gate | Evidence required | Hard fail |
|---|---|---|
| **G0 — Baseline** | v2.00 source/release backed up, routes/IDs/progress read-only audit, six reference mockups registered | risk of losing progress; screenshots missing |
| **G1 — Art direction** | Approved style guide, 30-character Story Bible and visual identity sheet | mixed identities, undocumented rights |
| **G2 — Asset package** | 30/30 unique approved portraits, 6/6 original Lesson 01 scene images, 8 settings, hero desktop/mobile, manifest | initials/SVG placeholder faces; mismatched person |
| **G3 — UI implementation** | All 8 page templates working; documented data adapters; consistent desktop/mobile layouts | broken route, dead button, fake lesson/progress |
| **G4 — Visual QA** | Same browser/fonts and viewports: 1672×941 reference, 1440×900, 390×844 and 430×932; screenshots compared side by side and reviewed | visually sparse/structurally different page; image miscrop |
| **G5 — Educational QA** | All 6 scenarios, 30 words, 6 grammar points, reading/listening/real check; tests for 0/3 listening, resume, history isolation | false pass / corrupted learner data |
| **G6 — Live acceptance** | Full CI, asset 200 checks, release commit SHA, GitHub Pages visual capture and real PC/iPhone checks | source-only "done" claim |

### Visual review scorecard
At each G4 viewport and page, reviewers give 0–5 for: layout hierarchy, image identity/fidelity, backdrop composition, readability, typography, colors, component polish, navigation affordance, responsive fit and scene/story consistency. **No category below 4/5; illustration identity and story consistency must be 5/5.** Scorecard is a design review aid, not a machine-generated “percentage match”.

### Core interaction QA
Confirm: lesson → scene → speaker profile → close → line; scene → grammar → return; practice wrong answer → contextual remedy → resume; check finish → real result → review; deep-link reload; no extra tap to reopen a lesson after returning; 4 learner profiles isolated. Verify keyboard, VoiceOver/TalkBack essentials, reduced motion, color contrast ≥4.5:1, TTS failure states, and layout at 200% zoom.

## 10. Recommended build order / responsibilities

1. **Freeze and capture:** archive technical baseline, screenshot every current route, register mockups as reference, map content IDs/progress stores.
2. **Art Bible first:** settle Sato/Yamada/Mike story canon; approve a small art direction sheet and 3 representative portrait+scene assets; **do not scale illustration production until character identity is consistent**.
3. **Complete art package:** approve all portraits/scenes/contexts and IDs, export optimized files with licenses, hashes, alt text and source originals.
4. **Build clean UI shell:** new header, sidebars, lesson tabs, cards and responsive layout. Integrate real route state, not hardcoded mockup screen states.
5. **Integrate Lesson 01:** overview/story/reference/practice/check/result/review, with original learner progress.
6. **Run visual and learning QA:** controlled screenshots + human comparison + automated functional tests.
7. **Release to develop only after gates pass**, keeping immediate rollback to frozen v2.00; then use the approved Lesson 01 component system for future authored lessons.

**Roles:** UX/UI controls layout, responsive behavior and component consistency; illustrator/art director owns reference fidelity and character identity; Japanese content reviewer owns pedagogy/language accuracy; engineering owns integration, data IDs, routing, accessibility, performance and rollback; product owner accepts the visual and learner experience.

## 11. What is needed from the user — and what is **not** needed

**Already provided:** approved visual mockups, aesthetic direction, GitHub repo/branch, Lesson 01 content intention, 30-character target and requested route scope. Do **not** repeatedly ask for those.

**Only potential true dependencies:**
- If exact replication of specific images is expected, obtain **individual high-resolution illustration sources or rights**. A composite screenshot alone is not a production-ready character sheet. In their absence, generate/redraw **original stylistically matched** assets, with review and no promise of pixel-perfect identity.
- Confirm rights for any **third-party** source photo/illustration/audio you want copied or transformed. Prefer original illustrations to avoid publisher/stock licensing issues.
- Confirm whether Minna no Nihongo **2nd or 3rd edition** is the curriculum reference before publishing a claim of full textbook alignment. This does **not** block visual rebuilding.
- Approval of the **Story Bible canon** if choosing between mockup IMC Osaka and existing fictional hotels/companies. Default proposal: mirror the approved mockup in Lesson 01 and version-map old content; do not change attempts automatically.

**Not required:** purchasing a new domain, cloud service, D1 migration, recreation of Foundation, or replacing all backend APIs.

## 12. Final recommendation / honest status

Proceed with a **new art-led frontend**, not an incrementally CSS-patched v2.00. Use original painterly raster assets for people and environments, SVG for UI/ornaments, and preserve existing data through adapters. The **first critical dependency is art + story consistency**, not writing more frontend CSS.

The work done in this document is **audit and implementation planning only**. No new UI, approved portrait set, live screenshot regression or production visual sign-off has been delivered as part of this specification. Do not state that the visual rebuild is complete until Gates G0–G6 are documented.
