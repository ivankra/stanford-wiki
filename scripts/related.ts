// Report one-way links in the `## Related` sections of course pages: A names B, B doesn't name A;
// then pairs that never mention each other but share tags and rare topic words.
// Advisory only — reciprocity is a judgement call (AGENTS.md → Backlog), so this is not part of
// `make` and never fails. Read the suggestions, add the backlinks that earn their line, ignore the rest.
// Usage: node scripts/related.ts [bundle-dir] [--all]   (Node >= 23, no dependencies)
import { join, relative, basename, dirname } from "node:path";
import { load, str, arr, aliases, stripCode, resolveLink as resolveIn, type Doc } from "./wiki.ts";

const args = process.argv.slice(2);
const ROOT = args.find((a) => !a.startsWith("-")) ?? join(import.meta.dirname, "..");
// Without --all, pages that have no `## Related` section at all are counted but not listed one by one:
// they need the section written, which is a different job from adding a backlink.
const ALL = args.includes("--all");

const docs = load(ROOT);
const pages = docs.filter((d) => d.rel.startsWith("courses/") && ["Course", "Registration"].includes(str(d.fm?.type)));

// Code → page, for the codes a Related line may use: the page's own code, cross-listings and former numbers.
// A previous holder of a reused number ("CS 323 (Spring 2019).md") never wins the bare code.
const byCode = new Map<string, Doc>();
for (const d of pages) {
  const own = str(d.fm!.code);
  const canonical = basename(d.rel) === `${own}.md`;
  for (const code of [own, ...aliases(d)])
    if (canonical || !byCode.has(code)) byCode.set(code, d);
}

// The `## Related` section's body, or null if the page has none. The lookahead ends the section at
// the next heading or at end of input — `$(?![\s\S])` and not `\Z`, which JavaScript reads as a literal Z.
const section = (d: Doc) => {
  const m = /^## Related$[\r\n]+([\s\S]*?)(?=^## |$(?![\s\S]))/m.exec(stripCode(d.body));
  return m ? m[1] : null;
};

// Everything a Related section points at: markdown links that resolve to a course page, plus bare
// codes, since a line may name a course the page links elsewhere. Self-references are dropped.
function targets(d: Doc, text: string): Map<Doc, string> {
  const found = new Map<Doc, string>();
  // The bullet a target is named on, so the report can show the "how it differs" line.
  const lineOf = (needle: string) =>
    text.split("\n").find((l) => l.includes(needle))?.replace(/^\s*[-*]\s*/, "").trim() ?? "";
  for (const m of text.matchAll(/\]\(([^)\s]+)\)/g)) {
    if (/^[a-z]+:/i.test(m[1]) || m[1].startsWith("#")) continue;
    let target: string;
    try { target = resolveIn(ROOT, d.path, m[1]); } catch { continue; }
    const page = pages.find((p) => p.path === target);
    if (page && page !== d) found.set(page, lineOf(m[1]));
  }
  // Tables and prose may use a non-breaking space between department and number; accept either.
  for (const m of text.matchAll(/(?<![A-Za-z0-9])[A-Z&]+[ \u00a0]\d+[A-Z]*(?![A-Za-z0-9])/g)) {
    const page = byCode.get(m[0].replace(/\u00a0/g, " "));
    if (page && page !== d && !found.has(page)) found.set(page, lineOf(m[0]));
  }
  return found;
}

const related = new Map<Doc, Map<Doc, string>>();
const missingSection: Doc[] = [];
for (const d of pages) {
  const text = section(d);
  if (text === null) { missingSection.push(d); continue; }
  related.set(d, targets(d, text));
}

// One-way edges, grouped by the page that would gain the backlink.
const inbound = new Map<Doc, { from: Doc; line: string }[]>();
let edges = 0;
for (const [from, to] of related) {
  for (const [target, line] of to) {
    edges++;
    if (related.get(target)?.has(from)) continue;
    (inbound.get(target) ?? inbound.set(target, []).get(target)!).push({ from, line });
  }
}

