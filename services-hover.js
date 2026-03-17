(function () {
  'use strict';

  /* ── Inject styles ── */
  const style = document.createElement('style');
  style.textContent = `
    /* Fix Webflow-frozen inline states */
    .content-section .boarder-line-btm   { width: 100% !important; }
    .content-section .parent.flex-cc-h   { opacity: 1 !important; transform: none !important; }

    /* Color fill: height 0 by default, fills upward on hover */
    .content-section .list-parent > .card-whipe.lavender-bg,
    .content-section .list-parent > .card-whipe.webdesign-chartruese,
    .content-section .list-parent > .card-whipe.branding-coral {
      height: 0 !important;
      transition: height 0.52s cubic-bezier(0.77, 0, 0.175, 1);
    }
    .content-section .list-parent.sh-hovered > .card-whipe.lavender-bg,
    .content-section .list-parent.sh-hovered > .card-whipe.webdesign-chartruese,
    .content-section .list-parent.sh-hovered > .card-whipe.branding-coral {
      height: 100% !important;
    }

    /* Image panel: JS controls transform; CSS handles opacity + entry transition */
    .content-section .list-image-parent {
      opacity: 0;
      will-change: transform, opacity;
      transition: opacity 0.4s ease 0.08s;
    }
    .content-section .list-parent.sh-hovered .list-image-parent {
      opacity: 1;
    }

    /* LEARN MORE tag */
    .content-section .tag.bg-white {
      opacity: 0 !important;
      transition: opacity 0.25s ease 0.15s;
    }
    .content-section .list-parent.sh-hovered .tag.bg-white {
      opacity: 1 !important;
    }
  `;
  document.head.appendChild(style);

  /* ── Arc config ── */
  const X_RANGE  = 28;   // px left/right travel
  const Y_ARC    = 14;   // px upward lift at the centre of the arc
  const LERP_SPD = 0.10; // smoothing (lower = floatier)

  /* ── Per-row state ── */
  const rows = [];

  document.querySelectorAll('.content-section .list-parent').forEach(row => {
    if (row.classList.contains('paintings')) return;

    const img = row.querySelector('.list-image-parent');
    if (!img) return;

    // Clear Webflow's frozen inline opacity so CSS hover rule can take over
    img.style.opacity = '';
    // Seed the image with an entry transform (JS-controlled)
    img.style.transform = 'translateY(14px) scale(1.07)';

    const state = { tx: 0, ty: 14, cx: 0, cy: 14, hovered: false };
    rows.push({ row, img, state });

    row.addEventListener('mouseenter', () => {
      row.classList.add('sh-hovered');
      state.hovered = true;
    });

    row.addEventListener('mouseleave', () => {
      row.classList.remove('sh-hovered');
      state.hovered = false;
      // Spring back to resting
      state.tx = 0;
      state.ty = 0;
    });

    row.addEventListener('mousemove', e => {
      if (!state.hovered) return;
      const rect     = row.getBoundingClientRect();
      const progress = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));

      // X: linear left→right across ±X_RANGE
      state.tx = (progress - 0.5) * 2 * X_RANGE;

      // Y: rainbow arc — parabola peaking at centre (progress=0.5)
      // At edges: 0, at centre: -Y_ARC (upward)
      const arc = 1 - Math.pow((progress - 0.5) * 2, 2);
      state.ty  = -arc * Y_ARC;
    });
  });

  /* ── Animation loop ── */
  function lerp(a, b, t) { return a + (b - a) * t; }

  function tick() {
    for (const { img, state } of rows) {
      state.cx = lerp(state.cx, state.tx, LERP_SPD);
      state.cy = lerp(state.cy, state.ty, LERP_SPD);
      img.style.transform = `translate(${state.cx.toFixed(2)}px, ${state.cy.toFixed(2)}px) scale(1)`;
    }
    requestAnimationFrame(tick);
  }

  requestAnimationFrame(tick);
})();
