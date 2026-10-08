---
type: Course
code: CS 340LX
title: "CS 340LX: Advanced Operating System Lab: Accelerated (II)"
description: Bare-metal Raspberry Pi systems labs continuing CS 240LX, on fancier devices, new single-board computers and speed, with about half the labs written by students.
level: graduate
term: Autumn 2026
terms_offered:
  - Autumn 2020
  - Autumn 2022
  - Spring 2025
  - Autumn 2025
  - Autumn 2026
enrollment: 14
instructors:
  - Engler, D.
schedule: TR 17:30-19:20, 320-109
units: "3"
grading: Letter (ABCD/NP)
prerequisites:
  - CS 240LX
  - Instructor permission
homepage: https://github.com/dddrrreee/cs340lx-26aut
access: open
syllabus:
  access: open
  url: https://github.com/dddrrreee/cs340lx-26aut
  note: the repository README is the syllabus, with the lab sequence and how the course is run; there is no other site
slides:
  access: none
  note: a lab course with no lectures to slide; each lab's README carries the explanation
notes:
  access: open
  url: https://github.com/dddrrreee/cs340lx-26aut/tree/main/labs/1-fast-dev-int
  note: every lab directory holds a written walkthrough, and the older offerings' labs ship the device datasheets they need
videos:
  access: unknown
  note: nothing says whether the evening lab sessions are recorded
assignments:
  access: open
  url: https://github.com/dddrrreee/cs340lx-26aut/tree/main/labs/1-fast-dev-int
  note: lab 1 is up 2 weeks into the quarter; Autumn 2025's repository keeps all 14 of its labs, from setup and fast device interrupts through PCB design, HDMI, lidar, a logic analyzer, ELF and DWARF, an OLED display, Bluetooth, DMA, a camera and Doom
solutions:
  access: none
  note: the labs are open-ended hardware bring-up, and no reference implementation is published
exams: none
projects:
  access: open
  url: https://github.com/dddrrreee/cs340lx-25aut-contrib
  note: "a contributions repository per offering: Autumn 2025's holds students' SH1106 and SSD1306 display drivers, and Autumn 2020's has only a README"
repo:
  access: open
  url: https://github.com/dddrrreee/cs340lx-26aut/tree/main/libpi
  note: libpi and per-lab starter code, in the same public repository as everything else
topics:
  - fast device interrupts
  - bare-metal hdmi framebuffer and lidar drivers
  - custom pcb design in kicad
  - memory-ordering bugs across devices
  - logic analyzer and pin-based adc
  - elf and dwarf debug information
  - bluetooth and dma on the pi
  - new single-board computer bring-up
past:
  Autumn 2020:
    instructors:
      - Engler, D.
  Autumn 2022:
    instructors:
      - Engler, D.
  Spring 2025:
    instructors:
      - Engler, D.
  Autumn 2025:
    instructors:
      - Engler, D.
    homepage: https://github.com/dddrrreee/cs340lx-25aut
    syllabus:
      access: open
      url: https://github.com/dddrrreee/cs340lx-25aut
      note: that offering's whole repository, README and all, still public
    assignments:
      access: open
      url: https://github.com/dddrrreee/cs340lx-25aut/tree/main/labs
      note: all 14 labs with their starter code and datasheets, plus a setup lab and a useful-examples directory
    projects:
      access: open
      url: https://github.com/dddrrreee/cs340lx-25aut-contrib
      note: the offering's contributions repository, holding students' SH1106 and SSD1306 display drivers
tags:
  - operating-systems
  - embedded-systems
  - systems-lab
  - mscs-sec-b
  - mscs-systems-c
aliases:
  - CS340LX
checked: "2026-09-30"
status: stable
generated:
  by: claude-code/claude-opus-5[1m]
  at: "2026-10-01T08:40:00Z"
sources:
  - id: catalog
    resource: https://explorecourses.stanford.edu/search?view=xml-20200810&academicYear=20262027&q=CS&filter-departmentcode-CS=on&filter-coursestatus-Active=on
    file: ../references/explorecourses/CS/2026-2027.xml
    title: ExploreCourses, CS 2026-2027
  - id: site
    resource: https://github.com/dddrrreee/cs340lx-26aut
    file: ../references/cs-340lx-course-site-autumn-2026.md
    title: Course repository, Autumn 2026
  - id: site25
    resource: https://github.com/dddrrreee/cs340lx-25aut
    file: ../references/cs-340lx-course-site-autumn-2025.md
    title: Course repository, Autumn 2025
  - id: catalog-2020-21
    resource: https://explorecourses.stanford.edu/search?view=xml-20200810&academicYear=20202021&q=CS&filter-departmentcode-CS=on&filter-coursestatus-Active=on
    file: ../references/explorecourses/CS/2020-2021.xml
    title: ExploreCourses, 2020-2021
  - id: catalog-2022-23
    resource: https://explorecourses.stanford.edu/search?view=xml-20200810&academicYear=20222023&q=CS&filter-departmentcode-CS=on&filter-coursestatus-Active=on
    file: ../references/explorecourses/CS/2022-2023.xml
    title: ExploreCourses, 2022-2023
  - id: catalog-2024-25
    resource: https://explorecourses.stanford.edu/search?view=xml-20200810&academicYear=20242025&q=CS&filter-departmentcode-CS=on&filter-coursestatus-Active=on
    file: ../references/explorecourses/CS/2024-2025.xml
    title: ExploreCourses, 2024-2025
  - id: catalog-2025-26
    resource: https://explorecourses.stanford.edu/search?view=xml-20200810&academicYear=20252026&q=CS&filter-departmentcode-CS=on&filter-coursestatus-Active=on
    file: ../references/explorecourses/CS/2025-2026.xml
    title: ExploreCourses, 2025-2026
