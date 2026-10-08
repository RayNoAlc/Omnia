const fs = require('fs');
let app = fs.readFileSync('src/App.jsx', 'utf8');

app = app.replace(
  /<HojeTab overdue=\{overdue\} blocksHoje=\{blocksHoje\} commitmentsHoje=\{commitmentsHoje\} routineItemsHoje=\{routineItemsHoje\}\s*proximos=\{proximos\} overload=\{overloadWindow\} onToggleBlock=\{handleToggleBlock\}\s*onGoInbox=\{\(\) => setTab\("inbox"\)\} onGoAgenda=\{\(\) => setTab\("agenda"\)\}\s*routine=\{routine\} metaHoje=\{metaHoje\} onSetMeta=\{handleSetMeta\} minutosEstudadosHoje=\{minutosEstudadosHoje\}\s*avisos=\{avisos\} \/>/,
  '<HojeTab overdue={overdue} blocksHoje={blocksHoje} commitmentsHoje={commitmentsHoje} routineItemsHoje={routineItemsHoje} proximos={proximos} overload={overloadWindow} onToggleBlock={handleToggleBlock} onGoInbox={() => setTab("inbox")} onGoAgenda={() => setTab("agenda")} routine={routine} metaHoje={metaHoje} onSetMeta={handleSetMeta} minutosEstudadosHoje={minutosEstudadosHoje} avisos={avisos} config={config} notes={notes} onSaveNote={saveAsNote} />'
);

fs.writeFileSync('src/App.jsx', app, 'utf8');
console.log("Updated App.jsx with props for HojeTab!");
