
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Use POST to send a question."
    });
  }

  return res.status(200).json({
    answer:
      "Your backend is connected successfully. AI answer generation is not connected yet."
  });
}
