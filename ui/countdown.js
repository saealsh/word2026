/* =========================================================================
   UI · countdown — حساب فروق الوقت + عدّادات بطاقات المباريات
   collect: يُخزّن عناصر العدّاد مرة واحدة. render: يُستدعى من الساعة المركزية،
   مع حارس فروقات؛ البعيدة (>ساعة) تتحدّث بالدقيقة والقريبة بالثواني.
   ========================================================================= */
(function () {
  "use strict";
  const WC = (window.WC = window.WC || {});
  const $$ = (s, r) => Array.prototype.slice.call((r || document).querySelectorAll(s));
  const PAD = n => String(n).padStart(2, "0");

  // أجزاء الوقت من فرق بالملّي ثانية (بلا إنشاء Date ولا تحليل نص)
  function diffPartsMs(d) {
    if (d < 0) d = 0;
    return {
      days: Math.floor(d / 864e5),
      h: Math.floor((d % 864e5) / 36e5),
      m: Math.floor((d % 36e5) / 6e4),
      s: Math.floor((d % 6e4) / 1e3),
      done: d === 0
    };
  }
  // واجهة متوافقة تقبل تاريخاً نصياً/رقمياً — للعدّادات المفردة
  function diffParts(target) {
    return diffPartsMs((typeof target === "number" ? target : Date.parse(target)) - Date.now());
  }
  const cdUnit = (v, l) => '<div class="cd-unit"><b>' + PAD(v) + '</b><small>' + l + '</small></div>';
  const seg = (v, l) => '<span class="dl-seg"><b>' + PAD(v) + '</b><i>' + l + '</i></span>';

  let _dls = [];
  function collect() {
    _dls = $$(".mc-deadline[data-kickoff]");
    for (const el of _dls) if (el._ko === undefined) el._ko = Date.parse(el.dataset.kickoff);
  }
  function render() {
    if (!_dls.length) return;
    const now = Date.now();
    for (const el of _dls) {
      const d = el._ko - now;
      let sig, soon, p;
      if (d <= 0 && d > -7200000) sig = "live";
      else if (d <= -7200000) sig = "done";
      else {
        soon = d < 3600000;
        p = diffPartsMs(d);
        sig = soon ? ("s" + p.days + "." + p.h + "." + p.m + "." + p.s)
                   : ("m" + p.days + "." + p.h + "." + p.m);
      }
      if (el._sig === sig) continue;          // لا تغيير مرئي ⇒ تجاوز
      el._sig = sig;
      if (sig === "live") { el.className = "mc-deadline live"; el.innerHTML = '<span class="dl-lbl">🔴 جارية الآن</span>'; continue; }
      if (sig === "done") { el.className = "mc-deadline"; el.innerHTML = '<span class="dl-lbl" style="color:var(--text-faint)">انتهت المباراة</span>'; continue; }
      el.className = "mc-deadline" + (soon ? " soon" : "");
      el.innerHTML = '<span class="dl-lbl">⏳ يبدأ خلال</span><span class="dl-segs">' +
        (p.days ? seg(p.days, "يوم") : "") + seg(p.h, "ساعة") + seg(p.m, "دقيقة") +
        (soon ? seg(p.s, "ثانية") : "") + '</span>';
    }
  }

  WC.countdown = { diffParts, diffPartsMs, cdUnit, collect, render };
})();
