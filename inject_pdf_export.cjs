const fs = require('fs');
let tabs = fs.readFileSync('src/components/Tabs.jsx', 'utf8');

const exportPdfFn = `
  const downloadPdf = () => {
    try {
      const doc = new jsPDF();
      doc.setFontSize(16);
      doc.text("Resumo: " + (disc || (commitment && commitment.assunto) || "Omnia"), 14, 22);
      doc.setFontSize(12);
      const lines = doc.splitTextToSize(resumoDraft, 180);
      let y = 32;
      lines.forEach(line => {
        if (y > 280) {
          doc.addPage();
          y = 20;
        }
        doc.text(line, 14, y);
        y += 7;
      });
      doc.save(\`Resumo_\${disc || (commitment && commitment.assunto) || "Omnia"}.pdf\`);
    } catch(e) {
      alert("Erro ao exportar PDF.");
    }
  };
`;

tabs = tabs.replace(
  /const \[salvandoResumo, setSalvandoResumo\] = useState\(false\);/g,
  'const [salvandoResumo, setSalvandoResumo] = useState(false);\n' + exportPdfFn
);

// Inject button into DisciplinaCard panel
tabs = tabs.replace(
  /<GhostButton onClick=\{\(\) => setPanel\(null\)\}>Fechar<\/GhostButton>/,
  '<GhostButton onClick={() => setPanel(null)}>Fechar</GhostButton>\n                  <button onClick={downloadPdf} className="text-xs px-2 py-1 rounded transition-transform hover:scale-105 ml-auto" style={{ color: T.brand, border: `1px solid ${T.brand}` }} title="Exportar para PDF"><Download className="w-4 h-4 inline" /> Baixar PDF</button>'
);

// Inject button into CompromissoWorkspaceModal panel
tabs = tabs.replace(
  /<GhostButton onClick=\{\(\) => setPanel\(null\)\}>Fechar<\/GhostButton>/,
  '<GhostButton onClick={() => setPanel(null)}>Fechar</GhostButton>\n                  <button onClick={downloadPdf} className="text-xs px-2 py-1 rounded transition-transform hover:scale-105 ml-auto" style={{ color: T.brand, border: `1px solid ${T.brand}` }} title="Exportar para PDF"><Download className="w-4 h-4 inline" /> Baixar PDF</button>'
);

fs.writeFileSync('src/components/Tabs.jsx', tabs, 'utf8');
console.log("Injected PDF Export!");
