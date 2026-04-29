#!/usr/bin/env node
/**
 * Copies share/ → all live build output locations as part of the build.
 *
 * Background: share/ at the repo root is a "publish tray" for self-contained
 * HTML outputs (decks, one-pagers, visual explainers) that we want to ship
 * at predictable URLs (/share/<filename>.html). It's deliberately separate
 * from public/ so it doesn't muddy Astro's static asset root.
 *
 * Where the files need to land depends on which output Vercel actually serves:
 *   - dist/share/                        — used by `astro preview` and any
 *                                          deploy target that consumes dist/
 *   - .vercel/output/static/share/       — what Vercel actually serves when
 *                                          @astrojs/vercel writes a Build
 *                                          Output API v3 bundle (our case)
 *
 * We copy into whichever exists. .gitkeep / .DS_Store are skipped.
 */
import { readdirSync, statSync, mkdirSync, copyFileSync, existsSync } from 'node:fs';
import { resolve, join } from 'node:path';

const srcDir = resolve('share');
const targets = [
  resolve('dist', 'share'),
  resolve('.vercel', 'output', 'static', 'share'),
].filter((dir) => existsSync(resolve(dir, '..')));

if (!existsSync(srcDir)) {
  console.log('[copy-share] share/ does not exist — skipping');
  process.exit(0);
}

if (targets.length === 0) {
  console.error('[copy-share] No build output directory found (looked for dist/ and .vercel/output/static/) — did astro build run?');
  process.exit(1);
}

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

for (const target of targets) {
  mkdirSync(target, { recursive: true });
  // Reset counters per-target so the log is honest about what each one did.
  const before = copied;
  walk(srcDir, target);
  console.log(`[copy-share] → ${target.replace(process.cwd() + '/', '')}: ${copied - before} file(s)`);
}

const fmt = (n) => (n / 1024 / 1024).toFixed(2) + ' MB';
console.log(`[copy-share] Total: ${copied} write(s) across ${targets.length} target(s) (${fmt(totalBytes)})`);
if (skipped) console.log(`[copy-share] Skipped ${skipped} non-deliverable entries (.gitkeep / .DS_Store)`);
