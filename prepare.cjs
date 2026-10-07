const fs = require('fs');

// 1. App.jsx
let app = fs.readFileSync('src/App.jsx', 'utf8');
app = app.replace(
  /<BibliotecaTab userId=\{userId\} setCommitments=\{setCommitments\}/,
  '<BibliotecaTab userId={userId} setCommitments={setCommitments} onDeleteCommitment={handleDeleteCommitment}'
);
fs.writeFileSync('src/App.jsx', app, 'utf8');

// 2. Tabs.jsx
let tabs = fs.readFileSync('src/components/Tabs.jsx', 'utf8');

// A. BibliotecaTab definition
tabs = tabs.replace(
  /export function BibliotecaTab\(\{ userId, setCommitments, notes, commitments, materials, quizAttempts, professorAttempts, onDeleteNote, summaries, setSummaries, setNotes, setMaterials, setQuizAttempts, setProfessorAttempts \}\)/,
  'export function BibliotecaTab({ userId, setCommitments, onDeleteCommitment, notes, commitments, materials, quizAttempts, professorAttempts, onDeleteNote, summaries, setSummaries, setNotes, setMaterials, setQuizAttempts, setProfessorAttempts })'
);

// B. BibliotecaTab semestre list items
tabs = tabs.replace(
  /<PriorityDot prioridade=\{c\.prioridade\} \/>\s*<\/Card>\s*<\/button>/g,
  '<PriorityDot prioridade={c.prioridade} />\n                    <button onClick={(e) => { e.stopPropagation(); onDeleteCommitment(c.id); }} style={{ color: T.inkSoft }} className="ml-3 shrink-0 hover:text-red-500 transition-colors"><Trash2 className="w-4 h-4" /></button>\n                    </div>\n                  </Card>\n                </button>'
);
// Wait, replacing blindly is dangerous if the structure is different. Let's do it carefully.
