import crypto from "node:crypto";

function json(res, data, status = 200) {
  res.status(status);
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(data));
}

function validSignature(req, rawBody) {
  const secret = process.env.WHATSAPP_APP_SECRET;
  if (!secret) return false;
  const signature = String(req.headers["x-hub-signature-256"] || "");
  if (!signature.startsWith("sha256=")) return false;
  const expected = "sha256=" + crypto.createHmac("sha256", secret).update(rawBody).digest("hex");
  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

async function supabase(path, options = {}) {
  const base = String(process.env.SUPABASE_URL || "").replace(/\/$/, "");
  const response = await fetch(base + "/rest/v1/" + path, {
    ...options,
    headers: {
      "apikey": process.env.SUPABASE_SECRET_KEY,
      "Authorization": "Bearer " + process.env.SUPABASE_SECRET_KEY,
      "Content-Type": "application/json",
      "Prefer": "return=minimal",
      ...(options.headers || {})
    }
  });
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data?.message || "Supabase write failed.");
  }
}

function identify(number) {
  const n = String(number || "").replace(/\D/g, "");
  const mum = String(process.env.WHATSAPP_MUM_NUMBER || "").replace(/\D/g, "");
  const dad = String(process.env.WHATSAPP_DAD_NUMBER || "").replace(/\D/g, "");
  if (n && mum && n === mum) return "mum";
  if (n && dad && n === dad) return "dad";
  return null;
}

function extractMessages(body) {
  const output = [];
  for (const entry of body?.entry || []) {
    for (const change of entry?.changes || []) {
      const value = change?.value || {};
      for (const message of value.messages || []) {
        const sender = identify(message.from);
        if (!sender) continue;

        let text = "";
        let kind = message.type || "unknown";
        let mediaUrl = null;

        if (message.type === "text") text = message.text?.body || "";
        else if (message.type === "image") text = message.image?.caption || "📷 Image from WhatsApp";
        else if (message.type === "video") text = message.video?.caption || "🎬 Video from WhatsApp";
        else if (message.type === "audio") text = "🎤 Voice message from WhatsApp";
        else if (message.type === "sticker") text = "✨ Sticker from WhatsApp";
        else if (message.type === "document") text = message.document?.filename || "📎 Document from WhatsApp";
        else if (message.type === "location") text = "📍 Location from WhatsApp";
        else text = "📨 " + kind + " message from WhatsApp";

        output.push({
          sender,
          kind,
          body: text,
          media_url: mediaUrl,
          whatsapp_message_id: message.id || null,
          created_at: message.timestamp ? new Date(Number(message.timestamp) * 1000).toISOString() : new Date().toISOString()
        });
      }
    }
  }
  return output;
}

export default async function handler(req, res) {
  if (req.method === "GET") {
    const mode = req.query?.["hub.mode"];
    const token = req.query?.["hub.verify_token"];
    const challenge = req.query?.["hub.challenge"];
    if (mode === "subscribe" && token && token === process.env.WHATSAPP_VERIFY_TOKEN) {
      return res.status(200).send(challenge);
    }
    return json(res, { error: "Webhook verification failed." }, 403);
  }

  if (req.method !== "POST") return json(res, { error: "Method not allowed." }, 405);

  try {
    const raw = typeof req.body === "string" ? req.body : JSON.stringify(req.body || {});
    if (!validSignature(req, raw)) return json(res, { error: "Invalid webhook signature." }, 401);
    const body = typeof req.body === "string" ? JSON.parse(req.body) : (req.body || {});
    const messages = extractMessages(body);

    if (messages.length && process.env.SUPABASE_URL && process.env.SUPABASE_SECRET_KEY) {
      await supabase("family_messages", { method: "POST", body: JSON.stringify(messages) });
    }
    return json(res, { received: true });
  } catch (error) {
    console.error("WHATSAPP_WEBHOOK", error);
    return json(res, { error: error?.message || "Webhook processing failed." }, 500);
  }
}