const fs = require('fs');
let tabs = fs.readFileSync('src/components/Tabs.jsx', 'utf8');

tabs = tabs.replace(/x\} Meta/g, '🎯 Meta');
tabs = tabs.replace(/S&/g, '✅');
tabs = tabs.replace(/Pr.ximos/g, 'Próximos');
tabs = tabs.replace(/Revis.o/g, 'Revisão');

fs.writeFileSync('src/components/Tabs.jsx', tabs, 'utf8');
