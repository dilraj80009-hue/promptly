
const ACTION_GUIDANCE = {
  generate: "Create a clear, complete AI prompt from the user's idea.",
  basic: "Turn the user's request into a clear and useful basic AI prompt.",
  enhance: "Improve specificity, clarity, context, constraints and output structure while preserving intent.",
  correct: "Correct grammar, spelling and ambiguity without changing the user's intent.",
  advanced: "Create a detailed expert-level prompt with objective, context, steps, constraints and output format.",
  shorten: "Shorten the prompt while preserving all essential requirements.",
  detail: "Expand the idea into a specific, actionable prompt without inventing personal facts."
};

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");

  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { prompt, action = "enhance", settings = {} } = req.body || {};

  if (typeof prompt !== "string" || !prompt.trim()) {
    return res.status(400).json({ error: "A prompt is required." });
  }

  if (prompt.length > 12000) {
    return res.status(413).json({
      error: "Prompt is too long. Maximum length is 12,000 characters."
    });
  }

  const apiKey = process.env.AI_API_KEY;
  const model = process.env.AI_MODEL;
  const apiUrl = process.env.AI_API_URL ||
    "https://api.openai.com/v1/chat/completions";

  if (!apiKey || !model) {
    return res.status(503).json({
      error: "AI provider is not configured yet.",
      code: "AI_NOT_CONFIGURED"
    });
  }

  const task = ACTION_GUIDANCE[action] || ACTION_GUIDANCE.enhance;

  const safeSettings = {
    detail: String(settings.level || "Balanced").slice(0, 40),
    tone: String(settings.tone || "Clear").slice(0, 40),
    language: String(settings.language || "Same as input").slice(0, 60),
    format: String(settings.format || "Choose automatically").slice(0, 60),
    context: String(settings.context || "").slice(0, 2000)
  };

  const system = [
    "You are Promptly, an expert AI prompt engineer.",
    task,
    "Preserve the user's intended goal. Do not invent facts or personal details.",
    "Return only the final improved prompt, without commentary or markdown fences.",
    `Preferred response language: ${safeSettings.language}.`,
    `Tone: ${safeSettings.tone}. Detail level: ${safeSettings.detail}.`,
    `Output format preference: ${safeSettings.format}.`,
    safeSettings.context ? `Additional context: ${safeSettings.context}` : ""
  ].filter(Boolean).join("\n");

  try {
    const upstream = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: system },
          { role: "user", content: prompt.trim() }
        ],
        temperature: 0.5
      })
    });

    const payload = await upstream.json().catch(() => ({}));

    if (!upstream.ok) {
      return res.status(502).json({
        error: "The AI provider could not complete the request.",
        providerStatus: upstream.status
      });
    }

    const result = payload?.choices?.[0]?.message?.content?.trim();

    if (!result) {
      return res.status(502).json({
        error: "The AI provider returned an empty response."
      });
    }

    return res.status(200).json({ result });

  } catch (error) {
    return res.status(502).json({
      error: "Could not connect to the AI provider."
    });
  }
                                                  }
