import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { codeAliases, marker, sortCourse, withAliases, yamlLines, type Y } from "./wiki.ts";

type Fm = Record<string, Y>;
const day = (offset: number) => new Date(Date.now() + offset * 864e5).toISOString().slice(0, 10);
const AGENTS = "current_term: Autumn 2026\ncutoff_term: Winter 2020";

// A course page in the flat schema, written the way build writes it, so lint's out-of-date check stays quiet.
// `fm` overrides or adds keys; `omit` drops them. Checked today, with a Syllabus section, it lints clean.
type Extra = { cross_listed?: string[]; prerequisites?: string[]; body?: string; fm?: Fm; omit?: string[] };
const page = (code: string, terms: string[], { cross_listed, prerequisites = [], body = "", fm = {}, omit = [] }: Extra = {}) => {
  const f: Fm = {
    type: "Course", code, title: `${code}: Test`, description: "Test.", ...(cross_listed ? { cross_listed } : {}),
    level: "graduate", term: terms.at(-1) ?? "", terms_offered: terms, instructors: [],
    ...(terms.at(-1) === "Autumn 2026" ? { schedule: "" } : {}), units: "3", grading: "Letter", prerequisites,
    access: "unknown", topics: [], tags: [], checked: day(0), status: "draft",
    generated: { by: "test", at: "2026-09-29T00:00:00Z" }, sources: [], ...fm,
  };
  for (const k of omit) delete f[k];
  return `---\n${yamlLines(sortCourse(withAliases(f))).join("\n")}\n---\n# ${code}\n\n${body}\n\n## Syllabus\n\n- Week 1.\n`;
};
// TEMPORARY (legacy pages): the same page with a legacy `materials` map, in the legacy key order.
const legacyPage = (code: string, terms: string[], { materials = { access: "unknown", checked: day(0) } as Fm, extra = {} as Fm, body = "" } = {}) => {
  const f: Fm = {
    type: "Course", code, title: `${code}: Test`, description: "Test.", level: "graduate", term: terms.at(-1)!,
    terms_offered: terms, instructors: [], ...(terms.at(-1) === "Autumn 2026" ? { schedule: "" } : {}), units: "3", grading: "Letter", prerequisites: [], materials,
    topics: [], tags: [], sources: [], status: "draft", generated: { by: "test", at: "2026-09-29T00:00:00Z" }, ...extra,
  };
  return `---\n${yamlLines(withAliases(f)).join("\n")}\n---\n# ${code}\n\n${body}\n\n## Syllabus\n\n- Week 1.\n`;
};
const termPage = (endDate: string) =>
  `---\ntype: Term\nstart_date: "2020-01-06"\nend_date: "${endDate}"\nsources: []\n---\n\n${marker("course-table")}\n`;

function lint(agents: string, pages: Record<string, string>, terms: Record<string, string> = {}) {
  const root = mkdtempSync(join(tmpdir(), "stanford-cs-lint-"));
  try {
    mkdirSync(join(root, "courses"));
    mkdirSync(join(root, "terms"));
    writeFileSync(join(root, "AGENTS.md"), `---\ntype: Scaffolding\n${agents}\n---\n`);
    for (const [name, text] of Object.entries(pages)) writeFileSync(join(root, "courses", `${name}.md`), text);
    for (const [name, text] of Object.entries(terms)) writeFileSync(join(root, "terms", `${name}.md`), text);
    const r = spawnSync(process.execPath, [join(import.meta.dirname, "lint.ts"), root], { encoding: "utf8" });
    assert.equal(r.stderr, "");
    return r.stdout;
  } finally { rmSync(root, { recursive: true, force: true }); }
}
// One course page's problems, without the file prefix: "ERROR msg" or "warn  msg".
const problemsOf = (out: string, code: string) =>
  out.split("\n").filter((l) => l.includes(` courses/${code}.md: `)).map((l) => l.replace(` courses/${code}.md: `, " "));
const lintOne = (text: string, terms: Record<string, string> = {}) => problemsOf(lint(AGENTS, { "CS 1": text }, terms), "CS 1");

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

// ---------- the flat schema (.agents/2026-09-30.materials.md §9.2) ----------

