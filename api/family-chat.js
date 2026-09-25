function json(res, data, status = 200) {
  res.status(status);
  res.setHeader("Content-Type", "application/json");
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, X-Family-Pin");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.end(JSON.stringify(data));
}

function configured() {
  return Boolean(
    process.env.FAMILY_CHAT_PIN &&
    process.env.SUPABASE_URL &&
    process.env.SUPABASE_SECRET_KEY &&
    process.env.WHATSAPP_PHONE_NUMBER_ID &&
    process.env.WHATSAPP_ACCESS_TOKEN &&
    process.env.WHATSAPP_MUM_NUMBER &&
    process.env.WHATSAPP_DAD_NUMBER
  );
}

function authorized(req) {
  const supplied = req.headers["x-family-pin"] || "";
  return Boolean(process.env.FAMILY_CHAT_PIN && supplied === process.env.FAMILY_CHAT_PIN);
}

async function supabase(path, options = {}) {
  const base = String(process.env.SUPABASE_URL || "").replace(/\/$/, "");
  const response = await fetch(base + "/rest/v1/" + path, {
    ...options,
    headers: {
      "apikey": process.env.SUPABASE_SECRET_KEY,
      "Authorization": "Bearer " + process.env.SUPABASE_SECRET_KEY,
      "Content-Type": "application/json",
      "Prefer": "return=representation",
      ...(options.headers || {})
    }
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data?.message || data?.hint || "Family message database request failed.");
  return data;
}

async function sendWhatsApp(to, body) {
  const version = process.env.WHATSAPP_API_VERSION || "v23.0";
  const url = "https://graph.facebook.com/" + version + "/" + process.env.WHATSAPP_PHONE_NUMBER_ID + "/messages";
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Authorization": "Bearer " + process.env.WHATSAPP_ACCESS_TOKEN,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to,
      type: "text",
      text: { preview_url: false, body }
    })
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data?.error?.message || "WhatsApp send failed.");
  return data;
}

export default async function handler(req, res) {
  if (req.method === "OPTIONS") return json(res, { ok: true });
  if (!authorized(req)) return json(res, { error: "Family PIN required." }, 401);
  if (!configured()) return json(res, {
    error: "Family chat is not connected yet.",
    configured: false
  }, 503);

  try {
    if (req.method === "GET") {
      const data = await supabase("family_messages?select=id,sender,kind,body,media_url,created_at&order=created_at.asc&limit=300");
      return json(res, { configured: true, messages: data });
    }

    if (req.method === "POST") {
      const body = String(req.body?.body || "").trim();
      if (!body) return json(res, { error: "Message is empty." }, 400);
      if (body.length > 2000) return json(res, { error: "Message is too long." }, 400);

      const recipients = [process.env.WHATSAPP_MUM_NUMBER, process.env.WHATSAPP_DAD_NUMBER];
      const results = await Promise.allSettled(recipients.map(to => sendWhatsApp(to, body)));
      const failed = results.filter(x => x.status === "rejected");
      if (failed.length === results.length) return json(res, { error: failed[0].reason?.message || "WhatsApp could not send the message." }, 502);

      const sentIds = results.filter(x => x.status === "fulfilled").map(x => x.value?.messages?.[0]?.id).filter(Boolean);
      const saved = await supabase("family_messages", {
        method: "POST",
        body: JSON.stringify({
          sender: "sam",
          kind: "text",
          body,
          whatsapp_message_id: sentIds[0] || null
        })
      });
      return json(res, { ok: true, message: saved?.[0] || null, partial: failed.length > 0 });
    }

    return json(res, { error: "Method not allowed." }, 405);
  } catch (error) {
    console.error("FAMILY_CHAT", error);
    return json(res, { error: error?.message || "Family chat failed." }, 500);
  }
}