# Atelier 09 — a data-driven design simulation

Current decision update: [Atelier 10](UX-atelier-10.md) makes Adaptive the default,
with per-learner Continue first and Review first options. A pending lesson is
interrupted only for a related blocker, not an unrelated historical error.

This workspace is for deciding the learning model and reviewing UI before a
production backend is selected. An absent production backend is an intentional
prototype boundary, not a request to turn this round into an infrastructure build.

## Review it

Open `#demo`. Change the scenario using the collapsible scenario control. Try:

| Scenario | Data signal | Observable behavior |
| --- | --- | --- |
| First step | No attempts, no assessed level | A short Foundation segment; no invented score |
| Commute | N5 draft, due items, slow Kana retrieval | Limited review and part of the paused lesson in 5 minutes |
| Office break | Repeated wrong answers, silent environment | Related review, followed by a small learning segment |
| At a desk | N2 draft, 30 minutes available | Resume, review, and the available mini set; do not fill unused time |
| Return after six days | Gap since last study | At most five minutes, no catch-up debt |
| N1 reading | Paused reading and conditional-language errors | Resume and targeted practice; no pass prediction |
| Missing audio | Listening module planned, headphones available | Explicit reading fallback; no fake play button |
| Changed plans | Same N5 learner, 15 minutes at work | Different question allocation from the 5-minute commute |

`#demo-compare` puts the old selection rule and the proposed planner side by side
using the same fictional profile. It is a modeled comparison, not a screenshot of
the original page. At mobile width the comparison stacks, and Today has a fixed
start action above the existing bottom navigation.

`#demo-data` shows per-learner evidence, the triggered rules, trial history, module
status, and downloadable files. New content explanations are Vietnamese; UI has
VI/EN/JA strings. This is not a claim of a fully translated curriculum.

## Dataset and database

Source of truth: `scripts/build-demo.py`. Generate with:

```sh
python scripts/build-demo.py
node --test tests/demo-engine.test.cjs
```

The generator produces `dist/demo-data/seed.json`, its browser wrapper `seed.js`,
`schema.sql`, and a real SQLite file `nihongo-demo.sqlite`. It checks foreign keys
and integrity. There are 6 learners, 8 scenarios, 18 activities, 52 synthetic
historical responses and 16 scheduled review records. The 54 question records use
18 original questions in three flows; they are not 54 independent exam items.
Content levels are editorial demo labels, not validated JLPT classifications.

SQLite is a portable fixture for inspecting a relational model. The static HTML
uses the equivalent JSON. It does **not** query a live database, synchronize across
devices, authenticate learners, enforce family permissions, or call an API.

The demo clock is deliberately fixed at 2026-11-01 09:00 Asia/Tokyo so scenarios
remain reproducible. Browser interactions are tagged `demo-interaction`; seeded
history is tagged `synthetic-history`. Sample names and histories are fictional.

## Boundaries and reuse

- IDs are stable and independent of names; no user-specific branch determines a
  plan. Adding a fictional learner requires data, not a new UI.
- Goals are self-selected and separate from assessed proficiency (all unassessed).
- Shared records: family, learner, goal, module, content/version, question,
  session, attempt, review, scenario and rule.
- Answers retain selected option, hint use, content version, question snapshot,
  source and response time. Checking locks the first answer. Retrying is a new
  session, not a rewrite of old evidence.
- Full lessons retain their remaining questions when a timed segment ends.
- Trial review intervals are intentionally simple: 3 days for correct without a
  hint, 1 day otherwise. They demonstrate the flow, not validated scheduling.
- The planner respects time and module capabilities. It never fills a time budget
  with unavailable lessons or declares target level as demonstrated ability.
- All simulation state uses `nihongo-design-simulation-v1`, separate from the
  original prototype's profile data. Writes reread the latest local fixture, and
  the storage event refreshes another demo tab. This is not server-grade atomic
  concurrency or cross-device synchronization.
- Reset restores only the disposable simulation dataset. Export includes the
  trial state; downloads of the seed database remain the original baseline.

## Extension contract to evaluate later

Keep one application/backend with clear modules. Do not introduce microservices
or a general plugin marketplace to support six prototype profiles.

An eventual provider can implement these operations behind the same UI:

```text
getLearner(learnerId)
getLearningEvidence(learnerId, asOf)
buildPlan(learnerId, {minutes, place, capabilities})
saveSession(sessionId, expectedRevision, checkpoint)
recordAttempt({eventId, learnerId, sessionId, questionId, contentVersion,
               selected, hintUsed, responseMs, at})
```

`learning-event/v1` and `advice/v1` are proposed contracts, not existing APIs.
External AI and listening are marked `planned`; no API key or vendor is selected.
Production work must choose server authorization, validation, idempotency,
content version migration, conflict resolution and permission rules. None of
those decisions should be implied by a working static demo.

## UI reuse

The original logo, fonts, palette, shell, theme chooser, buttons, cards and bottom
navigation remain. New styles are scoped to `sim-*`. Reusable additions are the
scenario drawer, time selector, context controls, evidence-backed advice card,
variable-length plan list, first-answer feedback and record inspector.
`--sim-gap`, `--sim-radius`, `--sim-wash`, `--sim-line` and `--sim-focus` supplement
existing semantic tokens; no new core brand palette is proposed.

## Checks

Engine tests cover all presets across time/environment combinations, budget and
availability constraints, first-time and returning learners, real plan changes,
answer immutability, resume after JSON serialization, partial lesson completion,
learner isolation and a learner added through data. Browser QA additionally
checks keyboard focus, feedback persistence after reload, mobile start placement,
light/dark layouts and responsive overflow. This is prototype QA, not a WCAG or
security certification.
