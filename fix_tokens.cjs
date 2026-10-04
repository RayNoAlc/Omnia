const fs = require('fs');
let code = fs.readFileSync('src/components/Tabs.jsx', 'utf8');

// The original line: const rec = routineBlocks.map((b) => \`\${b.id}|\${b.titulo}|\${b.diaSemana}|\${b.horaInicio}-\${b.horaFim}|\${b.cor}\`).join("\\n");
// Replace it with: const rec = routineBlocks.map((b) => \`\${b.id}|\${b.titulo}\`).join("\\n");

code = code.replace(
  /const rec = routineBlocks\.map\(\(b\) => `\$\{b\.id\}\|\$\{b\.titulo\}\|\$\{b\.diaSemana\}\|\$\{b\.horaInicio\}-\$\{b\.horaFim\}\|\$\{b\.cor\}`\)\.join\("\\n"\);/,
  'const rec = routineBlocks.map((b) => `${b.id}|${b.titulo}`).join("\\n");'
);

// If the regex missed, try a more permissive replace
if (code.includes('${b.diaSemana}|${b.horaInicio}-${b.horaFim}|${b.cor}')) {
  code = code.replace('${b.id}|${b.titulo}|${b.diaSemana}|${b.horaInicio}-${b.horaFim}|${b.cor}', '${b.id}|${b.titulo}');
}

fs.writeFileSync('src/components/Tabs.jsx', code, 'utf8');
