const fs = require('fs');
let tabs = fs.readFileSync('src/components/Tabs.jsx', 'utf8');

tabs = tabs.replace(
  '<GhostButton onClick={exportarCalendario}>',
  '{config?.enableCalendar !== false && <GhostButton onClick={exportarCalendario}>'
);
tabs = tabs.replace(
  '</GhostButton>\n    <GhostButton onClick={exportarGrade} disabled={exporting}>',
  '</GhostButton>}\n    {config?.enablePdf !== false && <GhostButton onClick={exportarGrade} disabled={exporting}>'
);
tabs = tabs.replace(
  '{exporting ? "Gerando..." : "Gerar PDF"}\n  </GhostButton>\n  <GhostButton onClick={() => setModal({ block: null, dia: "Seg" })}><Plus className="w-3.5 h-3.5" /> \nNovo</GhostButton>',
  '{exporting ? "Gerando..." : "Gerar PDF"}\n  </GhostButton>}\n  <GhostButton onClick={() => setModal({ block: null, dia: "Seg" })}><Plus className="w-3.5 h-3.5" /> \nNovo</GhostButton>'
);

fs.writeFileSync('src/components/Tabs.jsx', tabs, 'utf8');
