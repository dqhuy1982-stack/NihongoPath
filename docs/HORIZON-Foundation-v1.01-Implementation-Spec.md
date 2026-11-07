# HORIZON Foundation — v1.01 Implementation Spec
Status: Demo implementation · Baseline: v1.00 on `develop`
Scope: Foundation learning UI (Hiragana, Katakana, voiced/combined sounds, small kana), no database migration.

## Learner journeys
1. **Learn:** tap the Kana card to hear it.
2. **Flashcards:** recall first, flip for reading/audio; self-rated recall is not treated as independent mastery.
3. **Practice:** compact book-style contents on the left and a working exercise on the right. Untimed.
4. **Game:** sound/pair matching, word building. Untimed; mouse drag/drop optional and tap/keyboard selection remains usable.
5. **Mixed assessment:** preflight, timed questions, answer feedback and review suggestions.

## Layout acceptance
- Active entry shares a visually continuous, correctly aligned border with content, without pseudo-element overlap at any viewport size.
- No horizontal overflow/cropped Romaji column. Matching shows 2 clearly labeled columns at desktop and narrow mobile.
- Matching draws a line for selected and completed pairs; line coordinates recompute on resize and changing panels. Wrong attempts signal briefly but must not become permanent pairs.
- Active states are discernible without relying on color alone. Touch and keyboard must remain functional.

## Exercise interactions
- All Japanese-answer practice types provide a deterministic, user-triggered **Hear answer** action after answering (no unintended automatic audio that masks the exercise).
- Basic recorded Kana MP3s are prioritized. Other Japanese strings use device Japanese voice with explicit status when unavailable. For sokuon and long vowels, pronounce complete contextual words, not an isolated mark.
- Up to 3 pedagogical hints per question, progressively disclosed; hints aid retrieval without directly giving the correct multiple-choice answer. Hint use is recorded as assisted and should **not** count as unassisted mastery.
- Randomize test items, answer options, and left/right matching columns independently. Exclude ambiguous sound-to-symbol cases.
- Ensure word-building reorders character tiles and handles repeated glyphs.
- Contextual vocabulary is introduced only when its constituent Kana have been taught; never invent Japanese meanings or incorrect reading.
- Game and casual practice are untimed. Formal mixed assessment alone has a preflight and stopwatch.

## Data / analytics
- Per learner and item, retain correct/incorrect, slow when applicable, used hints, audio replay and review recommendation. Preserve existing saved profile data.
- Persist changes in existing local browser demo store without changing unrelated engine APIs or schema.
- Defer long-term mastery inference until spaced, independent recall over multiple sessions.

## QA acceptance
- Routes survive refresh; no overlay blocks action controls.
- Sample Kana–Romaji exercise renders both columns and connecting lines. Both click-to-select and optional drag-to-match work.
- All modes permit answer feedback sound; hints never score as independent mastery.
- No regressions to Learning Hub or N5. Responsive desktop, tablet, mobile.
- Increment public global UI label **v1.00 → v1.01**, separate from underlying module file names.
