/* sky.js — continuous sunrise→golden→sunset→midnight, tied to scroll position */
(function () {
  const sky = document.querySelector('.sky');
  if (!sky) return;

  // Positioned stops across the scroll (0..1). Stays LIGHT through the whole
  // middle, then drops to a near-black navy for the night at the very bottom.
  const STOPS = [
    { p: 0.00, c: ['#fdeef1', '#f8cdc9', '#f9c896'] }, // sunrise — pink → peach
    { p: 0.30, c: ['#fbdcc2', '#f7cfa2', '#f4cb90'] }, // golden — peach-gold (light)
    { p: 0.62, c: ['#f9dcc8', '#f6cfa4', '#f2c992'] }, // light gold — the middle stays light
    { p: 0.75, c: ['#f7d9c4', '#f3cc9f', '#eec78d'] }, // hold light through the Becoming
    { p: 0.80, c: ['#131c3c', '#0d1530', '#0a1026'] }, // quick dusk → dark by the night section
    { p: 1.00, c: ['#080b18', '#06080f', '#05060c'] }  // dark dark navy, almost black
  ];

  const hexToRgb = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
  const lerp = (a, b, t) => Math.round(a + (b - a) * t);
  const mix = (c1, c2, t) => {
    const a = hexToRgb(c1), b = hexToRgb(c2);
    return `rgb(${lerp(a[0], b[0], t)},${lerp(a[1], b[1], t)},${lerp(a[2], b[2], t)})`;
  };

  function skyAt(p) {
    let i = 0;
    while (i < STOPS.length - 2 && p > STOPS[i + 1].p) i++;
    const A = STOPS[i], B = STOPS[i + 1];
    const t = Math.min(1, Math.max(0, (p - A.p) / (B.p - A.p)));
    return `linear-gradient(180deg, ${mix(A.c[0], B.c[0], t)} 0%, ${mix(A.c[1], B.c[1], t)} 50%, ${mix(A.c[2], B.c[2], t)} 100%)`;
  }

  let ticking = false;
  function update() {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const p = max > 0 ? Math.min(Math.max(window.scrollY / max, 0), 1) : 0;
    sky.style.background = skyAt(p);
    // let other layers know how deep into the night we are (0..1)
    // stars & horizon only in the dark bottom
    document.documentElement.style.setProperty('--night', String(Math.min(1, Math.max(0, (p - 0.79) / 0.13))));
    // nav flips ink → ivory as the sky darkens at the bottom
    document.documentElement.style.setProperty('--dusk', String(Math.min(1, Math.max(0, (p - 0.78) / 0.04))));
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
