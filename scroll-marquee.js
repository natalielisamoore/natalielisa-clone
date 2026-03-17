(function () {
  'use strict';

  const lineOne = document.querySelector('.scroll-txt.one');
  const lineTwo = document.querySelector('.scroll-txt.two');
  if (!lineOne || !lineTwo) return;

  const section = lineOne.closest('.scrolling-services');
  if (!section) return;

  /* ── Config ── */
  const MAX_TRAVEL = 18; // px max shift in either direction

  /* ── State ── */
  let currentOne = 0;
  let currentTwo = 0;
  let targetOne  = 0;
  let targetTwo  = 0;
  let ticking    = false;

  function lerp(a, b, t) { return a + (b - a) * t; }

  function onScroll() {
    const rect   = section.getBoundingClientRect();
    const vh     = window.innerHeight;
    const total  = vh + rect.height;

    // progress: 0 when section bottom enters viewport, 1 when section top leaves
    const progress = 1 - (rect.bottom / total);
    const clamped  = Math.max(0, Math.min(1, progress));

    // centre at 0.5 so text starts neutral and moves out from centre
    const offset = (clamped - 0.5) * 2 * MAX_TRAVEL;

    targetOne =  offset;
    targetTwo = -offset;

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

    if (Math.abs(currentOne - targetOne) > 0.3 || Math.abs(currentTwo - targetTwo) > 0.3) {
      ticking = true;
      requestAnimationFrame(update);
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
})();
