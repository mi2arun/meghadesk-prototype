/* ============================================================================
   meghaDesk · Phase 2 · Inbox interactions
   - Composer channel tab switching
   - Lightweight ticket-row keyboard nav (ArrowUp / ArrowDown)
   - Filter-item activation (Pane A)
   ============================================================================ */

(() => {
  // ---- Composer channel tabs ---------------------------------------------
  const composer = document.querySelector("[data-composer]");
  const placeholders = {
    email: "Reply to Lara…",
    whatsapp: "Type a WhatsApp message…",
    note: "Write an internal note · only your team will see this",
    ai: "AI is drafting a reply… you can edit before sending",
  };

  function setChannel(channel) {
    if (!composer) return;
    composer.setAttribute("data-channel", channel);
    document.querySelectorAll("[data-composer-tab]").forEach((tab) => {
      const isSelected = tab.dataset.composerTab === channel;
      tab.setAttribute("aria-selected", isSelected ? "true" : "false");
      tab.setAttribute("tabindex", isSelected ? "0" : "-1");
    });
    const body = composer.querySelector("[data-composer-body]");
    if (body) {
      body.setAttribute(
        "data-placeholder",
        placeholders[channel] || "Reply…"
      );
    }
  }

  document.querySelectorAll("[data-composer-tab]").forEach((tab) => {
    tab.addEventListener("click", () => setChannel(tab.dataset.composerTab));
    tab.addEventListener("keydown", (e) => {
      const tabs = Array.from(document.querySelectorAll("[data-composer-tab]"));
      const i = tabs.indexOf(tab);
      if (e.key === "ArrowRight") {
        e.preventDefault();
        const next = tabs[(i + 1) % tabs.length];
        setChannel(next.dataset.composerTab);
        next.focus();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        const prev = tabs[(i - 1 + tabs.length) % tabs.length];
        setChannel(prev.dataset.composerTab);
        prev.focus();
      }
    });
  });

  // ---- Pane A · filter-item activation -----------------------------------
  document.querySelectorAll("[data-filter-item]").forEach((item) => {
    item.addEventListener("click", () => {
      document
        .querySelectorAll("[data-filter-item][aria-current='true']")
        .forEach((el) => el.setAttribute("aria-current", "false"));
      item.setAttribute("aria-current", "true");
    });
  });

  // ---- Pane B · ticket selection (visual only) ---------------------------
  document.querySelectorAll("[data-tkt-row]").forEach((row) => {
    row.addEventListener("click", (e) => {
      // Don't steal click on the checkbox
      if (e.target.closest("[data-tkt-select]")) return;
      document
        .querySelectorAll("[data-tkt-row][data-selected='true']")
        .forEach((r) => r.setAttribute("data-selected", "false"));
      row.setAttribute("data-selected", "true");
    });
  });

  // ---- Ticket-row keyboard nav (j/k or ArrowUp/Down within list) ---------
  const list = document.querySelector("[data-tkt-list]");
  if (list) {
    list.addEventListener("keydown", (e) => {
      const rows = Array.from(list.querySelectorAll("[data-tkt-row]"));
      const active = document.activeElement.closest("[data-tkt-row]");
      const i = rows.indexOf(active);
      if (e.key === "ArrowDown" || e.key === "j") {
        e.preventDefault();
        const next = rows[Math.min(i + 1, rows.length - 1)];
        if (next) next.focus();
      } else if (e.key === "ArrowUp" || e.key === "k") {
        e.preventDefault();
        const prev = rows[Math.max(i - 1, 0)];
        if (prev) prev.focus();
      }
    });
  }
})();
