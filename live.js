/* =========================================================================
   PAGE · live — متحكّم الصفحة (مستخرَج كما هو؛ يعتمد على واجهة WC العامة)
   ========================================================================= */
document.addEventListener("DOMContentLoaded", function () {
  /* ---------- المتابعة الحية ---------- */
  function buildLive() {
    const live = document.getElementById("liveNow");
    live.innerHTML = "";
    const now = Date.now();
    let shown = WC.matches.filter(m => { const d = new Date(m.kickoff).getTime() - now; return d > -7200000 && d < 864e5 * 3; }).slice(0, 6);
    if (!shown.length) shown = WC.matches.slice(0, 6);
    shown.forEach(m => live.appendChild(WCMatchCard(m)));
    WCRefresh();
  }
  buildLive();
  window.__rerender = buildLive;
  document.addEventListener("tzchange", buildLive);

  /* ---------- الرسوم البيانية ---------- */
  const C = { gold: "#ffffff", em: "#c9c9c9", blue: "#9a9a9a", red: "#e0e0e0", grid: "rgba(255,255,255,.08)", text: "#b6b6b6" };
  Chart.defaults.font.family = "Tajawal";
  Chart.defaults.color = C.text;

  const confeds = {};
  Object.values(WC.teams).forEach(t => confeds[t.confed] = (confeds[t.confed] || 0) + 1);
  new Chart(document.getElementById("confedChart"), {
    type: "doughnut",
    data: { labels: Object.keys(confeds), datasets: [{ data: Object.values(confeds), backgroundColor: ["#ffffff", "#cfcfcf", "#a8a8a8", "#808080", "#5e5e5e", "#3c3c3c"], borderColor: "#000000", borderWidth: 3 }] },
    options: { plugins: { legend: { position: "bottom" }, title: { display: true, text: "العالم يجتمع: المنتخبات حسب القارة", color: "#ffffff", font: { size: 15, weight: "700" } } } }
  });

  // أعلى 8 منتخبات بتصنيف فيفا
  const top = Object.entries(WC.teams).sort((a, b) => a[1].fifa - b[1].fifa).slice(0, 8);
  new Chart(document.getElementById("ratingChart"), {
    type: "bar",
    data: { labels: top.map(t => t[1].name), datasets: [{ label: "تصنيف فيفا (الأقل أفضل)", data: top.map(t => t[1].fifa), backgroundColor: C.gold, borderRadius: 6 }] },
    options: { indexAxis: "y", plugins: { legend: { display: false }, title: { display: true, text: "كبار البطولة حسب تصنيف فيفا", color: "#ffffff", font: { size: 15, weight: "700" } } }, scales: { x: { grid: { color: C.grid } }, y: { grid: { display: false } } } }
  });

  /* ---------- تصويت الجماهير ---------- */
  const sel = document.getElementById("voteTeam");
  Object.entries(WC.teams).sort((a, b) => a[1].fifa - b[1].fifa).forEach(([k, t]) => sel.add(new Option(t.name, k)));
  const myVote = WCStore.get("vote", null);
  if (myVote) sel.value = myVote;

  function votes() {
    // أصوات أساسية واقعية + صوت الزائر
    const base = WCStore.get("votes", {});
    const seed = { ar: 38, fr: 31, br: 35, es: 29, en: 27, pt: 22, de: 18, nl: 15 };
    const all = {};
    Object.keys(WC.teams).forEach(k => all[k] = (seed[k] || 3) + (base[k] || 0));
    return all;
  }
  function renderVotes() {
    const v = votes();
    const total = Object.values(v).reduce((a, b) => a + b, 0);
    const top6 = Object.entries(v).sort((a, b) => b[1] - a[1]).slice(0, 6);
    document.getElementById("voteResults").innerHTML = '<h3 style="margin-bottom:14px">🏆 سادة المدرّجات الآن</h3>' +
      top6.map(([k, n]) => {
        const pct = Math.round(n / total * 100);
        return '<div style="margin-bottom:12px"><div style="display:flex;justify-content:space-between;font-weight:700;font-size:.9rem">' +
          '<span><img src="' + WC.flagUrl(k, "w20") + '" style="width:20px;height:14px;border-radius:2px;vertical-align:-2px;margin-left:6px">' + WC.team(k).name + '</span><span class="gold">' + pct + '%</span></div>' +
          '<div class="vote-bar"><span style="width:' + pct + '%"></span></div></div>';
      }).join("");
  }
  renderVotes();
  document.getElementById("voteBtn").addEventListener("click", function () {
    const k = sel.value;
    const base = WCStore.get("votes", {});
    const prev = WCStore.get("vote", null);
    if (prev && base[prev]) base[prev]--;       // ألغِ الصوت السابق
    base[k] = (base[k] || 0) + 1;
    WCStore.set("votes", base); WCStore.set("vote", k);
    renderVotes();
    WCToast("🗳️", "صوتك مع " + WC.team(k).name + " دوّى في المدرّجات! 🔥");
  });

  /* ---------- التعليقات ---------- */
  function comments() { return WCStore.get("comments", [
    { n: "محمد", t: "أتوقّع مفاجأت كبيرة من المنتخبات الأفريقية هذه النسخة! 🔥", ts: Date.now() - 7200000 },
    { n: "سارة", t: "الأرجنتين هي المرشّح الأقوى للاحتفاظ باللقب بلا منازع.", ts: Date.now() - 3600000 }
  ]); }
  function renderComments() {
    const list = comments().slice().reverse();
    document.getElementById("comments").innerHTML = list.map(c =>
      '<div class="comment"><div class="c-head"><span class="c-av">' + (c.n[0] || "?") + '</span><span class="c-name">' + c.n + '</span>' +
      '<span class="c-time">' + new Date(c.ts).toLocaleDateString("ar", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }) + '</span></div>' +
      '<div>' + c.t.replace(/</g, "&lt;") + '</div></div>').join("");
  }
  renderComments();
  document.getElementById("cSend").addEventListener("click", function () {
    const n = document.getElementById("cName").value.trim() || "مشجّع";
    const t = document.getElementById("cText").value.trim();
    if (!t) { WCToast("✏️", "قُل كلمتك أولاً قبل أن تهتف!"); return; }
    const list = comments(); list.push({ n, t, ts: Date.now() });
    WCStore.set("comments", list);
    document.getElementById("cText").value = "";
    renderComments();
    WCToast("💬", "دوّى صوتك في المدرّج! 📣");
  });
});
