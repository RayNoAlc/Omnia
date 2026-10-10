const fs = require('fs');
const lines = fs.readFileSync('src/components/Tabs.jsx', 'utf8').split('\n');

for (let i = 270; i < 300; i++) {
  console.log(`${i+1}: ${lines[i]}`);
}
