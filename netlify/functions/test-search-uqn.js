
exports.handler = async function () {
  var headers = {
    "Content-Type": "application/json; charset=utf-8"
  };

  try {
    var url =
      "https://www.uqn.gov.sa/search?query=" +
      encodeURIComponent("نظام العمل");

    var response = await fetch(url);
    var html = await response.text();

    // نعرض مقتطفات من الصفحة حول كلمة "العمل"
    var positions = [];
    var start = 0;

    while (positions.length < 5) {
      var index = html.indexOf("العمل", start);
      if (index === -1) break;

      positions.push(
        html.substring(
          Math.max(0, index - 250),
          Math.min(html.length, index + 500)
        )
      );

      start = index + 5;
    }

    return {
      statusCode: 200,
      headers: headers,
      body: JSON.stringify({
        status: response.status,
        page_length: html.length,
        snippets: positions
      })
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers: headers,
      body: JSON.stringify({
        error: error.message
      })
    };
  }
};
