const fs = require('fs');
let tabs = fs.readFileSync('src/components/Tabs.jsx', 'utf8');

const vacationHtml = `
            <label className='flex items-center justify-between p-4 rounded-xl border cursor-pointer hover:opacity-80 transition-opacity' style={{ borderColor: T.border, backgroundColor: T.brand + '22' }}>
              <div>
                <div className='font-bold' style={{ color: T.ink }}>🌴 Modo Férias (Burnout)</div>
                <div className='text-sm mt-1' style={{ color: T.inkSoft }}>Pausa streaks e zera metas para você descansar sem culpa.</div>
              </div>
              <input type='checkbox' checked={safeConfig.vacationMode} onChange={() => handleToggle('vacationMode')} className='w-6 h-6 accent-blue-500' />
            </label>
`;

tabs = tabs.replace(
  /<label className='flex items-center justify-between p-4 rounded-xl border cursor-pointer hover:opacity-80 transition-opacity' style=\{\{ borderColor: T\.border, backgroundColor: T\.bg \}\}>\s*<div>\s*<div className='font-bold' style=\{\{ color: T\.ink \}\}><BarChart/,
  vacationHtml + '\n\n$&'
);

fs.writeFileSync('src/components/Tabs.jsx', tabs, 'utf8');
console.log("Injected via BarChart!");
