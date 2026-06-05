/* =========================================================================
   CORE · domain — استعلامات النطاق النقية فوق البيانات
   دوال خالصة لا تعتمد على DOM أو التخزين. مصدرها WC.teams / WC.matches.
   ========================================================================= */
(function () {
  "use strict";
  const WC = (window.WC = window.WC || {});

  WC.team = function (key) { return WC.teams[key]; };

  // أعلام متجهية (SVG) حادّة على كل الشاشات
  WC.flagUrl = function (key) {
    const t = WC.teams[key];
    return t ? "https://flagcdn.com/" + t.flag + ".svg" : "";
  };
  // نسخة نقطية احتياطية عالية الدقة (للتقاط الصور مثلاً)
  WC.flagPng = function (key, size) {
    const t = WC.teams[key];
    return t ? "https://flagcdn.com/" + (size || "w320") + "/" + t.flag + ".png" : "";
  };

  WC.teamsInGroup = function (g) {
    return Object.keys(WC.teams).filter(function (k) { return WC.teams[k].group === g; });
  };
  WC.matchesOfTeam = function (key) {
    return WC.matches.filter(function (m) { return m.home === key || m.away === key; });
  };
  WC.matchesOfGroup = function (g) {
    return WC.matches.filter(function (m) { return m.group === g; });
  };

  // أقرب مباراة قادمة لم تبدأ بعد (تُستخدم في العدّاد الرئيسي)
  WC.nextMatch = function (key) {
    const now = Date.now();
    const list = key ? WC.matchesOfTeam(key) : WC.matches;
    return list.filter(function (m) { return m.koTime > now; })
      .sort(function (a, b) { return a.koTime - b.koTime; })[0] || null;
  };

  // تنسيق تاريخ ISO بالعربية (لتذييلات عامة)
  WC.formatDateAr = function (iso) {
    return new Date(iso).toLocaleDateString("ar", {
      weekday: "long", day: "numeric", month: "long", year: "numeric"
    });
  };

  // مؤشّر قوة بسيط مشتق من تصنيف فيفا (1 = الأقوى) — لأشرطة المقارنة
  WC.strength = function (key) {
    const t = WC.team(key);
    if (!t) return 50;
    return Math.max(8, Math.round(100 - (t.fifa - 1) * 0.95));
  };

  // نقطة الربط المستقبلية بمصدر حي (API) — جاهزة دون مفتاح
  WC.fetchLive = async function () {
    // مثال للربط لاحقاً:
    // const data = await (await fetch("https://api.example.com/wc2026/matches")).json();
    // data.forEach(u => { const m = WC.matches.find(x=>x.id===u.id); if(m){ m.score=u.score; m.status=u.status; } });
    return WC.matches;
  };
})();
