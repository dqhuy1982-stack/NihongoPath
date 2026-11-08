# HORIZON v1.43 — Release handoff: visible version & Foundation completion

Date: 2026-11-08
Branch: develop
Scope: Source web UI + local-progress reader. No backend/database migration.

## Issue 1: UI version remained at 1.41
- v1.42 had been committed to develop, but GitHub Pages publication was not independently verified.
- Existing Foundation regression tests still expected old score screen wording and actions, which conflicted with the updated v1.42 UI. Updated those assertions.
- Bumped visible version badge to v1.43.
- Busted cache for app.js, foundation-course-v33.js, learning-hub-v25.js.
- Added progress-v143.css after result-v142.css.
- Deployment uses .github/workflows/pages.yml on pushes to develop; success must be confirmed in GitHub Actions. Do not assume a successful public release only from a commit.

## Issue 2: earned 85%+ results not reflected as lesson completion
- Retain published HORIZON score threshold of 80% (85%+ satisfies this).
- Completed lesson = at least one >=80% practice run AND >=80% mixed test run in the same lesson scope. An incomplete or low-scoring run cannot substitute.
- Previously stored 'both' script values for single-script Hiragana or Katakana are reconciled with native 'hira' and 'kata' when reading history. No stored data is rewritten.
- Legacy subgroup attempts can fulfill a larger lesson only when every subgroup has passing practice and passing mixed-test evidence; a single subgroup cannot complete the larger lesson.
- Foundation catalogue now displays 'Luyện đạt · còn kiểm tra', 'Kiểm tra đạt · còn luyện', '✓ Hoàn thành', with colored score tiers and session history.
- Successful practice results prioritize 'Kiểm tra để hoàn thành'; completed results prioritize next lesson or next module; the final fully-complete Foundation stage points to N5.
- On module 'all' scope, completed mixed practice is not falsely treated as completion of every constituent lesson. Overall practice achievement is shown separately on the chapter tab.
- Retakes remain possible, and status checks are re-derived from saved per-learner attemptRuns.

## Validation
- JavaScript parse checks for foundation-course-v33.js and learning-hub-v25.js passed.
- Runtime smoke test in isolated JS with actual curriculum and engine:
  - 90% practice with historical script=both -> practicePassed=true
  - 87% mixed test with script=hira -> complete=true
  - 90% practice outcome prompts 'Kiểm tra để hoàn thành'
  - Subsequent passing check prompts the next unit route
  - Foundation catalogue shows 1/17 lessons complete, a visible check, and next link
- Added regression checks for script aliases, subgroup coverage, versioned entrypoints and next-action behavior.
- Full GitHub Actions run outcome / external Pages deployment / iPhone visual QA have not been verified here.

## Check before declaring shipped
1. Open GitHub > Actions > Nihongo Path — GitHub Pages, confirm latest develop run has a green successful deploy.
2. Open published Pages demo, hard refresh; verify HORIZON v1.43 beside logo.
3. Verify 90% practice => pending test, 87% check => ✓ completion and next-lesson CTA.
4. Repeat on mobile and on a separate learner profile, ensuring progress does not bleed across profiles.

## Changed files
- source/public/foundation-course-v33.js
- source/public/learning-hub-v25.js
- source/public/progress-v143.css (new)
- source/public/index.html
- source/public/app.js
- tests/foundation-course-v33.test.mjs
