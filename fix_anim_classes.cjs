const fs = require('fs');
let file = 'src/components/Tabs.jsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(/let animClass = "pet-breathe";/, 'let animClass = "animate-pet-breathe";');
content = content.replace(/animClass = "pet-focus";/, 'animClass = "animate-pet-focus";');
content = content.replace(/animClass = "pet-cool";/, 'animClass = "animate-pet-cool";');

fs.writeFileSync(file, content, 'utf8');
console.log("Fixed animation classes!");
