const fs = require('fs');
let code = fs.readFileSync('src/components/Tabs.jsx', 'utf8');

const target1 = '${b.horaFim}\`);';
const replacement1 = '${b.horaFim}|${b.cor || "#2DD4A0"}\`);';
code = code.replace(target1, replacement1);

const target2 = 'Recorrentes(id|titulo|dia|';
const replacement2 = 'Recorrentes(id|titulo|dia|hora|cor): ${rec.length ? rec.join("; ") : "nenhum"}\\n';
code = code.replace(/Recorrentes\(id\|titulo\|dia\|.*?\): \$\{rec\.length \? rec\.join\("; "\) : "nenhum"\}/, replacement2);

const target3 = 'diaSemana DEVE ser: Seg, Ter, Qua, Qui, Sex, S';
code = code.replace(/diaSemana DEVE ser: Seg, Ter, Qua, Qui, Sex, S.*? ou Dom\./, 'diaSemana DEVE ser: Seg, Ter, Qua, Qui, Sex, Sáb ou Dom.\\n  - Ao mudar cores, use formato HEX (ex: #FF0000, #2DD4A0). Mantenha outros dados iguais se não pedido para mudar.');

fs.writeFileSync('src/components/Tabs.jsx', code, 'utf8');
