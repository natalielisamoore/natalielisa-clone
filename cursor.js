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

      // ── Psychoacoustic design ─────────────────────────────────────────────
      //
      // 1. SPARKLE SWEET SPOT (3000–6000 Hz):
      //    Equal-loudness contours (Fletcher–Munson) show peak ear sensitivity
      //    at 3–6 kHz. Pitches here register as "bright" and "airy." Above
      //    ~7 kHz the character shifts to hiss; below ~2.5 kHz it feels heavy.
      //    All fundamentals here are anchored in 2800–5600 Hz.
      //
      // 2. CONSONANT PITCH POOL (pentatonic, not fully random):
      //    Fully random frequencies create dissonant intervals the brain codes
      //    as "glitch." Real fairy-wand SFX (Tinkerbell, film/game audio) use
      //    clusters approximating a major or pentatonic chord so that any random
      //    subset sounds pleasant. We use C-major pentatonic from C5→C7, shifted
      //    up ×2.83 (~1.5 octaves) to land in the sparkle band.
      const SCALE_HZ = [523,659,784,880,988,1047,1319,1568,1760,1976,2093,2637,3136]
                         .map(f => f * 2.83);
      const POOL = SCALE_HZ.filter(f => f >= 2800 && f <= 7400);
      // → approx [2796, 3322, 3738, 4184, 4694, 5596, 7400] — all in the sweet band

      // 3. INHARMONIC PARTIALS (Euler–Bernoulli struck-bar ratios):
      //    Real tiny bells / glockenspiels have overtones at 1 : 2.756 : 5.404.
      //    These ratios are irrational relative to the fundamental, producing the
      //    glassy shimmer of real struck metal rather than a clean harmonic tone.
      //    Adding them eliminates the "pure sine = synthesizer" cue immediately.
      const PARTIAL_RATIOS  = [1, 2.756, 5.404];
      const PARTIAL_WEIGHTS = [1.0, 0.28, 0.09];

      // 4. NOISE TRANSIENT AT ATTACK:
      //    The single largest perceptual gap between a real struck surface and an
      //    electronic oscillator is a broadband noise burst at onset (< 5 ms).
      //    The auditory cortex uses this transient to classify a sound as physical.
      //    Without it, even perfectly shaped sine envelopes register as synthetic.

      // 5. SHIMMER TAIL (highpass feedback delay):
      //    A 28 ms feedback delay filtered above 3200 Hz creates perceived depth —
      //    the "fairy dust settling" quality — without the cost of a full IR reverb.

      // ── Airy Cathedral reverb: three buses at different delay times ──────
      // Bus A: short pre-delay, high feedback (~18s tail)
      const dA = audioCtx.createDelay(0.15);
      dA.delayTime.value = 0.035;
      const fbA = audioCtx.createGain(); fbA.gain.value = 0.90;
      const hpA = audioCtx.createBiquadFilter(); hpA.type = 'highpass'; hpA.frequency.value = 3200;
      const outA = audioCtx.createGain(); outA.gain.value = 0.45;
      dA.connect(hpA); hpA.connect(outA); outA.connect(audioCtx.destination);
      dA.connect(fbA); fbA.connect(dA);

      // Bus B: mid delay, spacious hall layer
      const dB = audioCtx.createDelay(0.20);
      dB.delayTime.value = 0.095;
      const fbB = audioCtx.createGain(); fbB.gain.value = 0.82;
      const hpB = audioCtx.createBiquadFilter(); hpB.type = 'highpass'; hpB.frequency.value = 2400;
      const outB = audioCtx.createGain(); outB.gain.value = 0.28;
      dB.connect(hpB); hpB.connect(outB); outB.connect(audioCtx.destination);
      dB.connect(fbB); fbB.connect(dB);

      // Bus C: long pre-delay — "back wall" of the room
      const dC = audioCtx.createDelay(0.30);
      dC.delayTime.value = 0.18;
      const fbC = audioCtx.createGain(); fbC.gain.value = 0.75;
      const lpC = audioCtx.createBiquadFilter(); lpC.type = 'lowpass'; lpC.frequency.value = 4500;
      const outC = audioCtx.createGain(); outC.gain.value = 0.18;
      dC.connect(lpC); lpC.connect(outC); outC.connect(audioCtx.destination);
      dC.connect(fbC); fbC.connect(dC);

      setTimeout(() => {
        try {
          dA.disconnect(); fbA.disconnect(); hpA.disconnect(); outA.disconnect();
          dB.disconnect(); fbB.disconnect(); hpB.disconnect(); outB.disconnect();
          dC.disconnect(); fbC.disconnect(); lpC.disconnect(); outC.disconnect();
        } catch (_) {}
      }, 20000);

      // ── Single isolated ping (cathedral — no clusters) ───────────────────
      const pingCount = 1;

      for (let i = 0; i < pingCount; i++) {
        const offset    = 0;
        const decay     = 0.30 + Math.random() * 0.20;          // 300–500 ms bell tail
        const masterVol = 0.014 + Math.random() * 0.008;        // soft: 0.014–0.022

        // Random consonant fundamental from the sparkle-band pentatonic pool
        const fund = POOL[Math.floor(Math.random() * POOL.length)];

        // Per-ping envelope — shared across all partials of this ping
        const pingGain = audioCtx.createGain();
        pingGain.gain.setValueAtTime(0, now + offset);
        // Attack < 1.2 ms — struck bells have essentially instantaneous onset;
        // no upward pitch bend (bells droop downward as the bar cools and stiffens)
        pingGain.gain.linearRampToValueAtTime(masterVol, now + offset + 0.0012);
        pingGain.gain.exponentialRampToValueAtTime(0.00010, now + offset + decay);

        pingGain.connect(audioCtx.destination);   // dry path
        pingGain.connect(dA);                      // wet path → reverb buses
        pingGain.connect(dB);
        pingGain.connect(dC);

        // ── Inharmonic sine partials ────────────────────────────────────────
        for (let p = 0; p < PARTIAL_RATIOS.length; p++) {
          const pFreq = fund * PARTIAL_RATIOS[p];
          if (pFreq > 20000) continue; // skip ultrasonic content

          const osc         = audioCtx.createOscillator();
          const partialGain = audioCtx.createGain();

          osc.type = 'sine';
          osc.frequency.setValueAtTime(pFreq, now + offset);
          // ±12 cents micro-detune per partial — organic shimmer, not pitch wander
          osc.detune.setValueAtTime((Math.random() - 0.5) * 24, now + offset);

          partialGain.gain.setValueAtTime(PARTIAL_WEIGHTS[p], now + offset);
          osc.connect(partialGain);
          partialGain.connect(pingGain);

          osc.start(now + offset);
          osc.stop(now + offset + decay + 0.04);
        }

        // ── Noise transient (physical strike simulation) ───────────────────
        // 3 ms burst of highpass-filtered white noise at attack onset.
        // This is the broadband "click" cue the auditory cortex uses to classify
        // a sound as a real physical impact rather than an electronic oscillator.
        const nLen  = Math.ceil(audioCtx.sampleRate * 0.003);
        const nBuf  = audioCtx.createBuffer(1, nLen, audioCtx.sampleRate);
        const nData = nBuf.getChannelData(0);
        for (let s = 0; s < nLen; s++) nData[s] = Math.random() * 2 - 1;

        const nSrc  = audioCtx.createBufferSource();
        nSrc.buffer = nBuf;

        const nHP   = audioCtx.createBiquadFilter();
        nHP.type    = 'highpass';
        nHP.frequency.value = 4200; // pass only the bright transient content

        const nGain = audioCtx.createGain();
        nGain.gain.setValueAtTime(0, now + offset);
        nGain.gain.linearRampToValueAtTime(masterVol * 0.5, now + offset + 0.0005);
        nGain.gain.exponentialRampToValueAtTime(0.00010, now + offset + 0.003);

        nSrc.connect(nHP);
        nHP.connect(nGain);
        nGain.connect(audioCtx.destination);

        nSrc.start(now + offset);
        nSrc.stop(now + offset + 0.005);
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
  });

  /* ── Sound on hover over Featured Work section only ── */
  var workSection = document.querySelector('.featured-work-new');
  if (workSection) {
    workSection.addEventListener('mousemove', function () {
      var now = Date.now();
      if (soundReady && now - lastSoundTime > 150 + Math.random() * 60) {
        playFairyChime();
        lastSoundTime = now;
      }
    });
  }

})();
