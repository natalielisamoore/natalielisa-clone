(function () {
  'use strict';

  /* ── Inject styles ── */
  var style = document.createElement('style');
  style.textContent = [
    /* Card-whipe: start at height 0, slide up on hover */
    '.menu-link-parent .card-whipe {',
    '  height: 0%;',
    '  transition: height 0.42s cubic-bezier(0.77,0,0.175,1);',
    '}',
    '.menu-link-parent:hover .card-whipe {',
    '  height: 100%;',
    '}',

    /* Arrow: rotate from ↘ diagonal to → straight right on hover */
    '.menu-link-parent .arrow-menu {',
    '  transition: transform 0.3s ease;',
    '}',
    '.menu-link-parent:hover .arrow-menu {',
    '  transform: rotate(-45deg);',
    '}',

    /* Menu image panels: hidden by default, fade in on hover */
    '.menu-img-parent {',
    '  opacity: 0;',
    '  transition: opacity 0.35s ease;',
    '  pointer-events: none;',
    '}',
    '.menu-link-parent:hover .menu-img-parent {',
    '  opacity: 1;',
    '}',

    /* Menu text and arrow sit on top of the fill */
    '.menu-link-parent .menu-text,',
    '.menu-link-parent .arrow-menu {',
    '  position: relative;',
    '  z-index: 2;',
    '}',
  ].join('\n');

  document.head.appendChild(style);

})();
