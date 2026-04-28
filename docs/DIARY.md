# Development Diary — Centella Global Website

This is the build log for centellaglobal.com, the website for Centella. Centella works with political leaders and movement builders across the Global South — re-energizing democratic movements, building civic tech, and investing in the next generation of political infrastructure. The site needs to do two things well: capture email addresses for our mailing list, and make it easy to spin up event pages without touching code.

I'm rebuilding the site from scratch using Astro, Notion as the CMS, and Vercel for hosting. This diary tracks the decisions, trade-offs, and progress as we go. Entries are in reverse chronological order.

---

## Entry 14 — April 28, 2026: NGL Barcelona — small Spanish polish, dedicated Programa Piloto slide, English translation

Two passes on the NGL Barcelona deck, picking up from Entry 10.

The first was a small Spanish copy and structure pass. On the cover, "Barcelona / Progressive / Leadership Factory" became "Barcelona: / A Progressive / Leadership Factory" — the colon and the article are tiny moves that pull the reading rhythm into the right shape, and the first version was reading as three nouns rather than as a phrase. Then I split the Programa Piloto sidebar that had been crammed into slide 6 ("Por qué Barcelona") into its own slide (6b). The sidebar was always going to lose a fight for attention with the rest of slide 6, and the program-design specifics deserve their own air. The new slide leads with the cohort claim ("una cohorte internacional de 25 a 50 candidaturas municipales") on the left and three stat cards on the right — Cohorte (25–50), Formación (the three training pillars), Horizonte (documented to scale into 2027). The two-column layout lets the slide be read either as headline-plus-detail or as three independently scannable cards.

Then I built an English translation of the deck — `src/pages/presentations/ngl-barcelona-en.astro`, alongside the Spanish original. I duplicated the file and translated all body copy, slide labels, footers, and the date stamp ("JULIO 2026" → "JULY 2026"). The cover slide label changes from "Portada" to "Cover"; the deck `lang` attribute on the Presentation layout flips from `"es"` to `"en"`. Everything else — typography, layout, deck-stage scaling, standalone export — comes for free from the page-as-deck convention.

The thing I want to remember: when a deck needs a translation, the path of least resistance is "duplicate the file, suffix with `-en`, and translate strings inline" — not introducing an i18n abstraction. Decks are leaf documents, the cost of two files is low, and any attempt to share strings across files would force the deck markup into a shape it isn't designed for. If translations later proliferate (more languages, multiple decks), revisit. For now, two files is the right answer, and the standalone export pipeline (`npm run deck:standalone -- ngl-barcelona-en`) just works.

---

## Entry 10 — April 27, 2026: NGL Barcelona deck — content pass and a fix that turned out to be infrastructure

Today I sat with the NGL Barcelona deck and worked through it. Most of what I changed was small — the kind of polish you only see when you read the deck out loud. But two of the changes were structural enough that they're going to outlive this deck.

### The eyebrows had to go

Every content slide had a small uppercase coral label above its headline — "CONTEXTO · 2026", "EL PROGRAMA", "CRONOGRAMA OPERATIVO." They were doing the work of a section index, but they were also competing with the headlines for attention and adding a visual layer the deck didn't need. I had the agent strip them across all 15 slides — twelve `.eyebrow-tag` spans, two `.num` section labels, one `.q-attr` quote attribution. The card-level mini-eyebrows inside the column patterns stayed because those *are* labels for their cards, not for the slide. The deck reads cleaner now: one chrome row, one headline, one body. Less choreography.

### Tres condiciones, on one line

Slide 3 — "Barcelona: La única plaza europea con las **tres condiciones** alineadas." — was the one that triggered the real fix. We added "Barcelona:" to the front, dropped the manual `<br>` tags so the headline could flow, widened the title column from `1fr 1fr` to `1.55fr 1fr`, and wrapped "tres condiciones" in `white-space: nowrap` so the two-word gradient phrase never split. Standard typesetting moves.

But then I noticed content getting clipped at the bottom of the viewport. That wasn't a slide-3 problem. That was a *deck* problem.

