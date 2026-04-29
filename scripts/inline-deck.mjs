#!/usr/bin/env node
/**
 * Bundles built Astro presentations into self-contained share/<slug>-standalone.html.
 *
 * Folds external CSS, woff2 fonts, and raster/SVG images into the HTML as
 * data URIs so the file opens with no network — email attachment, USB,
 * offline laptop. <source>...mp4 tags are stripped (poster carries the cover).
 *
 * Usage:
 *   node scripts/inline-deck.mjs              # bundles every presentation in dist/presentations/
 *   node scripts/inline-deck.mjs <slug>       # bundles just that presentation
 *
 * Expects `astro build` to have run first (the `decks:standalone` npm
 * script chains them; the main `build` script picks this up via copy-share).
 */
import { readFileSync, writeFileSync, statSync, mkdirSync, readdirSync, existsSync } from 'node:fs';
import { resolve, join } from 'node:path';

const distDir = resolve('dist');
const presentationsDir = resolve(distDir, 'presentations');
const shareDir = resolve('share');
mkdirSync(shareDir, { recursive: true });

if (!existsSync(presentationsDir)) {
  console.error(`[inline-deck] no presentations directory in dist/ — did astro build run?`);
  process.exit(1);
}

const argSlug = process.argv[2];
const slugs = argSlug
  ? [argSlug]
  : readdirSync(presentationsDir, { withFileTypes: true })
      .filter((d) => d.isDirectory())
      .map((d) => d.name);

if (slugs.length === 0) {
  console.log('[inline-deck] no presentations found to bundle');
  process.exit(0);
}

let bundled = 0;
for (const slug of slugs) {
  try {
    bundle(slug);
    bundled++;
  } catch (err) {
    console.error(`[inline-deck] ${slug}: ${err.message}`);
    process.exitCode = 1;
  }
}
console.log(`[inline-deck] Done. Bundled ${bundled}/${slugs.length} presentation(s).`);

function bundle(slug) {
  const htmlPath = resolve(presentationsDir, slug, 'index.html');
  const outPath = resolve(shareDir, `${slug}-standalone.html`);

  let html = readFileSync(htmlPath, 'utf8');

  const linkMatch = html.match(/<link[^>]+href="(\/_astro\/[^"]+\.css)"[^>]*>/);
  if (!linkMatch) throw new Error('No external CSS link found in built HTML.');
  const cssHref = linkMatch[1];
  const cssPath = resolve(distDir, cssHref.replace(/^\//, ''));
  let css = readFileSync(cssPath, 'utf8');

  const fontUrlRe = /url\(\/presentations\/[^)"']+\.woff2\)/g;
  const fontUrls = [...new Set(css.match(fontUrlRe) || [])];
  let inlinedBytes = 0;
  for (const u of fontUrls) {
    const rel = u.slice(4, -1);
    const fontPath = resolve(distDir, rel.replace(/^\//, ''));
    const buf = readFileSync(fontPath);
    inlinedBytes += buf.length;
    const dataUri = `url(data:font/woff2;base64,${buf.toString('base64')})`;
    css = css.split(u).join(dataUri);
  }

  html = html.replace(linkMatch[0], `<style>${css}</style>`);

  const inlineImage = (publicPath, mime) => {
    const buf = readFileSync(resolve(distDir, publicPath.replace(/^\//, '')));
    return `data:${mime};base64,${buf.toString('base64')}`;
  };

  const imageRe = /(src|poster|href)="(\/[^"]+\.(svg|webp|png|jpg|jpeg))"/g;
  html = html.replace(imageRe, (_m, attr, p, ext) => {
    try {
      const mime = ext === 'svg' ? 'image/svg+xml' : ext === 'jpg' ? 'image/jpeg' : `image/${ext}`;
      return `${attr}="${inlineImage(p, mime)}"`;
    } catch {
      return _m;
    }
  });

  html = html.replace(/<source[^>]+\.mp4"[^>]*>/g, '');

  writeFileSync(outPath, html);
  const outBytes = statSync(outPath).size;
  const fmt = (n) => (n / 1024 / 1024).toFixed(2) + ' MB';
  console.log(`[inline-deck] ${slug}: wrote share/${slug}-standalone.html`);
  console.log(`[inline-deck]   Inlined ${fontUrls.length} fonts (${fmt(inlinedBytes)} raw)`);
  console.log(`[inline-deck]   Output size: ${fmt(outBytes)}`);
}
