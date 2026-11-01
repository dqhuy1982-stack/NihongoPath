# Atelier 08 verification

Checked in the managed preview browser:

- Home–Login at 360×640 in VI/EN/JA: scroll width = viewport width and scroll height = viewport height.
- Dashboard, journey, practice centre, sample result, display settings and assistant at 360×640: no horizontal overflow in the checked states.
- Dashboard, journey and practice centre in English and Japanese at 360×640: no horizontal overflow.
- Dashboard mobile VI: primary assistant CTA bottom about 487px; bottom navigation begins at 574px. No character introduction panel is rendered.
- Laptop 1366×650: sidebar clientHeight = scrollHeight = 614; assistant CTA remains in the viewport. The checked Japanese state had no horizontal overflow.
- Dark dashboard: new assistant surface, champagne action emphasis and absence of the former character panel visually/state-checked.
- N2 sample practice: complete question 1, select an incorrect option for question 2, pause, reload, resume through the Dashboard assistant, and finish. Selected answer survived reload; result was 1/2 with explanations and related-lesson links.
- Journey: selecting N2 updates the detail card. Guided tour advances automatically through the stages and ends at N1. Focusing the planning form stops the tour.
- Planning calculation: self-selected N2 start, 250 assumed hours plus 20% buffer = 300h. At 60 minutes × 5 days/week, estimate = 60 weeks; at 120 minutes × 5 days/week, estimate = 30 weeks. These are explicit illustrative assumptions, not JLPT standards.
- PNG icons validated at 180×180, 192×192, 512×512, with an opaque brand background. No physical iPhone installation test was performed.
- Static bank validation: five sets, ten unique question IDs, valid answer indexes, three-language explanations and related-reading references. JavaScript syntax checks passed.

The responsive checks use iframe CSS viewports, not physical iPhone hardware. No production auth, accessibility certification, full mock-exam validation, AI, official-score conversion, audio, automatic review scheduling or offline sync is claimed.
