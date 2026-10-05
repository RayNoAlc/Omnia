const fs = require('fs');

// 1. Fix AppLayout.jsx
let appLayout = fs.readFileSync('src/layouts/AppLayout.jsx', 'utf8');
appLayout = appLayout.replace(
  /className='flex-1 overflow-y-auto custom-scrollbar md:pt-0 pt-16 relative bg-gradient-to-br from-\[var\(--bg-from\)\] to-\[var\(--bg-to\)\]' style=\{\{ '--bg-from': T\.bg, '--bg-to': '#0f172a' \}\}/,
  "className='flex-1 overflow-y-auto custom-scrollbar md:pt-0 pt-16 relative' style={{ backgroundColor: T.bg }}"
);
fs.writeFileSync('src/layouts/AppLayout.jsx', appLayout, 'utf8');

// 2. Fix App.jsx loading screen
let app = fs.readFileSync('src/App.jsx', 'utf8');
app = app.replace(
  /style=\{\{ background: `radial-gradient\(1200px 600px at 15% -10%, #172554 0%, \$\{T\.bg\} 55%\)` \}\}/g,
  "style={{ backgroundColor: T.bg }}"
);
fs.writeFileSync('src/App.jsx', app, 'utf8');

console.log("Fixed hardcoded gradients in AppLayout and App.jsx!");
