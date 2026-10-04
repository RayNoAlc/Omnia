const fs = require('fs');
let tabs = fs.readFileSync('src/components/Tabs.jsx', 'utf8');

tabs = tabs.replace(
  '} Settings, Palette,\n} from "lucide-react";',
  '  Settings, Palette,\n} from "lucide-react";'
);

fs.writeFileSync('src/components/Tabs.jsx', tabs, 'utf8');
