# Centella Global Website — Product Requirements Document

**Version:** 1.2  
**Author:** Pablo Defendini  
**Date:** April 16, 2026  
**Status:** Draft

---

## 1. Problem Statement

Centella's current Framer site creates operational friction in two critical workflows:

1. Capturing email signups in Mailchimp with reliable source attribution.
2. Launching event mini-sites quickly and consistently.

The content team already works in Notion, but the website pipeline is disconnected from that workflow. Event pages require manual assembly, which slows publishing and introduces avoidable inconsistency. Centella runs at least four events per year, each needing structured content (speakers, schedule, registration, sponsors), so the current process does not scale.

## 2. Goals

| # | Goal | Success Measure |
|---|------|-----------------|
| 1 | Publish events from Notion without code changes | Event page live within 15 minutes of Notion update + Notion publish trigger |
| 2 | Capture every signup in Mailchimp with correct source tag | 100% of tested submissions stored with expected tag |
| 3 | Deliver fast mobile performance for Global South connectivity realities | Lighthouse mobile performance score >= 90 on production build |
| 4 | Enforce consistent event page structure | All published events use one template with no per-event code edits |
| 5 | Publish blog posts from Notion with minimal operational friction | Blog post live within 15 minutes of Notion update + Notion publish trigger |

## 3. Non-Goals (for v1)

| # | Non-Goal | Rationale |
|---|----------|-----------|
| 1 | Final visual branding rollout | Foundation and content pipeline come first |
| 2 | Authentication or member areas | Site is fully public |
| 3 | Payment processing | Registration occurs on external platforms |
| 4 | Custom CMS UI | Notion is the CMS interface |
| 5 | Real-time content sync | Manual Notion publish triggers are sufficient for current cadence |
| 6 | Multi-language implementation | English-first launch; i18n can be layered later |
| 7 | On-site search | Site size is small enough for nav + listings |

## 4. Users and Key Stories

### 4.1 Content Editor (Centella team)

- As a content editor, I can create a new event in Notion and publish it with the Notion publish trigger.
- As a content editor, I can author blog posts in Notion with no code workflow.
- As a content editor, I can manage speakers/sponsors/schedule in Notion and see them rendered correctly.
- As a content editor, I can trigger rebuilds from Notion automation without CLI access.

### 4.2 Site Visitor

- As a visitor, I can discover upcoming events from the homepage.
- As a visitor, I can view complete event details on one event page.
- As a visitor, I can subscribe from homepage or event pages.
- As a visitor, I can click through to register on external event platforms.
- As a visitor, I can read Centella blog content.

### 4.3 Site Maintainer

- As maintainer, I can rely on build-time Notion fetches (no runtime CMS dependency).
- As maintainer, I can operate deploy hooks through Notion automation while using Slack for deploy notifications.
- As maintainer, I keep Mailchimp credentials server-side only.

## 5. Requirements

### 5.1 Must-Have for Launch (P0)

| ID | Requirement | Acceptance Criteria |
|----|-------------|---------------------|
| P0-1 | Homepage with email form + featured events | Homepage renders featured published events from Notion; form posts to `/api/subscribe`; successful submission returns success state |
| P0-2 | Event page template from Notion | `/events/[slug]` renders all required fields; page body content renders from Notion blocks without runtime fetch |
| P0-3 | Dynamic event routing | Each published event with valid slug is generated at unique URL |
| P0-4 | Events listing page | `/events/` lists all published events sorted by date |
| P0-5 | Mailchimp integration + tagging | API accepts `email` and optional `tag`; Mailchimp subscriber is created/updated and tag applied |
| P0-6 | Notion events CMS model | Events DB fields and relations are mapped and validated in build pipeline |
| P0-7 | Blog from Notion | `/blog/` lists published posts; `/blog/[slug]` pages are generated from Notion |
| P0-8 | Related entities rendering | Speaker and Sponsor components render related records on event pages |
| P0-9 | Mobile-first base layout | Core pages are responsive on mobile and desktop breakpoints |
| P0-10 | Deploy hook operations | Notion automation trigger invokes Vercel deploy hook successfully for editorial publishing |
| P0-11 | Vercel deployment | Production build deploys successfully with functional serverless endpoint |
| P0-12 | Per-page social metadata | Event and blog pages provide unique title/description/image metadata |
| P0-13 | Blog RSS feed | Valid feed served at `/blog/rss.xml` |
| P0-14 | Event status indicators | Event UI distinguishes upcoming, ongoing, and past states |
| P0-15 | Dedicated past events archive page | `/events/past` lists only past published events, sorted most recent first |

### 5.2 Deferred / Future (P2)

