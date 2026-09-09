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
})();
