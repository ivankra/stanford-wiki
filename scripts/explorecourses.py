#!/usr/bin/env python3
"""Build enrollment.json and enrollment.csv from the raw ExploreCourses XML dumps in references/explorecourses/.

    python3 scripts/explorecourses.py                          # whole corpus, ~22s
    python3 scripts/explorecourses.py -i references/explorecourses/CS   # one department

-i takes any mix of .xml files and directories (scanned recursively) and may be repeated;
it defaults to the whole corpus. Course codes, academic years and terms are read out of
the XML itself, never off the filename, so the inputs only decide what is in scope.
Standard library only.

One run writes both files, from the same figures. --json-output defaults beside the corpus
(references/explorecourses/enrollment.json) and is what the wiki's build reads; --csv-output
defaults to enrollment.csv at the bundle root, for anyone working with the numbers directly.
Either takes '-' for stdout, but not both at once.

The CSV is for a reader working with the figures directly; the wiki's own pages are built from
the JSON, which records more. It is one row per code a course carried, so a cross-listing keeps
the split the JSON folds into enrolledByCode, and a column per term, newest first:

    main,code,courseId,26au,26su,26sp,...
    AA 228,AA 228,215840,167,,,...
    AA 228,CS 238,215840,469,,,...

`main` is the heading code of the course's most recent term, shared by every row of that course;
rows sort by `main`, then `code`, then `courseId`. Courses are grouped by courseId there as
everywhere here, so a renumbering keeps one history rather than splitting into two -- and the id
is a column because (main, code) alone is not unique: a course the catalog re-identified appears
twice, over disjoint terms, and so does a number another course later reused.

The JSON is term-major, newest term first, each term mapping the code a course was listed
under THAT term to its offering. The file is nothing but that map. AA 174A in Autumn
2026, exactly as emitted, with its two alias entries:

    {
      "Autumn 2026": {
        "AA 174A": {
          "title": "Principles of Robot Autonomy I",
          "courseId": "225566",          identity across renames; the code is not
          "enrolled": 87,                each code's largest component, added together
          "enrolledByCode": {            only when cross-listed that term; keys are
            "AA 174A": 27,               every code, heading one first, and the values
            "EE 160A": 16,               always sum to "enrolled"
            "CS 137A": 44
          },
          "cap": 210,                    those same sections' caps summed
          "waitlist": 4,                 only when somebody was actually queued
          "component": "LEC",            the component counted for the heading code
          "sections": 3
        },
        "CS 137A": "AA 174A",
        "EE 160A": "AA 174A"
      },
      ...

One more field appears elsewhere: "unresolved" lists codes the title names that this
run never saw for that academic year. A CS-only run reports CS 278 as 248 with
"unresolved": ["SOC 174", "SOC 274"]; loading SOC as well gives 254 and no such key.
It means the count MAY be short, not that it is: a code can also go unresolved because
it was renamed away and only a stale title still names it.

title, courseId, enrolled, component and sections are always present; the rest appear
only when they have something to say, and no key is ever written null. Figures quoted
in this header were measured on the corpus of 2026-10-07 with --as-of 2026-10-07;
filtering is date-dependent, so another date shifts them slightly.

A cross-listed course is filed ONCE, under its heading code, so adding up a term's
"enrolled" counts each course exactly once. Its other codes map to a bare string naming
that heading code, so any code still resolves and the two cases are told apart by type.

Terms that had not started as of --as-of are left out entirely. Counts, warnings and
what was dropped go to stderr at the end of the run, not into the file. Follow one
course over time by grouping on courseId, never by its code: the code belongs to the
offering and changes under renumbering.

================================================================================
DATA MODEL
================================================================================

One dump is one academic year of one department, saved byte for byte as ExploreCourses'
own XML view returned it:

    https://explorecourses.stanford.edu/search?view=xml-20200810
      &academicYear=20252026&q=CS&filter-departmentcode-CS=on&filter-coursestatus-Active=on

One request returns a whole academic year, all four terms, for one department.

The shape is an <xml> root over <courses>, each <course> carrying the catalog entry, an
administrative block, and every section it ran that year. Here is CS 278 in Spring 2025,
trimmed hard (... marks elided text and repeated elements):

    <!-- CS/2024-2025.xml -->
    <course>
      <year>2024-2025</year>
      <subject>CS</subject>  <code>278</code>
      <title>Social Computing (SOC 174, SOC 274)</title>    <!-- parenthetical = cross-listings -->
      <description>...</description>
      <grading>Letter (ABCD/NP)</grading>
      <unitsMin>3</unitsMin>  <unitsMax>4</unitsMax>
      <sections>
        <section>
          <classId>30959</classId>
          <term>2024-2025 Spring</term>  <termId>1256</termId>
          <subject>CS</subject>  <code>278</code>           <!-- the section's own code -->
          <sectionNumber>01</sectionNumber>
          <component>LEC</component>                        <!-- not always LEC -->
          <numEnrolled>248</numEnrolled>                    <!-- the number to trust -->
          <maxEnrolled>999</maxEnrolled>                    <!-- a placeholder, not a cap -->
          <numWaitlist>0</numWaitlist>  <maxWaitlist>0</maxWaitlist>
          <enrollStatus>Open</enrollStatus>
          <addConsent>N</addConsent>                        <!-- I = instructor consent -->
          <instructionMode>P</instructionMode>              <!-- P in person, OS online -->
          <courseId>220571</courseId>
          <schedules><schedule>
            <startDate>Mar 31, 2025</startDate>  <endDate>Jun 4, 2025</endDate>
            <startTime>4:30:00 PM</startTime>    <endTime>5:20:00 PM</endTime>
            <location>NVIDIA Auditorium</location>
            <days> Tuesday Thursday </days>                 <!-- 7 whitespace-padded slots -->
            <instructors>
              <instructor><name>Bernstein, M.</name> ... <role>PI</role></instructor>
              ...                                           <!-- TAs carry role TA -->
            </instructors>
          </schedule></schedules>
          <currentClassSize>248</currentClassSize>          <!-- alias of numEnrolled -->
          <maxClassSize>999</maxClassSize>
          <currentWaitlistSize>0</currentWaitlistSize>  <maxWaitlistSize>0</maxWaitlistSize>
          <notes></notes>
        </section>
        ...                  <!-- 19 DIS sections, holding 210 of those same 248 students -->
      </sections>
      <administrativeInformation>
        <courseId>220571</courseId>
        <offerNumber>1</offerNumber>                        <!-- 1 usually marks the owning dept -->
        <academicCareer>UG</academicCareer>                 <!-- UG GR MED GSB LAW -->
        <academicOrganization>COMPUTSCI</academicOrganization>
        <effectiveStatus>A</effectiveStatus>
      </administrativeInformation>
      <attributes>...</attributes>  <tags>...</tags>
    </course>

The same lecture also sits in SOC/2024-2025.xml under two more codes, an undergraduate
and a graduate one. Each carries the identical room, hour and instructor -- one class,
not three -- but its own classId, its own students and a real cap where CS 278 has a
placeholder:

    <!-- SOC/2024-2025.xml -->
      <subject>SOC</subject>  <code>274</code>
      <title>Social Computing (CS 278, SOC 174)</title>
          <classId>30961</classId>                          <!-- different section id -->
          <numEnrolled>4</numEnrolled>                      <!-- different students -->
          <maxEnrolled>18</maxEnrolled>                     <!-- a real cap, unlike CS 278's -->
          <courseId>220571</courseId>                       <!-- the SAME course -->
          <location>NVIDIA Auditorium</location>            <!-- same room, same hour -->
        <offerNumber>3</offerNumber>
        <academicCareer>GR</academicCareer>

Spring 2025, by code and component:

    code         offerNumber  career    LEC    DIS    cap
    CS 278           1          UG      248    210    999      <- home code
    SOC 274          3          GR        4            18
    SOC 174          2          UG        2            18      <- same department as SOC 274
                                        ----   ----
                                         254    210

The answer is 254. Reading the CS dump alone gives 248 of it, and adding the three codes
up gets there -- but adding the 22 sections up gives 464, because the 19 DIS sections
re-list students already counted in the lecture. The caps mix a 999 placeholder with two
real 18s, so there is no meaningful combined capacity either.

CS 278 is a moderate case. CS 24 in Autumn 2026 is the extreme: one courseId under six
codes in five departments, 108 sections, LEC totalling 247 and DIS totalling exactly the
same 247. The rest of this header is about how each trap on the way is avoided.

Three identifiers, which do different jobs:

  courseId     the catalog course record. Shared by every cross-listed code and
               normally stable across years, so it is the key this script groups by.
               It is not proof of curricular continuity: CS 326A "Motion Planning" runs
               under 105829 for 2001-2004 and under 207584 for 2007-2018, which the
               dumps alone cannot resolve into one course or two.
  classId      one section in one term. Recycled between terms, so it is a key only in
               combination: (term, classId).
  offerNumber  Stanford defines it as an identifier for an offering of a course. In
               practice the code carrying 1 is the one whose department owns the course,
               and that is how it is used here -- an observed convention, not a
               documented ranking, and not reliable on its own (below).

Enrollment lives on the section as numEnrolled / maxEnrolled / numWaitlist / maxWaitlist,
repeated verbatim as currentClassSize / maxClassSize / currentWaitlistSize /
maxWaitlistSize. The two sets never disagree anywhere in the corpus, so only the first is
read here.

A section's component says what kind of meeting it is. 29 types occur, in this order of
frequency: INS T/D LEC SEM DIS PRC LNG CLK PRA ACT WKS LBS COL CAS LAB ISF RES ISS CLN
ITR TUT SCS RSC IDS API SIM CLB PRB SIS. Three of them record individual supervision
rather than a class -- INS (individual instruction), T/D (thesis and dissertation) and
CLK (clerkship) -- and together they are 85% of all sections.

Terms are "2025-2026 Autumn" in the XML and are emitted here in the wiki's style, "Autumn
2025" -- note that Winter, Spring and Summer of academic year 2025-2026 fall in calendar
2026. termId is a PeopleSoft term code, 1-to-1 with (academic year, season):

    termId = (endYear >= 2000)*1000 + (endYear mod 100)*10 + seasonDigit
             seasonDigit: Autumn 2, Winter 4, Spring 6, Summer 8
             endYear is the academic year's ENDING calendar year

so 1262 is Autumn of 2025-2026. Sorting by termId gives Autumn -> Winter -> Spring ->
Summer, the wiki's order, in which Summer 2026 precedes Autumn 2026; that is the sort key
used throughout. 0 is not a term in this scheme and never appears.

================================================================================
WHAT BITES
================================================================================

-- Identity --

* classId is recycled between terms; (term, classId) is the key, so re-reading a dump
  costs nothing. It collides once in the corpus, a catalog defect (ARTHIST 130 and 134
  share classId 30152 in Spring 2026); the larger count wins. That is not a snapshot
  policy: feed two dumps of one term taken at different times and the larger count wins
  even if the smaller is newer, while titles come from whichever was read last.

* A cross-listed course shares one courseId but splits its enrollment, each code with
  its own classId and count. Reading one department's dump undercounts; counting the
  course once per code double-counts. Grouping by courseId gives AA 228 / CS 238 as 636
  for Autumn 2026, not the 469 the CS dump shows alone. It also happens inside one
  department, usually an undergraduate/graduate pair (ANTHRO 1 / ANTHRO 201).

* THERE IS NO CANONICAL COURSE CODE. courseId 204650 was CS 376 to Autumn 2018 and has
  been CS 347 since Winter 2020, while courseId 105862 held CS 347 throughout that first
  stretch. Pick one code per course and you file one course's terms under another's
  number. Hence term-major, each record under the code its own term used.

* (term, code) is almost unique: 35 of 359,142 pairs are held by two courseIds, mostly
  2001-2002 SIS seminars, none in CS. Two survive filtering, and the smaller is keyed
  "LAW 290 (215933)" by courseId rather than overwriting the other -- so a key is not
  guaranteed to be a bare code, and courseId is what follows a course over time.

* Which code heads a cross-listing is a convention: lowest offerNumber among the codes
  present that term, ties by subject then code. offerNumber 1 usually marks the owning
  department, but some groups have no 1 or two of them, and it is not documented as a
  ranking. The heading code is NOT "whose course it is" -- in Winter 2017 LINGUIST 284
  heads CS 224N on a 669-to-1 split.

* The <title> parenthetical names partner codes, but also holds plain English
  ("Programming Methodologies ... (Accelerated)"), so it is never used to merge. It only
  reveals codes this run never saw for the year, which go in "unresolved".

-- Counting --

* Within one CODE, sum each component's sections and keep the largest; then add the
  codes. Components are co-requisites within a code -- a discussion re-lists its own
  lecture's students -- but two codes carry separate enrollments even when they label
  sections differently. Pooling components across codes first undercounts: courseId
  213776 in Winter 2017 is ANTHRO 119 (LAB 3), ARCHLGY 119 (LEC 3), ANTHRO 219 (LEC 2),
  which totals 8 enrollments, not 5.

* Parallel sections within a component are separate listings and are summed: CS 105 in
  Autumn 2025 is LEC 01 (56, room 260-113) plus LEC 888 (39, instructionMode OS for
  "Online: Synchronous", no room, different instructor) = 95. The modality does not say
  which program those students come through, so do not read a section number as a named
  cohort. The primary component is not always LEC -- CS 25 is ACT, CS 106L is LAB -- so
  nothing is whitelisted.

* A code's DIS total is usually below its LEC total, since signing up for a discussion
  is not universal; of 7,906 code-terms with both, only 26% match within 1%. A shortfall
  is normal, not a gap. DIS exceeds LEC in 22 of them, by 22 students at most.

* "enrolled" is an ESTIMATE, not a roster count. It assumes a component's own sections
  hold disjoint people, which the data cannot check and PeopleSoft does not guarantee.

-- Individual instruction (skipped by default) --

* An INS section is one PER SUPERVISING FACULTY MEMBER. numEnrolled on it still counts
  students, but spread across staff rather than a class that meets: INS averages 0.30
  students per section, T/D 0.37, CLK 0.71. These are the wiki's `type: Registration`
  courses -- CS 499, CS 399, CS 390A-W, CS 199, CS 191, CS 801/802 -- and being 85% of
  the corpus they swamp any ranking.

* Which components count as individualized is a policy choice. This follows Stanford's
  grouping (INS, T/D, CLK); ITR averages 1.64 but Stanford calls it regular, so it is
  counted as teaching. CLK is 22,711 sections and matters well outside CS.

* Each OFFERING is classified on its own sections: 90% or more individualized makes
  that term a registration, dropped unless --include-registrations is passed. Judging a
  course once over its whole history instead would both mislabel years and make the
  answer depend on which years were loaded -- CS 244C ran INS-only from 1998-1999 to
  2004-2005 and LAB sections before and after, and those seven years are registrations
  while the rest are taught offerings. Within a taught offering, individualized
  sections never set the headcount.

-- Caps and waitlists --

* maxEnrolled is administrative and usually nominal; 0, 999, 1100 and 9999 are read as
  "no real cap", which is a heuristic from frequency and roundness rather than a
  documented sentinel list. Such an offering simply has no "cap", since a placeholder
  mixed into the sum would invent a capacity. numEnrolled is the field to trust.

* "cap" sums the counted sections' administrative limits -- not physical rooms, since
  combined sections share one and an online section has none: CS 105 in Autumn 2025 ran
  lectures limited to 80 and 350, so 430. One placeholder among them voids the sum. Stanford
  also gives cross-listed sections a shared limit the dumps do not expose, so even a
  summed cap is section-derived, not the registrar's figure. Courses do run over cap
  (CS 329Z: 125 against 70), and PeopleSoft supports limit overrides, so that does not
  prove the cap stale.

* numWaitlist is LIVE ONLY, purged around the Final Study List Deadline, so a zero on a
  finished term means NOT RECORDED. The key appears only where a queue was observed --
  390 offerings. It is the LARGEST single section queue, not a course total: queues are
  per section and a person can sit on several, so they cannot be added into a count of
  people. A queue against free seats is normal (instructor consent, a conditional swap,
  a failed requisite, batch lag), and the XML never says which.

-- Time and coverage --

* Each term is classified from its own sections' dates against --as-of. Pre-2001
  sections almost never carry dates (2 of 4,716 in CS), so those fall back to the
  calendar year, which settles every year but the one in progress; 404 offerings remain
  "unknown" and no whole term does. Future terms are dropped, including the 4,987
  carrying 967 already-registered students, and the run reports that cost.

* Enrollment is a frozen snapshot and the API does not say when in the quarter it was
  taken, so these are not final headcounts. --as-of defaults to today, so pass the
  fetch date to classify the corpus as it was observed. Check a surprising figure
  against neighboring terms: CS 109 reads 145 for Autumn 2026 against 305-416 in the
  three preceding Autumns, and nothing in the data explains it.

* Records reach back to 1985-1986, with a sharp break at 2001-2002: CS goes 400 -> 5,854
  sections, INS 300 -> 4,793, but LEC also 86 -> 146, so this is not purely a recording
  change and the dumps do not say what it was. Treat pre-2001 as a different regime.

* A filter-term-<Season> query narrows which COURSES come back, not which sections: each
  still carries its whole year. Summer of the current year publishes late and unevenly.

Scale, for reference: the whole corpus is 6,667 files and 2.69M sections. Parsing is
CPU-bound and every file is independent, so -j forks it out: on a 10-core machine the
full run takes about 21 seconds against 3.5 minutes at -j 1, holding ~2.1 GB. Workers
only parse; the parent merges their results in input order, so the output does not
depend on how many of them there are.
"""

