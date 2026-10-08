const fs = require('fs');
let tabs = fs.readFileSync('src/components/Tabs.jsx', 'utf8');

// Add BookHeart icon from lucide-react
if (!tabs.includes('BookHeart,')) {
  tabs = tabs.replace(/import \{\s*/, 'import {\n  BookHeart, Smile, ');
}

// Add enableJournal to safeConfig
tabs = tabs.replace(
  /const safeConfig = \{ fontFamily: "Inter, sans-serif", enableConfetti: true, enablePdf: true, enableCalendar: true, enableGamification: true, enableLofi: true, \.\.\.\(config \|\| \{\}\) \};/,
  'const safeConfig = { enableJournal: true, fontFamily: "Inter, sans-serif", enableConfetti: true, enablePdf: true, enableCalendar: true, enableGamification: true, enableLofi: true, ...(config || {}) };'
);

// Add the UI toggle for Diário de Bordo
const journalToggleHtml = `
            <label className='flex items-center justify-between p-4 rounded-xl border cursor-pointer hover:opacity-80 transition-opacity' style={{ borderColor: T.border, backgroundColor: T.bg }}>
              <div>
                <div className='font-bold' style={{ color: T.ink }}><BookHeart size={20} className="inline mr-2 -mt-1" /> Diário de Bordo e Humor</div>
                <div className='text-sm mt-1' style={{ color: T.inkSoft }}>Card na aba Hoje para registrar seu humor e pensamentos diários.</div>
              </div>
              <input type='checkbox' checked={safeConfig.enableJournal} onChange={() => handleToggle('enableJournal')} className='w-6 h-6 accent-blue-500' />
            </label>
`;

tabs = tabs.replace(
  /<div className='font-bold' style=\{\{ color: T\.ink \}\}><PartyPopper size=\{20\} className="inline mr-2 -mt-1" \/> Animações de Conclusão<\/div>/,
  journalToggleHtml.trim() + '\n\n            <label className=\'flex items-center justify-between p-4 rounded-xl border cursor-pointer hover:opacity-80 transition-opacity\' style={{ borderColor: T.border, backgroundColor: T.bg }}>\n              <div>\n                <div className=\'font-bold\' style={{ color: T.ink }}><PartyPopper size={20} className="inline mr-2 -mt-1" /> Animações de Conclusão</div>'
);

fs.writeFileSync('src/components/Tabs.jsx', tabs, 'utf8');
console.log("Added Journal toggle!");
