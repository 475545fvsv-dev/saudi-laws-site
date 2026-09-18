exports.handler = async function () {
  try {
    const url = "https://www.uqn.gov.sa/";

    const response = await fetch(url);

    const text = await response.text();

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json; charset=utf-8"
      },
      body: JSON.stringify({
        success: true,
        status: response.status,
        content_type: response.headers.get("content-type"),
        length: text.length,
        preview: text.substring(0, 1000)
      })
    };

  } catch (error) {
    return {
      statusCode: 500,
      headers: {
        "Content-Type": "application/json; charset=utf-8"
      },
      body: JSON.stringify({
        success: false,
        error: error.message
      })
    };
  }
};
