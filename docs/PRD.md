# Centella Global Website — Product Requirements Document

**Version:** 1.0
**Author:** Pablo Defendini
**Date:** April 14, 2026
**Status:** Draft

---

## 1. Problem Statement

Centella's current website is on Framer, and it's creating friction in two places that matter: capturing email addresses for Mailchimp, and spinning up event mini sites quickly. The content team edits in Notion daily, but Framer doesn't connect to that workflow — every event page is a manual build. Centella runs at least four events per year, each needing its own page with speakers, schedule, registration, and sponsors. The current setup is too slow and too disconnected from how the team already works.

## 2. Goals

| # | Goal | Measure |
|---|------|---------|
| 1 | Content team can publish a new event page by editing Notion and triggering a deploy | Event page live within 15 minutes of Notion update + deploy trigger |
| 2 | Every email signup is captured in Mailchimp with a tag indicating source page/event | 100% of form submissions arrive in Mailchimp with correct tag |
| 3 | Site loads fast on mobile in Global South contexts (variable connectivity) | Lighthouse performance score ≥ 90 on mobile |
| 4 | Event pages have a consistent, professional structure without manual layout work | All event pages render from same template with no per-event code changes |
| 5 | Blog posts can be published from Notion with minimal friction | New post live within 15 minutes of Notion update + deploy trigger |

## 3. Non-Goals

| # | Non-Goal | Rationale |
|---|----------|-----------|
| 1 | Final visual design or branding | We're laying foundations first — design layer comes after the structure works |
| 2 | Authentication or member areas | No user accounts needed; the site is public |
| 3 | Payment processing | Events use external registration (Eventbrite, Lu.ma, etc.) |
| 4 | CMS admin interface | Notion IS the admin interface — no need to build another one |
| 5 | Real-time content updates | Static site with manual deploy triggers is fast enough for this content cadence |
| 6 | Multi-language support | English-first for now; i18n is a future consideration |
| 7 | Search functionality | Site is small enough that nav + event listing covers discoverability |

## 4. User Personas & Stories

### Content Editor (Centella team member)

Someone on the Centella team who needs to publish event pages and blog posts. They work in Notion daily. They are not a developer and should never need to touch code.

- As a content editor, I want to create a new event by filling in a Notion database entry so that the event page appears on the site after I trigger a deploy.
- As a content editor, I want to write blog posts in Notion so that they publish to the site without any code changes.
- As a content editor, I want to add speakers, sponsors, and schedule details in Notion so that the event page renders them automatically.
- As a content editor, I want to trigger a site rebuild from Slack or Notion so that I can publish updates without asking a developer.

### Site Visitor (potential event attendee, mailing list subscriber)

Someone interested in Centella's work — a political leader, movement builder, funder, journalist, or researcher. They're visiting to learn about an event or to stay connected.

- As a visitor, I want to see upcoming events on the homepage so that I know what's happening.
- As a visitor, I want to read an event's full details — description, speakers, schedule, sponsors — on a single page.
- As a visitor, I want to sign up for Centella's mailing list from the homepage or an event page.
- As a visitor, I want to register for an event by clicking through to the registration platform.
- As a visitor, I want to read blog posts about Centella's work and thinking.

### Pablo (site maintainer / developer)

Maintains the site, adds features, and troubleshoots. Needs a codebase that's clean, well-documented, and doesn't require babysitting.

- As the maintainer, I want the site to build from Notion data at deploy time so there's no runtime dependency on external APIs.
- As the maintainer, I want deploy hooks that I can trigger from Slack or Notion so rebuilds don't require CLI access.
- As the maintainer, I want a single serverless function for Mailchimp so the API key stays off the client.

## 5. Requirements

### Must-Have (P0)

| ID | Requirement | Acceptance Criteria |
|----|-------------|---------------------|
| P0-1 | Homepage with email capture form and featured events | Form submits to Mailchimp via serverless function; featured events pulled from Notion |
| P0-2 | Event page template rendering from Notion | All event database fields render correctly; page body (description, schedule) renders as HTML |
| P0-3 | Dynamic event routing (`/events/[slug]`) | Each published event gets a unique URL based on its slug property |
| P0-4 | Events listing page (`/events/`) | Shows all published events, sorted by date |
| P0-5 | Mailchimp integration with per-page tagging | Serverless function accepts email + tag, adds subscriber to list with tag applied |
| P0-6 | Notion as CMS for events | Events database with all required fields; data fetched at build time |
| P0-7 | Blog section with Notion as CMS | Blog posts database; listing page at `/blog/`; individual post pages at `/blog/[slug]` |
| P0-8 | Speaker, Attendee, and Sponsor components | Render from related Notion databases; display on event pages |
| P0-9 | Responsive base layout | Nav, footer, clean typography; works on mobile through desktop |
| P0-10 | Deploy hooks (Slack + Notion) | Manual deploy button in Slack channel; deploy trigger accessible from Notion |
| P0-11 | Vercel hosting | Site deployed on Vercel; serverless functions work |

