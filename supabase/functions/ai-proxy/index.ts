// Edge Function: ai-proxy
// Recebe do frontend um corpo com { mode, ... } e chama a API da Groq
// (compatível com o formato da OpenAI). A chave GROQ_API_KEY fica
// só aqui no servidor, nunca é exposta ao navegador.
//
// Modos suportados:
//   mode: "text"   → { system, message } OU { system, messages, tools? }
//                    (classificação, resumo, quiz, chat, Secretária com ações)
//   mode: "vision" → { image (base64), mimeType, prompt? }   (fotos, prints)
//   mode: "audio"  → { audio (base64), mimeType }            (transcrição de áudio)
//
// Configurar o segredo antes de fazer deploy:
//   supabase secrets set GROQ_API_KEY=sua-chave-groq-aqui
//
// Deploy:
//   supabase functions deploy ai-proxy

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Modelos atuais recomendados pela Groq (conferidos em console.groq.com/docs/models
// — a Groq aposenta modelos com frequência; se algum destes parar de funcionar,
// veja o substituto lá antes de mais nada).
const GROQ_TEXT_MODEL = "openai/gpt-oss-120b";
const GROQ_VISION_MODEL = "qwen/qwen3.6-27b";
const GROQ_AUDIO_MODEL = "whisper-large-v3";

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const apiKey = Deno.env.get("GROQ_API_KEY");
  if (!apiKey) {
    return jsonResponse({ error: "GROQ_API_KEY não configurada nos secrets do Supabase." }, 500);
  }

  try {
    const body = await req.json();
    const mode = body.mode || "text";

    /* ---------------- TEXTO (classificação, resumo, quiz, Modo Professor, chat, ações) ---------------- */
    if (mode === "text") {
      const { system, message, messages: providedMessages, tools } = body;
      const chatMessages = [
        { role: "system", content: system },
        ...(providedMessages || [{ role: "user", content: message }]),
      ];

      const payload: Record<string, unknown> = {
        model: GROQ_TEXT_MODEL,
        max_tokens: 1200,
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

    /* ---------------- VISÃO (foto / print) ---------------- */
    if (mode === "vision") {
      const { image, mimeType, prompt } = body;
      const dataUrl = `data:${mimeType || "image/jpeg"};base64,${image}`;
      const defaultPrompt =
        "Transcreva e descreva todo o texto e conteúdo visível nesta imagem (por exemplo um slide, uma anotação ou um quadro), como se fosse para um estudante organizar o material em suas próprias anotações. Responda apenas com o conteúdo transcrito/descrito, em português do Brasil, sem comentários extras.";

      const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
        body: JSON.stringify({
          model: GROQ_VISION_MODEL,
          max_tokens: 1200,
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

    /* ---------------- ÁUDIO (transcrição) ---------------- */
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
        headers: { Authorization: `Bearer ${apiKey}` }, // sem Content-Type: o fetch define o boundary do multipart sozinho
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
});
