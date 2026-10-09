const fs = require('fs');
let tabs = fs.readFileSync('src/components/Tabs.jsx', 'utf8');

const btnHTML = `
  <div className='flex items-center justify-between p-4 rounded-xl border mt-4 mb-4' style={{ borderColor: T.border, backgroundColor: T.brand + '22' }}>
    <div>
      <div className='font-bold flex items-center gap-2' style={{ color: T.ink }}><Activity size={20} /> Teste E2E Visual (Tour QA)</div>
      <div className='text-sm mt-1' style={{ color: T.inkSoft }}>Inicia um robô invisível que clica na tela e faz um tour por todas as abas.</div>
    </div>
    <PrimaryButton onClick={() => runQATour()}>Rodar Tour</PrimaryButton>
  </div>
`;

tabs = tabs.replace(
  /async function runAllTests\(\) \{/,
  btnHTML + "\n\n  async function runAllTests() {"
);

fs.writeFileSync('src/components/Tabs.jsx', tabs, 'utf8');
console.log("Injected QA Tour in QAAutomatedSystem!");
