const fs = require('fs');
let file = 'src/App.jsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  /<FocoTab userId=\{userId\} commitments=\{commitments\}/,
  '<FocoTab config={config} updateConfig={updateConfig} userId={userId} commitments={commitments}'
);
fs.writeFileSync(file, content, 'utf8');
