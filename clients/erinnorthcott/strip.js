/* strip.js — the photographs on the Daniel page, one slow filmstrip.
   The current frame nearly fills the screen; its neighbours wait as thin
   slivers at either edge. Every few seconds the strip eases one frame to the
   left, and it loops without a seam. A swipe or a click on a sliver moves it
   by hand, and the clock waits a while afterwards. Under reduced motion
   nothing moves on its own; the frames still answer a click or a swipe. */
(function () {
  const strip = document.querySelector('.strip');
  const stage = strip && strip.querySelector('.strip__stage');
  if (!stage) return;
  const frames = Array.from(stage.querySelectorAll('.strip__frame'));
  const bar = stage.querySelector('.strip__progress i');
  const N = frames.length;
  if (N < 2) return;

  const HOLD = 3800;         /* ms a photograph stays before the strip moves */
  const REST = 12000;        /* ms the clock waits after a hand has moved it */
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');

  let cur = 0;
  let rel = frames.map((_, i) => i);   /* where each frame sits: 0 centre, -1 left, +1 right ... */
  let timer = 0;
  let paused = false;

  /* frames are laid out relative to the current one, wrapped, so the strip
     has no ends: -4 .. +4 for nine, the far ones waiting offscreen */
  function place(animate) {
    frames.forEach((el, i) => {
      let r = i - cur;
      if (r > N / 2) r -= N;
      if (r < -N / 2) r += N;
      const jumped = Math.abs(r - rel[i]) > 1;   /* wrapped from one end to the other */
      if (jumped || !animate) el.classList.add('is-still');
      el.style.setProperty('--r', r);
      el.dataset.phase = r === 0 ? 'cur' : r === -1 ? 'prev' : r === 1 ? 'next' : 'far';
      if (jumped || !animate) { void el.offsetWidth; el.classList.remove('is-still'); }
      rel[i] = r;
    });
    if (bar) bar.style.transform = `scaleX(${((cur + 1) / N).toFixed(4)})`;
  }

  function go(step, byHand) {
    cur = (cur + step + N) % N;
    place(!reduce.matches);
    if (byHand) rest();
  }

  function tick() {
    if (paused || reduce.matches) return;
    go(1, false);
    timer = setTimeout(tick, HOLD);
  }
  function rest() {
    clearTimeout(timer);
    timer = setTimeout(tick, REST);
  }

  /* only run while the strip is on screen */
  const io = new IntersectionObserver((es) => {
    es.forEach((en) => {
      paused = !en.isIntersecting;
      clearTimeout(timer);
      if (!paused) timer = setTimeout(tick, HOLD);
    });
  }, { threshold: 0.35 });
  io.observe(strip);

  /* a click on a sliver */
  frames.forEach((el) => {
    el.addEventListener('click', () => {
      if (dragged) return;
      if (el.dataset.phase === 'next') go(1, true);
      else if (el.dataset.phase === 'prev') go(-1, true);
    });
  });

  /* a swipe */
  let x0 = null, dragged = false;
  stage.addEventListener('pointerdown', (e) => { x0 = e.clientX; dragged = false; }, { passive: true });
  stage.addEventListener('pointermove', (e) => {
    if (x0 === null) return;
    if (Math.abs(e.clientX - x0) > 12) dragged = true;
  }, { passive: true });
  stage.addEventListener('pointerup', (e) => {
    if (x0 === null) return;
    const dx = e.clientX - x0;
    x0 = null;
    if (Math.abs(dx) > 40) { go(dx < 0 ? 1 : -1, true); }
    setTimeout(() => { dragged = false; }, 0);
  }, { passive: true });
  stage.addEventListener('pointercancel', () => { x0 = null; }, { passive: true });

  /* keys, when the stage has focus */
  stage.setAttribute('tabindex', '0');
  stage.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') { go(1, true); e.preventDefault(); }
    if (e.key === 'ArrowLeft') { go(-1, true); e.preventDefault(); }
  });

  place(false);
})();
