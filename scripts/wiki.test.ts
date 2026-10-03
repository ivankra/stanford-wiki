import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { load, marker, mscsTags, obj, publicCell, publicIcon, publicLevel, relatedProblems, render, type Doc, type Programs, type Y } from "./wiki.ts";

// A table cell without its tooltip spans, so assertions read as the icons a reader sees.
const untip = (cell: string) => cell.replace(/<span title="[^"]*">([^<]*)<\/span>/g, "$1");
const doc = (path: string, fm: Doc["fm"]): Doc => ({ path, rel: path, fm, body: "", text: "" });
const course = doc("courses/CS 299.md", { type: "Course", code: "CS 299", cross_listed: ["STATS 299"] });
const progs: Programs = {
  program: doc("programs/MSCS.md", {
    type: "Program", mscs_breadth: { C: ["CS 299"], B: ["STATS 299"] },
    mscs_foundations: ["STATS 299"], mscs_si: ["CS 299"], mscs_excluded: ["CS 399"],
  }),
  specs: [
    doc("programs/MSCS Systems.md", { type: "Specialization", key: "systems", mscs_depth: { a: ["CS 299"] } }),
    doc("programs/MSCS AI.md", {
      type: "Specialization", key: "ai", mscs_depth: { c: ["CS 299*"], b: ["STATS 299"] }, mscs_approval: ["CS 299*"],
    }),
  ],
};

