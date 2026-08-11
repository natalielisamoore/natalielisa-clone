/* cursor.js — the projector's lamp. A soft pool of light follows the pointer
   a beat behind the hand, warm gold at first light and cooling toward silver
   as the sky turns to night. It sits behind the type, never over it, so it
   lights the air rather than washing the words.
   Pointer devices only, and never under reduced motion. */
(function () {
  if (!window.matchMedia('(pointer: fine)').matches) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const lamps = [...document.querySelectorAll('.lamp')];
  if (!lamps.length) return;

  let tx = window.innerWidth / 2, ty = window.innerHeight / 2;
  let x = tx, y = ty, lit = false;

  window.addEventListener('mousemove', (e) => {
    tx = e.clientX;
    ty = e.clientY;
    if (!lit) { lit = true; lamps.forEach((l) => l.classList.add('is-lit')); }
  }, { passive: true });

  document.addEventListener('mouseleave', () => {
    lit = false;
    lamps.forEach((l) => l.classList.remove('is-lit'));
  });

  function frame() {
    x += (tx - x) * 0.13;          // trails the hand, the way a lamp lags a pan
    y += (ty - y) * 0.13;
    const t = 'translate3d(' + x + 'px,' + y + 'px,0) translate(-50%,-50%)';
    for (const l of lamps) l.style.transform = t;
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
})();
