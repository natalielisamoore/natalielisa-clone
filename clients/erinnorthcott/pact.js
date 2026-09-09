/* pact.js — two lines type themselves out on the Daniel page: the pact line
   when you land, and "Our story never ends." when its rings come into view.
   A caret blinks at the end of each until the line is done. Under reduced
   motion both lines are simply there. */
(function () {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  function typeInto(line, opts) {
    const text = line.textContent.trim();
    line.textContent = '';
    line.classList.add('is-typing');
    const out = document.createElement('span');
    out.className = 'dan__typed';
    const caret = document.createElement('span');
    caret.className = 'dan__caret';
    caret.setAttribute('aria-hidden', 'true');
    line.setAttribute('aria-label', text);
    line.append(out, caret);
    let i = 0;
    function type() {
      if (i < text.length) {
        const ch = text[i++];
        out.textContent += ch;
        const pause = ch === ' ' ? opts.step * 1.6 : ch === '.' ? opts.step * 4 : opts.step;
        setTimeout(type, pause);
      } else {
        line.classList.remove('is-typing');
        line.classList.add('is-typed');
        setTimeout(() => caret.remove(), 2600);
      }
    }
    setTimeout(type, opts.start);
  }

  const pact = document.querySelector('.dan__pactline');
  if (pact) typeInto(pact, { start: 900, step: 68 });

  const closing = document.querySelector('.dan__closing');
  if (closing) {
    /* hold the words back until the close is on screen, then type */
    const text = closing.textContent.trim();
    closing.textContent = '';
    closing.classList.remove('reveal');
    closing.style.minHeight = '1.15em';
    closing.textContent = text;
    closing.style.visibility = 'hidden';
    const io = new IntersectionObserver((es) => {
      es.forEach((en) => {
        if (!en.isIntersecting) return;
        io.disconnect();
        closing.style.visibility = '';
        typeInto(closing, { start: 350, step: 82 });
      });
    }, { threshold: 0.6 });
    io.observe(closing);
  }
})();
