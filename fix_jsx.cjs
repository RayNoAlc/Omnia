const fs = require('fs');
let tabs = fs.readFileSync('src/components/Tabs.jsx', 'utf8');

const brokenRegex = /<label className='flex items-center justify-between p-4 rounded-xl border cursor-pointer hover:opacity-80 transition-opacity' style=\{\{ borderColor: T\.border, backgroundColor: T\.bg \}\}>\s*<div>\s*<label className='flex items-center justify-between p-4 rounded-xl border cursor-pointer hover:opacity-80 transition-opacity' style=\{\{ borderColor: T\.border, backgroundColor: T\.brand \+ '22' \}\}>[\s\S]*?<input type='checkbox' checked=\{safeConfig\.enableGamification\} onChange=\{\(\) => handleToggle\('enableGamification'\)\} className='w-6 h-6 accent-blue-500' \/>\s*<\/label>/;

const fixHtml = `
            <label className='flex items-center justify-between p-4 rounded-xl border cursor-pointer hover:opacity-80 transition-opacity' style={{ borderColor: T.border, backgroundColor: T.brand + '22' }}>
              <div>
                <div className='font-bold' style={{ color: T.ink }}>🌴 Modo Férias (Burnout)</div>
                <div className='text-sm mt-1' style={{ color: T.inkSoft }}>Pausa streaks e zera metas para você descansar sem culpa.</div>
              </div>
              <input type='checkbox' checked={safeConfig.vacationMode} onChange={() => handleToggle('vacationMode')} className='w-6 h-6 accent-blue-500' />
            </label>

            <label className='flex items-center justify-between p-4 rounded-xl border cursor-pointer hover:opacity-80 transition-opacity' style={{ borderColor: T.border, backgroundColor: T.bg }}>
              <div>
                <div className='font-bold' style={{ color: T.ink }}><Gamepad2 size={20} className="inline mr-2 -mt-1" /> Gamificação Completa</div>
                <div className='text-sm mt-1' style={{ color: T.inkSoft }}>Aba Desempenho, XP, Nível e Streak.</div>
              </div>
              <input type='checkbox' checked={safeConfig.enableGamification} onChange={() => handleToggle('enableGamification')} className='w-6 h-6 accent-blue-500' />
            </label>
`;

tabs = tabs.replace(brokenRegex, fixHtml);

fs.writeFileSync('src/components/Tabs.jsx', tabs, 'utf8');
console.log("Fixed broken JSX tags!");
