const fs = require('fs');
let tabs = fs.readFileSync('src/components/Tabs.jsx', 'utf8');

// Add Edit3 icon
if (!tabs.includes('Edit3,')) {
  tabs = tabs.replace(/import \{\s*/, 'import {\n  Edit3, ');
}

// Add Scratchpad toggle
const scratchToggleHtml = `
            <label className='flex items-center justify-between p-4 rounded-xl border cursor-pointer hover:opacity-80 transition-opacity' style={{ borderColor: T.border, backgroundColor: T.bg }}>
              <div>
                <div className='font-bold' style={{ color: T.ink }}><Edit3 size={20} className="inline mr-2 -mt-1" /> Lousa em Branco</div>
                <div className='text-sm mt-1' style={{ color: T.inkSoft }}>Um bloco de notas simples na aba Secretaria para rascunhos rápidos.</div>
              </div>
              <input type='checkbox' checked={safeConfig.enableScratchpad} onChange={() => handleToggle('enableScratchpad')} className='w-6 h-6 accent-blue-500' />
            </label>
`;

tabs = tabs.replace(
  /<div className='font-bold' style=\{\{ color: T\.ink \}\}><PartyPopper size=\{20\} className="inline mr-2 -mt-1" \/> Animações de Conclusão<\/div>/,
  scratchToggleHtml.trim() + '\n\n            <label className=\'flex items-center justify-between p-4 rounded-xl border cursor-pointer hover:opacity-80 transition-opacity\' style={{ borderColor: T.border, backgroundColor: T.bg }}>\n              <div>\n                <div className=\'font-bold\' style={{ color: T.ink }}><PartyPopper size={20} className="inline mr-2 -mt-1" /> Animações de Conclusão</div>'
);

tabs = tabs.replace(
  /const safeConfig = \{ enableSincereOwl: true, enableJournal: true, fontFamily: "Inter, sans-serif", enableConfetti: true, enablePdf: true, enableCalendar: true, enableGamification: true, enableLofi: true, \.\.\.\(config \|\| \{\}\) \};/,
  'const safeConfig = { enableScratchpad: true, enableSincereOwl: true, enableJournal: true, fontFamily: "Inter, sans-serif", enableConfetti: true, enablePdf: true, enableCalendar: true, enableGamification: true, enableLofi: true, ...(config || {}) };'
);

// Update SecretariaTab signature
tabs = tabs.replace(
  /export function SecretariaTab\(\{\s*userId, routine, routineBlocks, routineExceptions, commitments, studyBlocks, notes, sessions, setRoutineBlocks, setRoutineExceptions,\s*\}\) \{/,
  'export function SecretariaTab({ userId, routine, routineBlocks, routineExceptions, commitments, studyBlocks, notes, sessions, setRoutineBlocks, setRoutineExceptions, config }) {'
);

const chatStartIdx = tabs.indexOf('<div className="flex flex-col" style={{ height: "60vh" }}>');
if (chatStartIdx > -1) {
  const scratchPadCode = `
    const [scratch, setScratch] = useState(() => localStorage.getItem("omnia_scratch") || "");
    useEffect(() => { localStorage.setItem("omnia_scratch", scratch); }, [scratch]);

    return (
      <div className="flex flex-col lg:flex-row gap-4 h-[75vh]">
        <div className="flex flex-col flex-1 border rounded-xl p-4 shadow-sm" style={{ backgroundColor: T.surface, borderColor: T.border }}>
  `;
  
  tabs = tabs.substring(0, chatStartIdx) + scratchPadCode + tabs.substring(chatStartIdx + '<div className="flex flex-col" style={{ height: "60vh" }}>'.length);
  
  // Close the chat div and append the scratchpad
  const endChatReturn = tabs.indexOf('    </div>\n  );\n}\n\n/* ---------------------------------------------------------------------- */\n/* Aba: Minha Rotina');
  if (endChatReturn > -1) {
    const afterChat = `
        </div>
        {config?.enableScratchpad !== false && (
          <div className="flex flex-col w-full lg:w-1/3 border rounded-xl p-4 shadow-sm" style={{ backgroundColor: T.surfaceAlt, borderColor: T.border }}>
            <h3 className="font-bold mb-4 flex items-center gap-2" style={{ color: T.ink }}><Edit3 size={18} /> Lousa em Branco</h3>
            <textarea
              value={scratch}
              onChange={(e) => setScratch(e.target.value)}
              placeholder="Use este espaço para rascunhos rápidos ou anotações enquanto conversa com a IA..."
              className="flex-1 w-full bg-transparent border-none outline-none resize-none text-sm"
              style={{ color: T.inkSoft }}
            />
          </div>
        )}
      </div>
    );
}

/* ---------------------------------------------------------------------- */
/* Aba: Minha Rotina`;
    tabs = tabs.substring(0, endChatReturn) + afterChat + tabs.substring(endChatReturn + '    </div>\n  );\n}\n\n/* ---------------------------------------------------------------------- */\n/* Aba: Minha Rotina'.length);
  }
}

fs.writeFileSync('src/components/Tabs.jsx', tabs, 'utf8');
console.log("Injected Scratchpad into SecretariaTab!");
