const fs = require('fs');
let code = fs.readFileSync('src/components/Tabs.jsx', 'utf8');

// 1. Move showTemplates from InboxTab to RotinaTab
const templatesStr = `{showTemplates && <RoutineTemplatesModal onClose={() => setShowTemplates(false)} onAddBlock={onAddBlock} T={T} />}`;
code = code.replace(templatesStr, '');

code = code.replace(
  /export function RotinaTab\(\{.*?\}\) \{[\s\S]*?return \(\s*<div className="space-y-4">/,
  `$&\n      ${templatesStr}`
);

// 2. Extract Diário de Bordo from PlanosAtivos
const diarioStart = `        {/* Diário de Bordo (Idea 36 & 38) */}`;
const diarioStartIndex = code.indexOf(diarioStart);
if (diarioStartIndex !== -1) {
  // Find where the next function starts after PlanosAtivos
  const agendaStartIndex = code.indexOf('export function AgendaTab', diarioStartIndex);
  
  // Extract the Diario HTML block
  // It is between diarioStart and the </div> of PlanosAtivos
  const diarioEndStr = `          </div>\n        )}\n`;
  const diarioEndIndex = code.indexOf(diarioEndStr, diarioStartIndex) + diarioEndStr.length;
  
  const diarioBlock = code.substring(diarioStartIndex, diarioEndIndex);
  code = code.replace(diarioBlock, '');
  
  // Put it at the bottom of HojeTab
  // HojeTab ends around:
  //         </Card>
  //       ))}
  //     </div>
  //   );
  // }
  
  // Let's match the end of HojeTab
  code = code.replace(
    /(\s*<\/div>\s*);\s*\}\s*\/\* ---------------------------------------------------------------------- \*\/\s*\/\* Aba: Inbox/,
    `\n\n${diarioBlock}$1;\n}\n\n/* ---------------------------------------------------------------------- */\n/* Aba: Inbox`
  );
}

fs.writeFileSync('src/components/Tabs.jsx', code, 'utf8');
console.log("Moved misplaced UI elements to their proper components!");
