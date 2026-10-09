const fs = require('fs');
let tabs = fs.readFileSync('src/components/Tabs.jsx', 'utf8');

tabs = tabs.replace(
  /<FocusPet timerOn=\{false\} streak=\{streak\} petName=\{config\?\.petName\} onNameChange=\{\(n\) => updateConfig\(\{...config, petName: n\}\)\} \/>/g,
  '<FocusPet timerOn={false} streak={streak} petName={config?.petName} onNameChange={(n) => updateConfig({...config, petName: n})} config={config} updateConfig={updateConfig} phase="idle" />'
);

fs.writeFileSync('src/components/Tabs.jsx', tabs, 'utf8');
console.log("Fixed second FocusPet!");
