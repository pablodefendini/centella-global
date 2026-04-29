# Development Diary — Centella Global Website

This is the build log for centellaglobal.com, the website for Centella. Centella works with political leaders and movement builders across the Global South — re-energizing democratic movements, building civic tech, and investing in the next generation of political infrastructure. The site needs to do two things well: capture email addresses for our mailing list, and make it easy to spin up event pages without touching code.

I'm rebuilding the site from scratch using Astro, Notion as the CMS, and Vercel for hosting. This diary tracks the decisions, trade-offs, and progress as we go. Entries are in reverse chronological order.

---

## Entry 15 — April 29, 2026: a `share/` directory for standalone HTML outputs

Small convention move, but worth recording so it doesn't drift. The friction was that whenever I share a self-contained HTML file (one of the standalone decks, a visual explainer, a one-pager) in Slack, Slack unfurls it as a code preview instead of treating it as something a person can open. The first instinct was to bolt on a tiny hosting layer — drag-drop into tiiny.host, run surge, push to a Gist with raw.githack — but every one of those is a workaround for a thing this repo will eventually solve on its own. Once the site is live on Vercel, anything that lives in this repo at a predictable path is already a URL. So the answer isn't "set up hosting"; it's "put the files where the future site can pick them up."

The convention: any standalone HTML produced for sharing goes in `share/` at the repo root. Not `public/` — `public/` is Astro's static-asset root and is structurally part of the site build (favicons, hero media, per-deck asset folders). `share/` is a publish tray, a place for documents that happen to be HTML. Keeping them separate means we can decide per-file whether something graduates into a real Astro page later. Until the site is live, the workaround for Slack is just zipping the file before sending — Slack stops trying to preview a `.zip` and treats it as a download, which is crude but works.

One thing I'm flagging for later: `scripts/inline-deck.mjs` still writes `<slug>-standalone.html` at the repo root. The right move is to point it at `share/`, but I didn't want to ship a one-line code change in a docs commit. Both `CLAUDE.md` and `docs/MEMORY.md` note the misalignment so it doesn't get lost. Next time we touch the deck pipeline, that's the cleanup.

Updated `CLAUDE.md` (directory tree + a Patterns bullet pointing at the convention), `docs/MEMORY.md` (decision log entry with the why, including why not `public/`), and added `share/.gitkeep` so the directory exists in git. The auto-memory layer also has a feedback note so future sessions default to this path without me having to re-explain.

---

## Entry 14 — April 28, 2026: NGL Barcelona — small Spanish polish, dedicated Programa Piloto slide, English translation

Two passes on the NGL Barcelona deck, picking up from Entry 10.

The first was a small Spanish copy and structure pass. On the cover, "Barcelona / Progressive / Leadership Factory" became "Barcelona: / A Progressive / Leadership Factory" — the colon and the article are tiny moves that pull the reading rhythm into the right shape, and the first version was reading as three nouns rather than as a phrase. Then I split the Programa Piloto sidebar that had been crammed into slide 6 ("Por qué Barcelona") into its own slide (6b). The sidebar was always going to lose a fight for attention with the rest of slide 6, and the program-design specifics deserve their own air. The new slide leads with the cohort claim ("una cohorte internacional de 25 a 50 candidaturas municipales") on the left and three stat cards on the right — Cohorte (25–50), Formación (the three training pillars), Horizonte (documented to scale into 2027). The two-column layout lets the slide be read either as headline-plus-detail or as three independently scannable cards.

Then I built an English translation of the deck — `src/pages/presentations/ngl-barcelona-en.astro`, alongside the Spanish original. I duplicated the file and translated all body copy, slide labels, footers, and the date stamp ("JULIO 2026" → "JULY 2026"). The cover slide label changes from "Portada" to "Cover"; the deck `lang` attribute on the Presentation layout flips from `"es"` to `"en"`. Everything else — typography, layout, deck-stage scaling, standalone export — comes for free from the page-as-deck convention.

