/* words.js — Inner Ceremonies only (2026-10-02).

   The body text parts very slightly around the cursor and softens as it
   passes: each word within ~130px leans away from the pointer by at most 2px
   and takes up to 0.4px of blur, strongest right under the cursor, easing
   back to nothing as you move on. Meant to be felt rather than seen.

   How it stays cheap:
   - Every targeted paragraph is split into word spans ONCE, at load.
   - An IntersectionObserver keeps a small "live" set: only paragraphs on
     screen are ever considered.
   - Word positions are cached RELATIVE to their own paragraph, so a frame
     costs one getBoundingClientRect per live paragraph (a handful), not one
     per word. Scrolling, the reveal animation and the FAQ opening all move
     the paragraph, not the words inside it, so the cache survives.
   - Only words actually inside the radius are written to, and only the ones
     that just left get cleared. Nothing else is touched.
   - Reads and writes are kept in separate passes so a frame never thrashes
     layout.

   The easing itself is a CSS transition: we set a target each frame and let
   the compositor chase it, which is what gives the trailing, settling feel.

   Off entirely for coarse pointers and for prefers-reduced-motion. */
(function () {
  var SELECT = [
    '.temple__lede',
    '.temple__beat',
    '.temple__welcome p',
    '.temple__pull',
    '.temple__quote blockquote',
    '.depth__text',
    '.depth__foot',
    '.depth__note',
    '.consult__refund',
    '.consult__text',
    '.faq__inner p',
    '.praise__quote'
  ].join(',');

  /* the marigold highlight under "Should I stay? Should I do it?" paints with
     box-decoration-break: clone — splitting its words would give every word
     its own rounded wash instead of one stroke per line. Left whole. */
  var SKIP_WITHIN = '.temple__hl';

  var RADIUS = 125;      // px: how far the cursor is felt
  var MAX_SHIFT = 2;     // px: the furthest a word ever leans
  var MAX_BLUR = 0.4;    // px: the most it ever softens
  var MIN_BLUR = 0.08;   // px: below this a blur is invisible, so skip the repaint
  var R2 = RADIUS * RADIUS;

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  var fine = window.matchMedia('(hover: hover) and (pointer: fine)');

  var paras = [];
  var live = [];
  var active = [];
  var mx = -9999, my = -9999;
  var raf = 0;
  var started = false;
  var io = null;

  /* --- splitting ------------------------------------------------------- */

  function splitWords(root) {
    var walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode: function (n) {
        if (!n.nodeValue || !n.nodeValue.trim()) return NodeFilter.FILTER_REJECT;
        var p = n.parentElement;
        if (!p || p.classList.contains('cw')) return NodeFilter.FILTER_REJECT;
        if (SKIP_WITHIN && p.closest(SKIP_WITHIN)) return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      }
    });

    var nodes = [], n;
    while ((n = walker.nextNode())) nodes.push(n);

    var words = [];
    nodes.forEach(function (node) {
      var parts = node.nodeValue.split(/(\s+)/);
      var frag = document.createDocumentFragment();
      parts.forEach(function (part) {
        if (!part) return;
        if (/^\s+$/.test(part)) {            // keep the real spaces as text
          frag.appendChild(document.createTextNode(part));
          return;
        }
        var el = document.createElement('span');
        el.className = 'cw';
        el.textContent = part;
        frag.appendChild(el);
        words.push({ el: el, cx: 0, cy: 0, k: 1 });
      });
      node.parentNode.replaceChild(frag, node);
    });
    return words;
  }

  /* --- measuring ------------------------------------------------------- */

  /* Word centres are stored relative to the paragraph's own box, so they stay
     true wherever the paragraph is on the page. Transforms left over from the
     last frame would poison the read, so they are cleared first. */
  function measure(p) {
    var i;
    for (i = 0; i < p.words.length; i++) {
      p.words[i].el.style.transform = '';
      p.words[i].el.style.filter = '';
    }
    var pr = p.el.getBoundingClientRect();
    for (i = 0; i < p.words.length; i++) {
      var w = p.words[i];
      var r = w.el.getBoundingClientRect();
      w.cx = r.left - pr.left + r.width / 2;
      w.cy = r.top - pr.top + r.height / 2;
      /* a little variation in how far each word leans, so the field reads as
         organic rather than as one rigid ripple. Capped at 1 so MAX_SHIFT
         stays a true ceiling: words lean between 1.1px and 2px, never more. */
      w.k = 0.55 + ((i * 37) % 46) / 100;
    }
    p.w = pr.width;
    p.h = pr.height;
    p.measured = true;
    return pr;
  }

  function invalidate() {
    for (var i = 0; i < paras.length; i++) paras[i].measured = false;
    request();
  }

  /* --- the frame ------------------------------------------------------- */

  function request() {
    if (!raf) raf = requestAnimationFrame(frame);
  }

  function frame() {
    raf = 0;
    var i, j, p, pr;
    var boxes = [];

    /* pass one: read only */
    for (i = 0; i < live.length; i++) {
      p = live[i];
      pr = p.el.getBoundingClientRect();
      if (!pr.width || !pr.height) { boxes.push(null); continue; }
      if (!p.measured || Math.abs(pr.width - p.w) > 1 || Math.abs(pr.height - p.h) > 1) {
        pr = measure(p);                      // rare: resize, or a FAQ opening
      }
      boxes.push(pr);
    }

    /* pass two: write only */
    var next = [];
    for (i = 0; i < live.length; i++) {
      pr = boxes[i];
      if (!pr) continue;
      if (mx < pr.left - RADIUS || mx > pr.right + RADIUS ||
          my < pr.top - RADIUS || my > pr.bottom + RADIUS) continue;

      p = live[i];
      for (j = 0; j < p.words.length; j++) {
        var w = p.words[j];
        var dx = pr.left + w.cx - mx;
        var dy = pr.top + w.cy - my;
        var d2 = dx * dx + dy * dy;
        if (d2 > R2) continue;

        var d = Math.sqrt(d2) || 0.001;
        var s = 1 - d / RADIUS;
        s = s * s * (3 - 2 * s);              // smoothstep: no hard edge
        var m = s * MAX_SHIFT * w.k;

        w.el.style.transform =
          'translate(' + (dx / d * m).toFixed(2) + 'px,' + (dy / d * m).toFixed(2) + 'px)';

        /* Transforms ride the compositor; a filter does not — it forces the
           glyph run to be rasterised again. Out at the edge of the field the
           blur is a few hundredths of a pixel, which nobody can see and every
           browser still repaints for. So blur only where it actually reads
           (the inner ~86px) and let the outer ring lean without it. This is
           what keeps the frame tail flat. */
        var b = s * MAX_BLUR;
        if (b >= MIN_BLUR) {
          w.el.style.filter = 'blur(' + b.toFixed(2) + 'px)';
          w.blurred = true;
        } else if (w.blurred) {
          w.el.style.filter = '';
          w.blurred = false;
        }
        w.on = true;
        next.push(w);
      }
    }

    /* let go of whatever just fell out of reach */
    for (i = 0; i < active.length; i++) {
      if (!active[i].on) {
        active[i].el.style.transform = '';
        active[i].el.style.filter = '';
        active[i].blurred = false;
      }
    }
    for (i = 0; i < next.length; i++) next[i].on = false;
    active = next;
  }

  function release() {
    mx = my = -9999;
    request();
  }

  /* --- wiring ---------------------------------------------------------- */

  function start() {
    if (started || reduce.matches || !fine.matches) return;
    started = true;

    var nodes = document.querySelectorAll(SELECT);
    if (!nodes.length) return;

    for (var i = 0; i < nodes.length; i++) {
      var words = splitWords(nodes[i]);
      if (words.length) {
        paras.push({ el: nodes[i], words: words, w: 0, h: 0, measured: false });
      }
    }
    if (!paras.length) return;

    document.body.classList.add('has-wordhover');

    io = new IntersectionObserver(function (entries) {
      for (var k = 0; k < entries.length; k++) {
        var p = null;
        for (var n = 0; n < paras.length; n++) {
          if (paras[n].el === entries[k].target) { p = paras[n]; break; }
        }
        if (!p) continue;
        var at = live.indexOf(p);
        if (entries[k].isIntersecting) { if (at < 0) live.push(p); }
        else if (at >= 0) {
          live.splice(at, 1);
          for (var m = 0; m < p.words.length; m++) {
            p.words[m].el.style.transform = '';
            p.words[m].el.style.filter = '';
          }
        }
      }
      /* something just scrolled or opened into view (a FAQ answer, say).
         Nothing else would ask for a frame until the pointer next moves, so
         ask here: the new paragraph joins the field straight away. */
      request();
    }, { rootMargin: '200px 0px' });

    for (var q = 0; q < paras.length; q++) io.observe(paras[q].el);

    window.addEventListener('pointermove', function (e) {
      if (e.pointerType && e.pointerType !== 'mouse') return;
      mx = e.clientX; my = e.clientY;
      request();
    }, { passive: true });

    window.addEventListener('pointerleave', release, { passive: true });
    window.addEventListener('blur', release);
    window.addEventListener('scroll', request, { passive: true });
    window.addEventListener('resize', invalidate, { passive: true });

    /* Instrument Serif and Archivo arrive after first paint. A paragraph
       measured in the fallback face keeps the same line count, so the
       width/height check above will not notice, but every word inside it has
       moved — the field would read as offset from the text. Throw the cache
       away once the real faces are in, and again at load for anything else
       that settles late (images reserving space, the hero video). */
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(invalidate);
    window.addEventListener('load', invalidate);
  }

  function stop() {
    if (!started) return;
    for (var i = 0; i < active.length; i++) {
      active[i].el.style.transform = '';
      active[i].el.style.filter = '';
    }
    active = [];
    document.body.classList.remove('has-wordhover');
  }

  /* someone turning reduced motion on mid-visit should see it stop at once */
  function onPreference() {
    if (reduce.matches) stop();
    else if (!started) start();
    else document.body.classList.add('has-wordhover');
  }
  if (reduce.addEventListener) reduce.addEventListener('change', onPreference);
  else if (reduce.addListener) reduce.addListener(onPreference);

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }
})();
