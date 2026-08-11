/* sound.js — Daniel's footage plays silent, because every browser blocks
   autoplay with sound. The viewer opts in.

   The control only appears if the clip actually carries audio, so the site
   never offers a switch that does nothing:
     data-has-audio="false"  → never shown (what the current silent capture is)
     data-has-audio="true"   → always shown
     attribute absent        → work it out at runtime, and when the browser
                               gives no answer, show it and let them try. */
(function () {
  const vid = document.querySelector('.filmframe__vid');
  const btn = document.querySelector('.filmframe__sound');
  if (!vid || !btn) return;

  const label = btn.querySelector('.filmframe__sound-label');
  const declared = vid.dataset.hasAudio;

  /* true / false / null when the browser won't say */
  function detect() {
    if (typeof vid.mozHasAudio === 'boolean') return vid.mozHasAudio;
    if (vid.audioTracks && typeof vid.audioTracks.length === 'number') {
      return vid.audioTracks.length > 0;
    }
    if (vid.webkitAudioDecodedByteCount > 0) return true;
    return null;
  }

  function offer() {
    if (btn.hidden === false) return;
    if (detect() === false) return;          // definitively silent
    btn.hidden = false;
  }

  function paint() {
    const on = !vid.muted;
    btn.setAttribute('aria-pressed', String(on));
    btn.classList.toggle('is-on', on);
    label.textContent = on ? 'Sound on' : 'Sound off';
    btn.setAttribute('aria-label', on ? 'Turn the film’s sound off' : 'Turn the film’s sound on');
  }

  btn.addEventListener('click', (e) => {
    // the frame underneath is a link to the trailer — don't follow it
    e.preventDefault();
    e.stopPropagation();
    vid.muted = !vid.muted;
    if (!vid.muted) {
      vid.volume = 1;
      vid.play().catch(() => {});
    }
    paint();
  });

  paint();

  if (declared === 'false') return;          // nothing to hear, no control
  if (declared === 'true') { btn.hidden = false; return; }

  // give the browser a moment to decode enough to answer
  vid.addEventListener('loadeddata', () => setTimeout(offer, 700), { once: true });
  vid.addEventListener('playing', () => setTimeout(offer, 700), { once: true });
})();
