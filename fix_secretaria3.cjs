const fs = require('fs');
let code = fs.readFileSync('src/components/Tabs.jsx', 'utf8');

code = code.replace(/horǭrio\):/g, 'horário|cor):');
code = code.replace(/Seg, Ter, Qua, Qui, Sex, Sǭb ou Dom\./g, 'Seg, Ter, Qua, Qui, Sex, Sáb ou Dom.\n  - Ao mudar cores, use HEX (ex: #FF0000). Mantenha outros dados iguais se não pedido.');

fs.writeFileSync('src/components/Tabs.jsx', code, 'utf8');
