---
type: Course
code: CS 80E
title: "CS 80E: Dissecting The Modern Computer"
description: A two-unit survey of the hardware under your programs - circuits, RISC-V, pipelined processors, caches and GPUs - for people who took CS 107 and wanted more.
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
materials:
  checked: "2026-09-27"
  access: partial
  syllabus:
    access: open
    url: https://web.stanford.edu/class/cs80e/syllabus.html
    note: unit-by-unit topics, credit requirements, meeting times and the instructor's guidance on who should not enrol, plus a week-by-week schedule on the landing page
  slides: unknown
  notes: unknown
  videos: unknown
  assignments:
    access: closed
    note: the schedule names Assignments 0-2 with release and due dates but links no handout; the site has only two pages
  solutions: unknown
  exams: none
  projects: none
  code: unknown
topics:
  - digital circuits and combinational logic
  - sequential logic
  - the RISC-V instruction set
  - pipelined processors
  - the memory hierarchy and caches
  - GPUs
  - hardware side-channel attacks
tags:
  - computer-architecture
  - introductory
sources:
  - id: catalog
    resource: https://explorecourses.stanford.edu/search?view=xml-20200810&academicYear=20252026&q=CS&filter-departmentcode-CS=on&filter-coursestatus-Active=on
    file: ../references/explorecourses-cs-2025-2026.md
    title: ExploreCourses, 2025-2026
  - id: site
    resource: https://web.stanford.edu/class/cs80e/
    file: ../references/cs-80e-course-site-autumn-2025.md
    title: Course site and syllabus, checked 2026-09-27
status: stable
generated:
  by: claude-code/claude-opus-5[1m]
  at: "2026-09-28T00:20:00Z"
---
# CS 80E: Dissecting The Modern Computer

A survey, and honest about it. The syllabus tells students who have taken EE 108, EE 180 or [CS 149](CS%20149.md) not to enrol, and describes the audience precisely: "students who took CS107 and look back and wish they could try and take CS107E."

## Materials

The syllabus is a real one — units, credit requirements, logistics. Nothing students work from is posted; the site is two pages.

- **Syllabus**: [the syllabus page](https://web.stanford.edu/class/cs80e/syllabus.html), with the week-by-week schedule on the landing page.
- **Assignments**: closed. The schedule names Assignment 0 (Getting to know you), Assignment 1 (Digital Systems) and Assignment 2 (RISC-y Business) with dates, but links no handout.
- **Slides**, **Notes**, **Videos**, **Solutions**, **Code**: not found. **Exams**, **Projects**: none.

## Syllabus

Five units, in the site's own framing:

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

- The site has exactly two pages, `index.html` and `syllabus.html`, and links nothing else beyond one Wikipedia article (checked 2026-09-27).
- An enrolment notice records that the class filled to capacity and advises turning up to the first session anyway.
