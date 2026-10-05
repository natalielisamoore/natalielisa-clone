/* cosmos.js — the Cards of the Cosmos signup, sent without leaving the page. */
(function () {
  const form = document.querySelector('.dan__signup');
  if (!form) return;
  const note = form.querySelector('.dan__note');
  const email = form.querySelector('input[type="email"]');
  const btn = form.querySelector('button[type="submit"]');
  const opener = document.querySelector('.cosmos__btn[aria-controls]');
  if (opener) opener.addEventListener('click', () => {
    form.hidden = false;
    opener.setAttribute('aria-expanded', 'true');
    opener.hidden = true;
    email.focus();
  });
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!email.value || !email.checkValidity()) {
      note.textContent = 'That email does not look right yet.';
      email.focus();
      return;
    }
    btn.disabled = true;
    note.textContent = 'Sending…';
    try {
      const res = await fetch(form.action, { method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' } });
      if (!res.ok) throw new Error(String(res.status));
      form.classList.add('is-sent');
      note.textContent = 'Thank you. You will be the first to know.';
      email.value = '';
    } catch (err) {
      note.textContent = 'That did not send. Please try again in a moment.';
      btn.disabled = false;
    }
  });
})();

/* The three cards can be picked up and moved (2026-10-05). The tilt stays in
   --rot and the drag writes --dx/--dy, so a card keeps its angle while it
   travels. A card stays where it is dropped, and cannot be pushed outside the
   section. */
(function () {
  const cards = document.querySelectorAll('.cosmos__img');
  if (!cards.length) return;
  const section = document.querySelector('.cosmos');
  if (!section) return;

  let top = 1;                       /* the card last picked up sits above the rest */

  cards.forEach((card) => {
    let dx = 0, dy = 0;              /* where this card has been moved to */
    let sx = 0, sy = 0;              /* pointer origin, minus the offset so far */
    let lo = {}, hi = {};            /* how far it may travel before leaving the section */
    let active = null;

    card.addEventListener('pointerdown', (e) => {
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      active = e.pointerId;
      card.setPointerCapture(active);
      sx = e.clientX - dx;
      sy = e.clientY - dy;
      const s = section.getBoundingClientRect();
      const c = card.getBoundingClientRect();
      lo = { x: dx - (c.left - s.left), y: dy - (c.top - s.top) };
      hi = { x: dx + (s.right - c.right), y: dy + (s.bottom - c.bottom) };
      card.classList.add('is-drag');
      card.style.zIndex = String(++top + 1);
      e.preventDefault();
    });

    card.addEventListener('pointermove', (e) => {
      if (e.pointerId !== active) return;
      dx = Math.min(hi.x, Math.max(lo.x, e.clientX - sx));
      dy = Math.min(hi.y, Math.max(lo.y, e.clientY - sy));
      card.style.setProperty('--dx', dx + 'px');
      card.style.setProperty('--dy', dy + 'px');
    });

    const drop = (e) => {
      if (e.pointerId !== active) return;
      active = null;
      card.classList.remove('is-drag');
    };
    card.addEventListener('pointerup', drop);
    card.addEventListener('pointercancel', drop);
    card.addEventListener('dragstart', (e) => e.preventDefault());
  });
})();
