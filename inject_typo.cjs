const fs = require('fs');

// Update App.jsx wrapper div
let app = fs.readFileSync('src/App.jsx', 'utf8');
app = app.replace(
  /<div className="flex h-screen overflow-hidden" style=\{\{ backgroundColor: T\.bg, color: T\.ink, transition: "background-color 0\.3s" \}\}>/,
  '<div className="flex h-screen overflow-hidden" style={{ backgroundColor: T.bg, color: T.ink, transition: "background-color 0.3s", fontFamily: config?.fontFamily || "Inter, sans-serif" }}>'
);
fs.writeFileSync('src/App.jsx', app, 'utf8');

// Update Tabs.jsx to add typography selector
let tabs = fs.readFileSync('src/components/Tabs.jsx', 'utf8');

// Add to safeConfig
tabs = tabs.replace(
  /const safeConfig = \{ enableConfetti: true, enablePdf: true, enableCalendar: true, enableGamification: true, enableLofi: true, \.\.\.\(config \|\| \{\}\) \};/,
  'const safeConfig = { fontFamily: "Inter, sans-serif", enableConfetti: true, enablePdf: true, enableCalendar: true, enableGamification: true, enableLofi: true, ...(config || {}) };'
);

// Add Typography icon to lucide-react if needed (let's use Type)
if (!tabs.includes('Type,')) {
  tabs = tabs.replace(/import \{\s*/, 'import {\n  Type, ');
}

// Add the UI section for typography right below themes
const typoHtml = `
        <section className='p-6 rounded-2xl shadow-sm border' style={{ backgroundColor: T.surface, borderColor: T.border }}>
          <div className='flex items-center gap-3 mb-4'>
            <Type className='w-6 h-6' style={{ color: T.brand }} />
            <h3 className='text-xl font-bold' style={{ color: T.ink }}>Tipografia e Fontes</h3>
          </div>
          <p className='mb-6' style={{ color: T.inkSoft }}>Escolha a fonte que mais lhe agrada para leitura e foco.</p>
          
          <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
            {[
              { id: "Inter, sans-serif", name: "Padrão (Inter)", desc: "Limpa e moderna" },
              { id: "Georgia, serif", name: "Foco (Serifada)", desc: "Estilo livro clássico" },
              { id: "monospace", name: "Terminal", desc: "Monoespaçada para devs" },
              { id: "Comic Sans MS, cursive", name: "Relaxada", desc: "Divertida e informal" }
            ].map(f => (
              <button key={f.id} onClick={() => updateConfig({ ...safeConfig, fontFamily: f.id })} className='flex flex-col items-start p-4 rounded-xl border hover:opacity-80 transition-all'
                style={{ backgroundColor: safeConfig.fontFamily === f.id ? T.brand + '22' : T.surfaceAlt, borderColor: safeConfig.fontFamily === f.id ? T.brand : T.border, fontFamily: f.id }}>
                <span className='font-bold' style={{ color: T.ink }}>{f.name}</span>
                <span className='text-xs mt-1' style={{ color: T.inkSoft }}>{f.desc}</span>
              </button>
            ))}
          </div>
        </section>
`;

tabs = tabs.replace(
  /<\/section>\s*<section className='p-6 rounded-2xl shadow-sm border' style=\{\{ backgroundColor: T\.surface, borderColor: T\.border \}\}>\s*<div className='flex items-center gap-3 mb-4'>\s*<Settings className='w-6 h-6'/g,
  `</section>\n${typoHtml}\n\n        <section className='p-6 rounded-2xl shadow-sm border' style={{ backgroundColor: T.surface, borderColor: T.border }}>\n          <div className='flex items-center gap-3 mb-4'>\n            <Settings className='w-6 h-6'`
);

fs.writeFileSync('src/components/Tabs.jsx', tabs, 'utf8');
console.log("Added Typography toggle!");
