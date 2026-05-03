# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

meghaDesk — UI/UX prototype for an AI-first helpdesk SaaS. Static HTML/CSS/vanilla JS only. **No build step, no npm, no framework.** Files open directly in a browser. Published to GitHub Pages at https://mi2arun.github.io/meghadesk-prototype/ on every push to `main`.

The product itself doesn't exist yet — this repo is a **design-system + UX prototype** that demonstrates ten distinct surfaces a real implementation would render. There is no backend, no API, no test suite. All "data" is hand-written into HTML for visual fidelity.

## Working with the prototype

```bash
# Just open the file
open prototype/phase-1/index.html       # the prototype hub (lists all phases)
open index.html                          # root redirects to the hub

# Or serve it
python3 -m http.server 8000              # then http://localhost:8000

# Deploy: push to main; GitHub Pages auto-rebuilds in ~1-2 min
git push
```

There is nothing to build, lint, or test. Verification = open in a browser, toggle light/dark, toggle compact/comfortable density, press `⌘K`.

## Architecture: three design directions, ten surfaces

The repo's organising idea is that **a real helpdesk product needs three distinct visual languages, not one.** Each `prototype/phase-N/` folder is a self-contained surface in one of the three directions:

| Direction | Used by | Body type | Card style | Mono chrome | AI sparkles |
|---|---|---|---|---|---|
| **Operator density** (Linear / Plain / Pylon lineage) | Phases 1–6, 9 | 14 / 20 | hairline + bg-muted | yes (IDs, ages, %) | agent-side AI only |
| **Content-shop calm** (Notion help / Stripe Atlas) | Phase 7 | 17 / 28 | soft shadow + 14px radius | almost never | none (customer side) |
| **Soft conversational** (Help Scout / Intercom) | Phase 8 | 15 / 22 | bigger soft shadow + 18px radius | almost never | none (customer side) |

**Phase mapping:**

- `phase-1/` — App shell foundation: tokens.css, shell.css (topbar/rail/popover/cmdk/segmented), shell.js (theme + density + cmdk + popovers + status pill)
- `phase-2/` — Inbox (3-pane: filters · ticket list · reading pane). Defines the message types (.msg-email/.msg-wa/.msg-note/.msg-voice/.msg-ai), composer, chips (status-tag/priority-tag/channel-chip), tag-pill, sla-text, sla-breach-chip
- `phase-3/` — Ticket detail (3-pane: customer · conversation · AI sidebar). Defines AI components (.ai-summary, .ai-action, .sentiment), Stripe-card pattern, kb-row, recent-row, prop-row
- `phase-4/` — Kanban (5-column board). Defines .kanban-card, .wip-meter, status colors per column
- `phase-5/` — Knowledge base (3-pane: tree · article · metadata). Defines .kb-vis-badge, .kb-ai-nudge, .kb-perf-stat, .kb-version-row, .kb-linked-row
- `phase-6/` — Component library (single-page docs catalog of phases 1–5). 8 sections with sticky TOC + scroll-spy
- `phase-7/` — Customer help center (content-shop calm) · `help.html` (categories grid + popular) and `article.html` (customer view of the same article from phase-5)
- `phase-8/` — Embeddable chat widget (soft conversational) · `demo.html` shows the widget docked on a fake Acme product page
- `phase-9/` — Omnichannel desk (operator density, but realtime). KPI strip + activity stream + live detail panel with animated waveforms, ticking timers, live transcript

## Stylesheet inheritance — what to import where

This is the most important thing to get right when editing or adding phases:

**Operator surfaces (phases 1–6, 9):**
```html
<link rel="stylesheet" href="../phase-1/tokens.css" />
<link rel="stylesheet" href="../phase-1/shell.css" />
<link rel="stylesheet" href="../phase-2/inbox.css" />   <!-- chips/avatars/messages/composer -->
<link rel="stylesheet" href="../phase-3/ticket.css" />  <!-- AI cards, stripe-card, recent-row, prop-row -->
<link rel="stylesheet" href="<this-phase>.css" />
```
Plus `<script src="../phase-1/shell.js"></script>` for theme/density/cmdk behavior.

**Customer surfaces (phases 7, 8):**
```html
<link rel="stylesheet" href="../phase-1/tokens.css" />   <!-- color tokens ONLY -->
<link rel="stylesheet" href="<this-phase>.css" />
```
**Do NOT import any of shell.css / inbox.css / ticket.css / kanban.css / kb.css into customer surfaces.** Customer phases are deliberately self-contained design languages. Customer phases also do NOT import each other (phase-7 and phase-8 are independent).

The customer pre-paint script reads system theme only; the agent pre-paint script reads `localStorage.meghadesk.prefs.v1` for theme + density.

## Locked design discipline

These rules are not preferences — they're product positioning decisions. **Every surface enforces them:**

