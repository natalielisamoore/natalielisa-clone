/* pillars.js — the three pillar cards turn over on a click or a key, and
   turn back the same way. Nothing here runs on scroll. */
(function () {
  const cards = document.querySelectorAll('.pillar__card');
  if (!cards.length) return;
  cards.forEach((card) => {
    card.addEventListener('click', () => {
      const on = card.classList.toggle('is-flipped');
      card.setAttribute('aria-expanded', on ? 'true' : 'false');
    });
  });

  /* Hover lean (2026-10-02). The lift and the shadow are pure CSS; this only
     feeds the two angles, on the LI rather than the card so the flip's own
     transform is never touched. Same convention as the site's tilt.js:
     rotateX(-dy), rotateY(dx), so the side under the cursor settles back and
     the far side comes forward. 2.5deg, which is the whole effect. */
  const TILT = 2.5;
  const fine = window.matchMedia('(hover: hover) and (pointer: fine)');
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (!fine.matches || reduce.matches) return;

  document.querySelectorAll('.pillar--flip').forEach((li) => {
    let raf = 0, x = 0, y = 0;

    const apply = () => {
      raf = 0;
      li.style.setProperty('--prx', (-y * TILT).toFixed(2) + 'deg');
      li.style.setProperty('--pry', ( x * TILT).toFixed(2) + 'deg');
    };

    li.addEventListener('pointermove', (e) => {
      if (e.pointerType && e.pointerType !== 'mouse') return;
      const r = li.getBoundingClientRect();
      x = (e.clientX - (r.left + r.width  / 2)) / (r.width  / 2);
      y = (e.clientY - (r.top  + r.height / 2)) / (r.height / 2);
      if (!raf) raf = requestAnimationFrame(apply);
    }, { passive: true });

    li.addEventListener('pointerleave', () => {
      if (raf) { cancelAnimationFrame(raf); raf = 0; }
      li.style.setProperty('--prx', '0deg');
      li.style.setProperty('--pry', '0deg');
    }, { passive: true });
  });
})();
