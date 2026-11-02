# Kana Writing Studio — bounded, softer stroke guide (v3)

Date: 2026-11-02
Status: implemented on private `develop`; not published to public GitHub Pages.
Scope: rendering and stroke-number selector ONLY. Original learning state, storage, API, canvas handwriting, 46 MP3 audio, script selection and baseline character grid unchanged.

## Root cause confirmed

AnimCJK `kana-data.js` for some characters has multiple skeleton paths inside **one pen stroke**. Some are off-canvas auxiliary alternatives:
- ぬ: a second-stroke helper path begins at `M491 1553` and another at `M410 1568`.
- あ: a third-stroke helper path begins at `M-170 442`.
- Other examples: め, ほ, ま, ね.

The old viewer used `record.strokes.flat()` and rendered every auxiliary path as a ghost, so those lines appeared giant and clipped at the SVG boundaries. This was **not** caused by the number of number-buttons.

## Fix

- `kana-stroke-view.js`: select the valid primary trajectory (the first path) for each stroke and do not render auxiliary off-canvas branches.
- Convert primary M/L polylines into **conservative cubic Bézier** paths while preserving every original anchor and both endpoints. Straight 2-point lines are kept straight. Original AnimCJK geometry is not modified.
- The full background character uses AnimCJK's already-curved, authentic `outlines`, instead of ghosting all construction paths. The active stroke remains a pedagogical centerline over that letterform; it is **not** a brush-pressure simulation or newly authored Japanese calligraphy.
- `kana-studio.css`: stroke sequence label on its own row; fixed-size number chips wrap without squeezing the sample SVG. Existing 5-column picker, responsive Studio layout, and 1:1 SVG ratio are preserved.

## Automated validation

- 92 characters, 212 pen strokes inspected.
- 13 off-canvas auxiliary paths are no longer rendered as ghost paths.
- All 212 selected paths stay within the 0–1024 coordinate space.
- 193 multi-point strokes receive conservative smoothing; other strokes remain straight if appropriate.
- 228 valid original glyph outlines retained and displayed.
- Source JavaScript syntax and index load order checked.
- Repeat locally with `node --test tests/kana-stroke-view.test.cjs`.

## Browser QA before publishing

1. Sync source `develop`, start local server `py -m http.server 8081 --bind 127.0.0.1 --directory "C:\Dev\NihongoPath\source\public"`.
2. Open `http://127.0.0.1:8081/?mode=demo#kana` and hard refresh.
3. On PC test **ぬ, め, ほ, あ, ま, ね, ふ, ネ, ヌ, ホ**. No gray guide or animated stroke should cross the 1:1 SVG boundary. Strokes should flow less angularly without changing endpoints.
4. Check stroke 1/2/3 selection, previous/next, play/pause/replay, the thumbnails and playback speed.
5. Mobile-width test: number chips wrap; the source character grid and drawing canvas remain usable; no horizontal page overflow.
6. Verify speaker MP3 and drawing undo/clear/confirm still work; compare before/after learner progress.
7. Do not publish until these browser checks pass. Static GitHub Pages deployment remains separate.

*Some line geometry is intentionally simplified for teaching the stroke direction; the animated guide is not a perfect replica of printed outline thickness.*
