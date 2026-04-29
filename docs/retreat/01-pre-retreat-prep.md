# Centella Retreat — Pre-Retreat Prep

**Send this to the team at least 7 days before the retreat.** It's also fine to copy-paste straight into an email.

---

## What this is

We're doing a teach-in at the retreat where you'll learn how to work on the Centella website and our client decks directly, without needing engineering in the loop for everyday changes. By the end of the half-day, you'll be editing the live site from Notion and publishing decks from your laptop.

The session works only if everyone shows up with the right accounts and apps already set up. Most of this is one-time setup that takes 30–45 minutes total. **Please block time on your calendar this week to do it** — doing it cold during the session means the rest of us wait for you.

---

## What to do before you arrive

### 1. Hardware

- A laptop (Mac or Windows). Centella content team has been on Macs; either works.
- Charger.
- At least **5 GB of free disk space**. The repo plus tooling adds up.
- Headphones (helpful if part of the retreat is hybrid).

### 2. Accounts to create or confirm

You probably have some of these already. Confirm each, and create the missing ones.

#### a. GitHub account
GitHub is where the website's code and our shared documents live.

- Go to **github.com** and sign up (or sign in if you already have an account).
- Use a **personal email or a long-lived Centella email** — not an email tied to a specific contract or short-term role.
- Turn on **two-factor authentication** (Settings → Password and authentication → 2FA). GitHub will require it eventually; do it now and skip the panic later.
- **Send your GitHub username to Pablo** by [date]. Pablo will add you to the Centella organization so you have access on Day 1.

#### b. Claude account
Claude is the AI assistant we'll use through Cowork. The desktop app is the one that does the heavy lifting.

- Go to **claude.ai** and sign up if you don't have an account. The free tier is enough to follow along; if you do real work afterwards, you'll want a paid plan.
- Download the **Claude desktop app**: claude.ai/download. Install it. Sign in.
- Confirm that **Cowork mode** is available in your version. If you don't see it, update the app to the latest version.

#### c. Notion access
Centella's website content lives in our Notion workspace.

- Pablo will send you a Notion invite to the **Centella workspace** before the retreat. Accept it from the email address you use professionally. Tell Pablo if you don't see the invite by [date — 3 days before retreat].
- If you've never used Notion, you don't need to learn it ahead of time — we'll walk through it in the session.

#### d. Vercel viewer (optional but useful)
Vercel is where the live website is hosted.

- Pablo will send you an invite to the **centella-global** project on Vercel. Accept it.
- You'll mainly use this to see deploy status — you won't be deploying manually.

#### e. Mailchimp viewer (optional)
- If you'll need to look at signups, Pablo will add you to Mailchimp.
- If your role doesn't touch the email list, you can skip this.

#### f. Slack
- We'll be using a shared Slack channel for deploy notifications and team chat. Make sure you're in the workspace and the **#centella-deploys** channel by Day 1.

### 3. Software to install

- **Claude desktop app** — see §2b above.
- **Node.js version 20** — the website tooling needs it. Easiest install path:
  - **Mac:** open Terminal, run `xcode-select --install` (one-time tool install), then run `curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash`. Close Terminal, reopen it, run `nvm install 20`.
  - **Windows:** download and install from **nodejs.org** — pick the LTS version (currently 20.x).
- **Git** — needed for cloning the repo.
  - Mac: comes with `xcode-select --install` above.
  - Windows: install from **git-scm.com**.

If any of these fail, **don't grind on it** — message Pablo or our engineering contact and we'll sort it during the morning of the retreat. The session has buffer time exactly for this.

### 4. Things to know

- The session is **~3.5 hours**. We'll have one short break in the middle.
- It's a working session — laptops open the whole time.
- You don't need to memorize anything before showing up. If you read this prep doc and create the accounts, you're ready.
- Bring questions. The dumb-feeling ones are the most useful — if you're confused about something, three other people in the room are too.

### 5. Optional: skim, don't study

If you have 15 minutes to spare and you're curious, **skim** these three files in the Centella repo (Pablo can share read-only links if the repo isn't public yet):

- `CLAUDE.md` — the project's "how this site works" file. Don't try to understand all of it, just the **Project overview** and **Directory structure** sections.
- `docs/PRD.md` §1–4 — what this site is for and who uses it.
- `docs/retreat/02-hands-on-workbook.md` — the workbook we'll be following live. Reading it ahead is a head start.

If you don't have 15 minutes, that's fine. Show up with the accounts and the apps and we'll do the rest together.

---

## Day-of checklist (the morning of the retreat)

- [ ] Laptop charged.
- [ ] Power adapter in your bag.
- [ ] Logged into GitHub on your laptop (open github.com in your browser; you should see your username top-right).
- [ ] Logged into Claude desktop app.
- [ ] Logged into Notion (web or app — either's fine).
- [ ] Slack open with the Centella workspace.
- [ ] Coffee.

---

## Help

If anything in here doesn't work or doesn't make sense:

- Slack Pablo directly.
- Or post in **#centella-tech-help** — others probably have the same question.

We'd rather sort gotchas now than during the session. Two minutes on Slack now saves twenty minutes of waiting in the room.

See you at the retreat.
