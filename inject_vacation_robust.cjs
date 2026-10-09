const fs = require('fs');
let tabs = fs.readFileSync('src/components/Tabs.jsx', 'utf8');

// Find the string "Rodar Tour</PrimaryButton>" and append the vacation logic above it.
let parts = tabs.split("Rodar Tour</PrimaryButton>");
if(parts.length > 1) {
  const vacationHtml = `\n            <label className='flex items-center justify-between p-4 rounded-xl border cursor-pointer hover:opacity-80 transition-opacity' style={{ borderColor: T.border, backgroundColor: T.brand + '22' }}>
              <div>
                <div className='font-bold' style={{ color: T.ink }}>🌴 Modo Férias (Burnout)</div>
                <div className='text-sm mt-1' style={{ color: T.inkSoft }}>Pausa streaks e zera metas para você descansar sem culpa.</div>
              </div>
              <input type='checkbox' checked={safeConfig.vacationMode} onChange={() => handleToggle('vacationMode')} className='w-6 h-6 accent-blue-500' />
            </label>\n`;
  parts[0] = parts[0] + "Rodar Tour</PrimaryButton>\n" + vacationHtml;
  tabs = parts.join("");
  console.log("Injected vacation toggle");
}

let parts2 = tabs.split("const hasNotStudiedYet = sessionToday === 0;");
if (parts2.length > 1) {
  tabs = parts2[0] + "const hasNotStudiedYet = sessionToday === 0;\n  const isVacation = props.config?.vacationMode;\n" + parts2[1];
  console.log("Injected isVacation");
}

let parts3 = tabs.split("const percent = metaHoje > 0 ? Math.min((sessionToday / metaHoje) * 100, 100) : 0;");
if (parts3.length > 1) {
  tabs = parts3[0] + "const percent = (isVacation || metaHoje <= 0) ? 100 : Math.min((sessionToday / metaHoje) * 100, 100);\n" + parts3[1];
  console.log("Injected percent override");
}

let parts4 = tabs.split('<div className="w-full flex justify-between items-center gap-2 mb-6">');
if (parts4.length > 1) {
  const bannerHtml = `
      {isVacation && (
        <div className="p-4 mb-4 rounded-xl shadow-sm text-center animate-pulse" style={{ backgroundColor: T.brand + '22', color: T.brand, border: \`1px solid \${T.brand}\` }}>
          <h3 className="font-bold text-lg">🌴 Modo Férias Ativado</h3>
          <p className="text-sm">Seus streaks estão congelados. Aproveite para recarregar as energias!</p>
        </div>
      )}
`;
  tabs = parts4[0] + bannerHtml + '<div className="w-full flex justify-between items-center gap-2 mb-6">' + parts4[1];
  console.log("Injected banner");
}

fs.writeFileSync('src/components/Tabs.jsx', tabs, 'utf8');
