import { callAI } from "./ai";
import { todayISO } from "./utils";

// Limite de segurança pro texto do material: a Groq tem teto de 8.000
// tokens por pedido no plano gratuito. ~6.000 caracteres fica bem
// abaixo disso mesmo somando as instruções do prompt.
const LIMITE_TEXTO_MATERIAL = 6000;
function truncarMaterial(texto) {
  if (!texto || texto.length <= LIMITE_TEXTO_MATERIAL) return texto;
  return texto.slice(0, LIMITE_TEXTO_MATERIAL) + "\n\n(texto truncado — o material original é maior que isso)";
}

export async function classifyInboxText(text, disciplinasConhecidas) {
  let processableText = text || "";
  
  if (processableText.length > 12000) {
    const chunkLimit = 12000;
    const chunks = [];
    for (let i = 0; i < processableText.length; i += chunkLimit) {
      chunks.push(processableText.slice(i, i + chunkLimit));
    }
    
    let combinedSummary = "";
    const maxChunks = Math.min(chunks.length, 6);
    for (let i = 0; i < maxChunks; i++) {
      const sysSum = 'Você é um sumarizador especialista acadêmico/universitário. Extraia os principais fatos, conceitos, datas, prazos e compromissos deste trecho do material. Mantenha as datas e disciplinas exatas intactas. Responda apenas com o resumo.';
      const chunkRes = await callAI(sysSum, chunks[i]);
      combinedSummary += chunkRes + '\n\n';
    }
    
    if (chunks.length > maxChunks) {
      combinedSummary += '\n[Nota: O documento era muito extenso. Apenas as páginas iniciais/centrais foram lidas.]';
    }
    processableText = combinedSummary;
  }

  const sys = `Você é o motor de classificação de um assistente de vida universitário para estudantes acadêmico/universitário.
Hoje é ${todayISO()} (formato AAAA-MM-DD).
Disciplinas já conhecidas do usuário: ${disciplinasConhecidas.join(", ") || "nenhuma ainda"}.
Analise o texto enviado e responda APENAS com um objeto JSON válido, sem markdown e sem texto antes ou depois, no formato exato:
{
  "tipo": "prova" | "trabalho" | "aula" | "entrega" | "seminario" | "outro",
  "disciplina": string curto,
  "assunto": string curto,
  "prazo": "AAAA-MM-DD" ou null,
  "prioridade": "critico" | "importante" | "normal" | "baixa",
  "resumo": "Uma análise detalhada e resumo completo de todo o material enviado (em markdown, com tópicos e explicações claras). Não economize palavras aqui.",
  "incerto": array de strings com os nomes dos campos em que você não tem certeza (vazio se tudo estiver claro)
}
Converta prazos relativos em data absoluta. Se não conseguir determinar um campo com confiança, deixe-o com um valor plausível mas inclua o nome dele em "incerto". Não invente uma disciplina.`;
  return await callAI(sys, processableText, { json: true });
}

export async function aiGenerateSummary(disciplina, sourceTexts) {
  const sys = `Você é um assistente de estudos acadêmico/universitário. Gere um resumo em português do Brasil, claro e direto, sobre a disciplina "${disciplina}", usando como base o material fornecido pelo usuário. Estruture em tópicos curtos com marcadores. Responda apenas com o resumo, sem introduções do tipo "aqui está".`;
  const texto = truncarMaterial(sourceTexts);
  const user =
    texto && texto.trim()
      ? texto
      : `(Nenhuma anotação registrada ainda para ${disciplina}. Gere um resumo genérico dos tópicos centrais mais prováveis dessa disciplina em um curso acadêmico/universitário, deixando claro no início que é um ponto de partida a ser editado pelo aluno.)`;
  return await callAI(sys, user);
}


export async function aiGenerateFlashcards(disciplina, textos) {
  const prompt = `Você é um professor criando flashcards de memorização (curva de esquecimento).
Baseado no material fornecido da disciplina "${disciplina}", crie de 5 a 8 flashcards diretos e curtos.
Responda ESTRITAMENTE em formato JSON (sem markdown, sem backticks, comece com [), como neste exemplo:
[
  {"frente": "Qual a principal causa da cárie?", "verso": "Bactéria Streptococcus mutans associada a carboidratos."}
]

Material:
${textos}
`;
  try {
    const resp = await callAIWithTools([{ role: "user", content: prompt }]);
    const jsonStr = resp.replace(/```json/g, "").replace(/```/g, "").trim();
    return JSON.parse(jsonStr);
  } catch (e) {
    console.error("Erro Flashcards:", e);
    return null;
  }
}

