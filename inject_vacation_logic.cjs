const fs = require('fs');
let tabs = fs.readFileSync('src/components/Tabs.jsx', 'utf8');

// Replace using literal string split
const target = "className='w-6 h-6 accent-blue-500' />\n            </label>";
const pieces = tabs.split(target);
if (pieces.length > 1) {
  const vacationHtml = `\n            <label className='flex items-center justify-between p-4 rounded-xl border cursor-pointer hover:opacity-80 transition-opacity' style={{ borderColor: T.border, backgroundColor: T.brand + '22' }}>
              <div>
                <div className='font-bold' style={{ color: T.ink }}>🌴 Modo Férias (Burnout)</div>
                <div className='text-sm mt-1' style={{ color: T.inkSoft }}>Pausa streaks e zera metas para você descansar sem culpa.</div>
              </div>
              <input type='checkbox' checked={safeConfig.vacationMode} onChange={() => handleToggle('vacationMode')} className='w-6 h-6 accent-blue-500' />
            </label>\n`;
  tabs = pieces[0] + target + vacationHtml + pieces.slice(1).join(target);
}

// Modify HojeTab to respect vacationMode
tabs = tabs.replace(
  /const hasNotStudiedYet = sessionToday === 0;/,
  "const hasNotStudiedYet = sessionToday === 0;\n  const isVacation = props.config?.vacationMode;"
);

// Show banner
const bannerHtml = `
      {isVacation && (
        <div className="p-4 mb-4 rounded-xl shadow-sm text-center animate-pulse" style={{ backgroundColor: T.brand + '22', color: T.brand, border: \`1px solid \${T.brand}\` }}>
          <h3 className="font-bold text-lg">🌴 Modo Férias Ativado</h3>
          <p className="text-sm">Seus streaks estão congelados. Aproveite para recarregar as energias!</p>
        </div>
      )}
`;

tabs = tabs.replace(
  /<div className="w-full flex justify-between items-center gap-2 mb-6">/,
  bannerHtml + '\n      <div className="w-full flex justify-between items-center gap-2 mb-6">'
);

// Override target
tabs = tabs.replace(
  /const percent = metaHoje > 0 \? Math\.min\(\(sessionToday \/ metaHoje\) \* 100, 100\) : 0;/,
  "const percent = (isVacation || metaHoje <= 0) ? 100 : Math.min((sessionToday / metaHoje) * 100, 100);"
);

// Override Pet status inside FocoTab? No, FocoTab just uses FocusPet. In Tabs.jsx:
// Find FocusPet component, if vacationMode is true, set status to "De férias!"
tabs = tabs.replace(
  /else if \(streak > 5\) \{ position = "100%"; status = "Mestre da Rotina"; \}/,
  'else if (config?.vacationMode) { position = "0%"; status = "De férias 🌴"; }\n  else if (streak > 5) { position = "100%"; status = "Mestre da Rotina"; }'
);

fs.writeFileSync('src/components/Tabs.jsx', tabs, 'utf8');
console.log("Injected Vacation Mode logic completely!");
