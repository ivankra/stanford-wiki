// Lint the bundle (the repo root): OKF conformance, links, and the rules in AGENTS.md.
// Mirrors the schema in AGENTS.md: change both together.
// Usage: node scripts/lint.ts [bundle-dir]   (Node >= 23, no dependencies)
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative, basename, dirname } from "node:path";
import { load, render, programs, termOrd, pageTerm, str, arr, obj, otherCodes, codeAliases, stripCode, relatedProblems, resolveLink as resolveIn,
  ACCESS_LEVELS, COURSE_KEYS, PAST_KEYS, SOURCE_KEYS, MAT_TYPES, RATINGS, RATING_ICONS, LEGACY_MAT_TYPES, isLegacy, type Y, type Doc } from "./wiki.ts";

const ROOT = process.argv[2] ?? join(import.meta.dirname, "..");
const problems: { level: "error" | "warn"; file: string; msg: string }[] = [];
const err = (d: Doc, msg: string) => problems.push({ level: "error", file: d.rel, msg });
const warn = (d: Doc, msg: string) => problems.push({ level: "warn", file: d.rel, msg });

const docs = load(ROOT);
for (const d of docs) if (d.fmError) err(d, `frontmatter: ${d.fmError}`);
for (const d of docs) {
  let inConflict = false;
  for (const [i, line] of d.text.split("\n").entries()) {
    if (/^<<<<<<<(?: |$)/.test(line)) { err(d, `merge conflict marker at line ${i + 1}: <<<<<<<`); inConflict = true; }
    else if (/^\|\|\|\|\|\|\|(?: |$)/.test(line)) err(d, `merge conflict marker at line ${i + 1}: |||||||`);
    else if (/^=======\r?$/.test(line) && inConflict) err(d, `merge conflict marker at line ${i + 1}: =======`);
    else if (/^>>>>>>>(?: |$)/.test(line)) { err(d, `merge conflict marker at line ${i + 1}: >>>>>>>`); inConflict = false; }
  }
}
const agents = docs.find((d) => d.rel === "AGENTS.md");
const CURRENT = str(agents?.fm?.current_term);
// The earliest term terms_offered may hold. termOrd orders by calendar year, then season
// (Winter < Spring < Summer < Autumn), so Autumn 2019 precedes Winter 2020 across the academic year.
const CUTOFF = str(agents?.fm?.cutoff_term);
if (agents && CUTOFF && (isNaN(termOrd(CUTOFF)) || termOrd(CUTOFF) > termOrd(CURRENT)))
  err(agents, `cutoff_term "${CUTOFF}" must be a term name no later than current_term ${CURRENT}`);

const isDate = (s: Y) => typeof s === "string" && /^\d{4}-\d{2}-\d{2}$/.test(s);
const isStamp = (s: Y) => typeof s === "string" && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?Z$/.test(s);
const resolveLink = (from: string, href: string) => resolveIn(ROOT, from, href);
const refDir = join(ROOT, "references");
const referencesPresent = existsSync(refDir) && readdirSync(refDir).some((n) => !n.startsWith("."));
// The references subrepo may not be checked out; defer only checks of paths inside it.
const availableOrDeferred = (target: string) => {
  const rel = relative(ROOT, target);
  return existsSync(target)
    || (!referencesPresent && (rel === "references" || rel.startsWith("references/")));
};

// ---------- OKF conformance ----------

for (const d of docs) {
  const name = basename(d.rel);
  if (name === "index.md") {
    if (d.rel === "index.md") {
      const keys = Object.keys(d.fm ?? {});
      if (keys.some((k) => k !== "okf_version")) err(d, "root index.md frontmatter may only hold okf_version");
    } else if (d.fm) err(d, "index.md must not have frontmatter");
  } else if (name === "log.md") {
    const dates = [...d.body.matchAll(/^## (.+)$/gm)].map((m) => m[1]);
    if (dates.some((x) => !isDate(x))) err(d, "log headings must be YYYY-MM-DD");
    if (dates.join() !== [...dates].sort().reverse().join()) err(d, "log must be newest-first");
  } else if (!d.fm) err(d, "missing frontmatter");
  else if (!str(d.fm.type)) err(d, "missing type");
  if (d.rel.startsWith("references/") && !/^references\/[a-z0-9-]+\.md$/.test(d.rel))
    err(d, "reference filenames are lowercase kebab-case, no subfolders");
}

// ---------- links and sources ----------

for (const d of docs) {
  const body = stripCode(d.body);
  for (const m of body.matchAll(/\]\(([^)\s]+)\)/g)) {
    const href = m[1];
    if (/^[a-z]+:/i.test(href) || href.startsWith("#")) continue;
    let target: string;
    try { target = resolveLink(d.path, href); } catch { err(d, `bad link encoding: ${href}`); continue; }
    if (availableOrDeferred(target)) continue;
    const inCourses = relative(ROOT, target).startsWith("courses/");
    (inCourses ? warn : err)(d, `${inCourses ? "no page yet" : "broken link"}: ${href}`);
  }
  if (/\[\[[^\]]+\]\]/.test(body)) warn(d, "wikilink found; use a relative markdown link");
  if (d.fm) {
    for (const s of arr(d.fm.sources)) {
      const o = obj(s);
      // OKF: resource is required; it holds the original URL, or a repo path for material with no URL. file = ingested copy.
      if (!o || !str(o.id) || !str(o.resource)) { err(d, "each source needs id and resource"); continue; }
      const res = str(o.resource);
      if (!/^https?:\/\//.test(res)) {
        if (!availableOrDeferred(resolveLink(d.path, encodeURI(res)))) err(d, `source ${o.id}: missing ${res}`);
        else warn(d, `source ${o.id}: resource is a repo path; use the original URL if it has one (keep the path as file)`);
      }
      if (o.file && !availableOrDeferred(resolveLink(d.path, encodeURI(str(o.file))))) err(d, `source ${o.id}: missing file ${str(o.file)}`);
      const unknown = Object.keys(o).filter((k) => !SOURCE_KEYS.includes(k));
      if (unknown.length) err(d, `source ${o.id}: unknown key ${unknown.join(", ")} (want ${SOURCE_KEYS.join(", ")})`);
      if ("checked" in o && !isDate(o.checked)) err(d, `source ${o.id}: checked must be YYYY-MM-DD`);
      else if ("checked" in o && str(o.checked) > new Date().toISOString().slice(0, 10)) err(d, `source ${o.id}: checked ${str(o.checked)} is in the future`);
    }
  }
}

