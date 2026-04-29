#!/usr/bin/env node
/**
 * Reads share/_index.json and emits share/index.html — a Centella-chromed
 * lobby that lists every project under share/ with a short description and
 * links to its artifacts.
 *
 * The manifest is the source of truth for project metadata (title, eyebrow,
 * description, accent, artifacts). The script also walks share/ to:
 *   - verify each artifact href in the manifest resolves to a real file
 *     (or a directory containing index.html)
 *   - warn about any top-level entry under share/ that isn't represented
 *     in the manifest (so Pablo knows to add a description for it)
 *
 * Run via: npm run share:index
 * Chained from: npm run share:build (after astro build, decks, work).
 *
 * The output is self-contained — Centella tokens inlined as CSS custom
 * properties, Barlow loaded from Google Fonts. No Astro pipeline involved;
 * the file ships as-is from share/index.html → /share/ on the live site.
 */
import { readFileSync, readdirSync, writeFileSync, existsSync } from 'node:fs';
import { resolve, join } from 'node:path';

const shareDir = resolve('share');
const manifestPath = join(shareDir, '_index.json');
const outPath = join(shareDir, 'index.html');

if (!existsSync(manifestPath)) {
  console.error(`[build-share-index] ${manifestPath} not found — aborting`);
  process.exit(1);
}

const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
if (!Array.isArray(manifest.projects)) {
  console.error('[build-share-index] manifest is missing a projects[] array');
  process.exit(1);
}

// 1. Cross-check the manifest against what's actually on disk.
const skipNames = new Set(['index.html', '_index.json', '.gitkeep', '.DS_Store']);
const topLevel = new Set(
  readdirSync(shareDir, { withFileTypes: true })
    .map((d) => d.name)
    .filter((n) => !n.startsWith('.') && !skipNames.has(n)),
);

const referenced = new Set();
let missing = 0;
for (const project of manifest.projects) {
  for (const art of project.artifacts || []) {
    const first = String(art.href).split('/').filter(Boolean)[0];
    if (first) referenced.add(first);
    const tryPaths = [
      join(shareDir, art.href),
      join(shareDir, art.href, 'index.html'),
    ];
    if (!tryPaths.some(existsSync)) {
      console.warn(
        `[build-share-index] ${project.slug}: artifact "${art.label}" → ${art.href} not found on disk`,
      );
      missing++;
    }
  }
}

const orphans = [...topLevel].filter((n) => !referenced.has(n));
if (orphans.length) {
  console.warn(
    `[build-share-index] orphan(s) under share/ not in manifest: ${orphans.join(', ')} — add an entry to _index.json or remove the file`,
  );
}

// 2. Render and write.
const html = renderPage(manifest);
writeFileSync(outPath, html, 'utf8');

const kb = (Buffer.byteLength(html, 'utf8') / 1024).toFixed(1);
console.log(
  `[build-share-index] wrote share/index.html — ${manifest.projects.length} project(s), ${kb} KB` +
    (missing ? ` (${missing} missing artifact(s))` : '') +
    (orphans.length ? ` (${orphans.length} orphan(s))` : ''),
);

// ----------------------------------------------------------------

