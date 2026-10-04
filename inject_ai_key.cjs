const fs = require('fs');
let code = fs.readFileSync('src/lib/ai.js', 'utf8');

code = code.replace(
  'async function invokeAiProxy(body) {',
  `function getCustomApiKey() {
  try {
    const cfg = JSON.parse(localStorage.getItem('omnia_config') || '{}');
    return cfg.groqApiKey || null;
  } catch (e) {
    return null;
  }
}

async function invokeAiProxy(body) {
  const customKey = getCustomApiKey();
  if (customKey) body.customApiKey = customKey;
`
);

fs.writeFileSync('src/lib/ai.js', code, 'utf8');
