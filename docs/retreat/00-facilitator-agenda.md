# Centella Team Retreat — Cowork Teach-In: Facilitator Agenda

**Audience.** Centella core team, mostly non-technical. First time meeting in person.
**Format.** One half-day block, ~3.5 hours including breaks.
**Goal.** By the end of the session, every team member can:

1. Open a Cowork session inside the Centella repo on their laptop.
2. Trace where any piece of the website or a client deliverable lives in the repo.
3. Edit website content in Notion and trigger a deploy.
4. Ask Cowork to build, preview, and publish a presentation deck end to end.

This is the **facilitator's run-of-show**. Two companion docs ship with it:

- `01-pre-retreat-prep.md` — send to the team **at least 7 days before** the retreat. Covers account creation and app installs that have to happen on home/office WiFi before they fly.
- `02-hands-on-workbook.md` — give to the team at the start of the session. They follow it live with you, then keep it as a reference after.

---

## 0. Pre-flight (you, the day before)

A teach-in dies fast if the demo machine fumbles. Walk through this the night before:

- [ ] Pull `main` on your machine and run `npm run dev` to confirm the site builds cleanly.
- [ ] Run `npm run share:build` and confirm `share/` regenerates without errors.
- [ ] Check that the Vercel project is healthy and the latest deploy is green (`centella-global.vercel.app`).
- [ ] Confirm the Notion publish trigger fires a Vercel deploy hook successfully — do one round trip.
- [ ] Have the GitHub repo URL, the Vercel project URL, the Notion workspace URL, and the Mailchimp dashboard URL pinned in a tab group.
- [ ] Make sure the projector / screen share resolution is at least 1440×900 — decks render at 1920×1080 and you want them to letterbox cleanly.
- [ ] Print or PDF the **pre-retreat prep doc receipts** — for each teammate, a one-page sheet with their GitHub username, Notion email invite confirmation, and Claude account status checked off. Anyone with gaps gets caught Day -1, not in the session.
- [ ] Prepare a **shared parking lot** doc (a Notion page or a shared Apple Note) for questions you'll defer rather than rabbit-hole on.

---

## 1. Opening and framing — 15 min

**Goal:** set expectations, lower the stakes, name the mental model.

**Talking points:**

- This is a working session, not a lecture. Nobody is expected to memorize commands. Cowork does the technical work; the team's job is to know **where things live** and **what to ask for**.
- Centella's website is unusual in that there's no separate CMS interface, no Webflow, no Squarespace. Content lives in **Notion**. Code lives in **GitHub**. Both feed into a published site at `centellaglobal.com` (currently `centella-global.vercel.app`). Everything in between is automation.
- Client work — decks, brochures, one-pagers — also lives in this repo, in `work/` and `share/`. So the same tools that publish the website also publish what we send to clients.
- Cowork is the **bridge**. It's the app on their laptop that opens the repo, talks to Claude, and runs the things they don't need to learn to type.

**Draw this on a whiteboard or a slide:**

```
   NOTION  ─────►  GitHub repo  ─────►  Vercel  ─────►  centellaglobal.com
   (content)       (code + content       (build &        (live site)
                    snapshots)            deploy)

           ▲                  ▲
           │                  │
        team edits         Cowork (Claude)
        directly           drives commits,
        in Notion          deck builds, etc.
```

**Anti-pattern to address explicitly:** "I'll wait for Pablo to do it." The whole point of this setup is that the content team can publish without engineering being in the loop. Name that out loud.

---

## 2. Initial setup walkthrough — 60 min

**Goal:** every laptop in the room is connected, signed in, and able to open the repo in Cowork.

This is the highest-risk segment. Plan for one or two people to hit a snag (2FA on GitHub, Notion invite to wrong email, slow installer). Have the workbook open on the projector and walk through it page by page, pausing at each checkpoint.

### 2a. Verify the prep checklist (10 min)

Round-robin: each teammate confirms they have ✓ accounts created (GitHub, Claude, Notion access), ✓ Claude desktop app installed, ✓ a working laptop with at least 5GB free disk space.

