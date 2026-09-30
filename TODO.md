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
	- `graduate`, `undergraduate`, `seminar`, `talks`, `studio`, `lab`
	- `project-heavy`: focus on own project rather assignments e.g. 229/230
	- `python`, `javascript`, `c++`/`cpp` (careful not to break obsidian & co), `rust`, `verilog` `matlab`, `R`, etc; libraries/frameworks: `pytorch`, `tensorflow`, `jax`, `pandas`, `react` etc
	- Harmonized topic/themes tags, maybe discard/rename/refactor rare tags
	- Tags for instructors
	- Tags for open materials categories; at least `videos`, `assignments` -> use them as source of truth for icons like 🅰 in index tables
	- Other tags that'd be useful from obsidian graph view / clustering / discoverability perspective
- Drop `checked` top-level frontmatter field, just rely on `generated`, `at` -> `on`.
- Move source notes and most of heavy metadata to side .yml files
- Add `grading` field (to yml) - allows easily scanning for project-heavy courses