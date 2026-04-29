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
├── middleware.ts     # Edge middleware: HTTP Basic Auth gate on /tools/* (page routes + co-located generated assets).
│                     # Compiled to a Vercel Edge Function via vercel({ edgeMiddleware: true }).
├── layouts/          # Base.astro (HTML shell), Event.astro (event page layout),
│                     # Presentation.astro (full-bleed shell for decks)
├── components/       # SiteHeader, SiteFooter, RandomDisplayAccents (gradient class helper),
│                     # MailchimpForm, EventCard, SpeakerCard, AttendeeCard, ScheduleBlock,
│                     # SponsorGrid, BlogPostCard
├── pages/
│   ├── index.astro           # Homepage: shared site chrome + hero, latest event, pillars section
│   ├── about-centella.astro  # Umbrella page: hero + 6 sections (Meet the moment, Flip the script,
│   │                         # The team, Winning formula, Three pillars, Email signup). Page-accent-
│   │                         # neutral (no override); hero uses data-random-accent-gradient.
│   ├── centella-advisory.astro    # Sub-brand: hero + strategy panels + services list + CTA panel.
│   │                              # Keys to --advisory; hero accent uses display__accent--cyan-violet.
│   ├── centella-institute.astro
│   ├── centella-impact.astro      # Sub-brand: hero + problem panels + aspirational beat +
│   │                              # solution panels + CTA panel. Keys to --investment;
│   │                              # hero accent uses display__accent--lime-teal.
│   ├── styleguide.astro      # Living styleguide — tokens, typography, components
│   ├── events/
│   │   ├── index.astro       # Events listing
│   │   └── [slug].astro      # Dynamic event pages
│   ├── blog/
│   │   ├── index.astro       # Blog listing
│   │   └── [slug].astro      # Dynamic blog posts
│   ├── tools/                # Staff/contractor-only brand-asset generators (auth-gated).
│   │   ├── index.astro       # /tools archive (links to each generator)
│   │   ├── business-cards.astro    # PDF business cards per active team member
│   │   └── email-signatures.astro  # Transparent-PNG email signatures per active team member
│   └── share/
│       └── presentations/
│           └── [slug].astro  # Standalone HTML decks (e.g. ngl-barcelona). Render at /share/presentations/<slug>/
├── templates/        # SVG templates for build-time asset generation. {{token}} interpolation
│                     # via scripts/build-team-assets.mjs. Currently: business-card.svg,
│                     # email-signature.svg.
├── lib/
│   ├── notion.ts             # Notion client + all query functions
│   └── types.ts              # Shared TypeScript types
└── styles/
    └── global.css            # Reset, typography, custom properties

api/
└── subscribe.ts              # Vercel serverless function for Mailchimp

public/
├── media/hero/               # Homepage hero: WebP poster + 540p/720p MP4s (regenerate via npm run media:hero)
└── share/presentations/[slug]/   # Per-deck assets (fonts, images) referenced via absolute /share/presentations/... URLs

share/                        # Standalone HTML outputs meant to be opened in a browser or shared as files.
                              # Organized by artifact kind:
                              #   share/presentations/<slug>-standalone.html  — bundled deck exports
                              #   share/work/<project>/index.html             — client-project mockups
                              #   share/work/index.html                        — sub-lobby (generated)
                              # Future-site-ready: when the repo becomes the live site, files here are already at
                              # predictable static URLs. Not the same as `public/` — `public/` is Astro's static
                              # asset root for the site build; `share/` is a publish tray for self-contained docs.
                              # `_index.json` is the lobby manifest (project metadata + artifact list); `index.html`
                              # is the generated main lobby served at `/share/`. The manifest's optional
                              # `subLobbies` map declares per-kind sub-lobbies (e.g. `subLobbies.work`)
                              # which build-share-index.mjs renders as share/<kind>/index.html with the
                              # same chrome plus a breadcrumb back to /share/.

