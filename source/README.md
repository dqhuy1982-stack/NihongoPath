# Nihongo Path — Flow review prototype

Buildless HTML/CSS/JavaScript prototype. Open without a fragment for Login; use `#map` for the complete screen directory.

## Scope

- 45 principal routes/settings groups in the screen directory, plus the module plan and guest paths.
- One shared shell, five main destinations, PC/tablet/mobile preview controls.
- Dynamic learner profiles; per-profile goals, preferences, notes and activity in namespaced browser localStorage.
- One complete authored N5 pilot: 3/5/15-minute paths, targeted repair, persistent checkpoints, factual summaries and experimental delayed recall. Original three-card/three-question view retained for comparison/history.
- Canvas Kana practice, six flashcards/dictionary examples, 24 clearly labelled draft character records.
- Empty reports derive from local demo attempts; no seeded learning scores or timestamps.

## Not implemented

Real authentication, database, production permissions, remote sync, spaced repetition scheduling, audio, AI calls, automatic writing/speaking evaluation, and complete N5–N1 course content. Family role separation is illustrative client UI, not a security boundary. The login accepts only a public demo code; the recovery mock compares disposable sample strings in memory and never stores or sends them.

## Data

Browser key: `nihongo-path-flow-review-v3`. Demo changes remain in that browser. JSON export contains only the selected learner. No import/sync is advertised. The screen directory exposes a reset action for this prototype's own data only.

## Validation

JavaScript syntax check; all 36 original principal routes rendered in mobile preview with no horizontal app-frame overflow; desktop dashboard/settings and mobile dashboard inspected visually. Browser walkthrough verified configurable goals, a fifth learner, quiz correct/incorrect/hint flow, a 2/3 summary with one hint, notebook save and separation between two selected demo profiles. This does not certify production accessibility or authentication security.

## Maintenance

`dist/index.html`: entry and review toolbar. `dist/styles.css`: shared tokens, layout and responsive behavior. `dist/app.js`: screen registry, data examples, rendering and event handlers. `dist/assets/michi.png`: existing approved companion artwork.

Content availability labels are explicit. Future course pages show proposed structure without claiming published learning materials. Do not turn client roles or localStorage into production account security.

## Visual refinement 04

- Self-hosted Be Vietnam Pro (400/500/600/700) across headings and UI; font files and OFL included. Vietnamese title glyphs checked in each weight.
- Navy/champagne H monogram, shared wordmark in sidebar, mobile header, sign-in and favicon.
- Adaptive sidebar: decoration yields space; at short desktop heights a compact menu replaces the sidebar. No clipped essential navigation.
- Refined plan hierarchy, selected activity surface, understated gold accent and quieter progress presentation.
- Browser verification: 1366x650 (sidebar clientHeight=scrollHeight=614), 1100x500 (compact menu), 390x780 and 360x740 (no horizontal overflow). All 36 main views checked with the new font at mobile preview width.

## Access flow 05

- Default entry is Login. Public sample code `PATH-DEMO`; dynamically selected sample accounts, reveal toggle, inline errors and remembered sample account choice.
- Login → learner selection → initial setup for new learners → readiness summary → personalized dashboard. Existing learners continue directly from profile selection.
- Public invitation `PATH-FAMILY` → sample family preview → create local learner → goals/time setup. Profiles are not fixed to four people.
- Forgot access → sample target → pending recovery preview → matching sample values → completion disclosure. No email is sent and no real password changes.
- Logout demo returns to Login while retaining local notes and activity. This is a UI flow, not a protected server session.
- Access screens share the H logo, self-hosted Be Vietnam Pro, ivory/navy/sage palette and responsive form components. On mobile, inputs use 16px text.
- Browser checks cover wrong login/invitation codes, matching validation, a new learner with an N5/10-minute goal reaching their own dashboard, and no horizontal overflow at 360/390px and 1366px.

`dist/polish.css` holds refinement 04; `dist/access.css` holds access-flow refinements.

## Atelier 06 — family entrance & language

- Home–Login is one viewport composition with the review toolbar removed on entry. Header, editorial story, avatar picker, code form and footer share a single page. The document is never overflow-locked: browser zoom, short windows and on-screen keyboards retain a scroll fallback.
- Newsreader regular/italic for editorial headings and Manrope for controls. Noto Serif JP is subset from the official Google Fonts source for Japanese display. Font licenses are included; Vietnamese glyph coverage is verified in the shipped font files.
- A vector signature combining フ and イ replaces the boxed H. The mark has ivory-background and dark-background variants and is used in the favicon, header and application shell.
- Four supplied portraits are resized/encoded as WebP without visual changes (about 7–8 KB each). Stable profile IDs map to their own images; new profiles use initials. A guest entry is always available and opens the sample dashboard without a code.
- Avatar selection and sign-in share the entry page. Existing learners go straight to their own dashboard. Additional profiles remain accessible through “More profiles” and family management.
- Vietnamese, English and Japanese interface copy lives in `locale-data.js`; `locales.js` handles text/attribute localization and a browser-local language preference. Switching languages keeps entered fields, selected profile and personal data. Personal names, Japanese examples and learner notes are not translated. This is a browser UI preference, separate from future course-localization work.
- `atelier.css` contains the active brand/typographic layer and Home–Login layout. Base learning layouts remain in `styles.css`, `polish.css` and `access.css`.
- Entry measurements: 1366×650, 390×844, 360×640 and 768×1024 fit without document overflow. Japanese and English variants, including invalid-code feedback on a 360×640 viewport, were checked.
- Real authentication, server permissions, email and sync are still outside this static prototype.
# Atelier 07 — approved design extended

