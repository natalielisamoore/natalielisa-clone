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
    /* Make menu-parent background transparent so body-level image panel shows through */
    '.menu-parent     { background-color: transparent !important; }',
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
  var FALLBACK = IMG['img-1'];
  var SLIDE    = 'transform 0.5s cubic-bezier(0.77,0,0.175,1)';

  /* Panel starts off-screen to the right, slides in like a curtain */
  var panel = document.createElement('div');
  panel.style.cssText = [
    'position:fixed',
    'top:0',
    'right:0',
    'width:50%',
    'height:100vh',
    'background-color:#faf7f2',
    'background-size:cover',
    'background-position:center',
    'background-repeat:no-repeat',
    'transform:translateX(100%)',
    'transition:' + SLIDE,
    'pointer-events:none',
    'z-index:100000',
  ].join(';');
  document.body.appendChild(panel);

  function init() {
    var links  = document.querySelectorAll('.menu-link-parent');
    var menuEl = document.querySelector('.menu-parent');
    if (!links.length) return;

    links.forEach(function (link) {
      var imgChild = link.querySelector('.img-child');
      var imgKey   = null;
      if (imgChild) {
        imgChild.classList.forEach(function (cls) {
          if (IMG[cls]) imgKey = cls;
        });
      }

      link.addEventListener('mouseenter', function () {
        if (imgKey) panel.style.backgroundImage = 'url("' + IMG[imgKey] + '")';
      });
      link.addEventListener('mouseleave', function () {
        panel.style.backgroundImage = 'url("' + FALLBACK + '")';
      });
    });

    /* Mirror the menu open/close using opacity as the timing signal */
    var wasOpen = false;
    if (menuEl) {
      new MutationObserver(function () {
        var o = menuEl.style.opacity;
        var d = menuEl.style.display;

        if (d === 'flex' && o === '1' && !wasOpen) {
          /* Menu just finished opening — slide right panel in */
          wasOpen = true;
          panel.style.backgroundImage = 'url("' + FALLBACK + '")';
          panel.style.transform = 'translateX(0)';
        } else if (o === '0' && wasOpen) {
          /* Menu starting to close — slide right panel out simultaneously */
          wasOpen = false;
          panel.style.transform = 'translateX(100%)';
        } else if (d === 'none') {
          wasOpen = false;
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
