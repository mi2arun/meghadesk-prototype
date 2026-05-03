/* ============================================================================
   meghaDesk · Shell behavior
   - Theme controller (light/dark/system) with persistence
   - Density toggle (compact/comfortable) with persistence
   - Rail pin/unpin
   - Cmd+K dialog with focus trap
   - Popovers (workspace, avatar)
   - Status pill cycling
   ============================================================================ */

(() => {
  const STORAGE_KEY = "meghadesk.prefs.v1";
  const FOCUSABLE_SELECTOR =
    'button:not([disabled]), [href], input:not([disabled]), [tabindex]:not([tabindex="-1"])';

  // ---- Prefs persistence ----------------------------------------------------
  const defaultPrefs = {
    theme: "system",
    density: "comfortable",
    railPinned: false,
    status: "online",
  };

  function loadPrefs() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return { ...defaultPrefs };
      return { ...defaultPrefs, ...JSON.parse(raw) };
    } catch {
      return { ...defaultPrefs };
    }
  }

  function savePrefs(prefs) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
    } catch {
      /* ignore */
    }
  }

  const prefs = loadPrefs();

  // ---- Theme ----------------------------------------------------------------
  const mediaDark = window.matchMedia("(prefers-color-scheme: dark)");

  function resolveTheme(value) {
    if (value === "system") return mediaDark.matches ? "dark" : "light";
    return value;
  }

  function applyTheme() {
    const resolved = resolveTheme(prefs.theme);
    document.documentElement.setAttribute("data-theme", resolved);
    document
      .querySelectorAll("[data-theme-option]")
      .forEach((el) =>
        el.setAttribute(
          "aria-pressed",
          el.dataset.themeOption === prefs.theme ? "true" : "false"
        )
      );
    updateStateReadout();
  }

  mediaDark.addEventListener("change", () => {
    if (prefs.theme === "system") applyTheme();
  });

  function setTheme(value) {
    prefs.theme = value;
    savePrefs(prefs);
    applyTheme();
  }

  // ---- Density --------------------------------------------------------------
  function applyDensity() {
    document.documentElement.setAttribute("data-density", prefs.density);
    document
      .querySelectorAll("[data-density-option]")
      .forEach((el) =>
        el.setAttribute(
          "aria-pressed",
          el.dataset.densityOption === prefs.density ? "true" : "false"
        )
      );
    updateStateReadout();
  }

  function setDensity(value) {
    prefs.density = value;
    savePrefs(prefs);
    applyDensity();
  }

  // ---- Rail pin -------------------------------------------------------------
  function applyRail() {
    const body = document.querySelector("[data-shell-body]");
    if (body) body.setAttribute("data-rail-pinned", String(prefs.railPinned));
    document
      .querySelectorAll("[data-rail-pin]")
      .forEach((el) =>
        el.setAttribute("aria-pressed", String(prefs.railPinned))
      );
  }

  function togglePin() {
    prefs.railPinned = !prefs.railPinned;
    savePrefs(prefs);
    applyRail();
  }

  // ---- Status ---------------------------------------------------------------
  const STATUS_CYCLE = ["online", "away", "busy"];
  const STATUS_LABEL = { online: "Online", away: "Away", busy: "Busy" };

  function applyStatus() {
    const pill = document.querySelector("[data-status-pill]");
    if (!pill) return;
    pill.setAttribute("data-status", prefs.status);
    const label = pill.querySelector("[data-status-label]");
    if (label) label.textContent = STATUS_LABEL[prefs.status];
  }

  function cycleStatus() {
    const i = STATUS_CYCLE.indexOf(prefs.status);
    prefs.status = STATUS_CYCLE[(i + 1) % STATUS_CYCLE.length];
    savePrefs(prefs);
    applyStatus();
  }

  // ---- State readout -------------------------------------------------------
  function updateStateReadout() {
    const readout = document.querySelector("[data-state-readout]");
    if (!readout) return;
    const themeVal = readout.querySelector("[data-readout-theme]");
    const densityVal = readout.querySelector("[data-readout-density]");
    if (themeVal) {
      const resolved = resolveTheme(prefs.theme);
      themeVal.textContent =
        prefs.theme === "system"
          ? `system (${resolved})`
          : prefs.theme;
    }
    if (densityVal) densityVal.textContent = prefs.density;
  }

  // ---- Popovers (click-outside + esc) --------------------------------------
  const openPopovers = new Set();

  function openPopover(trigger, popover) {
    closeAllPopovers();
    popover.setAttribute("data-open", "true");
    trigger.setAttribute("aria-expanded", "true");
    openPopovers.add({ trigger, popover });
  }

  function closeAllPopovers() {
    document
      .querySelectorAll("[data-popover][data-open='true']")
      .forEach((p) => p.setAttribute("data-open", "false"));
    document
      .querySelectorAll("[data-popover-trigger][aria-expanded='true']")
      .forEach((t) => t.setAttribute("aria-expanded", "false"));
    openPopovers.clear();
  }

  document.addEventListener("click", (e) => {
    // Close popover when a non-disabled menuitem inside it is clicked
    const item = e.target.closest("[data-popover] .popover-item");
    if (item && !item.hasAttribute("disabled")) {
      closeAllPopovers();
      return;
    }
    if (
      !e.target.closest("[data-popover]") &&
      !e.target.closest("[data-popover-trigger]")
    ) {
      closeAllPopovers();
    }
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeAllPopovers();
  });

  // ---- Cmd+K dialog --------------------------------------------------------
  const cmdkOverlay = document.querySelector("[data-cmdk-overlay]");
  const cmdkInput = document.querySelector("[data-cmdk-input]");
  let lastFocused = null;
  let trapHandler = null;

  function openCmdK() {
    if (!cmdkOverlay) return;
    lastFocused = document.activeElement;
    cmdkOverlay.setAttribute("data-open", "true");
    cmdkOverlay.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    requestAnimationFrame(() => {
      if (cmdkInput) cmdkInput.focus();
    });
    trapHandler = installFocusTrap(cmdkOverlay);
  }

  function closeCmdK() {
    if (!cmdkOverlay) return;
    cmdkOverlay.setAttribute("data-open", "false");
    cmdkOverlay.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    if (cmdkInput) cmdkInput.value = "";
    if (trapHandler) {
      trapHandler();
      trapHandler = null;
    }
    if (lastFocused && typeof lastFocused.focus === "function") {
      lastFocused.focus();
    }
  }

  function installFocusTrap(container) {
    function getFocusable() {
      return Array.from(container.querySelectorAll(FOCUSABLE_SELECTOR)).filter(
        (el) => !el.hasAttribute("disabled") && el.offsetParent !== null
      );
    }

    function handle(e) {
      if (e.key === "Escape") {
        e.preventDefault();
        closeCmdK();
        return;
      }
      if (e.key !== "Tab") return;
      const focusable = getFocusable();
      if (focusable.length === 0) {
        e.preventDefault();
        return;
      }
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        last.focus();
        e.preventDefault();
      } else if (!e.shiftKey && document.activeElement === last) {
        first.focus();
        e.preventDefault();
      }
    }

    container.addEventListener("keydown", handle);
    return () => container.removeEventListener("keydown", handle);
  }

  if (cmdkOverlay) {
    cmdkOverlay.addEventListener("click", (e) => {
      if (e.target === cmdkOverlay) closeCmdK();
    });
  }

  // Global Cmd+K / Ctrl+K shortcut
  document.addEventListener("keydown", (e) => {
    const isMod = e.metaKey || e.ctrlKey;
    if (isMod && e.key.toLowerCase() === "k") {
      e.preventDefault();
      const isOpen =
        cmdkOverlay && cmdkOverlay.getAttribute("data-open") === "true";
      isOpen ? closeCmdK() : openCmdK();
    }
  });

  // ---- Wire up -------------------------------------------------------------
  function init() {
    applyTheme();
    applyDensity();
    applyRail();
    applyStatus();

    // Theme options
    document.querySelectorAll("[data-theme-option]").forEach((el) => {
      el.addEventListener("click", () => setTheme(el.dataset.themeOption));
    });

    // Density options
    document.querySelectorAll("[data-density-option]").forEach((el) => {
      el.addEventListener("click", () =>
        setDensity(el.dataset.densityOption)
      );
    });

    // Rail pin
    document.querySelectorAll("[data-rail-pin]").forEach((el) => {
      el.addEventListener("click", togglePin);
    });

    // Status pill
    document.querySelectorAll("[data-status-pill]").forEach((el) => {
      el.addEventListener("click", cycleStatus);
    });

    // Popover triggers
    document.querySelectorAll("[data-popover-trigger]").forEach((trigger) => {
      const targetId = trigger.dataset.popoverTrigger;
      const popover = document.getElementById(targetId);
      if (!popover) return;
      trigger.addEventListener("click", (e) => {
        e.stopPropagation();
        const isOpen = popover.getAttribute("data-open") === "true";
        if (isOpen) {
          closeAllPopovers();
        } else {
          openPopover(trigger, popover);
        }
      });
    });

    // Cmd+K trigger button
    document.querySelectorAll("[data-cmdk-trigger]").forEach((el) => {
      el.addEventListener("click", openCmdK);
    });

    // Update mod-key hint based on platform
    const isMac = /Mac|iPhone|iPad|iPod/.test(navigator.platform);
    document.querySelectorAll("[data-mod-key]").forEach((el) => {
      el.textContent = isMac ? "⌘" : "Ctrl";
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
