const fs = require('fs');
const content = fs.readFileSync('src/App.jsx', 'utf8');

const matches = content.match(/<([A-Z][a-zA-Z0-9]*)/g);
if (matches) {
  const used = [...new Set(matches.map(m => m.slice(1)))];
  let undefinedComponents = [];
  for (const comp of used) {
    const isDefined = new RegExp(`(function ${comp}\\b|const ${comp}\\b|import[\\s\\S]*?\\b${comp}\\b[\\s\\S]*?from|as ${comp}\\b)`).test(content);
    if (!isDefined) undefinedComponents.push(comp);
  }
  console.log("App.jsx undefined components:", undefinedComponents.join(', '));
}
