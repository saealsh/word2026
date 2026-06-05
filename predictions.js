/* =========================================================================
   PAGE · predictions — متحكّم الصفحة (مستخرَج كما هو؛ يعتمد على واجهة WC العامة)
   ========================================================================= */
document.addEventListener("DOMContentLoaded", function () {
  const preds = WCStore.get("preds", {});           // { matchId: "h"|"d"|"a" }
  let champ = WCStore.get("predChamp", "");

  // اختيار البطل
  const champSel = document.getElementById("champSel");
  Object.entries(WC.teams).sort((a, b) => a[1].fifa - b[1].fifa)
    .forEach(([k, t]) => champSel.add(new Option(t.name, k)));
  champSel.value = champ;
  function renderChamp() {
    const b = document.getElementById("champBadge");
    if (champ && WC.team(champ)) b.innerHTML = '<img src="' + WC.flagUrl(champ) + '" alt=""> ' + WC.team(champ).name + ' 🏆';
    else b.innerHTML = '<span class="muted">لم تختر بعد</span>';
  }
  champSel.addEventListener("change", function () {
    champ = champSel.value; WCStore.set("predChamp", champ); renderChamp();
    if (champ) WCToast("🏆", "بطلك المتوقّع: " + WC.team(champ).name);
  });
  renderChamp();

  // التقدّم العام + شارات المجموعات
  let wasComplete = false;
  function updateProgress() {
    const total = WC.matches.length;
    const n = Object.keys(preds).length;
    document.getElementById("progTxt").textContent = n + " / " + total;
    document.getElementById("progBar").style.width = (n / total * 100) + "%";
    // شارة كل مجموعة
    WC.groups.forEach(function (g) {
      const ms = WC.matchesOfGroup(g);
      const done = ms.filter(m => preds[m.id]).length;
      const badge = document.querySelector('.gp-badge[data-gp="' + g + '"]');
      if (badge) {
        badge.textContent = done + " / " + ms.length;
        badge.classList.toggle("done", done === ms.length);
      }
    });
    // احتفال عند اكتمال الـ72 لأول مرة
    const complete = n === total;
    if (complete && !wasComplete) { celebrate(); WCToast("🎉", "أكملت كل توقّعاتك! نزّل بطاقتك وتفاخر بها 🔥"); }
    wasComplete = complete;
  }

  // قُصاصات احتفالية
  function celebrate() {
    const box = document.createElement("div");
    box.className = "confetti";
    const colors = ["#ffffff", "#ffd84d", "#5dc9ff", "#ff6db5", "#9be15d", "#ffa23e"];
    for (let i = 0; i < 90; i++) {
      const c = document.createElement("i");
      c.style.left = Math.random() * 100 + "vw";
      c.style.background = colors[i % colors.length];
      c.style.animationDuration = (2.4 + Math.random() * 2) + "s";
      c.style.animationDelay = (Math.random() * 0.6) + "s";
      box.appendChild(c);
    }
    document.body.appendChild(box);
    setTimeout(() => box.remove(), 5000);
  }

  // يعكس قيم preds على الأزرار في الشاشة
  function syncButtons() {
    root.querySelectorAll(".pred-row").forEach(function (row) {
      const id = row.dataset.id, p = preds[id] || "";
      row.querySelectorAll(".pred-choices button").forEach(function (b) {
        b.classList.toggle("sel", b.dataset.c === p);
      });
    });
  }

  // صفوف التوقّع مجمّعة حسب المجموعة
  const root = document.getElementById("predRoot");
  WC.groups.forEach(function (g) {
    const card = document.createElement("div");
    card.className = "group-card reveal"; card.style.marginBottom = "16px";
    let html = '<h3>المجموعة <span>' + g + '</span> <span class="gp-badge" data-gp="' + g + '">0 / 6</span></h3><div style="padding:6px 14px 12px">';
    WC.matchesOfGroup(g).sort((a, b) => new Date(a.kickoff) - new Date(b.kickoff)).forEach(function (m) {
      const t = WC.team(m.home), a = WC.team(m.away), p = preds[m.id] || "";
      html += '<div class="pred-row" data-id="' + m.id + '">' +
        '<div class="pred-team"><img src="' + WC.flagUrl(m.home) + '" alt=""><span>' + t.name + '</span></div>' +
        '<div class="pred-choices">' +
          '<button data-c="h" class="' + (p === "h" ? "sel" : "") + '" title="فوز ' + t.name + '">1</button>' +
          '<button data-c="d" class="' + (p === "d" ? "sel" : "") + '" title="تعادل">X</button>' +
          '<button data-c="a" class="' + (p === "a" ? "sel" : "") + '" title="فوز ' + a.name + '">2</button>' +
        '</div>' +
        '<div class="pred-team away"><span>' + a.name + '</span><img src="' + WC.flagUrl(m.away) + '" alt=""></div>' +
      '</div>';
    });
    html += '</div>';
    card.innerHTML = html;
    root.appendChild(card);
  });

  // التقاط النقر على خيارات التوقّع
  root.addEventListener("click", function (e) {
    const btn = e.target.closest(".pred-choices button");
    if (!btn) return;
    const row = btn.closest(".pred-row"), id = row.dataset.id, c = btn.dataset.c;
    if (preds[id] === c) { delete preds[id]; btn.classList.remove("sel"); }
    else {
      preds[id] = c;
      row.querySelectorAll(".pred-choices button").forEach(b => b.classList.remove("sel"));
      btn.classList.add("sel");
    }
    WCStore.set("preds", preds);
    updateProgress();
  });
  wasComplete = Object.keys(preds).length === WC.matches.length; // تفادي إطلاق الاحتفال عند التحميل
  updateProgress();

  // مشاركة بطاقة التوقّعات
  document.getElementById("btnShare").addEventListener("click", async function () {
    const n = Object.keys(preds).length;
    const champTxt = champ && WC.team(champ) ? WC.team(champ).name : "لم يُحدَّد بعد";
    const text = "🔮 توقّعاتي لكأس العالم 2026:\n🏆 البطل: " + champTxt + "\n✅ تنبّأتُ بـ " + n + " من " + WC.matches.length + " مباراة\nجرّب توقّعاتك أنت أيضاً!";
    try {
      if (navigator.share) { await navigator.share({ title: "توقّعاتي · مونديال 2026", text: text }); }
      else { await navigator.clipboard.writeText(text); WCToast("📋", "نُسخت بطاقة توقّعاتك — الصقها أينما شئت"); }
    } catch (err) { /* أُلغيت المشاركة */ }
  });

  // ⚡ ملء تلقائي حسب تصنيف فيفا (الأقوى يفوز، وتعادل عند التساوي)
  document.getElementById("btnAuto").addEventListener("click", function () {
    WC.matches.forEach(function (m) {
      const fh = WC.team(m.home).fifa, fa = WC.team(m.away).fifa;
      preds[m.id] = fh < fa ? "h" : (fa < fh ? "a" : "d");
    });
    // البطل = الأعلى تصنيفاً بين كل المنتخبات
    const best = Object.entries(WC.teams).sort((a, b) => a[1].fifa - b[1].fifa)[0][0];
    champ = best; champSel.value = best; WCStore.set("predChamp", best); renderChamp();
    WCStore.set("preds", preds);
    syncButtons(); updateProgress();
    WCToast("⚡", "عبّأنا توقّعاتك حسب تصنيف فيفا — عدّل ما يحلو لك");
  });

  // 🎲 ملء عشوائي
  document.getElementById("btnRandom").addEventListener("click", function () {
    const opts = ["h", "d", "a"];
    WC.matches.forEach(function (m) { preds[m.id] = opts[Math.floor(Math.random() * 3)]; });
    const keys = Object.keys(WC.teams);
    champ = keys[Math.floor(Math.random() * keys.length)];
    champSel.value = champ; WCStore.set("predChamp", champ); renderChamp();
    WCStore.set("preds", preds);
    syncButtons(); updateProgress();
    WCToast("🎲", "حظّك اليوم رتّب التوقّعات — البطل: " + WC.team(champ).name);
  });

  // 🖼️ تنزيل بطاقة توقّعات كصورة PNG
  document.getElementById("btnCard").addEventListener("click", function () {
    const W = 1080, H = 1350;
    const cv = document.createElement("canvas"); cv.width = W; cv.height = H;
    const x = cv.getContext("2d");
    function draw() {
      const g = x.createLinearGradient(0, 0, W, H);
      g.addColorStop(0, "#0b0b0b"); g.addColorStop(1, "#1e1e1e");
      x.fillStyle = g; x.fillRect(0, 0, W, H);
      x.strokeStyle = "rgba(255,255,255,.35)"; x.lineWidth = 6; x.strokeRect(34, 34, W - 68, H - 68);
      x.textAlign = "center"; try { x.direction = "rtl"; } catch (e) {}
      x.fillStyle = "#fff";
      x.font = "900 64px Tajawal, sans-serif"; x.fillText("توقّعاتي · مونديال 2026", W / 2, 168);
      x.font = "700 34px Tajawal, sans-serif"; x.fillStyle = "#bdbdbd";
      x.fillText("بطاقة التوقّعات الرسمية لجماهير المونديال", W / 2, 224);

      // البطل
      x.font = "120px sans-serif";
      x.fillText(champ && WC.team(champ) ? WC.team(champ).emoji : "🏆", W / 2, 470);
      x.fillStyle = "#9a9a9a"; x.font = "800 38px Tajawal, sans-serif"; x.fillText("🏆 بطلي المتوقّع", W / 2, 540);
      x.fillStyle = "#fff"; x.font = "900 72px Tajawal, sans-serif";
      x.fillText(champ && WC.team(champ) ? WC.team(champ).name : "لم يُحدَّد بعد", W / 2, 622);

      // العدّاد الكبير
      const n = Object.keys(preds).length;
      x.fillStyle = "#fff"; x.font = "900 200px Tajawal, sans-serif"; x.fillText(String(n), W / 2, 900);
      x.fillStyle = "#9a9a9a"; x.font = "800 44px Tajawal, sans-serif"; x.fillText("من " + WC.matches.length + " مباراة توقّعتها", W / 2, 970);

      // شريط تقدّم
      const bx = 140, bw = W - 280, by = 1030, bh = 30;
      x.fillStyle = "rgba(255,255,255,.12)"; roundRect(x, bx, by, bw, bh, 15); x.fill();
      x.fillStyle = "#fff"; roundRect(x, bx, by, Math.max(bh, bw * n / WC.matches.length), bh, 15); x.fill();

      // التذييل
      x.fillStyle = "#7a7a7a"; x.font = "700 34px Tajawal, sans-serif";
      x.fillText("⚽ منصّة مونديال 2026 — العب، توقّع، تفاخر", W / 2, 1230);

      cv.toBlob(function (blob) {
        if (!blob) { WCToast("⚠️", "تعذّر إنشاء الصورة على هذا المتصفّح"); return; }
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a"); a.href = url; a.download = "توقعاتي-مونديال-2026.png";
        document.body.appendChild(a); a.click(); a.remove();
        setTimeout(() => URL.revokeObjectURL(url), 1500);
        WCToast("🖼️", "نُزّلت بطاقة توقّعاتك — شاركها مع الشلّة!");
      }, "image/png");
    }
    function roundRect(c, rx, ry, rw, rh, r) {
      c.beginPath();
      c.moveTo(rx + r, ry); c.arcTo(rx + rw, ry, rx + rw, ry + rh, r);
      c.arcTo(rx + rw, ry + rh, rx, ry + rh, r); c.arcTo(rx, ry + rh, rx, ry, r);
      c.arcTo(rx, ry, rx + rw, ry, r); c.closePath();
    }
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(draw); else draw();
  });

  // تصفير
  document.getElementById("btnReset").addEventListener("click", function () {
    if (!confirm("هل تريد تصفير كل توقّعاتك؟")) return;
    Object.keys(preds).forEach(k => delete preds[k]);
    champ = ""; WCStore.set("preds", preds); WCStore.set("predChamp", "");
    champSel.value = ""; renderChamp(); updateProgress();
    root.querySelectorAll(".pred-choices button.sel").forEach(b => b.classList.remove("sel"));
    WCToast("↺", "صُفّرت كل توقّعاتك");
  });
});
