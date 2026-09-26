import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";

test("build and lint tolerate missing, empty and metadata-only reference subrepos", () => {
  const root = mkdtempSync(join(tmpdir(), "stanford-cs-references-"));
  const run = (script: string) => spawnSync(process.execPath, [join(import.meta.dirname, script), root], { encoding: "utf8" });
  try {
    mkdirSync(join(root, "courses"));
    writeFileSync(join(root, "AGENTS.md"), "---\ntype: Guide\n---\n");
    writeFileSync(join(root, "index.md"), "* [References](references/)\n");
    writeFileSync(join(root, "guide.md"), `---
type: Guide
sources:
  - { id: site, resource: https://example.com/, file: references/source.md }
  - { id: local, resource: references/source.md }
---
[Source](references/source.md)
[Reference directory](references/)
`);
    for (const state of ["missing", "empty", "metadata-only"]) {
      if (state === "empty") mkdirSync(join(root, "references"));
      if (state === "metadata-only") writeFileSync(join(root, "references", ".git"), "gitdir: ../../.git/modules/references\n");
      for (const script of ["build.ts", "lint.ts"]) {
        const result = run(script);
        assert.equal(result.status, 0, `${state}, ${script}: ${result.stdout}${result.stderr}`);
      }
    }
    // Other missing targets must still fail even when references are unavailable.
    writeFileSync(join(root, "index.md"), "* [Missing](references-other/missing.md)\n");
    let result = run("lint.ts");
    assert.equal(result.status, 1);
    assert.match(result.stdout, /broken link: references-other\/missing.md/);
    writeFileSync(join(root, "index.md"), "* [References](references/)\n");
    // Once an actual source is present, missing reference targets are checked again.
    writeFileSync(join(root, "references", "other.md"), "---\ntype: Source\n---\n");
    result = run("lint.ts");
    assert.equal(result.status, 1);
    assert.match(result.stdout, /broken link: references\/source.md/);
    assert.match(result.stdout, /source site: missing file references\/source.md/);
    assert.match(result.stdout, /source local: missing references\/source.md/);
    writeFileSync(join(root, "references", "source.md"), "---\ntype: Source\n---\n");
    assert.equal(run("lint.ts").status, 0);
    // There is no reference index, so a link to one is an ordinary broken link
    // once the references directory is present.
    writeFileSync(join(root, "index.md"), "* [References](references/index.md)\n");
    result = run("lint.ts");
    assert.equal(result.status, 1);
    assert.match(result.stdout, /broken link: references\/index.md/);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});
