# Editorial Atelier Redesign — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Re-skin both landing pages from the "dark+gold template" look to the approved near-mono, photography-led "Editorial Atelier" system — mobile-first, no logic rebuild.

**Architecture:** Pure CSS/markup re-skin on the shared-asset architecture. `assets/site.css` `:root` tokens + section styles are rewritten; `index.html` / `dealers/index.html` get font-link + class-hook changes; `assets/dealers.css` overrides re-synced; `assets/site.js` modules are untouched except where a class hook is renamed. Verification is visual via the running preview server (no unit-test framework exists).

**Tech Stack:** Vanilla HTML5, CSS (custom properties, `clamp()`, `clip-path`, CSS filters), vanilla JS (existing IntersectionObserver engine), Google Fonts (Fraunces, Inter, Space Mono). Dev server: `npx serve -p 3333 .`. Verify via `mcp__Claude_Preview__*` tools.

**Reference specs:**
- Visual: `docs/superpowers/specs/2026-06-23-design-system-editorial-atelier.md`
- Content/funnel (already in working tree, folded in here): `docs/superpowers/specs/2026-06-23-landing-reimagine-design.md`

---

## File Structure

- `assets/site.css` — **primary target.** `:root` token block + every section (markers `/* ─── N. NAME ─── */`). Add utility layer (grade, grain, hairline, index, curtain-reveal). Remove gold/steel/gradient/card/badge CSS.
- `assets/dealers.css` — re-sync overrides to new tokens; remove steel/gold dealer accents.
- `index.html` — `<head>` font swap; SVG/markup class hooks (proof strip add, nav CTA, captions). Pending content edits (reviews recurate + Process move) already applied here.
- `dealers/index.html` — same `<head>` font swap + class hooks. Process move already applied.
- `CLAUDE.md` — update "Key CSS Conventions" token list.
- No new JS files. No new build tooling.

## Conventions for every task

- **Locate CSS** by the section marker comments documented in `CLAUDE.md` (e.g. `/* ─── 2 HERO ─── */`).
- **Verify** with preview tools against `http://localhost:3333` (index) and `/dealers/`.
- **Mobile-first:** run every visual check at 390px width (`preview_resize`) first, then desktop.
- **Commit** after each task with the message shown.

---

## Task 0: Baseline — commit folded content edits, capture "before"

**Files:**
- Modify (commit): `index.html`, `dealers/index.html` (pending reviews+Process edits already in tree)

- [ ] **Step 1: Start the preview server**

Use `mcp__Claude_Preview__preview_start` with name `just-graphics` (config in `.claude/launch.json`). Note the `serverId`.

- [ ] **Step 2: Capture before-state screenshots**

`preview_resize` to 390×844, `preview_screenshot` of index hero + reviews + form. Save mentally as the "before" baseline for comparison.

- [ ] **Step 3: Commit the pending content edits (folded in, separate commit)**

```bash
git add index.html dealers/index.html
git commit -m "fix: recurate index reviews to premium marques + move Process above lead form"
```

- [ ] **Step 4: Verify clean tree for the redesign**

Run: `git status --short`
Expected: only `.DS_Store`/`CLAUDE.md`/`worker` (pre-existing), no staged HTML left.

---

## Task D1.1: Font swap (both pages `<head>`)

**Files:**
- Modify: `index.html` (font preload/link block, ~lines 92–96)
- Modify: `dealers/index.html` (same block)

- [ ] **Step 1: Replace the Google Fonts link on both pages**

Replace the existing Inter+Playfair `<link rel="preload" as="style" ...>` and its `<noscript>` twin with:

```html
<link rel="preload" as="style" href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,400;0,9..144,500;1,9..144,300&family=Inter:wght@400;500;600;700&family=Space+Mono:ital,wght@0,400;0,700;1,400&display=swap" onload="this.onload=null;this.rel='stylesheet'">
<noscript><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,400;0,9..144,500;1,9..144,300&family=Inter:wght@400;500;600;700&family=Space+Mono:ital,wght@0,400;0,700;1,400&display=swap"></noscript>
```

- [ ] **Step 2: Verify fonts load**

`preview_eval`: `document.fonts.check("300 40px Fraunces")` after reload → expect `true` (may need a tick; check `document.fonts.ready`).

- [ ] **Step 3: Commit**

```bash
git add index.html dealers/index.html
git commit -m "redesign: swap fonts to Fraunces + Inter + Space Mono"
```

