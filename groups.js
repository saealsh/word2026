/* =========================================================================
   PAGE · groups — متحكّم الصفحة (مستخرَج كما هو؛ يعتمد على واجهة WC العامة)
   ========================================================================= */
document.addEventListener("DOMContentLoaded", function () {
  const grid = document.getElementById("groupsGrid");

  // حساب الترتيب من النتائج (إن وُجدت) — افتراضياً كل القيم صفر قبل انطلاق البطولة
  function standings(g) {
    const teams = WC.teamsInGroup(g);
    const tbl = {};
    teams.forEach(k => tbl[k] = { k, p: 0, w: 0, d: 0, l: 0, gf: 0, ga: 0, pts: 0 });
    WC.matchesOfGroup(g).forEach(m => {
      if (m.status !== "finished" || !m.score) return;
      const H = tbl[m.home], A = tbl[m.away];
      H.p++; A.p++; H.gf += m.score.h; H.ga += m.score.a; A.gf += m.score.a; A.ga += m.score.h;
      if (m.score.h > m.score.a) { H.w++; A.l++; H.pts += 3; }
      else if (m.score.h < m.score.a) { A.w++; H.l++; A.pts += 3; }
      else { H.d++; A.d++; H.pts++; A.pts++; }
    });
    return Object.values(tbl).sort((a, b) => b.pts - a.pts || (b.gf - b.ga) - (a.gf - a.ga) || b.gf - a.gf || WC.team(a.k).fifa - WC.team(b.k).fifa);
  }

  WC.groups.forEach(function (g) {
    const card = document.createElement("div");
    card.className = "group-card reveal"; card.id = "g" + g;
    let rows = standings(g).map(function (s, i) {
      return '<tr class="' + (i < 2 ? "qual" : "") + '">' +
        '<td class="team-cell"><a href="team.html?team=' + s.k + '"><img src="' + WC.flagUrl(s.k, "w20") + '" alt="">' + WC.team(s.k).name + '</a></td>' +
        '<td>' + s.p + '</td><td>' + s.w + '</td><td>' + s.d + '</td><td>' + s.l + '</td>' +
        '<td>' + (s.gf - s.ga > 0 ? "+" : "") + (s.gf - s.ga) + '</td><td><b>' + s.pts + '</b></td></tr>';
    }).join("");
    card.innerHTML =
      '<h3>المجموعة <span>' + g + '</span></h3>' +
      '<table class="standings"><thead><tr><th>المنتخب</th><th>لعب</th><th>ف</th><th>ت</th><th>خ</th><th>+/-</th><th>نقاط</th></tr></thead><tbody>' + rows + '</tbody></table>';
    grid.appendChild(card);
  });
  WCRefresh();

  // التمرير إلى مجموعة محددة من الرابط
  if (location.hash) { const t = document.querySelector(location.hash); if (t) setTimeout(() => t.scrollIntoView({ behavior: "smooth", block: "center" }), 200); }
});
