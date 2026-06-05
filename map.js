/* =========================================================================
   PAGE · map — متحكّم الصفحة (مستخرَج كما هو؛ يعتمد على واجهة WC العامة)
   ========================================================================= */
document.addEventListener("DOMContentLoaded", function () {
  const map = L.map("map", { scrollWheelZoom: false }).setView([35, -100], 3);
  L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
    attribution: "© OpenStreetMap, © CARTO", maxZoom: 18
  }).addTo(map);

  const goldIcon = L.divIcon({
    className: "", html: '<div style="width:18px;height:18px;border-radius:50%;background:#ffffff;border:3px solid #888;box-shadow:0 0 12px rgba(255,255,255,.75)"></div>',
    iconSize: [18, 18], iconAnchor: [9, 9]
  });

  WC.venues.forEach(function (v) {
    L.marker([v.lat, v.lng], { icon: goldIcon }).addTo(map)
      .bindPopup('<div class="map-pop"><b>' + v.city + '</b> ' + v.country + '<br>' + v.stadium + '<br>السعة: ' + v.cap.toLocaleString("ar") + ' متفرّج</div>');
  });

  // شبكة الملاعب
  const grid = document.getElementById("venueGrid");
  WC.venues.slice().sort((a, b) => b.cap - a.cap).forEach(function (v) {
    const c = document.createElement("div");
    c.className = "card reveal";
    c.innerHTML = '<div style="font-size:1.4rem">' + v.country + '</div><b style="display:block;margin:6px 0 2px">' + v.city + '</b>' +
      '<small class="muted">' + v.stadium + '</small><div style="margin-top:10px;color:var(--gold);font-weight:800">' + v.cap.toLocaleString("ar") + ' <small style="color:var(--text-faint);font-weight:400">متفرّج</small></div>';
    grid.appendChild(c);
  });
  WCRefresh();
});
