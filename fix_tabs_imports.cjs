const fs = require('fs');
let tabs = fs.readFileSync('src/components/Tabs.jsx', 'utf8');

tabs = tabs.replace(
  'import {',
  'import { Settings, Palette,'
);

tabs = tabs.replace(
  'T, TINT, TIPO_LABELS,',
  'T, TINT, THEMES, applyTheme, TIPO_LABELS,'
);

fs.writeFileSync('src/components/Tabs.jsx', tabs, 'utf8');
