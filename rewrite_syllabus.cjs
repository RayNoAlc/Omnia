const fs = require('fs');
let ai = fs.readFileSync('src/lib/aiHelpers.js', 'utf8');

// remove everything after aiEvaluateProfessor
const idx = ai.indexOf('export async function aiParseSyllabus');
if (idx !== -1) {
  ai = ai.substring(0, idx);
}

const parseSyllabusFn = `
export async function aiParseSyllabus(disciplina, sourceTexts) {
  const texto = truncarMaterial(sourceTexts, 40000);
  const sys = "Você é um assistente de estudos. O usuário forneceu o plano de ensino (Syllabus/Ementa) da disciplina " + disciplina + ".\\n" +
"Sua tarefa é extrair todas as datas importantes (provas, trabalhos, seminários, exercícios, entregas) e retornar estritamente um JSON array.\\n" +
"O formato DEVE ser um array de objetos JSON válidos, onde cada objeto tem:\\n" +
"- tipo: string, deve ser exatamente um destes: 'prova', 'trabalho', 'leitura', 'exercicio', 'aula', 'outro'.\\n" +
"- assunto: string curta resumindo o compromisso.\\n" +
"- prazo: string no formato YYYY-MM-DD. Se a data estiver no formato brasileiro (DD/MM), deduza o ano atual.\\n" +
"Retorne SOMENTE o array JSON, sem markdown e sem crases de formatação.";

  const response = await callAIWithTools([
    { role: "system", content: sys },
    { role: "user", content: "Syllabus:\\n" + texto }
  ]);
  
  try {
    let raw = response.content.trim();
    if (raw.startsWith('\`\`\`json')) raw = raw.substring(7);
    if (raw.startsWith('\`\`\`')) raw = raw.substring(3);
    if (raw.endsWith('\`\`\`')) raw = raw.substring(0, raw.length - 3);
    const arr = JSON.parse(raw);
    if (!Array.isArray(arr)) throw new Error("A IA nǜo retornou um array.");
    return arr;
  } catch (e) {
    console.error("Falha ao fazer parse do Syllabus:", e);
    throw new Error("A IA nǜo conseguiu encontrar datas formatadas corretamente no material.");
  }
}
`;

ai = ai + '\n' + parseSyllabusFn;
fs.writeFileSync('src/lib/aiHelpers.js', ai, 'utf8');
