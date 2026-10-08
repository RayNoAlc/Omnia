const fs = require('fs');
let tabs = fs.readFileSync('src/components/Tabs.jsx', 'utf8');

// Update HojeTab signature
tabs = tabs.replace(
  /export function HojeTab\(\{ overdue, blocksHoje, commitmentsHoje, routineItemsHoje, proximos, overload, onToggleBlock, onGoInbox, onGoAgenda, routine, metaHoje, onSetMeta, minutosEstudadosHoje, avisos \}\) \{/,
  'export function HojeTab({ overdue, blocksHoje, commitmentsHoje, routineItemsHoje, proximos, overload, onToggleBlock, onGoInbox, onGoAgenda, routine, metaHoje, onSetMeta, minutosEstudadosHoje, avisos, config, notes, onSaveNote }) {'
);

const journalCode = `
  const [mood, setMood] = React.useState(null);
  const [journalText, setJournalText] = React.useState("");
  const hojeDateStr = todayISO().slice(0,10);
  const hasJournalToday = notes && notes.some(n => n.disciplina === "Diário de Bordo" && n.created_at && n.created_at.startsWith(hojeDateStr));

  const handleSaveJournal = async () => {
    if (!mood || !journalText.trim()) return alert("Escolha um humor e escreva algo!");
    const finalTxt = \`Humor: \${mood}\\n\\n\${journalText.trim()}\`;
    if (onSaveNote) {
      await onSaveNote({ disciplina: "Diário de Bordo", texto: finalTxt });
      setMood(null);
      setJournalText("");
    }
  };
`;

// Insert state for journal inside HojeTab
tabs = tabs.replace(
  /const items = \[/,
  journalCode + '\n  const items = ['
);

const journalCardHtml = `
        {/* Diário de Bordo (Idea 36 & 38) */}
        {config?.enableJournal !== false && !hasJournalToday && (
          <Card style={{ backgroundColor: T.surfaceAlt, borderColor: T.border }}>
            <div className="flex items-center gap-2 mb-3">
              <BookHeart className="w-5 h-5" style={{ color: T.brand }} />
              <h3 className="text-lg font-bold" style={{ color: T.ink }}>Diário de Bordo</h3>
            </div>
            <p className="text-sm mb-4" style={{ color: T.inkSoft }}>Como você está se sentindo hoje? Faça um rápido check-in mental.</p>
            
            <div className="flex gap-2 mb-4">
              {['🤩', '😊', '😐', '😩', '💀'].map(em => (
                <button key={em} onClick={() => setMood(em)} className="text-2xl p-2 rounded-full transition-transform hover:scale-110" style={{ backgroundColor: mood === em ? T.brand + '40' : 'transparent', border: mood === em ? \`1px solid \${T.brand}\` : '1px solid transparent' }}>
                  {em}
                </button>
              ))}
            </div>

            <textarea
              value={journalText} onChange={e => setJournalText(e.target.value)}
              placeholder="Escreva sobre o seu dia, suas vitórias ou desabafos..."
              className="w-full p-3 rounded-xl text-sm outline-none resize-none min-h-[100px] mb-3"
              style={{ backgroundColor: T.bg, color: T.ink, border: \`1px solid \${T.border}\` }}
            />
            
            <div className="flex justify-end">
              <button onClick={handleSaveJournal} className="px-4 py-2 rounded-xl text-sm font-bold transition-opacity hover:opacity-80" style={{ backgroundColor: T.brand, color: T.bg }}>
                Salvar no Diário
              </button>
            </div>
          </Card>
        )}
        
        {config?.enableJournal !== false && hasJournalToday && (
          <div className="text-center p-4 rounded-xl text-sm" style={{ backgroundColor: T.surfaceAlt, color: T.inkSoft, border: \`1px solid \${T.border}\` }}>
            <Smile className="w-5 h-5 mx-auto mb-2" style={{ color: T.brand }} />
            Você já registrou seu diário hoje! Suas notas estão seguras na Biblioteca.
          </div>
        )}
`;

// Insert journalCardHtml at the bottom of the HojeTab, right before the last </div>
tabs = tabs.replace(
  /(\s*)<\/div>\s*\);\s*\}\s*export function AgendaTab/,
  '\n' + journalCardHtml + '$1</div>\n    );\n  }\n\n  export function AgendaTab'
);

fs.writeFileSync('src/components/Tabs.jsx', tabs, 'utf8');
console.log("Injected Journal card into HojeTab!");
