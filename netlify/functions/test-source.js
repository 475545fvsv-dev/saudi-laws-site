exports.handler = async function(event) {
  var h = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json'
  };

  try {
    var url = 'https://laws.boe.gov.sa/BoeLaws/Laws/LawDetails/08381293-6388-48e2-8ad2-a9a700f2aa94/1';

    var response = await fetch(url);

    if (!response.ok) {
      return {
        statusCode: response.status,
        headers: h,
        body: JSON.stringify({
          success: false,
          error: 'تعذر الوصول إلى المصدر الرسمي',
          status: response.status
        })
      };
    }

    var html = await response.text();

    var text = html
      .replace(/<script[\s\S]*?<\/script>/gi, '')
      .replace(/<style[\s\S]*?<\/style>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    return {
      statusCode: 200,
      headers: h,
      body: JSON.stringify({
        success: true,
        source: 'هيئة الخبراء بمجلس الوزراء',
        title: 'نظام العمل',
        characters: text.length,
        preview: text.substring(0, 5000),
        sourceUrl: url
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