## Atelier 08 additions

The current entry retains the approved layout and adds a refined N identity, dedicated Home Screen icons and manifest, warmer light and ink-green dark surfaces, and a study guide at the top of Dashboard. Character introductions now live in their own area and in lessons.

`dist/study-data.js` owns the six journey stages and five two-question sample sets. `dist/study.js` owns practice drafts/results, evidence-based routing and the illustrative planning calculator. `docs/EXAM-CONTENT.md` describes future content requirements. The map has an optional guided tour and reduced-motion support. Study hours are editable assumptions; an unknown starting point has no completion estimate.

The prototype is still browser-local. Icons/manifest do not provide full offline operation. Full mock tests and audio remain unreleased pending materials; the guide does not call an AI service or establish JLPT proficiency.

The approved Atelier 06 visual reference is pinned in `docs/REFERENCE.md`.
This update preserves that direction and adds:

- A continuous N/path logo, consistently used for light/dark branding and favicon.
- Light, dark and device appearance, stored per browser-local learner profile.
- User-selected transit, desk and work-break context, available time and optional capability preferences. Audio and recording remain unreleased.
- Five authored, fictional contextual readings with recall questions, feedback, pause/resume, notebook saving and separate report/review evidence. Levels are editorial suggestions, not official JLPT classifications or proficiency assessments.
- 24 complete fictional profiles, 10 fictional organizations, 34 relationships and four story arcs. `build-world.py` generates `dist/assets/nihongo-world.json` and `dist/world-data.js`.

Profile narrative content is currently Vietnamese, with Japanese names/readings. New interface labels support VI/EN/JA; sample readings have Japanese dialogue and VI/EN explanations. The prototype does not claim a complete trilingual curriculum.

Continue using the same browser-local schema key; new fields are optional and initialized on demand. Existing goals and results are retained. No backend, automatic spaced-review scheduler, AI or sync has been added.

# Atelier 09 — scenario database and model review

Open **Thử tình huống** or `#demo` for a separate fictional-data workspace.
It includes six learner profiles, eight scenarios, time-aware study plans,
first-answer feedback, local resume, before/after comparison, and an inspectable
SQLite/JSON fixture. Existing learner profile data stays separate.

Model, limits, rebuild commands and extension contract: [docs/DEMO-MODEL.md](docs/DEMO-MODEL.md).

# Atelier 10 — avatar-first login and learning priority

Login now opens a focused code dialog from a larger portrait. Compare the retained
inline form and new flow at `login-compare.html` in PC/Tablet/Mobile views.
Adaptive priority is the default; Continue first and Review first are optional in
Learning settings and the fictional-data workspace.

Decision and component contract: [docs/UX-atelier-10.md](docs/UX-atelier-10.md).
Validation: [docs/QA-atelier-10.md](docs/QA-atelier-10.md).


## N5 pilot

See [N5-PILOT.md](docs/N5-PILOT.md) for the content contract, learning rules, design tokens, API boundary, checks and limits. Open `lesson-compare.html` for PC/tablet/mobile before/after.

Generate content with `node scripts/build-lesson.mjs`, generate the unified fixture with `python scripts/build-demo.py`, and run `node --test tests/*.test.cjs`. The browser still uses localStorage; SQLite is a downloadable fixture.

## Content studio

Open `#admin` to create/edit a versioned N5 lesson without editing JSON. `admin-compare.html` compares the former file workflow with the editor at PC/tablet/mobile sizes. See [CONTENT-STUDIO.md](docs/CONTENT-STUDIO.md) for the short author guide, contracts, validation, tests and production boundaries.

Preview is memory-only. Publishing updates this browser’s demo catalog; it is not a shared backend publication. Existing learner sessions/reviews retain their original content version. Family management never grants an authenticated editor role in this prototype.

After `build-lesson.mjs`, run `node scripts/build-authoring.mjs` before `python scripts/build-demo.py`. Run `node --test tests/*.test.cjs` and `python -m unittest discover -s tests -p 'test_*.py' -v`.
