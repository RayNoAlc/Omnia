const fs = require('fs');

let tabs = fs.readFileSync('src/components/Tabs.jsx', 'utf8');

// 1. Add onDeleteCommitment to BibliotecaTab props
tabs = tabs.replace(
  /export function BibliotecaTab\(\{ userId, setCommitments, notes, commitments, materials, quizAttempts, professorAttempts, onDeleteNote, summaries, setSummaries, setNotes, setMaterials, setQuizAttempts, setProfessorAttempts \}\)/,
  'export function BibliotecaTab({ userId, setCommitments, onDeleteCommitment, notes, commitments, materials, quizAttempts, professorAttempts, onDeleteNote, summaries, setSummaries, setNotes, setMaterials, setQuizAttempts, setProfessorAttempts })'
);

// 2. Add trash icon to BibliotecaTab's 'compromissosPorSemestre' lists
tabs = tabs.replace(
  /<PriorityDot prioridade=\{c\.prioridade\} \/>\s*<\/Card>\s*<\/button>/g,
  `<div className="flex items-center gap-3 shrink-0">
                      <PriorityDot prioridade={c.prioridade} />
                      <button onClick={(e) => { e.stopPropagation(); if(confirm("Excluir compromisso?")) onDeleteCommitment(c.id); }} style={{ color: T.inkSoft }} className="hover:text-red-500 transition-colors"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </Card>
                </button>`
);

// 3. Pass onDeleteCommitment to DisciplinaCard
tabs = tabs.replace(
  /onOpenCommitment=\{setOpenCommitment\}/g,
  'onOpenCommitment={setOpenCommitment}\n                onDeleteCommitment={onDeleteCommitment}'
);

// 4. Add onDeleteCommitment to DisciplinaCard props
tabs = tabs.replace(
  /function DisciplinaCard\(\{ userId, disc, notasDisc, compromissosDisc, materiaisDisc, onDeleteNote, onDeleteMaterial, onOpenCommitment, summaries, setSummaries, setQuizAttempts, setProfessorAttempts \}\)/,
  'function DisciplinaCard({ userId, disc, notasDisc, compromissosDisc, materiaisDisc, onDeleteNote, onDeleteMaterial, onOpenCommitment, onDeleteCommitment, summaries, setSummaries, setQuizAttempts, setProfessorAttempts })'
);

// 5. Add trash icon to DisciplinaCard lists
tabs = tabs.replace(
  /<div className="text-sm">\{c\.assunto\}<\/div>\s*<TypeTag tipo=\{c\.tipo\} \/>\s*<\/Card>\s*<\/button>/g,
  `<div className="text-sm">{c.assunto}</div>
                <div className="flex items-center gap-3 shrink-0">
                  <TypeTag tipo={c.tipo} />
                  <button onClick={(e) => { e.stopPropagation(); if(confirm("Excluir compromisso?")) onDeleteCommitment(c.id); }} style={{ color: T.inkSoft }} className="hover:text-red-500 transition-colors"><Trash2 className="w-4 h-4" /></button>
                </div>
              </Card>
            </button>`
);

// 6. Pass onDeleteCommitment to CompromissoWorkspaceModal in AgendaTab and BibliotecaTab
tabs = tabs.replace(
  /commitment=\{openCommitment\}/g,
  'commitment={openCommitment}\n            onDeleteCommitment={onDeleteCommitment}'
);

// 7. Add onDeleteCommitment to CompromissoWorkspaceModal props
tabs = tabs.replace(
  /setNotes, setMaterials, setSummaries, setQuizAttempts, setProfessorAttempts, onClose,\s*\}/,
  'setNotes, setMaterials, setSummaries, setQuizAttempts, setProfessorAttempts, onClose, onDeleteCommitment\n  }'
);

// 8. Add trash icon to CompromissoWorkspaceModal header
tabs = tabs.replace(
  /<\/div>\s*<button onClick=\{onClose\} style=\{\{ color: T\.inkSoft \}\} className="shrink-0"><X className="w-5 h-5" \/><\/button>\s*<\/div>\s*<CompromissoWorkspaceContent/g,
  `</div>
            <div className="flex items-center gap-4 shrink-0">
              {onDeleteCommitment && (
                <button onClick={() => { if(confirm("Excluir este compromisso?")) { onDeleteCommitment(commitment.id); onClose(); } }} style={{ color: T.critico }} className="hover:opacity-80 transition-opacity" title="Excluir"><Trash2 className="w-5 h-5" /></button>
              )}
              <button onClick={onClose} style={{ color: T.inkSoft }} className="hover:opacity-80 transition-opacity"><X className="w-5 h-5" /></button>
            </div>
          </div>
  
          <CompromissoWorkspaceContent`
);

fs.writeFileSync('src/components/Tabs.jsx', tabs, 'utf8');

// 9. Update App.jsx to pass handleDeleteCommitment to BibliotecaTab
let app = fs.readFileSync('src/App.jsx', 'utf8');
app = app.replace(
  /<BibliotecaTab userId=\{userId\} setCommitments=\{setCommitments\}/,
  '<BibliotecaTab userId={userId} setCommitments={setCommitments} onDeleteCommitment={handleDeleteCommitment}'
);
fs.writeFileSync('src/App.jsx', app, 'utf8');

console.log("Injected delete functionality!");
