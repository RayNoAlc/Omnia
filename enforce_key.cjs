const fs = require('fs');
let code = fs.readFileSync('src/lib/ai.js', 'utf8');

code = code.replace(
  '  if (customKey) body.customApiKey = customKey;',
  `  if (!customKey || customKey.trim() === '') {
    throw new Error("⚠️ IA Desativada: Nenhuma chave de API configurada! Por favor, vá até a aba Configurações e cadastre sua chave da Groq para utilizar a IA.");
  }
  body.customApiKey = customKey;`
);

fs.writeFileSync('src/lib/ai.js', code, 'utf8');
