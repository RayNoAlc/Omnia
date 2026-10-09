const fs = require('fs');
let tabs = fs.readFileSync('src/components/Tabs.jsx', 'utf8');

// Adiciona import
tabs = tabs.replace(
  /import \{ callAI, callAIWithTools \} from "\.\.\/lib\/ai";/,
  `import { callAI, callAIWithTools } from "../lib/ai";\nimport { runQATour } from "../lib/qaTour";`
);

// Adiciona botão na seção de Sistema / Dev
const qaBtnHtml = `
              <div className='flex items-center justify-between p-4 rounded-xl border mt-4' style={{ borderColor: T.border, backgroundColor: T.brand + '22' }}>
                <div>
                  <div className='font-bold flex items-center gap-2' style={{ color: T.ink }}><Activity size={20} /> Teste E2E Visual (QA)</div>
                  <div className='text-sm mt-1' style={{ color: T.inkSoft }}>Inicia um "Fantasma" que viaja pelas abas clicando nos menus para auditoria de UI.</div>
                </div>
                <PrimaryButton onClick={() => runQATour()}>Rodar QA Tour</PrimaryButton>
              </div>
`;

tabs = tabs.replace(
  /<div className='font-bold' style=\{\{ color: T\.ink \}\}>Resetar Banco de Dados<\/div>/,
  qaBtnHtml + '\n                <div className="font-bold" style={{ color: T.ink }}>Resetar Banco de Dados</div>'
);

fs.writeFileSync('src/components/Tabs.jsx', tabs, 'utf8');
console.log("Injected QA Tour Button!");
