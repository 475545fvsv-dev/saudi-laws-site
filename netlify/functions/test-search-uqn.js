exports.handler = async function(event) {
  var h = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json; charset=utf-8'
  };

  try {

    var url =
      'https://www.uqn.gov.sa/search?query=' +
      encodeURIComponent('نظام مكافحة الاحتيال المالي');

    var response = await fetch(url);

    if (!response.ok) {
      throw new Error(
        'فشل البحث: ' + response.status
      );
    }

    var html = await response.text();

    // استخراج الروابط الموجودة في صفحة النتائج
    var links = [];

    var linkRegex =
      /<a[^>]+href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;

    var match;

    while ((match = linkRegex.exec(html)) !== null) {

      var href = match[1];

      var title = match[2]
        .replace(/<[^>]+>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();

      if (
        title.includes('الاحتيال') ||
        title.includes('نظام') ||
        href.includes('/details')
      ) {

        links.push({
          title: title.substring(0, 200),
          href: href
        });

      }

      if (links.length >= 20) {
        break;
      }
    }

    return {
      statusCode: 200,
      headers: h,
      body: JSON.stringify({
        success: true,
        status: response.status,
        page_length: html.length,
        results: links
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
