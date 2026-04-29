#!/usr/bin/env node
/**
 * Copies share/ → dist/share/ as part of the build.
 *
 * Background: share/ at the repo root is a "publish tray" for self-contained
 * HTML outputs (decks, one-pagers, visual explainers) that we want to ship
 * at predictable URLs (/share/<filename>.html). It's deliberately separate
 * from public/ so it doesn't muddy Astro's static asset root.
 *
 * On every build we mirror share/ into dist/share/ so Vercel serves them.
 * .gitkeep is skipped.
 */
import { readdirSync, statSync, mkdirSync, copyFileSync, existsSync } from 'node:fs';
import { resolve, join } from 'node:path';

const srcDir = resolve('share');
const dstDir = resolve('dist', 'share');

if (!existsSync(srcDir)) {
  console.log('[copy-share] share/ does not exist — skipping');
  process.exit(0);
}

if (!existsSync(resolve('dist'))) {
  console.error('[copy-share] dist/ does not exist — did astro build run?');
  process.exit(1);
}

mkdirSync(dstDir, { recursive: true });

let copied = 0;
let skipped = 0;
let totalBytes = 0;

function walk(src, dst) {
  for (const entry of readdirSync(src)) {
    if (entry === '.gitkeep' || entry === '.DS_Store') {
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
console.log(`[copy-share] Copied ${copied} file(s) (${fmt(totalBytes)}) to dist/share/`);
if (skipped) console.log(`[copy-share] Skipped ${skipped} non-deliverable file(s)`);
