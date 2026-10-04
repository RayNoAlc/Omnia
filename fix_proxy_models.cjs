const fs = require('fs');
let code = fs.readFileSync('api/ai-proxy.js', 'utf8');

code = code.replace(
  'const GROQ_TEXT_MODEL = "openai/gpt-oss-20b";',
  'const GROQ_TEXT_MODEL = "llama-3.1-70b-versatile";'
);

code = code.replace(
  'const GROQ_VISION_MODEL = "qwen/qwen3.8-27b";',
  'const GROQ_VISION_MODEL = "llama-3.2-11b-vision-preview";'
);

fs.writeFileSync('api/ai-proxy.js', code, 'utf8');
