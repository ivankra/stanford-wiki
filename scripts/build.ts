// Regenerate courses/index.md, the marked generated blocks in terms/*.md and programs/*.md,
// and the MSCS tags on course pages; canonicalize all frontmatter as block YAML.
// Usage: node scripts/build.ts [bundle-dir]
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { join, relative } from "node:path";
import { load, render, sameText, ENROLLMENT_FILE } from "./wiki.ts";

const ROOT = process.argv[2] ?? join(import.meta.dirname, "..");
// Enrollment is the one generated figure sourced from outside the bundle, and its source sits in the
// references subrepo, which may not be checked out. Without it the figures already on the pages stand.
if (!existsSync(join(ROOT, ENROLLMENT_FILE)))
  console.error(`warning: no ${ENROLLMENT_FILE}; leaving the enrollment already on the pages as it is `
    + "(rebuild it with scripts/explorecourses.py)");
const problems: string[] = [];
for (const [path, text] of render(ROOT, load(ROOT), problems)) {
  if (existsSync(path) && sameText(readFileSync(path, "utf8"), text)) continue;
  writeFileSync(path, text);
  console.log(`updated ${relative(ROOT, path)}`);
}
for (const p of problems) console.error(`ERROR ${p}`);
process.exit(problems.length ? 1 : 0);
