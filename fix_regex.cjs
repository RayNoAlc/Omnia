const fs = require('fs');
let ai = fs.readFileSync('src/lib/aiHelpers.js', 'utf8');

ai = ai.replace(/if \(raw.startsWith\('```json'\)\) raw = raw.replace\(\/```json\/g, ''\).replace\(\/```\/g, ''\).trim\(\);/g, "if (raw.startsWith('```json')) raw = raw.split('```json')[1].split('```')[0].trim();");
ai = ai.replace(/if \(raw.startsWith\('```'\)\) raw = raw.replace\(\/```\/g, ''\).trim\(\);/g, "if (raw.startsWith('```')) raw = raw.split('```')[1].trim();");

fs.writeFileSync('src/lib/aiHelpers.js', ai, 'utf8');