// Hand-written prose should link to course pages that already exist. Generated
// tables and TODO lists are excluded because their entries are managed elsewhere.
const coursePages = new Map<string, Doc>();
for (const d of docs.filter((d) => d.rel.startsWith("courses/") && ["Course", "Registration"].includes(str(d.fm?.type)))) {
  const code = str(d.fm?.code);
  if (!coursePages.has(code) || basename(d.rel) === `${code}.md`) coursePages.set(code, d);
}
const hrefTo = (from: Doc, target: Doc) =>
  encodeURI(relative(dirname(from.path), target.path)).replace(/\(/g, "%28").replace(/\)/g, "%29");
for (const d of docs.filter((d) => /^(courses|programs|terms)\//.test(d.rel))) {
  let prose = d.body;
  if (d.rel.startsWith("programs/")) prose = prose.split(/^## Courses$/m)[0];
  if (d.rel.startsWith("terms/")) prose = prose.split(/^\| Course |^## TODO$/m)[0];
  prose = stripCode(prose)
    .replace(/!?\[[^\]\n]*\]\([^\)\n]*\)/g, "")
    .replace(/\[[^\]\n]*\]\[[^\]\n]*\]/g, "")
    .replace(/\[\[[^\]\n]*\]\]/g, "");
  const seen = new Set<string>();
  for (const match of prose.matchAll(/(?<![A-Za-z0-9])CS[ \u00a0]+\d+[A-Z]*(?![A-Za-z0-9])/g)) {
    const code = match[0].replace(/\u00a0/g, " ");
    const target = coursePages.get(code);
    if (!target || code === str(d.fm?.code) || seen.has(code)) continue;
    seen.add(code);
    warn(d, `unlinked course reference: ${code}; link as [${code}](${hrefTo(d, target)})`);
  }
}

// Binaries over 10 MB stay out of the repo: the wrapper keeps bytes, sha256 and a summary instead.
if (referencesPresent)
  for (const n of readdirSync(refDir))
    if (!n.endsWith(".md") && statSync(join(refDir, n)).size > 10e6)
      problems.push({ level: "warn", file: `references/${n}`, msg: "binary over 10 MB: keep bytes, sha256 and a summary in the wrapper, not the file" });

// ---------- course pages ----------

// The schema is AGENTS.md → Frontmatter; COURSE_KEYS (wiki.ts) holds its order, and build sorts pages into it.
// `checked` is required once anything is rated, which the checks below enforce.
const OPTIONAL = ["aliases", "cross_listed", "formerly", "schedule", "homepage", ...MAT_TYPES, "sites", "self_study", "textbook",
  "past", "checked", "exceptions"];
// Registrations (CPT, independent study, TGR…) carry no teaching content, so they skip these keys.
// `term`/`terms_offered` are in the list because they run every term: tracking which would churn
// every page on every sweep, and build never reads them for a registration.
const COURSE_ONLY = ["term", "terms_offered", "instructors", "schedule", "homepage", "access", ...MAT_TYPES,
  "sites", "self_study", "textbook", "topics", "past", "checked", "exceptions"];
// `exceptions` names, each silencing one warning.
const EXCEPTIONS = ["pre_cutoff", "shared_code"];
// What a pre-cutoff `past` record may hold: material, never catalog facts that would extend the offering history.
const PRE_CUTOFF_KEYS = [...MAT_TYPES, "sites", "self_study"];
// Word ceilings for the body above ## Source notes, in prose words (AGENTS.md → Body).
const TOTAL_WORDS = 700;
const SECTION_WORDS: Record<string, number> = { summary: 120, Materials: 350, Syllabus: 300, Prerequisites: 100, Related: 150 };

