/* =========================================================================
   PAGE · search — بحث شامل (منتخبات · لاعبون · مباريات)
   ========================================================================= */
document.addEventListener("DOMContentLoaded", function () {
  const q = document.getElementById("q");
  const out = document.getElementById("results");
  const pre = new URLSearchParams(location.search).get("q");
  if (pre) q.value = pre;
  try { q.focus(); } catch (e) {}

  function section(title, items) {
    return '<h3 class="sr-head">' + title + '</h3><div class="sr-grid">' + items + '</div>';
  }
  function run() {
    const term = q.value.trim();
    if (!term) { out.innerHTML = '<p class="muted" style="margin-top:16px">ابدأ الكتابة لعرض النتائج… (جرّب اسم منتخب، لاعب، أو مباراة)</p>'; return; }

    const teams = Object.keys(WC.teams).filter(k => WC.team(k).name.includes(term)).slice(0, 12);
    const players = [];
    Object.keys(WC.profiles).forEach(k => (WC.profiles[k].stars || []).forEach((s, i) => {
      if (s.n.includes(term)) players.push({ k, i, s });
    }));
    const matches = WC.matches.filter(m => (WC.team(m.home).name + " " + WC.team(m.away).name).includes(term)).slice(0, 12);

    let html = "";
    if (teams.length) html += section("🏳️ المنتخبات", teams.map(k =>
      '<a class="sr-item" href="team.html?team=' + k + '"><img src="' + WC.flagUrl(k) + '" alt=""><span>' + WC.team(k).name + '</span><small>' + WC.team(k).confed + '</small></a>').join(""));
    if (players.length) html += section("⭐ اللاعبون", players.slice(0, 18).map(p =>
      '<a class="sr-item" href="player.html?team=' + p.k + '&i=' + p.i + '"><span class="sr-pos">' + p.s.p + '</span><span>' + p.s.n + '</span><small>' + WC.team(p.k).name + '</small></a>').join(""));
    if (matches.length) html += section("⚽ المباريات", matches.map(m =>
      '<a class="sr-item" href="match.html?id=' + m.id + '"><img src="' + WC.flagUrl(m.home) + '" alt=""><span>' + WC.team(m.home).name + ' × ' + WC.team(m.away).name + '</span><small>' + WC.displayDayName(m) + ' · ' + WC.displayTime(m) + '</small></a>').join(""));

    out.innerHTML = html || '<div class="empty">⚽ ما لقينا نتائج لـ«' + term + '» — جرّب كلمة ثانية</div>';
  }
  q.addEventListener("input", run);
  run();
});
