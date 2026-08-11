/* letters.js — the closing line surfaces a letter at a time, left to right.
   The text is split into spans that CSS staggers off --i; the whole figure
   gets .lit the first time it comes into view. Under reduced motion nothing
   is split at all and the line simply sits there. */
(function () {
  const fig = document.querySelector('.pullquote--close');
  if (!fig) return;
  const line = fig.querySelector('blockquote');
  if (!line) return;

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const text = line.textContent;

  // one span per character; the reader still hears the whole sentence
  const holder = document.createElement('span');
  holder.setAttribute('aria-hidden', 'true');
  [...text].forEach((ch, i) => {
    const s = document.createElement('span');
    s.className = 'ltr';
    s.style.setProperty('--i', i);
    s.textContent = ch;
    holder.appendChild(s);
  });
  line.setAttribute('aria-label', text);
  line.textContent = '';
  line.appendChild(holder);
  fig.style.setProperty('--n', text.length);

  const light = () => fig.classList.add('lit');

  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (e.isIntersecting) { light(); io.disconnect(); }
      }
    }, { threshold: 0.35 });
    io.observe(fig);
  } else {
    light();
  }
})();
