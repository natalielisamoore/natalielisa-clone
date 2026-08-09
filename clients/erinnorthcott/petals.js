/* petals.js — rose petals drift down as the page loads, then gently thin out. */
(function () {
  const layer = document.querySelector('.petals');
  if (!layer) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const ROSE = ['#f7d5d5', '#f5c6c6', '#efb7b7', '#f3cfc0'];

  function spawn() {
    const el = document.createElement('div');
    el.className = 'petal';

    const size = 9 + Math.random() * 12;
    const startX = Math.random() * 100;              // vw
    const drift = (Math.random() * 22 - 11);         // vw sideways
    const duration = 7 + Math.random() * 7;          // s
    const rot = (Math.random() * 540 - 270);         // deg
    const sway = 12 + Math.random() * 22;            // px

    el.style.width = el.style.height = size + 'px';
    el.style.left = startX + 'vw';
    el.style.background =
      `radial-gradient(circle at 30% 30%, #fbe6e6, ${ROSE[(Math.random() * ROSE.length) | 0]} 62%, #e29f9f)`;

    el.animate(
      [
        { transform: `translate(0, -8vh) rotate(0deg)`, opacity: 0 },
        { transform: `translate(${drift * 0.4}vw, 30vh) rotate(${rot * 0.4}deg)`, opacity: 0.9, offset: 0.25 },
        { transform: `translate(${drift}vw, 108vh) rotate(${rot}deg)`, opacity: 0 }
      ],
      { duration: duration * 1000, easing: 'cubic-bezier(.45,0,.55,1)' }
    ).onfinish = () => el.remove();

    // subtle horizontal sway via a second, looping transform on a wrapper-free element
    el.animate(
      [{ marginLeft: '0px' }, { marginLeft: sway + 'px' }, { marginLeft: '0px' }],
      { duration: (2 + Math.random() * 2) * 1000, iterations: Infinity, easing: 'ease-in-out' }
    );

    layer.appendChild(el);
  }

  // Opening flourish, then taper to a whisper.
  let elapsed = 0;
  const tick = () => {
    spawn();
    elapsed += 1;
    // dense for the first ~3.5s, then increasingly sparse, stopping near ~14s
    const next = elapsed < 12 ? 260 : elapsed < 26 ? 700 : 1500;
    if (elapsed < 34) setTimeout(tick, next);
  };
  // small initial burst
  for (let i = 0; i < 6; i++) setTimeout(spawn, i * 120);
  setTimeout(tick, 600);
})();
