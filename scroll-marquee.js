(function () {
  'use strict';

  const lineOne = document.querySelector('.scroll-txt.one');
  const lineTwo = document.querySelector('.scroll-txt.two');
  if (!lineOne || !lineTwo) return;

  /* ── Config ── */
  const SPEED = 0.22; // px of translate per px scrolled (subtle)

  /* ── State ── */
  let currentOne = 0;
  let currentTwo = 0;
  let targetOne  = 0;
  let targetTwo  = 0;
  let ticking    = false;

  function lerp(a, b, t) { return a + (b - a) * t; }

  function onScroll() {
    const scrollY = window.scrollY || window.pageYOffset;
    targetOne =  scrollY * SPEED;  // rightward
    targetTwo = -scrollY * SPEED;  // leftward

    if (!ticking) {
      ticking = true;
      requestAnimationFrame(update);
    }
  }

  function update() {
    ticking = false;
    currentOne = lerp(currentOne, targetOne, 0.08);
    currentTwo = lerp(currentTwo, targetTwo, 0.08);

    lineOne.style.transform = `translateX(${currentOne.toFixed(2)}px)`;
    lineTwo.style.transform = `translateX(${currentTwo.toFixed(2)}px)`;

    // Keep animating until settled
    if (Math.abs(currentOne - targetOne) > 0.5 || Math.abs(currentTwo - targetTwo) > 0.5) {
      ticking = true;
      requestAnimationFrame(update);
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });

  // Set initial position on load
  onScroll();
})();
