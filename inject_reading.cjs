const fs = require('fs');
let tabs = fs.readFileSync('src/components/Tabs.jsx', 'utf8');

const readingHtml = `
  function ReadingGoalCalculator({ T }) {
    const [total, setTotal] = useState(300);
    const [current, setCurrent] = useState(45);
    const [deadline, setDeadline] = useState("");
    
    let result = null;
    if (deadline && total > current) {
      const today = new Date();
      const end = new Date(deadline);
      const diff = Math.ceil((end - today) / (1000 * 60 * 60 * 24));
      if (diff > 0) {
        result = Math.ceil((total - current) / diff);
      }
    }

    return (
      <Card className="mt-4">
        <div className="flex items-center gap-2 mb-4 font-bold" style={{ color: T.ink }}>
          <BookOpen className="w-5 h-5" style={{ color: T.brand }} /> Metas de Leitura
        </div>
        <p className="text-xs mb-4" style={{ color: T.inkSoft }}>Calcule quantas páginas você precisa ler por dia para terminar aquele livro ou PDF a tempo.</p>
        
        <div className="grid grid-cols-3 gap-2 mb-4">
          <div>
            <label className="text-[10px] font-bold uppercase opacity-60">Total de Págs</label>
            <input type="number" value={total} onChange={e => setTotal(e.target.value)} className="w-full p-2 rounded border mt-1 text-sm bg-transparent" style={{ borderColor: T.border, color: T.ink }} />
          </div>
          <div>
            <label className="text-[10px] font-bold uppercase opacity-60">Pág. Atual</label>
            <input type="number" value={current} onChange={e => setCurrent(e.target.value)} className="w-full p-2 rounded border mt-1 text-sm bg-transparent" style={{ borderColor: T.border, color: T.ink }} />
          </div>
          <div>
            <label className="text-[10px] font-bold uppercase opacity-60">Prazo (Data)</label>
            <input type="date" value={deadline} onChange={e => setDeadline(e.target.value)} className="w-full p-2 rounded border mt-1 text-sm bg-transparent" style={{ borderColor: T.border, color: T.ink }} />
          </div>
        </div>

        {result !== null && (
          <div className="p-3 rounded-lg flex items-center justify-between" style={{ backgroundColor: T.brand + '22', border: \`1px solid \${T.brand}55\` }}>
            <div>
              <div className="text-xs font-bold" style={{ color: T.brandInk }}>Ritmo Necessário</div>
              <div className="text-[10px]" style={{ color: T.inkSoft }}>Para terminar no prazo estipulado</div>
            </div>
            <div className="text-xl font-black" style={{ color: T.brand }}>
              {result} <span className="text-xs font-normal">págs/dia</span>
            </div>
          </div>
        )}
      </Card>
    );
  }
`;

tabs = tabs.replace(
  /export function BibliotecaTab/,
  readingHtml + '\n\nexport function BibliotecaTab'
);

tabs = tabs.replace(
  /<div className="w-full md:w-64 shrink-0 flex flex-col gap-4">/,
  '<div className="w-full md:w-64 shrink-0 flex flex-col gap-4">\n          <ReadingGoalCalculator T={T} />'
);

fs.writeFileSync('src/components/Tabs.jsx', tabs, 'utf8');
console.log("Injected Reading Calculator!");
