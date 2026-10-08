const fs = require('fs');

// Add import confetti to App.jsx
let app = fs.readFileSync('src/App.jsx', 'utf8');
if (!app.includes('import confetti')) {
  app = app.replace(
    /import \{ T \} from "\.\/components\/ui";/,
    'import { T } from "./components/ui";\nimport confetti from "canvas-confetti";'
  );
}

// Modify handleToggleBlock in App.jsx
app = app.replace(
  /async function handleToggleBlock\(id\) \{\s*const block = studyBlocks\.find\(\(b\) => b\.id === id\);\s*if \(\!block\) return;\s*await toggleBlockDone\(id, \!block\.done\);\s*setStudyBlocks\(\(prev\) => prev\.map\(\(b\) => \(b\.id === id \? \{ \.\.\.b, done: \!b\.done \} : b\)\)\);\s*\}/,
  `async function handleToggleBlock(id) {
    const block = studyBlocks.find((b) => b.id === id);
    if (!block) return;
    if (!block.done && config?.enableConfetti !== false) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#3b82f6', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6'],
        zIndex: 9999
      });
    }
    await toggleBlockDone(id, !block.done);
    setStudyBlocks((prev) => prev.map((b) => (b.id === id ? { ...b, done: !b.done } : b)));
  }`
);
fs.writeFileSync('src/App.jsx', app, 'utf8');

// Update ConfigTab in Tabs.jsx to add enableConfetti
let tabs = fs.readFileSync('src/components/Tabs.jsx', 'utf8');

// Add PartyPopper to lucide-react import
if (!tabs.includes('PartyPopper')) {
  tabs = tabs.replace(/import \{\s*/, 'import {\n  PartyPopper, ');
}

// Add to safeConfig
tabs = tabs.replace(
  /const safeConfig = \{ enablePdf: true, enableCalendar: true, enableGamification: true, enableLofi: true, \.\.\.\(config \|\| \{\}\) \};/,
  'const safeConfig = { enableConfetti: true, enablePdf: true, enableCalendar: true, enableGamification: true, enableLofi: true, ...(config || {}) };'
);

// Add the UI toggle
tabs = tabs.replace(
  /<section className='p-6 rounded-2xl shadow-sm border' style=\{\{ backgroundColor: T\.surface, borderColor: T\.border \}\}>\s*<div className='flex items-center gap-3 mb-4'>\s*<Settings className='w-6 h-6' style=\{\{ color: T\.brand \}\} \/>\s*<h3 className='text-xl font-bold' style=\{\{ color: T\.ink \}\}>Módulos Opcionais<\/h3>\s*<\/div>\s*<p className='mb-6' style=\{\{ color: T\.inkSoft \}\}>Ative ou desative funcionalidades secundárias para manter a interface limpa e objetiva\.<\/p>\s*<div className='space-y-4'>/,
  `<section className='p-6 rounded-2xl shadow-sm border' style={{ backgroundColor: T.surface, borderColor: T.border }}>
          <div className='flex items-center gap-3 mb-4'>
            <Settings className='w-6 h-6' style={{ color: T.brand }} />
            <h3 className='text-xl font-bold' style={{ color: T.ink }}>Módulos Opcionais</h3>
          </div>
          <p className='mb-6' style={{ color: T.inkSoft }}>Ative ou desative funcionalidades secundárias para manter a interface limpa e objetiva.</p>
  
          <div className='space-y-4'>
            <label className='flex items-center justify-between p-4 rounded-xl border cursor-pointer hover:opacity-80 transition-opacity' style={{ borderColor: T.border, backgroundColor: T.bg }}>
              <div>
                <div className='font-bold' style={{ color: T.ink }}><PartyPopper size={20} className="inline mr-2 -mt-1" /> Animações de Conclusão</div>
                <div className='text-sm mt-1' style={{ color: T.inkSoft }}>Disparar confetes ao marcar tarefas como concluídas.</div>
              </div>
              <input type='checkbox' checked={safeConfig.enableConfetti} onChange={() => handleToggle('enableConfetti')} className='w-6 h-6 accent-blue-500' />
            </label>`
);

fs.writeFileSync('src/components/Tabs.jsx', tabs, 'utf8');
console.log("Added Confetti toggle!");
