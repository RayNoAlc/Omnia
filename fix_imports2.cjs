const fs = require('fs');
let tabs = fs.readFileSync('src/components/Tabs.jsx', 'utf8');

// The replacement was:
// tabs = tabs.replace(/import \{\s*/, 'import {\n  Lock, Target, RotateCcw, ');

tabs = tabs.replace(/import \{\s*Lock,\s*Target,\s*RotateCcw,\s*/g, 'import {\n  Lock, ');

fs.writeFileSync('src/components/Tabs.jsx', tabs, 'utf8');
console.log("Fixed double imports!");
