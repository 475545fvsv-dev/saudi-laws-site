
exports.handler = async function () {
  var base = "https://www.uqn.gov.sa/api/widget/52/json";
  var query = "نظام العمل";

  var tests = [
    { name: "query", params: { query: query } },
    { name: "searchQuery", params: { searchQuery: query } },
    { name: "keyword", params: { keyword: query } },
    { name: "q", params: { q: query } }
  ];

  var results = [];

  for (var test of tests) {
    try {
      var url = new URL(base);

      Object.keys(test.params).forEach(function (key) {
        url.searchParams.set(key, test.params[key]);
      });

      var response = await fetch(url.toString());
      var data = await response.json();

      var articles =
        data?.widget_data?.articles || [];

      results.push({
        method: test.name,
        status: response.status,
        count: articles.length,
        titles: articles.slice(0, 8).map(function (item) {
          return item.article_title;
        })
      });
    } catch (error) {
      results.push({
        method: test.name,
        error: error.message
      });
    }
  }

  return {
    statusCode: 200,
    headers: {
      "Content-Type": "application/json; charset=utf-8"
    },
    body: JSON.stringify(results)
  };
};
