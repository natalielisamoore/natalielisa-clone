(function () {
  'use strict';

  const COLORS = ['#f3c8fe', '#deff38', '#ffd6e7', '#ffffff', '#FFD700', '#e8c8fe', '#ffb3de'];
  const CHARS  = ['✦', '✦', '✧', '✦', '·', '✦', '✧'];

  let audioCtx        = null;
  let soundReady      = false;
  let lastSparkleTime = 0;
  let lastSoundTime   = 0;

  /* ── Audio (initialised on first click to satisfy browser autoplay policy) ── */
  function initAudio() {
    if (audioCtx) return;
    try {
      audioCtx   = new (window.AudioContext || window.webkitAudioContext)();
      soundReady = true;
    } catch (e) {}
  }

  document.addEventListener('click',    initAudio, { once: true });
  document.addEventListener('keydown',  initAudio, { once: true });
  document.addEventListener('touchstart', initAudio, { once: true });

  function playTinkle() {
    if (!soundReady || !audioCtx) return;
    try {
      const now  = audioCtx.currentTime;
      const freq = 1200 + Math.random() * 1800;   // 1200–3000 Hz — bright and airy

      const osc       = audioCtx.createOscillator();
      const gain      = audioCtx.createGain();
      const delay     = audioCtx.createDelay(0.6);
      const delayGain = audioCtx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);
      osc.frequency.exponentialRampToValueAtTime(freq * 0.75, now + 0.25);

      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.07, now + 0.008);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

      delay.delayTime.value = 0.12;
      delayGain.gain.value  = 0.25;          // echo at 25% volume

      osc.connect(gain);
      gain.connect(audioCtx.destination);
      gain.connect(delay);
      delay.connect(delayGain);
      delayGain.connect(audioCtx.destination);

      osc.start(now);
      osc.stop(now + 0.6);
    } catch (e) {}
  }

  /* ── Inject styles ── */
  const styleEl = document.createElement('style');
  styleEl.textContent = `
    *, *::before, *::after { cursor: none !important; }

    .cursor-dot {
      position: fixed;
      width: 7px;
      height: 7px;
      background: #f3c8fe;
      border-radius: 50%;
      pointer-events: none;
      z-index: 2147483647;
      transform: translate(-50%, -50%);
      box-shadow: 0 0 6px 2px rgba(243, 200, 254, 0.7);
      transition: opacity 0.3s;
    }

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
      0%   { opacity: 1;   transform: translate(-50%, -50%) scale(1)   rotate(0deg); }
      100% { opacity: 0;   transform: translate(calc(-50% + var(--dx)), calc(-50% + var(--dy))) scale(0.1) rotate(var(--rot)); }
    }
  `;
  document.head.appendChild(styleEl);

  /* ── Cursor dot ── */
  const dot = document.createElement('div');
  dot.className = 'cursor-dot';
  document.body.appendChild(dot);

  document.addEventListener('mouseleave', () => { dot.style.opacity = '0'; });
  document.addEventListener('mouseenter', () => { dot.style.opacity = '1'; });

  /* ── Sparkle factory ── */
  function createSparkle(x, y) {
    const el    = document.createElement('span');
    el.className = 'cursor-sparkle';

    const size  = (Math.random() * 10 + 6) + 'px';
    const color = COLORS[Math.floor(Math.random() * COLORS.length)];
    const char  = CHARS [Math.floor(Math.random() * CHARS.length)];
    const dur   = (Math.random() * 500 + 400) + 'ms';
    const dx    = ((Math.random() - 0.5) * 44) + 'px';
    const dy    = (-(Math.random() * 32 + 8))   + 'px';   // always drift upward
    const rot   = ((Math.random() * 180) - 90)  + 'deg';
    const ox    = (Math.random() - 0.5) * 14;
    const oy    = (Math.random() - 0.5) * 14;

    el.textContent = char;
    el.style.cssText = `
      left: ${x + ox}px;
      top:  ${y + oy}px;
      font-size: ${size};
      color: ${color};
      text-shadow: 0 0 5px ${color};
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

    dot.style.left = x + 'px';
    dot.style.top  = y + 'px';

    // Sparkles — fire every ~28 ms
    if (now - lastSparkleTime > 28) {
      const count = Math.floor(Math.random() * 2) + 1;
      for (let i = 0; i < count; i++) createSparkle(x, y);
      lastSparkleTime = now;
    }

    // Sound — throttled, randomised interval so it feels organic
    if (soundReady && now - lastSoundTime > 120 + Math.random() * 180) {
      playTinkle();
      lastSoundTime = now;
    }
  });

})();
