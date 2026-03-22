(function () {
  'use strict';

  var nav      = document.querySelector('.navbar1_component');
  var blackbar = document.querySelector('.blacklinenavigator');
  if (!nav) return;

  /* ── Initial hidden state ── */
  var TRANSITION = 'opacity 0.5s ease, transform 0.5s ease';

  function setHidden() {
    nav.style.opacity    = '0';
    nav.style.transform  = 'translateY(-12px)';
    nav.style.transition = 'none';
    if (blackbar) {
      blackbar.style.opacity    = '0';
      blackbar.style.transition = 'none';
    }
  }

  function setVisible() {
    nav.style.transition = TRANSITION;
    nav.style.opacity    = '1';
    nav.style.transform  = 'translateY(0)';
    if (blackbar) {
      blackbar.style.transition = 'opacity 0.5s ease';
      blackbar.style.opacity    = '1';
    }
  }

  setHidden();

  /* ── Show on first scroll ── */
  var shown = false;

  function onScroll() {
    if (shown) return;
    if (window.scrollY > 8) {
      shown = true;
      setVisible();
      window.removeEventListener('scroll', onScroll);
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });

})();