from __future__ import annotations

import argparse
import collections
import csv
import datetime as dt
import io
import json
import multiprocessing
import os
import re
import sys
import xml.etree.ElementTree as ET
from typing import NamedTuple

# Sections that record supervision load rather than a class: Stanford's individualized
# components. ITR (internship) is a regular component despite its small sections, and is
# deliberately not here. See the module docstring.
INDIVIDUAL_COMPONENTS = {"INS", "T/D", "CLK"}

# An OFFERING whose sections are at least this proportion individualized is a
# registration (CPT, TGR, independent study, clerkships) rather than a class that meets.
# Judged per term, so a course can be a supervision number one year and taught the next.
REGISTRATION_SHARE = 0.9

# maxEnrolled values read as "no real cap set". A heuristic from their frequency and
# roundness, not a documented sentinel list, so a cap built from one is withheld rather
# than reported.
PLACEHOLDER_CAPS = {0, 999, 1100, 9999}

SEASONS = ("Autumn", "Winter", "Spring", "Summer")

# Every department, every year. Narrowing the input narrows the answer rather than the
# question: a cross-listed course's partners live in other departments' dumps, so a
# single-department run undercounts and says so in "unresolved".
DEFAULT_CORPUS = "references/explorecourses"
DEFAULT_JSON = os.path.join(DEFAULT_CORPUS, "enrollment.json")
# The CSV is for a reader rather than for the scripts, so it sits at the bundle root beside
# enrollment.md, not inside the corpus it was distilled from.
DEFAULT_CSV = "enrollment.csv"

