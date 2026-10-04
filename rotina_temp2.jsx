export function RotinaTab({ routine, routineBlocks, routineExceptions, onUpdateRoutine, onAddBlock, onUpdateBlock, onDeleteBlock, onDeleteException }) {
  const [modal, setModal] = useState(null);
  const [dragging, setDragging] = useState(null); // "sono" | "preferencias" | { block, dia } | null

  if (!routine) return null;

  
  function handleDrop(e, targetDay) {
    e.preventDefault();
    if (!dragging) return;
    
    // We get the offsetY from the container. 
    // To be precise regardless of children, we use getBoundingClientRect
    const rect = e.currentTarget.getBoundingClientRect();
    const y = e.clientY - rect.top;
    
    // Calculate new start minutes
    const HOUR_HEIGHT = 40;
    const Y_OFFSET = 12;
    const wakeMin = Number(routine?.acordar?.split(":")[0] || 6) * 60 + Number(routine?.acordar?.split(":")[1] || 0);
    
    let newStartMin = wakeMin + Math.floor(y / HOUR_HEIGHT) * 60 + Math.floor((y % HOUR_HEIGHT) / (HOUR_HEIGHT / 60));
    // Snap to 15 min intervals
    newStartMin = Math.round(newStartMin / 15) * 15;
    
    const h = String(Math.floor(newStartMin / 60)).padStart(2, '0');
    const m = String(newStartMin % 60).padStart(2, '0');
    const newStart = `${h}:${m}`;
    
    // Find block
    const block = routineBlocks.find(b => b.id === dragging.id);
    if (block) {
       // calculate duration to preserve it
       const [sh, sm] = block.horaInicio.split(":").map(Number);
       const [eh, em] = block.horaFim.split(":").map(Number);
       const dur = (eh * 60 + em) - (sh * 60 + sm);
       
       const endMin = newStartMin + dur;
       const newEnd = `${String(Math.floor(endMin / 60)).padStart(2, '0')}:${String(endMin % 60).padStart(2, '0')}`;
       
       let newDias = [...block.dias];
       if (dragging.sourceDay !== targetDay) {
         newDias = newDias.filter(d => d !== dragging.sourceDay);
         if (!newDias.includes(targetDay)) newDias.push(targetDay);
       }
       
       onUpdateBlock(block.id, { dias: newDias, horaInicio: newStart, horaFim: newEnd });
    }
    setDragging(null);
  }

  const blocksByDay = {};
  DIAS_SEMANA.forEach((d) => { blocksByDay[d] = []; });
  routineBlocks.forEach((b) => { if (blocksByDay[b.diaSemana]) blocksByDay[b.diaSemana].push(b); });
  Object.keys(blocksByDay).forEach((d) => blocksByDay[d].sort((a, b) => a.horaInicio.localeCompare(b.horaInicio)));

  const diasSono = routine.diasSono && routine.diasSono.length ? routine.diasSono : DIAS_SEMANA;
  const [semanaInicio, semanaFim] = getWeekRange(todayISO());
  const excecoesSemana = routineExceptions
    .filter((e) => e.data >= semanaInicio && e.data <= semanaFim)
    .sort((a, b) => a.data.localeCompare(b.data));

  function descreverExcecao(ex) {
    const blocoRelacionado = ex.routineBlockId ? routineBlocks.find((b) => b.id === ex.routineBlockId) : null;
    if (ex.tipoExcecao === "cancelamento") {
      return `Cancelado em ${formatDateBR(ex.data)}${blocoRelacionado ? ` — ${blocoRelacionado.titulo}` : ""}`;
    }
    if (ex.tipoExcecao === "alteracao") {
      return `${ex.titulo || blocoRelacionado?.titulo || "Compromisso"} muda em ${formatDateBR(ex.data)}${ex.horaInicio ? ` para ${ex.horaInicio.slice(0, 5)}–${ex.horaFim?.slice(0, 5) || ""}` : ""}`;
    }
    return `${ex.titulo || "Compromisso avulso"} — só em ${formatDateBR(ex.data)}${ex.horaInicio ? `, ${ex.horaInicio.slice(0, 5)}–${ex.horaFim?.slice(0, 5) || ""}` : ""}`;
  }

  const parseTime = (timeStr) => {
    if (!timeStr) return 0;
    const [h, m] = timeStr.split(":").map(Number);
    return h * 60 + m;
  };

  const wakeMin = parseTime(routine.acordar || "06:00");
  let sleepMin = parseTime(routine.dormir || "23:00");
  if (sleepMin <= wakeMin) sleepMin += 24 * 60;
  
  const totalMinutes = sleepMin - wakeMin;
  const HOUR_HEIGHT = 40;
  const Y_OFFSET = 12;
  
  const hours = [];
  for (let m = wakeMin; m <= sleepMin; m += 60) {
    const h = Math.floor(m / 60) % 24;
    hours.push(`${h.toString().padStart(2, "0")}:00`);
  }
  
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <Card>
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-1.5 text-xs" style={{ color: T.inkSoft }}><Moon className="w-3.5 h-3.5" /> Sono</div>
            <button onClick={() => setModal("sono")} style={{ color: T.brand }}><Pencil className="w-3.5 h-3.5" /></button>
          </div>
          <div className="text-sm font-medium" style={{ color: T.ink }}>{routine.dormir} — {routine.acordar}</div>
          <div className="text-[11px] mt-0.5" style={{ color: T.inkSoft }}>{diasSono.length === 7 ? "Todos os dias" : diasSono.join(", ")}</div>
        </Card>
        <Card>
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-1.5 text-xs" style={{ color: T.inkSoft }}><SlidersHorizontal className="w-3.5 h-3.5" /> Estudo</div>
            <button onClick={() => setModal("preferencias")} style={{ color: T.brand }}><Pencil className="w-3.5 h-3.5" /></button>
          </div>
          <div className="text-sm font-medium" style={{ color: T.ink }}>{PERIODO_LABELS[routine.periodoPreferido]} • {routine.duracaoPreferida === "curta" ? "curtas" : "longas"}</div>
          <div className="text-[11px] mt-0.5" style={{ color: T.inkSoft }}>{routine.lazerMinimoMin} min de lazer/dia</div>
        </Card>
      </div>

      {excecoesSemana.length > 0 && (
        <div>
          <SectionLabel>Alterações pontuais desta semana</SectionLabel>
          <div className="space-y-1.5">
            {excecoesSemana.map((ex) => (
              <Card key={ex.id} className="py-2 flex items-center justify-between gap-2">
                <span className="text-sm" style={{ color: T.ink }}>{descreverExcecao(ex)}</span>
                <button onClick={() => onDeleteException(ex.id)} style={{ color: T.inkSoft }} className="shrink-0"><Trash2 className="w-3.5 h-3.5" /></button>
              </Card>
            ))}
          </div>
        </div>
      )}

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
            
            <div className="flex relative rounded-b-lg border" style={{ height: (totalMinutes / 60) * HOUR_HEIGHT + Y_OFFSET + 20, backgroundColor: T.surfaceAlt, borderColor: T.border }}>
              <div className="w-12 shrink-0 border-r relative" style={{ borderColor: T.border }}>
                {hours.map((hour, i) => (
                  <div key={i} className="absolute w-full text-right pr-2 text-[10px]" style={{ top: i * HOUR_HEIGHT + Y_OFFSET - 6, color: T.inkSoft }}>
                    {hour}
                  </div>
                ))}
              </div>
              
              {DIAS_SEMANA.map((dia, idx) => (
                <div key={dia} className="flex-1 relative border-r last:border-0" style={{ borderColor: T.border }}>
                  {hours.map((_, i) => (
                    <div key={i} className="absolute w-full border-t" style={{ top: i * HOUR_HEIGHT + Y_OFFSET, height: 1, borderColor: "rgba(128,128,128,0.1)" }}></div>
                  ))}
                  
                  {blocksByDay[dia].map((b) => {
                     const startM = parseTime(b.horaInicio);
                     let adjStart = startM < wakeMin && startM < 4 * 60 ? startM + 24 * 60 : startM; 
                     const endM = parseTime(b.horaFim);
                     let adjEnd = endM <= adjStart ? endM + 24 * 60 : endM;
                     
                     if (adjStart < wakeMin) adjStart = wakeMin;
                     if (adjEnd > sleepMin) adjEnd = sleepMin;
                     if (adjEnd <= adjStart) return null;
                     
                     const top = ((adjStart - wakeMin) / 60) * HOUR_HEIGHT + Y_OFFSET;
                     const height = ((adjEnd - adjStart) / 60) * HOUR_HEIGHT;
                     
                     return (
                       <button
                         key={b.id}
                         onClick={() => setModal({ block: b, dia })} draggable onDragStart={(e) => { e.stopPropagation(); e.dataTransfer.setData("text/plain", b.id); setDragging({ id: b.id, sourceDay: dia }); }} onDragEnd={() => setDragging(null)}
                         className="absolute left-1 right-1 rounded p-1.5 text-left transition-transform hover:scale-[1.02] overflow-hidden"
                         style={{ top, height, backgroundColor: hexToRgba(b.cor, 0.2), borderLeft: `3px solid ${b.cor}` }}
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
      {modal === "sono" && <SonoModal routine={routine} onSave={onUpdateRoutine} onClose={() => setModal(null)} />}
      {modal === "preferencias" && <PreferenciasModal routine={routine} onSave={onUpdateRoutine} onClose={() => setModal(null)} />}
      {modal && typeof modal === "object" && (
        <CompromissoRotinaModal
          block={modal.block}
          defaultDia={modal.dia}
          onSave={(data) => (modal.block ? onUpdateBlock(modal.block.id, data) : onAddBlock(data))}
          onDelete={onDeleteBlock}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  );
}
