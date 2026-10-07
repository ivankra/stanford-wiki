---
type: Course
code: CS 240LX
title: "CS 240LX: Advanced Systems Laboratory, Accelerated"
description: CS 240's operating-systems topics written as bare-metal Raspberry Pi code rather than discussed as papers, in two labs a week.
level: graduate
term: Spring 2026
terms_offered:
  - Spring 2020
  - Spring 2022
  - Spring 2023
  - Spring 2024
  - Spring 2025
  - Spring 2026
instructors:
  - Engler, D.
units: "3"
grading: Letter or Credit/No Credit
prerequisites:
  - CS 140E or instructor permission
homepage: https://github.com/dddrrreee/cs240lx-26spr
access: open
syllabus:
  access: open
  url: https://github.com/dddrrreee/cs240lx-26spr
  note: the repository README is the syllabus, with the format, the no-late-labs and no-LLM rules and 50-plus candidate labs; there is no dated schedule
slides:
  access: open
  url: https://github.com/dddrrreee/cs240lx-26spr/tree/main/labs/16-eraser-trap/slides
  note: "only 4 of the 19 labs have a deck: IR, GC, I2C and Eraser. The lab write-ups carry the rest of the exposition"
notes:
  access: open
  url: https://github.com/dddrrreee/cs240lx-26spr/tree/main/docs
  note: "15 reference documents, among them the staff's annotated copies of the ARMv6 architecture manual, its interrupt chapter and the BCM2835 peripherals manual, plus the AAPCS, an inline-assembler cookbook and the autograder notes"
videos:
  access: unknown
  note: no recording turned up, in the repositories or elsewhere; the class and its 3-hour lab section are in person
assignments:
  access: open
  url: https://github.com/dddrrreee/cs240lx-26spr/tree/main/labs
  note: all 19 lab write-ups, each long and most with a prelab; labs/README.md describes 0-16 and leaves 17-dma and 18-i2s-microphone undescribed
solutions:
  access: none
  note: the labs are built and checked against the repository's autograder rather than against a published answer
exams:
  access: none
  note: the grade is the labs and a final project of about 3 labs' work
projects:
  access: unknown
  note: no student final-project write-up is published; the Spring 2025 repository's final-projects directory is a handout of ideas, not reports
repo:
  access: open
  url: https://github.com/dddrrreee/cs240lx-26spr/tree/main/libpi
  note: libpi and per-lab starter code, in the same repository as everything else
topics:
  - runtime code generation and jit tricks
  - boehm-style garbage collection
  - debugging allocators and purify-style memory checking
  - eraser lockset race detection
  - memory tracing with watchpoints and domain protection
  - i2c and imu drivers written from datasheets
  - instruction profiling with arm performance counters
  - custom pcb design
past:
  Spring 2020:
    instructors:
      - Engler, D.
    homepage: https://github.com/dddrrreee/cs240lx-20spr
    syllabus:
      access: open
      url: https://github.com/dddrrreee/cs240lx-20spr
      note: that offering's own public repository, whose README is its syllabus; a copy is also uploaded to Canvas, Stanford-only (syllabus repository)
    assignments:
      access: open
      url: https://github.com/dddrrreee/cs240lx-20spr/tree/master/labs
      note: that offering's lab write-ups, with its own starter code and reference documents
  Spring 2022:
    instructors:
      - Engler, D.
    homepage: https://github.com/dddrrreee/cs240lx-22spr
    syllabus:
      access: open
      url: https://github.com/dddrrreee/cs240lx-22spr
      note: that offering's own public repository, whose README is its syllabus
    assignments:
      access: open
      url: https://github.com/dddrrreee/cs240lx-22spr/tree/main/labs
      note: that offering's lab write-ups, with its own starter code and reference documents
  Spring 2023:
    instructors:
      - Engler, D.
    homepage: https://github.com/dddrrreee/cs240lx-23spr
    syllabus:
      access: open
      url: https://github.com/dddrrreee/cs240lx-23spr
      note: that offering's own public repository, whose README is its syllabus
    assignments:
      access: open
      url: https://github.com/dddrrreee/cs240lx-23spr/tree/main/labs
      note: that offering's lab write-ups, with its own starter code and reference documents
  Spring 2024:
    instructors:
      - Engler, D.
    homepage: https://github.com/dddrrreee/cs240lx-24spr
    syllabus:
      access: open
      url: https://github.com/dddrrreee/cs240lx-24spr
      note: that offering's own public repository, whose README is its syllabus
    assignments:
      access: open
      url: https://github.com/dddrrreee/cs240lx-24spr/tree/main/labs
      note: that offering's lab write-ups, with its own starter code and reference documents
  Spring 2025:
    instructors:
      - Engler, D.
    homepage: https://github.com/dddrrreee/cs240lx-25spr
    syllabus:
      access: open
      url: https://github.com/dddrrreee/cs240lx-25spr
      note: that offering's own public repository, whose README is its syllabus
    assignments:
      access: open
      url: https://github.com/dddrrreee/cs240lx-25spr/tree/main/labs
      note: a different lab set from this offering's (mailboxes, an ELF linker, the GPU, the Pico 2), 3 of them student-written, plus the final-project handout
