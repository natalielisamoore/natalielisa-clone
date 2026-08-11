/* bloom.js — Reel 02 arrives still blown out and resolves as it comes up the
   screen. One scroll-driven custom property:
     --bloom  1 → 0  across the rose's arrival
   CSS does the rest; at rest it sits at 0 and nothing is drawn. */
(function () {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const rose = document.querySelector('.becoming__film');
  if (!rose) return;

  const root = document.documentElement;
  const clamp01 = (n) => (n < 0 ? 0 : n > 1 ? 1 : n);
  let ticking = false;

  function update() {
    const vh = window.innerHeight;
    const r = rose.getBoundingClientRect();
    root.style.setProperty('--bloom', String(1 - clamp01((vh * 0.50 - r.top) / (vh * 0.55))));
    ticking = false;
  }

  function onScroll() {
    if (!ticking) { ticking = true; requestAnimationFrame(update); }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });
  update();
})();
