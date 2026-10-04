const fs = require('fs');
let code = fs.readFileSync('src/lib/routineTools.js', 'utf8');

const regexTool = /name: "pintar_compromissos_em_massa"[\s\S]*?\}\s*\}\s*\}/;
const replacementTool = `name: "pintar_compromisso",
      description: "Muda a cor de um unico compromisso. Para pintar varias materias, VOCE DEVE CHAMAR ESTA FERRAMENTA MULTIPLAS VEZES na mesma resposta (parallel tool calling), uma vez para cada ID correspondente.",
      parameters: {
        type: "object",
        properties: {
          id: { type: "string" },
          cor: { type: "string", description: "HEX (ex: #FF0000)" }
        },
        required: ["id", "cor"]
      }
    }
  }`;
code = code.replace(regexTool, replacementTool);

const regexHandler = /case "pintar_compromissos_em_massa": \{[\s\S]*?return \{ ok: editados\.length > 0, editados: editados\.length, erros: erros\.length > 0 \? erros : null \};\s*\}/;
const replacementHandler = `case "pintar_compromisso": {
        const existing = routineBlocks.find((b) => b.id === args.id);
        if (!existing) return { ok: false, erro: "ID não encontrado." };
        const saved = await updateRoutineBlock(args.id, { cor: args.cor });
        setRoutineBlocks((prev) => prev.map((b) => (b.id === args.id ? saved : b)));
        return { ok: true, compromisso: saved };
      }`;
code = code.replace(regexHandler, replacementHandler);

fs.writeFileSync('src/lib/routineTools.js', code, 'utf8');
