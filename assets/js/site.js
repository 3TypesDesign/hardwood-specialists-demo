/* Hardwood Specialists — site behaviour (vanilla JS, no dependencies) */
(function () {
  'use strict';

  /* ---------- Analytics events (no-op until GA4 gtag is added to <head>) ---------- */
  function trackEvent(name, params) {
    if (typeof window.gtag === 'function') { window.gtag('event', name, params || {}); }
  }
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[href]');
    if (!a) { return; }
    var href = a.getAttribute('href');
    if (href.indexOf('tel:') === 0) { trackEvent('phone_click', { link_url: href }); }
    else if (href.indexOf('mailto:') === 0) { trackEvent('email_click', { link_url: href }); }
    else if (href.indexOf('maps.app.goo.gl') !== -1 || href.indexOf('google.com/maps') !== -1) { trackEvent('get_directions', { link_url: href }); }
  });

  var header = document.getElementById('site-header');
  var heroWrap = document.getElementById('hero-wrap');
  var hero = document.getElementById('top');
  var stage = document.getElementById('hero-stage');

  /* ---------- Mobile menu ---------- */
  var menuBtn = document.getElementById('menu-toggle');
  var mobileNav = document.getElementById('mobile-nav');
  function setMenu(open) {
    if (!menuBtn || !mobileNav) { return; }
    mobileNav.hidden = !open;
    menuBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
    menuBtn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    updateHeader();
  }
  if (menuBtn) {
    menuBtn.addEventListener('click', function () { setMenu(mobileNav.hidden); });
  }
  document.querySelectorAll('[data-close-menu]').forEach(function (el) {
    el.addEventListener('click', function () { setMenu(false); });
  });

  /* ---------- Header: transparent over hero, solid after ---------- */
  function updateHeader() {
    if (!header || !hero) { return; }
    var headH = header.offsetHeight;
    var solid = hero.getBoundingClientRect().bottom <= headH + 2 || (mobileNav && !mobileNav.hidden);
    header.classList.toggle('hs-head-solid', !!solid);
    header.classList.toggle('hs-head', !solid);
  }

  /* ---------- Hero layout: pull hero under header, size plank stage ---------- */
  var IMG_W = 1418, IMG_H = 1081;
  function layoutHero() {
    if (!hero) { return; }
    if (heroWrap && header) { heroWrap.style.marginTop = (-header.offsetHeight) + 'px'; }
    if (stage) {
      var cw = hero.offsetWidth, ch = hero.offsetHeight;
      var sc = Math.max(cw / IMG_W, ch / IMG_H), rw = IMG_W * sc, rh = IMG_H * sc;
      stage.style.left = ((cw - rw) * 0.5).toFixed(1) + 'px';
      stage.style.top = ((ch - rh) * 0.7).toFixed(1) + 'px';
      stage.style.width = rw.toFixed(1) + 'px';
      stage.style.height = rh.toFixed(1) + 'px';
    }
    updateHeader();
  }
  var ticking = false;
  window.addEventListener('scroll', function () {
    if (ticking) { return; }
    ticking = true;
    window.requestAnimationFrame(function () { ticking = false; updateHeader(); });
  }, { passive: true });
  window.addEventListener('resize', layoutHero);
  layoutHero();
  window.addEventListener('load', layoutHero);

  /* ---------- Hero animation: start after images load + first interaction ---------- */
  if (hero) {
    var ready = false, go = false;
    var maybeStart = function () { if (ready && go) { hero.classList.add('hs-go'); } };
    var srcs = [];
    hero.querySelectorAll('.hs-ba img').forEach(function (im) { if (srcs.indexOf(im.currentSrc || im.src) < 0) { srcs.push(im.currentSrc || im.src); } });
    var pending = srcs.length;
    var done = function () {
      pending -= 1;
      if (pending <= 0 && !ready) { ready = true; hero.classList.add('hs-ready'); maybeStart(); }
    };
    if (!pending) { pending = 1; done(); }
    srcs.forEach(function (u) { var im = new Image(); im.onload = done; im.onerror = done; im.src = u; });
    window.setTimeout(function () { if (!ready) { ready = true; hero.classList.add('hs-ready'); maybeStart(); } }, 6000);
    var events = ['mousemove', 'wheel', 'scroll', 'touchstart', 'keydown', 'pointerdown'];
    var onGo = function () {
      go = true; maybeStart();
      events.forEach(function (ev) { window.removeEventListener(ev, onGo, true); });
    };
    events.forEach(function (ev) { window.addEventListener(ev, onGo, { passive: true, capture: true }); });
  }

  /* ---------- Gallery: show all / fewer ---------- */
  var galToggle = document.getElementById('gallery-toggle');
  var galGrid = document.getElementById('gal-grid');
  if (galToggle && galGrid) {
    var total = galGrid.querySelectorAll('figure').length;
    galToggle.addEventListener('click', function () {
      var all = galGrid.classList.toggle('hs-gallery-all');
      galToggle.setAttribute('aria-expanded', all ? 'true' : 'false');
      galToggle.textContent = all ? 'Show fewer' : 'View all ' + total + ' projects';
    });
  }

  /* ---------- Lightbox (swipe left/right, swipe down to close) ---------- */
  var DATA = window.HS_PHOTOS || { gal: [], show: [] };
  var lb = document.getElementById('lightbox');
  var lbInner = document.getElementById('lb-inner');
  var track = document.getElementById('lb-track');
  var tpl = document.getElementById('lb-slide');
  var countEl = document.getElementById('lb-count');
  var prevBtn = document.getElementById('lb-prev');
  var nextBtn = document.getElementById('lb-next');
  var closeBtn = document.getElementById('lb-close');
  var items = [], index = 0, opener = null;

  function setIndex(i) {
    index = i;
    if (countEl) { countEl.textContent = (i + 1) + ' / ' + items.length; }
    if (prevBtn) { prevBtn.disabled = i <= 0; }
    if (nextBtn) { nextBtn.disabled = i >= items.length - 1; }
  }
  function goTo(i, smooth) {
    i = Math.max(0, Math.min(items.length - 1, i));
    track.scrollTo({ left: i * track.clientWidth, behavior: smooth ? 'smooth' : 'auto' });
    setIndex(i);
  }
  function openLb(set, i, btn) {
    if (!lb || !track || !tpl) { return; }
    items = DATA[set] || [];
    opener = btn || null;
    track.innerHTML = '';
    items.forEach(function (p) {
      var node = tpl.content.firstElementChild.cloneNode(true);
      var img = node.querySelector('img');
      img.src = p.src; img.alt = p.alt;
      var cap = node.querySelector('figcaption');
      if (cap) { cap.textContent = p.cap; }
      track.appendChild(node);
    });
    lb.setAttribute('aria-label', (set === 'show' ? 'Showroom photos' : 'Project photos'));
    lb.hidden = false;
    lb.style.background = 'rgba(5,6,7,0.97)';
    if (lbInner) { lbInner.style.transform = ''; }
    window.requestAnimationFrame(function () { goTo(i, false); try { lb.focus({ preventScroll: true }); } catch (e) { lb.focus(); } });
  }
  function closeLb() {
    if (!lb) { return; }
    lb.hidden = true;
    touch = null;
    document.documentElement.style.overflow = '';
    document.body.style.overflow = '';
    if (opener && opener.focus) { try { opener.focus({ preventScroll: true }); } catch (e) {} }
  }
  document.querySelectorAll('[data-lb-set]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      openLb(btn.getAttribute('data-lb-set'), parseInt(btn.getAttribute('data-lb-index'), 10) || 0, btn);
    });
  });
  if (closeBtn) { closeBtn.addEventListener('click', closeLb); }
  if (prevBtn) { prevBtn.addEventListener('click', function () { goTo(index - 1, true); }); }
  if (nextBtn) { nextBtn.addEventListener('click', function () { goTo(index + 1, true); }); }
  if (lb) {
    lb.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') { e.preventDefault(); goTo(index + 1, true); }
      else if (e.key === 'ArrowLeft') { e.preventDefault(); goTo(index - 1, true); }
      else if (e.key === 'Escape') { e.preventDefault(); closeLb(); }
    });
  }
  if (track) {
    track.addEventListener('scroll', function () {
      if (!track.clientWidth) { return; }
      var i = Math.round(track.scrollLeft / track.clientWidth);
      if (i !== index && i >= 0 && i < items.length) { setIndex(i); }
    }, { passive: true });
    var touch = null;
    track.addEventListener('touchstart', function (e) {
      var p = e.touches[0]; if (!p) { return; }
      touch = { x: p.clientX, y: p.clientY, dy: 0, mode: '' };
      if (lbInner) { lbInner.style.transition = 'none'; }
    }, { passive: true });
    track.addEventListener('touchmove', function (e) {
      var p = e.touches[0]; if (!touch || !p) { return; }
      var dx = p.clientX - touch.x, dy = p.clientY - touch.y;
      if (!touch.mode && (Math.abs(dx) > 10 || Math.abs(dy) > 10)) { touch.mode = (dy > 0 && dy > Math.abs(dx)) ? 'down' : 'side'; }
      if (touch.mode === 'down') {
        touch.dy = Math.max(0, dy);
        var k = Math.min(1, touch.dy / 400);
        if (lbInner) { lbInner.style.transform = 'translate3d(0,' + touch.dy + 'px,0) scale(' + (1 - k * 0.15) + ')'; }
        lb.style.background = 'rgba(5,6,7,' + (0.97 - k * 0.6).toFixed(3) + ')';
      }
    }, { passive: true });
    var endTouch = function () {
      var t = touch; touch = null; if (!t) { return; }
      if (t.mode === 'down' && t.dy > 110) { closeLb(); return; }
      if (lbInner) { lbInner.style.transition = 'transform 260ms ease'; lbInner.style.transform = ''; }
      lb.style.background = 'rgba(5,6,7,0.97)';
    };
    track.addEventListener('touchend', endTouch);
    track.addEventListener('touchcancel', endTouch);
  }

  /* ---------- Estimate form ---------- */
  var form = document.getElementById('estimate-form');
  var thanks = document.getElementById('form-thanks');
  var resetBtn = document.getElementById('form-reset');
  if (form && thanks) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var showThanks = function () { form.hidden = true; thanks.hidden = false; };
      var action = form.getAttribute('action') || '';
      // Spam honeypot: real visitors never fill this hidden field.
      var trap = form.querySelector('[name="_gotcha"]');
      if (trap && trap.value) { showThanks(); return; }
      trackEvent('generate_lead', { form: 'estimate', project_type: (form.elements.type || {}).value || '' });
      if (action.indexOf('YOUR_FORM_ID') !== -1) {
        // Endpoint not configured yet: never drop a lead silently — hand it to the visitor's email app instead.
        // Replace YOUR_FORM_ID in index.html with the real Formspree form id to submit in-page.
        var f = form.elements, lines = [
          'Name: ' + f.name.value, 'Phone: ' + f.phone.value, 'Email: ' + f.email.value,
          'Project type: ' + f.type.value, '', f.message.value
        ];
        window.location.href = 'mailto:info@hardwoodspecialists.com?subject=' +
          encodeURIComponent('Estimate request — ' + f.name.value) + '&body=' + encodeURIComponent(lines.join('\n'));
        showThanks();
        return;
      }
      var btn = form.querySelector('button[type="submit"]');
      if (btn) { btn.disabled = true; }
      fetch(action, { method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' } })
        .then(function (r) { if (!r.ok) { throw new Error('Request failed'); } showThanks(); form.reset(); })
        .catch(function () { alert('Sorry, something went wrong. Please call us at (727) 322-9663.'); })
        .then(function () { if (btn) { btn.disabled = false; } });
    });
  }
  if (resetBtn && form && thanks) {
    resetBtn.addEventListener('click', function () { thanks.hidden = true; form.hidden = false; });
  }
})();
