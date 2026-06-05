/* =========================================================================
   UI · reveal — كشف العناصر عند الظهور (IntersectionObserver واحد مشترك)
   ========================================================================= */
(function () {
  "use strict";
  const WC = (window.WC = window.WC || {});
  const $$ = (s, r) => Array.prototype.slice.call((r || document).querySelectorAll(s));

  let io = null;
  WC.reveal = {
    observe() {
      if (!io) io = new IntersectionObserver(es => es.forEach(e => {
        if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
      }), { threshold: .08 });
      // راقِب فقط العناصر الجديدة التي لم تُكشف ولم تُسجَّل بعد
      $$(".reveal").forEach(el => { if (!el._obs && !el.classList.contains("in")) { el._obs = true; io.observe(el); } });
    }
  };
})();
