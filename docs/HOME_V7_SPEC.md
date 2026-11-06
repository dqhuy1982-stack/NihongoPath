# HORIZON — HOME V7 / Editorial Family Welcome
Date: 2026-11-06
Branch: develop
Deployment: GitHub Pages (static, non-family-sync demo)
Status: implemented and CI validated; real-device visual acceptance still pending

## Approved intent
Minimal Japanese editorial visual language on PC and iPhone: warm ivory,
deep forest ink, muted gold/sage, restrained Fuji mountain composition,
a clean HORIZON wordmark, very little botanical decoration. No ornamental
cards or saturated effects.

## Layout and assets
- Desktop: top brand and real working locale/season controls, centered
  HORIZON lockup and greeting, four open circular illustrated portraits,
  dynamic study-level chips and Guest access.
- Mobile: compact header, distinct reduced-size Fuji vector, vertically
  stacked profile list with a small portrait, name, current goal and chevron.
  No internal scrolling; short screens and 200% zoom can naturally scroll.
- Palette: #faf8f3 paper, #244735 forest, #b9a17a gold, #57725d sage.
- New files: `assets/horizon-v7-sunmark.svg`,
  `assets/horizon-v7-landscape.svg`,
  `assets/horizon-v7-mobile.svg`,
  `assets/horizon-family-illustrated.webp`,
  `home-v7.css`.
- Four illustrations are an interpretive, same-gaze rendition derived from
  image review references, *not* asserted to be an exact facial reproduction.
  Their placement follows the original four learner order; optimized
  WebP spritesheet uses 2x2 quadrants with distinct figure faces and clothing.
  The original four high-quality profile photos remain unchanged and are still
  used by PIN and subsequent learner workflows.

## Behavior and ownership
- Home remains limited to `NP_STATIC_PUBLISH && !NP_FAMILY_SYNC`.
  Backend/D1 and production login are unaffected.
- Each learner portrait is still the original full-button PIN opener;
  the additional "Choose learner" CTA focuses the first accessible learner
  button and does *not* auto-login as the first profile.
- Guest access remains separate and does not bypass family PIN.
- Existing four-season preference is retained but controls are moved into
  accessible native details/summary to de-clutter the header.
- VI / EN / 日本語 locale switch still uses the existing implementation.
- `main` and persisted profile, PIN and learning data are not modified.

## Automated gates
- tests/home-v2.test.mjs, tests/home-v4.test.mjs,
  tests/home-v5.test.mjs, tests/home-v6-mobile.test.mjs,
  tests/home-v7.test.mjs, existing readability, family demo, brand and
  learning/safety tests all run as part of GitHub Pages or shared CI.
- GitHub Pages workflow builds the entire static app and checks that
  the Cloudflare family-sync adapter is absent.

## Manual acceptance still needed
1. iPhone Safari, actual URL: crisp header and Fuji, name and levels readable,
   no clipped guest action at normal text size.
2. PC widths 1366 and 1920: four photos align; no page-width overflow.
3. iPhone 360, 390 px and short viewport: natural scrolling only when needed.
4. Season change, language switching, PIN open/close and Guest routes.
5. Color contrast, dark theme, keyboard focus, reduced-motion preference.
6. Confirm illustrated portraits feel familiar enough, or refine faces.

## Rollback
The previous V6 CSS and all original profile images are retained.
Disable the V7 CSS link and V7 class/insertion logic to return to the
previous Home presentation. No DB restore is needed.
