const fs = require('fs');
let c = fs.readFileSync('src/components/Tabs.jsx', 'utf8');

c = c.replace(
  '<img src="/logo.jpg" alt="Omnia" className="w-8 h-8 rounded-lg object-cover shrink-0" />',
  '<div className="mb-5 flex items-start justify-between">\n        <div className="flex items-center gap-2.5">\n          <img src="/logo.jpg" alt="Omnia" className="w-8 h-8 rounded-lg object-cover shrink-0" />'
);

fs.writeFileSync('src/components/Tabs.jsx', c, 'utf8');