The thing I want to remember: when a deck needs a translation, the path of least resistance is "duplicate the file, suffix with `-en`, and translate strings inline" — not introducing an i18n abstraction. Decks are leaf documents, the cost of two files is low, and any attempt to share strings across files would force the deck markup into a shape it isn't designed for. If translations later proliferate (more languages, multiple decks), revisit. For now, two files is the right answer, and the standalone export pipeline (`npm run deck:standalone -- ngl-barcelona-en`) just works.

---

## Entry 13 — April 28, 2026 (later): Bright Centella palettes on the Prime Movers mockups

Pablo asked for the three Prime Movers 20th mockups to be revised so the colors are bright and cheery, drawn from Centella's own token system but applied to the existing light grounds. The original three directions were calibrated to Hunt Alternatives — restrained, editorial, warm-but-quiet. The revision keeps the typographic structure of each direction and only swaps the palette, in three pairs of Centella families, one pair per option:

**Option A — Contemporary** → `--violet` + `--global` (lavender + bright orange). Paper shifts from cream to `--violet-light` #F7EDFF; ink to `--violet-dark` #1E1A28. The welcome-left, which was a dark ink panel, is now a bright orange panel with dark-on-bright text. The pocket page goes bright violet. Headline accent words sit inside violet swatches — a bright "moment" inside an otherwise quiet headline.

**Option B — Warm** → `--networking` + `--global` (coral + bright orange). The earlier draft mixed three families (networking + global + a stray violet labeled "teal"); the revision drops the violet to comply with Centella's "no more than two color families per composition" rule. Cover photo plate becomes a coral-to-orange-to-deep-wine sunset gradient. Italic emphasis words sit in coral swatches; the venue pill flips from light-on-coral to dark-on-coral for AA contrast.

**Option C — Classical** → `--tech` + `--global` (bright pink + bright orange). Paper shifts from cream to `--tech-light` #FFE6F5 — the most overtly cheery move of the three. Body ink becomes `--tech-dark` #2A1522 (deep plum). The big change here is that the original `--A-oxblood` (bright pink #FF66C4) used as italic-accent text fails AA contrast on light grounds (2.4:1). I redefined `--A-oxblood-deep` and `--A-gold-deep` to deeper accessible variants (#A52B7D and #8A4F00, both 5.5:1+) and routed all `color: var(--A-oxblood)` references through the deep variant. The bright pink is preserved for fills only — boxes, cover frame, drop caps, dark-divider-page accents.

The architecture I'm holding to throughout: brights are *fills*; family-darks are *text*; reverse type inside bright fills is the same family-dark (always 6.2–7.8:1, AAA in most cases). Body copy clears AAA on all three options (14–16:1). The "two-family rule" from `design.md` is enforced per option — there's no third family creeping in.

A note on the "Hunt Alternatives, not Centella" framing from earlier entries: the brochure is still a Hunt Alternatives piece — typography, format, voice, photography all stay calibrated to Swanee's audience. What changed is just the color palette source. Pablo's brief was specifically that the colors should be Centella's, applied to the existing light grounds; the typographic identity of each direction is intact. Worth flagging back to him if Swanee reads any of the three as "too Centella" — if she does, the fix is reducing fill saturation, not unwinding the palette.

I also pruned the legend dl on each option file to describe the new palette honestly (token names, contrast ratios, fill-vs-text discipline) and updated the index comparison page so the swatches, accent variables, and "Palette" cell match the new tokens. The s-teal swatch class on Option B is now mis-named — it shows global/orange — but I left the class name to avoid a ripple of edits.

What I want to remember: when bright Centella colors are placed on light grounds, ~all of them (violet, coral, lime, cyan, pink, orange) fail body-text contrast. They earn their keep as fills with dark text, or as decorative non-text glyphs, or as the *background* of a colored highlight behind dark text. The cleanest way to keep brand "pop" in headline accents on light grounds is the highlight-fill move — wrap the accent word in a span with `background: var(--accent); padding: 0 0.18em; border-radius: 6px; box-decoration-break: clone;`. That's what Option A and B both do now.

---

## Entry 11 — April 27, 2026: Three design directions for the Prime Movers 20th brochure

