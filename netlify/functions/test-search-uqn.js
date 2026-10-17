
exports.handler = async function () {
  try {
    var response = await fetch(
      "https://www.uqn.gov.sa/search?query=" +
      encodeURIComponent("نظام العمل")
    );

    var html = await response.text();

    var patterns = [
      "widget_url",
      "searchQuery",
      "each_widget_search",
      "api/widget/52/json",
      "axios",
      "fetch("
    ];

    var results = patterns.map(function (pattern) {
      var index = html.indexOf(pattern);

      return {
        pattern: pattern,
        found: index !== -1,
        snippet: index !== -1
          ? html.substring(
              Math.max(0, index - 250),
              Math.min(html.length, index + 700)
            )
          : ""
      };
    });

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json; charset=utf-8"
      },
      body: JSON.stringify(results)
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};
