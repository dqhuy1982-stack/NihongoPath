# Atelier 09 QA — 01 November 2026

- `python scripts/build-demo.py`: SQLite generated; integrity check `ok`, foreign
  key check empty. Seed and SQL generated from the same fictional source.
- `node --test tests/demo-engine.test.cjs`: 11 passing behavioral tests.
- `node --check`: both simulation JavaScript files parse successfully.
- Browser: all five simulation routes at iframe viewport widths 360, 768 and
  1366px, 15 default-state checks: no horizontal overflow. Not a full accessibility
  certification. The existing dark theme was observed; light theme was used for
  the comparison image.
- Keyboard answer selection retains button focus. Checking moves focus to Next.
- Wrong answer locks, shows Vietnamese explanation and the trial review date.
- Reload at feedback retains the selected answer and does not create another
  answer. Next opens the correct following question.
- A first-time Foundation learner completed a two-question segment, received
  `2/2`, and retained the third lesson question for a future session.
- Changing fictional profiles/scenarios updates the learner and plan. Controls
  retain focus and open state while their selections change.
- Mobile primary Start is fixed above bottom navigation (top 601px / bottom 674px
  in a 740px-high viewport), without covering the nav. Environment controls were
  subsequently collapsed by default to reduce reading before the advice card.
- The final collapsed mobile controls and advice were inspected in the DOM.
- Browser download-event waiting timed out for SQLite; this did not establish
  whether the download completed. The actual SQLite artifact was independently
  verified locally and is available as a direct workspace deliverable. A later
  optional clipped mobile screenshot timed out; no nonexistent image is linked.
- `docs/screenshots/nihongo-demo-compare-atelier09-20261101.jpg` records the
  side-by-side comparison with the environment controls expanded. The model on
  the left is labelled as a reproduction of the selection rule, not an original
  full-page screenshot.

Runtime simulation state is browser-local and isolated from existing profiles.
This QA does not claim production authentication, server authorization,
cross-device sync, a validated SRS algorithm, or a complete JLPT curriculum.
