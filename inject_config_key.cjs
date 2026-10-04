const fs = require('fs');
let tabs = fs.readFileSync('src/components/Tabs.jsx', 'utf8');

const keyInputHtml = `
            <div className='p-4 rounded-xl border' style={{ borderColor: T.border, backgroundColor: T.bg }}>
              <div className='font-bold mb-2' style={{ color: T.importante }}>🔑 Chave de API da IA (Opcional)</div>
              <div className='text-sm mb-3' style={{ color: T.inkSoft }}>Insira sua própria chave da Groq para ter limite ilimitado e não dividir a cota com os outros alunos. (Deixe em branco para usar a chave padrão).</div>
              <input type='password' placeholder='gsk_...' value={safeConfig.groqApiKey || ""} onChange={(e) => updateConfig({ ...safeConfig, groqApiKey: e.target.value })} className='w-full p-2 rounded text-sm' style={{ backgroundColor: T.surfaceAlt, color: T.ink, border: \`1px solid \${T.border}\` }} />
            </div>
`;

tabs = tabs.replace(
  'return (\n      <div className=\'max-w-3xl mx-auto space-y-6\'>',
  'return (\n      <div className=\'max-w-3xl mx-auto space-y-6\'>\n' + keyInputHtml
);

fs.writeFileSync('src/components/Tabs.jsx', tabs, 'utf8');
