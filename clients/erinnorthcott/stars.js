/* stars.js — twinkling night sky; white + gold, larger ones glow and breathe.
   The whole canvas fades in only as the reader descends into the night. */
(function () {
  const canvas = document.querySelector('.stars');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let stars = [];
  let dpr = Math.min(window.devicePixelRatio || 1, 2);

  function build() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const count = Math.round((window.innerWidth * window.innerHeight) / 3400);
    stars = Array.from({ length: count }, () => {
      const large = Math.random() < 0.09;   // only a few are slightly bigger
      return {
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        r: large ? 0.9 + Math.random() * 0.7 : 0.35 + Math.random() * 0.7,
        gold: Math.random() < 0.35,
        large,
        phase: Math.random() * Math.PI * 2,
        speed: 0.9 + Math.random() * 2.0     // livelier twinkle
      };
    });
  }

  function frame(t) {
    const alpha = parseFloat(
      getComputedStyle(document.documentElement).getPropertyValue('--night')
    ) || 0;
    canvas.style.opacity = alpha.toFixed(3);

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (alpha > 0.001) {
      const time = t / 1000;
      for (const s of stars) {
        const tw = reduce ? 0.8 : 0.26 + 0.74 * (0.5 + 0.5 * Math.sin(time * s.speed + s.phase));
        ctx.globalAlpha = tw;
        ctx.fillStyle = s.gold ? '#e9c766' : '#ffffff';
        if (s.large) {
          ctx.shadowBlur = 4;
          ctx.shadowColor = s.gold ? 'rgba(233,199,102,.7)' : 'rgba(255,255,255,.7)';
        } else {
          ctx.shadowBlur = 0;
        }
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      ctx.shadowBlur = 0;
    }
    requestAnimationFrame(frame);
  }

  let rz;
  window.addEventListener('resize', () => { clearTimeout(rz); rz = setTimeout(build, 200); }, { passive: true });

  build();
  requestAnimationFrame(frame);
})();
