const fs = require('fs');
const file = 'src/components/Tabs.jsx';
let content = fs.readFileSync(file, 'utf8');

const targetStart = '      <div>\n        <div className="flex items-center justify-between mb-2">\n          <SectionLabel>Compromissos da semana</SectionLabel>';
const targetEnd = '        </div>\n      </div>\n\n      {modal === "sono"';

const startIndex = content.indexOf(targetStart);
const endIndex = content.indexOf(targetEnd) + 21;

if (startIndex > -1 && endIndex > -1) {
  const replacement = `
  const parseTime = (timeStr) => {
    if (!timeStr) return 0;
    const [h, m] = timeStr.split(":").map(Number);
    return h * 60 + m;
  };

  const wakeMin = parseTime(routine.acordar || "06:00");
  let sleepMin = parseTime(routine.dormir || "23:00");
  if (sleepMin <= wakeMin) sleepMin += 24 * 60;
  
  const totalMinutes = sleepMin - wakeMin;
  const HOUR_HEIGHT = 60;
  
  const hours = [];
  for (let m = wakeMin; m <= sleepMin; m += 60) {
    const h = Math.floor(m / 60) % 24;
    hours.push(\`\${h.toString().padStart(2, "0")}:00\`);
  }
  
  const gridSection = (
      <div>
        <div className="flex items-center justify-between mb-2">
          <SectionLabel>Grade da Semana</SectionLabel>
          <GhostButton onClick={() => setModal({ block: null, dia: "Seg" })}><Plus className="w-3.5 h-3.5" /> Novo</GhostButton>
        </div>
        <div className="overflow-x-auto custom-scrollbar -mx-1 px-1 pb-1 mt-4">
          <div className="min-w-[700px]">
            <div className="flex ml-12 border-b mb-2" style={{ borderColor: T.border }}>
              {DIAS_SEMANA.map(dia => (
                <div key={dia} className="flex-1 text-center text-xs font-semibold pb-2" style={{ color: T.inkSoft }}>
                  {DIA_LABEL_LONGO[dia]}
                </div>
              ))}
            </div>
            
            <div className="flex relative rounded-b-lg border" style={{ height: (totalMinutes / 60) * HOUR_HEIGHT + 20, backgroundColor: T.surfaceAlt, borderColor: T.border }}>
              <div className="w-12 shrink-0 border-r relative" style={{ borderColor: T.border }}>
                {hours.map((hour, i) => (
                  <div key={i} className="absolute w-full text-right pr-2 text-[10px]" style={{ top: i * HOUR_HEIGHT - 6, color: T.inkSoft }}>
                    {hour}
                  </div>
                ))}
              </div>
              
              {DIAS_SEMANA.map((dia, idx) => (
                <div key={dia} className="flex-1 relative border-r last:border-0" style={{ borderColor: T.border }}>
                  {hours.map((_, i) => (
                    <div key={i} className="absolute w-full border-t" style={{ top: i * HOUR_HEIGHT, height: 1, borderColor: "rgba(128,128,128,0.1)" }}></div>
                  ))}
                  
                  {blocksByDay[dia].map((b) => {
                     const startM = parseTime(b.horaInicio);
                     let adjStart = startM < wakeMin && startM < 4 * 60 ? startM + 24 * 60 : startM; 
                     const endM = parseTime(b.horaFim);
                     let adjEnd = endM <= adjStart ? endM + 24 * 60 : endM;
                     
                     if (adjStart < wakeMin) adjStart = wakeMin;
                     if (adjEnd > sleepMin) adjEnd = sleepMin;
                     if (adjEnd <= adjStart) return null;
                     
                     const top = ((adjStart - wakeMin) / 60) * HOUR_HEIGHT;
                     const height = ((adjEnd - adjStart) / 60) * HOUR_HEIGHT;
                     
                     return (
                       <button
                         key={b.id}
                         onClick={() => setModal({ block: b, dia })}
                         className="absolute left-1 right-1 rounded p-1.5 text-left transition-transform hover:scale-[1.02] overflow-hidden"
                         style={{ top, height, backgroundColor: hexToRgba(b.cor, 0.2), borderLeft: \`3px solid \${b.cor}\` }}
                       >
                         <div className="text-[11px] font-bold truncate leading-tight" style={{ color: T.ink }}>{b.titulo}</div>
                         <div className="text-[9px] mt-0.5 opacity-80 truncate" style={{ color: T.inkSoft }}>{b.horaInicio.slice(0, 5)} - {b.horaFim.slice(0, 5)}</div>
                       </button>
                     );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
  );
`;

  let newContent = content.substring(0, startIndex);
  
  // Need to insert parseTime and grid logic BEFORE the return statement!
  const returnIdx = newContent.lastIndexOf('  return (');
  newContent = newContent.substring(0, returnIdx) + replacement.split('const gridSection = (')[0] + newContent.substring(returnIdx);
  
  newContent += replacement.split('const gridSection = ')[1].replace(';', '') + '\n\n      {modal === "sono"';
  newContent += content.substring(endIndex);
  
  fs.writeFileSync(file, newContent, 'utf8');
  console.log("Success!");
} else {
  console.log("Could not find targets");
}
