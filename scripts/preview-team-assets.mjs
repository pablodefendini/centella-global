#!/usr/bin/env node
/**
 * Renders the team-asset SVG templates against a fixture profile and
 * writes the outputs to /tmp so you can preview SVG template edits
 * without needing live Notion data. Useful when iterating on
 * src/templates/business-card.svg or email-signature.svg.
 *
 *   npm run team-assets:preview
 *
 * Outputs:
 *   /tmp/centella-preview-card.pdf
 *   /tmp/centella-preview-signature.png
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { Resvg } from '@resvg/resvg-js';
import PDFDocument from 'pdfkit';
import SVGtoPDF from 'svg-to-pdfkit';

const CARD = readFileSync(resolve('src/templates/business-card.svg'), 'utf8');
const SIG = readFileSync(resolve('src/templates/email-signature.svg'), 'utf8');

// Fixture profile — edit fields here to test different content lengths and
// edge cases (long names, missing pronouns, no website, etc.).
const ctx = {
  name: 'Pablo Defendini',
  title: 'Co-founder',
  role: 'Strategy lead, Latin America',
  email: 'pablo@centellaglobal.com',
  phone: '+1 555 0100',
  pronouns: 'he/him',
  linkedin: 'https://linkedin.com/in/pdefendini',
  website: 'https://centellaglobal.com',
  linkedinDisplay: 'linkedin.com/in/pdefendini',
  websiteDisplay: 'centellaglobal.com',
};

function escapeXml(s) {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

const interpolate = (t) => t.replace(/\{\{(\w+)\}\}/g, (_, k) => escapeXml(ctx[k] ?? ''));

const cardSvg = interpolate(CARD);
const sigSvg = interpolate(SIG);

// PNG via resvg (matches build script settings)
const png = new Resvg(sigSvg, {
  fitTo: { mode: 'zoom', value: 2 },
  background: 'rgba(0,0,0,0)',
  font: { loadSystemFonts: true },
})
  .render()
  .asPng();
writeFileSync('/tmp/centella-preview-signature.png', png);
console.log(`PNG  ${png.length.toString().padStart(7, ' ')} bytes  →  /tmp/centella-preview-signature.png`);

// PDF via pdfkit + svg-to-pdfkit (matches build script settings)
const MM = 72 / 25.4;
await new Promise((res, rej) => {
  const doc = new PDFDocument({ size: [91 * MM, 61 * MM], margin: 0 });
  const chunks = [];
  doc.on('data', (c) => chunks.push(c));
  doc.on('end', () => {
    const buf = Buffer.concat(chunks);
    writeFileSync('/tmp/centella-preview-card.pdf', buf);
    console.log(`PDF  ${buf.length.toString().padStart(7, ' ')} bytes  →  /tmp/centella-preview-card.pdf`);
    res();
  });
  doc.on('error', rej);
  SVGtoPDF(doc, cardSvg, 0, 0, { width: 91 * MM, height: 61 * MM, useCSS: false });
  doc.end();
});

console.log('OK');
