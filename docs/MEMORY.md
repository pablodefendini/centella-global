# Project Memory — Centella Global Website

This file captures decisions, rationale, and institutional knowledge that
isn't obvious from the code or the PRD. It's a decision log, not documentation.
Append new entries at the top.

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

The rebuild is triggered manually via deploy hooks in both Slack and Notion. Automatic rebuilds via Notion webhooks are a P1 — not needed yet because the content cadence is low enough that manual triggers are fine.

### Deploy hooks in both Slack and Notion

The content team splits between these two tools. Slack hook = a webhook URL wired to a Slack workflow or a simple slash command. Notion hook = either a button property that triggers an automation, or a Notion automation that fires on a specific database change. Both hit the same Vercel deploy hook URL.

### Schedule as page body content, not a separate database

Event schedules live in the Notion page body as structured content (headings for time slots, lists for session details). This keeps it simple — the content team writes the schedule in the same place they write the event description, using Notion's native editor.

Trade-off: we can't query individual sessions across events (e.g., "show me all panels happening this week"). If that need emerges, we'll add a Schedule database. For now, the simpler approach wins.

### Attendees as a separate database (like Speakers and Sponsors)

Attendees get their own Notion database with the same shape as Speakers — Name, Title/Role, Organization, Photo, Bio. This lets us display notable attendees on event pages (think: "who's in the room" social proof) without conflating them with speakers. An attendee can appear across multiple events via Notion relations.

### Blog section added to scope

Originally listed as a non-goal ("blog or news section"), but reconsidered. Centella needs a place to publish thinking and updates beyond events. Blog Posts get their own Notion database (Title, Slug, Status, Published Date, Author, Tags, Summary, Hero Image) and the same build-time fetching pattern as events.

### Mailchimp tagging strategy

Each form submission includes a tag identifying where the signup came from. The homepage form sends a generic tag (e.g., `homepage-signup`). Event pages send the event's `Mailchimp Tag` property (e.g., `build-summit-2026`). Blog pages could send a `blog-signup` tag or a post-specific tag. Tags are set via hidden form fields and processed by the serverless function.

### Custom Notion block renderer over third-party library

We're writing our own block-to-HTML mapper rather than using `@notion-render/client` or similar. Reasons: (1) the output HTML needs to be clean and predictable for styling, (2) we want to handle unknown block types gracefully (skip, don't crash), (3) the dependency surface stays small. If the mapper grows beyond ~200 lines, we'll reconsider.

---

## Decisions still pending

- **Mailchimp audience ID**: which list/audience do the forms feed into? Blocks API integration.
- **Notion workspace + database IDs**: needed to configure `notion.ts`. Pablo needs to set up or share the databases.
- **Slack deploy channel**: which channel gets the deploy button?
- **Notion deploy trigger mechanism**: button property vs. automation vs. something else.
- **Blog author model**: single author field for now, but should we design the schema for multiple authors from the start?
- **Image hosting strategy**: Notion file URLs expire. We may need to download and cache images at build time, or use a proxy. Needs research.
