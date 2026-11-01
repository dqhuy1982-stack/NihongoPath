# Practice-content contract

Current content is five authored sample sets, two questions each. These are prototype illustrations of the selected language targets, not official JLPT questions, full mock tests or validated diagnostic instruments. Audio has not been supplied.

Each future released set needs:

- Stable set ID and immutable content version.
- Target level and skill per question, with an editorial review record.
- Stable question IDs; source, usage rights, question text, choices, correct answer and explanation.
- A link to a real related lesson or review activity. Do not create a dead link for an unreleased lesson.
- Audio references and transcripts only when actual audio is available and cleared for use.
- Confirmed structure and timing before enabling full mock-test mode.
- Clear draft/reviewed/released status. Uploaded material is not automatically published.

The current bank is `dist/study-data.js`; the interface and browser-local session/result logic are in `dist/study.js`. Completed attempts retain their sample definition and content version so future source edits do not silently reinterpret that result. Production should use immutable content versions rather than copying large assets into attempts.

Practice sessions are keyed by learner and target level. Changing the browsing level does not overwrite unfinished sessions at another level. Results retain selected answers; a correct answer on a later attempt does not rewrite an earlier attempt.

The assistant uses the latest unfinished activity, review evidence and selected goal. It does not establish JLPT proficiency, rank family members or predict pass/fail. No official scaled score is computed from raw sample counts.

Future uploads need an ingestion and review workflow. The current prototype has no upload parser, backend content store or automatic publication service.
