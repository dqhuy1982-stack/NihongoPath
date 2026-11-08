# HORIZON · N5 Bài 01 · Gold Lesson Standard v1.48
**Date:** 2026-11-08 | **Branch:** `develop` | **Status:** implementation spec + Lesson 01 QA contract  
**Demo route:** `#course/N5/lesson/01`

## 1. Product decision — one coherent lesson, not many disconnected menus

**Main lesson navigation (4 items):** Học / Luyện / Kiểm tra / Ôn lại.

**Học** opens one guided scenario workspace. Six scenes are presented as a compact rail on desktop and a horizontal scroll rail on mobile. Do not expose separate full-screen navigation for every subsection.

One scene contains, in this order:
1. Situation goal and an original SVG illustration using the real fictional character IDs.
2. Place, time, participants, relationship, story context and pre-listening prompt.
3. Japanese conversation; selectable speaker chips open character profile; audio plays via supported device TTS. The user can reveal translations.
4. Only a few meaningful highlighted phrases. Click/tap opens the meaning, usage and common mistake. Desktop hover may offer a brief tip; keyboard focus and tap must also work.
5. Contextual vocabulary and grammar shortcuts into **Kiến thức & tra cứu**; one step returns to the scenario.
6. One guided response task and a short self-generated Japanese writing task with optional reference answer.
7. Extra optional substitution / reorder / change-role exercises in a collapsible panel.
8. A single primary “next scene” action.

The supporting reference contains vocabulary, grammar, reading and listening. Do not display all four large panels simultaneously.

## 2. Actual Lesson 01 scope

- Six **original** contextual scenes, preserving old scene IDs for historical records:
  `meeting`, `colleague`, `correcting`, `classmates`, `namecheck`, `identity`.
- Shared character identities from the canonical `NP_WORLD` catalogue; no second disconnected cast store.
- `n5-character-world-v148.js`: character profiles, original lightweight SVG drawings, HTML-safe note/highlight rendering, context metadata.
- 30 selected vocabulary items and 6 grammar explanations.
- Original reading in 3 sections; 3 listening dialogues delivered using browser Japanese TTS.
- Separate 16-question practice and 20-question check, plus review. Knowledge-check attempts are still distinct from the mini-exercises inside a scene.
- Six scene skill-drill entries, one or more substitutions and guided dialogue-ordering tasks per scene.

**Important distinctions:** viewing a scene is not completing it; a mini-drill attempt does not award the full Lesson 01 completion; passing the independent practice and check is required. Audio playback-start is evidence of attempting to play, **not evidence that listening comprehension or pronunciation was objectively validated**.

## 3. Data contracts / reuse for Lesson 02–25

Existing compatible schema remains stable:
- `NP_WORLD.characters[]` and `NP_WORLD.organizations[]` are the canonical fictional universe.
- `NPN5Lesson01Scenes.scenes[]` implements:
  `id,title,jpTitle,place,time,relationship,situation,goal,hint,purpose,dialogue[{who,jp,vi}],grammar[],vocab[],tip,challenge,compose,replace,variation`.
- `NPN5Lesson01Data` implements:
  `id,lessonNumber,objectives,vocab[],grammar[],reading,listening[],practice[],exam[],threshold`.
- Future generic model should map `lessonId`, `editionAlignment`, `sceneIds`, `vocabIds`, `grammarIds`, `skillTags`, `questionPool`, `reviewPolicy` without copying a 40k-line independent controller for every lesson.
- Preserve ID stability for scene, character, content and question. On content corrections use `contentVersion` rather than silently changing historical results.
- Store results by authenticated profile ID; do not reset prior user attempts during schema upgrade.

## 4. Interaction & accessibility requirements

- The illustration must be useful but compact: wide aspect ratio on PC, responsive mobile, no page-length hero.
- Character popup: role=dialog, title association, keyboard focus, Escape, focus trap, close button, overlay click, focus return. Closing must not clear an in-progress exam.
- Highlighted phrase: not color-only; underlined/tappable button; accessible help text and usage warning; no always-on giant tooltip.
- State should survive render/scroll within a scene; navigation between scenes should not automatically mark any skill passed.
- Japanese text has `lang=ja`, Vietnamese translations are distinguishable and optional.
- Avoid copying proprietary book illustration, publisher's dialogues, recordings, exercise layout or watermarked assets. All published illustrations and dialogues here are original or code-generated.

