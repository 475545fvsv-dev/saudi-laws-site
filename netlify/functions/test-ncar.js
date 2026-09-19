exports.handler = async function () {
  try {
    const url = "https://www.uqn.gov.sa/details?p=17528";

    const response = await fetch(url);

    const text = await response.text();

    // استخراج المواد من صفحة النظام
    const articles = [];

    const regex = /المادة\s+([الأولىالثانيةالثالثةالرابعةالخامسةالسادسةالسابعةالثامنةالتاسعةالعاشرةالحاديةعشرة]+)\s*:/g;

    let match;

    while ((match = regex.exec(text)) !== null) {
      const start = match.index;
      const next = regex.exec(text);

      const end = next ? next.index : text.length;

      articles.push(
        text.substring(start, end)
          .replace(/<[^>]+>/g, " ")
          .replace(/\s+/g, " ")
          .trim()
      );

      if (next) {
        regex.lastIndex = next.index;
      }
    }

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json; charset=utf-8"
      },
      body: JSON.stringify({
        success: true,
        status: response.status,
        page_length: text.length,
        articles_found: articles.length,
        articles: articles.slice(0, 3)
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
