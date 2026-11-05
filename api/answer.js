
export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Use POST to send a question."
    });
  }

  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return res.status(500).json({
      error: "OpenAI API key is missing from Vercel."
    });
  }

  const question = req.body?.question?.trim();

  if (!question) {
    return res.status(400).json({
      error: "Please provide an interview question."
    });
  }

  try {
    const response = await fetch(
      "https://api.openai.com/v1/responses",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: "gpt-5.4-mini",
          store: false,
          instructions:
            "You are Interview Copilot. Help the user prepare clear, natural and professional interview answers. Keep answers concise and easy to read aloud. Never invent the user's qualifications, work history or achievements. If personal details are missing, use honest general wording or placeholders.",
          input: question
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        error: data.error?.message || "OpenAI request failed."
      });
    }

    const answer = (data.output || [])
      .filter(item => item.type === "message")
      .flatMap(item => item.content || [])
      .filter(item => item.type === "output_text")
      .map(item => item.text)
      .join("\n")
      .trim();

    if (!answer) {
      return res.status(500).json({
        error: "AI returned an empty answer."
      });
    }

    return res.status(200).json({
      answer: answer
    });

  } catch (error) {
    return res.status(500).json({
      error: error.message || "Something went wrong."
    });
  }
}