Switched gears from the deck work to a new client deliverable — the printed program brochure Centella is producing for Hunt Alternatives' Prime Movers 20th Anniversary Reunion. Different problem, different audience, different identity. Worth its own working folder: `work/prime-movers-20th/`.

The brief had a lot moving in it — fluid agenda until the last minute, Swanee can't read a layout from color swatches alone, three options needed (not two), need to see real headings and titles, identity has to feel right for an established progressive philanthropy reunion rather than for Centella itself. The format question resolved early: 6×9 saddle-stitched booklet with a printed pocket on the inside back cover holding the late-binding agenda insert. That structure lets the body of the book go to print early while the agenda stays loose until morning-of.

I built three directions and put them in `mockups/`. Each is a self-contained HTML file showing six spreads at print proportion — cover, welcome from Swanee, About Prime Movers (program + next-generation approach), a participant bio spread, the code of conduct, and the agenda pocket page. Real headings, real titles, placeholder Latin where copy isn't yet in. The point isn't the words — it's that Swanee can read the layout instead of guessing from a swatch.

**A — Classical / editorial.** Cormorant Garamond, oxblood and gold, drop caps, Roman numerals. Reads as institutional weight, milestone occasion. The closest reference is a New York Review of Books or a university press monograph. The 20-year mark earned, not announced.

**B — Contemporary / progressive.** Inter Tight at heavy weights, ultramarine accent, modular blocks, mono labels for structure. Reads as current movement, not commemoration. Closest references are Aperture and MIT Press. The 20-year mark as momentum, not monument.

**C — Warm / human.** Lora italic-forward, terracotta and teal and ochre, ornament glyphs, photo-led cover. Reads as the people in the room, not the institution that convened them. A yearbook for grown-ups. This is the one that needs photography to reach its full version, and that's the question I have to ask Pablo: do we have archival imagery from past convenings?

A thing I had to be careful about: Centella has a strong, well-documented design system in `design.md` — architectural, dark default, single Barlow superfamily, no serifs. It would have been easy to drift toward that. But this brochure is not a Centella piece. Centella is producing it for a client, and the client's program (Prime Movers, twenty years of progressive CEOs, Swanee Hunt's voice) needs an identity that fits that audience. So all three directions lead with Hunt Alternatives / Prime Movers; Centella ends up in the colophon. If Swanee asks for the producer's identity to come through more visibly, that's a separate brief and I'll know to flag it.

The other thing I'm holding open: the agenda. Jason will take Pablo's agenda and convert it to a 3-page grid format — Swanee has a graphic mind and can't process a 6-page linear agenda. The brochure design includes a placeholder pointer page facing the pocket on the inside back cover, but the agenda itself prints separately. Once Jason gets back from the printer with lead times, we can lock the file deadline for the main book and a later, separate one for the insert.

The three options live at `mockups/index.html` (the comparison page) plus one HTML file per direction. I also wrote a short `README.md` in the project folder so the context survives the conversation: format decisions, section order, open questions, critical path. The README is also a mental reset for me — when I come back to this in a week, I won't have to reconstruct what was settled and what wasn't.

Now I wait for Pablo's call on direction, dates, photography, and bio template.

**Update later that day.** Pablo cut both the welcome letter and the About Prime Movers description from the printed piece. Swanee will set context live in the room — the printed brochure is now a directory + reference + code-of-conduct + agenda holder, not a program book in the traditional sense. I stripped both spreads from all three options and re-numbered. The mockups are now four spreads each (cover, bios, conduct, pocket). One implication I'm flagging back to Pablo: with no welcome letter to set tone on the inside, the cover is doing more of the work. Worth a second pass on the cover treatment once a direction is picked.

**And then the title locked.** Pablo confirmed the event title: **Prime Movers & the Next Generation**, with **Meeting the Moment** as the theme. That's a real shift from the placeholder "Prime Movers Reunion" — and the longer title forced a typographic rework on each cover. Option A reorganized to put "Meeting the Moment" as the italic display line under the "20" numeral, with the long descriptive title set as the small-caps sub-line below the rule. Option B turned the saturated bottom band into a two-column grid: the theme as the bold display on the left, the descriptive title and tag stacked on the right. Option C swapped its previous warm-and-specific cover line ("Twenty years in. Still in the room.") for the official theme — a small loss of voice in exchange for the right name. Across all three, the doc-header strings and the index page got the new copy too. Worth noting for future me: the cover layouts are now sized for these specific copy lengths. If the title or theme changes again, the covers will need another typographic pass, not just a string swap.

