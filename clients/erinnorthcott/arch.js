/* arch.js — the archway is the way IN TO INNER CEREMONIES, and nowhere else.
   Replaces the star spiral of transition.js (kept on disk, no longer loaded).

   Clicking that link anywhere on the site raises a wall the colour of the
   page with a pointed arch opened in it, the roses glimpsed through the
   opening; the arch grows toward you until you are through it, and the load
   happens underneath. On arrival the wall is already behind you and simply
   goes. Every other link on the site is left alone.

   Ordinary JS on an overlay, deliberately not @view-transition (see the note
   in transition.js). The arch is drawn, not photographed: a mask on the wall
   and a stroked outline for the frame, both scaled by CSS. */
(function () {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (reduce.matches) return;

  const IN_MS = 820;                     /* rise + pass-through before navigating */
  const base = new URL('.', document.currentScript.src);   /* erinnorthcott/ */
  const poster = new URL('images/rose-water-poster.jpg', base).href;

  const veil = document.createElement('div');
  veil.className = 'archway';
  veil.setAttribute('aria-hidden', 'true');
  veil.innerHTML =
    '<div class="archway__beyond" style="background-image:url(' + poster + ')"></div>' +
    '<div class="archway__wall"></div>' +
    '<svg class="archway__frame" viewBox="0 0 100 160" aria-hidden="true">' +
      '<path d="M20 160V70C20 42 34 24 50 10C66 24 80 42 80 70V160"/>' +
      '<path d="M15 160V68C15 38 32 18 50 4C68 18 85 38 85 68V160" opacity=".45"/>' +
    '</svg>';
  document.body.appendChild(veil);

  /* ---- arriving: through the arch already; the wall goes -------------- */
  if (sessionStorage.getItem('archway') === '1') {
    sessionStorage.removeItem('archway');
    document.documentElement.classList.add('arrived-by-arch');   /* the page's own portal stands down */
    veil.classList.add('is-out');
    veil.addEventListener('transitionend', function done(e) {
      if (e.target !== veil) return;
      veil.classList.remove('is-out');
      veil.removeEventListener('transitionend', done);
    });
  }

  /* ---- leaving: raise the wall, open the arch, go --------------------- */
  const internal = (a) => {
    if (!a || a.target === '_blank' || a.hasAttribute('download')) return false;
    if (a.dataset.trailer !== undefined) return false;
    const u = new URL(a.href, location.href);
    if (u.origin !== location.origin) return false;
    if (u.pathname === location.pathname && u.hash) return false;
    return /\/clients\/erinnorthcott\/inner-ceremonies\/?$/.test(u.pathname);
  };

  let going = false;
  document.addEventListener('click', (e) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
    const a = e.target.closest('a[href]');
    if (!internal(a) || going) return;
    e.preventDefault();
    going = true;
    sessionStorage.setItem('archway', '1');
    veil.classList.add('is-up');
    requestAnimationFrame(() => requestAnimationFrame(() => veil.classList.add('is-through')));
    setTimeout(() => { location.href = a.href; }, IN_MS);
  });

  window.addEventListener('pageshow', (e) => {
    if (e.persisted) { veil.classList.remove('is-up', 'is-through', 'is-out'); going = false; }
  });
})();
