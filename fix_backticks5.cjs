const fs = require('fs');
let layout = fs.readFileSync('src/layouts/AppLayout.jsx', 'utf8');

layout = layout.replace(/className=\{w-full[^\}]*\}/g, "className={\w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 \\}");

layout = layout.replace(/<Icon className=\{w-[^\}]*\} \/>/g, "<Icon className={\w-5 h-5 \\} />");

fs.writeFileSync('src/layouts/AppLayout.jsx', layout, 'utf8');
