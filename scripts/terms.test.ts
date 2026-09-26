import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
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
      writeFileSync(join(root, "terms", "Autumn 2026.md"), `---\ntype: Term\n${dates}\nconcluded: false\n---\n\n${marker("course-table")}\n`);
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
