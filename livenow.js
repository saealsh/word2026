/* =========================================================================
   PAGE · livenow — «يلعب الآن»: يقرأ data/livenow.json ويعرض المباريات
   الجارية ببطاقة غنية (شعار البطولة، الجولة، المتقدّم، شريط تقدّم، حالة
   الشوط، مسجّلو الأهداف، الملعب)، ويتحدّث تلقائياً كل 60 ثانية.
   لا يحتاج مفتاح API — الملف يُكتب خادمياً عبر GitHub Action.
   ========================================================================= */
(function () {
  "use strict";
  const root = document.getElementById("lnRoot");
  const elCount = document.getElementById("lnCount");
  const elUpd = document.getElementById("lnUpdated");
  const FEED = "data/livenow.json";

  const esc = s => String(s == null ? "" : s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const num = n => (n == null ? 0 : n);

  function statusLabel(short, min) {
    switch (short) {
      case "1H": return "الشوط الأول";
      case "2H": return "الشوط الثاني";
      case "HT": return "الاستراحة";
      case "ET": return "وقت إضافي";
      case "BT": return "استراحة الإضافي";
      case "P":  return "ركلات الترجيح";
      default:   return min != null ? min + "′" : "مباشر";
    }
  }

  function progress(short, min) {
    if (short === "HT") return 50;
    if (short === "P" || short === "BT") return 100;
    if (short === "ET") return Math.min(100, (min || 90) / 120 * 100);
    if (min != null) return Math.min(100, min / 90 * 100);
    return 0;
  }

  function scorerDetail(d) {
    if (!d) return "";
    if (/Penalty/i.test(d)) return ' <span class="pen">(ركلة جزاء)</span>';
    if (/Own/i.test(d)) return ' <span class="pen">(عكسية)</span>';
    return "";
  }

  function scorersCol(list, side) {
    return '<div class="col ' + side + '">' + list.map(s =>
      '<span class="sc-item"><span>⚽</span><span>' + esc(s.name) + scorerDetail(s.detail) + '</span><span class="m">' + esc(s.min) + "′</span></span>"
    ).join("") + "</div>";
  }

  function side(name, logo, leading) {
    return '<div class="ln-side' + (leading ? " win" : "") + '">' +
      (logo ? '<img src="' + esc(logo) + '" alt="" loading="lazy">' : '<span class="badge-pos">🛡️</span>') +
      '<span class="nm">' + esc(name) + "</span></div>";
  }

  function card(m) {
    const hG = num(m.hG), aG = num(m.aG);
    const ht = (m.short === "HT");
    const pct = progress(m.short, m.min);
    const scorers = Array.isArray(m.scorers) ? m.scorers : [];
    const hsc = scorers.filter(s => s.side === "h");
    const asc = scorers.filter(s => s.side === "a");

    let html = '<div class="ln-card">';
    // حالة الشوط
    html += '<div class="ln-status' + (ht ? " ht" : "") + '">' + (ht ? "" : '<span class="d"></span>') + esc(statusLabel(m.short, m.min)) + "</div>";
    // رأس: بطولة + جولة
    html += '<div class="ln-head">' + (m.lgLogo ? '<img src="' + esc(m.lgLogo) + '" alt="">' : "🏆") +
      '<span class="lg">' + esc(m.lg || "") + "</span>" +
      (m.round ? '<span class="rnd">' + esc(m.round) + "</span>" : "") + "</div>";
    // اللوحة: فريق — نتيجة — فريق
    html += '<div class="ln-board">' +
      side(m.hT, m.hLogo, hG > aG) +
      '<div class="ln-mid"><div class="sc">' + (hG > aG ? "<b>" + hG + "</b>" : hG) + " - " + (aG > hG ? "<b>" + aG + "</b>" : aG) + "</div>" +
        '<span class="min">' + (ht ? "استراحة" : (m.min != null ? m.min + "′" : "مباشر")) + "</span></div>" +
      side(m.aT, m.aLogo, aG > hG) +
    "</div>";
    // شريط التقدّم
    html += '<div class="ln-prog"><i style="width:' + pct.toFixed(0) + '%"></i><span class="ht-mark"></span></div>' +
      '<div class="ln-prog-tx"><span>بداية</span><span>الشوط الأول</span><span>نهاية</span></div>';
    // مسجّلو الأهداف
    if (hsc.length || asc.length) {
      html += '<div class="ln-scorers">' + scorersCol(hsc, "home") + scorersCol(asc, "away") + "</div>";
    }
    // الملعب
    if (m.venue) html += '<div class="ln-venue">🏟️ ' + esc(m.venue) + "</div>";
    html += "</div>";
    return html;
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
        '<p>الصفحة تتحدّث تلقائياً. أول ما تبدأ أي مباراة حول العالم بتظهر هنا مباشرةً بالدقيقة والنتيجة ومسجّلي الأهداف.</p></div>';
      return;
    }
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
    setInterval(load, 60000);
    document.addEventListener("visibilitychange", function () { if (!document.hidden) load(); });
  });
})();
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
