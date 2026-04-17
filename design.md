# Centella Design System

Source of truth: `src/styles/global.css` (tokens) and `/styleguide` (living reference).
Derived from *Centella Brand Guidelines v1.0 — February 2026*.

This system is **architectural and assertive**. It is built for *clarity under pressure* — compositions that feel decisive, directional, and difficult to ignore. Nothing is ornamental or by accident; nothing is casual by default.

---

## Color System

Colors are organized into **functional families**, not arbitrary swatches. Each family has a `primary` (default), a `dark` (authority, gravity), and a `light` (openness, space) variant. Deep tones establish credibility; bright hues introduce urgency and momentum.

### Principal brand

| Token            | Hex       | Role                                                 |
| ---------------- | --------- | ---------------------------------------------------- |
| `--violet`       | `#C77DFF` | Primary brand color. Synthesis, depth, seriousness.  |
| `--violet-dark`  | `#1E1A28` | Authority, gravity, anchoring.                       |
| `--violet-light` | `#F7EDFF` | Openness, space, inverse surfaces.                   |

### Work colors

| Token                | Hex       | Role                                                           |
| -------------------- | --------- | -------------------------------------------------------------- |
| `--advisory`         | `#00E5FF` | Strategy & guidance. Trust, stability, precision.              |
| `--advisory-dark`    | `#0E2228` | Formal advisory materials, reports, presentations.             |
| `--advisory-light`   | `#E1FCFF` | Approachability and transparency.                              |
| `--networking`       | `#FF6B6B` | Mobilization & power. Urgency, connection, activation.         |
| `--networking-dark`  | `#22181C` | Ground urgency in seriousness.                                 |
| `--networking-light` | `#FFE8E8` | Highlights, data points, CTAs without overwhelming.            |
| `--investment`       | `#CCFF00` | Capital & impact. Growth, long-term sustainability.            |
| `--investment-dark`  | `#1E2413` | Discipline and credibility, investment-facing contexts.        |
| `--investment-light` | `#FAFFE6` | Regeneration, possibility, future orientation.                 |

### Theme colors

| Token           | Hex       | Role                                                    |
| --------------- | --------- | ------------------------------------------------------- |
| `--global`      | `#FF9500` | Scale & reach. Cross-border connection. Accent only.    |
| `--global-dark` | `#301C00` | Anchor moments of emphasis.                             |
| `--global-light`| `#FFF3E1` | Warmth and openness.                                    |
| `--tech`        | `#FF66C4` | Innovation & experimentation. Use sparingly.            |

### Surface & text (semantic)

| Token                 | Hex / Value                  | Role                             |
| --------------------- | ---------------------------- | -------------------------------- |
| `--bg-deep`           | `#060607`                    | Page background (default).       |
| `--bg-primary`        | `#080809`                    | Section background.              |
| `--bg-surface`        | `#0D0D0F`                    | Card background.                 |
| `--bg-elevated`       | `#151517`                    | Input fields, elevated elements. |
| `--bg-lavender`       | `#F7EDFF`                    | Light inverse surface.           |
| `--color-text`        | `#F7EDFF`                    | Primary text.                    |
| `--color-text-muted`  | `rgba(247, 237, 255, 0.6)`   | Secondary text, descriptions.    |
| `--color-text-dim`    | `rgba(247, 237, 255, 0.35)`  | Tertiary / meta labels.          |
| `--color-border`      | `rgba(247, 237, 255, 0.08)`  | Hairline borders.                |

### Semantic state colors

| State   | Token           | Hex       |
| ------- | --------------- | --------- |
| Success | `--investment`  | `#CCFF00` |
| Error   | `--networking`  | `#FF6B6B` |
| Warning | `--global`      | `#FF9500` |
| Info    | `--advisory`    | `#00E5FF` |

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
- Never recolor the logo lockup outside the approved palette.

---

## Typography

Typography is one of Centella's most important expressive tools. Hierarchy comes from **weight, width, and scale** — never from mixing too many families. Discipline reinforces authority.

### Font families

