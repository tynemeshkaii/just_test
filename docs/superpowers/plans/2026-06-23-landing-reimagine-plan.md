# Just Graphics — Landing Reimagine: Implementation Plan

**Date:** 2026-06-23
**Spec:** [docs/superpowers/specs/2026-06-23-landing-reimagine-design.md](../specs/2026-06-23-landing-reimagine-design.md)
**Direction:** A+C hybrid — Premium Craft Reposition + Qualified Funnel.
**Scope:** Both pages (`index.html`, `dealers/index.html`) via shared assets. Reskin + remessage + new multi-step brief. Not a rebuild.

## Locked decisions

1. **Gold:** retune `--gold` → `#C9A84C` (per spec). Also retune `--gold-h`/`--gold-grad` stops to harmonize with new base.
2. **Forms:** replace **all 3** lead forms with the multi-step qualifying brief:
   - `#page-lead-form` (main CTA, `index.html:966`, handler `site.js:394-449`)
   - `#lead-form-sa` (gallery standalone, `JG_pageInit`, `index.html:1819`, handler `~:1678`)
   - `#lead-form` (catalog modal, `JG_pageInit`, handler `~:1552`)

## Reality notes (verified against code, not spec)

- Spec hex (`#0A0A09` ink, `#15140f` panel) partly mismatches repo tokens. **Use token names, never raw hex in components.** Repo: `--bg:#0A0A09` (matches), `--bg-card:#1A1A18`, `--gold:#C4A45D`→`#C9A84C`.
- Hero already animates `data-count="5.0"` + `data-count="1500"` (`index.html:214`). Killing count-up = strip `data-count`/`data-decimals` attrs.
- 3 forms, 3 separate submit handlers, all POST `https://leads.just-graphics.art/submit`. Worker `worker/src/index.js` branches on `event`/`product`/`source`.
- **Input still needed before P3 ships:** Bitrix CRM field id for budget tier (UF_CRM_* or fold into `COMMENTS`).

---

## P1 — Copy + price + CTA swap + recurate

Pure text/HTML. Both pages. No JS/structure change. Independently shippable.

### 1.1 Vocabulary swap (both pages, visible copy only — not CSS class names)
- decal / sticker → graphics / livery / design
- "Get a Free Quote" → "Start your project" (nav CTA, hero CTA `index.html:222`, WhatsApp prefill `text=` `index.html:219`)
- Remove urgency: free / today / same-day / hurry / "within 2 hours" (`cta-form__sub` `:947`, trust items `:951-960`)

### 1.2 Hero remessage (`index.html:207-216`; mirror in `dealers/index.html`)
- Eyebrow → "Bespoke Automotive Graphics · Dubai"
- `h1` → "Make your car unmistakably yours." (keep one `<em>` gold-grad word)
- sub → "Designed, printed and fitted to your exact car — under one roof. You approve the concept before we print."
- Replace `.badges` block (`:213-216`) with one quiet static credential line: "17 years · 1,500+ cars · ★ 5.0 Google" (no `data-count`)
- CTA: primary "Start your project" → anchors to brief (`#get-quote`); WhatsApp demoted to quiet text link

### 1.3 Price anchor
Add filter line near hero + brief: "Projects from AED 1,500. Most clients invest AED 1,500–5,000, depending on coverage and complexity." (Deliberately re-adds a *higher* anchor; commit `c3619ab` removed the old AED 290 anchor.)

### 1.4 Static social proof
Strip `data-count`/`data-decimals` from hero badge + any why-us counters. Hardcode final values.

### 1.5 Recurate (content + DOM order)
- Reviews (`index.html:616-801`): Porsche 911 GT3 first; cut/demote Supra (`:732`), 370Z (`:766`), Patrol (`:698`). Repeat for dealers.
- Cases captions (`:249-342`): premium phrasing ("Factory-grade Bronco graphics, fitted in-house")
- Gallery heading (`:365` section): "39 ready designs" → "Starting points — each tailored to your car."

### Verify
`npx serve -p 3333 .` → preview_start → snapshot hero + reviews order → screenshot. Grep both pages for residual `free|sticker|today|same-day`.

---

## P2 — Aesthetic detune (`assets/site.css` + `assets/dealers.css`)

