# Development Diary — Centella Global Website

This is the build log for centellaglobal.com, the website for Centella. Centella works with political leaders and movement builders across the Global South — re-energizing democratic movements, building civic tech, and investing in the next generation of political infrastructure. The site needs to do two things well: capture email addresses for our mailing list, and make it easy to spin up event pages without touching code.

I'm rebuilding the site from scratch using Astro, Notion as the CMS, and Vercel for hosting. This diary tracks the decisions, trade-offs, and progress as we go. Entries are in reverse chronological order.

---

## Entry 2 — April 14, 2026: First successful build

Got the full site building from Notion today. The dev server starts, the homepage renders, and when I add a test event to the Notion database with Status set to "Published" and the Featured checkbox checked, it shows up on the homepage. That's the core loop working: edit in Notion, see it on the site.

The setup was more plumbing than I expected. SSH keys for GitHub (my MacBook didn't have one — first time setting up a fresh dev environment on this machine in a while), Node version too old for Astro 5, dependency version conflicts between the Vercel adapter and TypeScript. The kind of stuff that eats an afternoon if you're not paying attention, but it's all resolved now.

The Notion databases are live — Events, Blog Posts, Speakers, Attendees, and Sponsors, all under a "Website CMS" page. Events has relations to the other three people/org databases, so linking a speaker to an event is just picking from a dropdown in Notion. The content team won't need to learn anything new.

One thing I'm keeping in mind: these databases are in my personal Notion workspace right now. The plan is to migrate to the Centella corporate account before the site goes into real production use. The architecture handles this cleanly — every database ID and the API key come from environment variables, so migration is just "recreate the integration, duplicate the databases, update the `.env` file." No code changes. But I want to make sure we don't accumulate a bunch of content in the personal workspace that then needs to be manually moved. The beta testing phase should stay short.

The Notion file URL expiration issue is worth flagging here too. When you upload an image to a Notion database (say, a speaker photo), the URL Notion gives you through the API is temporary — it expires after an hour. For a static site that rebuilds on deploy, that's fine: we fetch the URLs at build time and they're valid for the life of that build. But it means we can't cache images across builds, and if a build takes unusually long, URLs could expire mid-build. Something to watch for, but not a problem yet.

What's next: get Mailchimp wired up, deploy to Vercel, and set up the deploy hooks so the content team can trigger rebuilds from Slack and Notion. Then we start putting real content in.

---

## Entry 1 — April 14, 2026: Why we're leaving Framer

The current site is on Framer, and it's been fine for what it is — but it's creating friction in the two places that actually matter. Every time we run an event, someone has to manually build the event page in Framer. That means layout work, copy-pasting speaker bios, fiddling with responsive breakpoints. For an organization that runs at least four events a year, each with speakers, schedules, sponsors, and registration links, that's a lot of manual labor that should be automated.

The other pain point is email capture. We use Mailchimp, and wiring up forms in Framer to feed into Mailchimp with the right tags — so we know which event or page a signup came from — is more friction than it should be.

Here's what I keep coming back to: the content team already lives in Notion. Every event gets planned in Notion, speaker lists get assembled in Notion, schedules get drafted in Notion. But then someone has to take all that and manually recreate it in Framer. That's the problem. The workflow should be: edit in Notion, hit a button, site rebuilds.

So that's what we're building. Astro as the framework — static-first, which means the site loads fast even on spotty connections in the Global South, where most of our audience is. Notion as the CMS via the Notion API, which means the content team's workflow doesn't change at all. Vercel for hosting, because the serverless functions we need for the Mailchimp integration just work there with zero config.

The architecture decisions were mostly straightforward. Astro over Next.js because we don't need server-side rendering — this is a content site, not a web app. The only thing that needs JavaScript is the email signup form, and Astro's islands architecture means we can ship that one interactive component without loading a JS framework for the whole page. Notion over a "real" headless CMS because the team is already there — any tool that requires a separate interface is a non-starter.

The interesting decision was around event schedules. We could build a separate Notion database for schedule items — time slots, session titles, speakers per session — and that would let us do things like "show all panels across all events." But that's a lot of schema complexity for a feature nobody's asked for. Instead, the schedule lives in the event's Notion page body. The content team writes it using Notion's native editor — headings for time slots, lists for sessions — and the site renders it as HTML. If we need queryable schedule data later, we add a database then. Simpler now wins.

We also added a blog section and an Attendees component. The blog gives Centella a place to publish thinking and updates beyond events — something the site was missing. Attendees are distinct from speakers: they're the notable people in the room, the "who's going" social proof that makes events feel worth attending. They get their own Notion database with the same shape as speakers.

For deploys, we're setting up manual triggers in both Slack and Notion — the team splits between those two tools, and nobody should need terminal access to publish a page. Both hit the same Vercel deploy hook.

What's next: setting up the Notion databases, building the data-fetching layer, and getting the first event page rendering from real content. The scaffolding is done — now we build.
