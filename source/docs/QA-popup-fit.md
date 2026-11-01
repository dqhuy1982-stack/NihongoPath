# Login popup fit — 01 November 2026

Fixed inherited margins (`.modalhead` and generic dialog labels), used viewport
height minus 32px rather than a 90% cap, and shortened redundant demo copy. The
portal style is present before `showModal()`, avoiding an initial generic layout.
Ordinary windows fit the full content. Native scrollbar chrome is hidden while
`overflow:auto` retains the ability to reach content in short/zoomed views. The
close header stays visible and the background page is locked only while open.

Observed Chrome preview measurements (height in CSS px):

| Viewport | Popup height | clientHeight | scrollHeight | Input focused |
| --- | ---: | ---: | ---: | --- |
| 1366 × 900 | 665 | 663 | 663 | Yes |
| 1366 × 650 | 573 | 571 | 571 | Yes |
| 768 × 1024 | 665 | 663 | 663 | Yes |
| 390 × 844 | 618 | 616 | 616 | Yes |
| 360 × 740 | 618 | 616 | 616 | Yes |
| 360 × 640 | 565 | 563 | 563 | Yes |
| 360 × 420 | 388 | 386 | 563 | Yes |

At 420px height, Tab navigation scrolled the dialog to 177px, brought the bottom
actions into view, and retained the close control at 32px from the viewport top.
Escape returned focus to the portrait and restored page overflow to `visible`.
This checks a reduced viewport, not a physical iPhone keyboard.

The comparison screenshot reconstructs the preceding committed popup CSS/JS and
the new version using the same profile and 360 × 740 viewport. Before:
clientHeight 664 / scrollHeight 669. After: 616 / 616. Temporary comparison files
were removed before packaging. No learning logic or authentication changed.
