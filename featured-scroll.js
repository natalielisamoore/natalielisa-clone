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
    var pos      = 0;
    var dragging = false;
    var startX   = 0;
    var startPos = 0;
    var velX     = 0;
    var lastX    = 0;
    var lastT    = 0;
    var raf      = null;
    var didDrag  = false;  // true if mouse moved enough to count as a drag

    var DRAG_THRESHOLD = 8;   // px of movement before it's considered a drag
    var STEP           = 420; // px per arrow click

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

    function smoothTo(target) {
      if (raf) { cancelAnimationFrame(raf); raf = null; }
      target = clamp(target, 0, maxScroll());
      track.style.transition = 'transform 0.5s cubic-bezier(0.25, 1, 0.5, 1)';
      track.style.transform  = 'translateX(-' + target + 'px)';
      pos = target;
    }

    // Momentum coast after drag release
    function coast() {
      velX *= 0.92;
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
      didDrag  = false;
      startX   = e.clientX;
      startPos = pos;
      velX     = 0;
      lastX    = e.clientX;
      lastT    = Date.now();
      camera.style.cursor = 'grabbing';
      e.preventDefault();
    });

    window.addEventListener('mousemove', function (e) {
      if (!dragging) return;
      var moved = Math.abs(e.clientX - startX);
      if (moved > DRAG_THRESHOLD) didDrag = true;

      var dx = startX - e.clientX;
      pos = clamp(startPos + dx, 0, maxScroll());
      applyPos(pos);

      var now = Date.now();
      var dt  = now - lastT || 1;
      velX    = (e.clientX - lastX) / dt * -14;
      lastX   = e.clientX;
      lastT   = now;
    });

    window.addEventListener('mouseup', function () {
      if (!dragging) return;
      dragging = false;
      camera.style.cursor = 'grab';
      if (Math.abs(velX) > 1) {
        raf = requestAnimationFrame(coast);
      }
    });

    // Block link navigation if drag occurred — capture phase, before link fires
    camera.addEventListener('click', function (e) {
      if (didDrag) {
        e.preventDefault();
        e.stopPropagation();
        didDrag = false;
      }
    }, true);

    // ── Touch support ─────────────────────────────────────────────────────
    var touchStartX = 0;
    camera.addEventListener('touchstart', function (e) {
      if (raf) { cancelAnimationFrame(raf); raf = null; }
      var t = e.touches[0];
      dragging   = true;
      didDrag    = false;
      startX     = t.clientX;
      touchStartX = t.clientX;
      startPos   = pos;
      velX       = 0;
      lastX      = t.clientX;
      lastT      = Date.now();
    }, { passive: true });

    camera.addEventListener('touchmove', function (e) {
      if (!dragging) return;
      var t   = e.touches[0];
      if (Math.abs(t.clientX - touchStartX) > DRAG_THRESHOLD) didDrag = true;
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

    // ── Arrow buttons ─────────────────────────────────────────────────────
    var arrows = document.createElement('div');
    arrows.style.cssText = [
      'display:flex',
      'justify-content:center',
      'align-items:center',
      'gap:16px',
      'padding:24px 0 8px',
      'pointer-events:auto',
    ].join(';');

    function makeArrow(label, dir) {
      var btn = document.createElement('button');
      btn.setAttribute('aria-label', label);
      btn.textContent = dir === -1 ? '←' : '→';
      btn.style.cssText = [
        'background:none',
        'border:1.5px solid currentColor',
        'border-radius:50%',
        'width:44px',
        'height:44px',
        'font-size:18px',
        'line-height:1',
        'cursor:pointer',
        'color:inherit',
        'display:flex',
        'align-items:center',
        'justify-content:center',
        'transition:background 0.2s, color 0.2s',
        'flex-shrink:0',
      ].join(';');

      btn.addEventListener('mouseenter', function () {
        btn.style.background = '#deff38';
        btn.style.borderColor = '#deff38';
        btn.style.color = '#000';
      });
      btn.addEventListener('mouseleave', function () {
        btn.style.background = 'none';
        btn.style.borderColor = 'currentColor';
        btn.style.color = 'inherit';
      });
      btn.addEventListener('click', function () {
        smoothTo(pos + dir * STEP);
      });
      return btn;
    }

    arrows.appendChild(makeArrow('Scroll left', -1));
    arrows.appendChild(makeArrow('Scroll right', 1));

    // Insert arrows after the camera element
    camera.parentNode.insertBefore(arrows, camera.nextSibling);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
