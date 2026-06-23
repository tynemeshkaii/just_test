# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Landing page for **Just Graphics** — a premium car decal studio in Dubai (live domain: `just-graphics.art`). No build tools, no frameworks, no package.json. Two marketing pages share extracted CSS/JS assets:

- `index.html` (~1850 lines) — main landing page
- `dealers/index.html` (~1930 lines) — OEM/dealer-style landing at `/dealers`
- `assets/site.css` (~3070 lines) — **shared** stylesheet, linked by both pages
- `assets/dealers.css` — dealer-only style overrides (loaded after `site.css` on the dealers page)
- `assets/site.js` (~525 lines) — **shared** script (immediate navbar/burger + deferred `initApp`), linked by both pages
- `privacy.html` — standalone styled privacy policy page

A separate Cloudflare Worker in `worker/` handles lead submission + Meta CAPI.

## Dev Server

```bash
npx serve -p 3333 .
```

Then open `http://localhost:3333`. Configured in `.claude/launch.json`.

## Git Helper

`Makefile` wraps the commit/push flow:

```bash
make push              # stage all, commit "update", push to main
make push m="message"  # custom commit message
make status            # git status
```

## Architecture — page HTML + shared assets

Each page (`index.html`, `dealers/index.html`) carries its own `<head>`, body HTML, and a small page-specific script; **CSS and the bulk of JS are external and shared**. Top-to-bottom per page:

1. `<head>` — meta, **Meta Pixel** (id `1759815045191457`) bootstrap + `external_id` from `localStorage` (`jg_extid`) **inline** (must run early for PageView), Open Graph / Twitter cards + JSON-LD (per-page, differ between the two pages), font preloads (Inter + Playfair Display), LCP image preload, DNS prefetch, then `<link rel="stylesheet" href="/assets/site.css">` (dealers also links `/assets/dealers.css`)
2. SVG sprite — `<svg style="display:none">` with `<symbol>` defs: `#i-wa`, `#i-ig`, `#i-fb`, `#i-left`, `#i-right`, `#i-compare`
3. HTML sections in DOM order: Nav (`.nav`) + mobile menu panel (`.menu-panel`) → Hero → Cases → Gallery → Reviews → Details → Why Us → CTA lead form (`#get-quote`) → FAQ → Process → Footer → catalog modal + floating WhatsApp + sticky mobile CTA
4. Two `<script>` tags at the bottom: an **inline** `window.JG_pageInit = function(ctx){…}` block (the page-specific catalog modal + standalone gallery lead form — these differ between pages: index has racing liveries, dealers has brand/platform filters), followed by `<script src="/assets/site.js" defer>`.

**Shared CSS** lives in `assets/site.css`. Sections delimited by `/* ─── N. NAME ─── */` comments — Tokens, Reset, Container, Scroll reveal, Section, Buttons, then numbered: 1 NAV, 1b BURGER MENU, 2 HERO, 4 DETAILS CARDS, 5 WHY CHOOSE US, 6 GALLERY SLIDER, 7 CASES, 8 PROCESS, 9 FOOTER, plus Floating WhatsApp, Mid-page CTA, Standalone lead form, Sticky mobile CTA bar, FAQ, 10 REVIEWS. Dealer-only tweaks (gallery card clamp, horizontal-scroll catalog filters, brand chip, install label, Porsche sub-filter) are appended in `assets/dealers.css` and win by cascade order.

**Edit shared styles/scripts in `assets/`, not in the HTML.** A change there applies to both pages. Only catalog/lead-form logic and the head meta are per-page.

## Key CSS Conventions

The site uses the **"Editorial Atelier"** near-mono visual system (re-skinned from the old dark+gold template). No gold, no rounded cards, no gradient fills.

