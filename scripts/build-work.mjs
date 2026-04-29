#!/usr/bin/env node
/**
 * Builds every shareable client project under work/ into share/<project>/.
 *
 * Convention: any directory at work/<project>/mockups/ is treated as a
 * standalone HTML deliverable. The contents of that mockups/ folder are
 * copied to share/<project>/ verbatim. Source files are expected to be
 * already self-contained (data URIs for images, CDN-loaded fonts) — this
 * script doesn't bundle or inline anything; it's a deploy-tray copy.
 *
 * Why mockups/, not the project root: a work/<project>/ directory often
 * holds working files (briefs, README, source PSDs, internal notes) that
 * shouldn't be public. mockups/ is the explicit "this is what we share"
 * subset.
 *
 * Output gets mirrored into dist/share/<project>/ by scripts/copy-share.mjs
 * during astro build, so each project lands at /share/<project>/index.html
 * on the deployed site.
 */
import { readdirSync, statSync, mkdirSync, copyFileSync, rmSync, existsSync } from 'node:fs';
import { resolve, join } from 'node:path';

const workDir = resolve('work');
const shareDir = resolve('share');

if (!existsSync(workDir)) {
  console.log('[build-work] work/ does not exist — nothing to do');
  process.exit(0);
}

const projects = readdirSync(workDir, { withFileTypes: true })
  .filter((d) => d.isDirectory())
  .map((d) => d.name);

if (projects.length === 0) {
  console.log('[build-work] no project directories under work/');
  process.exit(0);
}

let totalCopied = 0;
let totalBytes = 0;
let projectsBuilt = 0;
let projectsSkipped = 0;

for (const project of projects) {
  const srcDir = join(workDir, project, 'mockups');
  if (!existsSync(srcDir)) {
    console.log(`[build-work] ${project}: no mockups/ — skipping`);
    projectsSkipped++;
    continue;
  }

  const dstDir = join(shareDir, project);
  // Wipe the destination so deletions in source propagate cleanly.
  if (existsSync(dstDir)) rmSync(dstDir, { recursive: true, force: true });
  mkdirSync(dstDir, { recursive: true });

  let copied = 0;
  let bytes = 0;
  walk(srcDir, dstDir);
  totalCopied += copied;
  totalBytes += bytes;
  projectsBuilt++;
  console.log(`[build-work] ${project}: copied ${copied} file(s) (${fmt(bytes)}) → share/${project}/`);

  function walk(src, dst) {
    for (const entry of readdirSync(src)) {
      if (entry === '.DS_Store') continue;
      const srcPath = join(src, entry);
      const dstPath = join(dst, entry);
      const stat = statSync(srcPath);
      if (stat.isDirectory()) {
        mkdirSync(dstPath, { recursive: true });
        walk(srcPath, dstPath);
      } else {
        copyFileSync(srcPath, dstPath);
        copied++;
        bytes += stat.size;
      }
    }
  }
}

function fmt(n) {
  return (n / 1024 / 1024).toFixed(2) + ' MB';
}

console.log(
  `[build-work] Done. Built ${projectsBuilt} project(s), ${totalCopied} file(s), ${fmt(totalBytes)}` +
    (projectsSkipped ? ` — ${projectsSkipped} project(s) skipped (no mockups/)` : ''),
);
