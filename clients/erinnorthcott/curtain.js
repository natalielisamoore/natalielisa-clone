/* curtain.js — the Daniel hero holds while the story rises over it. The hero
   is sticky (CSS); this only writes --cover, 0 at the top of the page and 1
   once the story has climbed the hero's full height. The CSS dims and sinks
   the hero with it. Off under reduced motion and on small windows. */
(function () {
  'use strict';
  var pact = document.querySelector('.dan__pact');
  if (!pact) return;
  var on = window.matchMedia('(min-width: 821px) and (min-height: 700px) and (prefers-reduced-motion: no-preference)');
  var ticking = false;
  function update() {
    ticking = false;
    if (!on.matches) { pact.style.removeProperty('--cover'); pact.classList.remove('is-covered'); return; }
    var h = pact.offsetHeight || window.innerHeight;
    var p = Math.min(1, Math.max(0, window.scrollY / h));
    pact.style.setProperty('--cover', p.toFixed(3));
    pact.classList.toggle('is-covered', p >= 1);
  }
  function ask() { if (!ticking) { ticking = true; requestAnimationFrame(update); } }
  window.addEventListener('scroll', ask, { passive: true });
  window.addEventListener('resize', ask);
  if (on.addEventListener) on.addEventListener('change', ask);
  update();
})();
