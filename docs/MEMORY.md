# Project Memory — Centella Global Website

This file captures decisions, rationale, and institutional knowledge that
isn't obvious from the code or the PRD. It's a decision log, not documentation.
Append new entries at the top.

---

## 2026-04-29 — Blog Posts get an `Event` relation

Added a single-event relation on the Blog Posts DB pointing at Events. Lets us tag a post as "from" or "about" a specific event (recap, summary, post-mortem) without overloading tags or burying the connection in body copy. Two-way relation in Notion, so the Events DB picks up a reciprocal "Blog Posts" property for free — no event-side rendering today, but the data path exists when we want a "Related posts" block on event pages.

Cardinality: single. The property name is singular and the type is `event: BlogPostEvent | null` on `BlogPost`. If a post legitimately ties to multiple events, the body text handles the secondary mentions; the relation is for the canonical "this post is from that event" link.

Render surfaces: post detail page gets a "From [Event Name]" eyebrow above the date, linking to `/events/{slug}/`. Listing card (`BlogPostCard`) shows "From [Event Name]" as plain text — can't make it a clickable link from the card because the whole card is already wrapped in `<a href="/blog/{slug}/">` and nesting links is invalid HTML. If we want a clickable event-link on the card later, the fix is restructuring the card with a CSS pseudo-element overlay for the post link, leaving inline content free for additional anchors. Deferred until someone asks for it.

Code shape: `pageToBlogPost` is now async (one extra Notion fetch per post to resolve the relation, build-time only — no runtime impact). Added `getBlogPostEventById` as a lightweight retriever that returns just `id`, `slug`, and `name` — does not pull speakers/attendees/sponsors like `pageToEvent` does. Returns null on any failure so a deleted-relation or broken-id doesn't block the post from rendering.

Edge: if the related event is Draft or Archived, the post still renders, but the "From" link 404s on the public site (because `/events/[slug]` filters by Published). Documented in CLAUDE.md as the content team's responsibility.

---

## 2026-04-29 — Title vs Role split on Speakers, Attendees, Team Profiles

The Notion property `Title/Role` was doing double duty across three databases: it was both a person's standing job title (what goes on a business card) and their contextual function in the moment (what reads "Keynote Speaker" on an event card). Split into two properties — `Title` and `Role` — across Speakers, Attendees, and Team Profiles, and updated every consumer to match.

Semantic: **Title = standing job title** (the stable line — "Strategy Director at Acme", "Co-founder, Centella"); **Role = contextual function** (the situational line — "Keynote Speaker", "Panel Moderator", "Founding Partner", "Advisor"). Title is what goes wherever the person's *identity* is the point: business cards, email signatures, the future team-page render. Role earns top billing on speaker cards because the page is about the event, not their LinkedIn.

`SpeakerCard` now stacks Name → Role at body weight → Title muted → Organization muted. The `/tools/*` pages and the SVG templates (`business-card.svg`, `email-signature.svg`) render Title only; Role is exposed as a `{{role}}` template token but unused by the default designs. Attendee data carries both fields but no public renderer exists yet — placeholder for when notable-attendee callouts ship.

Made the change *before* migrating the CMS to the corporate Notion workspace (planned, not yet executed) so the corporate databases are created with the clean schema from day one and there's no legacy data to bring along.

---

## 2026-04-29 — Three new content pages: Advisory, Impact, About Centella (and the tone-coded section-panel pattern they share)

The three sub-brand pages were placeholders. Today: full Advisory and Impact landing pages with content from Pablo, plus a brand-new umbrella page at `/about-centella/`. All three follow the same load-bearing structure pattern: a display hero, one or more sections framed as eyebrowless h2 + lede, panel grids that diagnose problems and present solutions, a CTA panel hosting `MailchimpForm` with a section-specific tag.

**Tone-coded section-panel pattern (now consistent across the site).** First built on the homepage pillars (`.home-min__pillar`); reused today on Advisory strategies (3 panels, advisory family), Impact problems (4 panels, investment family), Impact solutions (3 panels, investment family), and About Centella's three-pillars section (3 panels, one per sub-brand color family). Recipe:

- Outer panel: `--<family>-dark` background, `--<family>` text color, 8px (or 16px for hero CTA panels) border-radius, `--space-2` outer padding.
- Inner frame: `1px solid color-mix(in srgb, currentColor 30%, transparent)`, `border-radius: inherit`, `--space-8 var(--space-6)` padding.
- Icon chip: `--space-2` padding, 4px radius, `color-mix(... 16%, transparent)` background, `color-mix(... 35%, transparent)` border.
- Title in `--color-text`, body in `--color-text-muted`. CTA inherits `currentColor` and follows `.tone-surface` link rules.

This pattern is ripe for extraction into a `<TonePanel>` component. Held off this session because the duplication is small (~30 lines of CSS per page, ~12 lines of markup) and each page was on its own ticket — but the next page that needs a tone panel is the trigger. Flagged in CLAUDE.md under "Pending / planned work."

**Hero accent gradient as identity signal.** Sub-brand pages key `--page-accent` to their sub-brand color and use a specific approved gradient on the hero accent that pairs the page key with another family: Advisory hero uses `display__accent--cyan-violet` (advisory + violet principal); Impact uses `display__accent--lime-teal` (investment + advisory); the Impact "We can do better. We can build better." aspirational beat reuses the same lime-teal gradient. About Centella, being umbrella-neutral, uses `data-random-accent-gradient` on the hero accent for per-load random gradient variation — same treatment as the homepage hero. So the hero gradient reads as "I am about Centella the whole" vs "I am about this specific sub-brand." That distinction is load-bearing now and worth preserving on future pages.

**Service / item lists with icon-left rows.** The Advisory page introduces a different shape from tone panels: a vertical list of service items, each row a 3rem icon chip on the left (advisory-tinted) + title-only on the right, separated by hairline borders. Used for the seven Core Services. Pattern lives in `centella-advisory.astro`; if a second page needs it, extract.

**Stat cards keyed to `--global`.** About Centella's "Flip the script" section uses `--global` (the brand's "scale & reach. cross-border connection. Accent only." color) as the section-local accent — a featured 80% stat with the globe icon, plus three regional stat cards under 3px global-orange top borders. This is the first place we've used `--global` as a section key — it's documented in `design.md` as "Accent only," and the stat treatment respects that (small accent in the eyebrow + top border, not in the figure or body text).

**Continent/region maps NOT added.** About Centella's Section 2 spec from Pablo described "continent map illustrations" for the regional stats. Held to the design.md hard rule ("Use only icons that already exist in `src/assets/icons/`. Do not add new icon files unless there is explicit approval in the task requirements") — there are no continent shapes in the icon library. Used a strong typographic eyebrow + accent-bar treatment instead. If continent maps land later, they'd go in `src/assets/icons/{latam,africa,asia}.svg` with explicit approval and replace the typographic-only treatment.

**Team-photo wiring is the open question on About Centella.** `getTeamProfiles()` already exists in `src/lib/notion.ts` and is wired to the Team Profiles DB; it returns photos as Notion file URLs. Notion's signed file URLs expire, which is fine for the `/tools/*` section (auth-gated, rebuilt on every deploy, only seen by staff) but unworkable on a public About page where a stale signed URL = a broken portrait on a high-traffic page. So the team grid currently renders 8 placeholder circles with a `// swap for <img src="/team/<slug>.webp">` marker in the source. The pickup: a build-time pipeline that copies team photos from Notion → `public/team/` so the public About page references stable local paths. Same shape as the existing team-asset pipeline (`scripts/build-team-assets.mjs`). Documented in CLAUDE.md as the open question for this page.