export async function aiGenerateQuiz(disciplina, sourceTexts, tipo = "multipla") {
  const texto = truncarMaterial(sourceTexts);
  const user =
    texto && texto.trim()
      ? texto
      : `(Sem anotações registradas para ${disciplina} ainda — gere conteúdo introdutório geral da disciplina.)`;

  let sys;
  if (tipo === "vf") {
    sys = `Você é um gerador de questões de Verdadeiro/Falso acadêmico. Com base no material sobre "${disciplina}", crie exatamente 5 afirmações em português do Brasil, misturando verdadeiras e falsas (não deixe todas com o mesmo valor). Responda APENAS com um array JSON, sem markdown, no formato exato:
[{"afirmacao": string, "correta": boolean, "explicacao": string curta}]`;
  } else if (tipo === "discursiva") {
    sys = `Você é um gerador de questões discursivas acadêmico. Com base no material sobre "${disciplina}", crie exatamente 4 perguntas abertas em português do Brasil que exigem uma resposta redigida. Responda APENAS com um array JSON, sem markdown, no formato exato:
[{"pergunta": string, "respostaModelo": string com uma resposta modelo completa e bem explicada}]`;
  } else if (tipo === "flashcard") {
    sys = `Você é um gerador de flashcards de estudo acadêmico. Com base no material sobre "${disciplina}", crie exatamente 8 flashcards em português do Brasil (frente = termo ou pergunta curta, verso = definição ou resposta curta e direta). Responda APENAS com um array JSON, sem markdown, no formato exato:
[{"frente": string, "verso": string}]`;
  } else {
    sys = `Você é um gerador de questões de estudo acadêmico. Com base no material fornecido sobre "${disciplina}", crie exatamente 5 questões de múltipla escolha em português do Brasil. Responda APENAS com um array JSON, sem markdown e sem texto antes ou depois, no formato exato:
[{"pergunta": string, "opcoes": [string, string, string, string], "respostaCorreta": number (índice de 0 a 3), "explicacao": string curta}]
As opções erradas devem ser plausíveis, não óbvias. Baseie-se no material fornecido; se ele for insuficiente, use conhecimento geral da área e diga isso na explicação.`;
  }

  const result = await callAI(sys, user, { json: true });
  return Array.isArray(result) ? result : [];
}

export async function aiEvaluateProfessor(disciplina, sourceTexts, userAnswer) {
  const texto = truncarMaterial(sourceTexts);
  const sys = `Você está no "Modo Professor" de um assistente de estudos acadêmico/universitário, avaliando a explicação de um aluno sobre "${disciplina}".
Material de referência do aluno (pode estar vazio): ${
    texto && texto.trim() ? texto : "(nenhum material de referência registrado — avalie com base em conhecimento geral da área)"
  }
Avalie a explicação quanto a precisão, completude e compreensão. Responda APENAS com um objeto JSON, sem markdown, no formato exato:
{"nota": number de 0 a 10 (uma casa decimal), "pontosCorretos": [string, ...], "faltando": [string, ...], "feedback": string curto e direto}
Seja honesto mas construtivo — não infle a nota.`;
  return await callAI(sys, userAnswer, { json: true });
}




export async function aiParseSyllabus(disciplina, sourceTexts) {
  let texto = sourceTexts || "";
  if (texto.length > 20000) texto = texto.slice(0, 20000) + "..."; // O Syllabus pode ser grande, mas não gigante
  const sys = "Você é um assistente de estudos. O usuário forneceu o plano de ensino (Syllabus/Ementa) da disciplina " + disciplina + ".\n" +
  "Sua tarefa é extrair todas as datas importantes (provas, trabalhos, seminários, exercícios, entregas) e retornar estritamente um JSON.\n" +
  "O formato DEVE ser um objeto JSON com uma chave 'eventos', que contém um array de objetos.\n" +
  "Cada objeto dentro de 'eventos' tem:\n" +
  "- tipo: string, deve ser exatamente um destes: 'prova', 'trabalho', 'leitura', 'exercicio', 'aula', 'outro'.\n" +
  "- assunto: string curta resumindo o compromisso.\n" +
  "- prazo: string no formato YYYY-MM-DD. Se a data estiver no formato brasileiro (DD/MM), deduza o ano atual.\n" +
  "Exemplo: { \"eventos\": [ { \"tipo\": \"prova\", \"assunto\": \"P1\", \"prazo\": \"2024-11-06\" } ] }.\n" +
  "Retorne SOMENTE o JSON válido e mais nada.";

  try {
    const res = await callAI(sys, "Syllabus:\n" + texto, { json: true });
    
    let arr = [];
    if (Array.isArray(res)) arr = res;
    else if (res && Array.isArray(res.eventos)) arr = res.eventos;
    else if (res && Array.isArray(res.datas)) arr = res.datas;

    if (!arr || arr.length === 0) {
      console.warn("IA retornou objeto vazio ou mal formatado:", res);
      return [];
    }
    
    return arr.map(a => ({
      ...a,
      id: "syllabus-" + Math.random().toString(36).substring(2, 9),
      disciplina: disciplina,
      concluido: false,
      timestamp: Date.now()
    }));
  } catch (e) {
    console.error("Erro no aiParseSyllabus:", e);
    throw new Error("Falha ao analisar o plano de ensino com a IA. " + e.message);
  }
}

