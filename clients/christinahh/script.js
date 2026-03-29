// ── Header scroll state ──
const header = document.getElementById('siteHeader');
window.addEventListener('scroll', () => {
  header.classList.toggle('scrolled', window.scrollY > 60);
});

// ── Mobile nav ──
const menuBtn  = document.getElementById('menuBtn');
const navClose = document.getElementById('navClose');
const overlay  = document.getElementById('navOverlay');

menuBtn.addEventListener('click', () => overlay.classList.add('open'));
navClose.addEventListener('click', () => overlay.classList.remove('open'));
overlay.addEventListener('click', e => {
  if (e.target === overlay) overlay.classList.remove('open');
});

// ── Hero image Ken Burns load ──
const heroImage = document.getElementById('heroImage');
if (heroImage) {
  const img = new Image();
  img.src = heroImage.style.backgroundImage.slice(5, -2);
  img.onload = () => heroImage.classList.add('loaded');
}

// ── Scroll-reveal ──
const revealEls = document.querySelectorAll(
  '.section-isee, .section-brave, .section-restore, .section-liberate, .section-story, .content-section, .split-section, .testimonial, .story-card'
);
const io = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'translateY(0)';
      io.unobserve(entry.target);
    }
  });
}, { threshold: 0.08 });

revealEls.forEach(el => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(28px)';
  el.style.transition = 'opacity 0.7s ease, transform 0.7s ease';
  io.observe(el);
});
