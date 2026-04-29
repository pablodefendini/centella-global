# Centella Design System

Source of truth: `src/styles/global.css` (tokens) and `/styleguide` (living reference).
Derived from *Centella Brand Guidelines v1.0 — February 2026*.

This system is **architectural and assertive**. It is built for *clarity under pressure* — compositions that feel decisive, directional, and difficult to ignore. Nothing is ornamental or by accident; nothing is casual by default.

---

## Color System

Colors are organized into **functional families**, not arbitrary swatches. Each family has a `primary` (default), a `dark` (authority, gravity), and a `light` (openness, space) variant. Deep tones establish credibility; bright hues introduce urgency and momentum.

### Principal brand


| Token            | Hex       | Role                                                |
| ---------------- | --------- | --------------------------------------------------- |
| `--violet`       | `#C77DFF` | Primary brand color. Synthesis, depth, seriousness. |
| `--violet-dark`  | `#1E1A28` | Authority, gravity, anchoring.                      |
| `--violet-light` | `#F7EDFF` | Openness, space, inverse surfaces.                  |


### Work colors


| Token                | Hex       | Role                                                    |
| -------------------- | --------- | ------------------------------------------------------- |
| `--advisory`         | `#00E5FF` | Strategy & guidance. Trust, stability, precision.       |
| `--advisory-dark`    | `#0E2228` | Formal advisory materials, reports, presentations.      |
| `--advisory-light`   | `#E1FCFF` | Approachability and transparency.                       |
| `--networking`       | `#FF6B6B` | Mobilization & power. Urgency, connection, activation.  |
| `--networking-dark`  | `#22181C` | Ground urgency in seriousness.                          |
| `--networking-light` | `#FFE8E8` | Highlights, data points, CTAs without overwhelming.     |
| `--investment`       | `#CCFF00` | Capital & impact. Growth, long-term sustainability.     |
| `--investment-dark`  | `#1E2413` | Discipline and credibility, investment-facing contexts. |
| `--investment-light` | `#FAFFE6` | Regeneration, possibility, future orientation.          |


### Theme colors


| Token            | Hex       | Role                                                 |
| ---------------- | --------- | ---------------------------------------------------- |
| `--global`       | `#FF9500` | Scale & reach. Cross-border connection. Accent only. |
| `--global-dark`  | `#301C00` | Anchor moments of emphasis.                          |
| `--global-light` | `#FFF3E1` | Warmth and openness.                                 |
| `--tech`         | `#FF66C4` | Innovation & experimentation. Primary accent.        |
| `--tech-dark`    | `#2A1522` | Dark grounding for tech-driven moments.              |
| `--tech-light`   | `#FFE6F5` | Soft supporting surface for tech accents.            |


### Surface & text (semantic)


| Token                | Hex / Value                 | Role                             |
| -------------------- | --------------------------- | -------------------------------- |
| `--bg-deep`          | `#060607`                   | Page background (default).       |
| `--bg-primary`       | `#080809`                   | Section background.              |
| `--bg-surface`       | `#0D0D0F`                   | Card background.                 |
| `--bg-elevated`      | `#151517`                   | Input fields, elevated elements. |
| `--bg-lavender`      | `#F7EDFF`                   | Light inverse surface.           |
| `--color-text`       | `#F7EDFF`                   | Primary text.                    |
| `--color-text-muted` | `rgba(247, 237, 255, 0.6)`  | Secondary text, descriptions.    |
| `--color-text-dim`   | `rgba(247, 237, 255, 0.35)` | Tertiary / meta labels.          |
| `--color-border`     | `rgba(247, 237, 255, 0.08)` | Hairline borders.                |


### Semantic state colors


| State   | Token          | Hex       |
| ------- | -------------- | --------- |
| Success | `--investment` | `#CCFF00` |
| Error   | `--networking` | `#FF6B6B` |
| Warning | `--global`     | `#FF9500` |
| Info    | `--advisory`   | `#00E5FF` |


Status feedback text should use these same tokens (e.g. `.form-status--success { color: var(--investment); }`).

### Approved gradients (web only — never on logo)

```css
linear-gradient(135deg, var(--violet),     var(--networking));   /* violet → coral */
linear-gradient(135deg, var(--advisory),   var(--investment));   /* cyan → lime */
linear-gradient(135deg, var(--networking), var(--global));       /* coral → orange */
linear-gradient(135deg, var(--tech),       var(--violet));       /* pink → violet */
linear-gradient(135deg, var(--advisory),   var(--violet));       /* cyan → violet */
linear-gradient(135deg, var(--investment), var(--advisory));     /* lime → teal */
```

### System rules

