# Question interaction correction — 01/11/2026

Reported on iPhone: choosing answers/tokens jumps the page; checking answers requires repeated scrolling.

The live adapter previously called the full app renderer after every `select`/`token` command. Replacing the document subtree could clamp the scroll position and discard focus. Moving tokens also changed the heights of the answer tray and token pool.

The shared `lesson-interaction.js` now updates selected/pressed states and moves existing token buttons in place after the authoritative state is saved. It keeps the revision and check-button availability current. Both the local demo and live server adapter use this helper. The token regions reserve sufficient height for the complete set at the current width/font, and focus returns without scrolling. Review/checkpoint/answer data formats and backend commands are unchanged.

On narrow phones, a body-level action dock holds Check/Next and optional Hint/Repair actions above the existing bottom navigation. The original question actions are hidden only while the dock is active, avoiding duplicate tab stops. The dock is outside the contained lesson reader so fixed positioning is relative to the viewport. Its bottom offset uses the actual navigation height, including the device safe area. Lesson padding protects the final content from overlap. The repeated marketing heading is suppressed during mobile questions, and option/token typography is reduced proportionally while retaining the learner's font-size preference.

Selecting choices or adding/removing tokens does not navigate or refocus the whole page. Explicit Check/Hint reveals feedback only when needed. Moving to a new question reveals its heading once.

## Browser QA

- Actual nested browser viewport: 390 × 844, running the existing local demo/player. No production login bypass, fake live responses or changes to real learner data.
- Native coordinate taps on a choice retained scroll position at 175 px before and after.
- Native taps adding and removing a sentence token retained scroll position at 293 px and board height at 286 px. Total token count remained four; removal restored the placeholder.
- Completing all four tokens enabled the dock Check control. Checking recorded the correct answer, locked all tokens and displayed the actual authored explanation.
- The dock bottom and navigation top both measured 778 px in the 844 px viewport. Check, Hint and subsequent Next were reachable without searching down the page.
- This is Chromium viewport validation, not a physical iPhone/Safari certification. The user's same in-progress lesson should be used for the final device check after publication.

The temporary isolated iframe QA page is removed before packaging.