| Token            | Family                   | Role                                                               |
| ---------------- | ------------------------ | ------------------------------------------------------------------ |
| `--font-display` | `Barlow Condensed`       | **Default display voice.** Headlines, posters, section headers, program names. Focused, urgent, efficient. |
| `--font-heading` | `Barlow`                 | Card titles, sub-headlines, contexts where comfort matters.        |
| `--font-semi`    | `Barlow Semi Condensed`  | Labels, nav, buttons, eyebrows, metadata. Always tracked out.      |
| `--font-body`    | `Barlow`                 | Paragraphs, form fields, interface copy, long-form reading. Regular width for comfort and endurance. |
| `--font-mono`    | `SF Mono, Fira Code, …`  | Code, technical values, hex codes.                                 |

**One family, many voices.** The Barlow superfamily — Condensed, Regular, and Semi Condensed — does all the work. Discipline inside one family reinforces authority more than reaching for a second typeface ever could. Hierarchy comes from width, weight, and scale, not from introducing a serif.

### Type scale

| Token         | Size       | Typical use                                                     |
| ------------- | ---------- | --------------------------------------------------------------- |
| `--text-4xl`  | `2.5rem`   | H1 default. Page titles.                                        |
| `--text-3xl`  | `1.875rem` | H2. Section titles.                                             |
| `--text-2xl`  | `1.5rem`   | H3. Card titles, sub-section headers.                           |
| `--text-xl`   | `1.25rem`  | H4. Lead paragraphs, emphasized body.                           |
| `--text-lg`   | `1.125rem` | H5 / large body.                                                |
| `--text-base` | `1rem`     | Body default.                                                   |
| `--text-sm`   | `0.875rem` | Small body, secondary copy, form labels.                        |
| `--text-xs`   | `0.75rem`  | Eyebrows, meta, uppercase labels, ticker, captions.             |

**Hero headlines** may scale above `--text-4xl` using a fluid clamp — e.g. `clamp(3rem, 9vw, 6rem)` — always in `--font-display`, weight `400–500`, letter-spacing `-0.03em`, line-height `0.92–0.95`.

### Heading assignments

| Element | Family           | Weight | Letter-spacing | Line-height          |
| ------- | ---------------- | ------ | -------------- | -------------------- |
| H1      | `--font-display` | 500    | `-0.02em`      | `--leading-tight` (1.15) |
| H2      | `--font-display` | 500    | `-0.02em`      | `--leading-tight`    |
| H3      | `--font-heading` | 500    | `-0.01em`      | `--leading-tight`    |
| H4      | `--font-heading` | 500    | `-0.01em`      | `--leading-tight`    |
| H5      | `--font-heading` | 500    | `-0.01em`      | `--leading-tight`    |
| H6      | `--font-heading` | 500    | `-0.01em`      | `--leading-tight`    |

### Body, labels, serif

- **Body** — `--font-body` 400, line-height `--leading-normal` (1.6). Long-form: `--leading-relaxed` (1.75).
- **Labels / eyebrows / buttons / nav** — `--font-semi` 600, uppercase, letter-spacing `0.15em`–`0.25em`.
- **Lede / pull quotes / callouts** — `--font-body` 300–400, `--text-lg` to `--text-xl`, line-height 1.5.

### Font weights used

`300` (light) · `400` (regular) · `500` (medium) · `600` (semibold) · `700` (bold) · `800` (extrabold) · `900` (black, avoid for headline/body UI).

**Rule:** avoid using more than 2–3 weights in a single composition.

### Line-height tokens

| Token               | Value  | Use                       |
| ------------------- | ------ | ------------------------- |
| `--leading-tight`   | `1.15` | Headings.                 |
| `--leading-normal`  | `1.6`  | Body default.             |
| `--leading-relaxed` | `1.75` | Long-form reading.        |

### Gradient display type (novel — web only)

Hero moments may use Barlow Condensed in lighter display weights (`400–500`) with text clipped to a brand gradient. Reserve for hero headlines; never on logo, nav, or body copy.

```css
h1 {
  background: linear-gradient(135deg, var(--violet), var(--networking));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
```

---

## Spacing Scale

**Base unit: 4px** (0.25rem). All spacing values derive from it.

