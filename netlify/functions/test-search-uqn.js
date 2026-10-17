
exports.handler = async function () {
  try {
    var url = "https://www.uqn.gov.sa/api/widget/52/json";

    var response = await fetch(url);
    var contentType = response.headers.get("content-type") || "";
    var body = await response.text();

    var preview = body.substring(0, 12000);
    var parsed = null;

    try {
      parsed = JSON.parse(body);
    } catch (_) {}

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json; charset=utf-8"
      },
      body: JSON.stringify({
        status: response.status,
        content_type: contentType,
        response_length: body.length,
        is_json: parsed !== null,
        response_preview: preview
      })
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers: {
        "Content-Type": "application/json; charset=utf-8"
      },
      body: JSON.stringify({
        error: error.message
      })
    };
  }
};
