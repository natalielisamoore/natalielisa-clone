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
    if (audioCtx) {
      // Resume if suspended (some browsers start suspended)
      if (audioCtx.state === 'suspended') await audioCtx.resume();
      soundReady = audioCtx.state === 'running';
      return;
    }
    try {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      if (audioCtx.state === 'suspended') await audioCtx.resume();
      soundReady = audioCtx.state === 'running';
    } catch (e) {}
  }

  // Try on any interaction
  document.addEventListener('click',     initAudio);
  document.addEventListener('touchstart',initAudio);
  document.addEventListener('keydown',   initAudio);
  document.addEventListener('mousemove', initAudio, { once: true });

  function playTinkle() {
    if (!soundReady || !audioCtx || audioCtx.state !== 'running') return;
    try {
      const now  = audioCtx.currentTime;
      const freq = 1400 + Math.random() * 1600;   // 1400–3000 Hz — bright, airy

      const osc       = audioCtx.createOscillator();
      const gain      = audioCtx.createGain();
      const delay     = audioCtx.createDelay(0.6);
      const delayGain = audioCtx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);
      osc.frequency.exponentialRampToValueAtTime(freq * 0.6, now + 0.3);

      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.09, now + 0.005);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);

      delay.delayTime.value = 0.1;
      delayGain.gain.value  = 0.3;

      osc.connect(gain);
      gain.connect(audioCtx.destination);
      gain.connect(delay);
      delay.connect(delayGain);
      delayGain.connect(audioCtx.destination);

      osc.start(now);
      osc.stop(now + 0.7);
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

    // Sound — organic randomised timing
    if (soundReady && now - lastSoundTime > 100 + Math.random() * 160) {
      playTinkle();
      lastSoundTime = now;
    }
  });

})();