SEASON_ABBR = {"Autumn": "au", "Winter": "wi", "Spring": "sp", "Summer": "su"}

# "Machine Learning (STATS 229, SYMSYS 25)" -> the codes, but not "(Accelerated)".
TITLE_TAIL = re.compile(r"\(([^()]*)\)\s*$")
CODE_TOKEN = re.compile(r"^([A-Z][A-Z&]{1,9})\s?(\d+[A-Z]*)$")


# ---------------------------------------------------------------------------
# small helpers


def course_code_sort_key(code: str):
    """Sort CS 106A < CS 106AX < CS 106B < CS 110, the way the wiki orders codes."""
    parts = re.findall(r"\d+|\D+", code)
    return [(1, int(p), "") if p.isdigit() else (0, 0, p) for p in parts]


def parse_term_name(raw: str):
    """'2025-2026 Autumn' -> ('Autumn 2025', '2025-2026', 2025). Winter/Spring/Summer roll over."""
    try:
        years, season = raw.rsplit(" ", 1)
        start = int(years.split("-")[0])
    except (ValueError, IndexError):
        return None, None, None
    if season not in SEASONS:
        return None, None, None
    year = start if season == "Autumn" else start + 1
    return f"{season} {year}", years, year


def parse_schedule_date(raw: str):
    """'Sep 22, 2025' -> a date ordinal. The dumps use no other format; empty before 2001.

    Ordinals rather than date objects: there are 2.7M of them and they cross a process
    boundary when -j is in play.
    """
    raw = (raw or "").strip()
    if not raw:
        return None
    try:
        return dt.datetime.strptime(raw, "%b %d, %Y").date().toordinal()
    except ValueError:
        return None


