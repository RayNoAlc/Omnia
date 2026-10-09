const fs = require('fs');
let app = fs.readFileSync('src/App.jsx', 'utf8');

const filterLogic = `
  const visibleCommitments = config?.showArchived ? commitments : commitments.filter(c => !(c.assunto||"").toLowerCase().includes('#arquivado') && !(c.disciplina||"").toLowerCase().includes('#arquivado'));
  const visibleNotes = config?.showArchived ? notes : notes.filter(n => !(n.texto||"").toLowerCase().includes('#arquivado') && !(n.disciplina||"").toLowerCase().includes('#arquivado'));
`;

app = app.replace(
  /const visibleTabs = TABS\.filter\(t => t\.id !== "desempenho" \|\| config\?\.enableGamification\);/,
  filterLogic + '\n  const visibleTabs = TABS.filter(t => t.id !== "desempenho" || config?.enableGamification);'
);

app = app.replace(/commitments=\{commitments\}/g, 'commitments={visibleCommitments}');
app = app.replace(/commitmentsHoje = commitments/g, 'commitmentsHoje = visibleCommitments');

app = app.replace(/notes=\{notes\}/g, 'notes={visibleNotes}');

// We also need to restore ConfigTab to receive the REAL commitments/notes for the Markdown Backup!!
app = app.replace(
  /<ConfigTab userId=\{userId\} config=\{config\} updateConfig=\{updateConfig\} commitments=\{visibleCommitments\} notes=\{visibleNotes\} summaries=\{summaries\} \/>/,
  '<ConfigTab userId={userId} config={config} updateConfig={updateConfig} commitments={commitments} notes={notes} summaries={summaries} />'
);

fs.writeFileSync('src/App.jsx', app, 'utf8');
console.log("Filtered Archived items in App!");
