# Project Memory — Centella Global Website

This file captures decisions, rationale, and institutional knowledge that
isn't obvious from the code or the PRD. It's a decision log, not documentation.
Append new entries at the top.

---

## 2026-04-28 — Bilingual presentation decks: duplicate file, no i18n abstraction

Built an English version of the NGL Barcelona deck (`src/pages/presentations/ngl-barcelona-en.astro`) alongside the Spanish original. The convention going forward: when a deck needs another language, **duplicate the `.astro` file, suffix the slug with the language code (e.g. `-en`), and translate the strings inline.** Don't introduce an i18n abstraction (no `src/i18n/`, no string tables, no shared partials).

**Why:** decks are leaf documents — large, hand-tuned, single-file by design (per the decks-as-pages convention in `CLAUDE.md`). Sharing strings across language variants would force the markup into a shape it wasn't designed for, and the cost of duplicating a file is low. The duplicated file inherits all infrastructure for free: `<deck-stage>` letterbox scaling, the `Presentation` layout, the `npm run deck:standalone -- <slug>` pipeline, font loading, etc.

**What changes between Spanish and English:** body copy, slide `data-label` strings, footer text (chrome `mark` and `pg`), the cover slide label ("Portada" → "Cover"), date stamp ("JULIO 2026" → "JULY 2026"), and the `lang` attribute on `<Presentation>` (`"es"` → `"en"`). Everything else is identical.

**When to revisit:** if more than two languages or more than two decks need translation simultaneously, the duplication cost starts to matter. At that point, consider a content-collection approach (Astro content collections + per-locale data + a single deck template). Until then, two files is the right answer.

The Spanish file remains canonical (no language suffix); language variants get suffixes. Routes: `/presentations/ngl-barcelona/` (Spanish, default), `/presentations/ngl-barcelona-en/` (English).

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
