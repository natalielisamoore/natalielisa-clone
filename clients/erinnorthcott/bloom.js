/* bloom.js — Reel 02 gathers out of the ether: the rose arrives as diffuse,
   colourless light and resolves into a flower as it comes up the screen.
   One scroll-driven custom property:
     --bloom  1 → 0  across the rose's arrival
   CSS does the rest; at rest it sits at 0 and nothing is drawn. */
(function () {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const rose = document.querySelector('.becoming__film');
  // measure the untransformed figure — .becoming__film is itself being scaled
  const anchor = document.querySelector('.becoming__media') || rose;
  if (!rose) return;

  const root = document.documentElement;
  const clamp01 = (n) => (n < 0 ? 0 : n > 1 ? 1 : n);
  let ticking = false;

  function update() {
    const vh = window.innerHeight;
    const r = anchor.getBoundingClientRect();
    // cubic ease-out so it settles into focus instead of snapping the last bit
    const t = clamp01((vh * 0.55 - r.top) / (vh * 0.72));
    root.style.setProperty('--bloom', String(Math.pow(1 - t, 2.6)));
    ticking = false;
  }

  function onScroll() {
    if (!ticking) { ticking = true; requestAnimationFrame(update); }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });
  update();
})();