### Nice-to-Have (P1)

| ID | Requirement | Acceptance Criteria |
|----|-------------|---------------------|
| P1-1 | Open Graph / social meta tags per page | Event and blog pages generate unique OG title, description, and image |
| P1-2 | RSS feed for blog | Valid RSS feed at `/blog/rss.xml` |
| P1-3 | Event status indicators | Visual distinction between upcoming, ongoing, and past events |
| P1-4 | Automatic rebuild on Notion changes | Notion webhook triggers Vercel deploy hook without manual intervention |

### Future Considerations (P2)

| ID | Requirement | Design Consideration |
|----|-------------|---------------------|
| P2-1 | Multi-language support (EN/ES) | Use Astro's i18n routing from the start if possible; at minimum, don't hardcode English strings |
| P2-2 | Event sub-pages (separate pages for schedule, speakers) | Keep slug structure extensible: `/events/[slug]/speakers` should be possible later |
| P2-3 | Analytics integration | Leave room for a script tag in the base layout |
| P2-4 | Newsletter archive | Blog infrastructure could double as newsletter archive later |

## 6. Success Metrics

### Leading Indicators (days to weeks)

| Metric | Target | Stretch | Measurement |
|--------|--------|---------|-------------|
| Time to publish new event page | < 15 min from Notion edit to live | < 5 min | Stopwatch test |
| Lighthouse mobile performance | ≥ 90 | ≥ 95 | Lighthouse CI |
| Mailchimp tag accuracy | 100% correct tags | — | Manual audit of first 20 signups |

### Lagging Indicators (weeks to months)

| Metric | Target | Measurement |
|--------|--------|-------------|
| Email signups per event | Baseline from first two events | Mailchimp dashboard |
| Event page bounce rate | < 50% | Analytics (once added) |
| Content team satisfaction | "This is easier than Framer" | Ask them |

## 7. Open Questions

| # | Question | Owner | Blocking? |
|---|----------|-------|-----------|
| 1 | Which Mailchimp list/audience should the forms feed into? | Pablo | Yes — needed for API integration |
| 2 | What's the Notion workspace ID and which databases to use? | Pablo | Yes — needed for API integration |
| 3 | Should blog posts support multiple authors? | Pablo | No — can add later |
| 4 | Do we need a separate "Past Events" archive page, or does the events listing suffice? | Pablo | No |
| 5 | What's the deploy notification channel in Slack? | Pablo | Yes — needed for deploy hook setup |
| 6 | How should the Notion deploy trigger work? (Button property? Automation?) | Pablo | No — multiple options available |

## 8. Technical Architecture (Summary)

| Layer | Technology |
|-------|-----------|
| Framework | Astro (static-first, islands architecture) |
| CMS | Notion API (`@notionhq/client`) |
| Email | Mailchimp API (via serverless function) |
| Hosting | Vercel (free tier) |
| Serverless | Vercel Functions (Node.js) |
| Styling | CSS custom properties + global stylesheet (no framework yet) |
| Deploy triggers | Vercel deploy hooks → Slack webhook + Notion automation |

**Build pipeline:** `notion.ts` fetches data → Astro builds static HTML → Vercel deploys. The only runtime code is the Mailchimp subscribe function.

**Data flow:** Notion databases (Events, Blog Posts, Speakers, Attendees, Sponsors) → Notion API at build time → Astro `getStaticPaths()` generates pages → static HTML served from Vercel CDN.

## 9. Timeline & Phases

| Phase | Duration | Deliverables |
|-------|----------|-------------|
| 1: Scaffold | This session | Project structure, docs, Notion schema design, git repo |
| 2: Core build | 1–2 weeks | Notion integration, event template, homepage, Mailchimp form, blog |
| 3: Deploy pipeline | 1–2 days | Vercel deployment, deploy hooks (Slack + Notion) |
| 4: Content + polish | Ongoing | Real content, typography refinement, responsive QA |
| 5: Design layer | Future | Visual identity, branding, custom styling |
