const fs = require('fs');
let lines = fs.readFileSync('src/layouts/AppLayout.jsx', 'utf8').split('\n');

for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('className={w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 \\}')) {
    lines[i] = lines[i].replace('className={w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 \\}', "className={\w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 \\}");
  }
  if (lines[i].includes('<Icon className={w-5 h-5 \\} />')) {
    lines[i] = lines[i].replace('<Icon className={w-5 h-5 \\} />', "<Icon className={\w-5 h-5 \\} />");
  }
  if (lines[i].includes('className={w-full flex items-center gap-4 px-4 py-3 rounded-xl text-base font-medium transition-colors \\}')) {
    lines[i] = lines[i].replace('className={w-full flex items-center gap-4 px-4 py-3 rounded-xl text-base font-medium transition-colors \\}', "className={\w-full flex items-center gap-4 px-4 py-3 rounded-xl text-base font-medium transition-colors \\}");
  }
  if (lines[i].includes('<Icon className={w-6 h-6 \\} />')) {
    lines[i] = lines[i].replace('<Icon className={w-6 h-6 \\} />', "<Icon className={\w-6 h-6 \\} />");
  }
}

fs.writeFileSync('src/layouts/AppLayout.jsx', lines.join('\n'), 'utf8');
