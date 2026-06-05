/* =========================================================================
   PAGE · knockout — متحكّم الصفحة (مستخرَج كما هو؛ يعتمد على واجهة WC العامة)
   ========================================================================= */
document.addEventListener("DOMContentLoaded", function () {
  // ألوان مميّزة لكل مجموعة (لنقاط الـ seed)
  const GROUP_COLORS = {
    A:"#ff5d5d", B:"#ffa23e", C:"#ffd84d", D:"#9be15d", E:"#5de1b5",
    F:"#5dc9ff", G:"#6d8bff", H:"#a98bff", I:"#e16dff", J:"#ff6db5", K:"#ff8d6d", L:"#c0c0c0"
  };

  // مفتاح الألوان
  const legend = document.getElementById("legend");
  WC.groups.forEach(g => {
    const s = document.createElement("span");
    s.innerHTML = '<i style="background:' + GROUP_COLORS[g] + ';color:' + GROUP_COLORS[g] + '"></i> المجموعة ' + g;
    legend.appendChild(s);
  });

  // خانات دور الـ32: متصدّر/وصيف لكل مجموعة + أصحاب المركز الثالث
  const r32 = [
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

  const rounds = [
    { key:"r32", name:"دور الـ32", sub:"28 يونيو – 3 يوليو", n:16, city:"16 ملعباً" },
    { key:"r16", name:"دور الـ16", sub:"4 – 7 يوليو", n:8, city:"8 مدن مضيفة" },
    { key:"qf", name:"ربع النهائي", sub:"9 – 11 يوليو", n:4, city:"بوسطن · لوس أنجلوس · ميامي · كانساس" },
    { key:"sf", name:"نصف النهائي", sub:"14 – 15 يوليو", n:2, city:"دالاس · أتلانتا" },
    { key:"final", name:"النهائي", sub:"19 يوليو", n:1, city:"ملعب ميت لايف · نيويورك" }
  ];

  const bracket = document.getElementById("bracket");
  let matchNo = 73;

  function seedDot(g) {
    if (!g) return '<span class="ko-grp" style="background:#888;color:#888"></span>';
    return '<span class="ko-grp" style="background:' + GROUP_COLORS[g] + ';color:' + GROUP_COLORS[g] + '"></span>';
  }
  function slot(s, idx) {
    return '<div class="ko-slot">' +
      '<span class="ko-seed">' + (idx != null ? (idx + 1) : "—") + '</span>' +
      seedDot(s.g) + '<span>' + s.l + '</span></div>';
  }

  rounds.forEach((r, ri) => {
    const col = document.createElement("div");
    col.className = "ko-round" +
      (ri === 0 ? " is-first" : "") +
      (ri === rounds.length - 1 ? " is-last" : "") +
      (r.key === "final" ? " ko-final" : "");
    col.innerHTML = '<h3>' + r.name + '<small>' + r.sub + '</small></h3>';
    for (let i = 0; i < r.n; i++) {
      const mno = matchNo++;
      let aHtml, bHtml;
      if (ri === 0) {
        aHtml = slot(r32[i * 2], i * 2);
        bHtml = slot(r32[i * 2 + 1], i * 2 + 1);
      } else {
        aHtml = slot({ l: "الفائز م" + mnoRef(ri, i, 0), g: null });
        bHtml = slot({ l: "الفائز م" + mnoRef(ri, i, 1), g: null });
      }
      const m = document.createElement("div");
      m.className = "ko-match reveal";
      m.innerHTML = aHtml + bHtml +
        '<div class="ko-mno"><span>مباراة ' + mno + '</span>' +
        (ri >= 2 ? '<span class="ko-venue">📍 ' + (ri === 4 ? "نيويورك" : (ri === 3 ? "دالاس/أتلانتا" : "مدينة مضيفة")) + '</span>' : '') +
        '</div>';
      col.appendChild(m);
    }
    bracket.appendChild(col);
  });

  // عمود البطل
  const champ = document.createElement("div");
  champ.className = "ko-round ko-champ-col";
  champ.innerHTML = '<h3>البطل<small>كأس العالم</small></h3>' +
    '<div class="ko-match ko-champion"><div class="cup">🏆</div><b>بطل العالم 2026</b>' +
    '<div class="ko-third">مباراة تحديد المركز الثالث · 18 يوليو</div></div>';
  bracket.appendChild(champ);

  // رسم الوصلات العمودية بين كل زوج بعد تموضع البطاقات
  function drawPairs() {
    document.querySelectorAll(".ko-pair").forEach(e => e.remove());
    const cols = Array.prototype.slice.call(bracket.querySelectorAll(".ko-round"));
    cols.forEach((col, ci) => {
      if (col.classList.contains("is-last") || col.classList.contains("ko-champ-col")) return;
      const matches = col.querySelectorAll(".ko-match");
      const cb = col.getBoundingClientRect();
      for (let i = 0; i + 1 < matches.length; i += 2) {
        const r1 = matches[i].getBoundingClientRect();
        const r2 = matches[i + 1].getBoundingClientRect();
        const y1 = r1.top + r1.height / 2 - cb.top;
        const y2 = r2.top + r2.height / 2 - cb.top;
        const line = document.createElement("div");
        line.className = "ko-pair";
        line.style.top = Math.min(y1, y2) + "px";
        line.style.height = Math.abs(y2 - y1) + "px";
        col.appendChild(line);
      }
    });
  }

  function mnoRef(roundIndex, i, side) {
    const startPrev = { 1: 73, 2: 89, 3: 97, 4: 101 }[roundIndex];
    return startPrev + i * 2 + side;
  }

  WCRefresh();
  // ارسم الوصلات بعد ظهور العناصر، وعند تغيّر حجم النافذة
  setTimeout(drawPairs, 350);
  window.addEventListener("resize", function () { clearTimeout(window.__koT); window.__koT = setTimeout(drawPairs, 150); });
  document.querySelector(".ko-scroll").addEventListener("scroll", function () { clearTimeout(window.__koS); window.__koS = setTimeout(drawPairs, 80); });
});
