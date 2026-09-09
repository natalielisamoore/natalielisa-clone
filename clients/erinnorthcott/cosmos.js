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
