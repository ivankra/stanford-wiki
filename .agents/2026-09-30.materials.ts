// TEMPORARY (design in .agents/2026-09-30.materials.md, §10.1): move a course page's legacy `materials`
// map to the flat schema, give every older offering its catalog instructors, and record the syllabus repository's
// Stanford-only uploads (§8). Mechanical only.
// It never sets `access`, never advances `checked`, and never touches prose; the migrating agent does the
// judgement. Remove after the migration (§10.5).
// Usage: node .agents/2026-09-30.materials.ts [--dry-run] [--no-links] "courses/CS 229.md" [...]
// After writing a page it runs scripts/links.ts on it (network; skipped on --dry-run or --no-links) and reports
// each link whose response disagrees with its rating as a FLAG.
import { spawnSync } from "node:child_process";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { parseYaml, yamlLines, termOrd, str, arr, obj, type Y } from "../scripts/wiki.ts";

type Fm = Record<string, Y>;

const ROOT = join(import.meta.dirname, "..");
const config = parseYaml(readFileSync(join(ROOT, "AGENTS.md"), "utf8").match(/^---\n([\s\S]*?)\n---/)![1]);
const CUTOFF = str(config.cutoff_term);

// Both schemas spelled out here, so the helper doesn't depend on which one scripts/wiki.ts implements.
const LEGACY_TYPES = ["syllabus", "slides", "notes", "videos", "assignments", "solutions", "exams", "projects", "code"];
const TYPES = LEGACY_TYPES.map((t) => (t === "code" ? "repo" : t));
const ORDER = ["type", "code", "title", "description", "cross_listed", "formerly", "level",
  "term", "terms_offered", "instructors", "schedule", "units", "grading", "prerequisites",
  "homepage", "access", ...TYPES, "sites", "self_study", "textbook", "topics", "past",
  "tags", "aliases", "checked", "status", "generated", "exceptions", "sources"];
const PAST_ORDER = ["title", "instructors", "homepage", ...TYPES, "sites", "self_study", "textbook", "topics"];
// Keys that exist only in the flat schema: finding any of them means the page isn't legacy.
const NEW_ONLY = ["access", "checked", ...TYPES, "sites", "self_study", "textbook", "past", "exceptions"];
const LEGACY_MAT_KEYS = ["checked", "access", "term", ...LEGACY_TYPES, "sites"];
const TERM_IN_TEXT = /\b(Winter|Spring|Summer|Autumn|Fall) (\d{4})\b/g;

const without = (o: Fm, key: string): Fm => Object.fromEntries(Object.entries(o).filter(([k]) => k !== key));
const ordered = (m: Fm, order: string[]): Fm => {
  const keys = [...order.filter((k) => k in m), ...Object.keys(m).filter((k) => !order.includes(k))];
  return Object.fromEntries(keys.map((k) => [k, m[k]]));
};

// ---- The catalog: the ExploreCourses wrappers in references/ ----
// One file per past academic year (explorecourses-cs-2023-2024.md, a "- Winter 2024:" block per term) and one
// per term of the current year (explorecourses-cs-autumn-2026.md, sections directly under the course).

export type Offering = { title: string; instructors: string[]; file: string; resource: string };
// A term's offering under the first of `codes` the catalog lists that term, or why none was found.
export type Catalog = (codes: string[], term: string) => Offering | string;

type Listing = { resource: string; courses: Map<string, { title: string; terms: Map<string, string[]> }> };

// Cross-listed codes follow the title in parentheses; "(WIM)" or "(Accelerated)" are part of it.
const CROSS_LISTED = /\s*\([A-Z&]+ \d+[A-Z]*(, [A-Z&]+ \d+[A-Z]*)*\)$/;