const name = (d: Doc) => basename(d.rel, ".md");
const plural = (n: number, one: string, many = `${one}s`) => `${n} ${n === 1 ? one : many}`;
const href = (from: Doc, to: Doc) =>
  encodeURI(relative(dirname(from.path), to.path)).replace(/\(/g, "%28").replace(/\)/g, "%29");
// Does the target already acknowledge the source somewhere else on the page - Prerequisites, Syllabus,
// Source notes? Then the pages know about each other and only the Related line is missing, which is a
// weaker finding than two pages that never mention one another.
const mentionsElsewhere = (target: Doc, from: Doc) => {
  const body = stripCode(target.body).replace(/^## Related$[\r\n]+[\s\S]*?(?=^## |$(?![\s\S]))/m, "");
  return body.includes(`](${href(target, from)})`) || new RegExp(`(?<![A-Za-z0-9])${str(from.fm!.code).replace(/[.&]/g, "\\$&")}(?![A-Za-z0-9])`).test(body);
};

// A course everything points at - CS 229, CS 231N - collects inbound links as a prerequisite, and is
// not supposed to name them all back. That is the clique AGENTS.md warns against, so hubs are counted
// and listed one line each rather than expanded into suggestions.
const HUB = Number(args.find((a) => a.startsWith("--hub="))?.slice(6) ?? 3);
const hasSection = (d: Doc) => related.has(d);
const all = [...inbound];
const suggest = all.filter(([t, s]) => hasSection(t) && s.length <= HUB);
const hubs = all.filter(([t, s]) => hasSection(t) && s.length > HUB);
const unwritten = all.filter(([t]) => !hasSection(t));

// Fewest inbound first: a course named by one other, with a line explaining the difference, is the
// likeliest genuine pair. Volume is a hub signal, not an urgency signal.
const order = (a: [Doc, unknown[]], b: [Doc, unknown[]]) => a[1].length - b[1].length || name(a[0]).localeCompare(name(b[0]));

if (suggest.length) {
  console.log(`== Missing backlinks: ${plural(suggest.length, "page")} with a ## Related section that doesn't name a course naming them\n`);
  for (const [target, sources] of suggest.sort(order)) {
    console.log(`${name(target)} - named by ${sources.length}, names none back:`);
    for (const { from, line } of sources.sort((a, b) => name(a.from).localeCompare(name(b.from)))) {
      const seen = mentionsElsewhere(target, from) ? " [already mentioned elsewhere on the page]" : "";
      console.log(`  ${name(from)}${seen}${line ? `: ${line}` : ""}`);
    }
    console.log(`  -> add to ${target.rel}: - [${name(sources[0].from)}](${href(target, sources[0].from)}): <how it differs>`);
    console.log();
  }
}

if (unwritten.length) {
  console.log(`== Named but has no ## Related section: ${plural(unwritten.length, "page")}\n`);
  for (const [target, sources] of unwritten.sort(order))
    console.log(`  ${name(target)} - named by ${sources.length}: ${sources.map((s) => name(s.from)).sort().join(", ")}`);
  console.log();
}

if (hubs.length) {
  console.log(`== Hubs (named by more than ${HUB}; reciprocity not expected, --hub=N to move the line): ${plural(hubs.length, "page")}\n`);
  for (const [target, sources] of hubs.sort((a, b) => b[1].length - a[1].length || name(a[0]).localeCompare(name(b[0]))))
    console.log(`  ${name(target)} - named by ${sources.length}, names none back`);
  console.log();
}

// Pairs that never mention each other but cover the same ground - the connections nothing above can
// find, since it only follows links someone already wrote. Scored on shared subject tags (2 each) and
// shared words from `topics` and the title, each weighted by rarity (log of pages / pages using it), so
// "photon" counts and "learning" barely does. Candidates for review, not suggestions: generic overlaps
// ("web", "security") and sibling labs surface too, and a page with thin topics scores on almost nothing.
const STOP = new Set("and the of for with in on to a an from as by its via into their at or vs".split(" "));
const MIN_SCORE = 15, TOP = 40;
const courses = pages.filter((d) => d.fm!.type === "Course" && basename(d.rel) === `${str(d.fm!.code)}.md`);
const profile = new Map(courses.map((d) => {
  const text = [...arr(d.fm!.topics).map(String), str(d.fm!.title).replace(/^[^:]*: /, "")].join(" ").toLowerCase();
  const words = new Set([...text.matchAll(/[a-z][a-z0-9-]+/g)].map((m) => m[0]).filter((w) => w.length > 2 && !STOP.has(w)));
  const tags = new Set(arr(d.fm!.tags).map(String).filter((t) => !t.startsWith("mscs-")));
  const codes = [str(d.fm!.code), ...aliases(d)];
  const mentioned = new Set([...d.body.matchAll(/(?<![A-Za-z0-9])[A-Z&]+[ \u00a0]\d+[A-Z]*(?![A-Za-z0-9])/g)].map((m) => m[0].replace(/\u00a0/g, " ")));
  return [d, { words, tags, codes, mentioned }];
}));
const df = new Map<string, number>();
for (const { words } of profile.values()) for (const w of words) df.set(w, (df.get(w) ?? 0) + 1);
const similar: { a: Doc; b: Doc; score: number; tags: string[]; words: string[] }[] = [];
for (const [i, a] of courses.entries()) for (const b of courses.slice(i + 1)) {
  const pa = profile.get(a)!, pb = profile.get(b)!;
  if (pb.codes.some((c) => pa.mentioned.has(c)) || pa.codes.some((c) => pb.mentioned.has(c))) continue;
  const tags = [...pa.tags].filter((t) => pb.tags.has(t));
  const words = [...pa.words].filter((w) => pb.words.has(w)).sort((x, y) => df.get(x)! - df.get(y)! || x.localeCompare(y));
  const score = 2 * tags.length + words.reduce((s, w) => s + Math.log(courses.length / df.get(w)!), 0);
  if (score >= MIN_SCORE) similar.push({ a, b, score, tags, words });
}
if (similar.length) {
  const shown = ALL ? similar.length : Math.min(TOP, similar.length);
  console.log(`== Similar but never mention each other: ${plural(similar.length, "pair")} scoring ${MIN_SCORE}+${shown < similar.length ? `, top ${shown} (--all for every one)` : ""}\n`);
  for (const { a, b, score, tags, words } of similar.sort((x, y) => y.score - x.score || name(x.a).localeCompare(name(y.a))).slice(0, shown))
    console.log(`  ${score.toFixed(1).padStart(5)}  ${name(a)} | ${name(b)}: ${words.slice(0, 6).join(", ")}${tags.length ? ` (tags: ${tags.join(", ")})` : ""}`);
  console.log();
}

const orphans = missingSection.filter((d) => !inbound.has(d));
if (orphans.length) {
  console.log(`${plural(orphans.length, "page")} with no ## Related section and named by nobody${ALL ? ":" : " (--all to list)"}`);
  if (ALL) for (const d of orphans.sort((a, b) => name(a).localeCompare(name(b)))) console.log(`  ${name(d)}`);
  console.log();
}

const oneWay = all.reduce((n, [, s]) => n + s.length, 0);
console.log(`${pages.length} course pages, ${related.size} with a ## Related section, ${edges} links, ${oneWay} one-way across ${all.length} pages`);
console.log(`suggestions: ${suggest.reduce((n, [, s]) => n + s.length, 0)} across ${suggest.length} pages (hubs and section-less pages excluded); ${plural(similar.length, "similar unlinked pair")}`);