def parse_int(raw: str, default=0, tally=None):
    """Parse a numeric field, counting anything non-numeric rather than hiding it.

    An absent field is normal (many are empty), but a present field that will not parse
    means the feed changed shape, and silently reading it as 0 would publish a wrong
    count. `tally` collects those so the run can report them.
    """
    raw = (raw or "").strip()
    if not raw:
        return default
    try:
        return int(raw)
    except ValueError:
        if tally is not None:
            tally.append(raw)
        return default


def cross_listed_codes_in_title(title: str):
    """Codes named in a title's trailing parenthetical, ignoring plain-English tails."""
    tail = TITLE_TAIL.search(title or "")
    if not tail:
        return []
    out = []
    for piece in tail.group(1).split(","):
        # normalize "SYMSYS25" and "SYMSYS 25" to one spelling
        token = CODE_TOKEN.match(" ".join(piece.split()))
        if token:
            out.append(f"{token.group(1)} {token.group(2)}")
    return out


def short_term(term: str) -> str:
    """'Autumn 2026' -> '26au', the compact label the wiki's generated tables use."""
    season, year = term.rsplit(" ", 1)
    return year[2:] + SEASON_ABBR[season]


def rows_by_code(terms):
    """One row per code a course carried: (heading code, code, courseId, {term: enrolled}).

    The JSON files a cross-listed course once, under the code that headed it, with the split in
    "enrolledByCode"; this keeps that split, so each code gets a row of its own. Courses are grouped
    by courseId, never by code, so a renumbering keeps one history -- and the heading code is a
    property of the term, so the row reports the LATEST one, which is how the course is known now.
    """
    by = {}
    for term in reversed(list(terms)):          # oldest first, so "main" ends up the latest heading
        for key, rec in terms[term].items():
            # A string is an alias pointing at the code the offering was filed under; following it
            # would count the course twice. A recorded 0 is no figure.
            if isinstance(rec, str) or not rec.get("enrolled"):
                continue
            head = re.sub(r" \(\d+\)$", "", key)
            course = by.setdefault(rec.get("courseId") or key, {"main": head, "codes": {}})
            course["main"] = head
            for code, n in (rec.get("enrolledByCode") or {head: rec["enrolled"]}).items():
                if n:
                    row = course["codes"].setdefault(code, {})
                    row[term] = row.get(term, 0) + n
    # courseId rides along because (main, code) is NOT unique: a course the catalog re-identified keeps
    # its code and its latest heading code but splits into two courseIds, and 2,298 pairs in the corpus
    # are held by two rows that way. Their term ranges never overlap, but without the id a reader can't
    # see that the two belong together, or tell them from a number another course later reused.
    rows = [(c["main"], code, cid, counts)
            for cid, c in by.items() for code, counts in c["codes"].items()]
    rows.sort(key=lambda r: (course_code_sort_key(r[0]), course_code_sort_key(r[1]), r[2]))
    return rows


