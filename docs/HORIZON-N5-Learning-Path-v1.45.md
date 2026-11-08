# HORIZON N5 · Minna no Nihongo learning path v1.45
**Date:** 2026-11-08 · **Source:** `develop` · **Platform:** GitHub Pages static demo

## Product decision
- N5 is a **learning course first**, not a JLPT question bank.
- Main navigation has three areas: (1) *25 lessons by Minna no Nihongo Elementary I*, (2) *skill-focused reinforcement*, (3) *JLPT N5 exam preparation*.
- Kanji and Kana literacy must be added explicitly: Minna no Nihongo textbooks do not directly teach the writing systems.
- A grammar reference is supporting material, not a parallel sixth top-level course.

## Current implementation (actual, not promised)
- `source/public/n5-path-v145.js` renders 25 provisional lesson topics in five accordion stages of five lessons.
- `source/public/n5-path-v145.css` styles PC, mobile and reduced-motion settings.
- Only two lesson entries link to existing **authored sample** content: `n5-introduction` and `n5-demonstratives`.
- Existing standalone `n5-greetings` remains accessible as a preparatory sample.
- Other 23 lessons clearly show not yet authored. The interface does not generate fake completion, progress or exam results.
- `#review` opens the already implemented review workflow; skill-specific practice banks and full mock exam remain unavailable and are labeled as such.
- `#course/N5` is intercepted by the N5 path module after existing course router is loaded; no existing Foundation route is changed.
- No learner records, profiles, progress storage or D1 schema changed.

## Curriculum governance
- 3A Corporation publishes **25 lessons** in Elementary I. The third edition began publication in autumn 2025.
- Third edition substantially retains the grammar sequence but changes expressions, vocabulary and dialogue context. Lesson metadata must include `bookEdition` (2 or 3) and a reviewed alignment, before importing vocabulary.
- The 25 headings in v1.45 are **provisional pedagogical descriptions**, not reproductions of any textbook's proprietary dialogues or exercise pages.
- Do not copy textbook conversations, exercise sets, CD/app recordings, photographs, or scan/book pages into the public repository without appropriate rights. Author original scenarios and exercises using the learning objectives.
- Distinguish official JLPT N5 competency from instructional materials. Finishing Minna I is not a JLPT pass guarantee.

## Per-lesson intended flow (next milestone, not implemented in v1.45)
1. **Learn**: objective, contextual vocabulary, key patterns, original short situations, short reading and available legally sourced listening.
2. **Practice**: retrieval and application, short sets, instant feedback, error tagging and targeted redo; no exam countdown.
3. **Check**: unseen mixed items covering the lesson objectives. Never mark a lesson completed based on mere view count or single flashcard.
4. **Review**: schedule subsequent retrieval and show whether progress is recent or retained; mastery is a separate state from completion.

Recommended status model:
- `not_started` → `learning` → `practice_achieved` → `completed` (both lesson practice and knowledge check meet an agreed threshold).
- `review_due` and `retained` describe memory retention, **not** a permanent passing grade.
- Threshold (e.g. 80% or 85%) is an **internal EdTech policy**, not the official JLPT pass threshold; confirm before implementing it for N5.
- Never overwrite old attempts when a new practice score is lower. Keep multiple attempts and latest/best views without conflating them.

## JLPT N5 exam track
Official timed exam sections:
- Vocabulary: 20 min
- Grammar + Reading: 40 min
- Listening: 30 min

Only enable mock exams when all source questions, answer keys, audio, timer behavior and rights of use are verified. The user's historical JLPT test sets can be imported later through an explicit, reviewed content pipeline. Raw percentage in a self-authored quiz is not an official JLPT scaled score.

## Suggested next implementation steps
1. Confirm whether the intended textbook is the second or third edition; record edition in content data.
2. Expand actual **Lesson 01** into full original Learn / Practice / Check / Review, using the existing introduction sample as a starting point, while preserving its existing stored IDs.
3. Build Lesson 02 and common skill tagging after Lesson 01 quality passes.
4. Add genuine separate skill banks, then chapter checks for every five lessons, then the licensed JLPT exam bank.
5. Add real learner-facing status and spaced review summaries, ensuring the four profiles remain independent.
6. Test click-through on desktop/mobile, verify back/forward, privacy, and deployment commit SHA each release.

## Release QA
- `tests/n5-path-v145.test.mjs` verifies 25 entries, 5 stages, only two linked samples, original course fallback, non-fabricated skill/exam data, keyboard-scroll actions and mobile CSS.
- `.github/workflows/pages.yml` enforces JavaScript syntax and regression tests, publishes `release.json`, then fetches the actual GitHub Pages JS/CSS and verifies the deployed version.
- v1.45 initial release was independently verified on GitHub Pages workflow #1044.

## External references
- 3A Corporation: https://www.3anet.co.jp/en/minnanonihongo_dai3pan.html
- 3A Corporation teaching structure: https://plus.3anet.co.jp/mnc/touser_en/
- Official JLPT N5 sections: https://www.jlpt.jp/e/guideline/testsections.html
