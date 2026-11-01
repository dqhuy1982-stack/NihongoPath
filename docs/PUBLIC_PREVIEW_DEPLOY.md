# NIHONGO PATH — Public Preview Deployment

Status: **Prepared on develop, NOT published.** Main branch and ChatGPT Site remain untouched.

## Source-of-truth and safety

- Authoritative project source: the existing private `dqhuy1982-stack/NihongoPath`, protected `main`, active `develop`.
- Public preview is a **disposable deployment artifact**, not another independent app or source branch.
- Never change the original repository to **Public**.
- Only `source/public` static files are copied. No backend (`source/server`), database (`source/db`), `app`, `worker`, `drizzle`, environment variables, or live user data.
- The exporter excludes old design-comparison HTML pages and adds a preboot script forcing `?mode=demo` for the public preview.
- A Pages URL is **public**, not password-protected. Do not enter real passwords or personal data in prototype forms.
- Demo progress is stored in **localStorage per device/browser**, not synchronized between PC and iPhone. Cloud-hosted real learner profiles/progress will require a separately reviewed backend deployment.
- The 46 recorded Kana sounds currently use remote Wikimedia MP3 transcodes; they require connectivity and device QA. Do not claim iPhone sound is fixed until physically tested.

## Prepare same-origin Kana MP3 recordings (recommended before external publishing)

Previous iPhone Safari QA reported silence. Direct cross-domain Wikimedia audio is not a reliable production dependency. The Studio now detects a complete local pack `source/public/assets/kana-audio/pack.json` and uses `assets/kana-audio/<romaji>.mp3` from its own host.

After Fetch/Pull `develop`, on a PC with internet run:

```powershell
cd C:\Dev\NihongoPath
.\scripts\Download-Kana-Audio.ps1
```

- The downloader checks all 46 audio paths against the Commons filename hashes, validates MP3 signatures and only writes the activating `pack.json` when all 46 files are present.
- Rerunning reuses existing audio files; it does not change the backend or any learner data.
- Review the third-party provenance and public-domain claims in `source/public/assets/kana-audio/README.md` before shipping. Check the playback length and quality: some original recordings are long for flashcard use.
- Commit the downloaded `source/public/assets/kana-audio/*.mp3` and `pack.json` **only to develop** using GitHub Desktop, then Push origin.
- Localhost and GitHub Pages/Cloudflare Pages will load sound from the **same origin** when the pack is present. Do not assume this works until physical iPhone playback is confirmed.
- Never download third-party audio without license checking for new sources; this mapping is limited to the identified Commons files.

## Option A — GitHub Pages on GitHub Free (separate **static-only public deployment** repo)

This option works without GitHub Pro while keeping the original repo private.

1. In GitHub Desktop open **NihongoPath**, ensure Current branch `develop`, **Fetch origin → Pull origin**.
2. Open PowerShell:

   ```powershell
   cd C:\Dev\NihongoPath
   .\scripts\Prepare-GitHub-Pages.ps1
   ```

   The script checks the v4 Studio is present, builds `dist/public-preview`, then prepares `C:\Dev\NihongoPath-Public-Demo` as a **new local Git repo**. It does **not** upload or publish anything.

3. In GitHub Desktop: **File → Add local repository**, select `C:\Dev\NihongoPath-Public-Demo`. If prompted to create a repository there, accept. All changes will be in the new demo repository, never the original `NihongoPath`.
4. Enter commit summary `Initial safe static preview`, **Commit to main**.
5. Click **Publish repository**. Give it a distinct name `NihongoPath-Public-Demo` and **uncheck "Keep this code private"** only for this new repo.
6. Open new public repository → **Settings → Pages → Build and deployment → Source: Deploy from a branch → main / (root) → Save**.
7. Once GitHub reports deployment completed and offers **Visit site**, use its actual link, typically `https://dqhuy1982-stack.github.io/NihongoPath-Public-Demo/?mode=demo#kana`. This address is a **pattern, not a claim that the site currently exists**.
8. Test iPhone off local Wi-Fi using mobile data. The demo does not require the PC server to keep running.

For later releases, re-build source from the private repository, review the generated diff and update **only the static demo repo**. Do not add server or secrets, and do not independently edit the public deployment repo.

## Option B — Cloudflare Pages connected to the **private** GitHub repo (no public code repo)

Official instructions: https://developers.cloudflare.com/pages/get-started/git-integration/

If you want source private and a public URL without a second GitHub repo:

1. Cloudflare dashboard → **Workers & Pages → Create application → Pages → Connect to Git**.
2. Authorize access to **only** `dqhuy1982-stack/NihongoPath` and select that private repo.
3. Set **Production branch** to `develop` **for the current testing phase only**. Future production should be pinned to an approved release branch instead of work-in-progress.
4. Framework preset: **None**; repository root directory: `/`; **Build command**: `node scripts/build-public-preview.cjs`; **Build output directory**: `dist/public-preview`.
5. Deploy; after Cloudflare reports success, use the real assigned `*.pages.dev` URL with `?mode=demo#kana`.
6. Verify remote loading, ungraded local progress, three-step iPhone layout, and audio. A Git push to a branch configured for deployment may publish changes automatically, so control build settings appropriately.

This is still a GitHub-source workflow; hosting is Cloudflare rather than GitHub Pages. It avoids making source public and avoids an independent demo codebase.

## Audio QA before accepting release

1. Confirm local `source/public/kana-studio.js` has `playKana(glyph(w))` and `ks-page-focus`, and `kana-studio.css` has `body.ks-page-focus #main`. If not, local GitHub Desktop has not pulled v4.
2. On iPhone use Safari and touch **Nghe âm** for `あ`; then try `し`, `か`, `ア`. Turn up volume and test with mobile data as well as Wi-Fi.
3. If no sound, open the **Hướng dẫn nét & nguồn** details and test **Nguồn ghi âm** directly; compare source webpage playback with the Studio. This isolates whether it is a blocked/absent media file or site playback issue.
4. If remote Wikimedia recordings remain unreliable, acquire and validate a complete licensed **local audio pack** for every one of the 46 sounds, host it as static assets, then remove cross-origin streaming. No new source/download should be represented as locally bundled until present and verified.
5. Visually check PC at 100% zoom. v4 uses one-viewport workspace only for widths >=1024 and viewport heights >=680; small screens scroll normally.
6. Do not merge to original `main` or deploy the live Site until tests pass.

Official references:
- GitHub Pages plans and private repositories: https://docs.github.com/en/pages/getting-started-with-github-pages
- GitHub Pages publishing from main root: https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site
- GitHub Desktop publishing: https://docs.github.com/en/desktop/adding-and-cloning-repositories/adding-an-existing-project-to-github-using-github-desktop
