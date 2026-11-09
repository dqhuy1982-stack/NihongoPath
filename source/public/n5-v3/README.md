# HORIZON N5 v3 · Art-first Rebuild

**Branch:** `feat/n5-visual-rebuild`  
**State:** implementation underway; **not production-ready and not deployed to GitHub Pages**.  
**Baseline:** current `develop` v2.00 remains unchanged.

## Delivered in first build pass

- `art-manifest.json` — 30 source-aligned character IDs, six existing scene IDs, eight reusable backgrounds, two responsive hero slots.
- `story-bible-draft.json` — mockup-based IMC Osaka setting for Sato Keiko/Yamada/Mike, with six *draft* story situations. Uses **new v3 scene IDs**, never rewrites historical N5 attempt records.
- `art-contract.mjs` — returns approved raster assets only; does **not** quietly substitute letters or geometric SVG faces.
- `art-review.html` — separate internal artist/QA browser; 30-character search, role groups, scene/context status, identity details. This is **not the learner website**.
- `scripts/n5-v3-prepare-art.py` — exports vetted artwork originals to WebP while preserving faces and frame composition.
- `scripts/n5-v3-validate-assets.mjs`, tests and isolated workflow — hard approval gates without touching the Pages release workflow.

## Non-negotiable image production gate

Currently **no standalone raster assets have been accepted**. The images created during exploration were entire UI mockups; they are **not reusable portrait or scene artwork** and are not shipped as files.

### Pilot first — three leads + three scenes

Create original *standalone* high-resolution illustrations (no navigation/text layers) that are coherent with the approved screenshots:

| Character ID | Identity/style reference | Required |
|---|---|---|
| `keiko` | Sato Keiko: chestnut low bun, warm brown eyes, plum blazer and beige folder | portrait + bust |
| `yamada` | Yamada Takashi: short black hair, rectangular glasses, navy business suit and blue tie | portrait + bust |
| `mike` | Mike Miller: sandy-brown hair, blue shirt, approachable professional demeanor | portrait + bust |

Pilot scenes: `meeting`, `colleague`, `namecheck`, all art-directed within the same fictional IMC Osaka environment. 2–3 alternative expressions for lead characters may be supplied later, but **do not mix identities**.

**Required inputs:** separate original PNGs, with consistent face, hair, uniform/role and daylight/pastel shading. Composite screenshots and cropped text panels are not acceptable source files.

## Required source tree

```
art-source/
  characters/keiko/{portrait,bust}.png
  characters/yamada/{portrait,bust}.png
  characters/mike/{portrait,bust}.png
  scenes/{meeting,colleague,namecheck}.png
  ...
  environments/{office,classroom,hotel,cafe,station,market,street,home}.png
  heroes/{lesson01-desktop,lesson01-mobile}.png
```

Run on a machine with Python 3.11+ and Pillow installed:

```powershell
python -m pip install Pillow
python scripts/n5-v3-prepare-art.py --source .\art-source --pilot
node scripts/n5-v3-validate-assets.mjs
node --test tests/n5-v3-art-contract.test.mjs
```

The exporter emits `source/public/assets/n5-v3/.../*.webp` and a SHA-256 export index. **Exporting a file does not mark it approved.** Art director and product owner verify accuracy, quality, consistency and rights before changing a manifest record to approved.

Only after 30/30 portraits, 6/6 scenes, 8/8 environments and 2/2 heroes are approved and real files exist:

```powershell
node scripts/n5-v3-validate-assets.mjs --strict
```

The strict command must fail while art is pending. The new visual UI is not released until art and mobile/desktop screenshot checks both pass.

## Editorial dependency

The current world data associates some people with Nagi Riverside Hotel/Kaze Systems and the existing scenarios feature different speakers. Mockups show the IMC Osaka workplace with Keiko/Yamada/Mike. `story-bible-draft.json` is a **non-destructive proposal**; it must pass Japanese curriculum and storyline review before being used for learning or scoring.

## Next engineering stage

Use the approved art assets as inputs for a new `n5-v3` UI renderer and design tokens. Work on the feature branch and compare against reference mockups at equal viewport sizes. Only merge to `develop` after all release gates G0–G6 in the [Visual Gap Analysis](../../../docs/HORIZON-N5-VISUAL-GAP-ANALYSIS-REBUILD-CONDITIONS-v2.1.md) pass.

Never replace Foundation, erase attempts, or unlock incomplete N5 lessons as part of the visual rebuild.
