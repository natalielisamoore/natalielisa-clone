(function () {
  'use strict';

  /* ── Card-whipe + arrow rotation styles ── */
  var style = document.createElement('style');
  style.textContent = [
    '.menu-link-parent .card-whipe {',
    '  height: 0%;',
    '  transition: height 0.42s cubic-bezier(0.77,0,0.175,1);',
    '}',
    '.menu-link-parent:hover .card-whipe {',
    '  height: 100%;',
    '}',
    '.menu-link-parent .arrow-menu {',
    '  transition: transform 0.3s ease;',
    '}',
    '.menu-link-parent:hover .arrow-menu {',
    '  transform: rotate(-45deg);',
    '}',
    '.menu-text, .arrow-menu {',
    '  position: relative; z-index: 2;',
    '}',
  ].join('\n');
  document.head.appendChild(style);

  /* ── Full right-side image panel ── */
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
    var links   = document.querySelectorAll('.menu-link-parent');
    var menuEl  = document.querySelector('.menu-parent');
    if (!links.length) return;

    /* ── Read image URLs BEFORE hiding anything ── */
    var urlMap = new Map();
    links.forEach(function (link) {
      var imgChild = link.querySelector('.img-child');
      if (!imgChild) return;
      var bg = window.getComputedStyle(imgChild).backgroundImage;
      if (bg && bg !== 'none') urlMap.set(link, bg);
    });

    /* ── NOW hide the original image panels + static right card ── */
    var hideStyle = document.createElement('style');
    hideStyle.textContent = [
      '.menu-img-parent { display: none !important; }',
      '.rightpanel      { display: none !important; }',
    ].join('\n');
    document.head.appendChild(hideStyle);

    /* ── Hover events ── */
    links.forEach(function (link) {
      link.addEventListener('mouseenter', function () {
        var url = urlMap.get(link);
        if (url) {
          panel.style.backgroundImage = url;
          panel.style.opacity = '1';
        }
      });
      link.addEventListener('mouseleave', function () {
        panel.style.opacity = '0';
      });
    });

    /* ── Hide panel when menu closes ── */
    if (menuEl) {
      var observer = new MutationObserver(function () {
        if (menuEl.style.display === 'none' || menuEl.style.display === '') {
          panel.style.opacity = '0';
        }
      });
      observer.observe(menuEl, { attributes: true, attributeFilter: ['style'] });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
