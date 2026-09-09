/* praise.js — the Client Praise row. The track is a native horizontal
   scroller with snap points, so a trackpad or a thumb already moves it; the
   two arrows just step it one card at a time. The middle card starts in the
   middle. */
(function () {
  const track = document.querySelector('.praise__track');
  if (!track) return;
  const cards = Array.from(track.children);
  const step = () => {
    if (cards.length < 2) return cards[0].offsetWidth;
    return cards[1].offsetLeft - cards[0].offsetLeft;   /* card + gap */
  };
  /* open in the middle of the row, a card cut off at each edge of the screen */
  const mid = Math.floor(cards.length / 2);
  const centre = () => {
    track.scrollLeft = cards[mid].offsetLeft - (track.clientWidth - cards[mid].offsetWidth) / 2;
  };
  centre();
  addEventListener('resize', centre, { passive: true });

  document.querySelectorAll('.praise__btn').forEach((b) => {
    b.addEventListener('click', () => {
      track.scrollBy({ left: step() * Number(b.dataset.dir), behavior: 'smooth' });
    });
  });
})();
