import assert from "node:assert/strict";
import { createServer, type Server } from "node:http";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { yamlLines } from "./wiki.ts";
import { check, otherHost, probe, probeUrl, published, signIn, uses, verdict, type Result, type Use } from "./links.ts";

// A local site standing in for the cases the script tells apart. Sign-in hosts are never fetched, so the
// redirects to them need no network.
const ROUTES: Record<string, [number, Record<string, string>, string]> = {
  "/ok": [200, { "content-type": "text/html" }, `<html>${"x".repeat(2000)}</html>`],
  "/tiny": [200, { "content-type": "text/html" }, "<html>hi</html>"],
  "/deck.pdf": [200, { "content-type": "text/html" }, `<html>${"x".repeat(2000)}</html>`],
  "/real.pdf": [200, { "content-type": "application/pdf" }, "%PDF-1.4"],
  "/restricted": [302, { location: "https://weblogin-prod.iam.stanford.edu/login/?RT=x" }, ""],
  "/gitlab": [302, { location: "https://code.stanford.edu/users/sign_in" }, ""],
  "/pset": [302, { location: "https://accounts.google.com/o/oauth2/auth?client_id=x&hd=stanford.edu" }, ""],
  "/hop": [301, { location: "/ok" }, ""],
  "/refresh": [200, { "content-type": "text/html" }, `<meta http-equiv="refresh" content="0; url=/restricted">`],
  "/gone": [404, { "content-type": "text/html" }, "not found"],
  "/deny": [403, { "content-type": "text/html" }, "forbidden"],
};
async function withServer(fn: (base: string) => Promise<void>) {
  const server: Server = createServer((req, res) => {
    const [status, headers, body] = ROUTES[req.url ?? ""] ?? [404, {}, ""];
    res.writeHead(status, headers).end(body);
  });
  await new Promise<void>((r) => server.listen(0, "127.0.0.1", r));
  const { port } = server.address() as { port: number };
  try { await fn(`http://127.0.0.1:${port}`); } finally { server.close(); }
}

test("uses: every frontmatter URL in either schema, with what its rating claims", () => {
  const got = uses({
    homepage: "https://h/", slides: "https://s/", repo: ["https://r1/", "https://r2/"],
    videos: { access: "closed", url: "https://v/" }, notes: { access: "partial", url: ["https://n/"] }, exams: "none",
    projects: { access: "unknown", url: "https://p/" }, sites: [{ url: "https://site/" }], self_study: [{ url: "https://ss/", note: "x" }],
    past: { "Spring 2025": { syllabus: { access: "open", url: "https://old/" }, instructors: [] } },
    materials: { code: { access: "open", url: "https://legacy/" }, sites: [{ url: "https://lsite/", term: "Spring 2025" }] },
    sources: [{ id: "cat", resource: "https://cat/", title: "t" }, { id: "local", resource: "references/x.md", title: "t" }],
  });
  const brief = got.map((u) => `${u.where}|${u.rating}|${u.expect}|${u.url}`);
  assert.deepEqual(brief, [
    "homepage||open|https://h/", "slides|open|open|https://s/", "notes|partial|open|https://n/", "videos|closed|closed|https://v/",
    "projects|unknown|any|https://p/", "repo|open|open|https://r1/", "repo|open|open|https://r2/",
    "sites[0]||open|https://site/", "self_study[0]||open|https://ss/",
    "materials.code|open|open|https://legacy/", "materials.sites[0]||open|https://lsite/",
    "past.Spring 2025.syllabus|open|open|https://old/", "sources.cat||any|https://cat/",
  ]);
});

