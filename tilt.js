(function () {
  'use strict';

  const TILT_MAX    = 14;
  const SCALE_HOVER = 1.05;
  const EASE_IN     = 'transform 0.1s ease-out';
  const EASE_OUT    = 'transform 0.55s cubic-bezier(0.23, 1, 0.32, 1)';

  function initTilt() {
    const grid = document.querySelector('.w-layout-grid.grid-9');
    if (!grid) return;

    // Perspective on the grid parent so all cards share the same vanishing point
    grid.style.perspective      = '1200px';
    grid.style.perspectiveOrigin = '50% 50%';

    const cards = grid.querySelectorAll(':scope > a');
    if (!cards.length) return;

    cards.forEach(function (card) {
      card.style.willChange       = 'transform';
      card.style.transformStyle   = 'preserve-3d';
      card.style.transition       = EASE_OUT;
      // Do NOT set overflow:hidden here — it flattens 3D transforms in most browsers.
      // The shine overlay clips itself via border-radius instead.

      // Shine overlay — uses border-radius to clip naturally
      const shine = document.createElement('div');
      shine.className = 'tilt-shine';
      shine.style.cssText = [
        'position:absolute',
        'inset:0',
        'pointer-events:none',
        'z-index:10',
        'border-radius:inherit',
        'background:radial-gradient(circle at 50% 50%, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0) 65%)',
        'opacity:0',
        'transition:opacity 0.25s ease',
      ].join(';');
      // Card needs position:relative for the shine to be contained
      card.style.position = 'relative';
      card.appendChild(shine);

      card.addEventListener('mouseenter', function () {
        this.style.transition = EASE_IN;
        this.querySelector('.tilt-shine').style.opacity = '1';
      });

      card.addEventListener('mousemove', function (e) {
        const rect = this.getBoundingClientRect();
        const cx   = rect.left + rect.width  / 2;
        const cy   = rect.top  + rect.height / 2;
        const dx   = (e.clientX - cx) / (rect.width  / 2);
        const dy   = (e.clientY - cy) / (rect.height / 2);

        const rotY =  dx * TILT_MAX;
        const rotX = -dy * TILT_MAX;

        this.style.transform =
          'rotateX(' + rotX + 'deg) rotateY(' + rotY + 'deg) scale3d(' +
          SCALE_HOVER + ',' + SCALE_HOVER + ',1)';

        const sx = 50 + dx * 35;
        const sy = 50 + dy * 35;
        this.querySelector('.tilt-shine').style.background =
          'radial-gradient(circle at ' + sx + '% ' + sy + '%, rgba(255,255,255,0.22) 0%, rgba(255,255,255,0) 60%)';
      });

      card.addEventListener('mouseleave', function () {
        this.style.transition = EASE_OUT;
        this.style.transform  = 'rotateX(0deg) rotateY(0deg) scale3d(1,1,1)';
        this.querySelector('.tilt-shine').style.opacity = '0';
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initTilt);
  } else {
    initTilt();
  }

})();
