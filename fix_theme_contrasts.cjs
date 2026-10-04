const fs = require('fs');
let ui = fs.readFileSync('src/components/ui.jsx', 'utf8');

ui = ui.replace("normal: '#3B82F6', baixa: '#94A3B8', purple: '#8B5CF6', pink: '#EC4899',", "normal: '#3B82F6', baixa: '#94A3B8', purple: '#8B5CF6', pink: '#EC4899', brandInk: '#FFFFFF',");
ui = ui.replace("normal: '#2563EB', baixa: '#64748B', purple: '#7C3AED', pink: '#DB2777',", "normal: '#2563EB', baixa: '#64748B', purple: '#7C3AED', pink: '#DB2777', brandInk: '#FFFFFF',");
ui = ui.replace("normal: '#00FFCC', baixa: '#444444', purple: '#B537F2', pink: '#FF007F',", "normal: '#00FFCC', baixa: '#444444', purple: '#B537F2', pink: '#FF007F', brandInk: '#0D0221',");
ui = ui.replace("normal: '#D4A373', baixa: '#A3A3A3', purple: '#9E8EAB', pink: '#DDA1A8',", "normal: '#D4A373', baixa: '#A3A3A3', purple: '#9E8EAB', pink: '#DDA1A8', brandInk: '#4A3B32',");

ui = ui.replace("pink: 'var(--pink)',", "pink: 'var(--pink)',\n  brandInk: 'var(--brandInk)',");

ui = ui.replace('color: "#06231A"', 'color: T.brandInk');

ui = ui.replace('style={{ color: T.inkSoft, border: 1px solid , backgroundColor: "transparent" }}', 'style={{ color: T.ink, border: 1px solid , backgroundColor: "transparent" }}');

fs.writeFileSync('src/components/ui.jsx', ui, 'utf8');


let tabs = fs.readFileSync('src/components/Tabs.jsx', 'utf8');

tabs = tabs.replace(/"#06231A"/g, "T.brandInk");
tabs = tabs.replace(/'#F59E0B'/g, "T.importante");

fs.writeFileSync('src/components/Tabs.jsx', tabs, 'utf8');
