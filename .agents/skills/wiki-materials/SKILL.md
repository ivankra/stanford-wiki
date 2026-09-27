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
8. GitHub Pages: `<course>.github.io`, `<instructor>.github.io/cs448b-fa24/` — **try the code's own capitalisation too**, since these paths are case-sensitive: CS 329D's entire site sits at `/cs329D/` while `/cs329d/` returns GitHub's 404, and one earlier check recorded that 404 as "no site exists"
9. a shared family site: `hci.stanford.edu/courses/cs247/` for CS 247A/G/S — and **a term subdirectory under it**, in either of two shapes: `…/cs377u/s16/` and `/s17/` are complete sites, while `…/cs147l/2026/au/` uses the other. The bare course path often serves one offering and hides the rest, and assignment PDFs then sit a level further down at `<term>/assignments/`, unlinked from the schedule
10. a lab or center page, and any URL the catalog description names

**Always run a web search as well, not just these patterns.** Search the code and title, and the instructor's name. Patterns only find sites at addresses you can guess, and they never find material hosted *off* the course site — a YouTube channel, a GitHub organization, a lab or program page. CS 146's 30 lecture recordings sit on a YouTube channel that no URL pattern reaches.

**Verify that anything a search turns up is this Stanford course.** A search result is a lead, not a source: course codes repeat across universities, Stanford reuses its own numbers, and the summary text a search returns is generated, not quoted. Before rating anything from a found site, confirm it names the course — the code, the Stanford title, the catalog's instructor, or a Stanford host — and that its term is one in `terms_offered`. A domain that merely contains "stanford" is not attribution; neither is a title that happens to match. **A Stanford class slug can belong to another department**: `web.stanford.edu/class/mse206/` is Materials Science's MSE 206, not Management Science's MS&E 206, because the slug drops the ampersand — so every `MS&E` cross-listing collides with an `MSE` one. Where the evidence stays circumstantial, say so in Source notes rather than implying the site is official.

**Read any response under ~1 KB before calling it empty.** It may be a meta refresh (`http-equiv="refresh"`, which `curl -L` doesn't follow), a `<frameset>`, or a JS `window.location` redirect. An empty file is genuinely nothing, but an `Index of /…` listing is only nothing when it lists nothing: Apache listings are how a lot of old course material is still served. **Guess a few subdirectories even when the landing page has no navigation** — `resources/`, `lectures/`, `handouts/`, `slides/`. CS 402L's one site is a 2.7 KB page with four links, and its whole reading list sits in an unlinked `resources/biblatex/`.

**A big response can be just as empty.** A site that renders its content with JavaScript extracts to nav labels and a footer — indistinguishable from a course that publishes nothing. Check before believing it, and reach for a headless browser if there is one (`wiki-ingest` → Client-rendered pages). This is the single most common way a course gets mis-rated here: CS 106S was recorded as publishing nothing and in fact publishes slides, handouts, starter code *and* solutions; CS 342's Notion site was left unrated and carries the whole grading scheme.

**Some material is in the page rather than behind it.** Once rendered, search the DOM for `data:` URIs as well as ordinary links: CS 147L's complete syllabus is a `href="data:text/markdown;charset=utf-8,…"` blob compiled into its bundle, referencing a `.md` file that is served nowhere. Percent-decode it and it reads as a document. Placeholder rows are the opposite trap — the same schedule's later weeks say "Quantum Buttonology" and "Teach a coffee cup to count", which are template filler, not topics.

**Resolve to the real host before walking links.** A `<code>.stanford.edu` vanity host often *proxies* another site rather than redirecting to it — the URL bar keeps the vanity name while the pages come from, say, `www.scs.stanford.edu/24sp-cs352b/`. Those pages write their own links against the real host (`/24sp-cs352b/syllabus.html`), so following them from the vanity host 404s. Check `%{url_effective}` after a redirect-following fetch, and use whichever host actually serves the files; note the pair in Source notes.

**A 200 is not proof the file opened.** Check the content type too: a gated PDF often returns 200 with `text/html` — a login page wearing the PDF's URL. Treat that as `closed`.

**`class/<slug>/restricted/` is a Stanford convention**, and four courses here show it (CS 232, CS 243, CS 327A, CS 468): the class directory lists that one folder and nothing else, and the folder redirects to SSO. It proves some web material exists and is gated, but not which types — so record it in Source notes and rate from what you can actually see.

**Two places to look when a site is gone rather than absent.** Stanford archives past offerings at `web.stanford.edu/class/archive/cs/<slug>/<slug>.<termId>/`, with the term id computable — Autumn 2024 = 1252, +10 per academic year, +0/+2/+4/+6 for Autumn/Winter/Spring/Summer; there is no index, so generate the ids. Failing that, try the Internet Archive (`web.archive.org/web/<year>/<url>`) for a term whose site has been taken down or overwritten. Material recovered either way is rated by its own term and the usual five-year rule, and the snapshot date goes in the `note`.

The archive also gets you past an **anti-bot wall**, which is not the same as getting *around* one: Rule 3 forbids defeating the wall, not reading a public snapshot of the same page. CS 183E's only published syllabus is a Medium post that answers 403 to any fetch, mirror included, and reads fine from a 2022 snapshot. Say in Source notes that the archive is the way in, so the next person doesn't re-fight the wall.

**Walk a site's subpages before judging it, even a stale one.** Off-site links to videos, repos and drives are usually on About, Resources or Syllabus, not the landing page — a dated landing page is not evidence the whole site is empty.

Check the term printed on whatever you land on. An older offering's site isn't the page's `homepage`, but **do check past offerings for materials**: sites often link previous years, and those are frequently more open than the current one. A different course under the same number is never relevant.

## 2. Rate each type

Open each material's link and record what happens.

- Loads without login → `open`.
- Login, SSO, 403 or Canvas → `closed`. That's a positive finding: record it, don't leave the type blank.
- **`closed` needs that positive finding** — a wall, a 403, or the page sending readers to Canvas. "Looked and found nothing" is `unknown`. Rating `closed` off a failed search asserts material exists and is gated, and freezes a wrong answer into a page that then looks checked.
- From an older offering → add `term` (or `materials.term` if everything is from one older offering). Counts if up to ~5 years old; older goes in `note` only.
- Earlier offerings' sites that still load → list them under `materials.sites`; dead ones go in Source notes.
- Not found after trying everything → omit the type (`unknown`).
- Doesn't exist for this course → `none`.
- **Spot-check, don't exhaust.** Open every type, but not every file of a type: once two or three of a playlist's videos, a schedule's slide decks or a repo's assignments open without a login, the type is rated. Say what you checked in `note` if it's a subset.

Set the overall `access` from the core types, as defined in the conventions table (gated videos don't downgrade `open`), plus `checked`. Then ingest the site and syllabus (`wiki-ingest` skill), and run `node scripts/build.ts` to update the icons in the tables.

Record anything odd you hit (redirects, a canonical domain, dead links with the date, sources that disagree) under the page's `## Source notes`.

Don't mirror course content, and never infer ("they usually post videos" isn't a rating).