test("probeUrl: Google documents go to their export, Drive to its listing or download, YouTube to oEmbed", () => {
  assert.equal(probeUrl("https://docs.google.com/document/d/abc_1/edit?usp=sharing"), "https://docs.google.com/document/d/abc_1/export?format=txt");
  assert.equal(probeUrl("https://docs.google.com/presentation/d/abc/preview"), "https://docs.google.com/presentation/d/abc/export/pdf");
  assert.equal(probeUrl("https://docs.google.com/spreadsheets/d/abc/edit#gid=0"), "https://docs.google.com/spreadsheets/d/abc/export?format=csv");
  assert.equal(probeUrl("https://drive.google.com/drive/folders/F1?usp=sharing"), "https://drive.google.com/embeddedfolderview?id=F1");
  assert.equal(probeUrl("https://drive.google.com/file/d/X9/view"), "https://drive.google.com/uc?export=download&id=X9");
  assert.equal(probeUrl("https://www.youtube.com/playlist?list=PL1"), `https://www.youtube.com/oembed?format=json&url=${encodeURIComponent("https://www.youtube.com/playlist?list=PL1")}`);
  assert.equal(probeUrl("https://cs109.stanford.edu/"), "https://cs109.stanford.edu/");
  assert.equal(probeUrl("https://github.com/o/r/blob/main/dir/a.pdf"), "https://raw.githubusercontent.com/o/r/main/dir/a.pdf");
});

test("probeUrl: a published Google document is fetched as cited, and a Dropbox share through its download form", () => {
  // Publishing and sharing are separate: /export would answer 401 for a sheet anyone can read at /pubhtml.
  assert.equal(probeUrl("https://docs.google.com/spreadsheets/d/abc/pubhtml"), "https://docs.google.com/spreadsheets/d/abc/pubhtml");
  assert.equal(probeUrl("https://docs.google.com/spreadsheets/d/abc/pub?output=csv"), "https://docs.google.com/spreadsheets/d/abc/pub?output=csv");
  assert.equal(probeUrl("https://docs.google.com/document/d/abc/pub"), "https://docs.google.com/document/d/abc/pub");
  // ?dl=0 serves Dropbox's HTML viewer whatever the file is, so a .pdf would read as a login page.
  assert.equal(probeUrl("https://www.dropbox.com/scl/fi/a1/book.pdf?rlkey=k&dl=0"), "https://www.dropbox.com/scl/fi/a1/book.pdf?rlkey=k&dl=1");
  assert.equal(probeUrl("https://www.dropbox.com/s/a1/book.pdf"), "https://www.dropbox.com/s/a1/book.pdf?dl=1");
  assert.equal(probeUrl("https://www.dropbox.com/home"), "https://www.dropbox.com/home");
});

test("published: the fallback for a Google document that is published to the web but not shared", () => {
  assert.equal(published("https://docs.google.com/spreadsheets/d/abc/edit#gid=0"), "https://docs.google.com/spreadsheets/d/abc/pubhtml");
  assert.equal(published("https://docs.google.com/document/d/abc/edit?usp=sharing"), "https://docs.google.com/document/d/abc/pub");
  assert.equal(published("https://docs.google.com/presentation/d/abc/preview"), "https://docs.google.com/presentation/d/abc/pub");
  assert.equal(published("https://docs.google.com/spreadsheets/d/abc/pubhtml"), "");
  assert.equal(published("https://drive.google.com/file/d/X9/view"), "");
});

test("signIn: Stanford's gates, a stanford.edu-only Google sign-in, and other sign-ins told apart", () => {
  assert.equal(signIn("https://login.stanford.edu/idp/profile/SAML2/Redirect/SSO"), "Stanford sign-in");
  assert.equal(signIn("https://weblogin-prod.iam.stanford.edu/login/?RT=x"), "Stanford sign-in");
  assert.equal(signIn("https://canvas.stanford.edu/login"), "Canvas sign-in");
  assert.equal(signIn("https://code.stanford.edu/users/sign_in"), "Stanford GitLab sign-in");
  assert.equal(signIn("https://accounts.google.com/ServiceLogin?continue=https%3A%2F%2Fx%3Fhd%3Dstanford.edu"), "Google sign-in limited to stanford.edu");
  assert.equal(signIn("https://accounts.google.com/ServiceLogin?continue=x"), "Google sign-in");
  assert.equal(signIn("https://stanford.hosted.panopto.com/Panopto/Pages/Auth/Login.aspx"), "sign-in page (stanford.hosted.panopto.com)");
  assert.equal(signIn("https://cs109.stanford.edu/psets/"), "");
});

