# N5 pilot · one complete learning loop

This increment extends the approved Atelier design. It does not replace the brand, navigation, login or theme system. The published product remains an HTML prototype; the SQLite file is a handoff fixture, not a live server database.

## Before / after

Open `lesson-compare.html`. PC 1366×900, tablet 768×1024 and mobile 390×844 are real child viewports, scaled only for side-by-side display. Start, current activity and summary can be compared. Start uses an inert preview; current activity and summary use the current learner's actual browser records.

| Before | After | Learner benefit |
| --- | --- | --- |
| Three teaching cards and a separate three-question quiz | 3, 5 or 15-minute authored paths | A manageable scope; no filler to consume available time |
| Quiz checkpoint held in JavaScript globals | Saved unit, shuffled options, selected answer, ordered tokens, hint and feedback | Reload resumes the exact question |
| A wrong answer can be followed by an unrelated restart | A different, targeted repair question, bounded by budget and two repairs per session | Correct the misunderstanding without an endless loop |
| One total of correct answers | Independent correct, hinted correct, initial incorrect and repairs shown separately | Feedback describes what actually happened |
| No delayed-recall schedule | Per-concept 1→3→7-day experimental schedule | Test recall after a gap, with explicit limits |
| Generic lesson reminder | Current concept, checkpoint and hint/error state in Michi | A useful next action with a short reason |

## Content and pedagogical boundaries

- Canonical source: `content/n5-introduction.v1.json`; generated browser bundle and JSON are in `dist/`.
- One authored N5 sample, 11 question/repair variants, five concepts: identity, topic は, sentence order, polite question and origin.
- Mai is a Vietnamese international student and part-time worker. Aoi is her Japanese teacher. Character links reuse the existing cast; no new dashboard character gallery.
- 3 minutes: one teaching card, two recall questions. 5 minutes: context, core pattern, two questions, personal practice. 15 minutes: expanded explanation, six questions including token ordering and transfer, plus personal practice. The longer path is about 11 minutes before reflection/repair, within the selected 15-minute budget. Selecting 30 minutes does not fabricate more content.
- Explanations are authored for Vietnamese learners. The content declares `locale`, `explanationLocale`, `translationKey`, stable IDs and version. Future translations should be separate locale resources for the same content/version; the new pilot's copy is not yet fully localized into English/Japanese.
- Uses of self-introduction and polite forms were checked against Japan Foundation Irodori Starter lesson 3: https://www.irodori.jpf.go.jp/assets/data/starter/pdf/X_L03.pdf . Text and questions are original samples, not copied textbook content or official JLPT items.
- Personal introduction is self-reported practice, not AI grading, pronunciation scoring or evidence of JLPT proficiency. Names stay as entered; no invented Katakana conversion.

## Learning rules

`dist/lesson-engine.js` is a pure state machine, independent of DOM/storage. Time and randomness are injectable.

1. Opening a lesson never completes it. One active session ID identifies the writable checkpoint; switching modes pauses the prior session.
2. Check locks the first answer. A repair creates a separate immutable attempt referencing the first; it does not overwrite accuracy.
3. Adaptive priority inserts a targeted repair only when it fits the selected time; Continue first and Review first expose it as an option. Maximum two repairs, with no recursive repair of a repair. Skipping repair preserves its review record.
4. Every first-session concept gets next-day recall, including correct answers. Immediate correction never advances the retention stage.
5. A due review answered correctly without a hint advances to 3 then 7 days. Wrong or hinted review resets to one day. Correct early review does not postpone the due date or advance the stage. Early practice is labelled separately.
6. The assistant prefers the most recent unfinished activity across existing reading/exam flows and this pilot. A pending pilot can explain its exact current error or hint. Review first can prioritize due concepts; a four-day break gets gentle wording. Advanced-level goals are not sent into N5 by default.
7. Scheduling happens when the prototype is opened. There is no background reminder service or push/email delivery.

## Data model and future API boundary

