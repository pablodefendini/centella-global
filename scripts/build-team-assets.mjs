#!/usr/bin/env node
/**
 * Generates per-team-member branded assets from Notion at build time:
 *   - Business card PDF (vector, 85×55mm + 3mm bleed) at
 *     /tools/business-cards/<slug>.pdf
 *   - Email signature PNG (transparent, 2× density) at
 *     /tools/email-signatures/<slug>.png
 *
 * Assets are co-located under /tools/* (alongside their listing pages) so
 * the whole staff section sits under a single auth-gated prefix.
 *
 * Runs as a postbuild step (after `astro build`, before `copy-share.mjs`)
 * so the build output directories already exist. Outputs are written
 * directly into both deploy targets (matching copy-share.mjs's dual-target
 * pattern), and are intentionally NOT committed to git — Notion is the
 * source of truth and every Vercel deploy regenerates them fresh.
 *
 * Auth on /tools/* (page routes AND generated assets) is enforced by
 * src/middleware.ts.
 *
 * SVG templates live at src/templates/{business-card,email-signature}.svg
 * and use {{token}} interpolation. Available tokens: name, titleRole,
 * email, phone, pronouns, linkedin, website, plus pre-computed
 * linkedinDisplay / websiteDisplay (protocol-stripped variants).
 *
 * Fail-safe behavior:
 *   - If NOTION_TEAM_PROFILES_DB_ID is unset: log + exit 0 (no-op).
 *   - If the DB is empty: log + exit 0.
 *   - If a single profile fails to render: log + continue, exit nonzero
 *     at the end so CI surfaces it without blocking other people's assets.
 *
 * TODO when the real templates land: register the Barlow font family with
 * PDFKit (doc.registerFont) and pass it to Resvg's `font.fontFiles` so
 * vector PDFs and PNGs use brand typography instead of falling back to
 * Helvetica or system defaults.
 */

import { readFileSync, mkdirSync, writeFileSync, existsSync } from 'node:fs';
import { resolve, join } from 'node:path';
import { Client } from '@notionhq/client';
import { Resvg } from '@resvg/resvg-js';
import PDFDocument from 'pdfkit';
import SVGtoPDF from 'svg-to-pdfkit';

// --- Config -----------------------------------------------------------------

const NOTION_API_KEY = process.env.NOTION_API_KEY;
const TEAM_PROFILES_DB_ID = process.env.NOTION_TEAM_PROFILES_DB_ID;

const TARGET_DIRS = [
  resolve('dist'),
  resolve('.vercel', 'output', 'static'),
].filter(existsSync);

const TEMPLATES_DIR = resolve('src', 'templates');
const CARD_TEMPLATE_PATH = join(TEMPLATES_DIR, 'business-card.svg');
const SIG_TEMPLATE_PATH = join(TEMPLATES_DIR, 'email-signature.svg');

// 85×55mm trim + 3mm bleed each side = 91×61mm artboard.
// PDF unit is points: 1mm = 72/25.4 pt.
const MM_TO_PT = 72 / 25.4;
const CARD_WIDTH_PT = 91 * MM_TO_PT;
const CARD_HEIGHT_PT = 61 * MM_TO_PT;
const PNG_DENSITY = 2;

// --- Early exits ------------------------------------------------------------

if (!TEAM_PROFILES_DB_ID) {
  console.log('[team-assets] NOTION_TEAM_PROFILES_DB_ID not set — skipping team-asset generation.');
  process.exit(0);
}

if (!NOTION_API_KEY) {
  console.error('[team-assets] NOTION_API_KEY not set — cannot fetch team profiles.');
  process.exit(1);
}

if (TARGET_DIRS.length === 0) {
  console.error('[team-assets] No build output directory found (looked for dist/ and .vercel/output/static/) — did astro build run first?');
  process.exit(1);
}

// --- Notion query -----------------------------------------------------------

const notion = new Client({ auth: NOTION_API_KEY });

const getTitleText = (prop) =>
  prop?.type === 'title' ? (prop.title ?? []).map((t) => t.plain_text).join('') : '';
const getRichText = (prop) =>
  prop?.type === 'rich_text' ? (prop.rich_text ?? []).map((t) => t.plain_text).join('') : '';
const getSelect = (prop) => prop?.select?.name ?? '';
const getEmail = (prop) => prop?.email ?? '';
const getPhone = (prop) => prop?.phone_number ?? '';
const getUrl = (prop) => prop?.url ?? '';