scripts/
├── optimize-hero-media.sh    # ffmpeg + cwebp pipeline for hero assets
├── inline-deck.mjs           # Bundles built decks into self-contained share/presentations/<slug>-standalone.html (all decks by default; pass <slug> for one)
├── build-work.mjs            # Walks work/<project>/mockups/ and copies each into share/work/<project>/
├── build-share-index.mjs     # Reads share/_index.json and emits share/index.html — the public lobby for /share/*. Also emits one share/<kind>/index.html sub-lobby for every entry under manifest.subLobbies (filtered + href-rewritten).
├── build-team-assets.mjs     # Reads NOTION_TEAM_PROFILES_DB_ID, renders per-person business-card PDFs and email-sig PNGs from src/templates/, writes them straight into dist/tools/<kind>/ and .vercel/output/static/tools/<kind>/ (co-located with the listing pages, NOT committed). Source of truth is Notion.
├── preview-team-assets.mjs   # Local-only preview helper: renders the SVG templates against a fixture profile, drops outputs in /tmp. Run via `npm run team-assets:preview` while iterating on templates.
└── copy-share.mjs            # Postbuild: mirrors share/ into dist/share/ AND .vercel/output/static/share/ so deliverables ship at /share/*

docs/
├── PRD.md                    # Product requirements
├── MEMORY.md                 # Decision log
└── DIARY.md                  # Public development diary

work/                         # Client deliverables and project work outside the website itself.
                              # Each subfolder is its own self-contained project (e.g. work/prime-movers-20th/).
                              # Not built or deployed by Astro. Has its own README.md per project.
