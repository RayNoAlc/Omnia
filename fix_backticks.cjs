const fs = require('fs');
let layout = fs.readFileSync('src/layouts/AppLayout.jsx', 'utf8');

layout = layout.replace(
  "className={w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 }",
  "className={\w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 \\}"
);

layout = layout.replace(
  "<Icon className={w-5 h-5 } />",
  "<Icon className={\w-5 h-5 \\} />"
);

layout = layout.replace(
  "className={w-full flex items-center gap-4 px-4 py-3 rounded-xl text-base font-medium transition-colors }",
  "className={\w-full flex items-center gap-4 px-4 py-3 rounded-xl text-base font-medium transition-colors \\}"
);

layout = layout.replace(
  "<Icon className={w-6 h-6 } />",
  "<Icon className={\w-6 h-6 \\} />"
);

fs.writeFileSync('src/layouts/AppLayout.jsx', layout, 'utf8');
