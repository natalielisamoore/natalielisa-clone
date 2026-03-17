(function () {
  'use strict';

  const COLORS = ['#f3c8fe', '#deff38', '#ffd6e7', '#ffffff', '#FFD700', '#e8c8fe', '#ffb3de'];
  const CHARS  = ['✦', '✦', '✧', '✦', '·', '✦', '✧'];

  let audioCtx        = null;
  let soundReady      = false;
  let lastSparkleTime = 0;
  let lastSoundTime   = 0;

  /* ── Audio ── */
  async function initAudio() {
    try {
      if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        console.log('[cursor] AudioContext created, state:', audioCtx.state);
      }
      if (audioCtx.state === 'suspended') {
        await audioCtx.resume();
        console.log('[cursor] AudioContext resumed, state:', audioCtx.state);
      }
      soundReady = audioCtx.state === 'running';
      console.log('[cursor] soundReady:', soundReady);
    } catch (e) {
      console.error('[cursor] Audio init error:', e);
    }
  }

  // Try on any interaction
  document.addEventListener('click',      initAudio);
  document.addEventListener('touchstart', initAudio);
  document.addEventListener('keydown',    initAudio);
  document.addEventListener('mousemove',  initAudio, { once: true });

  // Show a subtle "click for sound" hint so the user knows to click
  window.addEventListener('load', () => {
    const hint = document.createElement('div');
    hint.textContent = '🔔 click anywhere for sound';
    hint.style.cssText = `
      position: fixed; bottom: 20px; right: 20px;
      background: rgba(0,0,0,0.55); color: #fff;
      font-size: 12px; padding: 6px 12px; border-radius: 20px;
      z-index: 99999; pointer-events: none;
      opacity: 1; transition: opacity 1s;
    `;
    document.body.appendChild(hint);
    // Fade out after first click
    document.addEventListener('click', () => {
      hint.style.opacity = '0';
      setTimeout(() => hint.remove(), 1000);
    }, { once: true });
    // Also auto-fade after 5s
    setTimeout(() => { hint.style.opacity = '0'; setTimeout(() => hint.remove(), 1000); }, 5000);
  });

  function playFairyChime() {
    if (!soundReady || !audioCtx || audioCtx.state !== 'running') return;
    try {
      const now = audioCtx.currentTime;

      // Fire a scatter of 5–7 tiny glitter micro-tones, each slightly offset in time
      // — like light bouncing off individual glitter particles
      const count = 5 + Math.floor(Math.random() * 3);
      for (let i = 0; i < count; i++) {
        const offset = i * (0.012 + Math.random() * 0.01);   // stagger: ~12–22ms apart
        const freq   = 2400 + Math.random() * 2800;          // 2400–5200 Hz — bright, airy
        const detune = (Math.random() - 0.5) * 180;          // shimmer via slight detuning
        const decay  = 0.12 + Math.random() * 0.18;          // 120–300ms — short sparkle
        const vol    = 0.022 + Math.random() * 0.018;        // soft, 0.022–0.04

        const osc  = audioCtx.createOscillator();
        const gain = audioCtx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + offset);
        // Gentle upward pitch sweep — the "magic wand" glitter rising quality
        osc.frequency.linearRampToValueAtTime(freq * 1.18, now + offset + decay);
        osc.detune.setValueAtTime(detune, now + offset);

        gain.gain.setValueAtTime(0, now + offset);
        gain.gain.linearRampToValueAtTime(vol, now + offset + 0.004);  // instant attack
        gain.gain.exponentialRampToValueAtTime(0.0001, now + offset + decay);

        osc.connect(gain);
        gain.connect(audioCtx.destination);

        osc.start(now + offset);
        osc.stop(now + offset + decay + 0.02);
      }
    } catch (e) {}
  }

  /* ── Styles — default arrow cursor kept, sparkles only ── */
  const styleEl = document.createElement('style');
  styleEl.textContent = `
    .cursor-sparkle {
      position: fixed;
      pointer-events: none;
      z-index: 2147483646;
      transform: translate(-50%, -50%);
      animation: sparkle-out var(--dur) ease-out forwards;
      user-select: none;
      line-height: 1;
    }

    @keyframes sparkle-out {
      0%   { opacity: 1; transform: translate(-50%, -50%) scale(1) rotate(0deg); }
      100% { opacity: 0; transform: translate(calc(-50% + var(--dx)), calc(-50% + var(--dy))) scale(0.05) rotate(var(--rot)); }
    }
  `;
  document.head.appendChild(styleEl);

  /* ── Sparkle factory ── */
  function createSparkle(x, y) {
    const el = document.createElement('span');
    el.className = 'cursor-sparkle';

    const size = (Math.random() * 12 + 6) + 'px';
    const color = COLORS[Math.floor(Math.random() * COLORS.length)];
    const char  = CHARS [Math.floor(Math.random() * CHARS.length)];
    const dur   = (Math.random() * 700 + 800) + 'ms';   // 800–1500ms — longer trail
    const dx    = ((Math.random() - 0.5) * 50) + 'px';
    const dy    = (-(Math.random() * 60 + 20)) + 'px';  // 20–80px upward drift
    const rot   = ((Math.random() * 240) - 120) + 'deg';
    const ox    = (Math.random() - 0.5) * 16;
    const oy    = (Math.random() - 0.5) * 16;

    el.textContent = char;
    el.style.cssText = `
      left: ${x + ox}px;
      top:  ${y + oy}px;
      font-size: ${size};
      color: ${color};
      text-shadow: 0 0 6px ${color}, 0 0 12px ${color};
      --dur: ${dur};
      --dx:  ${dx};
      --dy:  ${dy};
      --rot: ${rot};
    `;

    document.body.appendChild(el);
    setTimeout(() => el.remove(), parseFloat(dur) + 50);
  }

  /* ── Mouse tracking ── */
  document.addEventListener('mousemove', function (e) {
    const x   = e.clientX;
    const y   = e.clientY;
    const now = Date.now();

    // Sparkles — fire every ~25ms
    if (now - lastSparkleTime > 25) {
      const count = Math.floor(Math.random() * 2) + 1;
      for (let i = 0; i < count; i++) createSparkle(x, y);
      lastSparkleTime = now;
    }

    // Sound — tight clusters following the mouse
    if (soundReady && now - lastSoundTime > 18 + Math.random() * 25) {
      playFairyChime();
      lastSoundTime = now;
    }
  });

})();
