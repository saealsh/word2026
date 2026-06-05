/* =========================================================================
   COMPAT · طبقة التوافق الخلفي
   تُبقي الأسماء العالمية القديمة (WCStore, WCFav, ...) تشير إلى الطبقات الجديدة،
   بحيث تعمل متحكّمات الصفحات دون تعديل. يُحمَّل بعد كل الوحدات وقبل صفحة المتحكّم.
   جسر مؤقّت: عند ترقية الصفحات لاستخدام WC.<layer> مباشرةً يمكن حذف هذا الملف.
   ========================================================================= */
(function () {
  "use strict";
  const WC = window.WC;
  window.WCStore = WC.storage;
  window.WCFav = WC.favorites;
  window.WCInterest = WC.interests;
  window.WCToast = WC.toast;
  window.WCClock = WC.clock;
  window.WCDownloadICS = WC.calendar.downloadOne;
  window.WCDownloadICSMulti = WC.calendar.downloadMulti;
  window.WCExportPDF = WC.print.exportPDF;
  window.WCMatchCard = WC.matchCard;
  window.WCReveal = WC.reveal.observe;
  window.WCRefresh = WC.refresh;
  window.WCDiffParts = WC.countdown.diffParts;
  window.WCcdUnit = WC.countdown.cdUnit;
})();
