/* =========================================================
   オモシク HP v2 — interactions (GSAP ScrollTrigger)
   公転アニメは CSS 側で完結。JS は演出・ナビ・KPI・フォーム。
   ========================================================= */
(function () {
  "use strict";
  var hasGSAP = typeof window.gsap !== "undefined";
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (hasGSAP) gsap.registerPlugin(ScrollTrigger);

  var EASE = { smooth: "power2.out", snappy: "power3.out", bounce: "back.out(1.4)" };

  /* ---------- Navigation ---------- */
  function initNav() {
    var nav = document.getElementById("nav");
    if (nav) {
      var onScroll = function () { nav.classList.toggle("scrolled", window.scrollY > 40); };
      onScroll();
      window.addEventListener("scroll", onScroll, { passive: true });
    }

    // active section highlight
    if (hasGSAP && !reduce) {
      ["#strengths", "#services", "#results", "#about", "#method"].forEach(function (id) {
        var el = document.querySelector(id);
        if (!el) return;
        ScrollTrigger.create({
          trigger: id, start: "top center", end: "bottom center",
          onToggle: function (self) { if (self.isActive) highlight(id); }
        });
      });
    }
    function highlight(id) {
      document.querySelectorAll(".nav-links a").forEach(function (a) {
        a.classList.toggle("active", a.getAttribute("href") === id);
      });
    }

    // hamburger + mobile menu
    var burger = document.getElementById("hamburger");
    var menu = document.getElementById("mobileMenu");
    var close = document.getElementById("mobileMenuClose");
    function open() { burger.classList.add("active"); menu.classList.add("active"); document.body.style.overflow = "hidden"; burger.setAttribute("aria-expanded", "true"); }
    function shut() { burger.classList.remove("active"); menu.classList.remove("active"); document.body.style.overflow = ""; burger.setAttribute("aria-expanded", "false"); }
    if (burger && menu) {
      burger.addEventListener("click", function () { menu.classList.contains("active") ? shut() : open(); });
      if (close) close.addEventListener("click", shut);
      menu.querySelectorAll("a").forEach(function (a) { a.addEventListener("click", shut); });
    }
  }

  /* ---------- Hero particles ---------- */
  function initParticles() {
    var box = document.getElementById("heroParticles");
    if (!box || reduce) return;
    var count = window.innerWidth <= 768 ? 22 : 46;
    for (var i = 0; i < count; i++) {
      var p = document.createElement("div");
      p.className = "particle";
      var size = 1.5 + Math.random() * 2.5;
      var amber = Math.random() < 0.62;
      p.style.width = p.style.height = size + "px";
      p.style.backgroundColor = amber ? "rgba(255,150,70,0.85)" : "rgba(255,255,255,0.65)";
      p.style.left = (Math.random() * 100) + "%";
      p.style.animationDuration = (6 + Math.random() * 8) + "s";
      p.style.animationDelay = (Math.random() * 9) + "s";
      box.appendChild(p);
    }
  }

  /* ---------- Magnetic buttons (desktop) ---------- */
  function initMagnetic() {
    if (window.matchMedia("(max-width:860px)").matches) return;
    document.querySelectorAll(".magnetic").forEach(function (btn) {
      var s = parseFloat(btn.dataset.strength) || 0.25;
      btn.addEventListener("mousemove", function (e) {
        var r = btn.getBoundingClientRect();
        btn.style.transform = "translate(" + (e.clientX - (r.left + r.width / 2)) * s + "px," + (e.clientY - (r.top + r.height / 2)) * s + "px)";
      });
      btn.addEventListener("mouseleave", function () { btn.style.transform = "translate(0,0)"; });
    });
  }

  /* ---------- Count up ---------- */
  function countUp(el, end) {
    if (!hasGSAP || reduce) { el.textContent = end; return; }
    var o = { v: 0 };
    gsap.to(o, { v: end, duration: 1.8, ease: EASE.smooth, onUpdate: function () { el.textContent = Math.round(o.v); } });
  }

  /* ---------- Hero entrance ---------- */
  function initHeroEntrance() {
    if (!hasGSAP || reduce) return;
    var tl = gsap.timeline({ delay: 0.15 });
    tl.from(".hero-eyebrow", { y: 18, opacity: 0, duration: 0.6, ease: EASE.smooth })
      .from(".hero-title", { y: 26, opacity: 0, duration: 0.8, ease: EASE.snappy }, "-=0.3")
      .from(".hero-sub", { y: 20, opacity: 0, duration: 0.7, ease: EASE.smooth }, "-=0.45")
      .from(".hero-cta-group", { y: 18, opacity: 0, duration: 0.6, ease: EASE.bounce }, "-=0.4")
      .from(".hero-trust, .hero-chips", { y: 16, opacity: 0, duration: 0.5, stagger: 0.12 }, "-=0.35")
      .from(".hero-visual", { scale: 0.9, opacity: 0, duration: 1.0, ease: EASE.smooth }, "-=1.0");
  }

  /* ---------- Section reveals ---------- */
  function reveal(selector, vars) {
    if (!hasGSAP) return;
    document.querySelectorAll(selector).forEach(function (el) {
      gsap.from(el, Object.assign({
        y: 38, opacity: 0, duration: 0.7, ease: EASE.snappy, clearProps: "transform",
        scrollTrigger: { trigger: el, start: "top 85%" }
      }, vars || {}));
    });
  }
  function revealStagger(container, items, vars) {
    if (!hasGSAP) return;
    document.querySelectorAll(container).forEach(function (box) {
      gsap.from(box.querySelectorAll(items), Object.assign({
        y: 40, opacity: 0, duration: 0.6, stagger: 0.1, ease: EASE.snappy, clearProps: "transform",
        scrollTrigger: { trigger: box, start: "top 82%" }
      }, vars || {}));
    });
  }

  function initReveals() {
    if (!hasGSAP || reduce) return;
    reveal(".section-head");
    revealStagger(".fail-grid", ".fail-col");
    revealStagger(".strength-grid", ".strength-card");
    revealStagger(".service-grid", ".service-card");
    revealStagger(".theme-grid", ".theme-card");
    revealStagger(".kpi-grid", ".kpi-card", {
      scrollTrigger: {
        trigger: ".kpi-grid", start: "top 82%", once: true,
        onEnter: function () {
          document.querySelectorAll(".kpi-value span[data-count]").forEach(function (el) {
            countUp(el, parseFloat(el.dataset.count));
          });
        }
      }
    });
    revealStagger(".method-list", ".method-step");
    reveal(".about-top", { x: -30, y: 0 });
    revealStagger(".about-cards", ".about-card");
    revealStagger(".case-grid", ".case-card");
    revealStagger(".pain-grid", ".pain-card");
    reveal(".cta-title", { scale: 0.94, y: 0, ease: EASE.bounce, duration: 0.9 });
    reveal(".cta-actions, .cta-trust, .contact-form");

    // case stats count up
    document.querySelectorAll(".case-stat-num").forEach(function (el) {
      var end = parseFloat(el.textContent);
      ScrollTrigger.create({
        trigger: el, start: "top 88%", once: true,
        onEnter: function () { countUp(el, end); }
      });
    });
  }

  /* ---------- Card 3D tilt (desktop) ---------- */
  function initTilt() {
    if (!hasGSAP || reduce || window.matchMedia("(max-width:860px)").matches) return;
    document.querySelectorAll(".service-card, .strength-card, .about-card, .case-card").forEach(function (card) {
      card.addEventListener("mousemove", function (e) {
        var r = card.getBoundingClientRect();
        gsap.to(card, { rotateY: ((e.clientX - r.left) / r.width - 0.5) * 8, rotateX: -((e.clientY - r.top) / r.height - 0.5) * 8, duration: 0.2, transformPerspective: 900 });
      });
      card.addEventListener("mouseleave", function () { gsap.to(card, { rotateX: 0, rotateY: 0, duration: 0.4, ease: "back.out(1)" }); });
    });
  }

  /* ---------- Placeholder links (まだ実体なし) ---------- */
  function initPlaceholders() {
    document.querySelectorAll('a.is-placeholder[href="#"]').forEach(function (a) {
      a.addEventListener("click", function (e) { e.preventDefault(); });
    });
  }

  /* ---------- Contact form (GAS) ---------- */
  function initForm() {
    var form = document.getElementById("contactForm");
    if (!form) return;
    var GAS_URL = "https://script.google.com/macros/s/AKfycbwtBBI9W8HUZjdVbp5W7Lb_wwMSkryeN34sFA5-va9233YIRt8ast_xRiQY5gXdSFjl/exec";
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (form.website && form.website.value) return; // honeypot
      if (!form.checkValidity()) { form.reportValidity(); return; }
      var btn = document.getElementById("formSubmit");
      var orig = btn.innerHTML;
      btn.disabled = true; btn.innerHTML = "送信中...";
      var get = function (n) { var el = form.querySelector('[name="' + n + '"]'); return el ? el.value : ""; };
      var data = { name: get('name'), email: get('email'), company: get('company'), phone: get('phone'), category: get('category'), message: get('message') };
      fetch(GAS_URL, { method: "POST", mode: "no-cors", headers: { "Content-Type": "text/plain" }, body: JSON.stringify(data) })
        .then(function () {
          form.hidden = true;
          var ok = document.getElementById("formSuccess");
          ok.hidden = false; ok.scrollIntoView({ behavior: "smooth", block: "center" });
        })
        .catch(function () {
          btn.disabled = false; btn.innerHTML = orig;
          alert("送信に失敗しました。お手数ですが info@omoshiku.jp まで直接ご連絡ください。");
        });
    });
  }

  /* ---------- Boot ---------- */
  function boot() {
    initNav();
    initParticles();
    initPlaceholders();
    initForm();
    initHeroEntrance();
    initReveals();
    initMagnetic();
    initTilt();
    if (hasGSAP && reduce) ScrollTrigger.getAll().forEach(function (s) { s.kill(); });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
