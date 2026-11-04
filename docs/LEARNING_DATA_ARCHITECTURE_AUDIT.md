# Nihongo Path — Learning data audit and delivery sequence
**Audited:** 2026-11-04 · **Repository:** `dqhuy1982-stack/NihongoPath` · **Branch:** `develop`

## Decision
Continue development **data-driven**, using the approved UI as the baseline. Do not design dozens of HTML lessons or build a large production database first. Verify a small **Foundation → N5 introduction** end-to-end learning flow against an explicit content contract, then connect trusted authentication, Cloudflare D1 and multi-device progress.

**Safety boundary:** This audit changes neither deployed application code nor database schema nor existing learner data. The separate original ChatGPT Site remains untouched. A successful static deployment is not evidence of real auth or database synchronization.

## 1. Verified implementation inventory

| Layer | Existing source | Verified scope | Current limitation |
| --- | --- | --- | --- |
| Approved responsive UI | `source/public/index.html`, `app.js`, CSS, access/login UI | Demo profile switching, navigation, notebook, Kana experiences | Current Cloudflare Worker deploy is static-client-only |
| Foundation authored package | `source/content/foundation-vowels.v1.json` | 5 concepts, 5 choice questions, 10 units, 3/5/15-minute plans | Pilot for the first five Hiragana vowels, **not** a complete Kana or N5 syllabus |
| N5 authored package | `source/content/n5-introduction.v1.json` | 5 concepts, 11 questions, 11 units, 3/5/15-minute plans | Authored sample, not a fully validated N5 course |
| Browser N5 copy | `source/public/lesson-data/n5-introduction.v1.json` | Currently JSON-equal to canonical authored N5 source | Duplicate output can drift unless build checks/generates it |
| Learning state machine | `source/public/lesson-engine.js`, `source/server/lesson-engine.cjs` | Sessions, answers, checkpoints, reviews | Must test parity with server after future changes |
| Simulation fixture | `source/public/demo-data/seed.json`, `nihongo-demo.sqlite`, `schema.sql` | 6 fictional learners; 19 content entries; 65 question records; 52 synthetic attempts; 16 reviews | Design/testing fixture, **not** a hosted production database or a promise of released N1–N5 courses |
| Content Studio | `source/public/content-model.js`, `admin-ui.js`, `admin-data/seed.json` | Local authoring model and 2 sample drafts | Browser-local editor; no server-side publishing authorization |
| Authenticated pilot API | `source/server/pilot.js`, `source/app/api/pilot/[[...path]]/route.ts` | Profile, learner state, Kana API; owner-scoped access design | Relies on trusted `oai-authenticated-user-id` supplied by the **original Sites gateway**, not the new public Worker |
| D1 schema and migrations | `source/db/schema.ts`, `source/drizzle/0000_*.sql`, `0001_*.sql` | `learners`, `learning_states`, `learning_attempts`, `command_receipts`, `kana_states`, `kana_drawings`, `kana_practices` | Source/schema exists; hosted D1 binding and secure identity for the new Worker are not implemented |
| Local browser persistence | `app.js`, `lesson-store.js`, `kana-studio.js`, `kana-recall.js` | Separate localStorage keys, some per learner | No authoritative cross-device state on new static deployment |

The new Cloudflare Worker uses `node scripts/build-site.cjs` and `npx wrangler deploy --assets ./dist/site`, with `wrangler.jsonc`. This exports frontend assets only; it does not run the server pilot. Public `demo-data/nihongo-demo.sqlite` is an **explicitly fictional fixture**; for production release, prefer moving the fixture outside public served assets and using a controlled test data pipeline.

### Critical distinctions

- **Canonical learning content**: versioned authored package for lessons and questions.
- **Simulation fixture**: synthetic scenarios/attempts for reviewing UI and recommender; never convert these into real learner accomplishments.
- **Learner state**: real user/profile/session/attempt/review data, scoped to trusted account and learner, with timestamps, revision and content version.
- **Design assets**: 4 demo avatars in `source/public/assets/family`; these are not evidence of real personal avatars surviving the original Sites export.
- **Cloudflare Worker vs. original ChatGPT Site**: original trusted authentication headers must not be accepted from arbitrary browser requests. A new production identity integration is required before enabling the existing API publicly.

