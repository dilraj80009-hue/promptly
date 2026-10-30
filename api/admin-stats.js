
export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");

  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_PUBLISHABLE_KEY;
  const authorization = req.headers.authorization;

  if (!supabaseUrl || !supabaseKey) {
    return res.status(500).json({
      error: "Supabase server configuration is missing."
    });
  }

  if (!authorization || !authorization.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Login required." });
  }

  try {
    const userResponse = await fetch(
      `${supabaseUrl}/auth/v1/user`,
      {
        headers: {
          apikey: supabaseKey,
          Authorization: authorization
        }
      }
    );

    if (!userResponse.ok) {
      return res.status(401).json({ error: "Invalid session." });
    }

    const statsResponse = await fetch(
      `${supabaseUrl}/rest/v1/rpc/admin_dashboard_stats`,
      {
        method: "POST",
        headers: {
          apikey: supabaseKey,
          Authorization: authorization,
          "Content-Type": "application/json"
        },
        body: "{}"
      }
    );

    const stats = await statsResponse.json();

    if (!statsResponse.ok) {
      return res.status(403).json({
        error: "Admin access denied or statistics unavailable."
      });
    }

    return res.status(200).json(stats);
  } catch (error) {
    return res.status(500).json({
      error: "Could not load dashboard statistics."
    });
  }
}
