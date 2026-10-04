const fs = require('fs');

// 1. aiHelpers.js
let ai = fs.readFileSync('src/lib/aiHelpers.js', 'utf8');

const parseSyllabusFn = `
export async function aiParseSyllabus(disciplina, sourceTexts) {
  const texto = truncarMaterial(sourceTexts, 40000); // Allow more text for syllabus
  const sys = \`Você é um assistente de estudos. O usuário forneceu o plano de ensino (Syllabus/Ementa) da disciplina "\${disciplina}".
Sua tarefa é extrair todas as datas importantes (provas, trabalhos, seminários, exercícios, entregas) e retornar estritamente um JSON array.
O formato DEVE ser um array de objetos JSON válidos, onde cada objeto tem:
- "tipo": string, deve ser exatamente um destes: "prova", "trabalho", "leitura", "exercicio", "aula", "outro".
- "assunto": string curta resumindo o compromisso.
- "prazo": string no formato YYYY-MM-DD. Se a data estiver no formato brasileiro (DD/MM), deduza o ano atual (provavelmente o ano base do documento ou o ano atual). Se não conseguir deduzir a data exata, retorne a melhor estimativa YYYY-MM-DD.

Retorne SOMENTE o array JSON (ex: [{"tipo":"prova","assunto":"P1","prazo":"2023-05-10"}]). Não inclua blocos de código markdown (\`\`\`json) nem texto introdutório.\`;

  const response = await callAIWithTools([
    { role: "system", content: sys },
    { role: "user", content: "Syllabus:\\n" + texto }
  ]);
  
  try {
    let raw = response.content.trim();
    if (raw.startsWith('\`\`\`json')) raw = raw.replace(/\`\`\`json/g, '').replace(/\`\`\`/g, '').trim();
    if (raw.startsWith('\`\`\`')) raw = raw.replace(/\`\`\`/g, '').trim();
    const arr = JSON.parse(raw);
    if (!Array.isArray(arr)) throw new Error("A IA não retornou um array.");
    return arr;
  } catch (e) {
    console.error("Falha ao fazer parse do Syllabus:", e, "\\nResponse:", response.content);
    throw new Error("A IA não conseguiu encontrar datas formatadas corretamente no material.");
  }
}
`;

ai = ai + '\n' + parseSyllabusFn;
fs.writeFileSync('src/lib/aiHelpers.js', ai, 'utf8');

// 2. Tabs.jsx
let tabs = fs.readFileSync('src/components/Tabs.jsx', 'utf8');

// Add aiParseSyllabus to imports
tabs = tabs.replace(
  'import { aiGenerateSummary, aiGenerateQuiz, aiEvaluateProfessor } from "../lib/aiHelpers";',
  'import { aiGenerateSummary, aiGenerateQuiz, aiEvaluateProfessor, aiParseSyllabus } from "../lib/aiHelpers";'
);

// Add state to BibliotecaTab
tabs = tabs.replace(
  'const [profAnswer, setProfAnswer] = useState("");',
  'const [profAnswer, setProfAnswer] = useState("");\n  const [syllabusLoading, setSyllabusLoading] = useState(false);\n  const [syllabusCount, setSyllabusCount] = useState(null);'
);

// Add extract function to BibliotecaTab
const extractSyllabusFn = `
  async function handleSyllabus(disc, textos) {
    setSyllabusLoading(true);
    setSyllabusCount(null);
    try {
      const items = await aiParseSyllabus(disc, textos);
      if (items && items.length > 0) {
        for (const item of items) {
          const c = await addCommitment(userId, {
            tipo: item.tipo,
            disciplina: disc,
            assunto: item.assunto,
            prazo: item.prazo,
            concluido: false
          });
          if (setCommitments) setCommitments(prev => [...prev, c]);
        }
        setSyllabusCount(items.length);
        setTimeout(() => setSyllabusCount(null), 5000);
      } else {
        alert("A IA não encontrou nenhuma data importante neste arquivo.");
      }
    } catch(e) {
      alert(e.message);
    } finally {
      setSyllabusLoading(false);
    }
  }
`;

tabs = tabs.replace(
  'async function openResumo() {',
  extractSyllabusFn + '\n  async function openResumo() {'
);

// Add Syllabus button to the UI
tabs = tabs.replace(
  '<button onClick={openProfessor} className="text-xs px-2 py-1 rounded" style={{ color: T.brand, border: `1px solid ${T.border}` }}>Modo Professor</button>',
  '<button onClick={openProfessor} className="text-xs px-2 py-1 rounded" style={{ color: T.brand, border: `1px solid ${T.border}` }}>Modo Professor</button>\n            <button onClick={() => handleSyllabus(disc, sourceTexts)} disabled={syllabusLoading} className="text-xs px-2 py-1 rounded flex items-center gap-1 transition-transform hover:scale-105" style={{ color: "#ffffff", backgroundColor: T.brand, border: `1px solid ${T.brand}` }}>{syllabusLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />} Analisar Syllabus</button>'
);

// Add success message
tabs = tabs.replace(
  '          <div className="flex gap-1">',
  '          {syllabusCount !== null && <span className="text-xs" style={{ color: T.brand }}>{syllabusCount} datas importadas para a Agenda!</span>}\n          <div className="flex gap-1 flex-wrap">'
);

fs.writeFileSync('src/components/Tabs.jsx', tabs, 'utf8');

console.log("Syllabus logic added.");
