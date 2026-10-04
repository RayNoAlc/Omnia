const fs = require('fs');
let code = fs.readFileSync('api/ai-proxy.js', 'utf8');

code = code.replace(
  'const apiKey = process.env.GROQ_API_KEY;\n  if (!apiKey) {',
  `try {
    const bodyClone = await req.clone().json();
    var apiKey = bodyClone.customApiKey || process.env.GROQ_API_KEY;
  } catch(e) {
    var apiKey = process.env.GROQ_API_KEY;
  }
  
  if (!apiKey) {`
);

fs.writeFileSync('api/ai-proxy.js', code, 'utf8');
