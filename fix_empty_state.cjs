const fs = require('fs');
let ui = fs.readFileSync('src/components/ui.jsx', 'utf8');

ui = ui.replace(
  /<div className="text-sm text-center py-8 rounded-2xl"/,
  '<div className="w-full px-6 text-sm text-center py-8 rounded-2xl"'
);

fs.writeFileSync('src/components/ui.jsx', ui, 'utf8');
