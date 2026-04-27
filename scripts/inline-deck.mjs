#!/usr/bin/env node
import { readFileSync, writeFileSync, statSync } from 'node:fs';
import { resolve, dirname, basename } from 'node:path';

const slug = process.argv[2] || 'ngl-barcelona';
const distDir = resolve('dist');
const htmlPath = resolve(distDir, 'presentations', slug, 'index.html');
const outPath = resolve(`${slug}-standalone.html`);

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
console.log(`Wrote ${outPath}`);
console.log(`  Inlined ${fontUrls.length} fonts (${fmt(inlinedBytes)} raw)`);
console.log(`  Output size: ${fmt(outBytes)}`);
