# Data, ownership and API contract

Baseline audited 1 November 2026 (Asia/Tokyo). Site v15, commit `6e70f8eb5fdd7dd7737d37e3a23f600928e883b7`.
Site: https://nihongo-path-flow-review.aceticlotus.chatgpt.site
Project: `appgprj_6ae5d9599a0c819181446dd84e6553a9`.
This is an export for continued development of the same product. No Site publishing, access changes, live-data export or database migration was performed by this handoff task.

## Ownership
Trusted Site gateway supplies `oai-authenticated-user-id`; server scopes all collection reads/writes by that owner and learner ID. Email header is only display context. Avatars are parent-managed profiles, not independent accounts. Local demo labels/IDs are sanitized in this export and must not replace existing hosted IDs.

## API inventory (prefix `/api/pilot`)
| Method/path | Request / response |
|---|---|
| GET `/bootstrap` | identity display, profiles with serverRevision, states by learner, released catalog, mode `parent-managed-pilot` |
| POST `/setup` | profiles array, 1–12, unique bounded IDs; initializes empty states, first profile manager; refuses existing collection |
| POST `/learners` | profile object; requires initialized collection; adds learner and empty learning state |
| PUT `/learners/:id` | `revision`, `profile`; returns sanitized profile with incremented serverRevision |
| GET `/learners/:id/state` | canonical JSON learning state |
| POST `/learners/:id/state` | command envelope; canonical state, optional duplicate marker |
| GET `/learners/:id/kana` | Studio state, revision, selected glyph draft, practice aggregates |
| POST `/learners/:id/kana` | Studio command envelope; updated Studio snapshot |

Mutations require exact same-origin Origin header, JSON content type and bounded body (150000 text characters at boundary). Missing identity: 401; missing DB: 503; denied learner: 404; stale revision/payload-reused event: 409; validation: 400; origin: 403; content type: 415. Actual handlers are authoritative, including exact path/method behavior. Some unexpected exceptions are currently returned as generic 400; do not assume comprehensive HTTP error typing.

## Profile JSON
Stable `id`; name; goal in Nền tảng/N5/N4/N3/N2/N1; minutes 3–240; role manager/learner preserved on edits; purpose/color/days/deadline/course/onboarding/archive/preferredName; prefs theme, Japanese size, furigana, romaji, focus, motion, studyPriority; bounded shortcuts and notes; goalHistory and optional roadmapPlan assumptions. Reminders are forced false in live sanitizer. Name/goal are mutable metadata, never record keys. Child profile knowledge is shared with the owner by design; no per-child privacy claim.

## Learning commands
Envelope: `eventId`, integer `revision`, `action`, action-specific fields; optional expected session/unit checkpoint and bounded elapsedMs. Actions: start/resume/select/token/hint/check/next/pause/reading/personal. `start` selects a released contentId and lesson/practice/review, minutes 3/5/15; server owns content snapshots and progression. Retry identity is the event ID plus SHA-256 digest of JSON-serialized payload; retry the exact payload, without regenerating/reordering fields. Same event with changed payload conflicts. Revision guards and batched receipts/attempt projections prevent lost updates and duplicate evidence. Do not send fabricated client correctness as canonical state.

## Studio commands and vector format
Envelope: `eventId` matching `[a-zA-Z0-9_-]` length 1–90, revision, action. Actions select(char), speed(0.5/1/1.5), draft(char,strokes), confirm(char,strokes). Receipt keys are namespaced `kana:`. Character must be one of the 92 base glyphs. Each drawing has <=32 strokes; each stroke 1–256 points; points `[x,y]`, finite numbers in [0,1], rounded to four decimals. Confirm requires at least one meaningful path of normalized length >=0.025. Evidence `self-reported-writing` is ungraded and separate from lesson correctness. Empty draft is valid for clearing; empty confirmation is rejected.

## D1 schema and relationships
| Table | Composite primary key | Payload/purpose |
|---|---|---|
| learners | owner,id | profile JSON, revision, updated_at |
| learning_states | owner,learner | canonical state JSON, revision, last_event, updated_at |
| command_receipts | owner,learner,event_id | digest, revision, at; learning + namespaced Kana commands |
| learning_attempts | owner,learner,id | session, content_id/version, correct, payload JSON, at |
| kana_states | owner,learner | state JSON, revision, last_event, updated_at |
| kana_drawings | owner,learner,char | normalized strokes JSON, updated_at |
| kana_practices | owner,learner,event_id | char, stroke_count, evidence, at |

Relationships are logical application ownership checks; these live migrations do not declare foreign keys. Do not confuse historical SQLite fixture FK tests with live D1 schema guarantees. Reviews, session checkpoints and definitions are nested in learning_states JSON, not separate relational review tables. Notes/preferences are nested in learners.profile. Adding schema fields must preserve old snapshots and existing version references; do not edit already applied migrations.

## Other storage
Prototype localStorage includes `nihongo-path-flow-review-v3`, per-learner `nihongo-learning-v1:`, `nihongo-kana-studio-demo-v1:`, authoring workspace `nihongo-content-workspace-v1`, and other demo/locale keys. Live active learner is held in sessionStorage `np-selected-learner`; server snapshots are canonical. `public/demo-data/nihongo-demo.sqlite` is regenerated authored sample data, not a live backup or a migration input. Browser resets are blocked for live learning. No import of this fixture into hosted D1 is authorized.
