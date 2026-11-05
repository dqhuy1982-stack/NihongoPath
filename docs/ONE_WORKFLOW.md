# NIHONGO PATH — one GitHub Pages development flow

## Current deployment (November 2026)

- **One source:** [dqhuy1982-stack/NihongoPath](https://github.com/dqhuy1982-stack/NihongoPath), active branch `develop` on home/office PCs.
- **One live web demo:** https://dqhuy1982-stack.github.io/NihongoPath/
- **One automatic pipeline:** `.github/workflows/pages.yml` builds `dist/site` and deploys GitHub Pages after changes to `develop`.
- **No live API, Firebase, D1 or server auth** is used by this GitHub Pages demo. Old Cloudflare configs remain in repository history for possible future migration, but are not the website or learning backend.
- `main` is the older release branch and is not the active development branch.

## Profiles and the demo "database"

The GitHub Pages app seeds four separate profiles (`demo-a` through `demo-d`)
with their own goal, recommended path, shortcuts, editable starter note,
learning history and Kana data:

| Profile | Goal / study focus | Actual currently available material |
|---|---|---|
| Bố | Kana → N5 | Kana, Foundation, N5 pilot |
| Vy Anh | N2 reading/listening prep | N2 is **planned**; only Foundation / N5 pilot is currently interactive |
| Khánh | N5 and school conversations | Kana and N5 pilot |
| Hưng | Foundation: Hiragana / Katakana | Kana Writing Studio and Foundation pilot |

These paths are **proposed demo goals**, not assessments or proof of completed
learning. Notes shipped with the app are clearly marked demo and editable.
Four optimized portraits supplied by the user are included in the **public**
repository and public website. No real PINs are shipped in source.

Profiles and learning progress are persisted locally via browser storage
(`nihongo-path-flow-review-v3`, plus the lesson/Kana stores). This behaves
like a local demo database: **each PC/browser/iPhone has separate data**.
GitHub Pages does **not** sync learning state between devices.

## Demo PIN and Guest behavior

- Tap an avatar → first time **create a 4–6-digit PIN on that device**.
  Later taps require that PIN. PIN verification runs in the browser.
- The PIN salt/hash is in localStorage; only the selected session ID is kept
  in sessionStorage while the browser tab remains open. The PIN does **not**
  travel through GitHub or between devices; configure separately on each.
- Anyone with browser storage/developer tools can bypass or reset a local PIN.
  This is a UI interaction demo, **not** real account security.
- **Guest** requires no PIN. Guest state is kept out of the four local profile
  records, and Guest cannot enter family management or content admin screens.
- The four profile photos and visible names are publicly accessible. Avoid
  using private personal details or genuine credentials in this demo.
- On first release the app migrates any old generic "Learner A–D" profiles to
  new labels while preserving old learning data. Non-empty custom notes are
  not overwritten.

## Dev workflow on either PC

```powershell
cd C:\Dev\NihongoPath
git status -sb
git fetch origin
git switch develop
git pull --ff-only origin develop
```

When code changes are reviewed and approved, commit and push only intended
source files to `develop`. GitHub Actions deploys the validated static site.
No `wrangler deploy`, Firebase project, extra repository, second website or
manual PowerShell build is necessary for updates.

Public code/photos are not protected by the PIN. A future multi-device data
sync requirement needs an authenticated online database separately; GitHub
Pages alone cannot provide it.
