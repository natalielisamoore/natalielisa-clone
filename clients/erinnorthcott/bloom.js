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
    // it starts resolving the moment it enters and is sharp well before it's
    // centred — the ease-out only softens the last of it, it doesn't stall
    const t = clamp01((vh * 0.80 - r.top) / (vh * 0.45));
    root.style.setProperty('--bloom', String(Math.pow(1 - t, 3.2)));
    ticking = false;
  }

  function onScroll() {
    if (!ticking) { ticking = true; requestAnimationFrame(update); }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });
  update();
})();
