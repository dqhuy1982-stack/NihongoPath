# HORIZON — FOUNDATION / KANA JOURNEY
## Product + UX + learning-state implementation specification (proposal V1)

**Status:** Design and implementation blueprint. **Not a live-site change.**  
**Scope:** Four separate family learners, PC and iPhone; reusable curriculum engine N5–N1.  
**Principle:** Foundation is a course. Kana Writing Studio is a tool nested in Practice.

## 1. Existing implementation inspected (develop)

- `course/foundation` exists but is a sample course list; only an introduction to five Hiragana vowels is authored as `lesson/foundation-vowels`.
- `kana` is an interactive Studio with **Choose → Stroke view → Write**, using `kana-data.js` for 46 basic Hiragana and 46 basic Katakana. Its drawing confirmation is a **practice event, not automated handwriting correctness**.
- `kana-recall-model.js` provides 12-question recognition practice, approximately 5-second timing evidence, difficulty/weak-history and an expanded catalog including voiced/combined kana.
- Local audio pack includes 46 base pronunciation MP3 files, shared by both scripts; verify coverage/rights before expanded audio question types.
- Lesson engine and practice review state already exist for sample lesson content; Kana writing and recall still have separate learner-local records. Do not assume they are a unified course state.
- Existing i18n has central `Locale.ui(key)` for selected UI components; **all new journey UI must be keyed**, with lesson explanations kept separately.
- Existing product roadmap: `source/docs/HORIZON_PRODUCT_FLOW_ROADMAP.md`.

This spec reuses the existing modules rather than rebuilding, resetting, or changing databases.

## 2. Architecture: course versus tool

Navigation:

```
TODAY / TODAY'S SESSION
  └─ LEARN
       └─ FOUNDATION — Kana Journey
            ├─ Course overview (path)
            ├─ Unit F01 / F02 / ...
            │    ├─ 01 LEARN — recognize / hear / compare
            │    ├─ 02 PRACTICE — recall / listen / trace / write
            │    └─ 03 CHECK — independent randomized check
            ├─ Due review & error notebook
            └─ Readiness for N5 → N5 Unit 01
```

The course has one **canonical Next action** per learner. Review may interrupt or accompany the next lesson. Writing Studio remains accessible independently from Review, but does not replace Learn or Check.

**Naming:**
- `FOUNDATION · Kana Journey` = course/path.
- `Kana Writing Studio` = a module inside step 02 Practice.
- `Kana Recognition Lab` = timed recognition practice; reuse existing recall.
- `Kana Readiness Check` = course-level assessment; distinct from practicing the same 12 questions.

## 3. Shared unit lifecycle

### 01 — Learn (Học)
- Show 5–10 characters at a time, always in a fixed teaching order.
- Each character: large glyph, recorded pronunciation, 1–2 shape cues, stroke-order preview, optional romaji.
- Compare common lookalikes explicitly; at later units show voiced and combined forms in context.
- End when learner visits target cards. **Exposure is not evidence of competence.**

### 02 — Practice (Luyện)
- Recognition: see glyph → choose reading, with immediate feedback and retry.
- Listening: hear audio → choose glyph, only for characters with verified audio.
- Writing Studio: choose glyph → watch strokes → trace or free-write → save voluntary attempt.
- Mix/revisit previously difficult cards and use 3–5-second response target when comfortable, but accuracy comes first.
- Store attempts with feedback and hints separately. **Never grade handwriting accuracy** until an actual validated scoring system exists.
- Learner can return to Learn, practice more, or request Check. Practice is not a gate.

### 03 — Check (Kiểm tra)
- No clues or highlighted correct strokes during the attempt.
- Randomized mix and order; never merely replay the identical Practice sequence.
- Base questions: see Kana → choose reading; hear confirmed audio → choose Kana; read a short Kana-only word.
- Correctness and elapsed time are measured per question. Audio questions require verified assets; if unavailable, omit that modality and report limited coverage.
- Result: independent correctness, time distribution, items to review, covered skills.
- Do not report “writing mastered”, “spoken pronunciation accurate”, or JLPT level from a visual multiple-choice test.
- If weak, show **Practice these 3 items**; not “You failed.”
- Generate spaced review due events and advance based on evidence, not purely counts of clicks.