- **Accent teal `#0D8B7C`** is used like punctuation, never decoratively. Single bright spot per surface, max.
- **`--sla-breach` (`#F5A524`)** is reserved exclusively for SLA-breach indicators. No decorative use anywhere. Greppable check: every `sla-breach` reference should be on a real breach chip or breach color.
- **`sparkles` Lucide icon** appears only on AI surfaces on the agent side (Phases 3, 5, 6 inventory cell, 9 suggestion). Customer-facing phases (7, 8) have **zero sparkles**, even though Phase 8 has an AI bot. The customer-facing AI signal is text only ("Megha may use AI · learn more").
- **Geist Sans + Geist Mono** via Google Fonts CDN. No Inter / Roboto / system-ui body. Mono is for IDs, timers, ages, percentages, kbds — never for prose.
- **Tabular figures** (`font-feature-settings: var(--feat-tnum)`) on every number that aligns vertically (counts, durations, percentages, ticket #s).
- **Hairline 1px borders** on operator surfaces. **No drop shadows on operator cards** — separation comes from borders + bg-muted. Customer surfaces use soft shadows instead of borders; operator surfaces don't.
- **No emoji in UI copy.** Lucide icons only. The bot in Phase 8 says "Hi there — I'm Megha" not "Hey there 👋".
- **No purple, no Tailwind violet `#7C3AED`, no glassmorphism, no neumorphism, no 3D blob renders, no gradient backgrounds on hero blocks.** Tidio/Freshdesk-template aesthetics are explicitly anti-patterns.
- **Performative friendly copy is anti** — Help Scout's tone (calm declarative) is the reference, not "Let's get you sorted!"

## Per-page conventions

Every page (every `*.html`) must have:

1. **Pre-paint inline `<script>` in `<head>`** that resolves theme + density and sets `data-theme` / `data-density` on `<html>` BEFORE the stylesheet loads. This prevents FOUC on dark-mode reloads. Operator and customer scripts differ — copy the right one from a sibling phase.
2. **Skip link** to `#main` as the first body element.
3. **`<main id="main" tabindex="-1">`** so the skip link works.
4. **Lucide CDN** + `lucide.createIcons()` call after DOM.
5. **Reduced motion** — every animation must be wrapped in `@media (prefers-reduced-motion: reduce)` to disable cleanly.
6. Topbar + nav rail copied verbatim on operator pages (no shared partials — this is static HTML). Customer pages have their own minimal headers.

The hub at `prototype/phase-1/index.html` is the canonical entry point. Every new phase adds a `<a class="phase">` row to the hub's `<nav class="phase-list">` with:
- `data-state="live"` once the phase is shipped
- A 9px mono chip as eyebrow describing the kind of phase: `Customer-facing` (accent-tinted) for customer phases; `Operator · realtime` (bg-muted) for realtime operator phases; no chip for default operator phases.

The root `/index.html` is a meta-refresh redirect to `prototype/phase-1/index.html` — don't restructure this without updating GitHub Pages config.

## Adding a new phase

1. Create `prototype/phase-N/<surface>.html`, `<surface>.css`, optionally `<surface>.js`.
2. Decide which design direction it belongs to and import the right stylesheets (see above).
3. Copy the pre-paint script + topbar + nav rail from a same-direction sibling.
4. Add a row to the phase list in `prototype/phase-1/index.html`.
5. Verify in light + dark, toggle density on operator pages, press ⌘K.
6. Run the discipline check (greppable):
   ```bash
   grep -rn "data-lucide=\"sparkles\"" prototype/phase-N/   # only on AI elements
   grep -rn "sla-breach" prototype/phase-N/                 # only on real breach
   grep -rPn "[\x{1F300}-\x{1F9FF}]" prototype/phase-N/     # must be empty
   ```

## Git & GitHub Pages

- Single `main` branch. No PRs, no review process. Direct commits to main.
- The user is **`mi2arun`**. Don't change git config.
- **Do NOT push without explicit user confirmation.** Pushing publishes to https://mi2arun.github.io/meghadesk-prototype/. Wait for "push it" or equivalent before `git push`.
- Commit messages use the established co-authored format crediting Claude. See recent commits for the pattern.
- `.gitignore` excludes `.DS_Store`, `.claude/`, IDE folders, `node_modules/`, logs.

## What this repo is NOT

- **Not a real product.** No backend, no auth, no data persistence beyond `localStorage` prefs.
- **Not a component library** in the npm sense. Phase 6's "library" is a docs page that visualises the patterns in situ, not a publishable package.
- **Not a Storybook** — but Phase 6 plays a similar role for human reviewers.
- **Not React / Vue / anything**. Adding a build step or framework is a design-direction-shifting decision, not a refactor — discuss with the user before proposing.