| ID | Requirement | Design Consideration |
|----|-------------|---------------------|
| P2-1 | Multi-language support (EN/ES) | Keep routing/content model compatible with future i18n |
| P2-2 | Event sub-pages | Preserve URL structure extensibility (e.g. `/events/[slug]/speakers`) |
| P2-3 | Analytics | Reserve layout slot/integration point for tracking scripts |
| P2-4 | Newsletter archive | Reuse blog infrastructure where practical |
| P2-5 | Attendee directory experience | Revisit Attendees display depth after launch usage data |
| P2-6 | Notion webhook-based auto deploys | Evaluate replacing manual triggers once content cadence increases |

## 6. Success Metrics

### 6.1 Leading Indicators (days to weeks)

| Metric | Target | Stretch | Measurement Method |
|--------|--------|---------|--------------------|
| Time to publish new event page | <= 15 minutes | <= 5 minutes | Timed editorial workflow test |
| Lighthouse mobile performance | >= 90 | >= 95 | Lighthouse run on production build |
| Mailchimp tag accuracy | 100% in sample | - | Manual audit of first 20 submissions |

### 6.2 Lagging Indicators (weeks to months)

| Metric | Target | Measurement Method |
|--------|--------|--------------------|
| Email signups per event | Establish baseline from first two events | Mailchimp reporting |
| Event page bounce rate | < 50% once analytics enabled | Analytics dashboard |
| Content team confidence | "Easier than Framer" qualitative signal | Structured team feedback check-in |

## 7. Open Items

### 7.1 Blocking Decisions (must resolve before launch)

| # | Decision | Owner | Needed By | Status |
|---|----------|-------|-----------|--------|
| 1 | Confirm Mailchimp audience/list ID | Pablo | Before production API testing | Open |
| 2 | Confirm production Notion workspace + database IDs | Pablo | Before production build config | Open |
| 3 | Confirm Slack channel/workflow for deploy notifications | Pablo | Before operational handoff | Open |

### 7.2 Non-Blocking Open Decisions

None currently.

### 7.3 Selected Trigger Policy (v1)

Goal: let non-developers publish updates from Notion without opening a terminal.

| Option | How it works | Pros | Cons | Recommendation |
|---|---|---|---|---|
| A. Manual "Deploy now" button in Notion | Editor clicks a button/automation that calls the Vercel deploy hook | Simple mental model, explicit control, low accidental deploy risk | Requires one manual click after edits | **Selected for v1** |
| B. Automatic deploy on database change | Notion automation triggers deploy whenever selected properties change | Fastest publishing loop, minimal manual steps | Can trigger many deploys, noisy during active editing, harder guardrails | Consider for v2 |
| C. Hybrid (manual for drafts, automatic on publish) | Deploy triggers automatically only when `Status` changes to `Published`; manual trigger still available | Balances control and speed | Slightly more setup complexity | Good upgrade path after v1 |

**v1 decision:** use **Option A** (manual trigger), with editorial guidance: "Edit in Notion -> click Publish Trigger -> verify deploy notification in Slack."  
**Future upgrade path:** move to **Option C** once team behavior is stable and accidental-trigger risk is low.

## 8. Technical Architecture (Summary)

| Layer | Technology |
|-------|-----------|
| Framework | Astro (static-first, islands architecture) |
| CMS | Notion API (`@notionhq/client`) |
| Email | Mailchimp API via serverless function |
| Hosting | Vercel |
| Serverless | Vercel Functions (Node.js) |
| Styling | CSS custom properties + global stylesheet |
| Deploy triggers | Vercel deploy hooks via Notion automation only |
| Slack integration | Notifications only (deploy status/alerts), not trigger control |

**Build pipeline:** `notion.ts` fetches CMS data at build time -> Astro generates static HTML -> Vercel deploys.  
**Runtime code:** only the Mailchimp subscribe function.

## 9. Delivery Plan

| Phase | Duration | Deliverables |
|-------|----------|-------------|
| 1. Scaffold | Complete | Repo structure, docs, schema, baseline architecture |
| 2. Core build | 1-2 weeks | Notion integration, event template, homepage, Mailchimp form, blog |
| 3. Deploy pipeline | 1-2 days | Vercel production deploy + Notion publish trigger + Slack notifications |
| 4. Content + polish | Ongoing | Real content population, responsive QA, typography polish |
| 5. Design layer | Future | Full visual identity pass and advanced component styling |

## 10. Launch Readiness Checklist

- [ ] Production environment variables are set and validated.
- [ ] Notion integration has access to all required databases.
- [ ] Mailchimp audience/list and tag behavior are verified end-to-end.
- [ ] Notion deploy trigger is tested by non-developer users.
- [ ] Slack deploy notifications are delivered to the agreed channel/workflow.
- [ ] Lighthouse mobile performance >= 90 on key templates.
- [ ] Event and blog social metadata validated on representative pages.
- [ ] RSS endpoint validates and includes latest published posts.
