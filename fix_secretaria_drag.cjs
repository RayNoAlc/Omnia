const fs = require('fs');
let code = fs.readFileSync('src/components/Tabs.jsx', 'utf8');

// 1. Fix handleDrop usage of dias -> diaSemana
code = code.replace(/const sourceDay = dragging \? dragging\.sourceDay : block\.dias\[0\];/g, 'const sourceDay = dragging ? dragging.sourceDay : block.diaSemana;');
code = code.replace(/let newDias = \[\.\.\.block\.dias\];/g, 'let newDia = block.diaSemana;');
code = code.replace(/if \(sourceDay !== targetDay\) \{[\s\S]*?if \(!newDias\.includes\(targetDay\)\) newDias\.push\(targetDay\);\s*\}/g, 'if (sourceDay !== targetDay) { newDia = targetDay; }');
code = code.replace(/dias: newDias/g, 'diaSemana: newDia');

// 2. Update buildSystemPrompt
code = code.replace(
  /const rec = routineBlocks\.map\(\(b\) => \\$\{b\.id\}\|\$\{b\.titulo\}\|\$\{b\.diaSemana\}\|\$\{b\.horaInicio\}-\$\{b\.horaFim\}\\);/,
  'const rec = routineBlocks.map((b) => \\\\|\\|\\|\\-\\|cor:\\\\);'
);

code = code.replace(
  /Recorrentes\(id\|titulo\|dia\|horǭrio\):/,
  'Recorrentes(id|titulo|dia|horǭrio|cor):'
);

code = code.replace(
  /- diaSemana DEVE ser: Seg, Ter, Qua, Qui, Sex, Sǭb ou Dom./,
  '- diaSemana DEVE ser: Seg, Ter, Qua, Qui, Sex, Sǭb ou Dom.\n  - Ao mudar cores, use HEX válido (ex: #FF0000) e preserve os outros dados.'
);

fs.writeFileSync('src/components/Tabs.jsx', code, 'utf8');
