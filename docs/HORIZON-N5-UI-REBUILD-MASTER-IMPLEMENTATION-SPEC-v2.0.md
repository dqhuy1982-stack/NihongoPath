# HORIZON N5 UI REBUILD — MASTER IMPLEMENTATION SPEC
**Edition:** v2.0 · 2026-11-09 · `develop` · **Design reference:** six approved HORIZON mockups (course/lesson/story/content/practice/result/characters).  
**Scope:** new, isolated UI for *Minna no Nihongo Elementary I* (N5), integrated with existing learning data and authenticated family profiles. **Not a replacement for the Foundation/Kana platform.**

## 1. Product and design contract
- **Rebuild, not cascade:** build one v2 N5 layout shell, one design-system stylesheet, one route controller and isolated v2 view state. Do not continue styling v1.49 by layering another N5 override; legacy N5 remains source for content/records only.
- Mockups are the visual authority: full-width top header, narrow course sidebar, content canvas, contextual right rail, Sakura/Fuji scenery, warm-white cards, dusty rose actions, sage progress, gentle navy typography; illustrated human character portraits, not simplistic geometric SVG faces.
- Exact pixel equality is **not promised** across devices. Implement spacing, density, relationships and artwork faithfully; validate at 1536, 1366, 1024, 768, 390 and 375px, zoom and iOS Safari.
- **One main action** per screen; context is available via linked reference drawers, not permanent redundant tabs. No fabricated scores, ratings, durations, mastery, or published lessons.

## 2. Navigation / information architecture
```
Courses > Minna no Nihongo N5 (25 lessons)
  N5/course                       · Five chapters (01–05…21–25), Continue
  N5/lesson/01/overview           · Goals, story, six scenes, skills, start
  N5/lesson/01/story              · Scene 1–6, speaker dialogue, annotations, variants
  N5/lesson/01/content            · Vocabulary (30), Grammar (6), Examples, Reading, Listening
  N5/lesson/01/practice           · Real practice engine, context-linked mistakes
  N5/lesson/01/check              · Independent 20-item assessment, four-skill check
  N5/lesson/01/result             · Actual assessment, suggested review, next action
  N5/characters                   · 30 canonical fictional profiles, filters and search
  N5/contexts                     · Scene setting library, linked back to lessons
```
Legacy route `#course/N5/lesson/01` redirects within v2 to the overview; existing deep links to authored samples remain valid; `#course/N5` remains the top-level course URL. All unreleased lessons clearly show *Đang biên soạn* with no start/finish affordance.

### Frame
- **Top bar:** HORIZON, Khóa học, Luyện tập, Luyện đề, Tài liệu, Theo dõi; global actions reuse existing links.
- **Left rail:** course identity; Tổng quan N5; Lộ trình; Bài 01 (Tổng quan, Tình huống, Nội dung, Luyện, Kiểm tra, Kết quả); Nhân vật; Bối cảnh; back to Foundation.
- **Context rail:** relevant characters/setting/phrase on story, study tips/quick links on content, one contextual explanation on practice, real status and next actions on result.
- **Mobile:** compact top bar, a clearly labeled lesson selector, contextual details in collapsible section, large tap targets, persistent but non-obscuring next action. No horizontal-scrolling main text.

## 3. Page templates / real information
### A. N5 course dashboard
Narrative hero, next-action card, actual Lesson 01 practice/check summary, 5 collapsible chapter panels, 25 numbered lesson rows, separate non-functional/released states. No hardcoded percentage or false unlock.

### B. Lesson 01 overview
Goal list, four lesson phases (Learn → Practice → Check → Review), six story stops with scene thumbnails, existing 30 vocab/6 grammar/reading/listening counts, characters and context. One primary button **Bắt đầu/ Tiếp tục tình huống**. Visited/attempted/completed are distinct.

### C. Scene classroom (six scenes)
Each scene: hero illustration, location/time/participants/relationship, dialogue with speaker buttons and play controls, translatable lines, phrase annotation and cultural notes; vocabulary and grammar contextual links; reply selection, sentence substitution/order and self-written application; previous/next scene. User can consult resources and return to **same scene**.

### D. Content/reference
Separate tabs Vocabulary, Grammar, Examples, Reading, Listening. Vocabulary has Japanese, kana, Vietnamese, example and pronunciation; grammar shows explanation + example + errors, reading has original passage and understanding checks, listening uses clearly labeled **browser ja-JP TTS** with transcripts. Do not present publisher audio or book scans as licensed assets.

