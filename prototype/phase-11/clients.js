/* ============================================================================
   meghaDesk · Clients · Phase 11
   - Tier filter tabs (visual only)
   - Group caret expand/collapse
   - Row checkbox toggle (visual)
   - Row selection
   ========================================================================== */

(() => {
  // ---- Tier filter tabs --------------------------------------------------
  const tierTabs = document.querySelectorAll("[data-tier-filter]");
  tierTabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      tierTabs.forEach((t) => t.setAttribute("aria-pressed", "false"));
      tab.setAttribute("aria-pressed", "true");
      const tier = tab.dataset.tierFilter;
      document.querySelectorAll(".cd-group").forEach((g) => {
        if (tier === "all") {
          g.style.display = "";
        } else {
          g.style.display = g.dataset.tier === tier ? "" : "none";
        }
      });
    });
  });

  // ---- Group caret ------------------------------------------------------
  document.querySelectorAll("[data-group-toggle]").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const group = btn.closest(".cd-group");
      if (!group) return;
      const open = group.dataset.open === "true";
      const next = !open;
      group.dataset.open = String(next);
      btn.setAttribute("aria-expanded", String(next));
      const caret = btn.querySelector("i");
      if (caret) {
        caret.setAttribute(
          "data-lucide",
          next ? "chevron-down" : "chevron-right"
        );
        if (window.lucide) window.lucide.createIcons({ nameAttr: "data-lucide" });
      }
    });
  });

  // ---- Row checkbox toggle (visual) -------------------------------------
  document.querySelectorAll(".cd-checkbox").forEach((cb) => {
    cb.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      const pressed = cb.getAttribute("aria-pressed") === "true";
      cb.setAttribute("aria-pressed", String(!pressed));
      if (!pressed) {
        cb.innerHTML =
          '<svg width="10" height="10" viewBox="0 0 10 10" aria-hidden="true">' +
          '<path d="M2 5L4 7L8 3" fill="none" stroke="currentColor" ' +
          'stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';
      } else {
        cb.innerHTML = "";
      }
    });
  });

  // ---- Row selection (highlight selected row) ---------------------------
  document.querySelectorAll(".cd-row").forEach((row) => {
    row.addEventListener("click", (e) => {
      // Let nested controls handle their own clicks
      if (e.target.closest("button.cd-checkbox, button.cd-row__actions")) {
        e.preventDefault();
        return;
      }
      // Allow link navigation for now — selection is just visual feedback
      document
        .querySelectorAll(".cd-row[data-selected]")
        .forEach((r) => r.removeAttribute("data-selected"));
      row.setAttribute("data-selected", "true");
    });
  });

  // ---- Row actions menu (placeholder) -----------------------------------
  document.querySelectorAll(".cd-row__actions").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      // Future: open contextual menu (Pin, Mute, Archive, etc.)
    });
  });
})();
