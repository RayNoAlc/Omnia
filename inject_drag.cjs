const fs = require('fs');
let code = fs.readFileSync('rotina_temp.jsx', 'utf8');

// Add dragging state
code = code.replace(
  'const [modal, setModal] = useState(null);',
  'const [modal, setModal] = useState(null);\n  const [dragging, setDragging] = useState(null);'
);

// Add handleDrop function
const handleDropCode = `
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
    const newStart = \`\${h}:\${m}\`;
    
    // Find block
    const block = routineBlocks.find(b => b.id === dragging.id);
    if (block) {
       // calculate duration to preserve it
       const [sh, sm] = block.horaInicio.split(":").map(Number);
       const [eh, em] = block.horaFim.split(":").map(Number);
       const dur = (eh * 60 + em) - (sh * 60 + sm);
       
       const endMin = newStartMin + dur;
       const newEnd = \`\${String(Math.floor(endMin / 60)).padStart(2, '0')}:\${String(endMin % 60).padStart(2, '0')}\`;
       
       let newDias = [...block.dias];
       if (dragging.sourceDay !== targetDay) {
         newDias = newDias.filter(d => d !== dragging.sourceDay);
         if (!newDias.includes(targetDay)) newDias.push(targetDay);
       }
       
       onUpdateBlock(block.id, { dias: newDias, horaInicio: newStart, horaFim: newEnd });
    }
    setDragging(null);
  }
`;

code = code.replace('const blocksByDay', handleDropCode + '\n  const blocksByDay');

// Add drag events to the column
code = code.replace(
  'className="flex-1 relative min-w-[120px] border-r"',
  'className="flex-1 relative min-w-[120px] border-r" onDragOver={(e) => e.preventDefault()} onDrop={(e) => handleDrop(e, dia)}'
);

// Add drag events to the block
code = code.replace(
  'onClick={() => setModal({ block: b, dia })}',
  'onClick={() => setModal({ block: b, dia })} draggable onDragStart={(e) => { e.stopPropagation(); e.dataTransfer.setData("text/plain", b.id); setDragging({ id: b.id, sourceDay: dia }); }} onDragEnd={() => setDragging(null)}'
);

// Add visual feedback to the block being dragged
code = code.replace(
  'const isActive =',
  'const isDragging = dragging?.id === b.id && dragging?.sourceDay === dia;\n                          const isActive ='
);
code = code.replace(
  'opacity: 0.9,',
  'opacity: isDragging ? 0.4 : 0.9,\n                            cursor: isDragging ? "grabbing" : "pointer",'
);

fs.writeFileSync('rotina_temp2.jsx', code, 'utf8');
