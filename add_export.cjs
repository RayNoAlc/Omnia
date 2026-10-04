const fs = require('fs');

let tabs = fs.readFileSync('src/components/Tabs.jsx', 'utf8');

if (!tabs.includes('html2canvas')) {
  tabs = "import html2canvas from 'html2canvas';\n" + tabs;
}

if (!tabs.includes('Download,')) {
  tabs = tabs.replace(/Trash2,/, 'Trash2, Download,');
}

const rotinaTabStart = tabs.indexOf('export function RotinaTab({');
const functionBodyStart = tabs.indexOf('{', rotinaTabStart) + 1;

const exportCode = "\nconst [exporting, setExporting] = React.useState(false);\nconst gridRef = React.useRef(null);\nconst exportarGrade = async () => {\n  if (!gridRef.current) return;\n  setExporting(true);\n  try {\n    const canvas = await html2canvas(gridRef.current, { backgroundColor: '#0B1120', scale: 2 });\n    const link = document.createElement('a');\n    link.download = 'Minha-Semana-Omnia.png';\n    link.href = canvas.toDataURL('image/png');\n    link.click();\n  } catch (err) {\n    console.error('Erro ao gerar imagem', err);\n  }\n  setExporting(false);\n};\n";

tabs = tabs.slice(0, functionBodyStart) + exportCode + tabs.slice(functionBodyStart);

tabs = tabs.replace(
  /<div className="flex items-center justify-between mb-2">\s*<SectionLabel>Grade da Semana<\/SectionLabel>\s*<GhostButton onClick=\{\(\) => setModal\(\{ block: null, dia: "Seg" \}\)\}/,
  '<div className="flex items-center justify-between mb-2">\n<SectionLabel>Grade da Semana</SectionLabel>\n<div className="flex items-center gap-2">\n<GhostButton onClick={exportarGrade} disabled={exporting}>\n{exporting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}\n{exporting ? "Gerando..." : "Baixar Imagem"}\n</GhostButton>\n<GhostButton onClick={() => setModal({ block: null, dia: "Seg" })}>'
);

tabs = tabs.replace(
  /<div className="overflow-x-auto custom-scrollbar -mx-1 px-1 pb-1 mt-4">/,
  '<div className="overflow-x-auto custom-scrollbar -mx-1 px-1 pb-1 mt-4" ref={gridRef} style={{ borderRadius: "12px", overflow: "hidden", padding: "16px", backgroundColor: "#0B1120" }}>'
);


fs.writeFileSync('src/components/Tabs.jsx', tabs, 'utf8');
