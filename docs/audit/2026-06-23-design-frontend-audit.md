# Just Graphics — Design & Frontend Audit

**Date:** 2026-06-23
**Scope:** `index.html`, `dealers/index.html`, `assets/site.css`, `assets/site.js`, `assets/dealers.css`
**Method:** full source review + live verification in browser preview (desktop + mobile 375px).
**Verdict:** one **critical conversion bug** (verified live on both pages), plus several design-system consistency drifts and minor a11y/UX issues. Structure and performance scaffolding are solid.

---

## Severity legend
- 🔴 **Critical** — breaks function or conversion. Fix now.
- 🟠 **Major** — visible defect or design-system violation users will notice.
- 🟡 **Minor** — polish, consistency, a11y nits.

---

## Findings

### 🔴 C1 — "Send my brief" submit button visible on every step (premature/false submit)
**Where:** `assets/site.css:2598` — `.brief__next, .brief__submit { … display: flex; }`
**Verified live:** on `/` and `/dealers/`, all `.brief__submit` elements have the `hidden` attribute set (`hidden=true`) but compute `display:flex` and are visible. At Step 1 the user sees **both** "Continue" and "Send my brief".
**Why:** the `hidden` HTML attribute only works via the UA rule `[hidden]{display:none}` (specificity 0,1,0). The author rule `.brief__submit{display:flex}` has equal specificity and comes later, so it wins — `hidden` is ignored. (`.brief__back` is unaffected because it has no `display` declaration.) The same applies to `.brief__next`, which then also shows on the final step.
**Impact:**
- User can click "Send my brief" on Step 1. `validateStep()` only checks the *current* step, so with make/model filled it POSTs with empty `name`/`phone`, then `done()` runs on the fetch promise regardless of the Worker's 4xx → shows the **success screen and fires a Meta `Lead`** for an incomplete, unusable lead.
- Affects all four brief instances (page `#page-brief`, `#catalog-brief`, `#gallery-brief`, dealers briefs).
**Fix:** make `[hidden]` authoritative. Add to the reset block:
```css
[hidden] { display: none !important; }
```
(or scope it: `.brief__next[hidden], .brief__submit[hidden]{display:none;}`). No JS change needed.

---

### 🟠 M1 — Section titles render as synthetic faux-bold (font weight not loaded)
**Where:** `.s-title` `assets/site.css:233` (`font-weight:900`), `.catalog-title` `:1075` (900), `.midcta__text` `:2292` (900). Font is requested at `index.html:95` / `dealers/index.html` with only `Fraunces … wght@…300;400;500` (+ italic 300).
**Verified live:** `document.fonts` lists only Fraunces 300/400/500 faces; `.s-title`/`.catalog-title`/`.midcta__text` compute `font-weight:900`.
**Why:** no 900 face exists, so the browser **synthesizes** bold on a serif display face — heavy, muddy strokes, not the optical 900 of Fraunces. Also contradicts the documented design system (CLAUDE.md: "Fraunces … weight 300 for headings").
**Fix:** pick one —
- (A, on-system) set these titles to `font-weight:300` (matches `.case-title`, `.pstep__title`, `.cta-form__title`, `.brief__q` which are already 300), **or**
- (B, if heavy is intended) add the weight to the Google Fonts URL, e.g. `…300;400;500;700` and use 700.
Same applies to Inter `font-weight:800` usages (`.catalog-price` `:1477`, `.catalog-size` `:1401`, `.catalog-discount` `:1433`, `.midcta__eyebrow` `:2283`, `.catalog-sale-badge` `:1093`) — Inter is loaded only up to 700; 800 is faux-bold. Drop to 700 or add 800 to the URL.

---

