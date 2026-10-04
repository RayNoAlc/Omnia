const fs = require('fs');
let code = fs.readFileSync('src/lib/routineTools.js', 'utf8');

const regexTool = /name: "pintar_compromissos_em_massa"[\s\S]*?required: \["pinturas"\]\s*\}\s*\}\s*\}/;
const replacementTool = `name: "pintar_compromissos_em_massa",
      description: "Muda apenas a cor de dezenas de compromissos simultaneamente. Extremamente util quando o usuario pede para pintar disciplinas.",
      parameters: {
        type: "object",
        properties: {
          pinturas_json: {
            type: "string",
            description: "Uma string contendo um array JSON com os IDs e Cores. Formato estrito: [{\\"id\\":\\"id-aqui\\", \\"cor\\":\\"#FF0000\\"}, ...]"
          }
        },
        required: ["pinturas_json"]
      }
    }
  }`;
code = code.replace(regexTool, replacementTool);

const regexHandler = /case "pintar_compromissos_em_massa": \{[\s\S]*?return \{ ok: editados\.length > 0, editados: editados\.length, erros: erros\.length > 0 \? erros : null \};\s*\}/;
const replacementHandler = `case "pintar_compromissos_em_massa": {
        let editados = [];
        let erros = [];
        let currentBlocks = [...routineBlocks];
        let pinturas = [];
        try {
          pinturas = JSON.parse(args.pinturas_json || "[]");
        } catch (e) {
          return { ok: false, erro: "JSON inválido em pinturas_json" };
        }
        
        for (const p of pinturas) {
          if (!p.id || !p.cor) continue;
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
      }`;
code = code.replace(regexHandler, replacementHandler);

fs.writeFileSync('src/lib/routineTools.js', code, 'utf8');
