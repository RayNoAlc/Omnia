const fs = require('fs');
let tabs = fs.readFileSync('src/components/Tabs.jsx', 'utf8');

const habitsHtml = `
  function DailyHabits({ T }) {
    const today = new Date().toISOString().slice(0, 10);
    const [habits, setHabits] = useState(() => {
      try {
        const saved = localStorage.getItem("omnia_habits_" + today);
        if (saved) return JSON.parse(saved);
      } catch(e) {}
      return [
        { id: "agua", label: "Beber Água (2L)", icon: "💧", done: false },
        { id: "exercicio", label: "Atividade Física", icon: "🏃", done: false },
        { id: "leitura", label: "Leitura Lazer", icon: "📚", done: false },
        { id: "luz", label: "Luz do Sol (15m)", icon: "☀️", done: false }
      ];
    });

    useEffect(() => {
      localStorage.setItem("omnia_habits_" + today, JSON.stringify(habits));
    }, [habits, today]);

    const toggleHabit = (id) => {
      setHabits(prev => prev.map(h => h.id === id ? { ...h, done: !h.done } : h));
      if (!habits.find(h => h.id === id).done && window.confetti) {
        window.confetti({ particleCount: 30, spread: 50, origin: { y: 0.8 } });
      }
    };

    const progress = Math.round((habits.filter(h => h.done).length / habits.length) * 100);

    return (
      <Card style={{ marginTop: '1rem' }}>
        <div className="flex items-center justify-between mb-3">
          <div className="font-bold flex items-center gap-2" style={{ color: T.ink }}>
            <span>🌱</span> Rastreador de Hábitos
          </div>
          <span className="text-xs font-bold px-2 py-1 rounded-full" style={{ backgroundColor: T.brand + '22', color: T.brand }}>
            {progress}%
          </span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {habits.map(h => (
            <button key={h.id} onClick={() => toggleHabit(h.id)} className="flex items-center gap-2 p-2 rounded-xl text-left transition-all border" style={{ backgroundColor: h.done ? T.brand + '11' : T.surfaceAlt, borderColor: h.done ? T.brand : T.border }}>
              <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 border" style={{ backgroundColor: h.done ? T.brand : 'transparent', borderColor: h.done ? T.brand : T.border }}>
                {h.done && <Check className="w-3 h-3 text-white" />}
              </div>
              <span className="text-xs font-medium truncate" style={{ color: h.done ? T.ink : T.inkSoft, textDecoration: h.done ? "line-through" : "none" }}>{h.icon} {h.label}</span>
            </button>
          ))}
        </div>
      </Card>
    );
  }
`;

tabs = tabs.replace(
  /function MetaHojeCard/,
  habitsHtml + '\n\nfunction MetaHojeCard'
);

// Inject DailyHabits below MetaHojeCard in HojeTab
tabs = tabs.replace(
  /<MetaHojeCard blocksHoje=\{blocksHoje\} routine=\{routine\} metaHoje=\{metaHoje\} onSetMeta=\{onSetMeta\} minutosEstudadosHoje=\{minutosEstudadosHoje\} config=\{config\} \/>\s*<\/div>/,
  '<MetaHojeCard blocksHoje={blocksHoje} routine={routine} metaHoje={metaHoje} onSetMeta={onSetMeta} minutosEstudadosHoje={minutosEstudadosHoje} config={config} />\n            <DailyHabits T={T} />\n          </div>'
);

fs.writeFileSync('src/components/Tabs.jsx', tabs, 'utf8');
console.log("Injected Daily Habits Tracker!");
