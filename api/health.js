
export default function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");

  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({
      ok: false,
      error: "Method not allowed"
    });
  }

  return res.status(200).json({
    ok: true,
    service: "Promptly API",
    aiConfigured: Boolean(
      process.env.AI_API_KEY && process.env.AI_MODEL
    )
  });
}
