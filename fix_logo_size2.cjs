const fs = require('fs');

let appLayout = fs.readFileSync('src/layouts/AppLayout.jsx', 'utf8');
appLayout = appLayout.replace(
  /<img src="\/omnia\.png" alt="Omnia" className="h-[^"]+" \/>/,
  '<img src="/omnia.png" alt="Omnia" className="h-28 w-48 object-contain scale-110 drop-shadow-lg" style={{ filter: "brightness(1.5)" }} />'
);
appLayout = appLayout.replace(
  /<img src="\/omnia\.png" alt="Omnia" className="h-[^"]+" \/>/,
  '<img src="/omnia.png" alt="Omnia" className="h-12 w-32 object-contain scale-110" style={{ filter: "brightness(1.5)" }} />'
);
fs.writeFileSync('src/layouts/AppLayout.jsx', appLayout, 'utf8');

let tabs = fs.readFileSync('src/components/Tabs.jsx', 'utf8');
tabs = tabs.replace(
  /<img src="\/omnia\.png" alt="Omnia" className="h-[^"]+" \/>/,
  '<img src="/omnia.png" alt="Omnia" className="h-24 w-56 object-contain scale-110 drop-shadow-xl" style={{ filter: "brightness(1.5)" }} />'
);
fs.writeFileSync('src/components/Tabs.jsx', tabs, 'utf8');
