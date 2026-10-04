const fs = require('fs');
let tabs = fs.readFileSync('src/components/Tabs.jsx', 'utf8');

tabs = tabs.replace("import 'jspdf-autotable';", "import autoTable from 'jspdf-autotable';");
tabs = tabs.replace(/doc\.autoTable\(\{/g, 'autoTable(doc, {');

fs.writeFileSync('src/components/Tabs.jsx', tabs, 'utf8');
