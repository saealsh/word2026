/* =========================================================================
   UI · toast — إشعارات منبثقة عابرة
   ========================================================================= */
(function () {
  "use strict";
  const WC = (window.WC = window.WC || {});

  let toastBox;
  WC.toast = function (icon, msg) {
    if (!toastBox) { toastBox = document.createElement("div"); toastBox.className = "toast-box"; document.body.appendChild(toastBox); }
    const t = document.createElement("div");
    t.className = "toast";
    t.innerHTML = '<span class="ic">' + icon + '</span><span>' + msg + '</span>';
    toastBox.appendChild(t);
    setTimeout(() => { t.style.opacity = "0"; t.style.transform = "translateY(20px)"; setTimeout(() => t.remove(), 350); }, 3600);
  };
})();
