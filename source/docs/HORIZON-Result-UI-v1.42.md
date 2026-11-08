# HORIZON · Kết quả lượt luyện — UI refinement v1.42

Date: 2026-11-08  
Branch: `develop`  
Scope: Result panel for Kana practice and quiz (`summaryView` only)

## Problem reviewed

Old result panel spread information across a tall score hero, colored badge, saved-state pill, note, repeat/review actions, and a separate large next-scope recommendation. These competed visually and required scanning too many buttons.

## Changes

- Compact, responsive result panel: small heading/saved state, clear score and short contextual feedback.
- Keep 10/10 correct and grade percentage distinct; grade color is secondary and never the only indication.
- Keep green `Tốt` (90–100), amber `Đạt` (80–89), red `Chưa đạt` / practice coaching (below 80).
- One recommended action based on outcome. Good/pass: expand to the next available scope. Below threshold: first review errors.
- Smaller secondary `Luyện lại` and tertiary `Đổi phạm vi`; retain the existing scope attention animation.
- Show error review only when mistakes occurred. Tests retain slow, incorrect and average response-time metrics.
- Saved attempt count remains visible but no longer competes with score. Maintain disclaimer that a single attempt does not prove long-term recall.
- No edits to attempt persistence, history, 80% passing criterion, learner separation, route URLs or learning records.

## QA performed

- JavaScript syntax checks: `app.js`, `foundation-course-v33.js` passed.
- Markup smoke tests for 10/10 practice, 9/10 practice, 8/10 test, 7/10 practice and 4/10 test passed with stubbed data.
- Verified practice/test labels, scored tiers, saved-state label, suggested curriculum scope and review visibility in those cases.
- CSS includes mobile breakpoints at 800, 590 and 380 px and `prefers-reduced-motion`.
- Full in-browser QA and public deployment have not yet been independently verified.

## Files

- `source/public/foundation-course-v33.js`
- `source/public/result-v142.css` (new)
- `source/public/index.html`
- `source/public/app.js` (visible version badge)

## Future consistency

This refinement is limited to the Kana quiz/practice result view. Other game summaries still use their existing layouts and should be aligned in a subsequent consistency pass without changing their scoring or save behavior.
