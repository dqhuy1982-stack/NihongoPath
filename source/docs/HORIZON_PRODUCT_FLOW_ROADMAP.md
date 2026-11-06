# HORIZON — PRODUCT STRUCTURE & LEARNING FLOW (PROPOSAL V1)

**Status:** Product proposal; no route or learner-data migration authorized by this document.  
**Audience:** Family prototype (four learners), PC and iPhone; expandable content and user profiles.  
**Direction:** Retain HORIZON home/design language. Improve learning logic before adding functions.

## Reference and limits

The user shared https://www.superhonki.com/ as a reference. Its live menus could not be independently inspected at the time this proposal was prepared; do **not** claim this is a screen-by-screen audit of that URL.

Public Honki de Nihongo documentation and other Japanese learning-platform patterns support a useful design direction: progressive courses, illustrated/audio flashcards, vocabulary and short sentences, grammar explanations, recall practice, exercises, and meaningful review. Source references:
- https://honkidenihongo.com/ja
- https://www.japanictlearning.jp/other-services
- https://honki.vn/

Use the **information architecture / learner workflow** as inspiration. Do not copy proprietary wording, assets, lessons, interface styling, copyrighted teaching content, or brand features.

**Foundation detail:** see [HORIZON_FOUNDATION_KANA_JOURNEY_SPEC.md](HORIZON_FOUNDATION_KANA_JOURNEY_SPEC.md) for the connected **Learn → Practice → Check → Review → N5** flow, current module reuse, progress/evidence semantics, and PC/iPhone layout. This design is documented but not yet deployed as UI.

## Product principles

1. Learner sees **one useful next step** first, not the entire feature catalog.
2. Lesson content is independent from UI language, theme, profile, and backend storage.
3. Review is a first-class part of learning, not a separate optional feature; record evidence honestly.
4. Personal goals are not the same as verified proficiency.
5. Profiles and progress are isolated. A family manager does not automatically get access to private notes.
6. An unfinished lesson remains resumable; a switched UI language never resets answers or erases drawings.
7. Simulations, content authoring, debug flows and module contracts are developer tools, hidden from normal learner navigation.
8. Accessibility and small-screen usability come before decorative embellishment.

## Recommended navigation (learner experience)

Only **five** primary destinations on desktop sidebar and mobile navigation:

| Main area | Primary user decision | Secondary components |
| --- | --- | --- |
| Today / Hôm nay | What should I do now? | Continue; review due; 3/5/15/30 minute session; next milestone; Michi evidence-based suggestion |
| Learn / Học | What should I study next? | My learning path; course > unit > lesson > activity; Kana; words; grammar; listening; sentence practice; speaking when supported |
| Review / Ôn | What needs remembering? | Due today; mistakes; flashcards; Kana recognition; recall sessions |
| Explore / Khám phá | What can I look up or try? | Dictionary; topic library; practical situations; example dialogues; learning journal |
| Progress / Tiến độ | What did I actually learn? | Completed attempts; review history; skill evidence; achievable milestones; journal links |

Global top-right: learner switch, UI language, season, My Space/settings.  
Do **not** give "Michi", "Family", "Simulation", or developer "Content Studio" their own top-level learner tabs. Michi should be contextual.

Optional family tools live in My Space and require explicit access rules.

## First-run flow

```
Home / select learner
  → demo PIN / future authentication
  → verify or select personal goal
  → gentle 3–5 min baseline assessment (optional; not a JLPT certification)
  → choose routine (short/regular) and display preferences
  → Today recommends one first session
  → Learn → Practice → Recall → Summary
  → save attempts and schedule future review
  → Today shows Continue / Review due / Next lesson
```

Skip diagnostic if already completed or declined. Do not force repeating onboarding. Switching learner must not leak progress.

## Learning content hierarchy

```
Track
  ├─ FOUNDATION — Kana recognition (audio) → syllables → stroke order → independent writing → quick recall
  ├─ JLPT N5
  ├─ JLPT N4
  ├─ JLPT N3
  ├─ JLPT N2
  └─ JLPT N1
Course
  └─ Unit (theme / communicative outcome)
       └─ Lesson
            ├─ Short practical context and goal
            ├─ Words / expressions (read, listen, recall)
            ├─ Sentence pattern and grammar explanation
            ├─ Guided examples
            ├─ Practice (recognition, order, fill, listen, speak when available)
            ├─ Mini-check with hints recorded distinctly
            └─ Summary + review plan
```

**Parallel practical track**, integrated in lessons rather than a duplicate course tree:
daily life in Japan, school communication, work/hospitality situations, public transport, shopping, appointments. Learner can choose a relevant context without changing JLPT goal.

**Course authoring:** independently authored examples and explanations. Textbook/JLPT alignment is a reference, not a license to reproduce protected material.

## One complete lesson — canonical learner flow

