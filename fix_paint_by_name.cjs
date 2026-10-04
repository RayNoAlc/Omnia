const fs = require('fs');
let code = fs.readFileSync('src/lib/routineTools.js', 'utf8');

const regexTool = /\{\s*type: "function",\s*function: \{\s*name: "pintar_compromisso"[\s\S]*?\}\s*\}\s*\},/;
const newTool = `{
    type: "function",
    function: {
      name: "pintar_materia_pelo_nome",
      description: "Muda a cor de TODOS os compromissos que tenham esse nome. Use para pintar disciplinas inteiras. Ex: nome: 'Patologia', cor: '#FF0000'. Chame varias vezes em paralelo se precisar pintar varias materias diferentes.",
      parameters: {
        type: "object",
        properties: {
          nome: { type: "string", description: "Parte do nome ou nome exato da disciplina." },
          cor: { type: "string", description: "HEX (ex: #FF0000)" }
        },
        required: ["nome", "cor"]
      }
    }
  },`;

code = code.replace(regexTool, newTool);

const regexHandler = /case "pintar_compromisso": \{[\s\S]*?return \{ ok: true, id: args\.id \};[\s\S]*?\}/;
const newHandler = `case "pintar_materia_pelo_nome": {
        let currentBlocks = [...routineBlocks];
        let editados = 0;
        const lowerName = args.nome.toLowerCase();
        
        for (const b of currentBlocks) {
           if (b.titulo && b.titulo.toLowerCase().includes(lowerName)) {
               const saved = await updateRoutineBlock(b.id, { cor: args.cor });
               currentBlocks = currentBlocks.map(curr => curr.id === b.id ? saved : curr);
               editados++;
           }
        }
        
        if (editados > 0) {
            setRoutineBlocks(currentBlocks);
            return { ok: true, editados, nome: args.nome };
        } else {
            return { ok: false, erro: "Nenhuma materia encontrada com esse nome." };
        }
      }`;

code = code.replace(regexHandler, newHandler);

fs.writeFileSync('src/lib/routineTools.js', code, 'utf8');
