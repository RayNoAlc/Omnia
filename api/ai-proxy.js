export const config = {
  runtime: 'edge',
};

const GROQ_TEXT_MODEL = "openai/gpt-oss-20b";
const GROQ_VISION_MODEL = "llama-3.2-11b-vision-preview";
const GROQ_AUDIO_MODEL = "whisper-large-v3";

const GEMINI_MODELS = [
  "gemini-3.8-flash",
  "gemini-3.1-flash-lite",
  "gemini-flash-latest",
];

function jsonResponse(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function detectProvider(apiKey, explicitProvider) {
  if (explicitProvider === "gemini" || explicitProvider === "groq") {
    return explicitProvider;
  }
  if (!apiKey) return "gemini";
  if (apiKey.startsWith("AQ.") || apiKey.startsWith("AIza")) {
    return "gemini";
  }
  if (apiKey.startsWith("gsk_")) {
    return "groq";
  }
  return "gemini";
}

async function callGeminiApi(model, apiKey, payload) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;
  return await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-goog-api-key": apiKey,
    },
    body: JSON.stringify(payload),
  });
}

async function executeGeminiWithFallback(apiKey, payload, preferredModel) {
  const modelsToTry = [
    preferredModel || "gemini-3.8-flash",
    "gemini-3.1-flash-lite",
    "gemini-flash-latest",
  ].filter((m, idx, arr) => arr.indexOf(m) === idx);

  let lastErrorText = "";
  for (const m of modelsToTry) {
    try {
      const res = await callGeminiApi(m, apiKey, payload);
      if (res.ok) {
        const data = await res.json();
        return { ok: true, data, model: m };
      }
      const errText = await res.text();
      lastErrorText = `(${m}): ${errText}`;
      if (res.status === 503 || res.status === 429 || res.status === 404) {
        continue;
      }
      return { ok: false, error: lastErrorText, status: res.status };
    } catch (e) {
      lastErrorText = `(${m} erro de rede): ${e.message}`;
    }
  }
  return { ok: false, error: lastErrorText || "Todos os modelos Gemini falharam temporariamente.", status: 502 };
}

