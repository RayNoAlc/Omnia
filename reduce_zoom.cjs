const fs = require('fs');
let file = 'src/components/Tabs.jsx';
let content = fs.readFileSync(file, 'utf8');

// Replace scale-[1.02] with scale-[1.01] to reduce excessive zoom
content = content.replace(/scale-\[1\.02\]/g, 'scale-[1.01]');

fs.writeFileSync(file, content, 'utf8');
console.log("Reduced zoom magnitude on hover!");