test("probe: follows redirects and a meta refresh, stops at a sign-in unfetched, reports status and type", async () => {
  await withServer(async (base) => {
    const p = (path: string) => probe(base + path);
    assert.deepEqual(await p("/hop"), { status: 200, final: `${base}/ok`, type: "text/html", hops: 1, gate: "", note: "" });
    assert.equal((await p("/restricted")).gate, "Stanford sign-in");
    assert.equal((await p("/gitlab")).gate, "Stanford GitLab sign-in");
    assert.equal((await p("/pset")).gate, "Google sign-in limited to stanford.edu");
    assert.equal((await p("/refresh")).gate, "Stanford sign-in");
    assert.equal((await p("/gone")).status, 404);
    assert.match((await p("/tiny")).note, /byte page: read it/);
    assert.equal((await probe("http://127.0.0.1:1/")).status, -1);
    // A page that answers 200 but says it's gone, as YouTube does for a private or missing playlist.
    assert.equal((await probe(`${base}/ok`, { gone: /x{100}/ })).gate, "private or removed video or playlist");
  });
});

test("verdict: an open rating contradicted by a gate, a closed one by a page that opens; sources only when dead", () => {
  const use = (expect: Use["expect"], url = "https://x.example/a"): Use => ({ where: "slides", rating: "", expect, url });
  const res = (r: Partial<Result>): Result => ({ status: 200, final: "", type: "text/html", hops: 0, gate: "", note: "", ...r });
  assert.equal(verdict(use("open"), res({ status: 0, gate: "Stanford sign-in" }), false), "ends at a Stanford sign-in");
  assert.equal(verdict(use("open"), res({ status: 0, gate: "Google sign-in" }), true), "ends at a Google sign-in (the document isn't shared)");
  assert.match(verdict(use("open"), res({ status: 0, gate: "Google sign-in" }), false), /open only if any Google account gets in/);
  assert.equal(verdict(use("open", "https://x.example/deck.pdf"), res({}), false), "a .pdf that answers text/html (a login page?)");
  assert.equal(verdict(use("open"), res({}), false), "");
  assert.match(verdict(use("closed"), res({}), false), /^opens \(200\): check what it serves/);
  assert.equal(verdict(use("closed"), res({ status: 403 }), false), "");
  assert.equal(verdict(use("any"), res({ status: 403 }), false), "");
  assert.equal(verdict(use("any"), res({ status: 404 }), false), "answers 404");
  assert.equal(verdict(use("open"), res({ status: 200, gate: "private or removed video or playlist" }), true), "private or removed video or playlist");
  assert.equal(otherHost("https://www.stanford.edu/class/cs1/"), "https://web.stanford.edu/class/cs1/");
  assert.equal(otherHost("https://cs1.stanford.edu/"), "");
});

test("check: one line per disagreement, nothing for agreement, each URL fetched once", async () => {
  await withServer(async (base) => {
    const dir = mkdtempSync(join(tmpdir(), "stanford-cs-links-"));
    try {
      const path = join(dir, "CS 1.md");
      const fm = {
        type: "Course", code: "CS 1", homepage: `${base}/ok`, access: "partial",
        slides: `${base}/deck.pdf`, notes: `${base}/real.pdf`, assignments: { access: "open", url: `${base}/pset` },
        videos: { access: "closed", url: `${base}/ok` }, solutions: { access: "closed", url: `${base}/restricted` },
        sites: [{ url: `${base}/gitlab` }], sources: [{ id: "a", resource: `${base}/deny`, title: "t" }, { id: "b", resource: `${base}/gone`, title: "t" }],
      };
      writeFileSync(path, `---\n${yamlLines(fm).join("\n")}\n---\n# CS 1\n`);
      const lines = (await check([path], { gapMs: 0 })).map((l) => l.replace(`${path}: `, "").replace(base, ""));
      assert.deepEqual(lines, [
        "assignments (open) /pset: ends at a Google sign-in limited to stanford.edu",
        "sites[0] /gitlab: ends at a Stanford GitLab sign-in",
        "slides (open) /deck.pdf: a .pdf that answers text/html (a login page?)",
        "sources.b /gone: answers 404",
        "videos (closed) /ok: opens (200): check what it serves before keeping closed",
      ]);
    } finally { rmSync(dir, { recursive: true, force: true }); }
  });
});
