import { supabase } from "./supabaseClient";

function getCustomApiKey() {
  try {
    const cfg = JSON.parse(localStorage.getItem('omnia_config') || '{}');
    return cfg.groqApiKey || null;
  } catch (e) {
    return null;
  }
}

async function invokeAiProxy(body) {
  const customKey = getCustomApiKey();
  if (!customKey || customKey.trim() === '') {
    throw new Error("⚠️ IA Desativada: Nenhuma chave de API configurada! Por favor, vá até a aba Configurações e cadastre sua chave da Groq para utilizar a IA.");
  }
  body.customApiKey = customKey;

  const res = await fetch("/api/ai-proxy", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error("Falha na chamada à IA: " + (data.error || "Erro desconhecido"));
  }
  if (data?.error) throw new Error(data.error);
  return data;
}

/**
 * Chamada de texto (classificação, resumo, quiz, Modo Professor, chat).
 * Chama a Edge Function "ai-proxy", que por sua vez chama a API da
 * Groq usando uma chave secreta guardada no servidor (nunca no
 * navegador). Veja supabase/functions/ai-proxy/index.ts.
 */
export async function callAI(systemPrompt, userText, { json = false } = {}) {
  const data = await invokeAiProxy({ mode: "text", system: systemPrompt, message: userText });
  const text = data?.text || "";
  if (json) {
    const cleaned = text.replace(/```json|```/g, "").trim();
    return JSON.parse(cleaned);
  }
  return text;
}

/**
 * Chamada de texto com suporte a "tool calling": a IA pode devolver
 * uma lista de ferramentas para executar em vez de (ou além de) texto.
 * Usada pela Secretária para agir sobre a rotina. Devolve
 * { text, toolCalls } — toolCalls é null quando a IA só respondeu texto.
 */
export async function callAIWithTools(systemPrompt, messages, tools) {
  return await invokeAiProxy({ mode: "text", system: systemPrompt, messages, tools });
}

/**
 * Envia uma imagem (base64, sem o prefixo "data:...") para o modelo
 * de visão da Groq e devolve o texto transcrito/descrito.
 */
export async function callVision(imageBase64, mimeType, prompt) {
  const data = await invokeAiProxy({ mode: "vision", image: imageBase64, mimeType, prompt });
  return data?.text || "";
}

/**
 * Envia um áudio (base64) para transcrição via Whisper na Groq.
 */
export async function callAudioTranscription(audioBase64, mimeType) {
  const data = await invokeAiProxy({ mode: "audio", audio: audioBase64, mimeType });
  return data?.text || "";
}