| Token         | rem       | px    | Named  |
| ------------- | --------- | ----- | ------ |
| `--space-1`   | `0.25rem` | `4`   | `xs`   |
| `--space-2`   | `0.5rem`  | `8`   | `sm`   |
| `--space-3`   | `0.75rem` | `12`  | —      |
| `--space-4`   | `1rem`    | `16`  | `md`   |
| `--space-6`   | `1.5rem`  | `24`  | `lg`   |
| `--space-8`   | `2rem`    | `32`  | `xl`   |
| `--space-12`  | `3rem`    | `48`  | `2xl`  |
| `--space-16`  | `4rem`    | `64`  | `3xl`  |
| `--space-24`  | `6rem`    | `96`  | `4xl`  |
| `--space-32`  | `8rem`    | `128` | `5xl`  |

**Usage:**
- Component internals: `--space-2` to `--space-6`.
- Stacking related blocks: `--space-4` to `--space-8`.
- Section padding (top/bottom): `--space-16` to `--space-24`.
- Hero / signature section padding: `--space-32`.
- Generous margins and whitespace; space is an active design element, not an absence.

---

## Layout & Grid

### Container widths

| Token                  | Value   | Use                                           |
| ---------------------- | ------- | --------------------------------------------- |
| `--max-width`          | `72rem` (1152px) | Default container for most content.   |
| `--max-width-narrow`   | `48rem` (768px)  | Long-form prose, reading columns.     |
| `--gutter`             | `var(--space-6)` (24px) | Inline container padding.      |

Signature marketing pages may widen to `1200px` (`src/pages/index.astro`).

### Column grids

- `.grid` — `display: grid; gap: var(--space-8);` (32px default gap).
- `.grid--2` — 1 col on mobile; 2 cols at `≥640px`.
- `.grid--3` — 1 col on mobile; 2 cols at `≥640px`; 3 cols at `≥960px`.
- Card layouts commonly use `repeat(auto-fill, minmax(320px, 1fr))`.

### Responsive breakpoints

| Name    | Min width | Notes                                         |
| ------- | --------- | --------------------------------------------- |
| Mobile  | 0         | Default styles.                               |
| `sm`    | `560px`   | Small-phone threshold used by homepage.       |
| `md`    | `640px`   | Tablet / two-column activation.               |
| `lg`    | `720px`   | Styleguide sub-grids activate here.           |
| `xl`    | `900px`   | Homepage tablet breakpoint.                   |
| `2xl`   | `960px`   | Three-column grids activate here.             |

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

| Variant         | Class              | Background      | Text            | Border          |
| --------------- | ------------------ | --------------- | --------------- | --------------- |
| Primary         | `.btn--primary`    | `--networking`  | `--bg-deep`     | `--networking`  |
| Secondary       | `.btn--secondary`  | `transparent`   | `--violet`      | `--violet`      |
| Ghost           | (inline `.btn-ghost` on homepage) | `transparent` | `--color-text-muted` | none |
| Destructive     | *(not defined)* — if needed, base on `.btn--primary` with border `#b02a37` and hover coral. |

**States**

| State    | Treatment                                                                                              |
| -------- | ------------------------------------------------------------------------------------------------------ |
| Hover    | `transform: translateY(-1px to -2px);` + glow box-shadow (`0 0 24–30px rgba(255,107,107,0.35)` for primary). |
| Active   | Remove translate; deepen shadow.                                                                       |
| Focus    | `outline: none; box-shadow: 0 0 0 3px rgba(199, 125, 255, 0.15);` (violet focus ring).                 |
| Disabled | `opacity: 0.6; cursor: wait;` — never change hue.                                                     |

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

| State       | Treatment                                                                                     |
| ----------- | --------------------------------------------------------------------------------------------- |
| Placeholder | `color: var(--color-text-dim);`                                                               |
| Hover       | `border-color: rgba(247, 237, 255, 0.18);`                                                    |
| Focus       | `outline: none; border-color: var(--violet); box-shadow: 0 0 0 3px rgba(199,125,255,0.15);`   |
| Error       | `border-color: var(--networking);` + helper text in `var(--networking)`.                      |
| Success     | Status text in `var(--investment)`.                                                           |
| Disabled    | `opacity: 0.6;`                                                                               |

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
- Logo is `/logo-divider.svg` (white filter `brightness(0) invert(1)` on dark). Minimum digital size `120px` width.
- Two-row layout: logo on row 1; menu links wrap in a row below.
- Menu links: `--font-semi` 500, `--text-sm`, uppercase, letter-spacing `0.06em`–`0.08em`.
- Link hover / active: text fades to `--color-text`, underline grows from 0 → 100% width (`1.5px`, `--violet`).
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