## 5. Lesson acceptance / definition of done

1. Every one of six scenes has valid `place`, `time`, `relationship`, `goal`, ≥3 meaningful lines, linked canonical characters and nonempty vocabulary/grammar IDs.
2. Each scene illustration loads from a local standalone SVG data URI. Character artwork stays visually consistent across scenes; image alt includes context.
3. Every speaker chip opens their actual character data; no invented biographies or mismatched identity.
4. Highlighted expressions provide concise meaning, appropriate usage and common mistake; working via click and keyboard, not hover only.
5. Guided reply, substitution and reordered-dialogue practice work; self-composed answer remains learner-owned and is not auto-graded incorrectly.
6. Completion remains a separately verified lesson-level state. Attempts are append-only and four learners are isolated.
7. PC + iPhone interaction QA: responsive visual, sticky navigation, popup, TTS handling, lesson-route hard refresh, back/forward, reduce-motion and focus.
8. GitHub Actions must pass all JS tests and verify actual public Pages HTML/script assets and commit SHA before declaring shipped.

## 6. Risks / technical debts to handle before multiplying content

- Japanese speech currently uses browser TTS; it is not native-recorded audio, and playback-start alone cannot prove audio was heard. Add an explicit listening check/answer based on unseen clips and provide a failure-safe.
- Original scene illustrations are automatically assembled SVG vectors. They are not the original 3A publisher images; full editorial polish, pose diversity and illustration review on real devices remain important.
- Reordering exercise uses pre-authored first three lines, not an adaptive dialogue generator. A reusable per-scene order ID array is a future improvement.
- Writing is intentionally not auto-marked. Later AI/open-answer scoring requires reliable Japanese language review, user consent and a safe offline fallback.
- The main reading/listening data in Lesson 01 currently has original examples but is not exhaustively mapped to specific 2nd/3rd edition vocabulary. Content editions must be identified first.

## 7. Future Lesson 02 blueprint (proposal, **not published lesson content**)

**Tentative lesson focus:** `これ・それ・あれ`; `この・その・あの + noun`; `そうです / そうじゃありません`, ownership `だれの`, and `何` questions. Confirm the **exact chosen Minna edition's** syllabus and glossary before marking this as publisher-aligned. 3A notes that 2nd and 3rd editions have almost the same grammar syllabus but different new vocabulary.

Suggested six linked scenes:
- S1: Reception — identify whose notebook/ID is on a counter.
- S2: Classroom — differentiate an object near speaker vs listener vs far from both.
- S3: Office — ask whether a pen belongs to a colleague, and politely correct ownership.
- S4: Lost property — explain who owns an umbrella and who should receive it.
- S5: Bookshop — point to a specific object using `この・その・あの` and compare with `これ・それ・あれ`.
- S6: Everyday practical encounter — locate a document for the right person through chained question-and-answer.

Re-use at least three familiar fictional characters from Bài 01, plus at most one new character. Give each scene new dialogue, a visual location, communicative objective, 1–2 key expressions, comprehension check, substitution, role variation, short reading and audio objective.

**Do not build or unlock Lesson 02 yet.** Its text/audio/question banks must be independently authored, reviewed for grammar/cultural accuracy, and verified against the selected 2nd or 3rd edition. The existing prototype `n5-demonstratives` is not automatically the same as a complete Minna Lesson 02.

## 8. Publisher references

- 3A Corporation confirms the 3rd edition maintains almost the same grammar syllabus while changing new vocabulary: https://www.3anet.co.jp/en/minnanonihongo_dai3pan.html
- 3A Corporation's guide recommends pairing the Japanese main book with Translation & Grammar Notes: https://www.3anet.co.jp/en/faq.html
- Official 2026 catalogue: https://www.3anet.co.jp/en/catalogue.html

## 9. Release evidence

`tests/n5-character-world-v148.test.mjs` validates scene identity integrity, six illustrations, character profiles, notes, mini-practice behavior and script order. Existing regression suites validate Lesson 01 and Foundation. Actual GitHub Actions workflow link and status should be recorded after release, not assumed from code commits.
