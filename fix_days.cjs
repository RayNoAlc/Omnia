const fs = require('fs');
let tabs = fs.readFileSync('src/components/Tabs.jsx', 'utf8');

tabs = tabs.replace(/const DIAS_SEMANA = \[.*?\];/, 'const DIAS_SEMANA = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];');
tabs = tabs.replace(/const DIA_LABEL_LONGO = \{.*?Dom: "Domingo" \};/, 'const DIA_LABEL_LONGO = { Seg: "Segunda", Ter: "Terça", Qua: "Quarta", Qui: "Quinta", Sex: "Sexta", Sáb: "Sábado", Dom: "Domingo" };');

fs.writeFileSync('src/components/Tabs.jsx', tabs, 'utf8');
