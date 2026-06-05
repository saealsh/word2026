/* =========================================================================
   APP · collections — حالة المستخدم: المفضّلة والاهتمامات
   مستودعان فوق WC.storage مع كاش في الذاكرة، ويبثّان أحداثاً عند التغيير
   (favchange / interestchange) لتبقى الطبقات الأخرى مفصولة.
   ========================================================================= */
(function () {
  "use strict";
  const WC = (window.WC = window.WC || {});

  /* ---------- المفضّلة (منتخبات) ---------- */
  WC.favorites = {
    _c: null,
    list() { if (!this._c) this._c = WC.storage.get("favTeams", []); return this._c; },
    has(k) { return this.list().indexOf(k) > -1; },
    toggle(k) {
      const l = this.list();
      const i = l.indexOf(k);
      if (i > -1) { l.splice(i, 1); WC.toast("💔", "وداعاً مؤقتاً لـ " + WC.team(k).name); }
      else { l.push(k); WC.toast("⭐", "رفعتَ راية " + WC.team(k).name + "! 🔥"); }
      WC.storage.set("favTeams", l);
      document.dispatchEvent(new Event("favchange"));
      return this.has(k);
    },
    primary() { return this.list()[0] || null; }
  };

  /* ---------- الاهتمامات (مباريات محدّدة) ---------- */
  WC.interests = {
    _c: null,
    list() { if (!this._c) this._c = WC.storage.get("interests", []); return this._c; },
    has(id) { return this.list().indexOf(id) > -1; },
    toggle(id) {
      const l = this.list();
      const i = l.indexOf(id);
      const m = WC.matches.find(x => x.id === id);
      const label = m ? (WC.team(m.home).name + " × " + WC.team(m.away).name) : "المباراة";
      if (i > -1) { l.splice(i, 1); WC.toast("🔕", "أزلتَ " + label + " من اهتماماتك"); }
      else { l.push(id); WC.toast("🔔", "محجوزة لك! لن تفوّت " + label); }
      WC.storage.set("interests", l);
      document.dispatchEvent(new Event("interestchange"));
      return this.has(id);
    },
    count() { return this.list().length; }
  };
})();
