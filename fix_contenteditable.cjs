const fs = require('fs');
let app = fs.readFileSync('src/App.jsx', 'utf8');

app = app.replace(
  /if \(\['INPUT', 'TEXTAREA'\]\.includes\(document\.activeElement\.tagName\)\) return;/,
  'if (["INPUT", "TEXTAREA"].includes(document.activeElement.tagName) || document.activeElement.isContentEditable) return;'
);

fs.writeFileSync('src/App.jsx', app, 'utf8');
console.log("Fixed keyboard shortcut in contenteditable!");
