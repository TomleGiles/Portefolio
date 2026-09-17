/* Thème + surlignage de la section courante. Aucune dépendance. */
(function () {
  "use strict";

  /* ---- thème ---- */
  var root = document.documentElement;
  var btn = document.querySelector("[data-theme-toggle]");

  function stored() {
    try { return localStorage.getItem("theme"); } catch (e) { return null; }
  }
  function save(v) {
    try { localStorage.setItem("theme", v); } catch (e) { /* mode privé */ }
  }

  var saved = stored();
  if (saved === "dark" || saved === "light") root.setAttribute("data-theme", saved);

  function current() {
    var attr = root.getAttribute("data-theme");
    if (attr) return attr;
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }

  if (btn) {
    var sync = function () {
      var t = current();
      btn.setAttribute("aria-label", t === "dark" ? "Passer en thème clair" : "Passer en thème sombre");
      btn.textContent = t === "dark" ? "Clair" : "Sombre";
    };
    sync();
    btn.addEventListener("click", function () {
      var next = current() === "dark" ? "light" : "dark";
      root.setAttribute("data-theme", next);
      save(next);
      sync();
    });
  }

  /* ---- section courante dans la nav latérale ---- */
  var links = Array.prototype.slice.call(document.querySelectorAll(".rail__link"));
  if (!links.length || !("IntersectionObserver" in window)) return;

  var targets = links
    .map(function (a) { return document.querySelector(a.getAttribute("href")); })
    .filter(Boolean);

  var visible = new Set();

  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) visible.add(e.target.id);
      else visible.delete(e.target.id);
    });
    var first = targets.find(function (t) { return visible.has(t.id); });
    links.forEach(function (a) {
      var on = first && a.getAttribute("href") === "#" + first.id;
      if (on) a.setAttribute("aria-current", "true");
      else a.removeAttribute("aria-current");
    });
  }, { rootMargin: "-20% 0px -65% 0px", threshold: 0 });

  targets.forEach(function (t) { observer.observe(t); });
})();
