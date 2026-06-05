/* =========================================================================
   PAGE · team — متحكّم الصفحة (مستخرَج كما هو؛ يعتمد على واجهة WC العامة)
   ========================================================================= */
document.addEventListener("DOMContentLoaded", function () {
  const root = document.getElementById("teamRoot");
  const key = new URLSearchParams(location.search).get("team");
  const t = key && WC.team(key);
  if (!t) {
    root.innerHTML = '<div class="empty">⚽ هذا المنتخب ليس في رادارنا… <a class="gold" href="matches.html">عُد إلى ساحة المباريات</a></div>';
    return;
  }
  document.title = t.name + " · كأس العالم 2026";

  const matches = WC.matchesOfTeam(key);
  const isFav = WCFav.has(key);

  // البطل
  const hero = document.createElement("div");
  hero.className = "team-hero reveal";
  hero.innerHTML =
    '<img class="bigflag" src="' + WC.flagUrl(key, "w320") + '" alt="' + t.name + '">' +
    '<div style="flex:1;min-width:240px">' +
      '<h1>' + t.name + '</h1>' +
      '<div class="meta">' +
        '<span>المجموعة ' + t.group + '</span>' +
        '<span>' + t.confed + '</span>' +
        '<span>تصنيف فيفا: #' + t.fifa + '</span>' +
        '<span>' + matches.length + ' مباريات في الدور الأول</span>' +
      '</div>' +
    '</div>' +
    '<button class="btn ' + (isFav ? 'btn-gold' : 'btn-ghost') + '" id="favBtn">' + (isFav ? '★ منتخبي في القلب' : '☆ ارفع رايته') + '</button>';
  root.appendChild(hero);

  // العدّاد للمباراة القادمة
  const next = WC.nextMatch(key);
  if (next) {
    const opp = next.home === key ? next.away : next.home;
    const cd = document.createElement("div");
    cd.className = "countdown-card reveal";
    cd.style.marginTop = "22px";
    cd.innerHTML =
      '<div class="cd-head"><span class="lbl">🔥 صافرة ' + t.name + ' القادمة</span></div>' +
      '<div class="cd-match">' +
        '<div class="t"><img src="' + WC.flagUrl(key) + '"><span>' + t.name + '</span></div>' +
        '<span class="vs">VS</span>' +
        '<a class="t" href="team.html?team=' + opp + '"><img src="' + WC.flagUrl(opp) + '"><span>' + WC.team(opp).name + '</span></a>' +
      '</div>' +
      '<div class="cd-timer" id="teamCd"></div>';
    root.appendChild(cd);
    const box = document.getElementById("teamCd");
    // استخدام الساعة المركزية الموحّدة بدل مؤقّت مستقل
    WCClock.add(function () {
      const p = WCDiffParts(next.kickoff);
      box.innerHTML = WCcdUnit(p.days, "يوم") + WCcdUnit(p.h, "ساعة") + WCcdUnit(p.m, "دقيقة") + WCcdUnit(p.s, "ثانية");
    });
  }

  // كل مباريات المنتخب
  const sec = document.createElement("div");
  sec.style.marginTop = "30px";
  sec.innerHTML = '<div class="section-head"><div><h2>رحلة ' + t.name + ' في دور المجموعات</h2></div></div>';
  const grid = document.createElement("div");
  grid.className = "grid grid-2";
  matches.forEach(m => grid.appendChild(WCMatchCard(m)));
  sec.appendChild(grid);
  root.appendChild(sec);

  // منافسو المجموعة
  const rivals = WC.teamsInGroup(t.group).filter(k => k !== key);
  const rsec = document.createElement("div");
  rsec.style.marginTop = "30px";
  rsec.innerHTML = '<div class="section-head"><div><h2>خصوم الطريق في المجموعة ' + t.group + '</h2></div></div>';
  const rgrid = document.createElement("div");
  rgrid.className = "grid grid-3";
  rivals.forEach(k => {
    const a = document.createElement("a");
    a.className = "card reveal"; a.href = "team.html?team=" + k;
    a.style.cssText = "display:flex;align-items:center;gap:12px";
    a.innerHTML = '<img src="' + WC.flagUrl(k, "w40") + '" style="width:46px;height:34px;border-radius:5px;object-fit:cover"><div><b>' + WC.team(k).name + '</b><br><small class="muted">' + WC.team(k).confed + '</small></div>';
    rgrid.appendChild(a);
  });
  rsec.appendChild(rgrid);
  root.appendChild(rsec);

  document.getElementById("favBtn").addEventListener("click", function () {
    WCFav.toggle(key);
    const on = WCFav.has(key);
    this.className = "btn " + (on ? "btn-gold" : "btn-ghost");
    this.textContent = on ? "★ منتخبي في القلب" : "☆ ارفع رايته";
  });

  WCRefresh();
  // عند تغيير المنطقة الزمنية: إعادة تحميل الصفحة لتحديث كل التوقيتات
  window.__rerender = function () { location.reload(); };
});