---
# CS 340LX: Advanced Operating System Lab: Accelerated (II)

The last class in the [CS 140E](CS%20140E.md) → [CS 240LX](CS%20240LX.md) bare-metal Raspberry Pi pipeline. Two labs a week, each ending in a working example of "a cool trick or deep method"; about half are student-written. It runs only every few years; Autumn 2026 is the fourth offering.

## Materials

Everything the course has lives in a public GitHub repository, one per offering, and nothing is held anywhere else — there is no site, no Canvas material and no reading list.

- **Syllabus**: the [Autumn 2026 repository](https://github.com/dddrrreee/cs340lx-26aut)'s README, with the lab sequence and how the course is run.
- **Slides**: none; a lab course with no lectures to slide.
- **Notes**: each lab directory carries a written walkthrough, and the older labs ship the device datasheets they need.
- **Videos**: nothing says whether the evening lab sessions are recorded.
- **Assignments**: [lab 1](https://github.com/dddrrreee/cs340lx-26aut/tree/main/labs/1-fast-dev-int) is up 2 weeks in. [Autumn 2025's repository](https://github.com/dddrrreee/cs340lx-25aut/tree/main/labs) keeps all 14 of its labs — setup, fast device interrupts, PCB design, HDMI, lidar, device ordering, a logic analyzer, a pin-based ADC, ELF and DWARF, an OLED display, Bluetooth, DMA, a camera and Doom.
- **Solutions**: none; the labs are open-ended hardware bring-up with no reference implementation.
- **Exams**: none.
- **Projects**: each offering has a [contributions repository](https://github.com/dddrrreee/cs340lx-25aut-contrib) for student work; Autumn 2025's holds SH1106 and SSD1306 display drivers, and Autumn 2020's only a README.
- **Repo**: `libpi` and the per-lab starter code, in the same repository as everything else.

## Syllabus

No fixed schedule. Autumn 2026 opens with lab 1, making GPIO interrupts fast (about 3300 cycles down to 98); the README's candidate topics:

- devices: class-D amplifier and speaker, HDMI screen, lidar, camera, long-range LoRa radio
- boards: Pico, Pico 2, Ox64, Pi Zero 2
- DMA tricks, 50× faster interrupts and exceptions, a network boot loader over RF, sound, light or IR
- runtime tools (Eraser-style race detector, volatile checker), a better FAT32, ideally a simple complete OS

Autumn 2025's labs: setup, fast device interrupts, PCB design in KiCad, HDMI framebuffer, lidar, device memory-ordering bugs, a logic analyzer, a digital pin as ADC, ELF/DWARF debugging, OLED displays, Bluetooth, DMA, a camera, and DOOM on the Pi. Micro-projects of one to two weeks combine the preceding labs.

## Prerequisites

Instructor permission. The course assumes [CS 140E](CS%20140E.md) and [CS 240LX](CS%20240LX.md): "you have already suffered through 30+ labs."

## Related

- [CS 240](CS%20240.md): the paper-reading OS course, not a lab.
- [CS 240LX](CS%20240LX.md): the prerequisite lab course; this one is more specialized and partly student-built.

## Source notes

- `cs340lx.stanford.edu` doesn't resolve and `web.stanford.edu/class/cs340lx/` and `/class/cs340/` return 404 (checked 2026-09-30). The GitHub repo is the only site, so it's `homepage`.
- Autumn 2025 comes from the repo name `cs340lx-25aut` (created 2025-09-23; its README says "3rd offering"). Earlier offerings are unnamed; `cs340lx-24aut`, `-25spr`, `-26spr`, `-22aut` and `-20aut` all 404, though a `cs340lx-20aut-contrib` repository survives with only a README. The instructor's account also holds the [CS 140E](CS%20140E.md) and [CS 240LX](CS%20240LX.md) repositories, one per offering, under the same naming scheme (checked 2026-09-30).
- The catalog promises research papers for context; neither repo lists any.
- The README says "it's Max and me now"; the catalog lists only Engler as PI.
- The labs section (TR 19:30-21:20, same room) follows each lecture.
- The README labels the term "aut'26".
