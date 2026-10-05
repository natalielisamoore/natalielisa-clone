/* ripples.js (2026-10-05). "Like a raindrop ripples the pond":
   a click drops a stone where you touch the indigo card, and every few
   seconds a drop lands on its own so the water is already moving when you
   arrive. Three rings per drop, removed from the DOM once they have faded. */
(function () {
  const card = document.querySelector('.temple__band--meets .temple__meets');
  if (!card) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  function drop(x, y, rain) {
    const d = document.createElement('span');
    d.className = 'drip' + (rain ? ' drip--rain' : '');
    d.setAttribute('aria-hidden', 'true');
    d.style.left = x + 'px';
    d.style.top = y + 'px';
    d.innerHTML = '<i></i><i></i><i></i>';
    card.appendChild(d);
    /* the last ring to finish takes the whole drop with it */
    const rings = d.querySelectorAll('i');
    let done = 0;
    rings.forEach((r) => r.addEventListener('animationend', () => {
      if (++done === rings.length) d.remove();
    }));
    /* a belt and braces sweep, in case a ring never reports back */
    setTimeout(() => d.remove(), 6000);
  }

  card.addEventListener('pointerdown', (e) => {
    const r = card.getBoundingClientRect();
    drop(e.clientX - r.left, e.clientY - r.top, false);
  });

  /* the rain: only while the card is on screen, and only while the tab is
     being looked at */
  let timer = 0;
  let greeted = false;              /* the first drop is the invitation */
  function rainOnce() {
    const r = card.getBoundingClientRect();
    /* keep drops off the very edge so a ring always reads as a circle */
    drop(r.width * (.12 + Math.random() * .76), r.height * (.14 + Math.random() * .72), true);
    schedule();
  }
  function schedule() {
    clearTimeout(timer);
    /* the first one lands about a second after the card arrives, so the
       surface is seen to answer before anyone touches it; after that the
       rain settles into its own slow rhythm */
    const wait = greeted ? 3800 + Math.random() * 3600 : 1100;
    greeted = true;
    timer = setTimeout(rainOnce, wait);
  }
  function stop() { clearTimeout(timer); timer = 0; }

  const io = new IntersectionObserver((es) => {
    es.forEach((en) => (en.isIntersecting && !document.hidden ? schedule() : stop()));
  }, { threshold: 0.25 });
  io.observe(card);
  document.addEventListener('visibilitychange', () => (document.hidden ? stop() : schedule()));
})();
