# Kana pronunciation source — development preview

Nihongo Path Kana Writing Studio v4 currently plays **remote Wikimedia Commons MP3 transcodes**, not browser-generated speech as its primary path.

- 46 recorded syllables are mapped to 92 basic Hiragana/Katakana characters in `source/public/kana-studio.js`.
- Primary recording collection: [Audio files of hiragana (set by Hakatanoshio117117)](https://commons.wikimedia.org/wiki/Category:Audio_files_of_hiragana_(set_by_Hakatanoshio117117)), author **Hakatanoshio117117**, public domain (PD-self).
- The `ka` sample is [Ja-ka.ogg](https://commons.wikimedia.org/wiki/File:Ja-ka.ogg), author **Doughaque**, public domain (PD-self).
- The `so` sample is [Ja-So.oga](https://commons.wikimedia.org/wiki/File:Ja-So.oga), author **Hakatanoshio117117**, public domain (PD-self).
- Other sources from the same public-domain pronunciation collection, including the `ti` recording for `chi` and the `hu` recording for `fu`.
- The source files are Ogg/OGA, but the app requests Wikimedia Commons' MP3 transcoding endpoint for Safari compatibility.
- The `Audio` element is started directly from learner interaction. Existing Japanese `speechSynthesis` remains as fallback only if the romaji key is missing or the Audio API is unavailable.
- Failure messages are surfaced in the Studio. A source link under **Hướng dẫn nét & nguồn** lets the learner inspect the recording origin.

## Known limitations before release

- Clips are **not bundled** in the repo or offline; a working internet connection is required, even when the HTML site is served from the local PC over Wi-Fi.
- Availability / rate limiting / hotlink policy of Wikimedia and actual iOS playback have not been verified from this environment; user device QA is required.
- Audio files have varying lengths and voice quality, including older multi-second clips. Review pedagogy and audio consistency before final production bundling.
- If reliability or consistency is inadequate, create/obtain a reviewed, licensed local MP3 pronunciation pack, retain attribution/metadata, and use local assets as the primary source. Do **not** download media with unverified redistribution rights.
- This v4 change does not affect API contracts, account profiles, user progress or stored drafts.

References: [Commons file types](https://commons.wikimedia.org/wiki/Commons:File_types) and [WebKit Safari audio format support](https://webkit.org/blog/15063/webkit-features-in-safari-17.4/).
