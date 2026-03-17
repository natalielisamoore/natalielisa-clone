(function () {
  'use strict';

  const TILT_MAX    = 7;    // reduced 50% from 14
  const SCALE_HOVER = 1.04;
  const EASE_IN     = 'transform 0.1s ease-out';
  const EASE_OUT    = 'transform 0.55s cubic-bezier(0.23, 1, 0.32, 1)';
  const FLIP_EASE   = 'transform 0.65s cubic-bezier(0.77, 0, 0.175, 1)';
  const SQUIRREL    = '../images/66df7d06a89c23cac069cab9_Asset5.svg';

  function initTilt() {
    const grid = document.querySelector('.w-layout-grid.grid-9');
    if (!grid) return;

    grid.style.perspective       = '1200px';
    grid.style.perspectiveOrigin = '50% 50%';

    const cards = grid.querySelectorAll(':scope > a');
    if (!cards.length) return;

    cards.forEach(function (card) {
      let flipped = false;

      card.style.position      = 'relative';
      card.style.willChange    = 'transform';
      card.style.transformStyle = 'preserve-3d';
      card.style.transition    = EASE_OUT;

      // ── Shine overlay (front) ───────────────────────────────────────────
      const shine = document.createElement('div');
      shine.className = 'tilt-shine';
      shine.style.cssText = [
        'position:absolute', 'inset:0', 'pointer-events:none', 'z-index:10',
        'border-radius:inherit',
        'background:radial-gradient(circle at 50% 50%, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0) 65%)',
        'opacity:0', 'transition:opacity 0.25s ease',
        'backface-visibility:hidden', '-webkit-backface-visibility:hidden',
      ].join(';');
      card.appendChild(shine);

      // ── Back face ───────────────────────────────────────────────────────
      const back = document.createElement('div');
      back.style.cssText = [
        'position:absolute', 'inset:0',
        'border-radius:inherit',
        'background:#f3c8fe',
        'display:flex', 'align-items:center', 'justify-content:center',
        'backface-visibility:hidden', '-webkit-backface-visibility:hidden',
        'transform:rotateY(180deg)',
        'z-index:5',
      ].join(';');

      const squirrel = document.createElement('img');
      squirrel.src = SQUIRREL;
      squirrel.style.cssText = 'width:65%; height:auto; opacity:0.85;';
      back.appendChild(squirrel);
      card.appendChild(back);

      // Hide front face when flipped
      card.style.backfaceVisibility         = 'hidden';
      card.style.webkitBackfaceVisibility   = 'hidden';

      // ── Tilt: mouseenter / mousemove / mouseleave ───────────────────────
      card.addEventListener('mouseenter', function () {
        if (flipped) return;
        this.style.transition = EASE_IN;
        shine.style.opacity   = '1';
      });

      card.addEventListener('mousemove', function (e) {
        if (flipped) return;
        const rect = this.getBoundingClientRect();
        const dx   = (e.clientX - (rect.left + rect.width  / 2)) / (rect.width  / 2);
        const dy   = (e.clientY - (rect.top  + rect.height / 2)) / (rect.height / 2);
        const rotY =  dx * TILT_MAX;
        const rotX = -dy * TILT_MAX;
        this.style.transform =
          'rotateX(' + rotX + 'deg) rotateY(' + rotY + 'deg) scale3d(' + SCALE_HOVER + ',' + SCALE_HOVER + ',1)';
        const sx = 50 + dx * 35;
        const sy = 50 + dy * 35;
        shine.style.background =
          'radial-gradient(circle at ' + sx + '% ' + sy + '%, rgba(255,255,255,0.22) 0%, rgba(255,255,255,0) 60%)';
      });

      card.addEventListener('mouseleave', function () {
        if (flipped) return;
        this.style.transition = EASE_OUT;
        this.style.transform  = 'rotateX(0deg) rotateY(0deg) scale3d(1,1,1)';
        shine.style.opacity   = '0';
      });

      // ── Flip on click ───────────────────────────────────────────────────
      card.addEventListener('click', function (e) {
        e.preventDefault();   // don't navigate while flipping

        flipped = !flipped;
        this.style.transition = FLIP_EASE;

        if (flipped) {
          shine.style.opacity  = '0';
          this.style.transform = 'rotateY(180deg) scale3d(1.02,1.02,1)';
        } else {
          this.style.transform = 'rotateY(0deg) scale3d(1,1,1)';
        }
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initTilt);
  } else {
    initTilt();
  }

})();
