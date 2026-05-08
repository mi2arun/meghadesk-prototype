/* ============================================================================
   meghaDesk · Tracker · Phase 10
   - Sidebar tree expand/collapse (spaces, folders)
   - Sidebar section collapse (Favorites, Spaces)
   - Status group collapse
   - Subtask reveal toggle
   - View tab switching (visual)
   - Task checkbox toggle (visual)
   ========================================================================== */

(() => {
  // ---- Sidebar: tree row expand/collapse (space + folder) -----------------
  document.querySelectorAll("[data-tree-toggle]").forEach((btn) => {
    const targetId = btn.dataset.treeToggle;
    const target = document.getElementById(targetId);
    if (!target) return;
    btn.addEventListener("click", () => {
      const expanded = btn.getAttribute("aria-expanded") === "true";
      const next = !expanded;
      btn.setAttribute("aria-expanded", String(next));
      if (next) {
        target.removeAttribute("hidden");
      } else {
        target.setAttribute("hidden", "");
      }
      // Swap the caret icon between chevron-down and chevron-right
      const caret = btn.querySelector(".tk-tree-row__caret");
      if (caret) {
        caret.setAttribute("data-lucide", next ? "chevron-down" : "chevron-right");
        if (window.lucide) window.lucide.createIcons({ nameAttr: "data-lucide" });
      }
      // Folder icon swap (folder vs folder-open) when row is a folder
      const folderIcon = btn.querySelector(".tk-tree-row__icon");
      if (folderIcon && folderIcon.getAttribute("data-lucide")?.startsWith("folder")) {
        folderIcon.setAttribute(
          "data-lucide",
          next ? "folder-open" : "folder"
        );
        if (window.lucide) window.lucide.createIcons({ nameAttr: "data-lucide" });
      }
    });
  });

  // ---- Sidebar: section collapse (Favorites / Spaces) --------------------
  document.querySelectorAll("[data-collapse]").forEach((btn) => {
    const targetId = btn.getAttribute("aria-controls");
    const target = targetId && document.getElementById(targetId);
    if (!target) return;
    btn.addEventListener("click", () => {
      const expanded = btn.getAttribute("aria-expanded") === "true";
      const next = !expanded;
      btn.setAttribute("aria-expanded", String(next));
      target.style.display = next ? "" : "none";
    });
  });

  // ---- Status-group collapse ---------------------------------------------
  document.querySelectorAll("[data-group-toggle]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const group = btn.closest(".tk-group");
      if (!group) return;
      const isOpen = group.getAttribute("data-group-state") === "open";
      const next = isOpen ? "closed" : "open";
      group.setAttribute("data-group-state", next);
      btn.setAttribute("aria-expanded", String(!isOpen));
      const caret = btn.querySelector(".tk-group__caret");
      if (caret) {
        caret.setAttribute(
          "data-lucide",
          next === "open" ? "chevron-down" : "chevron-right"
        );
        if (window.lucide) window.lucide.createIcons({ nameAttr: "data-lucide" });
      }
    });
  });

  // ---- Subtask reveal ----------------------------------------------------
  document.querySelectorAll("[data-subtask-toggle]").forEach((btn) => {
    const targetId = btn.dataset.subtaskToggle;
    const target = document.getElementById(targetId);
    if (!target) return;
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const expanded = btn.getAttribute("aria-expanded") === "true";
      const next = !expanded;
      btn.setAttribute("aria-expanded", String(next));
      target.style.display = next ? "" : "none";
      const caretIcon = btn.querySelector("i");
      if (caretIcon) {
        caretIcon.setAttribute(
          "data-lucide",
          next ? "chevron-down" : "chevron-right"
        );
        if (window.lucide) window.lucide.createIcons({ nameAttr: "data-lucide" });
      }
    });
  });

  // ---- View tab switching (visual only — only List has content) ---------
  const viewTabs = document.querySelectorAll("[data-view-tab]");
  viewTabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      viewTabs.forEach((t) => t.setAttribute("aria-selected", "false"));
      tab.setAttribute("aria-selected", "true");
      // Future: render board / calendar bodies. v1 leaves the list visible.
    });
  });

  // ---- Task checkbox toggle (visual) -------------------------------------
  document.querySelectorAll("[data-check]").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const pressed = btn.getAttribute("aria-pressed") === "true";
      const next = !pressed;
      btn.setAttribute("aria-pressed", String(next));
      const ring = btn.querySelector(".tk-check__ring");
      const task = btn.closest(".tk-task");
      if (ring && task) {
        if (next) {
          ring.classList.remove(
            "tk-check__ring--inprogress",
            "tk-check__ring--review"
          );
          ring.classList.add("tk-check__ring--complete");
          ring.innerHTML =
            '<svg width="9" height="9" viewBox="0 0 9 9" aria-hidden="true">' +
            '<path d="M2 4.6L3.7 6.4L7 2.8" fill="none" stroke="currentColor" ' +
            'stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>';
          task.classList.add("tk-task--done");
        } else {
          ring.classList.remove("tk-check__ring--complete");
          ring.innerHTML = "";
          task.classList.remove("tk-task--done");
        }
      }
    });
  });

  // ---- Row click → reserved for future detail panel ----------------------
  document.querySelectorAll(".tk-task").forEach((row) => {
    row.addEventListener("click", (e) => {
      // Bail out if click came from a control inside the row
      if (e.target.closest("button, a")) return;
      // Visual selection for now
      document
        .querySelectorAll(".tk-task[data-selected]")
        .forEach((r) => r.removeAttribute("data-selected"));
      row.setAttribute("data-selected", "true");
    });
  });
})();
