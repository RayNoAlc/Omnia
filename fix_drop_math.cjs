const fs = require('fs');
let code = fs.readFileSync('src/components/Tabs.jsx', 'utf8');

const regex = /function handleDrop\(e, targetDay\) \{[\s\S]*?setDragging\(null\);\s*\}/;

const newHandleDrop = `
  function handleDrop(e, targetDay) {
    e.preventDefault();
    
    // Always get ID from dataTransfer as source of truth
    const draggedId = e.dataTransfer.getData("text/plain");
    const block = routineBlocks.find(b => b.id === draggedId);
    if (!block) {
       setDragging(null);
       return;
    }
    
    const sourceDay = dragging ? dragging.sourceDay : block.dias[0]; // Fallback
    
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
    
    // Normalize newStartMin
    let finalStartMin = newStartMin;
    if (finalStartMin < 0) finalStartMin += 24 * 60;
    finalStartMin = finalStartMin % (24 * 60);
    
    const h = String(Math.floor(finalStartMin / 60)).padStart(2, '0');
    const m = String(finalStartMin % 60).padStart(2, '0');
    const newStart = \`\${h}:\${m}\`;
    
    // calculate duration to preserve it
    const [sh, sm] = block.horaInicio.split(":").map(Number);
    const [eh, em] = block.horaFim.split(":").map(Number);
    let dur = (eh * 60 + em) - (sh * 60 + sm);
    if (dur < 0) dur += 24 * 60; // Crosses midnight
    
    let endMin = finalStartMin + dur;
    let finalEndMin = endMin % (24 * 60);
    
    const newEnd = \`\${String(Math.floor(finalEndMin / 60)).padStart(2, '0')}:\${String(finalEndMin % 60).padStart(2, '0')}\`;
    
    let newDias = [...block.dias];
    if (sourceDay !== targetDay) {
      newDias = newDias.filter(d => d !== sourceDay);
      if (!newDias.includes(targetDay)) newDias.push(targetDay);
    }
    
    console.log("Dropping block:", block.id, "newStart:", newStart, "newEnd:", newEnd, "dias:", newDias);
    onUpdateBlock(block.id, { dias: newDias, horaInicio: newStart, horaFim: newEnd });
    
    setDragging(null);
  }
`;

code = code.replace(regex, newHandleDrop);
fs.writeFileSync('src/components/Tabs.jsx', code, 'utf8');
