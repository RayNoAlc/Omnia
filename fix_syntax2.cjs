const fs = require('fs');
let ai = fs.readFileSync('src/lib/aiHelpers.js', 'utf8');

ai = ai.replace('markdown (`json)', 'markdown (\\\\\\json)');

fs.writeFileSync('src/lib/aiHelpers.js', ai, 'utf8');
