# Atelier 07 verification

Verified in the managed browser preview before publication:

- Home–Login at 360×640 in Vietnamese, English and Japanese: document width and height match the viewport, with no horizontal or vertical overflow in the normal state.
- Dark Home–Login and dark dashboard visually reviewed; choosing dark/light persists per learner. Switching to Learner B restored her light preference and N2 goal without changing Learner A's preference.
- Dashboard at 1366×650: sidebar clientHeight = scrollHeight = 614; primary reading button bottom approximately 633px. No horizontal overflow.
- Dashboard at 390×844: primary reading action visible above bottom navigation.
- Mobile 360×640: representative character profiles (Aoi, Mai, Jiwoo), N5/N2/N1 readings, dashboard, appearance settings and reports have no horizontal overflow.
- Cast directory contains 24 cards; Kenta's profile renders organization, role, career stages, motivations and linked people.
- N4 reading: incorrect answer remains recorded, feedback is available, completion saves one result, journal save works and the situation is offered for review.
- N2 reading: pausing at the question, reloading the application, and continuing returns to the same question. A correct answer can be completed.
- Learner A's test journal entry is absent from Learner B's journal. This verifies browser-local profile separation, not server authorization.
- Cast integrity script: 24 unique IDs, valid organization references, three history stages per profile, valid relationship endpoints and story-arc membership.
- JavaScript syntax checks passed for the application, journey extension, world bundle and added locale labels.

Not claimed: WCAG certification, full translation of profile narrative, production authorization, audio, AI, spaced-review scheduling, full N5–N1 curriculum, or offline synchronization. Small-screen checks use an iframe with the stated CSS viewport, not real iPhone hardware or software-keyboard testing.
