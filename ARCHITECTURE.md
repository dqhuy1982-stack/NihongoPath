# Architecture and source audit

Baseline audited 1 November 2026 (Asia/Tokyo). Site v15, commit `6e70f8eb5fdd7dd7737d37e3a23f600928e883b7`.
Site: https://nihongo-path-flow-review.aceticlotus.chatgpt.site
Project: `appgprj_6ae5d9599a0c819181446dd84e6553a9`.
This is an export for continued development of the same product. No Site publishing, access changes, live-data export or database migration was performed by this handoff task.

## Actual framework
Vinext `1.0.0-beta.5` on Vite `8.0.13`, Next API compatibility `16.3.4`, React/React DOM `19.2.6`, TypeScript `5.9.3`, Cloudflare Vite plugin `1.37.1`, Wrangler `4.92.0`, Drizzle ORM `0.45.2` / kit `0.31.10`. Package manager pinned to pnpm `11.25.0`; package engine Node >=22.13.0. Verification host used Node 24.22.1. `source/package.json` and `pnpm-lock.yaml` are authoritative for every dependency and resolution, including installed starter UI dependencies that are not active app screens.

The visible product is primarily plain HTML/CSS/classic JavaScript, served by a Worker framework wrapper. It is not a React rewrite. `components/ui/` is retained starter infrastructure; shipped product functions live chiefly in `public/*.js`.

## Directory responsibilities
| Path | Responsibility |
|---|---|
| `app/route.ts` | GET `/`: sends `public/index.html` as raw HTML, no-store |
| `app/api/pilot/[[...path]]/route.ts` | GET/POST/PUT API bridge to `server/pilot.js` and Worker env |
| `app/layout.tsx`, `app/globals.css`, `app/chatgpt-auth.ts` | Framework scaffolding/auth utilities; actual API checks its trusted identity header |
| `public/` | Authored app shell, layered CSS, browser scripts, fonts/icons/illustrations, Kana SVGs and fixtures |
| `server/pilot.js`, `server/kana.js` | Account-scoped validation, canonical commands and persistence |
| `server/lesson-engine.cjs`, `server/kana-model.cjs` | Pure server models; mirrored browser models must stay in sync |
| `content/` | Versioned lesson definitions and Kana source checksums |
| `db/`, `drizzle/` | Drizzle schema, two additive SQL migrations and metadata |
| `worker/index.ts`, `lib/connector-*` | Worker entry and Sites connector context scaffolding |
| `scripts/` | Build/install wrappers, vendored Sites plugin, content/fixture generators |
| `components/`, `hooks/`, `examples/`, `vendor/` | Retained starter/UI/examples and vendored license files |
| `docs/` | Historical implementation and QA documentation; screenshot subset omitted for privacy |
| `.openai/hosting.json` | Same Site identity and D1 binding `DB`; no R2 configured |

## Route inventory
Server routes: `/` and `/api/pilot/:path*`; public assets are served directly. Product pages use hash routing, not individual server-rendered page routes.

Hash keys in `app.js`: `login`, `forgot`, `recovery`, `reset-access`, `reset-done`, `invite`, `invite-preview`, `join`, `ready`, `logout`, `profiles`, `guest`, `admin`, `map`, `onboarding`, `today`, `learn`, `course/:id`, `lesson`, `quiz`, `summary`, `review`, `kana`, `flash`, `mistakes`, `notebook`, `discover`, `dictionary`, `library`, `characters`, `character/:id`, `reports`, `achievements`, `settings/:group`, `profile`, `family`, `guide`, `assistant`, `listening`. `journey.js` extends the journey flow. Existence in this list is not proof of server-backed implementation.

Live adapter permits `login profiles today learn course lesson quiz summary review mistakes reports notebook settings profile family guide onboarding ready logout journey kana`. Settings `account/data/reminders` and unsupported routes show development messaging/prototype links. `learn/library` and Foundation/N5 course entries are replaced with the live catalog.

## Browser boundaries and load order
`public/index.html` is the authoritative script/style order. Global controllers intentionally extend/replace earlier functions; reordering can break behavior. `app.js` owns base shell/routing; `journey.js` and `study.js` extend flows; engines/stores/content modules support learning; `kana-studio.js` replaces the old writing surface; `pilot-online.js` swaps local learning access for API access at root unless `mode=demo`; `lesson-ui.js` mounts the player; `admin-ui.js` provides prototype authoring.

## Services that do not become standalone HTML
| Service | Outside-Sites requirement |
|---|---|
| ChatGPT Site auth gate and trusted identity headers | Not exportable as HTML. Use local prototype for UI; production elsewhere needs a trusted auth gateway that removes forged headers and provides verified identity. Never expose current API directly on the public internet with caller-controlled identity headers. |
| Cloudflare D1 binding `DB` | Wrangler local emulation works for development; production DB provisioning/migrations and identity remain platform tasks. No real data included. |
| Worker execution / asset routing | Requires build tooling and runtime; static hosting serves prototype assets only. |
| Connector capability binding | Scaffolding retained. No product connector integration declared in hosting manifest. A different host must supply equivalent binding if future work uses it. |
| Publication, Site version history, access configuration | Hosted metadata, not in ZIP source. Existing source repository is the upstream authority. |

No environment variables/secrets were requested from the deployed Site. No hosted user-table contents were read or exported. Dependency installation requires internet/package registry access on a new machine.
