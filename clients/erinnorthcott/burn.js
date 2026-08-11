/* burn.js — the hinge of the site.
   Reel 01 is grief, Reel 02 is the practice that came out of it, and the cut
   between them is the whole story. So the film doesn't scroll away: it stalls
   in the gate, catches, burns through to the lamp, and the rose opens out of
   that same white. Two custom properties, both driven by scroll position:
     --burn   0 → 1  across the frame's exit
     --bloom  1 → 0  across the rose's arrival
   CSS does the rest; at rest both sit at 0 and nothing is drawn. */
(function () {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const frame = document.querySelector('.filmframe__img');
  const rose  = document.querySelector('.becoming__film');
  if (!frame || !rose) return;

  const root = document.documentElement;
  const clamp01 = (n) => (n < 0 ? 0 : n > 1 ? 1 : n);
  let ticking = false;

  function update() {
    const vh = window.innerHeight;

    // Measured against the frame's own height, not the viewport, so the moment
    // lands the same way on a laptop and on a phone: nothing while you're
    // reading the reel, then it catches as the frame climbs out of the top and
    // is fully gone to white with a last sliver still showing.
    const f = frame.getBoundingClientRect();
    root.style.setProperty('--burn', String(clamp01((f.height * 0.95 - f.bottom) / (f.height * 0.75))));

    // the rose is still that same white when it arrives, and takes half a
    // screen to resolve out of it
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