def render_csv(terms):
    """The whole corpus as a table: main, code, then a column per term, newest first."""
    columns = list(terms)                        # the JSON is already newest first
    out = io.StringIO()
    writer = csv.writer(out, lineterminator="\n")
    writer.writerow(["main", "code", "courseId"] + [short_term(t) for t in columns])
    for main, code, cid, counts in rows_by_code(terms):
        writer.writerow([main, code, cid] + [counts.get(t, "") for t in columns])
    return out.getvalue()


# ---------------------------------------------------------------------------
# reading


def collect_xml_files(paths):
    """Expand files and directories into (xml paths, requested paths that do not exist).

    The second list matters: a path the caller asked for and did not get makes the run
    incomplete, which decides whether anything is published.
    """
    found, seen, absent = [], set(), []
    for path in paths:
        if os.path.isdir(path):
            for root, dirs, files in os.walk(path):
                dirs.sort()
                for name in sorted(files):
                    if name.lower().endswith(".xml"):
                        found.append(os.path.join(root, name))
        elif os.path.isfile(path):
            found.append(path)
        else:
            print(f"warning: no such file or directory: {path}", file=sys.stderr)
            absent.append(path)
    out = []
    for path in found:
        real = os.path.realpath(path)
        if real not in seen:
            seen.add(real)
            out.append(path)
    return out, absent


class SectionRow(NamedTuple):
    """One <section>, flattened. A NamedTuple so it pickles cheaply across -j workers."""
    course_id: str
    term: str
    class_id: str
    term_id: int
    subject: str
    code: str
    component: str
    enrolled: int
    cap: int
    waitlist: int
    start: int | None
    end: int | None


class CourseRow(NamedTuple):
    """One <course> record: the same course appears once per code and once per year."""
    course_id: str
    code: str
    year: str
    title: str
    offer: int
    partners: tuple


class NotACatalog(Exception):
    """Parsed as XML, but the document is not an ExploreCourses dump."""


class DumpResult(NamedTuple):
    """What one worker returns for one file."""
    path: str
    courses: list
    sections: list
    bad_terms: int
    unparsed: int
    repaired: bool
    error: str


def restore_mangled_cp1252_bytes(raw: bytes) -> bytes:
    """Put back the high bit on CP1252 bytes that lost it, which XML 1.0 forbids.

    COMM/2009-2010.xml reads `expressionism and\\x13modern man\\x14 discourse`: smart quotes
    0x93/0x94 served as 0x13/0x14. ExploreCourses returns the same bytes on a refetch, so
    the dump stays as fetched and the repair happens here instead. Anything still illegal
    afterwards is dropped so the file parses.
    """
    out = bytearray()
    for byte in raw:
        if byte in (0x09, 0x0a, 0x0d) or byte >= 0x20:
            out.append(byte)
        else:
            out += bytes([byte + 0x80]).decode("cp1252", "ignore").encode("utf-8")
    return bytes(out)


def extract_dump_rows(source):
    """Pull the course and section rows out of one open dump.

    Raises ET.ParseError on malformed XML and NotACatalog on a well-formed document
    that is not a dump.

    Streams with iterparse and drops each <course> once handled: the corpus is 7.3 GB and
    must never be held whole.
    """
    courses, sections, bad_terms, unparsed = [], [], 0, []
    container = None
    saw_courses = False
    for event, el in ET.iterparse(source, events=("start", "end")):
        if event == "start":
            if el.tag == "courses":
                container = el
                saw_courses = True
            continue
        if el.tag != "course":
            continue

        admin = "administrativeInformation/"
        course_id = (el.findtext(admin + "courseId") or "").strip()
        subject = (el.findtext("subject") or "").strip()
        code = (el.findtext("code") or "").strip()
        if course_id and subject and code:
            title = (el.findtext("title") or "").strip()
            courses.append(CourseRow(
                course_id=course_id,
                code=f"{subject} {code}",
                year=(el.findtext("year") or "").strip(),
                title=title,
                offer=parse_int(el.findtext(admin + "offerNumber"), 99, unparsed),
                partners=tuple(cross_listed_codes_in_title(title)),
            ))
            for sec in el.iter("section"):
                field = lambda tag: (sec.findtext(tag) or "").strip()  # noqa: E731
                term = field("term")
                if not parse_term_name(term)[0]:
                    bad_terms += 1
                    continue
                starts, ends = [], []
                for sch in sec.iter("schedule"):
                    start = parse_schedule_date(sch.findtext("startDate"))
                    end = parse_schedule_date(sch.findtext("endDate"))
                    if start:
                        starts.append(start)
                    if end:
                        ends.append(end)
                sections.append(SectionRow(
                    course_id=course_id,
                    term=term,
                    class_id=field("classId"),
                    term_id=parse_int(field("termId"), 0, unparsed),
                    subject=field("subject") or subject,
                    code=field("code") or code,
                    component=field("component") or "?",
                    enrolled=parse_int(field("numEnrolled"), 0, unparsed),
                    cap=parse_int(field("maxEnrolled"), 0, unparsed),
                    waitlist=parse_int(field("numWaitlist"), 0, unparsed),
                    start=min(starts) if starts else None,
                    end=max(ends) if ends else None,
                ))
        el.clear()
        if container is not None:
            try:
                container.remove(el)
            except ValueError:
                pass
    if not saw_courses:
        # Well-formed but not a catalog: an error page, or the wrong feed. Returning
        # empty lists would let it count as a successful read and help overwrite a
        # good export with {}.
        raise NotACatalog("no <courses> element; not an ExploreCourses dump")
    return courses, sections, bad_terms, unparsed


def parse_dump(path):
    """Read one dump into a DumpResult. Pure, so it can run in a worker process."""
    try:
        try:
            courses, sections, bad_terms, unparsed = extract_dump_rows(path)
            repaired = False
        except ET.ParseError as exc:
            # Nothing was published anywhere, so a retry just discards the partial lists.
            with open(path, "rb") as fh:
                mended = restore_mangled_cp1252_bytes(fh.read())
            courses, sections, bad_terms, unparsed = extract_dump_rows(io.BytesIO(mended))
            repaired = True
            print(f"warning: {path}: malformed XML ({exc}); repaired", file=sys.stderr)
    except NotACatalog as exc:
        return DumpResult(path, [], [], 0, 0, False, str(exc))
    except ET.ParseError as exc:
        return DumpResult(path, [], [], 0, 0, False, f"malformed XML ({exc})")
    except OSError as exc:
        return DumpResult(path, [], [], 0, 0, False, str(exc))
    if unparsed:
        print(f"warning: {path}: {len(unparsed)} non-numeric value(s) read as 0, "
              f"e.g. {unparsed[:3]}", file=sys.stderr)
    return DumpResult(path, courses, sections, bad_terms, len(unparsed), repaired, "")


