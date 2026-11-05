# HORIZON — Identity / Website preview
Date: 2026-11-05 · branch: `develop` · **design preview, not a legal trademark clearance**

## Intent
HORIZON expresses a personal learning journey: each short study session
moves the learner a little closer to a goal, while expanding what they can
understand and explore. This is a brand for a learning product, not a travel
site and not a premium-gold fashion label.

**Tagline (verbatim):** `A little closer. A world wider.`

## Signature
- **Mark:** an abstract Latin H with two subtly Japanese brush-inspired
  strokes, bridged by a fine horizon arc; a small rising disc hints at a
  destination. It is symbolic, **not** an actual Japanese kana for the letter H.
- **Wordmark:** HORIZON, serif editorial setting, generous but controlled
  tracking. No unnecessary decorative monogram border on website navigation.
- **Ink:** forest green `#284B3B`.
- **Accent:** sage `#93A98B`.
- **Paper:** warm ivory `#F7F6F1`.
- **Tone:** warm, calm, contemporary Japanese-inspired minimalism;
  high contrast and sufficient touch target size, not glow/gold embellishments.

## Assets
- `source/public/assets/horizon-mark.svg`: green on ivory
- `source/public/assets/horizon-mark-light.svg`: off-white mark for forest/dark backgrounds
- `source/public/assets/horizon-app.svg`: app/favicon tile
- `source/public/assets/horizon-icon-180.png`: iOS home-screen icon
- `source/public/assets/horizon-icon-192.png`: installed app icon
- `source/public/assets/horizon-icon-512.png`: high-resolution installed app icon
- `source/public/horizon-brand.css`: last-loaded identity layer
- `tests/horizon-brand.test.mjs`: link and pixel integrity regression test

## Integration boundaries
1. Home and post-login shell share the brand. The Home story includes the
   tagline above the learner prompt; four people and guest are unchanged.
2. Login/PIN animation, PIN hashes, family profile IDs, notes, progress,
   Kana Studio, learning flows, D1 API contracts and routes are unchanged.
3. Existing `dqhuy1982-stack/NihongoPath` repository name, `main`,
   `develop`, Cloudflare service identifiers and database identifiers
   are **not** renamed just because the visual brand is HORIZON.
4. GitHub Pages is the static demo. Public visual branding is not
   a confirmation of trademark/domain availability or secure account access.
5. Cache-sensitive installation icons may require re-adding the website
   to the iPhone home screen if it was previously installed with the old icon.

## Next product ideas (not implemented)
- **Journey line:** one restrained progress strip that highlights the
  learner's *actual* next milestone, not a fictional % of a complete JLPT course.
- **Continue where you left off:** on returning from PIN, a single action
  to resume the learner's real last lesson instead of generic navigation.
- **Meaningful micro-motion:** only a very subtle sun/horizon reveal on brand
  hover or completion, with reduced-motion support. Never put motion ahead
  of accessibility or learning performance.
- **Design tokens:** share type scale, contrast palette and spacing rules
  across Dashboard, Learning Player and mobile screens before broad redesign.

## Review checklist
- 1366×768 desktop, 390px and 360px phones, light/dark, VI/EN/JA.
- No overflow in header; wordmark and locale control fit on phones.
- SVG logo recognizable at 24–42px; brand maintains contrast in sidebar.
- Four original high-quality family avatars, PIN morph, Guest, learning
  progress and saved notes remain intact.
- Home page has one clear action (choose a learner), and the tagline
  stays secondary to that functional heading.
