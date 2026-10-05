const fs = require('fs');
let file = 'src/components/Tabs.jsx';
let content = fs.readFileSync(file, 'utf8');

// Add origin-left to all scale-[1.02] classes
content = content.replace(/scale-\[1\.02\]/g, 'scale-[1.02] origin-left');

fs.writeFileSync(file, content, 'utf8');
console.log("Added origin-left to scale animations to prevent left-side clipping!");