- **Do not** mix more than two color families in a single composition.
- Use `-dark` variants for authority, `-light` variants for space.
- Avoid treating all colors as equal — hierarchy matters.
- Color should support meaning, not replace it.
- **Hard rule:** inline-link hover/focus states should always use a contrasting tone relative to the link's base color.
- **Hard rule:** links inside tone-coded surfaces must inherit the surface tone and keep contrasting tone-based hover/focus states (never switch to unrelated global accents).
- Never recolor the logo lockup outside the approved palette.

**Implementation note (required):**

```css
.inline-link {
  --inline-link-color: var(--accent-purple);
  --inline-link-hover-color: var(--accent-coral); /* contrasting tone */
  color: var(--inline-link-color);
}

.inline-link:hover,
.inline-link:focus-visible {
  color: var(--inline-link-hover-color);
}

.tone-surface a:not(.btn) {
  --inline-link-color: currentColor;
  --inline-link-hover-color: color-mix(in srgb, currentColor 82%, white);
}

.tone-surface a:not(.btn):hover,
.tone-surface a:not(.btn):focus-visible {
  color: var(--inline-link-hover-color);
}
```

### Per-page key color

Each landing page declares a **single key color** — `--page-accent` — that drives the shared chrome (header logo, menu toggle, nav links, footer logo) and is available to page-local CSS as one consistent token. Centella Advisory keys to `--advisory`; Centella Institute will key to `--networking`; Centella Impact will key to `--investment`. Neutral pages (home, blog, styleguide) inherit the default — `--violet-light`, the soft lavender that doubles as primary text color on dark surfaces. The default is intentionally muted so the chrome reads as Centella-neutral until a page asserts its tone.

**Defining and overriding:**

```css
:root {
  --page-accent: var(--violet-light); /* default — soft, neutral */
}
```

Pages override on `<body>` via the `pageAccent` prop on `Base.astro`:

```astro
<Base title="Centella Advisory" pageAccent="var(--advisory)">
  …
</Base>
```

That writes `style="--page-accent: var(--advisory);"` on `<body>`, so the variable cascades to the entire page. Pass any color expression — a token reference (`var(--networking)`), a hex (`#00E5FF`), or even a `color-mix` if you need something between two families.

**Hover/active states (system-wide):** never declare a parallel `--page-accent-hover` token. Derive the state inline from the single source:

```css
.thing:hover {
  color: color-mix(in srgb, var(--page-accent) 80%, white); /* tint  */
}
.thing:active {
  color: color-mix(in srgb, var(--page-accent) 80%, black); /* shade */
}
```

One token per page; no parallel variables to drift. This applies anywhere in the design system that responds to `--page-accent` — buttons, links, panels, tone-surfaces — not just the chrome.

**Hard rules:**

- `--page-accent` must always resolve to a brand-palette token (or a derivation of one). Never set it to an arbitrary hex outside the palette.
- The header and footer logo render via CSS mask of an SVG lockup with `background-color: var(--page-accent)` — *do not* recolor by re-introducing the legacy `filter: brightness(0) invert(…)` filter; mask is the canonical recolor path.
- Body buttons and inline links continue to use their declared accents (`--networking` for primary CTAs, `--violet` for secondary). Re-keying *those* to `--page-accent` is a per-page decision, not a system default.

### Per-page logo

Sub-brand pages also swap the header/footer lockup via `pageLogo` + `pageLogoWidth` on `Base.astro`. All approved lockups share the canonical **1079-unit height** of the main divider, so the chrome height stays constant across the site — only the visible logo width changes.

| Page                                      | Lockup                          | viewBox W |
| ----------------------------------------- | ------------------------------- | --------- |
| Default (home, blog, styleguide, others)  | `/logo-divider.svg`             | `8694`    |
| Centella Advisory                         | `/centella-advisory-logo.svg`   | `3943`    |
| Centella Institute                        | `/centella-institute-logo.svg`  | `3943`    |
| Centella Impact                           | `/centella-impact-logo.svg`     | `3943`    |

```astro
<Base
  title="Centella Advisory"
  pageAccent="var(--advisory)"
  pageLogo="/centella-advisory-logo.svg"
  pageLogoWidth={3943}
>
  …
</Base>
```