## 4. Foundation units and handoff

| Unit | Content | Suggested check | Leads to |
| --- | --- | --- | --- |
| F01 | Hiragana vowels then rows: total 46 basic Kana, divided into short sub-units | Recognition, verified base audio | F02 and optional N5 starter phrases |
| F02 | Katakana: total 46 basic Kana, divided into short sub-units | Recognition, verified base audio, simple loanwords | F03 |
| F03 | Dakuten and handakuten in both scripts | Recognition and audio only once assets verified | F04 |
| F04 | Yōon (small ゃゅょ / ャュョ), small っ / ッ, long vowels including ー | Read/compare short words, timing and sound patterns | F05 |
| F05 | Mixed Kana words and short expressions (e.g. ねこ, さかな, がっこう, スーパー) | Kana reading, recognition in context, short listening where assets available | F06 |
| F06 | Foundation readiness + weak-character review | Mixed, independent and suitably varied check | Recommend N5 Unit 01 |

F01/F02 are **not giant 46-character screens**. Teach in short groups (typically 5–10). Practice and Check exist within each group and at the end of each unit.

Progression is a dependency **recommendation**, not a hard lock. Some learners may already be at N2/N4; they must be able to skip Foundation and access their chosen track. The system should still recommend specific Kana remediation when needed.

**N5 handoff:** Opening N5 Unit 01 preserves Foundation evidence. N5 teaches vocabulary, greetings, grammar, reading and listening; it does not repeat the full Kana course. Encountering an uncertain Kana triggers an inline “Review this character” action, then returns to the same lesson step. Katakana work may continue in parallel with early N5.

## 5. Readiness and evidence — no invented mastery

Keep five concepts independent:
1. **Seen** — viewed the teaching material.
2. **Practiced** — performed recognition/listening or attempted handwriting.
3. **Checked** — answered an independent, objectively scored question.
4. **Retained** — answered correctly again after an interval; supported by a second timestamp.
5. **Needs review** — response incorrect or repeatedly slow in independent checks.

Display a **readiness signal**, not JLPT certification:
- “Ready to try N5” when evidence covers the expected core characters and reading patterns.
- “Continue N5, review these Kana” if the learner starts with gaps.
- “Kana writing practised” distinctly from “Kana recognition checked”.

Any draft readiness rule (for example 85% on two independent checks on different days, with representative content coverage) is a **product hypothesis to tune**, NOT an official JLPT cutoff. Never hide “Start N5 anyway” behind an arbitrary percentage. If audio coverage is missing, show “Listening not yet assessed,” not green mastery.

## 6. UX layout — one screen focus, not three independent routes

### PC (shared course page)

```
HORIZON / Learn / Foundation

FOUNDATION · Kana Journey         [Your path: F01 → F02 → F03 → F04 → F05 → N5]
Hiragana · Group A                 [Due review: 3 items]   [Progress by evidence]

             [ 01 Learn ] — [ 02 Practice ] — [ 03 Check ]

┌───────────────────────────────────────────────────┬───────────────────┐
│ CURRENT ACTIVITY                                  │ SESSION SUMMARY   │
│ Large Japanese glyph / sound / instruction        │ Seen / Practised  │
│ Interactive element appropriate to chosen stage   │ Checked / Due     │
│ One primary CTA: Continue / Practice / Check      │ Difficult Kana    │
└───────────────────────────────────────────────────┴───────────────────┘

[Why this next step?] [Review mistakes] [Back to My Journey]
```

Main central column is the primary interaction. Right evidence card is compact and optional at smaller widths. **Do not add a second competing mini-dashboard under the activity.**

### iPhone

```
[←] FOUNDATION                     [Season] [VI/EN/JA]
Kana Journey · Hiragana / F01
[Path · next: Katakana ›]          (collapsible)
[ 1 Learn | 2 Practice | 3 Check ] (compact stage tabs)
[ ONE activity at a time            ]
[ single sticky primary action      ]
[ Review due · 3 ]                 (small, contextual)
```

