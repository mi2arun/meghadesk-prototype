# meghaDesk · prototype

AI-first helpdesk SaaS — operator-density UI prototype across six surfaces. Built as static HTML/CSS/JS with no build step; openable directly in a browser.

**Live:** https://mi2arun.github.io/meghadesk-prototype/

## Surfaces

| | Surface | Path |
|---|---|---|
| 01 | App shell | [`prototype/phase-1/app-shell.html`](prototype/phase-1/app-shell.html) |
| 02 | Inbox | [`prototype/phase-2/inbox.html`](prototype/phase-2/inbox.html) |
| 03 | Ticket detail with AI sidebar | [`prototype/phase-3/ticket.html`](prototype/phase-3/ticket.html) |
| 04 | Kanban | [`prototype/phase-4/kanban.html`](prototype/phase-4/kanban.html) |
| 05 | Knowledge base | [`prototype/phase-5/kb.html`](prototype/phase-5/kb.html) |
| 06 | Component library | [`prototype/phase-6/library.html`](prototype/phase-6/library.html) |

The hub at [`prototype/phase-1/index.html`](prototype/phase-1/index.html) links to all six.

## Design direction

- **Operator density** — Linear / Plain / Pylon / Vercel-dashboard lineage. Hairline borders, restrained color, tabular figures, mono for IDs and timers.
- **Type:** Geist Sans + Geist Mono (Google Fonts CDN).
- **Accent:** deep teal `#0D8B7C` — used like punctuation, never decoration.
- **SLA-breach amber `#F5A524`** — reserved exclusively for SLA-breach indicators.
- **AI surfaces** — `sparkles` icon + accent border + `--accent-subtle` background. Nothing else.
- **Both light and dark themes** are first-class — neither feels inverted.

## Stack

- HTML / CSS / vanilla JS — no build step, no npm
- [Lucide](https://lucide.dev) icons via CDN
- [Geist](https://vercel.com/font) fonts via Google Fonts
- ~17,000 lines total across 14 files

## Running locally

```bash
git clone https://github.com/mi2arun/meghadesk-prototype.git
cd meghadesk-prototype
open index.html
# or: python3 -m http.server 8000  →  http://localhost:8000
```

The prototype reads `localStorage.meghadesk.prefs.v1` for theme + density preferences. Pre-paint inline script in each `<head>` prevents FOUC on dark-mode reloads.

## What's intentionally a stub

- All `Send` / `Resolve` / `Use draft` / `Edit` actions are visual-only.
- Search inputs don't search.
- The Cmd+K palette opens but its index isn't wired.
- Drag-and-drop on kanban cards shows the drag image (cards are `draggable="true"`) but does not persist drop targets.

## License

This is a design prototype. Code style: feel free to lift patterns. No license attached yet.