### The scaler wasn't actually scaling

The deck-stage web component was supposed to render the canvas at its authored size (1920×1080) and scale-to-fit. Instead the `_fit()` method had been quietly stretching the canvas to whatever viewport CSS pixels it found. So content sized in absolute px against the 1920×1080 grid would clip on any viewport shorter than 1080, which is most of them. I replaced `_fit()` with proper letterbox scaling: keep the canvas at design size, apply `transform: scale(min(vw/dw, vh/dh))`, let bars appear on the short axis. Now the entire slide always fits — height adapts as readily as width — and I never have to think about it again. The `noscale` attribute still works for the PPTX exporter that wants unscaled DOM geometry.

This is the kind of bug that only surfaces when you push the layout. If I hadn't widened the slide-3 column and made the headline a touch taller, I might never have noticed. A small content change exposed a quiet infrastructure failure that would have bitten every future deck.

### Sendable in one file

The other thing the deck needs is to be sendable. Hosting it at `/presentations/ngl-barcelona/` is great, but sometimes a recipient wants to download the deck and forward it, or open it on a plane. So I added `scripts/inline-deck.mjs` and `npm run deck:standalone -- <slug>`. It runs `astro build`, then walks the built HTML and inlines every external dependency: all 138 woff2 fonts as base64, the institute logo SVG, the cover poster WebP, the entire stylesheet folded into a `<style>` tag. The MP4 `<source>` tags get stripped — the poster carries the cover, and I don't want to base64 a megabyte of video. Output for NGL Barcelona is 2.3MB and opens by double-clicking in any browser. No network, no external assets, no dependencies. That's the format I'll send.

### Copy nits

Slide 2: "La legitimidad cede cuando eficacia e integridad se separan." → "La legitimidad cede cuando *la* eficacia e integridad se separan." Tiny, but the article makes it scan.

Slide 3: "La única plaza europea..." → "Barcelona: La única plaza europea..." The original assumed the audience already knew the deck was about Barcelona. The new version states it.

### What I'm taking forward

The eyebrow strip and the column widening are deck-specific. The letterbox scaler and the standalone export are platform features now — anything I drop into `src/pages/presentations/` gets both for free. That's the leverage I was hoping for when I made decks first-class Astro pages yesterday. One day later, the second deck will already be cheaper to build than the first.

---

## Entry 9 — April 26, 2026: Decks become first-class pages

Four days ago I told future-me — in this diary, in `CLAUDE.md`, in the rule against touching `presentations/` — that the NGL Barcelona deck was a local scratch artifact and the build had no business knowing about it. Today I reversed that. The reasoning was simple once I said it out loud: if I ever want to send someone a link to the deck, it has to live at a URL. A folder on my laptop is not a URL.

So the deck is now a first-class Astro page at `/presentations/ngl-barcelona/`. The mechanics:

- New `Presentation.astro` layout — minimal full-bleed shell, no `SiteHeader`, no `SiteFooter`. Decks own the viewport. The site chrome would only fight the design.
- The deck itself is one `.astro` file at `src/pages/presentations/ngl-barcelona.astro`. Three `<style>` blocks marked `is:global` so Astro doesn't scope-rewrite the CSS, five `<script>` blocks marked `is:inline` so it doesn't try to bundle them. The deck has its own internal scaler, web component, and edit-mode hooks — the Astro toolchain doesn't need to be clever about any of it.
- Fonts and the institute logo moved from `presentations/ngl-barcelona/assets/` to `public/presentations/ngl-barcelona/assets/`. URLs rewritten to absolute paths so they resolve regardless of trailing-slash behavior.

I updated `CLAUDE.md` so the directory tree shows `Presentation.astro` and the new `src/pages/presentations/[slug].astro` slot, and replaced the old "don't touch `presentations/`" rule with the actual convention: where decks live, where their assets live, what directives the inline `<style>`/`<script>` blocks need. `design.md` and `MEMORY.md` got the same treatment so the agent and the human reading either file see the same story.

