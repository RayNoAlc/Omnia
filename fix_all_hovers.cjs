const fs = require('fs');
let file = 'src/components/Tabs.jsx';
let content = fs.readFileSync(file, 'utf8');

// The other button that opens commitments
content = content.replace(
  /<button key=\{c\.id\} onClick=\{.*?onOpenCommitment\(c\)\} className="w-full text-left rounded-lg outline-none focus:outline-none overflow-hidden bg-transparent">/,
  '<button key={c.id} onClick={() => onOpenCommitment(c)} className="w-full text-left outline-none focus:outline-none bg-transparent hover:bg-transparent group">'
);
content = content.replace(
  /<Card className="py-2\.5 flex items-center justify-between">/g,
  '<Card className="py-2.5 flex items-center justify-between transition-transform group-hover:scale-[1.02] transform-gpu">'
);

// Update the proximos prazos to use transform-gpu
content = content.replace(
  /group-hover:scale-\[1\.02\] overflow-hidden" style=\{\{ backgroundColor: T\.surfaceAlt/,
  'group-hover:scale-[1.02] transform-gpu overflow-hidden" style={{ backgroundColor: T.surfaceAlt'
);

fs.writeFileSync(file, content, 'utf8');
console.log("Applied transform-gpu and fixed hover bleeds!");
