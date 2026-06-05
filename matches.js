/* =========================================================================
   PAGE · matches — متحكّم الصفحة (مستخرَج كما هو؛ يعتمد على واجهة WC العامة)
   ========================================================================= */
document.addEventListener("DOMContentLoaded", function () {
  const list = document.getElementById("matchList");
  const fSearch = document.getElementById("fSearch");
  const fGroup = document.getElementById("fGroup");
  const fRound = document.getElementById("fRound");
  const fDate = document.getElementById("fDate");
  const favOnly = document.getElementById("favOnly");
  const intOnly = document.getElementById("intOnly");
  const countEl = document.getElementById("count");
  const emptyEl = document.getElementById("empty");
  let favMode = false, intMode = false, lastRows = WC.matches;

  // قراءة منتخب من رابط (?team=) لتفعيل الفلتر
  const urlTeam = new URLSearchParams(location.search).get("team");

  // أدوات التصدير: PDF + التقويم
  document.getElementById("btnPdf").addEventListener("click", function () {
    WCExportPDF(lastRows, { subtitle: (lastRows.length === WC.matches.length ? "دور المجموعات كاملاً" : "اختيارك") + " · " + lastRows.length + " مباراة" });
  });
  document.getElementById("btnCalAll").addEventListener("click", function () {
    WCDownloadICSMulti(WC.matches, "WorldCup2026-AllMatches.ics", "كأس العالم 2026");
  });
  document.getElementById("btnCalInt").addEventListener("click", function () {
    WCDownloadICSMulti(WC.matches.filter(m => WCInterest.has(m.id)), "WorldCup2026-MyMatches.ics", "اهتماماتي · كأس العالم 2026");
  });

  WC.groups.forEach(g => fGroup.add(new Option("المجموعة " + g, g)));
  function buildDateOptions() {
    const cur = fDate.value;
    fDate.length = 1; // أبقِ خيار "كل التواريخ"
    [...new Set(WC.matches.map(m => WC.displayDateKey(m)))].sort().forEach(k =>
      fDate.add(new Option(WC.displayDateKeyLabel(k), k)));
    fDate.value = [...fDate.options].some(o => o.value === cur) ? cur : "";
  }
  buildDateOptions();

  favOnly.addEventListener("click", () => { favMode = !favMode; favOnly.classList.toggle("active", favMode); applyFilters(); });
  intOnly.addEventListener("click", () => { intMode = !intMode; intOnly.classList.toggle("active", intMode); applyFilters(); });

  // البطاقات تُبنى مرة واحدة (العملية المكلفة)، ثم الفلترة تتم بإظهار/إخفاء فقط (رخيصة).
  // يُعاد البناء فقط عند تغيّر المنطقة الزمنية، لأن التجميع حسب اليوم يعتمد عليها.
  let cards = [];      // [{ el, m, group, round, dateKey, names }]
  let groupsDom = [];  // [{ header, grid, cards:[...] }]

  function build() {
    list.innerHTML = "";
    cards = []; groupsDom = [];
    const byDate = {};
    WC.matches.forEach(m => { const k = WC.displayDateKey(m); (byDate[k] = byDate[k] || []).push(m); });
    Object.keys(byDate).sort().forEach(key => {
      const h = document.createElement("h3");
      h.style.cssText = "margin:26px 0 14px;font-size:1.1rem;color:var(--gold)";
      h.textContent = "📅 " + WC.displayDateKeyLabel(key);
      const grid = document.createElement("div");
      grid.className = "grid grid-2";
      const gc = [];
      byDate[key].forEach(m => {
        const el = WCMatchCard(m);
        const meta = { el: el, m: m, group: m.group, round: String(m.round), dateKey: key,
                       names: WC.team(m.home).name + " " + WC.team(m.away).name };
        grid.appendChild(el); cards.push(meta); gc.push(meta);
      });
      list.appendChild(h); list.appendChild(grid);
      groupsDom.push({ header: h, grid: grid, cards: gc });
    });
    applyFilters();
  }

  function applyFilters() {
    const q = fSearch.value.trim();
    const g = fGroup.value, r = fRound.value, d = fDate.value;
    const favs = WCFav.list(), ints = WCInterest.list();
    const shownRows = [];
    for (const c of cards) {
      let ok = true;
      if (g && c.group !== g) ok = false;
      else if (r && c.round !== r) ok = false;
      else if (d && c.dateKey !== d) ok = false;
      else if (favMode && !(favs.includes(c.m.home) || favs.includes(c.m.away))) ok = false;
      else if (intMode && !ints.includes(c.m.id)) ok = false;
      else if (urlTeam && c.m.home !== urlTeam && c.m.away !== urlTeam) ok = false;
      else if (q && c.names.indexOf(q) === -1) ok = false;
      c.el.classList.toggle("is-hidden", !ok);
      if (ok) shownRows.push(c.m);
    }
    // أخفِ عناوين الأيام التي لا تحوي مباريات ظاهرة
    for (const gr of groupsDom) {
      const any = gr.cards.some(c => !c.el.classList.contains("is-hidden"));
      gr.header.classList.toggle("is-hidden", !any);
      gr.grid.classList.toggle("is-hidden", !any);
    }
    lastRows = shownRows;
    countEl.textContent = shownRows.length + " مباراة";
    emptyEl.style.display = shownRows.length ? "none" : "block";
    WCRefresh(); // يكشف البطاقات الظاهرة ويعيد جمع العدّادات المُخزَّنة
  }

  // تأخير البحث (debounce) كي لا تتكرّر الفلترة مع كل ضغطة مفتاح
  let _searchTimer;
  fSearch.addEventListener("input", function () { clearTimeout(_searchTimer); _searchTimer = setTimeout(applyFilters, 120); });
  [fGroup, fRound, fDate].forEach(el => el.addEventListener("change", applyFilters));
  document.addEventListener("favchange", applyFilters);
  document.addEventListener("interestchange", applyFilters);
  document.addEventListener("tzchange", function () { buildDateOptions(); build(); });
  window.__rerender = function () { buildDateOptions(); build(); };
  build();
});