Build is green. The whole deck — 138 woff2 files and all — comes through the build at 12ms because it's just static assets and one templated HTML page. The deck reaching production is a one-line Vercel deploy away.

The lesson, mostly for me: when I write a "don't touch this" rule for an agent, I should ask whether I'm protecting a real boundary or just deferring a decision. This one was deferred. Now it isn't.

---

## Entry 8 — April 22, 2026: README catches up with the repo

Quick one. I noticed the README was still describing this project as if it were a two-section site — events and blog — with a note about Mailchimp on top. That was true three entries ago. Since then I've added the three pillar pages (`/centella-advisory`, `/centella-institute`, `/centella-impact`), a `/styleguide` route that mirrors what `design.md` documents, and `design.md` itself has grown from "some tokens" into a full design system the agent reads before it styles anything. The README hadn't heard any of that news.

So I rewrote the overview to actually describe what the site is: a Global-South-facing org site with a homepage, three pillar pages, events, blog, and a living styleguide, all statically rendered from Notion at build time. I filled in the repo-layout section with the routes that were missing, the layouts, the real component list, and the `mailchimp.ts` helper and `optimize-hero-media.sh` script that had been quietly doing work without getting credit. I also fixed the `design.md` line so a newcomer doesn't read "visual tokens and UI rules" and think it's a tiny file.

While I was in there, I tightened up `CLAUDE.md` too. The `src/pages/` tree in the structure section was missing `styleguide.astro`, and I added a new "Things to avoid" bullet: the `presentations/` directory at the repo root is an untracked local scratch folder — the NGL Barcelona deck lives there — and future-me (human or agent) should not try to wire it into the build or reference it from `src/`. It's ignored on purpose.

No code changed. This was a docs-drift pass.

---

## Entry 7 — April 18, 2026: Display hero type, gradient accents that actually clip, and docs in sync

I put the homepage hero headline on the real `.display` rail — Barlow Condensed light at the big fluid size — and wrapped the phrases I care about in `.display__accent` so the 300 vs 800 contrast reads the way the brand spec intended. I did not want every accent stuck on violet→coral forever, so I wired all six approved `--grad-*` tokens to explicit modifier classes and added an optional `data-random-accent-gradient` hook: a tiny inline script at the end of `Base.astro` picks one gradient per marked span on each load. No island, no bundle — just class toggles after the DOM exists.

Immediately after, the hero looked wrong: gradient blocks behind letters instead of color inside the glyphs. I had used the `background` shorthand on the variant rules, which resets `background-clip` away from `text`. Switching those fills to **`background-image`** keeps the clip rules intact; problem gone.

I refreshed `design.md`, `CLAUDE.md`, `MEMORY.md`, and this diary so the machine-readable spec and agent entry points match what shipped. Ran a full `npm run build` before commit.

---

## Entry 6 — April 17, 2026: Unifying chrome, fixing nav state, and shipping pillar pages

I standardized the site shell so every route now uses the same header and footer as the homepage. Instead of maintaining separate chrome patterns, I extracted the homepage behavior into shared `SiteHeader` and `SiteFooter` components and wired them into `Base.astro`. That means blog pages, event pages, styleguide, and the new pillar pages all run through one global navigation experience.

I also added the new homepage section below Latest event with the three vertical pillar panels (advising leaders, building networks, investing in tech), then created the CTA destinations at `/centella-advisory`, `/centella-institute`, and `/centella-impact` with the exact panel title/body copy.

There was one regression after the header extraction: the menu looked permanently open. Root cause was simple — the menu container had `display: flex`, which overrode the native `[hidden]` behavior. I fixed it by explicitly adding `.site-header__menu[hidden] { display: none; }` so closed state is reliable.

I cleaned up icons to match repo policy (no ad hoc new icon files), documented that rule in `design.md`, and updated the rest of the docs so the next session sees the real current architecture instead of the older `hideChrome` split model.

---

## Entry 5 — April 16, 2026: A homepage that stops selling and a hero that respects the wire

