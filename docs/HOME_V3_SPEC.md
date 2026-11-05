# HORIZON — HOME V3 SPEC
## Centered brand lockup · implementation and acceptance

**Scope:** GitHub Pages family demo on `develop`, Home / `#login` only. **Do not redesign Dashboard, Kana Studio, PIN, learning data, backend or routes.** Keep `main` untouched. Identity stays ivory, forest green and sage.

### 1. Objective
Home is a quiet welcome space. The prior Home placed the logo in a left-aligned header and the slogan in a separate hero; the oversized heading competed with both. The logo's upper terminals also look clipped. V3 is a **single centered brand signature** above a concise functional learner choice.

### 2. Visual order
1. Top-right existing theme/language controls. **Remove duplicated logo from the Home header only**.
2. Centered lockup: abstract H monogram with horizon line + rising dot, `HORIZON` wordmark, exact line `A little closer. A world wider.` immediately below. Do not add a border, gold glow or landscape.
3. One localized functional H1: `Hôm nay, ai sẽ học?` / `Who is learning today?` / `今日は、だれが学ぶ？`; smaller than the brand identity.
4. One helper sentence: `Chọn hồ sơ để tiếp tục hành trình của bạn.` / `Choose your profile and continue your journey.` / `プロフィールを選んで学びの続きを始めましょう。`
5. Four unchanged learners: Quang Huy N5, Vy Anh N2, Nam Khánh N4, Gia Hưng N4. Desktop 4-across, phone 2×2.
6. Subordinate Guest link underneath; no guide link, footer strip, fake progress bar or extra marketing paragraphs.

### 3. Brand geometry
- The mark is an abstract Latin H influenced by brush strokes, **not a literal Japanese kana**.
- SVG has smooth upper terminals, `preserveAspectRatio="xMidYMid meet"`, **extra viewBox padding on all sides**, uninterrupted horizon curve; never stretch it into a square.
- Hero mark approx 96–116px width desktop, 80–92px phone. Wordmark approx 38–48px desktop and 29–35px phone, serif with restrained tracking; slogan 17–21px / 15–17px, italic.
- Use empty image alt where the adjacent wordmark text conveys the brand. Preserve dark/light variants and legible side navigation.

### 4. Layout and accessibility
- 1366×768 desktop: logo, question, four cards and Guest should be visible without clipped content or internal scrollbar.
- 1920×1080 desktop: center with max-width ~1100px, not stretched.
- 820px tablet: compact 2×2 when appropriate.
- 390×844 and 360×700 iPhones: 2×2 cards, 44px+ touch targets, natural vertical scrolling if needed, no horizontal overflow.
- VI/EN/JA, dark mode, 200% zoom and reduced motion all remain usable. Do not animate a fixed header or add competing decorative elements.

### 5. Implementation boundaries
- `source/public/login-ui.js` static family landing (`window.NP_STATIC_PUBLISH && !window.NP_FAMILY_SYNC`): add `home-v3`, remove Home-only header brand, render grouped mark/wordmark/tagline in `.atelier-story`. Retain `home-v2` for existing card and PIN hooks.
- Scope any new Home overrides under `.home-v3`; the last stylesheet should be `source/public/home-v3.css`.
- Refine the *shared* HORIZON SVG assets, preserving the brand's meaning and colors. Refresh cache-sensitive URLs.
- Do **not** change the stored profile IDs, learner storage keys, PIN authentication, account route guards, avatar files, classroom/Kana components or remote data contracts.

### 6. Acceptance / tests
- One centered brand lockup, one visible HORIZON wordmark, exact tagline and no duplicate Home header logo.
- Four profile cards with same names/targets, Guest separate, click → animated PIN modal; wrong PIN fails, proper PIN routes, close restores card. No desktop scrollbar flash.
- Correct SVG aspect and breathing room, readable on phone, clean EN/JA wraps, light/dark.
- JS syntax + Home tests + brand tests + Learning QA + Security Gate + GitHub Pages build/deploy all pass on `develop`.

**Principle:** Brand first, learning next. Suggest journey through the symbol, not extra decoration.

## 7. Editorial Portrait Gallery refinement (2026-11-05)
The first Home V3 implementation was functional but visually over-structured: the
welcome question occupied two lines on desktop; four outlined rectangles with
number badges and corner arrows resembled an enterprise account picker; images
were only 96px and did not carry the brand's warmth.

### Final desktop direction
- Keep the centered HORIZON signature and tagline as one intentional lockup.
- Override legacy `.atelier-story h1>span,em { display:block }`: keep the
  functional question **on one line on desktop**, with natural wrap on narrow phones.
- Replace **four framed cards** with a **single editorial portrait gallery**:
  hairline upper/lower rules, faint vertical separators, generous open columns.
  No numbers (01–04), northeast arrows, floating-box shadows or saturated accents.
- Portraits become the primary visual anchors: approx **156 × 174px** arched
  silhouettes in the high-resolution original family photos; quiet hover lift and
  restrained image shadow. Show learner names and their actual N5/N2/N4/N4 goals.
- Each full portrait column is still a button and keeps its existing PIN morph,
  keyboard focus, Guest action and learning session ownership unchanged.
- A short desktop viewport compacts to a ~121 × 137px portrait; phones use a
  calm 2×2 touch grid with smaller framed hit areas and natural page scrolling.
- Keep the site's forest/ivory palette, dark-mode contrast, accessible focus and
  reduced-motion handling. Do not force nonfunctional progress indicators.

### Visual QA
- The team inspected the user's 2026-11-05 1906×1030 PC screenshot and made
  a local layout-only mock at 1658×896, 1366×768, 390×844 and 360×700.
  These local mock checks **do not** replace actual live-site/browser QA.
- Automated source tests now check editorial separators, arched photo sizing,
  badge removal, dark mode, breakpoints and preservation of PIN/Guest routes.
- Changed source is limited to `source/public/home-v3.css` and associated tests;
  baseline, `main`, shared account logic, photos and Kana components stay unchanged.
