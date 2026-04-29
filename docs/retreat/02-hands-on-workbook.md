# Centella Cowork Hands-On Workbook

**For:** Centella team members at the retreat teach-in.
**Use during the session.** Keep after as a reference.

This workbook is the step-by-step. Wherever you see a checkbox, do the thing and tick it off as you go. Wherever you see a **prompt** in italics like *"do this thing"*, type it (or a close paraphrase) into Claude in Cowork.

If you fall behind, don't panic. Tap the person next to you and catch up on the next break. The session is paced to the slowest laptop, not the fastest.

---

## Part 1 — Setup (you should be here when the session starts)

### 1.1 Open Cowork

- [ ] Open the Claude desktop app on your laptop.
- [ ] Switch to **Cowork mode** (top-left mode picker, or the keyboard shortcut shown in the menu).
- [ ] You should see an empty Cowork session.

### 1.2 Connect a folder for Centella

Cowork works inside a folder on your computer. We're going to create a fresh one for the Centella repo.

- [ ] Click **Connect a folder**.
- [ ] Pick (or create) `~/Documents/Centella` on Mac, or `C:\Users\<you>\Documents\Centella` on Windows.
- [ ] Confirm the folder is connected. You should see its name in the Cowork header.

### 1.3 Clone the repo

We're going to ask Claude to download the Centella code into that folder.

- [ ] Type into Claude:
  > *Clone the centella-global GitHub repo into this folder. The repo is at `github.com/pablodefendini/centella-global`. After cloning, run `npm install` to install dependencies.*

- [ ] Claude will use its bash tool, run a couple of commands, and report back. This takes 1–3 minutes depending on your WiFi.
- [ ] When it's done, ask:
  > *List the top-level files and folders in the repo and tell me what each one is for.*

If Claude can list the contents (`src/`, `docs/`, `share/`, `work/`, etc.) and say something sensible about each, the connection works. ✅

### 1.4 Connect connectors

Cowork has connectors that let Claude reach beyond your laptop — into Notion, GitHub, etc. Turn on the ones we need.

In the Cowork sidebar, find the **connectors** section. Enable:

- [ ] **GitHub** — for committing and pushing changes.
- [ ] **Notion** — for reading and writing the CMS databases.
- [ ] **Vercel** — to check deploy status.
- [ ] **Slack** — optional, for posting and reading deploy notifications.
- [ ] **Google Calendar / Gmail** — optional, useful for everyday work.

For each one, you'll click **Connect** and approve in a browser window. It takes 20–40 seconds per connector.

### 1.5 Smoke test

Now ask Claude things that exercise each connector:

- [ ] *What's in the share/ directory of this repo?* (tests file access)
- [ ] *Find the Events database in Notion and tell me the property names.* (tests Notion)
- [ ] *What's the latest deploy status on the centella-global Vercel project?* (tests Vercel)

If any of these fail, raise a hand. The facilitator or your neighbor will help.

---

## Part 2 — Repo tour (you'll follow this with the facilitator)

### 2.1 The big picture

The Centella repo is two things in one:

1. **The Centella website.** Source code lives in `src/`. Content comes from Notion at build time. Output is `centellaglobal.com` (currently `centella-global.vercel.app`).
2. **A publishing tray for client work.** Decks, brochures, proposals, mockups. They live in `work/` (working drafts, not public) and `share/` (publish tray, public at `/share/<filename>`).

The site rebuilds automatically when content changes in Notion (via a button-trigger). Client deliverables are committed deliberately, by hand, when they're ready.

### 2.2 Walk the directory tree

Open Cowork side-by-side with the workbook. Ask Claude as you go — the directory map is in `CLAUDE.md` and Claude can read it for you.

#### The website (don't edit unless you're engineering)

- `src/pages/` — every URL on the site. Homepage, events, blog, presentations.
- `src/components/` — reusable parts: header, footer, cards.
- `src/layouts/` — the page shells. `Base.astro` is the standard one with header and footer; `Presentation.astro` is the bare-bones one for full-screen decks.
- `src/lib/notion.ts` — the code that talks to Notion.
- `src/styles/global.css` — site-wide styles.
- `public/` — static files (favicons, hero video, fonts) bundled into the site.
- `api/subscribe.ts` — the Mailchimp signup endpoint.

