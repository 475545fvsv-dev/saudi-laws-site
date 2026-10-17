
exports.handler = async function () {
  var base = "https://www.uqn.gov.sa/api/widget/52/json";
  var query = "نظام العمل";

  var variants = [
    { name: "query", params: { query: query } },
    { name: "query_title", params: { query_title: query } },
    { name: "query_body", params: { query_body: query } },
    {
      name: "query_title_and_body",
      params: { query_title: query, query_body: query }
    },
    {
      name: "full_widget_request",
      params: {
        query: query,
        query_title: "",
        query_body: "",
        image_thumbs: "400,600",
        ts: Date.now(),
        pgno: 1,
        type: "",
        sections: "",
        user: ""
      }
    }
  ];

  var results = [];

  for (var variant of variants) {
    try {
      var url = new URL(base);

      Object.keys(variant.params).forEach(function (key) {
        url.searchParams.set(key, variant.params[key]);
      });

      var response = await fetch(url.toString());
      var data = await response.json();

      var widget = data?.widget_data || {};
      var info = widget.widget_data_info || {};

      var articles =
        info.articles ||
        info.view_data?.articles ||
        widget.articles ||
        [];

      results.push({
        test: variant.name,
        status: response.status,
        count: articles.length,
        titles: articles.slice(0, 8).map(function (article) {
          return article.article_title;
        })
      });
    } catch (error) {
      results.push({
        test: variant.name,
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
