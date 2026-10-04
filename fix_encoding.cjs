const fs = require('fs');
let text = fs.readFileSync('src/components/Tabs.jsx', 'utf8');

text = text.replace(/const DIAS_SEMANA = \["Seg", "Ter", "Qua", "Qui", "Sex", ".*?", "Dom"\];/g, 'const DIAS_SEMANA = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];');
text = text.replace(/const DIA_LABEL_LONGO = \{ Seg: "Segunda", Ter: ".*?", Qua: "Quarta", Qui: "Quinta", Sex: "Sexta", .*?: ".*?", Dom: "Domingo" \};/g, 'const DIA_LABEL_LONGO = { Seg: "Segunda", Ter: "Terça", Qua: "Quarta", Qui: "Quinta", Sex: "Sexta", Sáb: "Sábado", Dom: "Domingo" };');

fs.writeFileSync('src/components/Tabs.jsx', text, 'utf8');
