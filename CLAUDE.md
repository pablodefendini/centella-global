# CLAUDE.md

## Project overview

Website for Centella (centellaglobal.com) — an organization that works with political leaders and movement builders across the Global South. Static site built with Astro, content managed in Notion, email capture via Mailchimp. Hosted on Vercel.

## Design System

This project uses a design system defined in `design.md` at the project root.
Always refer to this file when generating or modifying any UI component.

- Use only colors, fonts, and spacing values defined in design.md.
- Do not invent new values or use defaults from any framework.
- Match component states (hover, focus, active, disabled) to the patterns in design.md.
- Follow the typographic scale and weight assignments in design.md.

## Hard constraints

- **Static-first.** Every page is pre-rendered HTML. No client-side data fetching from Notion. Runtime code is limited to: (1) the Mailchimp serverless function, (2) a small **inline** script on the homepage hero that decides whether to load background video (Network Information / `saveData` / `prefers-reduced-motion`), and (3) a tiny **inline** script from `RandomDisplayAccents.astro` (included in `Base.astro`) that assigns a random `display__accent--*` gradient class to elements with `data-random-accent-gradient`. No extra bundles and no hydration framework for those behaviors.
- **Notion is the CMS.** The content team edits in Notion. They should never need to touch code, open a terminal, or learn a new tool. If a workflow requires anything beyond "edit in Notion, trigger deploy," it's wrong.
- **Mailchimp API key stays off the client.** All Mailchimp interactions go through the serverless function in `api/subscribe.ts`.
- **Mobile-first, Global South context.** Many visitors are on mid-range phones with variable connectivity. Lighthouse mobile performance ≥ 90. No heavy JS bundles, no client-side rendering for content.

## Tech stack

- **Astro** — static site generator with islands architecture for interactive bits
- **Notion API** (`@notionhq/client`) — content fetching at build time
- **Mailchimp API** — subscriber management via serverless function
- **Vercel** — hosting + serverless functions
- **TypeScript** — for `src/lib/` and API functions
- **CSS custom properties** — no framework yet; global stylesheet with custom properties for theming later

## Directory structure

```
src/
├── layouts/          # Base.astro (HTML shell), Event.astro (event page layout),
│                     # Presentation.astro (full-bleed shell for decks)
├── components/       # SiteHeader, SiteFooter, RandomDisplayAccents (gradient class helper),
│                     # MailchimpForm, EventCard, SpeakerCard, AttendeeCard, ScheduleBlock,
│                     # SponsorGrid, BlogPostCard
├── pages/
│   ├── index.astro           # Homepage: shared site chrome + hero, latest event, pillars section
│   ├── centella-advisory.astro
│   ├── centella-institute.astro
│   ├── centella-impact.astro
│   ├── styleguide.astro      # Living styleguide — tokens, typography, components
│   ├── events/
│   │   ├── index.astro       # Events listing
│   │   └── [slug].astro      # Dynamic event pages
│   ├── blog/
│   │   ├── index.astro       # Blog listing
│   │   └── [slug].astro      # Dynamic blog posts
│   └── presentations/
│       └── [slug].astro      # Standalone HTML decks (e.g. ngl-barcelona)
├── lib/
│   ├── notion.ts             # Notion client + all query functions
│   ├── mailchimp.ts          # Mailchimp API helper
│   └── types.ts              # Shared TypeScript types
└── styles/
    └── global.css            # Reset, typography, custom properties

api/
└── subscribe.ts              # Vercel serverless function for Mailchimp

public/
├── media/hero/               # Homepage hero: WebP poster + 540p/720p MP4s (regenerate via npm run media:hero)
└── presentations/[slug]/     # Per-deck assets (fonts, images) referenced via absolute /presentations/... URLs

share/                        # Standalone HTML outputs meant to be opened in a browser or shared as files —
                              # decks (`<slug>-standalone.html`), one-pagers, visual explainers, exported reports.
                              # Future-site-ready: when the repo becomes the live site, files here are already at
                              # predictable static URLs. Not the same as `public/` — `public/` is Astro's static
                              # asset root for the site build; `share/` is a publish tray for self-contained docs.

scripts/
├── optimize-hero-media.sh    # ffmpeg + cwebp pipeline for hero assets
├── inline-deck.mjs           # Bundles a built deck into a single self-contained HTML file
└── copy-share.mjs            # Postbuild: mirrors share/ → dist/share/ so deliverables ship at /share/*

docs/
├── PRD.md                    # Product requirements
├── MEMORY.md                 # Decision log
└── DIARY.md                  # Public development diary

work/                         # Client deliverables and project work outside the website itself.
                              # Each subfolder is its own self-contained project (e.g. work/prime-movers-20th/).
                              # Not built or deployed by Astro. Has its own README.md per project.
```