test("every value shape AGENTS.md allows lints clean", () => {
  const url = "https://example.com/";
  assert.deepEqual(lintOne(page("CS 1", ["Spring 2025", "Autumn 2026"], {
    fm: {
      homepage: url, access: "mostly-open",
      syllabus: url, slides: [url, `${url}b`], notes: { access: "partial", url: [url], note: "weeks 1-4", checked: "2099-01-01" },
      videos: "none", assignments: { access: "closed", note: "Canvas" }, solutions: "unknown", repo: { access: "open", url },
      sites: [{ url, note: "a second host" }, { url: `${url}c` }], self_study: [{ url, note: "a public leaderboard" }],
      textbook: ["Book one", "Book two"], topics: ["a", "b", "c", "d"],
      past: {
        "Autumn 2018": { slides: url },
        "Spring 2025": { title: "Old Title", instructors: [], homepage: url, videos: url, textbook: "Book zero", topics: ["x"] },
      },
      exceptions: { pre_cutoff: "the 2018 decks still match the lectures" },
    },
  })), []);
  // Never checked: a backlog warning, not an error.
  assert.deepEqual(lintOne(page("CS 1", ["Autumn 2026"], { omit: ["checked"] })), ["warn  materials never checked (access: unknown and no checked)"]);
});

test("value shapes: http(s) URLs only, with separate messages for a malformed URL and a bad rating", () => {
  const got = lintOne(page("CS 1", ["Autumn 2026"], {
    fm: {
      access: "mostly", syllabus: "htps://example.com/", slides: "https://exa mple.com/", notes: "opne",
      videos: { url: "https://example.com/" }, assignments: { access: "open", url: "https://example.com/", term: "Spring 2022" },
      solutions: [], exams: ["https://example.com/", "ftp://example.com/"], projects: { access: "open", note: "" },
      sites: [{ note: "no url" }, { url: "https://example.com/", term: "Spring 2022" }], self_study: [{ url: "https://example.com/" }],
      textbook: [],
    },
  }));
  for (const want of [
    "bad access: mostly (want unknown, closed, mostly-closed, partial, mostly-open, open; a course with no materials is a Registration)",
    'syllabus: bad rating "htps://example.com/" (want open, partial, closed, none, unknown, or an http(s) URL)',
    'slides: malformed URL "https://exa mple.com/"',
    'notes: bad rating "opne"',
    "videos: access is required in the object form",
    "assignments: unknown key term (want access, url, note, checked)",
    "solutions: an empty URL list; omit it",
    'exams: a url must be an http(s) URL, not "ftp://example.com/"',
    "projects: note must be non-empty text",
    "sites: entry 1 needs an http(s) url",
    "sites: entry 2: unknown key term (want url, note)",
    "self_study: entry 1 needs a note, saying how it helps an outside learner",
    "textbook must be a title or a non-empty list of titles",
  ]) assert.ok(got.some((l) => l.startsWith("ERROR") && l.includes(want)), `${want}\n${got.join("\n")}`);
  assert.ok(lintOne(page("CS 1", ["Autumn 2026"], { fm: { sites: [] } })).some((l) => l.includes("sites: must be a non-empty list")));
});

test("checked: required once anything is rated, top level or past; 120-day warning", () => {
  const t = ["Spring 2025", "Autumn 2026"], i = { "Spring 2025": { instructors: [] } } as Fm;
  const noCheck = (fm: Fm) => lintOne(page("CS 1", t, { fm: { past: i, ...fm }, omit: ["checked"] }));
  assert.ok(noCheck({ access: "partial" }).includes("ERROR checked is required once anything is rated"));
  assert.ok(noCheck({ syllabus: "open" }).includes("ERROR checked is required once anything is rated"));
  assert.ok(noCheck({ past: { "Spring 2025": { instructors: [], slides: "closed" } } }).includes("ERROR checked is required once anything is rated"));
  assert.deepEqual(noCheck({}), ["warn  materials never checked (access: unknown and no checked)"]);
  assert.deepEqual(lintOne(page("CS 1", t, { fm: { past: i, checked: day(-121) } })), ["warn  materials checked over 120 days ago"]);
  assert.ok(lintOne(page("CS 1", t, { fm: { past: i, checked: "2026-9-1" } })).includes("ERROR checked must be YYYY-MM-DD"));
});

