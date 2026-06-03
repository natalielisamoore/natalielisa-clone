(function () {
  'use strict';

  var CSS = [
    '.squirrel-logo-footer {',
    '  transform-origin: center bottom;',
    '  cursor: pointer;',
    '}',
    '@keyframes squirrel-wiggle {',
    '  0%   { transform: scale(1)    rotate(0deg);   }',
    '  10%  { transform: scale(1.06) rotate(-13deg); }',
    '  22%  { transform: scale(1.07) rotate(11deg);  }',
    '  33%  { transform: scale(1.06) rotate(-9deg);  }',
    '  44%  { transform: scale(1.05) rotate(7deg);   }',
    '  55%  { transform: scale(1.04) rotate(-5deg);  }',
    '  66%  { transform: scale(1.03) rotate(3deg);   }',
    '  77%  { transform: scale(1.02) rotate(-2deg);  }',
    '  88%  { transform: scale(1.01) rotate(1deg);   }',
    '  100% { transform: scale(1)    rotate(0deg);   }',
    '}',
    '.squirrel-logo-footer.wiggling {',
    '  animation: squirrel-wiggle 0.75s cubic-bezier(0.36,0.07,0.19,0.97) forwards;',
    '}',
  ].join('\n');

  function init() {
    var style = document.createElement('style');
    style.textContent = CSS;
    document.head.appendChild(style);

    var squirrel = document.querySelector('.squirrel-logo-footer');
    if (!squirrel) return;

    squirrel.addEventListener('mouseenter', function () {
      squirrel.classList.remove('wiggling');
      void squirrel.offsetWidth; // force reflow so animation restarts
      squirrel.classList.add('wiggling');
    });

    squirrel.addEventListener('animationend', function () {
      squirrel.classList.remove('wiggling');
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