---

## Task D1.2: Token rewrite (`:root`)

**Files:**
- Modify: `assets/site.css` (`/* ─── Tokens ─── */`, lines ~1–38)

- [ ] **Step 1: Replace the `:root` block**

```css
:root {
  --ink:#0B0B0C; --ink-2:#141416; --ink-3:#1C1C1E;
  --bone:#ECE9E2; --bone-2:#DCD8CF;
  --grey:#8A8884; --sub:rgba(236,233,226,.60); --muted:rgba(236,233,226,.34);
  --platinum:#B7AE9C; --platinum-d:rgba(183,174,156,.14);
  --line:rgba(236,233,226,.16); --line-ink:rgba(11,11,12,.14);
  --text:#ECE9E2;
  --font:'Inter',system-ui,-apple-system,sans-serif;
  --font-display:'Fraunces',Georgia,serif;
  --font-mono:'Space Mono',ui-monospace,monospace;
  --r:2px;            /* near-zero radius — no rounded cards */
  --nh:64px; --mw:1240px;
  --t:.3s cubic-bezier(.22,1,.36,1);
  --ease:cubic-bezier(.22,1,.36,1);
  /* legacy aliases kept so un-migrated rules don't break mid-refactor */
  --bg:var(--ink); --bg-surface:var(--ink-2); --bg-card:var(--ink-2);
  --gold:var(--platinum); --gold-h:var(--platinum); --gold-line:var(--line);
  --gold-grad:var(--platinum); --paper:var(--bone); --font-serif:var(--font-display);
}
```

> Legacy aliases let later component tasks migrate incrementally without a broken intermediate state. They are removed in Task D5.3.

- [ ] **Step 2: Update body base**

In `/* ─── Reset ─── */`, replace the `body` background (the gold radial-gradient) with flat ink:

```css
body{ font-family:var(--font); background:var(--ink); color:var(--text);
  line-height:1.6; -webkit-font-smoothing:antialiased; overflow-x:hidden; }
```

- [ ] **Step 3: Verify tokens applied**

`preview_eval`: `getComputedStyle(document.body).backgroundColor` → expect `rgb(11, 11, 12)`.
`preview_console_logs` level error → expect none.

- [ ] **Step 4: Commit**

```bash
git add assets/site.css
git commit -m "redesign: rewrite design tokens to near-mono editorial palette"
```

---

## Task D1.3: Utility layer (grade, grain, hairline, index, section cadence, type scale)

**Files:**
- Modify: `assets/site.css` (append a new `/* ─── Editorial utilities ─── */` block after Tokens/Reset)

- [ ] **Step 1: Add the utility + type-scale CSS**

```css
/* ─── Editorial utilities ─── */
.u-mono{font-family:var(--font-mono);text-transform:uppercase;letter-spacing:.16em;}
.u-label{font-family:var(--font-mono);font-size:clamp(10px,2.6vw,11px);letter-spacing:.16em;
  text-transform:uppercase;color:var(--grey);}
.u-display{font-family:var(--font-display);font-weight:300;letter-spacing:-.01em;line-height:1.0;}
.u-rule{height:1px;background:var(--line);border:0;width:100%;}
.section--ink   .u-rule{background:var(--line);}
.section--bone  .u-rule{background:var(--line-ink);}

/* section light/dark cadence */
.section--ink { background:var(--ink);  color:var(--bone); }
.section--bone{ background:var(--bone); color:var(--ink);  }
.section--bone .u-label{color:#6f6c66;}

/* image grade — unify existing photos */
.u-grade{filter:grayscale(.12) contrast(1.06) brightness(.9) saturate(.92);}
.u-grade--soft{filter:grayscale(.08) contrast(1.04);}

/* film grain overlay (cheap, GPU) */
.u-grain::after{content:"";position:absolute;inset:0;pointer-events:none;opacity:.05;
  background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='2'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");}

/* oversized numbered index */
.u-index{font-family:var(--font-display);font-weight:300;line-height:.8;
  font-size:clamp(40px,12vw,120px);color:currentColor;opacity:.9;}

/* type scale */
.t-hero{font-family:var(--font-display);font-weight:300;line-height:.98;letter-spacing:-.015em;
  font-size:clamp(38px,11vw,92px);}
.t-title{font-family:var(--font-display);font-weight:300;line-height:1.02;letter-spacing:-.01em;
  font-size:clamp(28px,7vw,56px);}
.t-quote{font-family:var(--font-display);font-weight:300;line-height:1.28;
  font-size:clamp(20px,5.5vw,32px);}
```

