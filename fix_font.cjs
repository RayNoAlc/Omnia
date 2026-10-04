const fs = require('fs');

let index = fs.readFileSync('index.html', 'utf8');
if (!index.includes('Yellowtail')) {
  index = index.replace(
    '</title>',
    '</title>\n    <link href="https://fonts.googleapis.com/css2?family=Yellowtail&display=swap" rel="stylesheet">'
  );
  fs.writeFileSync('index.html', index, 'utf8');
}

let appLayout = fs.readFileSync('src/layouts/AppLayout.jsx', 'utf8');
appLayout = appLayout.replace(
  /<div className="p-6 flex items-center gap-3">[\s\S]*?<h1 className="text-2xl font-bold tracking-tight" style=\{\{ color: T\.ink \}\}>OMNIA<\/h1>\s*<\/div>/,
  '<div className="p-6 flex items-center justify-center">\n          <h1 className="text-5xl tracking-wide" style={{ fontFamily: "\"Yellowtail\", cursive", color: T.brand, transform: "rotate(-4deg)", textShadow: "0 4px 15px rgba(59,130,246,0.5)" }}>Omnia</h1>\n        </div>'
);
appLayout = appLayout.replace(
  /<div className="flex items-center gap-2\.5">[\s\S]*?<h1 className="text-xl font-bold tracking-tight" style=\{\{ color: T\.ink \}\}>OMNIA<\/h1>\s*<\/div>/,
  '<div className="flex items-center">\n          <h1 className="text-3xl tracking-wide" style={{ fontFamily: "\"Yellowtail\", cursive", color: T.brand, transform: "rotate(-4deg)", textShadow: "0 2px 10px rgba(59,130,246,0.5)" }}>Omnia</h1>\n        </div>'
);
fs.writeFileSync('src/layouts/AppLayout.jsx', appLayout, 'utf8');

let tabs = fs.readFileSync('src/components/Tabs.jsx', 'utf8');
tabs = tabs.replace(
  /<div className="flex items-center gap-2\.5">[\s\S]*?<h1 className="text-lg font-semibold tracking-tight" style=\{\{ color: T\.ink \}\}>Omnia<\/h1>/,
  '<div className="flex items-center gap-5">\n          <h1 className="text-5xl tracking-wide" style={{ fontFamily: "\"Yellowtail\", cursive", color: T.brand, transform: "rotate(-4deg)", textShadow: "0 4px 15px rgba(59,130,246,0.5)" }}>Omnia</h1>\n          <div>\n            <div className="flex items-baseline gap-2">\n              <h2 className="text-lg font-semibold tracking-tight" style={{ color: T.ink }}>Painel de Controle</h2>'
);
fs.writeFileSync('src/components/Tabs.jsx', tabs, 'utf8');