## Data model

Five Notion databases:

- **Events** — core content type. Has Status (Draft/Published/Archived), Featured flag, date range, slug, hero image, registration URL, Mailchimp tag. Page body contains description and schedule. Relations to Speakers, Attendees, Sponsors.
- **Blog Posts** — Title, Slug, Status, Published Date, Authors (multi-author), Tags, Summary, Hero Image. Page body is the post content.
- **Speakers** — Name, Title/Role, Organization, Photo, Bio.
- **Attendees** — Name, Title/Role, Organization, Photo, Bio.
- **Sponsors** — Name, Logo, URL, Tier (Lead/Supporting/Community).

Speakers, Attendees, and Sponsors are linked to Events via Notion relations. A speaker/attendee/sponsor can appear across multiple events.

## Things to avoid

- **Don't fetch Notion data at runtime.** All Notion API calls happen in `getStaticPaths()` or page/component frontmatter during build. If you're importing `notion.ts` in a client-side script, something is wrong.
- **Don't hardcode event content in Astro files.** If it's content (text, dates, images, speaker info), it comes from Notion. The only things hardcoded are structural: layout, component markup, navigation.
- **Don't put the Mailchimp API key in client-side code.** The form POSTs to `/api/subscribe`, which handles the Mailchimp call server-side.
- **Don't use heavy JS frameworks for components.** Astro components are zero-JS by default. Only use `client:load` or `client:visible` directives when a component genuinely needs interactivity (the Mailchimp form is the main case).
- **Don't assume Notion page body structure.** The block renderer should handle any block type gracefully — headings, paragraphs, lists, images, toggles, callouts. If it encounters an unknown block type, render nothing rather than crashing.
- **Don't add chrome to presentation decks.** Decks live at `src/pages/presentations/[slug].astro` and use `src/layouts/Presentation.astro` — a minimal full-bleed shell with no `SiteHeader`/`SiteFooter`. Deck assets (fonts, images) go in `public/presentations/[slug]/assets/` and are referenced with absolute paths. Inline `<style>` and `<script>` blocks inside a deck must use `is:global` / `is:inline` so Astro doesn't scope or hoist them.

## Patterns

