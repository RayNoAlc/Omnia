const fs = require('fs');
let tabs = fs.readFileSync('src/components/Tabs.jsx', 'utf8');

const apiKeySection = `
        <section className='p-6 rounded-2xl shadow-sm border' style={{ backgroundColor: T.surface, borderColor: T.border }}>
          <div className='flex items-center gap-3 mb-4'>
            <h3 className='text-xl font-bold' style={{ color: T.ink }}>🔑 Inteligência Artificial</h3>
          </div>
          <p className='mb-4 text-sm' style={{ color: T.inkSoft }}>Insira sua própria chave de API da Groq para ter limite de uso individual, independente dos outros usuários. Deixe em branco para usar a chave padrão do Omnia.</p>
          <a href='https://console.groq.com/keys' target='_blank' rel='noopener noreferrer' className='text-xs underline mb-4 block' style={{ color: T.brand }}>→ Criar chave gratuita em console.groq.com/keys</a>
          <input
            type='password'
            placeholder='gsk_...'
            value={safeConfig.groqApiKey || ''}
            onChange={(e) => updateConfig({ ...safeConfig, groqApiKey: e.target.value })}
            className='w-full p-3 rounded-xl text-sm'
            style={{ backgroundColor: T.surfaceAlt, color: T.ink, border: \`1px solid \${T.border}\` }}
          />
          {safeConfig.groqApiKey && <p className='text-xs mt-2' style={{ color: T.brand }}>✓ Chave pessoal configurada</p>}
        </section>
`;

tabs = tabs.replace(
  "          </div>\n        </section>\n      </div>\n    );\n  }",
  "          </div>\n        </section>\n" + apiKeySection + "\n      </div>\n    );\n  }"
);

fs.writeFileSync('src/components/Tabs.jsx', tabs, 'utf8');