`pageLogo` writes `--page-logo: url(<path>)` and `pageLogoWidth` writes `--page-logo-width: <number>` on `<body>`. The chrome consumes both: `height: calc(100vw * 1079 / 8694)` (fixed to the main logo's height); `width: calc(100vw * var(--page-logo-width, 8694) / 8694)`. The full divider fills the viewport at 100vw; the sub-brand lockups land at ~45.4vw, anchored to the viewport's left edge by `margin-inline: calc(50% - 50vw)` and `mask-position: left center`.

**Hard rules:**

- All lockups added to the system must share the 1079-unit height. Otherwise the chrome will jump between pages.
- Lockups live at `/public/<slug>-logo.svg` and are referenced by absolute path (`/<slug>-logo.svg`).
- Don't switch the lockup without also switching `pageAccent`. Sub-brand pages key their lockup *and* their tone together.

---

## Typography

Typography is one of Centella's most important expressive tools. Hierarchy comes from **weight, width, and scale** — never from mixing too many families. Discipline reinforces authority.

### Font families


| Token            | Family                  | Role                                                                                                                                    |
| ---------------- | ----------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| `--font-display` | `Barlow Condensed`      | **Default display voice.** Headlines, posters, section headers, program names. Focused, urgent, efficient.                              |
| `--font-heading` | `Barlow`                | Card titles, sub-headlines, contexts where comfort matters.                                                                             |
| `--font-semi`    | `Barlow Semi Condensed` | Labels, nav, buttons, eyebrows, metadata. Always tracked out.                                                                           |
| `--font-body`    | `Barlow`                | Paragraphs, form fields, interface copy, long-form reading. Regular width for comfort and endurance.                                    |
| `--font-mono`    | `Barlow Condensed`      | Code, technical values, hex codes. One family, many voices — monospaced contexts use Barlow Condensed rather than a separate mono face. |


**One family, many voices.** The Barlow superfamily — Condensed, Regular, and Semi Condensed — does all the work. Discipline inside one family reinforces authority more than reaching for a second typeface ever could. Hierarchy comes from width, weight, and scale, not from introducing a serif.

### Type scale


| Token         | Size       | Typical use                                         |
| ------------- | ---------- | --------------------------------------------------- |
| `--text-6xl`  | `4.507rem` | Hero display / campaign moments (use sparingly).    |
| `--text-5xl`  | `3.634rem` | Large hero headline / section feature callouts.     |
| `--text-4xl`  | `2.931rem` | H1 default. Page titles.                            |
| `--text-3xl`  | `2.364rem` | H2. Section titles.                                 |
| `--text-2xl`  | `1.907rem` | H3. Card titles, sub-section headers.               |
| `--text-xl`   | `1.538rem` | H4. Lead paragraphs, emphasized body.               |
| `--text-lg`   | `1.24rem`  | H5 / large body.                                    |
| `--text-base` | `1rem`     | Body default.                                       |
| `--text-sm`   | `0.806rem` | Small body, secondary copy, form labels.            |
| `--text-xs`   | `0.65rem`  | Eyebrows, meta, uppercase labels, ticker, captions. |


**Hero headlines** use the `.display` utility: `--font-display` (Barlow Condensed) at weight `300` (light), fluid `clamp(3rem, 9vw, 6rem)`, letter-spacing `-0.03em`, line-height `0.92`. Accent phrases inline with `.display__accent` (weight `800` + an approved brand gradient **clipped to text** via `background-clip: text`). Default gradient fill is `--grad-violet-coral`; other fills use modifier classes `display__accent--cyan-lime`, `display__accent--coral-orange`, `display__accent--pink-violet`, `display__accent--cyan-violet`, `display__accent--lime-teal`, or `display__accent--violet-coral` (explicit). Add `**data-random-accent-gradient`** on a span for a per-load random choice among those six. The 300 ↔ 800 contrast is the signature — don't approximate it with 500/700.

### Heading assignments


| Element | Family           | Weight | Letter-spacing | Line-height              |
| ------- | ---------------- | ------ | -------------- | ------------------------ |
| H1      | `--font-display` | 500    | `-0.02em`      | `--leading-tight` (1.15) |
| H2      | `--font-display` | 500    | `-0.02em`      | `--leading-tight`        |
| H3      | `--font-heading` | 500    | `-0.01em`      | `--leading-tight`        |
| H4      | `--font-heading` | 500    | `-0.01em`      | `--leading-tight`        |
| H5      | `--font-heading` | 500    | `-0.01em`      | `--leading-tight`        |
| H6      | `--font-heading` | 500    | `-0.01em`      | `--leading-tight`        |


### Body, labels, serif

- **Body** — `--font-body` 400, line-height `--leading-normal` (1.6). Long-form: `--leading-relaxed` (1.75).
- **Labels / eyebrows / buttons / nav** — `--font-semi` 600, uppercase, letter-spacing `0.15em`–`0.25em`.
- **Lede / pull quotes / callouts** — `--font-body` 300–400, `--text-lg` to `--text-xl`, line-height 1.5.

### Font weights used

`300` (light) · `400` (regular) · `500` (medium) · `600` (semibold) · `700` (bold) · `800` (extrabold) · `900` (black, avoid for headline/body UI).

**Rule:** avoid using more than 2–3 weights in a single composition.

### Line-height tokens


| Token               | Value  | Use                |
| ------------------- | ------ | ------------------ |
| `--leading-tight`   | `1.15` | Headings.          |
| `--leading-normal`  | `1.6`  | Body default.      |
| `--leading-relaxed` | `1.75` | Long-form reading. |


### Gradient display type (novel — web only)

The signature display treatment pairs a light (`300`) Barlow Condensed base with an inline extrabold (`800`) accent phrase, with the gradient clipped to the glyph shapes (`background-clip: text`). Reserve for hero headlines; never on logo, nav, or body copy. Any of the six approved `--grad-`* tokens may back accent text via the `display__accent--*` modifiers (see `src/styles/global.css`); surfaces and borders still use the same tokens where appropriate — the split is *context*, not a different palette.

**Implementation rule:** set gradient fills with `**background-image`**, not the `background` shorthand, on accent or whole-headline treatments. The shorthand resets `background-clip` and produces a rectangular gradient behind the text.

```html
<h1 class="display">
  <span class="display__accent" data-random-accent-gradient>Power. Strategy.</span> Win.
</h1>
```

```css
.display {
  font-family: var(--font-display);
  font-weight: 300;
  font-size: clamp(3rem, 9vw, 6rem);
  line-height: 0.92;
  letter-spacing: -0.03em;
}
.display__accent {
  font-weight: 800;
  color: transparent;
  -webkit-text-fill-color: transparent;
  -webkit-background-clip: text;
  background-clip: text;
  background-color: transparent;
  background-image: var(--grad-violet-coral);
  background-repeat: no-repeat;
}
/* Variants: .display__accent.display__accent--cyan-lime { background-image: var(--grad-cyan-lime); } … */
```

Use `.display--gradient` on the whole element only in the rare case where the entire headline is the accent.

---

## Spacing Scale

**Base unit: 4px** (0.25rem). All spacing values derive from it.


| Token        | rem       | px    | Named |
| ------------ | --------- | ----- | ----- |
| `--space-1`  | `0.25rem` | `4`   | `xs`  |
| `--space-2`  | `0.5rem`  | `8`   | `sm`  |
| `--space-3`  | `0.75rem` | `12`  | —     |
| `--space-4`  | `1rem`    | `16`  | `md`  |
| `--space-6`  | `1.5rem`  | `24`  | `lg`  |
| `--space-8`  | `2rem`    | `32`  | `xl`  |
| `--space-12` | `3rem`    | `48`  | `2xl` |
| `--space-16` | `4rem`    | `64`  | `3xl` |
| `--space-24` | `6rem`    | `96`  | `4xl` |
| `--space-32` | `8rem`    | `128` | `5xl` |


**Usage:**

- Component internals: `--space-2` to `--space-6`.
- Stacking related blocks: `--space-4` to `--space-8`.
- Section padding (top/bottom): `--space-16` to `--space-24`.
- Hero / signature section padding: `--space-32`.
- Generous margins and whitespace; space is an active design element, not an absence.

---

## Layout & Grid

### Container widths


| Token                | Value                   | Use                                 |
| -------------------- | ----------------------- | ----------------------------------- |
| `--max-width`        | `72rem` (1152px)        | Default container for most content. |
| `--max-width-narrow` | `48rem` (768px)         | Long-form prose, reading columns.   |
| `--gutter`           | `var(--space-6)` (24px) | Inline container padding.           |


Signature marketing pages may widen to `1200px` (`src/pages/index.astro`).

### Column grids

- `.grid` — `display: grid; gap: var(--space-8);` (32px default gap).
- `.grid--2` — 1 col on mobile; 2 cols at `≥640px`.
- `.grid--3` — 1 col on mobile; 2 cols at `≥640px`; 3 cols at `≥960px`.
- Card layouts commonly use `repeat(auto-fill, minmax(320px, 1fr))`.

### Responsive breakpoints


| Name   | Min width | Notes                                   |
| ------ | --------- | --------------------------------------- |
| Mobile | 0         | Default styles.                         |
| `sm`   | `560px`   | Small-phone threshold used by homepage. |
| `md`   | `640px`   | Tablet / two-column activation.         |
| `lg`   | `720px`   | Styleguide sub-grids activate here.     |
| `xl`   | `900px`   | Homepage tablet breakpoint.             |
| `2xl`  | `960px`   | Three-column grids activate here.       |


### Composition principles

- Generous margins and whitespace.
- Strong vertical rhythm; modular, flexible grids.
- Clarity, rhythm, breathing room — not clutter.
- Readable line lengths: 55–70 characters (body); ~60ch cap for prose blocks.
- Axes at `0°`, `90°`, `120°`, `150°` can align type, panels, and imagery — grounded but directional.

---

## Components

### Global utility classes

Prefer these shared utilities before creating page-local CSS:

- `.section` — standard vertical section spacing
- `.container` / `.container--narrow` — shared width + gutters
- `.grid`, `.grid--2`, `.grid--3` — responsive grid primitives
- `.card` — canonical card surface, border, and hover treatment
- `.text-muted` — semantic secondary text color
- `.page-heading` — standard top-level page heading spacing
- `.page-intro` — standard intro paragraph width/spacing
- `.page-simple` — narrow single-column content wrapper
- `.page-copy` — standard long-form body copy style for simple pages
- `.display` — hero display type (`--font-display` 300 light, fluid `clamp(3rem, 9vw, 6rem)`, tight tracking, line-height `0.92`)
- `.display__accent` — inline span inside `.display`: weight 800 + default `--grad-violet-coral` via `background-image`, clipped to text; pair with `display__accent--`* for other approved gradients or `data-random-accent-gradient` for a per-load random variant (see `RandomDisplayAccents.astro`)
- `.display--gradient` — element-level fallback that clips the whole headline to the default gradient (rare; hero only; never on logo/nav/body); variant classes use the same `display__accent--`* naming when needed
- `.eyebrow`, `.label` — Barlow Semi Condensed 600, uppercase, tracked `0.15em`, muted color
- `.lede`, `.pull-quote` — Barlow 300, `--text-xl`, line-height 1.5

**Element-level typography is intentionally unstyled.** `h1`–`h6` and `p` use browser defaults; reach for the utilities above (or compose directly with `--font-`* / `--text-`* tokens) to apply hierarchy. Do not add element-level selectors (`h1 { … }`) to `global.css`.

Rule: if a local selector only repeats tokenized spacing/typography already represented by these utilities, use the utility class instead of adding new local CSS.

### Buttons

All buttons share this base:

```css
.btn {
  display: inline-flex; align-items: center; justify-content: center;
  gap: var(--space-2);
  padding: var(--space-3) var(--space-6);       /* 12px 24px */
  font-family: var(--font-semi);
  font-size: var(--text-sm);
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  line-height: 1;
  border: 2px solid transparent;
  border-radius: 8px;
  cursor: pointer;
  transition: all var(--transition-base);
}
```

**Variants**


| Variant     | Class                                                                                       | Background     | Text                 | Border         |
| ----------- | ------------------------------------------------------------------------------------------- | -------------- | -------------------- | -------------- |
| Primary     | `.btn--primary`                                                                             | `--networking` | `--bg-deep`          | `--networking` |
| Secondary   | `.btn--secondary`                                                                           | `transparent`  | `--violet`           | `--violet`     |
| Ghost       | (inline `.btn-ghost` on homepage)                                                           | `transparent`  | `--color-text-muted` | none           |
| Destructive | *(not defined)* — if needed, base on `.btn--primary` with border `#b02a37` and hover coral. |                |                      |                |


**States**


| State    | Treatment                                                                                                    |
| -------- | ------------------------------------------------------------------------------------------------------------ |
| Hover    | `transform: translateY(-1px to -2px);` + glow box-shadow (`0 0 24–30px rgba(255,107,107,0.35)` for primary). |
| Active   | Remove translate; deepen shadow.                                                                             |
| Focus    | `outline: none; box-shadow: 0 0 0 3px rgba(199, 125, 255, 0.15);` (violet focus ring).                       |
| Disabled | `opacity: 0.6; cursor: wait;` — never change hue.                                                            |


Primary button hover never changes hue — only elevation and glow.

### Form inputs (text, email, textarea)

```css
.input {
  padding: var(--space-3) var(--space-4);           /* 12px 16px */
  background: var(--bg-elevated);
  color: var(--color-text);
  border: 1.5px solid var(--color-border);
  border-radius: 8px;
  font-family: var(--font-body);
  font-size: var(--text-base);
}
```

**States**


| State       | Treatment                                                                                   |
| ----------- | ------------------------------------------------------------------------------------------- |
| Placeholder | `color: var(--color-text-dim);`                                                             |
| Hover       | `border-color: rgba(247, 237, 255, 0.18);`                                                  |
| Focus       | `outline: none; border-color: var(--violet); box-shadow: 0 0 0 3px rgba(199,125,255,0.15);` |
| Error       | `border-color: var(--networking);` + helper text in `var(--networking)`.                    |
| Success     | Status text in `var(--investment)`.                                                         |
| Disabled    | `opacity: 0.6;`                                                                             |


**Form labels:** `--font-semi` 600, uppercase, `--text-xs`, `letter-spacing: 0.15em`, `color: --color-text-muted`.

### Cards

```css
.card {
  background: var(--bg-surface);
  border: 1px solid var(--color-border);
  border-radius: 6px;
  overflow: hidden;
  transition: all var(--transition-base);
}
.card:hover {
  transform: translateY(-4px);
  border-color: rgba(199, 125, 255, 0.3);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.4);
}
```

- Internal padding: `--space-6`.
- Media aspect ratio: `16 / 9` for event cards.
- Image hover: `transform: scale(1.04)` over `0.5s var(--ease)`.
- Stack internal elements with `gap: var(--space-2)`.

### Navigation

- Site-wide header/footer chrome is shared through `SiteHeader` and `SiteFooter` components via `Base.astro`.
- Header uses a full-bleed logo plus a fixed-position hamburger trigger; menu opens as a right-side overlay.
- Background uses dark surface treatment with blur (`backdrop-filter: blur(12px)`) on the overlay.
- Logo is rendered as a CSS mask on a `<span>` with `background-color: var(--page-accent)`, so the lockup picks up the per-page key color (default `--violet-light`). The default mask is `/logo-divider.svg` (the full-bleed wordmark + horizon, viewBox `8694×1079`); sub-brand pages swap to a narrower lockup (`/centella-{advisory|institute|impact}-logo.svg`, viewBox `3943×1079`) via Base's `pageLogo` + `pageLogoWidth` props. All lockups share the canonical 1079-unit height so chrome height stays constant. Minimum digital size `120px` width. Don't reintroduce the legacy `filter: brightness(0) invert(1)` recolor — mask is the canonical recolor path.
- Hamburger toggle: icon strokes inherit `var(--page-accent)`. Hover/focus fills the button with `--page-accent` and inverts strokes to `--bg-deep`; focus ring is a 2px deep-bg gap + 2px `--page-accent` ring against the page background.
- Menu links: `--font-semi` 500, `--text-sm`, uppercase, letter-spacing `0.06em`–`0.08em`. Default text uses `var(--page-accent)`; hover/focus uses the inline tint `color-mix(in srgb, var(--page-accent) 80%, white)`.
- Menu items must wrap (`flex-wrap: wrap`) on all viewports — never collapse to a burger.
- Any overlay menu using the `hidden` attribute must include explicit CSS fallback for display rules (for example, `[hidden] { display: none; }`) when base styles set `display`.

### Panels (colored context blocks per brand guide)

- Color is deployed through bold panels, not gradients or soft backgrounds.
- Hard edges, **never blurred or ornamental**.
- Always has an inner frame (`1px solid` at ~30% opacity of foreground) separating content from the panel edge.
- **Corner radius must be one of: `4px`, `8px`, or `16px`** — chosen by panel size (small / medium / large).

```css
.panel {
  padding: var(--space-3);           /* outer breathing space */
  border-radius: 8px;                /* 4 / 8 / 16 only */
}
.panel-frame {
  border: 1px solid <fg-at-30%>;
  border-radius: inherit;
  padding: var(--space-8) var(--space-6);
}
```

- **Hard rule:** any text link inside a panel must inherit panel tone (`currentColor`) and use tone-based hover/focus states.
- Add `.tone-surface` to any tone-coded panel/container to enforce this behavior site-wide.

### Icons

**Location.** All icons live in `src/assets/icons/` as SVG files whose fills are normalized to `currentColor`.

**Repository rule.** Use only icons that already exist in `src/assets/icons/`. Do not add new icon files unless there is explicit approval in the task requirements.

**Usage.** Inline via the `<Icon />` component:

```astro
---
import Icon from '../components/Icon.astro';
---
<Icon name="checkmark" size={24} label="Completed" />
<Icon name="money-bag" size={48} />
```

**Props**


| Prop    | Type     | Default | Notes                                                                                               |
| ------- | -------- | ------- | --------------------------------------------------------------------------------------------------- |
| `name`  | `string` | —       | Filename without `.svg`. All icon files are lowercase-with-dashes (e.g. `power-fist`, `money-bag`). |
| `size`  | `number  | string` | `24`                                                                                                |
| `label` | `string` | —       | Accessible label; omit for presentational icons.                                                    |
| `class` | `string` | —       | Passthrough for layout / color.                                                                     |


**Sizes**


| Context          | Size  |
| ---------------- | ----- |
| Inline with text | `16`  |
| UI default       | `24`  |
| Button / nav     | `24`  |
| Accent           | `32`  |
| Feature          | `48`  |
| Hero             | `72+` |


**Color.** Icons inherit `currentColor`. Set color via the wrapping element or `class`:

```astro
<div style="color: var(--advisory);"><Icon name="power-fist" size={48} /></div>
```

**Rules**

- Source: The Noun Project. **SVG only** — never raster.
- Single style per composition; never mix outline + filled.
- Color: primary dark tone or a single accent color — never multi-color.
- Align to the same axes and grid as typography.
- Icons should feel structural, not ornamental.
- Full library and preview at `/styleguide#icons`.

### Photography

- Treated as raw material, not precious imagery.
- Treatments: high contrast, crushed shadows, duotone / monotone overlays, heavy grain, hard cropping, unexpected framing.
- Should feel political, not illustrative; bold, not polite.
- Source: Unsplash (license-verified) or original commissioned work. Never stock-photo in tone.

### Logo lockup

- Use the full Spark + wordmark lockup in formal applications.
- Preserve proportions and spacing exactly.
- **Don't** separate the Spark from the wordmark; recolor outside the palette; rotate, skew, or distort; add shadows, glows, gradients, or textures; place on noisy or low-contrast backgrounds.
- Color variants: primary dark lockup on light / neutral backgrounds; light lockup on dark, saturated, or photographic backgrounds.
- Minimums: **25 mm** print, **120 px** digital.

### Ticker (marketing strip)

- Full-width bar, `--accent-coral` background, `--bg-deep` text.
- `--font-display` 700, uppercase, `--text-lg`.
- Marquee via `transform: translateX(0 → -50%)` over `25s linear infinite`; duplicate content in the track.

---

## Border Radius

**Core rule:** panels and framed surfaces must use only `4px`, `8px`, or `16px`.


| Token         | Value   | Component                                          |
| ------------- | ------- | -------------------------------------------------- |
| `radius-xs`   | `3px`   | Inline code, small chips.                          |
| `radius-sm`   | `4px`   | Small panels, callouts, small cards, status tags.  |
| `radius-md`   | `6px`   | Cards, event cards, code blocks.                   |
| `radius-lg`   | `8px`   | Buttons, inputs, medium panels, surface cards.     |
| `radius-xl`   | `12px`  | Large surfaces (e.g. color scale generator shell). |
| `radius-2xl`  | `16px`  | Large panels only.                                 |
| `radius-pill` | `999px` | Chips, tags, language pills.                       |
| `radius-full` | `50%`   | Avatars, icon bubbles, decorative circles.         |


*Spark Logo exception:* the two long rays are intentionally sharp-cornered; all other logo corners are rounded. Don't round them.

---

## Shadow

The system is **low-shadow**. Prefer elevation via transform and color rather than blurred shadows. When shadow is used, it is soft and directional.


| Token          | Value                                                               | Use                                             |
| -------------- | ------------------------------------------------------------------- | ----------------------------------------------- |
| `shadow-focus` | `0 0 0 3px rgba(199, 125, 255, 0.15)`                               | Focus rings on inputs and interactive elements. |
| `shadow-glow`  | `0 0 24px rgba(255, 107, 107, 0.4)`                                 | Primary button hover (coral glow).              |
| `shadow-hover` | `0 0 30px rgba(255, 107, 107, 0.35), 0 8px 24px rgba(0, 0, 0, 0.3)` | Primary button deeper hover.                    |
| `shadow-card`  | `0 12px 32px rgba(0, 0, 0, 0.4)`                                    | Card hover lift.                                |
| `shadow-panel` | none                                                                | Panels rely on frame + color, never blur.       |


**Rules**

- Never stack more than two shadows on one element.
- No drop shadow on the logo lockup.
- No shadow on photography — use duotone / overlay instead.

---

## Motion


| Token               | Value                             | Use                                                      |
| ------------------- | --------------------------------- | -------------------------------------------------------- |
| `--transition-fast` | `150ms ease`                      | Color, border changes, hover.                            |
| `--transition-base` | `250ms ease`                      | Default transitions.                                     |
| `--ease`            | `cubic-bezier(0.16, 1, 0.3, 1)`   | "Out-expo" — default for hover lifts, underline reveals. |
| `--ease-dramatic`   | `cubic-bezier(0.77, 0, 0.175, 1)` | Long, committed moves only.                              |
| `--duration`        | `200ms`                           | Micro-interactions.                                      |


**Principles**

- Transitions should feel deliberate, not showy.
- Hover lifts: `translateY(-1px)` to `translateY(-4px)` max.
- Image hover scale: `1.04`, never more.
- Respect `@media (prefers-reduced-motion: reduce)` — cap animation durations to `0.01ms`.

---

## Voice, Tone & Copy

Copy is part of the UI. Match the system's voice in any generated text.

- Confident, never arrogant. Provocative, never cynical. Inspiring, never naïve. Clear, never wonky.
- Strategist over commentator. Builder over critic. Global without being generic.
- Use deliberately: *power, strategy, win, build, shift, deliver, train, scale, rooted, ethical, Global South*.
- Avoid: *wonky, preachy, traditional, aloof, vague, inspirational-only*.
- Sub-brand names must always appear in full on first reference.

**Quick voice test.** Before shipping copy: (1) Does this point to a real power problem? (2) Is it clear who gains what? (3) Does it show how something changes in practice? (4) Would this sound honest in a closed room, not just on a website?

---

## Sub-Brands

All three share the Spark lockup, typography, and color system. Each has a single assigned accent.


| Sub-brand                | Accent                     | Feel                                                  |
| ------------------------ | -------------------------- | ----------------------------------------------------- |
| Centella Global Advisory | `--advisory` (`#00E5FF`)     | Rigorous, strategic, calm, precise.                   |
| Centella Institute       | `--networking` (`#FF6B6B`)   | Energetic, convening-oriented, pedagogical, flexible. |
| Centella Impact          | `--investment` (`#CCFF00`)   | Serious, disciplined, systems-oriented.               |

The sub-brand → work-color mapping is intentional. Each sub-brand inherits the work-color tied to its primary mode of operation: Advisory → strategy & guidance, Institute → mobilization & convening, Impact → capital & long-term sustainability. `--violet` remains the principal brand color across the umbrella; sub-brand accents differentiate context, never replace the principal color in shared chrome.


Programs and events (e.g. Spark Summit, Leadership Labs) are nested under sub-brands — never parallel to them.

---

## Presentation decks

Standalone HTML decks (e.g. NGL Barcelona) ship as first-class Astro pages under `/presentations/[slug]/` so they're shareable as URLs.

- **Layout:** `src/layouts/Presentation.astro` — minimal full-bleed HTML shell. No `SiteHeader`, no `SiteFooter`. The deck owns the viewport.
- **Page:** `src/pages/presentations/[slug].astro` — the deck markup itself. All inline `<style>` blocks must use `is:global` and all inline `<script>` blocks must use `is:inline` so Astro doesn't scope-rewrite the CSS or hoist/bundle the JS. Decks brought in from external tools usually have their own scaler, web components, and font loading; the toolchain should leave them alone.
- **Assets:** `public/presentations/[slug]/assets/` for fonts, images, logos. Reference with absolute paths (`/presentations/[slug]/assets/...`) so URLs resolve regardless of trailing-slash or prefetch behavior.
- **Branding:** decks may diverge from the global token system when the venue or audience demands it (custom palettes, custom type pairings), but should keep the Centella Spark lockup and one of the brand-anchor accent colors as the through-line.
- **Scaling:** the `<deck-stage>` web component renders the canvas at its authored design size (1920×1080 by default) and applies `transform: scale(min(vw/dw, vh/dh))` to fit any viewport with letterboxing. Authors size slide content in absolute px against the design canvas — never in `vh`/`vw` — and trust the scaler to adapt to small windows, projectors, and tablets without clipping content.
- **Standalone export:** `npm run deck:standalone -- <slug>` produces a single self-contained `<slug>-standalone.html` at the repo root with fonts, images, and CSS inlined, suitable for email or hand-off. Background MP4 sources are stripped from the export — the cover poster carries the visual.

---

## Pending / planned work

Tracked here so it doesn't get lost across sessions.

### Token vocabulary (canonical vs legacy)

The canonical token names are the brand-family names: `--violet`, `--advisory`, `--networking`, `--investment`, `--global`, `--tech` (+ `-dark` / `-light` variants). An older `--accent-`* vocabulary (`--accent-purple`, `--accent-coral`, `--accent-lime`, `--accent-cyan`, `--accent-orange`, `--accent-pink`) still exists in `global.css` as **deprecated aliases** pointing at the canonical tokens. Two legacy names — `--accent-teal` (`#00A3B6`) and `--accent-green` (`#6EA92B`) — have **no canonical equivalent** in the brand palette and should be treated as stale.

- **New code:** always use canonical names.
- **Deferred work (separate PR):** mechanical rename pass across `src/` to replace every `--accent-`* reference with its canonical equivalent, then delete the alias block from `global.css`. Kept out of the design-system consolidation to limit blast radius.

### Self-host Barlow & Barlow Condensed

All font families are loaded from Google Fonts today via `Base.astro`. The Centella Design System handoff bundle includes local TTFs for Barlow (100–900 + italics) and Barlow Condensed (100–900 + italics) — not Barlow Semi Condensed.

- **Deferred work:** copy the TTFs to `public/fonts/`, register `@font-face` declarations in `global.css`, drop Barlow + Barlow Condensed from the Google Fonts request, preload the 2–3 weights used above the fold. Barlow Semi Condensed stays on Google Fonts until brand delivers local files.
- **Why defer:** this is a perf win (fewer third-party requests, better Global South latency) but orthogonal to the current design-system consolidation. Worth its own PR with before/after Lighthouse numbers.

---

## Reference

- Live examples: `/styleguide`
- Tokens source: `src/styles/global.css`
- Homepage reference implementation: `src/pages/index.astro`
- Source brand document: *Centella Brand Guidelines v1.0 — February 2026*

