/* LEÓN GYM — interacciones (no hace falta tocar este archivo).
   Los datos para editar están arriba de todo en index.html (window.__LEON__). */
(function () {
  "use strict";
  var CFG = window.__LEON__ || {};
  document.documentElement.classList.add("js");

  function safe(fn, name) { try { fn(); } catch (e) { console.warn("[leon] " + name + " falló:", e); } }

  // Hora actual en Tucumán (UTC-3, sin horario de verano)
  function nowTucuman() {
    var d = new Date();
    return new Date(d.getTime() + d.getTimezoneOffset() * 60000 - 3 * 3600000);
  }
  // Horarios: [abre, cierra] en horas. null = cerrado / consultar
  var HOURS = { 0: null, 1: [8, 22], 2: [8, 22], 3: [8, 22], 4: [8, 22], 5: [8, 22], 6: [8, 15] };

  function initWhatsApp() {
    var num = String(CFG.whatsapp || "").replace(/\D/g, "");
    var valid = num.length >= 10 && !/x/i.test(CFG.whatsapp || "");
    var waText = document.getElementById("waText");
    if (valid && waText) { waText.textContent = "+" + num; waText.classList.remove("todo"); }
    document.querySelectorAll("[data-wa]").forEach(function (a) {
      if (!valid) { a.href = CFG.instagram || a.href; a.target = "_blank"; return; }
      var msg = CFG.mensaje || "";
      var plan = a.getAttribute("data-plan");
      if (plan) msg = "¡Hola León Gym! Quiero info sobre el plan " + plan + ".";
      a.href = "https://wa.me/" + num + "?text=" + encodeURIComponent(msg);
      a.target = "_blank"; a.rel = "noopener";
    });
  }

  function initNav() {
    var nav = document.getElementById("nav");
    var burger = document.getElementById("burger");
    function onScroll() { nav.classList.toggle("is-scrolled", window.scrollY > 30); }
    window.addEventListener("scroll", onScroll, { passive: true }); onScroll();
    function close() { nav.classList.remove("is-open"); burger.setAttribute("aria-expanded", "false"); document.body.style.overflow = ""; }
    burger.addEventListener("click", function () {
      var open = !nav.classList.contains("is-open");
      nav.classList.toggle("is-open", open);
      burger.setAttribute("aria-expanded", String(open));
      document.body.style.overflow = open ? "hidden" : "";
    });
    document.querySelectorAll("#menu a").forEach(function (a) { a.addEventListener("click", close); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") close(); });
  }

  function initOpenStatus() {
    var t = nowTucuman(), day = t.getDay(), h = t.getHours() + t.getMinutes() / 60;
    var range = HOURS[day];
    var open = !!range && h >= range[0] && h < range[1];
    var dot = document.getElementById("openDot"), txt = document.getElementById("openText");
    var box = document.getElementById("statusBox");
    var msg;
    if (open) msg = "Abierto ahora · hasta las " + range[1] + " hs";
    else if (range && h < range[0]) msg = "Cerrado · hoy abrimos a las " + range[0] + " hs";
    else {
      var next = (day + 1) % 7; while (!HOURS[next]) next = (next + 1) % 7;
      var names = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];
      msg = "Cerrado · abrimos " + (next === (day + 1) % 7 ? "mañana" : "el " + names[next]) + " a las " + HOURS[next][0] + " hs";
    }
    if (dot) dot.className = "dot " + (open ? "is-open" : "is-closed");
    if (txt) txt.textContent = msg;
    if (box) { box.textContent = msg; box.className = "hours__status " + (open ? "is-open" : "is-closed"); }
    var row = document.querySelector('#hoursTable tr[data-day="' + day + '"]');
    if (row) row.classList.add("is-today");
  }

  function initReveal() {
    var els = document.querySelectorAll(".reveal");
    if (!("IntersectionObserver" in window)) { els.forEach(function (el) { el.classList.add("is-in"); }); return; }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add("is-in"); io.unobserve(en.target); } });
    }, { threshold: 0.01, rootMargin: "0px 0px -6% 0px" });
    els.forEach(function (el) { io.observe(el); });
    // Red de seguridad: a los 6 s se muestra todo lo que haya quedado oculto
    setTimeout(function () { els.forEach(function (el) { el.classList.add("is-in"); }); }, 6000);
  }

  function initYear() { var y = document.getElementById("year"); if (y) y.textContent = nowTucuman().getFullYear(); }

  function boot() {
    safe(initWhatsApp, "whatsapp");
    safe(initNav, "nav");
    safe(initOpenStatus, "horarios");
    safe(initReveal, "reveal");
    safe(initYear, "año");
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot); else boot();
})();