test("an entry's own checked: a narrower recheck, later than the page's checked, or a warning to drop it", () => {
  const t = ["Spring 2025", "Autumn 2026"];
  const at = (fm: Fm) => lintOne(page("CS 1", t, { fm: { checked: day(-10), past: { "Spring 2025": { instructors: [] } }, ...fm } }));
  assert.deepEqual(at({ videos: { access: "open", url: "https://example.com/", checked: day(-2) } }), []);
  assert.deepEqual(at({ past: { "Spring 2025": { instructors: [], slides: { access: "closed", checked: day(-10) } } } }),
    [`warn  past.Spring 2025.slides.checked ${day(-10)} is not after the page's checked ${day(-10)}, which covers it; drop it`]);
  assert.ok(at({ videos: { access: "open", checked: "2026-9-1" } }).includes("ERROR videos: checked must be YYYY-MM-DD"));
});

test("sources: an optional checked date after title; unknown keys, malformed or future dates are errors; build sorts the keys", () => {
  const src = (extra: Fm) => lintOne(page("CS 1", ["Autumn 2026"], { fm: { sources: [{ id: "site", resource: "https://example.com/", title: "Site", ...extra }] } }));
  assert.deepEqual(src({}), []);
  assert.deepEqual(src({ checked: day(-3) }), []);
  assert.deepEqual(src({ checked: "2026-9-1" }), ["ERROR source site: checked must be YYYY-MM-DD"]);
  assert.deepEqual(src({ checked: day(2) }), [`ERROR source site: checked ${day(2)} is in the future`]);
  assert.deepEqual(src({ fetched: day(0) }), ["ERROR source site: unknown key fetched (want id, resource, file, title, checked)"]);
  assert.deepEqual(yamlLines({ sources: [{ checked: "2026-09-30", title: "T", file: "../references/x.md", resource: "https://x/", id: "x" }] }),
    ["sources:", "  - id: x", "    resource: https://x/", "    file: ../references/x.md", "    title: T", "    checked: \"2026-09-30\""]);
});

test("post-term recheck: warns once the page's term has ended and checked predates its end_date, not before", () => {
  const at = (end: string, checked: string) => lintOne(page("CS 1", ["Summer 2026"], { fm: { checked } }), { "Summer 2026": termPage(end) });
  const ended = at(day(-30), day(-40));
  assert.deepEqual(ended, [`warn  materials checked ${day(-40)}, before Summer 2026 ended (${day(-30)}): recheck them now that the offering is over`]);
  assert.deepEqual(at(day(-30), day(-20)), []); // checked after the term ended
  assert.deepEqual(at(day(30), day(-40)), []); // the term hasn't ended yet
  assert.deepEqual(lintOne(page("CS 1", ["Summer 2026"], { fm: { checked: day(-40) } })), []); // no term page, no end_date
});

test("past: records for earlier offered terms only, never empty, allowed keys only", () => {
  const t = ["Winter 2024", "Spring 2025", "Autumn 2026"];
  const got = lintOne(page("CS 1", t, {
    fm: {
      past: {
        "Fall 2024": { instructors: [] },
        "Winter 2024": { instructors: ["Doe, J."], access: "open", checked: "2026-09-01" },
        "Spring 2025": {},
        "Summer 2025": { instructors: [] },
        "Autumn 2026": { instructors: [] },
      },
    },
  }));
  for (const want of [
    'ERROR past: "Fall 2024" is not a term name',
    "ERROR past.Winter 2024.access is not allowed in past",
    "ERROR past.Winter 2024.checked is not allowed in past",
    "ERROR past.Spring 2025 is empty; drop it",
    "ERROR past.Summer 2025 is not in terms_offered",
    "ERROR past.Autumn 2026 is not earlier than term Autumn 2026",
    "warn  past.Spring 2025.instructors is missing",
  ]) assert.ok(got.some((l) => l.startsWith(want)), `${want}\n${got.join("\n")}`);
  assert.ok(!got.some((l) => l.includes("past.Winter 2024.instructors is missing")));
});

