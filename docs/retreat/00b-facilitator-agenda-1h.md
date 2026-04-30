# Centella Cowork Teach-In — 1-Hour Facilitator Agenda

**Audience.** Centella core team, mostly non-technical. First time meeting in person.
**Format.** One 60-minute session. No breaks.
**Goal.** By the end, every team member can:

1. Open a Cowork session inside the Centella repo on their laptop.
2. See a real Notion-to-live-site publish loop happen.
3. See a real deck-to-published-URL loop happen.
4. Know where to go for help and what homework to do this week.

This is the **compressed** version. The full 3.5-hour agenda is in `00-facilitator-agenda.md` — use that if you have a half-day. This one is the talk-fast-show-everything version when you only have an hour.

**Mode shift from the 3.5h version.** This is **demo-led, not workshop-led.** You drive. The team watches their facilitator's screen and follows on their laptops where they can. The workbook (`02-hands-on-workbook.md`) is **post-session homework**, not a live follow-along. Tell them this up front so nobody feels rushed.

---

## What has to be true before the room opens

The 1-hour shape only works if the prep doc has been honored. Restate this to the team in the week-of email:

- Every laptop in the room must already have **GitHub account, Claude account, Claude desktop app, Node 20, Git** installed and signed in.
- Every team member must already be **invited to Centella's Notion workspace** and have accepted.
- If anyone shows up without these, **they get paired with a teammate** and you keep moving. Don't stop the session for individual setup. Send them the workbook and book a 1:1 the next day.

Run a Slack roll-call 24 hours before. Anyone who doesn't reply with "I'm ready" gets a Pablo follow-up.

---

## Pre-flight (the day before — yours)

- [ ] `git pull` and `npm run dev` from the Centella repo. Site builds clean.
- [ ] `npm run share:build` succeeds.
- [ ] Vercel latest deploy is green.
- [ ] Notion **Publish to website** trigger fires a deploy successfully — do one round trip.
- [ ] Tab group: GitHub repo, Vercel project, Notion workspace, Slack `#centella-deploys`, the live site.
- [ ] A **test event row** in Notion ready to publish during the demo.
- [ ] Projector at 1440×900 minimum.
- [ ] A **parking lot doc** open (Notion page or shared note) to capture questions you can't answer in the moment.

---

## The 60 minutes

| # | Section | Time | Cumulative |
|---|---------|------|------------|
| 1 | Opening + mental model | 5 min | 5 |
| 2 | Setup blitz (everyone connected) | 20 min | 25 |
| 3 | Demo: Notion → live site | 12 min | 37 |
| 4 | Demo: deck → published URL | 15 min | 52 |
| 5 | Wrap, homework, parking lot | 8 min | 60 |

If you're behind at the 25-minute mark, **cut the deck demo's editing portion** (skip §4a-b, do §4c only). Losing the publish loop is non-negotiable; losing the editing demo is recoverable from the workbook.

---

## 1. Opening + mental model — 5 min

Project this on the screen, talk over it:

```
   NOTION  ─────►  GitHub repo  ─────►  Vercel  ─────►  centellaglobal.com
   (content)       (code +              (build &        (live site)
                    snapshots)           deploy)
                       ▲
                       │
                  Cowork (Claude)
                  is your interface
                  to all of this.
```

Three sentences:

1. The website's content lives in **Notion**, not in the repo. You edit there.
2. The website's code, plus client decks and mockups, live in **GitHub**. Cowork is how you reach into that without typing commands.
3. Today we're doing a tight loop of both. The full reference document lives in the repo as `02-hands-on-workbook.md` — work through it this week.

Anti-pattern to name once, out loud: *"I'll wait for Pablo to do it." That's the thing this whole setup is designed to avoid. By Friday I want each of you to have published something on your own.*

---

## 2. Setup blitz — 20 min

Project the workbook §1 on screen and walk it.

### 2a. Connect Cowork to the repo (10 min)

Live demo from your machine, then the team follows. They mirror you step by step.

1. Open Claude desktop app → switch to **Cowork mode**.
2. **Connect a folder**: pick `~/Documents/Centella` (Mac) or `Documents\Centella` (Windows).
3. Type into Claude: *"Clone the centella-global repo from `github.com/pablodefendini/centella-global` into this folder. Then run `npm install`."*
4. Claude works for 1–3 min. Wait for everyone to land.

**Stuck?** If someone's GitHub auth fails, have them run `gh auth login` in a Terminal once, or fall back to cloning with HTTPS + a personal access token. Don't let one person stall the room.

### 2b. Connectors + smoke test (10 min)

In the Cowork sidebar, enable:

- **GitHub**, **Notion**, **Vercel** (mandatory).
- **Slack**, **Google Calendar / Gmail** (optional — skip if anyone struggles).

Run **one** smoke test on each laptop. Just one — this is a checkpoint, not a learning module:

> *"What's in the share/ directory of this repo?"*

If Claude lists files, that laptop is fully connected. ✅

If Claude says it can't reach the folder, the connection didn't take — pair that person with a neighbor and proceed.

---

## 3. Demo: Notion → live site — 12 min

You drive. Team watches. They'll do this themselves as homework.

### Live moves (10 min):