- [ ] **Step 2: Verify a utility resolves**

Temporarily via `preview_eval`: create a div with class `t-hero`, read `getComputedStyle().fontFamily` → expect contains `Fraunces`. (Discard after.)

- [ ] **Step 3: Commit**

```bash
git add assets/site.css
git commit -m "redesign: add editorial utility layer (grade, grain, index, type scale)"
```

---

## Task D1.4: Re-sync `dealers.css`

**Files:**
- Modify: `assets/dealers.css`

- [ ] **Step 1: Remove steel/gold dealer accents**

Find any rule using `--steel*`, `--gold*`, or gradient backgrounds in `dealers.css`; replace accent color with `var(--platinum)` and remove gradient fills. Keep layout-only overrides (filter chips, brand chip, install label, Porsche sub-filter) but restyle to hairline + mono.

- [ ] **Step 2: Verify dealers page has no console errors and no gold remains**

Load `/dealers/` at 390px. `preview_eval`: `[...document.querySelectorAll('*')].some(e=>getComputedStyle(e).backgroundImage.includes('linear-gradient'))` → expect `false` for gold gradients (some image backgrounds are fine; spot-check visually).

- [ ] **Step 3: Commit**

```bash
git add assets/dealers.css
git commit -m "redesign: re-sync dealers overrides to editorial tokens"
```

---

## Task D2.1: Nav restyle

**Files:**
- Modify: `assets/site.css` (`/* ─── 1 NAV ─── */`, `/* ─── 1b BURGER MENU ─── */`)
- Modify: `index.html` + `dealers/index.html` (nav CTA text/class)

- [ ] **Step 1: Restyle nav**

```css
.nav{height:var(--nh);background:transparent;border-bottom:1px solid transparent;transition:background var(--t),border-color var(--t);}
.nav.scrolled{background:rgba(11,11,12,.82);backdrop-filter:blur(10px);border-bottom-color:var(--line);}
.nav__logo{font-family:var(--font-mono);font-weight:600;letter-spacing:.22em;text-transform:uppercase;font-size:13px;color:var(--bone);}
.nav__cta{font-family:var(--font);font-weight:500;font-size:14px;color:var(--bone);border:0;background:none;
  border-bottom:1px solid var(--platinum);padding:0 0 5px;border-radius:0;}
.nav__cta::after{content:" →";color:var(--platinum);}
```

- [ ] **Step 2: Change nav CTA markup on both pages**

Replace the nav `<a class="btn btn-gold">Get a Free Quote</a>` (already "Start your project" from content phase) with `<a href="#get-quote" class="nav__cta" data-event="start_project">Start your project</a>`.

- [ ] **Step 3: Verify**

`preview_eval` on index: nav CTA `getComputedStyle(document.querySelector('.nav__cta')).borderBottomColor` → expect platinum `rgb(183, 174, 156)`. Screenshot nav scrolled state (`window.scrollTo(0,400)`).

- [ ] **Step 4: Commit**

```bash
git add assets/site.css index.html dealers/index.html
git commit -m "redesign: editorial nav (mono wordmark, text-link CTA)"
```

---

## Task D2.2: Hero restyle (the approved mockup)

**Files:**
- Modify: `assets/site.css` (`/* ─── 2 HERO ─── */`)
- Modify: `index.html` + `dealers/index.html` (hero markup/classes)

- [ ] **Step 1: Hero CSS**

```css
.hero{position:relative;min-height:100svh;display:flex;align-items:flex-end;overflow:hidden;background:var(--ink);}
.hero__photo{position:absolute;inset:0;background-size:cover;background-position:60% center;}
.hero__photo img{width:100%;height:100%;object-fit:cover;}
.hero .u-grade{} /* applied to hero img */
.hero__veil{position:absolute;inset:0;background:linear-gradient(180deg,rgba(11,11,12,.45) 0%,rgba(11,11,12,0) 30%,rgba(11,11,12,.8) 80%,var(--ink) 100%);}
.hero__content{position:relative;z-index:2;padding:0 0 clamp(28px,8vw,72px);}
.hero__eye{margin-bottom:14px;} /* uses .u-label */
.hero__h1{margin-bottom:6px;} /* uses .t-hero */
.hero__h1 em{font-style:italic;color:#fff;}
.hero__sub{font-size:clamp(15px,4vw,18px);color:var(--sub);max-width:34ch;margin-top:14px;}
.hero__rule{margin:22px 0 14px;} /* .u-rule */
.hero__cred{} /* .u-label, color grey */
.hero__cta{display:inline-flex;align-items:center;gap:9px;margin-top:18px;color:var(--bone);
  font-weight:500;font-size:15px;border-bottom:1px solid var(--platinum);padding-bottom:6px;}
.hero__cta span{color:var(--platinum);}
```

