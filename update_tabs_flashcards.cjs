const fs = require('fs');
let tabs = fs.readFileSync('src/components/Tabs.jsx', 'utf8');

tabs = tabs.replace(
  /import \{ aiGenerateSummary, aiGenerateQuiz, aiEvaluateProfessor, aiParseSyllabus \} from "\.\.\/lib\/aiHelpers";/,
  'import { aiGenerateSummary, aiGenerateQuiz, aiEvaluateProfessor, aiParseSyllabus, aiGenerateFlashcards } from "../lib/aiHelpers";'
);

tabs = tabs.replace(
  /const q = `Baseado no seguinte material da disciplina \$\{disciplina\}, crie de 5 a 8 flashcards curtos e diretos para memorização\. Responda APENAS em JSON no formato \[\{"frente": "Pergunta curta", "verso": "Resposta curta"\}\]\. NADA MAIS\.\\n\\nMaterial:\\n\$\{sourceTexts\}`;[\s\S]*?if \(parsed && parsed\.length > 0\) setCards\(parsed\);/m,
  'const parsed = await aiGenerateFlashcards(disciplina, sourceTexts);\n      if (parsed && parsed.length > 0) setCards(parsed);'
);

fs.writeFileSync('src/components/Tabs.jsx', tabs, 'utf8');
console.log("Updated Tabs to use aiGenerateFlashcards!");
