---
name: wiki-ingest
description: "Save a web page, PDF or catalog query into references/ as a source. Use for \"ingest this URL/PDF\", and before writing any fact that no existing reference backs."
---
# Ingest a source

1. **Check it isn't already there.** Look for the file in `references/`, and grep the directory for the URL. Re-fetch only if the term changed or the content visibly moved.
2. **Fetch it** (curl, a browser tool or WebFetch). Record what actually happened: the status code, a redirect, or a login wall.
   - Login, SSO, paywall or anti-bot page → don't work around it. That response is the finding: note it on the course page as `closed`, and don't ingest anything.
   - **Embedded documents don't survive text extraction.** Before concluding a page has no schedule, grep the *raw HTML* for `<iframe`, `<embed`, `<object` and for `docs.google.com`, `drive.google.com`, `airtable`, `notion.` and `calendar.google`. A "Schedule" heading with nothing under it is usually an embed your extractor dropped — see [Embedded documents](#embedded-documents).
   - **Neither does anything a script writes.** A React or Next.js site extracts to a nav bar and a footer while its whole syllabus sits in a JS chunk — see [Client-rendered pages](#client-rendered-pages). Run that check before you write down that a course publishes nothing.
3. **Name it** (see `AGENTS.md` → Files and links):
   - flat, lowercase kebab-case: `references/<prefix>-<what>-<term>.md`
   - prefix: the course code (`cs-312-syllabus-autumn-2026.md`) or the publisher: `explorecourses-cs-autumn-2026.md` per term for the current academic year, `explorecourses-cs-2025-2026.md` per year for past ones
   - never overwrite an older term's file; successive terms sit side by side
4. **Write the wrapper** (keys in `AGENTS.md` → References):
   - `resource` is the original URL, and `generated.at` is the fetch time.
   - Then point each page that cites it at the copy: its `sources` entry keeps `resource` (the URL) and gains `file: ../references/<name>.md`.
   - HTML: extract the text, drop navigation and boilerplate, keep the course's own wording. Summarize long code blocks and say so in `note`.
   - PDF or other binary: save the file next to the wrapper, add `bytes` and `sha256`, embed it, and add a short text summary. Over 10 MB: don't save the file; keep `bytes`, `sha256` and the summary, say so in `note`, and leave out the embed.
   - Record the source's own term wording ("Fall 2026") in the body. The wiki's voice uses Autumn.
   - **Only what a reader sees.** Never transcribe HTML comments, `display:none` blocks, draft or hidden content, or anything else the rendered page withholds. It isn't published material and can't be rated or cited. If it explains something a maintainer would trip over — a stale schedule left in a comment — say that it exists in `note`, not what it says.

Save what's needed to cite the claim, not whole course archives. Syllabi and schedules are the exception: always ingest them. They're one of the wiki's two focuses, and the first thing to disappear when a term ends.

## Client-rendered pages

Text extraction drops everything a script writes, so a React/Next/Vue site reads as a nav bar, a staff list and a footer. **A thin extraction from a fat HTML body is an extraction failure, not a finding** — never rate a type from one.

Signals: text is only nav labels and names; `__next_f`, `__NEXT_DATA__`, `_next/static`, `<div id="root">`, `window.__NUXT__` in the raw HTML; **a nav item whose `href` is `#`** (a script-rendered section, so that section 404ing as a path proves nothing — this is the one that most looks like evidence of absence).

Then, in order of preference:

1. **A headless browser, if one is available or installable** — check for `playwright`/`puppeteer` or a `chromium` binary; installing Playwright plus a browser is usually one command with network access, and belongs outside the wiki (the bundle stays dependency-free). Rendering alone is often not enough: click the tabs, and read `href`s off the DOM, since text extraction drops them — including `data:` URIs, which is where CS 147L's entire syllabus lives.
   - Wait on `domcontentloaded` plus a fixed settle of ten seconds or so, not `networkidle`: Notion and similar apps poll forever and `networkidle` simply times out.
2. **Otherwise the payload**: the RSC push in `self.__next_f`, `<script id="__NEXT_DATA__">`, or the JS chunks (`_next/static/chunks/`, `/assets/`, `bundle*.js`) — fetch each and grep for `Week 1`, `docs.google.com`, `.pdf`. A schedule is almost always one array of objects; pull it out whole.

Cross-check the two when you can. Either way this is published content — the script ships it to every visitor — so the step 4 rule about hidden content doesn't apply.

Notion sites (`*.notion.site`) are the common case with no payload shortcut: `loadPageChunk` and `loadCachedPageChunkV2` both reject anonymous calls with a 400, so the browser is the only way in. [CS 342](../../../courses/CS%20342.md) is the worked example — unrated until rendered, then a full grading scheme, workload and prerequisites.

Worked example: [CS 146S](../../../courses/CS%20146S.md). `themodernsoftware.dev` is a Next.js app whose "Syllabus" nav is `href="#"`; curl saw a description and a sponsor wall, and the page was first recorded as publishing nothing. Clicking that tab in a browser takes the body from 2,150 to 3,789 characters and yields a ten-week schedule, slide decks, a grading table and a public assignments repo. [CS 153](../../../courses/CS%20153.md)'s archived offering hides its one lecture PDF behind a "Static Mode" toggle the same way.

## Embedded documents

Courses routinely keep the schedule, syllabus or reading list in a Google Sheet, Doc or Slides deck embedded in an `<iframe>` — the page renders it, a text extractor drops it, and the course looks like it publishes nothing. Ingest the document itself, and cite its own URL in `sources[].resource`.

Given a file id, fetch the export rather than the viewer:

| Kind | Export URL |
| --- | --- |
| Sheets | `https://docs.google.com/spreadsheets/d/<id>/export?format=csv&gid=<gid>` (one sheet) or `…&format=xlsx` (all) |
| Docs | `https://docs.google.com/document/d/<id>/export?format=txt` |
| Slides | `https://docs.google.com/presentation/d/<id>/export/pdf` |

- **Cell hyperlinks are lost in the CSV.** A schedule's links to slides, labs and papers live in the xlsx: fetch `export?format=xlsx` and read the `Target=` attributes in `xl/worksheets/_rels/sheet1.xml.rels`. Do this whenever the CSV shows reading or assignment titles with no URL beside them.
- A `/preview` or `/htmlview` page renders through JavaScript, so its HTML holds no content and no links. Don't read the rating off it — **and don't read access off it either**: fetching a `/preview` URL looks much the same whether the document is public or private. Hit `export?format=…` and check the status code. CS 194H was rated `open` on a page of `/preview` links whose documents all return 401.
- An export that returns HTML with a Google sign-in, or a 401/403, means the document is private: that is `closed`, and nothing gets ingested.
- **Check every document, not one.** A course that hands out a dozen Docs usually shares them all or none, but "all" is the assumption worth testing: one `curl` per id against the export endpoint settles a whole rating in seconds.
- Rate and file the document by what it holds, not by where it sits: an embedded schedule is `syllabus`, an embedded deck index is `slides`. Put the document's own URL under `materials.sites` when a rating depends on it.
