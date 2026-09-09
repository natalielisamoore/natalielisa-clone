/* threshold.js — the arch inside Inner Ceremonies, between the welcome and
   "Standing at a crossing". A pinned stage with the arch opened in the page's
   own ground, the roses through it; the scroll opens the arch toward you
   until you are through it and on the other side. Scrubbed, so it runs back
   when you scroll up. Writes one number, --p, 0..1 across the runway. */
(function () {
  const band  = document.querySelector('.temple__band--arch');
  if (!band) return;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  const clamp = (n) => (n < 0 ? 0 : n > 1 ? 1 : n);
  const ease  = (n) => { const t = clamp(n); return t * t * (3 - 2 * t); };
  let queued = false;
  function measure() {
    queued = false;
    const r = band.getBoundingClientRect();
    const runway = r.height - window.innerHeight;
    const p = runway > 0 ? ease(-r.top / runway) : 1;
    band.style.setProperty('--p', p.toFixed(4));
  }
  function onScroll() { if (queued) return; queued = true; requestAnimationFrame(measure); }
  /* through the arch already (from another page), or no motion: stand open */
  if (reduce.matches || document.documentElement.classList.contains('arrived-by-arch')) { band.style.setProperty('--p', 1); return; }
  measure();
  addEventListener('scroll', onScroll, { passive: true });
  addEventListener('resize', onScroll, { passive: true });
})();
