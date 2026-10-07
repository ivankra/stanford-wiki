---
type: Course
code: CS 106EA
title: "CS 106EA: Exploring Artificial Intelligence"
description: A conceptual tour of modern AI - neural networks, specialized architectures and LLMs - for students who will run models rather than write them.
level: undergraduate
term: Autumn 2026
terms_offered:
  - Winter 2025
  - Winter 2026
  - Spring 2026
  - Summer 2026
  - Autumn 2026
instructors:
  - Young, P.
schedule: MW 15:00-16:20, CoDa B90
units: "3"
grading: Letter or Credit/No Credit
prerequisites:
  - CS 106A or basic programming experience
access: mostly-closed
syllabus:
  access: closed
  note: uploaded to Canvas, Stanford-only (syllabus repository); the course has no site of its own, and the one public syllabus is Winter 2026's
slides:
  access: closed
  note: course material is distributed through Canvas
notes:
  access: unknown
  note: no reader or notes were found for any offering
videos:
  access: unknown
  note: nothing says whether the lectures are recorded
assignments:
  access: closed
  note: a weekly homework out Thursday and due Wednesday, handed out on Canvas and submitted through Gradescope
solutions:
  access: unknown
exams:
  access: closed
  note: a midterm and a final, 25% each; no paper or practice paper is published
projects: none
repo:
  access: partial
  url: https://github.com/cs106ea-stanford
  note: the course organization publishes the Colab helper scripts per homework, hw1 to hw8, dated Winter 2025; the notebooks that drive them are not public
topics:
  - machine-learning pipeline
  - neural networks and training failures
  - limits of neural-network systems
  - convolutional architectures for images
  - natural-language architectures
  - transformer architecture
  - large language models
  - social and ethical impacts of AI
past:
  Winter 2025:
    instructors:
      - Young, P.
    syllabus:
      access: closed
      note: uploaded to Canvas, Stanford-only (syllabus repository)
    assignments:
      access: partial
      url: https://github.com/cs106ea-stanford
      note: the course organization publishes a repo per homework, hw1 to hw8, but each holds only the Colab helper scripts and figures; the handouts themselves go out through Canvas and Gradescope
  Winter 2026:
    instructors:
      - Young, P.
    syllabus:
      access: open
      url: https://summer.stanford.edu/files/summer/media/file/cs_106ea_syllabus_summer_2026.pdf
      note: the Winter 2026 syllabus handout, with goals, grading, policies and the lecture-by-lecture topic list
    slides:
      access: closed
      note: course material is distributed through Canvas; the course has no public site
    videos:
      access: unknown
    exams:
      access: closed
      note: a midterm and a final, each 25%; no papers published
    projects: none
    repo:
      access: partial
      url: https://github.com/cs106ea-stanford
      note: the helper Python the Colab notebooks import - `basic_nlp_with_imdb_helper.py`, `word_math_helper.py`, `alpaca_exploration_helper.py` and the rest - is public per homework; the notebooks themselves are not
  Spring 2026:
    instructors:
      - Young, P.
    syllabus:
      access: closed
      note: uploaded to Canvas, Stanford-only (syllabus repository)
  Summer 2026:
    instructors:
      - Young, P.
    syllabus:
      access: closed
      note: uploaded to Canvas, Stanford-only (syllabus repository)
tags:
  - artificial-intelligence
  - ai-literacy
  - introductory-computing
aliases:
  - CS106EA
checked: "2026-09-30"
status: stable
generated:
  by: claude-code/claude-opus-5[1m]
  at: "2026-10-01T07:15:00Z"
sources:
  - id: catalog
    resource: https://explorecourses.stanford.edu/search?view=xml-20200810&academicYear=20262027&q=CS&filter-departmentcode-CS=on&filter-coursestatus-Active=on
    file: ../references/explorecourses/CS/2026-2027.xml
    title: ExploreCourses, CS 2026-2027
  - id: history
    resource: https://explorecourses.stanford.edu/search?view=xml-20200810&academicYear=20252026&q=CS&filter-departmentcode-CS=on&filter-coursestatus-Active=on
    file: ../references/explorecourses/CS/2025-2026.xml
    title: ExploreCourses, 2025-2026
  - id: syllabus
    resource: https://summer.stanford.edu/files/summer/media/file/cs_106ea_syllabus_summer_2026.pdf
    file: ../references/cs-106ea-syllabus-winter-2026.md
    title: CS 106EA syllabus, Winter 2026, checked 2026-09-27
  - id: catalog-2024-25
    resource: https://explorecourses.stanford.edu/search?view=xml-20200810&academicYear=20242025&q=CS&filter-departmentcode-CS=on&filter-coursestatus-Active=on
    file: ../references/explorecourses/CS/2024-2025.xml
    title: ExploreCourses, 2024-2025
  - id: syllabus-repo-2024-25
    resource: https://syllabus.stanford.edu/syllabus/searchCourses/F24/CS/
    file: ../references/syllabus-repository-cs-2024-2025.md
    title: Stanford Syllabus repository, CS, 2024-2025
  - id: syllabus-repo-2025-26
    resource: https://syllabus.stanford.edu/syllabus/searchCourses/F25/CS/
    file: ../references/syllabus-repository-cs-2025-2026.md
    title: Stanford Syllabus repository, CS, 2025-2026
