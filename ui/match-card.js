/* =========================================================================
   UI · match-card — مكوّن بطاقة المباراة (يبني عنصر DOM ويربط تفاعلاته)
   يعتمد على نطاق WC (أسماء/أعلام/تنسيق)، والمفضّلة/الاهتمامات، والتقويم.
   centerHtml مُعرّض للطبقة الحيّة كي تُرقّع وسط البطاقة دون إعادة بناء.
   ========================================================================= */
(function () {
  "use strict";
  const WC = (window.WC = window.WC || {});

  // وسط البطاقة: توقيت / نتيجة حيّة / نتيجة نهائية (مصدر واحد يستخدمه البناء والتحديث الحيّ)
  function centerHtml(m) {
    if (m.status === "finished" && m.score)
      return '<div class="mc-clock done"><div class="score">' + m.score.h + ' - ' + m.score.a + '</div><span class="badge-done">انتهت</span></div>';
    if (m.status === "live" && m.score)
      return '<div class="mc-clock"><div class="score">' + m.score.h + ' - ' + m.score.a + '</div><span class="badge-live">🔴 ' + (m.minute != null ? m.minute + "′" : "مباشر") + '</span></div>';
    return '<div class="mc-clock"><span class="time">' + WC.displayTime(m) + '</span><small>' + WC.tzLabel() + '</small></div>';
  }

  function matchCard(m) {
    const Fav = WC.favorites, Interest = WC.interests;
    const t = WC.team(m.home), a = WC.team(m.away);
    const dayName = WC.displayDayName(m);
    const dayDate = WC.displayDate(m);
    const favOn = (Fav.has(m.home) || Fav.has(m.away)) ? " on" : "";
    const intOn = Interest.has(m.id) ? " on" : "";

    const el = document.createElement("div");
    el.className = "match-card reveal";
    el.dataset.group = m.group; el.dataset.home = m.home; el.dataset.away = m.away;
    el.dataset.date = m.date; el.dataset.round = m.round; el.dataset.id = m.id;
    el.innerHTML =
      '<div class="mc-day"><span class="mc-day-ic">📅</span>' +
        '<span class="mc-day-name">' + dayName + '</span>' +
        '<span class="mc-day-date">' + dayDate + '</span></div>' +
      '<div class="mc-top">' +
        '<div class="mc-meta"><span class="mc-group">المجموعة ' + m.group + '</span>' +
        (m.venue ? '<span class="mc-venue">📍 ' + m.venue.city + '</span>' : '') +
        '<span class="mc-venue" style="opacity:.65">🔎 التفاصيل</span></div>' +
        '<div class="mc-actions">' +
          '<button class="mc-int' + intOn + '" title="أضِف إلى اهتماماتي">🔔</button>' +
          '<button class="mc-fav' + favOn + '" title="تابِع منتخباً من هذه المباراة">★</button>' +
        '</div>' +
      '</div>' +
      '<div class="mc-body">' +
        '<a class="mc-team" href="team.html?team=' + m.home + '"><img loading="lazy" src="' + WC.flagUrl(m.home) + '" alt="علم ' + t.name + '"><span>' + t.name + '</span></a>' +
        '<div class="mc-center">' + centerHtml(m) + '</div>' +
        '<a class="mc-team away" href="team.html?team=' + m.away + '"><img loading="lazy" src="' + WC.flagUrl(m.away) + '" alt="علم ' + a.name + '"><span>' + a.name + '</span></a>' +
      '</div>' +
      (m.status === "scheduled"
        ? '<div class="mc-foot"><div class="mc-deadline" data-kickoff="' + m.kickoff + '"></div>' +
          '<button class="mc-cal" title="أضِف إلى التقويم">📅 التقويم</button></div>'
        : '');

    el.querySelector(".mc-fav").addEventListener("click", function (e) {
      e.preventDefault();
      const key = Fav.has(m.home) ? m.home : Fav.has(m.away) ? m.away : m.home;
      Fav.toggle(key);
      this.classList.toggle("on", Fav.has(m.home) || Fav.has(m.away));
    });
    el.querySelector(".mc-int").addEventListener("click", function (e) {
      e.preventDefault();
      this.classList.toggle("on", Interest.toggle(m.id));
    });
    const cal = el.querySelector(".mc-cal");
    if (cal) cal.addEventListener("click", function (e) { e.preventDefault(); WC.calendar.downloadOne(m); });

    el.style.cursor = "pointer";
    el.title = "اضغط لعرض تفاصيل المباراة والنجوم والإحصائيات";
    el.addEventListener("click", function (e) {
      if (e.target.closest("a, button")) return;
      location.href = "match.html?id=" + m.id;
    });
    return el;
  }
  matchCard.centerHtml = centerHtml; // يستخدمه infra/live لترقيع البطاقات حيّاً
  WC.matchCard = matchCard;
})();
