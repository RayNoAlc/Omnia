const fs = require('fs');
let app = fs.readFileSync('src/App.jsx', 'utf8');

app = app.replace(
  /async function saveAsNote\(edited\) \{\s*const saved = await addNote\(userId, \{ disciplina: edited\.disciplina \|\| "Geral", texto: edited\.origemTexto \}\);\s*setNotes\(\(prev\) => \[saved, \.\.\.prev\]\);\s*setPendingReview\(null\);\s*\}/,
  `async function saveAsNote(edited) {
    const texto = edited.texto || edited.origemTexto || "";
    const saved = await addNote(userId, { disciplina: edited.disciplina || "Geral", texto });
    setNotes((prev) => [saved, ...prev]);
    setPendingReview(null);
  }`
);

fs.writeFileSync('src/App.jsx', app, 'utf8');
console.log("Fixed saveAsNote to support raw texto property!");
