const fs = require('fs');

let tabs = fs.readFileSync('src/components/Tabs.jsx', 'utf8');

// Add Heart to lucide-react import
if (!tabs.includes('Heart,')) {
  tabs = tabs.replace(/import \{\s*/, 'import {\n  Heart, ');
}

// Add enableHealthBreak to safeConfig
tabs = tabs.replace(
  /const safeConfig = \{ enableScratchpad: true, enableSincereOwl: true, enableJournal: true, fontFamily: "Inter, sans-serif", enableConfetti: true, enablePdf: true, enableCalendar: true, enableGamification: true, enableLofi: true, \.\.\.\(config \|\| \{\}\) \};/,
  'const safeConfig = { enableHealthBreak: true, enableScratchpad: true, enableSincereOwl: true, enableJournal: true, fontFamily: "Inter, sans-serif", enableConfetti: true, enablePdf: true, enableCalendar: true, enableGamification: true, enableLofi: true, ...(config || {}) };'
);

// Add the UI toggle for Health Break
const healthToggleHtml = `
            <label className='flex items-center justify-between p-4 rounded-xl border cursor-pointer hover:opacity-80 transition-opacity' style={{ borderColor: T.border, backgroundColor: T.bg }}>
              <div>
                <div className='font-bold' style={{ color: T.ink }}><Heart size={20} className="inline mr-2 -mt-1" /> Pausas Ativas</div>
                <div className='text-sm mt-1' style={{ color: T.inkSoft }}>A tela escurece e sugere alongamento e hidratação a cada 20 minutos de foco contínuo.</div>
              </div>
              <input type='checkbox' checked={safeConfig.enableHealthBreak} onChange={() => handleToggle('enableHealthBreak')} className='w-6 h-6 accent-blue-500' />
            </label>
`;

tabs = tabs.replace(
  /<div className='font-bold' style=\{\{ color: T\.ink \}\}><PartyPopper size=\{20\} className="inline mr-2 -mt-1" \/> Animações de Conclusão<\/div>/,
  healthToggleHtml.trim() + '\n\n            <label className=\'flex items-center justify-between p-4 rounded-xl border cursor-pointer hover:opacity-80 transition-opacity\' style={{ borderColor: T.border, backgroundColor: T.bg }}>\n              <div>\n                <div className=\'font-bold\' style={{ color: T.ink }}><PartyPopper size={20} className="inline mr-2 -mt-1" /> Animações de Conclusão</div>'
);

// Inject Health Break overlay into FocoTab
const healthBreakCode = `
    const [showHealthBreak, setShowHealthBreak] = useState(false);
    useEffect(() => {
      if (config?.enableHealthBreak === false) return;
      if (timer.isRunning && timer.phase === 'work' && timer.remaining % 1200 === 0 && timer.remaining > 0 && timer.remaining < timer.duration) {
        setShowHealthBreak(true);
        setTimeout(() => setShowHealthBreak(false), 8000);
      }
    }, [timer.remaining, timer.isRunning, timer.phase, config?.enableHealthBreak, timer.duration]);
`;

tabs = tabs.replace(
  /const \[roomCode, setRoomCode\] = useState\(""\);/,
  'const [roomCode, setRoomCode] = useState("");\n' + healthBreakCode
);

const healthBreakUiCode = `
      {showHealthBreak && (
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center animate-fade-in" style={{ backgroundColor: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)' }}>
          <Heart className="w-16 h-16 text-red-500 animate-pulse mb-6" />
          <h2 className="text-3xl font-bold text-white mb-2">Pausa para a Saúde!</h2>
          <p className="text-lg text-gray-300 text-center max-w-md">Você já está focado há 20 minutos. Beba um copo de água, pisque os olhos algumas vezes e alongue o pescoço.</p>
          <button onClick={() => setShowHealthBreak(false)} className="mt-8 px-6 py-2 rounded-xl bg-white text-black font-bold hover:bg-gray-200 transition-colors">Voltar ao foco</button>
        </div>
      )}
`;

tabs = tabs.replace(
  /<div className="max-w-4xl mx-auto space-y-6">/,
  healthBreakUiCode + '\n      <div className="max-w-4xl mx-auto space-y-6">'
);

fs.writeFileSync('src/components/Tabs.jsx', tabs, 'utf8');
console.log("Injected Health Break!");
