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
8. GitHub Pages: `<course>.github.io`, `<instructor>.github.io/cs448b-fa24/`
9. a shared family site: `hci.stanford.edu/courses/cs247/` for CS 247A/G/S
10. a lab or centre page, and any URL the catalog description names

**Read any response under ~1 KB before calling it empty.** It may be a meta refresh (`http-equiv="refresh"`, which `curl -L` doesn't follow), a `<frameset>`, or a JS `window.location` redirect. A bare `Index of /…` listing or an empty file is genuinely nothing.

**Resolve to the real host before walking links.** A `<code>.stanford.edu` vanity host often *proxies* another site rather than redirecting to it — the URL bar keeps the vanity name while the pages come from, say, `www.scs.stanford.edu/24sp-cs352b/`. Those pages write their own links against the real host (`/24sp-cs352b/syllabus.html`), so following them from the vanity host 404s. Check `%{url_effective}` after a redirect-following fetch, and use whichever host actually serves the files; note the pair in Source notes.

**A 200 is not proof the file opened.** Check the content type too: a gated PDF often returns 200 with `text/html` — a login page wearing the PDF's URL. Treat that as `closed`, and be especially suspicious of paths named `restricted/`.

Check the term printed on whatever you land on. An older offering's site isn't the page's `homepage`, but **do check past offerings for materials**: sites often link previous years, and those are frequently more open than the current one. A different course under the same number is never relevant.

## 2. Rate each type

Open each material's link and record what happens.

- Loads without login → `open`.
- Login, SSO, 403 or Canvas → `closed`. That's a positive finding: record it, don't leave the type blank.
- From an older offering → add `term` (or `materials.term` if everything is from one older offering). Counts if up to ~5 years old; older goes in `note` only.
- Earlier offerings' sites that still load → list them under `materials.sites`; dead ones go in Source notes.
- Not found after trying everything → omit the type (`unknown`).
- Doesn't exist for this course → `none`.
- **Spot-check, don't exhaust.** Open every type, but not every file of a type: once two or three of a playlist's videos, a schedule's slide decks or a repo's assignments open without a login, the type is rated. Say what you checked in `note` if it's a subset.

Set the overall `access` from the core types, as defined in the conventions table (gated videos don't downgrade `open`), plus `checked`. Then ingest the site and syllabus (`wiki-ingest` skill), and run `node scripts/build.ts` to update the icons in the tables.

Record anything odd you hit (redirects, a canonical domain, dead links with the date, sources that disagree) under the page's `## Source notes`.

Don't mirror course content, and never infer ("they usually post videos" isn't a rating).
