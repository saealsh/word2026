/* =========================================================================
   APP · clock — ساعة مركزية واحدة
   مؤقّت setInterval واحد كل ثانية يستدعي كل المشتركين، بدل عشرات المؤقتات.
   ========================================================================= */
(function () {
  "use strict";
  const WC = (window.WC = window.WC || {});

  const subs = new Set();
  let started = false;
  function tick() { for (const fn of subs) { try { fn(); } catch (e) {} } }

  WC.clock = {
    add(fn) {
      subs.add(fn);
      try { fn(); } catch (e) {}
      if (!started) { started = true; setInterval(tick, 1000); }
      return fn;
    },
    remove(fn) { subs.delete(fn); }
  };
})();
