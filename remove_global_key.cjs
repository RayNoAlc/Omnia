const fs = require('fs');
let code = fs.readFileSync('api/ai-proxy.js', 'utf8');

code = code.replace(
  `try {
    const bodyClone = await req.clone().json();
    var apiKey = bodyClone.customApiKey || process.env.GROQ_API_KEY;
  } catch(e) {
    var apiKey = process.env.GROQ_API_KEY;
  }`,
  `try {
    const bodyClone = await req.clone().json();
    var apiKey = bodyClone.customApiKey;
  } catch(e) {
    var apiKey = null;
  }`
);

fs.writeFileSync('api/ai-proxy.js', code, 'utf8');
