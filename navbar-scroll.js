(function () {
  'use strict';

  var nav      = document.querySelector('.navbar1_component');
  var blackbar = document.querySelector('.blacklinenavigator');
  if (!nav) return;

  var TRANSITION = 'opacity 0.5s ease, transform 0.5s ease, max-height 0.5s ease';

  function setHidden() {
    nav.style.transition = 'none';
    nav.style.opacity    = '0';
    nav.style.transform  = 'translateY(-12px)';
    nav.style.maxHeight  = '0';
    nav.style.overflow   = 'hidden';
    if (blackbar) {
      blackbar.style.transition = 'none';
      blackbar.style.opacity    = '0';
    }
  }

  function setVisible() {
    nav.style.transition = TRANSITION;
    nav.style.opacity    = '1';
    nav.style.transform  = 'translateY(0)';
    nav.style.maxHeight  = '120px';
    nav.style.overflow   = '';
    if (blackbar) {
      blackbar.style.transition = 'opacity 0.5s ease';
      blackbar.style.opacity    = '1';
    }
  }

  setHidden();

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
