const fs = require('fs');
let code = fs.readFileSync('src/components/Tabs.jsx', 'utf8');

code = code.replace(
  '\\`\\${b.id}|\\${b.titulo}|\\${b.diaSemana}|\\${b.horaInicio}-\\${b.horaFim}|\\${b.cor || "#2DD4A0"}\\`);',
  '`${b.id}|${b.titulo}|${b.diaSemana}|${b.horaInicio}-${b.horaFim}|${b.cor || "#2DD4A0"}`);'
);
code = code.replace(
  '\\`\\${b.id}|\\${b.titulo}|\\${b.diaSemana}|\\${b.horaInicio}-\\${b.horaFim}|\\${b.cor}\\`);',
  '`${b.id}|${b.titulo}|${b.diaSemana}|${b.horaInicio}-${b.horaFim}|${b.cor}`);'
);

fs.writeFileSync('src/components/Tabs.jsx', code, 'utf8');