---
# CS 106EA: Exploring Artificial Intelligence

An AI course built on a clear division of labour: "You will be running AI programs in our class but not writing them." Eighteen lectures take a non-specialist from the machine-learning pipeline to transformers and LLMs, with hands-on work in Colab, and a syllabus that names being able to read *IEEE Spectrum* as a goal.

## Materials

One offering's syllabus handout is public, unusually detailed and with a lecture-count breakdown, and the course keeps a GitHub organization the syllabus never mentions. Everything else — decks, homework handouts, exams — is on Canvas and Gradescope, for this offering and all 4 before it.

- **Syllabus**: this offering's is a Canvas upload readable inside Stanford alone. [Winter 2026's handout](https://summer.stanford.edu/files/summer/media/file/cs_106ea_syllabus_summer_2026.pdf) stands in, with the goals, prerequisites, grading, late policy and the lecture-by-lecture topic breakdown below.
- **Slides**, **Notes**: no decks or notes are published by any offering, and the course has no site.
- **Videos**: nothing says whether the lectures are recorded.
- **Assignments**: a weekly homework, out Thursday and due Wednesday, handed out on Canvas and submitted through Gradescope.
- **Solutions**: none posted.
- **Exams**: a midterm and a final, 25% each; no paper or practice paper is published.
- **Projects**: none; the weekly homeworks are the coursework.
- **Repo**: [`cs106ea-stanford`](https://github.com/cs106ea-stanford) publishes a repository per homework, `hw1` to `hw8`, all dated Winter 2025 except `hw5`. Each holds what its Colab notebook imports rather than the brief — `hw1` the screenshots and a Colab-basics helper, `hw5` the IMDb sentiment and word-arithmetic helpers, `hw8` the Alpaca and OpenMathInstruct-2 exploration helpers. The notebooks themselves are not public.

## Syllabus

The handout allocates lectures per block:

1. **Introduction to AI** (2): the machine-learning process and the vocabulary used all quarter.
2. **Neural networks** (3): how they work, how they are trained, and what training failures look like.
3. **Real-world considerations** (2): deployment problems, and which tasks neural networks handle badly or "may be fundamentally unsolvable" with them.
4. **Specialized systems** (3): image and natural-language architectures, as examples of fitting models to data.
5. **Transformers and LLMs** (4): the architecture itself, its uses beyond language, then how LLMs are trained.
6. **Advanced topics** (2): chosen with the class — autonomous vehicles and image generation are the suggestions.
7. **Social impacts and future directions** (2): societal, ethical and economic questions, and open research.

Grading is half homework, half exams: a weekly assignment out Thursday and due Wednesday, a midterm and a final.

## Prerequisites

- [CS 106A](CS%20106A.md) officially, but the syllabus welcomes anyone who understands what a program is, basic data types and if/for structures, in any language. No mathematics prerequisite.

## Related

- [CS 193T](CS%20193T.md): using AI tools well, where CS 106EA explains what is inside them.
- [CS 221](CS%20221.md): the technical AI course, which assumes the programming and mathematics this one does without.

## Source notes

- `github.com/cs106ea-stanford` is not linked from the syllabus handout or anywhere else found; its `cs106eHW` repo describes itself as a "trial run" of the course. The homework repos give the scaffolding without the questions (checked 2026-09-30).

- The only public document is the syllabus PDF, hosted in Stanford Summer Session's file store as the Summer 2026 syllabus; the document itself is headed "Winter 2026" and carries Winter deadlines, so it is rated as that offering (checked 2026-09-30).
- The course has no site of its own: `cs106ea.stanford.edu` does not resolve and `web.stanford.edu/class/cs106ea/` 404s. The instructor's other course, [CS 106E](CS%20106E.md), does have one.