export default async function handler(req) {
  if (req.method === "OPTIONS") {
    return new Response("ok", { status: 200 });
  }

  let apiKey = null;
  let explicitProvider = null;
  try {
    const bodyClone = await req.clone().json();
    apiKey = bodyClone.customApiKey;
    explicitProvider = bodyClone.provider;
  } catch (e) {
    apiKey = null;
  }

  const provider = detectProvider(apiKey, explicitProvider);

  if (!apiKey) {
    if (provider === "gemini") {
      apiKey = process.env.GEMINI_API_KEY;
    } else {
      apiKey = process.env.GROQ_API_KEY;
    }
  }

  if (!apiKey) {
    return jsonResponse({ error: `Nenhuma chave de API configurada para o provedor ${provider}.` }, 500);
  }

  try {
    const body = await req.json();
    const mode = body.mode || "text";

    if (mode === "text") {
      const { system, message, messages: providedMessages, tools } = body;

      if (provider === "gemini") {
        let systemText = system || "";
        const rawContents = [];

        if (providedMessages && Array.isArray(providedMessages)) {
          for (let i = 0; i < providedMessages.length; i++) {
            const msg = providedMessages[i];
            if (msg.role === "system") {
              systemText += (systemText ? "\n\n" : "") + (msg.content || msg.text || "");
              continue;
            }

            if (msg.role === "user") {
              rawContents.push({
                role: "user",
                parts: [{ text: msg.content || msg.text || "" }],
              });
              continue;
            }

            if (msg.role === "assistant" || msg.role === "model") {
              const parts = [];
              const textContent = msg.content || msg.text;
              if (textContent) {
                parts.push({ text: textContent });
              }
              const calls = msg.tool_calls || msg.toolCalls || [];
              for (const call of calls) {
                let fnArgs = {};
                try {
                  fnArgs = typeof call.function.arguments === "string"
                    ? JSON.parse(call.function.arguments)
                    : (call.function.args || call.function.arguments || {});
                } catch {
                  fnArgs = {};
                }
                const callPart = {
                  functionCall: {
                    name: call.function.name,
                    args: fnArgs,
                  },
                };
                if (call.id) callPart.functionCall.id = call.id;
                if (call.thoughtSignature) callPart.thoughtSignature = call.thoughtSignature;
                parts.push(callPart);
              }
              if (parts.length > 0) {
                rawContents.push({ role: "model", parts });
              }
              continue;
            }

            if (msg.role === "tool") {
              let resData;
              try {
                resData = typeof msg.content === "string" ? JSON.parse(msg.content) : msg.content;
              } catch {
                resData = { result: msg.content };
              }
              if (typeof resData !== "object" || resData === null) {
                resData = { result: resData };
              }

              let fnName = msg.name;
              if (!fnName && msg.tool_call_id) {
                for (let j = i - 1; j >= 0; j--) {
                  const prevCalls = providedMessages[j]?.tool_calls || providedMessages[j]?.toolCalls || [];
                  const found = prevCalls.find(c => c.id === msg.tool_call_id);
                  if (found && found.function?.name) {
                    fnName = found.function.name;
                    break;
                  }
                }
              }
              if (!fnName) fnName = "execute_tool";

              rawContents.push({
                role: "user",
                parts: [{
                  functionResponse: {
                    name: fnName,
                    response: resData,
                  },
                }],
              });
              continue;
            }
          }
        } else {
          rawContents.push({
            role: "user",
            parts: [{ text: message || "" }],
          });
        }

        // Merge consecutive items with identical roles (alternation requirement)
        const contents = [];
        for (const item of rawContents) {
          if (contents.length > 0 && contents[contents.length - 1].role === item.role) {
            contents[contents.length - 1].parts.push(...item.parts);
          } else {
            contents.push(item);
          }
        }

        const geminiPayload = { contents };
        if (systemText && systemText.trim()) {
          geminiPayload.systemInstruction = {
            parts: [{ text: systemText.trim() }],
          };
        }

        if (tools && Array.isArray(tools) && tools.length > 0) {
          geminiPayload.tools = [{
            functionDeclarations: tools.map(t => {
              const fn = t.function || t;
              return {
                name: fn.name,
                description: fn.description || "",
                parameters: fn.parameters || {},
              };
            }),
          }];
        }

        if (body.json) {
          geminiPayload.generationConfig = { responseMimeType: "application/json" };
        }

        const geminiRes = await executeGeminiWithFallback(apiKey, geminiPayload, body.model);
        if (!geminiRes.ok) {
          return jsonResponse({ error: "Erro da API do Gemini (texto): " + geminiRes.error }, geminiRes.status || 502);
        }

        const candidate = geminiRes.data?.candidates?.[0];
        const parts = candidate?.content?.parts || [];
        const textParts = parts.filter(p => p.text).map(p => p.text).join("\n");
        const toolCallParts = parts.filter(p => p.functionCall);
        let toolCalls = null;
        if (toolCallParts.length > 0) {
          toolCalls = toolCallParts.map((p, idx) => ({
            id: p.functionCall.id || `call_${Date.now()}_${idx}`,
            type: "function",
            function: {
              name: p.functionCall.name,
              arguments: JSON.stringify(p.functionCall.args || {}),
            },
            thoughtSignature: p.thoughtSignature,
          }));
        }

        return jsonResponse({ text: textParts, toolCalls });
      }

      // Provedor Groq
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
      const defaultPrompt = "Transcreva e descreva todo o texto visível nesta imagem. Responda apenas com o conteúdo transcrito, em português.";

      if (provider === "gemini") {
        const geminiPayload = {
          contents: [
            {
              parts: [
                { text: prompt || defaultPrompt },
                {
                  inline_data: {
                    mime_type: mimeType || "image/jpeg",
                    data: image,
                  },
                },
              ],
            },
          ],
        };
        const geminiRes = await executeGeminiWithFallback(apiKey, geminiPayload, body.model);
        if (!geminiRes.ok) {
          return jsonResponse({ error: "Erro da API do Gemini (visão): " + geminiRes.error }, geminiRes.status || 502);
        }
        const text = geminiRes.data?.candidates?.[0]?.content?.parts?.filter(p => p.text).map(p => p.text).join("\n") || "";
        return jsonResponse({ text });
      }

      // Provedor Groq
      const dataUrl = `data:${mimeType || "image/jpeg"};base64,${image}`;
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

      if (provider === "gemini") {
        const geminiPayload = {
          contents: [
            {
              parts: [
                { text: "Transcreva este áudio em português com total fidelidade ao que foi falado. Responda estritamente com o texto transcrito, sem introduções ou explicações adicionais." },
                {
                  inline_data: {
                    mime_type: mimeType || "audio/webm",
                    data: audio,
                  },
                },
              ],
            },
          ],
        };
        const geminiRes = await executeGeminiWithFallback(apiKey, geminiPayload, body.model);
        if (!geminiRes.ok) {
          return jsonResponse({ error: "Erro da API do Gemini (áudio): " + geminiRes.error }, geminiRes.status || 502);
        }
        const text = geminiRes.data?.candidates?.[0]?.content?.parts?.filter(p => p.text).map(p => p.text).join("\n") || "";
        return jsonResponse({ text });
      }

      // Provedor Groq Whisper
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