**Form copy on About Section 6 — went past the placeholder.** Pablo's spec said "(Copy here is clearly placeholder — needs a real headline + supporting line before launch.)" Wrote a real headline + lede in brand voice instead: *"Stay close to the work."* / *"Occasional dispatches from Centella — campaigns we're shaping, leaders we're backing, and the civic-tech we're building for the Global South."* Tag: `centella-newsletter`. Easy to swap if Pablo wants different copy.

**Files added:** `src/pages/about-centella.astro`. **Files substantively rewritten:** `src/pages/centella-advisory.astro` (was a one-section placeholder), `src/pages/centella-impact.astro` (same).

---

## 2026-04-29 — Nav restructure (About + Share/Work/Tools); /share/ sub-lobby pattern; dev-mode share serving

Three related changes that landed in the same window because they all touch site navigability.

**Nav: four new entries across header + footer.** Both `SiteHeader.astro` and `SiteFooter.astro` use the same `navLinks` array shape; updated both. Order: Home → About Centella → three sub-brand pages → Blog → Share → Work → Tools → Styleguide. About Centella sits right after Home (high-priority discoverability for an umbrella page); Share/Work/Tools cluster between Blog and Styleguide so the sub-brand work-pages stay together at the top and the publish-tray + dev/staff entries trail below.

**Share lobby grew a sub-lobby pattern (`subLobbies` in `_index.json`).** The Work nav entry pointed at `/share/work/`, which had no `index.html` and would 404 on Vercel. Refactored `scripts/build-share-index.mjs` to support an optional `subLobbies` map keyed by directory name under `share/`. For each entry, the script filters projects whose artifacts have an href starting with that prefix, strips the prefix from each href so links resolve relative to the sub-lobby, and emits `share/<kind>/index.html` with the same Centella chrome plus a breadcrumb back to `/share/`. The breadcrumb is rendered by adding an optional `breadcrumb` parameter to `renderPage(m)` and reading the eyebrow from `site.eyebrow` (defaulting to `Centella · Share` for the main lobby, preserving prior behavior).

The manifest schema now supports:

```jsonc
{
  "site": { "title": "...", "eyebrow": "...", ... },
  "subLobbies": {
    "work": {
      "site": { "title": "...", "eyebrow": "Work", "headline": {...}, "lede": "...", "footer": "..." }
    }
    // future: "presentations": { ... } — same machinery
  },
  "projects": [ ... ]
}
```

Today only `subLobbies.work` is defined; Pablo asked for Work, not Presentations. Adding Presentations later is a manifest-only edit (script handles it generically). When a manifest sub-lobby's directory doesn't exist on disk OR no projects match the prefix, the script logs a warning and skips — no broken HTML.

**Dev-mode middleware for `share/*` (closes the dev-vs-prod gap).** In production, `scripts/copy-share.mjs` mirrors `share/` into `dist/share/` and `.vercel/output/static/share/` at build time, so Vercel serves `/share/*` directly. But `astro dev` only knows `src/pages/` and `public/` — `share/` at the repo root is invisible to it, so `/share/` and `/share/work/` 404 in dev. CLAUDE.md already called out a similar dev-vs-prod gap on `/tools/*` static-asset gating; this is the analog for share.

Closed it with a Vite plugin in `astro.config.mjs` (`apply: 'serve'` so it only runs in dev) that intercepts `/share/*` requests, maps them to `<repo>/share/*`, redirects directory URLs to trailing-slash form so relative hrefs resolve, and guards against path traversal. Smoke-tested live: `/share/` → 200, `/share/work` → 301, `/share/work/` → 200, `/share/nope` → 404. Production behavior is unchanged because the plugin is dev-only.

**Files modified:** `src/components/SiteHeader.astro`, `src/components/SiteFooter.astro` (nav), `scripts/build-share-index.mjs` (sub-lobby support), `share/_index.json` (added `eyebrow` on `site` + new `subLobbies.work` block), `astro.config.mjs` (Vite dev plugin). **Files added:** `share/work/index.html` (generated, committed alongside other share/ artifacts).

---

## 2026-04-29 — `/tools` follow-ups: shared user+password, and the prerender gotcha

Two follow-ups after the initial `/tools` section landed.

**Auth model is now user + password, not just password.** Switched the middleware to require both `TOOLS_USERNAME` and `TOOLS_PASSWORD` (initial values: `staff` / `centella`). Both must match; both are required at startup or the middleware returns 503. Reason: even for an internal-only section, "any username + shared password" was unnecessarily lax — the cost of asking staff to remember a username and a password is negligible compared to the small but real reduction in attack surface.

**Bug found and fixed: middleware on prerendered routes can't read request headers.** With `output: 'static'`, every page prerenders by default. The middleware *does* run, but at prerender time — when there's no real HTTP request and therefore no `Authorization` header. So my Basic Auth gate was firing once at build with empty headers, baking a 401 response into the prerendered output, and serving that 401 forever. Looked like the auth was working (browser saw a `WWW-Authenticate` prompt) but no credentials would ever satisfy it because the middleware had already decided "no auth header" before any client ever connected.

The fix: add `export const prerender = false;` to each gated page (`src/pages/tools/index.astro`, `src/pages/tools/business-cards.astro`, `src/pages/tools/email-signatures.astro`). That makes them server-rendered per request, the middleware runs at request time with real headers in scope, and the gate works as designed. Annotated this as a hard constraint in CLAUDE.md so we don't re-introduce it.

**Dev-vs-prod gap on `/share/tools/*` static assets.** In production, `vercel({ edgeMiddleware: true })` compiles the middleware into an Edge Function that gates *all* requests, including static assets — so a direct PDF URL hits the gate. In `astro dev`, middleware doesn't run in front of static asset serving. This is fine in practice because `/share/tools/*` files only exist *after* a build (`scripts/build-team-assets.mjs` writes into `dist/` and `.vercel/output/static/`, not into the dev server's source tree), so they aren't reachable in dev anyway.

**Debugging trail worth documenting** (so the next person spends an hour, not three): the symptoms were a 401 with apparently-correct credentials. The dead ends were browser auth cache, Node version mismatch (Node 18 vs the required 20), env-var hot-reload semantics. The actual signal was a one-line warning in the dev server log: `Astro.request.headers was used when rendering the route ... is not available on prerendered pages.` That's the one to look for.

---

## 2026-04-29 — `/tools` section: staff-only, build-time-generated brand assets

Stood up a `/tools` section as a staff-and-contractor-only space for self-serve branded assets. Two generators today: business-card PDFs at `/tools/business-cards` and transparent-PNG email signatures at `/tools/email-signatures`. Each lists every Active row in a new "Team Profiles" Notion DB and renders one asset per person. Decisions worth keeping:

**Auth: HTTP Basic Auth via Astro edge middleware, not Vercel's built-in Password Protection.** Vercel's project-level Password Protection is all-or-nothing (or production-vs-preview). To scope the gate to `/tools/*` and `/share/tools/*` without locking down the rest of the production site, used Astro middleware (`src/middleware.ts`) compiled to a Vercel Edge Function via `vercel({ edgeMiddleware: true })`. Single shared password (`TOOLS_PASSWORD` env var); username field is ignored. Middleware fails closed when the env var is missing — never patch that to allow through. The protected-prefixes list lives in `PROTECTED_PREFIXES`; broaden it there if a new staff-only path lands.

