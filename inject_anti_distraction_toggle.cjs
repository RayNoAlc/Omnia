const fs = require('fs');
let tabs = fs.readFileSync('src/components/Tabs.jsx', 'utf8');

const toggleHtml = `
            <label className='flex items-center justify-between p-4 rounded-xl border cursor-pointer hover:opacity-80 transition-opacity' style={{ borderColor: T.border, backgroundColor: T.bg }}>
              <div>
                <div className='font-bold' style={{ color: T.ink }}><ShieldAlert size={20} className="inline mr-2 -mt-1" /> Alerta Anti-Distração</div>
                <div className='text-sm mt-1' style={{ color: T.inkSoft }}>Receba uma notificação dura se você mudar de aba enquanto o cronômetro de Foco estiver rodando.</div>
              </div>
              <input type='checkbox' checked={safeConfig.enableAntiDistraction !== false} onChange={() => handleToggle('enableAntiDistraction')} className='w-6 h-6 accent-blue-500' />
            </label>
`;

tabs = tabs.replace(
  /<label className='flex items-center justify-between p-4 rounded-xl border cursor-pointer hover:opacity-80 transition-opacity' style=\{\{ borderColor: T\.border, backgroundColor: T\.bg \}\}>\s*<div>\s*<div className='font-bold' style=\{\{ color: T\.ink \}\}><Archive size=\{20\} className="inline mr-2 -mt-1" \/> Mostrar Arquivados \(Baú\)<\/div>/,
  toggleHtml + '\n            <label className=\'flex items-center justify-between p-4 rounded-xl border cursor-pointer hover:opacity-80 transition-opacity\' style={{ borderColor: T.border, backgroundColor: T.bg }}>\n              <div>\n                <div className=\'font-bold\' style={{ color: T.ink }}><Archive size={20} className="inline mr-2 -mt-1" /> Mostrar Arquivados (Baú)</div>'
);

// We need to import ShieldAlert
if (!tabs.includes('ShieldAlert,')) {
  tabs = tabs.replace(/import \{\s*/, 'import {\n  ShieldAlert, ');
}

fs.writeFileSync('src/components/Tabs.jsx', tabs, 'utf8');
console.log("Injected Anti-Distraction toggle!");
