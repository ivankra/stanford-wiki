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

1. Create `terms/<Term>.md` (shape in `AGENTS.md` → Term pages), or refresh the existing one.
2. Courses with a page: add the term to their `terms_offered`. Re-anchor a page (`wiki-course` skill) only if this term is newer than its current `term`. Registrations carry no term keys at all — leave them alone.
3. Under `## TODO`, list every catalog course without a page: `- CS 000 Title`, one line each.
4. Run `node scripts/build.ts` to fill the table. Point the current-term link in `index.md` at the new page, and add a line to `log.md`.

## Rollover (`current_term` moves)

1. Update `current_term` in `AGENTS.md`.
2. Sweep the new term as above.
3. On the previous term's page, set `concluded: true`. Build then drops its days.
4. Re-anchor pages whose newer offering the old ceiling had blocked.
5. At an Autumn rollover (a new academic year), check the [program sheets page](https://www.cs.stanford.edu/masters-specializations/ms-program-sheets) for new editions, and update the lists and `edition` on `programs/` pages. Lint warns while an edition is stale.
