const fs = require('fs');
let tabs = fs.readFileSync('src/components/Tabs.jsx', 'utf8');

const configTabCode = "export function ConfigTab({ config, updateConfig }) {\n" +
"  const handleToggle = (key) => {\n" +
"    updateConfig({ ...config, [key]: !config[key] });\n" +
"  };\n" +
"  return (\n" +
"    <div className='max-w-3xl mx-auto space-y-6'>\n" +
"      <h2 className='text-3xl font-bold mb-6' style={{ color: T.ink }}>Configurações</h2>\n" +
"\n" +
"      <section className='p-6 rounded-2xl shadow-sm border' style={{ backgroundColor: T.surface, borderColor: T.border }}>\n" +
"        <div className='flex items-center gap-3 mb-4'>\n" +
"          <Palette className='w-6 h-6' style={{ color: T.brand }} />\n" +
"          <h3 className='text-xl font-bold' style={{ color: T.ink }}>Aparência e Temas</h3>\n" +
"        </div>\n" +
"        <p className='mb-6' style={{ color: T.inkSoft }}>Personalize as cores do aplicativo. A logo se ajustará automaticamente ao tema escolhido.</p>\n" +
"        \n" +
"        <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>\n" +
"          {Object.keys(THEMES).map(t => (\n" +
"            <button key={t} onClick={() => applyTheme(t)} className='flex items-center justify-between p-4 rounded-xl border hover:opacity-80 transition-opacity'\n" +
"              style={{ backgroundColor: THEMES[t].bg, borderColor: THEMES[t].border }}>\n" +
"              <span className='font-bold capitalize' style={{ color: THEMES[t].ink }}>{t === 'dark' ? 'Omnia Dark' : t === 'light' ? 'Omnia Light' : t === 'cyberpunk' ? 'Cyberpunk Neon' : 'Lo-Fi Café'}</span>\n" +
"              <div className='flex gap-2'>\n" +
"                <div className='w-5 h-5 rounded-full shadow-sm' style={{ backgroundColor: THEMES[t].brand }}></div>\n" +
"                <div className='w-5 h-5 rounded-full shadow-sm' style={{ backgroundColor: THEMES[t].surface }}></div>\n" +
"              </div>\n" +
"            </button>\n" +
"          ))}\n" +
"        </div>\n" +
"      </section>\n" +
"\n" +
"      <section className='p-6 rounded-2xl shadow-sm border' style={{ backgroundColor: T.surface, borderColor: T.border }}>\n" +
"        <div className='flex items-center gap-3 mb-4'>\n" +
"          <Settings className='w-6 h-6' style={{ color: T.brand }} />\n" +
"          <h3 className='text-xl font-bold' style={{ color: T.ink }}>Módulos Opcionais</h3>\n" +
"        </div>\n" +
"        <p className='mb-6' style={{ color: T.inkSoft }}>Ative ou desative funcionalidades secundárias para manter a interface limpa e objetiva.</p>\n" +
"\n" +
"        <div className='space-y-4'>\n" +
"          <label className='flex items-center justify-between p-4 rounded-xl border cursor-pointer hover:opacity-80 transition-opacity' style={{ borderColor: T.border, backgroundColor: T.bg }}>\n" +
"            <div>\n" +
"              <div className='font-bold' style={{ color: T.ink }}>🎮 Gamificação Completa</div>\n" +
"              <div className='text-sm mt-1' style={{ color: T.inkSoft }}>Aba Desempenho, XP, Nível e Streak.</div>\n" +
"            </div>\n" +
"            <input type='checkbox' checked={config.enableGamification} onChange={() => handleToggle('enableGamification')} className='w-6 h-6 accent-blue-500' />\n" +
"          </label>\n" +
"\n" +
"          <label className='flex items-center justify-between p-4 rounded-xl border cursor-pointer hover:opacity-80 transition-opacity' style={{ borderColor: T.border, backgroundColor: T.bg }}>\n" +
"            <div>\n" +
"              <div className='font-bold' style={{ color: T.ink }}>🎧 Modo Imersivo Lo-Fi</div>\n" +
"              <div className='text-sm mt-1' style={{ color: T.inkSoft }}>Player de música ambiente integrado na aba Foco.</div>\n" +
"            </div>\n" +
"            <input type='checkbox' checked={config.enableLofi} onChange={() => handleToggle('enableLofi')} className='w-6 h-6 accent-blue-500' />\n" +
"          </label>\n" +
"\n" +
"          <label className='flex items-center justify-between p-4 rounded-xl border cursor-pointer hover:opacity-80 transition-opacity' style={{ borderColor: T.border, backgroundColor: T.bg }}>\n" +
"            <div>\n" +
"              <div className='font-bold' style={{ color: T.ink }}>📅 Sincronizar Calendário (Google/Apple)</div>\n" +
"              <div className='text-sm mt-1' style={{ color: T.inkSoft }}>Botão para exportar arquivos .ics da Rotina.</div>\n" +
"            </div>\n" +
"            <input type='checkbox' checked={config.enableCalendar} onChange={() => handleToggle('enableCalendar')} className='w-6 h-6 accent-blue-500' />\n" +
"          </label>\n" +
"\n" +
"          <label className='flex items-center justify-between p-4 rounded-xl border cursor-pointer hover:opacity-80 transition-opacity' style={{ borderColor: T.border, backgroundColor: T.bg }}>\n" +
"            <div>\n" +
"              <div className='font-bold' style={{ color: T.ink }}>📄 Gerar PDF da Rotina</div>\n" +
"              <div className='text-sm mt-1' style={{ color: T.inkSoft }}>Botão para baixar a Tabela de Horários em PDF.</div>\n" +
"            </div>\n" +
"            <input type='checkbox' checked={config.enablePdf} onChange={() => handleToggle('enablePdf')} className='w-6 h-6 accent-blue-500' />\n" +
"          </label>\n" +
"        </div>\n" +
"      </section>\n" +
"    </div>\n" +
"  );\n" +
"}\n\n";

tabs = tabs + '\n\n' + configTabCode;

// Fix imports to include Settings, THEMES, applyTheme
if (!tabs.includes('Settings')) {
  tabs = tabs.replace('import { Home, Inbox as InboxIcon', 'import { Settings, Home, Inbox as InboxIcon');
}
if (!tabs.includes('THEMES')) {
  tabs = tabs.replace('import { T, TINT } from "./ui";', 'import { T, TINT, THEMES, applyTheme } from "./ui";');
}

fs.writeFileSync('src/components/Tabs.jsx', tabs, 'utf8');
