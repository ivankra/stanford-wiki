// Advisory, not part of `make`: open every URL in course pages' frontmatter and report the ones whose
// response disagrees with how the page uses them. Above all an entry rated open whose link ends at a sign-in:
// a Stanford SSO or GitLab redirect still answers 200, and a Google doc's /preview page loads whether or not
// the doc is shared, so a rating read off a link's existence goes unnoticed without this.
// Usage: node scripts/links.ts [--all] [--verbose] ["courses/CS 109.md" ...]
// It never edits a page, and never works around a gate: it follows redirects until one reaches a sign-in, and stops.
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { parseYaml, str, arr, obj, type Y } from "./wiki.ts";

// What a page's use of a URL claims about it: `open` (rated open or partial, a bare URL, homepage, a site or
// self-study entry), `closed` (rated closed), or `any` (a source, an unknown or none entry): only a dead link matters.
export type Expect = "open" | "closed" | "any";
export type Use = { where: string; rating: string; expect: Expect; url: string };

const TYPES = ["syllabus", "slides", "notes", "videos", "assignments", "solutions", "exams", "projects", "repo", "code"];
const urlsOf = (v: Y | undefined): string[] => (typeof v === "string" ? [v] : arr(v).map(String)).filter((u) => /^https?:\/\//.test(u));

// Every http(s) URL in a course page's frontmatter, in either schema, with where it sits and what it claims.
export function uses(fm: Record<string, Y>): Use[] {
  const out: Use[] = [];
  const add = (where: string, rating: string, expect: Expect, v: Y | undefined) => {
    for (const url of urlsOf(v)) out.push({ where, rating, expect, url });
  };
  const record = (prefix: string, r: Record<string, Y>) => {
    add(`${prefix}homepage`, "", "open", r.homepage);
    for (const t of TYPES) {
      if (!(t in r)) continue;
      const v = r[t], o = obj(v);
      if (!o) { add(`${prefix}${t}`, "open", "open", v); continue; }
      const rating = str(o.access) || "open";
      add(`${prefix}${t}`, rating, rating === "closed" ? "closed" : ["open", "partial"].includes(rating) ? "open" : "any", o.url);
    }
    for (const key of ["sites", "self_study"])
      for (const [i, s] of arr(r[key]).entries()) add(`${prefix}${key}[${i}]`, "", "open", obj(s)?.url);
  };
  record("", fm);
  const legacy = obj(fm.materials);
  if (legacy) record("materials.", legacy);
  for (const [term, r] of Object.entries(obj(fm.past) ?? {})) if (obj(r)) record(`past.${term}.`, obj(r)!);
  for (const s of arr(fm.sources)) add(`sources.${str(obj(s)?.id)}`, "", "any", obj(s)?.resource);
  return out;
}

// The URL whose status actually answers "can an outsider open this?": a Google document's export, a Drive
// folder's plain listing, a Dropbox share's download, a GitHub file's raw copy, a YouTube video or playlist's
// oEmbed record. Everything else is fetched as is.
export function probeUrl(url: string): string {
  const u = new URL(url);
  const doc = u.pathname.match(/^\/(document|spreadsheets|presentation)\/d\/([\w-]+)(\/.*)?$/);
  if (u.hostname === "docs.google.com" && doc) {
    // A document published to the web is already cited by the URL that opens; rewriting it to /export would
    // ask the wrong question, since publishing and sharing are separate settings (see `published`).
    if (/^\/(pub|pubhtml)\b/.test(doc[3] ?? "")) return url;
    const base = `https://docs.google.com/${doc[1]}/d/${doc[2]}`;
    return doc[1] === "document" ? `${base}/export?format=txt` : doc[1] === "spreadsheets" ? `${base}/export?format=csv` : `${base}/export/pdf`;
  }
  // A Dropbox share link: ?dl=0 serves Dropbox's HTML viewer whatever the file is, so a .pdf reads as a login
  // page. ?dl=1 serves the file itself, and still answers HTML when the share is gone.
  if (/^(www\.)?dropbox\.com$/.test(u.hostname) && /^\/(scl\/fi|s)\//.test(u.pathname)) {
    u.searchParams.set("dl", "1");
    return u.href;
  }
  if (u.hostname === "drive.google.com") {
    const folder = u.pathname.match(/^\/drive\/(?:u\/\d+\/)?folders\/([\w-]+)/);
    if (folder) return `https://drive.google.com/embeddedfolderview?id=${folder[1]}`;
    const file = u.pathname.match(/^\/file\/d\/([\w-]+)/)?.[1] ?? (u.pathname === "/open" ? u.searchParams.get("id") : null);
    if (file) return `https://drive.google.com/uc?export=download&id=${file}`;
  }
  // A file in a GitHub repo: its blob page is an HTML viewer, so fetch the raw file (404 when the repo is private).
  const blob = u.hostname === "github.com" && u.pathname.match(/^\/([^/]+)\/([^/]+)\/blob\/(.+)$/);
  if (blob) return `https://raw.githubusercontent.com/${blob[1]}/${blob[2]}/${blob[3]}`;
  const yt = /(^|\.)youtube\.com$/.test(u.hostname) && (u.pathname === "/watch" || u.pathname === "/playlist");
  if (yt || u.hostname === "youtu.be") return `https://www.youtube.com/oembed?format=json&url=${encodeURIComponent(url)}`;
  return url;
}

// Where a redirect lands on a sign-in. Stanford's own (SSO, Canvas, GitLab, Panopto) and a Google sign-in
// limited to stanford.edu are gates; any other Google sign-in on a document means it isn't shared, and on
// anything else it may be a free account anyone can create.
export function signIn(url: string): string {
  const u = new URL(url);
  const h = u.hostname, all = decodeURIComponent(url);
  if (/^(login|weblogin|weblogin-prod\.iam|idp|idp\.stanford)\./.test(h) && h.endsWith("stanford.edu")) return "Stanford sign-in";
  if (h === "canvas.stanford.edu" && /^\/login/.test(u.pathname)) return "Canvas sign-in";
  if (h === "canvas-gateway.stanford.edu") return "Canvas sign-in";
  if (h === "code.stanford.edu" && u.pathname.startsWith("/users/sign_in")) return "Stanford GitLab sign-in";
  if (h === "accounts.google.com") return /hd=stanford\.edu/.test(all) ? "Google sign-in limited to stanford.edu" : "Google sign-in";
  if (/\/(login|signin|sign_in|sso|auth\/login)(\.aspx)?\b/i.test(u.pathname)) return `sign-in page (${h})`;
  return "";
}

export type Result = { status: number; final: string; type: string; hops: number; gate: string; note: string };

const META_REFRESH = /<meta[^>]+http-equiv=["']?refresh["']?[^>]+content=["']?\s*\d+\s*;\s*url=([^"'>\s]+)/i;

// Follow redirects (and a meta refresh) by hand, stopping at the first sign-in without fetching it.
// `gone` marks a page that answers 200 but says its content is missing or private (YouTube does).
export async function probe(url: string, { timeoutMs = 20000, maxBytes = 65536, gone }: { timeoutMs?: number; maxBytes?: number; gone?: RegExp } = {}): Promise<Result> {
  let at = url, hops = 0;
  for (; hops < 10; hops++) {
    const gate = hops ? signIn(at) : "";
    if (gate) return { status: 0, final: at, type: "", hops, gate, note: "" };
    let r: Response;
    try {
      r = await fetch(at, { redirect: "manual", signal: AbortSignal.timeout(timeoutMs), headers: { "user-agent": "stanford-cs-wiki link check (node)" } });
    } catch (e) {
      return { status: -1, final: at, type: "", hops, gate: "", note: String((e as Error).cause ?? (e as Error).message) };
    }
    const loc = r.headers.get("location");
    if (r.status >= 300 && r.status < 400 && loc) { await r.body?.cancel(); at = new URL(loc, at).href; continue; }
    const type = r.headers.get("content-type") ?? "";
    let body = "";
    if (r.body) {
      const reader = r.body.getReader();
      const chunks: Uint8Array[] = [];
      let size = 0;
      while (size < maxBytes) {
        const { done, value } = await reader.read().catch(() => ({ done: true, value: undefined }));
        if (done || !value) break;
        chunks.push(value); size += value.length;
      }
      await reader.cancel().catch(() => {});
      body = Buffer.concat(chunks).toString("utf8");
    }
    if (gone && r.status === 200 && gone.test(body)) return { status: r.status, final: at, type, hops, gate: "private or removed video or playlist", note: "" };
    const refresh = r.status === 200 && /html/.test(type) ? body.match(META_REFRESH)?.[1] : undefined;
    if (refresh) { at = new URL(refresh, at).href; continue; }
    return { status: r.status, final: at, type, hops, gate: "", note: /html/.test(type) && body.length < 1024 ? `a ${body.length}-byte page: read it` : "" };
  }
  return { status: -1, final: at, type: "", hops, gate: "", note: "more than 10 redirects" };
}

// oEmbed refuses a private video and one whose owner disabled embedding alike, so a refusal is settled by the
// page itself, which says so when the video or playlist is missing or private.
const YT_GONE = /playlist does not exist|This playlist is private|"playabilityStatus":\{"status":"(ERROR|LOGIN_REQUIRED|UNPLAYABLE)"/;
export async function probeYouTube(url: string, oembed: string, options: { gone?: RegExp } = {}): Promise<Result> {
  const r = await probe(oembed);
  if (![401, 403].includes(r.status)) return r;
  return probe(url, { maxBytes: 4_000_000, gone: options.gone ?? YT_GONE });
}

// Retry a 401/403 from www.stanford.edu on web.stanford.edu and back: the two serve the same class/ paths differently.
export const otherHost = (url: string) => {
  const u = new URL(url);
  if (u.hostname === "www.stanford.edu") u.hostname = "web.stanford.edu";
  else if (u.hostname === "web.stanford.edu") u.hostname = "www.stanford.edu";
  else return "";
  return u.href;
};

// Retry a 401/403 Google document through its published-to-web form. "Publish to the web" and "share" are
// separate settings: a sheet published but not shared refuses /export and serves /pubhtml to anyone. The
// spreadsheet form is /pubhtml, the document and presentation form /pub.
export const published = (url: string) => {
  const u = new URL(url);
  const doc = u.hostname === "docs.google.com" && u.pathname.match(/^\/(document|spreadsheets|presentation)\/d\/([\w-]+)(\/.*)?$/);
  if (!doc || /^\/(pub|pubhtml)\b/.test(doc[3] ?? "")) return "";
  return `https://docs.google.com/${doc[1]}/d/${doc[2]}/${doc[1] === "spreadsheets" ? "pubhtml" : "pub"}`;
};

// The problem with a use, given its probe, or "" when they agree.
export function verdict(use: Use, r: Result, rewritten: boolean): string {
  const pdfAsHtml = /\.pdf$/i.test(new URL(use.url).pathname) && /html/.test(r.type);
  const blocked = r.gate || [401, 403].includes(r.status);
  const ok = r.status >= 200 && r.status < 300 && !pdfAsHtml && !r.gate;
  const what = r.gate.startsWith("private") ? r.gate : r.gate ? `ends at a ${r.gate}${r.gate === "Google sign-in" && rewritten ? " (the document isn't shared)" : ""}`
    : r.status === -1 ? `unreachable: ${r.note}`
    : r.status === 429 ? "rate-limited (429): rerun later"
    : pdfAsHtml ? `a .pdf that answers ${r.type.split(";")[0]} (a login page?)`
    : `answers ${r.status}`;
  if (use.expect === "open" && !ok) {
    // Any-account Google sign-ins aren't gates for sites (a free account opens them), only for documents.
    if (r.gate === "Google sign-in" && !rewritten) return `${what}: open only if any Google account gets in`;
    return what;
  }
  if (use.expect === "closed" && ok) return `opens (${r.status}${r.hops ? ` after ${r.hops} redirects` : ""}): check what it serves before keeping closed`;
  if (use.expect === "any" && !ok && !blocked) return what;
  if (ok && r.note) return r.note;
  return "";
}

// ---- running it ----

// One request at a time per host, spaced out; a handful of hosts at once.
function scheduler(gapMs: number) {
  const last = new Map<string, Promise<unknown>>();
  return <T>(host: string, job: () => Promise<T>): Promise<T> => {
    const prev = last.get(host) ?? Promise.resolve();
    const run = prev.then(() => job());
    last.set(host, run.then(() => new Promise((r) => setTimeout(r, gapMs)), () => new Promise((r) => setTimeout(r, gapMs))));
    return run;
  };
}

export async function check(pages: string[], { verbose = false, gapMs = 500 } = {}): Promise<string[]> {
  const perHost = scheduler(gapMs);
  const cache = new Map<string, Promise<Result>>();
  const probeOnce = (url: string) => {
    const target = probeUrl(url);
    const run = target.startsWith("https://www.youtube.com/oembed") ? () => probeYouTube(url, target) : () => probe(target);
    if (!cache.has(url)) cache.set(url, perHost(new URL(target).hostname, run).then(async (r) => {
      if (![401, 403].includes(r.status)) return r;
      const alt = otherHost(url);
      if (alt) {
        const r2 = await perHost(new URL(alt).hostname, () => probe(alt));
        if (r2.status >= 200 && r2.status < 300) return { ...r2, note: `${r.status} here, but ${alt} opens: cite that host` };
      }
      const pub = published(url);
      if (pub) {
        const r3 = await perHost(new URL(pub).hostname, () => probe(pub));
        if (r3.status >= 200 && r3.status < 300) return { ...r3, note: `not shared, but published to the web: ${pub} opens` };
      }
      return r;
    }));
    return cache.get(url)!;
  };
  const lines: string[] = [];
  await Promise.all(pages.map(async (path) => {
    const text = readFileSync(path, "utf8");
    const m = text.match(/^---\n([\s\S]*?)\n---/);
    if (!m) return;
    const found = await Promise.all(uses(parseYaml(m[1])).map(async (use) => {
      if (/^https?:\/\/web\.archive\.org\//.test(use.url)) return verbose ? `${path}: ${use.where} ${use.url}: skipped (the Internet Archive rate-limits)` : "";
      let target: string;
      try { target = probeUrl(use.url); } catch { return `${path}: ${use.where} ${use.url}: not a valid URL`; }
      const r = await probeOnce(use.url);
      const problem = verdict(use, r, target !== use.url);
      const tag = `${use.where}${use.rating ? ` (${use.rating})` : ""}`;
      return problem ? `${path}: ${tag} ${use.url}: ${problem}` : verbose ? `${path}: ${tag} ${use.url}: ok (${r.status})` : "";
    }));
    lines.push(...found.filter(Boolean));
  }));
  return lines.sort();
}

if (process.argv[1] === import.meta.filename) {
  const args = process.argv.slice(2);
  const root = join(import.meta.dirname, "..");
  const pages = args.includes("--all")
    ? readdirSync(join(root, "courses")).filter((f) => f.endsWith(".md") && f !== "index.md").map((f) => join("courses", f))
    : args.filter((a) => !a.startsWith("--"));
  if (!pages.length) {
    console.error('usage: node scripts/links.ts [--all] [--verbose] "courses/CS 109.md" [...]');
    process.exit(2);
  }
  const lines = await check(pages, { verbose: args.includes("--verbose") });
  console.log(lines.length ? lines.join("\n") : `no link problems in ${pages.length} page${pages.length === 1 ? "" : "s"}`);
}