> **Try it.** Ask Claude: *Show me the homepage file. What does it pull from Notion?*

#### The docs (you can read, sometimes edit)

- `CLAUDE.md` — the project's "how it works" file. **Read this when you're confused.**
- `docs/PRD.md` — the product spec. What we're building and why.
- `docs/MEMORY.md` — the decision log. Why we chose Astro, why decks live where they do, etc.
- `docs/DIARY.md` — the working diary. Reverse-chronological log of what's been built.
- `design.md` — the visual design system (colors, type, spacing).

> **Try it.** Ask Claude: *Read MEMORY.md and tell me the three most recent decisions.*

#### The publish tray (you may edit, with care)

- `share/` — anything here is **publicly reachable** at `/share/<filename>` once deployed. Treat it like a public folder. Drop a self-contained HTML file in here, push, and it's a URL anyone can open.
- `share/<slug>-standalone.html` — built decks, ready to email or hand off on USB. Single file, all assets inlined.
- `share/<project>/` — built client mockups, copied from `work/<project>/mockups/`.

#### The working folders (private until you publish)

- `work/<project>/` — per-project working folder. Briefs, READMEs, drafts, notes. Not deployed.
- `work/<project>/mockups/` — the **shareable subset** within a project. When you run `npm run work:build`, these get copied into `share/<project>/`.

> **Try it.** Ask Claude: *What's currently in the work/ folder? List each project and what stage it's at.*

### 2.3 The "where do I look first" prompts

Pin these. They work on any future Cowork session:

1. *What's the structure of this repo? Read CLAUDE.md and summarize.*
2. *Where would I add a new event? Trace the path from Notion to the live page.*
3. *What's the difference between `public/`, `share/`, and `work/`?*
4. *What's been changed in the last week? Read the diary.*

---

## Part 3 — Editing the website (Notion workflow)

This is the everyday workflow for the content team. **You won't touch any code for this part.**

### 3.1 The five databases in Notion

The Centella website's content lives in five Notion databases. Open the Centella workspace in Notion now and find them.

| Database | What it is | Where it appears |
|----------|-----------|------------------|
| **Events** | Conferences, summits, gatherings | Homepage (latest), `/events/`, `/events/<slug>/`, `/events/past` |
| **Blog Posts** | Centella thinking and updates | `/blog/`, `/blog/<slug>/`, RSS feed |
| **Speakers** | People speaking at events | Linked from events |
| **Attendees** | People attending events | Linked from events |
| **Sponsors** | Event sponsors | Linked from events |

### 3.2 The visibility rule

**Only `Status = Published` shows up on the live site.** Drafts and Archived rows are filtered out at build time.

This is your safety net: you can edit drafts as long as you want, and nothing goes live until you flip Status and trigger a publish.

### 3.3 Publish a test event (we'll do this together)

Follow along with the facilitator.

- [ ] Open the **Events** database in Notion.
- [ ] Pick an existing event row, right-click, and **Duplicate**.
- [ ] Open the duplicate. Change:
  - Title → "Test Retreat Event"
  - Slug → `test-retreat`
  - Status → `Published`
  - Date → today
- [ ] Click the **Publish to website** button at the top of the page. (This is a Notion automation that calls the Vercel deploy hook.)
- [ ] Watch the **#centella-deploys** Slack channel for the deploy notification.
- [ ] Wait ~90 seconds. Open `centella-global.vercel.app/events/test-retreat`. Your event should be there.
- [ ] Set Status back to `Draft`. Click **Publish to website** again.
- [ ] Refresh the URL — 404. Gone.

You just published and unpublished a page on a live site without touching code. ✅

### 3.4 Things you can do without engineering

- Edit any text on any event, blog post, speaker, attendee, sponsor.
- Add new events, posts, or people. Just create a row, set Status to `Published`, hit the trigger.
- Change which speakers are linked to which event.
- Change the Featured flag on an event (controls whether it appears as "latest" on the homepage).
- Replace a hero image.
- Change a slug (this changes the URL — be careful with already-shared links).

### 3.5 Things you can't do (file a request)

