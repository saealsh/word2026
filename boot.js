/* =========================================================================
   BOOT · جذر التركيب — يربط الطبقات معاً عند تحميل أي صفحة
   يُحمَّل بعد كل الوحدات وقبل متحكّم الصفحة. يُعرّف WC.refresh ويشترك في الساعة.
   ========================================================================= */
(function () {
  "use strict";
  const WC = (window.WC = window.WC || {});

  // بعد رسم قوائم جديدة: أعِد جمع العدّادات (مرة) وأظهِر العناصر الجديدة فقط.
  WC.refresh = function () { WC.countdown.collect(); WC.reveal.observe(); };

  document.addEventListener("DOMContentLoaded", function () {
    WC.chrome.welcome();
    WC.chrome.initNav();
    WC.chrome.tickHero();
    WC.clock.add(WC.chrome.renderHeroTimer); // أرقام عدّاد البطل
    WC.clock.add(WC.countdown.render);       // كل عدّادات البطاقات
    WC.reveal.observe();
    WC.chrome.favReminder();
    document.addEventListener("favchange", WC.chrome.tickHero);
  });
})();