### 🟠 M2 — Two accent colours coexist; old "gold" hardcoded instead of `--platinum`
**Where:** raw `rgba(196,164,93,…)` throughout `site.css` — e.g. `.section--surface` `:160`, per-section tints `:167-205`, `.catalog-sale-badge` `:1089`, `.catalog-discount` `:1434`, `.g-viewall` `:1006`, `.social-btn` `:2049`, `.midcta` tints, `.lead-panel` borders, `.menu-panel` `:449`.
**Why:** CLAUDE.md states gold was removed and **`--platinum` (#B7AE9C = rgb 183,174,156)** is the single accent. But `rgb(196,164,93)` is a distinctly more saturated/yellow gold and is still used for badges, tints, borders, and the discount/sale chips (visible as gold pills in the catalog). Result: two different "accent" hues on screen, and design tokens bypassed (the CSS convention says *always use variables, never raw values*).
**Fix:** replace `rgba(196,164,93,a)` with a platinum-based token. Add `--platinum-rgb:183,174,156;` to `:root` and use `rgba(var(--platinum-rgb), a)`, or define purpose tokens (`--accent-tint`, `--accent-line`). Audit the sale/discount chips specifically — they read as "gold" against the otherwise platinum/editorial palette.

---

### 🟠 M3 — Pill radii violate the "no pills, radius 2px" system
**Where:** `.midcta__actions .btn` `border-radius:999px` `:2316`; `.g-viewall` `999px` `:1007`; `.catalog-filter` `50px` `:1111`; `.catalog-sale-badge` `50px` `:1091`; `.catalog-size` `50px` `:1399`; `.catalog-discount` `50px` `:1431`; plus 50% circles on `.social-btn`/`.nav__social`/close buttons (circles are arguably fine, the pills are not).
**Why:** CLAUDE.md: "`--r` = 2px (near-zero — no rounded cards/pills); square hairline borders everywhere." These pill shapes are leftovers from the pre-redesign template and clash with the square hairline language used everywhere else (buttons, cards, inputs, chips like `.case-tag`/`.rev-style-tag` are all square).
**Fix:** change pill radii to `var(--r)` (or `0`) for the mid-page/g-viewall buttons and the catalog filter/sale/size/discount chips. Keep genuine icon circles if desired, but align the rectangular chips/buttons to the square system.

---

### 🟠 M4 — `touch-action:none` on before/after compare traps vertical page scroll on mobile
**Where:** `.compare { touch-action: none; }` `assets/site.css:1745`.
**Why:** the compare image is a large element in the Cases carousel. `touch-action:none` tells the browser to never scroll/zoom from touches that start on it, so a mobile user who places a finger on the image to scroll the page is stuck — the page won't move. The JS already calls `e.preventDefault()` only while actively dragging (`site.js:348`), so the blanket CSS lock is over-aggressive.
**Fix:** use `touch-action: pan-y;` so vertical scroll passes through while horizontal drag still drives the slider; keep the JS `preventDefault` for the active horizontal drag.

---

### 🟠 M5 — Dead "Terms of Service" link
**Where:** `index.html:1301` (and the dealers footer) — `<a href="#">Terms of Service</a>`.
**Verified live:** present in footer legal list.
**Why:** clicking jumps to top of page (no Terms page exists). Broken/placeholder link in a production footer; also a minor SEO/trust nit next to the working Privacy Policy.
**Fix:** create `/terms.html` (mirror `privacy.html`) and link it, or remove the list item until the page exists.

---

### 🟡 m6 — Catalog lead panel can clip on short viewports
**Where:** `.lead-panel.is-open { max-height: 500px; } .lead-panel { overflow: hidden; }` `assets/site.css:1566-1572`.
**Why:** the non-standalone catalog lead panel reveals via `max-height:500px` with `overflow:hidden` and **no scroll fallback**. Measured tallest brief step ≈ 400px, so it fits today — but a `.has-error` shake/box-shadow, longer localized copy, or a smaller phone in landscape can push content past 500px and silently clip the Continue/Submit row.
**Fix:** add `overflow-y:auto` to `.lead-panel` (or raise/space the cap), so overflow scrolls instead of being cut.

---

### 🟡 m7 — Visually-hidden radios are absolutely positioned without a positioned ancestor
**Where:** `.brief__choice input { position:absolute; … }` `assets/site.css:2563`; `.brief__choice` has no `position`.
**Why:** the radio resolves its `absolute` position against the nearest positioned ancestor (or ICB), not the label. It's `opacity:0; pointer-events:none` so it's not seen, but on keyboard `Tab` the focus ring can land in an unexpected spot, and the hidden input isn't pinned to its choice. Low risk, but untidy.
**Fix:** add `position:relative` to `.brief__choice` (the conventional pattern), or use the standard `.sr-only`/clip technique for the input.

---

### 🟡 m8 — 39 gallery CTAs share the identical accessible name
**Where:** `index.html:394-585` — every gallery card button is `I want this style` with no distinguishing label.
**Why:** screen-reader users hear "I want this style, button" 39 times with no way to tell them apart.
**Fix:** add `aria-label="I want design sample N"` (the alt text already carries the sample number) per button.

---

### 🟡 m9 — Reserved sticky-CTA space + minor housekeeping
- `body { padding-bottom:72px }` (mobile, `:2666`) is always reserved although `.mobile-cta` only appears after the hero; harmless but leaves a small dead strip at the very bottom before the bar shows. Acceptable; note only.
- Empty ruleset `.footer__map-col {}` `assets/site.css:2130` — remove.
- `AGENTS.md` is stale (already flagged in CLAUDE.md) — update or delete to avoid drift.
- `.rev-full-panel` expand height is set inline from `scrollHeight` but not recomputed on resize (`site.js:307`); an expanded review can clip if the viewport width changes mid-read. Minor.

---

## Prioritized fix plan

### Phase 1 — Critical (ship immediately)
1. **C1** Add `[hidden]{display:none !important;}` to the reset block in `assets/site.css`. Re-verify in preview: at Step 1 only "Continue" shows; "Send my brief" appears only on Step 4; "Continue" hidden on Step 4. Test on `#page-brief`, catalog, gallery, and both dealers briefs. Confirm an incomplete submit no longer reaches success/`Lead`.

### Phase 2 — Major design-system alignment (one focused pass on `assets/site.css`)
2. **M1** Resolve heading weights: set `.s-title`/`.catalog-title`/`.midcta__text` to `300` (recommended, on-system) or add `700` to the font URL; fix Inter `800` usages the same way.
3. **M2** Introduce `--platinum-rgb` token and replace `rgba(196,164,93,…)` occurrences; re-tone the sale/discount chips to platinum.
4. **M3** Replace pill radii (`999px`/`50px`) with `var(--r)` on buttons and catalog chips.
5. **M4** `.compare { touch-action: pan-y; }`; re-test mobile vertical scroll over the compare image and horizontal drag.
6. **M5** Add `/terms.html` and link it, or remove the placeholder `<a href="#">`.

### Phase 3 — Minor polish & a11y
7. **m6** `overflow-y:auto` on `.lead-panel`.
8. **m7** `position:relative` on `.brief__choice`.
9. **m8** Per-button `aria-label` on gallery CTAs.
10. **m9** Remove empty `.footer__map-col{}`, refresh/delete `AGENTS.md`, optionally recompute expanded-review height on resize.

### Verification checklist (run in preview after each phase)
- Mobile (375) + desktop: brief steps show the correct single primary button per step.
- Catalog modal → order → lead panel: form fully visible, no clipping, submit only on final step.
- Compare slider: page scrolls vertically on touch; drag still works horizontally.
- Console clean (no errors/warnings) on `/` and `/dealers/`.
- Visual: section titles render with clean (non-synthetic) weight; accent hue consistent; chips/buttons square.

---

## What's already good (leave alone)
- `content-visibility`/`contain-intrinsic-size` per section, lazy images, LCP preload, deferred `initApp` — solid perf scaffolding.
- Focus traps + `inert` on menu, catalog modal, and inactive carousel slides; `prefers-reduced-motion` honored across reveals, hero zoom, cursor.
- Semantic landmarks, ARIA carousel roles, keyboard nav on sliders and FAQ.
