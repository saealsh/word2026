/* =========================================================================
   PAGE · knockout — شجرة إقصاء تفاعلية (توقّع الفائز من كل دور حتى البطل)
   انقر خانة لتتأهّل للدور التالي. تُحفظ توقّعاتك على جهازك.
   ========================================================================= */
document.addEventListener("DOMContentLoaded", function () {
  const GROUP_COLORS = {
    A:"#ff5d5d", B:"#ffa23e", C:"#ffd84d", D:"#9be15d", E:"#5de1b5",
    F:"#5dc9ff", G:"#6d8bff", H:"#a98bff", I:"#e16dff", J:"#ff6db5", K:"#ff8d6d", L:"#c0c0c0"
  };

  // خانات دور الـ32 (16 مباراة × خانتان) — كائن { l: التسمية, g: المجموعة|null }
  const R32 = [
    { l:"متصدّر A", g:"A" }, { l:"ثالث (C/E/F/H)", g:null },
    { l:"متصدّر E", g:"E" }, { l:"وصيف A", g:"A" },
    { l:"متصدّر F", g:"F" }, { l:"ثالث (A/B/F/G)", g:null },
    { l:"متصدّر C", g:"C" }, { l:"وصيف F", g:"F" },
    { l:"متصدّر I", g:"I" }, { l:"ثالث (C/D/F/H)", g:null },
    { l:"متصدّر B", g:"B" }, { l:"وصيف E", g:"E" },
    { l:"متصدّر L", g:"L" }, { l:"ثالث (E/H/I/J)", g:null },
    { l:"متصدّر D", g:"D" }, { l:"وصيف L", g:"L" },
    { l:"متصدّر G", g:"G" }, { l:"ثالث (A/E/H/I)", g:null },
    { l:"متصدّر K", g:"K" }, { l:"وصيف D", g:"D" },
    { l:"متصدّر J", g:"J" }, { l:"ثالث (B/E/I/J)", g:null },
    { l:"متصدّر H", g:"H" }, { l:"وصيف I", g:"I" },
    { l:"وصيف B", g:"B" }, { l:"وصيف J", g:"J" },
    { l:"وصيف K", g:"K" }, { l:"ثالث (D/E/I/L)", g:null },
    { l:"وصيف C", g:"C" }, { l:"وصيف G", g:"G" },
    { l:"وصيف H", g:"H" }, { l:"ثالث (A/D/G/L)", g:null }
  ];

  const ROUNDS = [
    { key:"r32", name:"دور الـ32", sub:"28 يونيو – 3 يوليو", n:16 },
    { key:"r16", name:"دور الـ16", sub:"4 – 7 يوليو", n:8 },
    { key:"qf",  name:"ربع النهائي", sub:"9 – 11 يوليو", n:4 },
    { key:"sf",  name:"نصف النهائي", sub:"14 – 15 يوليو", n:2 },
    { key:"final", name:"النهائي", sub:"19 يوليو", n:1 }
  ];

  // الحالة: picks["r-i"] = 0 أو 1 (الخانة الفائزة) — محفوظة على الجهاز
  let picks = WCStore.get("koPicks", {});
  const keyOf = (r, i) => r + "-" + i;

  // تسمية خانة في مباراة (r,i) على الجهة side
  function slot(r, i, side) {
    if (r === 0) return R32[i * 2 + side];
    return winner(r - 1, i * 2 + side); // الفائز من المباراة المغذّية
  }
  // الفائز من مباراة (r,i) إن اختير، وإلا null
  function winner(r, i) {
    const p = picks[keyOf(r, i)];
    if (p === undefined) return null;
    return slot(r, i, p);
  }

  const bracket = document.getElementById("bracket");
  const legend = document.getElementById("legend");

  // مفتاح الألوان
  WC.groups.forEach(g => {
    const s = document.createElement("span");
    s.innerHTML = '<i style="background:' + GROUP_COLORS[g] + '"></i> المجموعة ' + g;
    legend.appendChild(s);
  });
  // شريط الأدوات
  const tools = document.createElement("div");
  tools.style.cssText = "display:flex;gap:10px;flex-wrap:wrap;margin:0 0 16px";
  tools.innerHTML =
    '<button class="btn btn-gold" id="koShare">📤 شارك توقّعي للبطل</button>' +
    '<button class="btn btn-ghost" id="koReset">↺ تصفير الشجرة</button>' +
    '<span class="muted" id="koChampLbl" style="margin-inline-start:auto;align-self:center;font-weight:800"></span>';
  legend.parentNode.insertBefore(tools, legend.nextSibling);

  function dot(g) {
    const c = g ? GROUP_COLORS[g] : "#888";
    return '<span class="ko-grp" style="background:' + c + ';color:' + c + '"></span>';
  }
  function slotHTML(r, i, side) {
    const s = slot(r, i, side);
    const won = picks[keyOf(r, i)] === side;
    const label = s ? s.l : "— يُحدَّد —";
    const cls = "ko-slot ko-pick" + (won ? " win" : "") + (s ? "" : " empty");
    return '<div class="' + cls + '" data-r="' + r + '" data-i="' + i + '" data-side="' + side + '">' +
      dot(s ? s.g : null) + '<span>' + label + '</span>' +
      (won ? '<span class="ko-tick">✓</span>' : '') + '</div>';
  }

  function render() {
    bracket.innerHTML = "";
    let matchNo = 73;
    ROUNDS.forEach((r, ri) => {
      const col = document.createElement("div");
      col.className = "ko-round" + (ri === 0 ? " is-first" : "") + (ri === ROUNDS.length - 1 ? " is-last ko-final" : "");
      col.innerHTML = '<h3>' + r.name + '<small>' + r.sub + '</small></h3>';
      for (let i = 0; i < r.n; i++) {
        const mno = matchNo++;
        const m = document.createElement("div");
        m.className = "ko-match";
        m.innerHTML = slotHTML(ri, i, 0) + slotHTML(ri, i, 1) + '<div class="ko-mno">مباراة ' + mno + '</div>';
        col.appendChild(m);
      }
      bracket.appendChild(col);
    });

    // عمود البطل
    const champ = document.createElement("div");
    champ.className = "ko-round ko-champ-col";
    const w = winner(ROUNDS.length - 1, 0);
    champ.innerHTML = '<h3>البطل<small>كأس العالم</small></h3>' +
      '<div class="ko-match ko-champion"><div class="cup">🏆</div>' +
      '<b>' + (w ? w.l : "بطلك المتوقّع") + '</b>' +
      '<div class="ko-third">انقر الخانات لتملأ طريقك إلى المجد</div></div>';
    bracket.appendChild(champ);

    document.getElementById("koChampLbl").textContent = w ? ("🏆 توقّعك للبطل: " + w.l) : "اختر الفائزين حتى تتوّج بطلك";
    WCRefresh();
  }

  // النقر على خانة = ترشيحها للفوز
  bracket.addEventListener("click", function (e) {
    const el = e.target.closest(".ko-pick");
    if (!el || el.classList.contains("empty")) return;
    const r = +el.dataset.r, i = +el.dataset.i, side = +el.dataset.side;
    const k = keyOf(r, i);
    if (picks[k] === side) delete picks[k]; else picks[k] = side; // إلغاء الترشيح إن نُقر مجدداً
    WCStore.set("koPicks", picks);
    render();
  });

  document.getElementById("koReset").addEventListener("click", function () {
    if (!confirm("تصفير كل توقّعات الشجرة؟")) return;
    picks = {}; WCStore.set("koPicks", picks); render();
    WCToast("↺", "صُفّرت شجرة الإقصاء");
  });
  document.getElementById("koShare").addEventListener("click", async function () {
    const w = winner(ROUNDS.length - 1, 0);
    const txt = "🏆 توقّعي لبطل كأس العالم 2026: " + (w ? w.l : "لم أحسم بعد") + "\nجرّب تملأ شجرتك أنت أيضاً!";
    try {
      if (navigator.share) await navigator.share({ title: "شجرتي · مونديال 2026", text: txt });
      else { await navigator.clipboard.writeText(txt); WCToast("📋", "نُسخ توقّعك — الصقه أينما شئت"); }
    } catch (err) {}
  });

  render();
});
