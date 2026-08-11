/* reveal.js — fade-up on scroll. */
(function () {

  /* ---- fade-up on scroll ------------------------------------------------ */
  const revealables = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    const watch = (margin) => new IntersectionObserver((entries, obs) => {
      for (const e of entries) {
        if (e.isIntersecting) { e.target.classList.add('in'); obs.unobserve(e.target); }
      }
    }, { threshold: 0.18, rootMargin: margin });

    // The page holds its reveals back until they're properly on screen. The
    // footer can't: that -8% inset excludes the last strip of the document, so
    // the base bar would sit at the very bottom and never intersect.
    const page = watch('0px 0px -8% 0px');
    const foot = watch('0px');
    revealables.forEach((el) => (el.closest('.footer') ? foot : page).observe(el));
  } else {
    revealables.forEach((el) => el.classList.add('in'));
  }

  /* ---- videos load and play only once they're nearly on screen ---------- */
  const clips = document.querySelectorAll('video[data-src]');
  if (clips.length) {
    const start = (v) => {
      if (v.dataset.started) return;
      v.dataset.started = '1';
      v.src = v.dataset.src;
      v.load();
      const go = () => v.play().catch(() => {});
      if (v.readyState >= 2) go(); else v.addEventListener('canplay', go, { once: true });
    };
    if ('IntersectionObserver' in window) {
      const vio = new IntersectionObserver((entries) => {
        for (const e of entries) {
          if (e.isIntersecting) { start(e.target); vio.unobserve(e.target); }
        }
      }, { rootMargin: '300px 0px' });   /* a beat of warning before it's needed */
      clips.forEach((v) => vio.observe(v));
    } else {
      clips.forEach(start);
    }
  }

})();
