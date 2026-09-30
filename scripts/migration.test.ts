// TEMPORARY: acceptance tests for the migration helper, .agents/2026-09-30.materials.ts (design §10.6).
// Remove with the helper once no legacy page is left (§10.5).
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { yamlLines, type Y } from "./wiki.ts";
import { loadCatalog, loadRepository, migrate, type Catalog, type Repository } from "../.agents/2026-09-30.materials.ts";

type Fm = Record<string, Y>;
const HELPER = join(import.meta.dirname, "..", ".agents", "2026-09-30.materials.ts");
const legacy = (fm: Fm): Fm => ({
  type: "Course", code: "CS 9", title: "CS 9: Current Title", description: "Test.", level: "graduate",
  term: "Spring 2026", terms_offered: ["Spring 2026"], instructors: ["Now, A."], units: "3", grading: "Letter",
  prerequisites: [], homepage: "https://cs9.example/", ...fm,
  topics: [], tags: [], sources: [], status: "draft", generated: { by: "test", at: "2026-09-29T00:00:00Z" },
});
// Every older offering is in the catalog under the page's own title, taught by one PI.
const catalog: Catalog = () => ({ title: "Current Title", instructors: ["Then, B."], file: "explorecourses-cs-2024-2025.md", resource: "https://catalog.example/" });
// No syllabus repository listing at all, so the tests above the repository one stay independent of it.
const noRepo: Repository = () => null;
const urls = (v: Y): string[] => (typeof v === "string" ? (/^https?:/.test(v) ? [v] : []) : Object.values(v).flatMap(urls));

test("attribution: types go to their own term, else materials.term, else the page's; sites to their own term, else the page's", () => {
  const materials: Fm = {
    checked: "2026-09-01", access: "partial", term: "Autumn 2025",
    syllabus: { access: "open", url: "https://s.example/", note: "the sheet" },
    slides: { access: "open", url: "https://d.example/", term: "Spring 2025", note: "decks" },
    videos: { access: "closed", term: "Spring 2026", note: "Canvas only" },
    projects: "none",
    code: { access: "open", url: ["https://g.example/a", "https://g.example/b"] },
    sites: [{ url: "https://a.example/" }, { url: "https://b.example/", term: "Spring 2025", note: "the old site" }],
  };
  const page = legacy({ terms_offered: ["Spring 2025", "Autumn 2025", "Spring 2026"], materials });
  const { fm } = migrate(page, catalog, noRepo);
  assert.ok(!("materials" in fm) && !("access" in fm));
  assert.equal(fm.checked, "2026-09-01");
  assert.deepEqual(fm.videos, { access: "closed", note: "Canvas only" });
  // A site never inherits materials.term: this one is the current offering's.
  assert.deepEqual(fm.sites, [{ url: "https://a.example/" }]);
  assert.deepEqual(fm.past, {
    "Spring 2025": {
      instructors: ["Then, B."], slides: { access: "open", url: "https://d.example/", note: "decks" },
      sites: [{ url: "https://b.example/", note: "the old site" }],
    },
    "Autumn 2025": {
      instructors: ["Then, B."], syllabus: { access: "open", url: "https://s.example/", note: "the sheet" },
      projects: "none", repo: { access: "open", url: ["https://g.example/a", "https://g.example/b"] },
    },
  });
  // Nothing dropped: every URL comes through once.
  assert.deepEqual(urls(fm).filter((u) => !u.includes("catalog")).sort(), [...urls(page)].sort());

  // Without materials.term, every undated type is the page's own offering.
  const { fm: flat } = migrate(legacy({ materials: { ...materials, term: "" } as Fm }), catalog, noRepo);
  for (const k of ["syllabus", "projects", "repo", "videos"]) assert.ok(k in flat, k);
  assert.deepEqual(Object.keys(flat.past as Fm), ["Spring 2025"]);
});

