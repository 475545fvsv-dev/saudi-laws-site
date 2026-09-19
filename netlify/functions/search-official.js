exports.handler = async function (event) {
  try {
    const body = JSON.parse(event.body || "{}");
    const question = (body.question || "").trim();

    if (!question) {
      return {
        statusCode: 400,
        headers: {
          "Content-Type": "application/json; charset=utf-8"
        },
        body: JSON.stringify({
          success: false,
          error: "لم يتم إرسال السؤال"
        })
      };
    }

    // النظام الذي نختبر عليه حاليًا
    const lawUrl =
      "https://www.uqn.gov.sa/details?p=17528";

    const response = await fetch(lawUrl);

    if (!response.ok) {
      throw new Error(
        `فشل الوصول إلى جريدة أم القرى: ${response.status}`
      );
    }

    const html = await response.text();

    // تحويل HTML إلى نص قابل للبحث
    const text = html
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<[^>]+>/g, " ")
      .replace(/&nbsp;/gi, " ")
      .replace(/&quot;/gi, '"')
      .replace(/&amp;/gi, "&")
      .replace(/\s+/g, " ")
      .trim();

    // استخراج المواد
    const articleRegex =
      /المادة\s+(الأولى|الثانية|الثالثة|الرابعة|الخامسة|السادسة|السابعة|الثامنة|التاسعة|العاشرة|الحادية عشرة)\s*:/g;

    const matches = [...text.matchAll(articleRegex)];

    const articles = [];

    for (let i = 0; i < matches.length; i++) {
      const start = matches[i].index;
      const end =
        i + 1 < matches.length
          ? matches[i + 1].index
          : text.length;

      const articleText = text
        .substring(start, end)
        .trim();

      articles.push(articleText);
    }

    // بحث بسيط داخل المواد عن كلمات السؤال
    const questionWords = question
      .split(/\s+/)
      .filter(word => word.length >= 3);

    const results = articles
      .map(article => {
        let score = 0;

        for (const word of questionWords) {
          if (article.includes(word)) {
            score++;
          }
        }

        return {
          article,
          score
        };
      })
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score);

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json; charset=utf-8"
      },
      body: JSON.stringify({
        success: true,
        question,
        law: "نظام مكافحة الاحتيال المالي وخيانة الأمانة",
        source: lawUrl,
        articles_found: articles.length,
        relevant_articles: results.slice(0, 3)
      })
    };

  } catch (error) {
    return {
      statusCode: 500,
      headers: {
        "Content-Type": "application/json; charset=utf-8"
      },
      body: JSON.stringify({
        success: false,
        error: error.message
      })
    };
  }
};
