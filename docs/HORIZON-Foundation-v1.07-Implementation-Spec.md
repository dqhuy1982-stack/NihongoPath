# HORIZON Foundation v1.07 — Round Completion & Learning Feedback
**Status:** Implemented on `develop` and published to GitHub Pages; automated Learning QA and Pages build/deploy passed. Visual acceptance on end-user PC/iPhone remains pending.  
**Baseline:** HORIZON Foundation v1.06 on `develop`. Preserve working features, learner profiles and historical progress.  
**Primary scope:** Ghép chữ & âm (`match`), Nghe & ghép (`listen-match`); reusable later for `game` / `game-listen`, but no unrelated UI changes.

## 1. Teaching and product principles

1. **Completing 6/6 pairs ≠ 100% first-attempt accuracy.** Every correct pair finishes eventually, even after wrong attempts. Show both *pairs completed* and *first-try accuracy* explicitly.
2. Practice remains **untimed**: elapsed-time tracking is observational feedback, not a countdown, deadline, pass/fail criterion or JLPT scoring rule.
3. Feedback must be derived from **actual round evidence**, never fictitious weakness, slow score, historical improvement or repeated listening. If data is missing, display “Chưa ghi nhận” rather than zero.
4. Personalized recommendations must be transparent: why a suggestion appears, which pair(s) triggered it, what action follows. No medical/cognitive claims or inferred learning disability.
5. Celebrate completion without implying mastery. Keep animation respectful, brief, optional and disabled under `prefers-reduced-motion`.

## 2. Launch and modal behavior

- When the final pair is correctly matched, finalize round **exactly once**, freeze metrics, persist round summary, then open one accessible completion modal.
- Soft celebratory illustration: restrained original HORIZON flower petals/sparkle (no cartoon fireworks or heavy particle load); animation <= 1.5 seconds, only for strong results. Respect seasonal theme and reduced-motion settings; no audio surprise.
- Desktop: max width ~800px, two balanced content columns with a fixed action row, height capped at viewport with scroll **only within the modal if genuinely unavoidable**. Mobile: one column and a visible action row; keep metrics prioritized over decoration.
- Keyboard: focus inside on open, restore focus on close. `Escape` closes. Never make Enter a global shortcut to start a new round while focus is on another button; default button Enter works normally.
- “Đóng” returns to the completed board, with an unobtrusive **Xem lại kết quả** action. Reopen does not re-persist or duplicate completion.
- Navigating away, changing learner profile or starting a new round must cancel any pending timeouts/animations and never mix round data.

## 3. Actual metrics and exact definitions

**Round state** created upon entering exercise or tapping “Ván mới”, with a fresh `roundId`. Times use monotonic `performance.now()` where available. Keep ISO wall-clock start/end for records.

| Field | Meaning and computation |
|---|---|
| `totalPairs` | Actual number of eligible unique pairs, normally 6. |
| `completedPairs` | Number of unique correct pairs matched; final state `totalPairs / totalPairs`. |
| `wrongAttempts` | Count of incorrect attempted left–right pairings, **not number of wrong Kana**. |
| `firstTryPairs` | Number of pairs completed before any wrong attempt involving that pair. |
| `firstTryAccuracy` | `firstTryPairs / totalPairs × 100` (rounded). Do **not** label `completedPairs / totalPairs` “accuracy”. |
| `attemptAccuracy` | Optional secondary metric: `correctPairings / (correctPairings + wrongAttempts) × 100`. Show label “Tỷ lệ ghép đúng theo lượt thử” if used. |
| `totalElapsedMs` | Active time between round start and final correct pairing, excluding long page-hidden intervals if pause is implemented; indicate policy. No time penalty. |
| `pairElapsedMs` | For each pair, cumulative elapsed active time from first selection of **that pair** until its correct match. If tracking this precisely is not possible, label fallback `stepElapsedMs` (“Thời gian chặng”), not “thời gian nhận diện chữ”. |
| `averagePairMs` | Mean of recorded `pairElapsedMs`, not simply total duration / 6 if pair decisions overlap. |
| `fastest/slowest` | Min/max of actual recorded pair durations, available only if all relevant timings exist. |
| `audioReplays` | Number of user-triggered presses to listen to a prompt, tracked for `listen-match`; **exclude** automatic answer playback and changes to global audio preference. |
| `perPairWrongCount` | Number of wrong attempts associated with an item (record selected IDs on both sides separately). |
| `assisted` | Whether hints/assistance were used, if supported. Not proof of independent recall. |

