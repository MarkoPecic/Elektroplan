/* ==========================================================================
   Elektroplan Kruševac — main.js
   Vanilla JS, bez build koraka. Moduli:
     1. Kalkulator potrošnje (hero)
     2. Hotspotovi na hero slici
     3. Carousel projekata (autoplay + strelice + tačke)
     4. FAQ akordeon
     5. Brojači u sekciji "O nama"
     6. Hover animacija dugmića (GSAP, opciono)
     7. Kontakt forma (Web3Forms / FormSubmit)
   Svi hookovi u HTML-u su data-atributi: data-action, data-slider, data-faq…
   ========================================================================== */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* 1. Kalkulator --------------------------------------------------------- */
  var CALC = {
    KWH_PRICE: 12.5,      // din/kWh, prosek dvotarifno
    YIELD_PER_KWP: 1155,  // kWh godišnje po kWp
    EUR: 117,             // din
    SUBSIDY_CAP: 420000,  // din
    PRICE_PER_KW: 640,    // €/kW van tipskih paketa
    PACKAGES: [{ kw: 8, price: 6000 }, { kw: 10, price: 7500 }, { kw: 14, price: 9000 }]
  };

  function calculate(annual) {
    var kwh = Math.min(200000, Math.max(0, Number(annual) || 0));
    var need = kwh / CALC.YIELD_PER_KWP;
    var pack = CALC.PACKAGES.filter(function (p) { return need <= p.kw + 1; })[0];
    var kw = pack ? pack.kw : Math.round(need);
    var price = pack ? pack.price : Math.round((kw * CALC.PRICE_PER_KW) / 100) * 100;
    var produced = kw * CALC.YIELD_PER_KWP;
    var savedKwh = Math.min(produced, kwh * 0.95);
    var savingsMonth = (savedKwh * CALC.KWH_PRICE) / 12;
    var subsidy = Math.min(price * 0.5, CALC.SUBSIDY_CAP / CALC.EUR);
    return { kw: kw, needKw: need, price: price, after: price - subsidy, savingsMonth: savingsMonth };
  }

  function initCalculator() {
    var input = document.querySelector('[data-action="kwh"]');
    if (!input) return;
    var box = input.closest('#kalkulator') || document;
    var kwOut = box.querySelector('strong');
    var noteOut = box.querySelectorAll('span')[box.querySelectorAll('span').length - 1];

    function render() {
      var r = calculate(input.value);
      if (kwOut) kwOut.textContent = r.needKw.toFixed(2).replace('.', ',') + ' kW';
      if (noteOut) {
        noteOut.textContent = 'preporučena snaga · ' +
          Math.round(r.savingsMonth).toLocaleString('sr-RS') + ' din/mes';
      }
    }
    input.addEventListener('input', render);
    render();
  }

  /* 2. Hotspotovi --------------------------------------------------------- */
  /* Sekvenca: otvaranje = linija se iscrtava od kruga, pa tek onda tekst.
     Zatvaranje = prvo nestane tekst, pa se linija uvuče natrag ka krugu. */
  function initHotspots() {
    var LINE_IN = 0.7, LINE_OUT = 0.6, TEXT_IN = 0.4, TEXT_OUT = 0.3,
        TEXT_IN_DELAY = 0.42, LINE_OUT_DELAY = 0.2;

    document.querySelectorAll('[data-hotspot]').forEach(function (root) {
      var btn = root.querySelector('[data-action="hotspot"]');
      var line = root.querySelector('[data-hs-line]');
      var label = root.querySelector('[data-hs-label]');
      if (!btn) return;

      var len = 330;
      if (line && line.getTotalLength) {
        try { len = Math.ceil(line.getTotalLength()); } catch (err) {}
      }
      if (line) {
        line.style.strokeDasharray = len;
        line.style.strokeDashoffset = len;
      }
      if (label) {
        label.style.opacity = '0';
        label.style.transform = 'translateY(6px)';
      }

      function set(open) {
        root.dataset.open = open ? '1' : '0';
        btn.setAttribute('aria-expanded', open ? 'true' : 'false');
        if (reduceMotion) {
          if (line) { line.style.transition = 'none'; line.style.strokeDashoffset = open ? 0 : len; }
          if (label) { label.style.transition = 'none'; label.style.opacity = open ? '1' : '0'; label.style.transform = 'translateY(0)'; }
          return;
        }
        if (open) {
          if (line) {
            line.style.transition = 'stroke-dashoffset ' + LINE_IN + 's cubic-bezier(0.4,0,0.2,1)';
            line.style.strokeDashoffset = 0;
          }
          if (label) {
            label.style.transition = 'opacity ' + TEXT_IN + 's ease ' + TEXT_IN_DELAY + 's, transform ' +
              TEXT_IN + 's cubic-bezier(0.2,0.8,0.2,1) ' + TEXT_IN_DELAY + 's';
            label.style.opacity = '1';
            label.style.transform = 'translateY(0)';
          }
        } else {
          if (label) {
            label.style.transition = 'opacity ' + TEXT_OUT + 's ease, transform ' + TEXT_OUT + 's ease';
            label.style.opacity = '0';
            label.style.transform = 'translateY(6px)';
          }
          if (line) {
            line.style.transition = 'stroke-dashoffset ' + LINE_OUT + 's cubic-bezier(0.4,0,0.2,1) ' + LINE_OUT_DELAY + 's';
            line.style.strokeDashoffset = len;
          }
        }
      }

      btn.setAttribute('aria-expanded', 'false');
      btn.addEventListener('click', function () { set(root.dataset.open !== '1'); });
      btn.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar') {
          e.preventDefault();
          set(root.dataset.open !== '1');
        }
      });
    });
  }

  /* 3. Carousel projekata ------------------------------------------------- */
  function initSlider() {
    var wrap = document.querySelector('[data-slider]');
    if (!wrap) return;
    var track = wrap.querySelector('[data-slider-track]');
    var total = Number(wrap.dataset.countSlides || 0);
    var autoTimer = null;
    var loopTimer = null;

    function step() {
      var first = track.children[0];
      return first ? first.getBoundingClientRect().width + 16 : 0;
    }

    function go(dir, to) {
      var n = total;
      var s = step();
      if (!n || !s) return;
      var i = Number(wrap.dataset.index || 0);
      i = (to !== undefined && to !== null) ? to : i + dir;

      if (i < 0) {
        track.style.transition = 'none';
        track.style.transform = 'translateX(-' + (n * s) + 'px)';
        void track.getBoundingClientRect().width;
        track.style.transition = 'transform 0.6s cubic-bezier(0.4,0,0.2,1)';
        i = n - 1;
      }
      wrap.dataset.index = String(i);
      track.style.transform = 'translateX(-' + (i * s) + 'px)';

      if (i >= n) {
        clearTimeout(loopTimer);
        loopTimer = setTimeout(function () {
          track.style.transition = 'none';
          var j = i - n;
          wrap.dataset.index = String(j);
          track.style.transform = 'translateX(-' + (j * s) + 'px)';
          void track.getBoundingClientRect().width;
          track.style.transition = 'transform 0.6s cubic-bezier(0.4,0,0.2,1)';
        }, 640);
      }
      var active = ((i % n) + n) % n;
      document.querySelectorAll('[data-dot]').forEach(function (d, k) {
        d.style.width = k === active ? '26px' : '8px';
        d.style.background = k === active ? '#101418' : 'rgba(16,20,24,0.22)';
      });
    }

    function autoplay() {
      clearInterval(autoTimer);
      if (reduceMotion) return;
      autoTimer = setInterval(function () { go(1); }, 4000);
    }

    document.querySelectorAll('[data-action="slider-prev"]').forEach(function (b) {
      b.addEventListener('click', function () { go(-1); autoplay(); });
    });
    document.querySelectorAll('[data-action="slider-next"]').forEach(function (b) {
      b.addEventListener('click', function () { go(1); autoplay(); });
    });
    document.querySelectorAll('[data-action="slider-dot"]').forEach(function (b) {
      b.addEventListener('click', function () { go(0, Number(b.dataset.dot)); autoplay(); });
    });

    setTimeout(autoplay, 1200);
  }

  /* 4. FAQ akordeon ------------------------------------------------------- */
  function initFaq() {
    document.querySelectorAll('[data-action="faq"]').forEach(function (head) {
      head.addEventListener('click', function () {
        var row = head.closest('[data-faq]');
        if (!row) return;
        var body = row.querySelector('[data-faq-body]');
        var icon = row.querySelector('[data-faq-icon]');
        var open = body.dataset.open === '1';

        if (open) {
          body.style.maxHeight = body.scrollHeight + 'px';
          void body.offsetHeight;
          body.style.maxHeight = '0px';
          body.style.opacity = '0';
          body.style.paddingBottom = '0px';
          body.dataset.open = '0';
        } else {
          body.style.maxHeight = '0px';
          body.style.paddingBottom = '22px';
          void body.offsetHeight;
          body.style.opacity = '1';
          body.style.maxHeight = (body.scrollHeight + 24) + 'px';
          body.dataset.open = '1';
          setTimeout(function () {
            if (body.dataset.open === '1') body.style.maxHeight = 'none';
          }, 470);
        }
        if (icon) {
          icon.textContent = open ? '+' : '−';
          icon.style.transform = open ? 'rotate(0deg)' : 'rotate(180deg)';
        }
        head.setAttribute('aria-expanded', open ? 'false' : 'true');
      });
    });
  }

  /* 5. Brojači ------------------------------------------------------------ */
  function initCounters() {
    var nodes = Array.prototype.slice.call(document.querySelectorAll('[data-count]'));
    if (!nodes.length || reduceMotion || !('IntersectionObserver' in window)) return;
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        io.unobserve(e.target);
        var target = parseFloat(e.target.getAttribute('data-count'));
        var t0 = performance.now();
        e.target.textContent = '0';
        (function tick(t) {
          var p = Math.min(1, (t - t0) / 1100);
          e.target.textContent = String(Math.round(target * (1 - Math.pow(1 - p, 3))));
          if (p < 1) requestAnimationFrame(tick);
        })(t0);
      });
    }, { threshold: 0.4 });
    nodes.forEach(function (n) { io.observe(n); });
  }

  /* 6. Hover dugmića -------------------------------------------------------
     Label swap je u CSS-u (.nav__l1 / .nav__l2 + [data-btn]:hover), pa radi i
     bez GSAP-a. Ovde ostaje samo rotacija strelice. */
  function initButtonHover() {
    if (reduceMotion) return;

    document.querySelectorAll('[data-btn]').forEach(function (el) {
      if (el.dataset.btnBound) return;
      var arrow = el.querySelector('[data-btn-arrow]');
      if (!arrow) return;
      el.dataset.btnBound = '1';
      arrow.style.transition = 'transform 0.5s cubic-bezier(0.33, 1, 0.68, 1)';
      el.addEventListener('mouseenter', function () {
        arrow.style.transform = 'rotate(45deg)';
      });
      el.addEventListener('mouseleave', function () {
        arrow.style.transform = 'rotate(0deg)';
      });
    });
  }

  /* 7. Kontakt forma ------------------------------------------------------ */
  /* Primarno: Web3Forms (action forme + hidden access_key u index.html).
     Ako access_key nije upisan, šalje preko FormSubmit AJAX endpoint-a na
     info@elektroplan.rs — FormSubmit prvi put pošalje mejl za aktivaciju,
     treba kliknuti link u njemu. Za Formspree: promeni action na
     https://formspree.io/f/XXXX i access_key ostavi prazan. */
  var FALLBACK_ENDPOINT = 'https://formsubmit.co/ajax/info@elektroplan.rs';
  function initForm() {
    var form = document.querySelector('[data-action="submit"]');
    if (!form) return;
    var btn = form.querySelector('button[type="submit"]');
    var status = form.querySelector('[data-form-status]');
    var fields = Array.prototype.slice.call(form.querySelectorAll('[required]'));
    var oneOf = Array.prototype.slice.call(form.querySelectorAll('[data-one-of="kontakt"]'));

    function oneOfFilled() {
      return oneOf.some(function (el) { return (el.value || '').trim() !== ''; });
    }
    function oneOfError() {
      if (!oneOf.length) return '';
      if (!oneOfFilled()) return 'Ostavi telefon ili mejl, da možemo da ti odgovorimo.';
      var tel = form.querySelector('#telefon');
      var mail = form.querySelector('#mejl');
      var tv = tel ? (tel.value || '').trim() : '';
      var mv = mail ? (mail.value || '').trim() : '';
      if (tv && tv.replace(/\D/g, '').length < 8) return 'Unesi ispravan broj telefona.';
      if (mv && !/^[^@\s]+@[^@\s.]+\.[^@\s]{2,}$/.test(mv)) return 'Unesi ispravnu mejl adresu.';
      return '';
    }

    function say(msg, kind) {
      if (!status) return;
      status.textContent = msg || '';
      status.dataset.kind = kind || '';
    }

    function label(el) {
      var l = form.querySelector('label[for="' + el.id + '"]');
      return l ? l.textContent.replace(/\(.*?\)/, '').trim() : 'Polje';
    }

    function validate(el) {
      var v = (el.value || '').trim();
      var msg = '';
      if (!v) msg = label(el) + ' je obavezno polje.';
      else if (el.id === 'telefon' && v.replace(/\D/g, '').length < 8) msg = 'Unesi ispravan broj telefona.';
      else if (el.minLength > 0 && v.length < el.minLength) msg = 'Opiši potrošnju i tip krova — bez toga ne možemo da izračunamo proračun.';
      el.setAttribute('aria-invalid', msg ? 'true' : 'false');
      el.dataset.invalid = msg ? '1' : '';
      return msg;
    }

    oneOf.forEach(function (el) {
      el.addEventListener('input', function () {
        var m = oneOfError();
        oneOf.forEach(function (o) {
          o.setAttribute('aria-invalid', m ? 'true' : 'false');
          o.dataset.invalid = m ? '1' : '';
        });
        if (!m) say('');
      });
    });

    fields.forEach(function (el) {
      el.addEventListener('blur', function () { validate(el); });
      el.addEventListener('input', function () {
        if (el.dataset.invalid) { validate(el); if (!el.dataset.invalid) say(''); }
      });
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var firstError = '';
      var firstEl = null;
      fields.forEach(function (el) {
        var m = validate(el);
        if (m && !firstError) { firstError = m; firstEl = el; }
      });
      if (!firstError) {
        var oneMsg = oneOfError();
        if (oneMsg) {
          firstError = oneMsg;
          firstEl = oneOf[0];
          oneOf.forEach(function (o) { o.setAttribute('aria-invalid', 'true'); o.dataset.invalid = '1'; });
        }
      }
      if (firstError) {
        say(firstError, 'error');
        if (firstEl) firstEl.focus();
        return;
      }

      var l1 = btn && btn.querySelector('[data-l1]');
      var l2 = btn && btn.querySelector('[data-l2]');
      function setLabel(t) { if (l1) l1.textContent = t; if (l2) l2.textContent = t; }

      if (btn) btn.disabled = true;
      setLabel('Šaljem…');
      say('');

      var data = new FormData(form);
      var keyEl = form.querySelector('[name="access_key"]');
      var key = keyEl ? keyEl.value.trim() : '';
      var action = form.getAttribute('action') || '';
      var endpoint = action;

      if (action.indexOf('api.web3forms.com') > -1 && !key) {
        endpoint = FALLBACK_ENDPOINT;
        data.delete('access_key');
        data.delete('botcheck');
        data.delete('from_name');
        data.delete('subject');
        data.append('_subject', 'Novi upit sa sajta — Elektroplan');
        data.append('_template', 'table');
        data.append('_captcha', 'false');
      } else if (action.indexOf('formsubmit.co') > -1) {
        endpoint = action.replace('formsubmit.co/', 'formsubmit.co/ajax/');
      }

      fetch(endpoint, { method: 'POST', body: data, headers: { Accept: 'application/json' } })
        .then(function (r) {
          return r.json().then(function (j) {
            if (!r.ok || j.success === false) return Promise.reject(j);
            return j;
          });
        })
        .then(function () {
          setLabel('Primljeno — zovemo te');
          say('Upit je poslat. Odgovaramo istog radnog dana.', 'ok');
          form.reset();
        })
        .catch(function () {
          if (btn) btn.disabled = false;
          setLabel('Pošalji upit');
          say('Slanje nije uspelo. Pozovi 060/086-26-11 ili piši na info@elektroplan.rs.', 'error');
        });
    });
  }

  /* Init ------------------------------------------------------------------ */
  function init() {
    initCalculator();
    initHotspots();
    initSlider();
    initFaq();
    initCounters();
    initButtonHover();
    initForm();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
