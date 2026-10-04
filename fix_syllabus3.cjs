const fs = require('fs');
let code = fs.readFileSync('src/lib/aiHelpers.js', 'utf8');

const newParse = `export async function aiParseSyllabus(disciplina, sourceTexts) {
  let texto = sourceTexts || "";
  if (texto.length > 20000) texto = texto.slice(0, 20000) + "..."; // O Syllabus pode ser grande, mas não gigante
  const sys = "Você é um assistente de estudos. O usuário forneceu o plano de ensino (Syllabus/Ementa) da disciplina " + disciplina + ".\\n" +
  "Sua tarefa é extrair todas as datas importantes (provas, trabalhos, seminários, exercícios, entregas) e retornar estritamente um JSON.\\n" +
  "O formato DEVE ser um objeto JSON com uma chave 'eventos', que contém um array de objetos.\\n" +
  "Cada objeto dentro de 'eventos' tem:\\n" +
  "- tipo: string, deve ser exatamente um destes: 'prova', 'trabalho', 'leitura', 'exercicio', 'aula', 'outro'.\\n" +
  "- assunto: string curta resumindo o compromisso.\\n" +
  "- prazo: string no formato YYYY-MM-DD. Se a data estiver no formato brasileiro (DD/MM), deduza o ano atual.\\n" +
  "Exemplo: { \\"eventos\\": [ { \\"tipo\\": \\"prova\\", \\"assunto\\": \\"P1\\", \\"prazo\\": \\"2024-11-06\\" } ] }.\\n" +
  "Retorne SOMENTE o JSON válido e mais nada.";

  try {
    const res = await callAI(sys, "Syllabus:\\n" + texto, { json: true });
    
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

`;

const startIndex = code.indexOf('export async function aiParseSyllabus(disciplina, sourceTexts) {');
const nextFunctionIndex = code.indexOf('export async function ', startIndex + 10);
const endIndex = nextFunctionIndex === -1 ? code.length : nextFunctionIndex;

code = code.substring(0, startIndex) + newParse + code.substring(endIndex);

fs.writeFileSync('src/lib/aiHelpers.js', code, 'utf8');
