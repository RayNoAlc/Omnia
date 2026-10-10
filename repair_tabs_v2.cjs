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
const diarioEndStr = `          </div>\n        )}\n`;
const diarioStartIndex = code.indexOf(diarioStart);
const diarioEndIndex = code.indexOf(diarioEndStr, diarioStartIndex) + diarioEndStr.length;

const diarioBlock = code.substring(diarioStartIndex, diarioEndIndex);

// Remove the block
code = code.replace(diarioBlock, '');

// Insert it at the end of HojeTab
// Find the end of HojeTab. HojeTab ends with:
//         </Card>
//       </div>
//     );
//   }
//   
//   /* ---------------------------------------------------------------------- */
//   /* Aba: Inbox                                                             */
const inboxStart = `/* Aba: Inbox`;
const endOfHojeTabStr = `\n    );\n  }\n\n  /* ---------------------------------------------------------------------- */\n  /* Aba: Inbox`;

// We inject the diario block right before the closing div of HojeTab!
// HojeTab's return statement:
// return (
//   <div className="space-y-4">
//      ...
//      {/* end of HojeTab */}
//   </div>
// );

code = code.replace(
  /(\s*)<\/div>\s*\);\s*\}\s*\/\* ---------------------------------------------------------------------- \*\/\s*\/\* Aba: Inbox/,
  `\n${diarioBlock}$1</div>\n  );\n}\n\n/* ---------------------------------------------------------------------- */\n/* Aba: Inbox`
);

fs.writeFileSync('src/components/Tabs.jsx', code, 'utf8');
console.log("Moved misplaced UI elements to their proper components!");