Example: 6 completed, 1 wrong pairing, 5 first-try pairs => **5/6 = 83% first-try accuracy**, while **attempt accuracy = 6/7 = 86%**. These are different measures; never display 6/6 as 100% accuracy.

### Per-pair telemetry and sample structure
```ts
type PairAttempt = {
  leftId: string; rightId: string; correct: boolean;
  elapsedMsFromRoundStart: number;
};
type PairResult = {
  itemId: string; script: 'hira' | 'kata'; glyph: string; romaji: string;
  firstSelectionAtMs: number | null;
  completedAtMs: number | null;
  pairElapsedMs: number | null;
  wrongAttempts: number;
  audioReplays: number | null;
};
type RoundResult = {
  schemaVersion: 1; roundId: string; learnerProfileId: string;
  mode: 'match' | 'listen-match';
  script: 'hira' | 'kata' | 'both';
  moduleId: string; startedAt: string; endedAt: string;
  totalElapsedMs: number | null;
  pairResults: PairResult[]; attempts: PairAttempt[];
  firstTryPairs: number; wrongAttempts: number; totalPairs: number;
};
```

## 4. Completion modal content

1. **Celebration heading:** factual, tailored to result (“Hoàn thành ván ghép!”, “Bạn đã ghép đúng cả 6 cặp.”) with subtle icon and a short line encouraging the learner.
2. **Four primary metrics:** `6/6 cặp hoàn thành`, `5/6 đúng ngay lần đầu`, `1 lượt ghép sai`, `Tổng thời gian 42,8 giây` (illustrative values only).
3. **Secondary details:** first-try rate with explicit label; pair time median/average only when measured; listening replays when applicable.
4. **Learning observations:** 1 strength grounded in observed first-try matches, 1 actionable review suggestion grounded in actual mistakes or listening replays. If all first try and no replay, encourage spaced review rather than inventing weaknesses.
5. **“Cặp cần ôn”**: actual Kana/Romaji pairs with reason **Ghép sai**, **Nghe lại nhiều** or **Cần luyện thêm**. A high time alone is a *practice suggestion* only, and must not automatically be treated as a scored wrong answer.
6. **Expandable “Chi tiết từng cặp”**: glyph, reading, script, correct pairing, number of wrong attempts, pair time (if available), replay count (listening only). Never present each pair as exactly one “câu sai” in a many-attempt matching activity.
7. **Actions:** primary **Luyện lại cặp cần ôn** only when review items exist, otherwise **Ván mới**. Secondary **Ván mới**, **Chuyển sang Nghe & ghép / Kiểm tra tổng hợp** depending on current mode and content availability, plus **Đóng**. No dead buttons.

### Example copy — non-perfect round
- Heading: **Hoàn thành ván ghép!**
- Message: “Bạn đã nối đủ 6 cặp. Có 5 cặp đúng ngay lần đầu và 1 lượt ghép chưa đúng.”
- Insight: “Hãy ôn lại る (ru): bạn đã chọn nhầm một lần trong ván này.”
- Recommendation: “Luyện lại cặp đã nhầm trước, sau đó thử ván mới với thứ tự khác.”

### Example copy — first-try clean round
- Heading: **Một ván thật gọn!**
- Message: “Bạn hoàn thành cả 6 cặp ngay lần ghép đầu tiên. Hãy thử một ván khác để củng cố.”
- Recommendation: “Một ván đúng chưa đủ kết luận đã nhớ lâu. Hãy ôn lại sau một khoảng nghỉ.”

## 5. Recommendation rules (transparent and conservative)

