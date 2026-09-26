---
type: Guide
title: Stanford CS course wiki
description: What this wiki is, how it's laid out, and every rule for its pages. The single source for every rule; read it before editing.
current_term: Autumn 2026
primary_specialization: ai
---
# Stanford CS course wiki

A wiki of Stanford courses, built around two questions:

1. **What materials can a non-enrolled reader open?** (`materials` and the Materials section, first on every page)
2. **What does the course actually cover?** (the Syllabus section and `topics`, taken from its own syllabus)

Everything else (terms, instructors, units) supports those two. Plain markdown; the repository root is an [OKF](https://github.com/GoogleCloudPlatform/knowledge-catalog/blob/main/okf/SPEC.md) bundle, editable with any tool. `current_term` and `primary_specialization` in this file's frontmatter are read by the scripts.

## Layout

- `courses/<code>.md`: one page per course; `courses/index.md` is the roster table
- `terms/<Season YYYY>.md`: one table per term
- `programs/`: MSCS requirements; their course lists drive every table's program codes
- `references/`: ingested copies of sources; may be an absent or empty subrepo (build and lint tolerate this; lint defers checks of paths inside it)
- `index.md`, `log.md`: reserved OKF files
- `TODO.md`: repo-level backlog (see [Backlog](#backlog))
- `AGENTS.md`: this file
- `.agents/skills/`: task procedures (see [Skills](#skills))
- `scripts/`: `build.ts` regenerates tables and MSCS tags, `lint.ts` checks the bundle; `Makefile` runs both
- `old/` (if present, gitignored, skipped by the scripts): the previous wiki, as reference material only. Never cite it; re-ingest instead.

Every `.md` file here except `index.md` and `log.md` is an OKF concept and needs frontmatter with at least `type`, including `TODO.md`.

## Rules

1. **No fact from memory.** Every fact comes from a source listed in the page's `sources`, by original URL. Ingest it into `references/` when practical (`wiki-ingest`); a URL-only source goes on the ingest backlog in `TODO.md`. No inline citations.
2. **`unknown` beats a guess.** Leave a field or rating unknown rather than inferring it.
3. **Never get around a login, paywall or anti-bot wall.** Record what you saw and move on. Ask the user for a paste if the content is needed.
4. **Tables are generated.** After changing any course or program page, run `make build`. Never edit table rows or a course's `mscs-` tags by hand.
5. **Add one line to `log.md`** for each change session, newest first.
6. **Be brief**, in pages and in your replies — brief in wording, not in substance (see [Voice](#voice)). Frontmatter holds the data; the body adds only what frontmatter can't.
7. **Scope:** CS graduate courses by default (see [Scope](#scope)). The user widens it case by case; suggest a widening, never do it unasked.
8. **Stop and ask** when scope is ambiguous or a change would contradict an existing page.
9. **Suggest improvements.** You see the wiki up close; when you notice something that would make it better, say so. That could be a rule that doesn't fit the data, a recurring manual step worth scripting, an inconsistency across pages, or a gap in the sources. Skip trivial and minor ones: wording nits, cosmetic tweaks, small one-off fixes, and anything that doesn't noticeably change how the wiki works or reads. Put suggestions at the end of your reply, and don't act on them unasked.

## Scope

- **Default:** Stanford CS graduate courses, meaning ExploreCourses `academicCareer` is GR **or** the number is ≥ 200.
- **Wider on request:** other departments, undergraduate courses or single courses, when the user asks for them (Rule 7).
- Offerings after `current_term` are always out.

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
```

Lint rejects unresolved Git conflict markers in wiki Markdown files.

The scripts are TypeScript run directly by Node with no dependencies, so Node must strip types natively (on by default in Node 23.6+ / 22.18+). Nothing else requires a particular app or agent: use the OpenKnowledge MCP tools if you have them, or edit the files directly, and run the lint either way.

Build canonicalizes all frontmatter as block YAML with two-space indentation, expanding maps and lists and keeping empty collections as `[]` or `{}`. It preserves values and key order, quotes ambiguous strings and `units`, and leaves `concluded` as a boolean and `bytes` as a number. The one exception is `materials`, whose keys build sorts into the schema's order (`checked`, `access`, `term`, the [types](#materials), `sites`), so writing them out of order is not a mistake to avoid.

## Voice

Terse and factual — a rule about **wording, not about how much you say**. Cut filler, hedging, and restatements of frontmatter (Materials and Prerequisites excepted, below). Never cut the specifics a reader came for. Say it once, in the place it belongs, and make it concrete.

**The test is whether a sentence could be about a different course.** If it could, it isn't finished. "Materials are public" is not a Materials section; "the schedule links a PDF for lectures 3, 4, 5, 8, 9, 11, 15 and 16 and an executable trace for the rest" is. Name what's actually there and where it runs out: which weeks have decks, what the assignment asks you to build, which link is dead, why the site's term disagrees with the catalog. The summary paragraph says what sets this course apart from its neighbours — not what the title already says, and not a paraphrase of `description`.

Quote sources only where the exact wording matters: a policy a reader would otherwise not believe, or a phrase the course is known by.

[CS 312](courses/CS%20312.md), [CS 229](courses/CS%20229.md) and [CS 247G](courses/CS%20247G.md) fix the **level of detail**, not just the shape. A section of yours that is markedly thinner than theirs means you under-reported, not that you were concise. Under-reporting is the more common failure: it is easy to write four bullets that say nothing and land inside the word budget.

Pages are written for external students first.

## Terms and dates

- Stanford says **Autumn**, not Fall. Quote sources verbatim; use Autumn in our own voice.
- Always written out: `Autumn 2026`. Never codes like `2026A`.
- The academic year runs Autumn → Winter → Spring → Summer, so **Summer 2026 precedes Autumn 2026**.
- Dates are ISO: `2026-09-25`. Timestamps: `2026-09-25T00:00:00Z`.

## Files and links

- Course page: `courses/<code>.md`, code verbatim (`CS 224N.md`, `MS&E 226.md`). A cross-listed course gets one page, under its **CS code whenever it has one** (`CS 229`, not `STATS 229`), otherwise the catalog's primary code.
- Term page: `terms/<Season YYYY>.md` (`Autumn 2026.md`).
- Program page: `programs/<name>.md` (`MSCS.md`, `MSCS AI.md`).
- Reference: `references/<prefix>-<what>-<term>.md`, flat, lowercase letters, digits and hyphens only. The prefix is the course code (`cs-312-syllabus-autumn-2026.md`, `mse-226-…`) or the publisher (`explorecourses-cs-grad-autumn-2026.md`). A binary shares the wrapper's name (`….pdf`). The catalog is ingested **one file per term for the current academic year**, whose listing still changes (`explorecourses-cs-grad-autumn-2026.md`), and **one file per past academic year**, covering all four terms (`explorecourses-cs-grad-2025-2026.md`).
- Links are relative markdown links, percent-encoded: `[CS 224N](../courses/CS%20224N.md)`, with `(` `)` as `%28` `%29`. Repo paths in frontmatter (`sources[].resource`, `sources[].file`) are plain, not encoded.
- Link course codes in hand-written prose when the course has a page. Lint warns about unlinked `CS` codes with existing pages; codes without pages stay plain text.
- `index.md` and `log.md` are reserved ([OKF](https://github.com/GoogleCloudPlatform/knowledge-catalog/blob/main/okf/SPEC.md)): an `index.md` is a plain link list without frontmatter, except the root one (`okf_version`). `log.md` is newest-first.

## Course pages

**One page per course**, describing its **latest offering up to `current_term`**.

- A newer term turns up → rewrite the page around it.
- An older term turns up → **check it is the same course before adding it**, then add it to `terms_offered`; everything else stays anchored to the latest offering, except that its public materials may be recorded (see [Materials](#materials)).
  - **A code match is not an identity match.** Compare the older entry's title, description and instructors with the page's. A title that changed while the subject didn't is a rename and stays on one page ([CS 224V](courses/CS%20224V.md) was "Conversational Virtual Assistants with Deep Learning" until Autumn 2026); a different subject is a reused number and does not belong in `terms_offered` at all.
  - Note a rename in Source notes: term tables show the page's current title for every term, so a past term's row will carry a name that did not exist then.
- **A reused number** (a different subject, not a rename; a renumbered course keeps one page):
  - The previous course ran **within ~10 years** → it may get its own page, when one is worth writing: `courses/<code> (<last term>).md`, e.g. `CS 323 (Spring 2019).md`, anchored to its last offering. Program lists never match it. Each page names the other in one line.
  - It ran **more than ~10 years ago** → no page and no research; we're not doing archaeology. Add one line to the current page's Materials section only if its stale site sits at the canonical URL and could mislead a reader.

Worked examples: [CS 312](courses/CS%20312.md), a current offering with open core materials; [CS 229](courses/CS%20229.md), with mixed access, older-offering material, extra `sites` and alternative prerequisites; and [CS 247G](courses/CS%20247G.md), a compact studio-course page with conditional prerequisites. Copy their shape **and their level of detail** (see [Voice](#voice)).

### Frontmatter

`scripts/lint.ts` enforces this schema (key order, required keys, allowed values), and `scripts/build.ts` reads it. **Change the schema here and in the scripts in the same edit.**

Keys go in this order; all are required unless marked *optional*. In the Type column, *term* is a term name (`Autumn 2026`), *code* a course code (`CS 312`), and `a | b` one of the listed values. Quote any text that contains `: `, `#`, or a comma inside `[…]`/`{…}`.

| Group              | Key             | Type                                                                                    | Value                                                                                                                                                                                                                                                                                                                                                               |
| ------------------ | --------------- | --------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Identity**       | `type`          | `"Course"`                                                                              |                                                                                                                                                                                                                                                                                                                                                                     |
|                    | `code`          | string                                                                                  | The page's code, conventional spacing: `CS 312`. Matches the filename.                                                                                                                                                                                                                                                                                              |
|                    | `title`         | string                                                                                  | `"<code>: <official title>"`, with the title verbatim from the catalog.                                                                                                                                                                                                                                                                                             |
|                    | `description`   | string                                                                                  | One sentence: what the course is about. Shown in listings.                                                                                                                                                                                                                                                                                                          |
|                    | `cross_listed`  | code[], *optional*                                                                      | Other codes for the same course, e.g. `[STATS 229]`. Omit when there are none.                                                                                                                                                                                                                                                                                      |
|                    | `level`         | `graduate` \| `undergraduate`                                                           | From the catalog's `academicCareer`, not from the number.                                                                                                                                                                                                                                                                                                           |
| **Offering**       | `term`          | term \| `""`                                                                            | The offering the page describes: the latest one ≤ `current_term`. Equals the last entry of `terms_offered`; `""` if never offered.                                                                                                                                                                                                                                  |
|                    | `terms_offered` | term[]                                                                                  | Every term a source showed in recent years, oldest first. Let's cut off at ~2020 if terms_offered grows too big. Older history, if it matters, gets one line in Source notes. Don't add catalog link for old term offering in `sources`.                                                                                                                            |
|                    | `instructors`   | string[]                                                                                | Catalog spelling, e.g. `["Hashimoto, T."]`, in catalog order, except that the lead goes first when a source says who leads (say which in Source notes). Tables show the first one. Empty if unannounced.                                                                                                                                                            |
|                    | `schedule`      | string, required for current term                                                       | Lecture days and time, then room: `"TR 13:30-14:50, CoDa B90"`. Days: M T W R F. Use `""` if unknown or no fixed meeting. Optional for older terms; build drops it.                                                                                                                                                                                                 |
|                    | `units`         | string                                                                                  | Quoted even when a single number, because ranges are common: `"3"`, `"3-5"`.                                                                                                                                                                                                                                                                                        |
|                    | `grading`       | string                                                                                  | Catalog grading basis, verbatim.                                                                                                                                                                                                                                                                                                                                    |
|                    | `prerequisites` | string[]                                                                                | One entry per requirement, all of them needed. Alternatives go in one entry joined by "or": `["CS 106A or CS 106B", "CS 109 or STATS 116", MATH 51]`. Codes where the catalog names courses, otherwise a few words. Empty = none stated.                                                                                                                            |
| **Content**        | `homepage`      | URL, *optional*                                                                         | The course's own site; a shared family site (e.g. one site for CS 247A/G/S) if there's nothing more specific, noted in Source notes.                                                                                                                                                                                                                                |
|                    | `materials`     | `{ checked?, access, term?, <type>: rating \| { access, url?, term?, note? }, sites? }` | Public availability; see [Materials](#materials).                                                                                                                                                                                                                                                                                                                   |
|                    | `topics`        | string[]                                                                                | A representative selection of 4–10 noun phrases: what a student would say the course covers. Paraphrase freely, but ground every topic in the Syllabus section or its sources. Name content, not format ("transformer ablations", not "experiment design"); prefer the specific; don't repeat the title. The list should tell the course apart from its neighbours. |
| **Classification** | `tags`          | string[]                                                                                | Lowercase, hyphenated subject tags first, then generated `mscs-` tags from [program pages](#programs), e.g. `[deep-learning, mscs-breadth-B, mscs-ai-b]`. Level and term have their own keys.                                                                                                                                                                       |
| **Provenance**     | `sources`       | `{ id, resource, file?, title }[]`                                                      | Every source the page relies on (OKF's shape). `id` is a short word. `resource` is required: **the original URL whenever there is one**, else a repo path. `file` is the ingested copy, `../references/….md`, once it exists; URL-only sources are waiting to be ingested (`TODO.md`).                                                                              |
|                    | `status`        | `draft` \| `stable` \| `deprecated`                                                     | OKF lifecycle. `stable` = every claim is sourced and materials were checked this term, whatever the ratings came out as: a page with `access: unknown` can be stable.                                                                                                                                                                                               |
|                    | `generated`     | `{ by, at }`                                                                            | `by`: `<harness>/<model>`: **your own** harness and exact model ID, as your harness reports it, never a value copied from another page (the worked examples are not a template for this key). If you don't know it, ask. `at`: timestamp of the last substantive rewrite.                                                                                           |
|                    | `verified`      | `{ by, at }`, *optional*                                                                | `by`: `"human:<id>"`; `at`: when a person reviewed the page.                                                                                                                                                                                                                                                                                                        |

### Body

In order: summary paragraph (no heading) · **`## Materials`** · **`## Syllabus`** · `## Prerequisites` · `## Related` · `## Source notes`. Public materials come first, then what the course covers.

- **Materials**: lead with the verdict (what's public, what's gated), then one bullet per type in the frontmatter, in type order and including `closed` and `none` (`**Syllabus**`, `**Slides**`, …), linking straight to the material and covering the `sites` entries, with any extras last. Obsidian doesn't render the nested `materials` map, so this section is its only readable version: repeating the frontmatter here is intended. Keep the two consistent.
- **Syllabus**: what is covered, unit by unit, from the course's own syllabus or schedule (catalog text if there's nothing else), linked in the section's first line. Leave it out only if no source says what the course covers.
- **Prerequisites**: what a reader needs to know, in plain words, one bullet per requirement, with the course codes as examples: `- Probability: CS 109, MATH 151 or STATS 116.` Readers outside Stanford don't know the numbers, so say what each one stands for, from the catalog or the course's own wording. It may repeat `prerequisites`; keep the two consistent. Add what the course recommends but doesn't require, marked as such.
- **Related**: similar or sequenced courses, one line each on how this one differs: `- [CS 329Z](CS%20329Z.md): general agent engineering and evaluation; this course grounds agents in databases.` For two courses that are easy to confuse, a small comparison table (at most ~5 rows, no prose around it) is fine.
- **Source notes**, always last: sourcing quirks for the next person who checks, such as redirects and canonical domains, dead links (with the date checked), sources that disagree, a site's own term wording. It's for maintainers, so keep it out of the sections above.
- Every other section is optional; skip any that would be empty.
- **Length**: around 300 words above Source notes suits a course with ordinary materials, and roughly 450 is the ceiling. It is a guard against padding, not a target to hit — a course that publishes a lot needs more Materials bullets and a longer Syllabus, and those earn their words. Spend them on specifics; never buy them back by dropping one. Source notes have no budget.

## Materials

What a reader **not enrolled at Stanford** can open today, without a login. Each material type gets a rating, and `access` sums them up for the whole course. **Core** materials are the syllabus, slides or notes, and assignments.

| Rating    | Icon      | For one type                                                                                                                    | For the whole course (`access`)                                                                                                                                                                                             |
| --------- | --------- | ------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `open`    | 🟢        | Anyone can open it from the public web with no account: a course site, a public repo or playlist, a PDF on a department server. | All core material that was found is public, from this offering or a relevant one up to ~5 years old (see below). Gated or unfilmed **videos don't downgrade it**, since some courses can't publish recordings or never film at all. |
| `partial` | 🟡        | Some of it is public, the rest is gated, e.g. the first weeks' slides, or sample exams only.                                    | Some core material is public and some is gated, e.g. open slides but assignments on Canvas.                                                                                                                                 |
| `closed`  | 🔴        | It exists, but only behind Stanford SSO, Canvas, Ed, Gradescope or a 403.                                                       | All core material is gated.                                                                                                                                                                                                 |
| `none`    | ⚪         | This course doesn't produce it, e.g. no exams.                                                                                  | Not used: a course with no materials by nature is a [Registration](#registrations).                                                                                                                                         |
| `unknown` | *(blank)* | Not checked yet, or looked for and not found. Never guess.                                                                      | Core material not yet checked, or none found.                                                                                                                                                                                              |

Types, in this order; an omitted type is `unknown`:

| Type | Covers |
| --- | --- |
| `syllabus` | syllabus, schedule, grading policy, reading list |
| `slides` | lecture slides |
| `notes` | lecture notes, section handouts, a course reader or staff-written book |
| `videos` | lecture and section recordings |
| `assignments` | problem sets, project specs |
| `solutions` | assignment and exam solutions |
| `exams` | past or practice exams |
| `projects` | student project reports, posters, showcases |
| `code` | starter code, autograders, public repos |

```yaml
materials:
  checked: 2026-09-25          # when the ratings were last verified
  access: open                 # overall rating
  term: Autumn 2024            # optional: default term when everything comes from one older offering
  syllabus: open               # bare rating = the current offering (or `term` above), no link
  slides: { access: open, url: https://… }
  videos: { access: open, term: Spring 2025, url: https://… }   # this type from an older offering
  exams: { access: partial, note: "two sample questions only" }
  sites:                       # other sites a reader would use, besides `homepage`
    - { url: https://github.com/…, note: "starter code and lab handouts" }   # current offering
    - { url: https://…, term: Autumn 2025, note: "full slide set" }          # an older offering
```

- **Rate a type by its most open offering within ~5 years that is still relevant**, marked with `term`: same course and still close to what's taught now, a judgement call (a deck set from before a major syllabus change doesn't count). Mention a weaker current offering in `note` (e.g. "Summer 2026 posts only the RL and LLMs deck"), and link useful older material from the Materials section. Anything older than ~5 years goes in a `note` only; dead links go in Source notes.
- **`sites`**: every other site a reader would use for this course's materials, **not repeating `homepage`** (the one best current URL): a second host, a public repo, a textbook site, or an older offering's site. Each entry is `{ url, term?, note? }`; no `term` means the current offering, and an older one follows the same ~5-years-and-still-relevant rule as ratings. `note` says what the site holds. It's not an archive: list only sites a rating relies on or that hold material the others don't. The offering history is `terms_offered`, and the full list of old sites belongs in the site's reference. Per-type `url`s point into these sites.
- **Unknown doesn't downgrade**: rate `access` from the core types that were found. A core type still `unknown` after a search doesn't count against it, just as gated videos don't; `partial` means something core is actually gated. If no core type was found at all, `access` is `unknown`.
- **Seminars and talk series** with no coursework: the core material is the syllabus or schedule; `assignments`, `exams` and `projects` are `none`; talk slides and recordings are rated as usual.
- **`url`** is the single best entry point for a type. When material is scattered (three videos, slides spread across a schedule), link the rest from the Materials section.
- **Quote `note` values**: a comma inside `{ … }` would split the entry.
- **Never checked:** write just `materials: { access: unknown }`, with no `checked`. Lint lists these pages as backlog.
- A 200 response for an empty file or a bare directory listing is not material. A login wall *is* evidence of `closed`.
- **A course page that only restates the catalog is not material either.** A public page carrying the description, the staff, the meeting times and the prerequisites gives a reader nothing the catalog didn't. `syllabus` is rated on the schedule, reading list or grading policy; where those are gated, the type is `closed`, not `partial`, however open the announcement page around them is. `partial` needs a real part of the material itself to be public — the first weeks' decks, half the problem sets — not a page about it.
- Ratings older than one term count as `unknown` until rechecked; lint warns once `checked` is over 120 days old.

## Registrations

CPT, independent study or project, advanced reading, TGR and similar numbers have no teaching content. They use `type: Registration` in `courses/<code>.md`, with the course keys minus `term`, `terms_offered`, `instructors`, `schedule`, `homepage`, `materials` and `topics`; `prerequisites` is optional (e.g. `[Consent of instructor]`). They run every term, so a term sweep never touches them: recording which terms would churn every registration page on every sweep, and no table reads it. The body is a line or two on who it's for; variants (CS 399P, CS 499) go in Related. They're listed under `## Registrations` in `courses/index.md` and never on term pages.

## Programs

Program sheets are lists of courses, so **the lists live on program pages, and build derives every course's codes from them**. Build removes all existing `mscs-` tags and appends the regenerated tags after the subject tags, preserving subject-tag order. Lint checks the result. Never edit `mscs-` tags by hand.

Generated tags: `mscs-breadth-A` through `mscs-breadth-D`, `mscs-foundation`, `mscs-si`, and `mscs-<key>-<letter>` for each depth category (e.g. `mscs-ai-b`, `mscs-systems-a`). `mscs-<key>-approval` marks depth entries needing approval. Excluded courses get only `mscs-excluded` among their generated tags; courses on no list get none. Order: breadth letters, foundation, SI, then specializations sorted by key, each with depth letters sorted and approval last. Breadth letters stay uppercase; depth letters use the sheet’s case.

- **`programs/MSCS.md`** (`type: Program`): the requirements all MSCS specializations share, and their lists: `foundations`, `si`, `breadth: { A, B, C, D }`, `excluded`.
- **`programs/MSCS <name>.md`** (`type: Specialization`): one specialization's depth, as `key` (e.g. `ai`), `depth: { a: [...], b: [...], … }` with the sheet's own letters, and `approval` for the sheet's † entries.
- Both have `edition` (the sheet's academic year, `2026-27`), `resource` and `sources` pointing at the sheet, and prose requirements in the body. When a new edition is published, update the lists and `edition`; course pages don't change.
- List entries are codes; `CS 247*` means any suffix. Conditions ("with CS 111 as prerequisite", "for 3 units", "CS 229 may substitute for CS 221") go in the body, not in the lists.
- A course matches by its `code` or any `cross_listed` code. The previous holder of a reused number never matches.

**Codes in tables**: two formats. **Breadth**: breadth letters **A** formal foundations, **B** learning and modeling, **C** systems, **D** people and society, then **F** if it's a foundation. **Depth**: **SI** if it counts as significant implementation, then the specialization's depth letters, then **†** if they need approval (e.g. `SI b`, `c†`). In both, **-** alone means the sheet excludes it (it can't count toward the MSCS), and blank means it's on no list. `MSCS.md` shows Breadth; a specialization page shows Breadth and its own Depth; term pages show the Depth of `primary_specialization`, and `courses/index.md` just its depth letters, in a column named after its page without "MSCS" (e.g. "AI"). The **Public** column is the materials `access` icon.

## Term pages

`terms/<Season YYYY>.md`. The filename is the term; the page carries no `term` key, and lint rejects one. Frontmatter: `type: Term`, `title`, `description`, `academic_year` (the term's academic year, `2026-2027`), `start_date`, `end_date`, `concluded` (`false` only for the current term; lint checks it against `current_term`), `sources` (the catalog listing and academic calendar). Dates are required in `YYYY-MM-DD` format: Stanford's first day of classes through the last day of end-quarter examinations, inclusive. Body:

```markdown
# Winter 2027

One line of context.

<!-- Generated by build.ts (course-table). Don't edit, run `make build` -->

## TODO

- CS 000 Title
```

Build puts the course table above the marker (see [Tables](#tables)); a new page needs only the marker line. "TODO" is hand-written: catalog courses in scope that have no page yet.

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

- **`courses/index.md`**: fully generated, so it has no markers or heading before the table. One row per course, `| Course | Title | Term | AI | Public |`, then registrations as a list.
- **`terms/<Term>.md`**: the Course table lists every course with that term in its `terms_offered`. `concluded: false` shows `Prof/Days`; concluded pages show `Professor`. Registrations are never included. Build also drops a "TODO" line once its page exists, and the section itself once it is empty.
- **`programs/*.md`**: build fills the Course table under `## Courses` (matching course pages) and the list under `## TODO` (a coverage count, then list entries without a page, split into the default scope and the rest: the sheet's full coverage).

## Backlog

- **Repo-level work** (tooling, migration, pages to design) goes in `TODO.md`. Add an item when you find work you aren't doing now, and tick it off when it's done.
- **Content backlog** lives in the wiki itself: the term pages' `## TODO` sections, and lint warnings. A program page's `## TODO` shows coverage; write those pages only when they're in scope.
