/* =========================================================================
   PAGE · match — متحكّم الصفحة (مستخرَج كما هو؛ يعتمد على واجهة WC العامة)
   ========================================================================= */
document.addEventListener("DOMContentLoaded", function () {
  const root = document.getElementById("root");
  const id = new URLSearchParams(location.search).get("id");
  const m = WC.matches.find(x => x.id === id);
  if (!m) {
    root.innerHTML = '<div class="empty">⚽ لم نعثر على هذه المباراة… <a class="gold" href="matches.html">عُد إلى ساحة المباريات</a></div>';
    return;
  }

  const hk = m.home, ak = m.away;
  const th = WC.team(hk), ta = WC.team(ak);
  const ph = WC.profile(hk), pa = WC.profile(ak);
  document.title = th.name + " ضد " + ta.name + " · مونديال 2026";

  const teamLink = (k, t) => '<a class="md-team" href="team.html?team=' + k + '">' +
    '<img src="' + WC.flagUrl(k, "w160") + '" alt="' + t.name + '">' +
    '<b>' + t.name + '</b><small>#' + t.fifa + ' عالمياً · ' + t.confed + '</small></a>';

  // وسط الترويسة: نتيجة حيّة (مع الدقيقة) أو توقيت
  function renderCenter() {
    if (m.status === "finished" && m.score) return '<div class="md-score">' + m.score.h + ' - ' + m.score.a + '</div><span class="tz">انتهت</span>';
    if (m.status === "live" && m.score) return '<div class="md-score">' + m.score.h + ' - ' + m.score.a + '</div><span class="tz">🔴 ' + (m.minute != null ? m.minute + "′" : "مباشر") + '</span>';
    return '<span class="vs">VS</span><span class="t">' + WC.displayTime(m) + '</span><span class="tz">' + WC.tzLabel() + '</span>';
  }
  const center = renderCenter();

  const hero = document.createElement("div");
  hero.className = "md-hero reveal";
  hero.innerHTML =
    '<div class="md-top">' +
      '<span class="chip-mini">📅 ' + WC.displayDayName(m) + ' · ' + WC.displayDate(m) + '</span>' +
      '<span class="chip-mini">🏟️ المجموعة ' + m.group + '</span>' +
      (m.venue ? '<span class="chip-mini">📍 ' + m.venue.stadium + '، ' + m.venue.city + '</span>' : '') +
      (m.venue ? '<span class="chip-mini">👥 ' + m.venue.cap.toLocaleString("ar") + ' متفرّج</span>' : '') +
    '</div>' +
    '<div class="md-vs">' + teamLink(hk, th) + '<div class="md-center">' + center + '</div>' + teamLink(ak, ta) + '</div>' +
    (m.status === "scheduled" ? '<div class="cd-timer" id="mCd" style="margin-top:18px"></div>' : '') +
    '<div class="md-actions">' +
      '<button class="btn btn-gold" id="btnCal">📅 أضِف للتقويم</button>' +
      '<button class="btn btn-ghost" id="btnInt">🔔 تابِع هذه المباراة</button>' +
      '<a class="btn btn-ghost" href="team.html?team=' + hk + '">صفحة ' + th.name + ' ←</a>' +
    '</div>';
  root.appendChild(hero);

  // تحديث وسط الترويسة فور ورود تحديث حيّ (نتيجة/دقيقة) بلا إعادة تحميل الصفحة
  document.addEventListener("scoreupdate", function () {
    const c = hero.querySelector(".md-center");
    if (c) c.innerHTML = renderCenter();
  });

  // عدّاد المباراة عبر الساعة المركزية
  if (m.status === "scheduled") {
    const box = document.getElementById("mCd");
    WCClock.add(function () {
      const p = WCDiffParts(m.kickoff);
      box.innerHTML = WCcdUnit(p.days, "يوم") + WCcdUnit(p.h, "ساعة") + WCcdUnit(p.m, "دقيقة") + WCcdUnit(p.s, "ثانية");
    });
  }

  // ===== شبكة اللوحات =====
  const grid = document.createElement("div");
  grid.className = "md-grid";
  root.appendChild(grid);

  // (1) المقارنة الإحصائية
  const sh = WC.strength(hk), sa = WC.strength(ak);
  const cmp = document.createElement("div");
  cmp.className = "panel reveal";
  cmp.innerHTML = '<h3>📊 مقارنة المنتخبين</h3>' +
    bar("مؤشّر القوة (تصنيف فيفا)", sh, sa) +
    txt("تصنيف فيفا", "#" + th.fifa, "#" + ta.fifa) +
    txt("ألقاب كأس العالم", ph.titles + " 🏆", pa.titles + " 🏆") +
    txt("أفضل إنجاز", ph.best, pa.best) +
    txt("الاتحاد القاري", th.confed, ta.confed);
  grid.appendChild(cmp);

  // (2) سجل المواجهات
  const h = WC.getH2H(hk, ak);
  const h2h = document.createElement("div");
  h2h.className = "panel reveal";
  if (h.played > 0) {
    h2h.innerHTML = '<h3>🤝 سجل المواجهات السابقة</h3>' +
      '<div class="h2h">' +
        '<div><b>' + h.wHome + '</b><small>فوز ' + th.name + '</small></div>' +
        '<div><b>' + h.draw + '</b><small>تعادل</small></div>' +
        '<div><b>' + h.wAway + '</b><small>فوز ' + ta.name + '</small></div>' +
      '</div>' +
      '<div class="h2h-note">⚽ مجموع اللقاءات: <b>' + h.played + '</b>' + (h.note ? ' · ' + h.note : '') + '<br><span class="muted" style="font-size:.78rem">* أرقام تقريبية تشمل المباريات الرسمية والودية.</span></div>';
  } else {
    h2h.innerHTML = '<h3>🤝 سجل المواجهات السابقة</h3><div class="h2h-note" style="margin-top:0">' + h.note + '.<br><span class="muted" style="font-size:.78rem">لقاء يحمل طابع الندّية والمفاجأة!</span></div>';
  }
  grid.appendChild(h2h);

  // (3) نجوم المنتخب الأول
  grid.appendChild(squadPanel(hk, th, ph));
  // (4) نجوم المنتخب الثاني
  grid.appendChild(squadPanel(ak, ta, pa));

  // ===== سياق المجموعة =====
  const others = WC.matchesOfGroup(m.group).filter(x => x.id !== m.id)
    .sort((a, b) => new Date(a.kickoff) - new Date(b.kickoff));
  const ctx = document.createElement("div");
  ctx.className = "panel reveal";
  ctx.style.marginTop = "18px";
  let ch = '<h3>🗂️ باقي مباريات المجموعة ' + m.group + '</h3>';
  others.forEach(x => {
    const xh = WC.team(x.home), xa = WC.team(x.away);
    ch += '<a class="ctx-match" href="match.html?id=' + x.id + '">' +
      '<span class="ct"><img src="' + WC.flagUrl(x.home) + '"> ' + xh.name + '</span>' +
      '<span class="ctx-time">' + WC.displayTime(x) + ' · ' + WC.displayDayName(x) + '</span>' +
      '<span class="ct">' + xa.name + ' <img src="' + WC.flagUrl(x.away) + '"></span>' +
      '</a>';
  });
  ctx.innerHTML = ch;
  root.appendChild(ctx);

  // أزرار الترويسة
  const calBtn = document.getElementById("btnCal");
  if (calBtn) calBtn.addEventListener("click", () => WCDownloadICS(m));
  const intBtn = document.getElementById("btnInt");
  if (intBtn) {
    if (WCInterest.has(m.id)) intBtn.classList.add("btn-gold"), intBtn.classList.remove("btn-ghost"), intBtn.textContent = "🔔 ضمن اهتماماتك";
    intBtn.addEventListener("click", function () {
      const on = WCInterest.toggle(m.id);
      this.className = "btn " + (on ? "btn-gold" : "btn-ghost");
      this.textContent = on ? "🔔 ضمن اهتماماتك" : "🔔 تابِع هذه المباراة";
    });
  }

  WCRefresh();
  window.__rerender = function () { location.reload(); };

  // ===== مولّدات =====
  function bar(label, a, b) {
    const tot = a + b || 1;
    return '<div class="cmp-row"><div class="cmp-head"><span>' + th.name + '</span><span>' + label + '</span><span>' + ta.name + '</span></div>' +
      '<div class="cmp-bar"><i class="a" style="width:' + (a / tot * 100) + '%"></i><i class="b" style="width:' + (b / tot * 100) + '%"></i></div></div>';
  }
  function txt(label, a, b) {
    return '<div class="cmp-text"><span>' + a + '</span><span>' + label + '</span><span>' + b + '</span></div>';
  }
  function squadPanel(k, t, p) {
    const el = document.createElement("div");
    el.className = "panel reveal";
    let html = '<h3>⭐ أبرز نجوم ' + t.name + '</h3>' +
      '<div class="squad-head"><img src="' + WC.flagUrl(k) + '"> ' + t.name + (p.nick ? ' · <span class="muted" style="font-weight:700">' + p.nick + '</span>' : '') + '</div>' +
      '<div class="coach-line">👔 المدرّب: ' + (p.coach || "—") + '</div><div class="squad">';
    if (p.stars && p.stars.length) {
      p.stars.forEach(s => {
        html += '<div class="player"><span class="pos">' + s.p + '</span>' +
          '<div><div class="pn">' + s.n + '</div><div class="pc">' + (s.c && s.c !== "—" ? s.c : "نادٍ غير محدّد") + '</div></div></div>';
      });
    } else {
      html += '<div class="h2h-note" style="margin:0">القائمة النجمية تُحدَّث قريباً.</div>';
    }
    html += '</div>';
    el.innerHTML = html;
    return el;
  }
});