test("nested block maps and lists parse like equivalent flow YAML", () => {
  const root = mkdtempSync(join(tmpdir(), "stanford-cs-yaml-"));
  try {
    const flow = `type: Course
materials: { access: partial, syllabus: { access: open, url: https://example.com/#syllabus }, assignments: { access: closed }, sites: [{ url: https://example.com/, note: "slides, notes: public" }, { url: https://example.com/old, term: Spring 2022 }] }
sources: [{ id: site, resource: https://example.com/, title: "Course site" }]
generated: { by: codex/test, at: 2026-09-26T00:00:00Z }`;
    const nested = `type: Course
materials:
  access: partial
  syllabus:
    access: open
    url: https://example.com/#syllabus
  assignments:
    access: closed
  sites:
    - url: https://example.com/
      note: "slides, notes: public"
    - url: https://example.com/old
      term: Spring 2022
sources:
  - id: site
    resource: https://example.com/
    title: Course site
generated:
  by: codex/test
  at: 2026-09-26T00:00:00Z`;
    writeFileSync(join(root, "flow.md"), `---\n${flow}\n---\n`);
    writeFileSync(join(root, "nested.md"), `---\n${nested}\n---\n`);
    const docs = load(root);
    assert.ok(docs.every(d => !d.fmError), JSON.stringify(docs.map(d => d.fmError)));
    assert.deepEqual(docs[0].fm, docs[1].fm);
    assert.equal((docs[1].fm!.materials as Record<string, unknown>).access, "partial");
    writeFileSync(join(root, "bad.md"), "---\ntype: Course\nmaterials:\n  access: open\n    url: https://example.com/\n---\n");
    assert.match(load(root).find(d => d.rel === "bad.md")!.fmError!, /unexpected indentation/);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("tags cover cross-listings, wildcards, multiple categories and specialization approval in stable order", () => {
  assert.deepEqual(mscsTags(progs, course), [
    "mscs-breadth-B", "mscs-breadth-C", "mscs-foundation", "mscs-si",
    "mscs-ai-b", "mscs-ai-c", "mscs-ai-approval", "mscs-systems-a",
  ]);
  const excluded = doc("courses/CS 399.md", { type: "Registration", code: "CS 399", cross_listed: ["CS 299"] });
  assert.deepEqual(mscsTags(progs, excluded), ["mscs-excluded"]);
  // A former number matches like a cross-listing.
  const renumbered = doc("courses/CS 399ACE.md", { type: "Course", code: "CS 399ACE", formerly: ["CS 399"] });
  assert.deepEqual(mscsTags(progs, renumbered), ["mscs-excluded"]);
  assert.deepEqual(mscsTags(progs, { ...course, path: "courses/CS 299 (Spring 2019).md" }), []);
  assert.deepEqual(mscsTags({ specs: [] }, course), []);
});

test("build migrates inline and block fields, removes stale tags, preserves subjects and is idempotent", () => {
  const root = mkdtempSync(join(tmpdir(), "stanford-cs-tags-"));
  try {
    mkdirSync(join(root, "courses"));
    mkdirSync(join(root, "programs"));
    writeFileSync(join(root, "programs", "MSCS.md"),
      "---\ntype: Program\nmscs_si: [CS 299]\n---\n");
    const path = join(root, "courses", "CS 299.md");
    for (const type of ["Course", "Registration"]) {
      for (const fields of [
        "tags: [mscs-ai-c, learning, mscs-si, systems, mscs-si]\nmscs: { depth: { ai: c } }",
        "tags:\n  - mscs-ai-c\n  - learning\n  - systems\nmscs:\n  depth:\n    ai: c",
      ]) {
        writeFileSync(path, `---\ntype: ${type}\ncode: CS 299\n${fields}\nsources: []\n---\nKeep the body.\n`);
        const result = render(root, load(root)).get(path)!;
        assert.match(result, /^tags:\n  - learning\n  - systems\n  - mscs-si$/m);
        assert.doesNotMatch(result, /^mscs:/m);
        assert.match(result, /\nsources: \[\]\n---\nKeep the body\.\n$/);
        writeFileSync(path, result);
        assert.equal(render(root, load(root)).get(path), result);
      }
    }
    // Removing list membership must remove generated tags on the next build.
    writeFileSync(join(root, "programs", "MSCS.md"), "---\ntype: Program\nmscs_si: []\n---\n");
    assert.match(render(root, load(root)).get(path)!, /^tags:\n  - learning\n  - systems\naliases:\n  - CS299\nsources:/m);
    writeFileSync(path, readFileSync(path, "utf8").replace(/^tags:\n(?:  - .*\n)+/m, "tags: [mscs-si]\n"));
    assert.match(render(root, load(root)).get(path)!, /^tags: \[\]$/m);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("build canonicalizes every frontmatter block without changing values or bodies", () => {
  const root = mkdtempSync(join(tmpdir(), "stanford-cs-canonical-"));
  try {
    mkdirSync(join(root, "references"));
    writeFileSync(join(root, "guide.md"), `---
type: Guide
units: "3-5"
is_current_term: true
num_graduate: 42
bytes: 123
note: ${JSON.stringify('A "quote", a path C:\\tmp and a newline\nnext line')}
topics: ["true", "2026-09-26", "0.2", "#tag", "a: b", "", "[text]", " leading"]
sources: [{ id: catalog, resource: https://example.com/?a=b&c=d, title: "ExploreCourses, Summer 2026" }]
empty: {}
---
Body stays exactly as written.
`);
    writeFileSync(join(root, "references", "source.md"), '---\ntype: Source\ngenerated: { by: codex/test, at: 2026-09-26T00:00:00Z }\n---\nSource body.\n');
    writeFileSync(join(root, "index.md"), '---\nokf_version: "0.2"\n---\n# Index\n');
    writeFileSync(join(root, "plain.md"), 'No frontmatter.\n');
    const before = load(root);
    const rendered = render(root, before);
    for (const d of before) {
      if (!d.fm) { assert.ok(!rendered.has(d.path)); continue; }
      writeFileSync(d.path, rendered.get(d.path)!);
    }
    const after = load(root);
    for (const d of before) {
      const updated = after.find(a => a.path === d.path)!;
      assert.equal(updated.fmError, undefined);
      assert.deepEqual(updated.fm, d.fm);
      assert.equal(updated.body, d.body);
      if (d.fm) assert.equal(render(root, after).get(d.path), updated.text);
    }
    const guide = rendered.get(join(root, "guide.md"))!;
    assert.match(guide, /sources:\n  - id: catalog\n    resource: https:\/\/example.com\/\?a=b&c=d\n    title: ExploreCourses, Summer 2026/);
    assert.match(guide, /^units: "3-5"$/m);
    assert.match(guide, /^is_current_term: true$/m);
    assert.match(guide, /^num_graduate: 42$/m);
    assert.match(guide, /^bytes: 123$/m);
    writeFileSync(join(root, "invalid.md"), '---\ntype: Guide\n  bad: indent\n---\n');
    const problems: string[] = [];
    assert.ok(!render(root, load(root), problems).has(join(root, "invalid.md")));
    assert.ok(problems.some(p => p.includes('invalid.md: frontmatter:')));
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("Related sections: one-line bullets in course-code order, no tables, file line numbers", () => {
  const page = (...related: string[]) => ["---", "type: Course", "---", "# X", "", "## Related", "", ...related, "", "## Source notes", ""].join("\n");
  assert.deepEqual(relatedProblems("---\ntype: Course\n---\n# X\n"), []);
  assert.deepEqual(relatedProblems(page(
    "- [CS 106A](a.md): a.", "- [CS 106AX](b.md): b.", "- [CS 106B](c.md): c.", "- CS 110: bare code.",
    "- [CS 1100](d.md): d.", "- [EE 180](e.md): e.",
  )), []);
  assert.deepEqual(relatedProblems(page("- [CS 1](a.md): a.", "", "| | A | B |", "| --- | --- | --- |")),
    ["## Related (lines 8-11): no tables; say how each course differs in its own bullet (table at line 10)"]);
  assert.deepEqual(relatedProblems(page("- [CS 110](a.md): a.", "- [CS 106B](b.md): b.", "- [CS 107](c.md): c.")),
    ["## Related list (lines 8-10) is not in course-code order; expected: CS 106B, CS 107, CS 110"]);
  assert.deepEqual(relatedProblems(page("- [CS 1](a.md): wrapped", "  onto a second line.", "- [CS 2](b.md): b.")),
    ['## Related list (lines 8-10): one bullet per line starting "- "; not a bullet: line 9']);
  assert.deepEqual(relatedProblems(page("- [CS 1](a.md): a.", "", "- [CS 2](b.md): b.")),
    ["## Related (lines 8-10): only one bullet list; unexpected content at line 10"]);
  assert.deepEqual(relatedProblems(page("- [CS 1](a.md): a.", "- see the `CS 9` page, nothing else.")),
    ["## Related list (lines 8-9): line 9 names no course code"]);
  assert.deepEqual(relatedProblems(page()), ["## Related (line 6) is empty"]);  // External entries: marked after the link, last, in title order, no code needed.
  const zth = "- [Zero to Hero](https://example.com/z) *(external)*: A. Author's language models by hand.";
  const fast = "- [fast.ai](https://example.com/f) *(external)*: practical deep learning.";
  assert.deepEqual(relatedProblems(page("- [CS 1](a.md): a.", fast, zth)), []);
  assert.deepEqual(relatedProblems(page("- [CS 1](a.md): a.", zth, fast)),
    ["## Related list (lines 8-10): external entries are not in title order; expected: fast.ai, Zero to Hero"]);
  assert.deepEqual(relatedProblems(page(zth, "- [CS 1](a.md): a.")),
    ["## Related list (lines 8-9): line 9 is a course after an external entry; external entries go last"]);
  assert.deepEqual(relatedProblems(page("- [CS 1](a.md): a.", "- [Zero to Hero](https://example.com/z): unmarked.")),
    ['## Related list (lines 8-9): line 9 looks external; write it as "- [Title](https://…) *(external)*: …"']);
  assert.deepEqual(relatedProblems(page("- [CS 1](a.md): a.", "- [CS 2](b.md) *(external)*: a page is never external.")),
    ['## Related list (lines 8-9): line 9 looks external; write it as "- [Title](https://…) *(external)*: …"']);
});

test("program tables show the sheet's code when it names a course only by a cross-listing; MSCS.md lists depth-only courses", () => {
  const root = mkdtempSync(join(tmpdir(), "stanford-cs-sheet-codes-"));
  try {
    mkdirSync(join(root, "courses"));
    mkdirSync(join(root, "programs"));
    const body = `\n## Courses\n\n${marker("course-table")}\n\n## TODO\n\n${marker("missing-pages")}\n`;
    writeFileSync(join(root, "programs", "MSCS.md"), `---\ntype: Program\nmscs_breadth: { C: [EE 180, CS 107, STATS 9*] }\n---\n${body}`);
    writeFileSync(join(root, "programs", "MSCS AI.md"), `---\ntype: Specialization\nkey: ai\nmscs_depth: { a: [CS 180, EE 180, EE 5] }\n---\n${body}`);
    const course = (code: string, cross = "") => `---\ntype: Course\ncode: ${code}\n${cross}terms_offered: []\n---\n`;
    writeFileSync(join(root, "courses", "CS 180.md"), course("CS 180", "cross_listed: [EE 180]\n"));
    writeFileSync(join(root, "courses", "CS 107.md"), course("CS 107", "cross_listed: [EE 107]\n"));
    writeFileSync(join(root, "courses", "CS 9.md"), course("CS 9", "cross_listed: [STATS 9A, STATS 9B]\n"));
    writeFileSync(join(root, "courses", "CS 5.md"), course("CS 5", "cross_listed: [EE 5]\n"));
    const out = render(root, load(root));
    const mscs = out.get(join(root, "programs", "MSCS.md"))!;
    const cell = (text: string) => new RegExp(`^\\| ${text.replace(/[[\]().|]/g, "\\$&").replace(/ /g, "\u00a0")} \\|`, "m");
    assert.match(mscs, cell("[CS 180](../courses/CS%20180.md)<br>EE 180"));
    assert.match(mscs, cell("[CS 9](../courses/CS%209.md)<br>STATS 9A<br>STATS 9B"));
    assert.match(mscs, cell("[CS 107](../courses/CS%20107.md)"));
    // A depth-only course is on MSCS.md too, with a blank Breadth cell.
    assert.match(mscs, /^\| \[CS\u00a05\]\(\.\.\/courses\/CS%205\.md\)<br>EE\u00a05 \| \| \| \|/m);
    // This sheet names CS 180 by its own code as well, so only the link.
    assert.match(out.get(join(root, "programs", "MSCS AI.md"))!, cell("[CS 180](../courses/CS%20180.md)"));
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("the roster and program tables mark a course 🆕 after its first code when its first term is among the last 4", () => {
  const root = mkdtempSync(join(tmpdir(), "stanford-cs-fresh-"));
  try {
    for (const dir of ["courses", "programs"]) mkdirSync(join(root, dir));
    writeFileSync(join(root, "AGENTS.md"), "---\ntype: Scaffolding\ncurrent_term: Autumn 2026\ncutoff_term: Winter 2020\n---\n");
    const body = `\n## Courses\n\n${marker("course-table")}\n\n## TODO\n\n${marker("missing-pages")}\n`;
    writeFileSync(join(root, "programs", "MSCS.md"), `---\ntype: Program\nmscs_breadth: { C: [CS 1, EE 2, CS 3, CS 4] }\n---\n${body}`);
    const course = (code: string, terms: string, cross = "") =>
      `---\ntype: Course\ncode: ${code}\ntitle: "${code}: T"\n${cross}term: Autumn 2026\nterms_offered: ${terms}\n---\n`;
    writeFileSync(join(root, "courses", "CS 1.md"), course("CS 1", "[Autumn 2026]"));
    writeFileSync(join(root, "courses", "CS 2.md"), course("CS 2", "[Autumn 2026]", "cross_listed: [EE 2]\n"));
    writeFileSync(join(root, "courses", "CS 3.md"), course("CS 3", "[Spring 2026, Autumn 2026]"));
    writeFileSync(join(root, "courses", "CS 4.md"), course("CS 4", "[Autumn 2025, Autumn 2026]"));
    const out = render(root, load(root));
    // The Course and Title cells of a code's row; roster links are relative to courses/, program links aren't.
    const first = (path: string, code: string) => out.get(join(root, path))!.split("\n")
      .find((l) => l.includes(`${encodeURIComponent(code)}.md)`))!.split("|").slice(1, 3).map((c) => untip(c.trim()));
    assert.deepEqual(first("courses/index.md", "CS 1"), ["[CS\u00a01](CS%201.md)\u00a0🆕", "T"]);
    assert.deepEqual(first("courses/index.md", "CS 3"), ["[CS\u00a03](CS%203.md)\u00a0🆕", "T"]);
    assert.deepEqual(first("courses/index.md", "CS 4"), ["[CS\u00a04](CS%204.md)", "T"]);
    // Only the first code gets the mark; the cross-listed one follows it.
    assert.deepEqual(first("programs/MSCS.md", "CS 2"), ["[CS\u00a02](../courses/CS%202.md)\u00a0🆕<br>EE\u00a02", "T"]);
    assert.deepEqual(first("programs/MSCS.md", "CS 3"), ["[CS\u00a03](../courses/CS%203.md)\u00a0🆕", "T"]);
    assert.deepEqual(first("programs/MSCS.md", "CS 4"), ["[CS\u00a04](../courses/CS%204.md)", "T"]);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

// ---------- the flat schema (.agents/2026-09-30.materials.md §7, §9.3) ----------

test("Public column: one normalizer for both shapes; legacy pages show ?; 🅰 for open assignments; ✚ only on open and mostly-open with self_study", () => {
  const ss = [{ url: "https://example.com/", note: "a public leaderboard" }];
  const icon = (fm: Record<string, Y>) => publicIcon({ type: "Course", ...fm });
  // TEMPORARY: a legacy page's old level, mapped down, with a "?".
  assert.deepEqual(["open", "partial", "closed", "unknown"].map((access) => icon({ materials: { access } })), ["🟢?", "🟡?", "⛔?", ""]);
  assert.deepEqual(publicLevel({ type: "Course", materials: { access: "open" } }), { level: "open", legacy: true, assignments: false, selfStudy: false, access: "", videos: false });
  const v = "https://example.com/v";
  assert.deepEqual(["open", "mostly-open", "partial", "mostly-closed", "closed", "unknown"].map((access) => icon({ access, videos: v })),
    ["✅", "✅", "🟡", "🔴", "⛔", ""]);
  assert.deepEqual(["open", "mostly-open", "partial", "mostly-closed", "closed", "unknown"].map((access) => icon({ access, videos: v, self_study: ss })),
    ["✅✚", "✅✚", "🟡", "🔴", "⛔", ""]);
  assert.equal(icon({ access: "mostly-open", past: { "Spring 2025": { self_study: ss } } }), "🟢✚");
  assert.equal(icon({ access: "open", videos: v, past: { "Spring 2025": { instructors: [] } } }), "✅");
  // Open and mostly-open share one icon pair, decided by videos: ✅ with open videos (top level or in past),
  // 🟢 without. Both levels, both ways; the hover keeps `access` readable.
  for (const access of ["open", "mostly-open"]) {
    assert.equal(icon({ access, past: { "Spring 2025": { videos: { access: "open", url: v } } } }), "✅");
    for (const videos of [undefined, "none", "closed", { access: "partial", url: v }])
      assert.equal(icon({ access, videos, self_study: ss }), "🟢✚");
  }
  assert.equal(publicCell({ type: "Course", access: "open", videos: "none" }), '<span title="open">🟢</span>');
  assert.equal(publicCell({ type: "Course", access: "open", videos: v }), '<span title="open, videos available">✅</span>');
  assert.equal(publicCell({ type: "Course", access: "mostly-open", videos: "none" }), '<span title="mostly open">🟢</span>');
  assert.equal(publicCell({ type: "Course", access: "mostly-open", videos: v }), '<span title="mostly open, videos available">✅</span>');
  // 🅰: assignments open at the top level or in past, in any shape, on any level; before ✚.
  for (const assignments of ["https://example.com/", ["https://example.com/"], { access: "open" }, "open"])
    assert.equal(icon({ access: "partial", assignments }), "🟡🅰");
  for (const assignments of ["closed", "none", { access: "partial", url: "https://example.com/" }, []])
    assert.equal(icon({ access: "partial", assignments }), "🟡");
  assert.equal(icon({ access: "closed", past: { "Spring 2025": { assignments: "https://example.com/" } } }), "⛔🅰");
  assert.equal(icon({ access: "open", videos: v, assignments: "https://example.com/", self_study: ss }), "✅🅰✚");
  assert.equal(icon({ materials: { access: "open", assignments: "https://example.com/" } }), "🟢?");
  assert.equal(publicIcon({ type: "Registration", code: "CS 1" }), "");
  // A diverged older offering's open videos and assignments don't count.
  const old = (rec: Record<string, Y>) => icon({ access: "open", past: { "Spring 2020": rec } });
  assert.equal(old({ videos: "https://example.com/v", assignments: "https://example.com/a" }), icon({ access: "open", videos: "https://example.com/v", assignments: "https://example.com/a" }));
  assert.equal(old({ diverged: "a different curriculum", videos: "https://example.com/v", assignments: "https://example.com/a" }), icon({ access: "open" }));
  // The latest diverged offering cuts off everything before it too; later offerings still count.
  const vids = { videos: "https://example.com/v" };
  assert.equal(icon({ access: "open", past: { "Spring 2018": vids, "Spring 2019": { diverged: "older syllabus" } } }), icon({ access: "open" }));
  assert.equal(icon({ access: "open", past: { "Spring 2019": { diverged: "older syllabus" }, "Spring 2020": vids } }), icon({ access: "open", videos: "https://example.com/v" }));
  // The tables wrap each icon in a hover tip; a legacy icon gets one span naming its old level.
  assert.equal(publicCell({ type: "Course", access: "partial", assignments: "https://example.com/" }),
    '<span title="partial">🟡</span><span title="assignments public">🅰</span>');
  assert.equal(publicCell({ type: "Course", materials: { access: "open" } }), '<span title="not yet rerated; old rating: open">🟢?</span>');
  assert.equal(publicCell({ type: "Course", access: "unknown" }), "");
});

// A bundle with term pages and course pages; returns the rendered text of every file.
function bundle(courses: Record<string, string>, terms: string[]) {
  const root = mkdtempSync(join(tmpdir(), "stanford-cs-rows-"));
  try {
    for (const dir of ["courses", "terms"]) mkdirSync(join(root, dir));
    writeFileSync(join(root, "AGENTS.md"), "---\ntype: Scaffolding\ncurrent_term: Autumn 2026\ncutoff_term: Winter 2020\n---\n");
    for (const t of terms) writeFileSync(join(root, "terms", `${t}.md`), `---\ntype: Term\n---\n\n${marker("course-table")}\n`);
    for (const [code, fm] of Object.entries(courses)) writeFileSync(join(root, "courses", `${code}.md`), `---\n${fm}\n---\n# ${code}\n`);
    const out = render(root, load(root));
    return (path: string) => out.get(join(root, path))!;
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
}
// A course's row in a term table, as its cells: the course link, title, professor, and the rest.
const row = (table: string, code: string) =>
  table.split("\n").find((l) => l.includes(`(../courses/${encodeURIComponent(code)}.md)`))!
    .split("|").slice(1, -1).map((c) => untip(c.trim()));
// The cells after the course link.
const cells = (table: string, code: string) => row(table, code).slice(1);

test("historical rows take their professor and title from past; blank professor when instructors is [] or the record is missing", () => {
  const terms = ["Spring 2025", "Winter 2026", "Spring 2026", "Autumn 2026"];
  const file = bundle({
    "CS 1": `type: Course\ncode: CS 1\ntitle: "CS 1: New Title"\nterm: Autumn 2026\nterms_offered: ${JSON.stringify(terms)}\n`
      + `instructors: ["New, A.", "Other, B."]\nschedule: "TR 10:30-11:50, Gates B1"\naccess: open\nvideos: https://example.com/v\n`
      + `past:\n  Spring 2025:\n    title: Old Title\n    instructors: ["Old, C."]\n  Winter 2026:\n    instructors: []`,
    // TEMPORARY: a legacy page has no past, so its older rows name nobody rather than the current instructor.
    "CS 2": `type: Course\ncode: CS 2\ntitle: "CS 2: Legacy"\nterm: Autumn 2026\nterms_offered: [Spring 2026, Autumn 2026]\n`
      + `instructors: ["Legacy, D."]\nschedule: ""\nmaterials: { access: partial }`,
  }, terms);
  assert.deepEqual(cells(file("terms/Autumn 2026.md"), "CS 1"), ["New Title", "New", "TR", "", "✅"]);
  assert.deepEqual(cells(file("terms/Spring 2025.md"), "CS 1"), ["Old Title", "Old", "", "✅"]);
  assert.deepEqual(cells(file("terms/Winter 2026.md"), "CS 1"), ["New Title", "", "", "✅"]);
  assert.deepEqual(cells(file("terms/Spring 2026.md"), "CS 1"), ["New Title", "", "", "✅"]);
  assert.deepEqual(cells(file("terms/Autumn 2026.md"), "CS 2"), ["Legacy", "Legacy", "", "", "🟡?"]);
  assert.deepEqual(cells(file("terms/Spring 2026.md"), "CS 2"), ["Legacy", "", "", "🟡?"]);
  assert.match(row(file("terms/Spring 2025.md"), "CS 1")[0], /\u00a0🆕$/);
  assert.match(row(file("terms/Spring 2026.md"), "CS 2")[0], /\u00a0🆕$/);
  assert.doesNotMatch(row(file("terms/Autumn 2026.md"), "CS 2")[0], /🆕/);
});

test("a course's first term gets a 🆕 after its code, from 2 years after cutoff_term (Winter 2020) on", () => {
  const terms = ["Autumn 2021", "Winter 2022", "Spring 2022"];
  const file = bundle({
    "CS 1": `type: Course\ncode: CS 1\ntitle: "CS 1: Old"\nterm: Winter 2022\nterms_offered: [Autumn 2021, Winter 2022]\ninstructors: []\naccess: open`,
    "CS 2": `type: Course\ncode: CS 2\ntitle: "CS 2: New"\nterm: Spring 2022\nterms_offered: [Winter 2022, Spring 2022]\ninstructors: []\naccess: open`,
  }, terms);
  const isNew = (t: string, code: string) => row(file(`terms/${t}.md`), code)[0].endsWith("\u00a0🆕");
  assert.ok(!isNew("Autumn 2021", "CS 1"));
  assert.ok(!isNew("Winter 2022", "CS 1"));
  assert.ok(isNew("Winter 2022", "CS 2"));
  assert.ok(!isNew("Spring 2022", "CS 2"));
  assert.equal(row(file("terms/Winter 2022.md"), "CS 2")[0], "[CS\u00a02](../courses/CS%202.md)\u00a0🆕");
  assert.ok(file("terms/Winter 2022.md").includes('<span title="first offered Winter 2022">🆕</span>'));
});

test("build sorts course and registration keys, past terms oldest first and each record's keys; legacy pages keep their order", () => {
  const file = bundle({
    "CS 1": `sources: []\ntype: Course\npast:\n  Spring 2026:\n    slides: open\n    instructors: []\n  Autumn 2018:\n    slides: open\n`
      + `  Spring 2025:\n    topics: [a]\n    title: Old\n    instructors: ["Old, C."]\n    homepage: https://example.com/\n`
      + `access: open\ncode: CS 1\nexceptions: { pre_cutoff: reason }\nchecked: "2026-09-01"\nself_study: [{ url: https://example.com/, note: evidence }]\nrepo: open\nsyllabus: open\nterm: Autumn 2026`,
    "CS 2": `type: Course\nsources: []\ncode: CS 2\nmaterials: { sites: [], code: open, access: open, checked: "2026-09-01" }\nterm: Autumn 2026`,
    "CS 3": `type: Registration\nsources: []\ngenerated: { by: test, at: "2026-09-29T00:00:00Z" }\ncode: CS 3\ntags: []`,
  }, []);
  const fm = (path: string) => file(path).split("---\n")[1];
  assert.equal(fm("courses/CS 1.md"), [
    "type: Course", "code: CS 1", "term: Autumn 2026", "access: open", "syllabus: open", "repo: open",
    "self_study:", "  - url: https://example.com/", "    note: evidence",
    "past:", "  Autumn 2018:", "    slides: open",
    "  Spring 2025:", "    title: Old", "    instructors:", "      - Old, C.", "    homepage: https://example.com/", "    topics:", "      - a",
    "  Spring 2026:", "    instructors: []", "    slides: open",
    "tags: []", "aliases:", "  - CS1", 'checked: "2026-09-01"', "exceptions:", "  pre_cutoff: reason", "sources: []", "",
  ].join("\n"));
  assert.equal(fm("courses/CS 2.md"), [
    "type: Course", "sources: []", "code: CS 2",
    "materials:", '  checked: "2026-09-01"', "  access: open", "  code: open", "  sites: []",
    "term: Autumn 2026", "tags: []", "aliases:", "  - CS2", "",
  ].join("\n"));
  assert.equal(fm("courses/CS 3.md"), ["type: Registration", "code: CS 3", "tags: []", "aliases:", "  - CS3", "generated:", "  by: test", '  at: "2026-09-29T00:00:00Z"', "sources: []", ""].join("\n"));
});

test("rollover: after the snapshot, past holds the outgoing offering and its row keeps its own professor and title", () => {
  const terms = ["Spring 2026", "Autumn 2026"];
  const base = 'code: CS 1\ndescription: Test.\nlevel: graduate\nunits: "3"\ngrading: Letter\nprerequisites: []\ntopics: []\ntags: []\n'
    + 'status: draft\ngenerated: { by: test, at: "2026-09-29T00:00:00Z" }\nsources: []\n';
  const url = "https://example.com/";
  // Spring 2026 was the page's offering; AGENTS.md → Past offerings → Moving to a newer offering, in order.
  const before = `type: Course\n${base}title: "CS 1: Spring Title"\nterm: Spring 2026\nterms_offered: [Spring 2026]\ninstructors: ["Spring, A."]\n`
    + `homepage: ${url}\naccess: open\nslides: ${url}\nvideos: ${url}v\nsites: [{ url: ${url}s }]\nself_study: [{ url: ${url}l, note: n }]\ntextbook: Book\nchecked: "2026-09-29"`;
  const after = `type: Course\n${base}title: "CS 1: Autumn Title"\nterm: Autumn 2026\nterms_offered: ${JSON.stringify(terms)}\n`
    + `instructors: ["Autumn, B."]\nschedule: ""\naccess: open\nchecked: "2026-09-29"\npast:\n  Spring 2026:\n    title: Spring Title\n`
    + `    instructors: ["Spring, A."]\n    homepage: ${url}\n    slides: ${url}\n    videos: ${url}v\n    sites: [{ url: ${url}s }]\n    self_study: [{ url: ${url}l, note: n }]\n    textbook: Book`;
  const root = mkdtempSync(join(tmpdir(), "stanford-cs-rollover-"));
  try {
    for (const dir of ["courses", "terms"]) mkdirSync(join(root, dir));
    writeFileSync(join(root, "AGENTS.md"), "---\ntype: Scaffolding\ncurrent_term: Autumn 2026\ncutoff_term: Winter 2020\n---\n");
    for (const t of terms) writeFileSync(join(root, "terms", `${t}.md`), `---\ntype: Term\nstart_date: "2020-01-06"\nend_date: "2099-01-01"\n---\n\n${marker("course-table")}\n`);
    const path = join(root, "courses", "CS 1.md");
    const lint = () => spawnSync(process.execPath, [join(import.meta.dirname, "lint.ts"), root], { encoding: "utf8" }).stdout;
    // Write the page's frontmatter, build, and return what build left.
    const write = (fm: string) => {
      writeFileSync(path, `---\n${fm}\n---\n# CS 1\n\n## Syllabus\n\n- Week 1.\n`);
      for (const [p, text] of render(root, load(root))) writeFileSync(p, text);
      return load(root).find((d) => d.path === path)!.fm!;
    };
    const old = write(before);
    const fm = write(after);
    assert.doesNotMatch(lint(), /courses\/CS 1\.md/);
    // Everything observed for Spring 2026 moved into its record, unchanged, and nothing of it is left on top.
    for (const k of ["homepage", "slides", "videos", "sites", "self_study", "textbook"]) {
      assert.deepEqual(obj(obj(fm.past)!["Spring 2026"])![k], old[k], k);
      assert.ok(!(k in fm), k);
    }
    const rows = (t: string) => cells(readFileSync(join(root, "terms", `${t}.md`), "utf8"), "CS 1");
    assert.deepEqual(rows("Spring 2026"), ["Spring Title", "Spring", "", "✅✚"]);
    assert.deepEqual(rows("Autumn 2026"), ["Autumn Title", "Autumn", "", "", "✅✚"]);
    // Skipping the snapshot leaves the old row without its professor, and lint says so.
    write(after.replace(/\npast:[\s\S]*$/, ""));
    assert.match(lint(), /courses\/CS 1\.md: past\.Spring 2026\.instructors is missing/);
    // and, with no open videos left anywhere, the tables cap the open page at 🟢.
    assert.deepEqual(rows("Spring 2026"), ["Autumn Title", "", "", "🟢"]);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});
