#!/usr/bin/env node
/**
 * Builds the Prime Movers 20th brochure mockups into share/prime-movers-20th/.
 *
 * Background: the four design directions plus the comparison index live in
 * work/prime-movers-20th/mockups/ as fully self-contained HTML (Hunt logo
 * inlined as a data URI; fonts pulled from Google Fonts CDN). They're not
 * part of the Astro site build, but we want them reachable at a stable URL
 * so they can be shared with Hunt Alternatives without zipping or AirDrop.
 *
 * "Build" here is just a copy — the source files are already standalone.
 * Output lands in share/prime-movers-20th/, which scripts/copy-share.mjs
 * then mirrors into dist/share/prime-movers-20th/ during the main build.
 * End state: /share/prime-movers-20th/index.html on the deployed site.
 */
import { readdirSync, statSync, mkdirSync, copyFileSync, rmSync, existsSync } from 'node:fs';
import { resolve, join } from 'node:path';

const srcDir = resolve('work', 'prime-movers-20th', 'mockups');
const dstDir = resolve('share', 'prime-movers-20th');

if (!existsSync(srcDir)) {
  console.error(`[build-prime-movers] source not found: ${srcDir}`);
  process.exit(1);
}

// Wipe the destination first so deletions in source propagate cleanly.
if (existsSync(dstDir)) rmSync(dstDir, { recursive: true, force: true });
mkdirSync(dstDir, { recursive: true });

let copied = 0;
let skipped = 0;
let totalBytes = 0;

function walk(src, dst) {
  for (const entry of readdirSync(src)) {
    if (entry === '.DS_Store') {
      skipped++;
      continue;
    }
    const srcPath = join(src, entry);
    const dstPath = join(dst, entry);
    const stat = statSync(srcPath);
    if (stat.isDirectory()) {
      mkdirSync(dstPath, { recursive: true });
      walk(srcPath, dstPath);
    } else {
      copyFileSync(srcPath, dstPath);
      copied++;
      totalBytes += stat.size;
    }
  }
}

walk(srcDir, dstDir);

const fmt = (n) => (n / 1024 / 1024).toFixed(2) + ' MB';
console.log(`[build-prime-movers] Copied ${copied} file(s) (${fmt(totalBytes)}) to share/prime-movers-20th/`);
if (skipped) console.log(`[build-prime-movers] Skipped ${skipped} non-deliverable file(s)`);
console.log(`[build-prime-movers] Will deploy at /share/prime-movers-20th/index.html`);
