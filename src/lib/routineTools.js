import { addRoutineBlock, updateRoutineBlock, deleteRoutineBlock, addRoutineException } from "./db";
import { checkConflitoRecorrente } from "./utils";

export const ROUTINE_TOOLS = [
  {
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
  },
  
        
  {
    type: "function",
    function: {
      name: "criar_compromisso_recorrente",
      description: "Cria compromisso RECORRENTE (toda semana). Use para 'toda segunda', 'a partir de agora', ou quando não for só uma vez.",
      parameters: {
        type: "object",
        properties: {
          titulo: { type: "string" },
          tipo: { type: "string", description: "aula, trabalho, estudo, academia, refeicao, sono, livre, lazer, esporte, pessoal, consulta, evento ou outra palavra" },
          diaSemana: { type: "string", description: "Obrigatório usar exatamente um destes: Seg, Ter, Qua, Qui, Sex, Sáb, Dom" },
          horaInicio: { type: "string", description: "HH:MM" },
          horaFim: { type: "string", description: "HH:MM" },
          cor: { type: "string", description: "hex, opcional" },
          observacoes: { type: "string" },
        },
        required: ["titulo", "tipo", "diaSemana", "horaInicio", "horaFim"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "criar_multiplos_compromissos_recorrentes",
      description: "Cria MÚLTIPLOS compromissos de uma vez. USE ESTA FERRAMENTA se o usuário enviar uma tabela inteira, grade curricular ou pedir para adicionar muitas aulas/tarefas de uma vez. É muito melhor que chamar criar_compromisso_recorrente várias vezes.",
      parameters: {
        type: "object",
        properties: {
          compromissos: {
            type: "array",
            items: {
              type: "object",
              properties: {
                titulo: { type: "string" },
                tipo: { type: "string" },
                diaSemana: { type: "string", description: "Obrigatório usar: Seg, Ter, Qua, Qui, Sex, Sáb, Dom" },
                horaInicio: { type: "string", description: "HH:MM" },
                horaFim: { type: "string", description: "HH:MM" },
                cor: { type: "string" },
                observacoes: { type: "string" },
              },
              required: ["titulo", "tipo", "diaSemana", "horaInicio", "horaFim"]
            }
          }
        },
        required: ["compromissos"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "editar_compromisso_recorrente",
      description: "Edita permanentemente (todas as semanas futuras) um compromisso recorrente. Use o id exato do contexto — nunca invente.",
      parameters: {
        type: "object",
        properties: {
          id: { type: "string" },
          titulo: { type: "string" },
          tipo: { type: "string" },
          diaSemana: { type: "string", description: "Use exatamente um destes: Seg, Ter, Qua, Qui, Sex, Sáb, Dom" },
          horaInicio: { type: "string" },
          horaFim: { type: "string" },
          cor: { type: "string" },
          observacoes: { type: "string" },
        },
        required: ["id"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "excluir_compromisso_recorrente",
      description: "Remove permanentemente um compromisso recorrente. Use o id exato do contexto.",
      parameters: {
        type: "object",
        properties: { id: { type: "string" } },
        required: ["id"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "criar_excecao_pontual",
      description: "Alteração válida só para UMA data, sem mudar a rotina recorrente. Use para 'hoje', 'amanhã', 'essa segunda', 'só essa semana'. tipoExcecao: 'alteracao' (muda horário/título de um recorrente só naquele dia, precisa de routineBlockId), 'cancelamento' (cancela uma ocorrência, precisa de routineBlockId), 'novo' (evento avulso, sem routineBlockId).",
      parameters: {
        type: "object",
        properties: {
          data: { type: "string", description: "AAAA-MM-DD" },
          tipoExcecao: { type: "string", enum: ["alteracao", "cancelamento", "novo"] },
          routineBlockId: { type: "string" },
          titulo: { type: "string" },
          tipo: { type: "string" },
          horaInicio: { type: "string" },
          horaFim: { type: "string" },
          cor: { type: "string" },
          observacoes: { type: "string" },
        },
        required: ["data", "tipoExcecao"],
      },
    },
  },
];

/**
 * Executa uma chamada de ferramenta decidida pela IA. Sempre valida
 * conflito de horário ANTES de escrever no banco — essa checagem é
 * determinística (JavaScript puro), não depende da IA "prometer" que
 * checou. Devolve um objeto simples { ok, ... } que é serializado e
 * mandado de volta pra IA como resultado da ferramenta.
 */
export async function executeRoutineTool(call, ctx) {
  const { userId, routineBlocks, setRoutineBlocks, setRoutineExceptions } = ctx;
  let args;
  try {
    args = JSON.parse(call.function.arguments || "{}");
  } catch {
    return { ok: false, erro: "Argumentos inválidos recebidos da IA." };
  }

  try {
    switch (call.function.name) {
      case "pintar_materia_pelo_nome": {
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
      }

      

      case "criar_compromisso_recorrente": {
        const conflitos = checkConflitoRecorrente(routineBlocks, args.diaSemana, args.horaInicio, args.horaFim);
        if (conflitos.length > 0) {
          return {
            ok: false,
            erro: `Conflito de horário em ${args.diaSemana} com: ${conflitos.map((c) => `${c.titulo} (${c.horaInicio}-${c.horaFim})`).join(", ")}. Explique o conflito ao usuário e pergunte como prefere resolver — não crie o compromisso.`,
          };
        }
        const saved = await addRoutineBlock(userId, {
          titulo: args.titulo, tipo: args.tipo, diaSemana: args.diaSemana,
          horaInicio: args.horaInicio, horaFim: args.horaFim, cor: args.cor, observacoes: args.observacoes,
        });
        setRoutineBlocks((prev) => [...prev, saved]);
        return { ok: true, compromisso: saved };
      }

      case "criar_multiplos_compromissos_recorrentes": {
        let criados = [];
        let erros = [];
        let currentBlocks = [...routineBlocks]; // Copia local para validar conflitos entre itens do próprio lote
        
        for (const item of args.compromissos || []) {
          const conflitos = checkConflitoRecorrente(currentBlocks, item.diaSemana, item.horaInicio, item.horaFim);
          if (conflitos.length > 0) {
            erros.push(`Conflito em ${item.diaSemana} (${item.horaInicio}-${item.horaFim}) para "${item.titulo}"`);
            continue;
          }
          const saved = await addRoutineBlock(userId, {
            titulo: item.titulo, tipo: item.tipo, diaSemana: item.diaSemana,
            horaInicio: item.horaInicio, horaFim: item.horaFim, cor: item.cor, observacoes: item.observacoes,
          });
          currentBlocks.push(saved);
          criados.push(saved);
        }
        setRoutineBlocks(currentBlocks);
        return { ok: criados.length > 0, criados: criados.length, erros: erros.length > 0 ? erros : null };
      }

      case "editar_compromisso_recorrente": {
        const existing = routineBlocks.find((b) => b.id === args.id);
        if (!existing) return { ok: false, erro: "Compromisso não encontrado. Confira o id no contexto antes de tentar de novo." };
        const novoDia = args.diaSemana || existing.diaSemana;
        const novoInicio = args.horaInicio || existing.horaInicio;
        const novoFim = args.horaFim || existing.horaFim;
        const conflitos = checkConflitoRecorrente(routineBlocks, novoDia, novoInicio, novoFim, args.id);
        if (conflitos.length > 0) {
          return {
            ok: false,
            erro: `Conflito de horário com: ${conflitos.map((c) => `${c.titulo} (${c.horaInicio}-${c.horaFim})`).join(", ")}. Explique ao usuário e pergunte como prefere resolver — não aplique a edição.`,
          };
        }
        const saved = await updateRoutineBlock(args.id, {
          titulo: args.titulo, tipo: args.tipo, diaSemana: args.diaSemana,
          horaInicio: args.horaInicio, horaFim: args.horaFim, cor: args.cor, observacoes: args.observacoes,
        });
        setRoutineBlocks((prev) => prev.map((b) => (b.id === args.id ? saved : b)));
        return { ok: true, compromisso: saved };
      }

      case "excluir_compromisso_recorrente": {
        const existing = routineBlocks.find((b) => b.id === args.id);
        if (!existing) return { ok: false, erro: "Compromisso não encontrado. Confira o id no contexto." };
        await deleteRoutineBlock(args.id);
        setRoutineBlocks((prev) => prev.filter((b) => b.id !== args.id));
        return { ok: true, removido: existing.titulo };
      }

      case "criar_excecao_pontual": {
        const saved = await addRoutineException(userId, {
          routineBlockId: args.routineBlockId || null,
          data: args.data,
          tipoExcecao: args.tipoExcecao,
          titulo: args.titulo,
          tipo: args.tipo,
          horaInicio: args.horaInicio,
          horaFim: args.horaFim,
          cor: args.cor,
          observacoes: args.observacoes,
        });
        setRoutineExceptions((prev) => [...prev, saved]);
        return { ok: true, excecao: saved };
      }

      default:
        return { ok: false, erro: `Ferramenta desconhecida: ${call.function.name}` };
    }
  } catch (e) {
    return { ok: false, erro: "Erro ao salvar: " + String(e.message || e) };
  }
}
