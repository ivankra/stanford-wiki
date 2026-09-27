---
type: Scaffolding
title: TODO
description: Repo-level backlog - tooling, migration and pages to design. Content backlog lives in the pages themselves.
---
# TODO

- **Per-course offering history is cheap and worth backfilling.** Ten ExploreCourses XML queries per course settle `terms_offered` and catch reused numbers; `references/explorecourses-spring-2026-offering-history.md` does this for fifteen courses. Older pages still carry `terms_offered` inferred from course sites alone.
- **Rename notes still owed.** The `terms_offered` identity audit found these pages span more than one catalog title without being reused numbers, and each still wants a one-line note in Source notes saying so: CS 210A, CS 210B, CS 227A, CS 231A, CS 247S, CS 272, CS 324, CS 329M, CS 275B, CS 347, CS 270, CS 523, CS 372, CS 448I, CS 340LX.
- **Search link text, not just hrefs, when inventorying materials.** CS 134's ten decks are labeled "Lecture Slides" but point at Google Drive, so grepping hrefs for `slide`/`.pdf` found none and nearly rated the type absent. The same applies to Drive, Dropbox, Box and Colab links generally. Worth folding into `wiki-materials` once confirmed on a second case.
- [CS 269I](courses/CS%20269I.md): check <https://github.com/FlyingWorkshop/incentives-in-computer-science>
- Revisit `terms_offered` for every course: every entry there must be related to latest offering, to catch course number reuses. Drop pre-2020 entries and fill every relevant 2020+ term.
- **Past offerings are systematically reachable.** Stanford archives each offering at `web.stanford.edu/class/archive/cs/<slug>/<slug>.<termId>/`, and the term id is computable: Autumn 2024 = 1252, +10 per academic year, +0/+2/+4/+6 for Autumn/Winter/Spring/Summer. CS 107 resolves for seven consecutive terms this way, CS 106B for several years. There is no directory index at the archive root or per course, so the ids have to be generated. This is the source the Evolution work needs, and it also turns up materials for courses whose current site shows nothing.
- **Recheck every page with a headless browser, not just the unrated ones.** A plain fetch cannot tell "publishes nothing" from "renders client-side", and this has produced real mis-ratings: [CS 106S](courses/CS%20106S.md) was `unknown` and actually publishes slides, handouts, starter code *and* solutions; [CS 342](courses/CS%20342.md) was `unknown`/`draft` and publishes its whole grading scheme; [CS 147L](courses/CS%20147L.md)'s full syllabus is a `data:text/markdown` URI inside its bundle. A cheap detector is to compare HTML size against extracted-text size and flag anything where text is under ~600 characters or under ~2,500 with a framework signal (`__next_f`, `id="root"`, `notion`); that flagged 34 URLs across the unrated pages alone. The same scan has never been run over the pages already rated `open` or `partial`, where it could equally be hiding material.
- **The Internet Archive recovers whole courses, not just fragments.** Three cases so far: [CS 243](courses/CS%20243.md)'s Winter 2026 site (17 decks, 7 assignments with starter-code zips) went dark between June and September 2026 and is complete in the archive; [CS 275A](courses/CS%20275A.md) and [CS 275B](courses/CS%20275B.md) lost the entire `ccarh.org` domain, textbook included. A sweep of candidate URLs against the CDX API is worth repeating each term — but extract the candidates from backticked hostnames in Source notes as well as from `https://` links, since dead hosts are usually recorded in prose, not as URLs.
- **Case-sensitivity and near-miss URLs cost us two courses.** [CS 329D](courses/CS%20329D.md)'s complete site is at `thashim.github.io/cs329D/`; the lowercase path 404s and had been recorded as "no site exists". [CS 342](courses/CS%20342.md)'s Notion id differs from a decoy id by four characters. Worth a lint check that every `homepage` and `sites[].url` in the wiki still returns 200.
- **Evolution** / **Zeitgeist** sections
	- Evolution section on course pages: jow syllabus/curriculum/topics covered evolved over the years. Also scope drift e.g. [CS 349F](courses/CS%20349F.md). Need to find, ingest and compare syllabus/materials from past and current offerings.
	- Zeitgeist summary on term pages about shifts in CS through the lens of what's being taught at Stanford. +update index about it being one of major goals of the wiki.
- Add a new materials access category: 🟠mostly-closed. Gradation roughly: closed = nothing public besides maybe catalog/announcement page, mostly-closed = at least syllabus/schedule/full list of topics available, partial=some core materials available, open=all core materials available (or almost all, e.g unavailable videos shouldn't downgrade since it's quite common for a course to not be filmed or not being able to release recordings). For courses like seminar judge less strictly as less core materials are generally expected, eg syllabus + pointers/list of papers to read may be enough to count access as partial. Maybe one more special category 💚extra-open for courses that go above and beyond (eg. all public + like good self study guides, leaderboard for external audience etc). Change closed icon to ⛔.
- Maybe `past` key in course frontmatter with any notable per-term metadata updates (esp. instructor name and title for term pages, can also shove homepage updates there and amaybe past materials)
- `lead` key: lead professor/instructor/PI - for tables. Also add tags for search for all instructors
- lint to suggest missing related course backlinks -> but make it a judgement call, don't need full cliques of related courses
- Revisit tags after full ingestion: go over tag list from full set of courses, and harmonize each course's list; `GR` and `UG` tags, `seminar`. Consider what tags would be useful from obsidian graph view perspective and clusting courses.
- `mscs_*` keys for MSCS related stuff on programs/ pages (mscs_breadth, mscs_depth etc)
- stats keys in terms/ pages: how many UG, GR, regs, total. flip concluded into current. build to enforce order
- programs/: build to check cross-listed non-CS primary prefixes; show them in table too

