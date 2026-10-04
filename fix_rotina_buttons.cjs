const fs = require('fs');
let tabs = fs.readFileSync('src/components/Tabs.jsx', 'utf8');

const regex = /<div className="flex items-center gap-2">[\s\S]*?<GhostButton onClick=\{\(\) => setModal/m;

tabs = tabs.replace(regex, '<div className="flex items-center gap-2">\n{config?.enableCalendar !== false && (\n  <GhostButton onClick={exportarCalendario}>\n    <CalendarDays className="w-3.5 h-3.5" /> Sincronizar Calendário\n  </GhostButton>\n)}\n{config?.enablePdf !== false && (\n  <GhostButton onClick={exportarGrade} disabled={exporting}>\n{exporting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}\n{exporting ? "Gerando..." : "Gerar PDF"}\n</GhostButton>\n)}\n<GhostButton onClick={() => setModal');

fs.writeFileSync('src/components/Tabs.jsx', tabs, 'utf8');