**Asset storage: build output, not committed.** Wrestled with this. The existing `share/` convention is "locally-built, committed, copied verbatim by `copy-share.mjs`" — that pattern works for decks (a deck shipped on date X must be bit-identical to the deployed copy) but is wrong here because Notion is the source of truth and the team will edit profiles independently of code commits. Picked: `scripts/build-team-assets.mjs` runs *between* `astro build` and `copy-share.mjs`, writes directly into `dist/share/tools/...` and `.vercel/output/static/share/tools/...`, never touches the repo's `share/` directory. Every Vercel deploy is fresh from Notion. Future `git status` won't be polluted by binary deltas. The flip side: assets only refresh when something triggers a Vercel deploy — relying on the existing `VERCEL_DEPLOY_HOOK_URL` (already wired to Notion) for that.

**Render pipeline: `pdfkit` + `svg-to-pdfkit` for the PDF, `@resvg/resvg-js` for the PNG.** Considered Puppeteer (too heavy, needs Chromium binary on Vercel build) and Satori (good at JSX-y layouts but weaker for arbitrary SVG with print bleed). Picked the pure-Node combination: vector PDF preserved end-to-end (no rasterizing the card), transparent PNG rendered straight from SVG, no headless browser. Card geometry: 85×55mm international + 3mm bleed = 91×61mm artboard (no US 3.5"×2" variant emitted; if a team member needs that we'll add a parallel `<slug>-us.pdf` later). Email signature: 600×180px source rendered at 2× density. Note for future template work: `resvg-js` enforces XML 1.0 strictly and rejects `--` inside SVG comments — the smoke test caught this before the build did.

**SVG templates as scaffolding, not finished design.** Pablo will redo the visuals later. The interpolation contract was the load-bearing thing: tokens are `{{name}}`, `{{titleRole}}`, `{{email}}`, `{{phone}}`, `{{pronouns}}`, `{{linkedin}}`, `{{website}}`, `{{linkedinDisplay}}`, `{{websiteDisplay}}`. When the real designs land, registering the Barlow superfamily for both renderers (`doc.registerFont(...)` for PDFKit and `font.fontFiles` for Resvg) is the next pickup; until then the placeholders use Helvetica which is built into PDFKit. Also added a preview helper at `scripts/preview-team-assets.mjs` (`npm run team-assets:preview`) that renders against a fixture profile so template iteration doesn't require live Notion creds.

**Notion schema (Team Profiles):** Name (title), Slug (rich text — manual, like Events), Status (select: Active/Inactive — only Active renders), Title/Role, Email, Pronouns, Phone, LinkedIn (URL), Website (URL), Photo (file). New env var `NOTION_TEAM_PROFILES_DB_ID` added to `.env.example`. The DB itself was not auto-created; the content team adds the DB and the integration in Notion, and Pablo flips the env vars in Vercel project settings.

**Files added:** `src/middleware.ts`, `src/pages/tools/{index,business-cards,email-signatures}.astro`, `src/templates/{business-card,email-signature}.svg`, `scripts/build-team-assets.mjs`, `scripts/preview-team-assets.mjs`. **Modified:** `astro.config.mjs` (edgeMiddleware), `src/lib/notion.ts` + `types.ts` (TeamProfile + getTeamProfiles), `.env.example`, `package.json` (deps + scripts), `CLAUDE.md` (directory structure, hard constraints, patterns, commands, deploy section).

---

## 2026-04-29 — Sub-brand → work-color mapping corrected (Institute is `--networking`)

Spec docs were carrying a stale sub-brand mapping that didn't match the actual implementation. The Sub-Brands table in `design.md` and the styleguide page mapped Centella Institute to `--violet`; the homepage pillars and share-lobby manifest already used `--networking`. Aligned everything to the correct mapping:

- Centella Global Advisory → `--advisory` (cyan, `#00E5FF`) — strategy & guidance
- Centella Institute → `--networking` (coral, `#FF6B6B`) — mobilization & convening
- Centella Impact → `--investment` (lime, `#CCFF00`) — capital & long-term sustainability

The intent is that each sub-brand inherits the work-color tied to its primary mode of operation. The work-color tokens (`--advisory`, `--networking`, `--investment`) are named after the work area, not the hue, so the mapping is by intent rather than color. `--violet` remains the principal brand color for shared chrome — sub-brand accents differentiate context, they don't replace the umbrella color.

**Files updated:** `design.md` (Sub-Brands table + new explanatory paragraph), `src/pages/styleguide.astro` (subbrands data array, line 72), `share/_index.json` (NGL Barcelona accent → networking), `share/index.html` (regenerated). The homepage `src/pages/index.astro` and the dark-pillar CSS in `home-min__pillar--networking` were already correct.

**How to apply:** when wiring a new piece of UI to a sub-brand, use the sub-brand's mapped work-color, not `--violet`. The principal color is for the umbrella site/brand, not for any one sub-brand. If a sub-brand surface needs the principal color in a layered composition (e.g. an Institute panel on a violet ground), that's fine — but the Institute *accent* is `--networking`.

---

## 2026-04-29 — `/share/` gets a lobby, manifest-driven

`share/` started filling up — two NGL Barcelona deck variants, the four-direction Prime Movers brochure — with no entry point. Anyone visiting `/share/` would hit a directory listing or a 404 depending on host config, and the file slugs aren't self-explanatory. Added `share/index.html` as a public-facing lobby for everything Centella has shipped to an audience outside the team.

**Manifest-driven, not auto-discovered.** `share/_index.json` is the source of truth for what each project is — title, eyebrow, kind, description, accent token, and artifact list. `scripts/build-share-index.mjs` reads it and renders `share/index.html`. Auto-discovery was tempting (walk `share/`, pull titles from filenames) but the descriptions and project groupings can't be derived from the filesystem — `ngl-barcelona-standalone.html` and `ngl-barcelona-en-standalone.html` are *one* project (a deck in two languages), not two. The manifest keeps that grouping and the descriptions in one editable place.

**The script still cross-checks disk.** Every artifact href in the manifest is verified to exist on disk (file or directory-with-index.html), and any top-level entry under `share/` that isn't referenced by the manifest emits a warning. So the manifest stays the source of truth, but the script catches "I added a file and forgot to add a description" errors.

**Self-contained chrome.** The lobby uses Centella tokens (Barlow superfamily, dark surfaces, brand palette, gradient display accent) but inlines everything as CSS custom properties and pulls Barlow from Google Fonts. No Astro dependency — `share/index.html` is a static file in the publish tray, served as-is at `/share/index.html` by the existing `copy-share.mjs` postbuild. That keeps it consistent with how every other artifact under `share/` works (commit-tracked, locally-built, bit-identical to deployed).

**Wired into npm scripts.** Added `npm run share:index` for fast iteration on just the lobby, and chained `build-share-index.mjs` into `npm run share:build` so the one-shot regenerates the lobby alongside decks and work projects. Order: `astro build` → decks → work → lobby. Lobby last because it cross-checks artifacts that the earlier steps produce.

---

## 2026-04-29 — Print CSS pattern for client mockup deliverables

The four Prime Movers mockups printed to PDF with transparent backgrounds. Two underlying causes — both inherent to how browsers handle print, both worth fixing once and standardizing.

**Cause 1: dark viewing scaffold leaks through.** The mockups have `html, body { background: #1a1a1c }` so the spreads sit on a dark matte for screen review. The existing print stylesheet only zeroed `body`, not `html`, and some browsers fill from the `html` element — leaving the matte color (or transparency, depending on viewer) behind the printed pages. Fix: explicitly `html, body { background: white !important }` inside `@media print`. The `!important` is needed because the screen rule uses a compound selector (`html, body { ... }`) that has higher specificity than a single-element selector.

**Cause 2: browsers strip background colors in print by default.** The "save the user's ink" assumption — backgrounds and decorative fills are removed unless explicitly opted in. For a brochure mockup whose identity *is* the paper color (cream, violet-light, soft pink), this turns the artifact into a wireframe. Fix: `print-color-adjust: exact` (and the `-webkit-` prefix for older Safari) on `*` so every element honors its declared backgrounds.

**The pattern, for any future print-targeted client work:**

```css
@media print {
  html, body { background: white !important; padding: 0; margin: 0;
               -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  * { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  .doc-header, .spread-label, .legend { display: none; }   /* hide review chrome */
  .spread { box-shadow: none; margin: 0; page-break-after: always; }
}
```

Substitute `.spread` with whatever the printable element is (Option C uses `.h-page`).

**Why `*` is safe.** Could have been surgical — only the spreads and their colored panels — but in these mockups the colored fills are everywhere (accent words wrapped in `box-decoration-break: clone`, callout backgrounds, panel fills, practical-info boxes). The blanket `*` rule has no downside because the dark scaffold is killed explicitly by `html, body { background: white }`. Nothing's left that we'd want stripped.

**The viewing scaffold convention itself.** Mockup files use a dark `html, body` background as the matte the spreads sit on for screen review. It's review chrome, not part of the artifact. Always pair it with a print stylesheet that flips it to white — never assume the user only views these on screen.

**Update — Safari/Quartz needs a `body::before` fallback.** The `html, body { background: white !important }` swap works in Chrome's print engine but NOT in macOS Quartz PDFContext (Safari "Save as PDF"). Quartz preserves the screen html/body background even with `!important` and even with `print-color-adjust: exact`. The dark scaffold leaks through everywhere outside the spreads, AND it leaks through *inside* elements whose own backgrounds use a transparent-falloff gradient over a solid color (like `linear-gradient(..., transparent 50%), var(--paper)`) — Quartz preserves the gradient layer but strips the solid layer beneath, exposing the scaffold.

**Quartz also drops `mix-blend-mode` entirely.** Option B's cover used a base linear gradient with a `::before` overlay of two radial gradients (white highlight, dark shadow) blended via `mix-blend-mode: overlay` for a watercolor wash. In Chrome's print engine this renders correctly; in Quartz the blend mode is ignored and the radial gradients sit on top as opaque circles, turning a corner-to-corner gradient into what reads as a "sphere." Generalized rule: anything that depends on `mix-blend-mode`, `backdrop-filter`, or other late-stage compositing features is screen-only and should be `display: none` (or have its blend mode neutralized) inside `@media print`. The base layer beneath the blended overlay should already carry the artifact's intent on its own — if it doesn't, the design is fragile to any non-Chrome PDF tool.

**Reliable fix for the scaffold:** add a fixed-position `body::before` white cover in `@media print`:

```css
body::before {
  content: "";
  position: fixed;
  inset: 0;
  background: white;
  z-index: -1;
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
}
```

It's a real DOM-level paint layer (not the canvas), which Quartz renders correctly. With `z-index: -1` it sits behind all content — anywhere a real element's background gets stripped, it falls through to white instead of the dark scaffold. Bundle this with the existing `html, body { background: white !important }` rule (still useful for Chrome and as a belt-and-suspenders) so the print stylesheet works across all browsers/PDF tools.

---

## 2026-04-29 — First-deploy gotchas: Vercel adapter + root `api/` + dual output dirs

The first live deploy at `centella-global.vercel.app` surfaced two bugs that aren't visible in local builds. Recording them so they don't bite again.

**Bug 1: `/api/subscribe` returns `FUNCTION_INVOCATION_FAILED` at runtime.** The function deployed (Vercel's filesystem auto-detection still picks up `api/*.ts` even when `@astrojs/vercel` is writing a Build Output API v3 bundle for everything else), but it crashed on every invocation with no useful error from `curl`. Root cause: `api/subscribe.ts` imported `from '../src/lib/mailchimp'`. When the Astro adapter owns `.vercel/output/`, Vercel's `@vercel/node` builder picks up the root `api/` folder as a *separate* deployment unit and does not always bundle imports outside that folder. The function file itself ends up on Vercel's runtime, but the imported module is missing from the bundle, and any reference to it throws at startup.

**Fix:** inlined the Mailchimp helper into `api/subscribe.ts`. The function bundle is now self-contained — the only external dependency is `node:crypto` (stdlib) and `@vercel/node` types (which are stripped at compile time). `src/lib/mailchimp.ts` was deleted as dead code; if a second consumer ever appears (e.g. a blog newsletter endpoint), re-extract from the inline copy.

**Lesson, written into CLAUDE.md "Things to avoid":** API functions in the root `api/` folder must not import from `src/`. Either inline the helper or put it under `api/_lib/` (which the `@vercel/node` builder does include in the function bundle). Keep the function file self-contained.

**Bug 2: `/share/*` returns 404 on every URL.** All the `share/*` paths I asked Pablo to smoke-test 404'd — including the Barcelona standalone deck, the homepage of which was supposed to be the proof point of the share/ wiring. Root cause: `scripts/copy-share.mjs` wrote to `dist/share/` only, but with `@astrojs/vercel` as the active adapter, Vercel doesn't serve `dist/` — it serves `.vercel/output/static/` (the adapter's Build Output API destination). The Astro build copies most things from `dist/` into `.vercel/output/static/` automatically, but anything written to `dist/` *after* `astro build` finishes (i.e. our postbuild step) doesn't get carried across.

**Fix:** `copy-share.mjs` now writes into *both* `dist/share/` and `.vercel/output/static/share/`. The dual-target keeps `astro preview` working (reads `dist/`) while the Vercel deploy bundle gets the files where it actually serves them from.

**Lesson, written into CLAUDE.md "Things to avoid":** any postbuild that adds files to the deploy bundle must mirror into both `dist/` (for `astro preview`) and `.vercel/output/static/` (for Vercel deploy). The Astro adapter doesn't carry late-arriving `dist/` content over.

**Why this didn't surface locally:** `npm run build` produces both directories, and the postbuild was writing to `dist/` correctly, so a local `astro preview` happily served `/share/*`. The disconnect only shows up in the Vercel runtime, where `.vercel/output/static/` is the served root.

---

## 2026-04-29 — All work projects and all presentations export into `share/`

Generalized the share/ pipeline so every client project under `work/` and every presentation under `src/pages/presentations/` lands at a `/share/...` URL with one command.

**`scripts/build-work.mjs`** (npm: `work:build`) walks `work/*/`, finds any project with a `mockups/` subdirectory, and copies the contents to `share/<project>/`. Wipes the destination first so deletions propagate. Skips projects that don't have `mockups/`.

**`scripts/inline-deck.mjs`** now iterates over `dist/presentations/*/` when invoked with no `<slug>` argument, bundling every presentation into a `share/<slug>-standalone.html` in one pass. The single-slug invocation still works (`npm run deck:standalone -- <slug>`).

**`npm run share:build`** chains `astro build` → all decks → all work projects. This is the canonical "regenerate everything in share/ from current sources" call, run before committing share/ updates.

**The `mockups/` convention.** A `work/<project>/` directory holds the whole project (briefs, README, source PSDs, internal notes); `mockups/` is the explicit shareable subset. Files outside `mockups/` are not exposed to `share/`. New client projects need only drop their shareable HTML into `work/<project>/mockups/` for `work:build` to pick them up.

**Why bundles are NOT auto-rebuilt on Vercel.** `npm run build` still only does `astro build && copy-share.mjs` — standalones are local-built, committed, and copied verbatim into `dist/share/` during deploy. Re-bundling on CI would mean a deck shared on date X by email could differ from the deployed version on the same date even if the source hadn't changed. Canonicality > one-step deploy. The trade is one extra command (`share:build`) before commit.

**Files touched today:** added `scripts/build-work.mjs`; rewrote `scripts/inline-deck.mjs` to iterate; added `work:build`, `decks:standalone`, `share:build` npm scripts; kept `deck:standalone` as a single-slug alias.

---

## 2026-04-29 — Vercel deploy goes live; `share/` mirrored to `/share/*`

Wired the project up for actual deployment instead of treating it as a build-and-ignore exercise. Three things landed together:

**1. `share/` now ships with the build.** Added `scripts/copy-share.mjs` as a postbuild step (`build` is now `astro build && node scripts/copy-share.mjs`). It walks `share/`, skips `.gitkeep`/`.DS_Store`, and copies everything into `dist/share/`. Vercel serves `dist/` as the static root, so anything in `share/` is reachable at `/share/<filename>` once deployed. This honors the "future-site-ready" intent of the share/ convention without a separate build pipeline.

**2. `inline-deck.mjs` now writes to `share/` directly,** instead of the repo root. The previous version wrote `<slug>-standalone.html` at the project root and counted on `*-standalone.html` in `.gitignore` to keep it out of git. Now it writes `share/<slug>-standalone.html` and the file is a tracked deliverable.

**3. `.gitignore` rule tightened.** `*-standalone.html` (matched at any depth) became `/*-standalone.html` (only the repo root). This keeps any stray root-level export out of the repo while letting `share/*-standalone.html` be tracked. The Barcelona deck (`share/ngl-barcelona-en-standalone.html`, ~2.3 MB) is now committed.

**Why commit the bundle instead of building it on Vercel:** the standalone export is a "what shipped on this date" artifact — it's how decks get shared by email or USB to people who won't open a browser tab. Re-bundling on every CI run would mean a deck shared yesterday and a deck shared today could differ even if the source didn't, and it'd break offline reproducibility. Treating the bundle as a tracked output (built locally, committed when ready, deployed alongside the site) keeps it canonical.

**API route:** `api/subscribe.ts` doesn't need anything special — Vercel's filesystem convention auto-detects `api/*.ts` at the repo root and deploys it as a serverless function regardless of what the Astro adapter writes into `.vercel/output/`. So Mailchimp signups work on the deployed site without extra wiring.

**Preview URL strategy:** public, no password gate, no robots blocking yet. The site is destined to be public anyway, and gating preview URLs is a Vercel Pro feature we don't need to spend on for an early-stage site. If indexing becomes a concern before launch we can add a `robots.txt` later.

**What this supersedes:** the prior MEMORY entry about the inline-deck not yet migrating to `share/` is now resolved. Removed that paragraph.

---

## 2026-04-29 — `share/` directory for standalone HTML outputs

Established a convention: any self-contained HTML artifact produced for sharing — visual explainers, one-pagers, ad-hoc decks built outside the `npm run deck:standalone` pipeline, exported reports — goes in `share/` at the repo root, not in the repo root itself or in ad-hoc paths.

**Why:** the repo is going to become the Centella website. Files placed at predictable static-asset paths now will already be reachable as URLs once the site is live, with no migration or reorganization. Until then, `share/` is the local publish tray. This also reframes the "how do I share an HTML file via Slack so it doesn't show as a code preview" problem — the answer becomes "host it from the site" once the repo is deployed; in the meantime, zip-and-send works for one-offs.

**Why not `public/`:** `public/` is Astro's static-asset root for the site build (favicons, hero media, per-deck asset folders). It's part of the site bundle and follows Astro's conventions. `share/` is a publish tray for self-contained documents that aren't structurally part of the site shell — they're documents that happen to be HTML. Keeping them separate now means we can decide per-file whether something promotes into a real Astro page later.

**Materialized:** `share/.gitkeep` so the directory exists in the repo (Git ignores empty directories). _Update 2026-04-29:_ `scripts/inline-deck.mjs` now writes here directly, and the build mirrors `share/` → `dist/share/` so files are served at `/share/<filename>` once deployed. See the deploy entry above.

---

## 2026-04-28 — Bilingual presentation decks: duplicate file, no i18n abstraction

Built an English version of the NGL Barcelona deck (`src/pages/presentations/ngl-barcelona-en.astro`) alongside the Spanish original. The convention going forward: when a deck needs another language, **duplicate the `.astro` file, suffix the slug with the language code (e.g. `-en`), and translate the strings inline.** Don't introduce an i18n abstraction (no `src/i18n/`, no string tables, no shared partials).

**Why:** decks are leaf documents — large, hand-tuned, single-file by design (per the decks-as-pages convention in `CLAUDE.md`). Sharing strings across language variants would force the markup into a shape it wasn't designed for, and the cost of duplicating a file is low. The duplicated file inherits all infrastructure for free: `<deck-stage>` letterbox scaling, the `Presentation` layout, the `npm run deck:standalone -- <slug>` pipeline, font loading, etc.

**What changes between Spanish and English:** body copy, slide `data-label` strings, footer text (chrome `mark` and `pg`), the cover slide label ("Portada" → "Cover"), date stamp ("JULIO 2026" → "JULY 2026"), and the `lang` attribute on `<Presentation>` (`"es"` → `"en"`). Everything else is identical.

**When to revisit:** if more than two languages or more than two decks need translation simultaneously, the duplication cost starts to matter. At that point, consider a content-collection approach (Astro content collections + per-locale data + a single deck template). Until then, two files is the right answer.

The Spanish file remains canonical (no language suffix); language variants get suffixes. Routes: `/presentations/ngl-barcelona/` (Spanish, default), `/presentations/ngl-barcelona-en/` (English).

---

## 2026-04-28 — Prime Movers brochure: bright Centella palettes on light grounds (revision)

Pablo asked for the three Prime Movers 20th mockups to be revised so the palette pulls from Centella's own token system but stays applied to the existing light grounds — bright, cheery, on-brand. Each option is now restricted to two Centella color families (per the `design.md` "no more than two color families per composition" rule):

- **Option A (`option-a-contemporary.html`)** — `--violet` + `--global`. Paper: `--violet-light` #F7EDFF. Ink: `--violet-dark` #1E1A28. Welcome-left flipped from dark ink to bright orange (`--global` #FF9500) with dark-ink text. Pocket page is bright violet (`--violet` #C77DFF) with dark-ink text. Headline accent words sit inside violet swatches via `box-decoration-break: clone`.
- **Option B (`option-b-warm.html`)** — `--networking` + `--global`. Paper: `--global-light` #FFF3E1. Ink: `--networking-dark` #22181C. Cover photo plate is now a coral→orange→wine sunset gradient. Italic emphasis words sit in coral swatches. Earlier draft mixed three families (had a stray violet labeled `--teal`); the revision drops that to comply with the two-family rule. The `--teal` token remains in `:root` mapped to `--ink` so legacy markup still parses.
- **Option C (`option-c-classical.html`)** — `--tech` + `--global`. Paper: `--tech-light` #FFE6F5 (pale pink). Ink: `--tech-dark` #2A1522 (deep plum). The `--A-oxblood-deep` and `--A-gold-deep` tokens were redefined to deeper accessible variants (#A52B7D and #8A4F00) so all Roman numeral / italic accent text passes WCAG AA; the brights (`--A-oxblood` #FF66C4 / `--A-gold` #FF9500) are reserved for fills, drop caps, and the dark-divider-page accent numerals only.

**Architecture rule that survived this round:** brights are *fills*; family-darks are *text*; reverse type inside bright fills is the same family-dark (always 6.2–7.8:1, AAA in most cases). Body copy clears AAA on all three (14–16:1).

**Why this matters going forward:** when the Centella token system is applied to *light* grounds, every saturated Centella bright (violet, advisory cyan, networking coral, investment lime, global orange, tech pink) fails AA contrast for body-size text on the corresponding light variant. They earn their keep as fills with dark text, as decorative non-text glyphs, or as the *background* of a colored highlight wrapping dark-text accent words (`background: var(--accent); padding: 0 0.18em; border-radius: 6px; box-decoration-break: clone;`). For accent text at 18pt+ that needs more pop than family-dark, a deepened-but-still-on-brand variant (e.g. tech #A52B7D, global #8A4F00) reaches 5.5:1+. Worth promoting these `-deep` accent-text tokens into `global.css` if the same pattern recurs.

**Hunt Alternatives identity preserved.** Typography, format, photography direction, and voice are unchanged per direction. Only the palette source changed. If Swanee reads any of the three as "too Centella," the fix is reducing fill saturation (or de-saturating the paper), not unwinding the palette.

**Files touched:** `work/prime-movers-20th/mockups/option-a-contemporary.html`, `option-b-warm.html`, `option-c-classical.html`, `index.html`. Legend dl on each option file rewritten to describe the new palette honestly (token names, contrast ratios, fill-vs-text discipline). Per-option swatch CSS in `index.html` updated.

---

## 2026-04-27 — Prime Movers & the Next Generation brochure: three design directions, client-led identity

Event title locked: **Prime Movers & the Next Generation**, theme **Meeting the Moment**, occasion **The Twentieth Anniversary**. (Initial drafts said "Prime Movers Reunion" — superseded.) Started a new client deliverable for Hunt Alternatives — the printed program brochure. Working folder is `work/prime-movers-20th/` (folder name kept as-is for stability even though the title evolved). Centella is the producer, but the printed brochure leads with Hunt Alternatives / Prime Movers identity, not Centella's. Centella appears in the colophon only unless Swanee directs otherwise.

**Format locked:** 6×9 portrait, saddle-stitched, ~24–32pp, with a printed pocket on the inside back cover for a separately-printed agenda insert. The pocket-and-insert pattern lets the bulk of the book go to the printer early while the agenda stays fluid until the morning of (Swanee's working style).

**Cut from print:** Hunt Alternatives org description and Swanee's bio. (Welcome and About Prime Movers were cut briefly in v2 then restored differently in v3 — see below.)

**Final section list (v3):** Cover · Welcome from Ambassador Hunt · Welcome from Giovanna Alvarez Negretti (logistical) · Thought piece by Swanee · Bios of Prime Movers · Bios of Next Generation Leaders · Maps to locations · Code of Conduct · Emergency contacts · Contact info · Pharmacy / Hospital / Emergency · Agenda (separate insert in pocket).

**Visual motifs requested by client:** boxes (using Centella's panel pattern — outer rule + inner frame + hard edges + 4–8px radius) and quote callouts sprinkled throughout. Each option adapts the box pattern to its identity (Option A: cream + gold inner rule; Option B: hard-edged 8px panels with ultramarine; Option C: warm 8px panels with terracotta inner frame).

**2026-04-28 follow-up — three additional options (D/E/F) reproduced from a Claude Design hand-off bundle.** Pablo dropped in an `api.anthropic.com/v1/design/...` URL pointing at his parallel brochure mockups built in Claude Design (claude.ai/design). The bundle is a gzipped tar with React/JSX option files, a `brochure-v2.css` stylesheet, sample data (`data.js`), the bundled Centella font kit, the design tool's chat transcript, and a "CODING AGENTS: READ THIS FIRST" README. The bundle's design conversation followed essentially the same arc this session did (same final TOC, same direction labels, same Hunt-not-Centella identity reframe), so the three v2 options become a parallel set rather than replacements.

**Where to find the source bundle:** `outputs/brochure-bundle/prime-movers/` in this session. Source JSX is `option-{a,b,c}2.jsx`; styles in `brochure-v2.css`; data in `data.js`. To unpack a Claude Design bundle next time: the URL returns gzipped tar binary even when treated as text — `curl --compressed` or piping through `gunzip -c | tar -x` works. The bundle's chat transcript in `chats/chat1.md` is high-signal; read it before reproducing.

**Set 1 vs. Set 2 differences worth remembering:**
- Set 2 uses single-page format (one 6×9 page rendered at a time); Set 1 uses facing 12×9 spreads. Both are mockup-format choices, not production constraints.
- Set 2's box motif puts the eyebrow label cut into the top border (fieldset-legend style). Set 1's bordered eyebrow sits inside the box. Set 2's is more refined.
- Set 2 includes a separate Title page, Contents page, dark Section divider pages, and Emergency / Pharmacy as their own spreads. Set 1 consolidates more.
- Set 2's Option F has soft section nomenclature ("How we'll be" / "In case you need us" / "A new generation"). Open question whether Swanee wants the warmth or the formality.
- Set 2's E has neon-green pop accent (#E8FF3A); much sharper than Set 1 B's burnt orange.
- Set 2's F has duotone gradient bio monograms that match the cover treatment — a unified visual system rather than a swatch.

**2026-04-28 down-select to three:** Pablo kept **B (Set 1 contemporary), C (Set 1 warm), and D (Set 2 classical)**. Cut A (the Set 1 classical was redundant once D was preferred for that direction), E (Set 2 contemporary — B's burnt-orange + Inter Tight read better for him than E's neon-green), and F (Set 2 warm — C kept because of facing-spread format, and the soft section nomenclature in F was undecided).

**Index-page changes Pablo asked for at down-select:** removed "for Swanee" framing throughout (use "review" or "participants" instead). Replaced the eyebrow text at the top with the full-width Centella logo divider (`public/logo-divider.svg`, inlined, filled at 10% paper opacity to blend muted on the dark page). Called out in the lede that **all copy is placeholder including names** and that **nothing is typeset**. Removed the "What I need from you (Pablo) before lock" section. Trimmed "What's the same" down to trim/format + section order; section order is now an `<ol>`. Per-option pages: doc-header now reads "Mockup for review"; "What Swanee will feel" → "What participants will feel"; D's "Origin" and "Differences from my Option A" lines removed.

**Three design directions delivered (`work/prime-movers-20th/mockups/`):**

- **A — Classical / editorial.** Cormorant Garamond + Source Serif 4 + Inter labels. Cream paper, ink, oxblood, gold rules. Drop caps, Roman numerals. Reads as institutional weight, milestone occasion. Reference: NYRB, university press.
- **B — Contemporary / progressive.** Inter Tight + Inter + JetBrains Mono. Cream paper, near-black ink, ultramarine accent, sparing burnt orange. Modular blocks, mono labels, stat rows. Reads as forward-looking, current movement. Reference: Aperture, MIT Press.
- **C — Warm / human.** Lora italic-forward + Source Serif 4 + Inter labels. Warm ivory, charcoal, terracotta + teal + ochre, ornament glyphs. Photo-led cover, italic numerals. Reads as relationship-forward, the people in the room. Reference: Aperture, Magnum photo books.

Each delivered as a self-contained HTML file showing four spreads at 6×9 print proportion (cover, bio spread, code of conduct, agenda pocket page) after the welcome and About cuts. Real headings and titles populated, placeholder Latin where copy isn't in yet — per direction that Swanee can't read a layout from color swatches alone.

Open questions for Pablo before lock are listed in `work/prime-movers-20th/README.md`.

---

## 2026-04-27 — Letterbox scaling + standalone deck export

### Letterbox scaling in `<deck-stage>`

The original `_fit()` in the deck-stage web component locked the canvas to viewport CSS pixels — meaning slide content (sized in absolute px against the 1920×1080 design canvas) clipped on small or short viewports. Replaced with proper letterbox scaling: keep the canvas at design size and apply `transform: scale(min(vw/dw, vh/dh))`. Now the deck always fits any viewport with bars on the short axis, and content adapts to height as well as width.

`noscale` attribute still bypasses the transform for the PPTX exporter and other tools that want unscaled DOM geometry.

### Standalone single-file deck export

Decks need to be sendable as email attachments or USB hand-offs. Added `scripts/inline-deck.mjs` and `npm run deck:standalone -- <slug>`, which:

1. Runs `astro build`
2. Reads the built `dist/presentations/<slug>/index.html`
3. Reads the linked `_astro/*.css` file, base64-inlines every woff2 referenced via `url(...)`
4. Inlines image references (svg/webp/png/jpg) as data URIs
5. Strips `<source>` MP4 tags (the cover poster carries the visual; we don't want to base64 a 1MB video)
6. Folds the CSS into a `<style>` tag and writes `<slug>-standalone.html` at the repo root

Output for NGL Barcelona is ~2.3MB. Opens directly via `file://` in any modern browser.

### Eyebrow tags removed from NGL Barcelona

The small uppercase coral labels above each headline ("CONTEXTO · 2026", "EL PROGRAMA", etc.) were stripped — 12 `.eyebrow-tag` spans, 2 `.num` section labels, 1 `.q-attr` quote attribution. Card-level mini-eyebrows ("CRISIS ÉTICA", "PILAR 01") were kept. The CSS rule for `.eyebrow-tag` was deleted along with the markup. If a future deck wants slide eyebrows, redefine the rule per-deck rather than reaching into a shared base.

---

## 2026-04-26 — Presentation decks as first-class Astro pages

### Decision

Decks (NGL Barcelona was the first) live at `src/pages/presentations/[slug].astro` and ship with the site build. The earlier rule that `presentations/` was an untracked scratch folder is reversed.

### Why

If a deck has to be sent to anyone — speakers, sponsors, colleagues — it needs a URL. Hosting it elsewhere just to get a URL is silly when the site is already a static deploy on Vercel.

### Layout

`src/layouts/Presentation.astro` is a minimal full-bleed shell: `<html><head>{meta + title}</head><body><slot/></body></html>`. No `SiteHeader`, no `SiteFooter`. Decks own the viewport — site chrome would fight the design.

### Astro directives for self-contained decks

Decks brought in from external tools (Pencil, Keynote exports, hand-built HTML) typically have their own scaler, fonts, web components, and inline JS. To stop Astro from touching any of it:

- Every `<style>` block in the page → `<style is:global>` (no scope hashing).
- Every `<script>` block in the page → `<script is:inline>` (no bundling, no hoisting).

Astro will still extract `is:global` styles to a `/_astro/*.css` file at build, which is fine.

### Asset paths

Per-deck assets (fonts, images, logos) live at `public/presentations/[slug]/assets/`, referenced from CSS/HTML with absolute paths (`/presentations/[slug]/assets/...`). Absolute paths avoid surprises with trailing-slash and prefetch behavior.

### CLAUDE.md / design.md updates

Both updated to document the convention. The previous "don't touch `presentations/`" rule in `CLAUDE.md` is replaced with the actual convention.

---

## 2026-04-18 — Homepage display headline, accent gradient variants, and text-clip fix

### Hero typography

The homepage hero `h1` uses the global `.display` utility (Barlow Condensed 300, fluid size) with inline `.display__accent` spans for emphasized phrases.

### Six gradient variants + optional random assignment

Each approved `--grad-*` token maps to a modifier class `display__accent--violet-coral`, `display__accent--cyan-lime`, `display__accent--coral-orange`, `display__accent--pink-violet`, `display__accent--cyan-violet`, and `display__accent--lime-teal` (always paired with `.display__accent`). Spans may carry `data-random-accent-gradient`; `src/components/RandomDisplayAccents.astro` (included from `Base.astro`) runs a tiny end-of-body inline script that picks one variant per marked element on each page load. Logo rule unchanged: no gradients on the logo mark.

### `background-image` vs `background` shorthand on clipped text

Using the `background` shorthand for gradient fills resets `background-clip` to its initial `border-box`, which breaks `background-clip: text` and shows a gradient rectangle behind glyphs. Accent styles set **`background-image`** for the gradient and keep clip/fill on the shared `.display__accent` / `.display--gradient` rules.

### Node version

`.nvmrc` pins **20** (Astro 5). Run `nvm use` in the repo before `npm run dev` / `npm run build` if the shell default is older Node.

---

## 2026-04-17 — Global utility-first CSS pass and typography weight shift

### Local style duplication reduced

We completed a broad CSS consolidation pass so pages/components rely more on shared global styles instead of local hardcoded declarations. New reusable utilities now live in `src/styles/global.css`:

- `.page-heading`
- `.page-intro`
- `.page-simple`
- `.page-copy`

These replace repeated per-page heading/intro/copy blocks across blog/events index and the three pillar destination pages.

### Card base styling now centralized

`EventCard` and `BlogPostCard` now compose the shared `.card` class for base surface, border, hover lift, and shadow behavior. Component-local CSS remains only for content-specific internals (image sizing, metadata layout), reducing drift from design tokens.

### Headline weight direction changed

Design direction now favors lighter headline/display weights. Global heading defaults were reduced from heavy display values to medium values (`500`), and homepage/styleguide local overrides were updated to visually reflect this. The styleguide typography specimens were also adjusted so examples match the actual implemented system.

---

## 2026-04-17 — Global chrome unification and menu hidden-state fix

### Homepage chrome became the site-wide shell

The homepage header/footer pattern is now canonical across the whole site. We extracted that UI into `src/components/SiteHeader.astro` and `src/components/SiteFooter.astro`, and `src/layouts/Base.astro` now renders those by default. This replaces the previous split where homepage used `hideChrome` and other routes used separate `Nav` / `Footer` components.

### Pillar section and CTA destination pages added

Homepage now includes a post-event “three foundational pillars” section with stacked panels. CTA targets are implemented as static pages:

- `/centella-advisory`
- `/centella-institute`
- `/centella-impact`

Each page currently carries the panel title + body copy as its initial content.

### Important implementation detail

When using `[hidden]` for overlays/drawers, never rely on native behavior if the base class sets `display`. The extracted menu initially stayed visible because `.site-header__menu { display: flex; }` overrode hidden rendering. Canonical fix now in place:

` .site-header__menu[hidden] { display: none; } `

### Icon governance tightened

Icon usage is now explicitly repository-gated: only pre-existing icons in `src/assets/icons/` are allowed unless a task explicitly approves adding new assets. This rule is documented in `design.md`.

---

## 2026-04-16 — PRD §11: product-level video and progressive enhancement

### Cross-cutting policy, not homepage-only

`docs/PRD.md` v1.3 adds **§11 Media, video, and progressive enhancement policy**: poster-first ambient video, encoded resolution ladder, no full masters in git, reproducible `ffmpeg`/WebP pipeline, `preload` discipline, and client gates (`prefers-reduced-motion`, `saveData`, `effectiveType` for slow classifications). **§8** now states the only deliberate runtime JS beyond Mailchimp is inline scripts that implement this section. Deviations require `MEMORY.md` plus a PRD version note.

---

## 2026-04-16 — Homepage shell, hero video policy, and asset pipeline

### Minimal homepage and latest-event logic

The homepage is a thin marketing shell: custom header/footer links only (via `hideChrome` on `Base`), hero, one “Latest event” row powered by `getHomepageLatestEvent()` (upcoming published event first, else most recent past published), and no other sections. Full-site Nav/Footer components are not rendered on that page to avoid duplicate chrome.

### Hero background: static-first, video as enhancement

Hero uses a committed **WebP poster** as the always-on background layer (`fetchpriority="high"`). **H.264 variants** live at 540p (narrow viewports) and 720p (wider); they are small enough to ship in `public/media/hero/` (~1.5 MB combined vs a single ~7 MB source). The **full-size source MP4 is not kept in git**; editors regenerate outputs with `scripts/optimize-hero-media.sh` / `npm run media:hero -- <path>` after installing `ffmpeg` and `cwebp` (e.g. Homebrew).

The `<video>` element ships with **`preload="none"`** and **no `src` in HTML**. An **inline** script (no Astro island, no extra client bundle) assigns `src` and calls `play()` only when `prefers-reduced-motion` is not reduced and `navigator.connection` (when present) does not indicate `saveData` or `slow-2g` / `2g` / `3g`. Otherwise visitors see the poster only — no MP4 download. This is an explicit exception to the “zero JS” ideal for the rest of the site; it is narrowly scoped and justified for Global South bandwidth.

### PRD alignment entry unchanged in substance

The same-day PRD lock-in (Notion deploy trigger, multi-author blog, `/events/past`) remains authoritative; this entry documents **implementation** choices that followed.

---

## 2026-04-16 — PRD alignment decisions locked

### Manual Notion deploy trigger selected for v1

We finalized the publishing trigger model: deploys are triggered from Notion automation only (manual "Deploy now" flow for v1). Slack is reserved for deploy notifications and alerts, not trigger control.

### Multi-author blog schema confirmed

Blog schema direction is now explicit: support multiple authors. This is no longer an open question and should be reflected in Notion schema and type decisions going forward.

### Dedicated past events archive confirmed

We will include a dedicated archive page at `/events/past`, rather than relying only on the general events listing for historical events.

---

## 2026-04-14 — Notion workspace: personal now, corporate later

### CMS databases are in Pablo's personal Notion for beta testing

The five Website CMS databases live in Pablo's personal Notion workspace right now. This is intentional — it's faster for testing the integration. The plan is to migrate to the Centella corporate Notion account before the site goes into production use by the content team.

The architecture already handles this cleanly: all database IDs and the API key come from environment variables. Migration means: create a new Notion integration in the corporate workspace, duplicate or recreate the databases (same schemas), update the `.env` values. Zero code changes.

Things to watch for during migration: (1) Notion file URLs are workspace-specific and expire — any images uploaded in the personal workspace won't carry over automatically, (2) the integration needs to be connected to the databases in the new workspace (the step people always forget), (3) if the corporate account has different permission levels, the integration may need broader access than just "Read content."

---

## 2026-04-14 — Mailchimp ↔ Attendees integration deferred

### Attendees component shelved for v1

We explored connecting the Notion Attendees database to Mailchimp signups — the idea being that the content team could tag a subscriber `feature-on-website` in Mailchimp and have them appear on the event page. Two approaches considered: (1) query Mailchimp directly at build time, (2) Mailchimp tag triggers a sync to Notion where the content team enriches the profile. The second was stronger because editorial control (photos, bios) is better in Notion than Mailchimp's merge fields.

Decision: shelve the whole thing. Not enough value to justify the complexity at launch. The Attendees database schema stays in the types file as a future consideration, but no integration work, no sync, no Mailchimp-to-Notion pipeline. If the need becomes clear after a few events, we revisit — and the thinking is captured here so we don't start from scratch.

---

## 2026-04-14 — Project inception and architecture decisions

### Why we're leaving Framer

Framer creates too much friction for the two things the site actually needs to do: capture emails for Mailchimp and spin up event pages. Every event page is a manual build in Framer, disconnected from the team's actual workflow (Notion). The site doesn't need a visual builder — it needs a content pipeline that starts in Notion and ends with a deployed static page.

### Astro over Next.js, Gatsby, or plain HTML

Astro gives us static-first output (no JS shipped by default) with the escape hatch of islands architecture for interactive components. Next.js would work but ships more JS than we need for what's essentially a content site. Gatsby's plugin ecosystem for Notion is stale. Plain HTML would mean no templating system for event pages, which is the whole point.

The islands architecture matters specifically for the Mailchimp form — it needs client-side JS for form submission, but nothing else on the page does.

### Notion as CMS (not Contentful, Sanity, or Markdown files)

The team already lives in Notion. Any CMS that requires a separate interface is a non-starter — it would mean two tools instead of one. Markdown files in the repo would require the content team to learn git. Notion API gives us structured data (database properties) and rich content (page body blocks) from the tool they already use daily.

Trade-off: Notion API has rate limits and the block rendering requires a custom mapper. We're accepting that complexity in exchange for zero workflow change for the content team.

### Vercel over Netlify

Both would work at free tier. Vercel's serverless functions live in `api/` at the project root with zero config, which is simpler than Netlify Functions. Vercel also has slightly better Astro integration. Not a strong preference — we can migrate later if needed.

### Static generation (SSG) over server-side rendering (SSR)

The site rebuilds when someone triggers a deploy, not on every request. Content changes maybe a few times a week at most. SSG means the site loads from CDN with no runtime dependency on Notion. If Notion goes down, the site stays up.

Historical note: at project inception we planned manual deploy hooks in both Slack and Notion. This is superseded by the 2026-04-16 decision: Notion publish trigger for deploys, Slack for notifications only.

### Deploy hooks in both Slack and Notion (superseded)

This was an earlier approach. Superseded on 2026-04-16: v1 deploy triggering is Notion automation only, with Slack used for notifications.

### Schedule as page body content, not a separate database

Event schedules live in the Notion page body as structured content (headings for time slots, lists for session details). This keeps it simple — the content team writes the schedule in the same place they write the event description, using Notion's native editor.

Trade-off: we can't query individual sessions across events (e.g., "show me all panels happening this week"). If that need emerges, we'll add a Schedule database. For now, the simpler approach wins.

### Attendees as a separate database (like Speakers and Sponsors)

Attendees get their own Notion database with the same shape as Speakers — Name, Title/Role, Organization, Photo, Bio. This lets us display notable attendees on event pages (think: "who's in the room" social proof) without conflating them with speakers. An attendee can appear across multiple events via Notion relations.

### Blog section added to scope

Originally listed as a non-goal ("blog or news section"), but reconsidered. Centella needs a place to publish thinking and updates beyond events. Blog Posts get their own Notion database (Title, Slug, Status, Published Date, Authors, Tags, Summary, Hero Image) and the same build-time fetching pattern as events.

### Mailchimp tagging strategy

Each form submission includes a tag identifying where the signup came from. The homepage form sends a generic tag (e.g., `homepage-signup`). Event pages send the event's `Mailchimp Tag` property (e.g., `build-summit-2026`). Blog pages could send a `blog-signup` tag or a post-specific tag. Tags are set via hidden form fields and processed by the serverless function.

### Custom Notion block renderer over third-party library

We're writing our own block-to-HTML mapper rather than using `@notion-render/client` or similar. Reasons: (1) the output HTML needs to be clean and predictable for styling, (2) we want to handle unknown block types gracefully (skip, don't crash), (3) the dependency surface stays small. If the mapper grows beyond ~200 lines, we'll reconsider.

---

## Decisions still pending

- **Mailchimp audience ID**: which list/audience do the forms feed into? Blocks API integration.
- **Notion workspace + database IDs**: needed to configure `notion.ts`. Pablo needs to set up or share the databases.
- **Slack notification channel/workflow**: where should deploy status notifications be posted?
- **Image hosting strategy**: Notion file URLs expire. We may need to download and cache images at build time, or use a proxy. Needs research.
