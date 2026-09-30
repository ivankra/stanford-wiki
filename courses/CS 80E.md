---
type: Course
code: CS 80E
title: "CS 80E: Dissecting The Modern Computer"
description: A 2-unit survey of the hardware under your programs - circuits, RISC-V, pipelined processors, caches and GPUs - for people who took CS 107 and wanted more.
level: undergraduate
term: Autumn 2025
terms_offered:
  - Autumn 2023
  - Autumn 2025
instructors:
  - Master, T.
units: "2"
grading: Satisfactory/No Credit
prerequisites:
  - CS 106B
homepage: https://web.stanford.edu/class/cs80e/
access: mostly-closed
syllabus:
  access: open
  url:
    - https://web.stanford.edu/class/cs80e/syllabus.html
    - https://web.stanford.edu/class/cs80e/
  note: the 5 units of content unit by unit, the credit requirements, meeting times and the instructor's guidance on who should not enroll, plus a 10-week schedule naming all 18 sessions and the dates of 6 assignments
slides:
  access: unknown
  note: none posted. Each lecture row on the schedule carries a commented-out pair of Slides and Code links whose anchors have no target, in this offering and in Autumn 2023 alike
notes:
  access: unknown
  note: none found; the site is 2 static pages and links nothing beyond one Wikipedia article
videos:
  access: unknown
  note: no recording is mentioned, and nothing turned up under the code or the instructor's name
assignments:
  access: unknown
  note: the schedule names Assignments 0 to 5 with their out and due dates - Getting to know you, Digital Systems, RISC-y Business, Processor Exploration with Ripes, SCache and a sixth - and links no handout for any of them
solutions:
  access: unknown
  note: none found
exams:
  access: none
  note: credit turns on attending every lecture and passing every assignment, and the schedule sets no exam
projects:
  access: none
  note: the course sets none; the graded work is the 6 assignments
repo:
  access: unknown
  note: the schedule's Code links are the same unfilled placeholders as its Slides links, and no repository turned up
topics:
  - digital circuits and combinational logic
  - sequential logic
  - the RISC-V instruction set
  - pipelined processors
  - the memory hierarchy and caches
  - GPUs
  - hardware side-channel attacks
past:
  Autumn 2023:
    instructors:
      - Master, T.
    homepage: https://web.stanford.edu/class/archive/cs/cs80e/cs80e.1242/
    syllabus:
      access: open
      url: https://web.stanford.edu/class/archive/cs/cs80e/cs80e.1242/syllabus.html
      note: that offering's whole site survives in Stanford's class archive, with its own schedule of 18 sessions and 5 assignments and a Miscellaneous unit reading "GPU's, Virtual Machines"; a copy also went to Canvas, Stanford-only (syllabus repository)
    slides:
      access: unknown
      note: the same commented-out, targetless Slides links as the current offering
    assignments:
      access: unknown
      note: "5 assignments named and dated - Getting to know you, Digital Systems, RISC-y Business, SCache and a fifth - with no handout linked"
tags:
  - computer-architecture
  - introductory
aliases:
  - CS80E
checked: "2026-10-02"
status: stable
generated:
  by: claude-code/claude-opus-5[1m]
  at: "2026-10-02T00:00:00Z"
sources:
  - id: catalog
    resource: https://explorecourses.stanford.edu/search?view=xml-20200810&academicYear=20252026&q=CS&filter-departmentcode-CS=on&filter-coursestatus-Active=on
    file: ../references/explorecourses-cs-2025-2026.md
    title: ExploreCourses, 2025-2026
  - id: site
    resource: https://web.stanford.edu/class/cs80e/
    file: ../references/cs-80e-course-site-autumn-2025.md
    title: Course site and syllabus, checked 2026-09-27
  - id: archive
    resource: https://web.stanford.edu/class/archive/cs/cs80e/cs80e.1242/
    file: ../references/cs-80e-offering-archive-2023-2025.md
    title: CS 80E offerings in Stanford's class archive, 2023 and 2025
  - id: catalog-2023-24
    resource: https://explorecourses.stanford.edu/search?view=xml-20200810&academicYear=20232024&q=CS&filter-departmentcode-CS=on&filter-coursestatus-Active=on
    file: ../references/explorecourses-cs-2023-2024.md
    title: ExploreCourses, 2023-2024
  - id: syllabus-repo-2023-24
    resource: https://syllabus.stanford.edu/syllabus/searchCourses/F23/CS/
    file: ../references/syllabus-repository-cs-2023-2024.md
    title: Stanford Syllabus repository, CS, 2023-2024
