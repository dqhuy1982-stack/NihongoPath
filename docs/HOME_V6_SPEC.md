# HORIZON / HOME V6 — Mobile Portrait Gallery
Date: 2026-11-06
Branch: develop
Status: implementation committed; visual verification on actual iPhone still required

## Design decision
Adopt the clean, compact minimal-luxury proposal from the November 6 mobile mockup review.

The provided iPhone screenshot demonstrates a tall hero and four outlined cards extending beyond the initial viewport. Rendering a 9:16 mockup exactly on a browser viewport would repeat this defect; actual Safari browser chrome, safe areas and device heights vary.

## Changes
- Only the static, local-PIN Home is restyled on viewports **600px and narrower**. Desktop V5 remains unchanged.
- Remove visible outer rectangular learner cards, decorative separators, seasonal card embellishments, study level and study-focus text **on mobile only**. Those profile values remain in underlying state, where they are used after login.
- Keep four original user-supplied portraits, round image crop, a fine quiet frame, names, their order, full-button click target, keyboard focus and the existing PIN morph.
- Compress the top controls into one row without changing four-season preference persistence or VI/EN/JA choice.
- Retain the centered HORIZON mark/tagline and full localized question; make it more compact and readable. Helper is shown when space permits and hidden at short viewport heights.
- Introduce four crisp, purpose-drawn mobile seasonal Fuji SVG backgrounds. Do not stretch the hazy desktop background; no blur filters in mobile art.
- Keep guest access in view on ordinary iPhone-sized screens, with a restrained outline style.
- Use fluid portrait sizing, `100svh`, safe-area padding and a short-viewport breakpoint. **Never hide overflow** to claim one-screen fit: tiny devices, 200% zoom or large type can scroll naturally.
- At extremely narrow widths (<=310px), allow one column and controls wrapping. Landscape phones may use a four-across row.

## Technical boundaries
- Only new files `source/public/home-v6-mobile.css` and `source/public/assets/horizon-mobile-*.svg` plus Home stylesheet include, tests and docs.
- Previous `home-v4.css` and `home-v5.css` are retained; V6 is later in cascade and mobile-only.
- No modifications to `main`, authentication logic, family PIN hashing, local learning progress, avatar files, backend/D1/Cloudflare Workers, routes or dashboard.
- Source tests: `tests/home-v6-mobile.test.mjs` added to GitHub Pages quality gate.

## Acceptance matrix (manual live-browser review)
- iPhone width 390px at viewport heights 844, 740, 667, 600: no horizontal overflow; controls clear; portraits and guest action visible on first screen where genuinely possible.
- iPhone width 360 and 375px: same criteria, balanced 2x2 gallery.
- iPhone Safari: crisp scenery, no blurred controls, no clipped button or surprise internal scrollbars.
- EN and JA locales: question and names wrap cleanly.
- Spring/Summer/Autumn/Winter: icon selection updates only background; accessibility `aria-pressed` correct.
- Dark mode: portrait and text contrast are legible; focus outline visible.
- Keyboard: focus all four full portrait targets; PIN opens, Escape closes, guest navigation preserved.
- Reduced motion: no unexpected animated movement.
- 200% text zoom / landscape: natural scroll is allowed rather than clipping.

Note: passing source tests and successful GitHub Pages deploy are **not** proof of real-device pixel-perfect fit. Review the published site on the user's actual Safari build before declaring visual QA complete.