- [ ] **Step 2: Hero markup (both pages)**

Set hero structure to: `hero__photo > img.u-grade`, `hero__veil`, `hero__content` with `p.hero__eye.u-label` ("Decal Atelier — Dubai · Est. 2008"), `h1.hero__h1.t-hero` ("Made for the car you actually drive." with `<em>` on last line), `p.hero__sub`, `hr.hero__rule.u-rule`, `p.hero__cred.u-label` ("17 yrs — 1,500+ cars — ★ 5.0"), `a.hero__cta` ("Start your project <span>→</span>"). Remove the badge pills + gold button. Keep the LCP `<img fetchpriority="high">`.

- [ ] **Step 3: Verify (mobile)**

390px. `preview_eval`: hero `h1` `getComputedStyle().fontFamily` contains `Fraunces`; hero img has `filter` not `none`. `preview_screenshot` → compare to approved mockup. `preview_console_logs` error → none.

- [ ] **Step 4: Verify LCP not regressed**

`preview_eval` PerformanceObserver for `largest-contentful-paint` (or reload + read `performance.getEntriesByType`). Expect hero image LCP < 2.5s locally.

- [ ] **Step 5: Commit**

```bash
git add assets/site.css index.html dealers/index.html
git commit -m "redesign: editorial hero (full-bleed graded photo, Fraunces headline, text CTA)"
```

---

## Task D2.3: Proof strip (new element)

**Files:**
- Modify: `index.html` + `dealers/index.html` (insert after hero, before cases)
- Modify: `assets/site.css` (append `/* ─── Proof strip ─── */`)

- [ ] **Step 1: Insert markup (both pages, after `</section>` of hero)**

```html
<aside class="proof" aria-label="Credentials">
  <div class="wrap"><p class="proof__line u-label">17&nbsp;yrs — 1,500+&nbsp;cars — ★&nbsp;5.0 Google — Ferrari to Land Cruiser</p></div>
</aside>
```

- [ ] **Step 2: CSS**

```css
.proof{background:var(--ink);border-top:1px solid var(--line);border-bottom:1px solid var(--line);}
.proof .wrap{padding-top:18px;padding-bottom:18px;}
.proof__line{color:var(--grey);text-align:center;font-size:clamp(10px,2.8vw,12px);}
```

- [ ] **Step 3: Verify** — 390px screenshot shows a single quiet ruled line, no animation. Confirm it sits directly below hero.

- [ ] **Step 4: Commit**

```bash
git add index.html dealers/index.html assets/site.css
git commit -m "redesign: add static editorial proof strip below hero"
```

---

## Task D3.1: Cases / Work — editorial layout

**Files:**
- Modify: `assets/site.css` (`/* ─── 7 CASES ─── */`)
- Modify: `index.html` + `dealers/index.html` (cases markup: index label + pull-quote)

- [ ] **Step 1: CSS — replace card styling with editorial**

```css
#cases{background:var(--bone);color:var(--ink);} /* light section */
.case-item{position:relative;}
.case-item__media{position:relative;overflow:hidden;border-radius:var(--r);}
.case-item__media img{width:100%;display:block;}
.case-item__media img.u-grade--soft{}
.case-top{display:flex;justify-content:space-between;align-items:baseline;gap:16px;margin-bottom:18px;}
.case-idx{font-family:var(--font-display);font-weight:300;font-size:clamp(34px,9vw,64px);line-height:.8;color:var(--ink);}
.case-lab{font-family:var(--font-mono);text-transform:uppercase;letter-spacing:.16em;font-size:11px;text-align:right;color:var(--ink);}
.case-lab small{display:block;color:#6f6c66;font-weight:400;}
.case-quote{margin-top:18px;} /* .t-quote, color ink */
.case-item__txt{font-family:var(--font-mono);text-transform:uppercase;letter-spacing:.1em;font-size:11px;color:#6f6c66;margin-top:14px;}
```

