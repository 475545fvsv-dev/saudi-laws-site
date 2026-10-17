
exports.handler = async function () {
  try {
    var url =
      "https://www.uqn.gov.sa/search?query=" +
      encodeURIComponent("نظام العمل");

    var response = await fetch(url);
    var html = await response.text();

    var keyword = "نظام العمل";
    var index = html.indexOf(keyword);

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json; charset=utf-8"
      },
      body: JSON.stringify({
        status: response.status,
        html_length: html.length,
        keyword_found: index !== -1,
        page_preview: html.slice(0, 1200),
        keyword_context:
          index !== -1
            ? html.slice(
                Math.max(0, index - 500),
                index + 1500
              )
            : "لم يظهر نص البحث حرفيًا في الصفحة"
      })
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers: {
        "Content-Type": "application/json; charset=utf-8"
      },
      body: JSON.stringify({ error: error.message })
    };
  }
};