def merge_dump(result, catalog, coverage, sections_by_course, stats):
    """Fold one DumpResult into the run-wide tables.

    catalog is keyed (courseId, academic year) -> {code: CourseRow}. A course's code
    and title are properties of the YEAR it was listed in, not of the course, so
    nothing here collapses them to a single value.
    """
    for row in result.courses:
        catalog[(row.course_id, row.year)][row.code] = row
        coverage.add((row.code, row.year))
        stats["courses"] += 1

    for row in result.sections:
        # (term, classId) is the only unique key; see the module docstring. On the one
        # corpus-wide collision the larger count wins, so neither the order the files were
        # read in nor the number of workers can change the answer.
        bucket = sections_by_course[row.course_id]
        key = (row.term, row.class_id)
        prior = bucket.get(key)
        if prior is None or row.enrolled > prior.enrolled:
            bucket[key] = row
        if prior is not None:
            stats["collisions"] += 1
        stats["sections"] += 1

    stats["bad_terms"] += result.bad_terms
    stats["unparsed_numbers"] += result.unparsed
    if result.repaired:
        stats["repaired_files"] += 1


def default_jobs():
    """Leave two cores for the parent's merging and for the rest of the machine."""
    return max(1, (os.cpu_count() or 1) - 2)


def iter_parsed_dumps(files, jobs):
    """Yield a DumpResult per file, in input order, over `jobs` processes."""
    if jobs <= 1:
        for path in files:
            yield parse_dump(path)
        return
    # One file at a time per task: they vary from 300 KB to 20 MB, so a larger chunk
    # leaves workers idle at the tail. imap keeps results in input order.
    with multiprocessing.Pool(jobs) as pool:
        yield from pool.imap(parse_dump, files, chunksize=1)


# ---------------------------------------------------------------------------
# aggregating


def classify_term_state(start, end, as_of, as_of_year, calendar_year):
    """complete / in_progress / future, from the term's own schedule dates where it has them.

    Dates are ordinals, as carried on SectionRow.
    """
    if end and end < as_of:
        return "complete"
    if start and start > as_of:
        return "future"
    if start and end and start <= as_of <= end:
        return "in_progress"
    # Pre-2001 sections carry no dates at all, and neither do some not-yet-scheduled
    # future ones; fall back to the calendar year, which settles everything but the
    # year in progress.
    if calendar_year and calendar_year < as_of_year:
        return "complete"
    if calendar_year and calendar_year > as_of_year:
        return "future"
    return "unknown"


def head_rank(code, year_codes):
    """Sort key picking which of a cross-listing's codes heads the offering."""
    rec = year_codes.get(code)
    return (rec.offer if rec else 99, code.split()[0], course_code_sort_key(code))


def build_offerings(course_id, sections, catalog, coverage, as_of, as_of_year):
    """Turn one courseId's sections into one record per term it ran.

    A course has no single code: the code is a property of the offering. Each term is
    emitted under the code it was actually listed as that term, so CS 347's history
    never absorbs the terms when that course was CS 376.
    """
    by_term = collections.defaultdict(list)
    for s in sections.values():
        by_term[s.term].append(s)

    out = []
    for term_raw, all_rows in by_term.items():
        pretty, academic_year, calendar_year = parse_term_name(term_raw)

        # Classify the OFFERING, not the course's whole history. A course can be a
        # supervision number for years and a taught class later -- CS 244C ran INS-only
        # from 1998-1999 to 2004-2005 and LAB sections after -- and judging it once
        # over all loaded years both mislabels those years and makes the answer depend
        # on which years happen to be loaded.
        teaching = [s for s in all_rows if s.component not in INDIVIDUAL_COMPONENTS]
        individualized = 1 - len(teaching) / len(all_rows)
        kind = "registration" if individualized >= REGISTRATION_SHARE else "course"
        # Within a taught offering a stray supervision section never sets the headcount.
        rows = all_rows if kind == "registration" else teaching
        year_codes = catalog.get((course_id, academic_year), {})

        # Components are resolved WITHIN each code, then codes are added up. A
        # discussion re-lists its own code's lecture students, but two codes of a
        # cross-listing hold different people even when they label their sections
        # differently -- courseId 213776 in Winter 2017 is ANTHRO 119 (LAB, 3),
        # ARCHLGY 119 (LEC, 3) and ANTHRO 219 (LEC, 2): 8 enrollments, not the 5
        # that pooling by component first would give.
        per_code = collections.defaultdict(collections.Counter)
        for s in rows:
            per_code[f"{s.subject} {s.code}"][s.component] += s.enrolled
        winner = {c: max(v.items(), key=lambda kv: (kv[1], kv[0]))[0]
                  for c, v in per_code.items()}
        by_code = {c: per_code[c][winner[c]] for c in sorted(per_code)}
        enrolled = sum(by_code.values())

        # Which code heads this offering. offerNumber is itself recorded per
        # course-record per year, so this is settled within the term and never across
        # the course's life.
        codes = sorted(by_code, key=lambda c: head_rank(c, year_codes))
        head = codes[0]

        rec = year_codes.get(head)
        title = (rec.title if rec else "") or ""
        if cross_listed_codes_in_title(title):
            title = TITLE_TAIL.sub("", title).strip()

        starts = [s.start for s in rows if s.start]
        ends = [s.end for s in rows if s.end]
        state = classify_term_state(min(starts) if starts else None,
                                    max(ends) if ends else None,
                                    as_of, as_of_year, calendar_year)

        # Capacity follows the same path: each code's counted sections, summed, since
        # each is a separate room or cohort. A single placeholder anywhere makes the
        # total meaningless, so it goes unknown rather than reporting a partial sum.
        caps = [s.cap for s in rows
                if s.component == winner.get(f"{s.subject} {s.code}")]
        cap = None if (not caps or any(c in PLACEHOLDER_CAPS for c in caps)) else sum(caps)

        # A zero is never informative: on a finished term it means the queue was
        # purged, and on a live one it means nobody is waiting. Only a real queue is
        # worth a key, so the field is present exactly when somebody was queued.
        waitlist = max((s.waitlist for s in rows), default=0) or None

        named = {p for r in year_codes.values() for p in r.partners} - set(year_codes)
        unresolved = sorted((p for p in named if (p, academic_year) not in coverage),
                            key=course_code_sort_key)

        # Built in the order it is read: what the course is, how many took it and
        # how that splits, then the capacity and shape of the offering. Keys whose
        # value is None are dropped at emit time.
        entry = {
            "code": head,
            "title": title,
            "courseId": course_id,
            # A term that has not started can still hold a real count, since
            # registration opens first; only a zero there means nothing. main() drops
            # future offerings either way and reports what that cost.
            "enrolled": None if state == "future" and not enrolled else enrolled,
            # The keys ARE the cross-listing, heading code first, so a separate
            # cross_listed list would repeat them exactly. Kept even when every code
            # reads 0, since the split is what says the course is cross-listed at all.
            "enrolledByCode": {c: by_code[c] for c in codes} if len(codes) > 1
                                else None,
            "cap": cap,
            "waitlist": waitlist,
            "component": winner[head],
            "sections": len(rows),
            # Codes the title names that this run never saw for this academic year.
            # Deliberately NOT called missing enrollment: the dumps cannot tell an
            # unloaded partner from a stale title. SOC 174 is real and absent when
            # only CS is loaded; ARTSTUDI 152 was renamed to 152A and no longer
            # exists, yet ARTSTUDI 259's title still names it. Both look identical
            # from here, so this says only that the code did not resolve -- treat
            # "enrolled" as a possible undercount until you check which it is.
            "unresolved": unresolved or None,
        }
        out.append((pretty, max((s.term_id for s in rows), default=0), kind, state, entry))
    return out


