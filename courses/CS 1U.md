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
enrollment_1y: 45
instructors: []
units: "1"
grading: Satisfactory/No Credit
prerequisites: []
homepage: https://practicalunix.org
access: open
syllabus:
  access: open
  url: https://practicalunix.org
  note: a page per week, from intro and shell through pipelines, grep, scripting and the web, plus the video schedule and a Stanford Course Logistics page carrying the format and grading rules
slides:
  access: none
  note: "the course has no decks: \"The lectures will be entirely on video in short chunks\""
notes:
  access: open
  url: https://practicalunix.org/content/week-3-pipelines
  note: a Video Notes section on each week page summarizing that week's commands, which is the course's written material
videos:
  access: open
  url: https://www.youtube.com/playlist?list=PLAn5BRyzQEf9VoK8gRKp8Z0LGME6fISaE
  note: "35 videos on the instructor's own channel, titled \"Practical Unix\", one per command group; the video schedule links each of them individually"
assignments:
  access: open
  url: https://practicalunix.org/content/week-3-pipelines
  note: a lab on every week page plus the extra exercises; the pipelines and grep labs link tarballs on a student web space that now answers 403
solutions:
  access: none
  note: by the site's own statement, "these lab exercises won't tell you how to do everything"; the weekly Canvas quizzes are graded on completion, not correctness
exams: none
projects: none
repo:
  access: none
  note: the weekly work is shell exercises submitted as Canvas quiz answers, so the course ships no code
sites:
  - url: https://practicalunix.org/stanford-course-logistics
    note: the Stanford-specific half, public all the same - course format, lab structure, due dates and late days
  - url: https://practicalunix.org/extra-exercises
    note: optional extra labs, a LAMP stack tutorial among them
topics:
  - the Unix command line
  - grep and regular expressions
  - shells and ZSH
  - Vim and Emacs
  - GDB
  - file permissions and the file system
  - revision control
  - shell scripting with Python
past:
  Winter 2020:
    instructors:
      - Zelenski, J.
  Spring 2020:
    instructors:
      - Zelenski, J.
  Autumn 2020:
    instructors:
      - Zelenski, J.
    syllabus:
      access: closed
      note: uploaded to Canvas, Stanford-only (syllabus repository)
  Winter 2021:
    instructors:
      - Zelenski, J.
    syllabus:
      access: closed
      note: uploaded to Canvas, Stanford-only (syllabus repository)
  Spring 2021:
    instructors:
      - Zelenski, J.
    syllabus:
      access: closed
      note: uploaded to Canvas, Stanford-only (syllabus repository)
  Autumn 2021:
    instructors: []
tags:
  - unix
  - developer-tools
  - introductory
aliases:
  - CS1U
checked: "2026-10-02"
status: stable
generated:
  by: claude-code/claude-opus-5[1m]
  at: "2026-10-02T10:20:00Z"
sources:
  - id: catalog
    resource: https://explorecourses.stanford.edu/search?view=xml-20200810&academicYear=20212022&q=CS&filter-departmentcode-CS=on&filter-coursestatus-Active=on
    file: ../references/explorecourses/CS/2021-2022.xml
    title: ExploreCourses, 2021-2022
  - id: site
    resource: https://practicalunix.org
    file: ../references/cs-1u-course-site-winter-2022.md
    title: Course site, checked 2026-10-02
  - id: videos
    resource: https://www.youtube.com/playlist?list=PLAn5BRyzQEf9VoK8gRKp8Z0LGME6fISaE
    title: Practical Unix YouTube playlist, Sam King's channel, 35 videos, checked 2026-10-02
  - id: catalog-2019-20
    resource: https://explorecourses.stanford.edu/search?view=xml-20200810&academicYear=20192020&q=CS&filter-departmentcode-CS=on&filter-coursestatus-Active=on
    file: ../references/explorecourses/CS/2019-2020.xml
    title: ExploreCourses, 2019-2020
  - id: catalog-2020-21
    resource: https://explorecourses.stanford.edu/search?view=xml-20200810&academicYear=20202021&q=CS&filter-departmentcode-CS=on&filter-coursestatus-Active=on
    file: ../references/explorecourses/CS/2020-2021.xml
    title: ExploreCourses, 2020-2021
  - id: syllabus-repo-2020-21
    resource: https://syllabus.stanford.edu/syllabus/searchCourses/F20/CS/
    file: ../references/syllabus-repository-cs-2020-2021.md
    title: Stanford Syllabus repository, CS, 2020-2021
