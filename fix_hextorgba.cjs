const fs = require('fs');
let layout = fs.readFileSync('src/layouts/AppLayout.jsx', 'utf8');

layout = layout.replace(/hexToRgba\(T\.brand, 0\.1\)/g, 'TINT.brand');
layout = layout.replace(/hexToRgba\(T\.danger, 0\.1\)/g, 'TINT.critico');
layout = layout.replace(/T\.danger/g, 'T.critico');

fs.writeFileSync('src/layouts/AppLayout.jsx', layout, 'utf8');
