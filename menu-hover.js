(function () {
  'use strict';

  /* ── CSS: card-whipe fill + arrow rotation ── */
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
    '  position: relative;',
    '  z-index: 2;',
    '}',
    /* Hide original inline image panels — replaced by JS panel below */
    '.menu-img-parent { display: none !important; }',
    /* Hide the static right-panel rounded card */
    '.rightpanel { display: none !important; }',
  ].join('\n');
  document.head.appendChild(style);

  /* ── Build right-side image panel ── */
  var panel = document.createElement('div');
  Object.assign(panel.style, {
    position:        'fixed',
    top:             '0',
    right:           '0',
    width:           '50%',
    height:          '100vh',
    backgroundSize:  'cover',
    backgroundPosition: 'center',
    opacity:         '0',
    transition:      'opacity 0.4s ease, background-image 0.01s',
    pointerEvents:   'none',
    zIndex:          '9999',
  });
  document.body.appendChild(panel);

  /* ── Map each nav link to its image URL ── */
  function getImageUrl(link) {
    var imgChild = link.querySelector('.img-child');
    if (!imgChild) return null;
    var bg = window.getComputedStyle(imgChild).backgroundImage;
    // bg is like: url("https://...")
    if (!bg || bg === 'none') return null;
    return bg; // pass the full url(...) value directly
  }

  function init() {
    var links = document.querySelectorAll('.menu-link-parent');
    if (!links.length) return;

    links.forEach(function (link) {
      link.addEventListener('mouseenter', function () {
        var url = getImageUrl(link);
        if (url) {
          panel.style.backgroundImage = url;
          panel.style.opacity = '1';
        }
      });

      link.addEventListener('mouseleave', function () {
        panel.style.opacity = '0';
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
