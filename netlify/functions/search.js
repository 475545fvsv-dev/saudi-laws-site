const fetch = require('node-fetch');

const LAWS_SYSTEM_PROMPT = `
أنت مساعد قانوني متخصص في الأنظمة والتشريعات السعودية الصادرة عن هيئة الخبراء بمجلس الوزراء.
مصدرك الرسمي هو بوابة هيئة الخبراء: https://laws.boe.gov.sa/BoeLaws/Laws/Folders/1

المنظومة التشريعية السعودية الرئيسية:
- نظام الشركات (م.م. رقم م/3 بتاريخ 28/1/1437هـ)
- نظام العمل (م.م. رقم م/51 بتاريخ 23/8/1426هـ): ساعات العمل 48 أسبوعياً، إجازة 21 يوم، مكافأة نهاية الخدمة شهر عن كل سنة.
- نظام مكافحة الجرائم المعلوماتية (م.م. رقم م/17 بتاريخ 8/3/1428هـ)
- نظام الإجراءات الجزائية (م.م. رقم م/39 بتاريخ 28/7/1421هـ)
- نظام الأحوال الشخصية (م.م. رقم م/73 بتاريخ 1/9/1443هـ)
- نظام براءات الاختراع (م.م. رقم م/27 بتاريخ 29/5/1425هـ)
- نظام المرور (م.م. رقم م/45 بتاريخ 11/9/1428هـ)

تعليمات: أجب بالعربية بشكل واضح مع عناوين، استشهد بأرقام المواد، الإجابة استرشادية وليست ملزمة.
`;

exports.handler = async function(event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json'
  };

  try {
    const { question } = JSON.parse(event.body);
    if (!question) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: 'السؤال مطلوب' }) };
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1024,
        system: LAWS_SYSTEM_PROMPT,
        messages: [{ role: 'user', content: question }]
      })
    });

    const data = await response.json();
    const answer = data.content?.[0]?.text || '';
    return { statusCode: 200, headers, body: JSON.stringify({ answer }) };

  } catch (err) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: 'خطأ في الخادم' }) };
  }
};
