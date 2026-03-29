(function () {
  'use strict';

  const COLORS = ['#f3c8fe', '#deff38', '#ffd6e7', '#ffffff', '#e8c8fe', '#ffb3de'];
  const CHARS  = ['✦', '✧', '·', '✦', '✧', '✦'];

  /* ── Overlay ── */
  const overlay = document.createElement('div');
  overlay.id = 'page-transition-overlay';
  overlay.style.cssText = [
    'position:fixed',
    'inset:0',
    'background:radial-gradient(ellipse at center,#f3c8fe 0%,#fff9fe 55%,#ffffff 100%)',
    'z-index:99998',
    'pointer-events:none',
    'opacity:1',
    'transition:opacity 0.55s cubic-bezier(0.4,0,0.2,1)',
  ].join(';');
  document.documentElement.appendChild(overlay);

  /* ── Sparkle burst at (cx, cy) ── */
  function burst(cx, cy, count) {
    for (let i = 0; i < count; i++) {
      const el    = document.createElement('span');
      const char  = CHARS[i % CHARS.length];
      const color = COLORS[i % COLORS.length];
      const angle = (i / count) * Math.PI * 2 + Math.random() * 0.4;
      const dist  = 50 + Math.random() * 130;
      const dx    = Math.cos(angle) * dist;
      const dy    = Math.sin(angle) * dist;
      const size  = 10 + Math.random() * 14;
      const delay = Math.random() * 80;

      el.textContent = char;
      el.style.cssText = [
        'position:fixed',
        `left:${cx}px`,
        `top:${cy}px`,
        `font-size:${size}px`,
        `color:${color}`,
        'pointer-events:none',
        'z-index:99999',
        'transform:translate(-50%,-50%)',
        `transition:transform 0.55s ease-out ${delay}ms,opacity 0.55s ease-out ${delay}ms`,
        'opacity:1',
        'will-change:transform,opacity',
      ].join(';');

      document.body.appendChild(el);

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          el.style.transform = `translate(calc(-50% + ${dx}px),calc(-50% + ${dy}px))`;
          el.style.opacity   = '0';
        });
      });

      setTimeout(() => el.remove(), 700 + delay);
    }
  }

  /* ── Entrance: fade overlay out on load, scatter sparkles ── */
  window.addEventListener('DOMContentLoaded', () => {
    const cx = window.innerWidth  / 2;
    const cy = window.innerHeight / 2;

    // Tiny delay so the first frame is painted before we start fading
    setTimeout(() => {
      burst(cx, cy, 20);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          overlay.style.opacity = '0';
        });
      });
    }, 60);
  });

  /* ── Exit: intercept internal link clicks ── */
  function isInternal(href) {
    if (!href) return false;
    if (href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) return false;
    try {
      const url = new URL(href, location.href);
      return url.hostname === location.hostname;
    } catch (_) {
      return false;
    }
  }

  let navigating = false;

  document.addEventListener('click', function (e) {
    if (navigating) return;
    const a = e.target.closest('a');
    if (!a) return;
    const href = a.getAttribute('href');
    if (!isInternal(href)) return;
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    if (a.target === '_blank') return;

    e.preventDefault();
    navigating = true;

    const dest = a.href;
    const cx   = e.clientX || window.innerWidth  / 2;
    const cy   = e.clientY || window.innerHeight / 2;

    // Burst sparkles at click point
    burst(cx, cy, 24);

    // Fade overlay in
    overlay.style.transition    = 'opacity 0.42s cubic-bezier(0.4,0,0.2,1)';
    overlay.style.pointerEvents = 'all';
    overlay.style.opacity       = '1';

    // Navigate once overlay covers the page
    setTimeout(() => { window.location.href = dest; }, 460);
  }, true);

})();
