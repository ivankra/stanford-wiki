---
type: Course
code: CS 49N
title: "CS 49N: Using Bits to Control Atoms"
description: A first-year seminar wiring a Raspberry Pi to as many sensors as ten weeks allow - LEDs, motion sensors, light controllers, accelerometers.
level: undergraduate
term: Autumn 2021
terms_offered:
  - Spring 2020
  - Summer 2021
  - Autumn 2021
enrollment: 14
instructors:
  - Engler, D.
units: "3"
grading: Letter or Credit/No Credit
prerequisites:
  - Knowledge of the C programming language
homepage: https://github.com/alat-rights/cs49n-21aut-1
access: open
syllabus:
  access: open
  url: https://github.com/alat-rights/cs49n-21aut-1
  note: "the class repository's README, headed \"CS49n (Aut, 21): using bits to control atoms\", with the week-by-week structure, the prerequisites and the case for bare metal; the copy is a student's, not the instructor's account"
slides:
  access: none
  note: the seminar is 4 hours of lab a week with no lecture, so there are no decks
notes:
  access: open
  url: https://github.com/alat-rights/cs49n-21aut-1
  note: the repository's `guides/` and `docs/` directories, which carry the Broadcom and ARM6 manuals the labs work from - the course's stated method is "to work directly with primary-sources"
videos:
  access: unknown
  note: no source mentions recording, and none turned up
assignments:
  access: open
  url: https://github.com/alat-rights/cs49n-21aut-1
  note: "8 labs with their own READMEs - blink, GPIO, cross-check, sonar, IR, interrupts, WS2812B, interleave - plus an extra stepper-motor lab"
solutions: unknown
exams: unknown
projects:
  access: unknown
  note: a student's Autumn 2021 final project is public on GitHub, but the course publishes no showcase
repo:
  access: open
  url: https://github.com/alat-rights/cs49n-21aut-1
  note: "`libpi`, `firmware` and `bin` - the starter library, the pi-install firmware and the toolchain scripts the labs need"
topics:
  - bare-metal Raspberry Pi programming
  - sensors and actuators
  - LEDs and motion sensors
  - accelerometers
  - reading datasheets
past:
  Spring 2020:
    instructors: []
    homepage: https://github.com/dddrrreee/cs49n-20spr
    syllabus:
      access: open
      url: https://github.com/dddrrreee/cs49n-20spr
      note: the instructor's own class repository for that offering, with a README setting out the two 2-hour labs a week, the prerequisites and the primary-sources method
    notes: https://github.com/dddrrreee/cs49n-20spr
    assignments:
      access: open
      url: https://github.com/dddrrreee/cs49n-20spr
      note: "6 labs - blink, GPIO, cross-check, hello, hall effect, sonar - with prelabs beside them, and an `old-labs` directory of earlier ones"
    repo: https://github.com/dddrrreee/cs49n-20spr
  Summer 2021:
    instructors: []
tags:
  - embedded
  - introsem
  - systems
aliases:
  - CS49N
checked: "2026-10-02"
status: stable
generated:
  by: claude-code/claude-opus-5[1m]
  at: "2026-10-02T20:10:00Z"
sources:
  - id: catalog
    resource: https://explorecourses.stanford.edu/search?view=xml-20200810&academicYear=20212022&q=CS&filter-departmentcode-CS=on&filter-coursestatus-Active=on
    file: ../references/explorecourses/CS/2021-2022.xml
    title: ExploreCourses, 2021-2022
  - id: repo21
    resource: https://github.com/alat-rights/cs49n-21aut-1
    title: CS 49N class repository, Autumn 2021, kept by a student, checked 2026-10-02
  - id: repo20
    resource: https://github.com/dddrrreee/cs49n-20spr
    title: CS 49N class repository, Spring 2020, on the instructor's own account, checked 2026-10-02
  - id: catalog-2019-20
    resource: https://explorecourses.stanford.edu/search?view=xml-20200810&academicYear=20192020&q=CS&filter-departmentcode-CS=on&filter-coursestatus-Active=on
    file: ../references/explorecourses/CS/2019-2020.xml
    title: ExploreCourses, 2019-2020
  - id: catalog-2020-21
    resource: https://explorecourses.stanford.edu/search?view=xml-20200810&academicYear=20202021&q=CS&filter-departmentcode-CS=on&filter-coursestatus-Active=on
    file: ../references/explorecourses/CS/2020-2021.xml
    title: ExploreCourses, 2020-2021
