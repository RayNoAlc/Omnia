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
const lucide = require('lucide-react');

for (const file of files) {
  const code = fs.readFileSync(file, 'utf8');
  const tags = new Set([...code.matchAll(/<([A-Z][a-zA-Z0-9_]*)/g)].map(m => m[1]));
  
  for (const tag of tags) {
    if (tag === 'Fragment' || tag === 'React') continue;
    // Check if imported or declared in file
    const isDeclared = code.includes('function ' + tag) || code.includes('const ' + tag) || code.includes('class ' + tag) || code.includes('let ' + tag);
    const isImported = code.includes(tag);
    // If not declared, check imports
    const importRegex = new RegExp(`import\\s+.*\\b${tag}\\b.*from`);
    if (!isDeclared && !importRegex.test(code)) {
      console.log(`[${file}] MISSING COMPONENT: <${tag}>`);
    }
  }
}
