/* =========================================================================
   PAGE · player — صفحة لاعب (بيانات استرشادية + سياق منتخبه)
   ========================================================================= */
document.addEventListener("DOMContentLoaded", function () {
  const root = document.getElementById("root");
  const p = new URLSearchParams(location.search);
  const team = p.get("team"), i = parseInt(p.get("i"), 10);
  const prof = WC.profiles[team], t = WC.team(team);
  if (!t || !prof || !prof.stars || !prof.stars[i]) {
    root.innerHTML = '<div class="empty">⚽ لم نعثر على هذا اللاعب… <a class="gold" href="search.html">ارجع إلى البحث</a></div>';
    return;
  }
  const s = prof.stars[i];
  document.title = s.n + " · " + t.name + " · مونديال 2026";
  const POS = { "حارس": "حارس مرمى", "مدافع": "مدافع", "وسط": "لاعب وسط", "مهاجم": "مهاجم" };

  const hero = document.createElement("div");
  hero.className = "pl-hero reveal";
  hero.innerHTML =
    '<div class="pl-pos">' + s.p + '</div>' +
    '<div style="flex:1;min-width:220px">' +
      '<h1>' + s.n + '</h1>' +
      '<div class="pl-meta">' +
        '<a href="team.html?team=' + team + '"><img src="' + WC.flagUrl(team) + '" alt=""> ' + t.name + '</a>' +
        '<span>' + (POS[s.p] || s.p) + '</span>' +
        (s.c && s.c !== "—" ? '<span>🏟️ ' + s.c + '</span>' : '') +
      '</div>' +
      '<div class="muted" style="margin-top:8px;font-size:.84rem">👔 مدرّب المنتخب: ' + (prof.coach || "—") + ' · #' + t.fifa + ' عالمياً</div>' +
    '</div>';
  root.appendChild(hero);

  const note = document.createElement("p");
  note.className = "muted";
  note.style.cssText = "font-size:.8rem;margin:12px 2px 0";
  note.textContent = "* بيانات استرشادية مجمّعة من المصادر العامة وتُحدَّث عند إعلان القوائم الرسمية.";
  root.appendChild(note);

  // مباريات منتخبه
  const sec = document.createElement("div");
  sec.style.marginTop = "26px";
  sec.innerHTML = '<div class="section-head"><div><h2>مباريات ' + t.name + ' في دور المجموعات</h2></div></div>';
  const grid = document.createElement("div");
  grid.className = "grid grid-2";
  WC.matchesOfTeam(team).forEach(m => grid.appendChild(WCMatchCard(m)));
  sec.appendChild(grid);
  root.appendChild(sec);

  WCRefresh();
  window.__rerender = function () { location.reload(); };
});
