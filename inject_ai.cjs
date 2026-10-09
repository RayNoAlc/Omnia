const fs = require('fs');
let ai = fs.readFileSync('src/lib/aiHelpers.js', 'utf8');

const newHelper = `
export async function aiGenerateFlashcards(disciplina, textos) {
  const prompt = \`Você é um professor criando flashcards de memorização (curva de esquecimento).
Baseado no material fornecido da disciplina "\${disciplina}", crie de 5 a 8 flashcards diretos e curtos.
Responda ESTRITAMENTE em formato JSON (sem markdown, sem backticks, comece com [), como neste exemplo:
[
  {"frente": "Qual a principal causa da cárie?", "verso": "Bactéria Streptococcus mutans associada a carboidratos."}
]

Material:
\${textos}
\`;
  try {
    const resp = await callAIWithTools([{ role: "user", content: prompt }]);
    const jsonStr = resp.replace(/\`\`\`json/g, "").replace(/\`\`\`/g, "").trim();
    return JSON.parse(jsonStr);
  } catch (e) {
    console.error("Erro Flashcards:", e);
    return null;
  }
}
`;

ai = ai.replace(
  /export async function aiGenerateQuiz/,
  newHelper + '\nexport async function aiGenerateQuiz'
);

fs.writeFileSync('src/lib/aiHelpers.js', ai, 'utf8');
console.log("Injected aiGenerateFlashcards!");
