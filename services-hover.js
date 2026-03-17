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

    /* Image panel: JS drives opacity + transform directly */
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

    /* Dropdown slide-open via max-height */
    .branding-dropdown {
      display: block !important;
      max-height: 0 !important;
      overflow: hidden !important;
      margin-bottom: 0 !important;
      transition: max-height 0.55s cubic-bezier(0.77, 0, 0.175, 1),
                  margin-bottom 0.55s ease !important;
    }
    .branding-dropdown.sd-open {
      max-height: 700px !important;
      margin-bottom: 3em !important;
    }

    /* Close button is a cursor pointer */
    .close-x { cursor: pointer; }
  `;
  document.head.appendChild(style);

  /* ── Dropdown click logic ── */
  const allDropdowns = document.querySelectorAll('.content-section .branding-dropdown');

  function closeAll() {
    allDropdowns.forEach(d => d.classList.remove('sd-open'));
  }

  document.querySelectorAll('.content-section .container-m .list-parent').forEach(row => {
    if (row.classList.contains('paintings')) return;

    // The dropdown immediately follows each list-parent in the DOM
    const dropdown = row.nextElementSibling;
    if (!dropdown || !dropdown.classList.contains('branding-dropdown')) return;

    row.addEventListener('click', e => {
      e.preventDefault();
      const isOpen = dropdown.classList.contains('sd-open');
      closeAll();
      if (!isOpen) dropdown.classList.add('sd-open');
    });

    // Close-X button inside this dropdown
    const closeBtn = dropdown.querySelector('.close-x');
    if (closeBtn) {
      closeBtn.addEventListener('click', e => {
        e.stopPropagation();
        dropdown.classList.remove('sd-open');
      });
    }
  });

  /* ── Arc hover config ── */
  const X_RANGE  = 28;
  const Y_ARC    = 14;
  const LERP_SPD = 0.10;

  const rows = [];

  document.querySelectorAll('.content-section .list-parent').forEach(row => {
    if (row.classList.contains('paintings')) return;

    const img = row.querySelector('.list-image-parent');
    if (!img) return;

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
