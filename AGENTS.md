# AGENTS.md

This file guides Codex when working in this repository.

**`CLAUDE.md` is the source of truth.** Read it for full project structure, conventions,
and architecture. This file is a short Codex-targeted pointer kept deliberately thin so it
cannot drift out of sync again.

## Project

Landing page for **Just Graphics** — a premium car decal studio in Dubai
(`just-graphics.art`). No build tools, no frameworks, no package.json. Two marketing pages
share extracted CSS/JS assets:

- `index.html` — main landing page
- `dealers/index.html` — OEM/dealer landing at `/dealers`
- `assets/site.css` — **shared** stylesheet (linked by both pages)
- `assets/dealers.css` — dealer-only overrides (loaded after `site.css` on the dealers page)
- `assets/site.js` — **shared** script (immediate navbar/burger + deferred `initApp`)
- `privacy.html` — standalone privacy policy page
- `worker/` — Cloudflare Worker for lead submission + Meta CAPI

## Dev Server

```bash
npx serve -p 3333 .
```

Then open `http://localhost:3333`.

## Editing rule

**Edit shared styles/scripts in `assets/`, not in the HTML** — a change applies to both
pages. Only the per-page catalog/lead-form logic (inline `window.JG_pageInit`) and the head
meta are page-specific.

See `CLAUDE.md` for the design-token system ("Editorial Atelier" near-mono: no gold,
`--platinum` accent, square 2px radius, Fraunces/Inter/Space Mono), the JS module map, and
the Worker/lead-submission details.
