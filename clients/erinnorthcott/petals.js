/* petals.js — rose petals falling softly through Inner Ceremonies.
   Two layers, so the reel has real depth: most petals drift behind the text,
   and a few large, out-of-focus ones pass in front of the lens.
   Only runs while the section is on screen. */
(function () {
  const section = document.getElementById('sunset');
  if (!section) return;
  const backCv  = section.querySelector('.petals--back');
  const frontCv = section.querySelector('.petals--front');
  if (!backCv || !frontCv) return;

  const bctx = backCv.getContext('2d');
  const fctx = frontCv.getContext('2d');
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---- a petal, painted once and reused ---------------------------------
     Sun-faded rose: pale at the lip, deepening toward the base, with a lit
     crease down the middle and a little weight where it left the flower. */
  const S = 168;
  const TONES = [
    ['#f2bfc4', '#dd8593', '#a53a52'],  // the site's rose
    ['#eeb0b8', '#cf6c7f', '#842840'],  // deeper, closer to the flower's heart
    ['#fbdcd6', '#eeaea8', '#bd6559'],  // faded toward clay
    ['#f0b9c2', '#cf7186', '#7d2740']   // the darkest of the fall
  ];

  function petalSprite(tone) {
    const c = document.createElement('canvas');
    c.width = c.height = S;
    const g = c.getContext('2d');
    g.translate(S / 2, S / 2);

    const p = new Path2D();
    p.moveTo(0, 0.50 * S);
    p.bezierCurveTo(-0.60 * S, 0.34 * S, -0.55 * S, -0.30 * S, -0.13 * S, -0.46 * S);
    p.quadraticCurveTo(0, -0.37 * S, 0.13 * S, -0.46 * S);   // the soft notch at the lip
    p.bezierCurveTo(0.55 * S, -0.30 * S, 0.60 * S, 0.34 * S, 0, 0.50 * S);
    p.closePath();

    const body = g.createLinearGradient(0, -0.5 * S, 0, 0.5 * S);
    body.addColorStop(0, tone[0]);
    body.addColorStop(0.55, tone[1]);
    body.addColorStop(1, tone[2]);
    g.fillStyle = body;
    g.fill(p);

    g.save();
    g.clip(p);

    // light folding along the crease
    const crease = g.createLinearGradient(-0.22 * S, 0, 0.26 * S, 0);
    crease.addColorStop(0, 'rgba(255,255,255,0)');
    crease.addColorStop(0.5, 'rgba(255,255,255,.26)');
    crease.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = crease;
    g.fillRect(-0.5 * S, -0.5 * S, S, S);

    // shadow gathering at the base
    const base = g.createRadialGradient(0, 0.44 * S, 0, 0, 0.44 * S, 0.46 * S);
    base.addColorStop(0, 'rgba(116,38,54,.36)');
    base.addColorStop(1, 'rgba(116,38,54,0)');
    g.fillStyle = base;
    g.fillRect(-0.5 * S, -0.5 * S, S, S);

    // a breath of light along the outer lip
    const lip = g.createLinearGradient(0, -0.5 * S, 0, -0.1 * S);
    lip.addColorStop(0, 'rgba(255,255,255,.18)');
    lip.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = lip;
    g.fillRect(-0.5 * S, -0.5 * S, S, S);

    // a hairline of shadow so the shape still reads once it's small
    g.lineWidth = 2.5;
    g.strokeStyle = 'rgba(108,34,50,.28)';
    g.stroke(p);

    g.restore();
    return c;
  }

  /* Foreground petals are out of focus, so they get their blur baked in once
     rather than filtered every frame. */
  function softened(src, px) {
    const pad = Math.ceil(px * 3);
    const c = document.createElement('canvas');
    c.width = src.width + pad * 2;
    c.height = src.height + pad * 2;
    const g = c.getContext('2d');
    g.filter = 'blur(' + px + 'px)';
    g.drawImage(src, pad, pad);
    return c;
  }

  const sharp = TONES.map(petalSprite);
  const soft  = sharp.map((s) => softened(s, 13));

  /* ---- the fall --------------------------------------------------------- */
  const rand = (a, b) => a + Math.random() * (b - a);
  let w = 0, h = 0, dpr = 1, petals = [], raf = 0, last = 0, visible = false;

  function makePetal(front, seeded) {
    const size = front ? rand(110, 190) : rand(20, 52);
    return {
      front: front,
      art: front ? soft[(Math.random() * soft.length) | 0] : sharp[(Math.random() * sharp.length) | 0],
      size: size,
      x: rand(-0.05, 1.05) * w,
      y: seeded ? rand(-0.2, 1) * h : rand(-0.45, -0.05) * h,
      vy: front ? rand(26, 48) : rand(15, 40),          // nearer petals fall faster
      sway: front ? rand(26, 70) : rand(14, 52),
      swayHz: rand(0.10, 0.30),
      phase: rand(0, Math.PI * 2),
      rot: rand(0, Math.PI * 2),
      spin: rand(-0.5, 0.5),
      flip: rand(0, Math.PI * 2),
      flipHz: rand(0.25, 0.75),
      alpha: front ? rand(0.15, 0.26) : rand(0.60, 0.95)
    };
  }

  function build() {
    w = section.clientWidth;
    h = section.clientHeight;
    if (!w || !h) return;
    dpr = Math.min(window.devicePixelRatio || 1, 2);

    for (const cv of [backCv, frontCv]) {
      cv.width = Math.round(w * dpr);
      cv.height = Math.round(h * dpr);
    }
    bctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    fctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const backCount  = Math.max(12, Math.min(24, Math.round(w / 68)));
    const frontCount = w > 900 ? 4 : 2;
    petals = [];
    for (let i = 0; i < backCount; i++)  petals.push(makePetal(false, true));
    for (let i = 0; i < frontCount; i++) petals.push(makePetal(true, true));
  }

  function draw(time) {
    bctx.clearRect(0, 0, w, h);
    fctx.clearRect(0, 0, w, h);

    for (const p of petals) {
      const ctx = p.front ? fctx : bctx;
      const turn = Math.cos(p.flip);
      // edge-on, a petal shows almost no face — it thins out and dims
      const face = Math.abs(turn);
      const squeeze = (turn < 0 ? -1 : 1) * Math.max(0.10, face);
      const x = p.x + p.sway * Math.sin(time * p.swayHz * Math.PI * 2 + p.phase);

      ctx.save();
      ctx.globalAlpha = p.alpha * (0.55 + 0.45 * face);
      ctx.translate(x, p.y);
      // it leans into whichever way the air is carrying it
      ctx.rotate(p.rot + 0.35 * Math.cos(time * p.swayHz * Math.PI * 2 + p.phase));
      ctx.scale(squeeze, 1);
      ctx.drawImage(p.art, -p.size / 2, -p.size / 2, p.size, p.size);
      ctx.restore();
    }
    bctx.globalAlpha = fctx.globalAlpha = 1;
  }

  function frame(now) {
    const dt = Math.min((now - last) / 1000, 0.05);   // a tab left in the background shouldn't lurch
    last = now;
    const time = now / 1000;

    for (const p of petals) {
      p.y += p.vy * dt;
      p.rot += p.spin * dt;
      p.flip += p.flipHz * dt * Math.PI * 2;
      if (p.y - p.size > h + 20) {                    // gone past the reel — send it back up
        p.y = -p.size - rand(0, h * 0.35);
        p.x = rand(-0.05, 1.05) * w;
      }
    }
    draw(time);
    raf = requestAnimationFrame(frame);
  }

  function start() {
    if (raf || reduce) return;
    last = performance.now();
    raf = requestAnimationFrame(frame);
  }
  function stop() {
    if (!raf) return;
    cancelAnimationFrame(raf);
    raf = 0;
  }

  build();
  if (reduce) {
    draw(0);                                          // a still scattering, no motion
  } else if ('IntersectionObserver' in window) {
    new IntersectionObserver((entries) => {
      visible = entries[0].isIntersecting;
      visible && !document.hidden ? start() : stop();
    }, { rootMargin: '15% 0px' }).observe(section);
    document.addEventListener('visibilitychange', () => {
      document.hidden || !visible ? stop() : start();
    });
  } else {
    start();
  }

  let rz;
  window.addEventListener('resize', () => {
    clearTimeout(rz);
    rz = setTimeout(() => { build(); if (reduce) draw(0); }, 200);
  }, { passive: true });
})();
