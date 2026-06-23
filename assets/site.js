/* Just Graphics — shared site script. Extracted from index.html. */
  /* ── Navbar scroll + scroll progress — immediate ── */
  const nav = document.getElementById('nav');
  const progress = document.getElementById('scroll-progress');
  let progressTicking = false;
  function updateScroll() {
    const sy = window.scrollY;
    nav.classList.toggle('scrolled', sy > 40);
    if (progress) {
      const docH = document.documentElement.scrollHeight - window.innerHeight;
      const pct = docH > 0 ? Math.min(100, (sy / docH) * 100) : 0;
      progress.style.width = pct + '%';
    }
    progressTicking = false;
  }
  window.addEventListener('scroll', () => {
    if (!progressTicking) {
      requestAnimationFrame(updateScroll);
      progressTicking = true;
    }
  }, { passive: true });

  /* ── Burger menu — immediate (needed for mobile interaction) ── */
  (function() {
    var burger   = document.getElementById('burger');
    var panel    = document.getElementById('menu-panel');
    var overlay  = document.getElementById('menu-overlay');
    if (!burger || !panel) return;
    var focusableSel = 'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

    function openMenu() {
      burger.classList.add('is-active');
      burger.setAttribute('aria-expanded', 'true');
      burger.setAttribute('aria-label', 'Close menu');
      panel.classList.add('is-open');
      panel.setAttribute('aria-hidden', 'false');
      panel.removeAttribute('inert');
      overlay.classList.add('is-open');
      overlay.setAttribute('aria-hidden', 'false');
      document.body.classList.add('menu-open');
      var first = panel.querySelector(focusableSel);
      if (first) first.focus();
    }
    function closeMenu() {
      burger.classList.remove('is-active');
      burger.setAttribute('aria-expanded', 'false');
      burger.setAttribute('aria-label', 'Open menu');
      panel.classList.remove('is-open');
      panel.setAttribute('aria-hidden', 'true');
      panel.setAttribute('inert', '');
      overlay.classList.remove('is-open');
      overlay.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('menu-open');
      burger.focus();
    }

    burger.addEventListener('click', function() {
      panel.classList.contains('is-open') ? closeMenu() : openMenu();
    });
    overlay.addEventListener('click', closeMenu);

    // Close on anchor click + smooth scroll offset
    panel.querySelectorAll('a[href^="#"]').forEach(function(link) {
      link.addEventListener('click', function() {
        closeMenu();
      });
    });

    // Close on Escape key
    document.addEventListener('keydown', function(e) {
      if (!panel.classList.contains('is-open')) return;
      if (e.key === 'Escape') {
        closeMenu();
        return;
      }
      if (e.key !== 'Tab') return;
      var focusable = Array.prototype.slice.call(panel.querySelectorAll(focusableSel));
      if (!focusable.length) return;
      var first = focusable[0];
      var last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    });
  })();

  /* ── Everything else deferred until browser is idle ── */
  const initApp = () => {
  /* ── UTM params ── */
  var utmParams = {};
  ['utm_source','utm_medium','utm_campaign','utm_term','utm_content'].forEach(function(k) {
    var v = new URLSearchParams(window.location.search).get(k);
    if (v) utmParams[k] = v;
  });

  /* ── Meta cookies helper ── */
  function getCookie(name) {
    var m = document.cookie.match(new RegExp('(?:^|; )' + name + '=([^;]*)'));
    return m ? decodeURIComponent(m[1]) : '';
  }
  function getMetaIds() {
    return {
      fbc: getCookie('_fbc') || '',
      fbp: getCookie('_fbp') || '',
      externalId: window.__extid || '',
      eventID: 'ev_' + Date.now() + '_' + Math.random().toString(36).slice(2, 9)
    };
  }

  function fmt(v) { return v.toLocaleString('en-US'); }
  /* ── Number counters ── */
  (function() {
    const els = document.querySelectorAll('[data-count]');
    if (!els.length) return;
    const animate = (el) => {
      const target = parseFloat(el.dataset.count);
      const decimals = parseInt(el.dataset.decimals || '0', 10);
      const dur = 1100;
      const start = performance.now();
      const startVal = 0;
      const fmt = (v) => {
        if (decimals > 0) return v.toFixed(decimals);
        return Math.round(v).toLocaleString('en-US');
      };
      const tick = (now) => {
        const t = Math.min(1, (now - start) / dur);
        const eased = 1 - Math.pow(1 - t, 3);
        el.textContent = fmt(startVal + (target - startVal) * eased);
        if (t < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    };
    const cio = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) { animate(e.target); cio.unobserve(e.target); }
      });
    }, { threshold: 0.3 });
    els.forEach(el => cio.observe(el));
  })();

  /* ── Intersection Observer (scroll reveal) ── */
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('visible'); io.unobserve(e.target); }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('[data-animate], .reveal-img, .reveal-rule').forEach(el => io.observe(el));

  const ios = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('visible'); ios.unobserve(e.target); }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -30px 0px' });

  document.querySelectorAll('.stagger').forEach(el => ios.observe(el));

  /* ── Gallery filter tabs ────────────────── */
  const gTrack  = document.getElementById('g-track');
  const gPrev   = document.getElementById('g-prev');
  const gNext   = document.getElementById('g-next');
  const gCards  = Array.from(document.querySelectorAll('.g-card'));

  function visibleCards() {
    return gCards.filter(c => !c.classList.contains('hidden'));
  }
  function cardStep() {
    const vc = visibleCards();
    if (!vc.length) return 280;
    const rect = vc[0].getBoundingClientRect();
    return rect.width + 14; /* card width + gap */
  }
  function updateGArrows() {
    gPrev.disabled = gTrack.scrollLeft <= 4;
    gNext.disabled = gTrack.scrollLeft + gTrack.clientWidth >= gTrack.scrollWidth - 4;
  }

  gPrev.addEventListener('click', () => { gTrack.scrollBy({ left: -cardStep() * visiblePerView(), behavior: 'smooth' }); });
  gNext.addEventListener('click', () => { gTrack.scrollBy({ left:  cardStep() * visiblePerView(), behavior: 'smooth' }); });
  gTrack.addEventListener('scroll', updateGArrows, { passive: true });

  function visiblePerView() {
    const w = window.innerWidth;
    return w >= 1024 ? 3 : w >= 600 ? 2 : 1;
  }

  updateGArrows();

  /* ── Cases slider ───────────────────────── */
  (function () {
    const track = document.getElementById('cases-track');
    const dots  = document.querySelectorAll('.cdot');
    const prev  = document.getElementById('cases-prev');
    const next  = document.getElementById('cases-next');
    const slides = track.querySelectorAll('.case-slide');
    const total = dots.length;
    let cur = 0;

    function go(idx) {
      cur = (idx + total) % total;
      track.style.willChange = 'transform';
      track.style.transform = `translateX(-${cur * 100}%)`;
      dots.forEach((d, i) => {
        d.classList.toggle('active', i === cur);
        d.setAttribute('aria-selected', i === cur ? 'true' : 'false');
      });
      slides.forEach((slide, i) => {
        const active = i === cur;
        slide.setAttribute('aria-hidden', active ? 'false' : 'true');
        if (active) slide.removeAttribute('inert');
        else slide.setAttribute('inert', '');
      });
      track.addEventListener('transitionend', () => { track.style.willChange = 'auto'; }, { once: true });
    }

    prev.addEventListener('click', () => go(cur - 1));
    next.addEventListener('click', () => go(cur + 1));
    dots.forEach(d => d.addEventListener('click', () => go(+d.dataset.idx)));

    let timer = null;
    const region = track.closest('[role="region"]');

    function startTimer() { if (!timer) timer = setInterval(() => go(cur + 1), 6000); }
    function stopTimer()  { clearInterval(timer); timer = null; }

    /* Pause when section scrolls out of view, resume when back */
    const visObs = new IntersectionObserver(entries => {
      entries[0].isIntersecting ? startTimer() : stopTimer();
    }, { threshold: 0.2 });
    visObs.observe(region);

    region.addEventListener('mouseenter', stopTimer);
    region.addEventListener('mouseleave', startTimer);

    region.addEventListener('keydown', e => {
      if (e.key === 'ArrowLeft')  { clearInterval(timer); go(cur - 1); }
      if (e.key === 'ArrowRight') { clearInterval(timer); go(cur + 1); }
    });

    /* Touch swipe for case slides */
    let tx0 = 0;
    region.addEventListener('touchstart', e => { tx0 = e.touches[0].clientX; }, { passive: true });
    region.addEventListener('touchend',   e => {
      const diff = tx0 - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 44) { clearInterval(timer); go(cur + (diff > 0 ? 1 : -1)); }
    }, { passive: true });
    go(0);
  })();

  /* ── Reviews slider ─────────────────────── */
  (function () {
    const track   = document.getElementById('rev-track');
    const dots    = document.querySelectorAll('.rdot');
    const prev    = document.getElementById('rev-prev');
    const next    = document.getElementById('rev-next');
    const counter = document.getElementById('rev-cur');
    const slides  = track.querySelectorAll('.rev-slide');
    const total   = dots.length;
    let cur = 0;

    function collapseAll() {
      track.querySelectorAll('.rev-slide.expanded').forEach(s => {
        s.classList.remove('expanded');
        const btn = s.querySelector('.rev-expand-btn');
        const panel = s.querySelector('.rev-full-panel');
        if (btn)   { btn.setAttribute('aria-expanded', 'false'); btn.querySelector('.rev-expand-label').textContent = 'Read full review'; }
        if (panel) { panel.setAttribute('aria-hidden', 'true'); panel.style.maxHeight = '0'; }
      });
    }

    function go(idx) {
      collapseAll();
      cur = (idx + total) % total;
      track.style.willChange = 'transform';
      track.style.transform = `translateX(-${cur * 100}%)`;
      dots.forEach((d, i) => {
        d.classList.toggle('active', i === cur);
        d.setAttribute('aria-selected', i === cur ? 'true' : 'false');
      });
      slides.forEach((slide, i) => {
        const active = i === cur;
        slide.setAttribute('aria-hidden', active ? 'false' : 'true');
        if (active) slide.removeAttribute('inert');
        else slide.setAttribute('inert', '');
      });
      counter.textContent = cur + 1;
      track.addEventListener('transitionend', () => { track.style.willChange = 'auto'; }, { once: true });
    }

    prev.addEventListener('click', () => go(cur - 1));
    next.addEventListener('click', () => go(cur + 1));
    dots.forEach(d => d.addEventListener('click', () => go(+d.dataset.idx)));

    /* Expand/collapse full review panel */
    track.querySelectorAll('.rev-expand-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const slide = btn.closest('.rev-slide');
        const panel = slide.querySelector('.rev-full-panel');
        const open  = slide.classList.toggle('expanded');
        btn.setAttribute('aria-expanded', open);
        panel.setAttribute('aria-hidden', !open);
        btn.querySelector('.rev-expand-label').textContent = open ? 'Hide full review' : 'Read full review';
        panel.style.maxHeight = open ? panel.querySelector('.rev-full-panel-inner').scrollHeight + 'px' : '0';
      });
    });

    /* Keyboard navigation */
    const region = track.closest('[role="region"]');
    region.addEventListener('keydown', e => {
      if (e.key === 'ArrowLeft')  go(cur - 1);
      if (e.key === 'ArrowRight') go(cur + 1);
    });

    /* Touch swipe */
    let tx0 = 0;
    region.addEventListener('touchstart', e => { tx0 = e.touches[0].clientX; }, { passive: true });
    region.addEventListener('touchend',   e => {
      const diff = tx0 - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 44) go(cur + (diff > 0 ? 1 : -1));
    }, { passive: true });
    go(0);
  })();

  /* ── Before/After comparison slider ─────── */
  function initCompare(el) {
    const after  = el.querySelector('.compare__after');
    const handle = el.querySelector('.compare__handle');
    let active = false;

    function set(clientX) {
      const r   = el.getBoundingClientRect();
      const pct = Math.max(2, Math.min(98, ((clientX - r.left) / r.width) * 100));
      after.style.clipPath  = `inset(0 ${(100 - pct).toFixed(1)}% 0 0)`;
      handle.style.left     = pct.toFixed(1) + '%';
    }

    /* Mouse */
    el.addEventListener('mousedown', e => { active = true; set(e.clientX); e.preventDefault(); });
    document.addEventListener('mousemove', e => { if (active) set(e.clientX); });
    document.addEventListener('mouseup',   () => { active = false; });

    /* Touch — prevent page scroll while dragging compare */
    el.addEventListener('touchstart', e => { active = true; set(e.touches[0].clientX); }, { passive: true });
    el.addEventListener('touchmove',  e => {
      if (!active) return;
      e.preventDefault();
      set(e.touches[0].clientX);
    }, { passive: false });
    el.addEventListener('touchend', () => { active = false; });

    /* Hint animation: nudge handle once after element enters viewport */
    let hinted = false;
    const hio = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !hinted) {
          hinted = true;
          hio.unobserve(el);
          setTimeout(() => {
            after.style.transition  = 'clip-path 0.55s ease';
            handle.style.transition = 'left 0.55s ease';
            set(el.getBoundingClientRect().left + el.getBoundingClientRect().width * 0.32);
            setTimeout(() => {
              set(el.getBoundingClientRect().left + el.getBoundingClientRect().width * 0.50);
              setTimeout(() => {
                after.style.transition  = '';
                handle.style.transition = '';
              }, 600);
            }, 650);
          }, 600);
        }
      });
    }, { threshold: 0.5 });
    hio.observe(el);
  }

  document.querySelectorAll('.compare').forEach(initCompare);

  /* ── FAQ accordion ───────────────────── */
  document.querySelectorAll('.faq-q').forEach(btn => {
    btn.addEventListener('click', () => {
      const expanded = btn.getAttribute('aria-expanded') === 'true';
      const wrap = document.getElementById(btn.getAttribute('aria-controls'));
      btn.setAttribute('aria-expanded', String(!expanded));
      wrap.setAttribute('aria-hidden', String(expanded));
      wrap.style.maxHeight = expanded ? '0' : wrap.scrollHeight + 'px';
    });
  });

  /* ── Page lead form ──────────────────── */
  /* ── Multi-step qualifying brief (shared engine) ── */
  function budgetValue(b) {
    if (!b) return null;
    if (b.indexOf('5,000+') > -1) return 6000;
    if (b.indexOf('3,000') > -1 && b.indexOf('5,000') > -1) return 4000;
    if (b.indexOf('1,500') > -1) return 2250;
    return null;
  }

  function initBrief(root) {
    if (!root || root.dataset.briefReady) return null;
    root.dataset.briefReady = '1';

    var id        = root.id || ('brief-' + Math.random().toString(36).slice(2));
    var form      = root.querySelector('.brief__form');
    var steps     = [].slice.call(root.querySelectorAll('.brief__step'));
    var backBtn   = root.querySelector('.brief__back');
    var nextBtn   = root.querySelector('.brief__next');
    var submitBtn = root.querySelector('.brief__submit');
    var bar       = root.querySelector('.brief__progress-bar');
    var curEl     = root.querySelector('.brief__cur');
    var success   = root.querySelector('.brief__success');
    var source    = root.dataset.briefSource || 'brief';
    var total     = steps.length;
    var cur       = 0;
    var extra     = {};   /* prefill: livery / product / brand / car */

    if (!form || !total) return null;

    /* unique radio group names per instance (same-name radios collide across DOM) */
    [].forEach.call(root.querySelectorAll('.brief__choices'), function (group) {
      var nm = (group.dataset.choice || 'opt') + '-' + id;
      [].forEach.call(group.querySelectorAll('input[type=radio]'), function (r) { r.name = nm; });
    });

    function render() {
      steps.forEach(function (s, i) { s.classList.toggle('is-active', i === cur); });
      if (bar)   bar.style.width = ((cur + 1) / total * 100) + '%';
      if (curEl) curEl.textContent = (cur + 1);
      if (backBtn)   backBtn.hidden = cur === 0;
      var last = cur === total - 1;
      if (nextBtn)   nextBtn.hidden = last;
      if (submitBtn) submitBtn.hidden = !last;
      var first = steps[cur].querySelector('input:not([type=radio]), textarea, select') ||
                  steps[cur].querySelector('input[type=radio]');
      if (first) setTimeout(function () { try { first.focus({ preventScroll: true }); } catch (e) { first.focus(); } }, 60);
    }

    function validateStep(i) {
      var ok = true, step = steps[i];
      [].forEach.call(step.querySelectorAll('input[required]:not([type=radio]), textarea[required]'), function (f) {
        f.classList.remove('has-error');
        if (!f.value.trim()) { f.classList.add('has-error'); ok = false; }
      });
      [].forEach.call(step.querySelectorAll('.brief__choices[data-required]'), function (group) {
        group.classList.remove('has-error');
        if (!group.querySelector('input[type=radio]:checked')) { group.classList.add('has-error'); ok = false; }
      });
      return ok;
    }

    function choiceVal(name) {
      var g = root.querySelector('.brief__choices[data-choice="' + name + '"]');
      var c = g && g.querySelector('input[type=radio]:checked');
      return c ? c.value : '';
    }
    function fieldVal(name) {
      var el = root.querySelector('[data-field="' + name + '"]');
      return el ? el.value.trim() : '';
    }

    if (nextBtn) nextBtn.addEventListener('click', function () {
      if (validateStep(cur) && cur < total - 1) { cur++; render(); }
    });
    if (backBtn) backBtn.addEventListener('click', function () {
      if (cur > 0) { cur--; render(); }
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!validateStep(cur)) return;
      submitBtn.disabled = true;
      submitBtn.classList.add('loading');

      var meta   = getMetaIds();
      var car    = [fieldVal('make'), fieldVal('model'), fieldVal('year')].filter(Boolean).join(' ');
      var budget = choiceVal('budget');
      var bv     = budgetValue(budget);
      var payload = {
        name: fieldVal('name'),
        phone: fieldVal('phone'),
        car: car || extra.car || 'Not specified',
        source: source,
        utm: utmParams,
        fbc: meta.fbc, fbp: meta.fbp, externalId: meta.externalId, eventID: meta.eventID
      };
      var vision = choiceVal('vision');
      if (vision)        payload.vision = vision;
      if (budget)        payload.budget = budget;
      if (bv != null)    payload.budgetValue = bv;
      if (extra.livery)  payload.livery = extra.livery;
      if (extra.product) payload.product = extra.product;
      if (extra.brand)   payload.brand = extra.brand;

      function done() {
        submitBtn.disabled = false;
        submitBtn.classList.remove('loading');
        form.style.display = 'none';
        if (success) success.classList.add('is-visible');
        if (typeof fbq === 'function') {
          fbq('track', 'Lead', bv != null ? { value: bv, currency: 'AED' } : {}, { eventID: meta.eventID });
        }
      }
      fetch('https://leads.just-graphics.art/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      }).then(done).catch(function () {
        submitBtn.disabled = false;
        submitBtn.classList.remove('loading');
        alert('Something went wrong. Please try again or call us at +971 50 533 5004.');
      });
    });

    render();

    return {
      el: root,
      reset: function () {
        cur = 0; extra = {};
        form.reset(); form.style.display = '';
        if (success) success.classList.remove('is-visible');
        [].forEach.call(root.querySelectorAll('.has-error'), function (el) { el.classList.remove('has-error'); });
        render();
      },
      prefill: function (obj) {
        extra = obj || {};
        if (obj && obj.make) { var m = root.querySelector('[data-field=make]'); if (m) m.value = obj.make; }
        if (obj && obj.vision) {
          var g = root.querySelector('.brief__choices[data-choice=vision]');
          var r = g && g.querySelector('input[value="' + obj.vision + '"]');
          if (r) r.checked = true;
        }
      },
      goTo: function (i) { cur = Math.max(0, Math.min(total - 1, i)); render(); }
    };
  }

  /* page brief (shared markup in #get-quote on both pages) */
  var pageBriefEl = document.getElementById('page-brief');
  if (pageBriefEl) initBrief(pageBriefEl);

  /* ── Sticky mobile CTA bar ─────────── */
  (function () {
    const bar     = document.getElementById('mobile-cta');
    const hero    = document.getElementById('hero');
    const waFloat = document.querySelector('.wa-float');
    if (!bar || !hero) return;

    let ticking  = false;
    let barShown = false;

    function update() {
      const y = window.scrollY;
      const heroBottom = hero.offsetTop + hero.offsetHeight;
      const pastHero = y > heroBottom - 200;

      if (pastHero && !barShown) {
        bar.classList.add('is-visible');
        if (waFloat) waFloat.classList.add('bar-active');
        barShown = true;
      } else if (!pastHero && barShown) {
        bar.classList.remove('is-visible');
        if (waFloat) waFloat.classList.remove('bar-active');
        barShown = false;
      }
      ticking = false;
    }

    window.addEventListener('scroll', function () {
      if (!ticking) { requestAnimationFrame(update); ticking = true; }
    }, { passive: true });
  })();

  /* ── Data-event Pixel helper ───────── */
  document.addEventListener('click', function (e) {
    var waLink = e.target.closest('a[href*="whatsapp.com"]');
    if (waLink) {
      var waMeta = getMetaIds();
      if (typeof fbq === 'function') fbq('track', 'Contact', { content_name: 'contact_whatsapp' }, { eventID: waMeta.eventID });
      fetch('https://leads.just-graphics.art/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ event: 'WhatsAppClick', source: 'whatsapp_button', fbc: waMeta.fbc, fbp: waMeta.fbp, externalId: waMeta.externalId, eventID: waMeta.eventID })
      }).catch(function () {});
      return;
    }

    const el = e.target.closest('[data-event]');
    if (!el) return;
    const event = el.dataset.event;
    if (typeof fbq === 'function') {
      var eventMap = {
        'contact_whatsapp': 'Contact',
        'contact_call':     'Contact',
        'lead_form':        'Lead',
        'view_catalog':     'ViewContent',
        'cta_see_work':     'ViewContent',
        'cta_gallery':      'ViewContent'
      };
      fbq('track', eventMap[event] || 'Lead', { content_name: event });
    }
  });


  /* ── Image lightbox (shared) — fullscreen viewer with zoom / pan / swipe ── */
  var openLightbox = (function () {
    var items = [], idx = 0, scale = 1, tx = 0, ty = 0;
    var lastFocus = null, box, imgEl, counterEl, prevEl, nextEl, barEl, titleEl, priceEl, orderEl;
    var MIN = 1, MAX = 4;

    function build() {
      box = document.createElement('div');
      box.className = 'lightbox';
      box.setAttribute('role', 'dialog');
      box.setAttribute('aria-modal', 'true');
      box.setAttribute('aria-label', 'Image viewer');
      box.innerHTML =
        '<button type="button" class="lightbox__btn lightbox__close" aria-label="Close">&times;</button>' +
        '<button type="button" class="lightbox__btn lightbox__nav lightbox__prev" aria-label="Previous">&#8249;</button>' +
        '<button type="button" class="lightbox__btn lightbox__nav lightbox__next" aria-label="Next">&#8250;</button>' +
        '<div class="lightbox__stage"><img class="lightbox__img" alt=""></div>' +
        '<div class="lightbox__counter" aria-hidden="true"></div>' +
        '<div class="lightbox__bar">' +
          '<div class="lightbox__meta">' +
            '<div class="lightbox__title"></div>' +
            '<div class="lightbox__price"></div>' +
          '</div>' +
          '<button type="button" class="btn btn-gold lightbox__order">Order this style</button>' +
        '</div>';
      document.body.appendChild(box);
      imgEl = box.querySelector('.lightbox__img');
      counterEl = box.querySelector('.lightbox__counter');
      prevEl = box.querySelector('.lightbox__prev');
      nextEl = box.querySelector('.lightbox__next');
      barEl = box.querySelector('.lightbox__bar');
      titleEl = box.querySelector('.lightbox__title');
      priceEl = box.querySelector('.lightbox__price');
      orderEl = box.querySelector('.lightbox__order');
      var stage = box.querySelector('.lightbox__stage');

      box.querySelector('.lightbox__close').addEventListener('click', close);
      prevEl.addEventListener('click', function (e) { e.stopPropagation(); go(-1); });
      nextEl.addEventListener('click', function (e) { e.stopPropagation(); go(1); });
      orderEl.addEventListener('click', function (e) {
        e.stopPropagation();
        var it = items[idx];
        close();
        if (it && typeof it.onOrder === 'function') it.onOrder();
      });
      box.addEventListener('click', function (e) { if (e.target === box || e.target === stage) close(); });

      /* desktop: wheel zoom + double-click toggle + drag-pan */
      stage.addEventListener('wheel', function (e) {
        e.preventDefault();
        zoomBy(e.deltaY < 0 ? 1.2 : 1 / 1.2);
      }, { passive: false });
      imgEl.addEventListener('dblclick', function (e) {
        e.preventDefault();
        if (scale > 1) { scale = 1; tx = ty = 0; } else { scale = 2.5; }
        apply();
      });
      var dragging = false, sx = 0, sy = 0;
      imgEl.addEventListener('mousedown', function (e) {
        if (scale <= 1) return;
        dragging = true; sx = e.clientX - tx; sy = e.clientY - ty; e.preventDefault();
      });
      window.addEventListener('mousemove', function (e) {
        if (!dragging) return; tx = e.clientX - sx; ty = e.clientY - sy; apply();
      });
      window.addEventListener('mouseup', function () { dragging = false; });

      /* touch: 1-finger swipe (when not zoomed) / pan (when zoomed); 2-finger pinch */
      var t0x = 0, t0y = 0, panx = 0, pany = 0, pinchDist = 0, pinchScale = 1, swiping = false;
      imgEl.addEventListener('touchstart', function (e) {
        if (e.touches.length === 2) {
          pinchDist = dist(e.touches); pinchScale = scale;
        } else if (e.touches.length === 1) {
          t0x = e.touches[0].clientX; t0y = e.touches[0].clientY;
          panx = tx; pany = ty; swiping = scale <= 1;
        }
      }, { passive: true });
      imgEl.addEventListener('touchmove', function (e) {
        if (e.touches.length === 2) {
          e.preventDefault();
          scale = clamp(pinchScale * (dist(e.touches) / pinchDist), MIN, MAX);
          apply();
        } else if (e.touches.length === 1 && scale > 1) {
          e.preventDefault();
          tx = panx + (e.touches[0].clientX - t0x);
          ty = pany + (e.touches[0].clientY - t0y);
          apply();
        }
      }, { passive: false });
      imgEl.addEventListener('touchend', function (e) {
        if (swiping && e.changedTouches.length) {
          var dx = e.changedTouches[0].clientX - t0x;
          if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1);
        }
        swiping = false;
      });
    }
    function dist(t) { var a = t[0], b = t[1]; return Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY); }
    function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }
    function zoomBy(f) { scale = clamp(scale * f, MIN, MAX); if (scale === 1) tx = ty = 0; apply(); }
    function apply() {
      imgEl.style.transform = 'translate(' + tx + 'px,' + ty + 'px) scale(' + scale + ')';
      imgEl.style.cursor = scale > 1 ? 'grab' : 'zoom-in';
      box.classList.toggle('is-zoomed', scale > 1);
    }
    function show(i) {
      idx = (i + items.length) % items.length;
      scale = 1; tx = ty = 0;
      var it = items[idx];
      imgEl.src = it.src;
      imgEl.alt = it.alt || '';
      counterEl.textContent = (idx + 1) + ' / ' + items.length;
      var multi = items.length > 1;
      prevEl.hidden = nextEl.hidden = !multi;
      counterEl.hidden = !multi;
      var hasInfo = !!(it.title || it.priceHTML);
      if (hasInfo) {
        titleEl.textContent = it.title || '';
        priceEl.innerHTML = it.priceHTML || '';
        orderEl.textContent = it.orderLabel || 'Order this style';
        orderEl.style.display = (typeof it.onOrder === 'function') ? '' : 'none';
      }
      barEl.hidden = !hasInfo;
      apply();
    }
    function go(d) { show(idx + d); }
    function onKey(e) {
      if (e.key === 'Escape') close();
      else if (e.key === 'ArrowLeft') go(-1);
      else if (e.key === 'ArrowRight') go(1);
      else if (e.key === '+' || e.key === '=') zoomBy(1.25);
      else if (e.key === '-') zoomBy(1 / 1.25);
    }
    function close() {
      box.classList.remove('is-open');
      document.body.classList.remove('lightbox-open');
      document.removeEventListener('keydown', onKey);
      if (lastFocus && lastFocus.focus) lastFocus.focus();
    }
    return function (list, startIdx) {
      if (!list || !list.length) return;
      if (!box) build();
      items = list; lastFocus = document.activeElement;
      document.body.classList.add('lightbox-open');
      box.classList.add('is-open');
      document.addEventListener('keydown', onKey);
      show(startIdx || 0);
      box.querySelector('.lightbox__close').focus();
    };
  })();

  /* ── Desktop-only craft cursor (gated, zero mobile cost) ── */
  if (window.matchMedia('(hover:hover) and (min-width:1024px)').matches) {
    const dot = document.createElement('div');
    dot.className = 'ec-cursor';
    document.body.appendChild(dot);
    document.documentElement.classList.add('has-cursor');
    let rx = 0, ry = 0;
    window.addEventListener('pointermove', e => {
      rx = e.clientX; ry = e.clientY;
      dot.style.transform = 'translate(' + rx + 'px,' + ry + 'px) translate(-50%,-50%)';
    }, { passive: true });
    document.querySelectorAll('a, button, .g-card, .brief__choice').forEach(el => {
      el.addEventListener('pointerenter', () => dot.style.transform += ' scale(2.4)');
      el.addEventListener('pointerleave', () => { dot.style.transform = dot.style.transform.replace(' scale(2.4)', ''); });
    });
  }

  /* ── Page-specific modules injected here (catalog, standalone gallery lead) ── */
  if (typeof window.JG_pageInit === 'function') {
    window.JG_pageInit({ utmParams: utmParams, getMetaIds: getMetaIds, fmt: fmt, openLightbox: openLightbox, initBrief: initBrief });
  }
  }; /* end initApp */

  /* Run when browser is idle; fallback to 200ms timeout */
  if ('requestIdleCallback' in window) {
    requestIdleCallback(initApp, { timeout: 2000 });
  } else {
    setTimeout(initApp, 200);
  }
