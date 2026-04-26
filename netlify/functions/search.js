const LAWS_SYSTEM_PROMPT = `
أنت مساعد قانوني متخصص في الأنظمة والتشريعات السعودية.
مصدرك: https://laws.boe.gov.sa

- نظام الشركات (م/3 لعام 1437هـ)
- نظام العمل (م/51 لعام 1426هـ)
- نظام الجرائم المعلوماتية (م/17 لعام 1428هـ)
- نظام الإجراءات الجزائية (م/39 لعام 1421هـ)
- نظام المرور (م/45 لعام 1428هـ)
- نظام الملكية الفكرية (م/27 لعام 1425هـ)
  أجب بالعربية بشكل واضح مع عناوين واستشهد بأرقام المواد.
  `;

exports.handler = async function(event) {
const headers = {
‘Access-Control-Allow-Origin’: ‘*’,
‘Content-Type’: ‘application/json’
};

if (event.httpMethod === ‘OPTIONS’) {
return { statusCode: 200, headers, body: ‘’ };
}

if (event.httpMethod !== ‘POST’) {
return { statusCode: 405, headers, body: JSON.stringify({ error: ‘Method not allowed’ }) };
}

try {
const { question } = JSON.parse(event.body);

```
const response = await fetch('https://api.anthropic.com/v1/messages', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': process.env.ANTHROPIC_API_KEY,
    'anthropic-version': '2023-06-01'
  },
  body: JSON.stringify({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 1024,
    system: LAWS_SYSTEM_PROMPT,
    messages: [{ role: 'user', content: question }]
  })
});

const data = await response.json();
const answer = data.content?.[0]?.text || '';
return { statusCode: 200, headers, body: JSON.stringify({ answer }) };
```

} catch (err) {
return { statusCode: 500, headers, body: JSON.stringify({ error: ’خطأ في الخادم: ’ + err.message }) };
}
};
