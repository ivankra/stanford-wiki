---
name: wiki-materials
description: "Find a course's website and rate what a non-enrolled reader can open (syllabus, slides, notes, videos, assignments, solutions, exams, projects, code). Use for requests like \"what's public for CS 336?\", \"find the CS 240 site\", \"recheck materials\", or whenever a page's `materials` needs filling."
---
# Check public materials

Ratings and the `materials` format are defined in `AGENTS.md` → Materials.

## 1. Find the site

"No site found" usually means the right URL pattern hasn't been tried yet: the two obvious patterns miss about a third of sites. Try them in this order:

1. `cs<num>.stanford.edu`
2. `web.stanford.edu/class/cs<num>/`
3. the same two with each cross-listed department code (`ee282`)
4. a research-group host with a term prefix: `www.scs.stanford.edu/26sp-cs212/`
5. a lab host with a term suffix: `graphics.stanford.edu/courses/cs448z-26-spring/`
6. the sequence root, without the letter: `web.stanford.edu/class/cs210/` for CS 210B
7. a GitHub repo for the offering: `github.com/<owner>/cs240lx-26spr`
8. A GitHub organization named for the course or lab, in either order (`stanford-cs161`, `cs368-stanford`, `stanfordasl`): its Pages site often keeps one subpath per offering (`/winter2026/`, `/spring2022/`, `/aa274a_aut2627/`) that the root doesn't link, so guess the slug or search for it, and its repos (`github.com/stanford-cs336`) hold starter code and lectures. Then other GitHub Pages: `<course>.github.io`, `<instructor>.github.io/cs448b-fa24/` — **try the code's own capitalisation too**, since these paths are case-sensitive: CS 329D's entire site sits at `/cs329D/` while `/cs329d/` returns GitHub's 404, and one earlier check recorded that 404 as "no site exists". The same goes for long ids: copy a Notion, Drive or Docs URL from the page that links it, never retype it, since CS 342's real Notion id differs from a dead one by four characters
9. a shared family site: `hci.stanford.edu/courses/cs247/` for CS 247A/G/S — and **a term subdirectory under it**, in either of two shapes: `…/cs377u/s16/` and `/s17/` are complete sites, while `…/cs147l/2026/au/` uses the other. The bare course path often serves one offering and hides the rest, and assignment PDFs then sit a level further down at `<term>/assignments/`, unlinked from the schedule
10. a lab or center page, and any URL the catalog description names
11. Stanford units that republish coursework: the Center for Teaching and Learning's AIMES library (`ctl.stanford.edu/aimes/aimes-library/<slug>`) reproduces assignment prompts verbatim, CS 139's three among them, for courses whose own sites publish none

**Always run a web search as well, not just these patterns.** Search the code and title, and the instructor's name. Patterns only find sites at addresses you can guess, and they never find material hosted *off* the course site — a YouTube channel, a GitHub organization, a lab or program page. CS 146's 30 lecture recordings sit on a YouTube channel that no URL pattern reaches. Whatever a search finds, verify that it is this Stanford course and which term it comes from before using it, as below.

**Verify that anything a search turns up is this Stanford course.** A search result is a lead, not a source: course codes repeat across universities, Stanford reuses its own numbers, and the summary text a search returns is generated, not quoted. Before rating anything from a found site, confirm it names the course — the code, the Stanford title, the catalog's instructor, or a Stanford host — and that its term is one in `terms_offered`. A domain that merely contains "stanford" is not attribution; neither is a title that happens to match. **A Stanford class slug can belong to another department**: `web.stanford.edu/class/mse206/` is Materials Science's MSE 206, not Management Science's MS&E 206, because the slug drops the ampersand — so every `MS&E` cross-listing collides with an `MSE` one. Where the evidence stays circumstantial, say so in Source notes rather than implying the site is official.

