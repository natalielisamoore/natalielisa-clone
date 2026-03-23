(function () {
  'use strict';

  /* ── Image URL map by .img-child class ── */
  var IMG_URLS = {
    'img-1': 'https://cdn.prod.website-files.com/65c5586c812f9f3723ee3036/663ac00c0b2402ef76fe12be_natalie-in-spaceWEB.jpg',
    'img-2': 'https://cdn.prod.website-files.com/65c5586c812f9f3723ee3036/66e0f821b8d5a65db0ab4b74_natalie-squirrel-logo-cloud1.jpg',
    'img-3': 'https://cdn.prod.website-files.com/65c5586c812f9f3723ee3036/66399d9e7a6de75c583538d1_RAVEN-NEON.png',
    'img-4': 'https://cdn.prod.website-files.com/65c5586c812f9f3723ee3036/664d1ad8a2aa4200ff4cd710_DTS_Please_Do_Not_Disturb_by_Fanette_Guilloud_25.jpg',
    'img-5': 'https://cdn.prod.website-files.com/65c5586c812f9f3723ee3036/66e39d861f894464c563d2db_natalie-edit-twil7.web.jpg',
  };

  /* ── Styles ── */
  var style = document.createElement('style');
  style.textContent = [
    /* Clip the chartreuse wipe to the link row */
    '.menu-link-parent {',
    '  overflow: hidden;',
    '}',
    /* Chartreuse wipe: slides up from bottom */
    '.menu-link-parent .card-whipe {',
    '  height: 0%;',
    '  transition: height 0.42s cubic-bezier(0.77,0,0.175,1);',
    '}',
    '.menu-link-parent:hover .card-whipe {',
    '  height: 100%;',
    '}',
    /* Arrow rotation */
    '.menu-link-parent .arrow-menu {',
    '  transition: transform 0.3s ease;',
    '}',
    '.menu-link-parent:hover .arrow-menu {',
    '  transform: rotate(-45deg);',
    '}',
    /* Keep text on top of the wipe */
    '.menu-link-parent .menu-text,',
    '.menu-link-parent .arrow-menu {',
    '  position: relative; z-index: 2;',
    '}',
    /* Hide original image panels — replaced by JS panel */
    '.menu-img-parent { display: none !important; }',
    '.rightpanel      { display: none !important; }',
  ].join('\n');
  document.head.appendChild(style);

  /* ── Right-side full-bleed image panel ── */
  var panel = document.createElement('div');
  Object.assign(panel.style, {
    position:           'fixed',
    top:                '0',
    right:              '0',
    width:              '50%',
    height:             '100vh',
    backgroundSize:     'cover',
    backgroundPosition: 'center',
    backgroundRepeat:   'no-repeat',
    opacity:            '0',
    transition:         'opacity 0.4s ease',
    pointerEvents:      'none',
    zIndex:             '9999',
  });
  document.body.appendChild(panel);

  function init() {
    var links  = document.querySelectorAll('.menu-link-parent');
    var menuEl = document.querySelector('.menu-parent');
    if (!links.length) return;

    links.forEach(function (link) {
      /* Find which img-child class this link uses */
      var imgChild = link.querySelector('.img-child');
      var imgKey   = null;
      if (imgChild) {
        imgChild.classList.forEach(function (cls) {
          if (IMG_URLS[cls]) imgKey = cls;
        });
      }

      link.addEventListener('mouseenter', function () {
        if (imgKey) {
          panel.style.backgroundImage = 'url("' + IMG_URLS[imgKey] + '")';
          panel.style.opacity = '1';
        }
      });

      link.addEventListener('mouseleave', function () {
        panel.style.opacity = '0';
      });
    });

    /* Hide panel whenever menu closes */
    if (menuEl) {
      new MutationObserver(function () {
        if (menuEl.style.display === 'none' || menuEl.style.display === '') {
          panel.style.opacity = '0';
        }
      }).observe(menuEl, { attributes: true, attributeFilter: ['style'] });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
