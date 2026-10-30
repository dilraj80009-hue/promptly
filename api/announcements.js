
export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_PUBLISHABLE_KEY;
  const authorization = req.headers.authorization;

  if (!supabaseUrl || !supabaseKey) {
    return res.status(500).json({
      error: "Supabase configuration is missing."
    });
  }

  const baseUrl = `${supabaseUrl}/rest/v1/announcements`;

  try {
    if (req.method !== "GET") {
      if (!authorization || !authorization.startsWith("Bearer ")) {
        return res.status(401).json({ error: "Login required." });
      }

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
    } else if (authorization) {
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
    }

    const headers = {
      apikey: supabaseKey,
      "Content-Type": "application/json"
    };

    if (authorization) {
      headers.Authorization = authorization;
    }

    let url = `${baseUrl}?select=*&order=created_at.desc`;
    const method = req.method;
    let body;

    if (method === "POST") {
      const {
        title,
        message,
        announcement_type,
        is_published,
        image_url
      } = req.body || {};

      const safeTitle = typeof title === "string" ? title.trim() : "";
      const safeMessage = typeof message === "string" ? message.trim() : "";
      const safeImageUrl =
        typeof image_url === "string" ? image_url.trim() : "";

      if (
        (title !== undefined && typeof title !== "string") ||
        (message !== undefined && typeof message !== "string")
      ) {
        return res.status(400).json({
          error: "Invalid title or message."
        });
      }

      if (!safeTitle && !safeMessage && !safeImageUrl) {
        return res.status(400).json({
          error: "Please provide a title, message, or image."
        });
      }

      if (!["info", "success", "warning"].includes(announcement_type)) {
        return res.status(400).json({
          error: "Invalid announcement type."
        });
      }

      if (
        image_url !== undefined &&
        image_url !== null &&
        typeof image_url !== "string"
      ) {
        return res.status(400).json({
          error: "Invalid image URL."
        });
      }

      body = {
        title: safeTitle,
        message: safeMessage,
        announcement_type,
        is_published: is_published === true,
        image_url: safeImageUrl || null
      };

    } else if (method === "PATCH" || method === "DELETE") {
      const id = req.query?.id;

      if (!id || !/^\d+$/.test(String(id))) {
        return res.status(400).json({ error: "Valid ID required." });
      }

      url = `${baseUrl}?id=eq.${encodeURIComponent(id)}&select=*`;

      if (method === "PATCH") {
        const {
          title,
          message,
          announcement_type,
          is_published,
          image_url
        } = req.body || {};

        body = {};

        if (title !== undefined) {
          if (typeof title !== "string") {
            return res.status(400).json({ error: "Invalid title." });
          }
          body.title = title.trim();
        }

        if (message !== undefined) {
          if (typeof message !== "string") {
            return res.status(400).json({ error: "Invalid message." });
          }
          body.message = message.trim();
        }

        if (announcement_type !== undefined) {
          if (!["info", "success", "warning"].includes(announcement_type)) {
            return res.status(400).json({ error: "Invalid type." });
          }
          body.announcement_type = announcement_type;
        }

        if (is_published !== undefined) {
          if (typeof is_published !== "boolean") {
            return res.status(400).json({ error: "Invalid publish status." });
          }
          body.is_published = is_published;
        }

        if (image_url !== undefined) {
          if (image_url !== null && typeof image_url !== "string") {
            return res.status(400).json({ error: "Invalid image URL." });
          }

          body.image_url =
            typeof image_url === "string"
              ? image_url.trim() || null
              : null;
        }

        if (Object.keys(body).length === 0) {
          return res.status(400).json({
            error: "No announcement changes provided."
          });
        }

        body.updated_at = new Date().toISOString();
      }

    } else if (method !== "GET") {
      res.setHeader("Allow", "GET, POST, PATCH, DELETE");
      return res.status(405).json({ error: "Method not allowed." });
    }

    const fetchOptions = {
      method,
      headers: {
        ...headers,
        Prefer: "return=representation"
      }
    };

    if (body !== undefined) {
      fetchOptions.body = JSON.stringify(body);
    }

    const response = await fetch(url, fetchOptions);
    const responseText = await response.text();

    let data = null;

    try {
      data = responseText ? JSON.parse(responseText) : null;
    } catch {
      data = { error: "Invalid response from database." };
    }

    if (!response.ok) {
      return res.status(response.status).json({
        error:
          data?.message ||
          data?.error ||
          "Announcement request failed."
      });
    }

    return res.status(200).json(data);

  } catch (error) {
    return res.status(500).json({
      error: "Could not process announcement request."
    });
  }
}
