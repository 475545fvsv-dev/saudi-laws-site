const fs = require("fs");
const path = require("path");

exports.handler = async function (event) {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Content-Type": "application/json"
  };

  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers
    };
  }

  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers,
      body: ""
    };
  }

  try {
    const body = JSON.parse(event.body || "{}");
    const question = body.question;

    if (!question) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          error: "لم يتم إرسال السؤال"
        })
      };
    }

    const lawPath = path.join(
      process.cwd(),
      "data",
      "laws",
      "nizam-mukafahat-alihtiyal-almali-wa-khiyanat-alamana.json"
    );

    const file = fs.readFileSync(lawPath, "utf8");
    const articles = JSON.parse(file);

    const results = articles.filter(article =>
      article.article_text.includes(question)
    );

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        question,
        total_articles: articles.length,
        matched_articles: results.map(article => ({
          article_number: article.article_number,
          article_text: article.article_text
        }))
      })
    };

  } catch (error) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        error: error.message
      })
    };
  }
};