---
# CS 49N: Using Bits to Control Atoms

Engler's seminar version of the bare-metal approach he teaches at length in [CS 140E](CS%20140E.md): a credit-card-sized computer and a pile of sensors, with the stated aim of making students able to "fearlessly grab" unfamiliar hardware.

## Materials

There is no course site, and there never was: the class is distributed as a git repository, and those are public. Autumn 2021's holds the README that stands in for a syllabus, 8 labs, the reference manuals and the starter library; Spring 2020's is the same shape on the instructor's own account.

- **Syllabus**: the Autumn 2021 [class repository](https://github.com/alat-rights/cs49n-21aut-1)'s README, headed "CS49n (Aut, 21): using bits to control atoms", sets out the structure (one or two hardware devices a week, written bare metal), the prerequisites and the case for working without an operating system.
- **Slides**: none. The seminar is a four-hour lab block with no lecture.
- **Notes**: the repository's `guides/` and `docs/` directories carry the Broadcom and ARM6 manuals the labs work from — the course's stated method is "to work directly with primary-sources ... since understanding such prose is one of the main super-powers of good systems hackers".
- **Videos**: no source mentions recording, and none turned up.
- **Assignments**: 8 labs, each with its own README — blink, GPIO, cross-check, sonar, IR, interrupts, WS2812B, interleave — plus an extra stepper-motor lab.
- **Solutions**, **Exams**: not found.
- **Projects**: a student's Autumn 2021 final project, a bare-metal Neopixel Pong game driven by two ultrasonic sensors, is public on GitHub, but the course publishes no showcase.
- **Repo**: the same repository holds `libpi`, `firmware` and `bin` — the starter library, the pi-install firmware and the toolchain scripts.
- **Older offerings**: the instructor keeps [Spring 2020](https://github.com/dddrrreee/cs49n-20spr) and a Spring 2019 offering on his own account, each with its README, 6 labs and prelabs, docs and `libpi`.

## Syllabus

No published syllabus. The catalog describes the course: "This is a crash course in how to use a stripped-down computer system about the size of a credit card (the rasberry pi computer) to control as many different sensors as we can implement in ten weeks, including LEDs, motion sensors, light controllers, and accelerometers. The ability to fearlessly grab a set of hardware devices, examine the data sheet to see how to use it, and stitch them  together using simple code is a secret weapon that software-only people lack, and allows you to build many interesting gadgets. We will start with a "bare metal'' system --- no operating system, no support --- and teach you how to read device data sheets describing sensors and write the minimal code needed to"

## Prerequisites

- C: the catalog asks for "knowledge of the C programming language".

## Source notes

- `cs49n.stanford.edu` does not resolve; `web.stanford.edu/class/cs49n/` and the class archive both 404 (checked 2026-10-02).
- **The class is a git repository, not a web site.** The instructor publishes his courses that way — `dddrrreee/cs140e-*` and `cs240lx-*` as well as `cs49n-19spr` and `cs49n-20spr` — so searching GitHub finds what searching for a course site does not.
- **Autumn 2021's copy is a student's, not the instructor's.** `alat-rights/cs49n-21aut-1` was created on 2021-10-01, the first week of that quarter, is not a fork, and its README is in the instructor's voice and headed with the term; its directory layout matches `cs49n-20spr` exactly. The attribution is circumstantial, which is why it is named as a student's copy wherever it is cited. No `cs49n-21aut` repository exists on the instructor's account.
- **Spring 2020 and Summer 2021 name no instructor** in the catalog, both listed as "Section 01 (ISF): TBA", and the syllabus repository records a section with no upload for each. Spring 2020 at least was prepared: `cs49n-20spr` was created in November 2019 and last pushed that same month. Nothing settles whether either ran, so both `instructors` lists are empty.
