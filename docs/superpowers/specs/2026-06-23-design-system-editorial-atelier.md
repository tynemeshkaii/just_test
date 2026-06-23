# Just Graphics — Visual Redesign: "Editorial Atelier" Design System

**Date:** 2026-06-23
**Goal:** Replace the "dark + gold + Playfair" template look (reads as cheap fake-premium / cold-traffic ad landing) with a distinctive, photography-led editorial system that signals an established studio and attracts solvent buyers.
**Builds on:** the content/funnel reposition spec (`2026-06-23-landing-reimagine-design.md`). That fixed *what it says*; this fixes *how it looks*.

## Locked direction (approved)

- **Direction A — Editorial Atelier.**
- **Drop the gold** → near-monochrome with a muted platinum accent.
- **Existing photography only** → elevated via consistent CSS grade + full-bleed framing.
- **Mobile-first, highest priority** (≈all ad traffic is mobile).
- **Boldness:** between "bold+crafted" and "experimental" — every technique must justify its effort/perf cost. No gratuitous WebGL/3D on mobile.
- **Hero headline:** "Made for the car you actually drive."
- **Light/dark alternating sections** confirmed.

## 1. Design principles

1. **Photography is the hero; UI gets out of the way.** Full-bleed, art-directed crops, edge-to-edge.
2. **Restraint = expensive.** Generous whitespace, fewer elements per view, lower density.
3. **Type as the design.** Big, confident editorial type; mono labels; a numbered-index motif.
4. **Hairlines, not cards.** Thin rules + grid lines replace rounded gradient cards.
5. **Asymmetry + grid tension.** Off-center layouts, intentional margins — breaks template rhythm.
6. **Crafted, justified motion.** Slow intentional reveals; nothing bouncy; mobile-cheap.

## 2. Palette (no gold)

| Token | Value | Use |
|---|---|---|
| `--ink` | `#0B0B0C` | primary dark bg (neutral, not warm-gold) |
| `--ink-2` | `#141416` | raised dark surface |
| `--grey` | `#8A8884` | mono labels, meta, muted text |
| `--platinum` | `#B7AE9C` | the ONE accent — hairline underlines, marks, index ticks. Muted, matte, never a gradient |
| `--bone` | `#ECE9E2` | light section bg + text on dark |
| `--bone-2` | `#DCD8CF` | light section secondary |
| `--line` | `rgba(236,233,226,.16)` | hairlines on dark |
| `--line-ink` | `rgba(11,11,12,.14)` | hairlines on light |

- **Remove:** `--gold`, `--gold-h/d/d2/line`, `--gold-grad`, `--steel*` family, gradient buttons.
- **Sections alternate** dark (ink) ↔ light (bone) for editorial cadence. Color lives only in the car photography.

## 3. Typography

- **Display:** **Fraunces** (variable, high-contrast, characterful — replaces cliché Playfair). Used big, light weight (300), tight tracking, optical sizing. Italic for emphasis.
- **Body / UI:** **Inter** (keep — neutral, high quality). 400–600.
- **Labels / index / meta:** **Space Mono** (700/400) — uppercase, letter-spaced. Drives the numbered-index motif (`01 —`), section eyebrows, credentials, captions.
- **Scale (mobile-first, fluid `clamp()`):**
  - Display XL (hero): `clamp(38px, 11vw, 92px)` / line-height ~0.98
  - Display L (section titles): `clamp(28px, 7vw, 56px)`
  - Pull-quote: `clamp(20px, 5.5vw, 32px)`
  - Body: 16–18px / 1.6
  - Label mono: 10–11px / .14–.18em tracking
- **Loading:** preload Fraunces + Inter (subset latin); Space Mono can load async. Keep total font weight lean for mobile LCP.

## 4. Layout system

- **Numbered index motif** — every major section tagged `01 —`, `02 —` in Space Mono; oversized Fraunces index numbers in work/process.
- **Hairline rules** replace card borders/shadows. Radius dropped to near-0 (`--r: 2px`); no `--rlg/rxl` rounded cards, no gradient fills, no badge pills.
- **Asymmetric grid** — content offset from edges, varied column starts; not centered-everything.
- **Spacing scale** — larger vertical rhythm between sections (mobile `clamp(72px, 14vw, 160px)` section padding).
- **Full-bleed media** — images break the container to viewport edges; captions sit in mono below.

## 5. Image treatment (unify existing photos)

Existing WebP varies in quality/lighting. Unify with a consistent grade (cheap, GPU, mobile-safe):
- **Hero / cases (color):** `filter: grayscale(.12) contrast(1.06) brightness(.86) saturate(.92)` + ink gradient veil for text legibility.
- **Gallery / secondary (optional duotone):** desaturate toward ink/bone for a unified grid; reveal full color on tap/hover.
- **Framing:** full-bleed, tighter editorial crops via `object-position`; subtle film-grain overlay (1 tiling PNG, very low opacity) for a printed-matter feel.
- No new photos required; treatment + framing carries the premium feel.

## 6. Motion (justified, mobile-cheap)

