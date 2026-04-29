exports.handler = async function(event) {
var headers = {
‘Access-Control-Allow-Origin’: ‘*’,
‘Content-Type’: ‘application/json’
};

if (event.httpMethod === ‘OPTIONS’) {
return { statusCode: 200, headers: headers, body: ‘’ };
}

if (event.httpMethod !== ‘POST’) {
return { statusCode: 405, headers: headers, body: JSON.stringify({ error: ‘Method not allowed’ }) };
}

try {
var body = JSON.parse(event.body);
var question = body.question;

```
if (!question) {
  return { statusCode: 400, headers: headers, body: JSON.stringify({ error: 'question required' }) };
}

var systemPrompt = "You are a legal assistant specialized in Saudi Arabian laws from the Board of Experts. Answer in Arabic with clear headings. Reference article numbers when possible. Source: https://laws.boe.gov.sa. Key laws: Companies Law M/3 1437H, Labor Law M/51 1426H, Cybercrime Law M/17 1428H, Criminal Procedure M/39 1421H, Traffic Law M/45 1428H, IP Law M/27 1425H. Note answers are informational only.";

var apiKey = 'sk-ant-api03-St-m4kfsMFHiYYj5_VoQVLyVI
3уtZХnSLzє59WPZJKdee0IVocu1zTfRAgV2oP_
VtKz2Jgjr0793oFfp7mkTPA-ETahpQAA';

var response = await fetch('https://api.anthropic.com/v1/messages', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': apiKey,
    'anthropic-version': '2023-06-01'
  },
  body: JSON.stringify({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 1024,
    system: systemPrompt,
    messages: [{ role: 'user', content: question }]
  })
});

var data = await response.json();
var answer = '';

if (data.content && data.content[0] && data.content[0].text) {
  answer = data.content[0].text;
} else if (data.error) {
  return { statusCode: 200, headers: headers, body: JSON.stringify({ error: data.error.message }) };
}

return {
  statusCode: 200,
  headers: headers,
  body: JSON.stringify({ answer: answer })
};
```

} catch (err) {
return {
statusCode: 500,
headers: headers,
body: JSON.stringify({ error: err.message })
};
}
};
