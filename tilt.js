(function () {
  'use strict';

  const TILT_MAX    = 7;
  const SCALE_HOVER = 1.04;
  const EASE_IN     = 'transform 0.1s ease-out';
  const EASE_OUT    = 'transform 0.55s cubic-bezier(0.23, 1, 0.32, 1)';

  function initTilt() {
    const grid = document.querySelector('.w-layout-grid.grid-9');
    if (!grid) return;

    grid.style.perspective       = '1200px';
    grid.style.perspectiveOrigin = '50% 50%';

    const cards = grid.querySelectorAll(':scope > a');
    if (!cards.length) return;

    cards.forEach(function (card) {
      card.style.position       = 'relative';
      card.style.willChange     = 'transform';
      card.style.transformStyle = 'preserve-3d';
      card.style.transition     = EASE_OUT;

      const shine = document.createElement('div');
      shine.className = 'tilt-shine';
      shine.style.cssText = [
        'position:absolute', 'inset:0', 'pointer-events:none', 'z-index:10',
        'border-radius:inherit',
        'background:radial-gradient(circle at 50% 50%, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0) 65%)',
        'opacity:0', 'transition:opacity 0.25s ease',
      ].join(';');
      card.appendChild(shine);

      card.addEventListener('mouseenter', function () {
        this.style.transition = EASE_IN;
        shine.style.opacity   = '1';
      });

      card.addEventListener('mousemove', function (e) {
        const rect = this.getBoundingClientRect();
        const dx   = (e.clientX - (rect.left + rect.width  / 2)) / (rect.width  / 2);
        const dy   = (e.clientY - (rect.top  + rect.height / 2)) / (rect.height / 2);
        this.style.transform =
          'rotateX(' + (-dy * TILT_MAX) + 'deg) rotateY(' + (dx * TILT_MAX) + 'deg) scale3d(' + SCALE_HOVER + ',' + SCALE_HOVER + ',1)';
        shine.style.background =
          'radial-gradient(circle at ' + (50 + dx * 35) + '% ' + (50 + dy * 35) + '%, rgba(255,255,255,0.22) 0%, rgba(255,255,255,0) 60%)';
      });

      card.addEventListener('mouseleave', function () {
        this.style.transition = EASE_OUT;
        this.style.transform  = 'rotateX(0deg) rotateY(0deg) scale3d(1,1,1)';
        shine.style.opacity   = '0';
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initTilt);
  } else {
    initTilt();
  }

})();
