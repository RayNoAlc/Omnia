const fs = require('fs');
let code = fs.readFileSync('src/App.jsx', 'utf8');

// Remove from the bottom
code = code.replace(
`  const visibleCommitments = config?.showArchived ? commitments : commitments.filter(c => !(c.assunto||"").toLowerCase().includes('#arquivado') && !(c.disciplina||"").toLowerCase().includes('#arquivado'));
  const visibleNotes = config?.showArchived ? notes : notes.filter(n => !(n.texto||"").toLowerCase().includes('#arquivado') && !(n.disciplina||"").toLowerCase().includes('#arquivado'));\n\n`,
  ``
);

// Add to the top
const target = `  const hoje = todayISO();\n`;
const injection = `  const visibleCommitments = config?.showArchived ? commitments : commitments.filter(c => !(c.assunto||"").toLowerCase().includes('#arquivado') && !(c.disciplina||"").toLowerCase().includes('#arquivado'));
  const visibleNotes = config?.showArchived ? notes : notes.filter(n => !(n.texto||"").toLowerCase().includes('#arquivado') && !(n.disciplina||"").toLowerCase().includes('#arquivado'));\n`;

code = code.replace(target, target + injection);

fs.writeFileSync('src/App.jsx', code, 'utf8');
console.log("Moved visible declarations.");
