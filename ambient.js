(function () {
  'use strict';

  /* ── Config ── */
  const SYMBOLS = ['♡', '✿', '✦', '·', '✧', '❀', '⋆'];
  const COLORS  = ['#f3c8fe', '#ffd6e7', '#deff38', '#ffffff', '#e8c8fe', '#ffb3de', '#FFD700'];

  const COUNT       = 18;   // particles alive at once
  const SIZE_MIN    = 10;   // px
  const SIZE_MAX    = 22;   // px
  const SPEED_MIN   = 28;   // px/s vertical drift
  const SPEED_MAX   = 60;
  const SWAY_AMP    = 38;   // px horizontal sway amplitude
  const SWAY_FREQ   = 0.35; // Hz
  const OPACITY_MAX = 0.55;
  const FADE_FRAC   = 0.18; // fraction of lifespan used for fade-in/out

  /* ── Container ── */
  const container = document.createElement('div');
  Object.assign(container.style, {
    position:      'fixed',
    top:           '0',
    left:          '0',
    width:         '100%',
    height:        '100%',
    pointerEvents: 'none',
    zIndex:        '9998',
    overflow:      'hidden',
  });
  document.body.appendChild(container);

  /* ── Particle pool ── */
  const particles = [];

  function rand(min, max) { return min + Math.random() * (max - min); }

  function createParticle() {
    const el = document.createElement('span');
    el.style.cssText = 'position:fixed;user-select:none;pointer-events:none;will-change:transform,opacity;';
    container.appendChild(el);

    const p = { el, x: 0, y: 0, speed: 0, swayPhase: 0, opacity: 0, life: 0, lifeMax: 0, symbol: '', size: 0, color: '' };
    resetParticle(p, true);
    particles.push(p);
  }

  function resetParticle(p, scatter) {
    p.symbol   = SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
    p.color    = COLORS[Math.floor(Math.random() * COLORS.length)];
    p.size     = rand(SIZE_MIN, SIZE_MAX);
    p.speed    = rand(SPEED_MIN, SPEED_MAX);
    p.swayPhase = rand(0, Math.PI * 2);

    const vw = window.innerWidth;
    const vh = window.innerHeight;

    p.x = rand(0, vw);

    if (scatter) {
      // seed particles at random heights so the page doesn't start empty
      p.y = rand(-p.size, vh + p.size);
    } else {
      p.y = vh + p.size + rand(0, 40);
    }

    // lifespan = time to drift from spawn y to just above top
    const distance = p.y + p.size + rand(20, 80);
    p.lifeMax = distance / p.speed;  // seconds
    p.life    = scatter ? rand(0, p.lifeMax) : 0;

    p.el.textContent   = p.symbol;
    p.el.style.fontSize = p.size + 'px';
    p.el.style.color    = p.color;
    p.el.style.opacity  = '0';
  }

  for (let i = 0; i < COUNT; i++) createParticle();

  /* ── Animation loop ── */
  let last = null;

  function tick(ts) {
    const dt = last === null ? 0 : Math.min((ts - last) / 1000, 0.1); // seconds, capped
    last = ts;

    const vw = window.innerWidth;

    for (const p of particles) {
      p.life += dt;

      if (p.life >= p.lifeMax) {
        resetParticle(p, false);
        continue;
      }

      const t = p.life / p.lifeMax;

      // Fade in / out
      let alpha;
      if (t < FADE_FRAC) {
        alpha = (t / FADE_FRAC) * OPACITY_MAX;
      } else if (t > 1 - FADE_FRAC) {
        alpha = ((1 - t) / FADE_FRAC) * OPACITY_MAX;
      } else {
        alpha = OPACITY_MAX;
      }

      // Position: drift upward + sinusoidal sway
      const elapsed = p.life;
      const currentY = p.y - p.speed * elapsed;
      const swayX = p.x + Math.sin(elapsed * SWAY_FREQ * Math.PI * 2 + p.swayPhase) * SWAY_AMP;

      // Clamp sway to viewport width
      const clampedX = Math.max(-p.size, Math.min(vw, swayX));

      p.el.style.transform = `translate(${clampedX}px, ${currentY}px)`;
      p.el.style.opacity   = alpha.toFixed(3);
    }

    requestAnimationFrame(tick);
  }

  requestAnimationFrame(tick);
})();
