# Project Memory — Centella Global Website

This file captures decisions, rationale, and institutional knowledge that
isn't obvious from the code or the PRD. It's a decision log, not documentation.
Append new entries at the top.

---

## 2026-04-29 — Vercel deploy goes live; `share/` mirrored to `/share/*`

Wired the project up for actual deployment instead of treating it as a build-and-ignore exercise. Three things landed together:

**1. `share/` now ships with the build.** Added `scripts/copy-share.mjs` as a postbuild step (`build` is now `astro build && node scripts/copy-share.mjs`). It walks `share/`, skips `.gitkeep`/`.DS_Store`, and copies everything into `dist/share/`. Vercel serves `dist/` as the static root, so anything in `share/` is reachable at `/share/<filename>` once deployed. This honors the "future-site-ready" intent of the share/ convention without a separate build pipeline.

**2. `inline-deck.mjs` now writes to `share/` directly,** instead of the repo root. The previous version wrote `<slug>-standalone.html` at the project root and counted on `*-standalone.html` in `.gitignore` to keep it out of git. Now it writes `share/<slug>-standalone.html` and the file is a tracked deliverable.

**3. `.gitignore` rule tightened.** `*-standalone.html` (matched at any depth) became `/*-standalone.html` (only the repo root). This keeps any stray root-level export out of the repo while letting `share/*-standalone.html` be tracked. The Barcelona deck (`share/ngl-barcelona-en-standalone.html`, ~2.3 MB) is now committed.

**Why commit the bundle instead of building it on Vercel:** the standalone export is a "what shipped on this date" artifact — it's how decks get shared by email or USB to people who won't open a browser tab. Re-bundling on every CI run would mean a deck shared yesterday and a deck shared today could differ even if the source didn't, and it'd break offline reproducibility. Treating the bundle as a tracked output (built locally, committed when ready, deployed alongside the site) keeps it canonical.

**API route:** `api/subscribe.ts` doesn't need anything special — Vercel's filesystem convention auto-detects `api/*.ts` at the repo root and deploys it as a serverless function regardless of what the Astro adapter writes into `.vercel/output/`. So Mailchimp signups work on the deployed site without extra wiring.

**Preview URL strategy:** public, no password gate, no robots blocking yet. The site is destined to be public anyway, and gating preview URLs is a Vercel Pro feature we don't need to spend on for an early-stage site. If indexing becomes a concern before launch we can add a `robots.txt` later.

**What this supersedes:** the prior MEMORY entry about the inline-deck not yet migrating to `share/` is now resolved. Removed that paragraph.

---

## 2026-04-29 — `share/` directory for standalone HTML outputs

Established a convention: any self-contained HTML artifact produced for sharing — visual explainers, one-pagers, ad-hoc decks built outside the `npm run deck:standalone` pipeline, exported reports — goes in `share/` at the repo root, not in the repo root itself or in ad-hoc paths.

**Why:** the repo is going to become the Centella website. Files placed at predictable static-asset paths now will already be reachable as URLs once the site is live, with no migration or reorganization. Until then, `share/` is the local publish tray. This also reframes the "how do I share an HTML file via Slack so it doesn't show as a code preview" problem — the answer becomes "host it from the site" once the repo is deployed; in the meantime, zip-and-send works for one-offs.

**Why not `public/`:** `public/` is Astro's static-asset root for the site build (favicons, hero media, per-deck asset folders). It's part of the site bundle and follows Astro's conventions. `share/` is a publish tray for self-contained documents that aren't structurally part of the site shell — they're documents that happen to be HTML. Keeping them separate now means we can decide per-file whether something promotes into a real Astro page later.

**Materialized:** `share/.gitkeep` so the directory exists in the repo (Git ignores empty directories). _Update 2026-04-29:_ `scripts/inline-deck.mjs` now writes here directly, and the build mirrors `share/` → `dist/share/` so files are served at `/share/<filename>` once deployed. See the deploy entry above.

---

## 2026-04-28 — Bilingual presentation decks: duplicate file, no i18n abstraction

Built an English version of the NGL Barcelona deck (`src/pages/presentations/ngl-barcelona-en.astro`) alongside the Spanish original. The convention going forward: when a deck needs another language, **duplicate the `.astro` file, suffix the slug with the language code (e.g. `-en`), and translate the strings inline.** Don't introduce an i18n abstraction (no `src/i18n/`, no string tables, no shared partials).

