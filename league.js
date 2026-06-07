/* =========================================================================
   PAGE · league — تفاصيل دوري واحد: ترتيب + مباريات.
   يقرأ ?id=  →  data/leagues/<id>.json  (يُكتب خادمياً عبر GitHub Action).
   ========================================================================= */
(function () {
  "use strict";
  const root = document.getElementById("lhRoot");
  const esc = s => String(s == null ? "" : s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const id = new URLSearchParams(location.search).get("id");

  const LIVE = ["1H", "2H", "HT", "ET", "P", "BT", "LIVE"];
  const DONE = ["FT", "AET", "PEN"];
  const isLive = s => LIVE.indexOf(s) >= 0;
  const isDone = s => DONE.indexOf(s) >= 0;

  function fmtDate(iso) {
    try {
      const d = new Date(iso);
      return d.toLocaleDateString("ar", { day: "numeric", month: "short" }) + " · " +
             d.toLocaleTimeString("ar", { hour: "2-digit", minute: "2-digit" });
    } catch (e) { return ""; }
  }

  function formBadges(form) {
    if (!form) return "";
    return '<span class="form-b">' + String(form).slice(-5).split("").map(c =>
      '<i class="' + (c === "W" ? "fw" : c === "D" ? "fd" : "fl") + '"></i>').join("") + "</span>";
  }

  function standingsTable(rows) {
    if (!rows.length) return "";
    const body = rows.map(r =>
      "<tr><td class='rk'>" + r.rank + "</td>" +
      "<td class='team'><span class='tm'>" + (r.logo ? "<img src='" + esc(r.logo) + "' alt=''>" : "") + esc(r.team) + "</span></td>" +
      "<td>" + r.played + "</td><td>" + r.win + "</td><td>" + r.draw + "</td><td>" + r.lose + "</td>" +
      "<td>" + r.gf + ":" + r.ga + "</td><td>" + (r.gd > 0 ? "+" + r.gd : r.gd) + "</td>" +
      "<td class='pts'>" + r.points + "</td><td>" + formBadges(r.form) + "</td></tr>"
    ).join("");
    return "<div class='tbl-wrap'><table class='tbl'><thead><tr>" +
      "<th>#</th><th style='text-align:start'>الفريق</th><th>لعب</th><th>فاز</th><th>تعادل</th><th>خسر</th>" +
      "<th>له:عليه</th><th>الفارق</th><th>نقاط</th><th>آخر 5</th></tr></thead><tbody>" + body + "</tbody></table></div>";
  }

  function fixtureRow(f) {
    let mid;
    if (isLive(f.short)) mid = "<span class='sc live'>" + (f.hG == null ? 0 : f.hG) + " - " + (f.aG == null ? 0 : f.aG) + "<small>" + (f.short === "HT" ? "استراحة" : (f.min != null ? f.min + "′" : "مباشر")) + "</small></span>";
    else if (isDone(f.short)) mid = "<span class='sc'>" + (f.hG == null ? "-" : f.hG) + " - " + (f.aG == null ? "-" : f.aG) + "<small>انتهت</small></span>";
    else mid = "<span class='sc'><small>" + fmtDate(f.date) + "</small></span>";
    return "<div class='fx'>" +
      "<div class='pair'>" +
        "<span class='t'>" + (f.hLogo ? "<img src='" + esc(f.hLogo) + "' alt=''>" : "") + "<span>" + esc(f.hT) + "</span></span>" +
        mid +
        "<span class='t away'>" + (f.aLogo ? "<img src='" + esc(f.aLogo) + "' alt=''>" : "") + "<span>" + esc(f.aT) + "</span></span>" +
      "</div></div>";
  }

  function fixturesPane(fixtures) {
    const live = fixtures.filter(f => isLive(f.short));
    const up = fixtures.filter(f => !isLive(f.short) && !isDone(f.short));
    const done = fixtures.filter(f => isDone(f.short)).reverse();
    let h = "";
    if (live.length) h += "<div class='fx-head'>🔴 الآن</div>" + live.map(fixtureRow).join("");
    if (up.length) h += "<div class='fx-head'>📅 القادمة</div>" + up.slice(0, 12).map(fixtureRow).join("");
    if (done.length) h += "<div class='fx-head'>✅ النتائج الأخيرة</div>" + done.slice(0, 12).map(fixtureRow).join("");
    return h || "";
  }

  function emptyState(meta) {
    return "<div class='lh-hero'><span class='f'>" + esc((meta && meta.flag) || "🏆") + "</span><div><b>" +
      esc((meta && meta.ar) || "الدوري") + "</b><small>" + esc((meta && meta.country) || "") + "</small></div></div>" +
      "<div class='lh-empty'><div class='ico'>📭</div><h3>لا توجد بيانات بعد</h3>" +
      "<p>شغّل مُحدّث <b>leagues-updater</b> في GitHub Actions لتعبئة الترتيب والمباريات. إن بقيت فارغة بعد التشغيل، فالموسم الحالي غير متاح في الباقة المجانية — يلزم ترقية لباقة Pro.</p></div>";
  }

  function render(data, meta) {
    const L = data.league || meta || {};
    const standings = data.standings || [];
    const fixtures = data.fixtures || [];
    if (!standings.length && !fixtures.length) { root.innerHTML = emptyState(L); return; }

    const hasTable = standings.length > 0;
    root.innerHTML =
      "<div class='lh-hero'><span class='f'>" + esc(L.flag || "🏆") + "</span><div><b>" + esc(L.ar || "الدوري") + "</b><small>" + esc(L.country || "") + " · موسم " + esc(L.season || "") + "</small></div></div>" +
      "<div class='lh-tabs'>" +
        (hasTable ? "<button class='lh-tab active' data-p='table'>الترتيب</button>" : "") +
        "<button class='lh-tab" + (hasTable ? "" : " active") + "' data-p='fixtures'>المباريات</button>" +
      "</div>" +
      (hasTable ? "<div class='lh-pane active' id='pane-table'>" + standingsTable(standings) + "</div>" : "") +
      "<div class='lh-pane" + (hasTable ? "" : " active") + "' id='pane-fixtures'>" + (fixturesPane(fixtures) || "<p class='muted'>لا مباريات في النافذة الحالية.</p>") + "</div>";

    root.querySelectorAll(".lh-tab").forEach(b => b.addEventListener("click", function () {
      root.querySelectorAll(".lh-tab").forEach(x => x.classList.remove("active"));
      root.querySelectorAll(".lh-pane").forEach(x => x.classList.remove("active"));
      b.classList.add("active");
      root.querySelector("#pane-" + b.dataset.p).classList.add("active");
    }));
  }

  document.addEventListener("DOMContentLoaded", function () {
    if (!id) { root.innerHTML = "<p class='muted'>لم يُحدَّد الدوري.</p>"; return; }
    // اجلب الميتا من الفهرس + بيانات الدوري معاً
    Promise.all([
      fetch("data/leagues/index.json?t=" + Date.now(), { cache: "no-store" }).then(r => r.json()).catch(() => ({ leagues: [] })),
      fetch("data/leagues/" + encodeURIComponent(id) + ".json?t=" + Date.now(), { cache: "no-store" }).then(r => r.json()).catch(() => ({}))
    ]).then(([idx, data]) => {
      const meta = (idx.leagues || []).find(x => String(x.id) === String(id));
      render(data || {}, meta);
    });
  });
})();
