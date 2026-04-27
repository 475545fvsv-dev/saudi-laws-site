exports.handler = async (event) => {

  if(event.httpMethod !== "POST"){
    return { statusCode: 405, body: "Method not allowed" };
  }

  try {

    const { question } = JSON.parse(event.body);

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
        system: "أنت مستشار قانوني سعودي. أجب بالعربية بشكل واضح.",
        messages: [{ role: "user", content: question }]
      })
    });

    const data = await response.json();

    return {
      statusCode: 200,
      body: JSON.stringify({
        answer: data?.content?.[0]?.text || "لا يوجد رد"
      })
    };

  } catch (e) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: e.message })
    };
  }
};
