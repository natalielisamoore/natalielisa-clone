/* sky.js — the sky is now a fixed sunset photograph set in CSS (.sky).
   This script no longer paints a gradient; it only tracks how deep the reader
   has scrolled so the stars can fade in over the night section (--night), and
   exposes scroll progress for anything else that wants it. */
(function () {
  let ticking = false;

  function update() {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const p = max > 0 ? Math.min(Math.max(window.scrollY / max, 0), 1) : 0;
    // 0 until 60% scrolled, ramping to 1 at the bottom → stars fade in for night
    document.documentElement.style.setProperty('--night', String(Math.max(0, (p - 0.6) / 0.4)));
    window.__skyProgress = p;
    ticking = false;
  }

  function onScroll() {
    if (!ticking) { ticking = true; requestAnimationFrame(update); }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });
  update();
})();