tags:
  - operating-systems
  - embedded-systems
  - systems-lab
  - mscs-breadth-C
  - mscs-sec-b
  - mscs-systems-a
aliases:
  - CS240LX
checked: "2026-10-01"
status: stable
generated:
  by: claude-code/claude-opus-5[1m]
  at: "2026-10-01T22:40:00Z"
sources:
  - id: catalog
    resource: https://explorecourses.stanford.edu/search?view=xml-20200810&academicYear=20252026&q=CS&filter-departmentcode-CS=on&filter-coursestatus-Active=on
    file: ../references/explorecourses/CS/2025-2026.xml
    title: ExploreCourses, 2025-2026
  - id: site
    resource: https://github.com/dddrrreee/cs240lx-26spr
    file: ../references/cs-240lx-course-site-spring-2026.md
    title: Course repository, Spring 2026
  - id: site25
    resource: https://github.com/dddrrreee/cs240lx-25spr
    file: ../references/cs-240lx-course-site-spring-2025.md
    title: Course repository, Spring 2025
  - id: repos
    resource: https://github.com/dddrrreee?tab=repositories
    file: ../references/cs-240lx-past-offerings-spring-2026.md
    title: Per-offering repositories, checked 2026-09-26
  - id: syllabus-spring-2020
    resource: https://raw.githubusercontent.com/dddrrreee/cs240lx-20spr/master/README.md
    file: ../references/cs-240lx-syllabus-spring-2020.md
    title: CS 240LX repository README, Spring 2020
  - id: syllabus-spring-2022
    resource: https://raw.githubusercontent.com/dddrrreee/cs240lx-22spr/main/README.md
    file: ../references/cs-240lx-syllabus-spring-2022.md
    title: CS 240LX repository README, Spring 2022
  - id: syllabus-spring-2023
    resource: https://raw.githubusercontent.com/dddrrreee/cs240lx-23spr/main/README.md
    file: ../references/cs-240lx-syllabus-spring-2023.md
    title: CS 240LX repository README, Spring 2023
  - id: syllabus-spring-2024
    resource: https://raw.githubusercontent.com/dddrrreee/cs240lx-24spr/main/README.md
    file: ../references/cs-240lx-syllabus-spring-2024.md
    title: CS 240LX repository README, Spring 2024
  - id: syllabus-spring-2025
    resource: https://raw.githubusercontent.com/dddrrreee/cs240lx-25spr/main/README.md
    file: ../references/cs-240lx-syllabus-spring-2025.md
    title: CS 240LX repository README, Spring 2025
  - id: catalog-2019-20
    resource: https://explorecourses.stanford.edu/search?view=xml-20200810&academicYear=20192020&q=CS&filter-departmentcode-CS=on&filter-coursestatus-Active=on
    file: ../references/explorecourses/CS/2019-2020.xml
    title: ExploreCourses, 2019-2020
  - id: catalog-2021-22
    resource: https://explorecourses.stanford.edu/search?view=xml-20200810&academicYear=20212022&q=CS&filter-departmentcode-CS=on&filter-coursestatus-Active=on
    file: ../references/explorecourses/CS/2021-2022.xml
    title: ExploreCourses, 2021-2022
  - id: catalog-2022-23
    resource: https://explorecourses.stanford.edu/search?view=xml-20200810&academicYear=20222023&q=CS&filter-departmentcode-CS=on&filter-coursestatus-Active=on
    file: ../references/explorecourses/CS/2022-2023.xml
    title: ExploreCourses, 2022-2023
  - id: catalog-2023-24
    resource: https://explorecourses.stanford.edu/search?view=xml-20200810&academicYear=20232024&q=CS&filter-departmentcode-CS=on&filter-coursestatus-Active=on
    file: ../references/explorecourses/CS/2023-2024.xml
    title: ExploreCourses, 2023-2024
  - id: catalog-2024-25
    resource: https://explorecourses.stanford.edu/search?view=xml-20200810&academicYear=20242025&q=CS&filter-departmentcode-CS=on&filter-coursestatus-Active=on
    file: ../references/explorecourses/CS/2024-2025.xml
    title: ExploreCourses, 2024-2025
  - id: syllabus-repo-2019-20
    resource: https://syllabus.stanford.edu/syllabus/searchCourses/W20/CS/
    file: ../references/syllabus-repository-cs-2019-2020.md
    title: Stanford Syllabus repository, CS, 2019-2020
---
# CS 240LX: Advanced Systems Laboratory, Accelerated

[CS 240](CS%20240.md)'s subject matter written instead of read: two labs a week, bare-metal on an ARM Raspberry Pi, "without constantly fighting with a lumbering OS." The middle class of the [CS 140E](CS%20140E.md) → CS 240LX → [CS 340LX](CS%20340LX.md) sequence. Two house rules: no late labs, no LLM use.

