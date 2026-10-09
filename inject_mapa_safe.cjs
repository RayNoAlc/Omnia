const fs = require('fs');
let tabs = fs.readFileSync('src/components/Tabs.jsx', 'utf8');

const mapBtnHtml = `
        {showMapa && <MapaMentalModal notes={notes} commitments={commitments} onClose={() => setShowMapa(false)} T={T} />}
        <div className="flex flex-wrap gap-2 justify-between items-center">
          <ExportarBiblioteca userId={userId} commitments={commitments} notes={notes} materials={materials} summaries={summaries} disciplinas={disciplinas} semestres={semestres.filter((s) => s !== "Sem data")} />
          <PrimaryButton onClick={() => setShowMapa(true)}><Network className="w-4 h-4 mr-2" /> Árvore de Conhecimento</PrimaryButton>
        </div>
`;

tabs = tabs.replace(
  /<ExportarBiblioteca userId=\{userId\} commitments=\{commitments\} notes=\{notes\} materials=\{materials\} summaries=\{summaries\} disciplinas=\{disciplinas\} semestres=\{semestres\.filter\(\(s\) => s !== "Sem data"\)\} \/>/,
  mapBtnHtml
);

tabs = tabs.replace(
  /const \[openCommitment, setOpenCommitment\] = useState\(null\);/,
  'const [openCommitment, setOpenCommitment] = useState(null);\n  const [showMapa, setShowMapa] = useState(false);'
);

// We need the Modal function
const mapaHtml = `
function MapaMentalModal({ notes, commitments, onClose, T }) {
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);

  useEffect(() => {
    // Basic force-directed / radial layout manually calculated
    const disciplinas = Array.from(new Set([
      ...notes.map(n => n.disciplina),
      ...commitments.map(c => c.disciplina)
    ])).filter(Boolean);

    const centerX = 400;
    const centerY = 300;
    
    let nds = [];
    let eds = [];

    // Root node
    nds.push({ id: 'root', label: 'Meu Cérebro', x: centerX, y: centerY, r: 40, color: T.brand });

    const angleStep = (2 * Math.PI) / disciplinas.length;
    disciplinas.forEach((disc, i) => {
      const angle = i * angleStep;
      const radius = 180; // Distance from center
      const dx = centerX + radius * Math.cos(angle);
      const dy = centerY + radius * Math.sin(angle);
      
      nds.push({ id: disc, label: disc, x: dx, y: dy, r: 30, color: T.brandInk || '#555' });
      eds.push({ from: 'root', to: disc });

      // Count items for this disc
      const count = notes.filter(n => n.disciplina === disc).length + commitments.filter(c => c.disciplina === disc).length;
      if (count > 0) {
        const cAngle = angle + (Math.PI / 4);
        const cRadius = 60;
        const cx = dx + cRadius * Math.cos(cAngle);
        const cy = dy + cRadius * Math.sin(cAngle);
        nds.push({ id: disc+'_items', label: \`\${count} Itens\`, x: cx, y: cy, r: 20, color: T.inkSoft });
        eds.push({ from: disc, to: disc+'_items' });
      }
    });

    setNodes(nds);
    setEdges(eds);
  }, [notes, commitments]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <Card className="w-full max-w-4xl h-[80vh] flex flex-col p-0 overflow-hidden" style={{ backgroundColor: T.bg, borderColor: T.border }}>
        <div className="flex justify-between items-center p-4 border-b" style={{ borderColor: T.border }}>
          <h2 className="text-lg font-bold" style={{ color: T.ink }}><Network className="inline mr-2" /> Árvore de Conhecimento</h2>
          <GhostButton onClick={onClose}>Fechar</GhostButton>
        </div>
        <div className="flex-1 overflow-auto relative bg-grid-pattern">
          <svg width="100%" height="100%" viewBox="0 0 800 600" preserveAspectRatio="xMidYMid meet">
            {edges.map((e, i) => {
              const from = nodes.find(n => n.id === e.from);
              const to = nodes.find(n => n.id === e.to);
              if(!from || !to) return null;
              return (
                <line key={i} x1={from.x} y1={from.y} x2={to.x} y2={to.y} stroke={T.border} strokeWidth="2" opacity="0.6" />
              );
            })}
            {nodes.map(n => (
              <g key={n.id} className="transition-transform hover:scale-110 cursor-pointer" style={{ transformOrigin: \`\${n.x}px \${n.y}px\` }}>
                <circle cx={n.x} cy={n.y} r={n.r} fill={n.color} />
                <text x={n.x} y={n.y + n.r + 15} textAnchor="middle" fill={T.ink} fontSize={n.id === 'root' ? 14 : 12} fontWeight="bold">
                  {n.label.length > 20 ? n.label.slice(0, 20) + '...' : n.label}
                </text>
              </g>
            ))}
          </svg>
        </div>
      </Card>
    </div>
  );
}
`;

tabs = tabs.replace(
  /export function BibliotecaTab/,
  mapaHtml + '\nexport function BibliotecaTab'
);

if (!tabs.includes('Network,')) {
  tabs = tabs.replace(/import \{\s*/, 'import {\n  Network, ');
}

fs.writeFileSync('src/components/Tabs.jsx', tabs, 'utf8');
console.log("Injected Mapa Mental Safely!");
