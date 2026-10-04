const fs = require('fs');

let tabs = fs.readFileSync('src/components/Tabs.jsx', 'utf8');

// Replace the html2canvas import and function with jsPDF
tabs = tabs.replace("import html2canvas from 'html2canvas';", "import jsPDF from 'jspdf';\nimport 'jspdf-autotable';");

const oldFuncRegex = /const exportarGrade = async \(\) => \{[\s\S]*?setExporting\(false\);\n\};\n/;

const newFunc = \const exportarGrade = () => {
  setExporting(true);
  try {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text('Meu Horário - Omnia', 14, 22);
    
    const dias = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sab", "Dom"];
    const nomesDias = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado", "Domingo"];
    
    let yPos = 30;
    
    dias.forEach((dia, i) => {
      const blocosDoDia = routineBlocks.filter(b => b.diaSemana === dia).sort((a,b) => a.horaInicio.localeCompare(b.horaInicio));
      if (blocosDoDia.length === 0) return;
      
      doc.setFontSize(14);
      doc.text(nomesDias[i], 14, yPos + 10);
      
      const tableData = blocosDoDia.map(b => [
        \\ - \\,
        b.titulo
      ]);
      
      doc.autoTable({
        startY: yPos + 15,
        head: [['Horário', 'Compromisso']],
        body: tableData,
        theme: 'striped',
        headStyles: { fillColor: '#2563EB' },
        margin: { top: 10, bottom: 10 }
      });
      
      yPos = doc.lastAutoTable.finalY + 10;
      if (yPos > 250) {
        doc.addPage();
        yPos = 20;
      }
    });
    
    doc.save('Meus-Horarios-Omnia.pdf');
  } catch (err) {
    console.error('Erro ao gerar PDF', err);
  }
  setExporting(false);
};
\;

tabs = tabs.replace(oldFuncRegex, newFunc);

// Fix the layout bug (unclosed div before overflow-x-auto)
// Current code has: Novo</GhostButton>\n          </div>\n          <div className="overflow-x-auto
tabs = tabs.replace(
  /Novo<\/GhostButton>\s*<\/div>\s*<div className="overflow-x-auto/,
  'Novo</GhostButton>\n          </div>\n          </div>\n          <div className="overflow-x-auto'
);

// We need to also remove that extra </div> we added later, which was right before {modal === "sono"
// Wait, the previous code had </div>\n        {modal === "sono" &&. If we close the inner div properly, the outer div closure might need to be removed?
// Wait, if I opened 1 div (<div className="flex...">) and closed it, then the outer container was already balanced BEFORE I made my mistakes!
// Let's remove the extra </div> before {modal === "sono" that I manually added in ix_div_last.cjs and ix_div_again.cjs.
tabs = tabs.replace(
  /<\/div>\s*\{modal === "sono" &&/,
  '{modal === "sono" &&'
);

fs.writeFileSync('src/components/Tabs.jsx', tabs, 'utf8');