function esc(s) {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function renderPage(m) {
  const site = m.site || {};
  const headline = site.headline || {};
  const accentClass = headline.accentGradient
    ? `display__accent--${esc(headline.accentGradient)}`
    : '';

  const cards = (m.projects || []).map(renderCard).join('\n');

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>${esc(site.title || 'Share')}</title>
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex">
<meta name="description" content="${esc(site.lede || '')}">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Barlow:wght@300;400;500;600&family=Barlow+Condensed:wght@300;500;800&family=Barlow+Semi+Condensed:wght@500;600&display=swap" rel="stylesheet">
<style>
  /* Centella tokens — derived from src/styles/global.css. Inlined so this
     file is fully self-contained at /share/index.html, no build dependency. */
  :root {
    --violet: #C77DFF;
    --violet-dark: #1E1A28;
    --advisory: #00E5FF;
    --networking: #FF6B6B;
    --investment: #CCFF00;
    --global: #FF9500;
    --tech: #FF66C4;

    --bg-deep: #060607;
    --bg-surface: #0D0D0F;
    --color-text: #F7EDFF;
    --color-text-muted: rgba(247, 237, 255, 0.6);
    --color-text-dim: rgba(247, 237, 255, 0.35);
    --color-border: rgba(247, 237, 255, 0.08);

    --font-display: 'Barlow Condensed', system-ui, sans-serif;
    --font-body: 'Barlow', system-ui, sans-serif;
    --font-semi: 'Barlow Semi Condensed', system-ui, sans-serif;

    --space-2: 0.5rem;
    --space-3: 0.75rem;
    --space-4: 1rem;
    --space-6: 1.5rem;
    --space-8: 2rem;
    --space-12: 3rem;
    --space-16: 4rem;
    --space-24: 6rem;

    --max-width: 72rem;
    --gutter: var(--space-6);
    --leading-tight: 1.15;
    --leading-normal: 1.6;
    --transition-base: 250ms ease;

    --grad-violet-coral: linear-gradient(135deg, var(--violet), var(--networking));
    --grad-cyan-violet: linear-gradient(135deg, var(--advisory), var(--violet));
    --grad-pink-violet: linear-gradient(135deg, var(--tech), var(--violet));
    --grad-cyan-lime: linear-gradient(135deg, var(--advisory), var(--investment));
    --grad-coral-orange: linear-gradient(135deg, var(--networking), var(--global));
    --grad-lime-teal: linear-gradient(135deg, var(--investment), var(--advisory));
  }

  * { box-sizing: border-box; }

  html, body {
    margin: 0;
    padding: 0;
    background: var(--bg-deep);
    color: var(--color-text);
    font-family: var(--font-body);
    font-weight: 400;
    line-height: var(--leading-normal);
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  a { color: inherit; text-decoration: none; }

  .container {
    max-width: var(--max-width);
    margin: 0 auto;
    padding: 0 var(--gutter);
  }

  header.hero {
    padding: var(--space-24) 0 var(--space-12);
    border-bottom: 1px solid var(--color-border);
  }

  .eyebrow {
    font-family: var(--font-semi);
    font-size: 0.806rem;
    font-weight: 600;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: var(--color-text-dim);
    margin: 0 0 var(--space-6);
  }

  .display {
    font-family: var(--font-display);
    font-weight: 300;
    font-size: clamp(2.75rem, 8vw, 5.25rem);
    line-height: 0.92;
    letter-spacing: -0.03em;
    margin: 0 0 var(--space-6);
    max-width: 24ch;
  }
  .display__accent {
    font-weight: 800;
    color: transparent;
    -webkit-text-fill-color: transparent;
    -webkit-background-clip: text;
    background-clip: text;
    background-color: transparent;
    background-image: var(--grad-violet-coral);
    background-repeat: no-repeat;
  }
  .display__accent--cyan-violet { background-image: var(--grad-cyan-violet); }
  .display__accent--pink-violet { background-image: var(--grad-pink-violet); }
  .display__accent--cyan-lime   { background-image: var(--grad-cyan-lime); }
  .display__accent--coral-orange { background-image: var(--grad-coral-orange); }
  .display__accent--lime-teal   { background-image: var(--grad-lime-teal); }
  .display__accent--violet-coral { background-image: var(--grad-violet-coral); }

  .lede {
    font-family: var(--font-body);
    font-weight: 300;
    font-size: 1.24rem;
    line-height: 1.5;
    color: var(--color-text-muted);
    max-width: 60ch;
    margin: 0;
  }

  main.content {
    padding: var(--space-16) 0 var(--space-24);
  }

  .grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: var(--space-8);
  }
  @media (min-width: 720px) {
    .grid { grid-template-columns: repeat(2, 1fr); }
  }

  .card {
    position: relative;
    background: var(--bg-surface);
    border: 1px solid var(--color-border);
    border-top: 3px solid var(--card-accent, var(--violet));
    border-radius: 6px;
    padding: var(--space-8) var(--space-6) var(--space-6);
    display: flex;
    flex-direction: column;
    gap: var(--space-4);
    transition: transform var(--transition-base),
                border-color var(--transition-base),
                box-shadow var(--transition-base);
  }
  .card:hover {
    transform: translateY(-4px);
    border-color: rgba(199, 125, 255, 0.3);
    border-top-color: var(--card-accent, var(--violet));
    box-shadow: 0 12px 32px rgba(0, 0, 0, 0.4);
  }

  .card__eyebrow {
    font-family: var(--font-semi);
    font-size: 0.65rem;
    font-weight: 600;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: var(--card-accent, var(--violet));
    margin: 0;
  }

  .card__title {
    font-family: var(--font-display);
    font-weight: 500;
    font-size: 1.907rem;
    line-height: var(--leading-tight);
    letter-spacing: -0.01em;
    color: var(--color-text);
    margin: 0;
  }

  .card__kind {
    font-family: var(--font-semi);
    font-size: 0.65rem;
    font-weight: 500;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: var(--color-text-dim);
    margin: 0;
  }

  .card__desc {
    font-family: var(--font-body);
    font-weight: 400;
    font-size: 1rem;
    line-height: 1.55;
    color: var(--color-text-muted);
    margin: 0;
    max-width: 56ch;
  }

  .card__artifacts {
    list-style: none;
    margin: var(--space-3) 0 0;
    padding: var(--space-4) 0 0;
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
    border-top: 1px solid var(--color-border);
  }
  .card__artifacts li { margin: 0; }

  .card__artifacts a {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: var(--space-4);
    padding: var(--space-2) 0;
    font-family: var(--font-semi);
    font-size: 0.806rem;
    font-weight: 600;
    letter-spacing: 0.06em;
    color: var(--color-text);
    transition: color var(--transition-base);
  }
  .card__artifacts a::after {
    content: '→';
    color: var(--card-accent, var(--violet));
    font-family: var(--font-body);
    font-weight: 500;
    transition: transform var(--transition-base);
  }
  .card__artifacts a:hover,
  .card__artifacts a:focus-visible {
    color: var(--card-accent, var(--violet));
    outline: none;
  }
  .card__artifacts a:hover::after,
  .card__artifacts a:focus-visible::after {
    transform: translateX(4px);
  }

  footer.footnote {
    border-top: 1px solid var(--color-border);
    padding: var(--space-8) 0;
    font-family: var(--font-semi);
    font-size: 0.65rem;
    font-weight: 500;
    letter-spacing: 0.16em;
    text-transform: uppercase;
    color: var(--color-text-dim);
  }

  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after {
      transition-duration: 0.01ms !important;
      animation-duration: 0.01ms !important;
    }
  }
</style>
</head>
<body>

<header class="hero">
  <div class="container">
    <p class="eyebrow">Centella · Share</p>
    <h1 class="display">${esc(headline.lead || '')} <span class="display__accent ${accentClass}">${esc(headline.accent || '')}</span></h1>
    <p class="lede">${esc(site.lede || '')}</p>
  </div>
</header>

<main class="content">
  <div class="container">
    <section class="grid">
${cards}
    </section>
  </div>
</main>

<footer class="footnote">
  <div class="container">
    ${esc(site.footer || '')}
  </div>
</footer>

</body>
</html>
`;
}

function renderCard(p) {
  const accentVar = `var(--${p.accent || 'violet'})`;
  const artifacts = (p.artifacts || [])
    .map((art) => `          <li><a href="${esc(art.href)}">${esc(art.label)}</a></li>`)
    .join('\n');

  return `      <article class="card" style="--card-accent: ${accentVar};">
        <p class="card__eyebrow">${esc(p.eyebrow || '')}</p>
        <h2 class="card__title">${esc(p.title)}</h2>${
    p.kind ? `\n        <p class="card__kind">${esc(p.kind)}</p>` : ''
  }
        <p class="card__desc">${esc(p.description || '')}</p>
        <ul class="card__artifacts">
${artifacts}
        </ul>
      </article>`;
}
