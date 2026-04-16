# Centella Global — Website

Static marketing site for [Centella](https://centellaglobal.com): events and blog content from **Notion**, email signups via **Mailchimp**, hosted on **Vercel**. Built with **Astro** (static output, minimal client JavaScript).

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

| Area | Variables |
|------|-----------|
| Notion | `NOTION_API_KEY`, `NOTION_*_DB_ID` for events, blog, speakers, attendees, sponsors |
| Mailchimp | `MAILCHIMP_API_KEY`, `MAILCHIMP_AUDIENCE_ID`, `MAILCHIMP_SERVER_PREFIX` |
| Deploy | `VERCEL_DEPLOY_HOOK_URL` (for Notion/Slack-triggered rebuilds) |

Never commit `.env`. It is listed in `.gitignore`.

## Scripts

| Command | Purpose |
|---------|---------|
| `npm run dev` | Astro dev server |
| `npm run build` | Static production build |
| `npm run preview` | Preview built site |
| `npx astro check` | Type-check Astro components |
| `npm run media:hero -- <path/to/source.mp4>` | Regenerate `public/media/hero/` poster WebP and 540p/720p encodes |

## Project docs

| File | Contents |
|------|----------|
| [`CLAUDE.md`](./CLAUDE.md) | AI/editor orientation: constraints, structure, commands |
| [`docs/PRD.md`](./docs/PRD.md) | Product requirements, including media and progressive enhancement (**§11**) |
| [`docs/MEMORY.md`](./docs/MEMORY.md) | Decision log |
| [`docs/DIARY.md`](./docs/DIARY.md) | Development diary |
| [`design.md`](./design.md) | Visual design tokens and UI rules |

## Repo layout (short)

- `src/pages/` — Routes (`/`, `/events/`, `/blog/`, etc.)
- `src/lib/notion.ts` — Notion client and build-time queries
- `src/styles/global.css` — Global styles and CSS variables
- `api/subscribe.ts` — Vercel serverless handler for Mailchimp
- `public/` — Static assets (logos, optimized hero media under `public/media/hero/`)

## License

Private repository; all rights reserved unless otherwise stated.
