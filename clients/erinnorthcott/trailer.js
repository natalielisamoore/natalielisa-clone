/* trailer.js — the DANIEL button and the film frame used to hand the viewer
   to YouTube. They open a gate on this page instead.

   Both triggers keep their real href, so a middle-click, a right-click and a
   browser without <dialog> all still reach the trailer. This only intercepts
   the plain left-click, and bails entirely if showModal() isn't there. */
(function () {
  const dlg = document.getElementById('trailer');
  if (!dlg || typeof dlg.showModal !== 'function') return;

  const frame   = dlg.querySelector('.trailer__vid');
  const embed   = frame.dataset.embed;
  const hero    = document.querySelector('.filmframe__vid');
  const reduce  = window.matchMedia('(prefers-reduced-motion: reduce)');
  const trigger = document.querySelectorAll('[data-trailer]');
  if (!trigger.length) return;

  let heroWasPlaying = false;
  let opener = null;
  let closing = false;

  function open(e) {
    /* let the browser have the modified clicks — those mean "somewhere else" */
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
    e.preventDefault();
    opener = e.currentTarget;

    /* Erin's edit carries audio. Two soundtracks at once is the one thing
       that must not happen, so the hero stands down while this plays. */
    if (hero) {
      heroWasPlaying = !hero.paused;
      hero.pause();
    }

    frame.src = embed;                 /* nothing loads from YouTube until now */
    dlg.showModal();
  }

  function close() {
    if (closing) return;

    const done = () => {
      if (!closing) return;
      closing = false;
      dlg.classList.remove('is-closing');
      dlg.close();
      frame.removeAttribute('src');    /* stops the sound dead */
      if (hero && heroWasPlaying) hero.play().catch(() => {});
      if (opener) { opener.focus(); opener = null; }
    };

    closing = true;
    if (reduce.matches) return done();
    dlg.classList.add('is-closing');
    dlg.addEventListener('animationend', done, { once: true });
    /* animationend never arrives if the tab is hidden mid-close */
    setTimeout(done, 500);
  }

  trigger.forEach((t) => t.addEventListener('click', open));
  dlg.querySelector('.trailer__close').addEventListener('click', close);

  /* Esc: take the native cancel so the close animation still gets to run */
  dlg.addEventListener('cancel', (e) => { e.preventDefault(); close(); });

  /* the dark around the frame is the dialog itself — clicking it dismisses */
  dlg.addEventListener('click', (e) => { if (e.target === dlg) close(); });
})();
