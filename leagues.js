/* =========================================================================
   PAGE · leagues — فهرس الدوريات: يقرأ data/leagues/index.json ويعرض البطاقات.
   ========================================================================= */
(function () {
  "use strict";
  const root = document.getElementById("lgRoot");
  const esc = s => String(s == null ? "" : s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

  function render(list) {
    root.innerHTML = list.map(L =>
      '<a class="lg-card" href="league.html?id=' + encodeURIComponent(L.id) + '">' +
        '<span class="lg-flag">' + esc(L.flag || "🏆") + '</span>' +
        '<span class="lg-meta"><b>' + esc(L.ar) + '</b><small>' + esc(L.country || L.en) + '</small></span>' +
        '<span class="lg-go">‹</span>' +
      '</a>'
    ).join("");
  }

  document.addEventListener("DOMContentLoaded", function () {
    fetch("data/leagues/index.json?t=" + Date.now(), { cache: "no-store" })
      .then(r => r.json())
      .then(d => render(d.leagues || []))
      .catch(() => { root.innerHTML = '<p class="muted">تعذّر تحميل قائمة الدوريات.</p>'; });
  });
})();
