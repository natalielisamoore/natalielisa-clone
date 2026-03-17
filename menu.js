(function () {
  var menu      = document.querySelector('.menu-parent');
  var burger    = document.querySelector('.hamburber');
  var panel     = document.querySelector('.menu-panel-left');
  var rightPan  = document.querySelector('.rightpanel');
  var topLine   = document.querySelector('.burgerline.top');
  var midLine   = document.querySelector('.burgerline.middle');
  var btmLine   = document.querySelector('.burgerline.bottom');

  if (!burger || !menu) return;

  var isOpen = false;

  // Set up transition styles — don't override the display:none yet
  menu.style.transition      = 'opacity 0.4s ease';
  panel.style.transition     = 'transform 0.5s cubic-bezier(0.77,0,0.175,1)';
  rightPan.style.transition  = 'opacity 0.35s ease 0.25s';
  [topLine, midLine, btmLine].forEach(function (el) {
    if (el) el.style.transition = 'transform 0.3s ease, opacity 0.3s ease';
  });

  function openMenu() {
    // Force menu on top regardless of DOM order (homepage has elements above it)
    menu.style.position  = 'fixed';
    menu.style.zIndex    = '99999';
    menu.style.top       = '0';
    menu.style.left      = '0';
    menu.style.width     = '100%';
    menu.style.height    = '100%';

    // Prepare hidden state, then make visible before transition
    menu.style.opacity   = '0';
    panel.style.transform = 'translateX(-100%)';
    rightPan.style.opacity = '0';
    menu.style.display   = 'flex';

    // Force reflow so transitions fire
    menu.offsetHeight;

    menu.style.opacity     = '1';
    panel.style.transform  = 'translateX(0)';
    rightPan.style.opacity = '1';

    // Burger → X
    if (topLine) topLine.style.transform = 'translateY(7px) rotate(45deg)';
    if (midLine) midLine.style.opacity   = '0';
    if (btmLine) btmLine.style.transform = 'translateY(-7px) rotate(-45deg)';

    document.body.style.overflow = 'hidden';
    isOpen = true;
  }

  function closeMenu() {
    menu.style.opacity     = '0';
    panel.style.transform  = 'translateX(-100%)';
    rightPan.style.opacity = '0';

    // X → Burger
    if (topLine) topLine.style.transform = '';
    if (midLine) midLine.style.opacity   = '1';
    if (btmLine) btmLine.style.transform = '';

    document.body.style.overflow = '';
    isOpen = false;

    setTimeout(function () { menu.style.display = 'none'; }, 450);
  }

  burger.addEventListener('click', function () {
    isOpen ? closeMenu() : openMenu();
  });

  // ESC closes
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && isOpen) closeMenu();
  });

  // Clicking a menu link closes (after a short delay so navigation works)
  document.querySelectorAll('.menu-link-parent').forEach(function (link) {
    link.addEventListener('click', function () {
      setTimeout(closeMenu, 150);
    });
  });
})();
