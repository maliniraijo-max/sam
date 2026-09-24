import OpenAI from "openai";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

function send(res, data, status = 200) {
  res.status(status);
  res.setHeader("Content-Type", "application/json");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.end(JSON.stringify(data));
}

function extractJson(text) {
  const s = String(text || "")
    .replace(/^\s*\`\`\`json\s*/i, "")
    .replace(/\s*\`\`\`\s*$/i, "")
    .trim();
  const a = s.indexOf("[");
  const b = s.lastIndexOf("]");
  return JSON.parse(a >= 0 && b >= 0 ? s.slice(a, b + 1) : s);
}

export default async function handler(req, res) {
  if (req.method === "OPTIONS") return send(res, { ok: true });
  if (req.method !== "POST") return send(res, { error: "Method not allowed." }, 405);

  try {
    if (!process.env.OPENAI_API_KEY) {
      return send(res, { error: "OPENAI_API_KEY is not configured on the server." }, 500);
    }

    const body =
      typeof req.body === "string"
        ? JSON.parse(req.body || "{}")
        : (req.body || {});

    if (body.action === "lesson") {
      const pages = Array.isArray(body.pages) ? body.pages : [];
      if (!pages.length) return send(res, { error: "No PDF pages were supplied." }, 400);

      const bundle = pages
        .map((p, i) => "PAGE " + (i + 1) + "\n" + String(p.text || "").slice(0, 12000))
        .join("\n\n---\n\n");

      const response = await client.responses.create({
        model: "gpt-5.6-luna",
        input: [
          {
            role: "developer",
            content:
              "Create accessible visual lessons for an 11-year-old learner with ADHD/ASD. Preserve factual meaning and never invent facts. Return ONLY valid JSON: an array with exactly one object per supplied page, in the same order. Each object must contain title, keyIdeas (3 concise factual bullets), discovery (one simple conceptual sentence), memory (short memorable phrase), and imagePrompt (a detailed prompt for an educational illustration). Keep language concrete, calm and child-friendly. The imagePrompt must describe the actual concept on that page, not a generic decorative picture. Prefer a clear textbook-style diagram or scene with important objects and relationships visible. Do not ask the image model to render lots of text or labels."
          },
          { role: "user", content: bundle }
        ]
      });

      let lessons;
      try {
        lessons = extractJson(response.output_text);
      } catch {
        return send(res, { error: "The AI returned an invalid lesson format." }, 502);
      }

      if (!Array.isArray(lessons) || lessons.length !== pages.length) {
        return send(res, { error: "The AI did not return one lesson for each PDF page." }, 502);
      }

      return send(res, { lessons });
    }

    if (body.action === "image") {
      const prompt = String(body.prompt || "").trim();
      if (!prompt) return send(res, { error: "No image prompt supplied." }, 400);

      const result = await client.images.generate({
        model: "gpt-image-2",
        prompt,
        size: "1024x1024"
      });

      const b64 = result?.data?.[0]?.b64_json;
      if (!b64) return send(res, { error: "The image model did not return an image." }, 502);

      return send(res, { image: "data:image/png;base64," + b64 });
    }

    return send(res, { error: "Unknown action." }, 400);
  } catch (error) {
    console.error(error);
    return send(res, { error: error?.message || "AI request failed." }, 500);
  }
}