### 2.1 Tokens (`site.css:3-35`)
- `--gold: #C9A84C;` (was `#C4A45D`); retune `--gold-h`, `--gold-d`, `--gold-d2`, `--gold-grad` stops to match.
- Add `--paper: #F4EFE6;` (warm off-white editorial space)
- Add `--gold-line: rgba(201,168,76,0.45);` (thin accent for rules/marks)

### 2.2 Gold fill → accent
- Audit every `background: var(--gold...)` / `var(--gold-grad)`. Keep grad on `<em>` headlines + hairline rules only. Convert badge/button gold *fills* → outline or `--paper`.
- Floating WhatsApp + sticky mobile CTA bar: detune (smaller, quieter, lower contrast) — CSS sections "Floating WhatsApp", "Sticky mobile CTA bar".

### 2.3 Whitespace + type
- Bump `--section` padding, line-height, card margins. Fewer elements per view. Serif headlines only (already convention).

### 2.4 Remove cheap tells
- Badge-spam pills, urgency remnants. If number-counter module has no targets after P1, strip it from `site.js`.

### 2.5 New proof strip (structural move ①)
- New `<section>` after hero, both pages: "17 years · 1,500+ cars · 5.0 Google · Ferrari to Land Cruiser." (static).
- New small block in shared `site.css`.

### Verify
preview screenshot desktop + `preview_resize` mobile/dark; `preview_inspect` gold usage; confirm no count-up fires (console).

---

## P3 — Multi-step qualifying brief + Worker

### 3.1 New shared module — `assets/site.js`, `initBrief()` in `initApp` (before `JG_pageInit(ctx)`)
4 steps:
1. Your car — make / model / year
2. Vision — ready style / custom design / not sure
3. **Budget — 1,500–3,000 / 3,000–5,000 / 5,000+ / "Not sure — advise me"** (hard qualifier)
4. Contact — name + phone/WhatsApp

- Progress UI, next/back, per-step validation, focus management (reuse focus-trap pattern from catalog modal).
- Uses `ctx` (utmParams, getMetaIds, fmt) — same DI hook.
- Generic: drives any `[data-brief]` container so all 3 placements share one engine.

### 3.2 Section markup (structural move ④, spec §6)
- Rebuild `#get-quote` (`index.html:941-996`) as **price tiers + brief**. Keep `#get-quote` id (nav anchor continuity).
- Price tiers above brief: Accent & partial *from AED 1,500* / Multi-panel · livery *AED 3,000–5,000* / Full custom *AED 5,000+*.
- Convert `#lead-form-sa` (gallery) + `#lead-form` (catalog) to brief instances. Catalog brief can pre-fill car/livery/brand from clicked item.

### 3.3 Payload extension
- Submit (model `site.js:417-427`) adds `budget`, `coverage`, `vision`. `name`+`phone` still required. WhatsApp = quiet secondary.

### 3.4 Worker (`worker/src/index.js`) — additive
- Destructure `budget, coverage, vision` (`:32`)
- Bitrix: append to `comments` (`:49-55`); map `budget` → CRM field (**need field id**)
- Meta CAPI `Lead`: add `custom_data.value` = numeric budget midpoint + `currency:'AED'` (`:117-120`) for value-based optimization
- Deploy: `wrangler deploy` from `worker/`. CORS unchanged.

### 3.5 Retire old handlers
- Remove 3 old submit handlers (`site.js:394-449`, `~:1552`, `~:1678`) once brief engine handles all. Keep one shared submit fn.

### Verify
preview fill each step + submit; `preview_network` shows payload w/ budget; `wrangler dev` returns `bitrix:sent, capi:sent`; Meta Test Events shows value param.

---

## P4 — Media side (out of repo)

Ad-creative alignment + value-based targeting. Doc-only handoff to marketing. Depends on P3 budget field feeding Meta.

---

## Cross-cutting

- **Docs:** update `CLAUDE.md` (brief module, proof-strip section, worker budget); sync stale `AGENTS.md`.
- **Execution order:** P1 → ship → P2 → P3 (worker + forms together) → P4. Each phase shippable alone.
- **Git:** `make push m="..."` per phase.

## Success criteria (spec §13)
- Fewer no-budget/haggler leads (qualitative from sales)
- Higher cost per *qualified* lead acceptable; lead→paid up
- Meta optimizing on budget value; Bitrix leads carry budget
- Page reads as established studio, not ad funnel
