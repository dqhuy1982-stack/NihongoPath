# HORIZON — HOME V5
Date: 2026-11-06
Branch: develop

## Reason for update
Review screenshot showed the first learner card ending earlier than the remaining three, with its name/divider/goal visually shifted upwards. Rather than compensating with per-learner margins, use one explicit profile-card grid with identical tracks and margins for all four learners.

## Visual decisions
- Keep Fuji panorama, centered HORIZON lockup, 4 seasonal icon buttons and existing responsive navigation.
- Give portraits priority: reduce card gold-line intensity, wave/motif opacity and shadow.
- Use identical card geometry for every learner. Force first and subsequent siblings through the same layout rules; center portrait, name, fine divider, current stage, current focus.
- Name has a dedicated row, so different descriptive lengths do not shift the next element.
- Desktop: four columns. Tablet/phone: two columns. Short laptops use compressed shared tracks.
- Preserve grayscale-to-color hover/focus behavior in V4. No avatar modification.
- Retain light/dark, VI/EN/JA, keyboard focus and reduced-motion support.

## Technical boundary
- Additive `source/public/home-v5.css` loaded last from `index.html`; `home-v4.css` retained for simple rollback.
- No changes to stored profile data, PIN logic, Cloudflare D1, lesson routes, learning progress, avatar assets or season persistence.
- GitHub Pages builds on develop; main branch remains untouched.

## QA
- Static source regression tests verify stylesheet order, same tracks for all cards, breakpoints, reduced-motion and dark-mode rules.
- Manual browser QA still needed at real desktop and iPhone viewport sizes after Pages finishes publishing; source tests alone cannot prove pixel-level alignment.
