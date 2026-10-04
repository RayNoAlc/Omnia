const fs = require('fs');
let layout = fs.readFileSync('src/layouts/AppLayout.jsx', 'utf8');

layout = layout.replace(
  'const [mobileOpen, setMobileOpen] = useState(false);',
  'const [mobileOpen, setMobileOpen] = useState(false);\n  const [isThemeModalOpen, setIsThemeModalOpen] = useState(false);'
);

layout = layout.replace(
  '{mobileOpen && (',
  '{isThemeModalOpen && <ThemeModal onClose={() => setIsThemeModalOpen(false)} />}\n\n      {mobileOpen && ('
);

fs.writeFileSync('src/layouts/AppLayout.jsx', layout, 'utf8');
