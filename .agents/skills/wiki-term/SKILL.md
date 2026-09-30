---
name: wiki-term
description: "Sweep a Stanford term into the wiki: ingest its ExploreCourses listing and create or refresh terms/<Season YYYY>.md, or roll `current_term` over. Use for requests like \"sweep Winter 2027\", \"add the Spring 2026 term\", \"we're in a new quarter\"."
---
# Sweep a term

## Ingest the catalog

The ExploreCourses XML API returns every active CS course of an academic year in one response, sections tagged by term. The academic year `20262027` covers Autumn 2026 → Summer 2027:

```
https://explorecourses.stanford.edu/search?view=xml-20200810&academicYear=20262027&q=CS&filter-departmentcode-CS=on&filter-coursestatus-Active=on
```

The response is large (~15-19 MB), so save it to a temp file and filter locally. Add `&filter-term-<Season>=on` when you want one term.

Two shapes, because the current year's listing still changes and a past year's doesn't:

- **Current academic year**: one reference per term, `references/explorecourses-<dept>-<season>-<yyyy>.md`, fetched fresh for the term you're sweeping.
- **A past academic year**: one reference for the whole year, `references/explorecourses-<dept>-<yyyy>-<yyyy>.md`, with a section block per term. If that file already exists, the term you're sweeping is in it — reuse it instead of fetching again.

**Default filter: every CS course the query returns**, undergraduate and graduate alike. If the user asks for another department, change the query and say so in the reference's `note`.

For each kept course, record (`wiki-ingest` skill): the code and title with cross-listings, units, grading, career, then one section block per term of that year (days, times, room, instructors), and the description verbatim. Terms after `current_term` are out of scope — leave them out and say so in `note`. A course's blocks are its offering history for that year, so `terms_offered` falls out of the file without extra queries.

Never sweep a term after `current_term`.

## Term page

1. Create `terms/<Term>.md` (shape in `AGENTS.md` → Term pages), or refresh the existing one. Its `sources` cite the catalog file that actually covers its rows: the full-year file, not a graduate-only extract.
2. Courses with a page: add the term to their `terms_offered`. A term older than the page's `term` also gets `past.<term>.instructors` from this catalog file, and `title` if it differs, and its syllabus is looked for (`AGENTS.md` → Past offerings; `wiki-materials`). A course listed with only TBA sections and no instructor may not be running; check before adding the term. Re-anchor a page (`wiki-course` skill) only if this term is newer than its current `term`; re-anchoring moves the outgoing offering into `past` first (`AGENTS.md` → Past offerings). Registrations carry no term keys at all — leave them alone.
3. Under `## TODO`, list every catalog course without a page: `- CS 000 Title`, one line each. A code some page lists under `formerly` has a page; see below.
4. Run `node scripts/build.ts` to fill the table. Add a line to `log.md`.

## Renumbered and split courses

A code listed under some page's `formerly` never gets its own page. Renumbered: its terms go into the successor's `terms_offered`. Split: into no page's, but a line in the term page's `## Notes`.

Known cases (add new ones here):

- CS 47 → CS 147L
- CS 83 → CS 83N
- CS 100A, 100B, 103A, 107A, 109A, 111A, 161A → the same number + ACE (from Autumn 2023)
- CS 428 → CS 428A + CS 428B (split)
- CS 353 (Winter 2020) → CS 163; not in `formerly`, since CS 353 is now a different course

## Rollover (`current_term` moves)

1. Update `current_term` in `AGENTS.md`.
2. Sweep the new term as above.
3. Run build: it moves `is_current_term` to the new term's page and drops the previous term's days.
4. Re-anchor pages whose newer offering the old ceiling had blocked, moving each outgoing offering into `past` first. A sweep is not a materials recheck: lint flags pages whose `checked` predates the end of their term, and `wiki-materials` handles those.
5. At an Autumn rollover (a new academic year), check the [program sheets page](https://www.cs.stanford.edu/masters-specializations/ms-program-sheets) for new editions, and update the lists and `edition` on `programs/` pages. Lint warns while an edition is stale.
