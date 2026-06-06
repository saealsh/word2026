/* =========================================================================
   UI · chrome — هيكل الصفحة المشترك: التنقّل، منتقي المنطقة الزمنية، شاشة
   الترحيب، أعلام البطل، عدّاد البطل، وتذكير مباراة المنتخب المفضّل.
   ========================================================================= */
(function () {
  "use strict";
  const WC = (window.WC = window.WC || {});
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.prototype.slice.call((r || document).querySelectorAll(s));

  /* ---------- التنقّل + منتقي المنطقة الزمنية ---------- */
  function initNav() {
    const tog = $(".nav-toggle"), links = $(".nav-links");
    if (tog) tog.addEventListener("click", () => links.classList.toggle("open"));
    const page = location.pathname.split("/").pop() || "index.html";
    $$(".nav-links a").forEach(a => {
      const href = a.getAttribute("href");
      if (href === page || (page === "" && href === "index.html")) a.classList.add("active");
    });
    const navInner = $(".nav-inner");

    // زر تبديل الثيم (ليل/نهار) — الافتراضي ليلي
    if (navInner && !$(".theme-toggle")) {
      const btn = document.createElement("button");
      btn.className = "theme-toggle";
      btn.setAttribute("aria-label", "تبديل الثيم بين الليل والنهار");
      const isLight = () => document.documentElement.getAttribute("data-theme") === "light";
      const sync = () => { btn.textContent = isLight() ? "🌙" : "☀️"; btn.title = isLight() ? "التبديل للوضع الليلي" : "التبديل للوضع النهاري"; };
      sync();
      btn.addEventListener("click", function () {
        const goLight = !isLight();
        if (goLight) document.documentElement.setAttribute("data-theme", "light");
        else document.documentElement.removeAttribute("data-theme");
        try { localStorage.setItem("wc26_theme", goLight ? "light" : "dark"); } catch (e) {}
        const meta = document.querySelector('meta[name="theme-color"]');
        if (meta) meta.setAttribute("content", goLight ? "#f3f3f1" : "#000000");
        sync();
        WC.toast(goLight ? "🌙" : "🌞", goLight ? "تم تفعيل الوضع النهاري" : "تم تفعيل الوضع الليلي");
      });
      navInner.appendChild(btn);
    }

    if (navInner && !$(".tz-select")) {
      const firstVisit = !(function () { try { return localStorage.getItem("wc26_tz"); } catch (e) { return null; } })();
      const sel = document.createElement("select");
      sel.className = "tz-select";
      sel.setAttribute("aria-label", "المنطقة الزمنية");
      const labelFor = z => (z.id === "local" ? "🌐 " + WC.localOptionLabel() : "🌐 " + z.label);
      WC.TZS.forEach(z => sel.add(new Option(labelFor(z), z.id)));
      sel.value = WC.getTZ();
      sel.addEventListener("change", function () {
        WC.setTZ(sel.value);
        const localOpt = sel.querySelector('option[value="local"]');
        if (localOpt) localOpt.textContent = "🌐 " + WC.localOptionLabel();
        document.dispatchEvent(new Event("tzchange"));
        if (typeof window.__rerender === "function") window.__rerender();
        tickHero();
        WC.toast("🌐", "حُوّلت كل التوقيتات إلى " + WC.tzLabel());
      });
      navInner.appendChild(sel);

      if (firstVisit && WC.getTZ() === "local") {
        const city = WC.deviceCityAr();
        setTimeout(() => WC.toast("🌐", "عُرضت كل المواعيد بتوقيتك المحلي" + (city ? " · " + city : "") + " — تقدر تبدّلها من الأعلى"), 900);
      }
    }
  }

  /* ---------- عدّاد البطل (الصفحة الرئيسية) ---------- */
  let heroTarget = null;
  function tickHero() {
    const box = $("#heroCountdown"), cdMatch = $("#cdMatch"), labelEl = $("#cdLabel");
    if (!box) return;
    const key = WC.favorites.primary();
    const next = WC.nextMatch(key) || WC.nextMatch();
    if (!next) { heroTarget = null; box.innerHTML = ""; if (labelEl) labelEl.textContent = "🏁 أُسدل الستار على دور المجموعات"; return; }
    const t = WC.team(next.home), a = WC.team(next.away);
    if (cdMatch) cdMatch.innerHTML =
      '<a class="t" href="team.html?team=' + next.home + '"><img loading="lazy" src="' + WC.flagUrl(next.home) + '" alt="' + t.name + '"><span>' + t.name + '</span></a>' +
      '<span class="vs">VS</span>' +
      '<a class="t" href="team.html?team=' + next.away + '"><img loading="lazy" src="' + WC.flagUrl(next.away) + '" alt="' + a.name + '"><span>' + a.name + '</span></a>';
    if (labelEl) labelEl.textContent = key ? "🔥 صافرة منتخبك القادمة" : "🔥 الصافرة القادمة";
    heroTarget = next.kickoff;
  }
  function renderHeroTimer() {
    const box = $("#heroCountdown");
    if (!box || !heroTarget) return;
    const p = WC.countdown.diffParts(heroTarget);
    const u = WC.countdown.cdUnit;
    box.innerHTML = u(p.days, "يوم") + u(p.h, "ساعة") + u(p.m, "دقيقة") + u(p.s, "ثانية");
  }

  /* ---------- تذكير مباراة المنتخب المفضّل ---------- */
  function favReminder() {
    const key = WC.favorites.primary();
    if (!key) return;
    const next = WC.nextMatch(key);
    if (!next) return;
    const mins = (next.koTime - Date.now()) / 60000;
    if (mins > 0 && mins < 1440 && !sessionStorage.getItem("reminded_" + next.id)) {
      sessionStorage.setItem("reminded_" + next.id, "1");
      const opp = next.home === key ? next.away : next.home;
      setTimeout(() => WC.toast("🔔", "اشتعلت الأجواء! مباراة " + WC.team(key).name + " ضد " + WC.team(opp).name + " تقترب 🔥"), 1500);
    }
  }

  /* ---------- شاشة الترحيب (مرة كل جلسة) ---------- */
  function welcome() {
    if (sessionStorage.getItem("wc26_welcomed")) return;
    sessionStorage.setItem("wc26_welcomed", "1");
    const flags = ["⚽", "🏆", "⚽", "🏆", "⚽", "🏆", "⚽"];
    const w = document.createElement("div");
    w.className = "welcome";
    w.innerHTML =
      '<div class="wc-ring"></div><div class="wc-ring r2"></div>' +
      '<div class="welcome-inner">' +
        '<span class="wc-cup">🏆</span>' +
        '<h1 class="gradient-text">أهلاً بك في قلب مونديال 2026</h1>' +
        '<p>استعدّ… الشغف يبدأ الآن وكل ثانية تُحسب 🔥</p>' +
        '<div class="wc-flags">' + flags.join(" ") + '</div>' +
        '<div class="wc-bar"><span></span></div>' +
      '</div>';
    document.body.appendChild(w);
    setTimeout(function () { w.classList.add("hide"); setTimeout(function () { w.remove(); }, 850); }, 2400);
    w.addEventListener("click", function () { w.classList.add("hide"); setTimeout(function () { w.remove(); }, 850); });
  }

  /* ---------- أعلام عائمة في خلفية البطل ---------- */
  function heroOrbs() {
    const hero = $(".hero");
    if (!hero || $(".hero-orbs")) return;
    const flags = ["⚽", "🏆", "⚽", "🏆", "⚽", "🏆", "⚽", "🏆"];
    const box = document.createElement("div");
    box.className = "hero-orbs";
    for (let i = 0; i < 8; i++) {
      const s = document.createElement("span");
      s.textContent = flags[i % flags.length];
      s.style.top = Math.random() * 80 + 5 + "%";
      s.style.left = Math.random() * 90 + 2 + "%";
      s.style.animationDelay = (Math.random() * 6) + "s";
      s.style.animationDuration = (7 + Math.random() * 5) + "s";
      box.appendChild(s);
    }
    hero.insertBefore(box, hero.firstChild);
  }

  WC.chrome = { initNav, welcome, heroOrbs, tickHero, renderHeroTimer, favReminder };
})();
