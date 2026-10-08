const fs = require('fs');

let tabs = fs.readFileSync('src/components/Tabs.jsx', 'utf8');

if (!tabs.includes('export function GlobalSearchModal')) {
  tabs = tabs.replace(/import \{\s*/, 'import {\n  Search, ');

  const modalCode = `
export function GlobalSearchModal({ onClose, commitments, notes, materials, setTab }) {
  const [q, setQ] = React.useState("");
  React.useEffect(() => {
    const handleKeyDown = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const lowerQ = q.toLowerCase();
  const resCommitments = commitments.filter(c => c.assunto?.toLowerCase().includes(lowerQ) || c.disciplina?.toLowerCase().includes(lowerQ)).slice(0, 3);
  const resNotes = notes.filter(n => n.texto?.toLowerCase().includes(lowerQ) || n.disciplina?.toLowerCase().includes(lowerQ)).slice(0, 3);
  const resMaterials = materials.filter(m => m.name?.toLowerCase().includes(lowerQ) || m.disciplina?.toLowerCase().includes(lowerQ)).slice(0, 3);

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] px-4" style={{ backgroundColor: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }} onClick={onClose}>
      <div className="w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden" style={{ backgroundColor: T.bg, border: \`1px solid \${T.border}\` }} onClick={e => e.stopPropagation()}>
        <div className="flex items-center p-4 border-b" style={{ borderColor: T.border, backgroundColor: T.surface }}>
          <Search className="w-5 h-5 mr-3" style={{ color: T.inkSoft }} />
          <input autoFocus type="text" placeholder="Buscar compromissos, notas, materiais..." value={q} onChange={e => setQ(e.target.value)} className="flex-1 bg-transparent border-none outline-none text-lg" style={{ color: T.ink }} />
          <button onClick={onClose} className="px-2 py-1 text-xs rounded border ml-2" style={{ color: T.inkSoft, borderColor: T.border }}>ESC</button>
        </div>
        {q && (
          <div className="max-h-[60vh] overflow-y-auto p-2 space-y-4">
            {resCommitments.length > 0 && (
              <div>
                <div className="text-xs font-bold px-3 py-1 uppercase" style={{ color: T.brand }}>Compromissos</div>
                {resCommitments.map(c => (
                  <button key={c.id} onClick={() => { setTab("agenda"); onClose(); }} className="w-full text-left px-3 py-2 rounded-xl hover:opacity-80 transition-all flex items-center justify-between" style={{ backgroundColor: T.surfaceAlt }}>
                    <span style={{ color: T.ink }} className="font-medium truncate">{c.disciplina} - {c.assunto}</span>
                  </button>
                ))}
              </div>
            )}
            {resNotes.length > 0 && (
              <div>
                <div className="text-xs font-bold px-3 py-1 uppercase" style={{ color: T.brand }}>Anotações</div>
                {resNotes.map(n => (
                  <button key={n.id} onClick={() => { setTab("biblioteca"); onClose(); }} className="w-full text-left px-3 py-2 rounded-xl hover:opacity-80 transition-all flex items-center justify-between" style={{ backgroundColor: T.surfaceAlt }}>
                    <span style={{ color: T.ink }} className="font-medium truncate">{n.disciplina} - {n.texto.slice(0, 40)}...</span>
                  </button>
                ))}
              </div>
            )}
            {resMaterials.length > 0 && (
              <div>
                <div className="text-xs font-bold px-3 py-1 uppercase" style={{ color: T.brand }}>Materiais</div>
                {resMaterials.map(m => (
                  <button key={m.id} onClick={() => { setTab("biblioteca"); onClose(); }} className="w-full text-left px-3 py-2 rounded-xl hover:opacity-80 transition-all flex items-center justify-between" style={{ backgroundColor: T.surfaceAlt }}>
                    <span style={{ color: T.ink }} className="font-medium truncate">{m.disciplina} - {m.name}</span>
                  </button>
                ))}
              </div>
            )}
            {resCommitments.length === 0 && resNotes.length === 0 && resMaterials.length === 0 && (
              <div className="p-4 text-center text-sm" style={{ color: T.inkSoft }}>Nenhum resultado encontrado.</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
`;

  tabs = tabs + '\n' + modalCode;
  fs.writeFileSync('src/components/Tabs.jsx', tabs, 'utf8');
  console.log("Added GlobalSearchModal!");
}
