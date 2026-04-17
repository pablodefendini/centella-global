# Project Memory — Centella Global Website

This file captures decisions, rationale, and institutional knowledge that
isn't obvious from the code or the PRD. It's a decision log, not documentation.
Append new entries at the top.

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
