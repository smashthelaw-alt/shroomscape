# Shroomscape

A single-page site for **Shroomscape** — a Dhaka-based mushroom farm and food
brand growing Oyster, Button and Enoki, and publishing a weekly Bangla recipe
every Thursday.

**Nature, Nourish and Nurture.**

---

## What this is

Built directly against *Shroomscape Brand Guidelines v1.0 (July 2026)*. The
guidelines are treated as the spec, not as a mood board:

| Guideline | Where it lives |
| --- | --- |
| 03 · Core palette, 60/30/10 ratio | `src/styles/tokens.css`, and the WebGL colour ramp in `src/gl/mycelium.js` |
| 03 · Approved contrast pairs | every text/ground pairing on the page; dimmed creams still clear 4.5:1 |
| 04 · Montserrat / Inter / Noto Sans Bengali | `--font-display` / `--font-body` / `--font-bangla` |
| 04 · Bangla is a primary system | `.bn` — one weight heavier, ~10% larger, 1.85 leading, zero tracking |
| 05 · The swoosh as a divider | the curved section edges on the recipe block |
| 05 · Benefit chips, 8px grid, no shadows | `.chip`, `--s1…--s7`, depth comes from colour contrast only |
| 05 · Photography needs a 40–60% scrim | the farm video, the trade band |
| 06 · Health claims — the hard line | see "Copy decisions" below |
| 07 · The comparison grid | the mushroom-vs-meat section, their highest-reach format |

### Two deliberate departures from the source creative

The brand's own social posts carry two claims that its guidelines forbid on
p.19 ("we may never claim that any Shroomscape product prevents, treats or
cures a disease"). Both were dropped rather than reproduced:

- the Milky mushroom card's *ক্যান্সার প্রতিরোধে গুণসম্পন্ন* claim — removed
- the Wood Ear card's diabetes line — softened to the approved
  "suitable for diabetic-friendly diets" phrasing

## Stack

- **Vite** — static build, no framework
- **three.js** — two WebGL systems (below)
- **GSAP + ScrollTrigger** — all choreography, inside a single `gsap.matchMedia()`
- **Lenis** — smooth scroll

## The WebGL

**`src/gl/mycelium.js` — the mycelium field.** A GPGPU particle system
(384² ≈ 147k particles on desktop, 192² on mobile) advected through a curl-noise
flow. Positions live in a ping-ponged half-float render target; the points are
stamped additively into a second ping-ponged buffer that fades ~4% per frame, so
every particle leaves a filament behind it. A final pass grades the accumulated
luminance through the brand green ramp — Forest Shade → Deep Forest → Grow Green
→ Fresh Lime — with a vignette that keeps Soil Black reading as the ground.

Scroll position drives the simulation uniforms (curl scale, flow speed, trail
persistence, exposure), so each section has its own state and the field steps
almost entirely out of the way behind the farm video and the cream recipe block.

**`src/gl/specimen.js` — the specimen viewer.** Cross-dissolves between mushroom
plates through a noise threshold sweep, with a fine lime seam riding the
dissolve front. The threshold overshoots both ends so that at rest no part of
the frame sits mid-transition.

Both degrade cleanly: no WebGL2 or no float-buffer support drops to a CSS
gradient (`.field-fallback`) and a plain `<img>` stage.

## Assets

Every image, video and the wordmark are extracted from the client's own media
library — no stock, in line with guidelines 05 ("Real product — our own
mushrooms, our own kitchen", and never generic Western stock).

- **Cutouts** (`public/assets/cutouts/`) — matted off the composed social
  creative with OpenCV: a tolerant border flood-fill marks definite background,
  erosion marks definite foreground, GrabCut resolves the boundary, and
  saturated brand greens/yellows are suppressed by hue so no layout graphic
  survives in the fringe.
- **Tiles** (`public/assets/tiles/`) — the eight varieties, normalised to 640².
- **Food / video** — tight photographic crops with an automatic pass that trims
  any residual flat brand-colour border. Video loops are palindromes
  (forward + reversed) so they cycle seamlessly with no cut.

**The logo is a raster extraction from a 6000px source, not the master
artwork.** Guidelines 02 require the supplied vector to be placed unmodified —
swap `public/assets/logo/wordmark.webp` for the master SVG when it is available.

## Accessibility & motion

- `prefers-reduced-motion` is a real alternative branch, not a disabled one:
  the preloader is skipped, Lenis is not instantiated, content renders in place,
  and programmatic scrolls become instant.
- The variety picker is a proper tablist — roving tabindex, arrow keys, Home/End.
- The intro is built only once the page is actually visible, so opening the site
  in a background tab never leaves it blank.
- Skip link, visible focus rings, bilingual `lang` handling, deep links.

## Running it

```bash
npm install
npm run dev
```

```bash
npm run build && npm run preview
```

## Notes for the client

- `Shroomscape/Recipes/voice.mp3` (2m50s) was **not** used. Its contents were
  not verifiable during the build, and guidelines 07 require a five-point check
  before anything is published. It is a good candidate for a "listen in Bangla"
  control on the recipe section once reviewed.
- The Thursday countdown is live and self-maintaining. The recipe content itself
  is static — wire `src/data/content.js` to a CMS to make the weekly drop real.
- All copy lives in `src/data/content.js`.
