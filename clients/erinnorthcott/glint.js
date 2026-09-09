/* glint.js — a few slow, warm glints in the places memory catches the light.
   The CSS does the breathing (see GLINTS in style.css); this only places them,
   randomises each one's cycle, and moves it somewhere new each time it goes
   dark. Nothing runs under reduced motion. */
(function () {
  'use strict';
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  /* where and how many. NOT inside the chapter cards: `.dan__sec > *` makes
     every child a grid item and the deck layout breaks (2026-09-09). */
  var SPOTS = [
    ['.section--hero',        5, 'field'],
    ['.dan__pact',            5, 'field'],
    ['.cosmos__row',          5, 'field'],
    ['.arch',                 4, 'field'],
    ['.temple__hero',         4, 'field'],
    ['.section--podcast',     4, 'field']
  ];

  function rand(a, b) { return a + Math.random() * (b - a); }

  function place(el, mode) {
    var x, y;
    if (mode === 'edge') {
      var side = Math.floor(rand(0, 4)), off = rand(1.5, 7);
      if (side === 0)      { x = rand(4, 96); y = off; }
      else if (side === 1) { x = 100 - off;   y = rand(4, 96); }
      else if (side === 2) { x = rand(4, 96); y = 100 - off; }
      else                 { x = off;         y = rand(4, 96); }
    } else { x = rand(6, 94); y = rand(8, 92); }
    var line = Math.random() < .3;
    el.className = 'glint' + (line ? ' glint--line' : '');
    el.style.setProperty('--g-x', x.toFixed(1) + '%');
    el.style.setProperty('--g-y', y.toFixed(1) + '%');
    el.style.setProperty('--g-size', rand(2, 4).toFixed(1) + 'px');
    el.style.setProperty('--g-len', rand(10, 22).toFixed(0) + 'px');
    el.style.setProperty('--g-rot', rand(-35, 35).toFixed(0) + 'deg');
    el.style.setProperty('--g-dx', rand(-6, 6).toFixed(1) + 'px');
    el.style.setProperty('--g-dy', rand(-4, 4).toFixed(1) + 'px');
    el.style.setProperty('--g-dur', rand(7, 14).toFixed(1) + 's');
  }

  var hosts = [];
  SPOTS.forEach(function (spot) {
    document.querySelectorAll(spot[0]).forEach(function (host) {
      host.classList.add('has-glints');
      if (getComputedStyle(host).position === 'static') host.classList.add('has-glints--anchor');
      hosts.push(host);
      for (var i = 0; i < spot[1]; i++) {
        var g = document.createElement('i');
        g.setAttribute('aria-hidden', 'true');
        place(g, spot[2]);
        g.style.setProperty('--g-delay', rand(0, 12).toFixed(1) + 's');
        g.addEventListener('animationiteration', function () { place(this, spot[2]); });
        host.appendChild(g);
      }
    });
  });

  /* rest while off screen */
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { e.target.classList.toggle('is-resting', !e.isIntersecting); });
    }, { rootMargin: '20% 0px' });
    hosts.forEach(function (h) { io.observe(h); });
  }
})();
