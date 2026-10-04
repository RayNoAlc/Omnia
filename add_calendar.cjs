const fs = require('fs');

let tabs = fs.readFileSync('src/components/Tabs.jsx', 'utf8');

if (!tabs.includes('import * as ics')) {
  tabs = tabs.replace(
    /import autoTable from 'jspdf-autotable';/,
    "import autoTable from 'jspdf-autotable';\nimport * as ics from 'ics';"
  );
}
if (!tabs.includes('CalendarDays')) {
  tabs = tabs.replace(
    /Moon, SlidersHorizontal, Pencil, Target,/,
    "Moon, SlidersHorizontal, Pencil, Target, CalendarDays,"
  );
}

const funcCode = "  const exportarCalendario = () => {\n" +
"    const byDayMap = { Seg: 'MO', Ter: 'TU', Qua: 'WE', Qui: 'TH', Sex: 'FR', Sab: 'SA', Dom: 'SU' };\n" +
"    const events = routineBlocks.map(b => {\n" +
"      const today = new Date();\n" +
"      const currentDay = today.getDay();\n" +
"      const dayMap = { Dom: 0, Seg: 1, Ter: 2, Qua: 3, Qui: 4, Sex: 5, Sab: 6 };\n" +
"      const targetDay = dayMap[b.diaSemana];\n" +
"      let daysUntil = targetDay - currentDay;\n" +
"      if (daysUntil < 0) daysUntil += 7;\n" +
"      const nextDate = new Date(today);\n" +
"      nextDate.setDate(today.getDate() + daysUntil);\n" +
"      \n" +
"      const startHour = parseInt(b.horaInicio.split(':')[0]);\n" +
"      const startMin = parseInt(b.horaInicio.split(':')[1]);\n" +
"      \n" +
"      const [eh, em] = b.horaFim.split(':').map(Number);\n" +
"      const endTotalMins = eh * 60 + em;\n" +
"      const startTotalMins = startHour * 60 + startMin;\n" +
"      let durationMins = endTotalMins - startTotalMins;\n" +
"      if (durationMins < 0) durationMins += 24 * 60;\n" +
"      const h = Math.floor(durationMins / 60);\n" +
"      const m = durationMins % 60;\n" +
"      \n" +
"      return {\n" +
"        title: b.titulo,\n" +
"        start: [nextDate.getFullYear(), nextDate.getMonth() + 1, nextDate.getDate(), startHour, startMin],\n" +
"        duration: { hours: h, minutes: m },\n" +
"        recurrenceRule: 'FREQ=WEEKLY;BYDAY=' + byDayMap[b.diaSemana],\n" +
"        description: 'Omnia: ' + b.titulo,\n" +
"      };\n" +
"    });\n" +
"    \n" +
"    ics.createEvents(events, (error, value) => {\n" +
"      if (error) {\n" +
"        console.error(error);\n" +
"        return;\n" +
"      }\n" +
"      const blob = new Blob([value], { type: 'text/calendar' });\n" +
"      const url = URL.createObjectURL(blob);\n" +
"      const link = document.createElement('a');\n" +
"      link.href = url;\n" +
"      link.download = 'Omnia-Rotina.ics';\n" +
"      link.click();\n" +
"      URL.revokeObjectURL(url);\n" +
"    });\n" +
"  };\n";

tabs = tabs.replace(/const gridRef = useRef\(null\);/, "const gridRef = useRef(null);\n" + funcCode);

const buttons = "<GhostButton onClick={exportarCalendario}>\n" +
"    <CalendarDays className=\"w-3.5 h-3.5\" /> Sincronizar Calendário\n" +
"  </GhostButton>\n" +
"  <GhostButton onClick={exportarGrade} disabled={exporting}>\n";

tabs = tabs.replace(/<GhostButton onClick=\{exportarGrade\} disabled=\{exporting\}>/, buttons);

fs.writeFileSync('src/components/Tabs.jsx', tabs, 'utf8');
