const fs = require('fs');
let tabs = fs.readFileSync('src/components/Tabs.jsx', 'utf8');

const arquetiposComponent = `
function Arquetipos({ sessions, quizAttempts, professorAttempts }) {
  const [selectedClass, setSelectedClass] = useState(localStorage.getItem('omnia_rpg_class') || null);
  
  const xpSessions = sessions.reduce((a, s) => a + s.minutos * 10, 0);
  const xpQuiz = quizAttempts.reduce((a, q) => a + q.acertos * 50, 0);
  const xpProf = professorAttempts.reduce((a, p) => a + (p.nota || 0) * 100, 0);
  const totalXp = xpSessions + xpQuiz + xpProf;
  const level = Math.floor(totalXp / 1000) + 1;

  const handleSelect = (c) => {
    if (level < 5) return alert("Você precisa atingir o Nível 5 para escolher uma classe!");
    localStorage.setItem('omnia_rpg_class', c);
    setSelectedClass(c);
    // reload to apply bonuses
    window.location.reload();
  };

  const classes = [
    { id: 'coruja', name: 'O Coruja 🦉', desc: '+50% XP em sessões à noite (após 19h).' },
    { id: 'maratonista', name: 'O Maratonista 🏃', desc: '+50% XP em sessões de Foco de 2h+.' },
    { id: 'estrategista', name: 'O Estrategista ♟️', desc: '+20% XP em Quizzes e Modo Professor.' }
  ];

  return (
    <Card className="mt-6 p-6" style={{ borderColor: T.brand, background: 'linear-gradient(to right, rgba(0,0,0,0.2), transparent)' }}>
      <SectionLabel>Classes de Estudante (Nível 5+)</SectionLabel>
      <div className="text-sm mb-4" style={{ color: T.inkSoft }}>Ao atingir o Nível 5, você pode escolher um arquétipo que reflete seu estilo de estudo e ganhar bônus de XP passivos.</div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {classes.map(c => {
          const isSelected = selectedClass === c.id;
          const locked = level < 5 && !isSelected;
          return (
            <div key={c.id} onClick={() => handleSelect(c.id)} className="p-4 rounded-xl border cursor-pointer transition-all hover:scale-105" style={{ borderColor: isSelected ? T.importante : T.border, backgroundColor: isSelected ? TINT.importante : T.surfaceAlt, opacity: locked ? 0.5 : 1 }}>
              <div className="font-bold text-lg mb-1" style={{ color: T.ink }}>{c.name}</div>
              <div className="text-xs" style={{ color: T.inkSoft }}>{c.desc}</div>
              {isSelected && <div className="mt-2 text-xs font-bold uppercase" style={{ color: T.importante }}>Classe Ativa</div>}
              {locked && <div className="mt-2 text-[10px] uppercase" style={{ color: T.critico }}>Bloqueado</div>}
            </div>
          )
        })}
      </div>
    </Card>
  );
}
`;

// Insert the component
tabs = tabs.replace('export function DesempenhoTab', arquetiposComponent + '\nexport function DesempenhoTab');

// Add to DesempenhoTab rendering
tabs = tabs.replace(
  '<Badges sessions={sessions} />',
  '<Badges sessions={sessions} />\n        <Arquetipos sessions={sessions} quizAttempts={quizAttempts} professorAttempts={professorAttempts} />'
);

// Apply bonuses to HojeTab
const oldXpLogic = `    const xpSessions = sessions.reduce((a, s) => a + s.minutos * 10, 0);
    const xpQuiz = quizAttempts.reduce((a, q) => a + q.acertos * 50, 0);
    const xpProf = professorAttempts.reduce((a, p) => a + (p.nota || 0) * 100, 0);`;

const newXpLogic = `    const rpgClass = typeof localStorage !== 'undefined' ? localStorage.getItem('omnia_rpg_class') : null;
    const xpSessions = sessions.reduce((a, s) => {
      let pts = s.minutos * 10;
      if (rpgClass === 'coruja' && s.data && parseInt(s.data.slice(11,13)) >= 19) pts *= 1.5;
      if (rpgClass === 'maratonista' && s.minutos >= 120) pts *= 1.5;
      return a + pts;
    }, 0);
    const xpQuiz = quizAttempts.reduce((a, q) => a + (q.acertos * 50) * (rpgClass === 'estrategista' ? 1.2 : 1), 0);
    const xpProf = professorAttempts.reduce((a, p) => a + ((p.nota || 0) * 100) * (rpgClass === 'estrategista' ? 1.2 : 1), 0);`;

tabs = tabs.replace(oldXpLogic, newXpLogic);

fs.writeFileSync('src/components/Tabs.jsx', tabs, 'utf8');
