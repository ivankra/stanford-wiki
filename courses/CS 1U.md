---
type: Course
code: CS 1U
title: "CS 1U: Practical Unix"
description: A one-unit course on Unix command-line skills - grep and regular expressions, shells, editors, GDB, permissions, revision control - taught by video with weekly labs.
level: undergraduate
term: Winter 2022
terms_offered:
  - Winter 2020
  - Spring 2020
  - Autumn 2020
  - Winter 2021
  - Spring 2021
  - Autumn 2021
  - Winter 2022
instructors:
  - Zelenski, J.
units: "1"
grading: Satisfactory/No Credit
prerequisites: []
homepage: https://practicalunix.org
materials:
  checked: "2026-09-27"
  access: open
  syllabus:
    access: open
    url: https://practicalunix.org
    note: content organized by week, from intro through pipelines, grep, scripting and the web, plus a video schedule
  slides: unknown
  notes:
    access: open
    url: https://practicalunix.org/content/week-3-pipelines
    note: a content page per week, which is the course's written material
  videos:
    access: partial
    url: https://practicalunix.org/video-schedule
    note: the course is delivered by video tutorials and the schedule is published; the recordings themselves were not confirmed open
  assignments:
    access: open
    url: https://practicalunix.org/extra-exercises
    note: extra exercises alongside the weekly lab content
  solutions: unknown
  exams: none
  projects: none
  code: unknown
topics:
  - the Unix command line
  - grep and regular expressions
  - shells and ZSH
  - Vim and Emacs
  - GDB
  - file permissions and the file system
  - revision control
  - shell scripting with Python
tags:
  - unix
  - developer-tools
  - introductory
sources:
  - id: catalog
    resource: https://explorecourses.stanford.edu/search?view=xml-20200810&academicYear=20212022&q=CS&filter-departmentcode-CS=on&filter-coursestatus-Active=on
    file: ../references/explorecourses-cs-2021-2022.md
    title: ExploreCourses, 2021-2022
  - id: site
    resource: https://practicalunix.org
    file: ../references/cs-1u-course-site-winter-2022.md
    title: Course site, checked 2026-09-27
status: stable
generated:
  by: claude-code/claude-opus-5[1m]
  at: "2026-09-28T10:25:00Z"
---
# CS 1U: Practical Unix

One unit of the things every other course assumes you already know. It is built as a public resource first and a Stanford course second: the site keeps the enrolment-specific material on a separate "Stanford Course Logistics" page, leaving the weekly content usable by anyone.

## Materials

The site is open and organized by week, with a separate page for the Stanford-specific logistics.

- **Syllabus**: [the site](https://practicalunix.org) — a page per week, plus a video schedule.
- **Notes**: the [weekly content pages](https://practicalunix.org/content/week-3-pipelines) are the written material: intro, pipelines, grep, scripting, the web.
- **Videos**: the course is delivered through video tutorials and the [schedule](https://practicalunix.org/video-schedule) is public; the recordings themselves were not confirmed open.
- **Assignments**: [extra exercises](https://practicalunix.org/extra-exercises) alongside the weekly lab material.
- **Slides**, **Solutions**, **Code**: not found. **Exams**, **Projects**: none.

## Syllabus

From the [weekly pages](https://practicalunix.org) and the catalog: "grep and regular expressions, ZSH, Vim and Emacs, basic and advanced GDB features, permissions, working with the file system, revision control, Unix utilities, environment customization, and using Python for shell scripts."

The site's own week structure runs intro, pipelines, grep, scripting, a further week, and the web. The format, per the catalog, is "video tutorials and weekly hands-on lab sections".

## Prerequisites

None stated.

## Related

- [CS 45](CS%2045.md) and [CS 104](CS%20104.md): the successor courses covering the same ground at greater length, with version control, containers and the cloud added.
- [CS 107](CS%20107.md): where these tools get used in anger.

## Source notes

- The site is `practicalunix.org`, not a Stanford host. `cs1u.stanford.edu` and `web.stanford.edu/class/cs1u/` both serve a 342-byte meta refresh to it, and the catalog names `cs1u.stanford.edu` as the course website (checked 2026-09-27).
- The site is not term-stamped, so which offering it documents is not stated; the course ran seven times between Winter 2020 and Winter 2022.