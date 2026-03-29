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

    // ── State ─────────────────────────────────────────────────────────────
    var pos           = 0;
    var dragging      = false;
    var startX        = 0;
    var startPos      = 0;
    var velX          = 0;
    var lastX         = 0;
    var lastT         = 0;
    var raf           = null;
    var linksDisabled = false;

    var DRAG_THRESHOLD = 8;
    var STEP           = 420;

    var links = track.querySelectorAll('a');

    function disableLinks() {
      if (linksDisabled) return;
      linksDisabled = true;
      links.forEach(function (a) { a.style.pointerEvents = 'none'; });
    }

    function enableLinks() {
      linksDisabled = false;
      links.forEach(function (a) { a.style.pointerEvents = ''; });
    }

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
      updateUI();
    }

    // Momentum coast
    function coast() {
      velX *= 0.92;
      pos   = clamp(pos + velX, 0, maxScroll());
      applyPos(pos);
      if (Math.abs(velX) > 0.5) {
        raf = requestAnimationFrame(coast);
      } else {
        raf = null;
        updateUI();
      }
    }

    // ── Mouse events ──────────────────────────────────────────────────────
    camera.addEventListener('mousedown', function (e) {
      if (raf) { cancelAnimationFrame(raf); raf = null; }
      dragging = true;
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
      if (Math.abs(e.clientX - startX) > DRAG_THRESHOLD) disableLinks();
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
      if (linksDisabled) {
        // Re-enable after click event has fired against the disabled links
        setTimeout(enableLinks, 100);
      }
      if (Math.abs(velX) > 1) {
        raf = requestAnimationFrame(coast);
      } else {
        updateUI();
      }
    });

    // ── Touch support ─────────────────────────────────────────────────────
    var touchStartX = 0;
    camera.addEventListener('touchstart', function (e) {
      if (raf) { cancelAnimationFrame(raf); raf = null; }
      var t = e.touches[0];
      dragging    = true;
      didDrag     = false;
      startX      = t.clientX;
      touchStartX = t.clientX;
      startPos    = pos;
      velX        = 0;
      lastX       = t.clientX;
      lastT       = Date.now();
    }, { passive: true });

    camera.addEventListener('touchmove', function (e) {
      if (!dragging) return;
      var t = e.touches[0];
      if (Math.abs(t.clientX - touchStartX) > DRAG_THRESHOLD) didDrag = true;
      var dx = startX - t.clientX;
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
      } else {
        updateUI();
      }
    });

    // ── Controls bar (dots left, arrows right) ────────────────────────────
    var bar = document.createElement('div');
    bar.style.cssText = 'display:flex;justify-content:space-between;align-items:center;padding:20px 2em 4px 2em;';

    // Dots
    var dotsWrap = document.createElement('div');
    dotsWrap.style.cssText = 'display:flex;gap:8px;align-items:center;';

    var dotEls = [];

    function buildDots() {
      dotsWrap.innerHTML = '';
      dotEls = [];
      var total = Math.round(maxScroll() / STEP) + 1;
      total = Math.max(total, 1);
      for (var i = 0; i < total; i++) {
        var d = document.createElement('span');
        d.style.cssText = [
          'display:inline-block',
          'width:9px',
          'height:9px',
          'border-radius:50%',
          'background:#f3c8fe',
          'opacity:0.3',
          'transition:opacity 0.3s',
          'cursor:pointer',
        ].join(';');
        (function (idx) {
          d.addEventListener('click', function () { smoothTo(idx * STEP); });
        })(i);
        dotsWrap.appendChild(d);
        dotEls.push(d);
      }
    }

    function updateUI() {
      if (!dotEls.length) return;
      var idx = Math.round(pos / STEP);
      idx = clamp(idx, 0, dotEls.length - 1);
      for (var i = 0; i < dotEls.length; i++) {
        dotEls[i].style.opacity = i === idx ? '1' : '0.3';
      }
    }

    // Arrows
    var arrowsWrap = document.createElement('div');
    arrowsWrap.style.cssText = 'display:flex;gap:10px;align-items:center;';

    function makeArrow(label, dir) {
      var btn = document.createElement('button');
      btn.setAttribute('aria-label', label);
      btn.innerHTML = dir === -1
        ? '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8"><polyline points="10,3 5,8 10,13"/></svg>'
        : '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8"><polyline points="6,3 11,8 6,13"/></svg>';
      btn.style.cssText = [
        'background:none',
        'border:1.5px solid currentColor',
        'border-radius:50%',
        'width:46px',
        'height:46px',
        'cursor:pointer',
        'color:inherit',
        'display:flex',
        'align-items:center',
        'justify-content:center',
        'transition:background 0.2s, border-color 0.2s, color 0.2s',
        'flex-shrink:0',
        'padding:0',
      ].join(';');

      btn.addEventListener('mouseenter', function () {
        btn.style.background   = '#deff38';
        btn.style.borderColor  = '#deff38';
        btn.style.color        = '#000';
      });
      btn.addEventListener('mouseleave', function () {
        btn.style.background   = 'none';
        btn.style.borderColor  = 'currentColor';
        btn.style.color        = 'inherit';
      });
      btn.addEventListener('click', function () {
        smoothTo(pos + dir * STEP);
      });
      return btn;
    }

    arrowsWrap.appendChild(makeArrow('Previous', -1));
    arrowsWrap.appendChild(makeArrow('Next', 1));

    // Arrows — lifted into the heading row, inline with "Featured Work" title
    var heading = camera.querySelector('.heading-14');
    if (heading && heading.parentNode === camera) {
      var headingRow = document.createElement('div');
      headingRow.style.cssText = 'display:flex;justify-content:space-between;align-items:center;';
      camera.insertBefore(headingRow, heading);
      headingRow.appendChild(heading);
      headingRow.appendChild(arrowsWrap);
    }

    // Dots bar — stays below, spacing unchanged
    bar.appendChild(dotsWrap);
    camera.parentNode.insertBefore(bar, camera.nextSibling);

    // Build dots after layout settles
    setTimeout(function () {
      buildDots();
      updateUI();
    }, 100);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
