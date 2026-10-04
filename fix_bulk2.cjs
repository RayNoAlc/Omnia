const fs = require('fs');
let code = fs.readFileSync('src/lib/routineTools.js', 'utf8');

const newTool = `
  {
    type: "function",
    function: {
      name: "editar_multiplos_compromissos_recorrentes",
      description: "Edita múltiplos compromissos de uma vez. Especialmente útil para trocar as cores de muitos itens parecidos (ex: pintar todas as aulas de Semiologia de azul). Pode modificar dezenas de itens de uma só vez. Use o id exato do contexto.",
      parameters: {
        type: "object",
        properties: {
          edicoes: {
            type: "array",
            items: {
              type: "object",
              properties: {
                id: { type: "string" },
                titulo: { type: "string" },
                diaSemana: { type: "string" },
                horaInicio: { type: "string" },
                horaFim: { type: "string" },
                cor: { type: "string" }
              },
              required: ["id"]
            }
          }
        },
        required: ["edicoes"]
      }
    }
  },`;

code = code.replace('export const ROUTINE_TOOLS = [', 'export const ROUTINE_TOOLS = [' + newTool);

const newHandler = `
      case "editar_multiplos_compromissos_recorrentes": {
        let editados = [];
        let erros = [];
        let currentBlocks = [...routineBlocks];
        
        for (const edicao of args.edicoes || []) {
          const existing = currentBlocks.find((b) => b.id === edicao.id);
          if (!existing) {
             erros.push(\`ID \${edicao.id} não encontrado.\`);
             continue;
          }
          const novoDia = edicao.diaSemana || existing.diaSemana;
          const novoInicio = edicao.horaInicio || existing.horaInicio;
          const novoFim = edicao.horaFim || existing.horaFim;
          const conflitos = checkConflitoRecorrente(currentBlocks, novoDia, novoInicio, novoFim, edicao.id);
          if (conflitos.length > 0) {
             erros.push(\`Conflito em \${novoDia} (\${novoInicio}-\${novoFim}) para "\${existing.titulo}"\`);
             continue;
          }
          const saved = await updateRoutineBlock(edicao.id, {
            titulo: edicao.titulo, diaSemana: edicao.diaSemana,
            horaInicio: edicao.horaInicio, horaFim: edicao.horaFim, cor: edicao.cor,
          });
          currentBlocks = currentBlocks.map(b => b.id === edicao.id ? saved : b);
          editados.push(saved);
        }
        setRoutineBlocks(currentBlocks);
        return { ok: editados.length > 0, editados: editados.length, erros: erros.length > 0 ? erros : null };
      }
`;

code = code.replace('switch (call.function.name) {', 'switch (call.function.name) {' + newHandler);

fs.writeFileSync('src/lib/routineTools.js', code, 'utf8');
