---
type: Course
code: CS 21SI
title: "CS 21SI: AI for Social Good"
description: A two-unit student-taught seminar alternating machine-learning lectures with guest speakers applying AI to climate, health, law and education.
level: undergraduate
term: Spring 2026
terms_offered:
  - Spring 2020
  - Spring 2021
  - Spring 2022
  - Spring 2023
  - Spring 2024
  - Spring 2025
  - Spring 2026
instructors:
  - Piech, C.
units: "2"
grading: Satisfactory/No Credit
prerequisites:
  - CS 106A or equivalent programming experience
  - Application required
homepage: https://web.stanford.edu/class/cs21si/
materials:
  checked: "2026-09-28"
  access: partial
  term: Spring 2025
  syllabus:
    access: open
    url: https://docs.google.com/document/d/1a4yAZKKgacrZa1cmvr5sPH5XSNbU7YL-GdXBvtrufsE/edit
    note: public Google Doc with objectives, the four deliverables and the grading requirements; the ten-week schedule is on the site
  slides: unknown
  notes: unknown
  videos:
    access: closed
    note: guest-lecture recordings are posted on Canvas
  assignments:
    access: partial
    url: https://docs.google.com/document/d/1a4yAZKKgacrZa1cmvr5sPH5XSNbU7YL-GdXBvtrufsE/edit
    note: the syllabus describes all four deliverables and their due dates; the handouts themselves are on Canvas
  exams: none
  projects: unknown
  code:
    access: open
    term: Spring 2023
    url: https://web.stanford.edu/class/cs21si/resources/
    note: "an unlinked Apache listing of per-unit zips: the homework datasets and the unit 5 text-generation script with its pretrained model"
  sites:
    - url: https://docs.google.com/document/d/1a4yAZKKgacrZa1cmvr5sPH5XSNbU7YL-GdXBvtrufsE/edit
      term: Spring 2025
      note: the public syllabus document
    - url: https://web.stanford.edu/class/cs21si/resources/
      term: Spring 2023
      note: a directory listing of the units' data and code, reachable only by guessing the path
topics:
  - machine learning fundamentals and AI ethics
  - deep learning and HCI
  - natural language processing for social good
  - computer vision applications
  - reinforcement learning
  - AI in climate, legal and education settings
  - assistive robotics
tags:
  - artificial-intelligence
  - social-impact
  - seminar
sources:
  - id: catalog
    resource: https://explorecourses.stanford.edu/search?view=xml-20200810&academicYear=20252026&q=CS&filter-departmentcode-CS=on&filter-coursestatus-Active=on
    file: ../references/explorecourses-cs-2025-2026.md
    title: ExploreCourses, 2025-2026
  - id: site
    resource: https://web.stanford.edu/class/cs21si/
    file: ../references/cs-21si-course-site-spring-2025.md
    title: Course site and syllabus, checked 2026-09-27
status: stable
generated:
  by: claude-code/claude-opus-5[1m]
  at: "2026-09-27T16:40:00Z"
---
# CS 21SI: AI for Social Good

Run by CS + Social Good and taught by students under a faculty sponsor. Weeks alternate: an instructional lecture, then a practitioner — ClimateAI, the translation nonprofit Tarjimly, the Legal Design Lab, an assistive-robotics lab.

## Materials

The syllabus document is public and detailed; everything else — homework handouts, recordings — is on Canvas, and the site itself still shows Spring 2025.

- **Syllabus**: the [public Google Doc](https://docs.google.com/document/d/1a4yAZKKgacrZa1cmvr5sPH5XSNbU7YL-GdXBvtrufsE/edit) with objectives, the four deliverables, due dates and the credit requirements; the [site](https://web.stanford.edu/class/cs21si/) carries the ten-week schedule.
- **Slides**, **Notes**: not posted.
- **Videos**: guest-lecture recordings go on Canvas, so a missed talk can be made up "by submitting a short reaction paragraph to the talk recording".
- **Assignments**: described in the syllabus with due dates and scope; the handouts are on Canvas. "Homeworks will be very short (<< 2 hrs)."
- **Exams**: none — the course is S/NC.
- **Projects**: students present, but the work is not posted.
- **Code**: an unlinked [directory listing](https://web.stanford.edu/class/cs21si/resources/) under the class path holds one zip per unit from Spring 2023 — the COMPAS recidivism scores and the German credit dataset for the fairness units, a 151 MB unit-4 bundle, and unit 5's `lstm_text_generation.py` with a pretrained `.h5` model. `hw4_cs21si.zip` is zero bytes.
- **Extra**: the [Spring 2019 site](https://web.stanford.edu/class/cs21si/2019/schedule.html) survives at the same host and is far more open — every week links handouts, lecture slides, class exercises with solutions and homework with solutions, and the Jupyter notebooks sit in a [public repo](https://github.com/karan1149/cs21si). That offering was a coding course (regression, SVMs, CNNs, RNNs) rather than the current talk series, and at seven years old it doesn't carry the ratings above.

## Syllabus

The [schedule](https://web.stanford.edu/class/cs21si/) runs four units over ten weeks:

1. **Intro to machine learning** (weeks 1–2): machine learning and AI ethics; a guest talk from ClimateAI.
2. **Topics in deep learning** (weeks 3–5): deep learning and HCI, natural language processing, computer vision.
3. **AI in practice** (weeks 6–8): guest talks from Tarjimly, Margaret Hagan of the Stanford Legal Design Lab, and Chris Piech on his own lab.
4. **Further exploration** (weeks 9–10): reinforcement learning and wrap-up; a guest talk from Monroe Kennedy III on assistive robotics and manipulation.

The four deliverables run in parallel: scope three potential social-good applications, submit a project proposal, report progress with a social and case-study analysis, then present for eight to ten minutes.

## Prerequisites

- Programming at the level of [CS 106A](CS%20106A.md).
- Enrollment is by application, as the catalog notes: "We encourage students from all disciplines and backgrounds to apply!"

## Related

- [CS 52](CS%2052.md): the other CS + Social Good course, a build-and-ship studio rather than a lecture seminar.
- [CS 221](CS%20221.md): the AI techniques this seminar surveys, at full depth.

## Source notes

- The site is headed "Spring 2025" and names that year's coordinators; the Spring 2026 offering had not updated it when checked on 2026-09-27, so the ratings describe the Spring 2025 posting.
- `cs21si.stanford.edu` redirects to `web.stanford.edu/class/cs21si/`.
- **`resources/` is not linked from anywhere.** The Spring 2023 unit data and code sit in an Apache listing at `/class/cs21si/resources/`, found only because the Internet Archive captured the listing itself in May 2023. Nothing on the current site points at it, and the Spring 2025 syllabus doesn't mention it.
- Spring 2022's archive (`cs21si.1226`) links a deck, exercises and a homework per week, plus four talk recordings — none open. Slides and Drive files 401, the Colab notebooks want a sign-in, the Box dataset 404s, the Zoom links land on zoom.us. Only the week titles survive (checked 2026-09-29).
- `cs21si.1236`, the Spring 2023 archive slot, serves the Spring 2025 site.
- The Spring 2019 offering's complete site is still served from a `2019/` subdirectory of the same class path, unlinked from the current landing page; a web search finds it, URL guessing does not. Its Piazza link points at `winter2018/cs230`, so that one is a copy-paste error, not a CS 21SI board.
