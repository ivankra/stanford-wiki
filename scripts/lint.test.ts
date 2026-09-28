import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";

type Extra = { cross_listed?: string[]; prerequisites?: string[]; body?: string };
const page = (code: string, terms: string[], { cross_listed, prerequisites = [], body = "" }: Extra = {}) => [
  "---", "type: Course", `code: ${code}`, `title: "${code}: Test"`, "description: Test.",
  ...(cross_listed ? [`cross_listed: ${JSON.stringify(cross_listed)}`] : []),
  "level: graduate", `term: ${terms.at(-1)}`, "terms_offered:", ...terms.map((t) => `  - ${t}`), "instructors: []",
  'schedule: ""', 'units: "3"', "grading: Letter", `prerequisites: ${JSON.stringify(prerequisites)}`,
  "materials: { access: unknown }", "topics: []", "tags: []", "sources: []", "status: draft",
  "generated:", "  by: test", '  at: "2026-09-29T00:00:00Z"', "---", `# ${code}`, "", body, "",
].join("\n");

function lint(agents: string, pages: Record<string, string>) {
  const root = mkdtempSync(join(tmpdir(), "stanford-cs-lint-"));
  try {
    mkdirSync(join(root, "courses"));
    writeFileSync(join(root, "AGENTS.md"), `---\ntype: Scaffolding\n${agents}\n---\n`);
    for (const [name, text] of Object.entries(pages)) writeFileSync(join(root, "courses", `${name}.md`), text);
    const r = spawnSync(process.execPath, [join(import.meta.dirname, "lint.ts"), root], { encoding: "utf8" });
    assert.equal(r.stderr, "");
    return r.stdout;
  } finally { rmSync(root, { recursive: true, force: true }); }
}

test("terms_offered: no term before cutoff_term, with seasons in calendar order across the academic year", () => {
  const out = lint("current_term: Autumn 2026\ncutoff_term: Autumn 2019", {
    "CS 1": page("CS 1", ["Spring 2019", "Summer 2019", "Autumn 2019", "Winter 2020", "Spring 2020"]),
  });
  assert.match(out, /CS 1\.md: Spring 2019 is before cutoff_term Autumn 2019/);
  assert.match(out, /CS 1\.md: Summer 2019 is before cutoff_term Autumn 2019/);
  assert.doesNotMatch(out, /(Autumn 2019|Winter 2020|Spring 2020) is before cutoff_term/);
  assert.doesNotMatch(out, /AGENTS\.md: cutoff_term/);

  const winter = lint("current_term: Autumn 2026\ncutoff_term: Winter 2020", {
    "CS 1": page("CS 1", ["Autumn 2019", "Winter 2020"]),
  });
  assert.match(winter, /CS 1\.md: Autumn 2019 is before cutoff_term Winter 2020/);
  assert.doesNotMatch(winter, /Winter 2020 is before cutoff_term/);
});
test("prerequisites: every course with a page is linked from ## Prerequisites, a cross-listing via its page", () => {
  const t = ["Autumn 2026"];
  const out = lint("current_term: Autumn 2026", {
    "CS 1": page("CS 1", t, {
      prerequisites: ["CS 2 or STATS 3", "CS 4", "MATH 51", "CS 1 or CS 5"],
      body: "## Prerequisites\n\n- [CS 2](CS%202.md); CS 4 is named but not linked.\n\n## Related\n\n- [CS 4](CS%204.md): linked, but outside the section.",
    }),
    "CS 2": page("CS 2", t),
    "CS 3": page("CS 3", t, { cross_listed: ["STATS 3"] }),
    "CS 4": page("CS 4", t),
    "CS 6": page("CS 6", t, { prerequisites: ["CS 2"] }),
    "CS 7": page("CS 7", t, { prerequisites: ["STATS 3"], body: "## Prerequisites\n\n- Statistics: [STATS 3](CS%203.md)." }),
  });
  assert.match(out, /CS 1\.md: prerequisites names STATS 3, but ## Prerequisites doesn't link it: \[CS 3\]\(CS%203\.md\) \(STATS 3\)$/m);
  assert.match(out, /CS 1\.md: prerequisites names CS 4, but ## Prerequisites doesn't link it: \[CS 4\]\(CS%204\.md\)$/m);
  assert.match(out, /CS 6\.md: prerequisites names CS 2, but there is no ## Prerequisites section to link it from: \[CS 2\]\(CS%202\.md\)$/m);
  assert.doesNotMatch(out, /CS 1\.md: prerequisites names (CS 2|MATH 51|CS 1|CS 5),/);
  assert.doesNotMatch(out, /CS 7\.md: prerequisites names/);
});

test("cutoff_term must be a term name no later than current_term; absent means no floor", () => {
  const course = { "CS 1": page("CS 1", ["Spring 2015"]) };
  assert.match(lint("current_term: Autumn 2026\ncutoff_term: Fall 2019", course), /AGENTS\.md: cutoff_term "Fall 2019" must be a term name/);
  assert.match(lint("current_term: Autumn 2026\ncutoff_term: Winter 2027", course), /AGENTS\.md: cutoff_term "Winter 2027" must be a term name no later than current_term Autumn 2026/);
  assert.doesNotMatch(lint("current_term: Autumn 2026", course), /cutoff_term/);
});
