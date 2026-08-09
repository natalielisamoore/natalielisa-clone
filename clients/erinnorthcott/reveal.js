/* reveal.js — fade-up on scroll, the night-sky audio player, and the gold
   starline that fades in slowly as the audio plays. */
(function () {

  /* ---- fade-up on scroll ------------------------------------------------ */
  const revealables = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      }
    }, { threshold: 0.18, rootMargin: '0px 0px -8% 0px' });
    revealables.forEach((el) => io.observe(el));
  } else {
    revealables.forEach((el) => el.classList.add('in'));
  }

  /* ---- audio player ----------------------------------------------------- */
  const root = document.querySelector('[data-player]');
  if (!root) return;

  const audio    = root.querySelector('[data-audio]');
  const btn      = root.querySelector('[data-play]');
  const track    = root.querySelector('[data-track]');
  const progress = root.querySelector('[data-progress]');
  const curEl    = root.querySelector('[data-current]');
  const durEl    = root.querySelector('[data-duration]');
  const starline = document.getElementById('starline');

  const fmt = (s) => {
    if (!isFinite(s)) return '0:00';
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60).toString().padStart(2, '0');
    return `${m}:${sec}`;
  };

  audio.addEventListener('loadedmetadata', () => { durEl.textContent = fmt(audio.duration); });

  btn.addEventListener('click', () => {
    if (audio.paused) audio.play(); else audio.pause();
  });

  audio.addEventListener('play', () => {
    root.classList.add('is-playing');
    btn.setAttribute('aria-label', 'Pause');
    if (starline) starline.classList.add('in');   // the gold line begins its slow rise
  });
  audio.addEventListener('pause', () => {
    root.classList.remove('is-playing');
    btn.setAttribute('aria-label', 'Play');
  });

  audio.addEventListener('timeupdate', () => {
    const pct = audio.duration ? (audio.currentTime / audio.duration) * 100 : 0;
    progress.style.width = pct + '%';
    curEl.textContent = fmt(audio.currentTime);
  });
  audio.addEventListener('ended', () => { root.classList.remove('is-playing'); progress.style.width = '0%'; });

  const seek = (clientX) => {
    const r = track.getBoundingClientRect();
    const ratio = Math.min(Math.max((clientX - r.left) / r.width, 0), 1);
    if (audio.duration) audio.currentTime = ratio * audio.duration;
  };
  track.addEventListener('click', (e) => seek(e.clientX));
})();
