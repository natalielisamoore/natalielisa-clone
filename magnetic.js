(function () {
  'use strict';

  /* ── Selectors that get the magnetic treatment ── */
  const SELECTORS = [
    '.drop-me-button',
    '.getintouch-blck-child',
    '.workwithme-button',
    '.work-button',
    '.contact-button',
    '.link-text-wrapper[hoverstagger="link"]',
  ].join(',');

  /* ── Config ── */
  const RADIUS   = 90;   // px — detection radius around element centre
  const STRENGTH = 0.38; // 0–1, how far the element moves toward cursor
  const LERP     = 0.14; // spring smoothing per frame (lower = floatier)

  /* ── State per element ── */
  const state = new Map(); // el → { tx, ty, cx, cy }

  function initEl(el) {
    if (state.has(el)) return;
    state.set(el, { tx: 0, ty: 0, cx: 0, cy: 0 });
    // Preserve any existing transition the element might have
    const existing = getComputedStyle(el).transition;
    el.dataset.origTransition = existing === 'all 0s ease 0s' ? '' : existing;
  }

  /* ── Mouse tracking ── */
  let mouseX = -9999, mouseY = -9999;
  document.addEventListener('mousemove', e => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  }, { passive: true });

  /* ── Initialise all matching elements ── */
  function collectEls() {
    document.querySelectorAll(SELECTORS).forEach(initEl);
  }
  collectEls();
  // Pick up any late-rendered elements (Webflow sometimes hydrates later)
  setTimeout(collectEls, 800);

  /* ── Animation loop ── */
  function lerp(a, b, t) { return a + (b - a) * t; }

  function tick() {
    for (const [el, s] of state) {
      const rect = el.getBoundingClientRect();
      const cx   = rect.left + rect.width  / 2;
      const cy   = rect.top  + rect.height / 2;

      const dx = mouseX - cx;
      const dy = mouseY - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);

      let targetX, targetY;
      if (dist < RADIUS && dist > 0) {
        const pull = (1 - dist / RADIUS); // 0→1 as cursor approaches centre
        targetX = dx * STRENGTH * pull;
        targetY = dy * STRENGTH * pull;
      } else {
        targetX = 0;
        targetY = 0;
      }

      s.tx = lerp(s.tx, targetX, LERP);
      s.ty = lerp(s.ty, targetY, LERP);

      // Only write to DOM when meaningfully changed
      if (Math.abs(s.tx) > 0.05 || Math.abs(s.ty) > 0.05 || targetX === 0) {
        el.style.transform = `translate(${s.tx.toFixed(2)}px, ${s.ty.toFixed(2)}px)`;
      }
    }

    requestAnimationFrame(tick);
  }

  requestAnimationFrame(tick);
})();
