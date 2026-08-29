/* ==========================================================================
   Elektroplan Kruševac — main.js
   Vanilla JS, bez build koraka. Moduli:
     1. Kalkulator potrošnje (hero)
     2. Hotspotovi na hero slici
     3. Carousel projekata (autoplay + strelice + tačke)
     4. FAQ akordeon
     5. Brojači u sekciji "O nama"
     6. Hover animacija dugmića (GSAP, opciono)
     7. Kontakt forma (demo — bez backenda)
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
  function initHotspots() {
    document.querySelectorAll('[data-action="hotspot"]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var root = btn.closest('[data-hotspot]');
        if (!root) return;
        var line = root.querySelector('[data-hs-line]');
        var label = root.querySelector('[data-hs-label]');
        var open = root.dataset.open === '1';
        root.dataset.open = open ? '0' : '1';
        if (line) line.style.strokeDashoffset = open ? '330' : '0';
        if (label) {
          label.style.opacity = open ? '0' : '1';
          label.style.transform = open ? 'translateY(8px)' : 'translateY(0)';
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

  /* 6. Hover dugmića (label swap) ----------------------------------------- */
  function initButtonHover() {
    if (reduceMotion) return;
    var gsap = window.gsap;
    if (!gsap) return setTimeout(initButtonHover, 120);

    document.querySelectorAll('[data-btn]').forEach(function (el) {
      if (el.dataset.btnBound) return;
      el.dataset.btnBound = '1';
      var l1 = el.querySelector('[data-l1]');
      var l2 = el.querySelector('[data-l2]');
      var arrow = el.querySelector('[data-btn-arrow]');
      var ease = 'power3.inOut';

      el.addEventListener('mouseenter', function () {
        if (l1) gsap.to([l1, l2], { yPercent: -100, duration: 0.5, ease: ease });
        if (arrow) gsap.to(arrow, { rotate: 45, duration: 0.5, ease: 'power3.out' });
      });
      el.addEventListener('mouseleave', function () {
        if (l1) gsap.to([l1, l2], { yPercent: 0, duration: 0.5, ease: ease });
        if (arrow) gsap.to(arrow, { rotate: 0, duration: 0.5, ease: 'power3.out' });
      });
    });
  }

  /* 7. Kontakt forma ------------------------------------------------------ */
  /* Demo: nema backenda. Za produkciju zameni telo handlera pozivom ka
     svom endpointu (fetch POST) ili servisu tipa Formspree / Netlify Forms. */
  function initForm() {
    var form = document.querySelector('[data-action="submit"]');
    if (!form) return;
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var btn = form.querySelector('button[type="submit"]');
      if (!btn) return;
      var l1 = btn.querySelector('[data-l1]');
      var l2 = btn.querySelector('[data-l2]');
      if (l1) l1.textContent = 'Primljeno — zovemo te';
      if (l2) l2.textContent = 'Primljeno — zovemo te';
      btn.disabled = true;
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
