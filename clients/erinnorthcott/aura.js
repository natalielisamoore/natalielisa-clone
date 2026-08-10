/* aura.js — a soft warm glow that trails the cursor, so the space feels alive.
   Pointer devices only; stays hidden on touch. */
(function () {
  const aura = document.querySelector('.aura');
  if (!aura) return;
  if (!window.matchMedia('(pointer: fine)').matches) return;

  let tx = window.innerWidth / 2, ty = window.innerHeight / 2;   // target
  let x = tx, y = ty;                                            // eased
  let shown = false;

  window.addEventListener('pointermove', (e) => {
    tx = e.clientX; ty = e.clientY;
    if (!shown) { shown = true; aura.style.opacity = '1'; }
  }, { passive: true });
  window.addEventListener('pointerleave', () => { shown = false; aura.style.opacity = '0'; }, { passive: true });

  function tick() {
    x += (tx - x) * 0.12;                 // gentle lag
    y += (ty - y) * 0.12;
    aura.style.transform = `translate(${x}px, ${y}px)`;
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
})();
