const fs = require('fs');

let tabs = fs.readFileSync('src/components/Tabs.jsx', 'utf8');

tabs = tabs.replace("import html2canvas from 'html2canvas';", "import jsPDF from 'jspdf';\nimport 'jspdf-autotable';");

const oldFuncRegex = /const exportarGrade = async \(\) => \{[\s\S]*?setExporting\(false\);\n\};\n/;

const newFunc = "const exportarGrade = () => {\n" +
"  setExporting(true);\n" +
"  try {\n" +
"    const doc = new jsPDF();\n" +
"    doc.setFontSize(18);\n" +
"    doc.text('Meu Horário - Omnia', 14, 22);\n" +
"    \n" +
"    const dias = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab', 'Dom'];\n" +
"    const nomesDias = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'];\n" +
"    \n" +
"    let yPos = 30;\n" +
"    \n" +
"    dias.forEach((dia, i) => {\n" +
"      const blocosDoDia = routineBlocks.filter(b => b.diaSemana === dia).sort((a,b) => a.horaInicio.localeCompare(b.horaInicio));\n" +
"      if (blocosDoDia.length === 0) return;\n" +
"      \n" +
"      doc.setFontSize(14);\n" +
"      doc.text(nomesDias[i], 14, yPos + 10);\n" +
"      \n" +
"      const tableData = blocosDoDia.map(b => [\n" +
"        b.horaInicio.slice(0,5) + ' - ' + b.horaFim.slice(0,5),\n" +
"        b.titulo\n" +
"      ]);\n" +
"      \n" +
"      doc.autoTable({\n" +
"        startY: yPos + 15,\n" +
"        head: [['Horário', 'Compromisso']],\n" +
"        body: tableData,\n" +
"        theme: 'striped',\n" +
"        headStyles: { fillColor: '#2563EB' },\n" +
"        margin: { top: 10, bottom: 10 }\n" +
"      });\n" +
"      \n" +
"      yPos = doc.lastAutoTable.finalY + 10;\n" +
"      if (yPos > 250) {\n" +
"        doc.addPage();\n" +
"        yPos = 20;\n" +
"      }\n" +
"    });\n" +
"    \n" +
"    doc.save('Meus-Horarios-Omnia.pdf');\n" +
"  } catch (err) {\n" +
"    console.error('Erro ao gerar PDF', err);\n" +
"  }\n" +
"  setExporting(false);\n" +
"};\n";

tabs = tabs.replace(oldFuncRegex, newFunc);

// Fix layout
tabs = tabs.replace(
  /Novo<\/GhostButton>\s*<\/div>\s*<div className="overflow-x-auto/,
  'Novo</GhostButton>\n          </div>\n        </div>\n        <div className="overflow-x-auto'
);

tabs = tabs.replace(
  /<\/div>\s*\{modal === "sono" &&/,
  '{modal === "sono" &&'
);

// Also remove Baixar Imagem text and replace with Gerar PDF
tabs = tabs.replace(
  /\{exporting \? "Gerando\.\.\." : "Baixar Imagem"\}/,
  '{exporting ? "Gerando..." : "Gerar PDF"}'
);

fs.writeFileSync('src/components/Tabs.jsx', tabs, 'utf8');
