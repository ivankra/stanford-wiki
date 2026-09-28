import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { load, marker, mscsTags, relatedProblems, render, type Doc, type Programs } from "./wiki.ts";

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
    assert.match(render(root, load(root)).get(path)!, /^tags:\n  - learning\n  - systems\nsources:/m);
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

test("Related sections: one-line bullets in course-code order, an optional table, file line numbers", () => {
  const page = (...related: string[]) => ["---", "type: Course", "---", "# X", "", "## Related", "", ...related, "", "## Source notes", ""].join("\n");
  assert.deepEqual(relatedProblems("---\ntype: Course\n---\n# X\n"), []);
  assert.deepEqual(relatedProblems(page(
    "- [CS 106A](a.md): a.", "- [CS 106AX](b.md): b.", "- [CS 106B](c.md): c.", "- CS 110: bare code.",
    "- [CS 1100](d.md): d.", "- [EE 180](e.md): e.", "", "| | A | B |", "| --- | --- | --- |",
  )), []);
  assert.deepEqual(relatedProblems(page("- [CS 110](a.md): a.", "- [CS 106B](b.md): b.", "- [CS 107](c.md): c.")),
    ["## Related list (lines 8-10) is not in course-code order; expected: CS 106B, CS 107, CS 110"]);
  assert.deepEqual(relatedProblems(page("- [CS 1](a.md): wrapped", "  onto a second line.", "- [CS 2](b.md): b.")),
    ['## Related list (lines 8-10): one bullet per line starting "- "; not a bullet: line 9']);
  assert.deepEqual(relatedProblems(page("- [CS 1](a.md): a.", "", "- [CS 2](b.md): b.")),
    ["## Related (lines 8-10): only one bullet list and an optional table; unexpected content at line 10"]);
  assert.deepEqual(relatedProblems(page("- [CS 1](a.md): a.", "- see the `CS 9` page, nothing else.")),
    ["## Related list (lines 8-9): line 9 names no course code"]);
  assert.deepEqual(relatedProblems(page()), ["## Related (line 6) is empty"]);
});

test("program tables show the sheet's code when it names a course only by a cross-listing", () => {
  const root = mkdtempSync(join(tmpdir(), "stanford-cs-sheet-codes-"));
  try {
    mkdirSync(join(root, "courses"));
    mkdirSync(join(root, "programs"));
    const body = `\n## Courses\n\n${marker("course-table")}\n\n## TODO\n\n${marker("missing-pages")}\n`;
    writeFileSync(join(root, "programs", "MSCS.md"), `---\ntype: Program\nmscs_breadth: { C: [EE 180, CS 107, STATS 9*] }\n---\n${body}`);
    writeFileSync(join(root, "programs", "MSCS AI.md"), `---\ntype: Specialization\nkey: ai\nmscs_depth: { a: [CS 180, EE 180] }\n---\n${body}`);
    const course = (code: string, cross = "") => `---\ntype: Course\ncode: ${code}\n${cross}terms_offered: []\n---\n`;
    writeFileSync(join(root, "courses", "CS 180.md"), course("CS 180", "cross_listed: [EE 180]\n"));
    writeFileSync(join(root, "courses", "CS 107.md"), course("CS 107", "cross_listed: [EE 107]\n"));
    writeFileSync(join(root, "courses", "CS 9.md"), course("CS 9", "cross_listed: [STATS 9A, STATS 9B]\n"));
    const out = render(root, load(root));
    const mscs = out.get(join(root, "programs", "MSCS.md"))!;
    const cell = (text: string) => new RegExp(`^\\| ${text.replace(/[[\]().|]/g, "\\$&").replace(/ /g, "\u00a0")} \\|`, "m");
    assert.match(mscs, cell("[CS 180](../courses/CS%20180.md)<br>EE 180"));
    assert.match(mscs, cell("[CS 9](../courses/CS%209.md)<br>STATS 9A<br>STATS 9B"));
    assert.match(mscs, cell("[CS 107](../courses/CS%20107.md)"));
    // This sheet names CS 180 by its own code as well, so only the link.
    assert.match(out.get(join(root, "programs", "MSCS AI.md"))!, cell("[CS 180](../courses/CS%20180.md)"));
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});
