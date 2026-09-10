/* dust.js — the gold rings behind "How clear could you feel?" become dust.
   Every grain is sampled from gold-ring.png and given a home on one of the
   four turning rings. The pointer pushes the grains away; each drifts back
   to its place on its own time, so the ring re-forms behind your hand.
   Under reduced motion the four PNG rings stay exactly as they were. */
(function () {
  const close = document.querySelector('.temple__close');
  const rings = close && close.querySelector('.rings');
  const img = rings && rings.querySelector('img');
  if (!close || !rings || !img) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  /* the four rings, as the CSS has them: scale, direction, seconds per turn, opacity */
  const RINGS = [
    { s: 1.00, dir:  1, period: 140, alpha: .50 },
    { s: 0.76, dir: -1, period: 110, alpha: .55 },
    { s: 0.54, dir:  1, period:  85, alpha: .60 },
    { s: 0.34, dir: -1, period:  60, alpha: .65 },
  ];
  const SAMPLE = 520;        /* px: the image is read at this size */
  const STEP = 2;            /* read every 2nd pixel: ~1/4 of the grains */
  const PUSH_R = 22;         /* px: the reach of the brush around the moving point */
  const PUSH = 0.55;         /* how much of the hand's speed a grain takes on */
  const SPRING = 0.006;      /* how eagerly a grain heads home */
  const DRAG = 0.90;         /* velocity kept per frame: low enough that a grain glides home
                                and settles, never overshoots and bounces (2026-09-10) */
  const JITTER = 0.04;       /* a little life, so it never freezes solid */

  const canvas = document.createElement('canvas');
  canvas.className = 'dust';
  canvas.setAttribute('aria-hidden', 'true');
  close.insertBefore(canvas, close.firstChild);
  const ctx = canvas.getContext('2d', { alpha: true });

  let W = 0, H = 0, dpr = 1, ringPx = 0, cx = 0, cy = 0;
  let grains = [];           /* {ring, bx, by (unit, -0.5..0.5), x, y, vx, vy, a (alpha bucket)} */
  let colour = '212,168,75';
  let mouse = { x: -9999, y: -9999, px: -9999, py: -9999, on: false, moved: false };
  let running = false, raf = 0, t0 = performance.now(), pausedAt = 0;

  function sample() {
    const off = document.createElement('canvas');
    off.width = off.height = SAMPLE;
    const c = off.getContext('2d', { willReadFrequently: true });
    c.drawImage(img, 0, 0, SAMPLE, SAMPLE);
    const d = c.getImageData(0, 0, SAMPLE, SAMPLE).data;
    let r = 0, g = 0, b = 0, n = 0;
    const pts = [];
    for (let y = 0; y < SAMPLE; y += STEP) {
      for (let x = 0; x < SAMPLE; x += STEP) {
        const i = (y * SAMPLE + x) * 4;
        const a = d[i + 3];
        if (a < 40) continue;
        if (a > 120) { r += d[i]; g += d[i + 1]; b += d[i + 2]; n++; }
        pts.push({ bx: x / SAMPLE - 0.5, by: y / SAMPLE - 0.5, a: a / 255 });
      }
    }
    if (n) colour = `${(r / n) | 0},${(g / n) | 0},${(b / n) | 0}`;
    return pts;
  }

  function build() {
    const pts = sample();
    grains = [];
    RINGS.forEach((ring, ri) => {
      /* inner rings are smaller, so they need fewer grains to look as dense */
      const keep = Math.max(.3, ring.s * ring.s + .15);
      for (let i = 0; i < pts.length; i++) {
        if (Math.random() > keep) continue;
        const p = pts[i];
        grains.push({ ring: ri, bx: p.bx, by: p.by, x: 0, y: 0, vx: 0, vy: 0,
                      a: Math.min(1, p.a * ring.alpha * 2.2), placed: false });
      }
    });
  }

  function size() {
    dpr = Math.min(2, window.devicePixelRatio || 1);
    const r = close.getBoundingClientRect();
    W = Math.round(r.width); H = Math.round(r.height);
    canvas.width = W * dpr; canvas.height = H * dpr;
    canvas.style.width = W + 'px'; canvas.style.height = H + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const rr = rings.getBoundingClientRect();
    ringPx = rr.width;
    cx = rr.left - r.left + rr.width / 2;
    cy = rr.top - r.top + rr.height / 2;
    grains.forEach((g) => { g.placed = false; });
  }

  function home(g, cs, sn) {
    const s = RINGS[g.ring].s * ringPx;
    const x = g.bx * s, y = g.by * s;
    return [cx + x * cs - y * sn, cy + x * sn + y * cs];
  }

  function frame(now) {
    if (!running) return;
    const t = (now - t0) / 1000;
    const rot = RINGS.map((r) => {
      const a = r.dir * (t / r.period) * Math.PI * 2;
      return [Math.cos(a), Math.sin(a)];
    });
    ctx.clearRect(0, 0, W, H);
    /* the brush: only a MOVING hand touches the dust. A resting cursor holds
       nothing back, so no clearing ever forms around it. The stroke since the
       last frame is sampled along its length so a fast pass misses nothing. */
    let strokes = null;
    if (mouse.on && mouse.moved) {
      const mx = mouse.x - mouse.px, my = mouse.y - mouse.py;
      const len = Math.hypot(mx, my);
      if (len > 0.5) {
        const speed = Math.min(len, 40) / 40;           /* 0..1 */
        const n = Math.max(1, Math.ceil(len / (PUSH_R * 0.8)));
        strokes = { pts: [], ux: mx / len, uy: my / len, speed };
        for (let k = 1; k <= n; k++) strokes.pts.push([mouse.px + mx * (k / n), mouse.py + my * (k / n)]);
      }
      mouse.px = mouse.x; mouse.py = mouse.y; mouse.moved = false;
    }
    const R2 = PUSH_R * PUSH_R;
    const buckets = [[], [], [], []];
    for (let i = 0; i < grains.length; i++) {
      const g = grains[i];
      const [hx, hy] = home(g, rot[g.ring][0], rot[g.ring][1]);
      if (!g.placed) { g.x = hx; g.y = hy; g.vx = g.vy = 0; g.placed = true; }
      if (strokes) {
        for (let k = 0; k < strokes.pts.length; k++) {
          const dx = g.x - strokes.pts[k][0], dy = g.y - strokes.pts[k][1];
          const d2 = dx * dx + dy * dy;
          if (d2 < R2 && d2 > 0.01) {
            const d = Math.sqrt(d2);
            const w = 1 - d / PUSH_R;
            const f = w * w * PUSH * (0.35 + strokes.speed);   /* soft edge, no rim */
            /* carried along the stroke, and eased outward from it */
            g.vx += (strokes.ux * 0.7 + (dx / d) * 0.6) * f * 6;
            g.vy += (strokes.uy * 0.7 + (dy / d) * 0.6) * f * 6;
            break;
          }
        }
      }
      /* the way home */
      g.vx += (hx - g.x) * SPRING + (Math.random() - .5) * JITTER;
      g.vy += (hy - g.y) * SPRING + (Math.random() - .5) * JITTER;
      g.vx *= DRAG; g.vy *= DRAG;
      g.x += g.vx; g.y += g.vy;
      buckets[Math.min(3, (g.a * 4) | 0)].push(g);
    }
    const alphas = [.5, .72, .9, 1];
    for (let b = 0; b < 4; b++) {
      ctx.fillStyle = `rgba(${colour},${alphas[b]})`;
      const list = buckets[b];
      ctx.beginPath();
      for (let i = 0; i < list.length; i++) ctx.rect(list[i].x, list[i].y, 1.5, 1.5);
      ctx.fill();
    }
    raf = requestAnimationFrame(frame);
  }

  /* the clock PAUSES while the close is off screen and resumes where it was;
     resetting it (as this once did) snapped every ring back to its start
     angle each time the section scrolled in, and the grains bounced (2026-09-10) */
  function start() { if (running) return; running = true; if (pausedAt) { t0 += performance.now() - pausedAt; pausedAt = 0; } raf = requestAnimationFrame(frame); }
  function stop() { if (!running) return; running = false; pausedAt = performance.now(); cancelAnimationFrame(raf); }

  function onMove(e) {
    const r = close.getBoundingClientRect();
    const x = e.clientX - r.left, y = e.clientY - r.top;
    if (!mouse.on) { mouse.px = x; mouse.py = y; }
    mouse.x = x; mouse.y = y; mouse.on = true; mouse.moved = true;
  }
  function onLeave() { mouse.on = false; mouse.moved = false; }

  function init() {
    build();
    size();
    rings.classList.add('is-dust');
    addEventListener('resize', size, { passive: true });
    close.addEventListener('pointermove', onMove, { passive: true });
    close.addEventListener('pointerleave', onLeave, { passive: true });
    close.addEventListener('touchmove', (e) => { const t = e.touches[0]; if (t) onMove(t); }, { passive: true });
    close.addEventListener('touchend', onLeave, { passive: true });
    /* only draw while the close is on screen */
    const io = new IntersectionObserver((es) => { es.forEach((en) => (en.isIntersecting ? start() : stop())); }, { threshold: 0.05 });
    io.observe(close);
  }

  if (img.complete && img.naturalWidth) init();
  else img.addEventListener('load', init, { once: true });
})();
