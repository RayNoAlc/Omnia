const fs = require('fs');

let layout = fs.readFileSync('src/layouts/AppLayout.jsx', 'utf8');
layout = layout.replace(
  /export function AppLayout\(\{ activeTab, onTabChange, TABS, onLogout, children \}\) \{/,
  'export function AppLayout({ activeTab, onTabChange, TABS, onLogout, isZen, children }) {'
);

layout = layout.replace(
  /<aside className='hidden md:flex w-64 flex-col border-r shadow-lg relative z-20' style=\{\{ backgroundColor: T\.surface, borderColor: T\.border \}\}>/,
  "<aside className={`hidden ${isZen ? '' : 'md:flex'} w-64 flex-col border-r shadow-lg relative z-20`} style={{ backgroundColor: T.surface, borderColor: T.border }}>"
);

layout = layout.replace(
  /<header className='md:hidden flex items-center justify-between p-4 border-b' style=\{\{ backgroundColor: T\.surface, borderColor: T\.border \}\}>/,
  "<header className={`${isZen ? 'hidden' : 'md:hidden'} flex items-center justify-between p-4 border-b`} style={{ backgroundColor: T.surface, borderColor: T.border }}>"
);

fs.writeFileSync('src/layouts/AppLayout.jsx', layout, 'utf8');
console.log("Updated AppLayout!");
