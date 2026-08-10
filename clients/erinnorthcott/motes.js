/* motes.js — ambient celestial dust drifting across the whole site, so the
   space feels entered: soft, slow, ever-present particles of light. */
(function () {
  const canvas = document.querySelector('.motes');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let motes = [], w = 0, h = 0, dpr = Math.min(window.devicePixelRatio || 1, 2);

  function build() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = window.innerWidth; h = window.innerHeight;
    canvas.width = w * dpr; canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const count = Math.round((w * h) / 15000); // subtle, ~60 on a laptop
    motes = Array.from({ length: count }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      r: 0.6 + Math.random() * 1.6,
      gold: Math.random() < 0.42,
      a: 0.14 + Math.random() * 0.34,
      vy: -(0.04 + Math.random() * 0.13),      // drift gently upward
      sx: Math.random() * 0.12 - 0.06,         // slight sway
      ph: Math.random() * Math.PI * 2,
      sp: 0.35 + Math.random() * 0.8
    }));
  }

  function frame(t) {
    ctx.clearRect(0, 0, w, h);
    const time = t / 1000;
    for (const m of motes) {
      if (!reduce) {
        m.y += m.vy; m.x += m.sx;
        if (m.y < -6) { m.y = h + 6; m.x = Math.random() * w; }
        if (m.x < -6) m.x = w + 6; else if (m.x > w + 6) m.x = -6;
      }
      const tw = reduce ? 0.7 : 0.5 + 0.5 * Math.sin(time * m.sp + m.ph);
      ctx.globalAlpha = m.a * tw;
      ctx.fillStyle = m.gold ? '#e9c766' : '#ffffff';
      ctx.shadowBlur = 6;
      ctx.shadowColor = ctx.fillStyle;
      ctx.beginPath();
      ctx.arc(m.x, m.y, m.r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1; ctx.shadowBlur = 0;
    requestAnimationFrame(frame);
  }

  let rz;
  window.addEventListener('resize', () => { clearTimeout(rz); rz = setTimeout(build, 200); }, { passive: true });

  build();
  requestAnimationFrame(frame);
})();