export function parseListing(text: string, fileTerm = ""): Listing {
  const resource = text.match(/^resource: (.*)$/m)?.[1].trim() ?? "";
  const courses: Listing["courses"] = new Map();
  for (const block of text.split(/\n(?=## )/)) {
    const head = block.match(/^## ([A-Z&]+ \d+[A-Z]*): (.*)$/m);
    if (!head) continue;
    const terms = new Map<string, string[]>();
    let term = fileTerm;
    for (const line of block.split("\n")) {
      const t = line.match(/^- ((?:Autumn|Winter|Spring|Summer) \d{4}):$/);
      if (t) { term = t[1]; continue; }
      if (term && /^\s*- Section /.test(line)) terms.set(term, [...(terms.get(term) ?? []), line]);
    }
    courses.set(head[1], { title: head[2].replace(CROSS_LISTED, "").trim(), terms });
  }
  return { resource, courses };
}

// The principal instructors (PI) in catalog order, from the lecture or seminar sections; a course whose only
// sections are discussions or labs (CS 1U, CS 106L in 2020) takes them from those.
export function principals(sections: string[]): string[] {
  const pis = (lines: string[]) => [...new Set(lines.flatMap((l) =>
    (l.match(/Instructors: (.*)$/)?.[1] ?? "").split("; ").map((p) => p.trim().match(/^(.*) \(PI\)$/)?.[1] ?? "").filter(Boolean)))];
  const main = pis(sections.filter((l) => !/\((DIS|LAB)\):/.test(l)));
  return main.length ? main : pis(sections);
}

export function loadCatalog(dir: string): Catalog {
  const cache = new Map<string, Listing | null>();
  const listing = (name: string, fileTerm = "") => {
    if (!cache.has(name)) {
      const path = join(dir, name);
      cache.set(name, existsSync(path) ? parseListing(readFileSync(path, "utf8"), fileTerm) : null);
    }
    return cache.get(name)!;
  };
  return (codes, term) => {
    const [season, y] = term.split(" ");
    const year = Number(y);
    const start = season === "Autumn" ? year : year - 1;
    const yearFile = `explorecourses-cs-${start}-${start + 1}.md`;
    const termFile = `explorecourses-cs-${season.toLowerCase()}-${year}.md`;
    const [file, l] = listing(yearFile) ? [yearFile, listing(yearFile)!] : [termFile, listing(termFile, term)];
    if (!l) return `no catalog file for ${term} (looked for references/${yearFile} and ${termFile})`;
    for (const code of codes) {
      const sections = l.courses.get(code)?.terms.get(term);
      if (sections) return { title: l.courses.get(code)!.title, instructors: principals(sections), file, resource: l.resource };
    }
    return `references/${file} lists no ${term} section under ${codes.join(", ")}`;
  };
}

// ---- The syllabus repository: syllabus-repository-cs-*.md in references/ ----
// Same file layout as the catalog. A "## Winter 2024" block per term, whose first line gives the fetch time
// ("… at 2026-09-30T19:29:35Z: …"), then one line per CS section: "- CS 229 (01): INSTITUTION https://canvas…",
// or "- CS 229 (01): none" when nothing was uploaded.

export type Upload = { section: string; visibility: string; url: string };
// A term's uploads under the page's codes (empty when its sections uploaded nothing), or null when the
// listing has no section under them or there is no file for the term.
export type Listed = { uploads: Upload[]; fetched: string; file: string; resource: string };
export type Repository = (codes: string[], term: string) => Listed | null;

type RepoFile = { resource: string; terms: Map<string, { fetched: string; courses: Map<string, Upload[]> }> };

export function parseRepository(text: string): RepoFile {
  const resource = text.match(/^resource: (.*)$/m)?.[1].trim() ?? "";
  const terms: RepoFile["terms"] = new Map();
  for (const block of text.split(/\n(?=## )/)) {
    const head = block.match(/^## ((?:Autumn|Winter|Spring|Summer) \d{4})$/m);
    if (!head) continue;
    const courses = new Map<string, Upload[]>();
    for (const line of block.split("\n")) {
      const m = line.match(/^- ([A-Z&]+ \d+[A-Z]*) \(([^)]+)\): (\S+)(?: (\S+))?$/);
      if (!m) continue;
      const list = courses.get(m[1]) ?? [];
      if (m[3] !== "none") list.push({ section: m[2], visibility: m[3], url: m[4] ?? "" });
      courses.set(m[1], list);
    }
    terms.set(head[1], { fetched: block.match(/ at (\d{4}-\d{2}-\d{2})T/)?.[1] ?? "", courses });
  }
  return { resource, terms };
}

export function loadRepository(dir: string): Repository {
  const cache = new Map<string, RepoFile | null>();
  const load = (name: string) => {
    if (!cache.has(name)) {
      const path = join(dir, name);
      cache.set(name, existsSync(path) ? parseRepository(readFileSync(path, "utf8")) : null);
    }
    return cache.get(name)!;
  };
  return (codes, term) => {
    const [season, y] = term.split(" ");
    const start = season === "Autumn" ? Number(y) : Number(y) - 1;
    const file = [`syllabus-repository-cs-${start}-${start + 1}.md`, `syllabus-repository-cs-${season.toLowerCase()}-${y}.md`]
      .find((f) => load(f)?.terms.has(term));
    if (!file) return null;
    const { resource, terms } = load(file)!;
    const t = terms.get(term)!;
    const found = codes.filter((c) => t.courses.has(c));
    return found.length ? { uploads: found.flatMap((c) => t.courses.get(c)!), fetched: t.fetched, file, resource } : null;
  };
}

// ---- The migration ----

// Returns the new frontmatter and a report, or throws with the reason the page was refused.
export function migrate(fm: Fm, catalog: Catalog = loadCatalog(join(ROOT, "references")),
  repository: Repository = loadRepository(join(ROOT, "references"))): { fm: Fm; report: string[] } {
  if (fm.type !== "Course") throw new Error(`not a Course page (type: ${str(fm.type) || "none"})`);
  const m = obj(fm.materials);
  if (!m) throw new Error("no legacy `materials` map: already migrated, or never had one");
  const found = NEW_ONLY.filter((k) => k in fm);
  if (found.length) throw new Error(`already has flat-schema keys (${found.join(", ")}): not a complete legacy page`);
  const stray = Object.keys(m).filter((k) => !LEGACY_MAT_KEYS.includes(k));
  if (stray.length) throw new Error(`unknown keys in materials (${stray.join(", ")}): place them by hand`);

  const pageTerm = str(fm.term);
  const offered = arr(fm.terms_offered).map(String);
  const top: Fm = {};
  const past: Record<string, Fm> = {};
  const report: string[] = [];
  const flags: string[] = [];

  const check = (term: string, what: string, note: string) => {
    if (term && isNaN(termOrd(term))) throw new Error(`${what}: bad term "${term}"`);
    // A note that describes a later offering than its entry's was written about the wrong one (a note on an
    // older entry saying what the current offering posts). Mentions of earlier offerings are ordinary context.
    for (const [, season, year] of note.matchAll(TERM_IN_TEXT)) {
      const named = `${season === "Fall" ? "Autumn" : season} ${year}`;
      if (term && termOrd(named) > termOrd(term))
        flags.push(`the note on ${what}, filed under ${term}, describes a later offering (${named}): move that part to ${named}'s entry`);
    }
  };
  const slot = (term: string): Fm => (term === pageTerm ? top : (past[term] ??= {}));
  const place = (term: string, key: string, value: Y, what: string) => {
    const target = slot(term);
    if (key in target) throw new Error(`collision: two entries for ${key} in ${term || "the current offering"}`);
    target[key] = value;
    report.push(`${what} -> ${term === pageTerm ? "top level" : `past.${term}`}`);
  };

  // A material type belongs to its own term, else materials.term, else the page's term.
  const matTerm = str(m.term) || pageTerm;
  for (const t of LEGACY_TYPES) {
    if (!(t in m)) continue;
    const key = t === "code" ? "repo" : t;
    const o = obj(m[t]);
    const term = (o && str(o.term)) || matTerm;
    check(term, key, o ? str(o.note) : "");
    place(term, key, o ? without(o, "term") : m[t], key);
  }
  // A site belongs to its own term, else the page's term. It never inherits materials.term.
  for (const [i, s] of arr(m.sites).entries()) {
    const o = obj(s);
    if (!o) throw new Error(`sites[${i}] is not a map`);
    const term = str(o.term) || pageTerm;
    check(term, `sites[${i}] (${str(o.url)})`, str(o.note));
    const target = slot(term);
    target.sites = [...arr(target.sites), without(o, "term")];
    report.push(`sites[${i}] ${str(o.url)} -> ${term === pageTerm ? "top level" : `past.${term}`}`);
  }
  if ("checked" in m) top.checked = m.checked;

  // A site that repeats homepage (AGENTS.md forbids it) or a material entry's URL in the same offering adds nothing.
  const urlOf = (v: Y): string => str(obj(v)?.url);
  for (const [where, rec] of [["top level", top], ...Object.entries(past).map(([t, r]) => [`past.${t}`, r])] as [string, Fm][]) {
    const typeUrls = new Set(TYPES.map((t) => urlOf(rec[t])).filter(Boolean));
    for (const site of arr(rec.sites)) {
      const u = urlOf(site);
      if (u && u === str(fm.homepage)) flags.push(`${where}: a sites entry repeats homepage (${u}); drop it`);
      else if (typeUrls.has(u)) flags.push(`${where}: a sites entry repeats a material entry's url (${u}); drop it unless it holds more`);
    }
  }

  // Every older offering since cutoff_term gets its catalog instructors, and its title where it differs from
  // the page's, so its term-table row names the right professor. An empty list is recorded too: the catalog
  // named nobody. The catalog files used are cited.
  const code = str(fm.code);
  const codes = [code, ...arr(fm.cross_listed).map(String), ...arr(fm.formerly).map(String)];
  const current = str(fm.title).startsWith(`${code}: `) ? str(fm.title).slice(code.length + 2) : str(fm.title);
  const cited = new Map<string, string>();
  const repoCited = new Map<string, string>();
  const pageChecked = str(m.checked);
  for (const term of offered) {
    if (isNaN(termOrd(term))) throw new Error(`terms_offered: bad term "${term}"`);
    if (pageTerm && termOrd(term) > termOrd(pageTerm)) { flags.push(`terms_offered has ${term}, later than the page's term (${pageTerm}): the page probably needs re-anchoring`); continue; }
    if (term === pageTerm || termOrd(term) < termOrd(CUTOFF)) continue;
    const o = catalog(codes, term);
    if (typeof o === "string") {
      flags.push(`no catalog instructors for ${term}: ${o}. Find the source that put ${term} in terms_offered and record past.${term}.instructors from it, or drop the term if it doesn't hold up`);
      continue;
    }
    const rec = (past[term] ??= {});
    rec.instructors = o.instructors;
    if (o.title !== current) rec.title = o.title;
    cited.set(o.file, o.resource);
    report.push(`past.${term}: instructors ${o.instructors.join("; ") || "none listed"}${o.title !== current ? `, title "${o.title}"` : ""} (${o.file})`);
    if (!o.instructors.length)
      flags.push(`the catalog names no instructor for ${term}: check that the course ran that term (a listing with only TBA sections can be a canceled offering); if it didn't, drop the term and record it in that term page's Notes`);

    // The syllabus repository: a Stanford-only or enrolled-only upload is a gated syllabus. A PUBLIC one is for
    // the agent to open, and a syllabus entry the legacy map already had is never overwritten.
    const r = repository(codes, term);
    if (!r) continue;
    const pub = r.uploads.filter((u) => u.visibility === "PUBLIC");
    const gated = r.uploads.filter((u) => ["INSTITUTION", "COURSE"].includes(u.visibility));
    const odd = r.uploads.filter((u) => !pub.includes(u) && !gated.includes(u));
    const had = rec.syllabus;
    const hadAccess = had === undefined ? "" : typeof had === "string" ? (/^https?:/.test(had) ? "open" : had) : Array.isArray(had) ? "open" : str(obj(had)?.access);
    for (const u of pub) flags.push(`the syllabus repository lists a PUBLIC syllabus for ${term} (CS section ${u.section}): open ${u.url}/assignments/syllabus and rate it`);
    for (const u of odd) flags.push(`the syllabus repository lists a ${term} upload with visibility "${u.visibility}" (section ${u.section}): check it by hand`);
    if (had !== undefined) {
      if ((hadAccess === "closed" && !r.uploads.length) || (hadAccess === "none" && r.uploads.length) || (hadAccess === "closed" && pub.length))
        flags.push(`past.${term}.syllabus is ${hadAccess}, but the syllabus repository shows ${r.uploads.length ? r.uploads.map((u) => u.visibility).join(", ") : "no upload"} (${r.file}): recheck it`);
      continue;
    }
    if (!gated.length || pub.length || odd.length) continue;
    const who = gated.every((u) => u.visibility === "COURSE") ? "enrolled students only" : "Stanford-only";
    rec.syllabus = { access: "closed", note: `uploaded to Canvas, ${who} (syllabus repository)`, ...(r.fetched && (!pageChecked || r.fetched > pageChecked) ? { checked: r.fetched } : {}) };
    repoCited.set(r.file, r.resource);
    report.push(`past.${term}: syllabus closed, ${who} (${r.file})`);
  }
  const sources = arr(fm.sources).map((s) => obj(s)!).filter(Boolean);
  const ids = new Set(sources.map((s) => str(s.id)));
  for (const [file, resource] of cited) {
    if (sources.some((s) => str(s.file) === `../references/${file}`)) continue;
    const years = file.match(/(\d{4})-(\d{4})/);
    const label = years ? `${years[1]}-${years[2]}` : file.replace(/^explorecourses-cs-|\.md$/g, "");
    let id = `catalog-${years ? `${years[1]}-${years[2].slice(2)}` : label}`;
    while (ids.has(id)) id += "x";
    ids.add(id);
    const title = years ? `ExploreCourses, ${label}` : `ExploreCourses, ${label.replace(/\b\w/, (c) => c.toUpperCase()).replace("-", " ")}`;
    sources.push({ id, resource, file: `../references/${file}`, title });
    report.push(`sources: added ${id} (${file})`);
  }
  for (const [file, resource] of repoCited) {
    if (sources.some((s) => str(s.file) === `../references/${file}`)) continue;
    const years = file.match(/(\d{4})-(\d{4})/);
    const label = years ? `${years[1]}-${years[2]}` : file.replace(/^syllabus-repository-cs-|\.md$/g, "");
    let id = `syllabus-repo-${years ? `${years[1]}-${years[2].slice(2)}` : label}`;
    while (ids.has(id)) id += "x";
    ids.add(id);
    const title = `Stanford Syllabus repository, CS, ${years ? label : label.replace(/\b\w/, (c) => c.toUpperCase()).replace("-", " ")}`;
    sources.push({ id, resource, file: `../references/${file}`, title });
    report.push(`sources: added ${id} (${file})`);
  }

  for (const term of Object.keys(past)) {
    if (termOrd(term) < termOrd(CUTOFF))
      flags.push(`past.${term} is before cutoff_term (${CUTOFF}): add exceptions.pre_cutoff with a reason, or mention it in the Materials section and delete the record`);
    else if (!offered.includes(term)) flags.push(`past.${term} is not in terms_offered: check the offering, then add it there or place the entry elsewhere`);
    if (pageTerm && termOrd(term) > termOrd(pageTerm)) flags.push(`past.${term} is later than the page's term (${pageTerm})`);
  }

  const moved = [...new Set(Object.values(past).flatMap((r) => Object.keys(r)).filter((k) => TYPES.includes(k)))];
  const unrated = TYPES.filter((t) => !(t in top));
  const header = [
    `old access: ${str(m.access) || "none"}${"checked" in m ? `, checked ${str(m.checked)}` : ", never checked"}. Set the new top-level \`access\` yourself`,
    ...(moved.length ? [`current offering now unrated for types moved to past: ${moved.filter((t) => unrated.includes(t)).join(", ") || "none"}`] : []),
    `current offering has no rating for: ${unrated.join(", ") || "nothing"}`,
  ];

  const sortedPast = Object.fromEntries(Object.keys(past).sort((a, b) => termOrd(a) - termOrd(b))
    .map((t) => [t, ordered(past[t], PAST_ORDER)]));
  const merged: Fm = { ...without(fm, "materials"), ...top, ...(Object.keys(past).length ? { past: sortedPast } : {}), sources };
  return { fm: ordered(merged, ORDER), report: [...header, ...report, ...flags.map((f) => `FLAG ${f}`)] };
}

if (process.argv[1] === import.meta.filename) {
  const args = process.argv.slice(2);
  const dry = args.includes("--dry-run");
  const links = !dry && !args.includes("--no-links") && existsSync(join(ROOT, "scripts", "links.ts"));
  const paths = args.filter((a) => !a.startsWith("--"));
  if (!paths.length) {
    console.error('usage: node .agents/2026-09-30.materials.ts [--dry-run] [--no-links] "courses/CS 229.md" [...]');
    process.exit(2);
  }
  const catalog = loadCatalog(join(ROOT, "references"));
  const repository = loadRepository(join(ROOT, "references"));
  let failed = 0;
  for (const path of paths) {
    try {
      const text = readFileSync(path, "utf8");
      const match = text.match(/^---\n([\s\S]*?)\n---\n?/);
      if (!match) throw new Error("no frontmatter");
      const { fm, report } = migrate(parseYaml(match[1]), catalog, repository);
      if (!dry) writeFileSync(path, `---\n${yamlLines(fm).join("\n")}\n---\n${text.slice(match[0].length)}`);
      console.log(`${dry ? "would migrate" : "migrated"} ${path}\n${report.map((l) => `  ${l}`).join("\n")}`);
      if (links) {
        const r = spawnSync(process.execPath, [join(ROOT, "scripts", "links.ts"), path], { encoding: "utf8", timeout: 30 * 60e3 });
        const found = r.status === 0 ? r.stdout.split("\n").filter((l) => l.startsWith(`${path}: `)).map((l) => l.slice(path.length + 2)) : [];
        if (r.status !== 0) console.log(`  FLAG link check failed (${r.error?.message ?? r.stderr.trim()}): run \`node scripts/links.ts "${path}"\` yourself`);
        for (const l of found) console.log(`  FLAG link ${l}`);
      }
    } catch (e) {
      failed++;
      console.error(`REFUSED ${path}: ${(e as Error).message} (nothing written)`);
    }
  }
  process.exit(failed ? 1 : 0);
}
