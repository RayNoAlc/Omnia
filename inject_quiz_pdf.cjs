const fs = require('fs');
let tabs = fs.readFileSync('src/components/Tabs.jsx', 'utf8');

const exportHtml = `
  const exportarQuizPDF = () => {
    if (!quiz || !quiz.questions || quiz.questions.length === 0) return;
    try {
      const doc = new jsPDF();
      doc.setFontSize(18);
      doc.text(\`Quiz: \${disciplina}\`, 14, 22);
      doc.setFontSize(12);
      
      let y = 35;
      quiz.questions.forEach((q, i) => {
        if (y > 270) { doc.addPage(); y = 20; }
        const questionText = doc.splitTextToSize(\`\${i + 1}. \${q.pergunta}\`, 180);
        doc.text(questionText, 14, y);
        y += questionText.length * 6 + 5;
        
        if (quiz.tipo === "multipla" && q.opcoes) {
          q.opcoes.forEach((op, j) => {
            if (y > 280) { doc.addPage(); y = 20; }
            const opText = doc.splitTextToSize(\`   \${String.fromCharCode(65 + j)}) \${op}\`, 180);
            doc.text(opText, 14, y);
            y += opText.length * 6 + 3;
          });
          y += 5;
        } else if (quiz.tipo === "vf") {
          doc.text("   (  ) Verdadeiro   (  ) Falso", 14, y);
          y += 10;
        } else if (quiz.tipo === "discursiva") {
          y += 20; // Espaço para resposta
          doc.line(14, y, 196, y);
          y += 10;
        }
      });
      doc.save(\`Quiz_\${disciplina}.pdf\`);
    } catch(e) {
      console.error(e);
      alert("Erro ao exportar PDF.");
    }
  };
`;

tabs = tabs.replace(
  /async function gerar\(\) \{/,
  exportHtml + '\n\n  async function gerar() {'
);

tabs = tabs.replace(
  /<div className="flex justify-between items-center mb-3">/,
  '<div className="flex justify-between items-center mb-3">\n          {quiz && !quiz.error && !quiz.submitted && <GhostButton onClick={exportarQuizPDF} className="text-xs" style={{ color: T.brand }}><Download className="w-3.5 h-3.5 mr-1" /> PDF para Imprimir</GhostButton>}'
);

fs.writeFileSync('src/components/Tabs.jsx', tabs, 'utf8');
console.log("Injected PDF Export!");