---
# CS 80E: Dissecting The Modern Computer

A survey, and honest about it. The syllabus tells students who have taken EE 108, EE 180 or [CS 149](CS%20149.md) not to enroll, and describes the audience precisely: "students who took CS107 and look back and wish they could try and take CS107E."

## Materials

The syllabus is a real one — the 5 units, the credit requirements, the logistics, the schedule of all 18 sessions with every assignment's dates — and it is all a reader gets. Nothing students work from has ever been posted: the schedule's rows were built with Slides and Code links, and in both offerings those anchors sit commented out with no target.

- **Syllabus**: [the syllabus page](https://web.stanford.edu/class/cs80e/syllabus.html) and the [schedule](https://web.stanford.edu/class/cs80e/) on the landing page. [Autumn 2023's pair](https://web.stanford.edu/class/archive/cs/cs80e/cs80e.1242/) survives in Stanford's class archive, with 18 sessions, 5 assignments and a Miscellaneous unit that read "GPU's, Virtual Machines" where this one reads hardware side-channel attacks.
- **Slides**, **Repo**: none posted. Every lecture row carries `<!-- <a>Slides</a> <a>Code</a> -->`, a template never filled in — 18 of them on the current page.
- **Notes**: none found. The site is 2 static pages and links nothing but one Wikipedia article on cache misses.
- **Videos**: no recording is mentioned, and nothing turned up under the code or the instructor's name.
- **Assignments**: the schedule names Assignments 0 through 5 with their out and due dates — Getting to know you, Digital Systems, RISC-y Business, Processor Exploration with Ripes, SCache and a sixth — and links no handout for any.
- **Solutions**: none found.
- **Exams**, **Projects**: none. Credit turns on attending every lecture, passing every assignment, and "a good-faith effort to contribute to the learning experience for everyone".

## Syllabus

5 units, in the site's own framing:

1. **Circuits** — "the really low level stuff: signals and circuits", into combinational and sequential logic. "By the end of this unit, students should be able to examine a simple pipelined processor diagram."
2. **Processors** — the simple pipelined processor "and examine how it laid the groundwork for today's computational powerhouses."
3. **ISA** — "At the heart of the hardware-software boundary is the Instruction Set Architecture. We'll use RISC-V to study how we can turn our code into actual hardware production!"
4. **Memory** — "the memory hierarchy, from caches to Disk. We will spend most of our time on caches."
5. **Miscellaneous** — "GPU's, hardware side-channel attacks, and potentially a class-picked topic!"

Credit requires attending all lectures on time, passing all assignments, and "a good-faith effort to contribute to the learning experience for everyone".

## Prerequisites

- [CS 106B](CS%20106B.md) or equivalent, required. [CS 107](CS%20107.md) recommended, "given how much of the myth machines / unix we'll be using".

## Related

- [CS 107E](CS%20107E.md): the bare-metal course CS 80E is explicitly a lighter alternative to — its syllabus says [CS 107E](CS%20107E.md) alumni "will see a lot more overlap of material".
- [CS 149](CS%20149.md) and [CS 180](CS%20180.md): the depth courses the catalog points graduates of this one toward, and that its syllabus says should displace it.

## Source notes

- Each offering's site is exactly 2 pages, `index.html` and `syllabus.html`. `assignments/`, `slides/`, `lectures/`, `handouts/`, `hw/`, `notes/` and `resources/` all 404 under both (checked 2026-10-02).
- **The schedule's missing material is visible in the markup.** Every lecture row holds `<!-- <br><a>Slides</a><br><a>Code</a> -->`; the anchors carry no `href` in either offering, so the links were never written rather than taken down.
- The archive's `cs80e.1252` (Autumn 2024) 404s, matching a course that ran in Autumn 2023 and Autumn 2025 and not between. `cs80e.1262` is the current offering and duplicates the live site.
- An enrollment notice records that the class filled to capacity and advises turning up to the first session anyway.
