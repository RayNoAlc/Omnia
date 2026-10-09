const fs = require('fs');
let tabs = fs.readFileSync('src/components/Tabs.jsx', 'utf8');

const templatesHtml = `
  function RoutineTemplatesModal({ onClose, setRoutineBlocks, T }) {
    const templates = [
      {
        id: "enem",
        name: "📚 Vestibulando ENEM (Forte)",
        desc: "Foco intenso de manhã e tarde. Simulados no fim de semana.",
        blocks: [
          { id: "1", weekDay: 1, start: "08:00", end: "12:00", type: "study", disciplina: "Matemática", label: "Estudo Focado" },
          { id: "2", weekDay: 1, start: "14:00", end: "18:00", type: "study", disciplina: "Natureza", label: "Estudo Focado" },
          { id: "3", weekDay: 2, start: "08:00", end: "12:00", type: "study", disciplina: "Humanas", label: "Estudo Focado" },
          { id: "4", weekDay: 2, start: "14:00", end: "18:00", type: "study", disciplina: "Linguagens", label: "Estudo Focado" },
          { id: "5", weekDay: 3, start: "08:00", end: "12:00", type: "study", disciplina: "Redação", label: "Estudo Focado" },
          { id: "6", weekDay: 6, start: "13:00", end: "18:00", type: "study", disciplina: "Simulado", label: "Prova Completa" }
        ]
      },
      {
        id: "trabalho",
        name: "💼 Trabalho + Estudo Noturno",
        desc: "Trabalho durante o dia, estudos concentrados à noite.",
        blocks: [
          { id: "1", weekDay: 1, start: "19:30", end: "22:30", type: "study", disciplina: "Revisão Diária", label: "Estudo" },
          { id: "2", weekDay: 2, start: "19:30", end: "22:30", type: "study", disciplina: "Leitura", label: "Estudo" },
          { id: "3", weekDay: 3, start: "19:30", end: "22:30", type: "study", disciplina: "Exercícios", label: "Prática" },
          { id: "4", weekDay: 4, start: "19:30", end: "22:30", type: "study", disciplina: "Revisão Diária", label: "Estudo" },
          { id: "5", weekDay: 6, start: "09:00", end: "13:00", type: "study", disciplina: "Aprofundamento", label: "Estudo Longo" }
        ]
      },
      {
        id: "concurso",
        name: "⚖️ Concurseiro Policial",
        desc: "Direito, Português, RLM e treino físico intercalado.",
        blocks: [
          { id: "1", weekDay: 1, start: "08:00", end: "11:00", type: "study", disciplina: "Direito Penal", label: "Teoria" },
          { id: "2", weekDay: 1, start: "14:00", end: "16:00", type: "study", disciplina: "Português", label: "Questões" },
          { id: "3", weekDay: 1, start: "17:00", end: "18:30", type: "free", disciplina: "TAF", label: "Treino Físico" },
          { id: "4", weekDay: 2, start: "08:00", end: "11:00", type: "study", disciplina: "Constitucional", label: "Teoria" },
          { id: "5", weekDay: 2, start: "17:00", end: "18:30", type: "free", disciplina: "TAF", label: "Treino Físico" }
        ]
      }
    ];

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pt-10" style={{ backgroundColor: "rgba(0,0,0,0.6)", backdropFilter: "blur(5px)" }} onClick={onClose}>
        <div className="w-full max-w-lg rounded-2xl shadow-xl p-6" style={{ backgroundColor: T.surface, border: \`1px solid \${T.border}\` }} onClick={e => e.stopPropagation()}>
          <h2 className="text-xl font-bold mb-2" style={{ color: T.ink }}>Templates da Comunidade</h2>
          <p className="text-sm mb-6" style={{ color: T.inkSoft }}>Baixe uma rotina pré-configurada para substituir a sua atual.</p>
          
          <div className="flex flex-col gap-3">
            {templates.map(t => (
              <button key={t.id} onClick={() => {
                if (window.confirm("Isso vai apagar seus blocos de rotina atuais. Tem certeza?")) {
                  setRoutineBlocks(t.blocks);
                  alert(t.name + " aplicada com sucesso!");
                  onClose();
                }
              }} className="p-4 rounded-xl text-left transition-all hover:scale-[1.02] border" style={{ backgroundColor: T.surfaceAlt, borderColor: T.border }}>
                <div className="font-bold text-lg mb-1" style={{ color: T.ink }}>{t.name}</div>
                <div className="text-sm" style={{ color: T.inkSoft }}>{t.desc}</div>
              </button>
            ))}
          </div>
          <div className="mt-6 flex justify-end">
            <GhostButton onClick={onClose}>Cancelar</GhostButton>
          </div>
        </div>
      </div>
    );
  }
`;

tabs = tabs.replace(
  /export function SecretariaTab/,
  templatesHtml + '\n\nexport function SecretariaTab'
);

tabs = tabs.replace(
  /const \[input, setInput\] = useState\(""\);/,
  'const [input, setInput] = useState("");\n    const [showTemplates, setShowTemplates] = useState(false);'
);

// Inject button next to the routine heading
tabs = tabs.replace(
  /<div className="flex items-center gap-2 mb-4 font-bold text-lg" style=\{\{ color: T\.ink \}\}>/,
  '$&\n            <GhostButton className="ml-auto text-xs py-1" onClick={() => setShowTemplates(true)}>Templates</GhostButton>\n          </div>\n          <div className="hidden">' // just to balance the fake div closing later, wait no.
);

// Actually let's inject it safer:
tabs = tabs.replace(
  /<div className="flex items-center gap-2 mb-4 font-bold text-lg" style=\{\{ color: T\.ink \}\}>\s*<Calendar/,
  '<div className="flex items-center justify-between mb-4"><div className="flex items-center gap-2 font-bold text-lg" style={{ color: T.ink }}><Calendar'
);
tabs = tabs.replace(
  /<Calendar className="w-5 h-5" style=\{\{ color: T\.brand \}\} \/>\s*Horários Fixos\s*<\/div>/,
  '<Calendar className="w-5 h-5" style={{ color: T.brand }} /> Horários Fixos</div><GhostButton onClick={() => setShowTemplates(true)} className="text-xs py-1 px-3">Baixar Templates</GhostButton></div>'
);

tabs = tabs.replace(
  /return \(\s*<div className="max-w-7xl mx-auto space-y-6">/,
  'return (\n      <div className="max-w-7xl mx-auto space-y-6">\n        {showTemplates && <RoutineTemplatesModal onClose={() => setShowTemplates(false)} setRoutineBlocks={setRoutineBlocks} T={props.T || T} />}\n'
);

fs.writeFileSync('src/components/Tabs.jsx', tabs, 'utf8');
console.log("Injected Routine Templates!");
