(function () {
  'use strict';

  function init() {
    var height1 = document.querySelector('.featured-work-new .sectionheight1');
    var sticky  = document.querySelector('.featured-work-new .sticky-element1');
    var camera  = document.querySelector('.featured-work-new .camera');
    var track   = document.querySelector('.featured-work-new .track1');

    if (!track || !camera) return;

    // ── Override Webflow's scroll-pin layout ──────────────────────────────
    if (height1) { height1.style.height = 'auto'; height1.style.minHeight = '0'; }
    if (sticky)  { sticky.style.position = 'relative'; sticky.style.top = 'auto'; }

    // ── Camera: clipping viewport ─────────────────────────────────────────
    camera.style.overflow   = 'hidden';
    camera.style.userSelect = 'none';
    camera.style.cursor     = 'grab';

    // ── Track: horizontal flex row ────────────────────────────────────────
    track.style.display       = 'flex';
    track.style.flexDirection = 'row';
    track.style.alignItems    = 'flex-start';
    track.style.flexWrap      = 'nowrap';
    track.style.willChange    = 'transform';

    // ── Drag state ────────────────────────────────────────────────────────
    var pos        = 0;   // current translateX offset (positive = scrolled left)
    var dragging   = false;
    var startX     = 0;
    var startPos   = 0;
    var velX       = 0;   // velocity for momentum
    var lastX      = 0;
    var lastT      = 0;
    var raf        = null;
    var dragDist   = 0;   // total pixel movement for click vs drag detection

    function maxScroll() {
      return Math.max(0, track.scrollWidth - camera.offsetWidth);
    }

    function clamp(v, lo, hi) {
      return Math.max(lo, Math.min(hi, v));
    }

    function applyPos(p) {
      track.style.transition = 'none';
      track.style.transform  = 'translateX(-' + p + 'px)';
    }

    // Momentum coast after drag release
    function coast() {
      velX *= 0.92;   // friction
      pos   = clamp(pos + velX, 0, maxScroll());
      applyPos(pos);
      if (Math.abs(velX) > 0.5) {
        raf = requestAnimationFrame(coast);
      } else {
        raf = null;
      }
    }

    // ── Mouse events ──────────────────────────────────────────────────────
    camera.addEventListener('mousedown', function (e) {
      if (raf) { cancelAnimationFrame(raf); raf = null; }
      dragging = true;
      startX   = e.clientX;
      startPos = pos;
      dragDist = 0;
      velX     = 0;
      lastX    = e.clientX;
      lastT    = Date.now();
      camera.style.cursor = 'grabbing';
      e.preventDefault();
    });

    window.addEventListener('mousemove', function (e) {
      if (!dragging) return;
      var dx  = startX - e.clientX;   // positive = dragging left = scroll right content
      pos = clamp(startPos + dx, 0, maxScroll());
      applyPos(pos);

      // Track total pixel movement for drag detection
      dragDist += Math.abs(e.clientX - lastX);

      // Track velocity
      var now = Date.now();
      var dt  = now - lastT || 1;
      velX    = (e.clientX - lastX) / dt * -14;  // scale to px/frame at 60fps
      lastX   = e.clientX;
      lastT   = now;
    });

    window.addEventListener('mouseup', function () {
      if (!dragging) return;
      dragging = false;
      camera.style.cursor = 'grab';
      // Release with momentum
      if (Math.abs(velX) > 1) {
        raf = requestAnimationFrame(coast);
      }
    });

    // ── Touch support ─────────────────────────────────────────────────────
    camera.addEventListener('touchstart', function (e) {
      if (raf) { cancelAnimationFrame(raf); raf = null; }
      var t = e.touches[0];
      dragging = true;
      startX   = t.clientX;
      startPos = pos;
      velX     = 0;
      lastX    = t.clientX;
      lastT    = Date.now();
    }, { passive: true });

    camera.addEventListener('touchmove', function (e) {
      if (!dragging) return;
      var t   = e.touches[0];
      var dx  = startX - t.clientX;
      pos = clamp(startPos + dx, 0, maxScroll());
      applyPos(pos);
      var now = Date.now();
      var dt  = now - lastT || 1;
      velX    = (t.clientX - lastX) / dt * -14;
      lastX   = t.clientX;
      lastT   = now;
    }, { passive: true });

    camera.addEventListener('touchend', function () {
      dragging = false;
      if (Math.abs(velX) > 1) {
        raf = requestAnimationFrame(coast);
      }
    });

    // Prevent child links from firing on drag — require 12px+ total movement
    camera.addEventListener('click', function (e) {
      if (dragDist > 12) e.preventDefault();
    }, true);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