- [ ] **Step 2: Markup** — give each case a `.case-top` (`.case-idx` "01/02/03" + `.case-lab` marque/style), keep the before/after compare media (add `u-grade--soft` to imgs), and convert the descriptive line to `.case-quote.t-quote`. Remove the old `.case-tag` gold pill (or restyle to mono).

- [ ] **Step 3: Verify** — 390px screenshot of cases: light bg, big serif index, hairline rhythm, before/after slider still drags (`preview_click`/drag check the compare handle still works; JS untouched).

- [ ] **Step 4: Commit**

```bash
git add assets/site.css index.html dealers/index.html
git commit -m "redesign: editorial cases (index numerals, pull-quotes, light section)"
```

---

## Task D3.2: Why / pillars — ruled editorial list

**Files:**
- Modify: `assets/site.css` (`/* ─── 5 WHY CHOOSE US ─── */`, `/* ─── 4 DETAILS CARDS ─── */`)
- Modify: `index.html` + `dealers/index.html`

- [ ] **Step 1: CSS — drop gradient cards → ruled rows**

```css
#why-us{background:var(--ink);color:var(--bone);}
.choose-card{background:none;border:0;border-top:1px solid var(--line);border-radius:0;padding:28px 0;position:relative;}
.choose-card::before{display:none;} /* kill shimmer pseudo */
.choose-card__num{font-family:var(--font-mono);color:var(--platinum);letter-spacing:.16em;font-size:12px;}
.choose-card__title{font-family:var(--font-display);font-weight:300;font-size:clamp(20px,5vw,28px);margin:10px 0 8px;}
.choose-card__body{color:var(--sub);max-width:46ch;}
```

Apply the same hairline-row treatment to `.detail-card` (remove `::before` texture, gradient, radius).

- [ ] **Step 2: Markup** — add a `.choose-card__num` mono index (`01`–`04`) to each pillar; ensure children no longer rely on the removed pseudo-element z-index.

- [ ] **Step 3: Verify** — 390px screenshot: pillars as ruled rows, no cards/shadows/gold. Console error none.

- [ ] **Step 4: Commit**

```bash
git add assets/site.css index.html dealers/index.html
git commit -m "redesign: why/pillars + details as ruled editorial rows"
```

---

## Task D3.3: Process — editorial steps

**Files:**
- Modify: `assets/site.css` (`/* ─── 8 PROCESS ─── */`)
- Modify: `index.html` + `dealers/index.html`

- [ ] **Step 1: CSS**

```css
#process{background:var(--bone);color:var(--ink);}
.pstep{border-top:1px solid var(--line-ink);padding:26px 0;background:none;border-radius:0;}
.pstep__num{font-family:var(--font-display);font-weight:300;font-size:clamp(36px,9vw,68px);line-height:.8;color:var(--ink);}
.pstep__title{font-family:var(--font-display);font-weight:300;font-size:clamp(19px,4.6vw,26px);margin:10px 0 6px;}
.pstep__body{color:#5f5c56;max-width:48ch;}
.process-close__u{font-family:var(--font-display);font-weight:300;font-size:clamp(20px,5vw,30px);}
.process-close__note{font-family:var(--font-mono);text-transform:uppercase;letter-spacing:.1em;font-size:11px;color:#6f6c66;}
```

- [ ] **Step 2: Markup** — ensure `.pstep__num` uses the big serif numerals; remove any gold/card classes.

- [ ] **Step 3: Verify** — 390px screenshot: process as light editorial steps, sits above the form (order check: `[...document.querySelectorAll('section[id]')].map(s=>s.id)` shows `process` before `get-quote`).

- [ ] **Step 4: Commit**

```bash
git add assets/site.css index.html dealers/index.html
git commit -m "redesign: editorial process steps"
```

---

## Task D3.4: Reviews — quote-led editorial

**Files:**
- Modify: `assets/site.css` (`/* ─── 10 REVIEWS ─── */`)
- Modify: `index.html` + `dealers/index.html`

- [ ] **Step 1: CSS**