| Prop    | Type              | Default | Notes                                                    |
| ------- | ----------------- | ------- | -------------------------------------------------------- |
| `name`  | `string`          | —       | Filename without `.svg`. All icon files are lowercase-with-dashes (e.g. `power-fist`, `money-bag`). |
| `size`  | `number \| string`| `24`    | Pixel number or any CSS length.                          |
| `label` | `string`          | —       | Accessible label; omit for presentational icons.         |
| `class` | `string`          | —       | Passthrough for layout / color.                          |

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

| Token        | Value | Component                                          |
| ------------ | ----- | -------------------------------------------------- |
| `radius-xs`  | `3px` | Inline code, small chips.                          |
| `radius-sm`  | `4px` | Small panels, callouts, small cards, status tags.  |
| `radius-md`  | `6px` | Cards, event cards, code blocks.                   |
| `radius-lg`  | `8px` | Buttons, inputs, medium panels, surface cards.     |
| `radius-xl`  | `12px`| Large surfaces (e.g. color scale generator shell). |
| `radius-2xl` | `16px`| Large panels only.                                 |
| `radius-pill`| `999px` | Chips, tags, language pills.                     |
| `radius-full`| `50%` | Avatars, icon bubbles, decorative circles.        |

*Spark Logo exception:* the two long rays are intentionally sharp-cornered; all other logo corners are rounded. Don't round them.

---

## Shadow

The system is **low-shadow**. Prefer elevation via transform and color rather than blurred shadows. When shadow is used, it is soft and directional.

| Token            | Value                                                                 | Use                                                              |
| ---------------- | --------------------------------------------------------------------- | ---------------------------------------------------------------- |
| `shadow-focus`   | `0 0 0 3px rgba(199, 125, 255, 0.15)`                                 | Focus rings on inputs and interactive elements.                  |
| `shadow-glow`    | `0 0 24px rgba(255, 107, 107, 0.4)`                                   | Primary button hover (coral glow).                               |
| `shadow-hover`   | `0 0 30px rgba(255, 107, 107, 0.35), 0 8px 24px rgba(0, 0, 0, 0.3)`   | Primary button deeper hover.                                     |
| `shadow-card`    | `0 12px 32px rgba(0, 0, 0, 0.4)`                                      | Card hover lift.                                                 |
| `shadow-panel`   | none                                                                  | Panels rely on frame + color, never blur.                        |

**Rules**
- Never stack more than two shadows on one element.
- No drop shadow on the logo lockup.
- No shadow on photography — use duotone / overlay instead.

---

## Motion

| Token                | Value                                   | Use                                                        |
| -------------------- | --------------------------------------- | ---------------------------------------------------------- |
| `--transition-fast`  | `150ms ease`                            | Color, border changes, hover.                              |
| `--transition-base`  | `250ms ease`                            | Default transitions.                                       |
| `--ease`             | `cubic-bezier(0.16, 1, 0.3, 1)`         | "Out-expo" — default for hover lifts, underline reveals.   |
| `--ease-dramatic`    | `cubic-bezier(0.77, 0, 0.175, 1)`       | Long, committed moves only.                                |
| `--duration`         | `200ms`                                 | Micro-interactions.                                        |

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

| Sub-brand                  | Accent                     | Feel                                                        |
| -------------------------- | -------------------------- | ----------------------------------------------------------- |
| Centella Global Advisory   | `--advisory` (`#00E5FF`)   | Rigorous, strategic, calm, precise.                         |
| Centella Institute         | `--violet` (`#C77DFF`)     | Energetic, convening-oriented, pedagogical, flexible.       |
| Centella Impact            | `--investment` (`#CCFF00`) | Serious, disciplined, systems-oriented.                     |

Programs and events (e.g. Spark Summit, Leadership Labs) are nested under sub-brands — never parallel to them.

---

## Reference

- Live examples: `/styleguide`
- Tokens source: `src/styles/global.css`
- Homepage reference implementation: `src/pages/index.astro`
- Source brand document: *Centella Brand Guidelines v1.0 — February 2026*
