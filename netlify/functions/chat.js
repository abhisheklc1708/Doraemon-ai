exports.handler = async function (event) {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Use POST method" })
    };
  }

  try {
    const { message } = JSON.parse(event.body || "{}");

    if (!message || typeof message !== "string") {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Message is required" })
      };
    }

    if (message.length > 4000) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Message is too long" })
      };
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      throw new Error("API key is not configured");
    }

    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: "You are Doremon AI, a friendly assistant. Reply clearly in the language the user uses. User message: " + message
            }]
          }]
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("Gemini API error:", response.status, data);
      return {
        statusCode: 502,
        body: JSON.stringify({
          error: "AI service unavailable. Check your API access or model."
        })
      };
    }

    const reply =
      data.candidates?.[0]?.content?.parts
        ?.map(part => part.text || "")
        .join("") || "Sorry bhai, mujhe jawab nahi mila.";

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ reply })
    };

  } catch (error) {
    console.error("Doremon function error:", error.message);

    return {
      statusCode: 500,
      body: JSON.stringify({
        error: "Doremon AI mein problem aayi. Dobara try karo."
      })
    };
  }
};