- Add new fields to a database (e.g. "co-organizer").
- Change site navigation, footer, or homepage layout.
- Add a new section to the homepage.
- Add a new database type (e.g. "Partners").
- Change colors, fonts, or visual design.

These are code changes. File a request in the team's Notion or Slack and engineering will scope them.

### 3.6 Don't-do list

- ❌ Don't click **Publish to website** twenty times in a row "to be sure." Each click triggers a full rebuild. One click, then check Slack.
- ❌ Don't change a slug after sharing the URL. The old URL will 404.
- ❌ Don't leave Status as `Published` on a half-finished event you're still drafting. It'll go live the next time anyone publishes.
- ❌ Don't try to format event copy with HTML. Use Notion's native blocks (headings, lists, callouts, quotes). The site renders them.

---

## Part 4 — Editing and publishing presentations through Cowork

This is where Cowork really shines. Decks live in code, but **you don't have to write code to edit them** — you describe what you want and Claude makes the change.

### 4.1 Two kinds of decks

- **First-class decks** — `src/pages/share/presentations/[slug].astro`. These get a proper URL on the site (`/share/presentations/<slug>/`). NGL Barcelona is the example. Use this when the deck has a real audience and a real life.
- **Client mockups** — `work/<project>/mockups/<file>.html`. Self-contained HTML, no Astro. Easier to drop in, faster to iterate. The Prime Movers brochure is the example. Use this for proposals, comp options, anything you'll throw away or replace.

If you're unsure which kind to make, ask Claude: *I want to build a [type of deck]. Should this be a first-class presentation in `src/pages/share/presentations/` or a mockup in `work/`?*

### 4.2 Editing a deck (live demo follow-along)

We'll be editing the NGL Barcelona deck together.

- [ ] In Cowork, ask:
  > *Open `src/pages/share/presentations/ngl-barcelona.astro`. Find the cover slide. Show me the cover slide markup so I can see what's there.*

- [ ] Read what Claude shows you. Notice it's HTML — slide titles, subtitles, etc.
- [ ] Now ask:
  > *Add a small subtitle line below the cover title that reads "Versión revisada — abril 2026". Show me the diff before saving.*

- [ ] Claude will propose the edit. Look at the diff. Approve.
- [ ] Ask:
  > *Start the dev server with `npm run dev` in the background. When it's running, tell me the URL where I can preview the deck.*

- [ ] Claude will give you a URL like `http://localhost:4321/share/presentations/ngl-barcelona/`. Open it in your browser. The deck loads. Resize your window — notice it letterboxes (bars on the short axis) instead of clipping. ✅

### 4.3 Publishing a standalone (the part clients actually receive)

Decks on the website are great for sharing a link. But sometimes you need to email a single file or hand off a USB stick to a venue. That's what **standalones** are for — one HTML file with everything (fonts, images, CSS) inlined.

- [ ] Ask Claude:
  > *Bundle the English NGL Barcelona deck into a standalone HTML file. Use `npm run deck:standalone -- ngl-barcelona-en`.*

- [ ] Claude runs the command. It builds the site, then bundles the deck.
- [ ] Claude reports the output file: `share/presentations/ngl-barcelona-en-standalone.html`.
- [ ] In Finder/Explorer, double-click that file. It opens in your browser. No internet needed. ✅

### 4.4 Pushing the standalone live

- [ ] Ask Claude:
  > *Commit the regenerated standalone with the message "rebuild ngl-barcelona-en standalone" and push to main.*

- [ ] Claude commits and pushes. Watch Slack for the Vercel deploy notification.
- [ ] After ~90 seconds, open `centella-global.vercel.app/share/presentations/ngl-barcelona-en-standalone.html`. There it is. Public URL, ready to share.

### 4.5 Working with `work/` mockups

For client work that's not a first-class deck (proposals, comp options, brochures) the workflow is similar but lives in `work/`.

- [ ] Ask Claude:
  > *Show me what's in `work/prime-movers-20th/`. What's the difference between the `mockups/` folder and everything else?*

