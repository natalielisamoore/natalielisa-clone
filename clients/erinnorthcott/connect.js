/* connect.js — the enquiry form posts to Web3Forms without leaving the page,
   so the sky never has to reload. */
(function () {
  const form = document.getElementById('connect-form');
  if (!form) return;

  const note = document.getElementById('connect-note');
  const send = form.querySelector('button[type="submit"]');
  const idle = send.textContent;

  function say(text, kind) {
    note.textContent = text;
    note.className = 'connect__note is-' + kind;
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!form.checkValidity()) { form.reportValidity(); return; }

    send.disabled = true;
    send.textContent = 'Sending';
    say('', 'idle');

    try {
      const res = await fetch(form.action, {
        method: 'POST',
        headers: { Accept: 'application/json' },
        body: new FormData(form)
      });
      const data = await res.json().catch(() => ({}));

      if (res.ok && data.success !== false) {
        form.reset();
        say('Thank you — your note is with Erin. She’ll be in touch.', 'sent');
        send.textContent = 'Sent';
        return;                                  // leave it sent, don't invite a double-send
      }
      say('That didn’t send. Try again, or email Erin directly.', 'failed');
    } catch (err) {
      say('That didn’t send — check your connection and try again.', 'failed');
    }

    send.disabled = false;
    send.textContent = idle;
  });
})();
