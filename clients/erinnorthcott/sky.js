/* sky.js — continuous sunrise→golden→sunset→midnight, tied to scroll position */
(function () {
  const sky = document.querySelector('.sky');
  if (!sky) return;

  // Four "moments" of the sky. Each is a 3-stop vertical gradient (top/mid/bottom).
  const MOMENTS = [
    { top: '#fdeef1', mid: '#f7c8c7', bot: '#f8c290' }, // sunrise  — whisper pink → baby pink → peach
    { top: '#f8cbbb', mid: '#efb877', bot: '#cf9f4a' }, // golden   — rosy peach → warm gold
    { top: '#dd9c8b', mid: '#9e5f44', bot: '#4e3550' }, // sunset   — rose-clay → dusk plum
    { top: '#101a33', mid: '#0c1022', bot: '#0a0a1a' }  // midnight — deep night
  ];

  const hexToRgb = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
  const lerp = (a, b, t) => Math.round(a + (b - a) * t);
  const mix = (c1, c2, t) => {
    const a = hexToRgb(c1), b = hexToRgb(c2);
    return `rgb(${lerp(a[0], b[0], t)},${lerp(a[1], b[1], t)},${lerp(a[2], b[2], t)})`;
  };

  function skyAt(p) {
    // p in [0,1] across the whole scroll → segment between two moments
    const seg = p * (MOMENTS.length - 1);
    const i = Math.min(Math.floor(seg), MOMENTS.length - 2);
    const t = seg - i;
    const A = MOMENTS[i], B = MOMENTS[i + 1];
    return `linear-gradient(180deg, ${mix(A.top, B.top, t)} 0%, ${mix(A.mid, B.mid, t)} 50%, ${mix(A.bot, B.bot, t)} 100%)`;
  }

  let ticking = false;
  function update() {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const p = max > 0 ? Math.min(Math.max(window.scrollY / max, 0), 1) : 0;
    sky.style.background = skyAt(p);
    // let other layers know how deep into the night we are (0..1)
    document.documentElement.style.setProperty('--night', String(Math.max(0, (p - 0.5) / 0.5)));
    // earlier ramp for UI that needs to stay readable as the sky darkens (nav)
    document.documentElement.style.setProperty('--dusk', String(Math.min(1, Math.max(0, (p - 0.32) / 0.32))));
    window.__skyProgress = p;
    ticking = false;
  }
  function onScroll() {
    if (!ticking) { ticking = true; requestAnimationFrame(update); }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });
  update();
})();
