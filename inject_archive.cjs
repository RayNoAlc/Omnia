const fs = require('fs');
let tabs = fs.readFileSync('src/components/Tabs.jsx', 'utf8');

// Add "Mostrar Arquivados" toggle in ConfigTab
const archiveHtml = `
            <label className='flex items-center justify-between p-4 rounded-xl border cursor-pointer hover:opacity-80 transition-opacity' style={{ borderColor: T.border, backgroundColor: T.bg }}>
              <div>
                <div className='font-bold' style={{ color: T.ink }}><Archive size={20} className="inline mr-2 -mt-1" /> Mostrar Arquivados (Baú)</div>
                <div className='text-sm mt-1' style={{ color: T.inkSoft }}>Exibir notas e compromissos que contêm a tag #arquivado. Útil para consultar semestres passados.</div>
              </div>
              <input type='checkbox' checked={safeConfig.showArchived} onChange={() => handleToggle('showArchived')} className='w-6 h-6 accent-blue-500' />
            </label>
`;

tabs = tabs.replace(
  /<div className='space-y-4'>/,
  '<div className=\'space-y-4\'>\n' + archiveHtml
);

// We need to import Archive
if (!tabs.includes('Archive,')) {
  tabs = tabs.replace(/import \{\s*/, 'import {\n  Archive, ');
}

fs.writeFileSync('src/components/Tabs.jsx', tabs, 'utf8');
console.log("Injected Archive toggle!");
