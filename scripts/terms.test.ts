import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { marker } from "./wiki.ts";

test("term dates are required, valid ISO calendar dates and ordered", () => {
  const root = mkdtempSync(join(tmpdir(), "stanford-cs-term-dates-"));
  const run = (script: string) => spawnSync(process.execPath, [join(import.meta.dirname, script), root], { encoding: "utf8" });
  try {
    mkdirSync(join(root, "courses"));
    mkdirSync(join(root, "terms"));
    writeFileSync(join(root, "AGENTS.md"), "---\ntype: Guide\ncurrent_term: Autumn 2026\n---\n");
    for (const [dates, error] of [
      ['start_date: "2026-09-22"\nend_date: "2026-12-11"', ""],
      ['end_date: "2026-12-11"', "start_date must be a valid date"],
      ['start_date: "2026-09-22"', "end_date must be a valid date"],
      ['start_date: "2026-9-22"\nend_date: "2026-12-11"', "start_date must be a valid date"],
      ['start_date: "2026-02-30"\nend_date: "2026-12-11"', "start_date must be a valid date"],
      ['start_date: "2026-12-12"\nend_date: "2026-12-11"', "start_date must be on or before end_date"],
    ]) {
      writeFileSync(join(root, "terms", "Autumn 2026.md"), `---\ntype: Term\n${dates}\n---\n\n${marker("course-table")}\n`);
      const build = run("build.ts");
      assert.equal(build.status, 0, build.stderr);
      const lint = run("lint.ts");
      assert.equal(lint.status, error ? 1 : 0, lint.stdout + lint.stderr);
      if (error) assert.ok(lint.stdout.includes(error), lint.stdout);
    }
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("build writes is_current_term and the level counts, drops concluded, and orders term keys", () => {
  const root = mkdtempSync(join(tmpdir(), "stanford-cs-term-keys-"));
  const course = (code: string, level: string, terms: string[]) =>
    `---\ntype: Course\ncode: ${code}\nlevel: ${level}\nterm: ${terms.at(-1)}\nterms_offered: ${JSON.stringify(terms)}\nmaterials: { access: unknown }\n---\n`;
  try {
    mkdirSync(join(root, "courses"));
    mkdirSync(join(root, "terms"));
    writeFileSync(join(root, "AGENTS.md"), "---\ntype: Guide\ncurrent_term: Autumn 2026\n---\n");
    writeFileSync(join(root, "courses", "CS 1.md"), course("CS 1", "undergraduate", ["Spring 2026", "Autumn 2026"]));
    writeFileSync(join(root, "courses", "CS 2.md"), course("CS 2", "graduate", ["Autumn 2026"]));
    writeFileSync(join(root, "courses", "CS 3.md"), course("CS 3", "graduate", ["Autumn 2026"]));
    writeFileSync(join(root, "courses", "CS 4.md"), "---\ntype: Registration\ncode: CS 4\nlevel: graduate\n---\n");
    // Keys deliberately out of order, with the old `concluded` and one key the order doesn't know.
    const page = (extra: string) => `---\nsources: []\nextra: kept\n${extra}academic_year: "2025-2026"\nend_date: "2026-06-10"\nstart_date: "2026-03-30"\ntype: Term\ntitle: X\n---\n\n${marker("course-table")}\n`;
    writeFileSync(join(root, "terms", "Autumn 2026.md"), page("concluded: true\n"));
    writeFileSync(join(root, "terms", "Spring 2026.md"), page("is_current_term: true\n"));
    const build = spawnSync(process.execPath, [join(import.meta.dirname, "build.ts"), root], { encoding: "utf8" });
    assert.equal(build.status, 0, build.stderr);
    const fm = (term: string) => readFileSync(join(root, "terms", `${term}.md`), "utf8").split("---\n")[1];
    assert.equal(fm("Autumn 2026"), 'type: Term\ntitle: X\nacademic_year: "2025-2026"\nstart_date: "2026-03-30"\nend_date: "2026-06-10"\n'
      + "is_current_term: true\nnum_undergraduate: 1\nnum_graduate: 2\nsources: []\nextra: kept\n");
    assert.match(fm("Spring 2026"), /^end_date: "2026-06-10"\nnum_undergraduate: 1\nnum_graduate: 0\n/m);
    assert.doesNotMatch(fm("Spring 2026"), /is_current_term/);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});
