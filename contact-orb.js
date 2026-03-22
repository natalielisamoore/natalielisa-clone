(function () {
  'use strict';

  var SIZE = 520; // diameter in px
  var LERP = 0.07; // lower = lazier follow

  var orb = document.createElement('div');
  Object.assign(orb.style, {
    position:      'fixed',
    top:           '0',
    left:          '0',
    width:         SIZE + 'px',
    height:        SIZE + 'px',
    borderRadius:  '50%',
    background:    'radial-gradient(circle, rgba(222,255,56,0.30) 0%, rgba(222,255,56,0.10) 38%, transparent 70%)',
    filter:        'blur(18px)',
    pointerEvents: 'none',
    zIndex:        '9996',
    willChange:    'transform',
    transform:     'translate(-9999px, -9999px)',
  });
  document.body.appendChild(orb);

  var mouseX = -9999;
  var mouseY = -9999;
  var orbX   = -9999;
  var orbY   = -9999;
  var active = false;

  document.addEventListener('mousemove', function (e) {
    mouseX = e.clientX;
    mouseY = e.clientY;
    if (!active) active = true;
  });

  function lerp(a, b, t) { return a + (b - a) * t; }

  function tick() {
    if (active) {
      orbX = lerp(orbX, mouseX, LERP);
      orbY = lerp(orbY, mouseY, LERP);
      orb.style.transform = 'translate(' + (orbX - SIZE / 2) + 'px, ' + (orbY - SIZE / 2) + 'px)';
    }
    requestAnimationFrame(tick);
  }

  requestAnimationFrame(tick);
})();
