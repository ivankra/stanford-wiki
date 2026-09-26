---
name: wiki-course
description: "Create or update a course page in courses/, including re-anchoring it to a newer offering or making it a Registration. Use for requests like \"add CS 224N\", \"update CS 229\", \"migrate CS 336 from old/\", or any change to a course page's facts."
---
# Write a course page

Rules for what goes on the page are in `AGENTS.md`; `courses/CS 312.md` and `courses/CS 229.md` are the reference examples.

0. **Course or registration?** CPT, independent study, reading, TGR and similar numbers are `type: Registration` (see conventions → Registrations). For those, skip step 5, and in step 4 skip Materials, Syllabus and `topics`.
1. **Find the existing page** at `courses/<code>.md`. A cross-listed course lives under its CS code if it has one, otherwise the catalog's primary code. Other codes never get their own page.
2. **Pick the offering:** the latest term ≤ `current_term`. Apply that ceiling *before* taking the latest, or a Spring-only course will anchor to next Spring.
   - The page exists and a newer term turned up → rewrite everything that depends on the offering: instructors, schedule, units, materials.
   - An older term turned up → **verify it is the same course first**: compare that term's catalog title, description and instructors against the page's. Same subject under a new name is a rename and stays on one page; a different subject is a reused number and must not go into `terms_offered`. Only then add the term, and record its public materials if they fill a gap (`wiki-materials`). Nothing else changes.
   - A site or syllabus whose subject contradicts the catalog usually means a reused number. Check the date printed on it, then follow conventions → Course pages: a page of its own if it ran within ~10 years; otherwise at most one line on the current page.
3. **Ingest before writing** (`wiki-ingest` skill): the ExploreCourses entry always, plus the course site and syllabus when they exist.
4. **Write:** copy the shape of `courses/CS 312.md` or `courses/CS 229.md`, and fill it from the sources.
   - Always write `## Materials` (what's public, with links) and `## Syllabus`: the latter covering what's taught, unit by unit, from the ingested syllabus or schedule. Pick `topics` from it: a representative selection, paraphrased as needed, but grounded.
   - Other body sections only when they add something beyond frontmatter; delete empty ones.
   - Every claim must be supported by a reference listed in `sources`. Don't add inline citations.
   - `instructors`: catalog order, but put the lead first if a source says who leads.
   - Related: one line per course on how it differs; at most a small table, never comparison prose.
   - Materials not checked yet: `materials: { access: unknown }`, and run `wiki-materials` when you can.
   - Target: under ~300 words of body, not counting `## Source notes`, where sourcing quirks go.
5. **Materials:** run the `wiki-materials` skill, unless it was done this term.
6. **Finish, in the same change:**
   - `node scripts/build.ts` regenerates every table row and the page's `mscs` key (never write `mscs` yourself)
   - a line in `log.md`
7. **Check:** `node scripts/lint.ts`.

Set `status: stable` only when every claim is sourced and materials were checked this term.