test("past titles are bare: no code prefix and no cross-listed codes, which tables would show as they are", () => {
  const t = ["Spring 2025", "Autumn 2026"];
  const titled = (title: string) => lintOne(page("CS 1", t, { fm: { past: { "Spring 2025": { title, instructors: [] } } } }));
  assert.deepEqual(titled("Technology for Financial Systems (Accelerated)"), []);
  assert.deepEqual(titled("CS 1: Old Title"), ['ERROR past.Spring 2025.title starts with "CS 1: ": drop it, tables show the title as it is']);
  assert.deepEqual(titled("Old Title (STATS 1, EE 1)"), ['ERROR past.Spring 2025.title ends with the cross-listed codes "(STATS 1, EE 1)": drop them']);
});

test("missing instructors: every older offering since cutoff_term has past.<term>.instructors; [] counts", () => {
  const t = ["Spring 2025", "Winter 2026", "Autumn 2026"];
  assert.deepEqual(lintOne(page("CS 1", t, { fm: { past: { "Spring 2025": { instructors: ["Doe, J."] } } } })),
    ["warn  past.Winter 2026.instructors is missing: record that offering's catalog instructors ([] if it names nobody), and its title if it differs"]);
  assert.deepEqual(lintOne(page("CS 1", t, { fm: { past: { "Spring 2025": { instructors: ["Doe, J."] }, "Winter 2026": { instructors: [] } } } })), []);
});

test("pre-cutoff: warns without exceptions.pre_cutoff, which silences only that warning; an unused exception warns", () => {
  const t = ["Autumn 2026"];
  const slides = { "Autumn 2018": { slides: "https://example.com/" } };
  assert.deepEqual(lintOne(page("CS 1", t, { fm: { past: slides } })),
    ["warn  past.Autumn 2018 is before cutoff_term Winter 2020: add exceptions.pre_cutoff with the reason it still counts, or mention it in the Materials section and drop the record"]);
  const excused = { exceptions: { pre_cutoff: "the 2018 decks still match" } };
  assert.deepEqual(lintOne(page("CS 1", t, { fm: { past: slides, ...excused } })), []);
  // The exception doesn't silence anything else about the record.
  const bad = lintOne(page("CS 1", t, { fm: { past: { "Autumn 2018": { slides: "https://exa mple.com/", instructors: ["Doe, J."] } }, ...excused } }));
  assert.ok(bad.includes('ERROR past.Autumn 2018.slides: malformed URL "https://exa mple.com/"'), bad.join("\n"));
  assert.ok(bad.includes("ERROR past.Autumn 2018 is before cutoff_term Winter 2020, so it holds material types, sites and self_study only, not instructors"), bad.join("\n"));
  assert.deepEqual(lintOne(page("CS 1", t, { fm: excused })),
    ["warn  exceptions.pre_cutoff silences nothing: no past record is before cutoff_term Winter 2020; drop it"]);
  const names = lintOne(page("CS 1", t, { fm: { past: slides, exceptions: { pre_cutoff: "", later: "x" } } }));
  assert.ok(names.includes("ERROR exceptions.pre_cutoff needs a reason"), names.join("\n"));
  assert.ok(names.includes("ERROR exceptions.later: unknown name (known: pre_cutoff, shared_code)"), names.join("\n"));
});

