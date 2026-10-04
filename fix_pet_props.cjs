const fs = require('fs');
let file = 'src/components/Tabs.jsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  /<FocusPet timerOn=\{phase === "work" && running\} streak=\{streak\} \/>/g,
  '<FocusPet timerOn={phase === "work" && running} streak={streak} petName={config?.petName} onNameChange={(n) => updateConfig({...config, petName: n})} />'
);

content = content.replace(
  /<FocusPet timerOn=\{false\} streak=\{streak\} \/>/g,
  '<FocusPet timerOn={false} streak={streak} petName={config?.petName} onNameChange={(n) => updateConfig({...config, petName: n})} />'
);

fs.writeFileSync(file, content, 'utf8');
console.log("Fixed FocusPet props in FocoTab!");
