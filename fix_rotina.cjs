const fs = require('fs');
let tabs = fs.readFileSync('src/components/Tabs.jsx', 'utf8');

tabs = tabs.replace("export function RotinaTab({\nconst [exporting", "export function RotinaTab({");
tabs = tabs.replace("setExporting] = React.useState(false);\nconst gridRef = React.useRef(null);\nconst exportarGrade = async () => {\n  if (!gridRef.current) return;\n  setExporting(true);\n  try {\n    const canvas = await html2canvas(gridRef.current, { backgroundColor: '#0B1120', scale: 2 });\n    const link = document.createElement('a');\n    link.download = 'Minha-Semana-Omnia.png';\n    link.href = canvas.toDataURL('image/png');\n    link.click();\n  } catch (err) {\n    console.error('Erro ao gerar imagem', err);\n  }\n  setExporting(false);\n};\n", "");

const funcBody = tabs.indexOf(') {', tabs.indexOf('export function RotinaTab(')) + 3;

const exportCode = "\nconst [exporting, setExporting] = React.useState(false);\nconst gridRef = React.useRef(null);\nconst exportarGrade = async () => {\n  if (!gridRef.current) return;\n  setExporting(true);\n  try {\n    const canvas = await html2canvas(gridRef.current, { backgroundColor: '#0B1120', scale: 2 });\n    const link = document.createElement('a');\n    link.download = 'Minha-Semana-Omnia.png';\n    link.href = canvas.toDataURL('image/png');\n    link.click();\n  } catch (err) {\n    console.error('Erro ao gerar imagem', err);\n  }\n  setExporting(false);\n};\n";

tabs = tabs.slice(0, funcBody) + exportCode + tabs.slice(funcBody);
fs.writeFileSync('src/components/Tabs.jsx', tabs, 'utf8');