Do not display all lesson cards, writing canvas and test results in one long vertical scroll. Use the successful existing Studio pattern of three mobile substeps **within Practice**: Choose → Watch → Write. This avoids confusing macro-course stages with micro-tool steps.

On iPhone keyboard/viewport changes must not truncate modals. Preserve canvas draft when changing stage or locale.

## 7. Contextual Next action (deterministic rules)

Priority:
1. Active unfinished lesson/check → **Resume** (preserve draft).
2. Due error/recall review → **Review** (brief; learner may continue lesson).
3. Learn incomplete target characters → **Learn next group**.
4. Already learned, not practiced → **Practice**.
5. Practice done but no independent check → **Check**.
6. Check passed with reliable coverage → **Next unit** or **Try N5**.
7. Evidence inconclusive → **Short targeted practice**, not inflated mastery.

Do not assume learner is weak merely because no activity was recorded. Never silently change their chosen goal.

## 8. Data model and integration rules

Canonical progress key: `learner_id + track_id + unit_id + skill_id + content_version`.

At minimum record:
- unit status: `not_started | learning | practising | checked | review_due`;
- activity event: `attempt_id, learner_id, activity_id, prompt_id, mode, answer, correct|null, hint_used, elapsed_ms|null, created_at, source, content_version`;
- writing attempt: `char, attempted_at, stroke_count`, no correctness unless validated;
- due review: `skill_id, due_at, evidence_source, last_checked_at`;
- a **navigation checkpoint** independent of visual theme and UI locale.

Reuse existing storage through adapters at first:
- Lesson engine = sessions / assessments where content schemas allow.
- `NPKanaRecallModel` = recognition outcomes, speed and weak-item evidence.
- `NPKanaStudio` = handwriting practice and draft.
- Course orchestrator = aggregated **read-only evidence first**, then versioned writes.

Do not overwrite existing browser-local snapshots. Cloud sync should come only after clear conflict/version policy; “demo saved locally” and “saved to server” must not be conflated.

## 9. Integration phases (small, reversible)

**A. Information architecture:** Turn `course/foundation` into the canonical Journey overview with clear Learn/Practice/Check stages; reuse current `kana`, `lesson/foundation-vowels` and recall modules. No data migration.

**B. Evidence adapters:** Read existing learner-local recall and handwriting records; display what is measurable, with unassessed dimensions explicitly labeled.

**C. Unit activities:** Add missing learn/listen/check coverage in original Kana groups. Implement real varied checks and save/resume. Reuse 46 original MP3 clips where appropriate, and verify new audio before extended quizzes.

**D. N5 bridge:** Next-step routing to N5 lesson 1, with inline return-to-Kana and same progress identity.

**E. Quality gate:** Four learner profiles; language VI↔EN↔JA; all four themes Light/Dark; Chrome/PC and Safari/iPhone; offline audio/state; canvas preservation; no cross-profile progress leakage.

## 10. Acceptance checklist

- [ ] Foundation is one connected path with Learn, Practice, Check for every small unit.
- [ ] Writing Studio is reachable from Practice and retains its existing three substeps.
- [ ] Test reports only independently verified modalities; writing is not auto-graded.
- [ ] A failed/slow item leads to the exact practice item, with one-tap return to course.
- [ ] Next unit/N5 recommendation follows real evidence; no hard lock or invented JLPT mastery.
- [ ] N5 starter can open without Foundation completion; optional Kana support remains.
- [ ] Return later resumes the exact learner/session; changing UI locale or season does not reset state.
- [ ] Small-screen stage navigation needs no giant scrolling dashboard or redundant buttons.
- [ ] UI copy comes from central `i18n/ui-pack.js`; Japanese content is not rewritten by UI locale.
- [ ] Tests validate key transitions and no migration of existing records.

**Next suggested development action:** Implement Phase A as a minimal, visually polished course overview using current data, without rebuilding the Writing Studio or changing production. Then incrementally connect evidence, checks and N5.