### E. Guided practice
Modes include the authored response/blank/order drills and 16 existing mixed-skill practice questions with explanations. Incorrect replies link back to the actual scene/grammar/vocab IDs. Quiz mode and assessment mode must be visibly distinguished.

### F. Check + Result
20 independent existing questions (vocab/grammar/reading/listening); record actual score, per-skill breakdown, timestamp, attempts, pending-audio state, error remediation. Internal lesson completion requires passing practice and check thresholds plus real listening answers, **not merely starting audio**. A high aggregate score with zero listening correct must not show lesson mastery. No fake "96/100", "4/4 completed" or "Bài 02 unlocked". Full JLPT exams remain separate.

### G. Character library
30 fictional records in canonical `NP_WORLD`, with existing ID stability. Search name, nationality, profession, group; profile dialog gives Japanese name, reading, occupation/organization, communication style, appearances and scenes. Portraits need consistent raster artwork. Missing approved raster assets must use an explicit neutral fallback—not the rejected old SVG portraits disguised as the final design.

### H. Context library
Settings such as language classroom, office, hotel, community space, cafe, public transport, store and home; **source each page/scene from authored data**. Photos/background art are illustrative, not assertions of real company premises.

## 4. Reusable design system
| Token | Value | Purpose |
|---|---|---|
| ink | `#253447` | long-reading text |
| muted | `#69727a` | tertiary text |
| rose | `#b84d61` | primary actions, only |
| sage | `#467f63` | progress and positive states |
| amber | `#a06b24` | pending / needs attention |
| ivory | `#fffdfa` | surface |
| canvas | `#faf8f6` | page |
| border | `#e9e1de` | quiet separation |
| shadow | `0 8px 24px rgba(48,41,53,.055)` | cards |

Use Manrope for UI and Newsreader or a Japanese-competent fallback for restrained headings. Japanese font needs legible glyph coverage. Base body ~14px desktop, >=14px mobile, Japanese reading >=17px. 8px spacing rhythm (4/8/12/16/24/32), radii 10–18px; 1px borders and soft shadows. Background landscapes only in hero/borders, never directly behind lesson text.

## 5. Art asset contract
- Existing hand-drawn-looking mockups are references, not runnable components.
- Add `source/public/assets/n5-v2/characters/{id}.webp`, `scenes/{id}.webp`, `backgrounds/{setting}.webp`. Character must have portrait/bust and optional full-body pose. Backgrounds: neutral study view, Fuji-Sakura, workplace, classroom, station, cafe, hotel, store, home.
- The rejected auto-generated SVG character art must not appear in approved final state; use curated raster portraits **with explicit mapping to character IDs** and metadata. Never mismatch a character's name or nationality to the image. Responsive `srcset`, WebP/AVIF, lazy loading except hero, alt text.
- If images are not yet approved, mark them **asset review pending** rather than asserting mockup fidelity. No unlicensed publisher images, watermarked screenshots or text cropped from UI screenshots reused as content.
- Reduce-motion and low-bandwidth fallbacks; art never blocks text, quiz input or audio.

## 6. State preservation / acceptance
- Existing `NP_WORLD`, `NPN5Lesson01Data`, `NPN5Lesson01Scenes`, `NPN5Lesson01` are the sources of truth. Do not mutate Cloudflare D1, prior results or profile IDs; **read-only adapter** for views.
- v2-only local view state can save current chapter/scene/tab by profile; assessment attempts use existing engine and historical IDs.
- Never implicitly clear a finished check attempt when viewing course overview.
- Keyboard navigation, Escape, focus return, labels, tooltips on click/focus (not hover only), color contrast, valid aria and Safari audio rules.
- CI: structural route tests, 25 lesson rows, six scene IDs, 30 cast records, four skills, current-profile isolation, 0/3 listening invalidates completion, no forced Bài 02, desktop/mobile CSS, asset paths and deep-link reload.
- GitHub Pages: build from `develop`, verify public HTML/JS/CSS and `release.json` (commit/version) before claiming "live".

## 7. Rollout / exit criteria
- **M0:** master spec + isolated route shell + views, working data and backward links.
- **M1:** approved original raster artwork at matching character IDs, approved setting imagery and 1:1 visual comparison.
- **M2:** full functional testing on PC/iPhone, same-screen return from glossaries, resumable practice; content accuracy review.
- **M3:** freeze Lesson 01 as reusable template, then apply to Lessons 02–25 after edition-specific syllabus and content rights are reviewed.

**Do not declare “100% like mockup” before M1/M2 evidence.** The architecture can be live while the visual asset review remains open.
