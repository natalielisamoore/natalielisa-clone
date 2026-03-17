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

      // High pentatonic — tiny, bright, like a miniature bell
      const notes = [2800, 3200, 3600, 4000, 4500, 5000, 5600];
      const base  = notes[Math.floor(Math.random() * notes.length)];

      // Very short metallic tink — inharmonic partials, fast decay
      const partials = [
        { ratio: 1.0,   vol: 0.18, decay: 0.12 },
        { ratio: 2.756, vol: 0.08, decay: 0.07 },
      ];

      partials.forEach(({ ratio, vol, decay }) => {
        const osc  = audioCtx.createOscillator();
        const gain = audioCtx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(base * ratio, now);

        gain.gain.setValueAtTime(vol, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + decay);

        osc.connect(gain);
        gain.connect(audioCtx.destination);

        osc.start(now);
        osc.stop(now + decay + 0.02);
      });

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

    // Sound — rapid tiny tinks, close together
    if (soundReady && now - lastSoundTime > 40 + Math.random() * 60) {
      playFairyChime();
      lastSoundTime = now;
    }
  });

})();