// TEMPORARY (legacy pages, .agents/2026-09-30.materials.md §9.1): the schema of a page that still has a `materials`
// map and no top-level `access`. Remove with the last legacy page, along with lintLegacy and its tests.
const LEGACY_KEY_ORDER = ["type", "code", "title", "description", "cross_listed", "formerly", "level", "term", "terms_offered",
  "instructors", "schedule", "units", "grading", "prerequisites", "homepage", "materials", "topics", "tags", "aliases", "sources", "status",
  "generated", "verified"];
const LEGACY_OPTIONAL = ["aliases", "cross_listed", "formerly", "schedule", "homepage", "verified"];
// Keys only the flat schema has: on a legacy page they mean a half-done migration.
const FLAT_KEYS = ["checked", ...MAT_TYPES, "sites", "self_study", "textbook", "past", "exceptions"];

const pages = docs.filter((d) => d.fm?.type === "Course" || d.fm?.type === "Registration");
const courses = pages.filter((d) => d.fm!.type === "Course");
const today = new Date().toISOString().slice(0, 10);
const termEnd = new Map(docs.filter((d) => d.rel.startsWith("terms/") && d.fm?.type === "Term")
  .map((d) => [pageTerm(d), str(d.fm!.end_date)]));
const isUrl = (v: Y | undefined) => typeof v === "string" && /^https?:\/\/\S+$/.test(v) && URL.canParse(v);

// A material type's value: a bare rating, a bare URL, a list of URLs, or { access, url?, note?, checked? }, where url
// is one URL or a list, and checked dates a recheck of that entry alone. A bare value starting with http:// or https:// is a URL, anything else a rating, so a mistyped
// rating and a malformed URL get different messages.
function materialProblems(v: Y): string[] {
  const url = (u: Y): string[] => typeof u === "string" && /^https?:\/\//.test(u)
    ? (isUrl(u) ? [] : [`malformed URL "${u}"`])
    : [`a url must be an http(s) URL, not ${JSON.stringify(u)}`];
  const urls = (l: Y[]) => (l.length ? l.flatMap(url) : ["an empty URL list; omit it"]);
  const rating = (r: string) => (RATINGS.includes(r) ? [] : [`bad rating "${r}" (want ${RATINGS.join(", ")}, or an http(s) URL)`]);
  if (typeof v === "string") return /^https?:\/\//.test(v) ? url(v) : rating(v);
  if (Array.isArray(v)) return urls(v);
  const out = Object.keys(v).filter((k) => !["access", "url", "note", "checked"].includes(k)).map((k) => `unknown key ${k} (want access, url, note, checked)`);
  out.push(...("access" in v ? rating(str(v.access)) : ["access is required in the object form"]));
  if ("url" in v) out.push(...(Array.isArray(v.url) ? urls(v.url) : url(v.url)));
  if ("note" in v && !str(v.note).trim()) out.push("note must be non-empty text");
  if ("checked" in v && !isDate(v.checked)) out.push("checked must be YYYY-MM-DD");
  return out;
}
// `sites` is a list of { url, note? }, `self_study` of { url, note }: the note is its evidence.
function linkListProblems(key: string, v: Y): string[] {
  const noteRequired = key === "self_study";
  if (!Array.isArray(v) || !v.length) return [`must be a non-empty list of { url, note${noteRequired ? "" : "?"} }; omit the key when there are none`];
  return v.flatMap((e, i) => {
    const o = obj(e);
    if (!o) return [`entry ${i + 1} must be a map { url, note${noteRequired ? "" : "?"} }`];
    const out = Object.keys(o).filter((k) => !["url", "note"].includes(k)).map((k) => `entry ${i + 1}: unknown key ${k} (want url, note)`);
    if (!isUrl(o.url)) out.push(`entry ${i + 1} needs an http(s) url`);
    if (noteRequired ? !str(o.note).trim() : "note" in o && !str(o.note).trim())
      out.push(`entry ${i + 1} needs a note${noteRequired ? ", saying how it helps an outside learner" : " or none at all"}`);
    return out;
  });
}
// One textbook entry's shape (AGENTS.md → Materials → textbook): `Authors, Title, Nth ed. (notes)`, where the
// optional parenthetical comes last and holds everything else, `; `-separated. So outside that parenthetical
// there is no `;` (two books crammed into one entry), no markdown emphasis, and nothing trailing it.
function textbookProblems(entry: string): string[] {
  const out: string[] = [];
  const head = entry.replace(/\s*\([^()]*\)\s*$/, "");
  if (/[*_]{1,2}[^*_]+[*_]{1,2}/.test(entry)) out.push(`"${entry}": drop the markdown emphasis; frontmatter is plain text`);
  if (head.includes(";")) out.push(`"${entry}": one book per entry, and notes go in the parenthetical; use a list for several books`);
  if (/[()]/.test(head)) out.push(`"${entry}": one parenthetical only, and it comes last`);
  if (/ - |^(Optional|Recommended|Required|Supplemental)\b/i.test(head))
    out.push(`"${entry}": the note goes in the parenthetical, not before the authors or after a dash`);
  if (/\b(free|paywalled|not free)\b/i.test(entry))
    out.push(`"${entry}": don't say whether a book is free; note only gating on material the course makes itself`);
  return out;
}
// The material keys an offering's record shares with the top level; `where` prefixes the messages ("past.Spring 2022.").
function contentProblems(rec: Record<string, Y>, where: string): string[] {
  const out: string[] = [];
  for (const k of MAT_TYPES) if (k in rec) out.push(...materialProblems(rec[k]).map((m) => `${where}${k}: ${m}`));
  for (const k of ["sites", "self_study"]) if (k in rec) out.push(...linkListProblems(k, rec[k]).map((m) => `${where}${k}: ${m}`));
  const t = rec.textbook;
  if ("textbook" in rec && !(typeof t === "string" ? t.trim() : Array.isArray(t) && t.length && t.every((x) => typeof x === "string" && x.trim())))
    out.push(`${where}textbook must be a title or a non-empty list of titles; omit the key when there's none`);
  else if ("textbook" in rec)
    for (const e of typeof t === "string" ? [t] : t as string[])
      out.push(...textbookProblems(e).map((m) => `${where}textbook: ${m}`));
  return out;
}