**v3 — and then the brochure grew up.** Pablo came back with the final section list, and it's substantially more than v2. Two welcomes (Ambassador Hunt for the warm welcome, Giovanna Alvarez Negretti for the practical one), Swanee's thought piece (the personal/intellectual offering), the same bios, maps, code of conduct, emergency contacts, contact info, pharmacy/hospital, agenda insert. Plus two new design directives: client likes "boxes" as a visual motif, and quotes should be sprinkled throughout.

The boxes ask is interesting because Centella's own design system is built around exactly that pattern — bold panels with hard edges, an outer rule, an inner frame at lower opacity, 4–8–16px radius. So I lifted that pattern and adapted it to each of the three directions: Option A gets a cream-and-gold double-frame; Option B gets harder-edged 8px panels with ultramarine fills; Option C gets warmer 8px panels with terracotta inner rules. The quote box is a member of the same family — same outer-frame pattern, with an italic serif (A and C) or bold display (B) inside.

The new spreads I built per option: the two welcomes (Hunt + Giovanna), Swanee's thought piece (essay layout with drop cap + a sidebar quote), and a maps + practical info spread that consolidates the venue map, emergency contacts, hospital, pharmacy, and on-site phone numbers into one box-driven spread on the right side. In production the practical info will spread across multiple pages, but for the mockup, having it all in one place lets Swanee see how the boxes hold together as a system.

