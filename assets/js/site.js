/* Ray Hsieh portfolio, v4: language, menu, player, work filter, process steps, contact form, entrances. */
(function () {
  'use strict';

  var d = document.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  var works = window.WORKS || {};
  var MAIL = 'rrrayhsieh@gmail.com';
  var PAGES = /^(index|about|work|contact)\.html(?=$|[?#])/;

  function lang() { return d.getAttribute('data-lang') === 'en' ? 'en' : 'zh'; }
  function pick(pair) { return pair ? pair[lang() === 'en' ? 1 : 0] : ''; }
  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  /* ---------- language: one switch for every page ---------- */
  var zhTitle = document.title;
  var descMeta = document.querySelector('meta[name="description"]');
  var zhDesc = descMeta ? descMeta.getAttribute('content') : '';

  function swap(attr, l) {
    var en = 'data-' + attr + '-en', zh = 'data-' + attr + '-zh';
    var real = attr === 'aria' ? 'aria-label' : attr;
    document.querySelectorAll('[' + en + ']').forEach(function (el) {
      if (!el.hasAttribute(zh)) el.setAttribute(zh, el.getAttribute(real) || '');
      el.setAttribute(real, el.getAttribute(l === 'en' ? en : zh));
    });
  }

  // links between the four pages carry the language, so it holds even where storage is blocked
  function carry(l) {
    document.querySelectorAll('a[href]').forEach(function (a) {
      var base = a.getAttribute('data-page-href');
      if (base === null) {
        base = a.getAttribute('href');
        if (!PAGES.test(base)) return;
        a.setAttribute('data-page-href', base);
      }
      if (l !== 'en') { a.setAttribute('href', base); return; }
      var hash = base.indexOf('#') >= 0 ? base.slice(base.indexOf('#')) : '';
      var path = hash ? base.slice(0, base.indexOf('#')) : base;
      a.setAttribute('href', path + (path.indexOf('?') >= 0 ? '&' : '?') + 'lang=en' + hash);
    });
  }

  function setLang(l, remember) {
    d.setAttribute('data-lang', l);
    d.lang = l === 'en' ? 'en' : 'zh-Hant';
    document.title = l === 'en' ? (d.getAttribute('data-title-en') || zhTitle) : zhTitle;
    if (descMeta) descMeta.setAttribute('content', l === 'en' ? (d.getAttribute('data-desc-en') || zhDesc) : zhDesc);
    swap('alt', l);
    swap('aria', l);
    swap('href', l);
    swap('placeholder', l);
    carry(l);
    document.querySelectorAll('[data-set-lang]').forEach(function (b) {
      b.setAttribute('aria-pressed', String(b.getAttribute('data-set-lang') === l));
    });
    if (!remember) return;
    try { localStorage.setItem('lang', l); } catch (e) {}
    try {
      var u = new URL(location.href);
      if (l === 'en') u.searchParams.set('lang', 'en'); else u.searchParams.delete('lang');
      history.replaceState(null, '', u);
    } catch (e) {}
  }

  document.addEventListener('click', function (e) {
    var b = e.target.closest('[data-set-lang]');
    if (b) setLang(b.getAttribute('data-set-lang'), true);
  });

  /* ---------- the menu on a phone ---------- */
  var menuBtn = document.querySelector('[data-menu]');
  function closeMenu() {
    if (!d.classList.contains('menu-open')) return;
    d.classList.remove('menu-open');
    menuBtn.setAttribute('aria-expanded', 'false');
  }
  if (menuBtn) {
    menuBtn.addEventListener('click', function () {
      var open = !d.classList.contains('menu-open');
      d.classList.toggle('menu-open', open);
      menuBtn.setAttribute('aria-expanded', String(open));
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && d.classList.contains('menu-open')) { closeMenu(); menuBtn.focus(); }
    });
    document.addEventListener('click', function (e) {
      if (!e.target.closest('.nav')) closeMenu();
    });
  }

  /* ---------- the player: a picture or a button opens its work ---------- */
  var dlg = document.getElementById('player');
  var stage = dlg && dlg.querySelector('[data-stage]');
  var titleEl = dlg && dlg.querySelector('[data-title]');
  var subEl = dlg && dlg.querySelector('[data-sub]');
  var outEl = dlg && dlg.querySelector('[data-out]');
  var lastFocus = null;

  function outLabel(w) {
    if (w.k === 'yt') return lang() === 'en' ? 'Watch on YouTube' : '在 YouTube 看完整版';
    if (w.p && w.p[1] === 'Course page') return lang() === 'en' ? 'Open the course page' : '看課程頁';
    return lang() === 'en' ? 'Open on ' + w.p[1] : '在 ' + w.p[0] + ' 上看';
  }

  function openWork(a) {
    var slug = a.getAttribute('data-work');
    var n = a.getAttribute('data-n') || '0';
    var w = works[slug];
    if (!w || !dlg || typeof dlg.showModal !== 'function') return false;
    lastFocus = document.activeElement;
    stage.innerHTML = '';
    dlg.setAttribute('data-f', w.f);
    dlg.setAttribute('data-k', w.k);
    var s = parseInt(a.getAttribute('data-start') || '0', 10) || 0;

    if (w.k === 'yt') {
      var f = document.createElement('iframe');
      f.src = 'https://www.youtube-nocookie.com/embed/' + encodeURIComponent(w.id) +
        '?autoplay=1&rel=0&playsinline=1' + (s ? '&start=' + s : '');
      // YouTube's own embed permissions, plus compute-pressure, which its player asks for
      f.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen; compute-pressure';
      f.referrerPolicy = 'strict-origin-when-cross-origin';
      f.title = pick(w.t);
      stage.appendChild(f);
      outEl.href = 'https://www.youtube.com/watch?v=' + encodeURIComponent(w.id) + (s ? '&t=' + s + 's' : '');
    } else if (w.k === 'local') {
      var v = document.createElement('video');
      v.src = 'assets/clips/' + slug + '-' + n + '.mp4';
      v.poster = 'assets/img/' + slug + '-' + n + '.webp';
      v.controls = true;
      v.playsInline = true;
      v.preload = 'auto';
      stage.appendChild(v);
      var p = v.play();
      if (p && p.catch) p.catch(function () { v.muted = true; v.play().catch(function () {}); });
    } else {
      // the still opens the post itself, so the play button printed on it works
      var link = document.createElement('a');
      link.href = w.url;
      link.target = '_blank';
      link.rel = 'noopener';
      var img = document.createElement('img');
      img.src = 'assets/img/' + slug + '-0.webp';
      img.alt = pick(w.t);
      link.appendChild(img);
      stage.appendChild(link);
      outEl.href = w.url;
    }
    outEl.hidden = w.k === 'local';
    if (!outEl.hidden) outEl.textContent = outLabel(w);

    var en = lang() === 'en';
    var label = a.getAttribute(en ? 'data-label-en' : 'data-label-zh');
    var sub = [label ? pick(w.t) : '', pick(w.c), pick(w.r)];
    if (w.k === 'local') sub.push(w.full ? (en ? 'Full film' : '完整影片') : (en ? '8-second excerpt' : '8 秒片段'));
    titleEl.textContent = label || pick(w.t);
    // each part keeps to one line; the line breaks between parts
    subEl.innerHTML = sub.filter(Boolean).map(function (x) {
      return '<span class="nowrap">' + esc(x) + '</span>';
    }).join(en ? ' · ' : '｜');
    dlg.showModal();
    return true;
  }

  if (dlg) {
    dlg.addEventListener('close', function () {
      stage.innerHTML = '';
      if (lastFocus && lastFocus.focus) lastFocus.focus();
    });
    dlg.addEventListener('click', function (e) { if (e.target === dlg) dlg.close(); });
    dlg.querySelector('[data-close]').addEventListener('click', function () { dlg.close(); });
  }

  document.addEventListener('click', function (e) {
    var a = e.target.closest('a[data-work]');
    if (!a || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    if (openWork(a)) e.preventDefault();
  });

  /* ---------- work: three kinds, one list ---------- */
  var filterBtns = document.querySelectorAll('[data-filter]');
  function applyFilter(f) {
    filterBtns.forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-filter') === f)); });
    document.querySelectorAll('[data-cat]').forEach(function (el) {
      el.hidden = f !== 'all' && el.getAttribute('data-cat') !== f;
    });
  }
  if (filterBtns.length) {
    filterBtns.forEach(function (b) { b.addEventListener('click', function () { applyFilter(b.getAttribute('data-filter')); }); });
    var fromHash = function () {
      var h = location.hash.slice(1);
      if (h === 'brand' || h === 'course' || h === 'shorts') applyFilter(h);
    };
    fromHash();
    window.addEventListener('hashchange', fromHash);
  }

  /* ---------- home: the five steps, each with its own picture ---------- */
  var stepBtns = document.querySelectorAll('[data-step]');
  function showStep(i) {
    stepBtns.forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-step') === i)); });
    document.querySelectorAll('[data-step-pic]').forEach(function (p) {
      var on = p.getAttribute('data-step-pic') === i;
      p.classList.toggle('is-on', on);
      var v = p.querySelector('video');
      if (!v) return;
      if (on && !reduce.matches) { var pr = v.play(); if (pr && pr.catch) pr.catch(function () {}); } else v.pause();
    });
  }
  stepBtns.forEach(function (b) { b.addEventListener('click', function () { showStep(b.getAttribute('data-step')); }); });

  /* ---------- contact: the form fills a Google Form, or an email until one is set ---------- */
  var form = document.querySelector('[data-contact]');
  if (form) {
    var cfg = window.FORM_CONFIG && window.FORM_CONFIG.action ? window.FORM_CONFIG : null;
    form.setAttribute('data-mode', cfg ? 'google' : 'mail');
    var errEl = form.querySelector('[data-error]');
    var sentEl = form.querySelector('[data-sent]');

    // a tag on the home page arrives as ?type=brand and is already ticked
    try {
      var t = new URLSearchParams(location.search).get('type');
      if (t) form.querySelectorAll('input[data-key="' + t.replace(/[^a-z]/g, '') + '"]').forEach(function (c) { c.checked = true; });
    } catch (e) {}

    var values = function () {
      var v = function (n) { var el = form.elements[n]; return el ? el.value.trim() : ''; };
      var checked = function (n) {
        return Array.prototype.filter.call(form.querySelectorAll('input[name="' + n + '"]'), function (c) { return c.checked; })
          .map(function (c) { return c.value; });
      };
      return { name: v('name'), email: v('email'), org: v('org'), type: checked('type'), need: v('need'),
        budget: checked('budget')[0] || '', when: checked('when')[0] || '' };
    };

    var problem = function () {
      var bad = null;
      ['name', 'email', 'need'].forEach(function (n) {
        var el = form.elements[n];
        var ok = el.checkValidity();
        el.setAttribute('aria-invalid', String(!ok));
        if (!ok && !bad) bad = el;
      });
      return bad;
    };

    var MSG = {
      zh: '請填好稱呼、Email 和想做什麼。', en: 'Please add your name, your email and what you have in mind.',
      failed: { zh: '沒有送出成功，請改用 Email 聯絡我。', en: 'That didn’t go through. Please email me instead.' }
    };

    var asMail = function (x) {
      var en = lang() === 'en';
      var lines = [
        (en ? 'Name: ' : '稱呼：') + x.name,
        'Email: ' + x.email,
        (en ? 'Company: ' : '公司或品牌：') + (x.org || '-'),
        (en ? 'Project type: ' : '專案類型：') + (x.type.join('、') || '-'),
        (en ? 'Budget: ' : '預算範圍：') + (x.budget || '-'),
        (en ? 'Timeline: ' : '希望完成時間：') + (x.when || '-'),
        '',
        x.need
      ];
      var subject = (en ? 'Project enquiry from ' : '專案詢問：') + x.name;
      location.href = 'mailto:' + MAIL + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(lines.join('\n'));
    };

    var toGoogle = function (x) {
      // Google Forms takes a plain form post; the answer cannot be read back, so the frame's load counts as sent
      var frame = document.createElement('iframe');
      frame.name = 'gform-' + Date.now();
      frame.hidden = true;
      document.body.appendChild(frame);
      var post = document.createElement('form');
      post.method = 'POST';
      post.action = cfg.action;
      post.target = frame.name;
      post.hidden = true;
      var add = function (key, val) {
        if (!key) return;
        var i = document.createElement('input');
        i.type = 'hidden';
        i.name = key;
        i.value = val;
        post.appendChild(i);
      };
      var F = cfg.fields || {};
      add(F.name, x.name); add(F.email, x.email); add(F.org, x.org); add(F.need, x.need);
      add(F.budget, x.budget); add(F.when, x.when);
      x.type.forEach(function (t) { add(F.type, t); });
      document.body.appendChild(post);
      var done = false;
      frame.addEventListener('load', function () {
        if (done) return;
        done = true;
        form.querySelectorAll('.field, .send').forEach(function (el) { el.hidden = true; });
        sentEl.hidden = false;
        sentEl.focus();
      });
      setTimeout(function () {
        if (done) return;
        errEl.textContent = MSG.failed[lang()];
        errEl.hidden = false;
      }, 12000);
      post.submit();
    };

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var bad = problem();
      if (bad) {
        errEl.textContent = MSG[lang()];
        errEl.hidden = false;
        bad.focus();
        return;
      }
      errEl.hidden = true;
      var x = values();
      if (cfg) toGoogle(x); else asMail(x);
    });
    // a common project below the form ticks its type and brings the form back into view
    document.querySelectorAll('[data-pick]').forEach(function (a) {
      a.addEventListener('click', function (e) {
        e.preventDefault();
        var key = a.getAttribute('data-pick');
        form.querySelectorAll('input[data-key="' + key + '"]').forEach(function (c) { c.checked = true; });
        form.scrollIntoView({ behavior: reduce.matches ? 'auto' : 'smooth', block: 'start' });
        var need = form.elements.need;
        if (need) setTimeout(function () { need.focus({ preventScroll: true }); }, reduce.matches ? 0 : 450);
      });
    });

    form.addEventListener('input', function (e) {
      if (e.target.getAttribute('aria-invalid') === 'true' && e.target.checkValidity()) e.target.setAttribute('aria-invalid', 'false');
    });
  }

  /* ---------- entrances: nothing is ever hidden; what enters the screen later rises into place ---------- */
  var EASE = 'cubic-bezier(0.2, 0.7, 0.2, 1)';
  function rise(el) {
    if (reduce.matches || !el.animate) return;
    el.animate([{ opacity: 0, transform: 'translateY(24px)' }, { opacity: 1, transform: 'none' }],
      { duration: 550, delay: (+el.getAttribute('data-order') || 0) * 70, easing: EASE, fill: 'backwards' });
  }
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        io.unobserve(en.target);
        rise(en.target);
      });
    });
    var fold = window.innerHeight;
    document.querySelectorAll('[data-reveal]').forEach(function (el) {
      var section = el.closest('section') || el.parentElement;
      var group = Array.prototype.slice.call(section.querySelectorAll('[data-reveal]'));
      el.setAttribute('data-order', Math.min(Math.max(group.indexOf(el), 0), 4));
      if (el.getBoundingClientRect().top >= fold) io.observe(el);
    });

    // looping pictures play only while they are on screen; one marked data-once plays through once and keeps its last frame
    var loops = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        var v = en.target;
        if (v.ended && v.hasAttribute('data-once')) return;
        if (en.isIntersecting && !reduce.matches) { var p = v.play(); if (p && p.catch) p.catch(function () {}); } else v.pause();
      });
    });
    document.querySelectorAll('video[data-autoplay]').forEach(function (v) { loops.observe(v); });
  }
  // a clip wider than its frame follows the person in it: data-track lists time:centre pairs in the clip's own pixels
  document.querySelectorAll('video[data-track]').forEach(function (v) {
    var keys = v.getAttribute('data-track').split(',').map(function (k) { k = k.split(':'); return [parseFloat(k[0]), parseFloat(k[1])]; });
    var sw = +v.getAttribute('width'), sh = +v.getAttribute('height');
    function centre(t) {
      if (t <= keys[0][0]) return keys[0][1];
      for (var i = 1; i < keys.length; i++) {
        if (t <= keys[i][0]) {
          var a = keys[i - 1], b = keys[i], f = (t - a[0]) / (b[0] - a[0]);
          f = f * f * (3 - 2 * f);
          return a[1] + (b[1] - a[1]) * f;
        }
      }
      return keys[keys.length - 1][1];
    }
    function frame() {
      var shown = sh * v.clientWidth / (v.clientHeight || 1);
      if (shown >= sw) { v.style.objectPosition = ''; return; }
      var p = Math.min(Math.max((centre(v.currentTime) - shown / 2) / (sw - shown), 0), 1);
      v.style.objectPosition = (p * 100).toFixed(2) + '% 50%';
    }
    function follow() { frame(); if (!v.paused && !v.ended) requestAnimationFrame(follow); }
    v.addEventListener('play', function () { requestAnimationFrame(follow); });
    v.addEventListener('seeked', frame);
    v.addEventListener('ended', frame);
    window.addEventListener('resize', frame);
    frame();
  });

  if (reduce.addEventListener) reduce.addEventListener('change', function () {
    document.querySelectorAll('video[data-autoplay]').forEach(function (v) { if (reduce.matches) v.pause(); });
  });

  setLang(lang(), false);
})();
