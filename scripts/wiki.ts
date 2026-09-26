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

function parseYaml(text: string): Record<string, Y> {
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
  if (path.length === 1 && path[0] === "concluded" && /^(true|false)$/.test(value)) return value;
  if (path.length === 1 && path[0] === "bytes" && /^\d+$/.test(value)) return value;
  const quote = path.at(-1) === "units" || !value || value.trim() !== value
    || /^[\-?:,\[\]{}#&*!|>'"%@`]/.test(value) || /:($|\s)|#|[\x00-\x1f\x7f]/.test(value)
    || /^(?:null|true|false|yes|no|on|off|y|n|~|[-+]?\.inf|\.nan)$/i.test(value)
    || /^[+-]?(?:\d|\.\d)/.test(value);
  return quote ? JSON.stringify(value) : value;
}

function yamlLines(value: Y, path: string[] = []): string[] {
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
export const ICON: Record<string, string> = { open: "🟢", partial: "🟡", closed: "🔴", none: "⚪", unknown: "" };
// Material types in the order AGENTS.md lists them. Build sorts `materials` into this order on
// every run (see yamlLines), so a page written out of order is fixed rather than reported.
export const MAT_TYPES = ["syllabus", "slides", "notes", "videos", "assignments", "solutions", "exams", "projects", "code"];
const MAT_KEYS = ["checked", "access", "term", ...MAT_TYPES, "sites"];
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
  basename(d.path) === `${str(d.fm!.code)}.md` ? [str(d.fm!.code), ...arr(d.fm!.cross_listed).map(String)] : [];
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
  if (listed(f.excluded, d)) return "-";
  const breadth = obj(f.breadth) ?? {};
  return Object.keys(breadth).sort().filter((k) => listed(breadth[k], d)).join("") + (listed(f.foundations, d) ? "F" : "");
}

// A specialization's depth letters, † if the matching entry needs approval.
export function depthCodes(spec: Doc | undefined, d: Doc): string {
  const depth = obj(spec?.fm?.depth);
  if (!depth) return "";
  const letters = Object.keys(depth).sort().filter((k) => listed(depth[k], d)).join("");
  return letters && listed(spec!.fm!.approval, d) ? `${letters}†` : letters;
}

// Depth column: "SI " if it counts as significant implementation, then the spec's depth letters and †; "-" when excluded.
export function depthCell(p: Programs, spec: Doc | undefined, d: Doc): string {
  if (listed(p.program?.fm?.excluded, d)) return "-";
  return [listed(p.program?.fm?.si, d) ? "SI" : "", depthCodes(spec, d)].filter(Boolean).join(" ");
}

// Generated tags for every matching program list, in stable order.
export function mscsTags(p: Programs, d: Doc): string[] {
  const f = p.program?.fm;
  if (f && listed(f.excluded, d)) return ["mscs-excluded"];
  const tags: string[] = [];
  if (f) {
    const breadth = obj(f.breadth) ?? {};
    for (const k of Object.keys(breadth).sort())
      if (listed(breadth[k], d)) tags.push(`mscs-breadth-${k}`);
    if (listed(f.foundations, d)) tags.push("mscs-foundation");
    if (listed(f.si, d)) tags.push("mscs-si");
  }
  for (const spec of [...p.specs].sort((a, b) => str(a.fm!.key).localeCompare(str(b.fm!.key)))) {
    const depth = obj(spec.fm!.depth) ?? {};
    const letters = Object.keys(depth).sort().filter((k) => listed(depth[k], d));
    const prefix = `mscs-${str(spec.fm!.key)}`;
    tags.push(...letters.map((k) => `${prefix}-${k}`));
    if (letters.length && listed(spec.fm!.approval, d)) tags.push(`${prefix}-approval`);
  }
  return tags;
}

// ---------- generated tables ----------

// A generated block inside a hand-written page is one contiguous run of lines (a table or a list) followed by a
// blank line and this marker, which names the block. Build rewrites only that run; everything else is hand-written.
type BlockId = "course-table" | "missing-pages";
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
  const codes = (d: Doc) => depthCodes(progs.primary, d).replace("†", "");
  const icon = (d: Doc) => ICON[str(obj(d.fm!.materials)?.access)] ?? "";
  const termCell = (from: string, t: string) =>
    t && existsSync(join(root, "terms", `${t}.md`)) ? `[${t.replace(" ", "\u00a0")}](${encodePath(relative(dirname(from), join(root, "terms", `${t}.md`)))})` : t.replace(" ", "\u00a0");
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
    ...courses.map((d) => row([link(idx, d), title(d), termCell(idx, str(d.fm!.term)), codes(d), icon(d)])),
    ...(regs.length ? ["", "## Registrations", "", ...regs.map((d) => `* ${link(idx, d)} - ${title(d)}`)] : []),
    "",
  ].join("\n"));

  // terms/<Term>.md: regenerate the course table; drop "TODO" lines whose page now exists,
  // and the whole section once nothing is left in it.
  const written = (code: string) => pages.some((d) => codesOf(d).some((c) => entryMatches(code, c)));
  for (const page of docs.filter((d) => d.rel.startsWith("terms/") && d.fm?.type === "Term")) {
    const term = pageTerm(page);
    const isCurrent = page.fm!.concluded !== "true"; // days only matter for the current term
    const members = courses.filter((d) => arr(d.fm!.terms_offered).includes(term));
    const instructor = (d: Doc) => {
      const who = str(arr(d.fm!.instructors)[0]).split(",")[0];
      const days = /^[MTWRF]+$/.exec(str(d.fm!.schedule).split(" ")[0])?.[0];
      return isCurrent && days && str(d.fm!.term) === term ? `${who} [${days}]` : who;
    };
    const table = [
      `| Course | Title | ${isCurrent ? "Prof/Days" : "Professor"} | ${codeCol(page.path)} | ${publicCol} |`,
      "| --- | --- | --- | --- | --- |",
      ...members.map((d) => row([link(page.path, d), title(d), instructor(d), depthCell(progs, progs.primary, d), icon(d)])),
    ].join("\n");
    let text = replaceBlock(page, page.text, "course-table", table);
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
    const lists = isSpec ? Object.values(obj(page.fm!.depth) ?? {}).concat([page.fm!.approval ?? []])
      : [page.fm!.foundations, page.fm!.si, ...Object.values(obj(page.fm!.breadth) ?? {}), page.fm!.excluded];
    const entries = [...new Set(lists.flatMap((l) => arr(l).map(String)))];
    const inProgram = (d: Doc) => lists.some((l) => listed(l, d));
    const members = pages.filter((d) => (isSpec ? depthCodes(page, d) : inProgram(d)));
    const missing = entries.filter((e) => !written(e)).sort((x, y) => x.localeCompare(y, "en", { numeric: true }));
    const table = [
      `| Course | Title | Breadth |${isSpec ? " Depth |" : ""} Term | ${publicCol} |`,
      `| --- | --- | --- |${isSpec ? " --- |" : ""} --- | --- |`,
      ...members.map((d) => row([link(page.path, d), title(d), breadthCell(progs, d),
        ...(isSpec ? [depthCell(progs, page, d)] : []), termCell(page.path, str(d.fm!.term)), icon(d)])),
    ].join("\n");
    let text = replaceBlock(page, page.text, "course-table", table);
    // Each missing entry with the letters of the lists it's on, e.g. "- CS 224N · b".
    const named = isSpec ? Object.entries(obj(page.fm!.depth) ?? {})
      : [["F", page.fm!.foundations], ["S", page.fm!.si], ...Object.entries(obj(page.fm!.breadth) ?? {}), ["-", page.fm!.excluded]] as [string, Y][];
    const letters = (e: string) => named.filter(([, l]) => arr(l).map(String).includes(e)).map(([k]) => k).join("") +
      (isSpec && arr(page.fm!.approval).map(String).includes(e) ? "†" : "");
    // Split by the default scope (CS graduate). Number ≥ 200 is the proxy, since unwritten courses have no catalog level yet.
    const inScope = (e: string) => /^CS (\d+)/.test(e) && Number(/\d+/.exec(e)![0]) >= 200;
    const bullets = (l: string[]) => l.map((e) => `  - ${e.replace(/\*$/, " (any suffix)")} · ${letters(e)}`);
    const inList = missing.filter(inScope), outList = missing.filter((e) => !inScope(e));
    const covered = `- **Covered**: ${entries.length - missing.length} of ${entries.length} list entries have a page (${members.length} course pages)`;
    text = replaceBlock(page, text, "missing-pages", (!missing.length ? [covered] : [
      covered,
      `- **In the default scope** (CS 200+): ${inList.length}`, ...bullets(inList),
      `- **Outside the default scope** (other departments, CS under 200; write only on request): ${outList.length}`, ...bullets(outList),
    ]).join("\n"));
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
