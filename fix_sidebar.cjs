const fs = require('fs');
let c = fs.readFileSync('src/layouts/AppLayout.jsx', 'utf8');

c = c.replace(
  /<div className="p-6">\s*<h1 className="text-xl font-bold tracking-tight" style=\{\{ color: T\.ink \}\}>Minha Vida<br\/>.*?<\/h1>\s*<\/div>/,
  '<div className="p-6 flex items-center gap-3">\n          <img src="/logo.jpg" alt="Omnia Logo" className="w-9 h-9 rounded-xl object-cover shadow-sm" />\n          <h1 className="text-2xl font-bold tracking-tight" style={{ color: T.ink }}>OMNIA</h1>\n        </div>'
);

c = c.replace(
  /<h1 className="text-lg font-bold" style=\{\{ color: T\.ink \}\}>MV<span style=\{\{ color: T\.brand \}\}>A<\/span><\/h1>/,
  '<div className="flex items-center gap-2.5">\n          <img src="/logo.jpg" alt="Omnia" className="w-7 h-7 rounded-lg object-cover" />\n          <h1 className="text-xl font-bold tracking-tight" style={{ color: T.ink }}>OMNIA</h1>\n        </div>'
);

fs.writeFileSync('src/layouts/AppLayout.jsx', c, 'utf8');