## Materials

A reader gets the course entire: every offering is one public GitHub repository holding the syllabus, all 19 lab write-ups, the starter code and the annotated hardware manuals the labs read from. Nothing is gated anywhere, and the only thing not published is the lectures, which are not recorded.

- **Syllabus**: the [repository README](https://github.com/dddrrreee/cs240lx-26spr) carries the format, the 2 house rules (no late labs, no LLM use) and 50-plus candidate labs. There is no dated schedule in any offering. Each earlier offering keeps its own repository, [Spring 2020's](https://github.com/dddrrreee/cs240lx-20spr) through [Spring 2025's](https://github.com/dddrrreee/cs240lx-25spr).
- **Slides**: 4 of the 19 labs have a deck, [Eraser](https://github.com/dddrrreee/cs240lx-26spr/tree/main/labs/16-eraser-trap/slides), [IR](https://github.com/dddrrreee/cs240lx-26spr/tree/main/labs/3-ir/slides), [GC](https://github.com/dddrrreee/cs240lx-26spr/tree/main/labs/4-malloc%2Bgc/slides) and [I2C](https://github.com/dddrrreee/cs240lx-26spr/tree/main/labs/8-i2c/slides); the write-ups carry the rest of the exposition.
- **Notes**: [docs/](https://github.com/dddrrreee/cs240lx-26spr/tree/main/docs) holds 15 reference documents, including the staff's annotated ARMv6 architecture manual and interrupt chapter, the annotated BCM2835 peripherals manual, the AAPCS and an inline-assembler cookbook.
- **Videos**: none found. The class and its 3-hour lab section are in person.
- **Assignments**: all 19 [labs](https://github.com/dddrrreee/cs240lx-26spr/tree/main/labs), each a long write-up with a prelab. Spring 2025's set is different: mailboxes, an ELF linker, the GPU, the Pico 2, 3 of its labs student-written.
- **Solutions**: none; labs are checked against the repository's autograder rather than an answer key.
- **Exams**: none; the grade is the labs and a final project of about 3 labs' work.
- **Projects**: no student write-up is published. Spring 2025's `final-projects` directory is a handout of ideas, not reports.
- **Repo**: [libpi](https://github.com/dddrrreee/cs240lx-26spr/tree/main/libpi) and the per-lab starter code, in the same repository.

## Syllabus

No dated schedule; the [lab list](https://github.com/dddrrreee/cs240lx-26spr/tree/main/labs) is the syllabus, alternating hard topics with device labs and returning to a topic weeks later "so that it can sink in more".

- code generation: machine code emitted at runtime; encodings reverse-engineered out of the assembler
- memory: a Boehm-style garbage collector, then the debugging allocator the checking tools build on
- devices: IR remote, an MPU-6050 driver from the datasheet and the I2C driver under it, WS2812B lights, a stepper motor, an OLED display, DMA, an I2S microphone
- measurement: an exact instruction profiler from single-step debug hardware, then the ARM performance counters
- dynamic tools: trapping every load and store with domain protection, a Purify-style memory checker on top, Eraser lockset race detection
- a week of custom PCB design, and a final project about three labs' worth of work

## Prerequisites

- Bare-metal systems programming: [CS 140E](CS%20140E.md), assumed for threads, interrupts, virtual memory and file systems. Encouraged, not enforced — "a sufficiently talented and motivated implementor can make up for its lack", and two or three a year do.
- Otherwise instructor permission.

## Related

- [CS 240](CS%20240.md): the same ground through research papers; this course can substitute for it.
- [CS 340LX](CS%20340LX.md): the follow-on, on fancier devices, new boards and speed, about half its labs student-written; this course teaches the core toolkit.

## Source notes

- `cs240lx.stanford.edu` doesn't resolve and `web.stanford.edu/class/cs240lx/` is 404 (checked 2026-09-26), so the GitHub repo is `homepage`.
- `terms_offered` comes from the per-offering repository names and creation dates; there is no catalog history and no `cs240lx-21spr` repo. Spring 2020 is the first term after `cutoff_term`.
- The Spring 2026 repo is anchored to that term: it says "Spr'26", sets `CS240LX_2026_PATH`, and was last pushed 2026-06-02.
- The catalog says "ten projects, one per week, where each project covers two labs"; the repo numbers 19 labs, so a project is a lab pair. `labs/README.md` describes labs 0–16 only; 17-dma and 18-i2s-microphone exist but are undescribed.
- The catalog lists Cura and Sriram as TAs and Engler as PI; only Engler is recorded here. The README names Joseph Shetaye as head TA.
- No lecture recordings were found, in the repo or elsewhere; the class is in person. Student final-project write-ups are not published — the Spring 2025 `final-projects` directory is a handout of ideas, not reports.
- The labs section (TR 19:30-22:20, same room) follows each lecture.
