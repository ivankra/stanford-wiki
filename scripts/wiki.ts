// Shared by lint.ts and build.ts: load the bundle (the repo root) and render its generated content (tables, MSCS tags).
// Formats follow AGENTS.md → Tables and Programs: change both together.
import { readFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { join, dirname, relative, basename } from "node:path";

export type Y = string | Y[] | { [k: string]: Y };
export type Doc = { path: string; rel: string; fm: Record<string, Y> | null; fmError?: string; body: string; text: string };

// ---------- minimal YAML (the subset AGENTS.md allows) ----------

function splitTop(s: string): string[] {
  const out: string[] = [];
  let depth = 0, q = "", cur = "", escaped = false;
  for (const c of s) {
    if (q) {
      if (escaped) escaped = false;
      else if (q === '"' && c === "\\") escaped = true;
      else if (c === q) q = "";
      cur += c;
      continue;
    }
    if (c === '"' || c === "'") q = c;
    else if (c === "[" || c === "{") depth++;
    else if (c === "]" || c === "}") depth--;
    else if (c === "," && depth === 0) { out.push(cur); cur = ""; continue; }
    cur += c;
  }
  if (cur.trim()) out.push(cur);
  return out.map((x) => x.trim());
}

function splitKey(s: string): [string, string] | null {
  let q = "";
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (q) { if (c === q) q = ""; continue; }
    if (c === '"' || c === "'") q = c;
    else if (c === ":" && (i === s.length - 1 || s[i + 1] === " ")) return [s.slice(0, i).trim(), s.slice(i + 1).trim()];
  }
  return null;
}

