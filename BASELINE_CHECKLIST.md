# Baseline regression checklist

Baseline audited 1 November 2026 (Asia/Tokyo). Site v15, commit `6e70f8eb5fdd7dd7737d37e3a23f600928e883b7`.
Site: https://nihongo-path-flow-review.aceticlotus.chatgpt.site
Project: `appgprj_6ae5d9599a0c819181446dd84e6553a9`.
This is an export for continued development of the same product. No Site publishing, access changes, live-data export or database migration was performed by this handoff task.

A checkbox is a required integration check, not a claim it was newly tested during export.

## Source and deployment boundary
- [ ] Continue same Site/project ID; compare current upstream HEAD with pinned v15 commit before integration.
- [ ] Preserve private access, authentication gateway, DB binding and existing applied migration history.
- [ ] Do not upload personal redactions, sample IDs/icons, generated fixtures or local runtime DB over originals.
- [ ] Do not replace the project wholesale with this sanitized export or generated standalone HTML.

## Layout and access
- [ ] Preserve Atelier type/color/spacing/illustrations/themes and five main destinations.
- [ ] PC/sidebar, tablet and phone/bottom-nav match upstream; no horizontal overflow.
- [ ] Avatar dialog focus, keyboard and scroll remain usable.
- [ ] Unsupported modules retain honest prototype/development messaging.

## Learning and data
- [ ] Existing learner IDs and all historical results survive unchanged.
- [ ] Foundation/N5 start, choose, hint, check, repair, personal practice, save-note, summary and review work.
- [ ] Reload preserves checkpoint/answer/feedback; second device sees saved progress both directions.
- [ ] Retry cannot create duplicate attempt/practice; stale device cannot overwrite silently.
- [ ] Separate profile and separate account access checks still pass.
- [ ] Notebook/report/review correspond to the same learner; writing does not inflate correctness.
- [ ] Token add/remove and answer selection do not jump viewport; phone action bar is reachable.

## Kana Writing Studio
- [ ] 46 Hiragana + 46 Katakana; 212 ordered groups; original SVG checksums and notices retained.
- [ ] Select glyph/script, numbered stroke, start marker, moving marker and ordered playback correct.
- [ ] Play/pause/continue, previous/next/replay, 0.5/1/1.5 speed; no autoplay on entry.
- [ ] Pointer drawing/undo/clear/draft save/reload work with normalized points and high-density canvas.
- [ ] Taps/cancelled gestures cannot count as meaningful writing; confirmation remains ungraded.
- [ ] Glyph/profile drafts separate; profile switch flushes changes; failure/conflict preserves recoverable draft.
- [ ] Phone Choose/Watch/Write steps reveal correct panel and keep usable canvas/control space.
- [ ] Physical iPhone Safari check plus portrait/landscape, touch/pen/mouse and reduced motion reviewed.

## Verification already observed on this export
- 66/66 Node tests and 3/3 Python SQLite fixture tests passed (logs included).
- pnpm install succeeded; bounded managed-Linux production build completed both `/` and API routes.
- Built Worker executed locally with emulated D1. HTTP root/script/font 200; no identity bootstrap 401; synthetic-owner bootstrap/setup/state/Kana 200/201; another owner reading sample learner 404.
- This did not validate real ChatGPT OAuth outside Sites or new physical iPhone behavior. Earlier user-reported acceptance in conversation is historical, not a fresh export check.
