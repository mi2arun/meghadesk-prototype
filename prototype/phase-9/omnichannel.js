/* ============================================================================
   meghaDesk · Phase 9 · Omnichannel desk behavior
   - Ticking durations across activity cards + detail panel (every 1s)
   - Wall clock in the LIVE indicator
   - Card selection (click + keyboard) — visual only
   - Channel filter chip toggles (single-select)
   - Tab/in-progress transcript line gets a subtle "fresh" highlight on load
   ============================================================================ */

(() => {
  // ---- Ticking durations ---------------------------------------------------
  const els = document.querySelectorAll("[data-tick]");

  function fmt(secs) {
    if (!Number.isFinite(secs) || secs < 0) return "0:00";
    if (secs >= 3600) {
      const h = Math.floor(secs / 3600);
      const m = Math.floor((secs % 3600) / 60);
      const s = secs % 60;
      return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
    }
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${String(s).padStart(2, "0")}`;
  }

  function fmtCompact(secs) {
    if (secs < 60) return `${secs}s`;
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    if (s === 0) return `${m}m`;
    return `${m}m ${String(s).padStart(2, "0")}s`;
  }

  els.forEach((el) => {
    const initial = parseInt(el.dataset.tick, 10) || 0;
    const variant = el.dataset.tickFmt || "mmss";
    el.dataset.startedAt = String(Date.now() - initial * 1000);
    const render = () => {
      const elapsed = Math.floor(
        (Date.now() - parseInt(el.dataset.startedAt, 10)) / 1000
      );
      el.textContent = variant === "compact" ? fmtCompact(elapsed) : fmt(elapsed);
    };
    render();
    setInterval(render, 1000);
  });

  // ---- Wall clock ----------------------------------------------------------
  const clock = document.querySelector("[data-wallclock]");
  if (clock) {
    const tick = () => {
      const now = new Date();
      const h = String(now.getHours()).padStart(2, "0");
      const m = String(now.getMinutes()).padStart(2, "0");
      const s = String(now.getSeconds()).padStart(2, "0");
      clock.textContent = `${h}:${m}:${s}`;
    };
    tick();
    setInterval(tick, 1000);
  }

  // ---- Card selection ------------------------------------------------------
  document.querySelectorAll("[data-act-card]").forEach((card) => {
    card.addEventListener("click", () => {
      document
        .querySelectorAll("[data-act-card][data-selected='true']")
        .forEach((c) => c.setAttribute("data-selected", "false"));
      card.setAttribute("data-selected", "true");
    });
  });

  // ---- Keyboard navigation in stream -------------------------------------
  const list = document.querySelector("[data-stream-list]");
  if (list) {
    list.addEventListener("keydown", (e) => {
      const cards = Array.from(list.querySelectorAll("[data-act-card]"));
      const active = document.activeElement.closest("[data-act-card]");
      const i = cards.indexOf(active);
      if (e.key === "ArrowDown" || e.key === "j") {
        e.preventDefault();
        const next = cards[Math.min(i + 1, cards.length - 1)];
        if (next) next.focus();
      } else if (e.key === "ArrowUp" || e.key === "k") {
        e.preventDefault();
        const prev = cards[Math.max(i - 1, 0)];
        if (prev) prev.focus();
      } else if (e.key === "Enter" && active) {
        active.click();
      }
    });
  }

  // ---- Channel filter chips (single-select) ------------------------------
  document.querySelectorAll("[data-channel-filter]").forEach((chip) => {
    chip.addEventListener("click", () => {
      document
        .querySelectorAll("[data-channel-filter]")
        .forEach((c) => c.setAttribute("aria-pressed", "false"));
      chip.setAttribute("aria-pressed", "true");
    });
  });
})();
