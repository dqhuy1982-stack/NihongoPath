# HORIZON — JLPT Practice & Exam Centre
## Curriculum integration, exam simulation and source-ingestion blueprint (proposal V1)

**Status:** Architectural proposal only — no live route changes, no examination files ingested.  
**Audience:** Four learner profiles initially, from Foundation/N5 through N1.  
**Priority:** Add as a connected assessment layer to existing learning engine, **not** a disconnected PDF library.

## 1. Why and where

One body of legitimately usable source questions can support two distinct learner modes:

1. **Practice Mode** — short, selected by skill, theme, weakness or past-set metadata. Hints and explanations available after an attempt. Learner may retry; retain the initial independent result.
2. **Exam Mode** — complete or section-scoped timed mock, ordered like the source, no explanations or answer reveal until submission. Clear completion and timer behavior; resume interrupted sessions safely without fabricating a continuous exam.

A lesson also retains its **small Check** stage: this measures immediate understanding, whereas Exam Mode tests retention under exam-like conditions.

Navigation **without adding an excessive new top-level learner menu**:
```
Today
  ├─ Continue current lesson / pending exam
  ├─ Review due / exam weak spots
  └─ Recommended Practice
Learn
  ├─ Foundation — Kana Journey: Learn → Practice → Check → Review
  ├─ N5...N1 — lesson path: Learn → Practice → Check → Review
  └─ JLPT Practice & Exam Centre
       ├─ Select level → skill/topic → practice
       └─ Select level → test set/year/source → full mock / section mock
Review
  └─ Mistake notebook (questions → related lesson → recheck)
Progress
  ├─ Practice history by skill
  ├─ Exam history and time
  └─ Readiness signals (non-certified)
My Space
  └─ Private licensed-source import / exam administration (authorized only)
```

**User journey after a lesson check:** weak grammar / reading skill → recommend 5 targeted, rights-cleared JLPT-style practice questions → answer and receive explanations → optionally revisit lesson → independent retry later. This never marks the lesson as failed simply because optional exam preparation was not done.

**Foundation → N5 bridge:** check Kana in Foundation, then optionally start N5 practice items with furigana/romaji accommodations clearly labeled as Practice only (not a strict simulated exam). Exam Mode follows the original source presentation, without adaptive help.

**Advanced learners:** N2/N1 exam preparation can run in parallel with incomplete N5 content, using the shared assessment engine. No forced course unlocking.

## 2. User-facing information architecture

**Exam Centre landing**

