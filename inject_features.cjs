const fs = require('fs');
let tabs = fs.readFileSync('src/components/Tabs.jsx', 'utf8');

const petComponent = 
function FocusPet({ timerOn, streak }) {
  let emoji = "💤";
  let status = "Dormindo...";
  if (timerOn) { emoji = "🔥"; status = "Focando!"; }
  else if (streak > 5) { emoji = "😎"; status = "Mestre da Rotina"; }
  else if (streak > 0) { emoji = "🙂"; status = "Animado"; }
  else { emoji = "🥺"; status = "Esperando você estudar..."; }

  return (
    <Card className="flex flex-col items-center justify-center p-4 mt-6">
      <div className="text-4xl mb-2 animate-bounce">{emoji}</div>
      <div className="text-sm font-bold" style={{ color: T.ink }}>Seu Pet</div>
      <div className="text-xs" style={{ color: T.inkSoft }}>{status}</div>
    </Card>
  );
}
;

tabs = tabs.replace('export function FocoTab(props) {', petComponent + '\nexport function FocoTab(props) {');

// Inject streak calculation into FocoTab
tabs = tabs.replace('const [lofiOn, setLofiOn] = useState(false);', 'const [lofiOn, setLofiOn] = useState(false);\n  const datasAtividades = Array.from(new Set(sessions.map(s => s.data.slice(0,10)))).sort().reverse();\n  let streak = 0;\n  let d = new Date();\n  for (let i = 0; i < 365; i++) {\n    const dIso = d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");\n    if (datasAtividades.includes(dIso)) streak++;\n    else if (i !== 0) break;\n  }');

tabs = tabs.replace(
  '{/* Player de Msica Lofi */}',
  '<FocusPet timerOn={timer.isRunning} streak={streak} />\n        {/* Player de Msica Lofi */}'
);
tabs = tabs.replace(
  '{/* Player de M\u00fasica Lofi */}',
  '<FocusPet timerOn={timer.isRunning} streak={streak} />\n        {/* Player de M\u00fasica Lofi */}'
);

const heatmapComponent = 
function Heatmap({ sessions }) {
  const daily = {};
  (sessions || []).forEach(s => {
    const d = s.data.slice(0,10);
    daily[d] = (daily[d] || 0) + s.minutos;
  });
  
  const today = new Date();
  const days = [];
  for (let i = 100; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const iso = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
    days.push({ iso, min: daily[iso] || 0 });
  }

  return (
    <Card className="p-5 mt-6">
      <SectionLabel>Gráfico de Calor (Últimos 100 dias)</SectionLabel>
      <div className="flex flex-wrap gap-1 mt-4">
        {days.map(d => {
          let color = T.surfaceAlt;
          if (d.min > 0) color = "rgba(59, 130, 246, 0.3)";
          if (d.min > 30) color = "rgba(59, 130, 246, 0.6)";
          if (d.min > 60) color = T.brand;
          return <div key={d.iso} title={d.iso + ": " + d.min + " min"} className="w-3 h-3 rounded-sm hover:scale-150 transition-transform cursor-crosshair" style={{ backgroundColor: color }} />
        })}
      </div>
    </Card>
  )
}
;

tabs = tabs.replace('export function DesempenhoTab', heatmapComponent + '\nexport function DesempenhoTab');

// Inject heatmap into DesempenhoTab
tabs = tabs.replace(
  '        {interruptionInsight && (',
  '        <Heatmap sessions={sessions} />\n        {interruptionInsight && ('
);

fs.writeFileSync('src/components/Tabs.jsx', tabs, 'utf8');
