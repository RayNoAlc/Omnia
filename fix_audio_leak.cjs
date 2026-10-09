const fs = require('fs');
let tabs = fs.readFileSync('src/components/Tabs.jsx', 'utf8');

tabs = tabs.replace(
  /const audioCtx = new \(window\.AudioContext \|\| window\.webkitAudioContext\)\(\);\s*window\.readingPacerInterval = setInterval\(\(\) => \{/g,
  'if(!window.pacerAudioCtx) window.pacerAudioCtx = new (window.AudioContext || window.webkitAudioContext)(); const audioCtx = window.pacerAudioCtx;\n                      window.readingPacerInterval = setInterval(() => {'
);

fs.writeFileSync('src/components/Tabs.jsx', tabs, 'utf8');
console.log("Fixed AudioContext leak!");
