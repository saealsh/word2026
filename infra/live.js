/* =========================================================================
   INFRA · live — محوّل البث الحيّ (نتائج · دقيقة · حالة)
   - يجلب التحديثات من "مصدر" قابل للتبديل، ويدمجها في WC.matches،
     ثم يُرقّع البطاقات المعروضة مباشرةً (بلا إعادة بناء) ويبثّ حدث scoreupdate.
   - مصدر تجريبي (mock) مجاني يعمل بلا أي API، ومصانع مصادر حقيقية جاهزة
     تعمل عبر "وسيط" (Proxy) يحمل المفتاح (راجع live-proxy-example.js).
   شكل التحديث الموحّد: { id, status, minute, scoreH, scoreA }
   ========================================================================= */
(function () {
  "use strict";
  const WC = (window.WC = window.WC || {});

  let source = null;

  // دمج تحديث واحد في كائن المباراة، وإرجاع true إن تغيّر المعروض
  function mergeOne(u) {
    const m = WC.matches.find(x => x.id === u.id);
    if (!m) return false;
    const before = m.status + "|" + (m.score ? m.score.h + "-" + m.score.a : "") + "|" + (m.minute != null ? m.minute : "");
    if (u.status) m.status = u.status;
    if (u.minute != null) m.minute = u.minute;
    if (u.scoreH != null && u.scoreA != null) m.score = { h: u.scoreH, a: u.scoreA };
    const after = m.status + "|" + (m.score ? m.score.h + "-" + m.score.a : "") + "|" + (m.minute != null ? m.minute : "");
    return before !== after;
  }

  // ترقيع وسط أي بطاقة معروضة لهذه المباراة (على كل الصفحات) دون إعادة بناء القائمة
  function patchCards(m) {
    const cards = document.querySelectorAll('.match-card[data-id="' + m.id + '"]');
    for (const el of cards) {
      const center = el.querySelector(".mc-center");
      if (center) center.innerHTML = WC.matchCard.centerHtml(m);
      // عند بدء المباراة: أزِل صف العدّاد/التقويم (لم يعد ذا معنى)
      if (m.status !== "scheduled") { const foot = el.querySelector(".mc-foot"); if (foot) foot.remove(); }
    }
  }

  WC.live = {
    enabled: false,
    idMap: {},                 // { providerFixtureId: "m1", ... } — يُملأ مرة عند ربط مصدر حقيقي
    setSource(s) { source = s; return this; },
    enable() { this.enabled = true; return this; },
    disable() { this.enabled = false; return this; },

    // سحب دفعة تحديثات وتطبيقها
    async pull() {
      if (!source) return;
      let updates;
      try { updates = await source.fetch(); } catch (e) { return; }
      if (!updates || !updates.length) return;
      let changed = false;
      for (const u of updates) {
        const m = WC.matches.find(x => x.id === u.id);
        const did = mergeOne(u);
        if (m) patchCards(m);
        changed = changed || did;
      }
      if (changed) document.dispatchEvent(new Event("scoreupdate"));
    },

    /* ---------- تفعيل الوضع التجريبي المجاني (يحاكي مباراة حيّة) ---------- */
    demo(matchId) {
      const id = matchId || (WC.matches[0] && WC.matches[0].id);
      let minute = 0, h = 0, a = 0;
      this.setSource({
        async fetch() {
          if (minute >= 90) return [{ id, status: "finished", minute: 90, scoreH: h, scoreA: a }];
          minute = Math.min(90, minute + 1 + Math.floor(Math.random() * 2));
          if (Math.random() < 0.06) (Math.random() < 0.5 ? h++ : a++); // هدف نادر
          return [{ id, status: "live", minute, scoreH: h, scoreA: a }];
        }
      }).enable();
      this.pull();
      return this;
    }
  };

  /* ---------- مصانع مصادر حقيقية (عبر وسيط يحمل المفتاح) ----------
     لا تضع مفتاح API في كود المتصفّح. شغّل وسيطاً بسيطاً (Cloudflare Worker
     مجاني / Serverless) يضيف المفتاح ويُعيد JSON المزوّد كما هو. */
  WC.live.sources = {
    // API-Football (عبر وسيطك): GET {proxy}/live ⇒ استجابة API-Football القياسية
    apiFootball(proxyBase) {
      return {
        async fetch() {
          const res = await fetch(proxyBase.replace(/\/$/, "") + "/live");
          const data = await res.json();
          return (data.response || []).map(f => {
            const sh = f.fixture.status.short;
            return {
              id: WC.live.idMap[f.fixture.id],
              status: sh === "FT" ? "finished" : (["1H", "2H", "HT", "ET", "P", "BT"].includes(sh) ? "live" : "scheduled"),
              minute: f.fixture.status.elapsed,
              scoreH: f.goals.home, scoreA: f.goals.away
            };
          }).filter(u => u.id);
        }
      };
    },
    // football-data.org (المجاني): GET {proxy}/matches?status=LIVE
    footballData(proxyBase) {
      return {
        async fetch() {
          const res = await fetch(proxyBase.replace(/\/$/, "") + "/matches?status=LIVE");
          const data = await res.json();
          return (data.matches || []).map(f => ({
            id: WC.live.idMap[f.id],
            status: f.status === "FINISHED" ? "finished" : (f.status === "IN_PLAY" || f.status === "PAUSED" ? "live" : "scheduled"),
            minute: f.minute != null ? f.minute : null,
            scoreH: f.score && f.score.fullTime ? f.score.fullTime.home : null,
            scoreA: f.score && f.score.fullTime ? f.score.fullTime.away : null
          })).filter(u => u.id);
        }
      };
    }
  };
})();
