const fs = require('fs');
let c = fs.readFileSync('src/components/Tabs.jsx', 'utf8');

c = c.replace(/<div[\s\S]*?>\s*VU\s*<\/div>/, '<img src="/logo.jpg" alt="Omnia" className="w-8 h-8 rounded-lg object-cover shrink-0" />');

fs.writeFileSync('src/components/Tabs.jsx', c, 'utf8');
