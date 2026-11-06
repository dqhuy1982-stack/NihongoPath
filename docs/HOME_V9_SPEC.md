# HORIZON HOME V9 — Scenic Editorial Release
Date: 2026-11-06
Branch: `develop`
Target: GitHub Pages static demo; not the connected family-sync backend.

## Direction approved
Use the latest desktop, iPhone and PIN mockup as one Japanese minimal-luxury system:
quiet ivory paper, forest ink, sage landscape, finely held gold detail,
complete Fuji silhouette, and real family portraits with consistent restrained color.
Avoid flowers and oversized illustrated/false portraits.

## Implemented
- Retain centered HORIZON logo and tagline with functional language and season controls.
- Desktop: a new viewBox-safe Fuji scenery behind the editorial hero, full four-person gallery,
  learner stage chips, and Guest entry. No extra 'Choose learner' CTA.
- Mobile: smaller dedicated Fuji SVG as an in-flow element before the HORIZON lockup;
  four compact and consistently sized clickable learner rows; Guest remains accessible.
- Portraits: use exactly the original `assets/family/demo-{a,b,c,d}.webp` through
  existing `family-portraits.js`. Apply the *same* gentle color grade on Home and PIN.
  No generative replacement identities, no source image replacements.
- PIN: use the same Sunmark as header/hero plus a compact tagline and a subtle Fuji
  landscape, preserving local PIN create, confirm, unlock, reset, close, focus and resize.
- Preserve four seasonal color variants and VI/EN/JA switcher.

## File boundaries
- New `assets/horizon-v9-fuji-desktop.svg` and `assets/horizon-v9-fuji-mobile.svg`
  are background-only vector artwork; no embedded text or photographs.
- New `home-v9.css` is last in the cascade.
- `login-ui.js` only adds the V9 class and a decorative accessible-hidden mobile
  landscape element in the existing non-family-sync Home.
- `family-pin-ui.js` changes logo asset and visual tagline, not PIN logic.
- Updated `tests/home-v4.test.mjs` to expect the shared brand, and added
  `tests/home-v9.test.mjs` to the Pages quality gate.
- Previous Home layers and original photos remain for rollback; main untouched.

## QA and acceptance
CI source tests check presence/order of V9, original family photo integrity,
the complete summit in vector sources, mobile in-flow art, existing PIN behavior,
guest and language/season controls, and natural scrolling at short Safari heights.

Manual review still required on real devices:
1. Desktop: 1366×768 and 1920×1080, full Fuji tip visible above hills,
   exact alignment of all four images and names.
2. Mobile Safari: widths 360/375/390/430 and short viewport, landscape not intersecting
   HORIZON/greeting, all four rows and Guest available without horizontal overflow.
3. PIN on Safari: brand consistent with Home, correct avatar,
   title/field/submit visible; short-height overflow can scroll only after transition.
4. Dark theme, reduced motion, touch/keyboard focus, English and Japanese wrapping.

Passing CI/deploy is not proof of visual pixel-perfect Safari rendering.
