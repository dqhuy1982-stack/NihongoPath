# HORIZON N5 — Lesson 01 · v1.46 (Implementation & QA)

**Date:** 2026-11-08  
**Branch:** `develop`  
**Demo:** https://dqhuy1982-stack.github.io/NihongoPath/?release=146#course/N5/lesson/01  
**Status:** Interactive HORIZON-authored learning module published; **not a reproduction of the Minna no Nihongo textbook**.

## Scope and learning objectives

This release turns the previous small N5 prototype into a lesson-based course: one integrated lesson with four instructional domains plus separate Practice, Check and Review. The content is aligned to the common **Minna no Nihongo Elementary I Lesson 1 grammar syllabus**, which is largely consistent between 2nd and 3rd editions.

Learners should be able to:
1. Introduce themselves with a name, nationality and profession.
2. Ask or answer polite yes/no questions about someone.
3. Use topic `は`, addition `も`, relational `の`, sentence-final `か`, and `さん`.
4. Recognize simple self-introductions in authored reading/listening contexts.

## Real lesson content (not placeholders)
- **30 selected vocabulary items** with Japanese script, Vietnamese meanings and authored sample sentences, grouped by context. This is an independently authored selection, **not an exhaustive or publisher-verified copy** of either edition's vocabulary list.
- **6 grammar points** with example, Vietnamese explanation and misuse notes: `N1 は N2 です`, nominal negation, `か` questions, `も`, `の`, and polite name usage.
- **1 authored reading** in three paragraphs about a class, with toggleable Vietnamese meaning. Reading comprehension is assessed in Practice and Check.
- **3 original listening dialogues** about introduction, profession and shared student status. Playback uses device/browser Japanese `SpeechSynthesisUtterance` (ja-JP), **not licensed or native-recorded audio**. Audio support can vary on PC/iOS.
- **16 practice questions** across vocabulary, grammar, reading and listening. Practice gives immediate explanations and supports retries.
- **20 different check questions** across the same four skills. Answers are hidden until the final summary. No compulsory exam timer.
- **Review** presents mistakes from the latest attempt and permits additional non-destructive attempts. More sophisticated spaced-repetition scheduling remains a future enhancement.

## Status / scoring / data safety

The lesson uses an internal **80% threshold**, not JLPT scaled scoring. Completion requires:
- at least one practice attempt with score >=80%, **and**
- at least one check attempt >=80% with playback-start confirmation for each listening question.

A high score without working Japanese speech is saved but does **not** produce a false claim that listening was assessed. Show a neutral pending-audio status, not a red incorrect-answer score.

Attempts are appended, never reset by a later low score. Each learner has a separate storage key:
`Horizon.N5.Lesson01.v1.<learnerId>`

The lesson does not modify existing Foundation result history, the three previous N5 demo lessons, family profile records, Cloudflare D1 or backend APIs.

## UI & navigation

- `#course/N5` shows the 25-lesson path (previous v1.45).
- `#course/N5/lesson/01` opens the integrated Lesson 01 directly (new v1.46).
- Top level: **Học · Luyện · Kiểm tra · Ôn lại**
- In Học: **Từ vựng · Ngữ pháp · Đọc hiểu · Nghe hiểu**
- No non-functional content routes for other lesson numbers.
- New course and lesson design uses existing color/typography variables and responsive CSS at 670/420 px.
- Old `#lesson/n5-introduction` authored sample remains available; its progress is not silently reclassified as a successful result in the new Lesson 01.

## Quality gates

`tests/n5-lesson01-v146.test.mjs` validates:
- 30 unique vocabulary items, 6 grammar points, 3 listening tracks, 3 reading paragraphs.
- 16 practice and 20 separate check questions; option validity and skill coverage.
- Route ownership, page rendering and original-course fallback.
- No fake "completed" state from practice alone.
- 100% check score without speech cannot confirm listening or mark lesson complete.
- Genuine TTS playback-start events + qualifying practice/check can complete the lesson.
- Attempts retained after a poor retake and learner profile isolation.
- Correct bundle order, mobile CSS and reduced-motion support.

GitHub Actions runs all legacy regression tests, validates the published build and then fetches the **actual live HTML and lesson JavaScript** after GitHub Pages deployment. This prevents source-only "released" claims.

## Minna no Nihongo edition & rights

3A Corporation states that the 3rd edition revises some vocabulary, dialogue scenes and expressions while keeping the main grammar syllabus/lesson structure broadly consistent. Consequently, **do not promise exact edition-specific word lists** unless the user selects 2nd vs 3rd edition and the mapping has been verified. Do not paste textbook dialogues, scans, copyrighted exercises, or publisher audio into a public demo without permission.

Official sources:
- https://www.3anet.co.jp/en/minnanonihongo_dai3pan.html
- https://www.3anet.co.jp/np/en/books/1300/
- https://www.3anet.co.jp/np/en/books/1322/

## Standard for future N5 lessons

Every released lesson must include, at minimum:
1. vocabulary with contextual use and pronunciation support;
2. explicit grammar patterns and common mistakes;
3. authored and age-appropriate reading with comprehension;
4. playable authorized audio, transcript controls and listening assessment;
5. distinct guided practice and knowledge check;
6. review and independently persisted attempts;
7. working mobile/PC navigation and no false completion indicators.

Before extending Lesson 02, verify the actual textbook **edition**, then improve reading/audio quality and per-skill remediation using direct learner feedback from Lesson 01.
