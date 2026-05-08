#!/usr/bin/env node
/**
 * Downloads team-member photos from Notion at build time and writes them
 * to public/team/<slug>.webp for the about-centella team grid.
 *
 * Why a pipeline at all: Notion file URLs are signed and expire ~1 hour
 * after issue, so we can't reference them directly from rendered HTML
 * on a public page (the auth-gated /tools/* surface gets away with it
 * because every build regenerates). The fix is the canonical recipe in
 * design.md / CLAUDE.md: download once at build time, convert to WebP,
 * write a stable path under public/.
 *
 * Order: runs BEFORE astro build (as a prebuild step) so the photos
 * are in public/team/ when Astro's public/→dist/ copy fires. Output
 * files are NOT committed — Notion is the source of truth, every
 * deploy regenerates them.
 *
 * Fail-safe: skip-on-error per profile, exit 0 unless hard config is
 * missing. A failed photo lets the team grid fall back to an initials
 * placeholder for that person; failing the whole build over one bad
 * fetch would block the rest of the site shipping.
 */

import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve, join } from 'node:path';
import { Client } from '@notionhq/client';
import sharp from 'sharp';

// --- Config ----------------------------------------------------------------

const NOTION_API_KEY = process.env.NOTION_API_KEY;
const TEAM_PROFILES_DB_ID = process.env.NOTION_TEAM_PROFILES_DB_ID;

const OUT_DIR = resolve('public', 'team');
const PHOTO_SIZE = 800;          // square WebP, fits 2× retina at typical card widths
const PHOTO_QUALITY = 80;        // sharp WebP quality

// --- Early exits -----------------------------------------------------------

if (!TEAM_PROFILES_DB_ID) {
  console.log('[team-photos] NOTION_TEAM_PROFILES_DB_ID not set — skipping team-photo pipeline.');
  process.exit(0);
}

if (!NOTION_API_KEY) {
  console.error('[team-photos] NOTION_API_KEY not set — cannot fetch team profiles.');
  process.exit(1);
}

mkdirSync(OUT_DIR, { recursive: true });

// --- Notion query ----------------------------------------------------------

const notion = new Client({ auth: NOTION_API_KEY });

const getRichText = (prop) =>
  prop?.type === 'rich_text' ? (prop.rich_text ?? []).map((t) => t.plain_text).join('') : '';

const getFileUrl = (prop) => {
  if (prop?.type !== 'files') return null;
  const file = (prop.files ?? [])[0];
  if (!file) return null;
  return file.type === 'external' ? file.external?.url ?? null : file.file?.url ?? null;
};

async function fetchActiveProfiles() {
  const res = await notion.databases.query({
    database_id: TEAM_PROFILES_DB_ID,
    filter: { property: 'Status', select: { equals: 'Active' } },
    sorts: [{ property: 'Name', direction: 'ascending' }],
  });
  return res.results.map((page) => {
    const p = page.properties;
    return {
      id: page.id,
      slug: getRichText(p['Slug']),
      photoUrl: getFileUrl(p['Photo']),
    };
  });
}

// --- Download + convert ----------------------------------------------------

async function downloadAndConvert(slug, url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`fetch failed: HTTP ${res.status} ${res.statusText}`);
  const buf = Buffer.from(await res.arrayBuffer());
  const out = await sharp(buf)
    .rotate()                                                  // honor EXIF orientation
    .resize(PHOTO_SIZE, PHOTO_SIZE, { fit: 'cover', position: 'attention' })
    .webp({ quality: PHOTO_QUALITY })
    .toBuffer();
  writeFileSync(join(OUT_DIR, `${slug}.webp`), out);
}

// --- Main ------------------------------------------------------------------

const profiles = await fetchActiveProfiles();

if (profiles.length === 0) {
  console.log('[team-photos] No Active team profiles — nothing to do.');
  process.exit(0);
}

let written = 0;
let skipped = 0;
let errored = 0;

for (const p of profiles) {
  if (!p.slug) {
    console.warn(`[team-photos] profile ${p.id}: no Slug — skipping.`);
    skipped++;
    continue;
  }
  if (!p.photoUrl) {
    console.log(`[team-photos] ${p.slug}: no Photo set — skipping (page will use initials fallback).`);
    skipped++;
    continue;
  }
  try {
    await downloadAndConvert(p.slug, p.photoUrl);
    console.log(`[team-photos] ${p.slug}: wrote public/team/${p.slug}.webp`);
    written++;
  } catch (err) {
    console.error(`[team-photos] ${p.slug}: ${err.message}`);
    errored++;
  }
}

console.log(`[team-photos] done — written=${written} skipped=${skipped} errored=${errored}`);
// Exit 0 on per-profile errors so the build keeps going; the team grid
// handles missing photos gracefully via the initials fallback.
process.exit(0);