**Read any response under ~1 KB before calling it empty.** It may be a meta refresh (`http-equiv="refresh"`, which `curl -L` doesn't follow), a `<frameset>`, or a JS `window.location` redirect. An empty file is genuinely nothing, but an `Index of /…` listing is only nothing when it lists nothing: Apache listings are how a lot of old course material is still served. **Probe `web.stanford.edu/class/<code>/` and its obvious subdirectories on every course**, whatever the course links and wherever its homepage is: `slides/`, `lectures/`, `handouts/`, `notes/`, `assignments/`, `hw/`, `sections/`, `resources/`, `projects/`. Apache indexing is on by default there, so a listing appears whether or not anything links to it, and an unlinked listing is often the only public material of a course whose linked page is gated: CS 257's thirteen lecture decks sit in `slides/`, CS 402L's whole reading list in `resources/biblatex/` behind a 2.7 KB landing page with four links.

**A big response can be just as empty.** A site that renders its content with JavaScript extracts to nav labels and a footer — indistinguishable from a course that publishes nothing. Check before believing it, and reach for a headless browser if there is one (`wiki-ingest` → Client-rendered pages). This is the single most common way a course gets mis-rated here: CS 106S was recorded as publishing nothing and in fact publishes slides, handouts, starter code *and* solutions; CS 342's Notion site was left unrated and carries the whole grading scheme.

**Some material is in the page rather than behind it.** Once rendered, search the DOM for `data:` URIs as well as ordinary links: CS 147L's complete syllabus is a `href="data:text/markdown;charset=utf-8,…"` blob compiled into its bundle, referencing a `.md` file that is served nowhere. Percent-decode it and it reads as a document. When inventorying links, read their text as well as their URLs: Drive, Dropbox, Box and Colab URLs are opaque ids, so CS 134's ten "Lecture Slides" links match no `slide` or `.pdf` pattern. Placeholder rows are the opposite trap — the same schedule's later weeks say "Quantum Buttonology" and "Teach a coffee cup to count", which are template filler, not topics.

**Resolve to the real host before walking links.** A `<code>.stanford.edu` vanity host often *proxies* another site rather than redirecting to it — the URL bar keeps the vanity name while the pages come from, say, `www.scs.stanford.edu/24sp-cs352b/`. Those pages write their own links against the real host (`/24sp-cs352b/syllabus.html`), so following them from the vanity host 404s. Check `%{url_effective}` after a redirect-following fetch, and use whichever host actually serves the files; note the pair in Source notes.

**A 200 is not proof the file opened.** Check the content type too: a gated PDF often returns 200 with `text/html` — a login page wearing the PDF's URL. Treat that as `closed`.

**A Google Drive folder looks gated even when it is public**: a plain fetch extracts nothing and a browser shows a sign-in prompt. List it through `embeddedfolderview` and export one file (`wiki-ingest` → Embedded documents) before rating it; CS 104's whole course sat in a public folder the site links once, from its nav bar.

**Walk the subfolders, and read the id length.** `embeddedfolderview` lists one level, so the root often names folders rather than material: CS 107ACE's fourteen section decks each sit in their own week folder, and its practice exams and answer keys in two more, all invisible from the root. A 44-character id is a native Google document; a 33-character id is an uploaded file *or* a folder, so list it before calling it a file.

**The site's own word for a folder is not a rating.** A private Drive folder answers 200 to a plain fetch exactly as a public one does, so a page saying its reports are "published as a public Drive folder" is evidence of nothing — CS 238V's final reports were rated `open` on that sentence and need a Google account. Same rule as a `/preview` link: rate on the status code of `embeddedfolderview` or an export, never on the prose around it.

**Nor is a host's reputation proof of a gate.** Open the link before assuming it needs an account: `piazza.com/class_profile/get_resource/<class>/<file>` serves the file to anyone, and CS 194A's decks, syllabus and assignments had all been rated `closed` on the assumption that Piazza means login.

**A 403 is not proof of a gate until you have tried the other hostname.** `www.stanford.edu` and `web.stanford.edu` serve the same `class/` paths, but not the same way: CS 273A's stub meta-refreshes to a `www.stanford.edu` URL that answers 403, while the identical path on `web.stanford.edu` serves the whole course. A login redirect is a gate; a bare 403 is often just the host. Retry it, and any meta-refresh target, on the other hostname before rating anything `closed`.

**`class/<slug>/restricted/` is a Stanford convention**, and four courses here show it (CS 232, CS 243, CS 327A, CS 468): the class directory lists that one folder and nothing else, and the folder redirects to SSO. It proves some web material exists and is gated, but not which types — so record it in Source notes and rate from what you can actually see.

**A login wall proves a gate only when something is known to sit behind it.** Stanford's central syllabus repository (`syllabus.stanford.edu/syllabus/doWebAuth/<Term>-<DEPT>-<NUM>-<SEC>/…`, linked from third-party course pages such as Stanford Root) sends every visitor to SSO, but the link is generated from the section id whether or not a syllabus was ever uploaded. It is no ground for `closed` on its own. The repository's public JSON listing is: `syllabus.stanford.edu/syllabus/searchCourses/<TermCode>/<SUBJECT>/` (term codes `F26`, `W26`, `Sp26`, `Su26`; `Au26` returns nothing) returns every section of that term with `hasSyllabus`, `syllabusVisibility` (`INSTITUTION` = Stanford only) and the Canvas URL, so `hasSyllabus: true` with `INSTITUTION` is a positive finding of a gated syllabus.

**`syllabusVisibility: PUBLIC` means the Canvas course really is readable** — rare, but it is sometimes the only public account of a course with no site at all, as for CS 320, CS 431 and CS 377Q. Open `canvas.stanford.edu/courses/<id>/assignments/syllabus`. Within such a course the REST API still refuses `/assignments` and `/modules`, but `/api/v1/courses/<id>/pages` is open, the rendered tabs read fine in a headless browser, and a Files link carrying `?verifier=<token>` downloads from `files/<id>/download?verifier=<token>` — thirteen of CS 273B's decks came that way, while plain `?preview=` links only redirect to login.

**Two places to look when a site is gone rather than absent.** Stanford archives past offerings at `web.stanford.edu/class/archive/cs/<slug>/<slug>.<termId>/`, with the term id computable — Autumn 2024 = 1252, +10 per academic year, +0/+2/+4/+6 for Autumn/Winter/Spring/Summer; there is no index, so generate the ids. Failing that, try the Internet Archive (`web.archive.org/web/<year>/<url>`) for a term whose site has been taken down or overwritten. Material recovered either way is rated by its own term and the usual `cutoff_term` rule, and the snapshot date goes in the `note`.

**Never take the term from the id.** A quarter of archived offerings state a different term on the page than the id implies, and some paths serve the *live* site rather than a snapshot. Read the term off the page, and treat the path as evidence of a term only when the page agrees. Note also that `archive/cs/<slug>/` itself 404s even where dated paths under it resolve, so that 404 means nothing.

**The archive's best use is often filename recovery, not its own files.** Where the live page renders in JavaScript, its archived copy is usually static HTML: take the filenames out of it and try them against the *live* host. CS 45's nine lecture notes and CS 114's fifteen speaker decks were both found that way and then confirmed live, on pages that a direct fetch showed as publishing nothing.

**Query the archive by prefix, and pace it.** `web.archive.org/cdx/search/cdx?url=<host+path>/&matchType=prefix&output=text&fl=timestamp,original,statuscode,mimetype&collapse=urlkey` lists everything ever captured under a path, which is how you find files a dead landing page no longer links — CS 246H's whole site, CS 263's nineteen lecture PDFs, CS 108's five offerings of handouts. Run it against `web.stanford.edu/class/<code>/` even when the page records a different homepage. Also run it against every host the page's Source notes mention as dead or moved: those are usually written as backticked names (`ccarh.org`), not links, and CS 275A's and CS 275B's whole textbook came back from one.

**The CDX API silently rate-limits: after roughly seven rapid queries it returns an empty 200 rather than an error.** An empty body therefore means "slow down", not "nothing archived", and a batch run without pacing will record absences that aren't real. Sleep a few seconds between queries and retry once on an empty body before believing it.

The archive also gets you past an **anti-bot wall**, which is not the same as getting *around* one: the rule against getting around a login, paywall or anti-bot wall forbids defeating the wall, not reading a public snapshot of the same page. CS 183E's only published syllabus is a Medium post that answers 403 to any fetch, mirror included, and reads fine from a 2022 snapshot. Say in Source notes that the archive is the way in, so the next person doesn't re-fight the wall.

**A site built from a public repo keeps its history.** When a course site is served from GitHub Pages (`<name>.github.io`) or another public repo, material taken off the live site may still sit in earlier commits. CS 107E's assignment files are gone from `cs107e.github.io` but remain in `cs107e/cs107e.github.io` from before an ["unrelease" commit](https://github.com/cs107e/cs107e.github.io/commit/5494f2e2be7f2279350ddfe5bb0e7f974e52b432). Skim the repo's commit log for removals, and link the commit in Source notes when you rate what the history still serves.

**Walk a site's subpages before judging it, even a stale one.** Off-site links to videos, repos and drives are usually on About, Resources or Syllabus, not the landing page — a dated landing page is not evidence the whole site is empty.

Check the term printed on whatever you land on. An older offering's site isn't the page's `homepage`, but **do check past offerings for materials**: sites often link previous years, and those are frequently more open than the current one. A different course under the same number is never relevant.

### Videos on YouTube

Recordings are the type most often published somewhere the course site never mentions, so look for them directly.

**Where they live**, most common first:

- **[Stanford Online](https://www.youtube.com/@stanfordonline/playlists)**: the default home for filmed lecture courses, usually one playlist per offering, e.g. [CS 229, Spring 2026](https://www.youtube.com/playlist?list=PLaqpC4kq8Gpw) or [CS 336, Spring 2026](https://www.youtube.com/playlist?list=PLoROMvodv4rMqXOcazWaTUHhq-yembLCV). Its Playlists tab also lists whole courses as "course" entries, and `yt-dlp --flat-playlist` silently skips those, so page through the tab in a headless browser instead.
- **The instructor's own channel**, e.g. [Mary Wootters](https://www.youtube.com/@marywootters7651) for CS 250 and CS 265, [Feross Aboukhadijeh](https://www.youtube.com/@Ferossity) for CS 253, [Alex Smola](https://www.youtube.com/@smolix) for CS 329P. Search the instructor's name as well as the code.
- **A channel made for the course**, e.g. [Game Design at Stanford CS146](https://www.youtube.com/channel/UCFXx0rgq8t9lt8cxD2S8K5Q), [CS 154](https://www.youtube.com/channel/UCrz06enpAptXhu4pYJfR-EQ), [Mining Massive Datasets](https://www.youtube.com/channel/UC_Oao2FYkLAUlUVkBfze4jg) for CS 246.
- **A partner or sponsor's channel**, usually for guest talks: [Inception Studio](https://www.youtube.com/@BuildInception) hosts CS 224G's. A playlist can also be curated by one channel from another's uploads: CS 153's talks are Stanford Online videos, gathered in a playlist owned by the instructor's firm.

**A course page is not evidence about its own recordings.** Stanford Online publishes whole courses that the course sites describe as Canvas-only — CS 229, CS 230, CS 109, CS 236, CS 329H and others all said "recordings go to Canvas" while their lectures sat on the channel. Check the channel, then search YouTube for the code ("Stanford CS 224S") and the instructor's name, before rating `videos` `closed` or `unknown`. A current course is uploaded while the quarter runs, with some lag, so a missing or short playlist mid-term isn't final: say so in `note` and recheck after the quarter ends.

**Search every cross-listed code separately.** Uploads are titled under whichever code the partner department owns, and often drop the CS number entirely: CS 238's Autumn 2025 lectures are "Stanford AA228 …" while its 2023 and 2024 ones say "AA228/CS238", and CS 361's whole playlist is "Stanford AA222" with no CS code anywhere in the title. A CS-code-only pass silently under-counts — it finds some of a course's videos and reports that as all of them.

**Check who owns it.** Anyone can re-upload a lecture. `https://www.youtube.com/oembed?url=<watch URL>&format=json` gives a video's `author_name` and `author_url` without a login, and a playlist page's `"ownerText"` gives its owner. Link the official copy: CS 253's lectures are on the instructor's channel and again in a stranger's playlist. A third-party copy is a note in Source notes, not the `url`.

**Date it before you rate it.** Many playlist titles carry the year ("Autumn 2024", "Spring 2026"), but plenty do not, and an undated one is usually old: CS 105's, CS 224W's and CS 224U's are all 2021, not the current offering, and CS 521's are Spring 2022 even though the current site says the room can't record. Read `"uploadDate"` from a video's watch page, or the year off a lecture title, and set `term` from the offering rather than from the upload. An undated playlist rated as the current offering is the easiest wrong claim to make here.

**Make sure it is the lectures.** A course's name on a video doesn't make it a recording of the course: an instructor's conference talks, guest speakers' own uploads, and YouTube links in a reading list (CS 362's) are not `videos`. Count what the playlist holds against the schedule, and say in `note` which sessions it covers when it isn't all of them.

**Stanford Engineering Everywhere** (`see.stanford.edu/Course/<CODE>`) holds complete 2007–2010 offerings of a few courses, with videos, handouts and problem sets. That is far older than anything else the wiki covers, so cite it only on a page that found no videos at all and whose course is still roughly the same, as one line in Materials, never as a rating.

**Channels disappear.** A playlist on a personal channel can go private, and a whole channel can be suspended or deleted. When rechecking, open the link rather than trusting an earlier rating, and record a dead one in Source notes with the date.

## 2. Rate each type

Open each material's link and record what happens.

- Loads without login → `open`.
- Login, SSO, 403 or Canvas → `closed`. That's a positive finding: record it, don't leave the type blank.
- **`closed` needs that positive finding** — a wall, a 403, or the page sending readers to Canvas. "Looked and found nothing" is `unknown`. Rating `closed` off a failed search asserts material exists and is gated, and freezes a wrong answer into a page that then looks checked.
- From an older offering → add `term` (or `materials.term` if everything is from one older offering). Counts if from `cutoff_term` (in `AGENTS.md`) on; older goes in `note` only.
- Earlier offerings' sites that still load → list them under `materials.sites`; dead ones go in Source notes.
- Not found after trying everything → omit the type (`unknown`).
- Doesn't exist for this course → `none`.
- **Spot-check, don't exhaust.** Open every type, but not every file of a type: once two or three of a playlist's videos, a schedule's slide decks or a repo's assignments open without a login, the type is rated. Say what you checked in `note` if it's a subset.

Set the overall `access` from the core types, as defined in the conventions table (gated videos don't downgrade `open`), plus `checked`. Then ingest the site and syllabus (`wiki-ingest` skill), and run `node scripts/build.ts` to update the icons in the tables.

Record anything odd you hit (redirects, a canonical domain, dead links with the date, sources that disagree) under the page's `## Source notes`.

Don't mirror course content, and never infer ("they usually post videos" isn't a rating).
