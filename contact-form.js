/* Contact form -> Web3Forms (AJAX, stays on page, uses Webflow's own
   success/error messages). Replaces Webflow's inert form handling. */
(function () {
  'use strict';

  function init() {
    var form = document.getElementById('wf-form-Contact-5-Form');
    if (!form) return;

    // Strip any Webflow-attached submit handlers by cloning the node.
    var fresh = form.cloneNode(true);
    form.parentNode.replaceChild(fresh, form);
    form = fresh;

    var wrap = form.closest('.w-form');
    var done = wrap ? wrap.querySelector('.w-form-done') : null;
    var fail = wrap ? wrap.querySelector('.w-form-fail') : null;
    var btn  = form.querySelector('[type="submit"]');
    var btnDefault = btn ? btn.value : '';

    function showFail(msg) {
      if (fail) {
        if (msg) {
          var t = fail.querySelector('.error-text');
          if (t) t.textContent = msg;
        }
        fail.style.display = 'block';
      }
      if (btn) { btn.value = btnDefault; btn.disabled = false; }
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (fail) fail.style.display = 'none';

      if (!form.checkValidity()) { form.reportValidity(); return; }

      if (btn) {
        btn.value = btn.getAttribute('data-wait') || 'Please wait...';
        btn.disabled = true;
      }

      fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Accept': 'application/json' },
        body: new FormData(form)
      })
      .then(function (res) {
        return res.json().then(function (body) { return { ok: res.ok, body: body }; });
      })
      .then(function (r) {
        if (r.ok && r.body && r.body.success) {
          form.style.display = 'none';
          if (done) done.style.display = 'block';
          form.reset();
        } else {
          showFail(r.body && r.body.message ? r.body.message : null);
        }
      })
      .catch(function () { showFail(); });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
