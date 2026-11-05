# HORIZON — HOME V4 (live, develop)
Design: restrained Fuji landscape · four seasons · circular family portraits · tonal reveal on hover
Date: 2026-11-05

## Approved direction
The previous editorial/arch portrait gallery felt impersonal. V4 follows the selected luxury mockup with a calm ivory paper finish, a muted Fuji and lake in the far background, a centered HORIZON signature, and four **individual** portrait cards with fine understated seasonal details. This is implemented as reusable website UI, not the supplied screenshot baked into a background.

## Assets and layout
- The four `assets/horizon-fuji-{spring,summer,autumn,winter}.svg` files contain **background artwork only**: no text, people or clickable interface elements. Color palette varies softly by season.
- `assets/horizon-waves.svg` and `assets/horizon-motif-{spring,summer,autumn,winter}.svg` are small reusable vector accents, not complex ornamental patterns.
- Home is scoped to `.home-v4.home-v3.home-v2` with `home-v4.css` loaded after V3. Sidebar and lesson pages retain their existing CSS.
- Learner portrait windows are **circular**, with fine gold/olive hairlines. No existing avatar file is recompressed, altered or replaced.
- Desktop pointer devices: portraits use a non-destructive gray-muted CSS filter and return to high-clarity, full natural color on **hover or keyboard focus**, with a subtle elevation. Touch screens keep a much lighter desaturation because no hover exists. Reduced-motion preferences disable transitions.
- Home greeting: `Hôm nay, ai sẽ tiếp tục hành trình?` and helper `Chọn hồ sơ để trở lại nhịp học của mình.`, localized to VI/EN/JA.
- Profile subtitles read the actual stored `goal` and `studyFocus` (fallback `purpose`); no exam date is hard-coded, so updated learner information appears on the next render.
- A small season selector in Home header changes **Home background only**, saving `np-home-season-v1`. The season decorative assignment of four cards is visual, not a mapping of academic level or learner identity. It does not update any learner profile.
- Existing family one-tap card → morphing local PIN overlay and PIN hashing remain intact. Guest entry is a secondary text action below the grid.

## QA acceptance
- Desktop: 4 columns, room for guest below on common laptop heights; 2 columns on phone/tablet; no horizontal overflow, default page may scroll vertically.
- Header season and locale selectors must be solid, not blurry on iPhone Safari.
- Four personal images should be recognizable on mobile, but gray-muted on desktop until hovered/focused.
- Light/dark mode, focus ring, keyboard activation, Escape/backdrop close PIN and reduced motion are retained.
- GitHub Pages uses `develop`; `main` and Cloudflare D1/Workers are not migrated or renamed. The Cloudflare Workers build is a separate deployment and should not be conflated with GitHub Pages.
- New regression gate: `tests/home-v4.test.mjs`; this proves source invariants, **not actual physical-device visual QA**.

## Deliberately not included
- No automatic seasonal theme based on geography, user birthday, device clock or learner goal.
- No real authentication or cross-device sharing of this local theme/PIN.
- No new study progress metrics or fabricated learner milestone dates.
