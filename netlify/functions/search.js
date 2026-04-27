exports.handler = async (event) => {

  // نسمح فقط بـ POST
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: "Method Not Allowed"
    };
  }

  try {

    const { question } = JSON.parse(event.body || "{}");

    if (!question) {
      return {
        statusCode: 400,
        body: JSON.stringify({ answer: "السؤال فارغ" })
      };
    }

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        model: "claude-3-haiku-20240307",
        max_tokens: 800,
        system: "أنت مستشار قانوني سعودي. أجب بالعربية بشكل واضح ومختصر واذكر المواد إن أمكن.",
        messages: [
          { role: "user", content: question }
        ]
      })
    });

    const data = await response.json();

    console.log("ANTHROPIC RESPONSE:", data);

    // نحاول نجيب الرد بأكثر من طريقة (عشان ما يرجع فاضي)
    let answer =
      data?.content?.[0]?.text ||
      data?.error?.message ||
      data?.error ||
      "لا يوجد رد من الذكاء الاصطناعي";

    return {
      statusCode: 200,
      body: JSON.stringify({ answer })
    };

  } catch (err) {

    console.error(err);

    return {
      statusCode: 500,
      body: JSON.stringify({
        answer: "خطأ في السيرفر: " + err.message
      })
    };
  }
};
