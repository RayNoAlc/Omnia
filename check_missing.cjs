const fs = require('fs');
const code = fs.readFileSync('src/components/Tabs.jsx', 'utf8');
const lucide = require('lucide-react');
const allLucideUsed = new Set([...code.matchAll(/<([A-Z][a-zA-Z0-9_]*)/g)].map(m => m[1]).filter(tag => lucide[tag]));
const matches = [...code.matchAll(/import\s*\{([^}]+)\}\s*from\s*['"]lucide-react['"]/g)];
const imported = new Set();
matches.forEach(m => {
  m[1].split(',').map(s => s.trim().split(/\s+as\s+/)[0].trim()).filter(Boolean).forEach(id => imported.add(id));
});
const missing = [...allLucideUsed].filter(icon => !imported.has(icon) && icon !== 'ImageIcon' && icon !== 'Icon');
console.log('MISSING ICONS:', missing);
