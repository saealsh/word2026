/* =========================================================================
   كأس العالم 2026 — المنطق التفاعلي
   عدّاد حي · فلترة · مفضّلة · إشعارات · ركن الجماهير (localStorage)
   ========================================================================= */
(function () {
  "use strict";
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.prototype.slice.call((r || document).querySelectorAll(s));

  /* ---------- تخزين محلي ---------- */
  const Store = {
    get(k, def) { try { return JSON.parse(localStorage.getItem("wc26_" + k)) ?? def; } catch (e) { return def; } },
    set(k, v) { try { localStorage.setItem("wc26_" + k, JSON.stringify(v)); } catch (e) {} }
  };
  window.WCStore = Store;

  /* ---------- المفضّلة ---------- */
  const Fav = {
    list() { return Store.get("favTeams", []); },
    has(k) { return this.list().indexOf(k) > -1; },
    toggle(k) {
      let l = this.list();
      const i = l.indexOf(k);
      if (i > -1) { l.splice(i, 1); toast("💔", "وداعاً مؤقتاً لـ " + WC.team(k).name); }
      else { l.push(k); toast("⭐", "رفعتَ راية " + WC.team(k).name + "! 🔥"); }
      Store.set("favTeams", l);
      document.dispatchEvent(new Event("favchange"));
      return this.has(k);
    },
    primary() { return this.list()[0] || null; }
  };
  window.WCFav = Fav;

  /* ---------- الاهتمامات (مباريات محدّدة) ---------- */
  const Interest = {
    list() { return Store.get("interests", []); },
    has(id) { return this.list().indexOf(id) > -1; },
    toggle(id) {
      let l = this.list();
      const i = l.indexOf(id);
      const m = WC.matches.find(x => x.id === id);
      const label = m ? (WC.team(m.home).name + " × " + WC.team(m.away).name) : "المباراة";
      if (i > -1) { l.splice(i, 1); toast("🔕", "أزلتَ " + label + " من اهتماماتك"); }
      else { l.push(id); toast("🔔", "محجوزة لك! لن تفوّت " + label); }
      Store.set("interests", l);
      document.dispatchEvent(new Event("interestchange"));
      return this.has(id);
    },
    count() { return this.list().length; }
  };
  window.WCInterest = Interest;

  /* ---------- إضافة للتقويم (.ics) ---------- */
  function downloadICS(m) {
    const t = WC.team(m.home).name, a = WC.team(m.away).name;
    const start = new Date(m.kickoff);
    const end = new Date(start.getTime() + 2 * 3600 * 1000);
    const fmt = d => d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
    const ics = [
      "BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Mondial2026//AR//",
      "BEGIN:VEVENT",
      "UID:" + m.id + "@mondial2026",
      "DTSTAMP:" + fmt(new Date()),
      "DTSTART:" + fmt(start),
      "DTEND:" + fmt(end),
      "SUMMARY:⚽ " + t + " ضد " + a + " — كأس العالم 2026",
      "DESCRIPTION:المجموعة " + m.group + " · " + (m.venue ? m.venue.stadium + "، " + m.venue.city : ""),
      "LOCATION:" + (m.venue ? m.venue.stadium + "، " + m.venue.city : ""),
      "BEGIN:VALARM", "TRIGGER:-PT60M", "ACTION:DISPLAY",
      "DESCRIPTION:تبدأ المباراة بعد ساعة!", "END:VALARM",
      "END:VEVENT", "END:VCALENDAR"
    ].join("\r\n");
    const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url; link.download = "match-" + m.id + ".ics";
    document.body.appendChild(link); link.click(); link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    toast("📅", "تم! المباراة الآن في تقويمك مع تنبيه قبل الصافرة");
  }
  window.WCDownloadICS = downloadICS;

  /* ---------- الإشعارات (Toast) ---------- */
  let toastBox;
  function toast(icon, msg) {
    if (!toastBox) { toastBox = document.createElement("div"); toastBox.className = "toast-box"; document.body.appendChild(toastBox); }
    const t = document.createElement("div");
    t.className = "toast";
    t.innerHTML = '<span class="ic">' + icon + '</span><span>' + msg + '</span>';
    toastBox.appendChild(t);
    setTimeout(() => { t.style.opacity = "0"; t.style.transform = "translateY(20px)"; setTimeout(() => t.remove(), 350); }, 3600);
  }
  window.WCToast = toast;

  /* ---------- العدّاد التنازلي ---------- */
  const PAD = n => String(n).padStart(2, "0");
  function diffParts(target) {
    let d = new Date(target).getTime() - Date.now();
    if (d < 0) d = 0;
    const days = Math.floor(d / 864e5);
    const h = Math.floor((d % 864e5) / 36e5);
    const m = Math.floor((d % 36e5) / 6e4);
    const s = Math.floor((d % 6e4) / 1e3);
    return { days, h, m, s, done: d === 0 };
  }
  // عدّاد البطل الرئيسي
  function tickHero() {
    const box = $("#heroCountdown");
    if (!box) return;
    const key = Fav.primary();
    const next = WC.nextMatch(key) || WC.nextMatch();
    const labelEl = $("#cdLabel");
    if (!next) { if (labelEl) labelEl.textContent = "🏁 أُسدل الستار على دور المجموعات"; return; }
    const t = WC.team(next.home), a = WC.team(next.away);
    $("#cdMatch").innerHTML =
      '<a class="t" href="team.html?team=' + next.home + '"><img src="' + WC.flagUrl(next.home) + '" alt=""><span>' + t.name + '</span></a>' +
      '<span class="vs">VS</span>' +
      '<a class="t" href="team.html?team=' + next.away + '"><img src="' + WC.flagUrl(next.away) + '" alt=""><span>' + a.name + '</span></a>';
    if (labelEl) labelEl.textContent = key ? "🔥 صافرة منتخبك القادمة" : "🔥 الصافرة القادمة";
    function run() {
      const p = diffParts(next.kickoff);
      box.innerHTML =
        unit(p.days, "يوم") + unit(p.h, "ساعة") + unit(p.m, "دقيقة") + unit(p.s, "ثانية");
    }
    function unit(v, l) { return '<div class="cd-unit"><b>' + PAD(v) + '</b><small>' + l + '</small></div>'; }
    run();
    clearInterval(box._iv);
    box._iv = setInterval(run, 1000);
  }

  // عدّادات بطاقات المباريات
  function tickCards() {
    const els = $$(".mc-deadline[data-kickoff]");
    if (!els.length) return;
    const seg = (v, l) => '<span class="dl-seg"><b>' + PAD(v) + '</b><i>' + l + '</i></span>';
    function run() {
      const now = Date.now();
      els.forEach(el => {
        const ko = new Date(el.dataset.kickoff).getTime();
        const d = ko - now;
        if (d <= 0 && d > -7200000) { el.className = "mc-deadline live"; el.innerHTML = '<span class="dl-lbl">🔴 جارية الآن</span>'; return; }
        if (d <= -7200000) { el.className = "mc-deadline"; el.innerHTML = '<span class="dl-lbl" style="color:var(--text-faint)">انتهت المباراة</span>'; return; }
        const p = diffParts(el.dataset.kickoff);
        el.className = "mc-deadline" + (d < 3600000 ? " soon" : "");
        el.innerHTML = '<span class="dl-lbl">⏳ يبدأ خلال</span>' +
          '<span class="dl-segs">' +
            (p.days ? seg(p.days, "يوم") : "") + seg(p.h, "ساعة") + seg(p.m, "دقيقة") + seg(p.s, "ثانية") +
          '</span>';
      });
    }
    run();
    clearInterval(window._dlIv);
    window._dlIv = setInterval(run, 1000);
  }

  /* ---------- بناء بطاقة مباراة ---------- */
  const AR_DAY = { weekday: "long" }, AR_DATE = { day: "numeric", month: "long", year: "numeric" };
  function matchCard(m, opts) {
    opts = opts || {};
    const t = WC.team(m.home), a = WC.team(m.away);
    const d = new Date(m.kickoff);
    const dayName = d.toLocaleDateString("ar", AR_DAY);
    const dayDate = d.toLocaleDateString("ar", AR_DATE);
    const favOn = (Fav.has(m.home) || Fav.has(m.away)) ? " on" : "";
    const intOn = Interest.has(m.id) ? " on" : "";

    // وسط البطاقة: توقيت / نتيجة
    let centerHtml;
    if (m.status === "finished" && m.score) centerHtml = '<div class="mc-clock done"><div class="score">' + m.score.h + ' - ' + m.score.a + '</div><span class="badge-done">انتهت</span></div>';
    else if (m.status === "live" && m.score) centerHtml = '<div class="mc-clock"><div class="score">' + m.score.h + ' - ' + m.score.a + '</div><span class="badge-live">🔴 مباشر</span></div>';
    else centerHtml = '<div class="mc-clock"><span class="time">' + m.time + '</span><small>توقيت مكة</small></div>';

    const el = document.createElement("div");
    el.className = "match-card reveal";
    el.dataset.group = m.group; el.dataset.home = m.home; el.dataset.away = m.away;
    el.dataset.date = m.date; el.dataset.round = m.round; el.dataset.id = m.id;
    el.innerHTML =
      // شريط اليوم البارز
      '<div class="mc-day"><span class="mc-day-ic">📅</span>' +
        '<span class="mc-day-name">' + dayName + '</span>' +
        '<span class="mc-day-date">' + dayDate + '</span></div>' +
      // الشريط العلوي: المجموعة + الملعب + الأزرار
      '<div class="mc-top">' +
        '<div class="mc-meta"><span class="mc-group">المجموعة ' + m.group + '</span>' +
        (m.venue ? '<span class="mc-venue">📍 ' + m.venue.city + '</span>' : '') + '</div>' +
        '<div class="mc-actions">' +
          '<button class="mc-int' + intOn + '" title="أضِف إلى اهتماماتي">🔔</button>' +
          '<button class="mc-fav' + favOn + '" title="تابِع منتخباً من هذه المباراة">★</button>' +
        '</div>' +
      '</div>' +
      // الفريقان والتوقيت
      '<div class="mc-body">' +
        '<a class="mc-team" href="team.html?team=' + m.home + '"><img src="' + WC.flagUrl(m.home) + '" alt=""><span>' + t.name + '</span></a>' +
        '<div class="mc-center">' + centerHtml + '</div>' +
        '<a class="mc-team away" href="team.html?team=' + m.away + '"><img src="' + WC.flagUrl(m.away) + '" alt=""><span>' + a.name + '</span></a>' +
      '</div>' +
      // الديدلاين (العدّاد) + التقويم
      (m.status === "scheduled"
        ? '<div class="mc-foot"><div class="mc-deadline" data-kickoff="' + m.kickoff + '"></div>' +
          '<button class="mc-cal" title="أضِف إلى التقويم">📅 التقويم</button></div>'
        : '');

    // زر المفضلة (متابعة منتخب)
    el.querySelector(".mc-fav").addEventListener("click", function (e) {
      e.preventDefault();
      const key = Fav.has(m.home) ? m.home : Fav.has(m.away) ? m.away : m.home;
      Fav.toggle(key);
      this.classList.toggle("on", Fav.has(m.home) || Fav.has(m.away));
    });
    // زر الاهتمامات
    el.querySelector(".mc-int").addEventListener("click", function (e) {
      e.preventDefault();
      const on = Interest.toggle(m.id);
      this.classList.toggle("on", on);
    });
    // زر التقويم
    const cal = el.querySelector(".mc-cal");
    if (cal) cal.addEventListener("click", function (e) { e.preventDefault(); downloadICS(m); });
    return el;
  }
  window.WCMatchCard = matchCard;

  /* ---------- كشف الظهور (Reveal) ---------- */
  function observeReveal() {
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }), { threshold: .08 });
    $$(".reveal").forEach(el => io.observe(el));
  }
  window.WCReveal = observeReveal;

  /* ---------- قائمة الجوال + تفعيل الرابط الحالي ---------- */
  function initNav() {
    const tog = $(".nav-toggle"), links = $(".nav-links");
    if (tog) tog.addEventListener("click", () => links.classList.toggle("open"));
    const page = location.pathname.split("/").pop() || "index.html";
    $$(".nav-links a").forEach(a => {
      const href = a.getAttribute("href");
      if (href === page || (page === "" && href === "index.html")) a.classList.add("active");
    });
  }

  /* ---------- تذكير مباراة المنتخب المفضّل ---------- */
  function favReminder() {
    const key = Fav.primary();
    if (!key) return;
    const next = WC.nextMatch(key);
    if (!next) return;
    const mins = (new Date(next.kickoff).getTime() - Date.now()) / 60000;
    // تذكير ودّي إن كانت المباراة خلال 24 ساعة
    if (mins > 0 && mins < 1440 && !sessionStorage.getItem("reminded_" + next.id)) {
      sessionStorage.setItem("reminded_" + next.id, "1");
      const opp = next.home === key ? next.away : next.home;
      setTimeout(() => toast("🔔", "اشتعلت الأجواء! مباراة " + WC.team(key).name + " ضد " + WC.team(opp).name + " تقترب 🔥"), 1500);
    }
  }

  /* ---------- شاشة الترحيب (مرة كل جلسة) ---------- */
  function welcomeScreen() {
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

  /* ---------- تشغيل عام عند تحميل أي صفحة ---------- */
  document.addEventListener("DOMContentLoaded", function () {
    welcomeScreen();
    heroOrbs();
    initNav();
    tickHero();
    tickCards();
    observeReveal();
    favReminder();
    document.addEventListener("favchange", () => { tickHero(); });
  });

  // إعادة تشغيل عدّادات البطاقات بعد رسم القوائم ديناميكياً
  window.WCRefresh = function () { tickCards(); observeReveal(); };
})();
