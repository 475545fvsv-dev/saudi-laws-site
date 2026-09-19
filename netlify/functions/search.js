exports.handler = async function(event) {
  var h = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json; charset=utf-8'
  };

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: h,
      body: ''
    };
  }

  try {
    var q = JSON.parse(event.body || '{}').question;

    if (!q) {
      return {
        statusCode: 400,
        headers: h,
        body: JSON.stringify({ error: 'empty' })
      };
    }

    // المصدر الرسمي الذي نختبر عليه حاليًا
    var lawUrl = 'https://www.uqn.gov.sa/details?p=17528';

    // جلب النظام من جريدة أم القرى
    var sourceResponse = await fetch(lawUrl);

    if (!sourceResponse.ok) {
      throw new Error(
        'فشل الوصول إلى جريدة أم القرى: ' +
        sourceResponse.status
      );
    }

    var html = await sourceResponse.text();

    // تحويل الصفحة إلى نص
    var text = html
      .replace(/<script[\s\S]*?<\/script>/gi, ' ')
      .replace(/<style[\s\S]*?<\/style>/gi, ' ')
      .replace(/<[^>]+>/g, ' ')
      .replace(/&nbsp;/gi, ' ')
      .replace(/&quot;/gi, '"')
      .replace(/&amp;/gi, '&')
      .replace(/\s+/g, ' ')
      .trim();

    // استخراج مواد النظام
    var articleRegex =
      /المادة\s+(الأولى|الثانية|الثالثة|الرابعة|الخامسة|السادسة|السابعة|الثامنة|التاسعة|العاشرة|الحادية عشرة)\s*:/g;

    var matches = [...text.matchAll(articleRegex)];

    var articles = [];

    for (var i = 0; i < matches.length; i++) {
      var start = matches[i].index;

      var end =
        i + 1 < matches.length
          ? matches[i + 1].index
          : text.length;

      articles.push(
        text.substring(start, end).trim()
      );
    }

    // البحث عن المواد الأقرب للسؤال
    var questionWords = q
      .split(/\s+/)
      .map(function(word) {
        return word.replace(/[؟،.,!]/g, '');
      })
      .filter(function(word) {
        return word.length >= 3;
      });

    var relevantArticles = articles
      .map(function(article) {
        var score = 0;

        questionWords.forEach(function(word) {
          if (article.includes(word)) {
            score++;
          }
        });

        return {
          article: article,
          score: score
        };
      })
      .filter(function(item) {
        return item.score > 0;
      })
      .sort(function(a, b) {
        return b.score - a.score;
      })
      .slice(0, 5);

    // النص الذي سنرسله إلى Claude
    var legalContext = relevantArticles
      .map(function(item) {
        return item.article;
      })
      .join('\n\n');

    // إذا لم نجد نصًا قانونيًا مناسبًا
    if (!legalContext) {
      return {
        statusCode: 200,
        headers: h,
        body: JSON.stringify({
          answer:
            'لم أجد في النص القانوني المسترجع من المصدر الرسمي مادة كافية للإجابة عن السؤال.',
          source: lawUrl,
          law: 'نظام مكافحة الاحتيال المالي وخيانة الأمانة'
        })
      };
    }

    // إرسال النص القانوني فقط إلى Claude
    var r = await fetch(
      'https://api.anthropic.com/v1/messages',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: 'claude-haiku-4-5-20251001',
          max_tokens: 1024,

          system:
            'أنت مساعد قانوني سعودي. ' +
            'أجب باللغة العربية. ' +
            'اعتمد فقط على النصوص القانونية التي أقدمها لك. ' +
            'لا تضف معلومات قانونية من ذاكرتك إذا لم تكن موجودة في النص. ' +
            'اذكر رقم المادة عند الاستناد إليها. ' +
            'إذا كان النص المقدم غير كافٍ للإجابة، صرّح بذلك بوضوح. ' +
            'لا تخترع مواد أو عقوبات أو أرقامًا.',

          messages: [
            {
              role: 'user',
              content:
                'السؤال:\n' +
                q +
                '\n\n' +
                'النص القانوني الرسمي المسترجع من جريدة أم القرى:\n' +
                legalContext +
                '\n\n' +
                'أجب عن السؤال اعتمادًا على النص أعلاه فقط.'
            }
          ]
        })
      }
    );

    var d = await r.json();

    if (!r.ok) {
      throw new Error(
        d.error?.message ||
        'حدث خطأ في خدمة الذكاء الاصطناعي'
      );
    }

    var answer =
      d.content?.[0]?.text ||
      'لم يتم الحصول على إجابة.';

    return {
      statusCode: 200,
      headers: h,
      body: JSON.stringify({
        answer: answer,
        source: lawUrl,
        law: 'نظام مكافحة الاحتيال المالي وخيانة الأمانة'
      })
    };

  } catch (e) {
    return {
      statusCode: 500,
      headers: h,
      body: JSON.stringify({
        error: e.message
      })
    };
  }
};
