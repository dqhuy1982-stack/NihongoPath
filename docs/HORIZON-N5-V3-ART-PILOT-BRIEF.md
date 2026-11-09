# HORIZON N5 v3 — Art Direction & Pilot Production Brief
**Status:** Illustration work order · **NOT approved production art**  
**Target reference:** user's approved HORIZON N5 desktop lesson/story/character mockups from 2026-11-09.

## Global image direction

Warm editorial Japanese educational illustration with natural anime-influenced proportions, crisp expressive eyes, delicate linework, controlled soft shading and believable office environments. Must feel like the same illustrated world across all portraits and story scenes. Keep ivory/rose/sage/navy visual language: backgrounds warm off-white, cherry pink details, muted plum business attire, blue-green environmental accents.

**Absolutely avoid:** website UI, menu, labels, Japanese or Vietnamese lettering, speech bubbles, watermarks, stock photo collage, disjointed faces, random hair/clothing changes, oversized anime eyes, plastic 3D gradients, geometric SVG-looking portraits, cultural stereotypes, schoolgirls substituted for adult office staff.

**License/source:** original artwork or specifically licensed reference material. The existing mockup screenshots are visual references, **not** a license to crop individual illustrations and ship them as source assets.

## Identity lock: primary trio

### Keiko / `keiko` — 佐藤 けい子
Japanese woman, adult office employee at the *fictional* IMC office in Osaka. Friendly confident look, softly rounded face, warm brown eyes, natural low chestnut bun with a few gentle side strands; muted plum suit blazer over cream blouse; carries a tan document folder. Professional approachable smile with slightly animated Japanese editorial illustration style. No national flag motifs as costume, no office name embedded in portrait.

**Files:** `art-source/characters/keiko/portrait.png` (4:5), `bust.png` (3:4). Character turnarounds: neutral smile, greeting, explaining, surprised/curious, politely listening.

### Yamada / `yamada` — 山田 隆
Japanese adult male colleague, neat short black hair, thin dark rectangular glasses, navy suit and blue-striped necktie, realistic proportion and measured friendly expression. Use same face geometry, eyeglass shape and hairstyle in every scene. Not a stereotypical older boss.

**Files:** `art-source/characters/yamada/portrait.png`, `bust.png`.

### Mike / `mike` — マイク・ミラー
Adult American male engineer, sandy brown short textured hair, approachable smile, light blue professional shirt; optional muted grey-blue jacket. Friendly curious expression, adult body proportions, no visible US flag clothing or exaggerated ethnic traits.

**Files:** `art-source/characters/mike/portrait.png`, `bust.png`.

**Review requirement:** check portraits side by side before scene art. Character identity must be instantly recognizable at 64px avatar size and 220px bust size. Do not call portrait approved until profile dialog and scene use the **same** face.

## Three-scene pilot — create separate original images

**Scene 1 / `meeting`:** bright modern IMC Osaka office lobby in early morning; Keiko welcoming Mike while Yamada introduces him. All three adult characters visible, natural bow/gesture and eyelines, realistic furniture depth, soft daylight from windows, quiet cherry blossom outside in the distance. Composition with readable negative space at right for overlay UI (but **no embedded text**). Deliver 16:9 PNG source minimum 1600×900.

**Scene 2 / `colleague`:** same office, believable new angle in an open-plan workspace; Yamada stands slightly between Mike and Keiko, open-palmed introduction gesture, Keiko listening attentively, Mike smiling. Costumes/face matching approved portraits; no random fourth person dominating frame. 16:9 minimum 1600×900.

**Scene 5 / `namecheck`:** IMC office meeting area; Mike responds to a friendly clarification question from Keiko, Yamada beside them; inquisitive expression, natural professional dialogue gestures, consistent character continuity. 16:9 minimum 1600×900.

## Environment and hero requirements

One clean office environment background is required first; no embedded logos. Additional context images: classroom, hotel, café, station, shop, street, home/community. Keep visual style consistent with the trio scenes.

Desktop lesson hero: wide ~3:1 composition with Fuji, cherry blossoms and pagoda in background; place Keiko on the right third; leave left ~60% as quiet pale reading area. Mobile hero: *separately art-directed* ~3:2 composition, Keiko centered-right with safe region around headline. Never automatically crop desktop hero into mobile hero.

## Delivery and approval

1. Deliver the 3 portraits *separately* before generating 30-person production batch.
2. Compare at 64px, 220px, desktop 16:9 and mobile 390px layouts against approved mockups.
3. Create three scenes with **exact same character faces and clothing**.
4. Export originals through `scripts/n5-v3-prepare-art.py`.
5. Confirm correct ID, provenance, copyright, image size/cropping and no embedded UI text, then update manifest approval flags. Exporting itself does not grant approval.
6. Run `node scripts/n5-v3-validate-assets.mjs --strict` only after the full asset set is ready.

A screenshot of an attractive UI is not an illustration asset. **Production gate remains closed until independent images pass review.**
