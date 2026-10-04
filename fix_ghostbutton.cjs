const fs = require('fs');
let ui = fs.readFileSync('src/components/ui.jsx', 'utf8');

ui = ui.replace(/color:\s*T\.inkSoft,\s*border:\s*1px solid \$\{T\.border\},\s*backgroundColor:\s*"transparent"/g, 'color: T.ink, border: 1px solid , backgroundColor: "transparent"');

fs.writeFileSync('src/components/ui.jsx', ui, 'utf8');
