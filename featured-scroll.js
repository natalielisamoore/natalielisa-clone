(function () {
  'use strict';

  function init() {
    var section  = document.querySelector('.featured-work-new');
    var height1  = document.querySelector('.featured-work-new .sectionheight1');
    var sticky   = document.querySelector('.featured-work-new .sticky-element1');
    var camera   = document.querySelector('.featured-work-new .camera');
    var track    = document.querySelector('.featured-work-new .track1');

    if (!section || !track || !camera) return;

    // ── Override Webflow's scroll-pin layout ──────────────────────────────
    // Original design: sectionheight1 is very tall so sticky-element1 pins
    // while scrolling. Off-domain the scroll animations don't fire, so we
    // collapse it into a normal-height horizontal strip.
    if (height1) {
      height1.style.height    = 'auto';
      height1.style.minHeight = '0';
    }
    if (sticky) {
      sticky.style.position = 'relative';
      sticky.style.top      = 'auto';
    }

    // ── Make camera a clipping viewport ──────────────────────────────────
    camera.style.overflow   = 'hidden';
    camera.style.cursor     = 'e-resize';
    camera.style.userSelect = 'none';

    // ── Make track a single horizontal row ───────────────────────────────
    track.style.display        = 'flex';
    track.style.flexDirection  = 'row';
    track.style.alignItems     = 'flex-start';
    track.style.flexWrap       = 'nowrap';
    track.style.willChange     = 'transform';
    track.style.transition     = 'none';

    // ── Scroll state ─────────────────────────────────────────────────────
    var pos       = 0;
    var hovering  = false;
    var raf       = null;
    var SPEED     = 1.4;  // px per frame (~84px/s at 60fps)
    var EASE_BACK = 0.04; // spring ease when returning to 0

    function maxScroll() {
      return Math.max(0, track.scrollWidth - camera.offsetWidth);
    }

    function tick() {
      if (hovering) {
        var max = maxScroll();
        if (max > 0 && pos < max) {
          pos += SPEED;
          if (pos > max) pos = max;
        }
      } else {
        // Gently ease back to 0 when mouse leaves
        if (pos > 0.5) {
          pos += (0 - pos) * EASE_BACK;
        } else {
          pos = 0;
        }
      }

      track.style.transform = 'translateX(-' + pos + 'px)';

      if (hovering || pos > 0.5) {
        raf = requestAnimationFrame(tick);
      } else {
        raf = null;
      }
    }

    function startTick() {
      if (!raf) raf = requestAnimationFrame(tick);
    }

    camera.addEventListener('mouseenter', function () {
      hovering = true;
      startTick();
    });

    camera.addEventListener('mouseleave', function () {
      hovering = false;
      startTick(); // keep running so it eases back
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
