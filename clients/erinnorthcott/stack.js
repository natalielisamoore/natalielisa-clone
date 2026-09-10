/* stack.js — the chapters of the Daniel page as a pinned deck. The stage
   holds still while you scroll; each chapter card rises from the foot of the
   screen and settles over the one you were reading, which sinks back a step
   so the pile has depth. Scroll up and the top card slides back down. One
   viewport of scroll per card. The driver writes --e (entering, 0..1) and
   --x (covered, 0..1) on each card; style.css does the moving.
   Lifted from proto/proto.js (the STACK prototype she chose, 2026-09-09).
   On narrow screens, and under reduced motion, the cards simply stack down
   the page. */
(function () {
  const deck = document.querySelector('.deck');
  const stage = deck && deck.querySelector('.deck__stage');
  if (!stage) return;
  const cards = Array.from(stage.querySelectorAll('.dan__sec'));
  const N = cards.length;
  if (N < 2) return;

  const SEG = 1;                          /* viewports of scroll per card */
  const CLOSE = 0.7;                      /* viewports for the deck to sink and dim after the last card (2026-09-10) */
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  const wide = window.matchMedia('(min-width: 821px) and (min-height: 700px)');   /* short windows read as a column */
  const clamp = (n, lo, hi) => (n < lo ? lo : n > hi ? hi : n);
  const ease = (n) => { const t = clamp(n, 0, 1); return t * t * (3 - 2 * t); };

  cards.forEach((el, i) => el.style.setProperty('--i', i));

  let queued = false, live = false;
  function measure() {
    queued = false;
    const vh = window.innerHeight;
    const y = -deck.getBoundingClientRect().top;
    const s = clamp(y / (vh * SEG), 0, N - 1);
    /* --c: 0 while the cards are still arriving, 1 once the deck has closed */
    stage.style.setProperty('--c', ease((y / vh - (N - 1) * SEG) / CLOSE).toFixed(4));
    cards.forEach((el, i) => {
      const t = clamp(s - i, -1, 1);
      el.style.setProperty('--e', ease(1 + Math.min(t, 0)).toFixed(4));
      el.style.setProperty('--x', ease(Math.max(t, 0)).toFixed(4));
      el.dataset.phase = t <= -1 ? 'far' : t < -0.0005 ? 'in' : t <= 0.0005 ? 'cur' : t < 1 ? 'out' : 'past';
    });
  }
  function onScroll() { if (queued) return; queued = true; requestAnimationFrame(measure); }

  function start() {
    deck.classList.remove('is-static');
    cards.forEach((el) => { el.style.minHeight = ''; });
    deck.style.height = `calc(${(N - 1) * SEG + 1 + CLOSE} * 100vh)`;
    measure();
    if (!live) { addEventListener('scroll', onScroll, { passive: true }); live = true; }
  }
  function rest() {
    deck.classList.add('is-static');
    deck.style.height = 'auto';
    stage.style.setProperty('--c', 0);
    cards.forEach((el) => { el.style.setProperty('--e', 1); el.style.setProperty('--x', 0); el.dataset.phase = 'cur'; });
    if (live) { removeEventListener('scroll', onScroll); live = false; }
    /* in the column, too, every card stands as tall as the tallest */
    cards.forEach((el) => { el.style.minHeight = ''; });
    const chapters = cards.filter((el) => !el.classList.contains('dan__sec--end'));   /* the end card keeps its own height */
    const tallest = Math.max(...chapters.map((el) => el.getBoundingClientRect().height));
    if (wide.matches || window.innerWidth > 820) chapters.forEach((el) => { el.style.minHeight = Math.ceil(tallest) + 'px'; });
  }
  function decide() { (reduce.matches || !wide.matches) ? rest() : start(); }
  decide();
  addEventListener('resize', () => { decide(); onScroll(); }, { passive: true });
  reduce.addEventListener('change', decide);
  wide.addEventListener('change', decide);
})();
