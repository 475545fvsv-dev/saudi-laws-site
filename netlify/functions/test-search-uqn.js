exports.handler = async function(event) {
  var h = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json; charset=utf-8'
  };

  try {
    var urls = [
      'https://www.uqn.gov.sa/search?keyword=نظام',
      'https://www.uqn.gov.sa/search?q=نظام',
      'https://www.uqn.gov.sa/search?query=نظام'
    ];

    var results = [];

    for (var i = 0; i < urls.length; i++) {

      var response = await fetch(urls[i]);

      var html = await response.text();

      results.push({
        url: urls[i],
        status: response.status,
        length: html.length,
        has_results:
          html.includes('نظام') ||
          html.includes('الأنظمة')
      });
    }

    return {
      statusCode: 200,
      headers: h,
      body: JSON.stringify({
        success: true,
        results: results
      })
    };

  } catch (e) {

    return {
      statusCode: 500,
      headers: h,
      body: JSON.stringify({
        success: false,
        error: e.message
      })
    };

  }
};
