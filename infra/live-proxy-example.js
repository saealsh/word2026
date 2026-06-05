/* =========================================================================
   مثال وسيط (Cloudflare Worker — خطة مجانية) لإخفاء مفتاح API عن المتصفّح.
   لماذا؟ لا يجوز وضع مفتاح API في كود الواجهة (يراه أي أحد)، وأغلب المزوّدين
   يمنعون الطلب المباشر من المتصفّح (CORS). هذا الوسيط يضيف المفتاح ويُمرّر الرد.

   النشر (مجاني):
   1) أنشئ Worker على Cloudflare، الصق هذا الملف.
   2) أضِف سرّاً باسم API_KEY (مفتاح API-Football مثلاً) في إعدادات الـ Worker.
   3) في صفحاتك فعّل المصدر مرة واحدة:
        WC.live.setSource(WC.live.sources.apiFootball("https://<your-worker>.workers.dev")).enable();
      واملأ خريطة المعرّفات: WC.live.idMap = { 1234567: "m1", ... };

   ملاحظة: هذا الملف ليس جزءاً من تحميل الصفحات — مرجعٌ للنشر فقط.
   ========================================================================= */
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const cors = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Cache-Control": "no-store"
    };
    if (request.method === "OPTIONS") return new Response(null, { headers: cors });

    // /live  ⇒  مباريات كأس العالم 2026 الجارية الآن (API-Football)
    if (url.pathname === "/live") {
      const api = "https://v3.football.api-sports.io/fixtures?live=all&league=1&season=2026";
      const res = await fetch(api, { headers: { "x-apisports-key": env.API_KEY } });
      const body = await res.text();
      return new Response(body, { headers: { ...cors, "Content-Type": "application/json" } });
    }
    return new Response(JSON.stringify({ error: "not found" }), { status: 404, headers: { ...cors, "Content-Type": "application/json" } });
  }
};
