exports.handler = async function(event) {
  var h = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json; charset=utf-8'
  };

  try {
    var query = 'نظام العمل';

    var url =
      'https://www.uqn.gov.sa/search?query=' +
      encodeURIComponent(query);

    var response = await fetch(url);

    if (!response.ok) {
      throw new Error('فشل البحث: ' + response.status);
    }

    var html = await response.text();

    var results = [];
    var regex =
      /<div class="one-article">([\s\S]*?)<\/div>\s*<div class="article-meta">([\s\S]*?)<\/div>/g;

    var match;

    // استخراج روابط التفاصيل وعناوينها من HTML
    var linkRegex =
      /<a[^>]+href=["']([^"']*\/details\?p=[^"']+)["'][^>]*title=["']([^"']+)["']/g;

    while ((match = linkRegex.exec(html)) !== null) {
      var href = match[1];
      var title = match[2]
        .replace(/&amp;/g, '&')
        .trim();

      var absoluteUrl = href.startsWith('http')
        ? href
        : 'https://www.uqn.gov.sa' + href;

      if (!results.some(function(item) {
        return item.url === absoluteUrl;
      })) {
        results.push({
          title: title,
          url: absoluteUrl
        });
      }

      if (results.length >= 15) break;
    }

    return {
      statusCode: 200,
      headers: h,
      body: JSON.stringify({
        success: true,
        query: query,
        status: response.status,
        page_length: html.length,
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
