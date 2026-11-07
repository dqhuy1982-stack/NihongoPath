# HORIZON Foundation v1.05 — Kana Matching Implementation Spec

**Status:** implementation-ready specification; not a claim of deployed functionality.  
**Baseline:** current Foundation demo on `develop`; preserve learner progress and existing learning flows.  
**Focus:** fully working Kana ↔ Romaji / Listen ↔ Kana matching with randomization for **both Hiragana and Katakana**.

## 1. Learner experience

- Enter **Luyện tập → Ghép chữ & âm** or **Game → Ghép cặp Kana**.
- Choose a compact script filter: **Hiragana | Katakana | Cả hai**. Default to **Cả hai**, subject to selected Foundation module/content the learner has unlocked.
- Each round presents **6 pairs** where content permits; otherwise use the available eligible pairs and display their actual count. Never display empty targets.
- Show **two fully visible columns**, labelled **KANA** and **ROMAJI**, each with six independent, shuffled positions, and a clear central SVG connector region.
- On **Cả hai**, balance script selection where possible (e.g. three Hiragana + three Katakana per 6-pair round). When a reading appears in both scripts, distinguish Romaji targets with a small **Hira/Kata** label (or avoid duplicate readings in that round); the learner must never face two indistinguishable correct answers.
- A new round changes **both items and both column orders**, independently of the previous round. Do not rely on simply reordering a fixed set of six.
- Include an obvious **Ván mới / Trộn lại** action. “Trộn lại” must not clear already recorded progress.

## 2. Source data and correct pairing

- Derive pairs from the existing verified Kana curriculum, not hardcoded or invented syllables.
- Stable identity: `item.id`, `script` (`hira`/`kata`), `glyph`, `read`, `stage`, and audio source.
- Generate a single round array, then independently shuffle `left` and `right` **views of that same array**.
- Match by **pair ID**, not by list index or Romaji string alone.
- Filter by unlocked or selected stage (basic, voiced/semi-voiced, yōon, small kana, long vowels); pronunciations that cannot be meaningfully heard in isolation should be handled with contextual words.
- Reject ambiguous duplicate labels/readings in the rendered round; test cardinality and ID uniqueness before rendering.

## 3. Visual behavior and input

- Display Kana left and Romaji right at all desktop/tablet/mobile widths. Do not allow either column to be hidden by legacy CSS Grid classes or SVG.
- Keep SVG as `position:absolute` overlay **outside normal layout flow**, behind tappable tiles; use `getBoundingClientRect()` to connect actual endpoints. Recalculate after render, resize, scroll and font/layout changes.
- Both pointer tap/click and keyboard selection work; drag gesture may be optional, not required.
- Selected item: subtle brand highlight and visible selection state.
- **Correct match:** persistent green curved line; both tiles become green-tinted with ✓; lock pair and update `n / total`; optionally play the Kana answer and show concise context below.
- **Wrong match:** temporary red curved line (approximately 900 ms), both tiles show ×/red briefly; clear selection and red line, without locking either tile. Ensure rapid subsequent clicks cannot race with delayed reset.
- In reduced-motion mode, do not animate the lines. Use icons and labels in addition to color.
- Line rendering must remain accurate after selecting lower menu items; **no nested scrollbar** in workbook.

## 4. Feedback and learning science

- Following a correct match, display concise **Hiểu thêm & nhớ lâu** derived from existing trusted curriculum: glyph, reading, script, grouping, and optionally a verified contextual word with Japanese audio.
- After a wrong match, offer helpful feedback **without immediately revealing another pair's answer**. The learner can try again.
- **Luyện tập / Game** are untimed. They may record wrong attempts and repetitions but must not grade a response as “slow.”
- Keep results separate by profile and script; retain existing recorded results and database contracts.
- Randomize without repeatedly favoring an identical last-round order, using a bounded retry if content supports variation. No guarantee of a unique round when eligible data is insufficient.

## 5. UI and responsive details

- Use the existing HORIZON muted color system; avoid thick, decorative connector borders between sidebar and answer panel.
- Normal document scrolling only. On PC, compact menu and answer layout should keep work visible where possible; on mobile, two columns remain visible with smaller tiles and an adequate gap for lines.
- Include button labels and accessible spoken names, e.g. “Kana し, chưa ghép” and “Romaji shi, Hiragana, chưa ghép”; announce correct/wrong feedback via `aria-live`.
- Always present an explicit round count and a **Ván mới** button once finished.

## 6. Acceptance checks (must pass before marking live)

1. Hiragana-only: 6 Kana tiles + 6 **visible Romaji** tiles and no duplicate IDs.
2. Katakana-only: same, including Katakana audio and glyphs.
3. Mixed: 6 paired items, balanced where available, **no ambiguous duplicate Romaji targets**.
4. Correct pairing produces persistent **green** line, ✓ indicators and `1/6` progression.
5. Wrong pairing produces a **red** line/× for roughly 900 ms, then resets; count unchanged.
6. Each new round shuffles both columns and may choose different items; retains previous learner history.
7. Active tab at bottom, page scrolling, window resize, narrow PC and iPhone do not hide Romaji or misalign SVG connectors.
8. All links to answer audio work from direct user interaction; no unexpected autoplay.
9. Automated tests + actual browser visual review on desktop and iPhone must pass before announcing deployment.
10. Bump public footer version to **v1.05 only when the implementation is actually published**.

## 7. Scope boundary

This spec does **not** authorize unrelated site redesign, language refactoring, migrations, or resetting user data. Preserve the working Learning Hub baseline on `develop`.
