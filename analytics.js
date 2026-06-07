/* =========================================================================
   ANALYTICS · تحليلات الزوّار (Google Analytics 4) — اختياري
   التفعيل: أنشئ حساب GA4 مجاني (analytics.google.com)، خُذ معرّف القياس
   (يبدأ بـ G-XXXXXXX)، والصقه في GA_ID أدناه. اتركه فارغاً لتعطيل التتبّع.
   بديل أبسط (بلا حساب معقّد): Cloudflare Web Analytics — استبدل هذا الملف
   بوسم سكربت Cloudflare الذي يعطونك إياه.
   ========================================================================= */
(function () {
  "use strict";
  var GA_ID = "G-8Q9YWZPKMC"; // ← مثال: "G-ABCD1234XY"
  if (!GA_ID) return;

  var s = document.createElement("script");
  s.async = true;
  s.src = "https://www.googletagmanager.com/gtag/js?id=" + GA_ID;
  document.head.appendChild(s);

  window.dataLayer = window.dataLayer || [];
  function gtag() { window.dataLayer.push(arguments); }
  window.gtag = gtag;
  gtag("js", new Date());
  gtag("config", GA_ID);
})();