I stripped the homepage down to what I actually want people to see right now: navigation with the logo and real links, one hero line about what Centella does, a single “latest event” pulled from Notion with a straight link to the event page, and the same links in the footer. No manifesto sections, no extra components, no duplicate global chrome — `hideChrome` on the layout so I'm not rendering Nav and Footer twice.

The hero had picked up a full-screen background video, which looked good on my connection but was the wrong default for a lot of the audience I care about. So I treated the video as optional: there's always a WebP poster behind the headline (fast first paint), and the MP4 only loads after a tiny inline script checks `prefers-reduced-motion` and, when the browser exposes it, `navigator.connection` — if you're on save-data or a tagged slow connection, you never pay for the bytes. I re-encoded what we ship into 540p and 720p variants and dropped the seven-megabyte master from the repo; if I need to re-cut the loop, I run `npm run media:hero` against a file on disk and commit the new outputs.

I updated `CLAUDE.md`, `docs/MEMORY.md`, and this diary so the next session (human or model) doesn't have to reverse-engineer that from the diff.

---

## Entry 4 — April 16, 2026: PRD consistency pass and decision lock-in

I did a full consistency pass across the PRD and aligned the rest of the repo docs to match it. The big shift is that deploy triggering is now explicitly Notion-only for v1: manual "Deploy now" from Notion automation, with Slack reserved for notifications instead of control.

I also locked two scope decisions that were previously open: (1) blog schema will support multiple authors, and (2) we're adding a dedicated past events archive at `/events/past`. Those decisions are now reflected in the requirements and no longer treated as open questions.

Finally, I updated `CLAUDE.md` and `MEMORY.md` so they stop contradicting the PRD. That should reduce drift going forward, especially when we prompt against docs as source of truth.

---

## Entry 3 — April 14, 2026: Writing the design spec the machine will actually read

I added a `design.md` file to the root of the repo today. On the surface it looks like a design system doc — colors, type scale, spacing, components, the usual. But the reason it exists is a little more specific than that: it's a spec written for Claude Code to read, not for a human designer to skim.

Here's the problem I kept running into. I've been building this site with Claude as my pair, and every time I'd ask it to style a new component, it would reach for whatever looked reasonable. Tailwind defaults. Random hex values that were "close enough" to the brand palette. Arbitrary border radii. One time it gave me a primary button with a 4px radius and a 12px radius in the same view, because the two sections of code didn't know about each other. The tokens existed in `global.css`, but CSS variables alone don't tell you *when* to use what. They're a vocabulary, not a grammar.

So I wrote the grammar down. `design.md` takes everything on the `/styleguide` page — which itself was built from our Notion brand guidelines — and restructures it in a format an LLM can parse and apply deterministically. Every color has a token, a hex, and a role. Every component spec lists the exact states (hover, focus, active, disabled) with the exact values. The rules from the brand guide that don't fit neatly into tokens — "don't mix more than two color families," "panel radii must be 4, 8, or 16," "Barlow Condensed for action, Barlow Regular for gravity" — are written down as prose Claude can reason about.

Then I added a short block to `CLAUDE.md` telling Claude to always consult `design.md` before generating UI, to use only values defined there, and to match states to the documented patterns. That's the part that makes the whole thing work. The spec is only useful if the agent knows to look at it.

It's a small thing, but it feels like the right move for a codebase that's going to be evolved mostly through prompts. The brand guide in Notion is the source of truth for *what we believe about the brand*. `design.md` is the source of truth for *how that belief gets expressed in code*. Two different jobs, same underlying system. And now when I ask for a new component, I get one that belongs to the rest of the site instead of one that was invented on the spot.

---

## Entry 2 — April 14, 2026: First successful build

Got the full site building from Notion today. The dev server starts, the homepage renders, and when I add a test event to the Notion database with Status set to "Published" and the Featured checkbox checked, it shows up on the homepage. That's the core loop working: edit in Notion, see it on the site.

