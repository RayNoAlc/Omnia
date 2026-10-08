const fs = require('fs');
let app = fs.readFileSync('src/App.jsx', 'utf8');

app = app.replace(
  /<SecretariaTab userId=\{userId\} routine=\{routine\} routineBlocks=\{routineBlocks\} routineExceptions=\{routineExceptions\}\s*commitments=\{commitments\} studyBlocks=\{studyBlocks\} notes=\{notes\} sessions=\{sessions\}\s*setRoutineBlocks=\{setRoutineBlocks\} setRoutineExceptions=\{setRoutineExceptions\} \/>/,
  '<SecretariaTab userId={userId} routine={routine} routineBlocks={routineBlocks} routineExceptions={routineExceptions} commitments={commitments} studyBlocks={studyBlocks} notes={notes} sessions={sessions} setRoutineBlocks={setRoutineBlocks} setRoutineExceptions={setRoutineExceptions} config={config} />'
);

fs.writeFileSync('src/App.jsx', app, 'utf8');
console.log("Updated App.jsx with config prop for SecretariaTab!");