test("aliases: the code without its space, then other codes without and with it; never the page's own code; omitted when empty", () => {
  const t = ["Autumn 2026"];
  const fine = page("CS 1", t, { cross_listed: ["STATS 1"], fm: { formerly: ["CS 9"] } });
  assert.match(fine, /^tags: \[\]\naliases:\n  - CS1\n  - STATS1\n  - STATS 1\n  - CS9\n  - CS 9\nchecked:/m);
  assert.deepEqual(lintOne(fine), []);
  const wrong = 'ERROR aliases must be ["CS1","STATS1","STATS 1","CS9","CS 9"]: the code without its space, then each cross_listed and formerly code without and with it; run make build';
  assert.ok(lintOne(fine.replace(/^aliases:\n(  - .*\n)+/m, "")).includes(wrong));
  assert.ok(lintOne(fine.replace("  - STATS1\n", "")).includes(wrong));
  assert.match(page("CS 1", t), /^aliases:\n  - CS1\n/m);
  // The page's own code is never an alias, even when it is listed by mistake; a code with no space has none to drop.
  const own = page("CS 1", t, { cross_listed: ["CS 1"] });
  assert.match(own, /^aliases:\n  - CS1\nchecked:/m);
  assert.ok(lintOne(own).includes("ERROR cross_listed lists the page's own code CS 1; drop it"));
  assert.deepEqual(codeAliases({ code: "CS1" }), []);
  const out = lint(AGENTS, { "CS 1": fine, "CS 9": page("CS 9", t) });
  assert.match(out, /CS 1\.md: formerly CS 9 has its own page, courses\/CS 9\.md: a course gets one page, so merge the two or drop the code$/m);
  // A legacy page gets its aliases right after tags, keeping its own order otherwise.
  assert.match(legacyPage("CS 1", t), /^tags: \[\]\naliases:\n  - CS1\nsources:/m);
});

test("shared codes: a split's formerly code is fine; any other shared code warns until exceptions.shared_code explains it", () => {
  const t = ["Autumn 2026"];
  const split = lint(AGENTS, { "CS 1A": page("CS 1A", t, { fm: { formerly: ["CS 1"] } }), "CS 1B": page("CS 1B", t, { fm: { formerly: ["CS 1"] } }) });
  assert.doesNotMatch(split, /also listed by/);
  const pages = (fm: Fm = {}) => ({ "CS 2": page("CS 2", t, { cross_listed: ["EE 2"], fm }), "CS 2X": page("CS 2X", t, { cross_listed: ["EE 2"], fm }) });
  const shared = lint(AGENTS, pages());
  assert.match(shared, /CS 2\.md: cross_listed EE 2 is also listed by courses\/CS 2X\.md \(cross_listed\): a renumbered course/m);
  assert.match(shared, /CS 2X\.md: cross_listed EE 2 is also listed by courses\/CS 2\.md \(cross_listed\)/m);
  const excused = { exceptions: { shared_code: "EE reused 2 for an unrelated course" } };
  assert.doesNotMatch(lint(AGENTS, pages(excused)), /also listed by/);
  assert.deepEqual(lintOne(page("CS 1", t, { fm: excused })),
    ["warn  exceptions.shared_code silences nothing: no cross_listed or formerly code here is listed by another page; drop it"]);
});

test("key order: an error on a migrated page, a warning on a legacy one", () => {
  const swap = (text: string) => text.replace(/^(status: draft\n)([\s\S]*?)(sources: \[\]\n)/m, "$3$1$2");
  const migrated = swap(page("CS 1", ["Autumn 2026"]));
  assert.ok(lintOne(migrated).includes("ERROR frontmatter keys out of order (see AGENTS.md → Frontmatter); run make build"));
  const legacy = legacyPage("CS 1", ["Autumn 2026"]).replace(/^(topics: \[\]\n)(tags: \[\]\n)/m, "$2$1");
  assert.ok(lintOne(legacy).includes("warn  frontmatter keys out of order (see AGENTS.md)"));
});

test("registrations reject every Content key, checked and exceptions", () => {
  const reg = (extra: string) => `---\ntype: Registration\ncode: CS 1\ntitle: "CS 1: Test"\ndescription: Test.\nlevel: graduate\nunits: "3"\n`
    + `grading: Letter\n${extra}tags: []\naliases:\n  - CS1\nstatus: draft\ngenerated:\n  by: test\n  at: "2026-09-29T00:00:00Z"\nsources: []\n---\n# CS 1\n`;
  assert.deepEqual(lintOne(reg("")), []);
  const got = lintOne(reg("homepage: https://example.com/\naccess: open\nslides: open\nself_study: []\ntopics: []\n"
    + "past: {}\nmaterials: { access: open }\nchecked: \"2026-09-01\"\nexceptions: {}\n"));
  for (const k of ["homepage", "access", "slides", "self_study", "topics", "past", "materials", "checked", "exceptions"])
    assert.ok(got.includes(`ERROR ${k} is not used on a Registration`), `${k}\n${got.join("\n")}`);
});