If anyone has gaps, pair them with someone whose setup is complete and continue. Don't stall the room.

### 2b. Cloning the repo via Cowork (20 min)

Live demo from your machine first, then everyone follows.

1. Open the Claude desktop app.
2. Switch to **Cowork mode**.
3. Click **Connect a folder** and pick a fresh location (`~/Documents/Centella` is a good default).
4. Ask Claude in chat: *"Clone the centella-global GitHub repo into this folder."*
5. Claude will use the bash tool, run `git clone`, and confirm.
6. Run `npm install` (Claude can do this too).

**Watch for:** people picking the wrong folder, people on slow WiFi, people whose macOS Gatekeeper blocks Node.

### 2c. First connection test (15 min)

Have everyone ask Claude: *"What's in the share/ directory? Show me a list."* This is the smoke test — if Claude can list files in the repo, the connection works.

Then: *"What's the Centella website built with?"* Claude reads `CLAUDE.md` and answers. This proves Claude is reading the project memory, not making things up.

### 2d. Connecting connectors (15 min)

Walk through enabling these Cowork connectors. Each takes ~30 seconds once the team account is set up:

- **GitHub** — for commits and pull requests
- **Notion** — for reading and editing the CMS databases
- **Google Calendar / Gmail** — optional, for retreat planning and follow-ups
- **Vercel** — to inspect deploys

**Demo:** ask Claude *"What's the latest deploy on Vercel?"* and *"Find the Events database in Notion."*

**Break — 10 min.**

---

## 3. Repo tour — 45 min

**Goal:** team can name what's in each top-level directory and explain why it's there.

Open the repo's `CLAUDE.md` on screen. Walk the directory tree from the top with Cowork open in a side panel — when you mention `src/pages/`, ask Claude *"What pages are in src/pages?"* and let it answer in real time. This reinforces that **the team doesn't need to memorize the structure — they can ask.**

### 3a. The website side (20 min)

