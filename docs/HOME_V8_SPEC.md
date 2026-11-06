# HORIZON · HOME V8 — Refined Family Entrance
Date: 2026-11-06
Source branch: develop
Public review deployment: GitHub Pages (static demo; no family-sync backend)

## Design decision
Rebalance the current Home rather than reproducing a generated concept image literally.
The last iPhone review showed overly large scenery intersecting greeting,
uneven spacing, a redundant green `Chọn người học` button, and invented faces
in the previous illustrated portraits.

## Applied changes
- Remove the duplicate green `Chọn người học` CTA from static Home DOM,
  and remove the associated handler. Avatar/full learner row remains the
  direct PIN entry point; Guest remains independent.
- Restore original, face-faithful photos from
  `assets/family/demo-a.webp` through `demo-d.webp`.
  Retain originals in profile/PIN views. Old illustrative sprite remains
  in the repository only as a historical asset and is explicitly disabled
  by V8's Home-only CSS.
- Apply only gentle warm image tone and quiet vignette to the *actual*
  photos. No AI-redrawn faces are shipped as identities.
- Desktop: centered brand and greeting, Fuji wash subordinate to text,
  four equal open portraits with names and stage labels, single guest action.
- Mobile: crisp slim header, compact brand, gentle Fuji backdrop,
  four slim consistent learner rows, guest action at bottom.
- Preserve seasonal menu, locales VI/EN/JA, dark theme, keyboard focus,
  reduced motion, and natural scrolling for small Safari viewports.

## Files changed
- `source/public/login-ui.js` — V8 class, removal of redundant CTA/handler.
- `source/public/home-v8.css` — additive Home-only styles.
- `source/public/index.html` — V8 CSS last in cascade.
- `tests/home-v7.test.mjs` — update historical test for approved CTA removal.
- `tests/home-v8.test.mjs` — new original-photo, responsive/PIN regression.
- `.github/workflows/pages.yml` — execute V8 regression before deploy.

## Invariants
- No changes to main branch, D1 database, Cloudflare Workers, API contracts,
  learning routes, progress, family PIN creation/unlock, or stored identity data.
- Original image assets are preserved unchanged.
- V7/V6 assets and styles are retained for rollback.
- PIN button is the original `data-action=loginprofile` element.

## Review matrix
- Desktop: 1366×768, 1440×900, and 1920×1080.
- Tablet: 768×1024, two open portrait columns.
- iPhone Safari: 360×740, 375×667, 390×844, 430×932.
- Ensure controls and last learner do not clip; short viewports scroll naturally.
- Locale switch: EN and JA headline wrapping; spring/summer/autumn/winter.
- PIN open / close, guest entry, keyboard tab/Enter, dark mode.
- Photos must visibly match original faces; warm tint should be restrained.

CI success confirms the build and test contracts but **not** pixel-perfect
visual acceptance on the user's exact Safari device.
