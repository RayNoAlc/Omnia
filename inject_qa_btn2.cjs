const fs = require('fs');
let tabs = fs.readFileSync('src/components/Tabs.jsx', 'utf8');

tabs = tabs.replace(
  /import \{ callVision, callAudioTranscription, callAIWithTools \} from "\.\.\/lib\/ai";/,
  `import { callVision, callAudioTranscription, callAIWithTools } from "../lib/ai";\nimport { runQATour } from "../lib/qaTour";`
);

const qaBtnHtml = `
              {isDev && (
              <div className='flex items-center justify-between p-4 rounded-xl border mt-4' style={{ borderColor: T.border, backgroundColor: T.brand + '22' }}>
                <div>
                  <div className='font-bold flex items-center gap-2' style={{ color: T.ink }}><Activity size={20} /> Teste E2E Visual (QA)</div>
                  <div className='text-sm mt-1' style={{ color: T.inkSoft }}>Inicia um robô invisível que clica na tela e audita todas as abas.</div>
                </div>
                <PrimaryButton onClick={() => runQATour()}>Rodar QA Tour</PrimaryButton>
              </div>
              )}
`;

tabs = tabs.replace(
  /<div className='flex items-center justify-between p-4 rounded-xl border mt-4' style=\{\{ borderColor: T\.critico \+ '44'/,
  qaBtnHtml + "\n              <div className='flex items-center justify-between p-4 rounded-xl border mt-4' style={{ borderColor: T.critico + '44'"
);

fs.writeFileSync('src/components/Tabs.jsx', tabs, 'utf8');
console.log("Injected properly!");