async function fetchActiveTeamProfiles() {
  const res = await notion.databases.query({
    database_id: TEAM_PROFILES_DB_ID,
    filter: { property: 'Status', select: { equals: 'Active' } },
    sorts: [{ property: 'Name', direction: 'ascending' }],
  });
  return res.results.map((page) => {
    const p = page.properties;
    return {
      id: page.id,
      name: getTitleText(p['Name']),
      slug: getRichText(p['Slug']),
      status: getSelect(p['Status']),
      titleRole: getRichText(p['Title/Role']),
      email: getEmail(p['Email']),
      phone: getPhone(p['Phone']),
      pronouns: getRichText(p['Pronouns']),
      linkedin: getUrl(p['LinkedIn']),
      website: getUrl(p['Website']),
    };
  });
}

// --- Token substitution -----------------------------------------------------

function escapeXml(s) {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

const stripProtocol = (url) => (url ? url.replace(/^https?:\/\//, '').replace(/\/$/, '') : '');

function buildTokenContext(profile) {
  return {
    name: profile.name,
    titleRole: profile.titleRole,
    email: profile.email,
    phone: profile.phone,
    pronouns: profile.pronouns,
    linkedin: profile.linkedin ?? '',
    website: profile.website ?? '',
    linkedinDisplay: stripProtocol(profile.linkedin),
    websiteDisplay: stripProtocol(profile.website),
  };
}

function interpolate(template, ctx) {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key) => escapeXml(ctx[key] ?? ''));
}

// --- Renderers --------------------------------------------------------------

function renderPng(svgString) {
  const resvg = new Resvg(svgString, {
    fitTo: { mode: 'zoom', value: PNG_DENSITY },
    background: 'rgba(0,0,0,0)',
    font: { loadSystemFonts: true },
  });
  return resvg.render().asPng();
}

function renderPdf(svgString) {
  return new Promise((resolveBuf, rejectBuf) => {
    const doc = new PDFDocument({
      size: [CARD_WIDTH_PT, CARD_HEIGHT_PT],
      margin: 0,
      info: { Title: 'Centella business card', Producer: 'centella-global build pipeline' },
    });
    const chunks = [];
    doc.on('data', (chunk) => chunks.push(chunk));
    doc.on('end', () => resolveBuf(Buffer.concat(chunks)));
    doc.on('error', rejectBuf);

    try {
      SVGtoPDF(doc, svgString, 0, 0, {
        width: CARD_WIDTH_PT,
        height: CARD_HEIGHT_PT,
        preserveAspectRatio: 'xMidYMid meet',
        useCSS: false,
      });
    } catch (err) {
      rejectBuf(err);
      return;
    }
    doc.end();
  });
}

// --- Output -----------------------------------------------------------------

function writeAsset(toolSlug, personSlug, ext, buffer) {
  for (const target of TARGET_DIRS) {
    const dir = join(target, 'tools', toolSlug);
    mkdirSync(dir, { recursive: true });
    writeFileSync(join(dir, `${personSlug}.${ext}`), buffer);
  }
}

// --- Main -------------------------------------------------------------------

const cardTemplate = readFileSync(CARD_TEMPLATE_PATH, 'utf8');
const sigTemplate = readFileSync(SIG_TEMPLATE_PATH, 'utf8');

let profiles;
try {
  profiles = await fetchActiveTeamProfiles();
} catch (err) {
  console.error(`[team-assets] Failed to query Notion: ${err.message}`);
  process.exit(1);
}

if (profiles.length === 0) {
  console.log('[team-assets] No Active team profiles in Notion — nothing to generate.');
  process.exit(0);
}

let ok = 0;
let failed = 0;

for (const profile of profiles) {
  if (!profile.slug) {
    console.warn(`[team-assets] Skipping "${profile.name || profile.id}" — no Slug set in Notion.`);
    failed++;
    continue;
  }
  try {
    const ctx = buildTokenContext(profile);
    const cardSvg = interpolate(cardTemplate, ctx);
    const sigSvg = interpolate(sigTemplate, ctx);

    const pdfBuf = await renderPdf(cardSvg);
    const pngBuf = renderPng(sigSvg);

    writeAsset('business-cards', profile.slug, 'pdf', pdfBuf);
    writeAsset('email-signatures', profile.slug, 'png', pngBuf);
    ok++;
  } catch (err) {
    console.error(`[team-assets] Failed for "${profile.name}" (${profile.slug}): ${err.message}`);
    failed++;
  }
}

const filesPerProfile = 2; // card + signature
const filesWritten = ok * filesPerProfile * TARGET_DIRS.length;
console.log(
  `[team-assets] Generated ${filesWritten} file(s) for ${ok} profile(s) across ${TARGET_DIRS.length} target dir(s).`,
);
if (failed) {
  console.warn(`[team-assets] ${failed} profile(s) failed — see errors above.`);
  process.exit(1);
}