```css
#reviews{background:var(--ink);color:var(--bone);}
.rev-slide{background:none;border:0;}
.rev-photo img{width:100%;border-radius:var(--r);} /* + .u-grade on img */
.rev-car-tag{font-family:var(--font-mono);background:none;color:var(--bone);border:1px solid var(--line);
  border-radius:0;letter-spacing:.14em;font-size:10px;}
.rev-style-tag{font-family:var(--font-mono);color:var(--platinum);background:none;letter-spacing:.12em;font-size:10px;}
.rev-highlight{font-family:var(--font-display);font-weight:300;font-size:clamp(19px,5vw,28px);line-height:1.3;color:var(--bone);}
.rev-author-name{font-weight:600;}
.rev-author-city,.rev-meta-row{font-family:var(--font-mono);text-transform:uppercase;letter-spacing:.1em;font-size:10px;color:var(--grey);}
.rev-arrow{background:none;border:1px solid var(--line);border-radius:0;color:var(--bone);}
.rev-stars{color:var(--platinum);} /* muted, not gold */
```

- [ ] **Step 2: Markup** — add `u-grade` to review imgs; remove gold pill backgrounds (CSS handles). No content changes (already recurated to premium marques).

- [ ] **Step 3: Verify** — 390px screenshot of reviews: big serif quote, mono attribution, graded photo, platinum stars. Slider arrows still advance (`preview_click` `#rev-next`, re-screenshot).

- [ ] **Step 4: Commit**

```bash
git add assets/site.css index.html dealers/index.html
git commit -m "redesign: quote-led editorial reviews"
```

---

## Task D4.1: Gallery — unified duotone grid

**Files:**
- Modify: `assets/site.css` (`/* ─── 6 GALLERY SLIDER ─── */`)
- Modify: `index.html` + `dealers/index.html`

- [ ] **Step 1: CSS**

```css
#gallery{background:var(--bone);color:var(--ink);}
.g-photo{position:relative;overflow:hidden;border-radius:var(--r);}
.g-photo img{filter:grayscale(1) contrast(1.05);transition:filter .5s var(--ease);}
.g-photo:hover img,.g-photo:focus-within img{filter:grayscale(0) contrast(1.02);}
.g-name{font-family:var(--font-mono);text-transform:uppercase;letter-spacing:.1em;font-size:10px;color:#6f6c66;}
.g-cta__text{font-family:var(--font-display);font-weight:300;font-size:clamp(20px,5vw,30px);color:var(--ink);}
```

- [ ] **Step 2: Markup** — ensure gallery heading reframed ("Starting points — each tailored to your car", already from content phase); convert gallery CTA button to text-link style.

> Mobile note: hover reveal won't fire on touch. On mobile, leave the duotone OR reveal color for the in-view card via IntersectionObserver (optional, only if D5 motion budget allows). Default acceptable: duotone grid on mobile, color on the open/active item.

- [ ] **Step 3: Verify** — 390px + desktop screenshot. Desktop hover reveals color (`preview_eval` hover simulation or visual). Gallery arrows still scroll (`#g-next`).

- [ ] **Step 4: Commit**

```bash
git add assets/site.css index.html dealers/index.html
git commit -m "redesign: duotone editorial gallery grid"
```

---

## Task D4.2: Price tiers + brief — restyle to system

**Files:**
- Modify: `assets/site.css` (`/* ─── Standalone lead form ─── */` + brief styles)
- Modify: `index.html` + `dealers/index.html` (classes only; brief logic untouched)

- [ ] **Step 1: CSS — ruled price list + hairline brief**

```css
.cta-form{background:var(--ink);color:var(--bone);}
.price-tiers{list-style:none;margin:0;padding:0;}
.price-tier{display:flex;justify-content:space-between;align-items:baseline;gap:16px;
  padding:16px 0;border-top:1px solid var(--line);}
.price-tier__name{font-family:var(--font);font-size:15px;}
.price-tier__val{font-family:var(--font-mono);letter-spacing:.06em;color:var(--platinum);font-size:14px;}
.brief{background:none;border:1px solid var(--line);border-radius:var(--r);padding:clamp(18px,5vw,28px);}
.brief__step-label{font-family:var(--font-mono);text-transform:uppercase;letter-spacing:.14em;font-size:10px;color:var(--grey);}
.brief__progress{background:var(--line);}
.brief__progress-bar{background:var(--platinum);}
.brief__q{font-family:var(--font-display);font-weight:300;font-size:clamp(20px,5vw,28px);}
.brief__input{background:rgba(236,233,226,.04);border:0;border-bottom:1px solid var(--line);border-radius:0;
  color:var(--bone);font-family:var(--font);padding:12px 2px;}
.brief__input:focus{outline:0;border-bottom-color:var(--platinum);}
.brief__choice{border:1px solid var(--line);border-radius:0;background:none;color:var(--bone);}
.brief__choice input:checked + span,.brief__choice:has(input:checked){border-color:var(--platinum);}
.brief__btn{background:var(--bone);color:var(--ink);border:0;border-radius:0;font-weight:600;}
.brief__btn--ghost{background:none;color:var(--bone);border:1px solid var(--line);}
```

