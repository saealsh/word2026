/* =========================================================================
   APP · live-config — إعداد مصدر البيانات الحيّة الحقيقي (اختياري)
   هذا الملف فارغ الإعداد افتراضياً (لا يفعل شيئاً). لتفعيل النتائج والدقائق
   الحقيقية: انشر الوسيط المجاني (راجع infra/live-proxy-example.js)، ثم:
     1) ضع رابط الوسيط في PROXY.
     2) اختر PROVIDER (apiFootball أو footballData).
     3) املأ IDMAP: معرّف مباراة المزوّد → معرّف مباراتنا (m1 … m72).
   ========================================================================= */
(function () {
  "use strict";
  const WC = window.WC;
  if (!WC || !WC.live) return;

  /* ====== إعداداتك ====== */
  const PROXY = "";                 // مثال: "https://wc26.YOURNAME.workers.dev"
  const PROVIDER = "apiFootball";   // "apiFootball" أو "footballData"
  const IDMAP = {
    // معرّف_المزوّد: "mN"
    // 1390001: "m1",
    // 1390002: "m2",
  };
  /* ====================== */

  if (!PROXY) return; // غير مُفعّل بعد — الموقع يعمل طبيعياً بلا بثّ حيّ
  WC.live.idMap = IDMAP;
  WC.live.setSource(WC.live.sources[PROVIDER](PROXY)).enable();
  document.addEventListener("DOMContentLoaded", function () { WC.live.pull(); });
})();
