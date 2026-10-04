const fs = require('fs');
let code = fs.readFileSync('src/lib/aiHelpers.js', 'utf8');

const newParse = `export async function aiParseSyllabus(disciplina, sourceTexts) {
  let texto = sourceTexts || "";
  if (texto.length > 20000) texto = texto.slice(0, 20000) + "..."; // O Syllabus pode ser grande, mas não gigante
  const sys = "Você é um assistente de estudos. O usuário forneceu o plano de ensino (Syllabus/Ementa) da disciplina " + disciplina + ".\\n" +
  "Sua tarefa é extrair todas as datas importantes (provas, trabalhos, seminários, exercícios, entregas) e retornar estritamente um JSON array.\\n" +
  "O formato DEVE ser um array de objetos JSON válidos, onde cada objeto tem:\\n" +
  "- tipo: string, deve ser exatamente um destes: 'prova', 'trabalho', 'leitura', 'exercicio', 'aula', 'outro'.\\n" +
  "- assunto: string curta resumindo o compromisso.\\n" +
  "- prazo: string no formato YYYY-MM-DD. Se a data estiver no formato brasileiro (DD/MM), deduza o ano atual.\\n" +
  "Retorne SOMENTE o array JSON.";

  try {
    const arr = await callAI(sys, "Syllabus:\\n" + texto, { json: true });
    if (!Array.isArray(arr)) return [];
    
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
}`;

code = code.replace(/export async function aiParseSyllabus[\s\S]*?\}\s*catch\s*\(\w*\)\s*\{\s*return\s*\[\];\s*\}\s*\}/, newParse);

fs.writeFileSync('src/lib/aiHelpers.js', code, 'utf8');