- [ ] **Step 2: Verify the brief still works end-to-end**

390px. Step through: fill make/model (`preview_fill`), click vision radio, click budget radio, fill name/phone, observe step index advances and progress bar fills. `preview_eval` confirm `.brief__progress-bar` width grows. Do NOT submit (no live POST in dev) — confirm the submit handler exists: `preview_eval` `typeof window.fbq`.

- [ ] **Step 3: Verify Meta value mapping intact** — `preview_eval` read that budget radios still carry the AED values (markup unchanged): `[...document.querySelectorAll('[data-choice=budget] input')].map(i=>i.value)`.

- [ ] **Step 4: Commit**

```bash
git add assets/site.css index.html dealers/index.html
git commit -m "redesign: editorial price list + qualifying brief restyle"
```

---

## Task D4.3: FAQ + Footer

**Files:**
- Modify: `assets/site.css` (`/* ─── FAQ ─── */`, `/* ─── 9 FOOTER ─── */`)
- Modify: `index.html` + `dealers/index.html`

- [ ] **Step 1: CSS**

```css
#faq{background:var(--bone);color:var(--ink);}
.faq-item{border-top:1px solid var(--line-ink);}
.faq-q{font-family:var(--font-display);font-weight:300;font-size:clamp(17px,4.4vw,22px);color:var(--ink);background:none;}
.faq-q__num{font-family:var(--font-mono);color:var(--platinum);font-size:12px;letter-spacing:.14em;}
.faq-a{color:#5f5c56;}
.footer{background:var(--ink);color:var(--bone);border-top:1px solid var(--line);}
.footer a{color:var(--sub);} .footer a:hover{color:var(--bone);}
.footer__mono{font-family:var(--font-mono);text-transform:uppercase;letter-spacing:.12em;font-size:11px;color:var(--grey);}
```

- [ ] **Step 2: Markup** — add `.faq-q__num` mono indices (`01`…); ensure footer details use mono labels + "by appointment" tone.

- [ ] **Step 3: Verify** — 390px screenshot FAQ (ruled accordion opens — `preview_click` a `.faq-q`, confirm `aria-expanded` toggles + panel expands) and footer.

- [ ] **Step 4: Commit**

```bash
git add assets/site.css index.html dealers/index.html
git commit -m "redesign: editorial FAQ accordion + footer"
```

---

## Task D5.1: Motion — curtain reveal + hairline draw

**Files:**
- Modify: `assets/site.css` (utility block)
- Modify: `assets/site.js` (reveal module — add class hooks only, reuse existing IntersectionObserver)

- [ ] **Step 1: CSS**

```css
.reveal-img{clip-path:inset(0 0 100% 0);transition:clip-path 1s var(--ease);}
.reveal-img.visible{clip-path:inset(0 0 0 0);}
.reveal-rule{transform:scaleX(0);transform-origin:left;transition:transform .9s var(--ease);}
.reveal-rule.visible{transform:scaleX(1);}
@media (prefers-reduced-motion:reduce){
  .reveal-img,.reveal-rule{transition:none;clip-path:none;transform:none;}
}
```

- [ ] **Step 2: JS** — in the existing scroll-reveal IntersectionObserver, add `.reveal-img`/`.reveal-rule` to the observed selector so they get `.visible` (same mechanism as `[data-animate]`). No new observer.

- [ ] **Step 3: Markup** — add `reveal-img` to hero/cases/reviews media and `reveal-rule` to section hairlines (progressive; safe to add broadly).

- [ ] **Step 4: Verify** — scroll the page (`preview_eval` `window.scrollTo`) and screenshot mid-reveal; confirm `prefers-reduced-motion` disables (`preview_eval` matchMedia). Console error none.

- [ ] **Step 5: Commit**

