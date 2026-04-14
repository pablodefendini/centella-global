# CLAUDE.md

## Project overview

Website for Centella (centellaglobal.com) — an organization that works with political leaders and movement builders across the Global South. Static site built with Astro, content managed in Notion, email capture via Mailchimp. Hosted on Vercel.

## Hard constraints

- **Static-first.** Every page is pre-rendered HTML. No client-side data fetching from Notion. The only runtime code is the Mailchimp serverless function.
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
├── layouts/          # Base.astro (HTML shell), Event.astro (event page layout)
├── components/       # Nav, Footer, MailchimpForm, EventCard, SpeakerCard,
│                     # AttendeeCard, ScheduleBlock, SponsorGrid, BlogPostCard
├── pages/
│   ├── index.astro           # Homepage
│   ├── events/
│   │   ├── index.astro       # Events listing
│   │   └── [slug].astro      # Dynamic event pages
│   └── blog/
│       ├── index.astro       # Blog listing
│       └── [slug].astro      # Dynamic blog posts
├── lib/
│   ├── notion.ts             # Notion client + all query functions
│   ├── mailchimp.ts          # Mailchimp API helper
│   └── types.ts              # Shared TypeScript types
└── styles/
    └── global.css            # Reset, typography, custom properties

api/
└── subscribe.ts              # Vercel serverless function for Mailchimp

docs/
├── PRD.md                    # Product requirements
├── MEMORY.md                 # Decision log
└── DIARY.md                  # Public development diary
```

## Data model

Five Notion databases:

- **Events** — core content type. Has Status (Draft/Published/Archived), Featured flag, date range, slug, hero image, registration URL, Mailchimp tag. Page body contains description and schedule. Relations to Speakers, Attendees, Sponsors.
- **Blog Posts** — Title, Slug, Status, Published Date, Author, Tags, Summary, Hero Image. Page body is the post content.
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

## Patterns

- **Slugs are manually set in Notion**, not auto-generated. This gives the content team control over URLs.
- **Event visibility is controlled by Status property.** Only `Published` events render. `Draft` and `Archived` are filtered out at build time.
- **Mailchimp tags match the event's `Mailchimp Tag` property.** The homepage form uses a generic tag (e.g., `homepage-signup`). Event pages pass the event-specific tag.
- **Notion block rendering** uses a custom block-to-HTML mapper in `src/lib/notion.ts` (or a dedicated `blocks.ts` if it gets big). This is simpler than pulling in a full rendering library and gives us control over the HTML output.

## Commands

```bash
npm run dev          # Astro dev server (fetches from Notion on each page load)
npm run build        # Production build (fetches all Notion data, generates static site)
npm run preview      # Preview production build locally
```

## Development diary

Maintained in `docs/DIARY.md`. Update every session or after any substantial change. Write in Pablo's voice (first-person, direct, concrete — see the `pablo-voice` skill). Entries in reverse chronological order, newest first.

## Open questions (blocking)

- **Mailchimp audience ID** — which list/audience do forms feed into?
- **Notion workspace + database IDs** — needed to configure the API client
- **Slack channel for deploy hook** — where should the deploy button live?
- **Blog post author handling** — single author for now, but should the schema support multiple?
