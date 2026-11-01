# Atelier 10 — adaptive preference and avatar-first entry

Decision approved in this conversation: **A / Adaptive** is the default. Continue
first and Review first remain optional learning preferences, saved per learner.
The original paper/forest/champagne identity, fonts, logo and Home–Login story
remain the reference. This is still a static prototype, not backend authentication.

## Priority policy

`dist/advice-policy.js` is a pure shared policy used by both the original sample
dashboard and the fictional-data workspace. It receives evidence, not names.

| Preference | Ordinary behavior | Shared exceptions |
| --- | --- | --- |
| Adaptive (default) | Continue pending work; briefly review first only when repeated errors or slow recall relate to skills needed by that work | New learner gets a first step; returning after a break gets a gentle session |
| Continue first | Resume pending work before ordinary review | Same gentle-return/first-step behavior |
| Review first | Select a manageable review segment before continuing | If there is nothing to review, use available learning content |

The simulation explicitly links `content.requiredSkillIds` to question skills.
Unrelated old mistakes do not interrupt an unfinished lesson in Adaptive mode.
Missing dependency metadata defaults to continuing, not inventing a blocker.
These are editable editorial links and demo thresholds, not a validated learner
diagnosis. The legacy sample dashboard only uses the evidence actually recorded
there; it does not claim the simulation's automatic due queue exists there.

- Real prototype profiles: `prefs.studyPriority`, in Settings → Learning.
- Fictional profiles: `learnerUpdates[learnerId].studyPriority`, via `#demo-settings`.
- Mode changes leave goals, historical answers and content versions intact.
- JSON/SQLite fixtures include the default preference and skill links. Existing
  browser fixtures without a preference automatically use Adaptive.

## Avatar-first login

The approved Home–Login still introduces the learning space on the left. On the
right, four larger portraits form a two-column grid. Guest and other profiles
stay accessible. Additional learners remain reachable through Other profiles.

One tap on a portrait opens the existing native dialog with learner identity,
goal, session duration and a password-style code field. The field receives focus
synchronously in that tap event; no extra click into it is needed. No code is
automatically filled, no real password is stored, and the demo form still accepts
only the public sample code `PATH-DEMO`.

- Enter submits; invalid code leaves the dialog open and returns focus to input.
- Escape, Close and Choose another learner return focus to the originating tile.
- Native dialog provides modal keyboard containment. Show/hide retains the input.
- The remembered choice remains a learner selection, not a saved password.
- Visual viewport resize caps dialog height; its focused field is scrolled into
  view. This is not a claim of testing the actual iPhone software keyboard.
- Header language changes rebuild the new login labels with focus retained.
- Theme follows the selected profile using the existing theme behavior.

## Reusable visual contract

| Component/token | Value or behavior |
| --- | --- |
| Portrait size | 104px desktop/tablet; 90px mobile; 86px short desktop |
| Portrait tile | Two-column grid, text wraps, touch area much larger than 44px |
| Tile radius | `--portal-radius: 24px` |
| Tile gap | `--portal-gap: 20px`, tightened on mobile/short screens |
| Portrait ring | Thin existing champagne/sage detail, slight hover lift |
| Dialog | Max 460px, 26px radius; fits ordinary viewports, scrolls without visible scrollbar only when needed |
| Code field | 16px text, 56px high, visible focus, label and error association |
| Motion | 200ms entry; disabled by OS or learner reduced-motion preference |
| Priority fields | One reusable `NPStudyPreferences.fields()` renderer for both profile systems |

## Before / after

Open `login-compare.html`. PC, Tablet and Mobile buttons set real iframe viewport
sizes. The before column renders the retained original inline form using
`?login-view=before#login`; the after column renders the new interactive entry.
Both use the same profile data and identity assets. Full-screen links are provided.
This comparison page is a design-review tool, not part of the learner journey.

## Relevant files

- `dist/login-ui.js`, `dist/login-ui.css`: portrait selection and dialog.
- `dist/app.js`: existing login delegates to the new view; existing form submission
  contract remains; learning settings persist the selected priority.
- `dist/advice-policy.js`: shared pure decision policy.
- `dist/study-preferences.js`, `dist/study-preferences.css`: reusable preference UI.
- `dist/study.js`: sample dashboard uses the selected priority and recorded evidence.
- `dist/demo-engine.js`, `dist/demo.js`: simulation policy and preference screen.
- `scripts/build-demo.py`: fixture defaults, rules and content skill dependencies.

No production authentication, database provider or external API was selected.
