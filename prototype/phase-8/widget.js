/* ============================================================================
   meghaDesk · Phase 8 · Widget behavior
   - Open/close toggle (persisted in localStorage)
   - Esc closes
   - Send button only appears when input has text
   - Textarea auto-grows
   - User-typed message echoes into the thread (visual only, no real send)
   ============================================================================ */

(() => {
  const KEY = "meghadesk.cx.widget.open";
  const widget = document.querySelector("[data-widget]");
  if (!widget) return;

  const bubble = widget.querySelector("[data-widget-bubble]");
  const closeBtn = widget.querySelector("[data-widget-close]");
  const minBtn = widget.querySelector("[data-widget-minimize]");
  const composer = widget.querySelector("[data-composer]");
  const input = widget.querySelector("[data-composer-input]");
  const sendBtn = widget.querySelector("[data-composer-send]");
  const thread = widget.querySelector("[data-thread]");

  // --------- Open / closed ----------
  function setOpen(open, { focus } = {}) {
    widget.setAttribute("data-open", open ? "true" : "false");
    try {
      localStorage.setItem(KEY, open ? "true" : "false");
    } catch (_) {}
    if (open && focus && input) {
      requestAnimationFrame(() => input.focus());
    }
  }

  // Initial state — default OPEN for the demo (override only if user closed
  // it explicitly in a previous session)
  let initial = true;
  try {
    const stored = localStorage.getItem(KEY);
    if (stored === "false") initial = false;
  } catch (_) {}
  setOpen(initial); // no focus on first load

  if (bubble) {
    bubble.addEventListener("click", () => setOpen(true, { focus: true }));
  }

  if (closeBtn) {
    closeBtn.addEventListener("click", () => setOpen(false));
  }

  if (minBtn) {
    minBtn.addEventListener("click", () => setOpen(false));
  }

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && widget.getAttribute("data-open") === "true") {
      // Only close if focus is inside the widget OR no input is focused elsewhere
      const inWidget = widget.contains(document.activeElement);
      if (inWidget) setOpen(false);
    }
  });

  // --------- Composer ----------
  function updateSendVisibility() {
    if (!input || !composer) return;
    const hasText = input.value.trim().length > 0;
    composer.setAttribute("data-has-text", hasText ? "true" : "false");
  }

  function autosize() {
    if (!input) return;
    input.style.height = "auto";
    const next = Math.min(input.scrollHeight, 88);
    input.style.height = next + "px";
  }

  if (input) {
    input.addEventListener("input", () => {
      updateSendVisibility();
      autosize();
    });

    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
      }
    });
  }

  function sendMessage() {
    if (!input || !thread) return;
    const text = input.value.trim();
    if (!text) return;

    const turn = document.createElement("div");
    turn.className = "turn turn--user";
    turn.innerHTML = `
      <span class="turn__meta">
        <span class="turn__time">just now</span>
      </span>
      <div class="bubble bubble--user"></div>
    `;
    turn.querySelector(".bubble").textContent = text;
    thread.appendChild(turn);

    input.value = "";
    autosize();
    updateSendVisibility();
    thread.scrollTop = thread.scrollHeight;
    input.focus();
  }

  if (sendBtn) {
    sendBtn.addEventListener("click", sendMessage);
  }

  // --------- Quick-reply pills (visual echo into composer) ----------
  document.querySelectorAll("[data-quick-reply]").forEach((pill) => {
    pill.addEventListener("click", () => {
      if (!input) return;
      input.value = pill.textContent.trim();
      input.focus();
      updateSendVisibility();
      autosize();
    });
  });

  // Scroll thread to bottom on load (so the latest turn is visible)
  if (thread) {
    requestAnimationFrame(() => {
      thread.scrollTop = thread.scrollHeight;
    });
  }
})();
