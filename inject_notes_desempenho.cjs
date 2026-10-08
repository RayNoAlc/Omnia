const fs = require('fs');
let app = fs.readFileSync('src/App.jsx', 'utf8');

app = app.replace(
  /<DesempenhoTab commitments=\{commitments\} sessions=\{sessions\} quizAttempts=\{quizAttempts\} professorAttempts=\{professorAttempts\} config=\{config\} \/>/,
  '<DesempenhoTab commitments={commitments} sessions={sessions} quizAttempts={quizAttempts} professorAttempts={professorAttempts} config={config} notes={notes} />'
);

fs.writeFileSync('src/App.jsx', app, 'utf8');
console.log("Passed notes to DesempenhoTab!");
