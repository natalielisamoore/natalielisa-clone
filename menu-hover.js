(function () {
  'use strict';

  /* ── Styles: card-whipe, arrow rotation ── */
  var style = document.createElement('style');
  style.textContent = [
    /* Clip the chartreuse wipe to each link row */
    '.menu-link-parent { overflow: hidden; }',

    /* Chartreuse wipe slides up from bottom on hover */
    '.menu-link-parent .card-whipe {',
    '  height: 0%;',
    '  transition: height 0.42s cubic-bezier(0.77,0,0.175,1);',
    '}',
    '.menu-link-parent:hover .card-whipe { height: 100%; }',

    /* Arrow rotates on hover */
    '.menu-link-parent .arrow-menu { transition: transform 0.3s ease; }',
    '.menu-link-parent:hover .arrow-menu { transform: rotate(-45deg); }',

    /* Text + arrow sit above the fill */
    '.menu-link-parent .menu-text, .menu-link-parent .arrow-menu {',
    '  position: relative; z-index: 2;',
    '}',

    /* Hide original image panels — position:fixed fails inside transformed ancestor */
    '.menu-img-parent { display: none !important; }',
    '.rightpanel      { display: none !important; }',
  ].join('\n');
  document.head.appendChild(style);

  /* ── Hardcoded image URLs (from style.css) ── */
  var IMG = {
    'img-1': 'https://cdn.prod.website-files.com/65c5586c812f9f3723ee3036/663ac00c0b2402ef76fe12be_natalie-in-spaceWEB.jpg',
    'img-2': 'https://cdn.prod.website-files.com/65c5586c812f9f3723ee3036/66e0f821b8d5a65db0ab4b74_natalie-squirrel-logo-cloud1.jpg',
    'img-3': 'https://cdn.prod.website-files.com/65c5586c812f9f3723ee3036/66399d9e7a6de75c583538d1_RAVEN-NEON.png',
    'img-4': 'https://cdn.prod.website-files.com/65c5586c812f9f3723ee3036/664d1ad8a2aa4200ff4cd710_DTS_Please_Do_Not_Disturb_by_Fanette_Guilloud_25.jpg',
    'img-5': 'https://cdn.prod.website-files.com/65c5586c812f9f3723ee3036/66e39d861f894464c563d2db_natalie-edit-twil7.web.jpg',
  };

  /* ── Right-side panel lives on body, outside the transformed menu-parent ── */
  var panel = document.createElement('div');
  panel.style.cssText = [
    'position:fixed',
    'top:0',
    'right:0',
    'width:50%',
    'height:100vh',
    'background-size:cover',
    'background-position:center',
    'background-repeat:no-repeat',
    'opacity:0',
    'transition:opacity 0.35s ease',
    'pointer-events:none',
    'z-index:9999',
    'visibility:hidden',
  ].join(';');
  document.body.appendChild(panel);

  var hideTimer = null;

  function showPanel(url) {
    clearTimeout(hideTimer);
    panel.style.visibility = 'visible';
    panel.style.backgroundImage = 'url("' + url + '")';
    panel.style.opacity = '1';
  }

  function hidePanel() {
    panel.style.opacity = '0';
    hideTimer = setTimeout(function () {
      panel.style.visibility = 'hidden';
    }, 400);
  }

  function init() {
    var links  = document.querySelectorAll('.menu-link-parent');
    var menuEl = document.querySelector('.menu-parent');
    if (!links.length) return;

    links.forEach(function (link) {
      /* Detect which img-child class this link uses */
      var imgChild = link.querySelector('.img-child');
      var imgKey   = null;
      if (imgChild) {
        imgChild.classList.forEach(function (cls) {
          if (IMG[cls]) imgKey = cls;
        });
      }

      link.addEventListener('mouseenter', function () {
        if (imgKey) showPanel(IMG[imgKey]);
      });
      link.addEventListener('mouseleave', hidePanel);
    });

    /* Also hide panel when menu closes */
    if (menuEl) {
      new MutationObserver(function () {
        var d = menuEl.style.display;
        if (d === 'none' || d === '') hidePanel();
      }).observe(menuEl, { attributes: true, attributeFilter: ['style'] });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
