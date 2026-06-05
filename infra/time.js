/* =========================================================================
   INFRA · time — المنطقة الزمنية والتنسيق
   "local" هو الأساس الافتراضي (يُكتشف توقيت الجهاز). كاش لمنسّقات Intl ولمعرّف
   المنطقة ووسمها واسم المدينة لتفادي الإنشاء المكلف والقراءات المتكررة.
   ========================================================================= */
(function () {
  "use strict";
  const WC = (window.WC = window.WC || {});

  let _tzId = null, _tzLabel = null, _devCity = null;
  const _fmtCache = {}, _dklCache = {};
  const FMT_SPEC = {
    time: { locale: "en-GB", opts: { hour: "2-digit", minute: "2-digit", hour12: false } },
    day:  { locale: "ar",    opts: { weekday: "long" } },
    date: { locale: "ar",    opts: { day: "numeric", month: "long", year: "numeric" } },
    key:  { locale: "en-CA", opts: { year: "numeric", month: "2-digit", day: "2-digit" } }
  };

  WC.TZS = [
    { id: "local", label: "توقيتك المحلي" },
    { id: "Asia/Riyadh", label: "توقيت مكة" },
    { id: "Africa/Cairo", label: "القاهرة" },
    { id: "Asia/Dubai", label: "دبي / أبوظبي" },
    { id: "Asia/Baghdad", label: "بغداد" },
    { id: "Asia/Amman", label: "عمّان" },
    { id: "Europe/London", label: "لندن" },
    { id: "Europe/Paris", label: "باريس / برلين" },
    { id: "America/New_York", label: "نيويورك" },
    { id: "America/Los_Angeles", label: "لوس أنجلوس" },
    { id: "America/Mexico_City", label: "مكسيكو سيتي" }
  ];

  WC.deviceZone = function () {
    try { return Intl.DateTimeFormat().resolvedOptions().timeZone || ""; } catch (e) { return ""; }
  };
  WC.gmtOffset = function () {
    try {
      const o = { timeZoneName: "shortOffset", hour: "2-digit" };
      const z = this._zone(); if (z) o.timeZone = z;
      const parts = new Intl.DateTimeFormat("en-US", o).formatToParts(new Date());
      const tn = parts.find(p => p.type === "timeZoneName");
      let s = tn ? tn.value.replace("GMT", "").replace("UTC", "") : "";
      s = s.replace(/^([+-])0?(\d)/, "$1$2");
      return "غرينتش " + (s || "±0");
    } catch (e) { return ""; }
  };
  WC.deviceCityAr = function () {
    if (_devCity !== null) return _devCity;
    const map = {
      Riyadh: "الرياض", Mecca: "مكة", Dubai: "دبي", Abu_Dhabi: "أبوظبي", Qatar: "الدوحة",
      Kuwait: "الكويت", Bahrain: "المنامة", Baghdad: "بغداد", Amman: "عمّان", Beirut: "بيروت",
      Damascus: "دمشق", Jerusalem: "القدس", Gaza: "غزة", Cairo: "القاهرة", Khartoum: "الخرطوم",
      Tripoli: "طرابلس", Tunis: "تونس", Algiers: "الجزائر", Casablanca: "الدار البيضاء",
      Istanbul: "إسطنبول", Tehran: "طهران", London: "لندن", Paris: "باريس", Berlin: "برلين",
      Madrid: "مدريد", Rome: "روما", New_York: "نيويورك", Los_Angeles: "لوس أنجلوس",
      Chicago: "شيكاغو", Toronto: "تورنتو", Mexico_City: "مكسيكو سيتي", Karachi: "كراتشي"
    };
    const z = this.deviceZone();
    const city = z.split("/").pop() || "";
    return (_devCity = map[city] || city.replace(/_/g, " "));
  };
  WC.localOptionLabel = function () {
    const city = this.deviceCityAr();
    const off = this.getTZ() === "local" ? this.gmtOffset() : "";
    return "توقيتك المحلي" + (city ? " · " + city : "") + (off ? " (" + off + ")" : "");
  };
  WC.getTZ = function () {
    if (_tzId !== null) return _tzId;
    try { _tzId = localStorage.getItem("wc26_tz") || "local"; } catch (e) { _tzId = "local"; }
    return _tzId;
  };
  WC.setTZ = function (id) {
    _tzId = id; _tzLabel = null;                  // أبطِل الكاش المرتبط بالمنطقة
    for (const k in _fmtCache) delete _fmtCache[k];
    try { localStorage.setItem("wc26_tz", id); } catch (e) {}
  };
  WC._zone = function () { const t = this.getTZ(); return t === "local" ? undefined : t; };
  // منسّق Intl مُخزَّن لكل (نوع + منطقة) — يُنشأ مرة واحدة فقط
  WC._formatter = function (kind) {
    const tz = this.getTZ();
    const ck = kind + "|" + tz;
    let f = _fmtCache[ck];
    if (!f) {
      const spec = FMT_SPEC[kind];
      const o = Object.assign({}, spec.opts);
      if (tz !== "local") o.timeZone = tz;
      f = _fmtCache[ck] = new Intl.DateTimeFormat(spec.locale, o);
    }
    return f;
  };
  WC.tzLabel = function () {
    if (_tzLabel !== null) return _tzLabel;
    const t = this.getTZ();
    if (t === "local") {
      const city = this.deviceCityAr();
      _tzLabel = "بتوقيتك المحلي" + (city ? " · " + city : "");
    } else {
      const z = this.TZS.find(x => x.id === t);
      _tzLabel = "توقيت " + (z ? z.label.replace("توقيت ", "") : "مكة");
    }
    return _tzLabel;
  };
  // كل ما يلي يستخدم koTime الرقمي + منسّقاً مُخزَّناً (بلا إنشاء Intl ولا تحليل نص)
  WC.displayTime = function (m) { return this._formatter("time").format(m.koTime); };
  WC.displayDayName = function (m) { return this._formatter("day").format(m.koTime); };
  WC.displayDate = function (m) { return this._formatter("date").format(m.koTime); };
  WC.displayDateKey = function (m) { return this._formatter("key").format(m.koTime); };
  WC.displayDateKeyLabel = function (key) {
    let v = _dklCache[key];
    if (v) return v;
    const d = new Date(key + "T12:00:00");
    return (_dklCache[key] = d.toLocaleDateString("ar", { weekday: "long", day: "numeric", month: "long", year: "numeric" }));
  };
})();