// Prose words only: no headings, comments, link targets or bare URLs; a token counts if it holds a letter or digit.
const proseWords = (s: string) => s.replace(/<!--[\s\S]*?-->/g, " ")
  .replace(/!?\[([^\]\n]*)\]\([^)\s]*\)/g, "$1")
  .replace(/<https?:\/\/[^>\s]*>/g, " ").replace(/https?:\/\/\S+/g, " ")
  .split(/\s+/).filter((w) => /[\p{L}\p{N}]/u.test(w)).length;
// Warnings for a body over its word ceilings: the part above ## Source notes, and each section in it.
function lengthProblems(body: string): string[] {
  const sections: [string, string[]][] = [["summary", []]];
  for (const line of body.split("\n")) {
    const h = /^## (.+)$/.exec(line);
    if (h) sections.push([h[1].trim(), []]);
    else if (!/^#{1,6} /.test(line)) sections.at(-1)![1].push(line);
  }
  const cut = sections.findIndex(([name]) => name === "Source notes");
  const counted = sections.slice(0, cut < 0 ? undefined : cut).map(([name, lines]) => [name, proseWords(lines.join("\n"))] as const);
  const total = counted.reduce((sum, [, n]) => sum + n, 0);
  const out = total > TOTAL_WORDS ? [`body: ${total} words above ## Source notes, over the ${TOTAL_WORDS}-word ceiling (AGENTS.md → Body)`] : [];
  for (const [name, n] of counted)
    if (n > (SECTION_WORDS[name] ?? Infinity))
      out.push(`${name === "summary" ? "the summary" : `## ${name}`}: ${n} words, over its ${SECTION_WORDS[name]}-word ceiling (AGENTS.md → Body)`);
  return out;
}

for (const d of pages) {
  const f = d.fm!, isCourse = f.type === "Course", legacy = isLegacy(f);
  const order = legacy ? LEGACY_KEY_ORDER : COURSE_KEYS, optional = legacy ? LEGACY_OPTIONAL : OPTIONAL;
  for (const k of order) {
    if (!isCourse && COURSE_ONLY.includes(k)) { if (k in f) err(d, `${k} is not used on a Registration`); continue; }
    if (!(k in f) && !optional.includes(k) && !(!isCourse && k === "prerequisites")) err(d, `missing ${k}`);
  }
  if (!isCourse && "materials" in f) err(d, "materials is not used on a Registration");
  for (const k of ["cross_listed", "formerly"]) if (k in f && !arr(f[k]).length) warn(d, `${k} is empty; omit the key`);
  // One course, one page: a cross-listed or former code never has a page of its own (AGENTS.md → Files and links).
  for (const k of ["cross_listed", "formerly"])
    for (const c of arr(f[k]).map(String)) {
      const other = coursePages.get(c);
      if (c === str(f.code)) err(d, `${k} lists the page's own code ${c}; drop it`);
      else if (other) err(d, `${k} ${c} has its own page, ${other.rel}: a course gets one page, so merge the two or drop the code`);
    }
  const want = codeAliases(f);
  if (JSON.stringify(arr(f.aliases).map(String)) !== JSON.stringify(want) || ("aliases" in f && !want.length))
    err(d, want.length ? `aliases must be ${JSON.stringify(want)}: the code without its space, then each cross_listed and formerly code without and with it; run make build`
      : "aliases is omitted when empty; run make build");
  // Keys of the other schema are errors, reported by lintLegacy and lintCourse.
  for (const k of Object.keys(f))
    if (!order.includes(k) && !(k === "materials" && !legacy) && !(legacy && FLAT_KEYS.includes(k)))
      warn(d, `unknown key ${k} (see AGENTS.md → Course pages)`);
  const known = Object.keys(f).filter((k) => order.includes(k));
  if (known.join() !== [...known].sort((a, b) => order.indexOf(a) - order.indexOf(b)).join()) {
    if (legacy) warn(d, "frontmatter keys out of order (see AGENTS.md)");
    else err(d, "frontmatter keys out of order (see AGENTS.md → Frontmatter); run make build");
  }
  if (!d.rel.startsWith("courses/")) err(d, "course pages live in courses/");
  // A previous holder of a reused number is filed as "<code> (<its last term>).md".
  if (![`${str(f.code)}.md`, `${str(f.code)} (${str(f.term)}).md`].includes(basename(d.rel)))
    err(d, `filename must be "${str(f.code)}.md", or "${str(f.code)} (${str(f.term)}).md" for a reused number's previous course`);
  if (!["draft", "stable", "deprecated"].includes(str(f.status))) err(d, `bad status: ${str(f.status)}`);
  if (!["graduate", "undergraduate"].includes(str(f.level))) err(d, `bad level: ${str(f.level)}`);
  if (!isStamp(str(obj(f.generated)?.at))) err(d, "generated.at must be an ISO timestamp");
  if (f.verified && !arr(f.verified).concat(obj(f.verified) ? [f.verified] : []).every((v) => isStamp(str(obj(v)?.at))))
    err(d, "verified.at must be an ISO timestamp");

  if (!isCourse) continue; // registrations carry no offering, materials or syllabus
  if (CURRENT && f.term === CURRENT && typeof f.schedule !== "string")
    err(d, "schedule is required for the current term (use an empty string if unknown or no fixed meeting)");
  const offered = arr(f.terms_offered).map(String);
  for (const t of offered) {
    if (isNaN(termOrd(t))) err(d, `bad term name: ${t}`);
    else if (CURRENT && termOrd(t) > termOrd(CURRENT)) err(d, `${t} is after current_term ${CURRENT}`);
    else if (CUTOFF && termOrd(t) < termOrd(CUTOFF)) err(d, `${t} is before cutoff_term ${CUTOFF}; drop it (older history goes in Source notes)`);
  }
  const ords = offered.map(termOrd);
  if (ords.some((o, i) => i > 0 && o <= ords[i - 1])) err(d, "terms_offered must be chronological and unique");
  if (str(f.term) !== (offered.at(-1) ?? "")) err(d, "term must be the last entry of terms_offered");

  if (f.homepage && !/^https?:\/\//.test(str(f.homepage))) err(d, "homepage must be an http(s) URL");
  if (!/^## Syllabus$/m.test(d.body)) warn(d, "no ## Syllabus section");
  const n = arr(f.topics).length;
  if (n && (n < 4 || n > 10)) warn(d, `topics: ${n} entries, want 4-10`);

  if (legacy) lintLegacy(d);
  else lintCourse(d);
}

// A course page in the flat schema: `access`, the material keys, `past`, `checked` and `exceptions`.
function lintCourse(d: Doc) {
  const f = d.fm!, term = str(f.term), offered = arr(f.terms_offered).map(String);
  if ("materials" in f) err(d, "materials is the legacy map, and the page has a top-level access: move what's left of it to the flat keys");
  if (!ACCESS_LEVELS.includes(str(f.access)))
    err(d, `bad access: ${str(f.access)} (want ${ACCESS_LEVELS.join(", ")}; a course with no materials is a Registration)`);
  for (const m of contentProblems(f, "")) err(d, m);

  // `past`: sparse records of older offerings, each verified for its own term.
  const past = "past" in f ? obj(f.past) : {};
  if (!past) err(d, "past must be a map from term names to records");
  let preCutoff = false;
  for (const [t, r] of Object.entries(past ?? {})) {
    const rec = obj(r);
    if (isNaN(termOrd(t))) { err(d, `past: "${t}" is not a term name, e.g. Spring 2022`); continue; }
    if (!rec || !Object.keys(rec).length) { err(d, `past.${t} is empty; drop it`); continue; }
    for (const k of Object.keys(rec))
      if (!PAST_KEYS.includes(k)) err(d, `past.${t}.${k} is not allowed in past (allowed: ${PAST_KEYS.join(", ")})`);
    if (CUTOFF && termOrd(t) < termOrd(CUTOFF)) {
      preCutoff = true;
      const facts = Object.keys(rec).filter((k) => PAST_KEYS.includes(k) && !PRE_CUTOFF_KEYS.includes(k));
      if (facts.length) err(d, `past.${t} is before cutoff_term ${CUTOFF}, so it holds material types, sites and self_study only, not ${facts.join(", ")}`);
      if (!str(obj(f.exceptions)?.pre_cutoff).trim())
        warn(d, `past.${t} is before cutoff_term ${CUTOFF}: add exceptions.pre_cutoff with the reason it still counts, or mention it in the Materials section and drop the record`);
    } else if (!(termOrd(t) < termOrd(term))) err(d, `past.${t} is not earlier than term ${term || '""'}: the top level describes the page's own offering`);
    else if (!offered.includes(t)) err(d, `past.${t} is not in terms_offered: add the offering there once a source shows it ran, or file the material elsewhere`);
    if ("homepage" in rec && !isUrl(rec.homepage)) err(d, `past.${t}.homepage must be an http(s) URL`);
    // Tables show a past title as it is, so it's the bare catalog title: no code prefix, no cross-listed codes after it.
    const title = str(rec.title), code = /^[A-Z&]+ \d+[A-Z]*: /.exec(title)?.[0], cross = /\s*\([A-Z&]+ \d+[A-Z]*(, [A-Z&]+ \d+[A-Z]*)*\)$/.exec(title)?.[0];
    if ("title" in rec && !title.trim()) err(d, `past.${t}.title must be the catalog title, without the code`);
    else if (code) err(d, `past.${t}.title starts with "${code}": drop it, tables show the title as it is`);
    else if (cross) err(d, `past.${t}.title ends with the cross-listed codes "${cross.trim()}": drop them`);
    if ("instructors" in rec && !(Array.isArray(rec.instructors) && rec.instructors.every((x) => typeof x === "string" && x.trim())))
      err(d, `past.${t}.instructors must be a list of names, [] when the catalog names nobody`);
    if ("topics" in rec && !(Array.isArray(rec.topics) && rec.topics.length && rec.topics.every((x) => typeof x === "string" && x.trim())))
      err(d, `past.${t}.topics must be a non-empty list of phrases`);
    for (const m of contentProblems(rec, `past.${t}.`)) err(d, m);
  }
  // Every older offering since cutoff_term names its professor, so its term-table row doesn't borrow the current one.
  for (const t of offered)
    if (termOrd(t) < termOrd(term) && !(CUTOFF && termOrd(t) < termOrd(CUTOFF)) && !("instructors" in (obj(past?.[t]) ?? {})))
      warn(d, `past.${t}.instructors is missing: record that offering's catalog instructors ([] if it names nobody), and its title if it differs`);

  if ("exceptions" in f) {
    const ex = obj(f.exceptions);
    if (!ex) err(d, "exceptions must be a map from names to reasons");
    for (const [k, v] of Object.entries(ex ?? {})) {
      if (!EXCEPTIONS.includes(k)) err(d, `exceptions.${k}: unknown name (known: ${EXCEPTIONS.join(", ")})`);
      else if (typeof v !== "string" || !v.trim()) err(d, `exceptions.${k} needs a reason`);
    }
    if (ex && "pre_cutoff" in ex && !preCutoff) warn(d, `exceptions.pre_cutoff silences nothing: no past record is before cutoff_term ${CUTOFF}; drop it`);
  }

  // `checked`: the last completed access check. Required once anything is rated; lint then prompts rechecks.
  const records = [f, ...Object.values(past ?? {}).map((r) => obj(r) ?? {})];
  const rated = f.access !== "unknown" || records.some((r) => MAT_TYPES.some((k) => k in r));
  if (!("checked" in f)) {
    if (rated) err(d, "checked is required once anything is rated");
    else warn(d, "materials never checked (access: unknown and no checked)");
  } else if (!isDate(f.checked)) err(d, "checked must be YYYY-MM-DD");
  else {
    const checked = str(f.checked), end = termEnd.get(term) ?? "";
    if ((Date.now() - Date.parse(checked)) / 864e5 > 120) warn(d, "materials checked over 120 days ago");
    if (isDate(end) && today > end && checked < end)
      warn(d, `materials checked ${checked}, before ${term} ended (${end}): recheck them now that the offering is over`);
    // An entry's own checked records a narrower recheck, so it only means something when it's later than the page's.
    for (const [where, r] of [["", f], ...Object.entries(past ?? {}).map(([t, x]) => [`past.${t}.`, obj(x) ?? {}])] as [string, Record<string, Y>][])
      for (const k of MAT_TYPES) {
        const own = obj(r[k])?.checked;
        if (isDate(own) && str(own) <= checked) warn(d, `${where}${k}.checked ${str(own)} is not after the page's checked ${checked}, which covers it; drop it`);
      }
  }

  // The rating system stays out of the reader's sections; the icons belong in the generated tables.
  const icons = RATING_ICONS.filter((i) => d.body.includes(i));
  if (icons.length) err(d, `rating icon in the body (${icons.join(" ")}): say what a reader can open instead (AGENTS.md → Body)`);
  for (const m of lengthProblems(d.body)) warn(d, m);
}

// TEMPORARY (legacy pages): today's checks of the `materials` map, plus errors for any flat-schema key.
function lintLegacy(d: Doc) {
  const f = d.fm!;
  for (const k of FLAT_KEYS)
    if (k in f) err(d, `${k} belongs to the flat schema, but with no top-level access the page is still legacy: finish the migration, don't mix the two`);
  const mat = obj(f.materials);
  if (!mat) { err(d, "materials must be a map"); return; }
  const typed = Object.keys(mat).some((k) => LEGACY_MAT_TYPES.includes(k));
  if (!("checked" in mat)) {
    if (mat.access !== "unknown" || typed) err(d, "materials.checked is required once anything is rated");
    else warn(d, "materials never checked");
  } else if (!isDate(str(mat.checked))) err(d, "materials.checked must be YYYY-MM-DD");
  else if ((Date.now() - Date.parse(str(mat.checked))) / 864e5 > 120) warn(d, "materials checked over 120 days ago");
  if (!RATINGS.includes(str(mat.access)) || mat.access === "none")
    err(d, `bad materials.access: ${str(mat.access)} (a course with no materials is a Registration)`);
  const badTerm = (t: string) => isNaN(termOrd(t)) || termOrd(t) > termOrd(CURRENT);
  if ("term" in mat && badTerm(str(mat.term))) err(d, "materials.term: bad term");
  // `sites`: other sites a reader would use. `term` is optional (absent = the current offering).
  for (const p of arr(mat.sites)) {
    const o = obj(p);
    if (!o || !/^https?:\/\//.test(str(o.url))) err(d, "materials.sites entries need an http(s) url");
    else if ("term" in o && badTerm(str(o.term))) err(d, "materials.sites: bad term");
  }
  for (const [k, v] of Object.entries(mat)) {
    if (["checked", "access", "term", "sites"].includes(k)) continue;
    if (!LEGACY_MAT_TYPES.includes(k)) { err(d, `unknown material type: ${k}`); continue; }
    const o = obj(v);
    const rating = o ? str(o.access) : str(v);
    if (!RATINGS.includes(rating)) err(d, `materials.${k}: bad rating ${rating}`);
    if (o?.term && badTerm(str(o.term))) err(d, `materials.${k}: bad term`);
    if (o?.url && !/^https?:\/\//.test(str(o.url))) err(d, `materials.${k}: url must be http(s)`);
  }
}

// ---------- Related sections ----------

for (const d of pages) for (const msg of relatedProblems(d.text)) err(d, msg);

// ---------- shared codes ----------

// A code that 2 or more pages list in cross_listed or formerly. A split course's successors all list it in
// formerly, which is the rule. Anything else is usually a renumbering the wiki missed, or else a partner
// department's number reused for an unrelated course, which exceptions.shared_code records with the reason.
const claims = new Map<string, { d: Doc; key: string }[]>();
for (const d of pages)
  for (const key of ["cross_listed", "formerly"])
    for (const c of arr(d.fm![key]).map(String)) claims.set(c, [...(claims.get(c) ?? []), { d, key }]);
const sharing = new Set<Doc>();
for (const [c, cs] of claims) {
  if (cs.length < 2 || cs.every((x) => x.key === "formerly")) continue;
  for (const { d, key } of cs) {
    sharing.add(d);
    const others = cs.filter((x) => x.d !== d).map((x) => `${x.d.rel} (${x.key})`).join(", ");
    if (!str(obj(d.fm!.exceptions)?.shared_code).trim())
      warn(d, `${key} ${c} is also listed by ${others}: a renumbered course belongs on one page with the old code in formerly; a reused partner number gets exceptions.shared_code with the reason`);
  }
}
for (const d of pages)
  if ("shared_code" in (obj(d.fm!.exceptions) ?? {}) && !sharing.has(d))
    warn(d, "exceptions.shared_code silences nothing: no cross_listed or formerly code here is listed by another page; drop it");

// ---------- Prerequisites sections ----------

// Every course in `prerequisites` that has a page must be linked from ## Prerequisites, so graph views
// (Obsidian's among them) connect the two pages. A cross-listed or former code resolves to the page that
// carries it, and the suggested fix names both codes: [CS 180](CS%20180.md) (EE 180).
const pageFor = new Map(coursePages);
for (const d of pages)
  if (basename(d.rel) === `${str(d.fm!.code)}.md`)
    for (const c of otherCodes(d)) if (!pageFor.has(c)) pageFor.set(c, d);
for (const d of courses) {
  const lines = d.body.split("\n"), head = lines.indexOf("## Prerequisites");
  const end = lines.findIndex((l, i) => i > head && /^## /.test(l));
  const section = head < 0 ? "" : stripCode(lines.slice(head + 1, end < 0 ? undefined : end).join("\n"));
  const linked = new Set<string>();
  for (const m of section.matchAll(/\]\(([^)\s]+)\)/g)) try { linked.add(resolveLink(d.path, m[1])); } catch { /* reported above */ }
  const seen = new Set<Doc>();
  for (const req of arr(d.fm!.prerequisites).map(String))
    for (const m of req.matchAll(/(?<![A-Za-z0-9&])([A-Z][A-Z&]*) (\d+[A-Z]*)(?![A-Za-z0-9])/g)) {
      const code = `${m[1]} ${m[2]}`, target = pageFor.get(code), own = str(target?.fm?.code);
      if (!target || target === d || seen.has(target) || linked.has(target.path)) continue;
      seen.add(target);
      const want = `[${own}](${hrefTo(d, target)})${code === own ? "" : ` (${code})`}`;
      err(d, `prerequisites names ${code}, but ${head < 0 ? "there is no ## Prerequisites section to link it from" : "## Prerequisites doesn't link it"}: ${want}`);
    }
}

// ---------- program pages ----------

// Academic year of a term: Autumn 2026 → 2026-27, Winter–Summer 2027 → 2026-27.
const academicYear = (t: string) => {
  const m = /^(\w+) (\d{4})$/.exec(t);
  if (!m) return "";
  const start = m[1] === "Autumn" ? Number(m[2]) : Number(m[2]) - 1;
  return `${start}-${String(start + 1).slice(2)}`;
};
const progs = programs(docs);
if (agents && str(agents.fm?.primary_specialization) && !progs.primary)
  err(agents, `primary_specialization "${str(agents.fm!.primary_specialization)}" matches no Specialization page`);
const keys = new Set<string>();
for (const p of [progs.program, ...progs.specs].filter((d): d is Doc => !!d)) {
  const f = p.fm!;
  if (!p.rel.startsWith("programs/")) err(p, "program pages live in programs/");
  if (str(f.edition) !== academicYear(CURRENT)) warn(p, `edition ${str(f.edition)} is not the current academic year ${academicYear(CURRENT)}; check for a newer sheet`);
  if (!arr(f.sources).length) err(p, "missing sources (the program sheet)");
  // Build ignores the pre-`mscs_` names, so a page still using one would silently lose its tags.
  for (const k of ["foundations", "si", "breadth", "excluded", "depth", "approval"])
    if (k in f) err(p, `${k} is now mscs_${k}`);
  const lists: [string, Y | undefined][] = f.type === "Program"
    ? [["mscs_foundations", f.mscs_foundations], ["mscs_si", f.mscs_si], ["mscs_excluded", f.mscs_excluded], ...Object.entries(obj(f.mscs_breadth) ?? {}).map(([k, v]) => [`mscs_breadth.${k}`, v] as [string, Y])]
    : [["mscs_approval", f.mscs_approval], ...Object.entries(obj(f.mscs_depth) ?? {}).map(([k, v]) => [`mscs_depth.${k}`, v] as [string, Y])];
  for (const [name, list] of lists)
    for (const e of arr(list)) if (!/^[A-Z&]+ \d+[A-Z]*\*?$/.test(String(e))) err(p, `${name}: bad entry "${String(e)}"`);
  if (f.type === "Program" && !obj(f.mscs_breadth)) err(p, "missing mscs_breadth");
  if (f.type === "Specialization") {
    if (!str(f.key) || keys.has(str(f.key))) err(p, `missing or duplicate key "${str(f.key)}"`);
    keys.add(str(f.key));
    if (!obj(f.mscs_depth)) err(p, "missing mscs_depth");
    const all = new Set(Object.values(obj(f.mscs_depth) ?? {}).flatMap((l) => arr(l).map(String)));
    for (const e of arr(f.mscs_approval)) if (!all.has(String(e))) err(p, `mscs_approval entry "${String(e)}" is in no mscs_depth list`);
  }
}
if (progs.program && docs.filter((d) => d.fm?.type === "Program").length > 1) err(progs.program, "only one Program page is supported");

// ---------- generated tables ----------

for (const page of docs.filter((d) => d.rel.startsWith("terms/") && basename(d.rel) !== "index.md")) {
  if (page.fm?.type !== "Term" || isNaN(termOrd(pageTerm(page)))) { err(page, "term pages need type: Term and a term name as the filename, e.g. Autumn 2026.md"); continue; }
  if ("term" in page.fm) err(page, "term is not used on a term page: the filename is the term");
  const validDate = (value: Y | undefined) => isDate(str(value)) && Number.isFinite(Date.parse(str(value)))
    && new Date(str(value)).toISOString().slice(0, 10) === value;
  for (const key of ["start_date", "end_date"])
    if (!validDate(page.fm[key])) err(page, `${key} must be a valid date in YYYY-MM-DD format`);
  if (validDate(page.fm.start_date) && validDate(page.fm.end_date) && str(page.fm.start_date) > str(page.fm.end_date))
    err(page, "start_date must be on or before end_date");
  // is_current_term, num_undergraduate and num_graduate are generated, so the out-of-date check below
  // enforces them, and with them that only the current_term page is current.
}
const blockProblems: string[] = [];
for (const [path, text] of render(ROOT, docs, blockProblems))
  if (!existsSync(path) || readFileSync(path, "utf8") !== text)
    problems.push({ level: "error", file: relative(ROOT, path), msg: "generated content or frontmatter formatting out of date: run node scripts/build.ts" });
for (const p of blockProblems) {
  const [file, ...msg] = p.split(": ");
  problems.push({ level: "error", file, msg: msg.join(": ") });
}

// ---------- report ----------

for (const p of problems.sort((a, b) => a.file.localeCompare(b.file)))
  console.log(`${p.level === "error" ? "ERROR" : "warn "} ${p.file}: ${p.msg}`);
// TEMPORARY: the migration's progress (.agents/2026-09-30.materials.md §9.1).
const legacy = courses.filter((d) => isLegacy(d.fm!)).length;
if (legacy) console.log(`${legacy} of ${courses.length} course pages not yet migrated (.agents/2026-09-30.materials.md)`);
const errors = problems.filter((p) => p.level === "error").length;
console.log(`${docs.length} files, ${errors} errors, ${problems.length - errors} warnings`);
process.exit(errors ? 1 : 0);
