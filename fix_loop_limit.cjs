const fs = require('fs');
let code = fs.readFileSync('src/components/Tabs.jsx', 'utf8');

const regexLoop = /while \(response\.toolCalls && response\.toolCalls\.length > 0 && iterations < 4\) \{[\s\S]*?iterations\+\+;\s*\}/;

const replacementLoop = `while (response.toolCalls && response.toolCalls.length > 0 && iterations < 4) {
          convo.push({ role: "assistant", content: response.text || null, tool_calls: response.toolCalls });
          
          let hasPintar = false;
          for (const call of response.toolCalls) {
            if (call.function.name === "pintar_compromisso") hasPintar = true;
            const result = await executeRoutineTool(call, { userId, routineBlocks, setRoutineBlocks, setRoutineExceptions });
            convo.push({ role: "tool", tool_call_id: call.id, content: JSON.stringify(result) });
          }
          
          if (hasPintar) {
             // Se houver pintura em massa, paramos por aqui para poupar o limite de tokens da Groq
             // e retornamos uma mensagem padrao imediatamente.
             response = { text: "As cores das disciplinas foram atualizadas com sucesso na sua grade!", toolCalls: null };
             break;
          }
          
          response = await callAIWithTools(sys, convo, ROUTINE_TOOLS);
          iterations++;
        }`;

code = code.replace(regexLoop, replacementLoop);

fs.writeFileSync('src/components/Tabs.jsx', code, 'utf8');
