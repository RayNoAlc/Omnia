const fs = require('fs');

let appLayout = fs.readFileSync('src/layouts/AppLayout.jsx', 'utf8');
appLayout = appLayout.replace(
  /<div className="p-6 flex items-center justify-center">\n          <h1 className="text-5xl tracking-wide".*?<\/h1>\n        <\/div>/,
  '<div className="p-6 flex items-center justify-center">\n          <img src="/omnia.jpg" alt="Omnia" className="h-16 object-contain" />\n        </div>'
);
appLayout = appLayout.replace(
  /<div className="flex items-center">\n          <h1 className="text-3xl tracking-wide".*?<\/h1>\n        <\/div>/,
  '<div className="flex items-center">\n          <img src="/omnia.jpg" alt="Omnia" className="h-8 object-contain" />\n        </div>'
);
fs.writeFileSync('src/layouts/AppLayout.jsx', appLayout, 'utf8');

let tabs = fs.readFileSync('src/components/Tabs.jsx', 'utf8');
tabs = tabs.replace(
  /<div className="flex items-center gap-5">\n          <h1 className="text-5xl tracking-wide".*?<\/h1>/,
  '<div className="flex items-center gap-5">\n          <img src="/omnia.jpg" alt="Omnia" className="h-14 object-contain" />'
);
fs.writeFileSync('src/components/Tabs.jsx', tabs, 'utf8');
