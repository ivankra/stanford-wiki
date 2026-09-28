---
type: Scaffolding
title: TODO
description: Repo-level backlog - tooling, migration and pages to design. Content backlog lives in the pages themselves.
---
# TODO

- **Evolution section on course pages**: how syllabus/curriculum/topics covered evolved over the years (since `cutoff_term` at least). Also cover scope drifts e.g. [CS 349F](courses/CS%20349F.md). Need to find, ingest and compare syllabus/materials from past and current offerings.
- **Zeitgeist/Evolution section on term pages**: editorial summary about shifts in CS through the lens of what's being taught at Stanford this term vs past. Shifts in the range of courses being taught, their syllabus (aggregate info from course pages's Evolution section), shifts in the broader field/tech/science etc. Update index.md / AGENTS.md about it being one of the major new goals of the wiki.
- **Related**: a dedicated pass over the course's `## Related` section, checking the neighbors it names are the right ones, that each line says how this course differs, and that the pairing is reciprocated where it should be. `make related` now finds the asymmetries (280 suggestions across 168 pages on its first run); working them, and judging the ones that shouldn't reciprocate, is the pass itself and has not been run.
- **Tags**: go over the full tag list from all courses, filter/rename/expand, revisit each course to harmonize tags throughtout the wiki.
	- `graduate`, `undergraduate`, `seminar`
	- `python`, `javascript`, `c++`/`cpp` (careful not to break obsidian & co), `rust`, `verilog` etc
	- Harmonized topic/themes tags, discard/rename/refactor rare tags
	- Tags for instructors
	- Tags for open materials categories; at least `videos`, `assignments`, `projects` would be nice
	- Other tags that'd be useful from obsidian graph view / clustering / discoverability perspective
## past+access refactoring

Refine `access` ratings:
* Change icon for closed to ⛔
* Add finer gradations: mostly-closed, mostly-open, extra-open
* Overall access categories:
	* unknown
	* ⛔closed: nothing public besides catalog/announcement page, insufficient to judge full list of topics covered from it.
	* 🔴mostly-closed: syllabus/schedule/full list of topics etc publicly available, but not much more
	* 🟠partial: some core materials available
	* 🟡mostly-open: most core materials available, but some important ones arent (especially: no videos for this or any other recent term)
	* 🟢open: all expected core materials are publicly available (esp. videos; less important materials like exams, solutions, etc aren't critical to downgrade to mostly-open, need a case-by-case judgement)
	* 💚extra-open: courses that go above and beyond e.g. [[CS 336]] with external leaderboard for assignments https://github.com/stanford-cs336/assignment1-basics-leaderboard and, to a smaller extent, "GPU compute for self-study" guide.
* For at least videos, availability of older term's videos should prevent open -> mostly-open downgrade since it's the default for a course to not be filmed or not being able to release recordings. But many courses every so often release everything, their videos still cover roughly the same material and so just as useful to the user. Hence the reason to not downgrade.
* Calibrate your materials expectations by course type, e.g. expect less stuff from seminars vs full lecture courses.
* Emphasize that these are guidelines, but agents ultimately have the freedom and responsibility to make case-by-case judgement to choose the best rating within the spirit of these guidelines, rather than the letter.

`materials` dict could perhaps get flattened into new top-level keys:
	* `access`: overall access category per above
	* `syllabus`, `videos`, `slides`, `notes`, `assignments`, `solutions`, `exams`, `projects` (student projects, posters etc), `repo` (instead of `code`),  `homepage` (single best landing page), `site` (any additional websites),  etc
		* access: for simple case of unknown or closed without a note
		* url or list of urls: implies open, no note
		* `{access, url?, note?, reviewed?}` or list of these: for more complex cases with notes
		* access should probably be limited to unknown/closed/partial/open
	* `reviewed`  (instead of `checked`): YYYY-MM-DD when page was thoroughly verified against latest guidelines/skills on that day. Initialize as empty for now, we'll do a dedicated backfill later once wiki is stable enough.

Lint to strictly verify the above schema! Allow transition period accepting either old or new schema per page while we revisit and migrate pages.

New top-level frontmatter key `past`, holding the map from terms to key-value map in the same shape as the top-level frontmatter itself (i.e. overrides) and limited to a subset of its keys. Initialize from `materials.past`, reorganized per above. It should normally record just the *differences* from the current offering. And even then not all keys are interesting to us to record here for past  offering - should be just a subset of top-level keys, lint should enforce it stays that way + build.ts should enforce standard ordering.

Ex:

```
  title: My course title
  term: Autumn 2026
  homepage: https://foo/csNNN/autumn2026/
  instructors:
	- A
  past:
	Spring 2026:
	  title: Slightly different course title
	  homepage: https://foo/csNNN/spring2026/
	  instructors:
		- B
```

`past` keys are especially important to feed Evolution/Zeitgeist future work described above.
