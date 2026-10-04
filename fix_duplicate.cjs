const fs = require('fs');
let tabs = fs.readFileSync('src/components/Tabs.jsx', 'utf8');
tabs = tabs.replace('const [dragging, setDragging] = useState(null); // "sono" | "preferencias" | { block, dia } | null', '// removed duplicate');
fs.writeFileSync('src/components/Tabs.jsx', tabs, 'utf8');
