const fs = require('fs');
let code = fs.readFileSync('src/components/Tabs.jsx', 'utf8');

const templatesStr = `{showTemplates && <RoutineTemplatesModal onClose={() => setShowTemplates(false)} onAddBlock={onAddBlock} T={T} />}`;
code = code.replace(templatesStr, '');

code = code.replace(
  /export function RotinaTab\(\{.*?\}\) \{[\s\S]*?return \(\s*<div className="space-y-4">/,
  `$&\n      ${templatesStr}`
);

const diarioStart = `        {/* Diário de Bordo (Idea 36 & 38) */}`;
const diarioEndStr = `          </div>\n        )}\n`;
const diarioStartIndex = code.indexOf(diarioStart);
const diarioEndIndex = code.indexOf(diarioEndStr, diarioStartIndex) + diarioEndStr.length;
const diarioBlock = code.substring(diarioStartIndex, diarioEndIndex);

code = code.replace(diarioBlock, '');

const targetStr = `    </Card>\n  );\n}\n\n/* ---------------------------------------------------------------------- */\n/* Aba: Inbox`;
code = code.replace(
  targetStr,
  diarioBlock + `\n` + targetStr
);

fs.writeFileSync('src/components/Tabs.jsx', code, 'utf8');
