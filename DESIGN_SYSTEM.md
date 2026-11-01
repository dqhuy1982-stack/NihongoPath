# Design system — preserve the baseline

Baseline audited 1 November 2026 (Asia/Tokyo). Site v15, commit `6e70f8eb5fdd7dd7737d37e3a23f600928e883b7`.
Site: https://nihongo-path-flow-review.aceticlotus.chatgpt.site
Project: `appgprj_6ae5d9599a0c819181446dd84e6553a9`.
This is an export for continued development of the same product. No Site publishing, access changes, live-data export or database migration was performed by this handoff task.

## Authoritative sources and cascade
Do not replace style layers with a newly approximated theme. `public/index.html` loads, in order: `styles.css`, `polish.css`, `access.css`, `atelier.css`, `journey.css`, `study.css`, `demo.css`, `login-ui.css`, `study-preferences.css`, `lesson.css`, `admin.css`, then `pilot-online.css`, `kana-studio.css`. Later rules and selector specificity matter. This documentation is not a substitute for that cascade.

## Core Atelier tokens
| Token | Light baseline |
|---|---|
| `--bg` | `#f5f3ed` |
| `--surface` | `#fffefa` |
| `--text` | `#223e3b` |
| `--navy` | `#203b38` |
| `--green` | `#496557` |
| `--gold` | `#b39868` |
| `--muted` | `#73796f` |
| `--line` | `#dedfd5` |

Dark mode uses `body.dark` token overrides from existing layers; retain the complete rules. `polish.css` dark baseline includes bg `#152330`, surface `#1f303f`, paper `#263a4a`, text `#edf0e9`, muted `#afbbb9`, line `#3a4d56`, sage `#2c4338`, lavender `#354051`, green `#6e9472`. Do not copy light `:root` values onto a more specific dark selector.

## Typography and assets
Locally bundled Manrope variable sans; Newsreader normal/italic display; Noto Serif JP UI subset and OS Japanese fallbacks. Preserve font files, weight ranges and fallback stacks. General Japanese learning text uses `--jp-size` (28px default), adjustable preferences. Do not assume the JP subset covers future lesson text. Font notices and Kana licensing remain in source assets.

Preserve `assets/n-mark*.svg`, existing app icons, Michi and illustration placement. Personal portraits are replaced by neutral demo icons solely in the export; restore upstream portraits on reintegration by leaving original asset files untouched.

## Layout and sizing
Five primary navigation destinations, desktop sidebar and phone bottom navigation. `polish.css` sets nav width 236px, reducing to 80px for intermediate desktop widths. Earlier base values remain fallback. Existing layout uses component-specific spacing; no single universal spacing scale is implemented. Lesson variables: width 980px, space 24px, radius 20px, accent from green. Preserve existing min-heights, grid minmax constraints, long-text wrapping and safe-area handling.

Breakpoints are module-specific: general shell 1000px with mobile transition around 760px; compact rules 600px; Atelier extra rules 390px and viewport-height conditions. Kana Studio: >1200px three-column treatment, <=1200px adjustments, <=767px phone steps. Lesson rules include 1100px. These are actual CSS boundaries, not a newly standardized breakpoint system.

## Interaction invariants
Avatar entry maintains dialog focus and spacing. Question selection/token changes update locally without replacing the whole viewport. Keep token panel height stable; phone check/continue actions stay above bottom navigation. In Studio keep explicit animation start, selected stroke state, readable Japanese, usable touch targets, pointer cancellation handling and canvas `touch-action` restricted to the drawing surface. Retain focus-visible states, skip link, reduced-motion rules and selectable learning text.

## Review before integration
Compare PC 1440px, tablet/intermediate width, phone 390px and 375px in both themes. Check short viewport/keyboard, large Japanese preference, narrow token rows and long translations. Browser/source validation is not physical Safari or accessibility certification. Capture fresh upstream visual references at integration time; historical screenshots omitted here contain personal data.
