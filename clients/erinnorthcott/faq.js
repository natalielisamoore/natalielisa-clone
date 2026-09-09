/* faq.js — the questions open and close one at a time, softly. */
(function () {
  const btns = document.querySelectorAll('.faq__btn');
  if (!btns.length) return;
  btns.forEach((btn) => {
    btn.addEventListener('click', () => {
      const open = btn.getAttribute('aria-expanded') === 'true';
      btn.setAttribute('aria-expanded', open ? 'false' : 'true');
      btn.closest('.faq__item').classList.toggle('is-open', !open);
    });
  });
})();
