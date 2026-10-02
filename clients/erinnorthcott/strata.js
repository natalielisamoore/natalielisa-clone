/* strata.js — Inner Ceremonies only (2026-10-02).

   The scroll half of the layered nebula. The four layers already drift on
   their own CSS keyframes; this adds the parallax, so they also slide past
   each other as the band moves through the viewport and the stack reads as
   depth rather than as one picture.

   It writes a single number — `--p`, how far the band's centre sits from the
   centre of the viewport, scaled right down — onto the wrapper. Each layer
   multiplies that by its own factor in CSS, nearest moving most. One custom
   property per frame, no per-layer writes.

   The parallax lands on the `translate` property while the drift keyframes
   animate `transform`. They are separate CSS properties that compose, so
   neither has to know about the other and the keyframes are never restarted.

   Off under prefers-reduced-motion, which the stylesheet also honours. */
(function () {
  var wrap = document.querySelector('.strata');
  if (!wrap) return;

  var band = wrap.parentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  var DEPTH = 0.06;        // band travel -> parallax travel
  var raf = 0;
  var last = null;
  var on = false;

  function update() {
    raf = 0;
    var r = band.getBoundingClientRect();
    /* off screen by more than a viewport: nothing to do */
    if (r.bottom < -window.innerHeight || r.top > window.innerHeight * 2) return;

    var d = (r.top + r.height / 2) - window.innerHeight / 2;
    var p = (d * DEPTH).toFixed(1);
    if (p === last) return;              // the common case while idling
    last = p;
    wrap.style.setProperty('--p', p + 'px');
  }

  function request() {
    if (!raf) raf = requestAnimationFrame(update);
  }

  function start() {
    if (on || reduce.matches) return;
    on = true;
    window.addEventListener('scroll', request, { passive: true });
    window.addEventListener('resize', request, { passive: true });
    update();
  }

  function stop() {
    if (!on) return;
    on = false;
    window.removeEventListener('scroll', request);
    window.removeEventListener('resize', request);
    wrap.style.removeProperty('--p');
    last = null;
  }

  function onPreference() { if (reduce.matches) stop(); else start(); }
  if (reduce.addEventListener) reduce.addEventListener('change', onPreference);
  else if (reduce.addListener) reduce.addListener(onPreference);

  start();
})();
