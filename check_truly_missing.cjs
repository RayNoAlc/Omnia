const fs = require('fs');
const path = require('path');

function getAllFiles(dir, exts) {
  let res = [];
  const list = fs.readdirSync(dir);
  for (const file of list) {
    const full = path.join(dir, file);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) {
      if (file !== 'node_modules' && file !== '.git' && file !== 'tabs') {
        res = res.concat(getAllFiles(full, exts));
      }
    } else if (exts.some(ext => file.endsWith(ext))) {
      res.push(full);
    }
  }
  return res;
}

const files = getAllFiles('src', ['.js', '.jsx']);

for (const file of files) {
  const code = fs.readFileSync(file, 'utf8');
  const tags = new Set([...code.matchAll(/<([A-Z][a-zA-Z0-9_]*)/g)].map(m => m[1]));
  
  // Extract all imported identifiers
  const imported = new Set();
  const importMatches = [...code.matchAll(/import\s+(?:(\w+)|\{([^}]+)\}|\*\s+as\s+(\w+))\s+from/gs)];
  for (const m of importMatches) {
    if (m[1]) imported.add(m[1].trim());
    if (m[3]) imported.add(m[3].trim());
    if (m[2]) {
      m[2].split(',').forEach(item => {
        const parts = item.trim().split(/\s+as\s+/);
        const name = parts[parts.length - 1].trim();
        if (name) imported.add(name);
      });
    }
  }

  for (const tag of tags) {
    if (tag === 'Fragment' || tag === 'React') continue;
    const isImported = imported.has(tag);
    // regex for function/const/class/let/var declaration
    const declRegex = new RegExp(`(?:function|const|class|let|var)\\s+${tag}\\b`);
    const isDeclared = declRegex.test(code);
    if (!isImported && !isDeclared) {
      console.log(`[${file}] TRULY MISSING COMPONENT: <${tag}>`);
    }
  }
}
