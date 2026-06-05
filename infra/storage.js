/* =========================================================================
   INFRA · storage — محوّل التخزين المحلي (localStorage) مع تسلسل JSON آمن
   كل المفاتيح مسبوقة بـ wc26_ لعزل بيانات المنصّة.
   ========================================================================= */
(function () {
  "use strict";
  const WC = (window.WC = window.WC || {});

  WC.storage = {
    get(k, def) {
      try { return JSON.parse(localStorage.getItem("wc26_" + k)) ?? def; }
      catch (e) { return def; }
    },
    set(k, v) {
      try { localStorage.setItem("wc26_" + k, JSON.stringify(v)); } catch (e) {}
    }
  };
})();
