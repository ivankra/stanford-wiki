---
type: Scaffolding
title: Stanford CS course wiki
description: What this wiki is, how it's laid out, and every rule for its pages. The single source for every rule; read it before editing.
current_term: Autumn 2026
cutoff_term: Winter 2020
primary_specialization: ai
---
# Stanford CS course wiki

A wiki of Stanford courses, built around two questions:

1. **What materials can a non-enrolled reader open?** (`access`, the material keys and the Materials section, first on every page)
2. **What does the course actually cover?** (the Syllabus section and `topics`, taken from its own syllabus)

Everything else (terms, instructors, units) supports those two. Plain markdown; the repository root is an [OKF](https://github.com/GoogleCloudPlatform/knowledge-catalog/blob/main/okf/SPEC.md) bundle, editable with any tool. Frontmatter in this file is config for scripts.

## Layout

- `courses/<code>.md`: one page per course
- `terms/<Season YYYY>.md`: one table per term
- `programs/`: MSCS program requirements, course lists by specialization.
- `references/`: ingested copies of sources, in a separate subrepo - may be absent/detached
- `index.md`, `log.md`: reserved OKF files
- `TODO.md`: repo-level backlog
- `AGENTS.md`: this file
- `.agents/skills/`: task procedures and pitfalls (see [Skills](#skills))
- `scripts/build.ts` regenerates tables and MSCS tags
- `scripts/lint.ts` checks the bundle
- `scripts/related.ts` suggests missing Related backlinks and unlinked similar pairs
- `scripts/links.ts` opens every frontmatter URL and reports the ones that disagree with their rating
- `scripts/*.test.ts`: tests for scripts
- `Makefile`: top-level wrapper for common commands

Per OKF, every `.md` file except `index.md` and `log.md` needs frontmatter with at least `type` (see [Frontmatter](#Frontmatter)).

## Rules

1. **No fact from memory.** Every fact comes from a source listed in the page's `sources`, by original URL. Ingest it into `references/` when practical (`wiki-ingest`); a URL-only source goes on the ingest backlog in `TODO.md`. No inline citations. **A web search is a lead, not a source**: its summary is generated text, and codes and titles repeat across universities and across Stanford's own reused numbers. Verify a found site names this course before citing it, and record the attribution in Source notes when it is circumstantial.
2. **`unknown` beats a guess.** Leave a field or rating unknown rather than inferring it.
3. **Never get around a login, paywall or anti-bot wall.** Record what you saw and move on. Ask the user for a paste if the content is needed.
4. **Tables are generated.** After changing any course or program page, run `make build`. Never edit table rows, a course's `mscs-` tags or its `aliases` by hand.
5. **Add one line to `log.md`** for each change session, newest first.
6. **Be brief**, in pages and in your replies — brief in wording, not in substance (see [Voice](#voice)). Frontmatter holds the data; the body adds only what frontmatter can't.
7. **Scope:** all CS courses by default (see [Scope](#scope)). The user widens it case by case; suggest a widening, never do it unasked.
8. **Stop and ask** when scope is ambiguous or a change would contradict an existing page.
9. **Suggest improvements.** You see the wiki up close; when you notice something that would make it better, say so. That could be a rule that doesn't fit the data, a recurring manual step worth scripting, an inconsistency across pages, or a gap in the sources. Skip trivial and minor ones: wording nits, cosmetic tweaks, small one-off fixes, and anything that doesn't noticeably change how the wiki works or reads. Put suggestions at the end of your reply, and don't act on them unasked.

## Scope

- **Default:** every Stanford CS course, undergraduate and graduate — every course ExploreCourses lists under subject `CS`, whatever its `academicCareer` or number. `level` still records which it is.
- **Wider on request:** other departments, or single courses outside CS, when the user asks for them (see the scope rule under [Rules](#rules)).
- Offerings between `cutoff_term` and `current_term`.

## Skills

Load the matching skill before the task:

| Skill | Use when the user asks to… |
| --- | --- |
| `wiki-term` | "sweep Winter 2027", add a term, or roll over `current_term` |
| `wiki-course` | "add CS 224N", "update CS 229", or re-anchor a page to a newer offering |
| `wiki-materials` | "what's public for CS 336?", find a course site, recheck ratings |
| `wiki-ingest` | save any page, PDF or catalog query into `references/` |

They nest: `wiki-term` → `wiki-course` → `wiki-materials` → `wiki-ingest`. Skills live in `.agents/skills/<name>/SKILL.md`; read the file directly if your harness doesn't load skills.

## Check

```sh
make           # make build (regenerate tables and MSCS tags), then make lint
make lint      # errors must be fixed; warnings are a backlog
make test      # node --test scripts/
make related   # advisory; not part of `make` (see below)
make links ARGS='"courses/CS 109.md"'   # advisory, needs the network; ARGS=--all for every page
```

Lint rejects unresolved Git conflict markers in wiki Markdown files.

`make links` opens every URL in the named course pages' frontmatter and prints one line per URL whose response disagrees with how the page uses it: an entry rated open or partial, a homepage, a site or a self-study link that ends at a sign-in (Stanford SSO, Canvas, Stanford's GitLab, a Google sign-in limited to stanford.edu, an unshared Google document), a 401, 403 or 404, or a `.pdf` served as HTML; an entry rated closed whose link opens; and a dead source. It checks a Google document through its export, a Drive folder through its plain listing, a Dropbox share through its `dl=1` download, a GitHub file through its raw copy and a YouTube link through oEmbed; retries a refused export through the document's published-to-web form, since publishing and sharing are separate settings; and stops at a sign-in without fetching it. A clean run doesn't make a rating right: a page that loads may still be empty, client-rendered or incomplete, and Ed and other single-page apps load for anyone before asking for a login. It is advisory and not part of `make`, like `make related`; the Internet Archive is skipped, since it rate-limits.

`make related` reports **one-way links between `## Related` sections** — A names B, B doesn't name A. Reciprocity is a judgement call, so it only suggests, never fails, and is not part of `make`. It splits its output three ways, because the three need different work: pages that could gain a backlink, pages named by someone that have no Related section yet, and **hubs** — a course like [CS 229](courses/CS%20229.md), named by 13 others as a prerequisite, which is not supposed to name them all back. A source already named elsewhere on the target's page is marked, since only the Related line is missing there. Last, it lists **similar pairs that never mention each other** anywhere on either page, scored on shared subject tags and rare words in `topics` and titles: the connections no link can point to yet. These are candidates to review, and noisier than the backlinks. `make related ARGS="--all --hub=5"` lists every section-less page and every similar pair and moves the hub threshold (default 3).

The scripts are TypeScript run directly by Node with no dependencies, so Node must strip types natively (on by default in Node 23.6+ / 22.18+). Nothing else requires a particular app or agent: use the OpenKnowledge MCP tools if you have them, or edit the files directly, and run the lint either way.

Build canonicalizes all frontmatter as block YAML with two-space indentation, expanding maps and lists and keeping empty collections as `[]` or `{}`. It preserves values and key order, except that it sorts every page's `sources` entries into `id, resource, file, title, checked`, quotes ambiguous strings and `units`, and leaves `is_current_term` as a boolean and `bytes`, `num_undergraduate` and `num_graduate` as numbers. The exceptions are course pages and registrations, which also get their generated `aliases`, and whose keys build sorts into the order under [Frontmatter](#frontmatter), including the keys of each `past` record (a legacy page keeps its own key order and gets only its `materials` keys sorted, until the migration ends), and term pages, whose keys it sorts into the order under [Term pages](#term-pages); writing either out of order is not a mistake to avoid.

## Voice

Terse and factual — a rule about **wording, not about how much you say**. Cut filler, hedging, and restatements of frontmatter (Materials and Prerequisites excepted, below). Never cut the specifics a reader came for. Say it once, in the place it belongs, and make it concrete.

**The test is whether a sentence could be about a different course.** If it could, it isn't finished. "Materials are public" is not a Materials section; "the schedule links a deck for 8 of the 17 lectures and an executable trace for the rest" is. Name what's actually there and where it runs out, as counts rather than lists of numbers: which weeks have decks, what the assignment asks you to build, which link is dead, why the site's term disagrees with the catalog. The summary paragraph says what sets this course apart from its neighbors — not what the title already says, and not a paraphrase of `description`.

Quote sources only where the exact wording matters: a policy a reader would otherwise not believe, or a phrase the course is known by.

**American spelling**, in our own voice: center, color, behavior, modeling, labeled, organization, analyze, neighbor, `program` (never `programme`), catalog, defense, license. The one exception is `judgement`, which the wiki spells the British way. Quoted source text keeps whatever the source wrote, British spellings included.

**Don't write like a machine**, the readers ***hate*** it. Go easy on em dashes: one appropriate "—" on a page is fine, a page littered with them is an eyesore; consider a colon, comma, parentheses or a new sentence.  A list item that leads with a label, in particulae, separates it with a colon, never a dash. And don't even think about pulling any of your favorite catchphrases ("load-bearing", etc) here.

**Numbers are numerals** in our own voice: `18 decks`, `HW1–HW7`, `Weeks 2–4`, not `eighteen decks`. Exceptions: quoted source text and idioms.

[CS 312](courses/CS%20312.md), [CS 229](courses/CS%20229.md) and [CS 247G](courses/CS%20247G.md) fix the **level of detail**, not just the shape. A section of yours that is markedly thinner than theirs means you under-reported, not that you were concise. Under-reporting is the more common failure: it is easy to write four bullets that say nothing and land inside the word budget.

Pages are written for external students first.

## Terms and dates

- Stanford says **Autumn**, not Fall. Quote sources verbatim; use Autumn in our own voice.
- Always written out: `Autumn 2026`. Never codes like `26au`, except in generated program tables.
- The academic year runs Autumn → Winter → Spring → Summer, so **Summer 2026 precedes Autumn 2026**.
- Dates are ISO: `2026-09-25`. Timestamps: `2026-09-25T00:00:00Z`.

## Files and links

- Course page: `courses/<code>.md`, code verbatim (`CS 224N.md`, `MS&E 226.md`). A cross-listed course gets one page, under its **CS code whenever it has one** (`CS 229`, not `STATS 229`), otherwise the catalog's primary code.
- Term page: `terms/<Season YYYY>.md` (`Autumn 2026.md`).
- Program page: `programs/<name>.md` (`MSCS.md`, `MSCS AI.md`).
- Reference: `references/<prefix>-<what>-<term>.md`, flat, lowercase letters, digits and hyphens only. The prefix is the course code (`cs-312-syllabus-autumn-2026.md`, `mse-226-…`) or the publisher (`explorecourses-cs-autumn-2026.md`). A binary shares the wrapper's name (`….pdf`). The catalog is ingested **one file per term for the current academic year**, whose listing still changes (`explorecourses-cs-autumn-2026.md`), and **one file per past academic year**, covering all four terms (`explorecourses-cs-2025-2026.md`).
- Links are relative markdown links, percent-encoded: `[CS 224N](../courses/CS%20224N.md)`, with `(` `)` as `%28` `%29`. Repo paths in frontmatter (`sources[].resource`, `sources[].file`) are plain, not encoded.
- Link course codes in hand-written prose when the course has a page. Lint warns about unlinked `CS` codes with existing pages; codes without pages stay plain text.
- `index.md` and `log.md` are reserved ([OKF](https://github.com/GoogleCloudPlatform/knowledge-catalog/blob/main/okf/SPEC.md)): an `index.md` carries no frontmatter, except the root one (`okf_version`), and is a plain link list unless build generates it. `log.md` is newest-first.

## Course pages

**One page per course**, describing its **latest offering up to `current_term`**.

- A newer term turns up → move the outgoing offering into `past`, then rewrite the page around the new one ([Past offerings](#past-offerings) → Moving to a newer offering).
- An older term turns up → **check it is the same course before adding it**, then add it to `terms_offered` and record it in `past` ([Past offerings](#past-offerings)): its catalog instructors, its title if it differs, and anything else you verified. The top level stays anchored to the latest offering.
  - **A code match is not an identity match.** Compare the older entry's title, description and instructors with the page's. A title that changed while the subject didn't is a rename and stays on one page ([CS 224V](courses/CS%20224V.md) was "Conversational Virtual Assistants with Deep Learning" until Autumn 2026); a different subject is a reused number and does not belong in `terms_offered` at all.
  - Record a rename: each older term's `past` record carries the title it ran under, which its term-table row shows, and a line in Source notes says when the name changed.
- **A canceled offering** stays out of `terms_offered`, even when the catalog lists it: a listing with only TBA sections and no instructor can be a quarter the course never ran, and a source saying so settles it. Say so in that term page's Notes.
- **A renumbered course** keeps one page under its current code, with the old code in `formerly` and the old code's terms in `terms_offered`. **A split course** gets no page: each successor lists it in `formerly`, and its offering is a line in the term page's Notes.
- **A code two pages share.** Lint warns when 2 pages list one code in `cross_listed` or `formerly`, unless every one lists it in `formerly` (a split). It is usually a renumbering the wiki missed: merge into one page under the current code, with the old one in `formerly`. Where a partner department reused its number for an unrelated course, each page records that in `exceptions.shared_code`, with the source.
- **A reused number** (a different subject, not a rename):
  - The previous course ran **within ~10 years** → it may get its own page, when one is worth writing: `courses/<code> (<last term>).md`, e.g. `CS 323 (Spring 2019).md`, anchored to its last offering. Program lists never match it. Each page names the other in one line.
  - It ran **more than ~10 years ago** → no page and no research; we're not doing archaeology. Add one line to the current page's Materials section only if its stale site sits at the canonical URL and could mislead a reader.

Worked examples: [CS 312](courses/CS%20312.md), a current offering with open core materials; [CS 229](courses/CS%20229.md), with mixed access, older-offering material, extra `sites` and alternative prerequisites; and [CS 247G](courses/CS%20247G.md), a compact studio-course page with conditional prerequisites. Copy their shape **and their level of detail** (see [Voice](#voice)).

### Frontmatter

`scripts/lint.ts` enforces this schema (key order, required keys, allowed values), and `scripts/build.ts` reads it. **Change the schema here and in the scripts in the same edit.**

Keys go in this order; all are required unless marked *optional*. In the Type column, *term* is a term name (`Autumn 2026`), *code* a course code (`CS 312`), and `a | b` one of the listed values. Quote any text that contains `: `, `#`, or a comma inside `[…]`/`{…}`.

| Group              | Key                 | Type                                                                             | Value                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| ------------------ | ------------------- | -------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Identity**       | `type`              | `"Course"`                                                                       | Content files: `Course`, `Registration`, `Term`, `Program`, `Specialization`, `Source`. Maintenance-related files like `AGENTS.md`, `TODO.md` are `Scaffolding`.                                                                                                                                                                                                                                                                                                                                                                                                                                           |
|                    | `code`              | string                                                                           | The page's code, conventional spacing: `CS 312`. Matches the filename.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
|                    | `title`             | string                                                                           | `"<code>: <official title>"`, with the title verbatim from the catalog.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
|                    | `description`       | string                                                                           | One sentence: what the course is about. Shown in listings.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
|                    | `cross_listed`      | code[], *optional*                                                               | Other codes for the same course, e.g. `[STATS 229]`. Omit when there are none. No page of its own carries one, and no other page lists it, except a split's old code in `formerly` (see [Course pages](#course-pages)).                                                                                                                                                                                                                                                                                                                                                                                    |
|                    | `formerly`          | code[], *optional*                                                               | Earlier codes of this course, after a renumbering or a split, e.g. `[CS 161A]`. Program lists, prerequisite links and Related lines match them like `cross_listed`. Omit when there are none.                                                                                                                                                                                                                                                                                                                                                                                                              |
|                    | `level`             | `graduate` \| `undergraduate`                                                    | From the catalog's `academicCareer`, not from the number.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| **Offering**       | `term`              | term \| `""`                                                                     | The offering the page describes: the latest one ≤ `current_term`. Equals the last entry of `terms_offered`; `""` if never offered.                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
|                    | `terms_offered`     | term[]                                                                           | Every term a source showed from `cutoff_term` on, oldest first, except a canceled offering ([Course pages](#course-pages)); lint rejects earlier terms. Older history, if it matters, gets one line in Source notes.                                                                                                                                                                                                                                                                                                                                                                                       |
|                    | `instructors`       | string[]                                                                         | Catalog spelling, e.g. `["Hashimoto, T."]`, in catalog order, except that the lead goes first when a source says who leads (say which in Source notes). Tables show the first one. Empty if unannounced.                                                                                                                                                                                                                                                                                                                                                                                                   |
|                    | `schedule`          | string, required for current term                                                | Lecture days and time, then room: `"TR 13:30-14:50, CoDa B90"`. Days: M T W R F. Use `""` if unknown or no fixed meeting. Optional for older terms; build drops it.                                                                                                                                                                                                                                                                                                                                                                                                                                        |
|                    | `units`             | string                                                                           | Quoted even when a single number, because ranges are common: `"3"`, `"3-5"`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
|                    | `grading`           | string                                                                           | Catalog grading basis, verbatim.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
|                    | `prerequisites`     | string[]                                                                         | One entry per requirement, all of them needed. Alternatives go in one entry joined by "or": `["CS 106A or CS 106B", "CS 109 or STATS 116", MATH 51]`. Codes where the catalog names courses, otherwise a few words. Empty = none stated.                                                                                                                                                                                                                                                                                                                                                                   |
| **Content**        | `homepage`          | URL, *optional*                                                                  | The course's own site; a shared family site (e.g. one site for CS 247A/G/S) if there's nothing more specific, noted in Source notes.                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
|                    | `access`            | `unknown` \| `closed` \| `mostly-closed` \| `partial` \| `mostly-open` \| `open` | The whole course's level; see [Materials](#materials). Its presence also marks a migrated page ([Legacy pages](#legacy-pages-during-the-migration)).                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
|                    | `syllabus` … `repo` | rating \| URL \| URL[] \| `{ access, url?, note?, checked? }`, *optional*        | One key per material type, in the order of [Material types](#material-types). Omitted = `unknown`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
|                    | `sites`             | `{ url, note? }[]`, *optional*                                                   | Other sites a reader would use for the current offering, not repeating `homepage`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
|                    | `self_study`        | `{ url, note }[]`, *optional*                                                    | Support for outside learners beyond the core materials; see [Materials](#materials).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
|                    | `textbook`          | string \| string[], *optional*                                                   | The main textbooks, one entry each, as `Authors, Title, Nth ed. (notes)`. No rating. See [Materials](#materials).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
|                    | `topics`            | string[]                                                                         | A representative selection of 4–10 noun phrases: what a student would say the course covers. Paraphrase freely, but ground every topic in the Syllabus section or its sources. Name content, not format ("transformer ablations", not "experiment design"); prefer the specific; don't repeat the title. The list should tell the course apart from its neighbors.                                                                                                                                                                                                                                         |
|                    | `past`              | term → record, *optional*                                                        | Older offerings; see [Past offerings](#past-offerings).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| **Classification** | `tags`              | string[]                                                                         | Lowercase, hyphenated subject tags first, then generated `mscs-` tags from [program pages](#programs), e.g. `[deep-learning, mscs-breadth-B, mscs-ai-b]`. Level and term have their own keys.                                                                                                                                                                                                                                                                                                                                                                                                              |
|                    | `aliases`           | string[], generated                                                              | Written by build for Obsidian's link suggestions and quick switcher: `code` without its space, then each `cross_listed` and `formerly` code without and with it, e.g. `[CS229, STATS229, STATS 229]`. Never the page's own code, which is its filename; omitted when empty. Never edit by hand.                                                                                                                                                                                                                                                                                                            |
| **Provenance**     | `checked`           | date, required once anything is rated                                            | The last completed access check covering every rating on the page, `past` and `self_study` included. Kept with the other provenance dates.                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
|                    | `status`            | `draft` \| `stable` \| `deprecated`                                              | OKF lifecycle. `stable` = every claim is sourced and materials were checked this term, whatever the ratings came out as: a page with `access: unknown` can be stable.                                                                                                                                                                                                                                                                                                                                                                                                                                      |
|                    | `generated`         | `{ by, at }`                                                                     | `by`: `<harness>/<model>`: **your own** harness and exact model ID, as your harness reports it, never a value copied from another page (the worked examples are not a template for this key). If you don't know it, ask. `at`: timestamp of the last substantive rewrite.                                                                                                                                                                                                                                                                                                                                  |
|                    | `exceptions`        | name → reason, *optional*                                                        | Fixed names, each silencing one lint warning, with a non-empty reason. `pre_cutoff` ([Past offerings](#past-offerings)) and `shared_code` ([Course pages](#course-pages)).                                                                                                                                                                                                                                                                                                                                                                                                                                 |
|                    | `sources`           | `{ id, resource, file?, title, checked? }[]`                                     | Every source the page relies on (OKF's shape, plus `checked`). `id` is a short word. `resource` is required: **the original URL whenever there is one**, else a repo path. `file` is the ingested copy, `../references/….md`, once it exists; URL-only sources are waiting to be ingested (`TODO.md`). `checked`, optional, is the date someone last opened `resource` and found it still backs what the page takes from it: the only date a URL-only source has, and for an ingested one a recheck later than its copy's `generated.at`. It is not the page's `checked`, which dates the materials check. |

### Body

In order: summary paragraph (no heading) · **`## Materials`** · **`## Syllabus`** · `## Prerequisites` · `## Related` · `## Source notes`. Public materials come first, then what the course covers.

- **Materials**: lead with the verdict and the decisive reason for the level: what's public, what's gated, and which older offering the level relies on. Then one bullet per material type, all nine in type order, including `closed`, `none` and types nothing was found for (`**Syllabus**`, `**Slides**`, …), linking straight to the material; types with the same one-line verdict may share a bullet (`**Solutions**, **Exams**: none; the course sets neither`); each covers the current offering and the best relevant older material, naming its offering. Then a `**Textbook**` bullet if there is one, a `**Self-study**` bullet for the `self_study` entries, and any extras. Link every `sites` entry somewhere in the section. For an offering in progress, say its material is still being released. Obsidian doesn't render nested values such as `past` or a type's object, so this section is their readable version: it names every collection the level relies on, and summarizes a long run of similar `past` records instead of repeating each ("every offering since Autumn 2021 keeps its full site, decks and problem sets at …"). Consistent means never contradicting the frontmatter, not mirroring every record.
- **The rating system stays out of the reader's sections.** The summary, Materials, Syllabus, Prerequisites and Related say what a reader can open and what the course covers, never how the page is rated: no level names, no rule terms such as "parity", and **never a rating icon** or other table marker (lint knows the set). Source notes may name a level in backticks (`partial`) when a maintainer needs the reasoning, but never with an icon. Icons belong only in the generated tables; lint rejects them in a course page's body.
- **Syllabus**: what is covered, unit by unit, from the course's own syllabus or schedule (catalog text if there's nothing else), linked in the section's first line. Leave it out only if no source says what the course covers.
- **Prerequisites**: what a reader needs to know, in plain words, one bullet per requirement, with the course codes as examples: `- Probability: CS 109, MATH 151 or STATS 116.` Readers outside Stanford don't know the numbers, so say what each one stands for, from the catalog or the course's own wording. It may repeat `prerequisites`; keep the two consistent. Link every course in `prerequisites` that has a page, so graph views connect the two; lint checks it. A cross-listed or former code links to the page under its current code, naming both: `[CS 180](CS%20180.md) (EE 180)`. Add what the course recommends but doesn't require, marked as such.
- **Related**: similar or sequenced courses, one line each on how this one differs: `- [CS 329Z](CS%20329Z.md): general agent engineering and evaluation; this course grounds agents in databases.` For two courses that are easy to confuse, a small comparison table (at most ~5 rows, no prose around it) is fine. Lint enforces the shape: one list, each bullet a single line, sorted by the first course code in the bullet in version order (`CS 106A` < `CS 106AX` < `CS 106B` < `CS 110`), then optionally the table after a blank line. Its messages give the list's file line range and the expected order, so a script can fix them.
- **Source notes**, always last: sourcing quirks for the next person who checks, linking whatever they name (a playlist, a repository, an archive path), even when a section above already links it, such as redirects and canonical domains, dead links (with the date checked), sources that disagree, a site's own term wording. It's for maintainers, so keep it out of the sections above.
- Every other section is optional; skip any that would be empty.
- **Length**: around 500 words above Source notes suits a course with ordinary materials, and roughly 700 is the ceiling; the Materials section, with a bullet for every type, takes a good part of that. Lint warns above 700, and above each section's own ceiling: 120 words for the summary, 350 for Materials, 300 for Syllabus, 100 for Prerequisites and 150 for Related. It counts prose words only, not headings or link URLs. It is a guard against padding, not a target to hit — a course that publishes a lot needs more Materials bullets and a longer Syllabus, and those earn their words. Spend them on specifics; never buy them back by dropping one. Source notes have no budget.

## Materials

What a reader **not enrolled at Stanford** can open today. Each material type gets a rating, and `access` gives the whole course a level.

**Parity decides.** `access` measures the gap between what an enrolled student can open outside the classroom and what an outside reader can open; the comparison is with a student who doesn't attend in person. Material the course gives nobody (never recorded, never set) is not a gap. Parity is a strong signal toward `open`; coverage and relevance still decide. These are guidelines, not a formula: pick the level that fits their spirit, match the [calibration pages](#calibration-pages), and state the decisive reason in the Materials section's opening sentence. Never count types.

**Unofficial resources** like student-reposted repos with problemsets: i'd prefer not to link to them normally, but if the official stuff is all gated and the course is popular enough that they are widely available (e.g [CS 229](courses/CS%20229.md), [CS 230](courses/CS%20230.md)), you can cautiously mention with caveat/downplaying and it'd justify a more open materials access rating. In any case these resources warrant a deeper investigation to make sure material is authentic. Flag to user and seek approval before adding.

### Material types

Nine keys, in this order; an omitted type is `unknown`:

| Key | Covers |
| --- | --- |
| `syllabus` | syllabus, schedule, grading policy, reading list |
| `slides` | lecture slides |
| `notes` | lecture notes, section handouts, a course reader or staff-written book |
| `videos` | lecture and section recordings |
| `assignments` | problem sets, project specs, lab handouts |
| `solutions` | assignment and exam solutions |
| `exams` | past or practice exams |
| `projects` | student project reports, posters, showcases |
| `repo` | public code: repositories (usually GitHub), starter code, autograders |

Each takes one of four shapes:

- **A bare rating**: `exams: none`.
- **A bare URL**, starting with `http://` or `https://`: shorthand for `{ access: open, url }`, the author's assertion that the collection is open. Never infer it from a link merely existing.
- **A list of URLs**: an open collection spread across several places.
- **An object** `{ access, url?, note?, checked? }`, where `url` is one URL or a list, and `access` rates the whole collection: several working links don't prove it complete. `checked` dates a recheck of that entry alone (see `checked` below).

Entries carry no `term`. A top-level entry describes the page's `term`; an older offering's goes under [`past`](#past-offerings).

| Rating | Meaning |
| --- | --- |
| `open` | Opens with no account, or with a free account anyone can create (any Google account, an email link; `note` says which), on reasonable inspection and spot checks: a course site, a public repo or playlist, a PDF on a department server. |
| `partial` | A substantive part is public, with a meaningful gap, e.g. the first weeks' decks. `note` says where the boundary is. |
| `closed` | It exists, with positive evidence of a gate: Stanford SSO, Canvas, Ed, Gradescope, the `code.stanford.edu` GitLab sign-in, a Google sign-in limited to Stanford accounts (`hd=stanford.edu` in the redirect), a login limited to enrolled students, or a 403. |
| `none` | The course produces it for nobody, by its own statement or its documented format: no exams, or lectures it says it doesn't record. A failed search is never `none`. |
| `unknown` | Not checked, not found, or not enough evidence. Silence about recordings is `unknown`. Never guess. |

Per-type ratings record access. Coverage, such as whether slides and notes together cover the lectures, is judged at the course level, with any gap described in `note`.

The other material keys:

- **`sites`**: `{ url, note? }[]`, other sites a reader would use for the current offering, **not repeating `homepage`**: a second host, a public repo, a textbook site. A relevant resource that no offering produced (a separate online course), or whose offering can't be established, goes here too, with the uncertainty in its note. List only sites a rating relies on or that hold material nothing else does; an older offering's sites go under `past`.
- **`self_study`**: `{ url, note }[]`, a curated list of support beyond the core that helps an outside learner complete or check the work. Examples: a leaderboard or evaluator outsiders can use, an important kind of evidence because it gives feedback on their own work (CS 336's [assignment leaderboard](https://github.com/stanford-cs336/assignment1-basics-leaderboard)); guidance for readers "following along at home" (CS 336's cloud-GPU pricing); instructions that make the course's infrastructure usable without it (CS 312's guide to running on your own GPU instead of the course's Modal setup); a community open to outside learners. Incidental links don't qualify, nor does an expired leaderboard whose page still loads. It never raises `access`; the tables mark it. A still-useful resource from an older offering goes in that offering's `past` record.
- **`textbook`**: `Authors, Title, Nth ed. (notes)`, **one entry per book**, a list for several; omit the key when there's none. Surnames only, `First et al` from 4 authors up, no markdown. Everything else goes in one `; `-separated parenthetical at the end and nothing trails it: a nickname only where the course is known by one (`"Dragon Book"`), standing (`optional`, `recommended`, `required`, `reference`), year. No publishers, and never whether a book is free, paywalled or where to buy it: a published book can be found, so none of that tells a reader anything. Gating is worth a word only on material the course makes itself, like a reader or a scan (`not posted`). No rating, since a textbook anyone can read counts as instruction under `notes`.
- **`checked`**: the date of the last completed access check covering every rating on the page, `past` and `self_study` included. A narrower check leaves it unchanged and goes on the entries it covered instead, as their own `checked` (object form), which lint expects to be later than the page's. Moving keys never advances either. Ratings older than one term count as `unknown` until rechecked; lint warns once `checked` is over 120 days old, or older than the end of the page's `term` once that term is over.
- **Never checked**: `access: unknown` with no `checked`. Lint lists these pages as backlog.

The shapes together, abbreviated (an illustration, not one real page):

```yaml
access: mostly-open
syllabus:
  access: open
  url: https://…
  note: the course's own sheet, plus a logistics and FAQ document
slides:
  access: partial
  url: https://…
  note: only the RL and LLMs deck is posted
notes: https://…/main_notes.pdf    # bare URL: open
videos: { access: closed, note: recordings go to Canvas, checked: "2026-09-30" }   # rechecked alone, after the page
assignments: { access: closed, note: "Ed only, to keep solutions off the public web" }
projects: none
sites:
  - { url: https://docs.google.com/…, note: "logistics and FAQ: grading, policies, exam rules" }
self_study:
  - { url: https://…, note: "a public leaderboard that scores outside submissions" }
textbook: "Sipser, Introduction to the Theory of Computation, 3rd ed."
past:
  Spring 2022:
    slides: { access: open, url: https://…, note: "about 14 decks, most of the lectures" }
  Spring 2026:
    videos: https://www.youtube.com/playlist?list=…
# …tags…
checked: "2026-09-26"
```

### Levels

| `access`        | Icon      | Guideline                                                                                                       |
| --------------- | --------- | --------------------------------------------------------------------------------------------------------------- |
| `unknown`       | *(blank)* | Core material not yet checked, or none found. A search that turns up nothing is not a gate.                     |
| `closed`        | ⛔         | The expected core is gated, with positive evidence, and no useful public core was found.                        |
| `mostly-closed` | 🔴        | A syllabus or schedule shows what the course covers, but little of its teaching or practice material is public. |
| `partial`       | 🟡        | Useful parts are public, but substantial parts of the expected material are missing or gated.                   |
| `mostly-open`   | 🟢        | Most of what a reader needs is public, with one important limitation.                                           |
| `open`          | ✅         | The expected core is public, at parity with an enrolled student.                                                |

A course with no materials by nature isn't rated at all: it is a [Registration](#registrations).

**Expected core, by format.** Rate against what the course's own shape produces, not a fixed list.

- **Lecture course**: a syllabus; instruction (slides and notes, which together cover the lectures); assignments; and recordings wherever the course makes them.
- **Seminar or talk series**: the schedule and the reading or speaker list, which can be its whole core; `assignments`, `exams` and `projects` are then `none`. Talk recordings count when the course makes them for its students. A seminar that also sets coursework owes that too: [CS 348I](courses/CS%20348I.md)'s reading list is public, but its homework, quiz, project and decks are gated, so it is `partial`.
- **Studio or project course**: the schedule and the project briefs.
- **Lab**: the lab handouts and the material they require.

Slides and notes can complement each other, and a complete slide collection can be the instruction on its own: extensive notes like CS 229's aren't required. An optional handout doesn't substitute for a missing sequence of lectures.

**Videos.**

- **Recordings the course is known to make gate `open`.** Relevant recordings from the current offering or an older one since `cutoff_term` satisfy this, and a pre-cutoff set can, by documented exception ([Past offerings](#past-offerings)). [CS 224N](courses/CS%20224N.md) is the classic case: current recordings are Canvas-only, but a relevant recent playlist is public, so it stays `open`. Don't demand that an older set cover every newer lecture.
- **A stated no-recording policy is `videos: none`, not a gap.** Together with complete other material it can justify `open`, as for [CS 355](courses/CS%20355.md).
- **Recorded but gated is `closed`, and a gap**, including recordings posted only to Canvas.
- **Silence about recordings is `unknown`, and no gap once someone has looked.** Course sites often don't link their own public recordings, so search first (`wiki-materials` → Videos on YouTube). If that finds nothing and no source says the lectures are recorded, rate the course on the rest of its material: a recording nobody can show exists can't be shown to reach enrolled students either. It stays `unknown`, never `closed` or `none`, and the Materials section says no source mentions recording. Only recordings shown to exist and be gated (Canvas, a "recorded for enrolled students" line) hold a lecture course below `open`.
- **A standing archive that each offering adds to belongs to the current offering**, such as a talk series' playlist ([CS 547](courses/CS%20547.md)). A documented short delay before public posting doesn't lower the level.
- **Short clips are not lecture recordings, unless they are the course's video content.** When the course sends students who miss a lecture to its clips, as [CS 145](courses/CS%20145.md)'s FAQ does, parity applies and the unrecorded lectures are no gap.

**Assignments.**

- **How much gated assignments matter depends on the course.** Where students learn mostly by doing, gated assignments are a strong downgrade signal and hold the course at `mostly-open` at best, even with everything else open. `mscs-si` is an advisory hint that assignments are central, never a rule.
- **Older relevant assignments count**, as older recordings do: a public copy of a recent offering's assignments closes the practice gap even when the current copies sit behind a login ([CS 106L](courses/CS%20106L.md)'s assignments repository).
- **Starter code the assignments need is part of the assignments.** If it goes only to enrolled students, the practice material is only partly available, even when every brief is public. Check a site repo's history before concluding that: [CS 107E](courses/CS%20107E.md)'s assignment files remain public there after an "unrelease" commit.
- **A free sign-in anyone can create is not a gate**, whether it saves progress or unlocks the material.
- **Supplementary activities behind a login**, such as in-class exercises, don't lower the level when public assignments supply the practice. Mention them in the Materials section.

**Older material.** `access` weighs the current offering together with relevant older offerings in `past`, for every type: older recordings, assignments and decks all count while they still represent the course. It is never an automatic maximum over the history: a public archive of a substantially different curriculum ([CS 349F](courses/CS%20349F.md)'s financial-systems offering) doesn't raise the level. The Materials section says which older collections the level relies on.

**Offerings in progress.** Rate what has been released and say that the collection is still growing; unreleased work is not gated, and early releases don't imply a complete archive. **Promised recordings get a few weeks' slack**: when a current offering says a public set is coming, don't hold its absence against the course early in the term ([CS 312](courses/CS%20312.md)). An older offering gets no such credit. Recheck after the term ends; lint prompts it.

**Borderline calls.** What the reader can open decides. Context such as an instructor's stated reason may inform the level in a borderline case, but never changes a type's own rating: gated stays `closed`, and an expected recording that is missing doesn't become `none`.

**Traps.**

- A 200 response for an empty file or a bare directory listing is not material. A login wall *is* evidence of `closed`; failing to find something is `unknown`.
- **A page that renders its content with JavaScript extracts to nothing**, so a site holding a full schedule can look empty. Check for that before rating any type, and never read `closed` off it; a headless browser settles it (`wiki-ingest` → Client-rendered pages).
- **A syllabus saying "materials are on Canvas" is not a rating.** It describes where the class is administered, not where the schedule's own links point. Check those before rating any type `closed` on it.
- **A course page that only restates the catalog is not material.** `syllabus` is rated on the schedule, reading list or grading policy; where those are gated, the type is `closed`, not `partial`, however open the announcement page around them is. `partial` needs a real part of the material itself to be public, not a page about it.

### Calibration pages

Levels settled by judgement. Compare a page with these before choosing its level; each row illustrates one rule.

| Level | Page | What it calibrates |
| --- | --- | --- |
| ✅ | [CS 336](courses/CS%20336.md) | Central assignments, recordings and code all public; its external assignment leaderboard and cloud-GPU pricing for readers "following along at home" are `self_study` |
| ✅ | [CS 145](courses/CS%20145.md) | A free Google sign-in isn't a gate; the FAQ makes the short videos its whole video content; reading paths for non-students are `self_study` |
| ✅ | [CS 312](courses/CS%20312.md) | In progress: released material public, and the promised playlist gets a few weeks' slack; its guide to running on your own GPU or cluster is `self_study` |
| ✅ | [CS 355](courses/CS%20355.md) | Never recorded, by the course's own statement: parity |
| ✅ | [CS 212](courses/CS%20212.md) | Lectures that no source says are recorded, and no public set found: silence is no gap |
| ✅ | [CS 224N](courses/CS%20224N.md) | Current recordings Canvas-only, but the recent playlist the course points to is public |
| ✅ | [CS 106L](courses/CS%20106L.md) | A public repository of recent offerings' assignments supplies the practice; slides are the instruction for a course that doesn't record |
| ✅ | [CS 107E](courses/CS%20107E.md) | Assignment files public in the site repository's history; lectures not recorded, by policy |
| ✅ | [CS 149](courses/CS%20149.md) | Recordings from a relevant older offering complete an otherwise public course |
| ✅ | [CS 547](courses/CS%20547.md) | Talk series: a public schedule and a standing public archive, posted within a couple of weeks |
| 🟢 | [CS 161](courses/CS%20161.md) | Everything public except recordings, which are Canvas-only with no public copy |
| 🟢 | [CS 193U](courses/CS%20193U.md) | Recorded but never released: `closed`, not `none` |
| 🟢 | [CS 255](courses/CS%20255.md) | Gated recordings with only a partial public substitute; the free course book counts as notes |
| 🟢 | [CS 110](courses/CS%20110.md) | Recordings gated: the site's video link redirects to Canvas; an older, unofficial public playlist is too old to count |
| 🟢 | [CS 106B](courses/CS%20106B.md) | In progress, but with no promise of public recordings: this offering's go to Canvas, and no recent offering has a public set |
| 🟢 | [CS 247G](courses/CS%20247G.md) | Studio: instruction and project outlines public, detailed briefs and the dated schedule on Canvas |
| 🟡 | [CS 273B](courses/CS%20273B.md) | A relevant older offering's open Canvas supplies the syllabus and decks; no practice anywhere |
| 🟡 | [CS 348I](courses/CS%20348I.md) | Seminar whose reading list is public but whose homework, quiz, project and decks are all gated: a reading list is a whole core only when the course sets nothing else |
| 🔴 | [CS 25N](courses/CS%2025N.md) | Only the syllabus; homework and project, the whole grade, unpublished |
| ⛔ | [CS 46N](courses/CS%2046N.md) | Syllabus Stanford-only; the public 2015 site predates the current quantified-self course |
| ⛔ | [CS 349F](courses/CS%20349F.md) | Current site answers 403; the public Autumn 2020 archive is a different curriculum |

### Legacy pages (during the migration)

The wiki is moving from a single `materials` map to the keys above; the design and procedure are in `.agents/2026-09-30.materials.md`.

- **A course page with a `materials` map and no top-level `access` is legacy**, rated under the old rules. Never write that shape: any edit to a legacy page's materials migrates the whole page, starting with `node .agents/2026-09-30.materials.ts "courses/<code>.md"` (`wiki-course`).
- **Scripts**: lint accepts either shape, rejects a page mixing them, and prints how many legacy pages are left. Tables show a legacy page's old rating as 🟢?, 🟡? or ⛔? (old `open`, `partial`, `closed`).
- This subsection, the helper and the legacy code go once no legacy page is left.

## Past offerings

`past` maps written-out term names to sparse records of older offerings, e.g. `past: { Spring 2022: { slides: https://… } }`. The top level always describes the page's `term`.

- **A key that is present was verified for that offering; a missing key means not recorded**, never the current value or a newer term's. Keep verified values even when they repeat today's. A list is the complete recorded value, not an addition to the current one.
- **Allowed keys**: `title`, `instructors`, `homepage`, the material types, `sites`, `self_study`, `textbook` and `topics`, in the same shapes as at the top level. Not `access`, `checked`, `exceptions`, tags, lifecycle keys or a nested `past`. Build sorts the terms oldest first, and each record's keys in top-level order.
- **Terms**: each is earlier than `term` and appears in `terms_offered`. Never derive `terms_offered` from `past`. An empty record is an error.
- **Every older offering has a record with `instructors`**: each term in `terms_offered` from `cutoff_term` on, other than `term`, so its term-table row names that offering's professor. Take the catalog's principal instructors (role PI) for that term, in catalog order, from its lecture or seminar sections, or from its discussion or lab sections when it has nothing else; `[]` when the catalog names nobody. Add `title` whenever that term's catalog title differs from the current one. Lint warns about a term without `instructors`.
- **Every older offering's syllabus is sought, and captured when public**: it shows how the course changed, and it is the first thing to disappear. `past.<term>.syllabus` is `open` with its URL, and the document ingested (`<code>-syllabus-<term>.md`), when a copy is public; `closed` when the syllabus repository lists a Stanford-only or enrolled-only upload and no public copy turned up; omitted when nothing was found. **Ingest a copy per offering, because the host may vanish and take the record with it.** The one exception is material something else preserves: **Stanford's class archive**, `web.stanford.edu/class/archive/…`, where one index reference per course stands in (`<code>-offering-archive-<years>.md`: each offering's path, its term as read off the page, and what it holds). **Everything else gets its own copy, however stable the path looks** — GitHub Pages, Google Docs and Drive, personal sites, and Stanford lab and group hosts, which are preserved by nobody: `tml.stanford.edu` rebuilt and 404'd [CS 348E](courses/CS%20348E.md)'s whole site, and `sing.stanford.edu` dropped the directory holding [CS 349G](courses/CS%20349G.md)'s 5 guest lectures, 2 of which are now gone for good. A course's own per-offering paths (`/2021/`, `/winter22/`) are not the class archive and get no index. A public syllabus also gives that offering its `homepage`, and its `topics` when the syllabus is ingested; offerings the archive index covers get their `topics` in the Evolution pass, which ingests what it compares. Where to look is in `wiki-materials` → Find the site: the course's own links to earlier offerings, per-offering paths, the syllabus repository, the class archive and the Internet Archive.
- **Sources**: no fact from memory, here as everywhere. Every value comes from a source in the page's `sources`; there are no per-record citations.
- **A collection spanning several offerings** (a playlist mixing years) is filed under the offering whose part it rates, with the wider scope in its note, never wholesale under one term. A standing archive that each offering adds to belongs at the top level. A resource no offering produced, or whose offering can't be established, goes in the top-level `sites`, never under an invented term.
- **`title`** is the catalog's for that term, verbatim, without the code prefix the top-level key carries and without the cross-listed codes the catalog appends, unless the course's own site names that offering differently; then say so in Source notes. **`instructors`**: catalog spelling and order, lead first when a source says who leads. **`topics`**: from that offering's syllabus or schedule, or its catalog description when nothing else exists. Two topic lists that differ don't prove the teaching changed: a claim of change rests on dated sources, worded to fit them ("the catalog description changed" is not "the course started teaching X").
- **A rating under `past`** is today's observation, made on `checked`, of material belonging to that offering. It doesn't claim the material was public at the time.
- **Pre-cutoff material**: a record for a term before `cutoff_term` may hold only material types, `sites` and `self_study`, needs `exceptions.pre_cutoff` with the reason (lint warns otherwise), and doesn't extend `terms_offered`. Such material is usually too old to count; relying on it for `access` needs the reason in the Materials section. It can always be mentioned in prose without a record.

**Moving to a newer offering**, in this order, because a skipped or misordered snapshot can't be recovered:

1. A legacy page is migrated first, under its original `term` ([Legacy pages](#legacy-pages-during-the-migration)).
2. Move the outgoing offering's verified `title`, `instructors`, `homepage`, material entries, `sites`, `self_study`, `textbook` and `topics` into `past.<old term>`. Merge into an existing record without overwriting, and report any conflict.
3. Clear the top-level material types, `sites`, `self_study`, `textbook` and `homepage`, then fill them for the new offering. A type not yet checked stays `unknown`.
4. Reassess `access` with the older evidence now in `past`, reconsidering whether it is still relevant.

## Registrations

CPT, independent study or project, advanced reading, TGR and similar numbers have no teaching content. They use `type: Registration` in `courses/<code>.md`, with the course keys minus `term`, `terms_offered`, `instructors`, `schedule`, every Content key (`homepage`, `access`, the material types, `sites`, `self_study`, `textbook`, `topics`, `past`), `checked` and `exceptions`; `prerequisites` is optional (e.g. `[Consent of instructor]`). They run every term, so a term sweep never touches them: recording which terms would churn every registration page on every sweep, and no table reads it. The body is a line or two on who it's for; variants (CS 399P, CS 499) go in Related. They're listed under `## Registrations` in `courses/index.md` and never on term pages.

## Programs

Program sheets are lists of courses, so **the lists live on program pages, and build derives every course's codes from them**. Build removes all existing `mscs-` tags and appends the regenerated tags after the subject tags, preserving subject-tag order. Lint checks the result. Never edit `mscs-` tags by hand.

Generated tags: `mscs-breadth-A` through `mscs-breadth-D`, `mscs-foundation`, `mscs-si`, and `mscs-<key>-<letter>` for each depth category (e.g. `mscs-ai-b`, `mscs-systems-a`). `mscs-<key>-approval` marks depth entries needing approval. Excluded courses get only `mscs-excluded` among their generated tags; courses on no list get none. Order: breadth letters, foundation, SI, then specializations sorted by key, each with depth letters sorted and approval last. Breadth letters stay uppercase; depth letters use the sheet’s case.

- **`programs/MSCS.md`** (`type: Program`): the requirements all MSCS specializations share, and their lists: `mscs_foundations`, `mscs_si`, `mscs_breadth: { A, B, C, D }`, `mscs_excluded`.
- **`programs/MSCS <name>.md`** (`type: Specialization`): one specialization's depth, as `key` (e.g. `ai`), `mscs_depth: { a: [...], b: [...], … }` with the sheet's own letters, and `mscs_approval` for the sheet's † entries.
- The lists carry the `mscs_` prefix; lint rejects the unprefixed names, which build would ignore.
- Both have `edition` (the sheet's academic year, `2026-27`), `resource` and `sources` pointing at the sheet, and prose requirements in the body. When a new edition is published, update the lists and `edition`; course pages don't change.
- List entries are codes; `CS 247*` means any suffix. Conditions ("with CS 111 as prerequisite", "for 3 units", "CS 229 may substitute for CS 221") go in the body, not in the lists.
- A course matches by its `code` or any `cross_listed` or `formerly` code. The previous holder of a reused number never matches.

**Codes in tables**: two formats. **Breadth**: breadth letters **A** formal foundations, **B** learning and modeling, **C** systems, **D** people and society, then **F** if it's a foundation. **Depth**: **SI** if it counts as significant implementation, then the specialization's depth letters (e.g. `SI b`, `c`). Approval (**†**) is not shown; it's on the page's `mscs_approval` and in its prose. In both, **-** alone means the sheet excludes it (it can't count toward the MSCS), and blank means it's on no list. `MSCS.md` shows Breadth; a specialization page shows Breadth and its own Depth; term pages show the Depth of `primary_specialization`, and `courses/index.md` just its depth letters, in a column named after its page without "MSCS" (e.g. "AI"). The **Public** column is the `access` icon (see [Tables](#tables)).

## Term pages

`terms/<Season YYYY>.md`. The filename is the term; the page carries no `term` key, and lint rejects one. Frontmatter: `type: Term`, `title`, `description`, `academic_year` (the term's academic year, `2026-2027`), `start_date`, `end_date`, `is_current_term`, `num_undergraduate`, `num_graduate`, `sources` (the catalog listing and academic calendar). Build writes the three generated keys: `is_current_term: true` appears on the `current_term` page only, absent everywhere else, and the counts are the courses with this term in `terms_offered`, by `level`, excluding registrations. It also sorts the keys into this order. Dates are required in `YYYY-MM-DD` format: Stanford's first day of classes through the last day of end-quarter examinations, inclusive. Body:

```markdown
# Winter 2027

Optional: one line of term-wide context, e.g. "Taught remotely."

<!-- Generated by build.ts (course-table). Don't edit, run `make build` -->

## TODO

- CS 000 Title

## Notes

- Anything term-specific worth recording.
```

Build puts the prev/next bar and the course table above the marker (see [Tables](#tables)); a new page needs only the marker line. "TODO" is hand-written: catalog courses in scope that have no page yet.

The opening line is optional, and only for something term-wide worth saying — a remote quarter, a changed calendar, an unusual size. Don't restate what the heading and frontmatter already give: no course counts (they are `num_undergraduate` and `num_graduate`), no "The current term", no "Second term of academic year 2021-22".

`## Notes`, last and optional, takes the per-course observations: which courses a thin term actually ran, a course appearing under non-CS codes only, an unusual meeting pattern, titles that have changed since. Keep them out of the opening line.

## References

One wrapper per fetched source in `references/`, holding the source's own content: extracted text with navigation and boilerplate removed, or for a binary, a short summary plus the file saved beside it and embedded (`![name](name.pdf)`). There is no index: the directory is the list, and pages reach a wrapper through their `sources[].file`. **Binaries over 10 MB aren't committed**: keep `bytes`, `sha256` and the summary, say so in `note`, and leave out the embed. Lint warns about any larger file in `references/`.

```yaml
type: Source
title: CS 312 course site — Autumn 2026
description: One sentence on what the source contains.
resource: https://original.url/        # where it was fetched from
generated: { by: <harness>/<model>, at: <fetch timestamp> }   # your own model, as above
media_type: text/html                  # or application/pdf, text/xml …
term: Autumn 2026                      # the offering it documents, if any
note: "What was dropped or summarized; any discrepancy with the catalog."
bytes: 5355993                         # binaries only, even when the file itself isn't kept
sha256: 8717…                          # binaries only
```

## Tables

Course tables and each course page's `mscs-` tags are **generated by `make build`** (`scripts/build.ts`) from course frontmatter and program lists. Never edit them by hand; fix the page or list and rebuild.

Inside hand-written pages, a generated block is one contiguous table or list, then a blank line, then a marker line naming it: `` <!-- Generated by build.ts (<id>). Don't edit, run `make build` --> ``. Build rewrites only that run of lines, so keep a blank line between it and anything hand-written above. Everything else is yours. A page missing its marker is an error in build and lint.

- **`courses/index.md`**: fully generated, so it has no markers or heading before the table. One row per course, then registrations as a list.
- **`terms/index.md`**: fully generated, one row per term page with its course counts, grouped under a labeled row per academic year, oldest year first.
- **`terms/<Term>.md`**: one block holding a prev/next bar to the chronological neighbor term pages and the Course table, which lists every course with that term in its `terms_offered`; the current term (`is_current_term: true`) also gets the meeting days. Registrations are never included. Build also drops a "TODO" line once its page exists, and the section itself once it is empty.
- **`programs/*.md`**: build fills the Course table under `## Courses` (matching course pages) and the list under `## TODO` (list entries without a page). `MSCS.md`'s table also lists every course on a specialization's depth or approval list, with a blank Breadth cell when it is on none of `MSCS.md`'s own lists; its TODO stays its own.
- **The Public column** shows each page's current `access` on every row, historical rows included: ⛔ 🔴 🟡 🟢 ✅, or blank for `unknown`. **`open` and `mostly-open` share one icon pair, and `videos` picks between them, not the level**: either one shows ✅ when `videos` is open at the top level or in `past`, and 🟢 when it isn't, so ✅ always means the recordings are there and 🟢 always means they aren't. The hover carries the level the icon no longer does: "open", "open, videos available", "mostly open", "mostly open, videos available". The pairing is interim, pending the levels refactor. Markers after the icon flag things such as open assignments and `self_study`; `publicIcon` in `scripts/wiki.ts` defines them. Each icon, 🆕 included, is wrapped in a `<span title>` whose hover text explains it (`publicCell`): GitHub keeps the attribute, `<abbr>` underlines, and a link title turns the icon into an Obsidian link.
- **Historical rows** in a term table take the professor from `past.<term>.instructors`, or from the page's `instructors` for its own `term`; it is blank when that list is empty or missing. The title comes from `past.<term>.title`, else the page's current title.
- **New courses**: a course's first code gets a trailing 🆕, after a non-breaking space, when a table's term is the earliest in its `terms_offered` and is at least 2 years after `cutoff_term` (Winter 2022 for Winter 2020); earlier first terms mostly reflect the cutoff. A term table uses its own term; `courses/index.md` and program tables use the last 4 terms up to `current_term`.