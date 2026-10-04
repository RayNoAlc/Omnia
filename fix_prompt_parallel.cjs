const fs = require('fs');
let code = fs.readFileSync('src/components/Tabs.jsx', 'utf8');

code = code.replace(
  'Mudar APENAS as CORES em massa -> usar pintar_compromissos_em_massa.',
  'Mudar cores de vǭrios -> chame a ferramenta pintar_compromisso MULTIPLAS VEZES de uma s vez (em paralelo).'
);

code = code.replace(
  'Mudar APENAS as CORES em massa -> usar pintar_compromissos_em_massa.',
  'Mudar cores de vários -> chame a ferramenta pintar_compromisso MULTIPLAS VEZES de uma só vez (em paralelo).'
);

// Se os caracteres Unicode bugaram no replace, vou fazer com substring:
const regexPrompt = /Mudar APENAS as CORES em massa -> usar pintar_compromissos_em_massa\./;
code = code.replace(regexPrompt, 'Mudar cores de vários itens -> chame a ferramenta pintar_compromisso MULTIPLAS VEZES em paralelo.');

fs.writeFileSync('src/components/Tabs.jsx', code, 'utf8');