The setup was more plumbing than I expected. SSH keys for GitHub (my MacBook didn't have one — first time setting up a fresh dev environment on this machine in a while), Node version too old for Astro 5, dependency version conflicts between the Vercel adapter and TypeScript. The kind of stuff that eats an afternoon if you're not paying attention, but it's all resolved now.

The Notion databases are live — Events, Blog Posts, Speakers, Attendees, and Sponsors, all under a "Website CMS" page. Events has relations to the other three people/org databases, so linking a speaker to an event is just picking from a dropdown in Notion. The content team won't need to learn anything new.

One thing I'm keeping in mind: these databases are in my personal Notion workspace right now. The plan is to migrate to the Centella corporate account before the site goes into real production use. The architecture handles this cleanly — every database ID and the API key come from environment variables, so migration is just "recreate the integration, duplicate the databases, update the `.env` file." No code changes. But I want to make sure we don't accumulate a bunch of content in the personal workspace that then needs to be manually moved. The beta testing phase should stay short.

The Notion file URL expiration issue is worth flagging here too. When you upload an image to a Notion database (say, a speaker photo), the URL Notion gives you through the API is temporary — it expires after an hour. For a static site that rebuilds on deploy, that's fine: we fetch the URLs at build time and they're valid for the life of that build. But it means we can't cache images across builds, and if a build takes unusually long, URLs could expire mid-build. Something to watch for, but not a problem yet.

What's next: get Mailchimp wired up, deploy to Vercel, and set up the deploy workflow so the content team can trigger rebuilds directly from Notion. Then we start putting real content in.

---

## Entry 1 — April 14, 2026: Why we're leaving Framer

The current site is on Framer, and it's been fine for what it is — but it's creating friction in the two places that actually matter. Every time we run an event, someone has to manually build the event page in Framer. That means layout work, copy-pasting speaker bios, fiddling with responsive breakpoints. For an organization that runs at least four events a year, each with speakers, schedules, sponsors, and registration links, that's a lot of manual labor that should be automated.

The other pain point is email capture. We use Mailchimp, and wiring up forms in Framer to feed into Mailchimp with the right tags — so we know which event or page a signup came from — is more friction than it should be.

Here's what I keep coming back to: the content team already lives in Notion. Every event gets planned in Notion, speaker lists get assembled in Notion, schedules get drafted in Notion. But then someone has to take all that and manually recreate it in Framer. That's the problem. The workflow should be: edit in Notion, hit a button, site rebuilds.

So that's what we're building. Astro as the framework — static-first, which means the site loads fast even on spotty connections in the Global South, where most of our audience is. Notion as the CMS via the Notion API, which means the content team's workflow doesn't change at all. Vercel for hosting, because the serverless functions we need for the Mailchimp integration just work there with zero config.

The architecture decisions were mostly straightforward. Astro over Next.js because we don't need server-side rendering — this is a content site, not a web app. The only thing that needs JavaScript is the email signup form, and Astro's islands architecture means we can ship that one interactive component without loading a JS framework for the whole page. Notion over a "real" headless CMS because the team is already there — any tool that requires a separate interface is a non-starter.

The interesting decision was around event schedules. We could build a separate Notion database for schedule items — time slots, session titles, speakers per session — and that would let us do things like "show all panels across all events." But that's a lot of schema complexity for a feature nobody's asked for. Instead, the schedule lives in the event's Notion page body. The content team writes it using Notion's native editor — headings for time slots, lists for sessions — and the site renders it as HTML. If we need queryable schedule data later, we add a database then. Simpler now wins.

We also added a blog section and an Attendees component. The blog gives Centella a place to publish thinking and updates beyond events — something the site was missing. Attendees are distinct from speakers: they're the notable people in the room, the "who's going" social proof that makes events feel worth attending. They get their own Notion database with the same shape as speakers.

For deploys, we're setting up a manual Notion-triggered workflow, with Slack reserved for deployment notifications. Nobody should need terminal access to publish a page.

What's next: setting up the Notion databases, building the data-fetching layer, and getting the first event page rendering from real content. The scaffolding is done — now we build.