test("reruns: the helper refuses anything but a complete legacy page, leaving it byte-identical; a second run changes nothing", () => {
  const dir = mkdtempSync(join(tmpdir(), "stanford-cs-helper-"));
  const run = (path: string) => spawnSync(process.execPath, [HELPER, "--no-links", path], { encoding: "utf8" });
  try {
    const path = join(dir, "CS 9.md");
    writeFileSync(path, `---\n${yamlLines(legacy({ materials: { access: "open", checked: "2026-09-01", slides: "https://d.example/" } })).join("\n")}\n---\n# CS 9\n\nProse.\n`);
    const first = run(path);
    assert.equal(first.status, 0, first.stderr);
    const once = readFileSync(path, "utf8");
    assert.match(once, /^slides: https:\/\/d\.example\/$/m);
    assert.match(once, /\n---\n# CS 9\n\nProse\.\n$/);
    const again = run(path);
    assert.equal(again.status, 1);
    assert.match(again.stderr, /REFUSED .*no legacy `materials` map/);
    assert.equal(readFileSync(path, "utf8"), once);
    // A migrated page, and a registration.
    for (const text of [once.replace(/^checked:/m, "access: open\nchecked:"), "---\ntype: Registration\ncode: CS 9\n---\n"]) {
      writeFileSync(path, text);
      assert.equal(run(path).status, 1);
      assert.equal(readFileSync(path, "utf8"), text);
    }
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("backfill: catalog instructors in catalog order, a title only where it differs, flags for nobody and for no listing, each file cited once", () => {
  const dir = mkdtempSync(join(tmpdir(), "stanford-cs-catalog-"));
  const listing = (year: string, body: string) => writeFileSync(join(dir, `explorecourses-cs-${year}.md`),
    `---\ntype: Source\nresource: https://catalog.example/${year}\n---\n# ExploreCourses\n\n${body}`);
  try {
    listing("2024-2025", [
      "## CS 9: Old Name (STATS 9)", "",
      "- Units: 3 | Grading: Letter | Career: GR",
      "- Autumn 2024:",
      "  - Section 01 (LEC): MW 10:30-11:50, Gates B1. Instructors: Beta, B. (PI); Ta, T. (TA); Alpha, A. (PI)",
      "  - Section 02 (DIS): F 10:30-11:20, Gates B3. Instructors: Gamma, G. (PI)",
      "- Winter 2025:",
      "  - Section 01 (LEC): TBA.",
      "- Spring 2025:",
      "  - Section 01 (DIS): F 13:30-14:20, 200-305. Instructors: Delta, D. (PI); Ta, T. (TA)", "",
      "Description.", "",
    ].join("\n"));
    listing("2025-2026", ["## STATS 9: Current Title (CS 9)", "", "- Autumn 2025:",
      "  - Section 01 (LEC): TR 09:00-10:20, 380-380C. Instructors: Epsilon, E. (PI)", ""].join("\n"));
    const cited = { id: "catalog", resource: "https://catalog.example/2025-2026", file: "../references/explorecourses-cs-2025-2026.md", title: "ExploreCourses" };
    const page = legacy({
      cross_listed: ["STATS 9"], terms_offered: ["Autumn 2024", "Winter 2025", "Spring 2025", "Summer 2025", "Autumn 2025", "Spring 2026"],
      materials: { access: "unknown" },
    });
    const { fm, report } = migrate({ ...page, sources: [cited] }, loadCatalog(dir), noRepo);
    assert.deepEqual(fm.past, {
      "Autumn 2024": { title: "Old Name", instructors: ["Beta, B.", "Alpha, A."] },
      "Winter 2025": { title: "Old Name", instructors: [] },
      "Spring 2025": { title: "Old Name", instructors: ["Delta, D."] },
      "Autumn 2025": { instructors: ["Epsilon, E."] },
    });
    const flags = report.filter((l) => l.startsWith("FLAG"));
    assert.ok(flags.some((l) => l.includes("the catalog names no instructor for Winter 2025")), flags.join("\n"));
    assert.ok(flags.some((l) => l.includes("no catalog instructors for Summer 2025")), flags.join("\n"));
    assert.equal(flags.length, 2, flags.join("\n"));
    // The 2024-25 file is cited once, for three terms; the page already cited 2025-26.
    assert.deepEqual(fm.sources, [cited, {
      id: "catalog-2024-25", resource: "https://catalog.example/2024-2025",
      file: "../references/explorecourses-cs-2024-2025.md", title: "ExploreCourses, 2024-2025",
    }]);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("syllabus repository: a Stanford-only upload is a closed syllabus, dated only when newer; PUBLIC is flagged; legacy entries are kept", () => {
  const dir = mkdtempSync(join(tmpdir(), "stanford-cs-repo-"));
  const file = (name: string, body: string) => writeFileSync(join(dir, name),
    `---\ntype: Source\nresource: https://syllabus.example/${name}\n---\n# Repository\n\n${body}`);
  try {
    file("syllabus-repository-cs-2024-2025.md", [
      "## Autumn 2024", "", "Fetched from <https://syllabus.example/F24> at 2026-09-30T19:29:59Z: 3 sections.", "",
      "- CS 9 (01): INSTITUTION https://canvas.example/courses/1", "- CS 10 (01): none", "",
      "## Winter 2025", "", "Fetched from <https://syllabus.example/W25> at 2026-09-30T19:30:06Z: 1 section.", "",
      "- CS 9 (01): PUBLIC https://canvas.example/courses/2", "",
      "## Spring 2025", "", "Fetched from <https://syllabus.example/Sp25> at 2026-09-30T19:30:13Z: 1 section.", "",
      "- CS 9 (01): none", "",
      "## Summer 2025", "", "Fetched from <https://syllabus.example/Su25> at 2026-09-30T19:30:16Z: 1 section.", "",
      "- CS 9 (01): COURSE https://canvas.example/courses/3", "",
    ].join("\n"));
    file("syllabus-repository-cs-autumn-2025.md", ["## Autumn 2025", "", "Fetched from <https://syllabus.example/F25> at 2026-09-30T19:30:21Z: 1 section.", "",
      "- CS 9 (01): INSTITUTION https://canvas.example/courses/4", ""].join("\n"));
    const repo = loadRepository(dir);
    assert.deepEqual(repo(["CS 9"], "Autumn 2024"), { uploads: [{ section: "01", visibility: "INSTITUTION", url: "https://canvas.example/courses/1" }],
      fetched: "2026-09-30", file: "syllabus-repository-cs-2024-2025.md", resource: "https://syllabus.example/syllabus-repository-cs-2024-2025.md" });
    assert.equal(repo(["CS 9"], "Winter 2020"), null);

    const page = legacy({
      terms_offered: ["Autumn 2024", "Winter 2025", "Spring 2025", "Summer 2025", "Autumn 2025", "Spring 2026"],
      materials: { access: "open", checked: "2026-09-01", syllabus: { access: "closed", term: "Spring 2025", note: "Canvas" } },
    });
    const { fm, report } = migrate(page, catalog, repo);
    const past = fm.past as Record<string, Fm>;
    const closed = (who: string) => ({ access: "closed", note: `uploaded to Canvas, ${who} (syllabus repository)`, checked: "2026-09-30" });
    assert.deepEqual(past["Autumn 2024"].syllabus, closed("Stanford-only"));
    assert.deepEqual(past["Summer 2025"].syllabus, closed("enrolled students only"));
    // Autumn 2025 comes from the per-term file.
    assert.deepEqual(past["Autumn 2025"].syllabus, closed("Stanford-only"));
    // PUBLIC is flagged, not rated.
    assert.ok(!("syllabus" in past["Winter 2025"]));
    const flags = report.filter((l) => l.startsWith("FLAG"));
    assert.ok(flags.some((l) => l.includes("PUBLIC syllabus for Winter 2025") && l.includes("https://canvas.example/courses/2/assignments/syllabus")), flags.join("\n"));
    // The legacy entry is kept, and flagged because the repository shows no upload.
    assert.deepEqual(past["Spring 2025"].syllabus, { access: "closed", note: "Canvas" });
    assert.ok(flags.some((l) => l.includes("past.Spring 2025.syllabus is closed, but the syllabus repository shows no upload")), flags.join("\n"));
    assert.equal(flags.length, 2, flags.join("\n"));
    // Each repository file cited once.
    assert.deepEqual((fm.sources as Fm[]).filter((s) => String(s.id).startsWith("syllabus-repo")).map((s) => s.id), ["syllabus-repo-2024-25", "syllabus-repo-autumn-2025"]);

    // A page checked after the listing was fetched: no entry date, which the page's own covers.
    const later = migrate(legacy({ ...page, materials: { access: "open", checked: "2026-10-05" } }), catalog, repo).fm.past as Record<string, Fm>;
    assert.deepEqual(later["Autumn 2024"].syllabus, { access: "closed", note: "uploaded to Canvas, Stanford-only (syllabus repository)" });
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});
