const fs = require('fs');
let tabs = fs.readFileSync('src/components/Tabs.jsx', 'utf8');

tabs = tabs.replace(
  /className={timerOn \? "animate-bounce" : ""}/,
  'className={timerOn ? "animate-pet-focus" : streak > 0 ? "animate-pet-cool" : "animate-pet-breathe"}'
);

fs.writeFileSync('src/components/Tabs.jsx', tabs, 'utf8');