## 2. Data contract to preserve

### Content (read-only, versioned)
`contentId` + integer `contentVersion`; level/status/locale/source note; stable concept IDs; question IDs and versions; typed questions (`choice` or `order` in the pilot); unit IDs; named 3/5/15-minute plans. Validate every referenced ID before publishing. Treat content versions as immutable after learners have attempts. A later lesson revision creates a **new** version; old attempts remain linked to the original version.

### Learner state (mutable, owner-scoped)
`ownerId` (server verified), `learnerId`, `revision`, activity/session ID, stable content ID/version, attempt ID, review due date and independent Kana practice evidence. Do not derive owner identity from a caller-controlled request header or from client-selected avatar alone. Preserve distinction between **self-practice completed** and **answer correct**.

### UI and recommendation boundary
UI renders data and submits actions; server/learning engine computes canonical correctness and schedules review. UI never claims real progress was saved until persistence acknowledges the write. If offline capability is later added, use a conflict-safe queue rather than two independent sources of truth. The simulation's 65 question records are **not** 65 independently released questions.

## 3. Immediate, testable sequence

**Phase A — contract lock (current):** Preserve approved login/dashboard/Kana UI. Audit both authored content packages and synthetic fixtures; add a read-only repository validation gate (`node tools/audit-learning-data.mjs`). No DB mutation.

**Phase B — single lesson vertical slice:** Keep one content model, render Foundation vowels + N5 introduction through a consistent data adapter. Test: profile selection → start/resume → one correct and one incorrect answer → summary → due review → reload. Keep sample data labeled as sample.

**Phase C — production identity and D1:** Choose an independent trusted authentication mechanism suitable for four family users (the original ChatGPT Site gateway does not exist on this Worker). Provision nonproduction D1, bind it, test schema-only migrations, least-privilege access, event deduplication and profile isolation. No demo data copied to production as historical learner evidence.

**Phase D — real multi-device verification:** Test PC Chrome, PC Edge and iPhone Safari against one user account with separate learner profiles. Verify same learner resumes, another learner remains isolated, retries do not duplicate attempts, and failure does not silently lose drawings. Back up any browser-only records before making migrations.

**Phase E — curriculum expansion:** Publish the next N5 lesson only after one lesson satisfies these gates. Then build a content authoring/review workflow and reusable learning patterns; do not hardcode each lesson into HTML.

## 4. Acceptance criteria for first vertical slice

1. **Content validity:** No missing references, duplicates, unsupported question types or silently changed released versions.
2. **Learner isolation:** Both account and learner boundaries are tested server-side, not by hiding UI controls.
3. **Correct evidence:** First answer, content version, elapsed time and review status are retained without claiming speech/handwriting grading.
4. **Resume/sync:** Close on PC, reopen on iPhone, resume accurately from server-side state; no localStorage-only success state.
5. **Operational safety:** Existing ChatGPT Site and original data remain unchanged, migrations are separately reviewed, and backup/rollback are defined before enabling production.
6. **UX quality:** No unexpected mobile scroll, no dead login controls, no duplicate submission, no misleading completion markers.

## 5. Read-only validation

From repository root:

```powershell
cd C:\Dev\NihongoPath
git pull --ff-only origin develop
node tools/audit-learning-data.mjs
```

The script checks reference integrity of the two authored pilots, N5 browser-copy parity, synthetic fixture labels and learner references, packaged D1 table presence, and demo avatar/SQLite file existence. It intentionally **does not** connect to hosted D1, inspect actual family data or certify the browser UX. A script pass is only a repository-contract check.

**Next implementation target:** Phase B adapter/vertical slice after reviewing this baseline. No additional repos, demo deploys, schema reset, real-user data import or changes to the original Site.