```

## Data model

Public-facing content (five Notion databases):

- **Events** — core content type. Has Status (Draft/Published/Archived), Featured flag, a single `Date` property that holds either a single date or a date range (single-day events leave the end blank; multi-day events use Notion's range mode), slug, hero image, registration URL, Mailchimp tag. Page body contains description and schedule. Relations to Speakers, Attendees, Sponsors.
- **Blog Posts** — Title, Slug, Status, Published Date, Authors (multi-author), Tags, Summary, Hero Image, Event (relation → Events DB; optional, single-event). When set, the post detail page renders a "From [Event]" eyebrow link to `/events/{slug}` and the listing card shows "From [Event]" as plain text. The link 404s if the related event isn't Published — content team's responsibility not to associate Draft/Archived events. Page body is the post content.
- **Speakers** — Name, Title, Role, Organization, Photo, Bio. **Title** is the person's standing job title at their organization (e.g. "Strategy Director"); **Role** is their contextual function in the event (e.g. "Keynote Speaker", "Panel Moderator"). `SpeakerCard` leads with Role; Title and Organization are secondary muted lines.
- **Attendees** — Name, Title, Role, Organization, Photo, Bio. Same Title/Role split as Speakers (Role is the contextual function — "Founding Partner", "Advisor" — Title is the standing job title). No `AttendeeCard` exists yet, but the Attendee data flows through and can be rendered when needed.
- **Sponsors** — Name, Logo, URL, Tier (Lead/Supporting/Community).

Speakers, Attendees, and Sponsors are linked to Events via Notion relations. A speaker/attendee/sponsor can appear across multiple events.

Internal (one Notion database, only used by the auth-gated /tools section):

- **Team Profiles** — staff and contractor identity records used to generate per-person branded assets at build time. Fields: Name (title), Slug (rich text — manual, like Events/Blog), Status (select: Active/Inactive — only Active renders), Title (rich text — job title, what goes on the business card and email signature), Role (rich text — contextual function, exposed as a template token but unused by the default card/signature designs), Email, Pronouns, Phone, LinkedIn (URL), Website (URL), Photo (file). Not exposed on any public page.

## Things to avoid

- **Don't fetch Notion data at runtime.** All Notion API calls happen in `getStaticPaths()` or page/component frontmatter during build. If you're importing `notion.ts` in a client-side script, something is wrong.
- **Don't hardcode event content in Astro files.** If it's content (text, dates, images, speaker info), it comes from Notion. The only things hardcoded are structural: layout, component markup, navigation.
- **Don't put the Mailchimp API key in client-side code.** The form POSTs to `/api/subscribe`, which handles the Mailchimp call server-side.
- **Don't use heavy JS frameworks for components.** Astro components are zero-JS by default. Only use `client:load` or `client:visible` directives when a component genuinely needs interactivity (the Mailchimp form is the main case).
- **Don't assume Notion page body structure.** The block renderer should handle any block type gracefully — headings, paragraphs, lists, images, toggles, callouts. If it encounters an unknown block type, render nothing rather than crashing.
- **Don't add chrome to presentation decks.** Decks live at `src/pages/share/presentations/[slug].astro` and use `src/layouts/Presentation.astro` — a minimal full-bleed shell with no `SiteHeader`/`SiteFooter`. Deck assets (fonts, images) go in `public/share/presentations/[slug]/assets/` and are referenced with absolute paths. Inline `<style>` and `<script>` blocks inside a deck must use `is:global` / `is:inline` so Astro doesn't scope or hoist them.
- **Don't import from `src/` inside `api/*.ts`.** When `@astrojs/vercel` writes a Build Output API v3 bundle, Vercel's `@vercel/node` builder picks up the root-level `api/` folder *separately* and does not always bundle imports outside `api/`. Cross-directory imports like `import { x } from '../src/lib/y'` deploy successfully but throw `FUNCTION_INVOCATION_FAILED` at runtime. Keep API function bundles self-contained — inline the helper code into the function file, or duplicate it under `api/_lib/`. Single source of truth lives wherever the original consumer is.
- **Don't put deploy-target output in `dist/share/` only.** When the Vercel adapter is the active output target, Vercel serves `.vercel/output/static/`, not `dist/`. The `copy-share.mjs` postbuild writes to both so the same code path works for `astro preview` (reads `dist/`) and Vercel deploy (reads `.vercel/output/static/`). If you add a new postbuild step that emits files into the deploy bundle, mirror it into both targets.
- **Don't lower the `/tools` auth gate.** The `/tools/*` prefix is HTTP Basic Auth-gated by `src/middleware.ts` because the assets it covers contain personal contact info for staff and contractors. Page routes AND the co-located generated PDFs/PNGs at `/tools/<kind>/<slug>.<ext>` all sit under the same prefix, so a single startsWith check covers everything. The middleware fails closed when `TOOLS_USERNAME` or `TOOLS_PASSWORD` are unset (returns 503), which is the correct behavior — never patch the middleware to allow through on missing env. If you need to broaden the gate (e.g., add a new staff-only path), add the prefix to the `PROTECTED_PREFIXES` array; do not weaken the check.
- **Don't commit team-asset artifacts to git.** The per-team-member PDFs and PNGs under `dist/tools/business-cards/<slug>.pdf` and `dist/tools/email-signatures/<slug>.png` are regenerated on every Vercel build by `scripts/build-team-assets.mjs`. They go straight into `dist/tools/<kind>/` and `.vercel/output/static/tools/<kind>/`, never into the repo working tree. Notion is the source of truth; the build is the only renderer. (`dist/` and `.vercel/` are already in `.gitignore`, so this happens automatically — but don't add an exception.)

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
- **Presentation decks ship at `/share/presentations/[slug]/`.** One `.astro` file per deck under `src/pages/share/presentations/`, using the `Presentation.astro` layout (full-bleed, no site chrome). Inline `<style>` blocks need `is:global`; inline `<script>` blocks need `is:inline`, so Astro doesn't scope-rewrite or bundle deck-internal CSS/JS. Per-deck assets go in `public/share/presentations/[slug]/assets/` and are referenced with absolute paths. Decks live under `/share/` because every kind of shareable artifact (decks, work mockups, one-pagers) belongs in the same publish tray.
- **Deck scaling is letterboxed.** The `<deck-stage>` web component renders slides at their authored design size (1920×1080 by default) and applies `transform: scale(min(vw/dw, vh/dh))` so the canvas always fits the viewport with bars on the short axis — never clips. Don't size slide content in `vh`/`vw` or assume the viewport equals the design canvas.
- **Standalone deck export.** `scripts/inline-deck.mjs` walks `dist/share/presentations/*/` and emits `share/presentations/<slug>-standalone.html` for each one — all fonts (base64 woff2), images (data URIs), and CSS folded into the single file; MP4 `<source>` tags are stripped (poster carries the cover). Run `npm run decks:standalone` (no arg) to bundle every presentation, or `npm run deck:standalone -- <slug>` for one. Use the standalones for email attachments or USB hand-offs; they open in any modern browser with no network. Each one is also served at `/share/presentations/<slug>-standalone.html` on the live site, alongside the live Astro version at `/share/presentations/<slug>/`.
- **Work projects export.** `scripts/build-work.mjs` walks `work/*/mockups/` and copies each project's `mockups/` directory verbatim into `share/work/<project>/`. The mockups are expected to already be self-contained (data-URI images, CDN-loaded fonts) — the script doesn't bundle anything, it's a publish-tray copy. Run `npm run work:build` after editing any project's mockups; deploys at `/share/work/<project>/index.html`. The `mockups/` convention is the explicit "this is what we share" subset of a `work/<project>/` directory — briefs, READMEs, and source files outside that subdirectory stay private.
- **One-shot share build.** `npm run share:build` chains `astro build` → `inline-deck.mjs` (all presentations) → `build-work.mjs` (all work projects) → `build-share-index.mjs` (the lobby). Use it before committing share/ updates so every standalone artifact is regenerated against current sources in one pass.
- **Share lobby is manifest-driven.** `share/_index.json` is the source of truth for what `/share/` shows: project title, eyebrow, description, accent token, and artifact links. `scripts/build-share-index.mjs` reads it, cross-checks every artifact href against disk, warns about orphan top-level entries not in the manifest, and emits `share/index.html` with Centella site chrome (Barlow superfamily from Google Fonts, brand tokens inlined as CSS custom properties — fully self-contained, no Astro dependency). When a new project lands under `share/`, add an entry to `_index.json` and run `npm run share:index` (or `npm run share:build` to regenerate everything).
- **Sub-lobbies under `/share/<kind>/`.** The manifest's optional `subLobbies` map (keyed by directory name under `share/`) declares per-kind sub-lobbies. For each entry, `build-share-index.mjs` filters projects whose artifacts have an href starting with that prefix, strips the prefix from each href so links resolve relative to the sub-lobby, and emits `share/<kind>/index.html` with the same chrome plus a breadcrumb back to `/share/`. Today only `subLobbies.work` is defined, which surfaces work-mockup projects at `/share/work/`. Adding `subLobbies.presentations` (or any other kind) is a manifest-only edit — the script handles it generically. Without this pattern, `/share/<kind>/` 404s on Vercel because the directory has no `index.html`.
- **Section panels reuse one tone-coded shape.** Across the homepage pillars, Advisory's strategy panels, Impact's problem and solution panels, and About Centella's three pillars, every tone-coded section panel uses the same recipe: `--<family>-dark` ground + `--<family>` foreground, 8px (medium) or 16px (large/CTA) border-radius, `--space-2` outer padding, an inner frame at `1px solid color-mix(in srgb, currentColor 30%, transparent)`, and an icon chip at `color-mix(... 16%, transparent)` background + `color-mix(... 35%, transparent)` border. Title in `--color-text`, body in `--color-text-muted`, CTAs inherit `currentColor`. Each panel composition stays inside one color family (or one family + the principal violet via approved gradient on the hero accent), honoring the design.md "max two color families per composition" rule. **The next page that needs a tone panel triggers extraction into a shared `<TonePanel>` component** (currently each page duplicates the ~30 lines of CSS and ~12 lines of markup; documented in "Pending / planned work"). Until then, copy the homepage's `home-min__pillar` block as the canonical source.
- **Hero accent gradient signals page identity.** Sub-brand pages key `--page-accent` to their work-color and use a specific approved gradient on the hero accent that pairs the page key with one other family (Advisory hero → `display__accent--cyan-violet`; Impact hero and aspirational beat → `display__accent--lime-teal`). Umbrella pages (homepage, About Centella) don't override `--page-accent` and use `data-random-accent-gradient` on the hero accent for per-load random gradient variation. Treat this distinction as load-bearing on future pages: a sub-brand page that uses random gradient feels generic; an umbrella page locked to one gradient feels narrow.
- **Dev-mode `share/*` serving.** `astro dev` natively only knows `src/pages/` and `public/` — `share/` at the repo root is invisible during development, so `/share/` and `/share/work/` would 404 in dev despite working in production (where `copy-share.mjs` mirrors share/ into dist/ and .vercel/output/static/). Closed by a Vite plugin in `astro.config.mjs` (`apply: 'serve'` so it only runs in dev) that intercepts `/share/*` requests, maps them to `<repo>/share/*`, redirects directory URLs to the trailing-slash form so relative hrefs resolve, and guards against path traversal. Production behavior is unchanged. If you add another root-level publish tray (say, `archive/` at `/archive/*`), add a parallel plugin or generalize this one — don't reach for `public/share/` symlinks.
- **Self-contained outputs go in `share/`, organized by artifact kind.** Any standalone HTML produced for sharing — exported decks, work-project mockups, visual explainers, one-pagers, ad-hoc reports — goes in `share/` at the repo root, in a subfolder for the kind: `share/presentations/` for decks, `share/work/` for client-project mockups. New artifact kinds get their own subfolder rather than landing at the top level. The main build (`npm run build`) just copies `share/*` into `dist/share/` (via `scripts/copy-share.mjs`); standalone bundles are NOT regenerated on Vercel. Treating bundles as locally-built, committed deliverables keeps each one canonical (a deck shared on date X is bit-identical to the deployed copy). `.gitignore` ignores `*-standalone.html` everywhere except recursively under `share/`, so committed bundles like `share/presentations/<slug>-standalone.html` stay tracked.
- **`/tools` is the staff & contractor section, build-time generated, password-gated.** Two generators live there today: business-card PDFs at `/tools/business-cards` and transparent-PNG email signatures at `/tools/email-signatures`. Both pages list every Active team profile from Notion with a download link to `/tools/business-cards/<slug>.pdf` or `/tools/email-signatures/<slug>.png` — generated assets are co-located with their listing pages under `/tools/*`. The actual files are produced at build time by `scripts/build-team-assets.mjs` (not committed). Auth: HTTP Basic Auth via `src/middleware.ts` against the `TOOLS_USERNAME` + `TOOLS_PASSWORD` env vars (both required, both checked); the middleware gates the entire `/tools/*` prefix so a direct asset URL is covered by the same gate as the page-level routes. The middleware fails closed when either env var is missing. **Each `/tools/*` page MUST set `export const prerender = false;`** — middleware that reads request headers cannot run on prerendered routes (the prerender pass has no real request), so without this flag the gate fires once at build time with empty headers and the page is permanently 401. Static asset gating for `/tools/<kind>/<slug>.<ext>` works in production (the edge middleware runs in front of static asset serving when `vercel({ edgeMiddleware: true })` is set) but does not gate static assets in `astro dev`; that's a known dev-vs-prod gap and is fine because those assets only exist after a build. Vercel's filesystem-first routing serves the static PDF/PNG before invoking the page's SSR function — sibling assets coexist with `prerender = false` page routes without conflict.
- **Team-asset pipeline.** `scripts/build-team-assets.mjs` runs *between* `astro build` and `copy-share.mjs`. For each Active Team Profile in Notion, it: (1) reads `src/templates/business-card.svg` and `src/templates/email-signature.svg`, (2) substitutes `{{token}}` placeholders with the profile fields (`name`, `titleRole`, `email`, `phone`, `pronouns`, `linkedin`, `website`, plus pre-computed `linkedinDisplay`/`websiteDisplay` with the protocol stripped), (3) renders the card SVG to a vector PDF via `pdfkit` + `svg-to-pdfkit` (85×55mm + 3mm bleed = 91×61mm artboard), (4) renders the signature SVG to a transparent PNG via `@resvg/resvg-js` at 2× density. Outputs are written to both `dist/tools/<kind>/<slug>.<ext>` and `.vercel/output/static/tools/<kind>/<slug>.<ext>`. SVG templates must be XML 1.0 valid — no double-dashes inside `<!-- comments -->` (resvg's parser rejects them). Use `npm run team-assets:preview` to render against a fixture profile when iterating on templates without needing live Notion.
- **Bright Centella palettes on light grounds (client deliverables).** When applying Centella's color system to *light* paper grounds, every saturated bright (`--violet`, `--advisory`, `--networking`, `--investment`, `--global`, `--tech`) fails AA body-text contrast on the corresponding light variant. Brights earn their keep as fills with dark text inside (6.2–7.8:1, family-dark on family-bright is always AAA), as decorative non-text glyphs, or as the *background* of a colored highlight wrapping a dark-text accent word (`background: var(--accent); padding: 0 0.18em; border-radius: 6px; box-decoration-break: clone;`). For accent text at 18pt+ that needs more pop than family-dark, derive a deepened-but-on-brand variant in the same hue (e.g. tech `#A52B7D`, global `#8A4F00`) — both reach 5.5:1+ on light grounds. Worked example: `work/prime-movers-20th/mockups/`. Holding this rule lets a brochure look bright and cheery while clearing AAA on body copy.

## Commands

Use **Node 20** (see `.nvmrc`). With nvm: `nvm use` in the repo root, then:

```bash
npm run dev          # Astro dev server (fetches from Notion on each page load)
npm run build        # Production build: astro build → build-team-assets.mjs → copy-share.mjs
npm run preview      # Preview production build locally
npm run media:hero -- /path/to/source.mp4   # Regenerate hero poster.webp + 540p/720p MP4s (needs ffmpeg + cwebp)
npm run decks:standalone                    # Build site, then emit share/<slug>-standalone.html for every presentation (no arg = all; pass <slug> for one)
npm run deck:standalone -- <slug>           # Alias of the above for one specific presentation
npm run work:build                          # Copy every work/<project>/mockups/ → share/<project>/ (deploys at /share/<project>/index.html)
npm run share:index                         # Regenerate share/index.html (the /share/ lobby) from share/_index.json
npm run share:build                         # One-shot: astro build, then bundle all decks, all work projects, and regenerate the lobby
npm run team-assets:build                   # Re-run just the team-asset generator (assumes astro build has already produced an output dir)
npm run team-assets:preview                 # Render the SVG templates against a fixture profile to /tmp/centella-preview-* — for iterating on src/templates/* without live Notion
```

## Deploy

- **Hosted on Vercel.** GitHub repo `pablodefendini/centella-global` is connected to a Vercel project. Pushes to `main` deploy to production; PRs get preview URLs.
- **Build command:** `npm run build` — runs `astro build` (which fetches Notion data and emits `dist/`), then `scripts/build-team-assets.mjs` (Notion-driven, generates per-team-member PDFs/PNGs into `dist/tools/<kind>/` and `.vercel/output/static/tools/<kind>/`), then `scripts/copy-share.mjs` mirrors the committed `share/` into `dist/share/`. Vercel serves `dist/` (or `.vercel/output/static/` when the Build Output API target is active) as the static root.
- **API function:** `api/subscribe.ts` is auto-detected by Vercel's filesystem convention (any `api/*.ts` at the repo root becomes a serverless function), so the Mailchimp endpoint deploys without explicit Astro adapter wiring.
- **Env vars** live in Vercel project settings (Notion + Mailchimp keys from `.env.example`). They are not committed.
- **Preview URL** while we're pre-domain: `centella-global-<hash>.vercel.app` (or whatever the project name resolves to). Public, intentionally — anyone with the link can view. We can attach a custom domain later without changing anything in this repo.

## Development diary

Maintained in `docs/DIARY.md`. Update every session or after any substantial change. Write in Pablo's voice (first-person, direct, concrete — see the `pablo-voice` skill). Entries in reverse chronological order, newest first.

## Open questions (blocking)

- **Mailchimp audience ID** — which list/audience do forms feed into?
- **Notion workspace + database IDs** — needed to configure the API client
- **Slack channel for deploy notifications** — where should deploy status updates be posted?

## Pending / planned work (non-blocking)

- **Team-photo pipeline for `/about-centella/`.** The team-portrait grid in `src/pages/about-centella.astro` currently renders 8 placeholder circles with a `// swap for <img src="/team/<slug>.webp">` marker. `getTeamProfiles()` in `src/lib/notion.ts` already returns Active profiles with photo URLs, but Notion's signed file URLs expire — fine for the auth-gated `/tools/*` (rebuilt every deploy, only seen by staff) but unworkable on a public page where a stale URL = a broken portrait. Pickup: a build-time pipeline (analogous to `scripts/build-team-assets.mjs`) that downloads photos from Notion into `public/team/<slug>.webp` so the public page references stable local paths. Page reads from a list and falls back to placeholders when no profile/photo is available.
- **Extract `<TonePanel>` component.** The tone-coded section panel pattern (homepage pillars, Advisory strategies, Impact problems/solutions, About Centella three-pillars) is now duplicated across four pages. Each duplication is small (~30 lines of CSS + ~12 lines of markup) but the duplication count is high. Trigger: the next page that needs a tone panel. At that point, extract a `<TonePanel tone="advisory|networking|investment|violet" radius="md|lg" icon="..." title="..." cta?="...">` component, fold the recipe into a single source of truth, and update all four call sites in the same PR.
- **Color scale generator step interior still looks broken.** The 9-step scale on `/styleguide#generator` was rebuilt across diary entries 27 and 28 (transparent hex chrome by default, hover-revealed Copy button, single inset white highlight on the key step, narrow-viewport stacked-rows breakpoint). The token wiring and chrome story now match the design system on paper, but the actual rendered interior still looks off — Pablo flagged it in the same Apr 29 session and deprioritized rather than blocking on it. `tsc --noEmit` is clean and the markup balances, so the issue is rendered CSS the static review missed. Things to investigate next pickup: the inline hex `<input>` may still be sizing past `max-width: 9ch` because of browser default `size`; `flex: 1; min-width: 0` may not be enough to fully shrink the columns at the page's actual rendered width; the `.csg-step-num` eyebrow may be overlapping the hex hover-chip in a way the static read missed; the `is-overridden::after` dot may be conflicting with the `is-key` inset ring. Suggested approach: take a real screenshot at desktop and mobile viewports, compare to the CSS, and consider a much simpler interior — drop the inline hex `<input>` entirely, replace with a `<button>` that displays the hex as text and copies on click. The color picker overlay already handles editing, and the inline input is a power-user feature whose visual cost is outweighing its benefit. Don't ship the styleguide as the canonical interactive reference until this is right.
