const fs = require('fs');
let code = fs.readFileSync('src/components/Tabs.jsx', 'utf8');

const promptStart = code.indexOf('const rec = routineBlocks.map((b) =>');
if (promptStart > 0) {
    const promptEnd = code.indexOf('return `Secret', promptStart);
    let mappingPart = code.substring(promptStart, promptEnd);
    
    // Replace mapping
    mappingPart = mappingPart.replace(
      /\$\{b\.horaFim\}`\);/g,
      '${b.horaFim}|${b.cor || "#2DD4A0"}`);'
    );
    
    code = code.substring(0, promptStart) + mappingPart + code.substring(promptEnd);
}

const sysStart = code.indexOf('Regras:');
if (sysStart > 0) {
    const sysEnd = code.indexOf('Min.estudados hoje', sysStart);
    let sysPart = code.substring(sysStart, sysEnd);
    
    // Add rule
    sysPart = sysPart.replace(
      'diaSemana DEVE ser: Seg, Ter, Qua, Qui, Sex, Sǭb ou Dom.',
      'diaSemana DEVE ser: Seg, Ter, Qua, Qui, Sex, Sǭb ou Dom.\\n  - Ao mudar cores, use HEX (ex: #FF0000, #2DD4A0). Mantenha outros dados iguais se não pedido.'
    );
    
    sysPart = sysPart.replace(
      'Recorrentes(id|titulo|dia|horǭrio)',
      'Recorrentes(id|titulo|dia|horǭrio|cor)'
    );
    
    code = code.substring(0, sysStart) + sysPart + code.substring(sysEnd);
}

fs.writeFileSync('src/components/Tabs.jsx', code, 'utf8');
