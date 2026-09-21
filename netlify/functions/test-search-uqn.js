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

    var html = await response.text();

    // نبحث عن أماكن ظهور كلمة "احتيال" داخل الصفحة
    var positions = [];
    var word = 'احتيال';
    var start = 0;

    while (true) {

      var index = html.indexOf(word, start);

      if (index === -1) {
        break;
      }

      positions.push({
        position: index,
        context: html.substring(
          Math.max(0, index - 500),
          Math.min(html.length, index + 1000)
        )
      });

      start = index + word.length;

      if (positions.length >= 10) {
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
        occurrences: positions
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