# ---------------------------------------------------------------------------


def main(argv=None):
    ap = argparse.ArgumentParser(
        description="Extract per-course enrollment from ExploreCourses XML dumps.",
        epilog="Read the header of this file before trusting a number out of it.")
    ap.add_argument("-i", "--input", action="append", metavar="PATH", dest="paths",
                    help=".xml dump, or a directory scanned recursively for them; "
                         f"repeatable (default: {DEFAULT_CORPUS}, the whole corpus)")
    ap.add_argument("-o", "--json-output", default=DEFAULT_JSON, metavar="FILE",
                    help=f"term-major JSON, what the wiki's build reads (default: {DEFAULT_JSON}, "
                         "beside the corpus it describes); '-' for stdout")
    ap.add_argument("--csv-output", default=DEFAULT_CSV, metavar="FILE",
                    help=f"the same figures as a table, one row per code a course carried and a "
                         f"column per term (default: {DEFAULT_CSV}); '-' for stdout")
    ap.add_argument("--include-registrations", action="store_true",
                    help="keep CPT, TGR and independent-study numbers, which list one "
                         "section per supervising faculty member, so their totals are "
                         "supervision load rather than class size")
    ap.add_argument("--as-of", metavar="YYYY-MM-DD",
                    help="date against which a term counts as complete, in progress or "
                         "future (default: today; pass the dumps' fetch date to classify "
                         "them as they were observed)")
    ap.add_argument("--allow-partial", action="store_true",
                    help="publish even when some requested input could not be read in "
                         "full -- an unreadable file, a missing path, or a section with "
                         "an unrecognized term; without it such a run writes nothing "
                         "and exits non-zero")
    ap.add_argument("-j", "--jobs", type=int, default=default_jobs(), metavar="N",
                    help=f"parse this many dumps in parallel (default: {default_jobs()}, "
                         "this machine's cores less two); 1 stays in-process")
    args = ap.parse_args(argv)

    if args.as_of:
        try:
            as_of_date = dt.date.fromisoformat(args.as_of)
        except ValueError:
            ap.error(f"--as-of: not an ISO date: {args.as_of}")
    else:
        as_of_date = dt.date.today()
    as_of, as_of_year = as_of_date.toordinal(), as_of_date.year

    if args.json_output == "-" and args.csv_output == "-":
        ap.error("only one output can go to stdout; give the other a file")

    files, absent = collect_xml_files(args.paths or [DEFAULT_CORPUS])
    if not files:
        ap.error("no .xml files found in the given paths")
    jobs = max(1, min(args.jobs, len(files)))

    sections_by_course = collections.defaultdict(dict)
    catalog = collections.defaultdict(dict)
    coverage = set()            # (course code, academic year) pairs actually loaded
    stats = collections.Counter()

    # Parsing is CPU-bound and each file is independent, so it forks out cleanly. Results
    # are merged in the parent in input order, which keeps the output identical to -j 1.
    for i, result in enumerate(iter_parsed_dumps(files, jobs), 1):
        if len(files) > 1:
            print(f"[{i}/{len(files)}] {result.path}", file=sys.stderr)
        if result.error:
            print(f"warning: {result.path}: {result.error}; skipped", file=sys.stderr)
            stats["bad_files"] += 1
            continue
        merge_dump(result, catalog, coverage, sections_by_course, stats)
        stats["files"] += 1

    # One record per term a course ran, filed under the code it carried THAT term.
    offerings, dropped = [], 0
    for course_id, sections in sections_by_course.items():
        if not sections:
            continue
        rows = build_offerings(course_id, sections, catalog, coverage,
                               as_of, as_of_year)
        # Per offering, since a course can be a supervision number one year and a
        # taught class the next.
        for row in rows:
            if row[2] == "registration" and not args.include_registrations:
                dropped += 1
                continue
            offerings.append(row)

    # Newest term first, and nothing that has not started: a future term is a listing,
    # not a measurement. The count is reported below so the omission is visible.
    skipped = [o for o in offerings if o[3] == "future"]
    kept = [o for o in offerings if o[3] != "future"]
    future_enrolled = sum(o[4]["enrolled"] or 0 for o in skipped)

    # Two passes, because a heading collision can move a record to a different key and
    # its aliases must point at wherever it ended up.
    placed = collections.defaultdict(dict)   # term -> final key -> (record, partners)
    term_order = {}
    for pretty, term_id, _kind, _state, entry in kept:
        term_order[pretty] = term_id
        code = entry.pop("code")
        partners = [c for c in (entry.get("enrolledByCode") or {}) if c != code]
        # An unknown cap or waitlist is left out rather than written as null: the key's
        # absence says the same thing, and most offerings have neither.
        record = {k: v for k, v in entry.items() if v is not None}

        # Two courses can head the same code in one term -- 35 times in the corpus,
        # twice after filtering. Overwriting would make a real course vanish, so the
        # smaller keeps a key of its own, suffixed with its courseId. Ties break on
        # courseId so the result never depends on which record arrived first.
        key, clash = code, placed[pretty].get(code)
        if clash is not None:
            stats["head_collisions"] += 1
            mine = (record.get("enrolled", 0), record["courseId"])
            theirs = (clash[0].get("enrolled", 0), clash[0]["courseId"])
            if theirs > mine:
                key = f"{code} ({record['courseId']})"
            else:
                placed[pretty][f"{code} ({clash[0]['courseId']})"] = clash
        placed[pretty][key] = (record, partners)

    by_term = collections.defaultdict(dict)
    for pretty, records in placed.items():
        for key, (record, _partners) in records.items():
            by_term[pretty][key] = record
        # A cross-listed course is filed once, under its heading code, so summing a
        # term's "enrolled" counts each course exactly once. Its other codes point at
        # the key that course actually ended up under, so every code resolves.
        #
        # A partner code can itself be contested: in Spring 2023 two courses both use
        # MED 275B, one as a partner and one as a heading. Taking the first and
        # dropping the rest would leave a membership no lookup can reach, so the loser
        # gets a courseId-suffixed alias of its own, exactly as headings do.
        for key, (record, partners) in records.items():
            cid = record["courseId"]
            for partner in partners:
                held = by_term[pretty].get(partner)
                if held is None:
                    by_term[pretty][partner] = key
                    continue
                target = by_term[pretty][held] if isinstance(held, str) else held
                if isinstance(target, dict) and target.get("courseId") == cid:
                    continue                      # already resolves to this course
                stats["alias_collisions"] += 1
                by_term[pretty].setdefault(f"{partner} ({cid})", key)

    terms = {}
    for pretty in sorted(term_order, key=lambda t: term_order[t], reverse=True):
        terms[pretty] = {code: by_term[pretty][code]
                         for code in sorted(by_term[pretty], key=course_code_sort_key)}

    # Any input the caller asked for and did not get makes this an incomplete run.
    # Checked BEFORE the output is opened, because publishing a reduced dataset over a
    # good export is the damage; the exit status alone comes too late to prevent it.
    failed = stats["bad_files"] + len(absent) + stats["bad_terms"]
    if stats["files"] == 0:
        print("error: no input file could be parsed; output left untouched",
              file=sys.stderr)
        return 1
    if failed and not args.allow_partial:
        print(f"error: {failed} requested input(s) could not be read in full; output "
              "left untouched. Pass --allow-partial to publish from what did parse.",
              file=sys.stderr)
        return 1

    # Both files are nothing but the figures: provenance and counts go to stderr, where they
    # belong to the run rather than to the data. The JSON is what the wiki's build reads; the CSV
    # is the same run's output for anyone who wants to work with the numbers directly.
    def publish(path, text):
        if path == "-":
            sys.stdout.write(text)
            return
        # Write beside the target and rename, so an interrupted or failing run leaves
        # the previous export intact rather than half-written.
        tmp = f"{path}.{os.getpid()}.tmp"
        try:
            with open(tmp, "w", encoding="utf-8") as fh:
                fh.write(text)
            os.replace(tmp, path)
        except OSError:
            if os.path.exists(tmp):
                os.unlink(tmp)
            raise

    publish(args.json_output, json.dumps(terms, indent=2, ensure_ascii=False) + "\n")
    publish(args.csv_output, render_csv(terms))

    names = [p if p != "-" else "stdout" for p in (args.json_output, args.csv_output)]
    log = lambda line: print(line, file=sys.stderr)  # noqa: E731
    log("")
    log(f"wrote {names[0]} and {names[1]}")
    log(f"  as of          {as_of_date.isoformat()}")
    log(f"  read           {stats['files']} files, {stats['sections']} sections"
        + (f", {stats['sections'] - sum(len(x) for x in sections_by_course.values())}"
           " dropped as duplicates" if stats["collisions"] else ""))
    log(f"  wrote          {len(terms)} terms, {len(kept)} offerings, "
        f"{len({o[4]['courseId'] for o in kept})} courses")
    if dropped:
        log(f"  excluded       {dropped} individualized offerings "
            "(CPT, TGR, independent study, clerkships)")
    if skipped:
        log(f"  omitted        {len(skipped)} future terms"
            + (f", holding {future_enrolled} already-registered students"
               if future_enrolled else ""))
    for label, n in (("files unreadable", stats["bad_files"]),
                     ("files repaired", stats["repaired_files"]),
                     ("classId collisions", stats["collisions"]),
                     ("same-code offerings, keyed apart by courseId",
                      stats["head_collisions"]),
                     ("contested partner codes, keyed apart by courseId",
                      stats["alias_collisions"]),
                     ("non-numeric values read as 0", stats["unparsed_numbers"]),
                     ("sections with an unrecognized term, skipped",
                      stats["bad_terms"])):
        if n:
            log(f"  {'warning':<14} {n} {label}")
    log("")
    return 0


if __name__ == "__main__":
    sys.exit(main())
