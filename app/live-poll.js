/* =========================================================================
   APP · live-poll — مؤقّت دوري يسحب التحديثات الحيّة عبر الساعة المركزية
   - يسحب كل INTERVAL ثانية فقط حين يكون البث مُفعّلاً (WC.live.enabled).
   - تفعيل تجريبي فوري عبر الرابط: أضِف ?live=demo لأي صفحة لرؤية مباراة حيّة
     تتحرّك بالدقيقة والأهداف — بلا أي API ولا مفتاح.
   ========================================================================= */
(function () {
  "use strict";
  const WC = (window.WC = window.WC || {});
  const INTERVAL = 20; // ثوانٍ بين كل سحب (يناسب حدود المزوّدين المجانيين)
  let ticks = 0;

  // الديمو في الوضع التجريبي أسرع (كل 3 ثوانٍ) ليظهر التغيّر بوضوح
  let demoMode = false;
  try { demoMode = /(?:^|[?&])live=demo(?:&|$)/.test(location.search); } catch (e) {}

  WC.clock.add(function () {
    if (!WC.live || !WC.live.enabled) return;
    const every = demoMode ? 3 : INTERVAL;
    if (ticks++ % every !== 0) return;
    WC.live.pull();
  });

  document.addEventListener("DOMContentLoaded", function () {
    if (demoMode && WC.live) {
      WC.live.demo();
      if (WC.toast) WC.toast("🔴", "وضع البثّ التجريبي مُفعّل — تابِع النتيجة والدقيقة تتحرّك!");
    }
  });
})();
