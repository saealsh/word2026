/* =========================================================================
   APP · live-config — تفعيل مصدر البيانات الحيّة
   MODE:
     "local"       ← (مُفعّل) يقرأ النتائج من ملف live.json على موقعك. مجاني تماماً
                      بلا مفتاح ولا CORS. يبقى live.json يُحدَّث أثناء المباريات
                      (يدوياً أو تلقائياً عبر GitHub Actions — راجع live-updater).
     "apiFootball" / "footballData"  ← عبر وسيط يحمل المفتاح (راجع
                      infra/live-proxy-example.js)، واملأ PROXY و IDMAP.
     ""            ← تعطيل البثّ الحيّ.
   ========================================================================= */
(function () {
  "use strict";
  const WC = window.WC;
  if (!WC || !WC.live) return;

  const MODE = "local";             // ← الوضع الافتراضي: قراءة live.json
  const PROXY = "";                 // لوضع المزوّد فقط: "https://wc26.YOURNAME.workers.dev"
  const IDMAP = {};                 // لوضع المزوّد فقط: { 1390001: "m1", ... }

  if (MODE === "local") {
    WC.live.setSource(WC.live.sources.localFeed("live.json")).enable();
  } else if ((MODE === "apiFootball" || MODE === "footballData") && PROXY) {
    WC.live.idMap = IDMAP;
    WC.live.setSource(WC.live.sources[MODE](PROXY)).enable();
  } else {
    return;
  }
  document.addEventListener("DOMContentLoaded", function () { WC.live.pull(); });
})();