test("icons: a rating icon in a migrated page's body is an error; a legacy page's isn't", () => {
  const body = "Everything is public ✅, mostly 🟢🅰✚.";
  assert.deepEqual(lintOne(page("CS 1", ["Autumn 2026"], { body })),
    ["ERROR rating icon in the body (🟢 ✅ 🅰 ✚): say what a reader can open instead (AGENTS.md → Body)"]);
  assert.deepEqual(lintOne(legacyPage("CS 1", ["Autumn 2026"], { body })), []);
});

test("length: warns over the total or a section's ceiling, naming it; link URLs don't count; legacy pages are exempt", () => {
  const words = (n: number) => Array.from({ length: n }, (_, i) => `w${i}`).join(" ");
  const link = `[w](https://example.com/${"long-path/".repeat(20)})`;
  const sections = (materials: string, extra = "") => `${words(100)}\n\n## Materials\n\n${materials}\n\n${extra}## Source notes\n\n${words(900)}`;
  assert.deepEqual(lintOne(page("CS 1", ["Autumn 2026"], { body: sections(`${words(340)} ${link} ${link}`) })), []);
  assert.deepEqual(lintOne(page("CS 1", ["Autumn 2026"], { body: sections(`- **Slides**: ${words(351)}`) })),
    ["warn  ## Materials: 352 words, over its 350-word ceiling (AGENTS.md → Body)"]);
  const long = lintOne(page("CS 1", ["Autumn 2026"], { body: `${words(121)}\n\n## Syllabus\n\n${words(290)}\n\n## Prerequisites\n\n${words(300)}` }));
  assert.deepEqual(long, [
    "warn  body: 713 words above ## Source notes, over the 700-word ceiling (AGENTS.md → Body)",
    "warn  the summary: 121 words, over its 120-word ceiling (AGENTS.md → Body)",
    "warn  ## Prerequisites: 300 words, over its 100-word ceiling (AGENTS.md → Body)",
  ]);
  assert.deepEqual(lintOne(legacyPage("CS 1", ["Autumn 2026"], { body: sections(words(400)) })), []);
});

// ---------- TEMPORARY: legacy pages and mixed schemas (.agents/2026-09-30.materials.md §9.1) ----------

test("mixed schemas are errors in both directions; the summary line counts legacy pages", () => {
  const out = lint(AGENTS, {
    "CS 1": page("CS 1", ["Autumn 2026"], { fm: { materials: { access: "open", checked: day(0) } } }),
    "CS 2": legacyPage("CS 2", ["Autumn 2026"], {
      extra: { checked: day(0), slides: "open", sites: [{ url: "https://example.com/" }], past: { "Spring 2025": { instructors: [] } } },
    }),
    "CS 3": legacyPage("CS 3", ["Autumn 2026"]),
  });
  assert.deepEqual(problemsOf(out, "CS 1"),
    ["ERROR materials is the legacy map, and the page has a top-level access: move what's left of it to the flat keys"]);
  const legacy = problemsOf(out, "CS 2");
  for (const k of ["checked", "slides", "sites", "past"])
    assert.ok(legacy.includes(`ERROR ${k} belongs to the flat schema, but with no top-level access the page is still legacy: finish the migration, don't mix the two`), `${k}\n${legacy.join("\n")}`);
  assert.deepEqual(problemsOf(out, "CS 3"), []);
  assert.match(out, /^2 of 3 course pages not yet migrated/m);
  assert.doesNotMatch(lint(AGENTS, { "CS 1": page("CS 1", ["Autumn 2026"]) }), /not yet migrated/);
});

test("legacy pages keep today's materials checks", () => {
  assert.deepEqual(lintOne(legacyPage("CS 1", ["Autumn 2026"], { materials: { access: "unknown" } })), ["warn  materials never checked"]);
  const got = lintOne(legacyPage("CS 1", ["Autumn 2026"], { materials: { access: "open", repo: "open", slides: "opne" } }));
  assert.ok(got.includes("ERROR materials.checked is required once anything is rated"), got.join("\n"));
  assert.ok(got.includes("ERROR unknown material type: repo"), got.join("\n"));
  assert.ok(got.includes("ERROR materials.slides: bad rating opne"), got.join("\n"));
});
