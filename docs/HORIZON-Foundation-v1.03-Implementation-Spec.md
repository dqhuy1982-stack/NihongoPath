# HORIZON Foundation v1.03 — Learning Book and Contextual Feedback

Baseline: v1.02 (develop). No changes to database contracts or original learning progress. Release label: v1.03.

## UX decisions
- No nested scrollbars in the learning book. The whole document scrolls naturally. Exercise index is grouped by learning objective.
- Desktop: two-column index and exercise; exercise panel uses viewport sticky positioning when it fits. On mobile: index and content stack in natural document flow.
- Remove all pseudo/connector lanes; selection is indicated with strong active styling. Avoid artificial line joins which misalign when the index or exercise grows.
- Matching must display two equal, independently shuffled columns in the SAME grid row; its SVG connection lines are absolutely positioned and do not occupy a grid cell.
- Both Kana and Romaji must be visible, even at medium desktop widths; narrow layouts preserve labels and support tap matching.

## Feedback teaching
- After answering, automatically reveal “Hiểu thêm & nhớ lâu”: accurate character and reading, original curriculum teaching note, comparison with items in the same group, and examples drawn only from the existing verified word bank.
- Show up to three relevant examples, each independently playable. No invented etymology, invented mnemonic or unseen translation.
- For matching, display the most recently correctly paired character and related examples without interrupting pairing.
- Feedback and word examples use the already implemented recorded-audio-first strategy, with Japanese device voice for uncovered strings.
- The extra cards are contextual; not an unrelated permanent sidebar.

## Acceptance
- No nested overflow-y scroll in desktop book, even with the last menu item active.
- Matching shows 6 Kana and 6 matching Romaji, both columns side by side, independent shuffle and visible SVG connections.
- Explanation appears only after response or a successfully matched pair. Context examples grounded in existing curriculum data.
- Responsive with normal document scrolling. No spinner, blocking modal or other navigational interruption.
- Existing recorded results preserved per learner, with no schema migration.
