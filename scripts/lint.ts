// Lint the bundle (the repo root): OKF conformance, links, and the rules in AGENTS.md.
// Mirrors the schema in AGENTS.md: change both together.
// Usage: node scripts/lint.ts [bundle-dir]   (Node >= 23, no dependencies)
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative, basename, dirname } from "node:path";
import { load, render, programs, termOrd, pageTerm, str, arr, obj, ICON, MAT_TYPES, stripCode, resolveLink as resolveIn, type Y, type Doc } from "./wiki.ts";

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
const CURRENT = str(docs.find((d) => d.rel === "AGENTS.md")?.fm?.current_term);

const isDate = (s: Y) => typeof s === "string" && /^\d{4}-\d{2}-\d{2}$/.test(s);
const isStamp = (s: Y) => typeof s === "string" && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?Z$/.test(s);
const RATINGS = Object.keys(ICON);
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
    const href = encodeURI(relative(dirname(d.path), target.path)).replace(/\(/g, "%28").replace(/\)/g, "%29");
    warn(d, `unlinked course reference: ${code}; link as [${code}](${href})`);
  }
}

// Binaries over 10 MB stay out of the repo: the wrapper keeps bytes, sha256 and a summary instead.
if (referencesPresent)
  for (const n of readdirSync(refDir))
    if (!n.endsWith(".md") && statSync(join(refDir, n)).size > 10e6)
      problems.push({ level: "warn", file: `references/${n}`, msg: "binary over 10 MB: keep bytes, sha256 and a summary in the wrapper, not the file" });

// ---------- course pages ----------

const KEY_ORDER = ["type", "code", "title", "description", "cross_listed", "level", "term", "terms_offered", "instructors",
  "schedule", "units", "grading", "prerequisites", "homepage", "materials", "topics", "tags", "sources", "status",
  "generated", "verified"];
const OPTIONAL = ["cross_listed", "schedule", "homepage", "verified"];
// Registrations (CPT, independent study, TGR…) carry no teaching content, so they skip these keys.
// `term`/`terms_offered` are in the list because they run every term: tracking which would churn
// every page on every sweep, and build never reads them for a registration.
const COURSE_ONLY = ["term", "terms_offered", "instructors", "schedule", "homepage", "materials", "topics"];
const pages = docs.filter((d) => d.fm?.type === "Course" || d.fm?.type === "Registration");
const courses = pages.filter((d) => d.fm!.type === "Course");

