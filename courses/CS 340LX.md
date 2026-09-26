---
type: Course
code: CS 340LX
title: "CS 340LX: Advanced Operating System Lab: Accelerated (II)"
description: Bare-metal Raspberry Pi systems labs continuing CS 240LX, on fancier devices, new single-board computers and speed, with about half the labs written by students.
level: graduate
term: Autumn 2026
terms_offered:
  - Autumn 2025
  - Autumn 2026
instructors:
  - Engler, D.
schedule: TR 17:30-19:20, 320-109
units: "3"
grading: Letter (ABCD/NP)
prerequisites:
  - CS 240LX
  - Instructor permission
homepage: https://github.com/dddrrreee/cs340lx-26aut
materials:
  checked: "2026-09-26"
  access: open
  syllabus:
    access: open
    url: https://github.com/dddrrreee/cs340lx-26aut
  assignments:
    access: open
    url: https://github.com/dddrrreee/cs340lx-26aut/tree/main/labs/1-fast-dev-int
    note: lab 1 so far; Autumn 2025's 14 labs are in its repo
  exams: none
  code:
    access: open
    url: https://github.com/dddrrreee/cs340lx-26aut/tree/main/libpi
    note: libpi and per-lab starter code
  sites:
    - url: https://github.com/dddrrreee/cs340lx-25aut
      term: Autumn 2025
topics:
  - fast device interrupts
  - bare-metal hdmi framebuffer and lidar drivers
  - custom pcb design in kicad
  - memory-ordering bugs across devices
  - logic analyzer and pin-based adc
  - elf and dwarf debug information
  - bluetooth and dma on the pi
  - new single-board computer bring-up
tags:
  - operating-systems
  - embedded-systems
  - systems-lab
sources:
  - id: catalog
    resource: https://explorecourses.stanford.edu/search?view=xml-20200810&academicYear=20262027&q=CS&filter-departmentcode-CS=on&filter-coursestatus-Active=on&filter-term-Autumn=on
    file: ../references/explorecourses-cs-grad-autumn-2026.md
    title: ExploreCourses, Autumn 2026
  - id: site
    resource: https://github.com/dddrrreee/cs340lx-26aut
    file: ../references/cs-340lx-course-site-autumn-2026.md
    title: Course repository, Autumn 2026
  - id: site25
    resource: https://github.com/dddrrreee/cs340lx-25aut
    file: ../references/cs-340lx-course-site-autumn-2025.md
    title: Course repository, Autumn 2025
status: stable
generated:
  by: claude-code/claude-opus-5-5
  at: "2026-09-26T09:52:37Z"
---
# CS 340LX: Advanced Operating System Lab: Accelerated (II)

The last class in the CS 140E → CS 240LX bare-metal Raspberry Pi pipeline. Two labs a week, each ending in a working example of "a cool trick or deep method"; about half are student-written. It runs only every few years; Autumn 2026 is the fourth offering.

## Materials

Everything lives in a public GitHub repo per offering. The [Autumn 2026 repo](https://github.com/dddrrreee/cs340lx-26aut) has the README (syllabus), the `libpi` code base and [lab 1](https://github.com/dddrrreee/cs340lx-26aut/tree/main/labs/1-fast-dev-int) so far. The [Autumn 2025 repo](https://github.com/dddrrreee/cs340lx-25aut) has all 14 of that offering's [labs](https://github.com/dddrrreee/cs340lx-25aut/tree/main/labs), with starter code and datasheets. No slides, videos or reading list were found.

## Syllabus

No fixed schedule. Autumn 2026 opens with lab 1, making GPIO interrupts fast (about 3300 cycles down to 98); the README's candidate topics:

- devices: class-D amplifier and speaker, HDMI screen, lidar, camera, long-range LoRa radio
- boards: Pico, Pico 2, Ox64, Pi Zero 2
- DMA tricks, 50× faster interrupts and exceptions, a network boot loader over RF, sound, light or IR
- runtime tools (Eraser-style race detector, volatile checker), a better FAT32, ideally a simple complete OS

Autumn 2025's labs: setup, fast device interrupts, PCB design in KiCad, HDMI framebuffer, lidar, device memory-ordering bugs, a logic analyzer, a digital pin as ADC, ELF/DWARF debugging, OLED displays, Bluetooth, DMA, a camera, and DOOM on the Pi. Micro-projects of one to two weeks combine the preceding labs.

## Prerequisites

Instructor permission. The course assumes CS 140E and CS 240LX: "you have already suffered through 30+ labs."

## Related

- [CS 240LX](CS%20240LX.md): the prerequisite lab course; this one is more specialized and partly student-built.
- [CS 240](CS%20240.md): the paper-reading OS course, not a lab.

## Source notes

- `cs340lx.stanford.edu` doesn't resolve and `web.stanford.edu/class/cs340lx/` and `/class/cs340/` return 404 (checked 2026-09-26). The GitHub repo is the only site, so it's `homepage`.
- Autumn 2025 comes from the repo name `cs340lx-25aut` (created 2025-09-23; its README says "3rd offering"). Earlier offerings are unnamed; `cs340lx-24aut`, `-25spr`, `-26spr` and similar return 404.
- The catalog promises research papers for context; neither repo lists any.
- The README says "it's Max and me now"; the catalog lists only Engler as PI.
- The labs section (TR 19:30-21:20, same room) follows each lecture.
- The README labels the term "aut'26".
