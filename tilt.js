(function () {
  'use strict';

  const TILT_MAX        = 14;    // max tilt in degrees
  const SCALE_HOVER     = 1.04;  // subtle scale-up on hover
  const EASE_IN         = 'transform 0.12s ease-out';
  const EASE_OUT        = 'transform 0.5s cubic-bezier(0.23, 1, 0.32, 1)';

  function initTilt() {
    const cards = document.querySelectorAll('.w-layout-grid.grid-9 > a');

    cards.forEach(function (card) {
      // Needed for child shine layer
      card.style.position = 'relative';
      card.style.overflow = 'hidden';
      card.style.willChange = 'transform';
      card.style.transition = EASE_OUT;

      // Shine overlay
      const shine = document.createElement('div');
      shine.className = 'tilt-shine';
      shine.style.cssText = [
        'position:absolute',
        'inset:0',
        'pointer-events:none',
        'z-index:2',
        'border-radius:inherit',
        'background:radial-gradient(circle at 50% 50%, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0) 65%)',
        'opacity:0',
        'transition:opacity 0.3s ease',
      ].join(';');
      card.appendChild(shine);

      card.addEventListener('mouseenter', function () {
        this.style.transition = EASE_IN;
        this.querySelector('.tilt-shine').style.opacity = '1';
      });

      card.addEventListener('mousemove', function (e) {
        const rect = this.getBoundingClientRect();
        const cx   = rect.left + rect.width  / 2;
        const cy   = rect.top  + rect.height / 2;
        const dx   = (e.clientX - cx) / (rect.width  / 2);  // -1 → 1
        const dy   = (e.clientY - cy) / (rect.height / 2);  // -1 → 1

        const rotY =  dx * TILT_MAX;
        const rotX = -dy * TILT_MAX;

        this.style.transform =
          'perspective(900px) rotateX(' + rotX + 'deg) rotateY(' + rotY + 'deg) scale3d(' +
          SCALE_HOVER + ',' + SCALE_HOVER + ',1)';

        // Move shine to follow cursor
        var sx = 50 + dx * 35;
        var sy = 50 + dy * 35;
        this.querySelector('.tilt-shine').style.background =
          'radial-gradient(circle at ' + sx + '% ' + sy + '%, rgba(255,255,255,0.22) 0%, rgba(255,255,255,0) 60%)';
      });

      card.addEventListener('mouseleave', function () {
        this.style.transition = EASE_OUT;
        this.style.transform  = 'perspective(900px) rotateX(0deg) rotateY(0deg) scale3d(1,1,1)';
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
