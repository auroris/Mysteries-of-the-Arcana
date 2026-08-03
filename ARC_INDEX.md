# Comic Arc Index

This index records narrative continuity across the comic archive. It distinguishes story arcs from filler without treating a filler interruption as the end of the surrounding arc.

Numeric references are comic file IDs. The original site did not assign every integer to a comic, so gaps where no matching `content/comics/<id>.md` exists are not filler pages and do not break an arc.

## Classification rules

- `filler: false` means the page belongs to a continuing narrative arc. Chapter covers, story title pages, epilogues, codas, and deliberately unfinished story pages remain non-filler.
- `filler: true` means the page is outside narrative continuity, such as a holiday illustration, pinup, concept drawing, promotional page, Q&A, creator-meta strip, world guide, or parody strip.
- An arc continues across filler. Resume it at the next non-filler comic rather than creating a new arc.
- `chapter: 'None'` does not prove that a page is filler. *The Gift* and *Dog Day Afternoon* are unnumbered but continuous story arcs.
- Visual style does not determine classification. A monochrome or LEGO page may be narrative, while a polished illustration may be filler.

Every comic Markdown file must contain an explicit boolean `filler: true` or `filler: false` in its frontmatter.

## Main story arcs

| Arc | Story span | Filler interruptions | Notes |
| --- | --- | --- | --- |
| Chapter 1: *More Heavens and Earths* | 1–171 | 135–139; 142–148 | Theresa meets Chrystalline, learns about the Arcana, and joins the rescue of Melody. The story resumes after both filler series. |
| Chapter 2: *All the Way Down* | 172–231 | None | Theresa confronts the trauma behind her attempted suicide. Page 231 closes the chapter. |
| Chapter 3: *Two by Two* | 232–365 | 243 | Crosscut adventures involving Theresa and William, Chrystalline and Mandrake, and the search for Vitamin X. Page 365 closes the chapter. |
| Chapter 4: *In the Beginnings* | 386–445 | None | Melody’s Telling and its aftermath. The Q&A at 376–385 occurs between Chapters 3 and 4 rather than inside either arc. |
| Chapter 5: *Inn Trouble* | 463–534 | None | The attack on the Inn, including the Baron Sir, Kludge, Kietra, and Aleena threads. |
| Chapter 6: *Void in the Road* | 545–676 | 546, 548, 550, 552, 554, 556, 558, 560, 562, 564, 569; 628; 669 | The main story alternates with eleven *Bricks of the Arcana* strips near its beginning, then resumes after later holiday and memorial pages. |
| Chapter 8: *Void Where Prohibited* | 758–767 | None within the published run | The numbered chapter stops after page 767 and remains unfinished. Later filler does not close it. |

## Chapter 7: Tales of the Arcana

Chapter 7 is an anthology chapter composed of several shorter narrative arcs:

| Arc | Story pages | Filler interruptions |
| --- | --- | --- |
| *Narrow* | 677–683 | None |
| *Fly Away Home* | 684–691 | None |
| *Prison Break* | 692–703 | None |
| *Dinner* | 706; 708–709; 711–716; 718–719; 721–726; 728–729 | 710; 720; 727. Pages 704–705 are filler between *Prison Break* and *Dinner*. |
| *Birthday* | 730–735; 737–739; 745–750; 752–755 | 736; 740–744; 751 |

Pages 756–757 are stand-alone filler after *Birthday* and before Chapter 8.

## Unnumbered story arcs

These pages have `chapter: 'None'`, but they form continuous stories and therefore remain `filler: false`:

| Arc | Story pages | Status |
| --- | --- | --- |
| *The Gift* | 778–786 | Complete short story. |
| *Dog Day Afternoon* | 791–810 | Incomplete; the published sequence ends during William’s Earth-side pawnshop confrontation. |

## Filler series and stand-alone material

These entries use `filler: true`. Series are grouped even when they were published between story pages.

| Filler group | Page IDs | Context |
| --- | --- | --- |
| Anniversary creator-meta strip | 135–139 | Five-page non-canonical creator gag and thank-you. |
| Kludge’s Notes | 142–148 | Seven worldbuilding reference pages. |
| Thanksgiving illustration | 243 | Interrupts Chapter 3. |
| Questions | 376–385 | Ten-page Q&A; page 385 explicitly identifies the preceding material as non-canon. |
| Wall of the Arcana | 457 | Supporter credits between Chapters 4 and 5. |
| Kludge’s Guide for New Keys | 535–544 | LEGO-format reader guide between Chapters 5 and 6. File 537 does not exist. |
| Bricks of the Arcana | 546, 548, 550, 552, 554, 556, 558, 560, 562, 564, 569 | Eleven LEGO parody strips interleaved with the opening of Chapter 6. |
| Holiday and memorial pages | 628; 669; 705; 710; 720; 736; 751; 768 | Christmas, remembrance, Halloween, Thanksgiving, Easter, Fourth of July, and related stand-alone art. |
| Preview and interruption pages | 704; 727 | A grayscale “Coming Next” preview and a get-well illustration. |
| Pinups and concept art | 740–744; 756–757; 769–777; 787–790 | Stand-alone portraits, costumes, possible-future designs, crossovers, and concept drawings. |
| Legacy promotional material | 811; 813–819 | Announcement, character portraits, and *Legacy of the Fool* promotional cover. File 812 does not exist. |

## Maintenance checklist

When editing or auditing the archive:

1. Sort pages by numeric file ID, not lexicographically.
2. Ignore absent numeric IDs when determining continuity.
3. Check the arc tables before treating a neighboring filler page as a boundary.
4. Preserve `filler: false` for *The Gift* and *Dog Day Afternoon* despite their lack of a numbered chapter.
5. Keep `filler` as an unquoted YAML boolean, never the strings `'true'` or `'false'`.
6. Update this index whenever an arc assignment or filler classification changes.
