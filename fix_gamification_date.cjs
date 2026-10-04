const fs = require('fs');
let tabs = fs.readFileSync('src/components/Tabs.jsx', 'utf8');

tabs = tabs.replace(/const d = s\.data\.slice\(0,10\);/, 'const d = (s.date || "").slice(0,10);');

tabs = tabs.replace(/const d = new Date\(s\.data\);/, 'const d = new Date(s.date);');
tabs = tabs.replace(/s\.data\.slice\(11,13\)/, '(s.date || "T00:00:00").slice(11,13)');

tabs = tabs.replace(/\.\.\.sessions\.map\(s => s\.data && s\.data\.slice\(0,10\)\)/, '...sessions.map(s => s.date && s.date.slice(0,10))');
tabs = tabs.replace(/\.\.\.quizAttempts\.map\(q => q\.data && q\.data\.slice\(0,10\)\)/, '...quizAttempts.map(q => q.date && q.date.slice(0,10))');
tabs = tabs.replace(/\.\.\.professorAttempts\.map\(p => p\.data && p\.data\.slice\(0,10\)\)/, '...professorAttempts.map(p => p.date && p.date.slice(0,10))');

tabs = tabs.replace(/\(sessions\|\|\[\]\)\.map\(s => s\.data \? s\.data\.slice\(0,10\) : ""\)/, '(sessions||[]).map(s => s.date ? s.date.slice(0,10) : "")');


fs.writeFileSync('src/components/Tabs.jsx', tabs, 'utf8');
