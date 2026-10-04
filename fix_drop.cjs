const fs = require('fs');
let code = fs.readFileSync('src/components/Tabs.jsx', 'utf8');

code = code.replace(
  /console\.log\("Dropping block:", block\.id, "newStart:", newStart, "newEnd:", newEnd, "dias:", newDias\);/g,
  'console.log("Dropping block:", block.id, "newStart:", newStart, "newEnd:", newEnd, "dias:", newDia);'
);

fs.writeFileSync('src/components/Tabs.jsx', code, 'utf8');
