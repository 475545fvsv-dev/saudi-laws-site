exports.handler = async function(event) {
  var h = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json; charset=utf-8'
  };

  try {
    var url = 'https://www.uqn.gov.sa/';

    var response = await fetch(url);

    if (!response.ok) {
      throw new Error('فشل الوصول إلى أم القرى: ' + response.status);
    }

    var html = await response.text();

    // نبحث عن كلمات موجودة في الصفحة
    var keywords = [
      'نظام إيرادات الدولة',
      'نظام التعليم العام',
      'نظام التنفيذ',
      'نظام حقوق المؤلف',
      'نظام المنافسات والمشتريات الحكومية'
    ];

    var found = [];

    keywords.forEach(function(keyword) {
      if (html.includes(keyword)) {
        found.push(keyword);
      }
    });

    return {
      statusCode: 200,
      headers: h,
      body: JSON.stringify({
        success: true,
        page_length: html.length,
        found: found
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