for (const d of pages) {
  const f = d.fm!, isCourse = f.type === "Course";
  for (const k of KEY_ORDER) {
    if (!isCourse && COURSE_ONLY.includes(k)) { if (k in f) err(d, `${k} is not used on a Registration`); continue; }
    if (!(k in f) && !OPTIONAL.includes(k) && !(!isCourse && k === "prerequisites")) err(d, `missing ${k}`);
  }
  if ("cross_listed" in f && !arr(f.cross_listed).length) warn(d, "cross_listed is empty; omit the key");
  for (const k of Object.keys(f)) if (!KEY_ORDER.includes(k)) warn(d, `unknown key ${k} (see AGENTS.md → Course pages)`);
  const known = Object.keys(f).filter((k) => KEY_ORDER.includes(k));
  if (known.join() !== [...known].sort((a, b) => KEY_ORDER.indexOf(a) - KEY_ORDER.indexOf(b)).join())
    warn(d, "frontmatter keys out of order (see AGENTS.md)");
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
  }
  const ords = offered.map(termOrd);
  if (ords.some((o, i) => i > 0 && o <= ords[i - 1])) err(d, "terms_offered must be chronological and unique");
  if (str(f.term) !== (offered.at(-1) ?? "")) err(d, "term must be the last entry of terms_offered");

  if (f.homepage && !/^https?:\/\//.test(str(f.homepage))) err(d, "homepage must be an http(s) URL");
  if (!/^## Syllabus$/m.test(d.body)) warn(d, "no ## Syllabus section");
  const n = arr(f.topics).length;
  if (n && (n < 4 || n > 10)) warn(d, `topics: ${n} entries, want 4-10`);

  const mat = obj(f.materials);
  if (!mat) { err(d, "materials must be a map"); continue; }
  const typed = Object.keys(mat).some((k) => MAT_TYPES.includes(k));
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
    if (!MAT_TYPES.includes(k)) { err(d, `unknown material type: ${k}`); continue; }
    const o = obj(v);
    const rating = o ? str(o.access) : str(v);
    if (!RATINGS.includes(rating)) err(d, `materials.${k}: bad rating ${rating}`);
    if (o?.term && badTerm(str(o.term))) err(d, `materials.${k}: bad term`);
    if (o?.url && !/^https?:\/\//.test(str(o.url))) err(d, `materials.${k}: url must be http(s)`);
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
const conv = docs.find((d) => d.rel === "AGENTS.md");
if (conv && str(conv.fm?.primary_specialization) && !progs.primary)
  err(conv, `primary_specialization "${str(conv.fm!.primary_specialization)}" matches no Specialization page`);
const keys = new Set<string>();
for (const p of [progs.program, ...progs.specs].filter((d): d is Doc => !!d)) {
  const f = p.fm!;
  if (!p.rel.startsWith("programs/")) err(p, "program pages live in programs/");
  if (str(f.edition) !== academicYear(CURRENT)) warn(p, `edition ${str(f.edition)} is not the current academic year ${academicYear(CURRENT)}; check for a newer sheet`);
  if (!arr(f.sources).length) err(p, "missing sources (the program sheet)");
  const lists: [string, Y | undefined][] = f.type === "Program"
    ? [["foundations", f.foundations], ["si", f.si], ["excluded", f.excluded], ...Object.entries(obj(f.breadth) ?? {}).map(([k, v]) => [`breadth.${k}`, v] as [string, Y])]
    : [["approval", f.approval], ...Object.entries(obj(f.depth) ?? {}).map(([k, v]) => [`depth.${k}`, v] as [string, Y])];
  for (const [name, list] of lists)
    for (const e of arr(list)) if (!/^[A-Z&]+ \d+[A-Z]*\*?$/.test(String(e))) err(p, `${name}: bad entry "${String(e)}"`);
  if (f.type === "Program" && !obj(f.breadth)) err(p, "missing breadth");
  if (f.type === "Specialization") {
    if (!str(f.key) || keys.has(str(f.key))) err(p, `missing or duplicate key "${str(f.key)}"`);
    keys.add(str(f.key));
    if (!obj(f.depth)) err(p, "missing depth");
    const all = new Set(Object.values(obj(f.depth) ?? {}).flatMap((l) => arr(l).map(String)));
    for (const e of arr(f.approval)) if (!all.has(String(e))) err(p, `approval entry "${String(e)}" is in no depth list`);
  }
}
if (progs.program && docs.filter((d) => d.fm?.type === "Program").length > 1) err(progs.program, "only one Program page is supported");

// ---------- generated tables ----------

for (const page of docs.filter((d) => d.rel.startsWith("terms/"))) {
  if (page.fm?.type !== "Term" || isNaN(termOrd(pageTerm(page)))) { err(page, "term pages need type: Term and a term name as the filename, e.g. Autumn 2026.md"); continue; }
  if ("term" in page.fm) err(page, "term is not used on a term page: the filename is the term");
  const validDate = (value: Y | undefined) => isDate(str(value)) && Number.isFinite(Date.parse(str(value)))
    && new Date(str(value)).toISOString().slice(0, 10) === value;
  for (const key of ["start_date", "end_date"])
    if (!validDate(page.fm[key])) err(page, `${key} must be a valid date in YYYY-MM-DD format`);
  if (validDate(page.fm.start_date) && validDate(page.fm.end_date) && str(page.fm.start_date) > str(page.fm.end_date))
    err(page, "start_date must be on or before end_date");
  const want = termOrd(pageTerm(page)) < termOrd(CURRENT) ? "true" : "false";
  if (!["true", "false"].includes(str(page.fm.concluded))) err(page, "missing concluded: true | false");
  else if (page.fm.concluded !== want) err(page, `concluded should be ${want} (current_term is ${CURRENT})`);
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
const errors = problems.filter((p) => p.level === "error").length;
console.log(`${docs.length} files, ${errors} errors, ${problems.length - errors} warnings`);
process.exit(errors ? 1 : 0);
