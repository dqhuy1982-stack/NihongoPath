# NIHONGO PATH — HOME V2 SPEC
Status: Refined editorial entrance · implemented on `develop` · GitHub Pages demo · 2026-11-05

## Decision
Turn landing/login into a focused learner picker. **Only actions that matter: choose one of four learners, unlock with a local demo PIN, or enter as guest.** Source, routes, stored profiles, avatar assets, one-tap logic, and Japanese-learning flows stay unchanged. Do not redesign the app after login.

## Priority and information hierarchy
1. Brand in header: Nihongo Path; theme and language switches remain operational. Remove "Family Atelier" and the competing "Khám phá hành trình" link from the landing header.
2. One centered functional headline: "Hôm nay, ai sẽ học?" plus one short editorial subtitle. No split promotional hero, competing headline, oversized illustration, or benefit chips.
3. Primary action: four equal whole-card buttons (Quang Huy · N5, Vy Anh · N2, Nam Khánh · N4, Gia Hưng · N4), using current optimized avatar assets, in the existing profile order.
4. Secondary action: one discreet "Vào thử với tư cách khách" link/button. Guest has no PIN and must not update family learning records.
5. Remove bottom status/footer strip on landing; storage/privacy limitations remain available elsewhere in the application.

## Layout / geometry
- Desktop >= 851px: single centered composition, one heading above four cards in a single horizontal row; picker max-width ~1060px. Header ~78px. Above-the-fold at 1366x768 without cropping; when zoomed or in short windows, normal page scrolling is allowed.
- Tablet/mobile <= 850px: stack compact intro above selection; two-column avatar cards; guest control below. Never show horizontally scrolling controls. A 360px phone should show both columns; long names can wrap.
- Minimum 44px interactive target. Avatar ~80–90px; names 14–16px / weight >= 600; goal 12–13px, contrast >= 4.5:1 on card background.
- Do not increase global font size / affect Kana glyph drawing, app sidebar, dashboards, or courses.

## Copy
- VI eyebrow: "NHỊP HỌC CỦA GIA ĐÌNH"; H1: "Hôm nay, ai sẽ học?"; subtitle: "Mỗi người một hành trình. Mỗi ngày một bước."; secondary: "Vào thử với tư cách khách".
- EN/日本語 must receive equivalent copy; keep locale switch behavior.

## Technical boundaries
- Keep changes isolated to `source/public/login-ui.js` and the existing, last-loaded `source/public/home-v2.css`; avoid adding another stylesheet or touching app content.
- Scope Home selectors under `.home-v2`; use isolated `.np-pin-*` classes for the temporary morphing modal. Preserve `NPLogin.enhance`, `NPFamilyAccess.open/enterGuest` and course routes.
- Do not reset existing learning `localStorage`, change profile IDs or activate a backend. The local-only PIN hash store is a separate key. On first avatar tap, create and confirm a 4–6 digit PIN; later taps require that profile’s PIN. Store a salted PBKDF2 hash, never a plaintext PIN. Other device/browser PINs are independent. Demo recovery resets PIN only without deleting progress.
- Only run new Home V2 DOM changes when `window.NP_STATIC_PUBLISH` is true. Legacy/template modes are untouched.
- Work only on `develop`; push triggers GitHub Pages build and deployment.

## Acceptance / manual QA
- 1366x768, 1920x1080, tablet (~820px), iPhone 390px and 360px; no clipped guest button, no horizontal scroll, readable text and adequate contrast.
- Light + dark, VI/EN/日本語.
- All four avatars clickable: tap morphs card into a larger focused PIN panel, first-time creation + confirmation, later unlock, incorrect PIN rejected, close/backdrop/Escape returns to gallery, Guest remains PIN-free. Names and N5/N2/N4/N4 stay correct.
- Guest enters without touching family profiles; after changing profile, existing demo notes/attempts remain.
- Build, learning QA and security checks pass; verify GitHub Pages deploy from `develop`.

## Design rationale
- The previous 43/57 split forced brand storytelling to compete with the actual task. The revised landing has **one heading and one gallery**.
- Use restrained paper/forest colors, editorial subtitle, real avatar images, consistent card proportions, calm hover/focus treatments, and visible 12px+ secondary text. No decorative menu duplication.
- Desktop 4-across, mobile 2x2; all four family members remain equally visible and Guest is clearly secondary.

## Local PIN animation addendum (2026-11-05)
- The clicked avatar card morphs to a 416px max-width panel with a translucent backdrop, 340ms easing, Escape/backdrop/close controls, numeric PIN input and keyboard focus management. Honors reduced-motion preferences and adjusts on mobile keyboard resize.
- Account security is **not** provided by the public static site. PIN only separates demo entry on a browser; public frontend code and local data remain accessible to anyone with device access. Future real authentication requires server-side verification.
- Files: `source/public/family-demo-auth.js`, `source/public/family-pin-ui.js`, `source/public/home-pin.css`, `source/public/login-ui.js`, `source/public/index.html`.
