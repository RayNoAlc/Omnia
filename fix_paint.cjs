const fs = require('fs');
let code = fs.readFileSync('src/lib/routineTools.js', 'utf8');

const newTool = `
  {
    type: "function",
    function: {
      name: "pintar_compromissos_em_massa",
      description: "Muda apenas a cor de dezenas de compromissos simultaneamente. Extremamente util quando o usuario pede para pintar disciplinas. Exige apenas o ID e a nova cor HEX.",
      parameters: {
        type: "object",
        properties: {
          pinturas: {
            type: "array",
            items: {
              type: "object",
              properties: {
                id: { type: "string" },
                cor: { type: "string", description: "HEX (ex: #FF0000)" }
              },
              required: ["id", "cor"]
            }
          }
        },
        required: ["pinturas"]
      }
    }
  },`;

code = code.replace('export const ROUTINE_TOOLS = [', 'export const ROUTINE_TOOLS = [' + newTool);

const newHandler = `
      case "pintar_compromissos_em_massa": {
        let editados = [];
        let erros = [];
        let currentBlocks = [...routineBlocks];
        
        for (const p of args.pinturas || []) {
          const existing = currentBlocks.find((b) => b.id === p.id);
          if (!existing) {
             erros.push(\`ID \${p.id} não encontrado.\`);
             continue;
          }
          const saved = await updateRoutineBlock(p.id, { cor: p.cor });
          currentBlocks = currentBlocks.map(b => b.id === p.id ? saved : b);
          editados.push(saved);
        }
        setRoutineBlocks(currentBlocks);
        return { ok: editados.length > 0, editados: editados.length, erros: erros.length > 0 ? erros : null };
      }
`;

code = code.replace('switch (call.function.name) {', 'switch (call.function.name) {' + newHandler);

fs.writeFileSync('src/lib/routineTools.js', code, 'utf8');