- Level selector: N5, N4, N3, N2, N1 (defaults to learner's chosen goal, user may override)
- 2 primary tabs: **Practice** and **Mock exam**
- One concise "continue where you stopped" block
- Library filters: year/edition, source, section, skill, availability of verified audio, previously attempted, rights/availability
- Clean mobile cards; no three-column PDF list or excessive scrolling

**Practice Mode**: choose 5 / 10 / 20 questions or a custom filtered set; progress indicator; one question per viewport; passage/audio/image kept with question group; immediate feedback **after submission**, explanation and "review concept" link. Record independent correctness, hint use, retries and time separately.

**Mock Exam Mode**: test overview, source edition, sections, current time rules, audio check, timed exam, navigation between questions within allowed part, autosave and save-state recovery; answers hidden until end; results by scored section and skills; link missed questions to Review. Optional section mock is explicitly not a full test.

If audio is absent or source incomplete, **do not advertise full JLPT mock**. Label "section practice" or "partial mock" instead.

## 3. Official format / timing — versioned configuration

Official JLPT sections vary by level (verify at source before each release):
- N1: Language Knowledge (Vocabulary/Grammar) and Reading **110 min**; Listening **55 min**.
- N2: Language Knowledge (Vocabulary/Grammar) and Reading **105 min**; Listening **50 min**.
- N3: Vocabulary **30 min**; Grammar/Reading **70 min**; Listening **40 min**.
- N4: Vocabulary **25 min**; Grammar/Reading **55 min**; Listening **35 min**.
- N5: Vocabulary **20 min**; Grammar/Reading **40 min**; Listening **30 min**.

Use a `test_format_version` and effective date rather than hardcoding all years to current timings. Historical paper counts and sections may differ. Official reference: https://www.jlpt.jp/e/guideline/testsections.html

## 4. Results and scoring: strict honesty

The JLPT uses **scaled scores based on Item Response Theory**, **not a sum of raw correct answers**. Thus the platform cannot claim to calculate an official JLPT 0–180 score or authoritative pass/fail from a privately uploaded answer key.

For prototype outputs show:
- Number correct / attempted and percentage correct, grouped by relevant section and question type.
- Time spent and pace; items skipped or guessed; accuracy without hint.
- Which questions and learning concepts need review, verified answer explanations where available.
- "Not an official JLPT score" and **do not map 70% correct to JLPT 126/180**.
- With enough validated data in the future, clearly labeled **non-certified estimate** may be evaluated separately, not implied now.

Official score FAQ: https://www.jlpt.jp/e/faq/index.html

## 5. Source rights are a gate, not a checkbox

The JLPT organizers state that the exact full papers for every exam are not publicly released. Authorized example materials include official practice workbooks (2012 and 2018), but reproduction/translation and some Listening recordings have **specific copyright and third-party rights conditions**.
- https://www.jlpt.jp/e/faq/index.html
- https://www.jlpt.jp/e/samples/sampleindex.html
- https://www.jlpt.jp/topics/202401191708325413.html (explicit warning against publishing actual JLPT examination questions/answers)

**Before import** record:
`source_type`: official practice workbook / publisher's commercial material / user-authored / clearly licensed third-party / unknown;
`origin_url_or_citation`, `publisher`, `edition_year`, `exam_session_label`, `rights_holder`, `permission_scope`, `redistribution_allowed`, `audio_rights`, `verification_status`.

Never assume purchased paper, downloaded PDF or "past exam" automatically permits digitization, hosting, sharing or redistribution.
- Public GitHub Pages source or public `assets/` paths must contain **only content legitimately licensed for that use** or original questions.
- Do not import unverified historical actual exam leaks or questions/answers from questionable sources.
- Keep a rights audit trail and enforce visible publication state. The demo can use self-authored JLPT-style content before authorized third-party content is available.
- A private four-learner app is still an online deployment; do not assume "private" alone resolves permissions.
- Do not upload proprietary exam books or audio to the public repository.

## 6. Source ingestion / review workflow

Suggested source intake where user has the right to import:
```
Source inventory
  → source rights and origin verification
  → encrypted private staging (if hosting authorized)
  → PDF/image/audio metadata inspection
  → text + figure + passage + question segmentation
  → answer-key linking and audio synchronization
  → tag level / skill / topic / item type / source page
  → manual QA (Japanese correctness, options, figures, answer key)
  → validate review and mock behavior
  → release to authorized learners
```

**Do not automate OCR indiscriminately.** Prefer selectable PDF text and structured source files. For scanned pages, explicitly verify visually each question, especially kanji, furigana, small kana, text inside figures and answer bubbles. AI-assisted parsing can suggest tags and explanations but must not mark them as verified.

**Pilot:** Import **one authorized sample set**, a controlled 10–20 questions across a few item types, and verify every question before scaling to multiple years/levels. Include Listening only after audio permissions, indexing and media behavior are confirmed.

## 7. Stable content schema

```
exam_collection:
  collection_id, level, edition_label, source_type, source_reference, rights_status,
  publication_status, format_version, content_version
exam_sections:
  section_id, collection_id, order, section_type, duration_seconds, completeness
passages:
  passage_id, section_id, reading_text, figure_ids, audio_ids, source_page
questions:
  question_id, section_id, passage_id?, index, item_type, stem, options[],
  answer_key, explanation_id?, tags[], difficulty_label?,
  audio_id?, figure_ids[], source_page, verification_status
exam_attempts:
  learner_id, attempt_id, collection_id, mode, section_ids[],
  started_at, last_saved_at, submitted_at?, elapsed_ms, status,
  timer_policy, active_question_id, content_version
answers:
  attempt_id, question_id, answer, correct|null, answered_at,
  elapsed_ms?, hint_used, first_try, source_revision
skill_evidence:
  learner_id, skill_tag, source_question_id, independent_correct,
  time_ms?, date, linked_lesson_id?, review_due_at?
```

Question groups/passages must be first-class so that a reading passage or listening clip cannot be detached from its multiple questions. Media references should be private, scoped, expiring (if user access is authenticated) and rights-checked.

Progress and journal should use immutable IDs and content versions; import reprocessing must not change historical answers.

## 8. UX rules and status

- Maintain HORIZON design language (subtle, spacious) and EN/VI/JA `Locale.ui` shell. Exam Japanese source text is **never auto-translated** in Mock Exam.
- In Practice mode, optional **localized explanation** can be shown if authored/reviewed; one explanation may be available only in one language and should be transparently marked.
- Do not expose exam answers through UI before submission in Exam Mode.
- On Safari/iPhone preserve answer draft, section/attempt state, and audio playback; handle app backgrounding and timers explicitly.
- Normal home can show one CTA: "Continue N2 mock" or "5 grammar questions to review", not a separate exam dashboard competing with Today.
- Review mistakes can lead to an existing lesson's concept rather than another disconnected question bank.
- Avoid claiming automatic question grading for handwritten Japanese or speaking when no appropriate grader exists.

## 9. Development phases (independent of arbitrary dates)

**E0 — rights + source inventory:** list the real collection (N5–N1, year/edition, PDF/image/audio, answer key); verify use permissions and authenticity; no public uploads.

**E1 — Practice MVP:** 10–20 authored/licensed questions, filters, QA, answers, explanations, per-learner evidence, "Study this topic" link.

**E2 — Exam MVP:** single complete authorized exam or labeled section mock with timer, save/resume, answer sheet, review and non-certified score.

**E3 — Curriculum bridge:** mapping item tags to Foundation/N5–N1 lessons and Review; age/goal personalization with no hard level locks.

**E4 — ingestion scale:** permission-cleared bulk pipeline, manual content QA, verified audio and alternate formats, stable analytics.

**Release gates:** browser/iPhone behavior, answer correctness, no cross-learner leakage, rights cleared for hosting scope, EN/VI/JA UI, i18n content/lesson separation, reproducible raw score, no invented official score, healthy error recovery.

## 10. Recommended next implementation

Build the reusable question/assessment schema and **Practice MVP** alongside Foundation + N5 content engine. Once that works with an authored or authorized sample set, add a real Mock Exam experience. **Do not start by bulk-importing years of PDFs** or showing all tests in the learner UI.
