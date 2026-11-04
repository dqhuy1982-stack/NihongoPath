# Cloudflare Worker build diagnostics

Single source: private `dqhuy1982-stack/NihongoPath`, branch `develop`.

This document-only commit is deliberately used to trigger a NEW Cloudflare Git build
after production branch was set to `develop`. It does not alter runtime code, backend,
database, deployment configuration, or user data.

## Expected Git integration settings

- Repository: `dqhuy1982-stack/NihongoPath`
- Production branch: `develop`
- Root directory: `/`
- Build command: `node scripts/build-site.cjs`
- Deploy command: `npx wrangler deploy --assets ./dist/site`
- Node version: 24

## Verify

1. Cloudflare > nihongopath > Deployments > open the **newest** deployment.
2. Confirm branch `develop` and commit SHA matches GitHub `develop` latest.
3. Confirm build log runs 18 tests, builds 46 audio clips, creates `dist/site`,
   then Wrangler uploads assets.
4. If `scripts/build-site.cjs` is missing, inspect the deployment commit SHA.
   Retrying an older deployment is not a replacement for building the new commit.
5. If build succeeds but Wrangler fails, inspect the new deploy error separately.

Note: Public site currently uses client-local state and mock access, not live
authentication or synchronized learner progress. Never publish repository source.
