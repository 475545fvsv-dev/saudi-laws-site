exports.handler = async function () {
  try {
    const url = "https://www.uqn.gov.sa/details?p=17528";

    const response = await fetch(url);

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json; charset=utf-8"
      },
      body: JSON.stringify({
        success: true,
        status: response.status,
        content_type: response.headers.get("content-type")
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
