# Nihongo Path — project specification

Baseline audited 1 November 2026 (Asia/Tokyo). Site v15, commit `6e70f8eb5fdd7dd7737d37e3a23f600928e883b7`.
Site: https://nihongo-path-flow-review.aceticlotus.chatgpt.site
Project: `appgprj_6ae5d9599a0c819181446dd84e6553a9`.
This is an export for continued development of the same product. No Site publishing, access changes, live-data export or database migration was performed by this handoff task.

## Product and release boundary
Family-oriented Japanese self-study, responsive PC/tablet/phone. Foundation through N1 remain in the journey; only two lesson packages are offered by the authenticated pilot: `foundation-vowels@1` and `n5-introduction@1`. A selected goal is not a verified proficiency level. Preserve five primary destinations: Today / Learn / Review / Notebook / Discover.

## Implemented in the server-backed pilot
- ChatGPT Site identity owns a parent-managed learner collection. Avatars select profiles; they are not separate child accounts or independent authentication.
- Explicit initial setup with empty progress; create/update/archive/restore learner profiles, preferences and notes through authenticated APIs.
- Foundation vowels あ・い・う・え・お and N5 self-introduction. Source-defined lesson plans, choice/token-order questions, hints, feedback, bounded repair, summary and review scheduling. Server determines canonical correctness.
- Checkpoints, attempts and reviews persist to D1 per account/profile; retry receipts and revisions prevent duplicate evidence and stale writes.
- Review, notebook and reports draw on the live collection. Reopening/reloading on a second device fetches saved progress; there is no push-based real-time synchronization.
- Kana Writing Studio: 46 Hiragana + 46 Katakana, 212 ordered stroke groups; numbered stroke selection, start/moving markers, play/pause/continue, previous/next/replay, speeds 0.5/1/1.5. Pointer-based vector writing, undo/clear, drafts and ungraded practice recording. Learner/glyph separation, revision conflict handling and local draft export.
- Three Studio columns on wide screens; choose/watch/write steps on phone. The live course/library cards currently expose the two pilot lesson packages, without a separate Studio card. `#kana` exists and is allowed in live routing. Preserve this finding for the next UX change.

## Retained prototype, not server-backed completion
`?mode=demo` retains broad screen/interaction coverage and browser-local fixtures. Content Studio is browser-local authoring/release simulation, not a server publishing CMS. Invitation/recovery/password screens, guest examples, dictionary, broader flashcards, achievements, character stories and other mock modules remain reference/demo functions. Unsupported destinations are blocked or linked to the prototype by the live adapter. Settings account/data/reminders are not live features. Existing README and historical QA docs describe older milestones and must be read in that context.

## Not implemented / not claimed
Automatic handwriting assessment, audio/recording, complete Foundation or N5 curriculum, full N4–N1 courses, production content editing/approval, independent child login/invitation/password reset, delegated family permissions, full offline/sync, push/email reminders, hosted disaster recovery. A manifest and local stroke assets do not establish an offline PWA. Self-reported writing does not prove correctness or mastery.

## Next priority and sequencing
1. Finish and review FOUNDATION · KANA WRITING STUDIO within current shell; validate physical iPhone/Safari use and discoverability. Keep results separate from scored recall.
2. Preserve lesson persistence and layout regressions while improving this module. No extra N5 lessons requested in this handoff.
3. After Studio acceptance, add N5 lessons 1, 2… using user-supplied content/requirements and existing versioned templates.
4. Later: server-backed content authoring, independent identities/permissions, expanded curriculum and deliberately designed offline support. These require explicit scope, not cosmetic switches.

## Evidence
Implementation sources: `source/public/pilot-online.js`, `source/public/kana-studio.js`, `source/server/`, `source/content/`, `source/db/schema.ts`. Full path/hash manifest supplied. Historical test/QA claims are distinct from checks performed on this sanitized export.
