const fs = require('fs');
let file = 'src/components/Tabs.jsx';
let content = fs.readFileSync(file, 'utf8');

// Replace the button in 'Próximos Prazos'
content = content.replace(
  /<button key=\{c\.id\} onClick=\{onGoAgenda\} className="w-full text-left rounded-lg outline-none focus:outline-none transition-transform hover:scale-\[1\.02\] overflow-hidden bg-transparent">/,
  '<button key={c.id} onClick={onGoAgenda} className="w-full text-left outline-none focus:outline-none bg-transparent hover:bg-transparent group">'
);

// Add group-hover to the inner div
content = content.replace(
  /<div className="flex items-center justify-between p-3 rounded-lg" style=\{\{ backgroundColor: T\.surfaceAlt, border: `1px solid \$\{T\.border\}` \}\}>/,
  '<div className="flex items-center justify-between p-3 rounded-lg transition-transform group-hover:scale-[1.02] overflow-hidden" style={{ backgroundColor: T.surfaceAlt, border: `1px solid ${T.border}` }}>'
);

fs.writeFileSync(file, content, 'utf8');
console.log("Fixed button hover styles!");
