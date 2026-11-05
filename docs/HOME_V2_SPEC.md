# NIHONGO PATH — HOME V2 SPEC
Status: Implementing on `develop` · GitHub Pages demo only · 2026-11-05

## Decision
Turn landing/login into a focused learner picker. **Only actions that matter: choose one of four learners, or enter as guest.** Source, routes, stored profiles, avatar assets, one-tap logic, and Japanese-learning flows stay unchanged. Do not redesign the app after login.

## Priority and information hierarchy
1. Brand in header: Nihongo Path; theme and language switches remain operational. Remove "Family Atelier" and the competing "Khám phá hành trình" link from the landing header.
2. Intro: "Mỗi người một nhịp học." plus one brief sentence. No multi-paragraph philosophy, four lines of supporting copy, oversized illustration, or three benefit chips.
3. Primary action: "Hôm nay, ai sẽ học?" with four whole-card buttons (Quang Huy · N5, Vy Anh · N2, Nam Khánh · N4, Gia Hưng · N4), using current optimized avatar assets, in the existing profile order.
4. Secondary action: one discreet "Vào thử với tư cách khách" link/button. Guest must not update family learning records.
5. Remove bottom status/footer strip on landing; storage/privacy limitations remain available elsewhere in the application.

## Layout / geometry
- Desktop >= 851px: centered max-width ~1180px; ~43% quiet intro and ~57% learner selection, gap 40–75px; four cards in a 2x2 grid. Header roughly 74px. Above-the-fold at 1366x768 without cropping; when zoomed or in short windows, normal page scrolling is allowed.
- Tablet/mobile <= 850px: stack compact intro above selection; two-column avatar cards; guest control below. Never show horizontally scrolling controls. A 360px phone should show both columns; long names can wrap.
- Minimum 44px interactive target. Avatar ~80–90px; names 14–16px / weight >= 600; goal 12–13px, contrast >= 4.5:1 on card background.
- Do not increase global font size / affect Kana glyph drawing, app sidebar, dashboards, or courses.

## Copy
- VI eyebrow: "HỌC TIẾNG NHẬT CÙNG GIA ĐÌNH"; hero: "Mỗi người một nhịp học."; description: "Một nơi để học tiếng Nhật theo mục tiêu riêng, từng ngày một bước."; picker: "Hôm nay, ai sẽ học?"; hint: "Chọn hồ sơ để vào học ngay."; secondary: "Vào thử với tư cách khách".
- EN/日本語 must receive equivalent copy; keep locale switch behavior.

## Technical boundaries
- Touch only `source/public/login-ui.js` and add a last-loaded, scoped `source/public/home-v2.css`, plus `source/public/index.html` stylesheet link.
- Scope selectors under `.home-v2` to avoid regressions after login. Keep `NPLogin.enhance` and `NPFamilyAccess.open/enterGuest` as contract.
- Do not reset `localStorage`, change profile IDs, add PIN/login, or activate a backend.
- Only run new Home V2 DOM changes when `window.NP_STATIC_PUBLISH` is true. Legacy/template modes are untouched.
- Work only on `develop`; push triggers GitHub Pages build and deployment.

## Acceptance / manual QA
- 1366x768, 1920x1080, tablet (~820px), iPhone 390px and 360px; no clipped guest button / footer; no horizontal scroll; adequate contrast.
- Light + dark, VI/EN/日本語.
- All four avatars clickable: one tap enters the correct learner, names and N5/N2/N4/N4 correctly displayed; back/switch returns to selection.
- Guest enters without touching family profiles; after changing profile, existing demo notes/attempts remain.
- Build, learning QA and security checks pass; verify GitHub Pages deploy from `develop`.
