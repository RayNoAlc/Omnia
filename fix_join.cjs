const fs = require('fs');
let code = fs.readFileSync('src/components/Tabs.jsx', 'utf8');
code = code.replace(
  'const rec = routineBlocks.map((b) => \\|\\);',
  'const rec = routineBlocks.map((b) => \\|\\).join(\"\\\\n\");'
);
fs.writeFileSync('src/components/Tabs.jsx', code, 'utf8');
