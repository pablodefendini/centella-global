# Cover image generation prompt

For the Prime Movers program brochure cover (`mockups/program.html`).

The current cover ships with a hand-built inline SVG abstract as a placeholder — print-faithful and good enough to review. When you want to upgrade to a bitmap rendered by Gemini Nano Banana 2 (or another image model), use the prompt below.

## Recommended generation tool

**Gemini Nano Banana 2 (Gemini 3.1 Flash image)** via Google AI Studio. Aspect ratio: 3:2 or 16:9 (use the wider option for full-width cover treatment, or 1:1 if cropping flexibility matters more). Resolution: 2K. Thinking mode: off (default).

## Prompt

> Abstract editorial photograph of flowing, sweeping motion captured as elegant fabric or silk in mid-air. A warm, sunlit composition: deep navy ink-blue (#1B3A52) shadows recede into a sunny cream paper background (#FFFAEC). A long, ribbon-like sweep of saturated punchy orange (#FF7A1F) curves diagonally across the frame from lower-left to upper-right, intersecting with a second softer amber-gold (#FFC130) ribbon that flows in a complementary arc. Both ribbons feel weightless, suspended mid-motion, with subtle directional blur at their trailing edges suggesting forward momentum. The composition has a strong diagonal axis of energy — the ribbons read as movement, dance, or wind. Backlit lighting from the upper-right corner creates a luminous bloom; soft ambient fill from the lower-left. Shot on Hasselblad medium format, 80mm lens at f/4, shallow depth of field on the closest edge of the orange ribbon, focus stacked across the rest. Editorial color grade, slight film grain, no text or logos visible. Inspired by Wolfgang Tillmans abstract chromatic studies, Iris van Herpen couture photography, and Aaron Siskind's gestural compositions. Painterly yet photographic. Aspect ratio 3:2 horizontal. High resolution, suitable for print at 300dpi.

## Negative prompt (for platforms that support it)

> faces, people, hands, fingers, body parts, text, words, letters, numbers, logos, brand marks, watermarks, photo borders, frames, instagram filter, oversaturation, neon, glow effects, glitter, particles, sparks, fire, smoke trails, comic-style speed lines, motion-blur arrows, vignette, vintage filter, fisheye distortion.

## What this aims for

- **Print-faithful**: every motion cue is intrinsic to the composition (curve direction, lighting, depth-of-field falloff), not an animation-coded device that fails on paper.
- **Brand palette**: the four-color Centella/Hunt Alternatives kit — cream, navy, orange, amber — comes from the brochure's CSS tokens.
- **Editorial register**: medium-format film photography, not stock photography or 3D-rendered abstraction. Suits an institutional convening for political leaders.
- **No literal motion devices**: no arrows, no speed lines, no echo trails — the ribbons' directional sweep does that work.

## Iteration notes

- If the first generation feels too literal (an obvious silk ribbon photo), add to the prompt: "abstract enough that the ribbons read as gesture, not fabric — the suggestion of fabric, not its surface texture."
- If the colors come out too muted, push: "saturated brand-orange, not pastel; the orange should anchor the eye."
- If the composition feels too symmetric, push: "asymmetric — the orange ribbon dominates from lower-left; the amber is secondary and smaller."
- For an alternative direction, try wind-on-water instead of fabric: "Abstract aerial photograph of warm-toned wind currents over sunlit cream sand, captured as flowing waves of saturated orange and amber pigment dispersing across the frame…"

## Replacing the placeholder

Once generated:
1. Save the bitmap to `work/prime-movers-20th/assets/cover-motion.jpg` (or .webp).
2. In `mockups/program.html`, find the `<svg class="cover-art">…</svg>` block in the cover section and replace it with `<img src="../assets/cover-motion.jpg" class="cover-art" alt="">` (or embed as a data URI for self-contained sharing — same pattern as the Hunt logo was, before it was removed).
3. The `.cover-art` CSS rule already positions and sizes the element; the bitmap should inherit those constraints.
4. Re-run `cp work/prime-movers-20th/mockups/program.html share/work/prime-movers-20th/program.html` to mirror.