function scalar(s: string): Y {
  s = s.trim();
  if (s.startsWith("[") && s.endsWith("]")) return splitTop(s.slice(1, -1)).map(scalar);
  if (s.startsWith("{") && s.endsWith("}")) {
    const o: Record<string, Y> = {};
    for (const part of splitTop(s.slice(1, -1))) {
      const kv = splitKey(part);
      if (!kv) throw new Error(`bad flow map entry: ${part}`);
      o[kv[0]] = scalar(kv[1]);
    }
    return o;
  }
  if (/^[[{]/.test(s)) throw new Error(`unclosed flow collection: ${s}`);
  if (/^".*"$/.test(s)) return JSON.parse(s);
  if (/^'.*'$/.test(s)) return s.slice(1, -1).replace(/''/g, "'");
  return s.replace(/\s+#.*$/, "");
}

export function parseYaml(text: string): Record<string, Y> {
  const lines = text.split("\n").filter((l) => l.trim() && !/^\s*#/.test(l))
    .map((l) => ({ indent: l.length - l.trimStart().length, text: l.trimStart() }));
  let i = 0;
  const isItem = (s: string) => s === "-" || s.startsWith("- ");
  const block = (indent: number): Y => {
    const sequence = isItem(lines[i].text);
    const list: Y[] = [], map: Record<string, Y> = {};
    while (i < lines.length && lines[i].indent >= indent) {
      const line = lines[i];
      if (line.indent !== indent || isItem(line.text) !== sequence)
        throw new Error(`unexpected indentation or collection entry: ${line.text}`);
      if (sequence) {
        const item = line.text.slice(1).trimStart();
        // Treat "- key: value" as an indented map, including subsequent fields and nested values.
        if (!/^[\[{'"]/.test(item) && splitKey(item)) {
          lines[i] = { indent: indent + 2, text: item };
          list.push(block(indent + 2));
        } else {
          i++;
          list.push(item ? scalar(item) : i < lines.length && lines[i].indent > indent ? block(lines[i].indent) : "");
        }
      } else {
        const kv = splitKey(line.text);
        if (!kv) throw new Error(`unexpected line: ${line.text}`);
        if (Object.hasOwn(map, kv[0])) throw new Error(`duplicate key: ${kv[0]}`);
        i++;
        map[kv[0]] = kv[1] ? scalar(kv[1]) : i < lines.length && lines[i].indent > indent ? block(lines[i].indent) : "";
      }
    }
    return sequence ? list : map;
  };
  if (!lines.length) return {};
  if (lines[0].indent !== 0) throw new Error("frontmatter must start at indentation zero");
  const result = block(0);
  if (typeof result !== "object" || Array.isArray(result)) throw new Error("frontmatter must be a map");
  return result;
}

// Canonical block YAML; retain the schema's scalar types while quoting ambiguous strings.
function yamlScalar(value: string, path: string[]): string {
  if (path.length === 1 && path[0] === "is_current_term" && /^(true|false)$/.test(value)) return value;
  if (path.length === 1 && ["bytes", "num_undergraduate", "num_graduate"].includes(path[0]) && /^\d+$/.test(value)) return value;
  const quote = path.at(-1) === "units" || !value || value.trim() !== value
    || /^[\-?:,\[\]{}#&*!|>'"%@`]/.test(value) || /:($|\s)|#|[\x00-\x1f\x7f]/.test(value)
    || /^(?:null|true|false|yes|no|on|off|y|n|~|[-+]?\.inf|\.nan)$/i.test(value)
    || /^[+-]?(?:\d|\.\d)/.test(value);
  return quote ? JSON.stringify(value) : value;
}

export function yamlLines(value: Y, path: string[] = []): string[] {
  if (typeof value === "string") return [yamlScalar(value, path)];
  if (Array.isArray(value)) {
    if (!value.length) return ["[]"];
    return value.flatMap((item) => {
      const [first, ...rest] = yamlLines(item, [...path, "[]"]);
      return [`- ${first}`, ...rest.map((line) => `  ${line}`)];
    });
  }
  let entries = Object.entries(value);
  if (!entries.length) return path.length ? ["{}"] : [];
  // `materials` is the one map with a meaningful key order; sort it so hand-written pages don't
  // have to. Keys the schema doesn't know keep their relative order at the end, where lint flags them.
  if (path.length === 1 && path[0] === "materials") {
    const rank = (k: string) => (MAT_KEYS.includes(k) ? MAT_KEYS.indexOf(k) : MAT_KEYS.length);
    entries = entries.map((e, i) => [e, i] as const).sort(([a, i], [b, j]) => rank(a[0]) - rank(b[0]) || i - j).map(([e]) => e);
  }
  return entries.flatMap(([key, item]) => {
    const lines = yamlLines(item, [...path, key]);
    const inline = typeof item === "string" || (Array.isArray(item) ? !item.length : !Object.keys(item).length);
    return inline ? [`${key}: ${lines[0]}`] : [`${key}:`, ...lines.map((line) => `  ${line}`)];
  });
}

// ---------- load ----------

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((n) => {
    // Dot-directories and old/ (the previous wiki, local and gitignored) aren't part of the bundle.
    if (n.startsWith(".") || n === "old") return [];
    const p = join(dir, n);
    return statSync(p).isDirectory() ? walk(p) : n.endsWith(".md") ? [p] : [];
  });
}

export function load(root: string): Doc[] {
  return walk(root).map((path) => {
    const text = readFileSync(path, "utf8");
    const m = text.match(/^---\n([\s\S]*?)\n---\n?/);
    const d: Doc = { path, rel: relative(root, path), fm: null, body: m ? text.slice(m[0].length) : text, text };
    if (m) {
      try { d.fm = parseYaml(m[1]); } catch (e) { d.fmError = (e as Error).message; d.fm = {}; }
    }
    return d;
  });
}

// ---------- helpers ----------

const SEASON: Record<string, number> = { Winter: 0, Spring: 1, Summer: 2, Autumn: 3 };
export const termOrd = (t: string) => {
  const m = /^(Winter|Spring|Summer|Autumn) (\d{4})$/.exec(t);
  return m ? Number(m[2]) * 4 + SEASON[m[1]] : NaN;
};
// A term page's term is its filename: terms/Autumn 2026.md → "Autumn 2026". It carries no `term` key.
export const pageTerm = (d: Doc) => basename(d.path, ".md");
export const str = (v: Y | undefined) => (typeof v === "string" ? v : "");
export const arr = (v: Y | undefined): Y[] => (Array.isArray(v) ? v : []);
export const obj = (v: Y | undefined) => (v && typeof v === "object" && !Array.isArray(v) ? v : null);
// A course's other codes: its cross-listings and its former numbers. Program lists, prerequisite
// links and Related lines match them as they match the page's own code.
export const aliases = (d: Doc) => [...arr(d.fm!.cross_listed), ...arr(d.fm!.formerly)].map(String);
export const ICON: Record<string, string> = { open: "🟢", partial: "🟡", closed: "🔴", none: "⚪", unknown: "" };
// Material types in the order AGENTS.md lists them. Build sorts `materials` into this order on
// every run (see yamlLines), so a page written out of order is fixed rather than reported.
export const MAT_TYPES = ["syllabus", "slides", "notes", "videos", "assignments", "solutions", "exams", "projects", "code"];
const MAT_KEYS = ["checked", "access", "term", ...MAT_TYPES, "sites"];
// Term-page frontmatter in the order AGENTS.md lists it. Build writes is_current_term and the counts,
// and sorts every term page into this order; keys it doesn't know keep their relative order at the end.
const TERM_KEYS = ["type", "title", "description", "academic_year", "start_date", "end_date",
  "is_current_term", "num_undergraduate", "num_graduate", "sources"];
export const stripCode = (body: string) => body.replace(/```[\s\S]*?```/g, "").replace(/`[^`\n]*`/g, "");
export const encodePath = (p: string) => p.split("/").map((s) => encodeURIComponent(s).replace(/\(/g, "%28").replace(/\)/g, "%29")).join("/");
export const resolveLink = (root: string, from: string, href: string) => {
  const path = decodeURIComponent(href.split("#")[0]);
  return path.startsWith("/") ? join(root, path) : join(dirname(from), path);
};
export const linksIn = (root: string, d: Doc) =>
  new Set([...stripCode(d.body).matchAll(/\]\(([^)\s]+)\)/g)].map((m) => resolveLink(root, d.path, m[1])));

// "CS 224N" → sortable key: department, number, suffix.
const codeKey = (code: string) => {
  const m = /^(\S+) (\d+)(.*)$/.exec(code);
  return m ? [m[1], m[2].padStart(5, "0"), m[3]].join(" ") : code;
};
// A `## Related` section is one list, a line per bullet, in course-code order by the first code
// in each bullet (CS 106A < CS 106AX < CS 106B < CS 110), optionally followed by one comparison
// table. Returns one message per problem, with 1-based line numbers in the whole file so a script
// can rewrite the list's range; an empty array means the section is fine or absent.
export function relatedProblems(text: string): string[] {
  const lines = text.split("\n");
  const head = lines.indexOf("## Related");
  if (head < 0) return [];
  let end = lines.findIndex((l, i) => i > head && /^## /.test(l));
  if (end < 0) end = lines.length;
  let a = head + 1, b = end;
  while (a < b && !lines[a].trim()) a++;
  while (b > a && !lines[b - 1].trim()) b--;
  if (a === b) return [`## Related (line ${head + 1}) is empty`];
  let e = a; // the list: the first run of non-blank lines that isn't a table
  while (e < b && lines[e].trim() && !lines[e].startsWith("|")) e++;
  let t = e; // then, optionally, one table after blank lines
  while (t < b && !lines[t].trim()) t++;
  let u = t;
  while (u < b && lines[u].startsWith("|")) u++;
  const out: string[] = [];
  const range = `lines ${a + 1}-${e}`;
  if (u < b) out.push(`## Related (lines ${a + 1}-${b}): only one bullet list and an optional table; unexpected content at line ${u + 1}`);
  const notBullet = [];
  for (let i = a; i < e; i++) if (!/^- \S/.test(lines[i])) notBullet.push(i + 1);
  if (notBullet.length) out.push(`## Related list (${range}): one bullet per line starting "- "; not a bullet: line ${notBullet.join(", ")}`);
  const codes: string[] = [];
  for (let i = a; i < e; i++) {
    if (!lines[i].startsWith("- ")) continue;
    const m = /(?<![A-Za-z0-9&])([A-Z][A-Z&]*) (\d+[A-Z]*)(?![A-Za-z0-9])/.exec(lines[i].replace(/`[^`\n]*`/g, ""));
    if (m) codes.push(`${m[1]} ${m[2]}`);
    else out.push(`## Related list (${range}): line ${i + 1} names no course code`);
  }
  const keys = codes.map(codeKey);
  if (keys.some((k, i) => i > 0 && k < keys[i - 1])) {
    const want = codes.map((c, i) => [keys[i], c]).sort(([x], [y]) => (x < y ? -1 : x > y ? 1 : 0)).map(([, c]) => c);
    out.push(`## Related list (${range}) is not in course-code order; expected: ${want.join(", ")}`);
  }
  return out;
}

// Same code: the current course first, then previous holders of the number, newest first.
const isCurrent = (d: Doc) => basename(d.path) === `${str(d.fm!.code)}.md`;
export const byCode = (a: Doc, b: Doc) =>
  codeKey(str(a.fm!.code)).localeCompare(codeKey(str(b.fm!.code))) ||
  Number(isCurrent(b)) - Number(isCurrent(a)) || termOrd(str(b.fm!.term)) - termOrd(str(a.fm!.term));

// ---------- programs: course codes come from the lists on program pages ----------

// A list entry is a code, optionally ending in "*" for "any suffix" (CS 247* matches CS 247, CS 247A, …).
const entryMatches = (entry: string, code: string) =>
  entry.endsWith("*") ? new RegExp(`^${entry.slice(0, -1).replace(/[.&]/g, "\\$&")}[A-Z]*$`).test(code) : entry === code;
// The previous holder of a reused number ("CS 323 (Spring 2019).md") never matches a program list.
const codesOf = (d: Doc) =>
  basename(d.path) === `${str(d.fm!.code)}.md` ? [str(d.fm!.code), ...aliases(d)] : [];
const listed = (list: Y | undefined, d: Doc) => arr(list).some((e) => codesOf(d).some((c) => entryMatches(String(e), c)));

export type Programs = { program?: Doc; specs: Doc[]; primary?: Doc };
export function programs(docs: Doc[]): Programs {
  const conv = docs.find((d) => d.rel === "AGENTS.md")?.fm;
  const specs = docs.filter((d) => d.fm?.type === "Specialization");
  return {
    program: docs.find((d) => d.fm?.type === "Program"),
    specs,
    primary: specs.find((d) => d.fm!.key === str(conv?.primary_specialization)),
  };
}

// Breadth column: breadth letters A–D, then F if it's a foundation; "-" alone when the sheet excludes the course.
export function breadthCell(p: Programs, d: Doc): string {
  const f = p.program?.fm;
  if (!f) return "";
  if (listed(f.mscs_excluded, d)) return "-";
  const breadth = obj(f.mscs_breadth) ?? {};
  return Object.keys(breadth).sort().filter((k) => listed(breadth[k], d)).join("") + (listed(f.mscs_foundations, d) ? "F" : "");
}

// A specialization's depth letters. Approval (†) is a property of the sheet entry, not the column.
export function depthCodes(spec: Doc | undefined, d: Doc): string {
  const depth = obj(spec?.fm?.mscs_depth);
  if (!depth) return "";
  const letters = Object.keys(depth).sort().filter((k) => listed(depth[k], d)).join("");
  return letters;
}

// Depth column: "SI " if it counts as significant implementation, then the spec's depth letters; "-" when excluded.
export function depthCell(p: Programs, spec: Doc | undefined, d: Doc): string {
  if (listed(p.program?.fm?.mscs_excluded, d)) return "-";
  return [listed(p.program?.fm?.mscs_si, d) ? "SI" : "", depthCodes(spec, d)].filter(Boolean).join(" ");
}

// Generated tags for every matching program list, in stable order.
export function mscsTags(p: Programs, d: Doc): string[] {
  const f = p.program?.fm;
  if (f && listed(f.mscs_excluded, d)) return ["mscs-excluded"];
  const tags: string[] = [];
  if (f) {
    const breadth = obj(f.mscs_breadth) ?? {};
    for (const k of Object.keys(breadth).sort())
      if (listed(breadth[k], d)) tags.push(`mscs-breadth-${k}`);
    if (listed(f.mscs_foundations, d)) tags.push("mscs-foundation");
    if (listed(f.mscs_si, d)) tags.push("mscs-si");
  }
  for (const spec of [...p.specs].sort((a, b) => str(a.fm!.key).localeCompare(str(b.fm!.key)))) {
    const depth = obj(spec.fm!.mscs_depth) ?? {};
    const letters = Object.keys(depth).sort().filter((k) => listed(depth[k], d));
    const prefix = `mscs-${str(spec.fm!.key)}`;
    tags.push(...letters.map((k) => `${prefix}-${k}`));
    if (letters.length && listed(spec.fm!.mscs_approval, d)) tags.push(`${prefix}-approval`);
  }
  return tags;
}

// ---------- generated tables ----------

// A generated block inside a hand-written page is one contiguous run of lines (a table or a list) followed by a
// blank line and this marker, which names the block. Build rewrites only that run; everything else is hand-written.
type BlockId = "course-table" | "missing-pages";
// The prev/next bar build writes above a term table: "[\u2190 Winter 2026](…) \u00b7 [Summer 2026 \u2192](…)".
const isNav = (line: string) => /^\[/.test(line.trim()) && /[\u2190\u2192]/.test(line);
export const marker = (id: BlockId) => `<!-- Generated by build.ts (${id}). Don't edit, run \`make build\` -->`;

// Returns the expected full text of every generated file, keyed by absolute path.
// A page missing a block's marker is left as is and reported in `problems`.
export function render(root: string, docs: Doc[], problems: string[] = []): Map<string, string> {
  const out = new Map<string, string>();
  const current = str(docs.find((d) => d.rel === "AGENTS.md")?.fm?.current_term);
  const pages = docs.filter((d) => d.fm?.type === "Course" || d.fm?.type === "Registration").sort(byCode);
  const courses = pages.filter((d) => d.fm!.type === "Course");
  const regs = pages.filter((d) => d.fm!.type === "Registration");
  const progs = programs(docs);
  // Link the primary specialization under its short name.
  const specName = progs.primary ? basename(progs.primary.path, ".md") : "";
  const codeCol = (from: string) => progs.primary
    ? `**[${specName.replace(/^MSCS /, "")}](${encodePath(relative(dirname(from), progs.primary.path))})**`
    : "Depth";
  const publicCol = "**[Public](../AGENTS.md#materials)**";

  // Non-breaking space between department and number, so "CS 312" never wraps in a table cell.
  const link = (from: string, d: Doc) =>
    `[${basename(d.path, ".md").replace(/^(\S+) (?=\d)/, "$1\u00a0")}](${encodePath(relative(dirname(from), d.path))})`;
  const title = (d: Doc) => str(d.fm!.title).replace(`${str(d.fm!.code)}: `, "");
  const row = (cells: string[]) => `| ${cells.join(" | ")} |`.replace(/ {2}/g, " ");
  const codes = (d: Doc) => depthCodes(progs.primary, d);
  const icon = (d: Doc) => ICON[str(obj(d.fm!.materials)?.access)] ?? "";
  // `short` labels a term as two-digit year and season: Autumn 2026 is "26au" (wi, sp, su).
  const SEASON_ABBR: Record<string, string> = { Autumn: "au", Winter: "wi", Spring: "sp", Summer: "su" };
  const termCell = (from: string, t: string, short = false) => {
    const label = short ? t.replace(/^(\w+) (\d{4})$/, (m, s, y) => (SEASON_ABBR[s] ? y.slice(2) + SEASON_ABBR[s] : m)) : t.replace(" ", "\u00a0");
    return t && existsSync(join(root, "terms", `${t}.md`)) ? `[${label}](${encodePath(relative(dirname(from), join(root, "terms", `${t}.md`)))})` : label;
  };
  const replaceBlock = (page: Doc, text: string, name: BlockId, body: string) => {
    const lines = text.split("\n");
    const m = lines.indexOf(marker(name));
    if (m < 0) {
      problems.push(`${page.rel}: missing the "${name}" marker line: ${marker(name)}`);
      return text;
    }
    let end = m;
    while (end > 0 && !lines[end - 1].trim()) end--;
    // The old block: the table or list run just above the marker. Anything else there is hand-written and kept.
    let start = end;
    if (start > 0 && /^\s*(\||- )/.test(lines[start - 1])) while (start > 0 && lines[start - 1].trim()) start--;
    // A term page's course-table block also holds the prev/next bar, a paragraph above the table.
    let above = start;
    while (above > 0 && !lines[above - 1].trim()) above--;
    if (above > 0 && above < start && isNav(lines[above - 1])) {
      start = above;
      while (start > 0 && lines[start - 1].trim()) start--;
    }
    // Guard against a silent wipe: frontmatter that stops resolving (a renamed term page, a cleared
    // program list) would otherwise replace a full table with its header row alone.
    const rows = (s: string) => s.split("\n").filter((l) => /^\s*(\|\s*\[|[-*] )/.test(l)).length;
    const had = rows(lines.slice(start, end).join("\n"));
    if (had && !rows(body)) {
      problems.push(`${page.rel}: the "${name}" block would drop all ${had} rows; fix the page or its frontmatter, and delete the rows by hand if they really should go`);
      return text;
    }
    const before = lines.slice(0, start);
    while (before.length && !before[before.length - 1].trim()) before.pop();
    return [...before, "", body, "", marker(name), ...lines.slice(m + 1)].join("\n");
  };


  const frontmatter = new Map<string, Record<string, Y>>();
  // Course and registration pages: preserve subject tags, then regenerate the reserved mscs- suffix.
  for (const d of pages) {
    const fm = { ...d.fm! };
    // TODO: remove this migration once legacy mscs fields are no longer in use.
    delete fm.mscs;
    if (fm.type === "Course" && current && fm.term !== current) delete fm.schedule;
    fm.tags = [...arr(fm.tags).map(String).filter((t) => !t.startsWith("mscs-")), ...mscsTags(progs, d)];
    frontmatter.set(d.path, fm);
  }

  // courses/index.md: fully generated, and never emptied while course pages exist on disk.
  const idx = join(root, "courses", "index.md");
  if (!pages.length && existsSync(idx) && /^\|\s*\[/m.test(readFileSync(idx, "utf8")))
    problems.push("courses/index.md: no course pages loaded, so the roster would be emptied; fix the pages rather than committing an empty index");
  else out.set(idx, [
    `| Course | Title | Term | ${codeCol(idx)} | ${publicCol} |`,
    "| --- | --- | --- | --- | --- |",
    ...courses.map((d) => row([link(idx, d), title(d), termCell(idx, str(d.fm!.term), true), codes(d), icon(d)])),
    ...(regs.length ? ["", "## Registrations", "", ...regs.map((d) => `* ${link(idx, d)} - ${title(d)}`)] : []),
    "",
  ].join("\n"));

  // terms/index.md: fully generated, newest academic year first, each year's terms in academic order.
  const termPages = docs.filter((d) => d.rel.startsWith("terms/") && d.fm?.type === "Term")
    .sort((a, b) => str(b.fm!.academic_year).localeCompare(str(a.fm!.academic_year)) || termOrd(pageTerm(a)) - termOrd(pageTerm(b)));
  const termIdx = join(root, "terms", "index.md");
  // With no term pages there is nothing to list, and terms/ may not exist at all, so leave it alone.
  if (!termPages.length) {
    if (existsSync(termIdx) && /^\|\s*\[/m.test(readFileSync(termIdx, "utf8")))
      problems.push("terms/index.md: no term pages loaded, so the list would be emptied; fix the pages rather than committing an empty index");
  } else out.set(termIdx, [
    "| Term | Total | UG | GR |",
    "| --- | --- | --- | --- |",
    ...termPages.flatMap((d, n) => {
      const term = pageTerm(d);
      const members = courses.filter((c) => arr(c.fm!.terms_offered).includes(term));
      const ug = members.filter((c) => c.fm!.level === "undergraduate").length;
      const grad = members.filter((c) => c.fm!.level === "graduate").length;
      // The current term's row is bold, the one thing the counts don't say.
      const cell = termCell(termIdx, term);
      // A labelled row splits each academic year from the one above; markdown tables have no rowspan.
      const head = str(d.fm!.academic_year) !== str(termPages[n - 1]?.fm!.academic_year)
        ? [row([`**${str(d.fm!.academic_year)}**`, "", "", ""])] : [];
      return [...head, row([term === current ? `**${cell}**` : cell, String(ug + grad), String(ug), String(grad)])];
    }),
    "",
  ].join("\n"));

  // terms/<Term>.md: regenerate the course table; drop "TODO" lines whose page now exists,
  // and the whole section once nothing is left in it.
  const written = (code: string) => pages.some((d) => codesOf(d).some((c) => entryMatches(code, c)));
  const chron = [...termPages].sort((a, b) => termOrd(pageTerm(a)) - termOrd(pageTerm(b)));
  for (const page of docs.filter((d) => d.rel.startsWith("terms/") && d.fm?.type === "Term")) {
    const term = pageTerm(page);
    const isCurrent = term === current; // days only matter for the current term
    const members = courses.filter((d) => arr(d.fm!.terms_offered).includes(term));
    const fm = { ...page.fm! };
    // TODO: remove this migration once no term page carries `concluded`, which is_current_term replaced.
    delete fm.concluded;
    // Present, and true, on the current term's page only.
    delete fm.is_current_term;
    if (isCurrent) fm.is_current_term = "true";
    fm.num_undergraduate = String(members.filter((d) => d.fm!.level === "undergraduate").length);
    fm.num_graduate = String(members.filter((d) => d.fm!.level === "graduate").length);
    const rank = (k: string) => (TERM_KEYS.includes(k) ? TERM_KEYS.indexOf(k) : TERM_KEYS.length);
    frontmatter.set(page.path, Object.fromEntries(Object.entries(fm).sort(([a], [b]) => rank(a) - rank(b))));
    const instructor = (d: Doc) => str(arr(d.fm!.instructors)[0]).split(",")[0];
    // Days get their own column on the current term's page, where the meeting pattern is still useful.
    const days = (d: Doc) => (str(d.fm!.term) === term && /^[MTWRF]+$/.exec(str(d.fm!.schedule).split(" ")[0])?.[0]) || "";
    const table = [
      `| Course | Title | Professor |${isCurrent ? " Days |" : ""} ${codeCol(page.path)} | ${publicCol} |`,
      `| --- | --- | --- |${isCurrent ? " --- |" : ""} --- | --- |`,
      ...members.map((d) => row([link(page.path, d), title(d), instructor(d),
        ...(isCurrent ? [days(d)] : []), depthCell(progs, progs.primary, d), icon(d)])),
    ].join("\n");
    // Prev/next bar: the chronological neighbours among the term pages that exist.
    const n = chron.indexOf(page);
    const nav = [n > 0 ? `[\u2190 ${pageTerm(chron[n - 1])}](${encodePath(basename(chron[n - 1].path))})` : "",
      n >= 0 && n < chron.length - 1 ? `[${pageTerm(chron[n + 1])} \u2192](${encodePath(basename(chron[n + 1].path))})` : ""];
    const bar = nav.filter(Boolean).join(" \u00b7 ");
    let text = replaceBlock(page, page.text, "course-table", bar ? `${bar}\n\n${table}` : table);
    text = text.replace(/(## TODO\n)([\s\S]*?)(?=\n## |$)/, (_, h, sec: string) => {
      const kept = sec.split("\n").filter((l) => {
        const code = /^[-*] \[?([A-Z&]+ \d+[A-Z]*)/.exec(l)?.[1];
        return !code || !written(code);
      }).join("\n");
      return kept.trim() ? h + kept : "";
    });
    out.set(page.path, text.trimEnd() + "\n");
  }

  // programs/*.md: "## Courses" and "## TODO" are generated from the page's own lists.
  for (const page of [progs.program, ...progs.specs].filter((d): d is Doc => !!d)) {
    const isSpec = page.fm!.type === "Specialization";
    const lists = isSpec ? Object.values(obj(page.fm!.mscs_depth) ?? {}).concat([page.fm!.mscs_approval ?? []])
      : [page.fm!.mscs_foundations, page.fm!.mscs_si, ...Object.values(obj(page.fm!.mscs_breadth) ?? {}), page.fm!.mscs_excluded];
    const entries = [...new Set(lists.flatMap((l) => arr(l).map(String)))];
    const inProgram = (d: Doc) => lists.some((l) => listed(l, d));
    const members = pages.filter((d) => (isSpec ? depthCodes(page, d) : inProgram(d)));
    const missing = entries.filter((e) => !written(e)).sort((x, y) => x.localeCompare(y, "en", { numeric: true }));
    // When this sheet names a course only by a cross-listing or former number, show that code too: "CS 334A<br>EE 364A".
    const onSheet = (code: string) => entries.some((e) => entryMatches(e, code));
    const sheetCodes = (d: Doc) => onSheet(str(d.fm!.code)) ? [] : aliases(d).filter(onSheet);
    const courseCell = (d: Doc) => [link(page.path, d), ...sheetCodes(d).map((c) => c.replace(" ", "\u00a0"))].join("<br>");
    const table = [
      `| Course | Title | Breadth |${isSpec ? " Depth |" : ""} Term | ${publicCol} |`,
      `| --- | --- | --- |${isSpec ? " --- |" : ""} --- | --- |`,
      ...members.map((d) => row([courseCell(d), title(d), breadthCell(progs, d),
        ...(isSpec ? [depthCell(progs, page, d)] : []), termCell(page.path, str(d.fm!.term), true), icon(d)])),
    ].join("\n");
    let text = replaceBlock(page, page.text, "course-table", table);
    // Each missing entry with the letters of the lists it's on, e.g. "- CS 224N · b".
    const named = isSpec ? Object.entries(obj(page.fm!.mscs_depth) ?? {})
      : [["F", page.fm!.mscs_foundations], ["S", page.fm!.mscs_si], ...Object.entries(obj(page.fm!.mscs_breadth) ?? {}), ["-", page.fm!.mscs_excluded]] as [string, Y][];
    const letters = (e: string) => named.filter(([, l]) => arr(l).map(String).includes(e)).map(([k]) => k).join("") +
      (isSpec && arr(page.fm!.mscs_approval).map(String).includes(e) ? "†" : "");
    // "- None" rather than an empty block, which replaceBlock would refuse as a wipe.
    text = replaceBlock(page, text, "missing-pages", (missing.length
      ? missing.map((e) => `- ${e.replace(/\*$/, " (any suffix)")} · ${letters(e)}`)
      : ["- None"]).join("\n"));
    out.set(page.path, text.trimEnd() + "\n");
  }
  // Normalize every frontmatter block, including guides, references and the root index.
  for (const d of docs) {
    if (d.fmError) {
      problems.push(`${d.rel}: frontmatter: ${d.fmError}`);
      out.delete(d.path);
      continue;
    }
    if (!d.fm) continue;
    const text = out.get(d.path) ?? d.text;
    const body = text.replace(/^---\n[\s\S]*?\n---\n?/, "");
    out.set(d.path, `---\n${yamlLines(frontmatter.get(d.path) ?? d.fm).join("\n")}\n---\n${body}`);
  }
  return out;
}
