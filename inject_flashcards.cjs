const fs = require('fs');
let tabs = fs.readFileSync('src/components/Tabs.jsx', 'utf8');

const flashcardsPanel = `
function FlashcardsPanel({ disciplina, sourceTexts, onClose }) {
  const [loading, setLoading] = useState(false);
  const [cards, setCards] = useState(null);
  const [flippedIndex, setFlippedIndex] = useState({});

  async function generate() {
    setLoading(true);
    try {
      const q = \`Baseado no seguinte material da disciplina \${disciplina}, crie de 5 a 8 flashcards curtos e diretos para memorização. Responda APENAS em JSON no formato [{"frente": "Pergunta curta", "verso": "Resposta curta"}]. NADA MAIS.\\n\\nMaterial:\\n\${sourceTexts}\`;
      const txt = await askAi(q, true);
      let parsed = [];
      try {
        parsed = JSON.parse(txt.replace(/\`\`\`json/g, "").replace(/\`\`\`/g, "").trim());
      } catch (e) {
        // Fallback or alert
        alert("A IA retornou um formato inválido. Tente novamente.");
      }
      if (parsed && parsed.length > 0) setCards(parsed);
    } catch(e) {
      alert("Erro ao gerar flashcards.");
    } finally {
      setLoading(false);
    }
  }

  const toggleFlip = (i) => setFlippedIndex(prev => ({...prev, [i]: !prev[i]}));

  return (
    <Card style={{ borderColor: T.brand }} className="mb-3">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold text-sm" style={{ color: T.ink }}>Flashcards de {disciplina}</h3>
        <GhostButton onClick={onClose} className="px-2 py-1 text-xs">Fechar</GhostButton>
      </div>
      {!cards ? (
        <div className="text-center py-6">
          <p className="text-sm mb-4" style={{ color: T.inkSoft }}>Gere cartões de memorização (Frente e Verso) baseados nas anotações deste tópico usando Inteligência Artificial.</p>
          <PrimaryButton onClick={generate} disabled={loading}>
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Layers className="w-4 h-4" />} Gerar Flashcards
          </PrimaryButton>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {cards.map((c, i) => (
            <div 
              key={i} 
              onClick={() => toggleFlip(i)}
              className="cursor-pointer min-h-[120px] rounded-xl flex items-center justify-center p-4 text-center transition-all duration-300 transform"
              style={{ backgroundColor: flippedIndex[i] ? T.surfaceAlt : T.surface, border: \`2px solid \${flippedIndex[i] ? T.brand : T.border}\`, color: T.ink }}
            >
              <span className="text-sm font-medium">{flippedIndex[i] ? c.verso : c.frente}</span>
            </div>
          ))}
          <div className="col-span-full mt-2 text-center text-xs opacity-50">Clique nos cartões para virá-los</div>
        </div>
      )}
    </Card>
  );
}
`;

tabs = tabs.replace(
  /function QuizPanel/,
  flashcardsPanel + '\nfunction QuizPanel'
);

// We need Layers icon
if (!tabs.includes('Layers,')) {
  tabs = tabs.replace(/import \{\s*/, 'import {\n  Layers, ');
}

// Inject button into DisciplinaCard
tabs = tabs.replace(
  /<button onClick=\{openProfessor\} className="text-xs px-2 py-1 rounded" style=\{\{ color: T\.brand, border: `1px solid \$\{T\.border\}` \}\}>Modo Professor<\/button>/,
  '<button onClick={openProfessor} className="text-xs px-2 py-1 rounded" style={{ color: T.brand, border: `1px solid ${T.border}` }}>Modo Professor</button>\n            <button onClick={() => setPanel("flashcards")} className="text-xs px-2 py-1 rounded" style={{ color: T.brand, border: `1px solid ${T.border}` }}>Flashcards</button>'
);

// Inject panel into DisciplinaCard
tabs = tabs.replace(
  /\{panel === "quiz" && \(/,
  '{panel === "flashcards" && (\n          <FlashcardsPanel disciplina={disc} sourceTexts={sourceTexts} onClose={() => setPanel(null)} />\n        )}\n\n        {panel === "quiz" && ('
);

// Inject button into CompromissoWorkspaceModal
tabs = tabs.replace(
  /<button onClick=\{openProfessor\} className="text-xs px-2\.5 py-1\.5 rounded-md" style=\{\{ color: T\.brand, border: `1px solid \$\{T\.border\}` \}\}>\s*Modo Professor\s*<\/button>/,
  '<button onClick={openProfessor} className="text-xs px-2.5 py-1.5 rounded-md" style={{ color: T.brand, border: `1px solid ${T.border}` }}>Modo Professor</button>\n            <button onClick={() => setPanel("flashcards")} className="text-xs px-2.5 py-1.5 rounded-md" style={{ color: T.brand, border: `1px solid ${T.border}` }}>Flashcards</button>'
);

// Inject panel into CompromissoWorkspaceModal
tabs = tabs.replace(
  /\{panel === "quiz" && \(/,
  '{panel === "flashcards" && (\n          <FlashcardsPanel disciplina={commitment.disciplina} sourceTexts={sourceTexts} onClose={() => setPanel(null)} />\n        )}\n\n          {panel === "quiz" && ('
);

fs.writeFileSync('src/components/Tabs.jsx', tabs, 'utf8');
console.log("Injected Flashcards!");
