
exports.handler = async function () {
  try {
    var response = await fetch("https://www.uqn.gov.sa/search?query=" + encodeURIComponent("نظام العمل"));
    var html = await response.text();

    var terms = [
      "fetchArticles()",
      "fetchArticles:",
      "fetchArticles =",
      "const widget_mixin",
      "widget_mixin =",
      "function widget_mixin",
      "setQueryParam("
    ];

    var results = [];

    for (var term of terms) {
      var positions = [];
      var from = 0;

      while (positions.length < 5) {
        var index = html.indexOf(term, from);
        if (index === -1) break;
        positions.push(index);
        from = index + term.length;
      }

      results.push({
        term: term,
        found: positions.length > 0,
        snippets: positions.map(function (index) {
          return html.substring(
            Math.max(0, index - 500),
            Math.min(html.length, index + 1800)
          );
        })
      });
    }

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify(results)
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};