## Backfill tracker

Five passes run over only part of the wiki, tracked per course so the gaps show; edited by hand. A blank means no record of an attempt, not a confirmed absence.

The marks are not all from one sitting, and a few rest on weaker evidence than the rest: most were set from a run whose output still exists, but CS 146S's `rendered` and CS 300 and CS 334's `Search` were inferred from what their pages say, and CS 342's `checked` from a query that found nothing and so left no trace. Treat a mark as "someone looked", not as a citation.

- **Public**: current `materials.access`, for prioritizing.
- **JS**: site checked for client-side rendering. `rendered` = opened in a headless browser; `scanned` = the static detector found no framework signal, so a plain fetch can be trusted; **`flagged`** = signal found, browser rerun owed.
- **Archive**: the Internet Archive has been consulted for offerings whose site is gone or overwritten. `checked` = deliberately hunted; `swept` = the CDX sweep ran over the URLs the page already records, which only finds rot in links we knew about.
- **Search**: a web search has been run, beyond guessing URL patterns.
- **Past**: the course's history back to Winter 2020 has been worked over. Three things, all of them: past syllabi hunted for (the run, not the result); `terms_offered` verified complete and true from Winter 2020 on, with every entry checked against the catalog for a reused number; and `materials.past` backfilled. Feeds the Evolution and Zeitgeist item above. The last of the three is blocked: `past` is still only a proposed key, so no row can be ticked until it is in the schema.
- **Related**: a dedicated pass over the course's `## Related` section, checking the neighbors it names are the right ones, that each line says how this course differs, and that the pairing is reciprocated where it should be. Nothing has been run; see also the lint item above on suggesting missing backlinks.

