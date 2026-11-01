# Kana audio (development only until iPhone QA passes)

## Current primary source

**Kana Sounds** dataset by Arsalan Anwari:
https://huggingface.co/datasets/arsalan-anwari/kana-sounds

- Original pronunciation recordings: **FUN Japanese Learning**.
- Dataset curation/distribution: **Arsalan Anwari**.
- License stated in dataset: **Creative Commons Attribution 4.0 (CC BY 4.0)**.
- 46 MP3 files in `audio/seion/` correspond to the 46 basic sounds shared by Hiragana and Katakana (92 characters).
- Short recordings from one reader, typically approximately 0.5–1.1 seconds each as documented by the dataset.
- Original MP3 files are kept unchanged, with names such as `a.mp3`, `chi.mp3`, `n.mp3`.
- See `ATTRIBUTION.txt` for a text notice included in the published static preview.

## Why it changed

The previous attempt used Wikimedia Commons transcoded MP3 endpoints. A November 1, 2026 local Windows download returned **HTTP 429 / robot-policy rejection for all 46 requests**. That source is no longer requested by the running Studio audio path. Do not rerun the old downloader or attempt to circumvent the service's access policy.

## Packaging and verification

1. Pull the `develop` branch. The new `scripts/Download-Kana-Audio.ps1` uses Hugging Face `resolve/main/audio/seion/<romaji>.mp3`.
2. Run it on the local Windows PC from the repository directory.
3. The downloader stops on the first server rejection; it does not retry or bypass access controls.
4. Check for 46 verified MP3 files; the `pack.json` manifest appears **only when all 46 exist**.
5. The existing Studio reads `pack.json` at startup and then plays same-origin `assets/kana-audio/<romaji>.mp3`. Its fallback is the system Japanese voice if the local pack is absent.
6. Test on Safari iPhone: `あ`, `か`, `し`, `ア`, selecting a new letter with auto-read on and with audio manually.

**Not yet verified:** Hugging Face accessibility from the user's Windows network, full local download, actual iPhone audio playback, and external GitHub Pages deployment. Do not claim these work until device acceptance.

## Separate rights

Only the audio pack is licensed CC BY 4.0. Other `source/public` code, artwork and AnimCJK stroke SVGs retain their own notices and terms. Preserve all existing notices.

Source project: https://github.com/arsalan-anwari/kana-trainer
License description: https://creativecommons.org/licenses/by/4.0/
