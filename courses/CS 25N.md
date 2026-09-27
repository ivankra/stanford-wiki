---
type: Course
code: CS 25N
title: "CS 25N: Big Ideas in Cryptography"
description: A first-year seminar surveying cryptography's surprising results - from breaking Enigma to zero-knowledge proofs and homomorphic encryption.
level: undergraduate
term: Winter 2026
terms_offered:
  - Winter 2026
instructors:
  - Zhandry, M.
units: "3"
grading: Letter (ABCD/NP)
prerequisites: []
materials:
  checked: "2026-09-28"
  access: open
  syllabus:
    access: open
    url: https://mzhandry.github.io/courses/2026-Spring-CS25N/
    note: "the instructor's own page: a ten-week topic list, the grading split and the prerequisites"
  slides: unknown
  videos: unknown
  assignments:
    access: unknown
    note: homeworks carry 70% of the grade but none is posted
  exams: none
  projects:
    access: unknown
    note: a final project carries the remaining 30%; none is published
topics:
  - cryptanalysis and breaking Enigma
  - design of secure ciphers
  - public key cryptography
  - zero knowledge proofs
  - homomorphic encryption
  - cryptocurrencies
tags:
  - cryptography
  - introsem
  - theory
sources:
  - id: catalog
    resource: https://explorecourses.stanford.edu/search?view=xml-20200810&academicYear=20252026&q=CS&filter-departmentcode-CS=on&filter-coursestatus-Active=on
    file: ../references/explorecourses-cs-2025-2026.md
    title: ExploreCourses, 2025-2026
  - id: probe
    resource: https://web.stanford.edu/class/cs25n/
    file: ../references/course-site-probe-ug-winter-2026-2026-09-27.md
    title: Course site probe, 2026-09-27
status: stable
generated:
  by: claude-code/claude-opus-5[1m]
  at: "2026-09-27T22:50:00Z"
---
# CS 25N: Big Ideas in Cryptography

A seminar built on the field's counterintuitive results — the catalog's framing is that "modern cryptography is also characterized by surprising solutions to seemingly impossible tasks": agreeing a secret with someone you have never met, proving a statement without revealing why it is true, computing on data you cannot read.

## Materials

The seminar has a site, but not under its course code — the instructor keeps it on [his own GitHub Pages](https://mzhandry.github.io/courses/2026-Spring-CS25N/), linked only from his teaching page.

- **Syllabus**: open. The page gives the ten-week topic list below, the prerequisites, and the grading split — **70% homeworks, 30% final project** — with "two 80-minute lectures per week".
- **Assignments** and **Projects**: not published, though between them they are the whole grade.
- **Slides**, **Videos**: none found. **Exams**: none.

## Syllabus

From the instructor's page, which calls it a "very tentative list of topics", roughly one a week:

1. Classical ciphers and cryptanalysis
2. Breaking the Enigma
3. Modern ciphers
4. Public key encryption
5. Homomorphic encryption
6. Zero knowledge proofs
7. Cryptocurrencies
8. Quantum cryptography
9. Advanced topics (weeks 9–10)

The catalog's version of the same ground: "cryptanalysis (including breaking the Enigma during WWII), methodologies behind the design of secure ciphers, public key cryptography (securely exchanging messages without ever having met in person to share a secret key), zero knowledge proofs (proving statements without revealing the proof), homomorphic encryption (performing computations on encrypted data), cryptocurrencies, and more."

## Prerequisites

None required. The catalog suggests "basic programming knowledge and mathematical maturity".

## Related

- [CS 255](CS%20255.md): applied cryptography as a full course, where this seminar surveys.
- [CS 355](CS%20355.md): the theory behind the constructions, at graduate depth.

## Source notes
- **The site is on the instructor's personal domain and its URL contradicts itself.** It lives at `mzhandry.github.io/courses/2026-Spring-CS25N/` — a path saying Spring — while the page's own heading reads "Big Ideas in Cryptography (Winter 2026)", which matches the catalog. His teaching index also lists it as Spring 2026. Trust the heading and the catalog; the path is mislabeled.
- Found only by web search: no Stanford URL pattern reaches it, and nothing at Stanford links to it. `mzhandry.github.io/teaching.html` is the index, and it carries his Princeton courses too, so it is a durable place to look for this instructor's other Stanford courses ([CS 258](CS%20258.md) among them).
- The Explore IntroSems listing (`exploreintrosems.stanford.edu/opportunities/big-ideas-cryptography`) restates the catalog and adds the application deadline, so it is not rated as material.
- `cs25n.stanford.edu` does not resolve and `web.stanford.edu/class/cs25n/` 404s (checked 2026-09-27).
