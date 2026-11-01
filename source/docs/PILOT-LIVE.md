# Nền tảng/N5 — live pilot increment

The Atelier v11 reference remains in Git at commit `1d6d1a06e1a9b98cc9f56f5cf72bfadd1ea2f399`.

## What changed

The root now hosts a server-backed pilot in the existing visual shell. Static assets and the retained prototype moved from `dist/` to `public/`; `dist/` is now generated Vinext output. `?mode=demo` runs the original browser-local prototype. Old browser records are not imported automatically and are never treated as authenticated evidence.

Hosted access uses Sites-owned ChatGPT authentication. The stable site user ID owns the family collection. The first increment is explicitly parent-managed: avatars select learners within that account; they are not independent child logins and no demo code authorizes an API call. The Site audience is unchanged. New identities receive no other account's profiles or progress. A newly authenticated owner explicitly initializes their own collection before studying. No progress is seeded.

`server/pilot.js` owns the commands; it runs the same pure engine as the pilot UI but derives correctness, timestamps, first-answer evidence and review records on the server. Learners, learning states, command receipts and append-only application attempts are persisted to D1. Every lookup/write scopes by authenticated owner AND learner. Request handlers do not create tables. Migrations are schema-only in `drizzle/`.

Commands use an event ID, digest, expected state revision and optional checkpoint expectation. Conditional updates and receipts/attempt projections are batched atomically; a conflicting writer must reload. An exact retry returns existing evidence. The client never supplies the canonical state or official correctness. A server-acknowledged state is the source of truth; browser-local demo storage is not the live repository.

Two source-versioned content packages ship in this pilot:

- `foundation-vowels@1`: あ・い・う・え・お recognition, learning cards, 3/5-minute authored paths, first answers and per-concept recall. No audio or handwriting evaluation. A 15-minute selection does not invent additional content.
- `n5-introduction@1`: the retained N5 introduction pilot with 3/5/15-minute plans, choice/order practice, bounded repair, personal practice and separate evidence categories.

These are authored self-study pilots, not a complete course or official JLPT assessment. Server responses contain teaching definitions used by the current self-study renderer; the package is not designed as a secret-answer examination. A future examination mode must separately restrict answer/feedback exposure.

The shell retains its five main navigation destinations. The live dashboard and course/library entries expose only the two pilot packages. The full journey remains. Unimplemented modules/settings link to the retained prototype rather than pretending to save to the live backend. Notes/profile settings, roadmap assumptions, archive/restore and adding learners use authenticated, revision-checked profile APIs. Reset-demo/reset-learning controls are blocked in the live pilot. Content Studio remains local-demo only in this increment; server editing and approval are a subsequent milestone.

## Verification

- Node tests: original content/engine/repository contracts plus `tests/pilot-api.test.mjs` against in-memory SQLite using a D1-shaped adapter.
- API tests cover missing identity, cross-origin writes, cross-account access, duplicate retries, reused IDs with changed payload, stale revisions, server-calculated correctness, role filtering, dynamic learners, checkpoint reload and full Foundation/N5 learning loops with review records.
- Python tests retain the downloadable SQLite fixture's version/foreign-key/immutability contracts. This fixture is still separate from live D1.
- Vinext production build produces `/` and `/api/pilot/:path*` with D1 binding `DB`.
- Managed browser preview reached the real authentication requirement. No mock identity or authentication bypass was introduced to make protected browser QA pass. Authenticated browser walkthrough and physical multi-device/iPhone testing remain to be performed with an authorized session.

## Limits and next milestones

- Only this account's parent-managed collection is implemented; no independent child identity, invitation, password-reset system, teacher role, content editor role or delegated family access is claimed.
- No full offline mode or remote-notification service. The app needs connectivity for confirmed study writes. It does not silently display browser-only writes as saved online.
- Opening another device/reloading fetches server progress. Background real-time synchronization while both devices are open is not implemented; revision conflicts are explicit.
- Definitions are versioned source packages and sessions retain definition snapshots. Keep every referenced release available when adding a new version; live Content Studio/catalog migrations remain a subsequent milestone.
- Export is a user-facing copy, not a tested disaster-recovery solution. Hosted backup/restore procedures and retention decisions remain before wider production use.
- Content quality, source rights, language/accessibility review and study outcomes need their own review; technical passing tests do not certify pedagogical effectiveness.

## Commands

Use the Sites skill's build/install/publish helpers. Generate schema migrations with the selected package manager's `db:generate`; do not recreate the competing npm lockfile in this pnpm-managed checkout.

```sh
node --test tests/*.test.cjs tests/pilot-api.test.mjs
python -m unittest discover -s tests -p 'test_*.py'
```

Legacy fixture generators now target `public/`. Keep generated runtime output out of source control and preserve the Site project ID/audience.
