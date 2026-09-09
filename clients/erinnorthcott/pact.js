/* pact.js — the pact line types itself out when you land, one letter at a
   time, a caret blinking at the end until the line is done. Under reduced
   motion the whole line is simply there. */
(function () {
  const line = document.querySelector('.dan__pactline');
  if (!line) return;
  const text = line.textContent.trim();
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  line.textContent = '';
  line.classList.add('is-typing');
  const out = document.createElement('span');
  out.className = 'dan__typed';
  const caret = document.createElement('span');
  caret.className = 'dan__caret';
  caret.setAttribute('aria-hidden', 'true');
  line.setAttribute('aria-label', text);
  line.append(out, caret);

  const START = 900;         /* ms after load before the first letter */
  const STEP = 68;           /* ms per letter */
  let i = 0;
  function type() {
    if (i < text.length) {
      const ch = text[i++];
      out.textContent += ch;
      /* a breath at the comma-less pauses: after "brother" and "I" */
      const pause = ch === ' ' ? STEP * 1.6 : ch === '.' ? STEP * 4 : STEP;   /* the dots land slowly */
      setTimeout(type, pause);
    } else {
      line.classList.remove('is-typing');
      line.classList.add('is-typed');
      setTimeout(() => caret.remove(), 2600);
    }
  }
  setTimeout(type, START);
})();
