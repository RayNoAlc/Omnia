const fs = require('fs');
let code = fs.readFileSync('api/ai-proxy.js', 'utf8');

code = code.replace(
  'const GROQ_TEXT_MODEL = "llama3-70b-8192";',
  'const GROQ_TEXT_MODEL = "llama-3.3-70b-versatile";'
);

fs.writeFileSync('api/ai-proxy.js', code, 'utf8');