| Course | Public | JS | Archive | Search | Past | Related |
| --- | :-: | --- | --- | :-: | :-: | :-: |
| [CS 1U](courses/CS%201U.md) | 🟢 |  |  |  |  |  |
| [CS 7](courses/CS%207.md) | 🟢 |  |  |  |  |  |
| [CS 9](courses/CS%209.md) | 🟢 |  |  |  |  |  |
| [CS 10N](courses/CS%2010N.md) |  | scanned | swept | ✓ |  |  |
| [CS 11SI](courses/CS%2011SI.md) | 🟡 | scanned | swept |  |  |  |
| [CS 12SI](courses/CS%2012SI.md) | 🟡 | scanned | swept |  |  |  |
| [CS 21SI](courses/CS%2021SI.md) | 🟡 | scanned | swept |  |  |  |
| [CS 22A](courses/CS%2022A.md) |  | scanned | swept |  |  |  |
| [CS 24](courses/CS%2024.md) | 🟡 | scanned | swept |  |  |  |
| [CS 25](courses/CS%2025.md) | 🟢 |  |  |  |  |  |
| [CS 25N](courses/CS%2025N.md) | 🟢 | scanned | swept | ✓ |  |  |
| [CS 26SI](courses/CS%2026SI.md) |  | scanned | swept |  |  |  |
| [CS 29N](courses/CS%2029N.md) | 🟡 | scanned | swept |  |  |  |
| [CS 31N](courses/CS%2031N.md) |  | scanned | swept |  |  |  |
| [CS 40](courses/CS%2040.md) | 🟢 |  |  |  |  |  |
| [CS 41](courses/CS%2041.md) | 🟢 |  |  |  |  |  |
| [CS 42SI](courses/CS%2042SI.md) | 🟡 | scanned | swept |  |  |  |
| [CS 43](courses/CS%2043.md) | 🟢 |  |  |  |  |  |
| [CS 44N](courses/CS%2044N.md) |  | scanned | swept | ✓ |  |  |
| [CS 45](courses/CS%2045.md) | 🟢 |  |  |  |  |  |
| [CS 46N](courses/CS%2046N.md) | 🟡 | **flagged** | swept |  |  |  |
| [CS 47](courses/CS%2047.md) | 🟡 | scanned | swept |  |  |  |
| [CS 47N](courses/CS%2047N.md) |  | scanned | swept | ✓ |  |  |
| [CS 49N](courses/CS%2049N.md) |  | scanned | swept |  |  |  |
| [CS 51](courses/CS%2051.md) | 🔴 |  |  |  |  |  |
| [CS 52](courses/CS%2052.md) |  | rendered | swept |  |  |  |
| [CS 53N](courses/CS%2053N.md) |  | scanned | swept | ✓ |  |  |
| [CS 56N](courses/CS%2056N.md) |  | scanned | swept |  |  |  |
| [CS 57N](courses/CS%2057N.md) |  | scanned | swept |  |  |  |
| [CS 58N](courses/CS%2058N.md) |  | scanned | swept |  |  |  |
| [CS 59SI](courses/CS%2059SI.md) |  | scanned | swept |  |  |  |
| [CS 64](courses/CS%2064.md) | 🟢 |  |  |  |  |  |
| [CS 80E](courses/CS%2080E.md) | 🟡 | scanned | swept |  |  |  |
| [CS 80Q](courses/CS%2080Q.md) |  | scanned | swept |  |  |  |
| [CS 81SI](courses/CS%2081SI.md) |  | scanned | swept |  |  |  |
| [CS 82SI](courses/CS%2082SI.md) | 🔴 | scanned | swept |  |  |  |
| [CS 83N](courses/CS%2083N.md) |  | scanned | swept | ✓ |  |  |
| [CS 84](courses/CS%2084.md) |  | scanned | swept |  |  |  |
| [CS 91SI](courses/CS%2091SI.md) |  | scanned | swept |  |  |  |
| [CS 99](courses/CS%2099.md) | 🟢 |  |  |  |  |  |
| [CS 100ACE](courses/CS%20100ACE.md) | 🟡 | scanned | swept |  |  |  |
| [CS 100BACE](courses/CS%20100BACE.md) | 🔴 |  |  |  |  |  |
| [CS 102](courses/CS%20102.md) | 🟡 | scanned | swept |  |  |  |
| [CS 103](courses/CS%20103.md) | 🟢 |  |  |  |  |  |
| [CS 103ACE](courses/CS%20103ACE.md) | 🟢 |  |  |  |  |  |
| [CS 104](courses/CS%20104.md) | 🟡 | **flagged** | swept |  |  |  |
| [CS 105](courses/CS%20105.md) | 🟡 | scanned | swept |  |  |  |
| [CS 106A](courses/CS%20106A.md) | 🟢 |  |  |  |  |  |
| [CS 106AX](courses/CS%20106AX.md) | 🟢 |  |  |  |  |  |
| [CS 106B](courses/CS%20106B.md) | 🟢 |  |  |  |  |  |
| [CS 106E](courses/CS%20106E.md) | 🟢 |  |  |  |  |  |
| [CS 106EA](courses/CS%20106EA.md) | 🟡 | scanned | swept | ✓ |  |  |
| [CS 106L](courses/CS%20106L.md) | 🟢 |  |  |  |  |  |
| [CS 106M](courses/CS%20106M.md) | 🔴 |  |  |  |  |  |
| [CS 106S](courses/CS%20106S.md) | 🟢 | rendered | swept |  |  |  |
| [CS 107](courses/CS%20107.md) | 🟢 |  |  |  |  |  |
| [CS 107ACE](courses/CS%20107ACE.md) | 🟡 | **flagged** | swept |  |  |  |
| [CS 107E](courses/CS%20107E.md) | 🟢 |  |  |  |  |  |
| [CS 108](courses/CS%20108.md) | 🟡 | scanned | swept |  |  |  |
| [CS 109](courses/CS%20109.md) | 🟢 |  |  |  |  |  |
| [CS 109ACE](courses/CS%20109ACE.md) | 🟢 | scanned | swept | ✓ |  |  |
| [CS 110](courses/CS%20110.md) | 🟢 |  |  |  |  |  |
| [CS 110A](courses/CS%20110A.md) | 🔴 |  |  |  |  |  |
| [CS 110L](courses/CS%20110L.md) | 🟢 |  |  |  |  |  |
| [CS 111](courses/CS%20111.md) | 🟢 |  |  |  |  |  |
| [CS 111ACE](courses/CS%20111ACE.md) | 🟢 |  |  |  |  |  |
| [CS 112](courses/CS%20112.md) | 🟢 |  |  |  |  |  |
| [CS 114](courses/CS%20114.md) | 🟢 |  |  |  |  |  |
| [CS 120](courses/CS%20120.md) | 🟢 |  |  |  |  |  |
| [CS 121](courses/CS%20121.md) | 🟡 | scanned | swept |  |  |  |
| [CS 123](courses/CS%20123.md) | 🟢 |  |  |  |  |  |
| [CS 124](courses/CS%20124.md) | 🟢 |  |  |  |  |  |
| [CS 129](courses/CS%20129.md) | 🟢 |  |  |  |  |  |
| [CS 131](courses/CS%20131.md) | 🟢 |  |  |  |  |  |
| [CS 132](courses/CS%20132.md) |  | scanned | swept |  |  |  |
| [CS 134](courses/CS%20134.md) | 🟢 |  |  |  |  |  |
| [CS 137A](courses/CS%20137A.md) | 🟢 |  |  |  |  |  |
| [CS 139](courses/CS%20139.md) | 🟡 | scanned | swept |  |  |  |
| [CS 140](courses/CS%20140.md) | 🟢 |  |  |  |  |  |
| [CS 140E](courses/CS%20140E.md) | 🟢 |  |  |  |  |  |
| [CS 140M](courses/CS%20140M.md) | 🔴 |  |  |  |  |  |
| [CS 141](courses/CS%20141.md) | 🔴 |  |  |  |  |  |
| [CS 142](courses/CS%20142.md) | 🟢 |  |  |  |  |  |
| [CS 143](courses/CS%20143.md) | 🟢 |  |  |  |  |  |
| [CS 144](courses/CS%20144.md) | 🟢 |  |  |  |  |  |
| [CS 145](courses/CS%20145.md) | 🟢 |  |  |  |  |  |
| [CS 146](courses/CS%20146.md) |  | **flagged** | swept | ✓ |  |  |
| [CS 146J](courses/CS%20146J.md) |  | scanned | swept | ✓ |  |  |
| [CS 146S](courses/CS%20146S.md) | 🟢 | rendered |  |  |  |  |
| [CS 147](courses/CS%20147.md) | 🟢 |  |  |  |  |  |
| [CS 147L](courses/CS%20147L.md) | 🟡 | rendered | swept |  |  |  |
| [CS 148](courses/CS%20148.md) | 🟢 |  |  |  |  |  |
| [CS 149](courses/CS%20149.md) | 🟢 |  |  |  |  |  |
| [CS 151](courses/CS%20151.md) | 🟡 | **flagged** | swept |  |  |  |
| [CS 152](courses/CS%20152.md) | 🟢 |  |  |  |  |  |
| [CS 153](courses/CS%20153.md) | 🟡 | scanned | swept |  |  |  |
| [CS 154](courses/CS%20154.md) | 🟢 |  |  |  |  |  |
| [CS 155](courses/CS%20155.md) | 🟢 |  |  |  |  |  |
| [CS 157](courses/CS%20157.md) | 🟢 |  |  |  |  |  |
| [CS 161](courses/CS%20161.md) | 🔴 |  |  |  |  |  |
| [CS 161ACE](courses/CS%20161ACE.md) | 🔴 |  |  |  |  |  |
| [CS 163](courses/CS%20163.md) |  | scanned | swept |  |  |  |
| [CS 166](courses/CS%20166.md) | 🟢 |  |  |  |  |  |
| [CS 168](courses/CS%20168.md) | 🟢 |  |  |  |  |  |
| [CS 170](courses/CS%20170.md) | 🔴 |  |  |  |  |  |
| [CS 171](courses/CS%20171.md) | 🟢 |  |  |  |  |  |
| [CS 173A](courses/CS%20173A.md) |  | scanned | swept | ✓ |  |  |
| [CS 177](courses/CS%20177.md) | 🟡 | scanned | swept |  |  |  |
| [CS 180](courses/CS%20180.md) | 🟡 | scanned | swept |  |  |  |
| [CS 181](courses/CS%20181.md) | 🟡 | scanned | swept |  |  |  |
| [CS 181W](courses/CS%20181W.md) | 🟡 | scanned | swept |  |  |  |
| [CS 182](courses/CS%20182.md) | 🟢 |  |  |  |  |  |
| [CS 182W](courses/CS%20182W.md) | 🟢 |  |  |  |  |  |
| [CS 183E](courses/CS%20183E.md) |  | scanned | checked | ✓ |  |  |
| [CS 184](courses/CS%20184.md) |  | scanned | swept |  |  |  |
| [CS 185](courses/CS%20185.md) |  | scanned | swept |  |  |  |
| [CS 186](courses/CS%20186.md) | 🟢 |  |  |  |  |  |
| [CS 187](courses/CS%20187.md) |  | scanned | swept |  |  |  |
| [CS 190](courses/CS%20190.md) | 🟢 |  |  |  |  |  |
| [CS 193C](courses/CS%20193C.md) | 🔴 |  |  |  |  |  |
| [CS 193P](courses/CS%20193P.md) | 🟢 |  |  |  |  |  |
| [CS 193Q](courses/CS%20193Q.md) | 🟢 |  |  |  |  |  |
| [CS 193T](courses/CS%20193T.md) | 🟢 |  |  |  |  |  |
| [CS 193U](courses/CS%20193U.md) | 🟢 |  | checked |  |  |  |
| [CS 193V](courses/CS%20193V.md) | 🟢 |  |  |  |  |  |
| [CS 193X](courses/CS%20193X.md) | 🟡 | scanned | swept |  |  |  |
| [CS 194](courses/CS%20194.md) | 🔴 |  |  |  |  |  |
| [CS 194A](courses/CS%20194A.md) | 🟡 | scanned | swept |  |  |  |
| [CS 194H](courses/CS%20194H.md) | 🟡 |  |  |  |  |  |
| [CS 194W](courses/CS%20194W.md) | 🔴 |  |  |  |  |  |
| [CS 196](courses/CS%20196.md) |  | scanned | swept |  |  |  |
| [CS 197](courses/CS%20197.md) | 🟢 |  |  |  |  |  |
| [CS 197C](courses/CS%20197C.md) | 🟢 |  |  |  |  |  |
| [CS 198](courses/CS%20198.md) | 🔴 |  |  |  |  |  |
| [CS 198B](courses/CS%20198B.md) | 🟢 |  |  |  |  |  |
| [CS 202](courses/CS%20202.md) |  | scanned | swept | ✓ |  |  |
| [CS 204](courses/CS%20204.md) | 🟢 |  |  |  |  |  |
| [CS 205L](courses/CS%20205L.md) | 🟡 | scanned | swept |  |  |  |
| [CS 206](courses/CS%20206.md) |  | scanned | swept | ✓ |  |  |
| [CS 207](courses/CS%20207.md) |  | scanned | checked |  |  |  |
| [CS 208E](courses/CS%20208E.md) | 🟢 |  |  |  |  |  |
| [CS 209](courses/CS%20209.md) |  | scanned | swept |  |  |  |
| [CS 210A](courses/CS%20210A.md) | 🟡 | **flagged** | swept |  |  |  |
| [CS 210B](courses/CS%20210B.md) | 🟡 | scanned | swept |  |  |  |
| [CS 212](courses/CS%20212.md) | 🟢 |  |  |  |  |  |
| [CS 214](courses/CS%20214.md) |  | scanned | swept |  |  |  |
| [CS 217](courses/CS%20217.md) | 🟡 | scanned | swept |  |  |  |
| [CS 218](courses/CS%20218.md) | 🔴 |  |  |  |  |  |
| [CS 220](courses/CS%20220.md) | 🔴 |  |  |  |  |  |
| [CS 221](courses/CS%20221.md) | 🟢 |  |  |  |  |  |
| [CS 221M](courses/CS%20221M.md) | 🟢 |  |  |  |  |  |
| [CS 222](courses/CS%20222.md) | 🟢 |  |  |  |  |  |
| [CS 223A](courses/CS%20223A.md) | 🟡 | **flagged** | swept |  |  |  |
| [CS 224C](courses/CS%20224C.md) | 🟡 | scanned | swept |  |  |  |
| [CS 224G](courses/CS%20224G.md) | 🟢 |  |  |  |  |  |
| [CS 224N](courses/CS%20224N.md) | 🟢 |  |  |  |  |  |
| [CS 224R](courses/CS%20224R.md) | 🟢 |  |  |  |  |  |
| [CS 224S](courses/CS%20224S.md) | 🟢 |  |  |  |  |  |
| [CS 224U](courses/CS%20224U.md) | 🟢 |  |  |  |  |  |
| [CS 224V](courses/CS%20224V.md) | 🟢 |  |  |  |  |  |
| [CS 224W](courses/CS%20224W.md) | 🟢 |  |  |  |  |  |
| [CS 225](courses/CS%20225.md) | 🟢 |  |  |  |  |  |
| [CS 225A](courses/CS%20225A.md) | 🟡 | scanned | swept |  |  |  |
| [CS 226](courses/CS%20226.md) |  | scanned | swept |  |  |  |
| [CS 227A](courses/CS%20227A.md) | 🟢 |  |  |  |  |  |
| [CS 227B](courses/CS%20227B.md) | 🟢 |  |  |  |  |  |
| [CS 228](courses/CS%20228.md) | 🟢 |  |  |  |  |  |
| [CS 229](courses/CS%20229.md) | 🟡 | **flagged** | swept |  |  |  |
| [CS 229B](courses/CS%20229B.md) | 🟡 | scanned | swept |  |  |  |
| [CS 229M](courses/CS%20229M.md) | 🟢 |  |  |  |  |  |
| [CS 229S](courses/CS%20229S.md) | 🟡 | scanned | swept |  |  |  |
| [CS 230](courses/CS%20230.md) | 🟡 | scanned | swept |  |  |  |
| [CS 231A](courses/CS%20231A.md) | 🟢 |  |  |  |  |  |
| [CS 231C](courses/CS%20231C.md) |  | scanned | swept |  |  |  |
| [CS 231N](courses/CS%20231N.md) | 🟢 |  |  |  |  |  |
| [CS 232](courses/CS%20232.md) | 🟡 | **flagged** | swept |  |  |  |
| [CS 233](courses/CS%20233.md) | 🟢 |  |  |  |  |  |
| [CS 234](courses/CS%20234.md) | 🟢 |  |  |  |  |  |
| [CS 235](courses/CS%20235.md) | 🔴 |  |  |  |  |  |
| [CS 236](courses/CS%20236.md) | 🟢 |  |  |  |  |  |
| [CS 236G](courses/CS%20236G.md) | 🟢 |  |  |  |  |  |
| [CS 237A](courses/CS%20237A.md) | 🟢 |  |  |  |  |  |
| [CS 237B](courses/CS%20237B.md) | 🟢 |  |  |  |  |  |
| [CS 238](courses/CS%20238.md) | 🟢 |  |  |  |  |  |
| [CS 238V](courses/CS%20238V.md) | 🟢 |  |  |  |  |  |
| [CS 239](courses/CS%20239.md) | 🟡 | scanned | swept |  |  |  |
| [CS 240](courses/CS%20240.md) | 🟢 |  |  |  |  |  |
| [CS 240LX](courses/CS%20240LX.md) | 🟢 |  |  |  |  |  |
| [CS 241](courses/CS%20241.md) | 🟢 |  |  |  |  |  |
| [CS 242](courses/CS%20242.md) | 🟢 |  |  |  |  |  |
| [CS 243](courses/CS%20243.md) | 🟢 |  | checked |  |  |  |
| [CS 244](courses/CS%20244.md) | 🟢 |  |  |  |  |  |
| [CS 244B](courses/CS%20244B.md) | 🟢 |  |  |  |  |  |
| [CS 244C](courses/CS%20244C.md) | 🟢 |  |  |  |  |  |
| [CS 245](courses/CS%20245.md) | 🟡 | scanned | swept |  |  |  |
| [CS 246](courses/CS%20246.md) | 🟢 |  |  |  |  |  |
| [CS 246H](courses/CS%20246H.md) |  | scanned | swept |  |  |  |
| [CS 247A](courses/CS%20247A.md) | 🔴 |  |  |  |  |  |
| [CS 247B](courses/CS%20247B.md) | 🟡 | scanned | swept |  |  |  |
| [CS 247G](courses/CS%20247G.md) | 🟡 | scanned | swept |  |  |  |
| [CS 247I](courses/CS%20247I.md) |  | **flagged** | swept |  |  |  |
| [CS 247S](courses/CS%20247S.md) |  | scanned | swept | ✓ |  |  |
| [CS 248](courses/CS%20248.md) | 🟢 |  |  |  |  |  |
| [CS 248A](courses/CS%20248A.md) | 🟢 |  |  |  |  |  |
| [CS 248B](courses/CS%20248B.md) | 🟡 | **flagged** | swept |  |  |  |
| [CS 249I](courses/CS%20249I.md) | 🟢 |  |  |  |  |  |
| [CS 250](courses/CS%20250.md) | 🟢 |  |  |  |  |  |
| [CS 251](courses/CS%20251.md) | 🟢 |  |  |  |  |  |
| [CS 253](courses/CS%20253.md) | 🟢 |  |  |  |  |  |
| [CS 254](courses/CS%20254.md) | 🟢 |  |  |  |  |  |
| [CS 254B](courses/CS%20254B.md) | 🟢 |  |  |  |  |  |
| [CS 255](courses/CS%20255.md) | 🟢 |  |  |  |  |  |
| [CS 256](courses/CS%20256.md) | 🟢 |  |  |  |  |  |
| [CS 257](courses/CS%20257.md) | 🟡 | scanned | swept |  |  |  |
| [CS 258](courses/CS%20258.md) | 🟢 |  |  |  |  |  |
| [CS 259Q](courses/CS%20259Q.md) | 🔴 |  |  |  |  |  |
| [CS 260](courses/CS%20260.md) |  | rendered | swept |  |  |  |
| [CS 261](courses/CS%20261.md) | 🟢 |  |  |  |  |  |
| [CS 263](courses/CS%20263.md) |  | scanned | swept |  |  |  |
| [CS 264](courses/CS%20264.md) | 🟢 |  |  |  |  |  |
| [CS 265](courses/CS%20265.md) | 🟢 |  |  |  |  |  |
| [CS 269I](courses/CS%20269I.md) |  | scanned | swept |  |  |  |
| [CS 269O](courses/CS%20269O.md) | 🟢 |  |  |  |  |  |
| [CS 270](courses/CS%20270.md) | 🔴 |  |  |  |  |  |
| [CS 271](courses/CS%20271.md) | 🟢 |  |  |  |  |  |
| [CS 272](courses/CS%20272.md) | 🔴 |  |  |  |  |  |
| [CS 272H](courses/CS%20272H.md) | 🔴 |  |  |  |  |  |
| [CS 273A](courses/CS%20273A.md) | 🔴 |  |  |  |  |  |
| [CS 273B](courses/CS%20273B.md) | 🔴 |  |  |  |  |  |
| [CS 273C](courses/CS%20273C.md) | 🔴 |  |  |  |  |  |
| [CS 273D](courses/CS%20273D.md) | 🟢 |  |  |  |  |  |
| [CS 274](courses/CS%20274.md) |  | scanned | swept | ✓ |  |  |
| [CS 275](courses/CS%20275.md) |  | scanned | swept |  |  |  |
| [CS 275A](courses/CS%20275A.md) | 🟢 |  | checked |  |  |  |
| [CS 275B](courses/CS%20275B.md) | 🟢 |  | checked |  |  |  |
| [CS 277](courses/CS%20277.md) | 🟢 |  |  |  |  |  |
| [CS 278](courses/CS%20278.md) | 🟢 |  |  |  |  |  |
| [CS 279](courses/CS%20279.md) | 🟢 |  |  |  |  |  |
| [CS 281](courses/CS%20281.md) | 🟢 |  |  |  |  |  |
| [CS 282](courses/CS%20282.md) | 🟡 | scanned | swept |  |  |  |
| [CS 283](courses/CS%20283.md) | 🟡 | scanned | swept |  |  |  |
| [CS 286](courses/CS%20286.md) | 🟢 |  |  |  |  |  |
| [CS 287](courses/CS%20287.md) |  | scanned | swept | ✓ |  |  |
| [CS 288](courses/CS%20288.md) | 🟢 |  |  |  |  |  |
| [CS 292](courses/CS%20292.md) | 🟢 |  |  |  |  |  |
| [CS 293](courses/CS%20293.md) | 🟢 |  |  |  |  |  |
| [CS 294S](courses/CS%20294S.md) | 🟡 | scanned | swept |  |  |  |
| [CS 294W](courses/CS%20294W.md) | 🟡 | scanned | swept |  |  |  |
| [CS 295](courses/CS%20295.md) |  | scanned | swept | ✓ |  |  |
| [CS 298](courses/CS%20298.md) | 🟢 |  |  |  |  |  |
| [CS 300](courses/CS%20300.md) | 🟢 |  |  | ✓ |  |  |
| [CS 309A](courses/CS%20309A.md) | 🟢 |  |  |  |  |  |
| [CS 312](courses/CS%20312.md) | 🟢 |  |  |  |  |  |
| [CS 315B](courses/CS%20315B.md) | 🟢 |  |  |  |  |  |
| [CS 320](courses/CS%20320.md) |  | scanned | swept |  |  |  |
| [CS 321M](courses/CS%20321M.md) | 🟢 |  |  |  |  |  |
| [CS 322](courses/CS%20322.md) | 🟢 |  |  |  |  |  |
| [CS 323](courses/CS%20323.md) | 🟡 | **flagged** | swept |  |  |  |
| [CS 324](courses/CS%20324.md) | 🟢 |  |  |  |  |  |
| [CS 324H](courses/CS%20324H.md) | 🟢 |  |  |  |  |  |
| [CS 325B](courses/CS%20325B.md) | 🟢 |  |  |  |  |  |
| [CS 326](courses/CS%20326.md) | 🟢 |  |  |  |  |  |
| [CS 327A](courses/CS%20327A.md) | 🟡 | **flagged** | swept |  |  |  |
| [CS 328](courses/CS%20328.md) | 🟢 |  |  |  |  |  |
| [CS 329A](courses/CS%20329A.md) | 🟢 |  |  |  |  |  |
| [CS 329D](courses/CS%20329D.md) | 🟢 | scanned | checked |  |  |  |
| [CS 329E](courses/CS%20329E.md) | 🟢 |  |  |  |  |  |
| [CS 329H](courses/CS%20329H.md) | 🟢 |  |  |  |  |  |
| [CS 329M](courses/CS%20329M.md) | 🟢 |  |  |  |  |  |
| [CS 329P](courses/CS%20329P.md) |  | scanned | swept |  |  |  |
| [CS 329R](courses/CS%20329R.md) | 🟢 |  |  |  |  |  |
| [CS 329S](courses/CS%20329S.md) | 🟡 | **flagged** | swept |  |  |  |
| [CS 329T](courses/CS%20329T.md) | 🟢 |  |  |  |  |  |
| [CS 329X](courses/CS%20329X.md) | 🟡 | scanned | swept |  |  |  |
| [CS 329Z](courses/CS%20329Z.md) | 🟢 |  |  |  |  |  |
| [CS 330](courses/CS%20330.md) | 🟢 |  |  |  |  |  |
| [CS 331](courses/CS%20331.md) | 🟢 |  |  |  |  |  |
| [CS 331B](courses/CS%20331B.md) | 🟢 |  |  |  |  |  |
| [CS 331X](courses/CS%20331X.md) | 🟢 |  |  |  |  |  |
| [CS 332](courses/CS%20332.md) | 🟢 |  |  |  |  |  |
| [CS 333](courses/CS%20333.md) |  | scanned | swept |  |  |  |
| [CS 334](courses/CS%20334.md) | 🟡 | scanned | swept | ✓ |  |  |
| [CS 334A](courses/CS%20334A.md) | 🟢 |  |  |  |  |  |
| [CS 335](courses/CS%20335.md) | 🟢 |  |  |  |  |  |
| [CS 336](courses/CS%20336.md) | 🟢 |  |  |  |  |  |
| [CS 337](courses/CS%20337.md) | 🟢 |  |  |  |  |  |
| [CS 338](courses/CS%20338.md) | 🔴 |  |  |  |  |  |
| [CS 339H](courses/CS%20339H.md) | 🟢 |  |  |  |  |  |
| [CS 339N](courses/CS%20339N.md) | 🟢 |  |  |  |  |  |
| [CS 339R](courses/CS%20339R.md) | 🟢 | scanned | swept | ✓ |  |  |
| [CS 340LX](courses/CS%20340LX.md) | 🟢 |  |  |  |  |  |
| [CS 340R](courses/CS%20340R.md) | 🟢 |  |  |  |  |  |
| [CS 341](courses/CS%20341.md) | 🟡 | scanned | swept |  |  |  |
| [CS 342](courses/CS%20342.md) | 🟡 | rendered | checked |  |  |  |
| [CS 343D](courses/CS%20343D.md) | 🟢 |  |  |  |  |  |
| [CS 343S](courses/CS%20343S.md) | 🟢 |  |  |  |  |  |
| [CS 344](courses/CS%20344.md) | 🔴 |  |  |  |  |  |
| [CS 347](courses/CS%20347.md) | 🟢 |  |  |  |  |  |
| [CS 348A](courses/CS%20348A.md) | 🟢 |  |  |  |  |  |
| [CS 348B](courses/CS%20348B.md) | 🟢 |  |  |  |  |  |
| [CS 348C](courses/CS%20348C.md) | 🟡 | scanned | swept |  |  |  |
| [CS 348E](courses/CS%20348E.md) |  | scanned | swept |  |  |  |
| [CS 348I](courses/CS%20348I.md) | 🟡 | scanned | swept |  |  |  |
| [CS 348K](courses/CS%20348K.md) | 🟢 |  |  |  |  |  |
| [CS 348N](courses/CS%20348N.md) | 🟡 | **flagged** | swept |  |  |  |
| [CS 349D](courses/CS%20349D.md) | 🟡 | scanned | swept |  |  |  |
| [CS 349E](courses/CS%20349E.md) | 🟢 |  |  |  |  |  |
| [CS 349F](courses/CS%20349F.md) | 🔴 |  |  |  |  |  |
| [CS 349G](courses/CS%20349G.md) | 🟢 |  | checked |  |  |  |
| [CS 349H](courses/CS%20349H.md) | 🟢 |  |  |  |  |  |
| [CS 349M](courses/CS%20349M.md) |  | scanned | swept |  |  |  |
| [CS 349T](courses/CS%20349T.md) |  | scanned | swept |  |  |  |
| [CS 350](courses/CS%20350.md) |  | scanned | swept |  |  |  |
| [CS 350S](courses/CS%20350S.md) | 🟢 |  |  |  |  |  |
| [CS 351](courses/CS%20351.md) |  | scanned | swept |  |  |  |
| [CS 352B](courses/CS%20352B.md) | 🟡 | scanned | swept |  |  |  |
| [CS 353](courses/CS%20353.md) |  | scanned | swept |  |  |  |
| [CS 354](courses/CS%20354.md) | 🟢 |  |  |  |  |  |
| [CS 355](courses/CS%20355.md) | 🟢 |  |  |  |  |  |
| [CS 356](courses/CS%20356.md) | 🟢 |  |  |  |  |  |
| [CS 357S](courses/CS%20357S.md) | 🟡 | scanned | swept |  |  |  |
| [CS 358A](courses/CS%20358A.md) |  | scanned | swept |  |  |  |
| [CS 359A](courses/CS%20359A.md) | 🟡 | scanned | swept |  |  |  |
| [CS 359D](courses/CS%20359D.md) |  | scanned | swept |  |  |  |
| [CS 360](courses/CS%20360.md) |  | scanned | swept | ✓ |  |  |
| [CS 361](courses/CS%20361.md) | 🟡 | scanned | swept |  |  |  |
| [CS 362](courses/CS%20362.md) | 🟢 |  |  |  |  |  |
| [CS 366](courses/CS%20366.md) | 🟡 | scanned | swept |  |  |  |
| [CS 368](courses/CS%20368.md) | 🟡 | **flagged** | swept |  |  |  |
| [CS 369O](courses/CS%20369O.md) | 🟢 |  |  |  |  |  |
| [CS 369Z](courses/CS%20369Z.md) |  | scanned | swept |  |  |  |
| [CS 371](courses/CS%20371.md) | 🟡 | scanned | swept |  |  |  |
| [CS 372](courses/CS%20372.md) | 🟢 |  |  |  |  |  |
| [CS 373](courses/CS%20373.md) |  | scanned | swept |  |  |  |
| [CS 375](courses/CS%20375.md) | 🟢 |  |  |  |  |  |
| [CS 377E](courses/CS%20377E.md) | 🟢 |  |  |  |  |  |
| [CS 377G](courses/CS%20377G.md) |  | scanned | swept | ✓ |  |  |
| [CS 377N](courses/CS%20377N.md) |  | scanned | swept |  |  |  |
| [CS 377P](courses/CS%20377P.md) |  | scanned | swept |  |  |  |
| [CS 377Q](courses/CS%20377Q.md) |  | scanned | swept | ✓ |  |  |
| [CS 377U](courses/CS%20377U.md) |  | scanned | swept | ✓ |  |  |
| [CS 379C](courses/CS%20379C.md) | 🟢 |  |  |  |  |  |
| [CS 381](courses/CS%20381.md) | 🟡 | scanned | swept |  |  |  |
| [CS 384](courses/CS%20384.md) | 🟢 |  |  |  |  |  |
| [CS 389](courses/CS%20389.md) | 🟢 |  |  |  |  |  |
| [CS 398](courses/CS%20398.md) | 🟡 | scanned | swept |  |  |  |
| [CS 402](courses/CS%20402.md) |  | scanned | swept |  |  |  |
| [CS 402L](courses/CS%20402L.md) |  | **flagged** | swept |  |  |  |
| [CS 407](courses/CS%20407.md) |  | scanned | swept | ✓ |  |  |
| [CS 421](courses/CS%20421.md) |  | scanned | swept |  |  |  |
| [CS 422](courses/CS%20422.md) | 🟢 | scanned | swept | ✓ |  |  |
| [CS 428](courses/CS%20428.md) |  | scanned | swept |  |  |  |
| [CS 428A](courses/CS%20428A.md) |  | scanned | swept |  |  |  |
| [CS 428B](courses/CS%20428B.md) |  | scanned | swept |  |  |  |
| [CS 431](courses/CS%20431.md) | 🔴 |  |  |  |  |  |
| [CS 432](courses/CS%20432.md) |  | scanned | swept | ✓ |  |  |
| [CS 435](courses/CS%20435.md) |  | rendered | swept | ✓ |  |  |
| [CS 448B](courses/CS%20448B.md) | 🟢 |  |  |  |  |  |
| [CS 448I](courses/CS%20448I.md) | 🟢 |  |  |  |  |  |
| [CS 448M](courses/CS%20448M.md) |  | scanned | swept |  |  |  |
| [CS 448P](courses/CS%20448P.md) |  | scanned | swept |  |  |  |
| [CS 448V](courses/CS%20448V.md) |  | scanned | swept |  |  |  |
| [CS 448Z](courses/CS%20448Z.md) | 🟢 |  |  |  |  |  |
| [CS 468](courses/CS%20468.md) | 🟡 | **flagged** | swept |  |  |  |
| [CS 470](courses/CS%20470.md) | 🟢 |  |  |  |  |  |
| [CS 472](courses/CS%20472.md) |  | scanned | swept |  |  |  |
| [CS 476A](courses/CS%20476A.md) | 🟢 |  |  |  |  |  |
| [CS 481](courses/CS%20481.md) | 🔴 |  |  |  |  |  |
| [CS 486](courses/CS%20486.md) |  | scanned | swept | ✓ |  |  |
| [CS 498C](courses/CS%20498C.md) |  | scanned | swept | ✓ |  |  |
| [CS 498D](courses/CS%20498D.md) |  | scanned | swept | ✓ |  |  |
| [CS 520](courses/CS%20520.md) | 🟢 |  |  |  |  |  |
| [CS 521](courses/CS%20521.md) | 🟢 |  |  |  |  |  |
| [CS 522](courses/CS%20522.md) | 🟢 |  |  |  |  |  |
| [CS 523](courses/CS%20523.md) | 🟡 | scanned | swept |  |  |  |
| [CS 524](courses/CS%20524.md) | 🟢 |  |  |  |  |  |
| [CS 525](courses/CS%20525.md) |  | **flagged** | swept | ✓ |  |  |
| [CS 528](courses/CS%20528.md) | 🟡 | scanned | swept |  |  |  |
| [CS 529](courses/CS%20529.md) | 🟢 |  |  |  |  |  |
| [CS 547](courses/CS%20547.md) | 🟢 |  |  |  |  |  |