**Why:** decks are leaf documents — large, hand-tuned, single-file by design (per the decks-as-pages convention in `CLAUDE.md`). Sharing strings across language variants would force the markup into a shape it wasn't designed for, and the cost of duplicating a file is low. The duplicated file inherits all infrastructure for free: `<deck-stage>` letterbox scaling, the `Presentation` layout, the `npm run deck:standalone -- <slug>` pipeline, font loading, etc.

**What changes between Spanish and English:** body copy, slide `data-label` strings, footer text (chrome `mark` and `pg`), the cover slide label ("Portada" → "Cover"), date stamp ("JULIO 2026" → "JULY 2026"), and the `lang` attribute on `<Presentation>` (`"es"` → `"en"`). Everything else is identical.

**When to revisit:** if more than two languages or more than two decks need translation simultaneously, the duplication cost starts to matter. At that point, consider a content-collection approach (Astro content collections + per-locale data + a single deck template). Until then, two files is the right answer.

The Spanish file remains canonical (no language suffix); language variants get suffixes. Routes: `/presentations/ngl-barcelona/` (Spanish, default), `/presentations/ngl-barcelona-en/` (English).

---

## 2026-04-28 — Prime Movers brochure: bright Centella palettes on light grounds (revision)

Pablo asked for the three Prime Movers 20th mockups to be revised so the palette pulls from Centella's own token system but stays applied to the existing light grounds — bright, cheery, on-brand. Each option is now restricted to two Centella color families (per the `design.md` "no more than two color families per composition" rule):

- **Option A (`option-a-contemporary.html`)** — `--violet` + `--global`. Paper: `--violet-light` #F7EDFF. Ink: `--violet-dark` #1E1A28. Welcome-left flipped from dark ink to bright orange (`--global` #FF9500) with dark-ink text. Pocket page is bright violet (`--violet` #C77DFF) with dark-ink text. Headline accent words sit inside violet swatches via `box-decoration-break: clone`.
- **Option B (`option-b-warm.html`)** — `--networking` + `--global`. Paper: `--global-light` #FFF3E1. Ink: `--networking-dark` #22181C. Cover photo plate is now a coral→orange→wine sunset gradient. Italic emphasis words sit in coral swatches. Earlier draft mixed three families (had a stray violet labeled `--teal`); the revision drops that to comply with the two-family rule. The `--teal` token remains in `:root` mapped to `--ink` so legacy markup still parses.
- **Option C (`option-c-classical.html`)** — `--tech` + `--global`. Paper: `--tech-light` #FFE6F5 (pale pink). Ink: `--tech-dark` #2A1522 (deep plum). The `--A-oxblood-deep` and `--A-gold-deep` tokens were redefined to deeper accessible variants (#A52B7D and #8A4F00) so all Roman numeral / italic accent text passes WCAG AA; the brights (`--A-oxblood` #FF66C4 / `--A-gold` #FF9500) are reserved for fills, drop caps, and the dark-divider-page accent numerals only.

**Architecture rule that survived this round:** brights are *fills*; family-darks are *text*; reverse type inside bright fills is the same family-dark (always 6.2–7.8:1, AAA in most cases). Body copy clears AAA on all three (14–16:1).

