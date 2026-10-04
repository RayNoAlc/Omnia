const fs = require('fs');
let code = fs.readFileSync('api/ai-proxy.js', 'utf8');

code = code.replace(
  'const GROQ_TEXT_MODEL = "llama-3.1-70b-versatile";',
  'const GROQ_TEXT_MODEL = "llama3-70b-8192";'
);

fs.writeFileSync('api/ai-proxy.js', code, 'utf8');
