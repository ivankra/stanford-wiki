import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { load, mscsTags, render, type Doc, type Programs } from "./wiki.ts";

const doc = (path: string, fm: Doc["fm"]): Doc => ({ path, rel: path, fm, body: "", text: "" });
const course = doc("courses/CS 299.md", { type: "Course", code: "CS 299", cross_listed: ["STATS 299"] });
const progs: Programs = {
  program: doc("programs/MSCS.md", {
    type: "Program", breadth: { C: ["CS 299"], B: ["STATS 299"] },
    foundations: ["STATS 299"], si: ["CS 299"], excluded: ["CS 399"],
  }),
  specs: [
    doc("programs/MSCS Systems.md", { type: "Specialization", key: "systems", depth: { a: ["CS 299"] } }),
    doc("programs/MSCS AI.md", {
      type: "Specialization", key: "ai", depth: { c: ["CS 299*"], b: ["STATS 299"] }, approval: ["CS 299*"],
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
  assert.deepEqual(mscsTags(progs, { ...course, path: "courses/CS 299 (Spring 2019).md" }), []);
  assert.deepEqual(mscsTags({ specs: [] }, course), []);
});

test("build migrates inline and block fields, removes stale tags, preserves subjects and is idempotent", () => {
  const root = mkdtempSync(join(tmpdir(), "stanford-cs-tags-"));
  try {
    mkdirSync(join(root, "courses"));
    mkdirSync(join(root, "programs"));
    writeFileSync(join(root, "programs", "MSCS.md"),
      "---\ntype: Program\nsi: [CS 299]\n---\n");
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
    writeFileSync(join(root, "programs", "MSCS.md"), "---\ntype: Program\nsi: []\n---\n");
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
concluded: true
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
    assert.match(guide, /^concluded: true$/m);
    assert.match(guide, /^bytes: 123$/m);
    writeFileSync(join(root, "invalid.md"), '---\ntype: Guide\n  bad: indent\n---\n');
    const problems: string[] = [];
    assert.ok(!render(root, load(root), problems).has(join(root, "invalid.md")));
    assert.ok(problems.some(p => p.includes('invalid.md: frontmatter:')));
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});
