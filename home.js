/* =========================================================================
   PAGE · home — متحكّم الصفحة (مستخرَج كما هو؛ يعتمد على واجهة WC العامة)
   ========================================================================= */
document.addEventListener("DOMContentLoaded", function () {
  // منتقي المنتخب المفضّل
  const picker = document.getElementById("favPicker");
  Object.keys(WC.teams).forEach(function (k) {
    const c = document.createElement("button");
    c.className = "chip" + (WCFav.has(k) ? " active" : "");
    c.innerHTML = '<img src="' + WC.flagUrl(k, "w20") + '" style="width:18px;height:13px;border-radius:2px;vertical-align:-2px;margin-left:5px"> ' + WC.team(k).name;
    c.addEventListener("click", function () {
      WCFav.toggle(k);
      document.querySelectorAll("#favPicker .chip").forEach(function (x, i) {
        x.classList.toggle("active", WCFav.has(Object.keys(WC.teams)[i]));
      });
    });
    picker.appendChild(c);
  });

  // أقرب 6 مباريات
  function buildUpcoming() {
    const up = document.getElementById("upcoming");
    up.innerHTML = "";
    const next = WC.matches.filter(m => new Date(m.kickoff) > Date.now())
      .sort((a, b) => new Date(a.kickoff) - new Date(b.kickoff)).slice(0, 6);
    (next.length ? next : WC.matches.slice(0, 6)).forEach(m => up.appendChild(WCMatchCard(m)));
    WCRefresh();
  }
  buildUpcoming();
  window.__rerender = buildUpcoming;
  document.addEventListener("tzchange", buildUpcoming);

  // لمحة المجموعات
  const gm = document.getElementById("groupsMini");
  WC.groups.forEach(function (g) {
    const card = document.createElement("a");
    card.className = "card reveal"; card.href = "groups.html#g" + g;
    let html = '<h3 style="margin-bottom:10px">المجموعة <span class="gold">' + g + '</span></h3>';
    WC.teamsInGroup(g).forEach(function (k) {
      html += '<div style="display:flex;align-items:center;gap:8px;padding:4px 0;font-weight:600;font-size:.92rem"><img src="' + WC.flagUrl(k, "w20") + '" style="width:24px;height:17px;border-radius:3px"> ' + WC.team(k).name + '</div>';
    });
    card.innerHTML = html;
    gm.appendChild(card);
  });

  // شريط الأخبار
  const tk = document.getElementById("ticker");
  const items = WC.matches.slice(0, 14).map(m =>
    '<span>' + WC.team(m.home).name + ' <b>vs</b> ' + WC.team(m.away).name + ' · ' + m.time + '</span>');
  tk.innerHTML = items.join("") + items.join("");

  WCRefresh();
});
