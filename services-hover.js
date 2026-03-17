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

    /* Image panel: JS drives opacity + transform directly via inline style */
    .content-section .list-image-parent {
      will-change: transform, opacity;
      transition: opacity 0.4s ease;
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
  const Y_ARC    = 14;   // px upward lift at centre
  const LERP_SPD = 0.10;

  /* ── Per-row state ── */
  const rows = [];

  document.querySelectorAll('.content-section .list-parent').forEach(row => {
    if (row.classList.contains('paintings')) return;

    const img = row.querySelector('.list-image-parent');
    if (!img) return;

    // JS owns opacity + transform — clear Webflow's frozen inline values first
    img.style.cssText = 'opacity: 0; transform: translateY(14px) scale(1.07); transition: opacity 0.4s ease;';

    const state = { tx: 0, ty: 14, cx: 0, cy: 14, hovered: false };
    rows.push({ row, img, state });

    row.addEventListener('mouseenter', () => {
      row.classList.add('sh-hovered');
      state.hovered = true;
      img.style.opacity = '1';
    });

    row.addEventListener('mouseleave', () => {
      row.classList.remove('sh-hovered');
      state.hovered = false;
      img.style.opacity = '0';
      state.tx = 0;
      state.ty = 0;
    });

    row.addEventListener('mousemove', e => {
      if (!state.hovered) return;
      const rect     = row.getBoundingClientRect();
      const progress = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));

      state.tx = (progress - 0.5) * 2 * X_RANGE;

      // Rainbow arc: parabola, highest at centre
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
