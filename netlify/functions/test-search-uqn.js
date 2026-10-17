
exports.handler = async function () {
  try {
    var response = await fetch(
      "https://www.uqn.gov.sa/search?query=" +
      encodeURIComponent("نظام العمل")
    );

    var html = await response.text();

    var start = html.indexOf(
      "window.each_widget_search = Vue.createApp"
    );

    if (start === -1) {
      return {
        statusCode: 200,
        body: JSON.stringify({
          error: "لم أجد كود أداة البحث في الصفحة"
        })
      };
    }

    var script = html.substring(start, start + 50000);

    var patterns = [
      "axios.get(this.widget_url",
      "searchQuery",
      "this.query",
      "methods:",
      "async created()",
      "params:"
    ];

    var results = patterns.map(function (pattern) {
      var index = script.indexOf(pattern);

      return {
        pattern: pattern,
        found: index !== -1,
        snippet: index !== -1
          ? script.substring(
              Math.max(0, index - 500),
              Math.min(script.length, index + 1800)
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
      body: JSON.stringify({
        error: error.message
      })
    };
  }
};
