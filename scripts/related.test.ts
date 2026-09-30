import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";

const page = (code: string, related: string | null, extra = "") => [
  "---", "type: Course", `code: ${code}`, `title: "${code}: Test"`, "description: Test.",
  "level: graduate", 'term: Autumn 2026', "terms_offered:", "  - Autumn 2026", "instructors: []",
  'schedule: ""', 'units: "3"', "grading: Letter", "prerequisites: []",
  "access: unknown", "topics: []", "tags: []", "status: draft",
  "generated:", "  by: test", '  at: "2026-09-29T00:00:00Z"', "sources: []", "---",
  `# ${code}`, "", extra, ...(related === null ? [] : ["## Related", "", related]), "",
].join("\n");

function run(pages: Record<string, string>, ...args: string[]) {
  const root = mkdtempSync(join(tmpdir(), "stanford-cs-related-"));
  try {
    mkdirSync(join(root, "courses"));
    writeFileSync(join(root, "AGENTS.md"), "---\ntype: Scaffolding\ncurrent_term: Autumn 2026\n---\n");
    for (const [name, text] of Object.entries(pages)) writeFileSync(join(root, "courses", `${name}.md`), text);
    const r = spawnSync(process.execPath, [join(import.meta.dirname, "related.ts"), root, ...args], { encoding: "utf8" });
    assert.equal(r.status, 0, r.stderr);
    return r.stdout;
  } finally { rmSync(root, { recursive: true, force: true }); }
}

test("a reciprocated pair is not reported, a one-way link is", () => {
  const both = run({
    "CS 1": page("CS 1", "- [CS 2](CS%202.md): the other one."),
    "CS 2": page("CS 2", "- [CS 1](CS%201.md): the first one."),
  });
  assert.match(both, /0 one-way/);
  assert.doesNotMatch(both, /Missing backlinks/);

  const oneWay = run({
    "CS 1": page("CS 1", "- [CS 2](CS%202.md): the other one."),
    "CS 2": page("CS 2", "- [CS 3](CS%203.md): elsewhere."),
    "CS 3": page("CS 3", "- [CS 2](CS%202.md): back."),
  });
  assert.match(oneWay, /CS 2 - named by 1, names none back:/);
  assert.match(oneWay, /-> add to courses\/CS 2\.md: - \[CS 1\]\(CS%201\.md\)/);
});

// The section ran to the next heading or to end of input. `\Z` is not a JavaScript escape — it reads
// as a literal Z — so a Related section holding a capital Z was silently truncated there, and one
// that ended the file matched nothing at all and looked like a page with no section.
test("a Related section is read whole, including a capital Z and at end of file", () => {
  const out = run({
    "CS 1": page("CS 1", "- [CS 2](CS%202.md): uses Zoom.\n- [CS 3](CS%203.md): last line of the file."),
    "CS 2": page("CS 2", "- [CS 1](CS%201.md): back."),
    "CS 3": page("CS 3", "- [CS 1](CS%201.md): back."),
  });
  assert.match(out, /3 with a ## Related section, 4 links, 0 one-way/);
});

test("hubs and section-less targets are separated from the suggestions", () => {
  const namers = Object.fromEntries(
    [1, 2, 3, 4].map((i) => [`CS 1${i}`, page(`CS 1${i}`, "- [CS 9](CS%209.md): the hub.")]),
  );
  const out = run({ ...namers, "CS 9": page("CS 9", "- [CS 8](CS%208.md): unrelated."), "CS 8": page("CS 8", null) });
  assert.match(out, /Hubs \(named by more than 3[^\n]*\n\n  CS 9 - named by 4/);
  assert.doesNotMatch(out, /== Missing backlinks/);
  assert.match(out, /Named but has no ## Related section: 1 page\n\n  CS 8 - named by 1: CS 9/);

  // --hub moves the line, turning the same page into a suggestion.
  assert.match(run({ ...namers, "CS 9": page("CS 9", "- [CS 8](CS%208.md): unrelated."), "CS 8": page("CS 8", null) }, "--hub=9"),
    /== Missing backlinks[\s\S]*CS 9 - named by 4/);
});

test("a target that names the source outside Related is flagged as already mentioned", () => {
  const out = run({
    "CS 1": page("CS 1", "- [CS 2](CS%202.md): the other one."),
    "CS 2": page("CS 2", "- [CS 3](CS%203.md): elsewhere.", "Builds directly on [CS 1](CS%201.md)."),
    "CS 3": page("CS 3", "- [CS 2](CS%202.md): back."),
  });
  assert.match(out, /CS 1 \[already mentioned elsewhere on the page\]/);
});

test("pages that share rare topics but never mention each other are listed as similar", () => {
  const withTopics = (code: string, topics: string[], extra = "") =>
    page(code, "- [CS 9](CS%209.md): filler.", extra).replace("topics: []", `topics: [${topics.join(", ")}]`);
  const shared = ["photon mapping", "bidirectional path tracing", "participating media"];
  const pages = (extra: string) => ({
    "CS 1": withTopics("CS 1", [...shared, "ray tracing"]),
    "CS 2": withTopics("CS 2", [...shared, "radiometry"], extra),
    "CS 3": withTopics("CS 3", ["hash tables", "binary search trees"]),
    "CS 9": withTopics("CS 9", ["sorting"]),
    // Word weights are log(pages / pages using the word), so the pair needs a corpus around it to score.
    ...Object.fromEntries(Array.from({ length: 40 }, (_, i) => [`CS 5${i}`, withTopics(`CS 5${i}`, [`filler${i}`])])),
  });
  const out = run(pages(""));
  assert.match(out, /== Similar but never mention each other: 1 pair scoring 15\+\n\n +[\d.]+  CS 1 \| CS 2: /);
  assert.doesNotMatch(out, /CS 3 \|/);
  assert.match(run(pages("Builds on CS 1.")), /suggestions: .*; 0 similar unlinked pairs/);
});
