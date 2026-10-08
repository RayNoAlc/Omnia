const fs = require('fs');

let tabs = fs.readFileSync('src/components/Tabs.jsx', 'utf8');

// Add MessageCircle to lucide-react import
if (!tabs.includes('MessageCircle,')) {
  tabs = tabs.replace(/import \{\s*/, 'import {\n  MessageCircle, ');
}

// Add enableSincereOwl to safeConfig
tabs = tabs.replace(
  /const safeConfig = \{ enableJournal: true, fontFamily: "Inter, sans-serif", enableConfetti: true, enablePdf: true, enableCalendar: true, enableGamification: true, enableLofi: true, \.\.\.\(config \|\| \{\}\) \};/,
  'const safeConfig = { enableSincereOwl: true, enableJournal: true, fontFamily: "Inter, sans-serif", enableConfetti: true, enablePdf: true, enableCalendar: true, enableGamification: true, enableLofi: true, ...(config || {}) };'
);

// Add the UI toggle for Coruja Sincera
const owlToggleHtml = `
            <label className='flex items-center justify-between p-4 rounded-xl border cursor-pointer hover:opacity-80 transition-opacity' style={{ borderColor: T.border, backgroundColor: T.bg }}>
              <div>
                <div className='font-bold' style={{ color: T.ink }}><MessageCircle size={20} className="inline mr-2 -mt-1" /> Coruja Sincera</div>
                <div className='text-sm mt-1' style={{ color: T.inkSoft }}>Balões de fala com dicas e avisos sobre o seu foco e progresso.</div>
              </div>
              <input type='checkbox' checked={safeConfig.enableSincereOwl} onChange={() => handleToggle('enableSincereOwl')} className='w-6 h-6 accent-blue-500' />
            </label>
`;

tabs = tabs.replace(
  /<div className='font-bold' style=\{\{ color: T\.ink \}\}><PartyPopper size=\{20\} className="inline mr-2 -mt-1" \/> Animações de Conclusão<\/div>/,
  owlToggleHtml.trim() + '\n\n            <label className=\'flex items-center justify-between p-4 rounded-xl border cursor-pointer hover:opacity-80 transition-opacity\' style={{ borderColor: T.border, backgroundColor: T.bg }}>\n              <div>\n                <div className=\'font-bold\' style={{ color: T.ink }}><PartyPopper size={20} className="inline mr-2 -mt-1" /> Animações de Conclusão</div>'
);

fs.writeFileSync('src/components/Tabs.jsx', tabs, 'utf8');
console.log("Added Coruja Sincera toggle!");