- `wrongAttempts > 0`: prioritize IDs involved in wrong attempted pairs for review. A wrong pairing can implicate **both** selected items; do not invent which one the learner mentally confused.
- Listening: a high **manual replay count** can justify “nghe thêm” but only if actually counted; show count, no universal “too many” assumption.
- Time: display measured durations; thresholds for fast/slow are **optional configurable heuristics** and must not be used to declare mastery.
- Compare with earlier rounds **only when same learner, script/stage and matching mode have recorded, compatible data**. Otherwise avoid “tiến bộ x%”.
- `reviewPairs` deduplicated by stable `itemId`; prioritize wrong attempts, then optional repeated listening, then review due from current learner's store.
- On `Luyện lại cặp cần ôn`, use the flagged subset plus distractors only as needed to make a meaningful round; indicate actual number of pairs. Do not silently add unrelated hard items.

## 6. Integration with existing Foundation code

Current `ensurePlay()` matching sessions have `cards`, independently shuffled `left/right`, `matched`, `mistakes`, and currently `startedAt:null`. The matching handler already invokes `record(item, ok, kind, null)` **per pair attempt** and shows the board's post-completion action.

Implementation tasks:
- Initialize isolated `roundId`, measured start, per-pair attempt log and listening replay counters in matching session creation. Never use the quiz clock as a countdown.
- Capture per-attempt data before resetting `leftId/rightId`. Distinguish first-try correct from a successful retry. Capture audio prompt presses only in listening mode.
- On final correct match: calculate metrics from **this round**, not global `store().history`; finalize once and invoke modal renderer. Persist a bounded per-learner round-results collection (versioned additive key, no existing data migrations or resets).
- Existing `record()` semantics are item-level and must not be treated as an exact per-round report. Reconcile duplicate item records from wrong pairings and avoid awarding independent mastery for assisted/ambiguous attempts.
- Reuse existing audio preference for automatic feedback only. Do not play a celebratory sound by default.
- Keep per-profile isolation, routing, refresh behavior and responsive Foundation book layout intact.

## 7. QA / release gates

- 6/6 completion opens modal **exactly once**, both `match` and `listen-match`; close/reopen does not duplicate history.
- 1 wrong attempt followed by 6 correct pairs: completed 6/6, first-try 5/6 (assuming only one pair affected as defined), wrong attempts 1; no false 100% accuracy.
- Timings recorded using measured intervals, never fabricated. Background-tab pause behavior documented and tested.
- Audio replay tracked only for manual prompt replays, separately from auto-answer audio.
- Review action shows genuinely weak pairs, not an invented set; new round reshuffles Kana and Romaji independently; mixed Hira/Kata remains unambiguous.
- Modal is scrollable only as needed, keyboard focus trapped, Escape works, focus restored, controls operable on iPhone Safari and desktop.
- Reduced-motion/seasonal-theme accessibility, narrow viewport and long Japanese text tested.
- Existing practice routes, completion, profile separation and cumulative progress regressions pass.
- Version footer increments **v1.06 → v1.07 only after the implementation itself is deployed and verified**.

## 8. Recommended implementation order

1. Add valid telemetry and unit tests for round statistics/first-try correctness; define replay and time semantics.
2. Add idempotent completion state and storage.
3. Build modal layout with real sample states (perfect, one wrong, several wrong, listening with/without replay).
4. Implement actionable review/new round/next mode transitions.
5. Add restrained celebration and accessibility polish.
6. Cross-browser visual QA and deploy the demo; only then bump public release label.

**Explicit non-goals for this phase:** database backend or schema migration, JLPT scoring claims, mandatory speed grading, user data reset, overhaul of Foundation course hierarchy.

## Release record (v1.07)

- UI code: `source/public/foundation-course-v33.js` (round attempt data, first-try metrics, listening replay tracking, completion modal, weak-pair review, and navigation).
- Styles: `source/public/foundation-course-v107.css` (responsive dialog and reduced-motion behavior).
- Asset references: `source/public/index.html` with `foundation-course-v33.js?v=107`, `foundation-course-v107.css?v=107` and `app.js?v=107`.
- Wordmark: `source/public/app.js` displays `v1.07` beside HORIZON logo.
- Automated regression: `tests/foundation-course-v33.test.mjs` exercises clean/wrong rounds, replay counts, report details, review selection and idempotent completion.
- Note: UI is a browser-local prototype, not a database-backed analytics release. Any prior practice records remain unchanged.
