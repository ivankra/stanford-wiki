---
name: wiki-course
description: "Create or update a course page in courses/, including re-anchoring it to a newer offering or making it a Registration. Use for requests like \"add CS 224N\", \"update CS 229\", \"migrate CS 336 from old/\", or any change to a course page's facts."
---
# Write a course page

Rules for what goes on the page are in `AGENTS.md`; `courses/CS 312.md`, `courses/CS 229.md` and `courses/CS 247G.md` are the reference examples.

0. **Course or registration?** CPT, independent study, reading, TGR and similar numbers are `type: Registration` (`AGENTS.md` → Registrations). For those, skip step 5, and in step 4 skip Materials, Syllabus and `topics`.
1. **Find the existing page** at `courses/<code>.md`. A cross-listed course lives under its CS code if it has one, otherwise the catalog's primary code. Other codes never get their own page.
   - **A legacy page** (a `materials` map and no top-level `access`) is migrated whole, in the same edit, before anything else: run `node .agents/2026-09-30.materials.ts "courses/<code>.md"`, read its report and resolve every FLAG (the design doc's migration prompt says how), then rate and set `access` (`wiki-materials`). The helper also gives every older offering its catalog instructors and any different title, and a `closed` syllabus where the syllabus repository shows a gated upload; keep them. Never write the legacy shape, and skip step 6's `log.md` line: the migration's final pass writes one. See `AGENTS.md` → Materials → Legacy pages; this step goes when the migration ends.
2. **Pick the offering:** the latest term ≤ `current_term`. Apply that ceiling *before* taking the latest, or a Spring-only course will anchor to next Spring.
   - The page exists and a newer term turned up → follow `AGENTS.md` → Past offerings → Moving to a newer offering, in order: move the outgoing offering into `past`, clear the top-level material keys, then rewrite everything that depends on the offering (instructors, schedule, units, materials) for the new one.
   - An older term turned up → **verify it is the same course first**: compare that term's catalog title, description and instructors against the page's. Same subject under a new name is a rename and stays on one page; a different subject is a reused number and must not go into `terms_offered`. Only then add the term, and record it in `past`: always its catalog instructors (`[]` if the catalog names nobody) and its title if it differs (`AGENTS.md` → Past offerings), then its syllabus, looked for and ingested when public, and its other materials and homepage (`wiki-materials`). A listing with only TBA sections can be a canceled offering: check before adding it. The top level doesn't change.
   - **A term from the syllabus repository that `terms_offered` lacks is almost never an offering**: of 57 such leads, one was real. The rest are `published: false` Canvas shells, or terms when the course ran under a partner code with no CS section at all — CS 279 as CME 279, CS 286 as BMDS 276. Confirm in ExploreCourses before adding a term, and note a dropped CS code on the page, since it explains the gap.
   - **A renumbered or split course** keeps only its current page or pages, which list the old code under `formerly`. Never create a page for a code that a page already lists there (`wiki-term` → Renumbered and split courses has the known cases).
   - A site or syllabus whose subject contradicts the catalog usually means a reused number. Check the date printed on it, then follow `AGENTS.md` → Course pages: a page of its own if it ran within ~10 years; otherwise at most one line on the current page.
3. **Ingest before writing** (`wiki-ingest` skill): the ExploreCourses entry always, plus the course site and syllabus when they exist.
4. **Write:** copy the shape and level of detail of the reference examples, and fill it from the sources.
   - Always write `## Materials` (what's public, with links) and `## Syllabus`: the latter covering what's taught, unit by unit, from the ingested syllabus or schedule. Pick `topics` from it: a representative selection, paraphrased as needed, but grounded.
   - Other body sections only when they add something beyond frontmatter; delete empty ones.
   - Every claim must be supported by a reference listed in `sources`. Don't add inline citations.
   - `instructors`: catalog order, but put the lead first if a source says who leads.
   - Related: one line per course on how it differs; at most a small table, never comparison prose.
   - Materials not checked yet: `access: unknown` with no `checked`, and run `wiki-materials` when you can.
   - Target: around 500 words of body, roughly 700 at most, not counting `## Source notes`, where sourcing quirks go; each section also has a ceiling (`AGENTS.md` → Body), and lint warns above any of them.
5. **Materials:** run the `wiki-materials` skill, unless it was done this term.
6. **Finish, in the same change:**
   - `node scripts/build.ts` regenerates every table row and the page's `mscs-` tags (never write them yourself)
   - a line in `log.md`
7. **Check:** `node scripts/lint.ts`.

Set `status: stable` only when every claim is sourced and materials were checked this term.
