exports.handler = async function () {
  try {
    const url = "https://www.uqn.gov.sa/details?p=17528";

    const response = await fetch(url);
    const html = await response.text();

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json; charset=utf-8"
      },
      body: JSON.stringify({
        success: true,
        status: response.status,
        length: html.length,
        has_article_one: html.includes("المادة الأولى"),
        has_article_two: html.includes("المادة الثانية"),
        has_article_eleven: html.includes("المادة الحادية عشرة"),
        preview: html.substring(
          html.indexOf("المادة الأولى"),
          html.indexOf("المادة الأولى") + 3000
        )
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