Keep/upgrade existing IntersectionObserver reveal engine. Add only ROI-positive effects:
- **Reveal:** slower, refined easing (`cubic-bezier(.22,1,.36,1)`), opacity + small translate. (have)
- **Image curtain reveal:** `clip-path` wipe as media enters viewport — high impact, cheap.
- **Hairline draw-in:** rules scale from 0 width on reveal.
- **Index counter:** static (no count-up).
- **Desktop only:** subtle custom cursor + magnetic CTA — gated behind `(hover:hover)` + `min-width`, zero mobile cost.
- **Excluded** (cost > value on mobile): WebGL, 3D, heavy parallax, scroll-jacking. `prefers-reduced-motion` respected (already wired).

## 7. Per-section application

- **Nav:** mono wordmark, hairline divider on scroll, thin menu icon. CTA = text-link "Start your project →" with platinum underline (no gold button).
- **Hero:** full-bleed graded car, ink gradient, mono eyebrow ("Decal Atelier — Dubai · Est. 2008"), big Fraunces headline, hairline, mono credential, text-link CTA. (approved mockup)
- **Proof strip:** single mono line on a thin-ruled band — `17 YRS — 1,500+ CARS — ★5.0 — FERRARI TO LAND CRUISER`. Static.
- **Work / Cases:** editorial — oversized index, mono marque label, full-bleed before/after, Fraunces pull-quote. Alternating light/dark.
- **Why / pillars:** drop the 4 gradient cards → a ruled list / editorial spread; mono numbers + Fraunces sub-heads + Inter body. Generous space.
- **Process:** numbered editorial steps with big Fraunces indices + hairlines (no card grid). Stays above the form (per content spec).
- **Gallery:** unified duotone grid, tap reveals color; mono captions; reframed "starting points we tailor."
- **Reviews:** editorial quote-led — big Fraunces pull-quote, mono attribution + marque; graded car image. Premium marques (already recurated).
- **Price + brief:** transparent tiers as a ruled price list (mono figures); multi-step brief restyled to the system — hairline inputs, mono step index, platinum progress. Logic unchanged.
- **FAQ:** ruled accordion, mono index, Fraunces questions.
- **Footer:** quiet, mono, studio details + map; "by appointment" tone.

## 8. Mobile-first specifics

- Single-column everything; full-bleed media; type via `clamp()` so it scales without breakpoints fighting.
- Tap targets ≥44px; CTA reachable in thumb zone; keep a quiet sticky/secondary WhatsApp.
- Performance budget: mobile LCP < 2.5s. Hero image stays preloaded WebP `fetchpriority=high`; fonts lean + preloaded; CSS filters are GPU-cheap; grain = one small tile.
- Desktop enhancements (cursor, magnetic, finer grid) layered on top via media queries — never block mobile.

## 9. Technical implementation

- **Token rewrite in `assets/site.css`** (`:root`) — swap palette, radius, fonts; both pages inherit via shared stylesheet. `assets/dealers.css` overrides updated to match.
- **Markup restyle, architecture kept** — reuse sections, IntersectionObserver, sliders, multi-step brief, catalog modal. This is a re-skin at the CSS/markup level, not a logic rebuild. JS modules unchanged except class hooks.
- **Font swap** in both pages' `<head>` (Fraunces + Inter + Space Mono; drop Playfair).
- **Remove** gradient/card/badge/counter CSS; add hairline, index, grade, grain, curtain-reveal utilities.
- Update `CLAUDE.md` design-tokens section + `AGENTS.md`.

## 10. Phasing

- **D1 — Foundation:** new tokens (palette, type, radius, spacing), font swap, global grade utility + section light/dark cadence. Biggest perceived change for least code.
- **D2 — Hero + Nav + Proof:** the approved hero, mono nav, proof strip.
- **D3 — Editorial sections:** Work/Cases, Why/pillars, Process, Reviews restyle (hairlines, index, pull-quotes).
- **D4 — Gallery + Price/Brief + FAQ + Footer:** duotone grid, ruled price list, restyled brief, ruled accordion.
- **D5 — Motion + desktop craft:** curtain reveals, hairline draws, desktop cursor/magnetic; perf pass + mobile LCP check.
- Apply across `index.html` + `dealers/index.html` each step (shared assets do most of it).

## 11. Success criteria

- Page no longer reads as a default ad one-pager (subjective + bounce/scroll-depth on mobile ad traffic).
- Coherent editorial system: one accent, consistent grade, type hierarchy, index motif throughout.
- Mobile LCP < 2.5s, no CLS regressions, Lighthouse perf ≥ prior.
- Reinforces the funnel goal: higher share of qualified/solvent leads.

## 12. Out of scope / risks

- No new photography (treatment-only); risk = a few weak source images — mitigate via crop/duotone/demotion.
- No framework/build tooling; stays vanilla shared-asset architecture.
- Paid/commercial typefaces not assumed (Google Fonts: Fraunces/Inter/Space Mono). Can upgrade later.
- Risk: editorial whitespace can hurt conversion if overdone on mobile — keep CTA cadence frequent and thumb-reachable.
