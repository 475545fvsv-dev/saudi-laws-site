exports.handler = async function () {
  try {
    const question = "ما عقوبة الاحتيال المالي؟";

    const url = "https://www.uqn.gov.sa/details?p=17528";

    const response = await fetch(url);
    const html = await response.text();

    const text = html
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<[^>]+>/g, " ")
      .replace(/&nbsp;/gi, " ")
      .replace(/&quot;/gi, '"')
      .replace(/&amp;/gi, "&")
      .replace(/\s+/g, " ")
      .trim();

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

      articles.push(text.substring(start, end).trim());
    }

    const keywords = ["عقوبة", "الاحتيال", "المالي"];

    const relevant = articles.filter(article =>
      keywords.some(keyword => article.includes(keyword))
    );

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json; charset=utf-8"
      },
      body: JSON.stringify({
        success: true,
        question,
        law: "نظام مكافحة الاحتيال المالي وخيانة الأمانة",
        source: url,
        articles_found: articles.length,
        relevant_articles: relevant
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
