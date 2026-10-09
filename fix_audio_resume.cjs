const fs = require('fs');
let tabs = fs.readFileSync('src/components/Tabs.jsx', 'utf8');

tabs = tabs.replace(
  /const audioCtx = window\.pacerAudioCtx;/g,
  "const audioCtx = window.pacerAudioCtx; if (audioCtx.state === 'suspended') audioCtx.resume();"
);

fs.writeFileSync('src/components/Tabs.jsx', tabs, 'utf8');
console.log("Fixed AudioContext resume!");
