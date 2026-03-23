(function () {
  'use strict';

  const SYMBOLS = ['♡', '✿', '✦', '✧', '❀', '⋆', '·'];
  const COLORS  = ['#f3c8fe', '#ffd6e7', '#deff38', '#ffffff', '#e8c8fe', '#ffb3de', '#FFD700'];

  const SELECTORS = [
    '.blurb',
    '.services-slider',
    '.content-section',
    '.playground-section',
    '.content-scroll-section',
    '.testimonials',
    '.scrolling-services',
    '.work-together',
    '.shopart3',
    '.section-5',
    'section:not(.hero):not(.footer)',
  ];

  function rand(min, max) { return min + Math.random() * (max - min); }
  function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

  function spawnBloom(rect) {
    const count = Math.floor(rand(4, 7));
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    // Clamp rect.top to visible viewport range
    const topY  = Math.max(0, Math.min(rect.top, vh - 40));
    const botY  = Math.max(topY + 40, Math.min(rect.bottom, vh));

    for (let i = 0; i < count; i++) {
      const el = document.createElement('span');

      // Alternate left / right margin strips
      const onLeft = i % 2 === 0;
      const x = onLeft
        ? rand(8, Math.min(80, vw * 0.12))
        : rand(Math.max(vw - 80, vw * 0.88), vw - 8);
      const y = rand(topY, botY);

      const size   = rand(14, 26);
      const delay  = i * 90; // ms stagger

      Object.assign(el.style, {
        position:      'fixed',
        left:          x + 'px',
        top:           y + 'px',
        fontSize:      size + 'px',
        color:         pick(COLORS),
        opacity:       '0',
        transform:     'scale(0) rotate(0deg)',
        pointerEvents: 'none',
        userSelect:    'none',
        zIndex:        '9997',
        transition:    `opacity 0.55s ease ${delay}ms, transform 0.65s cubic-bezier(0.34,1.56,0.64,1) ${delay}ms`,
      });
      el.textContent = pick(SYMBOLS);
      document.body.appendChild(el);

      // Bloom in (double-rAF to ensure paint before transition)
      requestAnimationFrame(function () {
        requestAnimationFrame(function () {
          el.style.opacity   = rand(0.38, 0.62).toFixed(2);
          el.style.transform = 'scale(1) rotate(' + rand(-25, 25).toFixed(1) + 'deg)';
        });
      });

      // Drift upward then fade out
      var holdMs  = rand(1200, 2000);
      var totalDelay = delay + holdMs;

      setTimeout(function (glyph, startX, startY) {
        return function () {
          glyph.style.transition = 'opacity 1s ease, transform 1.4s ease';
          glyph.style.opacity    = '0';
          glyph.style.left       = (startX + rand(-20, 20)) + 'px';
          glyph.style.top        = (startY - rand(18, 45)) + 'px';
          glyph.style.transform  = 'scale(0.5) rotate(' + rand(-40, 40).toFixed(1) + 'deg)';
          setTimeout(function () { glyph.remove(); }, 1400);
        };
      }(el, x, y), totalDelay);
    }
  }

  function init() {
    if (!('IntersectionObserver' in window)) return;

    var seen = new WeakSet();
    var elements = [];

    SELECTORS.forEach(function (sel) {
      try {
        document.querySelectorAll(sel).forEach(function (el) {
          if (!seen.has(el)) {
            seen.add(el);
            elements.push(el);
          }
        });
      } catch (e) { /* ignore bad selectors */ }
    });

    if (!elements.length) return;

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting && !entry.target.dataset.bloomed) {
          entry.target.dataset.bloomed = '1';
          spawnBloom(entry.boundingClientRect);
        }
      });
    }, { threshold: 0.12 });

    elements.forEach(function (el) { observer.observe(el); });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