```bash
git add assets/site.css assets/site.js index.html dealers/index.html
git commit -m "redesign: curtain image reveals + hairline draw-in"
```

---

## Task D5.2: Desktop craft + performance pass

**Files:**
- Modify: `assets/site.css` (desktop-only block)
- Modify: `assets/site.js` (optional cursor, gated)

- [ ] **Step 1: Desktop-only cursor/magnetic (gated, zero mobile cost)**

```css
@media (hover:hover) and (min-width:1024px){
  .has-cursor{cursor:none;}
  .ec-cursor{position:fixed;width:14px;height:14px;border:1px solid var(--platinum);border-radius:50%;
    pointer-events:none;z-index:9999;transform:translate(-50%,-50%);transition:transform .12s var(--ease);mix-blend-mode:difference;}
}
```

JS: only attach the cursor/magnetic listeners inside `if (window.matchMedia('(hover:hover) and (min-width:1024px)').matches)`. Skip entirely otherwise.

- [ ] **Step 2: Mobile performance pass**

390px. Reload. `preview_eval` collect: LCP (`performance.getEntriesByType('largest-contentful-paint')` last entry), CLS (PerformanceObserver layout-shift sum). Targets: LCP < 2.5s, CLS < 0.1. If LCP regressed, check font preload + hero `fetchpriority`. `preview_console_logs` error → none.

- [ ] **Step 3: Verify desktop craft does not run on mobile** — `preview_eval` at 390px: confirm no `.ec-cursor` element exists.

- [ ] **Step 4: Commit**

```bash
git add assets/site.css assets/site.js
git commit -m "redesign: desktop cursor/magnetic craft + mobile perf pass"
```

---

## Task D5.3: Cleanup — remove legacy aliases + dead CSS

**Files:**
- Modify: `assets/site.css`, `assets/dealers.css`, `CLAUDE.md`

- [ ] **Step 1: Remove legacy token aliases** added in D1.2 (`--bg`, `--gold*`, `--paper`, `--font-serif`, etc.) and fix any remaining references the build surfaces.

- [ ] **Step 2: Grep for dead tokens**

Run: `grep -rn "gold-grad\|--steel\|btn-gold\|badge--rating" assets/ index.html dealers/index.html`
Expected: no matches (or only intentional). Fix any stragglers.

- [ ] **Step 3: Update `CLAUDE.md`** — replace the "Key CSS Conventions" gold/Playfair description with the editorial token set (ink/bone/platinum, Fraunces/Inter/Space Mono, hairlines, index motif, grade utility).

- [ ] **Step 4: Full verify** — load index + `/dealers/` at 390px and desktop, screenshot top-to-bottom, `preview_console_logs` error → none on both. Confirm both pages share the new look.

- [ ] **Step 5: Commit**

```bash
git add assets/site.css assets/dealers.css CLAUDE.md
git commit -m "redesign: remove legacy gold/steel tokens, update CLAUDE.md conventions"
```

---

## Self-review (spec coverage)

- Palette/no-gold → D1.2, D1.4, D5.3 ✓
- Type system → D1.1, D1.3 ✓
- Layout (hairlines/index/asymmetry/whitespace) → D1.3, D3.x ✓
- Image grade/duotone/grain → D1.3, D2.2, D4.1 ✓
- Motion (curtain/hairline/desktop cursor, no WebGL) → D5.1, D5.2 ✓
- Per-section application (nav→footer) → D2.1–D4.3 ✓
- Mobile-first + perf budget → every task verifies at 390px; D5.2 LCP/CLS ✓
- Both pages → every task edits both HTML files ✓
- Architecture kept (JS/brief/sliders/modal intact) → D3.1/D3.4/D4.1/D4.2 verify interactions still work ✓
- Folded content edits committed → Task 0 ✓

No placeholders; class/token names consistent across tasks (`--platinum`, `.u-grade`, `.t-hero`, `.case-idx`, `.brief__progress-bar`).

## Risks / watch-items

- Light/dark section flips: verify text contrast on each `--bone` section (WCAG AA for body).
- `:has()` used in brief choice styling — supported in current evergreen browsers; acceptable for ad traffic. Fallback: the radio is still functional without the visual checked-state.
- Removing pseudo-element textures (`::before`) on cards: ensure child `z-index:1` rules that depended on them don't leave stranded stacking — spot-check.
- Duotone gallery on touch: no hover; accept duotone or wire in-view color reveal (optional).
