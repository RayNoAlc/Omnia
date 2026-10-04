const fs = require('fs');
let tabs = fs.readFileSync('src/components/Tabs.jsx', 'utf8');

tabs = tabs.replace(
  'import { Settings, Palette, useState',
  'import { useState'
);

tabs = tabs.replace(
  'from "lucide-react";',
  'Settings, Palette,\n} from "lucide-react";'
);

fs.writeFileSync('src/components/Tabs.jsx', tabs, 'utf8');
