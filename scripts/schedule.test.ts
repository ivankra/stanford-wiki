import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";

test("build drops old schedules, preserves current ones, and lint requires the current-term key", () => {
  const root = mkdtempSync(join(tmpdir(), "stanford-cs-schedule-"));
  const run = (script: string) => spawnSync(process.execPath, [join(import.meta.dirname, script), root], { encoding: "utf8" });
  try {
    mkdirSync(join(root, "courses"));
    const guide = join(root, "AGENTS.md"), course = join(root, "courses", "CS 299.md");
    writeFileSync(guide, "---\ntype: Guide\ncurrent_term: Autumn 2026\n---\n");
    const page = (term: string, schedule: string) => `---
type: Course
code: CS 299
title: "CS 299: Test"
description: Test course.
level: graduate
term: ${term}
terms_offered: [${term}]
instructors: []
${schedule}units: "3"
grading: Letter
prerequisites: []
access: unknown
topics: []
tags: []
status: draft
generated: { by: codex/test, at: 2026-09-26T00:00:00Z }
sources: []
---
`;
    for (const term of ["Summer 2026", "Autumn 2026"]) {
      writeFileSync(course, page(term, "schedule: TR 13:30-14:50, CoDa B90\n"));
      assert.equal(run("build.ts").status, 0);
      assert.equal(/^schedule:/m.test(readFileSync(course, "utf8")), term === "Autumn 2026");
      const lint = run("lint.ts");
      assert.equal(lint.status, 0, lint.stdout + lint.stderr);
    }
    for (const schedule of ["", 'schedule: ""\n']) {
      writeFileSync(course, page("Autumn 2026", schedule));
      assert.equal(run("build.ts").status, 0);
      const lint = run("lint.ts");
      assert.equal(lint.status, schedule ? 0 : 1, lint.stdout + lint.stderr);
      if (!schedule) assert.match(lint.stdout, /schedule is required for the current term/);
    }
    writeFileSync(guide, "---\ntype: Guide\ncurrent_term: Winter 2027\n---\n");
    assert.equal(run("build.ts").status, 0);
    assert.doesNotMatch(readFileSync(course, "utf8"), /^schedule:/m);
    assert.equal(run("lint.ts").status, 0);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});