- **Design tokens** in `:root` — always use variables, never raw hex/values in components
- **Palette**: `--ink` (#0B0B0C) / `--ink-2` / `--ink-3` dark surfaces; `--bone` (#ECE9E2) / `--bone-2` light surfaces; `--platinum` (#B7AE9C) is the single muted accent (replaces gold); `--grey`/`--sub`/`--muted` for secondary text; hairlines `--line` (on ink) and `--line-ink` (on bone)
- **Font stack**: `--font` (Inter, sans body), `--font-display` (Fraunces, serif — weight 300 for headings/quotes/big index numerals), `--font-mono` (Space Mono, uppercase labels/eyebrows/tags)
- **Radius**: `--r` = 2px (near-zero — no rounded cards/pills); square hairline borders everywhere
- **Section cadence**: strict light/dark alternation. Full DOM order tone sequence is `I·I·B·I·B·I·B·I·B·I` — hero+cases are a deliberate paired ink "opening act"; from `#gallery` down it alternates cleanly. Bone (light): `#gallery`/`#details`/`#process`/`#faq`. Ink (dark): hero/`#cases`/`#reviews`/`#why-us`/`.cta-form`/footer. `.section--ink`/`.section--bone` utilities are the **single source of truth** for tone (set bg+text); per-section `#id` bg overrides and the old `.section--surface`/`.section--dark` names + per-section radial tints were removed. Dividers: same-tone neighbours get a soft `::before` fade, tone changes get a crisp boundary (no gradient bleed)
- **Utilities** (after Tokens/Reset): `.u-label` (mono eyebrow), `.u-rule` (hairline), `.u-grade`/`.u-grade--soft` (image grade filter unifying photos), `.u-index` (oversized serif numeral), type scale `.t-hero`/`.t-title`/`.t-quote`
- **Editorial motifs**: ruled rows (border-top hairline) instead of cards; big serif numerals as section index; duotone gallery (grayscale → color on hover/focus); text-link CTAs (bottom-border + `→`) instead of filled buttons
- **Scroll reveal**: `[data-animate]` + `.visible` toggled by IntersectionObserver; stagger groups use `.stagger`. Motion add-ons `.reveal-img` (clip-path curtain) and `.reveal-rule` (scaleX hairline draw) ride the same observer; both disabled under `prefers-reduced-motion`
- **Easing**: `--ease` / `--t` = `cubic-bezier(0.22, 1, 0.36, 1)`
- **Desktop craft**: custom `.ec-cursor` ring attached only inside `(hover:hover) and (min-width:1024px)` (zero mobile cost)
- **Legacy note**: the `.btn-gold` class name persists in markup but now renders as a bone/platinum editorial primary button (no gold)

## JavaScript Modules

**Shared logic lives in `assets/site.js`.** Navbar scroll + scroll progress and the burger menu are bound **immediately**; everything else lives in `initApp()`, run via `requestIdleCallback` (fallback `setTimeout(200ms)`). After running its own modules, `initApp` calls `window.JG_pageInit(ctx)` with `ctx = { utmParams, getMetaIds, fmt }` — this is the **dependency-injection hook** for the page-specific modules. Shared modules (in order):

- **UTM params** — captured from URL, sent with leads
- **Meta cookies helper** — reads `fbc` / `fbp` cookies for CAPI match quality (`getMetaIds`, injected into `ctx`)
- **Number counters** — animated stats (uses `fmt`)
- **Scroll reveal** — IntersectionObserver for `[data-animate]` and `.stagger`
- **Gallery filter tabs + slider** — `#g-track` horizontal scroll; `#g-prev`/`#g-next` arrows call `scrollBy`, step = card width + 14px gap; per-view count is responsive (3/2/1)
- **Cases slider** — `translateX` carousel, IntersectionObserver-gated auto-play (pauses off-screen), touch swipe
- **Reviews slider** — carousel with expand/collapse review panel, keyboard nav, touch swipe
- **Before/After compare** — mouse + touch drag sets `clip-path: inset(...)` on `.compare__after`; one-time hint nudge on viewport entry
- **FAQ accordion** — `aria-expanded` + `max-height` transition on `.faq-a-wrap`
- **Multi-step qualifying brief** (`initBrief`) — reusable 4-step lead engine (1 car make/model/year · 2 vision · 3 **budget** qualifier · 4 contact). Drives any `.brief` root: scopes radio groups per instance, step validation + progress bar, builds payload (`car`, `vision`, `budget`, `budgetValue`, optional `livery`/`product`/`brand`), POSTs to the Worker, fires Meta `Lead` with `value`/`currency` from budget. Returns `{reset, prefill, goTo}`. The page brief (`#page-brief`, in `#get-quote`) is auto-inited here; `initBrief` is exposed on `ctx` for the page-specific catalog/gallery briefs. **Replaced the old single `#page-lead-form` / `#lead-form` / `#lead-form-sa`.**
- **Sticky mobile CTA bar**
- **Data-event Pixel helper** — fires Meta events with `eventID` (for pixel/CAPI dedup) and `external_id`

**Page-specific modules** live in each page's inline `window.JG_pageInit = function(ctx){…}` block (they alias `utmParams`/`getMetaIds`/`fmt` off `ctx`). These differ between the two pages and must NOT be moved into `site.js`:

- **Catalog modal** — `#catalog-modal` full catalog with filters, focus trap; opened by `#g-viewall`; its slide-in lead panel (`#lead-panel`) hosts a multi-step brief instance (`#catalog-brief`, inited via `ctx.initBrief`, pre-filled with the picked item's livery/brand/product + vision). index = racing liveries (`DATA` with size/number/price); dealers = brand/platform filters, brand chips, Porsche sub-filter, `DATA` with a brand field.
- **Gallery standalone brief** — gallery item click opens `#lead-panel-standalone` hosting a brief instance (`#gallery-brief`, `ctx.initBrief`, pre-filled with the picked style).

## Lead Submission — Cloudflare Worker (`worker/`)

`worker/src/index.js` (deployed as `just-graphics-leads`, fronted at `https://leads.just-graphics.art/submit`). The site POSTs JSON; the Worker:

- **`event: 'WhatsAppClick'`** → fires Meta CAPI `Contact` event only
- **Lead payload** (`name`, `phone`, `car`, `livery`, `source`, `utm`, plus `fbc`/`fbp`/`externalId`/`eventID`; multi-step brief also sends `vision`, `budget`, `budgetValue`, and on dealers `brand`/`product`) → in parallel (`Promise.allSettled`): creates a **Bitrix24 CRM lead** (`crm.lead.add`, maps UTM fields; `vision`/`budget`/`coverage` appended to `COMMENTS`; `budget` also maps to a dedicated CRM field if `BITRIX_BUDGET_FIELD` env var is set) and fires Meta CAPI `Lead` (with `custom_data.value`+`currency: AED` from `budgetValue` for value-based optimization). `name`+`phone` required.
- Meta CAPI: hashes `ph`/`fn`/`external_id` with SHA-256, passes through `fbc`/`fbp`/`event_id` for pixel dedup, sends to Graph API v21.0.

Config in `worker/wrangler.toml` — `[vars]` `PIXEL_ID` + `BITRIX_URL`; `META_CAPI_TOKEN` is a secret (`wrangler secret put META_CAPI_TOKEN`). CORS is locked to `https://just-graphics.art`. Deploy with `wrangler deploy` from `worker/`.

## Images

All images are WebP only — PNG/JPG originals were deleted. Filenames are ASCII slugs (previously had spaces + Cyrillic; renamed). Image locations: root before/after pairs (`ferrari-before.webp`/`ferrari-after.webp`, `ford-bronco-*`, `race-car-*`), `gallery/` (numbered `1.webp`… for index), `dealers-gallery/` (numbered, for the dealers catalog), `reviews/` (review car photos, e.g. `bmw-m4.webp`).

LCP image (`ferrari-after.webp`) has `fetchpriority="high" loading="eager"`. All others use `loading="lazy" decoding="async"`.

## Note on AGENTS.md

`AGENTS.md` is a Codex-targeted copy of an older version of this file and is partially stale (mentions `.Codex/launch.json`, "~900 lines" CSS). Treat **this file** as the source of truth; update `AGENTS.md` to match if you change project structure.
