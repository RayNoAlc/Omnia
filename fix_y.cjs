const fs = require('fs');
let file = 'src/components/Tabs.jsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(/getFull😴ear/g, 'getFullYear');
content = content.replace(/FREQ=WEEKL😴;B😴DA😴=/g, 'FREQ=WEEKLY;BYDAY=');
content = content.replace(/start😴:/g, 'startY:');
content = content.replace(/final😴/g, 'finalY');
content = content.replace(/client😴/g, 'clientY');
content = content.replace(/offset😴/g, 'offsetY');
content = content.replace(/😴_OFFSET/g, 'Y_OFFSET');

fs.writeFileSync(file, content, 'utf8');
console.log("Restored all Ys!");