| Entity | Stable relationship / fields |
| --- | --- |
| Content | `id`, `version`, `locale`, concepts, cards, units, time plans, questions, cast IDs |
| Session | learner ID, content ID/version, immutable definition snapshot, mode, priority/context snapshot, units, index, current answer/hint/feedback, personal draft, timestamps, status |
| Attempt | learner/session/unit/question/concept IDs, kind, repair reference, selected answer, correctness, hint, reading visibility, visible-window response estimate, question snapshot |
| Review | learner + content/version + concept, stage, interval, due date, last attempt, lapse count |

`dist/lesson-store.js` is the repository boundary. Each learner has a separate `nihongo-learning-v1:<id>` key. It validates ownership/structure, rejects a stale revision, and never silently replaces corrupt data. A failed save keeps the persisted checkpoint and shows an error/export action. Existing profile export includes pilot state; the explicitly confirmed reset flows include its sessions/reviews.

Browser revision checks are optimistic, not atomic cross-device transactions. In production replace the repository with authenticated API calls, server-side ownership checks and optimistic concurrency (`revision`/ETag), transactionally append attempts and update reviews, and use idempotency keys on checks. A database content version must be immutable once learners have sessions against it. Do not ship demo access codes as authentication.

The existing generic SQLite/JSON fixture now includes the pilot content and 11 question variants: 19 activities / 65 question records total. `status: pilot` and `engine: lesson/v1` keep it out of the older three-question simulator. The 6 fictional learners, 8 scenarios and synthetic histories remain separate from real browser interactions. No learner history is fabricated for the pilot.

## Components and tokens

The pilot inherits `--bg`, `--surface`, `--text`, `--muted`, `--line`, `--green`, `--gold`, `--display`, `--sans`, `--jp-size` and existing dark-theme values. New tokens are scoped in `lesson.css`: width 980px, spacing 24px, radius 20px, accent/soft/feedback surfaces derived from the inherited palette, warning ink.

Reusable components: entry/time option, checkpoint progress, dialogue line/speaker link, teaching card, choice option, token tray, hint, feedback, personal builder, evidence summary, review schedule and history row. Container queries stack content based on available component width; the main shell is unchanged. Native buttons, labels/selects, visible focus, text status alongside color, Japanese language spans, furigana toggle, inherited Japanese size and reduced motion are supported. Ordering uses taps/keyboard rather than requiring drag.

## Verification

- `node scripts/build-lesson.mjs`: references, answer IDs, repair links and time budgets validated.
- `python scripts/build-demo.py`: JSON, schema and SQLite fixture regenerated; integrity/foreign-key checks passed.
- `node --test tests/*.test.cjs`: 35 passed (17 existing, 18 pilot/repository). Checks cover immutability, checkpoint serialization, hinted correctness, repair budgets, learner isolation, version snapshots, stale revisions, corrupt/failed storage, early/due review and mode switching.
- Browser: 5-minute session with initial wrong → correct repair → hinted correct → personal practice → 1/2 summary; 15-minute session with token checkpoint reload, pause/Today advice/resume, one repair and transfer → 5/6 summary. These are QA interactions, not seeded achievements.
- Real child viewport checks: PC, tablet and mobile. Light/dark and overflow checked in browser. Narrow-phone time choices precede decoration. Early-review UI and unchanged next-day due dates were also verified. No physical iPhone, on-screen keyboard, screen reader or cross-device sync test is claimed.

## What follows

Review this one loop before multiplying content. Next: standardize the lesson authoring form and content validation; then add a small admin preview/publish workflow. After that, implement the agreed account/profile ownership, backend repository and sync conflict behavior. Audio, AI advice and a large N5–N1 bank need reviewed source material and measured learner value before implementation. A fixed streak penalty or a long AI chat panel would not improve this loop yet.

Screenshots: `screenshots/nihongo-n5-compare-pc.jpg`, `screenshots/nihongo-n5-compare-tablet.jpg`, `screenshots/nihongo-n5-compare-mobile.jpg`.

## Subsequent increment: content authoring

The N5 loop now resolves published content through `content-catalog.js`. Content Studio (`#admin`) adds draft forms, validation, memory-only preview and local demo releases; the existing session snapshot stays authoritative for unfinished work and old-version review. See `CONTENT-STUDIO.md`. Practice question selection now comes from the selected content plan rather than hardcoded unit IDs.
