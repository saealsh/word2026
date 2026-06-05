/* =========================================================================
   INFRA · exporters — مصدّرات خارجية: تقويم (.ics) وطباعة (PDF)
   محوّلات إخراج لا تملك حالة؛ تعتمد على نطاق WC للأسماء والتنسيق، وعلى WC.toast.
   ========================================================================= */
(function () {
  "use strict";
  const WC = (window.WC = window.WC || {});

  /* ---------- التقويم (.ics) ---------- */
  const fmtICS = d => d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  function icsEvent(m) {
    const t = WC.team(m.home).name, a = WC.team(m.away).name;
    const start = new Date(m.kickoff), end = new Date(start.getTime() + 2 * 3600 * 1000);
    const loc = m.venue ? m.venue.stadium + "، " + m.venue.city : "";
    return [
      "BEGIN:VEVENT",
      "UID:" + m.id + "@mondial2026",
      "DTSTAMP:" + fmtICS(new Date()),
      "DTSTART:" + fmtICS(start),
      "DTEND:" + fmtICS(end),
      "SUMMARY:⚽ " + t + " ضد " + a + " — كأس العالم 2026",
      "DESCRIPTION:المجموعة " + m.group + (loc ? " · " + loc : ""),
      "LOCATION:" + loc,
      "BEGIN:VALARM", "TRIGGER:-PT60M", "ACTION:DISPLAY",
      "DESCRIPTION:تبدأ المباراة بعد ساعة!", "END:VALARM",
      "END:VEVENT"
    ];
  }
  function buildICS(list, calName) {
    let lines = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Mondial2026//AR//", "CALSCALE:GREGORIAN", "METHOD:PUBLISH", "X-WR-CALNAME:" + (calName || "كأس العالم 2026")];
    list.forEach(m => { lines = lines.concat(icsEvent(m)); });
    lines.push("END:VCALENDAR");
    return lines.join("\r\n");
  }
  function saveICS(text, fname) {
    const blob = new Blob([text], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url; link.download = fname;
    document.body.appendChild(link); link.click(); link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  WC.calendar = {
    downloadOne(m) {
      saveICS(buildICS([m]), "match-" + m.id + ".ics");
      WC.toast("📅", "تم! المباراة الآن في تقويمك مع تنبيه قبل الصافرة");
    },
    downloadMulti(list, fname, calName) {
      if (!list || !list.length) { WC.toast("📅", "لا توجد مباريات لإضافتها"); return; }
      saveICS(buildICS(list, calName), fname || "WorldCup2026.ics");
      WC.toast("📅", list.length + " مباراة أُضيفت إلى تقويمك — افتح الملف لإضافتها");
    }
  };

  /* ---------- الطباعة (PDF عبر window.print) ---------- */
  WC.print = {
    exportPDF(list, opts) {
      opts = opts || {};
      list = (list && list.length) ? list.slice() : WC.matches.slice();
      list.sort((a, b) => a.koTime - b.koTime);
      const byDate = {};
      list.forEach(m => { const k = WC.displayDateKey(m); (byDate[k] = byDate[k] || []).push(m); });
      let html =
        '<div class="pr-header"><div class="pr-cup">🏆</div>' +
        '<h1>كأس العالم 2026 — جدول المباريات</h1>' +
        '<p>' + (opts.subtitle || ("دور المجموعات · " + list.length + " مباراة")) + ' · ' + WC.tzLabel() + '</p></div>';
      Object.keys(byDate).sort().forEach(key => {
        html += '<div class="pr-day">' + WC.displayDateKeyLabel(key) + '</div>';
        byDate[key].forEach(m => {
          const t = WC.team(m.home), a = WC.team(m.away);
          html += '<div class="pr-row">' +
            '<div class="pr-team"><img src="' + WC.flagUrl(m.home) + '" alt=""><span>' + t.name + '</span></div>' +
            '<div class="pr-time">' + WC.displayTime(m) + '<small>' + WC.tzLabel() + ' · مجموعة ' + m.group + '</small></div>' +
            '<div class="pr-team away"><span>' + a.name + '</span><img src="' + WC.flagUrl(m.away) + '" alt=""></div>' +
            (m.venue ? '<div class="pr-venue">📍 ' + m.venue.stadium + '، ' + m.venue.city + '</div>' : '') +
            '</div>';
        });
      });
      html += '<div class="pr-foot">🏆 منصة مونديال 2026 · صُمّم بشغف · ' + new Date().toLocaleDateString("ar") + '</div>';
      let area = document.getElementById("printArea");
      if (!area) { area = document.createElement("div"); area.id = "printArea"; document.body.appendChild(area); }
      area.innerHTML = html;
      setTimeout(() => window.print(), 250); // مهلة لتحميل الأعلام
    }
  };
})();
