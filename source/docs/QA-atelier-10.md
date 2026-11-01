# Atelier 10 QA — 01 November 2026

- 17 Node behavioral tests pass: existing learning/session contract plus default
  Adaptive policy, related/unrelated blockers, alternate plan order, preference
  persistence and learner isolation. Rebuild fixture checks SQLite integrity and
  foreign keys.
- Browser: portrait tap opens code dialog and focuses `demo-access-code` without
  a second click. Enter with the public sample code opened the chosen Learner B
  profile, not the previous profile.
- Invalid sample code shows inline feedback, retains the dialog and focuses the
  input. Escape returns focus to the originating portrait. Switching portraits
  opens the correct name, goal and duration.
- Browser learning settings: Continue first remained selected after save/reload.
  In the fictional Minh profile, Continue first produced 4 minutes continuation
  + 1 minute review; Review first produced 3 minutes review + 2 minutes continuation.
  Adaptive was restored after QA.
- PC (1366×900), tablet (768×1024), mobile (390×844), and narrow mobile
  (360×740) were inspected. Final settled layouts did not overflow horizontally.
  An initial read immediately after iframe resize observed stale desktop classes;
  subsequent checks waited for the compact class before measuring.
- At 360px width, portrait was 90px; page scrollWidth equalled clientWidth.
  At 768px width, portrait was 104px and tile width 142.5px, without overlap.
- Narrow dialog: width 313px including scrollbar/border; no horizontal overflow.
  At simulated height 420px, dialog height was 400px; focused input was visible
  between approximately 296 and 352px. This tests layout under reduced height,
  not an actual iPhone keyboard.
- Dark mobile dialog and VI/EN/JA labels were checked. New language labels were
  fixed to rebuild on language change; preference radio drafts are retained.
- Reduced motion supports both OS preference and existing learner preference.
- New muted dialog note color was measured at approximately 4.91:1 on its light
  surface. This is a spot check, not whole-site WCAG certification.
- The Superdesign CLI preflight was blocked by automatic review because it tried
  additional telemetry to an untrusted endpoint with an unknown payload. It was
  not retried or bypassed. UI changes used the existing source and design assets.

Only public sample codes were used. Testing took place in the local preview, not
against real learner authentication. Existing Site access was retained.
