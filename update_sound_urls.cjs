const fs = require('fs');
let tabs = fs.readFileSync('src/components/Tabs.jsx', 'utf8');

tabs = tabs.replace("https://dl.espressive.com/rain.mp3", "https://cdn.freesound.org/previews/189/189043_1955047-lq.mp3");
tabs = tabs.replace("https://dl.espressive.com/cafe.mp3", "https://cdn.freesound.org/previews/208/208579_3735166-lq.mp3");
tabs = tabs.replace("https://dl.espressive.com/fire.mp3", "https://cdn.freesound.org/previews/209/209590_3905081-lq.mp3");

fs.writeFileSync('src/components/Tabs.jsx', tabs, 'utf8');