---
# CS 1U: Practical Unix

One unit of the things every other course assumes you already know. It is built as a public resource first and a Stanford course second: the site keeps the enrolment-specific material on a separate "Stanford Course Logistics" page, leaving the weekly content usable by anyone.

## Materials

The whole course is a public website. Videos, weekly labs and written notes are all on `practicalunix.org`, under a Creative Commons license, and even the Stanford logistics page is open; only the Canvas quiz submissions are enrolled-students-only. The one thing that has rotted is a pair of lab tarballs on a student's web space.

- **Syllabus**: [the site](https://practicalunix.org) is organized as a page per week — intro and shell, pipelines, grep, scripting and permissions, a setup week with no videos, the web — and the [Stanford Course Logistics](https://practicalunix.org/stanford-course-logistics) page carries the format, the six-week span (weeks 2 to 7), the due dates and five late days.
- **Slides**: none. "The lectures will be entirely on video in short chunks so that, for instance, people who already know everything about grep don't have to watch the grep videos."
- **Notes**: every week page opens with a Video Notes section summarizing that week's commands, with worked examples.
- **Videos**: a public [playlist of 35 videos](https://www.youtube.com/playlist?list=PLAn5BRyzQEf9VoK8gRKp8Z0LGME6fISaE) on Sam King's channel, one per command group, each linked individually from the [video schedule](https://practicalunix.org/video-schedule). This is the whole lecture content.
- **Assignments**: a lab on each week page, plus [extra exercises](https://practicalunix.org/extra-exercises) including a LAMP-stack tutorial. The pipelines and grep labs link tarballs at `stanford.edu/~jainr/`, which answers 403 on every Stanford hostname, so those two weeks' starter files are gone.
- **Solutions**: none, deliberately — "these lab exercises won't tell you how to do everything", and the weekly Canvas quiz is graded on completion rather than correctness.
- **Exams**, **Projects**: none. The course is one unit of weekly labs.
- **Repo**: none. The work is shell exercises written into a Canvas quiz, so there is no code to publish.

## Syllabus

From the [weekly pages](https://practicalunix.org) and the catalog: "grep and regular expressions, ZSH, Vim and Emacs, basic and advanced GDB features, permissions, working with the file system, revision control, Unix utilities, environment customization, and using Python for shell scripts."

The site's own week structure runs intro, pipelines, grep, scripting, a further week, and the web. The format, per the catalog, is "video tutorials and weekly hands-on lab sections".

## Prerequisites

None stated.

## Related

- [CS 45](CS%2045.md) and [CS 104](CS%20104.md): the successor courses covering the same ground at greater length, with version control, containers and the cloud added.
- [CS 107](CS%20107.md): where these tools get used in anger.

## Source notes

- The site is `practicalunix.org`, not a Stanford host. `cs1u.stanford.edu` and `web.stanford.edu/class/cs1u/` both serve a 342-byte meta refresh to it, and the catalog names `cs1u.stanford.edu` as the course website. The class archive has no CS 1U offering at all: every id from Winter 2020 to Winter 2022 returns 404.
- **The site is one standing version, not one per offering.** Nothing on it carries a term, its pages are stamped with Drupal submission dates from 2013 and 2014, and the course ran seven times between Winter 2020 and Winter 2022, so the material is rated as the current offering's and no `past` record repeats it.
- **The catalog stops naming anyone from Autumn 2021.** Jerry Zelenski is the listed instructor through Spring 2021; the Autumn 2021 and Winter 2022 sections are "Section 01 (LAB): TBA" with no instructor at all, so both lists are empty here. Autumn 2021 did run: the syllabus repository lists a CS 1U section for it, with no syllabus uploaded.
- **Dead downloads (checked 2026-10-02):** `stanford.edu/~jainr/pipelines.tar` and `grep-exercises.tar.gz` answer 403, and `web.stanford.edu/~jainr/` 404s — a departed student's web space.
- Winter 2022 is the last offering; CS 1U is absent from the catalog from 2022-2023 on. [CS 45](CS%2045.md) and [CS 104](CS%20104.md) cover the same ground now.
- The content is licensed CC BY-SA 4.0 and the home page gives a contact for readers who are "NOT a Stanford student", so the site is maintained as a public resource rather than a course handout.
