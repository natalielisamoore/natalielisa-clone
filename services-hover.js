(function () {
  'use strict';

  /* ── Inject styles ── */
  const style = document.createElement('style');
  style.textContent = `
    /* Fix Webflow-frozen inline states */
    .content-section .boarder-line-btm        { width: 100% !important; }
    .content-section .parent.flex-cc-h        { opacity: 1 !important; transform: none !important; }

    /* Color fill: anchored to bottom, height 0 by default, fills upward on hover */
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

    /* Image panel: hidden, slightly down + zoomed; reveals on hover */
    .content-section .list-image-parent {
      opacity: 0 !important;
      transform: translateY(14px) scale(1.07) !important;
      transition: opacity 0.4s ease 0.08s, transform 0.42s ease 0.08s;
    }
    .content-section .list-parent.sh-hovered .list-image-parent {
      opacity: 1 !important;
      transform: translateY(0px) scale(1) !important;
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

  /* ── Wire hover ── */
  document.querySelectorAll('.content-section .list-parent').forEach(row => {
    if (row.classList.contains('paintings')) return; // paintings row is hidden
    row.addEventListener('mouseenter', () => row.classList.add('sh-hovered'));
    row.addEventListener('mouseleave', () => row.classList.remove('sh-hovered'));
  });
})();
