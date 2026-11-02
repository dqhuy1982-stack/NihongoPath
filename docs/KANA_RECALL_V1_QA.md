# NIHONGO PATH — Kana Recall Lab v1

Status: Implemented on **private develop**, not yet published to Public Demo, with no backend/DB migration.
Date: 2026-11-02.

## Learning value

The existing Kana Writing Studio tracks practice completion but does NOT grade writing quality.
This opt-in recognition exercise is independent and measures **recognition of a Kana glyph and its romanized reading** using 4 answers, with a 5-second fast-recall threshold.

- 46 basic Hiragana + 46 basic Katakana
- 25 voiced/semi-voiced characters per script (50)
- 33 common small-ya/yu/yo combinations per script (66)
- Total: 208 unique glyph cards.
- Six selectable decks: 46 Hiragana, 46 Katakana, visually confusing Kana (especially Ha/Ma/Ra rows), voiced + combined Kana, all Kana, and cards that are due for re-review.
- 12 distinct cards per session; wrong or slow (>5s) answers become review candidates after 10 minutes. Quick correct responses are not marked as writing mastery.
- Each choice shows right/wrong result, correct romanization and response time.
- Progress stored only in localStorage keyed by learner ID and browser/device, NOT across PCs, iPhones or server accounts.
- If local storage cannot be read, previous data is not overwritten and the exercise warns that the new session is temporary.

**Limitations:** Recognition practice does not test listening or handwriting accuracy and is not a JLPT level assessment. No new audio is supplied for yoon/dakuon; this module deliberately does not present an audio button for those cards. Writing Studio's same-origin 46 MP3 recordings are unchanged.

## Developer checks

On either PC (after private develop is synced and any local Git changes have been handled):

    cd C:\Dev\NihongoPath
    git status -sb
    node --test .\tests\kana-recall.test.cjs

Check local source in a separate terminal:

    py -m http.server 8081 --bind 127.0.0.1 --directory "C:\Dev\NihongoPath\source\public"

Browser address:

    http://127.0.0.1:8081/?mode=demo#kana

## Browser acceptance checklist

1. Old Kana Writing Studio layout, SVG stroke order, 46 same-origin Kana MP3s and writing canvas must behave exactly as before. Do not accept new scroll glitches or squashed stroke SVG.
2. Under Kana Studio header, see a small "Ôn nhận mặt Kana · 3–5 giây" prompt with a button to open Recall Lab.
3. Opening Recall Lab shows 6 decks and a count of attempted/due cards. Closing does not reset Writing Studio's existing draft.
4. Hiragana deck gives 12 questions; the 4 romanized answers for each must be unique.
5. Katakana deck gives 12 questions. The visually confusing deck must contain は/ま/ら and ハ/マ/ラ as well as シ/ツ/ソ/ン.
6. Extended deck should include examples like が, ぱ, しゃ, ちゅ, ジャ, ピュ. It does not add audio for these syllables.
7. Choosing an answer shows the correct pronunciation in romaji and duration. Correct ≤5 sec is quick; correct >5 sec is slow; a wrong answer is shown as incorrect.
8. Next advances exactly once; after 12 questions the session summary displays two independent counts (correct and correct within 5 seconds).
9. Reload the page and reopen the same demo learner: attempts persist in that browser. Switch learner: the second learner has separate local history. Do not expect server sync.
10. Answer one card incorrectly, check that its review is not immediately due but appears in "Review weak Kana" after about 10 minutes. This is a simple scheduling rule, not a complete SRS.
11. iPhone Safari: test portrait mode. Quiz dialog should fit, options must be tappable without horizontal overflow; close via X or system Escape.
12. Test both light and dark themes if available, plus different viewport sizes. No changes should occur to original ChatGPT Site or protected private main.

## Release gate

- Do not publish simply because a remote commit exists on develop. Before updating public GitHub Pages, run:
  
    node --test .\tests\kana-recall.test.cjs
    node .\scripts\build-public-preview.cjs

- Review the resulting static asset list and privacy/security implications.
- Only copy the reviewed contents of dist/public-preview into the separate, existing NihongoPath-Public-Demo repository. Never copy private backend, environment files, DB or repository history.
- Public GitHub Pages is accessible to anyone. All demo history is local to the visiting browser, not a personal account.
