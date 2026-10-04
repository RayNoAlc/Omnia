const fs = require('fs');
let layout = fs.readFileSync('src/layouts/AppLayout.jsx', 'utf8');

layout = layout.replace(/X, X/g, 'X');

fs.writeFileSync('src/layouts/AppLayout.jsx', layout, 'utf8');