- **Shared chrome is canonical** — `Base.astro` renders `SiteHeader` and `SiteFooter` across the site. Do not implement route-specific duplicate nav/footer shells unless explicitly required.
- **Homepage composition** — Hero headline over poster-first media, one “Latest event” block from Notion (`getHomepageLatestEvent()` in `src/lib/notion.ts`: next upcoming published event, else latest past published), plus a three-panel foundational pillars section that links to static destination pages.
- **Prefer global CSS utilities over local page CSS** — before adding page-local styles, check `src/styles/global.css` utilities/tokens and compose those first (`.page-heading`, `.page-intro`, `.page-simple`, `.page-copy`, `.card`, `.grid`, `.section`, `.container`).
- **Typography direction** — Headlines and large type should default to lighter Barlow-family weights (generally around `500`) unless a specific artifact requires heavier emphasis.
- **Hero media** — Decorative background: eager WebP poster (`public/media/hero/centella-hero-bg-poster.webp`) for first paint; 540p / 720p MP4 variants committed to the repo. Do not commit a full-size master MP4; regenerate outputs with `npm run media:hero` from a local master file.
- **Slugs are manually set in Notion**, not auto-generated. This gives the content team control over URLs.
- **Event visibility is controlled by Status property.** Only `Published` events render. `Draft` and `Archived` are filtered out at build time.
- **Past events have a dedicated archive page** at `/events/past`, separate from the main events listing.
- **Mailchimp tags match the event's `Mailchimp Tag` property.** The homepage form uses a generic tag (e.g., `homepage-signup`). Event pages pass the event-specific tag.
- **Notion block rendering** uses a custom block-to-HTML mapper in `src/lib/notion.ts` (or a dedicated `blocks.ts` if it gets big). This is simpler than pulling in a full rendering library and gives us control over the HTML output.
- **Presentation decks ship at `/presentations/[slug]/`.** One `.astro` file per deck under `src/pages/presentations/`, using the `Presentation.astro` layout (full-bleed, no site chrome). Inline `<style>` blocks need `is:global`; inline `<script>` blocks need `is:inline`, so Astro doesn't scope-rewrite or bundle deck-internal CSS/JS. Per-deck assets go in `public/presentations/[slug]/assets/` and are referenced with absolute paths.
- **Deck scaling is letterboxed.** The `<deck-stage>` web component renders slides at their authored design size (1920×1080 by default) and applies `transform: scale(min(vw/dw, vh/dh))` so the canvas always fits the viewport with bars on the short axis — never clips. Don't size slide content in `vh`/`vw` or assume the viewport equals the design canvas.
- **Standalone deck export.** `npm run deck:standalone -- <slug>` rebuilds the site, then `scripts/inline-deck.mjs` writes `share/<slug>-standalone.html` with all fonts (base64 woff2), images (data URIs), and CSS folded into the single file. The MP4 `<source>` tags are stripped — the poster carries the cover. Use this for sharing decks as email attachments or USB hand-offs; the file opens in any modern browser with no network. The output lands in `share/` so it's also served at `/share/<slug>-standalone.html` on the live site (see the share/ deploy mirror, below).
- **Self-contained outputs go in `share/`.** Any standalone HTML produced for sharing — visual explainers, one-pagers, exported reports, ad-hoc decks generated outside the deck pipeline — goes in `share/` at the repo root. The build copies `share/*` into `dist/share/` (via `scripts/copy-share.mjs` chained to `astro build`), so every file is reachable at `/share/<filename>` once deployed. `.gitignore` only ignores root-level `*-standalone.html`; files under `share/` are tracked deliverables and ship with the site.
- **Bright Centella palettes on light grounds (client deliverables).** When applying Centella's color system to *light* paper grounds, every saturated bright (`--violet`, `--advisory`, `--networking`, `--investment`, `--global`, `--tech`) fails AA body-text contrast on the corresponding light variant. Brights earn their keep as fills with dark text inside (6.2–7.8:1, family-dark on family-bright is always AAA), as decorative non-text glyphs, or as the *background* of a colored highlight wrapping a dark-text accent word (`background: var(--accent); padding: 0 0.18em; border-radius: 6px; box-decoration-break: clone;`). For accent text at 18pt+ that needs more pop than family-dark, derive a deepened-but-on-brand variant in the same hue (e.g. tech `#A52B7D`, global `#8A4F00`) — both reach 5.5:1+ on light grounds. Worked example: `work/prime-movers-20th/mockups/`. Holding this rule lets a brochure look bright and cheery while clearing AAA on body copy.

## Commands

Use **Node 20** (see `.nvmrc`). With nvm: `nvm use` in the repo root, then:

```bash
npm run dev          # Astro dev server (fetches from Notion on each page load)
npm run build        # Production build: astro build, then mirror share/ → dist/share/
npm run preview      # Preview production build locally
npm run media:hero -- /path/to/source.mp4   # Regenerate hero poster.webp + 540p/720p MP4s (needs ffmpeg + cwebp)
npm run deck:standalone -- <slug>           # Build site, then emit share/<slug>-standalone.html (self-contained, all fonts/images inlined)
```

## Deploy

- **Hosted on Vercel.** GitHub repo `pablodefendini/centella-global` is connected to a Vercel project. Pushes to `main` deploy to production; PRs get preview URLs.
- **Build command:** `npm run build` — runs `astro build` (which fetches Notion data and emits `dist/`), then `scripts/copy-share.mjs` mirrors `share/` into `dist/share/`. Vercel serves `dist/` as the static root.
- **API function:** `api/subscribe.ts` is auto-detected by Vercel's filesystem convention (any `api/*.ts` at the repo root becomes a serverless function), so the Mailchimp endpoint deploys without explicit Astro adapter wiring.
- **Env vars** live in Vercel project settings (Notion + Mailchimp keys from `.env.example`). They are not committed.
- **Preview URL** while we're pre-domain: `centella-global-<hash>.vercel.app` (or whatever the project name resolves to). Public, intentionally — anyone with the link can view. We can attach a custom domain later without changing anything in this repo.

## Development diary

Maintained in `docs/DIARY.md`. Update every session or after any substantial change. Write in Pablo's voice (first-person, direct, concrete — see the `pablo-voice` skill). Entries in reverse chronological order, newest first.

## Open questions (blocking)

- **Mailchimp audience ID** — which list/audience do forms feed into?
- **Notion workspace + database IDs** — needed to configure the API client
- **Slack channel for deploy notifications** — where should deploy status updates be posted?
