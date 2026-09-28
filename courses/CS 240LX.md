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
materials:
  checked: "2026-09-26"
  access: open
  syllabus:
    access: open
    url: https://github.com/dddrrreee/cs240lx-26spr
  slides:
    access: open
    url: https://github.com/dddrrreee/cs240lx-26spr/tree/main/labs/16-eraser-trap/slides
    note: "only 4 of the 19 labs have a deck: IR, GC, I2C, Eraser"
  assignments:
    access: open
    url: https://github.com/dddrrreee/cs240lx-26spr/tree/main/labs
    note: "19 lab write-ups, most with a prelab"
  exams: none
  code:
    access: open
    url: https://github.com/dddrrreee/cs240lx-26spr/tree/main/libpi
    note: libpi and per-lab starter code
  sites:
    - url: https://github.com/dddrrreee/cs240lx-25spr
      term: Spring 2025
      note: a different lab set, three student-written labs, and the final-project handout
topics:
  - runtime code generation and jit tricks
  - boehm-style garbage collection
  - debugging allocators and purify-style memory checking
  - eraser lockset race detection
  - memory tracing with watchpoints and domain protection
  - i2c and imu drivers written from datasheets
  - instruction profiling with arm performance counters
  - custom pcb design
tags:
  - operating-systems
  - embedded-systems
  - systems-lab
  - mscs-breadth-C
  - mscs-sec-b
  - mscs-systems-a
sources:
  - id: catalog
    resource: https://explorecourses.stanford.edu/search?view=xml-20200810&academicYear=20252026&q=CS&filter-departmentcode-CS=on&filter-coursestatus-Active=on
    file: ../references/explorecourses-cs-2025-2026.md
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
status: stable
generated:
  by: claude-code/claude-opus-5[1m]
  at: "2026-09-26T21:50:17Z"
---
# CS 240LX: Advanced Systems Laboratory, Accelerated

[CS 240](CS%20240.md)'s subject matter written instead of read: two labs a week, bare-metal on an ARM Raspberry Pi, "without constantly fighting with a lumbering OS." The middle class of the [CS 140E](CS%20140E.md) → CS 240LX → [CS 340LX](CS%20340LX.md) sequence. Two house rules: no late labs, no LLM use.

## Materials

Everything ships in one public GitHub repo per offering; nothing is gated.

- **Syllabus**: the [repo README](https://github.com/dddrrreee/cs240lx-26spr) — format, rules, and 50-plus candidate labs.
- **Slides**: decks for four labs only: [Eraser](https://github.com/dddrrreee/cs240lx-26spr/tree/main/labs/16-eraser-trap/slides), [IR](https://github.com/dddrrreee/cs240lx-26spr/tree/main/labs/3-ir/slides), [GC](https://github.com/dddrrreee/cs240lx-26spr/tree/main/labs/4-malloc%2Bgc/slides), [I2C](https://github.com/dddrrreee/cs240lx-26spr/tree/main/labs/8-i2c/slides).
- **Assignments**: all 19 [labs](https://github.com/dddrrreee/cs240lx-26spr/tree/main/labs), each a long write-up plus a prelab.
- **Exams**: none; labs and a final project are the grade.
- **Code**: [libpi](https://github.com/dddrrreee/cs240lx-26spr/tree/main/libpi), per-lab starter code, and [docs](https://github.com/dddrrreee/cs240lx-26spr/tree/main/docs) of annotated ARM and BCM2835 manuals.
- The [Spring 2025 repo](https://github.com/dddrrreee/cs240lx-25spr) has a different lab set (mailboxes, ELF linker, GPU, Pico 2) and the final-project handout; the 2020 and 2022–2024 repos are public too.

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