- [ ] Claude will explain: `mockups/` is the shareable subset; everything else (briefs, READMEs, source) stays private.
- [ ] To rebuild and ship: ask
  > *Rebuild the work/ outputs by running `npm run work:build`. Then commit and push the changes in `share/`.*

The mockups will go live at `centella-global.vercel.app/share/<project>/`.

### 4.6 The "before I share with a client" checklist

Pin this prompt — run it before sending any deck or mockup to a client:

> *Before I send this deck to a client, run a checklist:
> 1. The standalone bundle is regenerated from current source (run `npm run share:build`).
> 2. `share/` is committed and pushed.
> 3. The latest Vercel deploy is green.
> 4. The URL loads correctly in an incognito window — no caching weirdness.
> Tell me which steps passed and which failed.*

---

## Part 5 — Troubleshooting

### "I can't see my Notion change on the site."

1. Did you set Status to `Published`? Drafts don't render.
2. Did you click **Publish to website**? Editing alone doesn't trigger a rebuild.
3. Did you wait 90 seconds? Builds aren't instant.
4. Check the **#centella-deploys** Slack channel. If the deploy failed, the error is there.
5. Ask Claude: *What's the latest Vercel deploy status, and did it succeed?*

### "My deck looks different on the live site than locally."

The live `/share/<deck>-standalone.html` is a **committed snapshot**, not a live build. If you edited the source and haven't run `npm run deck:standalone -- <slug>` and pushed, the live version is stale.

Ask Claude: *Is `share/` in sync with the source decks? If not, rebuild and tell me what changed.*

### "I can't find the file I'm looking for."

If it's website **content** (event copy, blog post text, speaker bio) — it's in **Notion**, not the repo. Search Notion.

If it's **code** (a page, a component, a deck), ask Claude: *Find the file that controls [thing I want to edit]. Tell me the path.*

### "I made a change and now the site is broken."

Don't panic. Cowork commits keep history. Ask Claude:

> *Show me the last 5 commits. Revert the most recent one and push.*

Engineering can fix anything that's gone seriously wrong. Slack the team and someone will jump in.

### "Cowork can't reach Notion / GitHub / Vercel."

The connector token may have expired. In the Cowork sidebar, find the connector and click **Reconnect**. Re-approve in the browser. Ask Claude to retry.

### "I asked Claude to do something and it did the wrong thing."

Claude is good but not perfect. Always:

- Read diffs before approving them.
- Ask Claude to explain what it's about to do, before doing it: *Before you make this change, walk me through what will happen.*
- If something went wrong, you can almost always undo: *Undo the last change you made.*

---

## Part 6 — Getting help

- **Slack #centella-tech-help** — for everyday "how do I..." questions. Other team members will chime in.
- **Slack Pablo directly** — for things that feel urgent or sensitive.
- **Ask Claude in Cowork** — for "how does this codebase work" or "what does this file do" questions, Claude is faster than asking a human.
- **Read `docs/MEMORY.md`** — when you want to know *why* something is the way it is, the decision log usually explains.

---

## Part 7 — Practice exercises (after the retreat)

In the 48 hours after the retreat, try these on your own. They cement what we covered.

### Exercise A — Publish a draft blog post (~10 min)

1. Create a new row in the Blog Posts database in Notion.
2. Title it "Hello from the team retreat" and write 2 paragraphs of body text.
3. Set Status to `Draft` first. Confirm you don't see it on `/blog/`.
4. Set Status to `Published`. Trigger a publish. Confirm it appears.
5. Set Status back to `Draft`. Trigger a publish. Confirm it's gone.

### Exercise B — Duplicate and ship a test event (~10 min)

1. Duplicate an existing event in Notion.
2. Change title, slug, dates.
3. Status → `Published`. Publish.
4. Find the new URL on the live site.
5. Status → `Archived`. Publish. Confirm it's gone.

### Exercise C — Edit a deck and ship it (~15 min)

1. Open Cowork in the Centella repo.
2. Ask Claude to make a small visible change to the English NGL Barcelona deck — any change you can verify visually.
3. Ask Claude to rebuild the standalone and push.
4. After deploy, open the live URL. Confirm your change.
5. Ask Claude to revert. Push. Confirm the original is back.

If you finish all three, you've done the full loop. Tell the team. ✊
