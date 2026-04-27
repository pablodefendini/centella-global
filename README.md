# Centella Global — Website

Static marketing site for [Centella](https://centellaglobal.com), an organization that works with political leaders and movement builders across the Global South. Built with **Astro** (static output, minimal client JavaScript), content managed in **Notion**, email capture via **Mailchimp**, hosted on **Vercel**.

The site covers the homepage, the three foundational pillars (Advisory, Institute, Impact), an events section (upcoming, past, and dynamic event pages), a blog, presentation decks shipped at shareable URLs under `/presentations/`, and a living styleguide. All content — events, blog posts, speakers, attendees, sponsors — is fetched from Notion at build time; nothing is fetched client-side.

## Requirements

- **Node.js** 20+ (recommended; Astro 5 expects a current LTS)
- **npm** 9+

Optional, only if you regenerate homepage hero media:

- **ffmpeg** and **cwebp** (e.g. `brew install ffmpeg webp` on macOS)

## Quick start

```bash
git clone <repository-url>
cd centella-global
npm install
cp .env.example .env
# Edit .env with your Notion and Mailchimp values.
npm run dev
```

Dev server defaults to `http://localhost:4321/`.

```bash
npm run build    # production build (calls Notion at build time)
npm run preview  # serve the contents of dist/ locally
```

## Environment variables

Copy `.env.example` to `.env` and fill in:


| Area      | Variables                                                                          |
| --------- | ---------------------------------------------------------------------------------- |
| Notion    | `NOTION_API_KEY`, `NOTION_*_DB_ID` for events, blog, speakers, attendees, sponsors |
| Mailchimp | `MAILCHIMP_API_KEY`, `MAILCHIMP_AUDIENCE_ID`, `MAILCHIMP_SERVER_PREFIX`            |
| Deploy    | `VERCEL_DEPLOY_HOOK_URL` (for Notion/Slack-triggered rebuilds)                     |


Never commit `.env`. It is listed in `.gitignore`.

## Scripts


| Command                                      | Purpose                                                           |
| -------------------------------------------- | ----------------------------------------------------------------- |
| `npm run dev`                                | Astro dev server                                                  |
| `npm run build`                              | Static production build                                           |
| `npm run preview`                            | Preview built site                                                |
| `npx astro check`                            | Type-check Astro components                                       |
| `npm run media:hero -- <path/to/source.mp4>` | Regenerate `public/media/hero/` poster WebP and 540p/720p encodes |


## Project docs


| File                                 | Contents                                                                    |
| ------------------------------------ | --------------------------------------------------------------------------- |
| `[CLAUDE.md](./CLAUDE.md)`           | AI/editor orientation: constraints, structure, commands, patterns           |
| `[design.md](./design.md)`           | Full design system — tokens, typography, components, states, accessibility  |
| `[docs/PRD.md](./docs/PRD.md)`       | Product requirements, including media and progressive enhancement (**§11**) |
| `[docs/MEMORY.md](./docs/MEMORY.md)` | Decision log                                                                |
| `[docs/DIARY.md](./docs/DIARY.md)`   | Development diary (Pablo's voice, reverse chronological)                    |


## Repo layout (short)

- `src/pages/` — Routes: `/` (homepage), `/centella-advisory`, `/centella-institute`, `/centella-impact`, `/events/` (+ `[slug]`), `/blog/` (+ `[slug]`), `/presentations/` (per-deck pages), `/styleguide`
- `src/layouts/` — `Base.astro` (site chrome), `Event.astro` (event page layout), `Presentation.astro` (full-bleed shell for decks)
- `src/components/` — `SiteHeader`, `SiteFooter`, `MailchimpForm`, `EventCard`, `SpeakerCard`, `AttendeeCard`, `ScheduleBlock`, `SponsorGrid`, `BlogPostCard`, `RandomDisplayAccents`
- `src/lib/notion.ts` — Notion client and build-time queries (events, blog, speakers, attendees, sponsors)
- `src/lib/mailchimp.ts` — Mailchimp API helper (server-side only)
- `src/styles/global.css` — Reset, typography, custom properties, utility classes
- `api/subscribe.ts` — Vercel serverless handler for Mailchimp signups
- `public/media/hero/` — Optimized homepage hero assets (WebP poster + 540p/720p MP4s)
- `public/presentations/[slug]/` — Per-deck assets (fonts, images) referenced via absolute URLs
- `scripts/optimize-hero-media.sh` — ffmpeg + cwebp pipeline for regenerating hero media

## License

Private repository; all rights reserved unless otherwise stated.