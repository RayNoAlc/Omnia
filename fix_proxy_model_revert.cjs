const fs = require('fs');
let code = fs.readFileSync('api/ai-proxy.js', 'utf8');

code = code.replace(
  /const GROQ_TEXT_MODEL = ".*?";/,
  'const GROQ_TEXT_MODEL = "openai/gpt-oss-20b";'
);

fs.writeFileSync('api/ai-proxy.js', code, 'utf8');
