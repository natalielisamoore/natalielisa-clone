/* praise.js — the Client Praise row. The track is a native horizontal
   scroller with snap points, so a thumb or a trackpad already moves it; the
   two arrows step it one card at a time. The middle card starts in the
   middle.

   2026-10-02, at her ask: it is also DRAGGABLE with a mouse. Touch is left
   alone on purpose — a finger already gets the browser's own momentum and
   snap, which is better than anything re-implemented here, so the drag only
   arms for mouse and pen.

   How the throw works. While dragging, snap has to be OFF (setting scrollLeft
   under `scroll-snap-type: x mandatory` just yanks straight back to a snap
   point), so `.is-free` lifts it. On release the pointer's recent velocity is
   projected forward into a distance, the card nearest that landing point wins,
   and ONE smooth scroll carries it there: the momentum is in the choice of
   card, not in a frame loop that would then have to fight the snap. Snap is
   restored only once the scroll has settled, so the two never argue.

   A flick gets its own rule on top of that, and it is not decoration. These
   cards are ~820px wide, so "nearest landing point" alone needs the hand to
   cover more than 410px before the row changes card at all, and a short,
   fast flick — which is what people actually do to a slider — would spring
   straight back to where it started and read as broken. So any release above
   FLICK px/ms moves at least one card in the direction it was thrown. */
(function () {
  const track = document.querySelector('.praise__track');
  if (!track) return;
  const cards = Array.from(track.children);
  if (!cards.length) return;

  const step = () => {
    if (cards.length < 2) return cards[0].offsetWidth;
    return cards[1].offsetLeft - cards[0].offsetLeft;   /* card + gap */
  };
  /* where scrollLeft has to sit for card i to be centred in the viewport */
  const centreOf = (i) => cards[i].offsetLeft - (track.clientWidth - cards[i].offsetWidth) / 2;
  const nearest = (x) => {
    let best = 0, bestD = Infinity;
    for (let i = 0; i < cards.length; i++) {
      const d = Math.abs(centreOf(i) - x);
      if (d < bestD) { bestD = d; best = i; }
    }
    return best;
  };

  /* open in the middle of the row, a card cut off at each edge of the screen */
  const mid = Math.floor(cards.length / 2);
  const centre = () => { track.scrollLeft = centreOf(mid); };
  centre();
  addEventListener('resize', centre, { passive: true });

  document.querySelectorAll('.praise__btn').forEach((b) => {
    b.addEventListener('click', () => {
      track.scrollBy({ left: step() * Number(b.dataset.dir), behavior: 'smooth' });
    });
  });

  /* ── drag ──────────────────────────────────────────────────────────────── */
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const MOVED = 5;             /* px before this counts as a drag, not a click */
  const THROW = 110;           /* ms of coasting the release velocity buys */
  const MAX_THROW = 1.6;       /* ...capped at this many cards */
  const FLICK = 0.45;          /* px per ms: above this, always change card */

  let down = false, startX = 0, startScroll = 0, startIdx = 0, moved = 0;
  let lastX = 0, lastT = 0, vel = 0, pid = null, settleTimer = 0;

  /* snap goes back on only when the scrolling has actually stopped, whoever
     stopped it — our smooth scroll, a wheel, or the user grabbing again. */
  const onSettle = () => {
    clearTimeout(settleTimer);
    settleTimer = setTimeout(() => {
      if (!down) track.classList.remove('is-free');
    }, 140);
  };

  track.addEventListener('pointerdown', (e) => {
    if (e.pointerType === 'touch') return;        /* leave the finger to the browser */
    if (e.button !== 0) return;
    down = true;
    moved = 0;
    vel = 0;
    startX = lastX = e.clientX;
    startScroll = track.scrollLeft;
    startIdx = nearest(startScroll);
    lastT = e.timeStamp;
    pid = e.pointerId;
    clearTimeout(settleTimer);
    track.classList.add('is-free', 'is-grab');
    try { track.setPointerCapture(pid); } catch (err) { /* nothing to recover */ }
  });

  track.addEventListener('pointermove', (e) => {
    if (!down || e.pointerId !== pid) return;
    const dx = e.clientX - lastX;
    const dt = e.timeStamp - lastT;
    if (dt > 0) vel = vel * 0.7 + (dx / dt) * 0.3;   /* px per ms, smoothed */
    lastX = e.clientX;
    lastT = e.timeStamp;
    moved = Math.max(moved, Math.abs(e.clientX - startX));
    track.scrollLeft = startScroll - (e.clientX - startX);
    if (moved > MOVED) e.preventDefault();
  });

  const release = (e) => {
    if (!down || (e && e.pointerId !== pid)) return;
    down = false;
    track.classList.remove('is-grab');
    try { track.releasePointerCapture(pid); } catch (err) { /* already gone */ }

    if (moved <= MOVED) { track.classList.remove('is-free'); return; }

    /* the pointer went idle before letting go: no throw, just snap where it is */
    if (e && e.timeStamp - lastT > 90) vel = 0;

    const reach = Math.max(-MAX_THROW, Math.min(MAX_THROW, (-vel * THROW) / step())) * step();
    let i = nearest(track.scrollLeft + reach);

    /* thrown hard: guarantee a card change, and never one that undoes the
       direction of the throw. A drag that already carried further than the
       flick would have keeps its own, larger, result. */
    if (Math.abs(vel) >= FLICK) {
      const dir = vel < 0 ? 1 : -1;                 /* hand left = next card */
      const least = startIdx + dir;
      i = dir > 0 ? Math.max(i, least) : Math.min(i, least);
    }
    i = Math.max(0, Math.min(cards.length - 1, i));

    track.scrollTo({ left: centreOf(i), behavior: reduced.matches ? 'auto' : 'smooth' });
    onSettle();
  };

  track.addEventListener('pointerup', release);
  track.addEventListener('pointercancel', release);
  track.addEventListener('lostpointercapture', release);
  track.addEventListener('scroll', onSettle, { passive: true });

  /* a drag that ends on a card must not read as a click on it */
  track.addEventListener('click', (e) => {
    if (moved > MOVED) { e.preventDefault(); e.stopPropagation(); }
  }, true);
  /* and the browser's own text/image drag has to stay out of the way */
  track.addEventListener('dragstart', (e) => e.preventDefault());
})();
