const fs = require('fs');

let index = fs.readFileSync('index.html', 'utf8');
index = index.replace(/<title>.*?<\/title>/, '<title>Omnia</title>');
// Also update the favicon
if (index.includes('<link rel="icon" type="image/svg+xml" href="/vite.svg" />')) {
  index = index.replace('<link rel="icon" type="image/svg+xml" href="/vite.svg" />', '<link rel="icon" type="image/jpeg" href="/logo.jpg" />');
}
fs.writeFileSync('index.html', index, 'utf8');

let tabs = fs.readFileSync('src/components/Tabs.jsx', 'utf8');

const headerRegex = /<div\s+className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold shrink-0"\s+style=\{\{\s*background:[^}]+color:[^}]+\}\}\s*>\s*VU\s*<\/div>/;
tabs = tabs.replace(headerRegex, '<img src="/logo.jpg" alt="Omnia" className="w-8 h-8 rounded-lg object-cover shrink-0" />');

tabs = tabs.replace(/<h1 className="text-lg font-semibold tracking-tight" style=\{\{ color: T\.ink \}\}>Vida Universitǭria<\/h1>/g, '<h1 className="text-lg font-semibold tracking-tight" style={{ color: T.ink }}>Omnia</h1>');
tabs = tabs.replace(/<h1 className="text-lg font-semibold tracking-tight" style=\{\{ color: T\.ink \}\}>Vida Universitária<\/h1>/g, '<h1 className="text-lg font-semibold tracking-tight" style={{ color: T.ink }}>Omnia</h1>');
tabs = tabs.replace(/<h1 className="text-lg font-semibold tracking-tight" style=\{\{ color: T\.ink \}\}>.*?<\/h1>/g, '<h1 className="text-lg font-semibold tracking-tight" style={{ color: T.ink }}>Omnia</h1>');


fs.writeFileSync('src/components/Tabs.jsx', tabs, 'utf8');
