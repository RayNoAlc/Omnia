const fs = require('fs');
let tabs = fs.readFileSync('src/components/Tabs.jsx', 'utf8');

const badgesAndWrappedFn = `
function Badges({ sessions }) {
  const badges = [];
  if (sessions.some(s => { const d = new Date(s.data); return d.getDay() === 0; })) badges.push({ ic: "🧟", n: "Sobrevivente", d: "Estudou num Domingo" });
  if (sessions.some(s => { const h = parseInt(s.data.slice(11,13)); return h >= 4 && h <= 6; })) badges.push({ ic: "🌅", n: "Madrugador", d: "Estudou antes das 7h" });
  if (sessions.some(s => s.minutos >= 120)) badges.push({ ic: "🏃", n: "Maratonista", d: "Sessão de +2h" });
  if (sessions.length >= 10) badges.push({ ic: "🥉", n: "Iniciante", d: "10 sessões" });
  if (sessions.length >= 50) badges.push({ ic: "🥈", n: "Veterano", d: "50 sessões" });
  if (sessions.length >= 100) badges.push({ ic: "🥇", n: "Lenda", d: "100 sessões" });

  return (
    <Card className="mt-6">
      <SectionLabel>Conquistas Secretas</SectionLabel>
      <div className="flex gap-4 flex-wrap mt-2">
        {badges.length === 0 ? <EmptyState text="Estude para desbloquear medalhas!" /> : 
         badges.map(b => (
           <div key={b.n} className="flex flex-col items-center p-3 rounded-xl border text-center hover:scale-110 transition-transform" style={{ borderColor: T.border, backgroundColor: T.surfaceAlt, width: 100 }}>
             <span className="text-3xl mb-1">{b.ic}</span>
             <span className="text-xs font-bold" style={{ color: T.ink }}>{b.n}</span>
             <span className="text-[9px]" style={{ color: T.inkSoft }}>{b.d}</span>
           </div>
         ))
        }
      </div>
    </Card>
  );
}

function OmniaWrapped({ sessions }) {
  const [open, setOpen] = useState(false);
  if (!sessions || sessions.length === 0) return null;
  
  const totalMinutos = sessions.reduce((a,s) => a + s.minutos, 0);
  const discMap = {};
  sessions.forEach(s => { discMap[s.disciplina] = (discMap[s.disciplina] || 0) + s.minutos; });
  const topDisc = Object.keys(discMap).sort((a,b) => discMap[b] - discMap[a])[0];

  return (
    <>
      <PrimaryButton onClick={() => setOpen(true)} className="w-full mt-6 py-4 text-lg animate-pulse" style={{ background: 'linear-gradient(45deg, #FF007A, #7928CA)', color: 'white', border: 'none' }}>
        ✨ Ver Meu Omnia Wrapped
      </PrimaryButton>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={() => setOpen(false)}>
          <div className="rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl scale-in-center" style={{ background: 'linear-gradient(135deg, #111, #333)', color: '#fff', border: '2px solid #555' }} onClick={e => e.stopPropagation()}>
            <h2 className="text-4xl font-black mb-6 bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-violet-500">Omnia Wrapped</h2>
            <div className="space-y-6 text-xl">
              <p>Você estudou <br/><span className="text-5xl font-black text-pink-400">{Math.round(totalMinutos/60)}h</span></p>
              <p>Sua disciplina favorita foi <br/><span className="text-3xl font-bold text-violet-400">{topDisc}</span></p>
              <p>Você fez <span className="font-bold text-yellow-400">{sessions.length}</span> sessões!</p>
            </div>
            <button onClick={() => setOpen(false)} className="mt-8 px-6 py-2 rounded-full font-bold bg-white text-black hover:bg-gray-200">Incrível</button>
          </div>
        </div>
      )}
    </>
  );
}
`;

tabs = tabs.replace('export function DesempenhoTab({ commitments, sessions, quizAttempts, professorAttempts }) {', badgesAndWrappedFn + '\nexport function DesempenhoTab({ commitments, sessions, quizAttempts, professorAttempts }) {');

tabs = tabs.replace(
  '<Heatmap sessions={sessions} />',
  '<Heatmap sessions={sessions} />\n        <Badges sessions={sessions} />\n        <OmniaWrapped sessions={sessions} />'
);

fs.writeFileSync('src/components/Tabs.jsx', tabs, 'utf8');