1. Open the Notion **Events** database on screen.
2. Duplicate an existing event. Change title to "Test Retreat Event", slug to `test-retreat`, status to `Published`, date to today.
3. Click **Publish to website**.
4. Switch to Slack `#centella-deploys`. Watch the deploy notification come in.
5. Switch to a browser. Open `centella-global.vercel.app/events/test-retreat`. **There it is.**
6. Switch back to Notion. Set status to `Draft`. Click **Publish to website** again.
7. Refresh the URL. **404. Gone.**

### The two beats to land (2 min):

- **Only `Status = Published` shows up.** This is your safety net. You can edit drafts forever and nothing goes live until you flip the switch.
- **One click of Publish per change.** Each click triggers a full rebuild. Don't spam it.

**Things they can do without engineering:** any edit to events, blog posts, speakers, attendees, sponsors. Add new ones. Change Featured flags. Replace hero images.

**Things they can't do:** add new fields, change navigation, change visual design, add new database types. *That's a request to engineering.*

---

## 4. Demo: deck → published URL — 15 min

You drive. Team watches. The pacing is: read the file, edit through Cowork, build the standalone, push, see it live.

### 4a. Edit a deck through Cowork (5 min)

Project Cowork. Type:

> *"Open `src/pages/presentations/ngl-barcelona.astro`. Find the cover slide and add a small subtitle line that says 'Versión revisada — abril 2026'. Show me the diff before saving."*

Claude proposes the edit. Read the diff out loud. Approve.

### 4b. Build and view the standalone (5 min)

> *"Bundle this deck as a standalone HTML file: `npm run deck:standalone -- ngl-barcelona`. Tell me when it's ready and the path."*

Claude runs the command. Output lands at `share/ngl-barcelona-standalone.html`. Double-click it from Finder/Explorer. **It opens in the browser, no internet needed.** That's the file you email to a client.

### 4c. Push it live (5 min)

> *"Commit the regenerated standalone with the message 'rebuild ngl-barcelona standalone — retreat demo' and push to main."*

Claude commits and pushes. Switch to `#centella-deploys` to watch the deploy. After 60–90 seconds, open `centella-global.vercel.app/share/ngl-barcelona-standalone.html`. **There it is. Live URL. Public.**

That's the whole client-deliverable loop. Three Cowork prompts. Zero typed commands.

The same pattern works for `work/<project>/mockups/` — `npm run work:build` instead of `deck:standalone`. Mention it briefly, defer to the workbook.

---

## 5. Wrap + homework + parking lot — 8 min

### What we just covered (1 min)

Quick verbal recap. Don't go deep — they have the workbook.

### The three things that will trip you up (2 min)

State these once, plainly:

1. **Did the deploy actually go out?** Always check `#centella-deploys` or ask Claude *"What's the latest Vercel deploy status?"*.
2. **Live deck looks different from local?** Standalones are committed snapshots. If you didn't run `deck:standalone` and push, the live `/share/` version is stale.
3. **Can't find a file?** It's probably in Notion, not the repo. Search Notion first.

### Homework (3 min)

Give each teammate one assignment for the next 48 hours. Write names on the parking lot doc:

- One person publishes a draft blog post end-to-end.
- One person duplicates an event and ships a test version.
- One person edits one sentence in NGL Barcelona, rebuilds the standalone, shares the URL in Slack.

The workbook (`02-hands-on-workbook.md`) is their reference. They're not on their own — they're free to ask Claude anything, ping `#centella-tech-help`, or DM Pablo.

### Parking lot (2 min)

Run through the list. Each open question gets an owner and a date. Close the meeting on time.

---

## What's deliberately cut from the 3.5h version

- **No repo tour.** The "where things live" content is in the workbook. Anyone who needs the tour can ask Claude *"What's the structure of this repo? Read CLAUDE.md and summarize."*
- **No live exercises for the team.** They follow along where they can but the demos are facilitator-driven.
- **No discussion of `work/` mockups workflow** beyond a one-line mention. Workbook §4.5 covers it.
- **No deck-letterboxing demo.** Skip the resize-the-window beat from the 3.5h version.
- **No "things you can/can't do" walkthrough.** Compressed into two lines in §3.
- **No breaks.** A 1-hour session has no slack. Have water on the table.

---

## After the session

- **Within 48 hours:** every teammate completes their homework assignment. You confirm via Slack.
- **Within 1 week:** 30-minute group follow-up call. Surface what didn't stick. The questions you hear are v2 of this agenda.
- **Within 2 weeks:** every teammate has independently published at least one thing (event, blog post, or deck update) without you in the loop. That's the actual success criterion of this retreat.

---

## Materials checklist

- [ ] Projector / screen share at 1440×900+.
- [ ] HDMI / USB-C dongle.
- [ ] Backup WiFi hotspot.
- [ ] Test event row in Notion ready to publish.
- [ ] Pre-retreat prep receipts (each teammate's account-status confirmed via Slack roll-call).
- [ ] The full 3.5h agenda (`00-facilitator-agenda.md`) and workbook (`02-hands-on-workbook.md`) shared with the team beforehand for those who want to read ahead.
- [ ] Parking lot doc.
- [ ] Water on the table.

---

## If you find yourself running over

At minute 50, if you haven't started §5: **stop §4 wherever you are**, jump to §5, finish on time. The single most important thing is that the team leaves with a homework assignment they understand. A 1-hour session that runs to 1h 15min undercuts the whole "we respect your time" message. Land on time.