1. 30–60-second context: what learner can say/recognize after lesson.
2. Introduce a small set of words with Japanese form, meaning, and sourced audio.
3. Explain 1–2 grammar/usage patterns, with spoken examples where available.
4. Guided practice with answer feedback explaining *why*, not only correct/incorrect.
5. Independent recall questions; hints marked so they do not count as unassisted mastery.
6. End-of-session summary: attempted, correct independently, hint use, and what remains uncertain.
7. Schedule the next review. Show one simple action to resume next time.

The exact counts and spaced intervals are design parameters to validate against real family use, not scientific guarantees. For Kana, prioritize 3–5-second visual recognition and audio feedback; writing is useful but cannot replace recognition.

## Profile-sensitive examples, not separate applications

- Foundation learner: short Kana recall, difficult similar glyphs, sound, stroke viewing, and handwriting.
- N2 learner: advanced vocabulary/grammar, reading and listening review, exam-style practice from original or licensed material.
- N4 school-focused learner: classroom communication, practical listening, and reading.
- N4 younger learner: short visual sessions and guided independent practice.

These are configuration examples, not assertions of current mastery. One content engine powers all profiles.

## Phased delivery — no arbitrary dates

| Phase | Scope | Definition of done |
| --- | --- | --- |
| **P0 — Foundation for change** | Stabilize shared i18n, mobile viewport/modals, navigation and learner session save/reload; protect baseline | VI↔EN↔JA UI consistency on learner paths; Safari/Chrome review; no cross-profile writes; no silent draft loss |
| **P1 — Kana end-to-end** | Integrate existing Kana Writing Studio, recognition quiz, sourced audio, flashcards, error review and next-step loop | Four-profile test; recognition → stroke view → write → recall → save → resume all work on PC/iPhone |
| **P2 — Common lesson engine + N5 pilot** | Finish 2–3 original N5 lessons end-to-end, words/grammar/practice/feedback/review | Lesson schema/versioning supports all languages of UI; progress and attempts are genuine, resumable, testable |
| **P3 — Advanced-content pilot** | One well-authored N2 study module using same engine, focused on grammar/reading/listening | The advanced learner has useful study without waiting for completion of N5/N4 catalog |
| **P4 — Curriculum scale-out** | Fill N5, N4 and then N3/N2/N1 with original/licensed content; practical contexts | Each published unit passes content QA, media rights, translation and regression tests |
| **P5 — Optional intelligence** | Evidence-backed spaced review improvements, personalized suggestions, richer speaking/AI if budget/privacy suitable | Distinguishes measured skills from predictions; no invented proficiency; user controls and cost limits |

P0/P1 before adding broad content. P2 and P3 share components; avoid building two independent learning systems.

## UI boundaries

- Home is a calm learner selector, not marketing content; preserve current HORIZON branding and seasonal treatment.
- Today shows only **one** primary CTA. Secondary: Review due, Explore, Progress.
- Learn is a hierarchy, not a single long feature grid.
- Practice tools open *inside* lesson context with option to access from Review.
- Explore hosts non-sequential content. Journal is integrated and searchable, but private user text is never auto-translated.
- Progress shows attempted/completed/unassisted correctness/review evidence separately; no fictitious mastery percentages.
- Remove internal sections such as **07 · simulation data model**, versioned developer contracts, and Content Studio from ordinary learner map. Keep in a developer-only review/preview route.

## Data contracts

Stable IDs: `track_id`, `course_id`, `unit_id`, `lesson_id`, `activity_id`, `content_version`.
Separate tables/objects: `profiles`, `preferences`, `course_content`, `lesson_content`, `attempts`, `session_state`, `review_schedule`, `saved_items`, `notes`, `assets`, `ui_translations`, `content_explanations`.
A record of practice is not evidence of accurate writing or speaking when grading is not implemented.

Localization must be independent:
- UI: `Locale.ui(key)` from `i18n/ui-pack.js` for the full learner shell.
- Content explanations: per-content locale, versioned and reviewed.
- Japanese example text/audio: immutable learner material; display unchanged.
- Learner-authored notes and identifiers: never auto-translated.

## Explicitly defer / exclude for the family MVP

Full social community, public rankings, leaderboards between children, avatar decoration campaigns, complex role hierarchies, a giant unreviewed dictionary, unverified automated pronunciation scores, and full N1/N2 catalog before a reliable lesson engine.

## UX and quality gates per phase

- PC and iPhone Safari: no clipped cards or accidental scroll lock; overlays fit keyboard/viewport.
- VI/EN/JA: navigation, menus, errors, notifications, controls; no stale locale after route switch.
- One learner profile does not see another learner's progress unless explicitly permitted.
- Accessibility: tap targets, readable Japanese font, focus flow, reduced-motion preference.
- Local and future cloud persistence clearly distinguished; offline/draft data not silently lost.
- Content QA: accuracy, attribution, licensing, goals, exercises and feedback reviewed before publication.

**Recommended next implementation:** Freeze V17 as an i18n/reference baseline; implement P0 navigation consolidation and P1 Kana end-to-end first. Do not redesign the Home page again.
