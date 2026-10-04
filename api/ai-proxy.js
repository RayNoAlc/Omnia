export const config = {
  runtime: 'edge',
};

const GROQ_TEXT_MODEL = "openai/gpt-oss-20b";
const GROQ_VISION_MODEL = "llama-3.2-11b-vision-preview";
const GROQ_AUDIO_MODEL = "whisper-large-v3";

function jsonResponse(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

export default async function handler(req) {
  if (req.method === "OPTIONS") {
    return new Response("ok", { status: 200 });
  }

  try {
    const bodyClone = await req.clone().json();
    var apiKey = bodyClone.customApiKey;
  } catch(e) {
    var apiKey = null;
  }
  
  if (!apiKey) {
    return jsonResponse({ error: "GROQ_API_KEY não configurada no Vercel." }, 500);
  }

  try {
    const body = await req.json();
    const mode = body.mode || "text";

    if (mode === "text") {
      const { system, message, messages: providedMessages, tools } = body;
      const chatMessages = [
        { role: "system", content: system },
        ...(providedMessages || [{ role: "user", content: message }]),
      ];

      const payload = {
        model: GROQ_TEXT_MODEL,
        max_tokens: 8192,
        messages: chatMessages,
      };
      if (tools) {
        payload.tools = tools;
        payload.tool_choice = "auto";
      }

      const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        return jsonResponse({ error: "Erro da API da Groq (texto): " + (await res.text()) }, 502);
      }
      const data = await res.json();
      const msg = data.choices?.[0]?.message || {};
      return jsonResponse({ text: msg.content || "", toolCalls: msg.tool_calls || null });
    }

    if (mode === "vision") {
      const { image, mimeType, prompt } = body;
      const dataUrl = `data:${mimeType || "image/jpeg"};base64,${image}`;
      const defaultPrompt = "Transcreva e descreva todo o texto visível nesta imagem. Responda apenas com o conteúdo transcrito, em português.";

      const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
        body: JSON.stringify({
          model: GROQ_VISION_MODEL,
          max_tokens: 8192,
          messages: [
            {
              role: "user",
              content: [
                { type: "text", text: prompt || defaultPrompt },
                { type: "image_url", image_url: { url: dataUrl } },
              ],
            },
          ],
        }),
      });
      if (!res.ok) {
        return jsonResponse({ error: "Erro da API da Groq (visão): " + (await res.text()) }, 502);
      }
      const data = await res.json();
      const text = data.choices?.[0]?.message?.content || "";
      return jsonResponse({ text });
    }

    if (mode === "audio") {
      const { audio, mimeType } = body;
      const bytes = Uint8Array.from(atob(audio), (c) => c.charCodeAt(0));
      const blob = new Blob([bytes], { type: mimeType || "audio/webm" });

      const form = new FormData();
      form.append("file", blob, "audio.webm");
      form.append("model", GROQ_AUDIO_MODEL);
      form.append("language", "pt");
      form.append("response_format", "json");

      const res = await fetch("https://api.groq.com/openai/v1/audio/transcriptions", {
        method: "POST",
        headers: { Authorization: `Bearer ${apiKey}` },
        body: form,
      });
      if (!res.ok) {
        return jsonResponse({ error: "Erro da API da Groq (áudio): " + (await res.text()) }, 502);
      }
      const data = await res.json();
      return jsonResponse({ text: data.text || "" });
    }

    return jsonResponse({ error: `Modo desconhecido: ${mode}` }, 400);
  } catch (e) {
    return jsonResponse({ error: String(e) }, 500);
  }
}
