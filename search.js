// ═══════════════════════════════════════════════
// Vercel Serverless Function — /api/search
// المفتاح محفوظ في متغيرات البيئة (Environment Variables)
// لا يراه أحد من المتصفح
// ═══════════════════════════════════════════════

const LAWS_SYSTEM_PROMPT = `
أنت مساعد قانوني متخصص في الأنظمة والتشريعات السعودية الصادرة عن هيئة الخبراء بمجلس الوزراء.
مصدرك الرسمي هو بوابة هيئة الخبراء: https://laws.boe.gov.sa/BoeLaws/Laws/Folders/1

المنظومة التشريعية السعودية الرئيسية:
═══════════════════════════════════════
📌 الأنظمة التجارية والاقتصادية:
- نظام الشركات (م.م. رقم م/3 بتاريخ 28/1/1437هـ): يُنظّم تأسيس الشركات وإدارتها وأنواعها.
- نظام الاستثمار الأجنبي (م.م. رقم م/1 بتاريخ 5/1/1421هـ).
- نظام الإفلاس (م.م. رقم م/50 بتاريخ 28/5/1439هـ).
- نظام المنافسة (م.م. رقم م/75 بتاريخ 29/6/1440هـ).

📌 نظام العمل والعمال:
- نظام العمل (م.م. رقم م/51 بتاريخ 23/8/1426هـ): عقود العمل، ساعات العمل 48 أسبوعياً،
  الإجازات 21 يوماً (30 بعد 5 سنوات)، مكافأة نهاية الخدمة شهر عن كل سنة.

📌 الأنظمة الجزائية والأمنية:
- نظام الإجراءات الجزائية (م.م. رقم م/39 بتاريخ 28/7/1421هـ).
- نظام مكافحة الجرائم المعلوماتية (م.م. رقم م/17 بتاريخ 8/3/1428هـ):
  عقوبات تصل إلى 5 ملايين ريال وسجن حتى 5 سنوات.
- نظام مكافحة الإرهاب وتمويله (م.م. رقم م/16 بتاريخ 24/2/1435هـ).

📌 الأنظمة المدنية:
- نظام الأحوال الشخصية (م.م. رقم م/73 بتاريخ 1/9/1443هـ).
- نظام التنفيذ (م.م. رقم م/53 بتاريخ 13/8/1433هـ).
- نظام المرافعات الشرعية (م.م. رقم م/21 بتاريخ 20/5/1421هـ).

📌 الملكية الفكرية:
- نظام براءات الاختراع (م.م. رقم م/27 بتاريخ 29/5/1425هـ): حماية 20 سنة.
- نظام حماية حق المؤلف (م.م. رقم م/41 بتاريخ 2/7/1424هـ): 70 سنة بعد الوفاة.
- نظام العلامات التجارية (م.م. رقم م/21 بتاريخ 28/5/1423هـ): 10 سنوات قابلة للتجديد.

📌 نظام المرور:
- نظام المرور (م.م. رقم م/45 بتاريخ 11/9/1428هـ).

تعليمات الإجابة:
- أجب بالعربية بشكل واضح ومنظّم مع عناوين.
- استشهد بأرقام المواد والمراسيم الملكية.
- اختم بالإشارة لبوابة القوانين للنص الكامل.
- الإجابة استرشادية وليست مشورة قانونية ملزمة.
`;

export default async function handler(req, res) {
  // السماح فقط بطلبات POST
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // CORS — السماح للموقع بالاتصال بالـ API
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  const { question } = req.body;

  if (!question || typeof question !== "string" || question.trim().length === 0) {
    return res.status(400).json({ error: "السؤال مطلوب" });
  }

  // المفتاح يُقرأ من متغيرات البيئة — لا يظهر في الكود
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: "مفتاح API غير مضبوط في إعدادات الخادم" });
  }

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1024,
        system: LAWS_SYSTEM_PROMPT,
        messages: [{ role: "user", content: question.trim() }],
      }),
    });

    if (!response.ok) {
      const err = await response.json();
      return res.status(response.status).json({ error: err.error?.message || "خطأ من Anthropic API" });
    }

    const data = await response.json();
    const answer = data.content?.[0]?.text || "";

    return res.status(200).json({ answer });

  } catch (err) {
    console.error("API Error:", err);
    return res.status(500).json({ error: "خطأ داخلي في الخادم" });
  }
}
