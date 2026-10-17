
exports.handler = async function () {
  try {
    var query = "نظام العمل";
    var url =
      "https://www.uqn.gov.sa/search?query=" +
      encodeURIComponent(query);

    var response = await fetch(url);
    var html = await response.text();

    // استخراج روابط النتائج وعناوينها من صفحة أم القرى
    var results = [];
    var regex =
      /<a\b[^>]*href=["']([^"']*details\?p=\d+[^"']*)["'][^>]*>/gi;

    var match;

    while ((match = regex.exec(html)) !== null) {
      var tag = match[0];
      var href = match[1];

      var titleMatch = tag.match(/\btitle=["']([^"']+)["']/i);

      var title = titleMatch
        ? titleMatch[1]
        : "";

      var link = href.startsWith("http")
        ? href
        : "https://www.uqn.gov.sa" + href;

      if (
        title &&
        !results.some(function (item) {
          return item.url === link;
        })
      ) {
        results.push({
          title: title,
          url: link
        });
      }
    }

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json; charset=utf-8"
      },
      body: JSON.stringify({
        status: response.status,
        query: query,
        results_count: results.length,
        results: results.slice(0, 15)
      })
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers: {
        "Content-Type": "application/json; charset=utf-8"
      },
      body: JSON.stringify({
        error: error.message
      })
    };
  }
};
