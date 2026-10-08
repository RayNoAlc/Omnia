const fs = require('fs');
let app = fs.readFileSync('src/App.jsx', 'utf8');

app = app.replace(
  /<ConfigTab userId=\{userId\} config=\{config\} updateConfig=\{updateConfig\} \/>/,
  '<ConfigTab userId={userId} config={config} updateConfig={updateConfig} commitments={commitments} notes={notes} summaries={summaries} />'
);

fs.writeFileSync('src/App.jsx', app, 'utf8');
console.log("Passed props to ConfigTab!");
