/* =========================================================================
   PAGE · livenow — «يلعب الآن»: يقرأ data/livenow.json ويعرض المباريات
   الجارية مجمّعةً حسب البطولة، ويتحدّث تلقائياً كل 60 ثانية.
   لا يحتاج مفتاح API — الملف يُكتب خادمياً عبر GitHub Action.
   ========================================================================= */
(function () {
  "use strict";
  const root = document.getElementById("lnRoot");
  const elCount = document.getElementById("lnCount");
  const elUpd = document.getElementById("lnUpdated");
  const FEED = "data/livenow.json";

  const esc = s => String(s == null ? "" : s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const num = n => (n == null ? "—" : String(n));

  function minuteLabel(short, min) {
    if (short === "HT") return "استراحة";
    if (short === "P") return "ركلات الترجيح";
    if (short === "BT") return "استراحة الإضافي";
    if (short === "ET") return (min != null ? min + "′ (إضافي)" : "وقت إضافي");
    if (min != null) return min + "′";
    return "مباشر";
  }

  function card(m) {
    const ht = (m.short === "HT");
    return (
      '<div class="ln-card">' +
        '<div class="ln-row">' +
          '<div class="ln-team">' + (m.hLogo ? '<img src="' + esc(m.hLogo) + '" alt="" loading="lazy">' : "") + '<span>' + esc(m.hT) + '</span></div>' +
          '<div class="ln-score">' + num(m.hG) + '</div>' +
        '</div>' +
        '<div class="ln-sep"></div>' +
        '<div class="ln-row">' +
          '<div class="ln-team">' + (m.aLogo ? '<img src="' + esc(m.aLogo) + '" alt="" loading="lazy">' : "") + '<span>' + esc(m.aT) + '</span></div>' +
          '<div class="ln-score">' + num(m.aG) + '</div>' +
        '</div>' +
        '<div class="ln-min' + (ht ? ' ln-ht' : '') + '">' + (ht ? "" : '<span class="d"></span>') + esc(minuteLabel(m.short, m.min)) + '</div>' +
      '</div>'
    );
  }

  function render(data) {
    const matches = (data && data.matches) || [];
    elCount.textContent = matches.length ? (matches.length + " مباراة جارية الآن") : "لا توجد مباريات الآن";
    if (data && data.updated) {
      try { elUpd.textContent = "آخر تحديث: " + new Date(data.updated).toLocaleTimeString("ar", { hour: "2-digit", minute: "2-digit" }); } catch (e) {}
    }
    if (!matches.length) {
      root.innerHTML =
        '<div class="ln-empty"><div class="ico">😴</div><h3>ما فيه مباريات تلعب الآن</h3>' +
        '<p>الصفحة تتحدّث تلقائياً. أول ما تبدأ أي مباراة حول العالم بتظهر هنا مباشرةً بالدقيقة والنتيجة.</p></div>';
      return;
    }
    // تجميع حسب البطولة
    const groups = new Map();
    for (const m of matches) {
      const key = m.lgId || m.lg || "؟";
      if (!groups.has(key)) groups.set(key, { lg: m.lg, country: m.country, logo: m.lgLogo, items: [] });
      groups.get(key).items.push(m);
    }
    let html = "";
    for (const g of groups.values()) {
      html +=
        '<div class="ln-group"><div class="ln-group-head">' +
          (g.logo ? '<img src="' + esc(g.logo) + '" alt="">' : "🏆") +
          '<span>' + esc(g.lg) + "</span>" + (g.country ? ' <small>· ' + esc(g.country) + "</small>" : "") +
        '</div><div class="ln-grid">' + g.items.map(card).join("") + "</div></div>";
    }
    root.innerHTML = html;
  }

  function load() {
    fetch(FEED + "?t=" + Date.now(), { cache: "no-store" })
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(render)
      .catch(() => {
        elCount.textContent = "تعذّر التحميل";
        root.innerHTML = '<div class="ln-empty"><div class="ico">⚠️</div><h3>تعذّر جلب البيانات</h3>' +
          '<p>تأكد أن مُحدّث live-updater يعمل في GitHub Actions، وأن ملف data/livenow.json مرفوع.</p></div>';
      });
  }

  document.addEventListener("DOMContentLoaded", function () {
    load();
    setInterval(load, 60000); // تحديث كل دقيقة
    document.addEventListener("visibilitychange", function () { if (!document.hidden) load(); });
  });
})();