Quotes landed in three places per option: the thought piece (right page, between body paragraphs — feels editorial), the bios spread (one of the corners — feels like a participant testimonial), and the code of conduct (bottom of the left page — sets the room's tone). Sources are placeholders that read like real attributions ("A Prime Mover · 2024 cohort survey", "From an earlier convening · attributed", "A facilitator's note · 2019") so Pablo can swap in real quotes when he has them.

Page count is back up to ~28–36pp depending on bio length. Each option is now eight spreads in the mockup. The README, MEMORY, and DIARY all updated to keep future-me oriented.

One thing I'm watching: the Centella panel pattern is a strong visual move and Swanee said she likes boxes — but if she chooses Option A (the most editorial direction), the boxes might feel a little assertive against the otherwise restrained classical typography. Worth testing live whether to soften the box treatment for A or push it harder. Won't know until she sees it.

---

## Entry 12 — April 28, 2026: Three more directions from a Claude Design hand-off bundle

Pablo dropped in a URL pointing at a Claude Design hand-off bundle — `https://api.anthropic.com/v1/design/h/...?open_file=Brochure+Concepts+v2.html` — and asked me to reproduce its design language as Options D, E, and F alongside the A/B/C set I'd already built in this session. So this turned into an interesting day of forensic web fetching followed by careful reproduction.

The fetch was sneakier than I expected. The URL returns content that looks like JSON to my web-fetch tool, but it's really a gzipped tar archive. The tool's content-type sniffing got confused. I had to fall back to `curl --compressed` in the workspace bash and then `tar -xz` to unpack the bundle. Once unpacked, the structure made sense: a `prime-movers/` folder with a README ("CODING AGENTS: READ THIS FIRST" — Anthropic prepared this format thoughtfully), a chat transcript showing the full design conversation, and the React/JSX source for six option files (a, b, c, plus a2, b2, c2), a `brochure-v2.css` with all the styling for the v2 set, a `data.js` with bios + quotes + agenda + emergency contacts, and the full Centella font kit bundled in.

The chat transcript was the highest-signal document. It walked through Pablo's iteration with the design assistant: he started with two options (Document of Record vs Convening), then asked for three with the same Hunt-Alternatives-not-Centella reframe I'd ended up arriving at independently in this session, then asked for the title to lock to "Prime Movers & the Next Generation / Meeting the Moment" (same), then asked for the same final TOC restructure with two welcomes + thoughtpiece + boxes + quotes (same, again). It's a remarkable parallel — two separate AI design conversations converged on the same direction labels and the same final structure with no cross-talk. Tells me the design problem actually has those answers in it, not just one of us.

What the bundle's v2 options have that mine don't, distilled:

**Structural pages.** Bundle includes a separate Title page after the cover, a Contents page with paginated TOC, dark Section divider pages before each major section, and Emergency Contacts + Pharmacy/Hospital as their own spreads rather than consolidated. That's the difference between an 8-spread mockup and a 14-page mockup. If Swanee leans toward Set 2, the production booklet ends up at the same page count either way — the question is what gets shown to her now.

**The "outset label" box motif.** Bundle's boxes put the eyebrow label cut into the top border of the box, like a fieldset legend in old HTML — the label sits on the rule itself, in a small slot of paper-colored background. It's a more refined treatment than the bordered-eyebrow I used; it reads as more typographically sophisticated. I should remember this pattern for future work.

**Sharper accent moves.** D's italic ampersand in gold — a single character set as a typographic signature — appears on the cover, the title page, the contents, the headlines. It's small but it ties the system together. E's neon-green pop accent (#E8FF3A) is a more aggressive accent than my burnt orange and earns its keep — the "20" cover number in pop on dark navy is a real cover. F's terracotta-to-teal duotone gradient extends from the cover hero photograph through the bio monograms; it's a unified visual system, not a placeholder.

**Soft section nomenclature in F.** Bundle's C2 names the conduct section "How we'll be", the emergency section "In case you need us", the next-gen section "A new generation". That's an editorial decision, not just a styling decision — and it fits the warm direction. Worth flagging to Swanee as its own choice. She might love it; she might find it too informal.

I built D/E/F as faithful HTML reproductions of option-a2.jsx, option-b2.jsx, and option-c2.jsx — same data, same component patterns, same CSS variables, same page-by-page sequence. The bundle uses single-page mockup format (one 6×9 page rendered at a time, in the React design canvas); I kept that format for D/E/F so they read authentically. Set 1 stays as facing-spreads.

Updated the index page to show all six options in two sets of three (Cowork v3 + Claude Design v2), wrote a 6-column comparison grid, and added a "What the two sets share" / "Where Set 2 is further along" section so Pablo can frame the choice for Swanee. The README, MEMORY, and DIARY all updated to reflect the larger set.

The thing I want to remember: when Pablo hands off another bundle URL, the format is gzipped tar, the chat transcript is the goldmine, and the JSX is reproducible as flat HTML if you read the CSS first.

**Same day — down-select.** Pablo cut three of the six. The kept set is **B, C, D**: B for contemporary (his pick over the Set 2 E with the neon-green pop), C for warm (over F, in part because the facing-spread format reads better for the warmer direction), and D for classical (over A — the Set 2 D is materially more refined). The dropped files (A, E, F) are gone from `mockups/`. Bundle source still sits in the session outputs in case we want to pull anything from E or F later.

He also asked for a tighter index. Removed "for Swanee" from the headline (he framed it as a stand-in audience earlier, but the page is for review more broadly, not just for her). Replaced the small all-caps eyebrow at the top of the page with the full-bleed Centella logo divider (`public/logo-divider.svg`) inlined and filled at 10% paper opacity — a subdued mark across the full viewport width that says "this is from us" without shouting it. Called out in the lede that even the participant names are placeholders, and that nothing here is typeset. Cut the open-questions section. Trimmed the "What's the same" block to trim/format and a clean ordered-list of the section order — no more "Cut from print" or "Identity" or "What's new" sub-sections. Per-option pages got smaller edits: doc-header now reads "Mockup for review"; the "What Swanee will feel" line is now "What participants will feel"; on D I removed the "Origin" and "Differences from my Option A" lines because they were process commentary rather than something a reader needs.

The thing I want to remember from this round: when collapsing a set of options, the index page wants to feel like a single composed thing, not a layered comparison apparatus. Cutting commentary in legends and at the top is the move.

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