**Why this matters going forward:** when the Centella token system is applied to *light* grounds, every saturated Centella bright (violet, advisory cyan, networking coral, investment lime, global orange, tech pink) fails AA contrast for body-size text on the corresponding light variant. They earn their keep as fills with dark text, as decorative non-text glyphs, or as the *background* of a colored highlight wrapping dark-text accent words (`background: var(--accent); padding: 0 0.18em; border-radius: 6px; box-decoration-break: clone;`). For accent text at 18pt+ that needs more pop than family-dark, a deepened-but-still-on-brand variant (e.g. tech #A52B7D, global #8A4F00) reaches 5.5:1+. Worth promoting these `-deep` accent-text tokens into `global.css` if the same pattern recurs.

**Hunt Alternatives identity preserved.** Typography, format, photography direction, and voice are unchanged per direction. Only the palette source changed. If Swanee reads any of the three as "too Centella," the fix is reducing fill saturation (or de-saturating the paper), not unwinding the palette.

**Files touched:** `work/prime-movers-20th/mockups/option-a-contemporary.html`, `option-b-warm.html`, `option-c-classical.html`, `index.html`. Legend dl on each option file rewritten to describe the new palette honestly (token names, contrast ratios, fill-vs-text discipline). Per-option swatch CSS in `index.html` updated.

---

## 2026-04-27 — Prime Movers & the Next Generation brochure: three design directions, client-led identity

Event title locked: **Prime Movers & the Next Generation**, theme **Meeting the Moment**, occasion **The Twentieth Anniversary**. (Initial drafts said "Prime Movers Reunion" — superseded.) Started a new client deliverable for Hunt Alternatives — the printed program brochure. Working folder is `work/prime-movers-20th/` (folder name kept as-is for stability even though the title evolved). Centella is the producer, but the printed brochure leads with Hunt Alternatives / Prime Movers identity, not Centella's. Centella appears in the colophon only unless Swanee directs otherwise.

**Format locked:** 6×9 portrait, saddle-stitched, ~24–32pp, with a printed pocket on the inside back cover for a separately-printed agenda insert. The pocket-and-insert pattern lets the bulk of the book go to the printer early while the agenda stays fluid until the morning of (Swanee's working style).

**Cut from print:** Hunt Alternatives org description and Swanee's bio. (Welcome and About Prime Movers were cut briefly in v2 then restored differently in v3 — see below.)

**Final section list (v3):** Cover · Welcome from Ambassador Hunt · Welcome from Giovanna Alvarez Negretti (logistical) · Thought piece by Swanee · Bios of Prime Movers · Bios of Next Generation Leaders · Maps to locations · Code of Conduct · Emergency contacts · Contact info · Pharmacy / Hospital / Emergency · Agenda (separate insert in pocket).

**Visual motifs requested by client:** boxes (using Centella's panel pattern — outer rule + inner frame + hard edges + 4–8px radius) and quote callouts sprinkled throughout. Each option adapts the box pattern to its identity (Option A: cream + gold inner rule; Option B: hard-edged 8px panels with ultramarine; Option C: warm 8px panels with terracotta inner frame).

**2026-04-28 follow-up — three additional options (D/E/F) reproduced from a Claude Design hand-off bundle.** Pablo dropped in an `api.anthropic.com/v1/design/...` URL pointing at his parallel brochure mockups built in Claude Design (claude.ai/design). The bundle is a gzipped tar with React/JSX option files, a `brochure-v2.css` stylesheet, sample data (`data.js`), the bundled Centella font kit, the design tool's chat transcript, and a "CODING AGENTS: READ THIS FIRST" README. The bundle's design conversation followed essentially the same arc this session did (same final TOC, same direction labels, same Hunt-not-Centella identity reframe), so the three v2 options become a parallel set rather than replacements.

**Where to find the source bundle:** `outputs/brochure-bundle/prime-movers/` in this session. Source JSX is `option-{a,b,c}2.jsx`; styles in `brochure-v2.css`; data in `data.js`. To unpack a Claude Design bundle next time: the URL returns gzipped tar binary even when treated as text — `curl --compressed` or piping through `gunzip -c | tar -x` works. The bundle's chat transcript in `chats/chat1.md` is high-signal; read it before reproducing.

**Set 1 vs. Set 2 differences worth remembering:**
- Set 2 uses single-page format (one 6×9 page rendered at a time); Set 1 uses facing 12×9 spreads. Both are mockup-format choices, not production constraints.
- Set 2's box motif puts the eyebrow label cut into the top border (fieldset-legend style). Set 1's bordered eyebrow sits inside the box. Set 2's is more refined.
- Set 2 includes a separate Title page, Contents page, dark Section divider pages, and Emergency / Pharmacy as their own spreads. Set 1 consolidates more.
- Set 2's Option F has soft section nomenclature ("How we'll be" / "In case you need us" / "A new generation"). Open question whether Swanee wants the warmth or the formality.
- Set 2's E has neon-green pop accent (#E8FF3A); much sharper than Set 1 B's burnt orange.
- Set 2's F has duotone gradient bio monograms that match the cover treatment — a unified visual system rather than a swatch.

**2026-04-28 down-select to three:** Pablo kept **B (Set 1 contemporary), C (Set 1 warm), and D (Set 2 classical)**. Cut A (the Set 1 classical was redundant once D was preferred for that direction), E (Set 2 contemporary — B's burnt-orange + Inter Tight read better for him than E's neon-green), and F (Set 2 warm — C kept because of facing-spread format, and the soft section nomenclature in F was undecided).

**Index-page changes Pablo asked for at down-select:** removed "for Swanee" framing throughout (use "review" or "participants" instead). Replaced the eyebrow text at the top with the full-width Centella logo divider (`public/logo-divider.svg`, inlined, filled at 10% paper opacity to blend muted on the dark page). Called out in the lede that **all copy is placeholder including names** and that **nothing is typeset**. Removed the "What I need from you (Pablo) before lock" section. Trimmed "What's the same" down to trim/format + section order; section order is now an `<ol>`. Per-option pages: doc-header now reads "Mockup for review"; "What Swanee will feel" → "What participants will feel"; D's "Origin" and "Differences from my Option A" lines removed.

**Three design directions delivered (`work/prime-movers-20th/mockups/`):**

- **A — Classical / editorial.** Cormorant Garamond + Source Serif 4 + Inter labels. Cream paper, ink, oxblood, gold rules. Drop caps, Roman numerals. Reads as institutional weight, milestone occasion. Reference: NYRB, university press.
- **B — Contemporary / progressive.** Inter Tight + Inter + JetBrains Mono. Cream paper, near-black ink, ultramarine accent, sparing burnt orange. Modular blocks, mono labels, stat rows. Reads as forward-looking, current movement. Reference: Aperture, MIT Press.
- **C — Warm / human.** Lora italic-forward + Source Serif 4 + Inter labels. Warm ivory, charcoal, terracotta + teal + ochre, ornament glyphs. Photo-led cover, italic numerals. Reads as relationship-forward, the people in the room. Reference: Aperture, Magnum photo books.

Each delivered as a self-contained HTML file showing four spreads at 6×9 print proportion (cover, bio spread, code of conduct, agenda pocket page) after the welcome and About cuts. Real headings and titles populated, placeholder Latin where copy isn't in yet — per direction that Swanee can't read a layout from color swatches alone.

Open questions for Pablo before lock are listed in `work/prime-movers-20th/README.md`.

---

## 2026-04-27 — Letterbox scaling + standalone deck export

### Letterbox scaling in `<deck-stage>`

The original `_fit()` in the deck-stage web component locked the canvas to viewport CSS pixels — meaning slide content (sized in absolute px against the 1920×1080 design canvas) clipped on small or short viewports. Replaced with proper letterbox scaling: keep the canvas at design size and apply `transform: scale(min(vw/dw, vh/dh))`. Now the deck always fits any viewport with bars on the short axis, and content adapts to height as well as width.

`noscale` attribute still bypasses the transform for the PPTX exporter and other tools that want unscaled DOM geometry.

### Standalone single-file deck export

Decks need to be sendable as email attachments or USB hand-offs. Added `scripts/inline-deck.mjs` and `npm run deck:standalone -- <slug>`, which:

1. Runs `astro build`
2. Reads the built `dist/presentations/<slug>/index.html`
3. Reads the linked `_astro/*.css` file, base64-inlines every woff2 referenced via `url(...)`
4. Inlines image references (svg/webp/png/jpg) as data URIs
5. Strips `<source>` MP4 tags (the cover poster carries the visual; we don't want to base64 a 1MB video)
6. Folds the CSS into a `<style>` tag and writes `<slug>-standalone.html` at the repo root

Output for NGL Barcelona is ~2.3MB. Opens directly via `file://` in any modern browser.

### Eyebrow tags removed from NGL Barcelona

The small uppercase coral labels above each headline ("CONTEXTO · 2026", "EL PROGRAMA", etc.) were stripped — 12 `.eyebrow-tag` spans, 2 `.num` section labels, 1 `.q-attr` quote attribution. Card-level mini-eyebrows ("CRISIS ÉTICA", "PILAR 01") were kept. The CSS rule for `.eyebrow-tag` was deleted along with the markup. If a future deck wants slide eyebrows, redefine the rule per-deck rather than reaching into a shared base.

---

## 2026-04-26 — Presentation decks as first-class Astro pages

### Decision

Decks (NGL Barcelona was the first) live at `src/pages/presentations/[slug].astro` and ship with the site build. The earlier rule that `presentations/` was an untracked scratch folder is reversed.

### Why

If a deck has to be sent to anyone — speakers, sponsors, colleagues — it needs a URL. Hosting it elsewhere just to get a URL is silly when the site is already a static deploy on Vercel.

### Layout

`src/layouts/Presentation.astro` is a minimal full-bleed shell: `<html><head>{meta + title}</head><body><slot/></body></html>`. No `SiteHeader`, no `SiteFooter`. Decks own the viewport — site chrome would fight the design.

### Astro directives for self-contained decks

Decks brought in from external tools (Pencil, Keynote exports, hand-built HTML) typically have their own scaler, fonts, web components, and inline JS. To stop Astro from touching any of it:

- Every `<style>` block in the page → `<style is:global>` (no scope hashing).
- Every `<script>` block in the page → `<script is:inline>` (no bundling, no hoisting).

Astro will still extract `is:global` styles to a `/_astro/*.css` file at build, which is fine.

### Asset paths

Per-deck assets (fonts, images, logos) live at `public/presentations/[slug]/assets/`, referenced from CSS/HTML with absolute paths (`/presentations/[slug]/assets/...`). Absolute paths avoid surprises with trailing-slash and prefetch behavior.

### CLAUDE.md / design.md updates

Both updated to document the convention. The previous "don't touch `presentations/`" rule in `CLAUDE.md` is replaced with the actual convention.

---

## 2026-04-18 — Homepage display headline, accent gradient variants, and text-clip fix

### Hero typography

The homepage hero `h1` uses the global `.display` utility (Barlow Condensed 300, fluid size) with inline `.display__accent` spans for emphasized phrases.

### Six gradient variants + optional random assignment

Each approved `--grad-*` token maps to a modifier class `display__accent--violet-coral`, `display__accent--cyan-lime`, `display__accent--coral-orange`, `display__accent--pink-violet`, `display__accent--cyan-violet`, and `display__accent--lime-teal` (always paired with `.display__accent`). Spans may carry `data-random-accent-gradient`; `src/components/RandomDisplayAccents.astro` (included from `Base.astro`) runs a tiny end-of-body inline script that picks one variant per marked element on each page load. Logo rule unchanged: no gradients on the logo mark.

### `background-image` vs `background` shorthand on clipped text

Using the `background` shorthand for gradient fills resets `background-clip` to its initial `border-box`, which breaks `background-clip: text` and shows a gradient rectangle behind glyphs. Accent styles set **`background-image`** for the gradient and keep clip/fill on the shared `.display__accent` / `.display--gradient` rules.

### Node version

`.nvmrc` pins **20** (Astro 5). Run `nvm use` in the repo before `npm run dev` / `npm run build` if the shell default is older Node.

---

## 2026-04-17 — Global utility-first CSS pass and typography weight shift

### Local style duplication reduced

We completed a broad CSS consolidation pass so pages/components rely more on shared global styles instead of local hardcoded declarations. New reusable utilities now live in `src/styles/global.css`:

- `.page-heading`
- `.page-intro`
- `.page-simple`
- `.page-copy`

These replace repeated per-page heading/intro/copy blocks across blog/events index and the three pillar destination pages.

### Card base styling now centralized

`EventCard` and `BlogPostCard` now compose the shared `.card` class for base surface, border, hover lift, and shadow behavior. Component-local CSS remains only for content-specific internals (image sizing, metadata layout), reducing drift from design tokens.

### Headline weight direction changed

Design direction now favors lighter headline/display weights. Global heading defaults were reduced from heavy display values to medium values (`500`), and homepage/styleguide local overrides were updated to visually reflect this. The styleguide typography specimens were also adjusted so examples match the actual implemented system.

---

## 2026-04-17 — Global chrome unification and menu hidden-state fix

### Homepage chrome became the site-wide shell

The homepage header/footer pattern is now canonical across the whole site. We extracted that UI into `src/components/SiteHeader.astro` and `src/components/SiteFooter.astro`, and `src/layouts/Base.astro` now renders those by default. This replaces the previous split where homepage used `hideChrome` and other routes used separate `Nav` / `Footer` components.

### Pillar section and CTA destination pages added

Homepage now includes a post-event “three foundational pillars” section with stacked panels. CTA targets are implemented as static pages:

- `/centella-advisory`
- `/centella-institute`
- `/centella-impact`

Each page currently carries the panel title + body copy as its initial content.

### Important implementation detail

When using `[hidden]` for overlays/drawers, never rely on native behavior if the base class sets `display`. The extracted menu initially stayed visible because `.site-header__menu { display: flex; }` overrode hidden rendering. Canonical fix now in place:

` .site-header__menu[hidden] { display: none; } `

### Icon governance tightened

Icon usage is now explicitly repository-gated: only pre-existing icons in `src/assets/icons/` are allowed unless a task explicitly approves adding new assets. This rule is documented in `design.md`.

---

## 2026-04-16 — PRD §11: product-level video and progressive enhancement

### Cross-cutting policy, not homepage-only

`docs/PRD.md` v1.3 adds **§11 Media, video, and progressive enhancement policy**: poster-first ambient video, encoded resolution ladder, no full masters in git, reproducible `ffmpeg`/WebP pipeline, `preload` discipline, and client gates (`prefers-reduced-motion`, `saveData`, `effectiveType` for slow classifications). **§8** now states the only deliberate runtime JS beyond Mailchimp is inline scripts that implement this section. Deviations require `MEMORY.md` plus a PRD version note.

---

## 2026-04-16 — Homepage shell, hero video policy, and asset pipeline

### Minimal homepage and latest-event logic

The homepage is a thin marketing shell: custom header/footer links only (via `hideChrome` on `Base`), hero, one “Latest event” row powered by `getHomepageLatestEvent()` (upcoming published event first, else most recent past published), and no other sections. Full-site Nav/Footer components are not rendered on that page to avoid duplicate chrome.

### Hero background: static-first, video as enhancement

Hero uses a committed **WebP poster** as the always-on background layer (`fetchpriority="high"`). **H.264 variants** live at 540p (narrow viewports) and 720p (wider); they are small enough to ship in `public/media/hero/` (~1.5 MB combined vs a single ~7 MB source). The **full-size source MP4 is not kept in git**; editors regenerate outputs with `scripts/optimize-hero-media.sh` / `npm run media:hero -- <path>` after installing `ffmpeg` and `cwebp` (e.g. Homebrew).

The `<video>` element ships with **`preload="none"`** and **no `src` in HTML**. An **inline** script (no Astro island, no extra client bundle) assigns `src` and calls `play()` only when `prefers-reduced-motion` is not reduced and `navigator.connection` (when present) does not indicate `saveData` or `slow-2g` / `2g` / `3g`. Otherwise visitors see the poster only — no MP4 download. This is an explicit exception to the “zero JS” ideal for the rest of the site; it is narrowly scoped and justified for Global South bandwidth.

### PRD alignment entry unchanged in substance

The same-day PRD lock-in (Notion deploy trigger, multi-author blog, `/events/past`) remains authoritative; this entry documents **implementation** choices that followed.

---

## 2026-04-16 — PRD alignment decisions locked

### Manual Notion deploy trigger selected for v1

We finalized the publishing trigger model: deploys are triggered from Notion automation only (manual "Deploy now" flow for v1). Slack is reserved for deploy notifications and alerts, not trigger control.

### Multi-author blog schema confirmed

Blog schema direction is now explicit: support multiple authors. This is no longer an open question and should be reflected in Notion schema and type decisions going forward.

### Dedicated past events archive confirmed

We will include a dedicated archive page at `/events/past`, rather than relying only on the general events listing for historical events.

---

## 2026-04-14 — Notion workspace: personal now, corporate later

### CMS databases are in Pablo's personal Notion for beta testing

The five Website CMS databases live in Pablo's personal Notion workspace right now. This is intentional — it's faster for testing the integration. The plan is to migrate to the Centella corporate Notion account before the site goes into production use by the content team.

The architecture already handles this cleanly: all database IDs and the API key come from environment variables. Migration means: create a new Notion integration in the corporate workspace, duplicate or recreate the databases (same schemas), update the `.env` values. Zero code changes.

Things to watch for during migration: (1) Notion file URLs are workspace-specific and expire — any images uploaded in the personal workspace won't carry over automatically, (2) the integration needs to be connected to the databases in the new workspace (the step people always forget), (3) if the corporate account has different permission levels, the integration may need broader access than just "Read content."

---

## 2026-04-14 — Mailchimp ↔ Attendees integration deferred

### Attendees component shelved for v1

We explored connecting the Notion Attendees database to Mailchimp signups — the idea being that the content team could tag a subscriber `feature-on-website` in Mailchimp and have them appear on the event page. Two approaches considered: (1) query Mailchimp directly at build time, (2) Mailchimp tag triggers a sync to Notion where the content team enriches the profile. The second was stronger because editorial control (photos, bios) is better in Notion than Mailchimp's merge fields.

Decision: shelve the whole thing. Not enough value to justify the complexity at launch. The Attendees database schema stays in the types file as a future consideration, but no integration work, no sync, no Mailchimp-to-Notion pipeline. If the need becomes clear after a few events, we revisit — and the thinking is captured here so we don't start from scratch.

---

## 2026-04-14 — Project inception and architecture decisions

### Why we're leaving Framer

Framer creates too much friction for the two things the site actually needs to do: capture emails for Mailchimp and spin up event pages. Every event page is a manual build in Framer, disconnected from the team's actual workflow (Notion). The site doesn't need a visual builder — it needs a content pipeline that starts in Notion and ends with a deployed static page.

### Astro over Next.js, Gatsby, or plain HTML

Astro gives us static-first output (no JS shipped by default) with the escape hatch of islands architecture for interactive components. Next.js would work but ships more JS than we need for what's essentially a content site. Gatsby's plugin ecosystem for Notion is stale. Plain HTML would mean no templating system for event pages, which is the whole point.

The islands architecture matters specifically for the Mailchimp form — it needs client-side JS for form submission, but nothing else on the page does.

### Notion as CMS (not Contentful, Sanity, or Markdown files)

The team already lives in Notion. Any CMS that requires a separate interface is a non-starter — it would mean two tools instead of one. Markdown files in the repo would require the content team to learn git. Notion API gives us structured data (database properties) and rich content (page body blocks) from the tool they already use daily.

Trade-off: Notion API has rate limits and the block rendering requires a custom mapper. We're accepting that complexity in exchange for zero workflow change for the content team.

### Vercel over Netlify

Both would work at free tier. Vercel's serverless functions live in `api/` at the project root with zero config, which is simpler than Netlify Functions. Vercel also has slightly better Astro integration. Not a strong preference — we can migrate later if needed.

### Static generation (SSG) over server-side rendering (SSR)

The site rebuilds when someone triggers a deploy, not on every request. Content changes maybe a few times a week at most. SSG means the site loads from CDN with no runtime dependency on Notion. If Notion goes down, the site stays up.

Historical note: at project inception we planned manual deploy hooks in both Slack and Notion. This is superseded by the 2026-04-16 decision: Notion publish trigger for deploys, Slack for notifications only.

### Deploy hooks in both Slack and Notion (superseded)

This was an earlier approach. Superseded on 2026-04-16: v1 deploy triggering is Notion automation only, with Slack used for notifications.

### Schedule as page body content, not a separate database

Event schedules live in the Notion page body as structured content (headings for time slots, lists for session details). This keeps it simple — the content team writes the schedule in the same place they write the event description, using Notion's native editor.

Trade-off: we can't query individual sessions across events (e.g., "show me all panels happening this week"). If that need emerges, we'll add a Schedule database. For now, the simpler approach wins.

### Attendees as a separate database (like Speakers and Sponsors)

Attendees get their own Notion database with the same shape as Speakers — Name, Title/Role, Organization, Photo, Bio. This lets us display notable attendees on event pages (think: "who's in the room" social proof) without conflating them with speakers. An attendee can appear across multiple events via Notion relations.

### Blog section added to scope

Originally listed as a non-goal ("blog or news section"), but reconsidered. Centella needs a place to publish thinking and updates beyond events. Blog Posts get their own Notion database (Title, Slug, Status, Published Date, Authors, Tags, Summary, Hero Image) and the same build-time fetching pattern as events.

### Mailchimp tagging strategy

Each form submission includes a tag identifying where the signup came from. The homepage form sends a generic tag (e.g., `homepage-signup`). Event pages send the event's `Mailchimp Tag` property (e.g., `build-summit-2026`). Blog pages could send a `blog-signup` tag or a post-specific tag. Tags are set via hidden form fields and processed by the serverless function.

### Custom Notion block renderer over third-party library

We're writing our own block-to-HTML mapper rather than using `@notion-render/client` or similar. Reasons: (1) the output HTML needs to be clean and predictable for styling, (2) we want to handle unknown block types gracefully (skip, don't crash), (3) the dependency surface stays small. If the mapper grows beyond ~200 lines, we'll reconsider.

---

## Decisions still pending

- **Mailchimp audience ID**: which list/audience do the forms feed into? Blocks API integration.
- **Notion workspace + database IDs**: needed to configure `notion.ts`. Pablo needs to set up or share the databases.
- **Slack notification channel/workflow**: where should deploy status notifications be posted?
- **Image hosting strategy**: Notion file URLs expire. We may need to download and cache images at build time, or use a proxy. Needs research.
