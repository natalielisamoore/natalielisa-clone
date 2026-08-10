/* stars.js — twinkling night sky; white + gold, larger ones glow and breathe.
   Fades in as the reader descends into the night. Magic: stars brighten near
   the cursor, and shooting stars streak across now and then. */
(function () {
  const canvas = document.querySelector('.stars');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let stars = [], shooters = [];
  let dpr = Math.min(window.devicePixelRatio || 1, 2);
  let mx = -9999, my = -9999;   // cursor, in CSS px

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

  window.addEventListener('pointermove', (e) => { mx = e.clientX; my = e.clientY; }, { passive: true });
  window.addEventListener('pointerleave', () => { mx = my = -9999; }, { passive: true });

  function spawnShooter() {
    const fromLeft = Math.random() < 0.5;
    const y = Math.random() * window.innerHeight * 0.5;   // upper sky
    shooters.push({
      x: fromLeft ? -40 : window.innerWidth + 40,
      y,
      vx: (fromLeft ? 1 : -1) * (7 + Math.random() * 5),
      vy: 2 + Math.random() * 2.4,
      life: 0,
      len: 90 + Math.random() * 80,
      gold: Math.random() < 0.5
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
      const R = 130;                       // cursor glow radius
      for (const s of stars) {
        let tw = reduce ? 0.8 : 0.26 + 0.74 * (0.5 + 0.5 * Math.sin(time * s.speed + s.phase));
        // brighten stars near the cursor — the sky responds to you
        if (mx > -9998) {
          const d = Math.hypot(s.x - mx, s.y - my);
          if (d < R) tw = Math.min(1, tw + (1 - d / R) * 0.7);
        }
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

      // shooting stars — only in the deep night, occasionally
      if (!reduce && alpha > 0.6 && shooters.length < 2 && Math.random() < 0.006) spawnShooter();
      for (let i = shooters.length - 1; i >= 0; i--) {
        const sh = shooters[i];
        sh.x += sh.vx; sh.y += sh.vy; sh.life += 1;
        const tx = sh.x - sh.vx / Math.hypot(sh.vx, sh.vy) * sh.len;
        const ty = sh.y - sh.vy / Math.hypot(sh.vx, sh.vy) * sh.len;
        const fade = Math.max(0, 1 - sh.life / 60);
        const grad = ctx.createLinearGradient(sh.x, sh.y, tx, ty);
        const col = sh.gold ? '233,199,102' : '255,247,234';
        grad.addColorStop(0, `rgba(${col},${(0.9 * fade).toFixed(3)})`);
        grad.addColorStop(1, `rgba(${col},0)`);
        ctx.strokeStyle = grad;
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.moveTo(sh.x, sh.y);
        ctx.lineTo(tx, ty);
        ctx.stroke();
        if (sh.life > 60 || sh.x < -80 || sh.x > window.innerWidth + 80) shooters.splice(i, 1);
      }
    }
    requestAnimationFrame(frame);
  }

  let rz;
  window.addEventListener('resize', () => { clearTimeout(rz); rz = setTimeout(build, 200); }, { passive: true });

  build();
  requestAnimationFrame(frame);
})();