Walk through each in order. For each, name:
1. What lives there.
2. Who edits it (engineering vs. content vs. nobody, it's auto-generated).
3. What it produces in the live site.

| Folder | What's there | Who edits |
|--------|--------------|-----------|
| `src/pages/` | URL routes — homepage, events, blog, presentations | Engineering only |
| `src/components/` | Reusable building blocks — header, footer, cards | Engineering only |
| `src/layouts/` | Page shells — `Base.astro` for site, `Presentation.astro` for decks | Engineering only |
| `src/lib/` | Notion + types | Engineering only |
| `public/` | Static assets — images, fonts, hero video | Engineering, sometimes content for events |
| `api/subscribe.ts` | Mailchimp signup endpoint | Engineering only |
| `docs/` | PRD, MEMORY (decision log), DIARY (work log) | Pablo + Claude, mostly |

Key beat: **content does not live in the repo.** Event pages, blog posts, speaker bios — none of it is in any file you can see. It's all pulled from Notion at build time.

### 3b. The client work side (15 min)

This is what makes Centella's repo unusual. Most websites are just websites. Ours is also where client deliverables live.

| Folder | What's there |
|--------|--------------|
| `work/` | Per-project working folders — briefs, drafts, notes, mockups. Not deployed. Currently has `prime-movers-20th/` for Hunt Alternatives. |
| `work/<project>/mockups/` | The shareable subset — what gets published. Self-contained HTML files. |
| `share/` | The publish tray. Anything here ships at `centella-global.vercel.app/share/<filename>`. |
| `src/pages/share/presentations/[slug].astro` | First-class Astro decks (NGL Barcelona). These ship at `/share/presentations/<slug>/`. |

Show this concretely:

- Open `share/presentations/ngl-barcelona-en-standalone.html` on the live site (`/share/presentations/ngl-barcelona-en-standalone.html`) — a single-file deck with everything inlined, perfect for emailing.
- Open `share/work/prime-movers-20th/index.html` on the live site — the four-direction comparison page for the brochure.

Name the rule out loud: **"if it lands in `share/`, anyone with the URL can see it."** Treat that folder accordingly. The flip side: dropping a file into `share/` is the fastest way to get a sharable URL for a client.

### 3c. The "where do I look first" cheat sheet (10 min)

End the tour by giving the team three Cowork prompts to pin in their notes:

1. *"What's the structure of this repo? Read CLAUDE.md and summarize."*
2. *"Where would I add a new event? Trace the path from Notion to the live page."*
3. *"What's the difference between `public/`, `share/`, and `work/`?"*

These are evergreen — the team can ask them on any future session and Claude will pull the current answer from the repo.

**Break — 10 min.**

---

## 4. Editing the website through Notion — 40 min

**Goal:** team can publish a real event, blog post, or speaker without touching code.

### 4a. The five databases (10 min)

Open the Notion workspace on the projector. Walk through each:

- **Events** — Status (Draft / Published / Archived), Featured flag, slug, dates, hero image, registration URL, Mailchimp tag. Page body is the description and schedule.
- **Blog Posts** — Title, Slug, Status, Date, Authors, Tags, Summary, Hero. Page body is the post.
- **Speakers** / **Attendees** / **Sponsors** — name, role, org, photo, bio. Linked to Events via relations.

Key rule: **only `Status = Published` shows up on the site.** Drafts are invisible.

### 4b. Live walkthrough — publish a test event (20 min)

Use a sandbox event you create on the spot.

1. Duplicate an existing event row in the Events database.
2. Change the title to "Test Retreat Event" and the slug to `test-retreat`.
3. Set Status to `Published`.
4. Click the **Publish to website** button (the Notion automation that hits the Vercel deploy hook).
5. Wait for the Slack notification — show the team where it lands.
6. After 90 seconds, navigate to `centella-global.vercel.app/events/test-retreat` — there it is.
7. Set Status back to `Draft`, click **Publish to website** again, refresh — 404.

Name the trade-off: every publish triggers a full rebuild. That's by design (faster reads, simpler architecture). Don't click the button twenty times in a row "just to be sure."

### 4c. The things content can't do, and why (10 min)

- **Can't change site navigation** — that's in code (`SiteHeader.astro`). File a request.
- **Can't add new sections to the homepage** — same.
- **Can't change the URL structure** — slugs change page URLs, but `/events/`, `/blog/`, `/share/presentations/` are fixed.
- **Can't add a new database type** — if we need a new entity (e.g. "Partners"), engineering has to wire it up.

Frame these not as restrictions but as guard-rails — they're what makes the system reliable.

---

## 5. Editing and publishing presentations through Cowork — 40 min

**Goal:** team can take a deck request, produce a standalone HTML file, and ship it to a client.

This is the part that's hardest to teach without a real example, so we use NGL Barcelona as the case study.

### 5a. Two kinds of decks (5 min)

- **First-class decks** live at `src/pages/share/presentations/[slug].astro`. They get a URL on the site (`/share/presentations/<slug>/`) AND can be exported as a single-file standalone (`/share/presentations/<slug>-standalone.html`). NGL Barcelona is the model.
- **Client mockups** live in `work/<project>/mockups/`. They're already self-contained HTML; `npm run work:build` copies them into `share/work/<project>/`. The Prime Movers brochure is the model.

Pick the one that fits: if it needs to live as a URL on the site long-term, it's a first-class deck. If it's a one-shot mockup or proposal, it's a `work/` project.

### 5b. Live demo: edit a deck through Cowork (20 min)

Open the Spanish NGL Barcelona deck on screen. Have Claude make a small visible edit live:

> *"Open `src/pages/share/presentations/ngl-barcelona.astro`. Find the cover slide title and add a subtitle line below it that says 'Versión revisada — abril 2026'. Show me the diff before saving."*

Claude reads the file, locates the cover, proposes the edit. Approve it. Then:

> *"Run `npm run dev` in the background and tell me when the deck preview is ready. I want to see it at /share/presentations/ngl-barcelona/."*

Show the preview live. Walk through how the deck-stage web component letterboxes the canvas — resize the browser window so the bars on the short axis are visible. This is a reassuring demo: *the deck never clips, no matter the screen.*

### 5c. Live demo: ship the standalone (10 min)

> *"Bundle the English NGL Barcelona deck as a standalone HTML file. Run `npm run deck:standalone -- ngl-barcelona-en`."*

Claude runs the command. Result lands at `share/presentations/ngl-barcelona-en-standalone.html`. Open it in the browser by double-clicking — proves it works without any server.

Then:

> *"Commit the regenerated standalone with the message 'rebuild ngl-barcelona-en standalone' and push to main."*

Claude commits and pushes. Vercel builds. After 90 seconds, the new file is live at `centella-global.vercel.app/share/presentations/ngl-barcelona-en-standalone.html`.

That's the whole client-deck loop. End to end. No CLI typed by anyone in the room except Claude.

### 5d. The "before we share with a client" checklist (5 min)

Pin this as a Cowork prompt:

> *"Before I send this deck to a client, run through the checklist: standalone bundle is regenerated, share/ is committed, latest Vercel deploy is green, the URL loads in an incognito window."*

Have Claude actually run that checklist on the spot, so the team sees what it looks like.

---

## 6. Wrap-up and Q&A — 20 min

### 6a. What we covered (3 min)

Quick verbal recap. Don't go deep — they have the workbook.

### 6b. The three things that will trip you up (5 min)

Name them explicitly:

1. **"Did the deploy actually go out?"** — Always check the Slack channel for the deploy notification, or ask Claude *"What's the latest Vercel deploy status?"* before assuming a Notion publish landed.
2. **"My deck looks different on the live site than locally."** — Standalone bundles are committed snapshots. If you don't run `npm run deck:standalone` and commit before publishing, the live `/share/` deck is out of date. Ask Claude to check: *"Is share/ in sync with the source decks?"*
3. **"I can't find the file in the repo."** — Probably because it's in Notion, not the repo. The site has almost no content in code. When in doubt, search Notion first.

### 6c. Open questions and parking lot (7 min)

Run through the parking lot doc. Anything that needs a follow-up gets an owner and a date.

### 6d. What to do tomorrow (5 min)

Give each teammate a homework assignment for the next 48 hours:

- One person publishes a draft blog post end-to-end.
- One person duplicates an event and shipped a test version.
- One person edits a sentence in NGL Barcelona, rebuilds the standalone, and shares the URL in the team channel.

These exercises are the difference between "I sat through a teach-in" and "I can do this on my own."

---

## Materials checklist

- [ ] Projector / screen share with at least 1440×900 resolution.
- [ ] HDMI / USB-C dongle that fits your laptop.
- [ ] Whiteboard or large notepad for the data-flow diagram.
- [ ] Printed copies of the workbook (one per teammate, optional but nice).
- [ ] Backup WiFi hotspot in case venue WiFi flakes.
- [ ] Snacks and coffee — three hours is long.
- [ ] Pre-retreat prep receipts for each teammate.
- [ ] A test event row in Notion you can publish during the demo.
- [ ] A throwaway branch on `main` you don't mind committing junk to during demos (or just commit to `main` if it's your repo, your retreat).

---

## If you have less than 3.5 hours

**2 hours:** drop §3c (the cheat sheet — they can read it later) and §5b (just demo §5c — the publish loop is the load-bearing part). You'll lose some understanding of *why* the structure is the way it is, but they'll still be able to do the work.

**1 hour:** skip §2c–d and §3, just do §2a–b (get them connected) plus §4 (Notion editing) plus §5c (publish a deck). You're teaching the happy paths only — and that's fine for an intro session.

---

## After the retreat

Within a week, do a 30-minute follow-up call to surface what didn't stick. The questions you hear in that call are the seed for v2 of this workbook.
