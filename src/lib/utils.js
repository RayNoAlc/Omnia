/** Lê um arquivo (imagem ou áudio) e devolve { base64, mimeType } */
export function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      const base64 = String(result).split(",")[1] || "";
      resolve({ base64, mimeType: file.type });
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function hexToRgba(hex, alpha) {
  if (!hex || !hex.startsWith("#")) return `rgba(143,163,157,${alpha})`;
  const h = hex.replace("#", "");
  const full = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
  const r = parseInt(full.slice(0, 2), 16);
  const g = parseInt(full.slice(2, 4), 16);
  const b = parseInt(full.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

export function getWeekRange(todayIso) {
  const d = new Date(todayIso + "T00:00:00");
  const dow = d.getDay(); // 0=Dom,1=Seg,...,6=Sáb
  const diffToMonday = dow === 0 ? -6 : 1 - dow;
  const monday = addDays(todayIso, diffToMonday);
  const sunday = addDays(monday, 6);
  return [monday, sunday];
}

function timeToMinutes(t) {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}
function overlaps(startA, endA, startB, endB) {
  return timeToMinutes(startA) < timeToMinutes(endB) && timeToMinutes(startB) < timeToMinutes(endA);
}

/** Compromissos recorrentes que colidiriam de horário no mesmo dia da semana. */
export function checkConflitoRecorrente(routineBlocks, diaSemana, horaInicio, horaFim, ignoreId) {
  return routineBlocks.filter(
    (b) => b.diaSemana === diaSemana && b.id !== ignoreId && overlaps(horaInicio, horaFim, b.horaInicio, b.horaFim)
  );
}

/**
 * Calcula os itens efetivos da Rotina para uma data específica —
 * juntando compromissos recorrentes (que batem com o dia da semana),
 * exceções pontuais daquela data exata (cancelamento/alteração/novo),
 * e o horário de sono (guardado à parte, não como routine_block).
 * Usada tanto pelo Hoje quanto pela Agenda, pra nunca haver duas
 * versões diferentes do "o que é a rotina desse dia".
 */
export function getEffectiveRoutineItemsForDate(date, routine, routineBlocks, routineExceptions) {
  const dia = weekdayShort(date);
  const itens = [];

  // Sono — guardado em routines.dormir/acordar/diasSono, não é um routine_block.
  if (routine && (!routine.diasSono || routine.diasSono.includes(dia))) {
    itens.push({
      id: `sono-${date}`,
      titulo: "Sono",
      tipo: "sono",
      horaInicio: routine.dormir,
      horaFim: routine.acordar,
      cor: "#AFA9EC",
      origem: "sono",
    });
  }

  const recorrentesDoDia = routineBlocks.filter((b) => b.diaSemana === dia);
  const excecoesDoDia = routineExceptions.filter((e) => e.data === date);

  recorrentesDoDia.forEach((b) => {
    const cancelada = excecoesDoDia.find((e) => e.tipoExcecao === "cancelamento" && e.routineBlockId === b.id);
    if (cancelada) return;
    const alterada = excecoesDoDia.find((e) => e.tipoExcecao === "alteracao" && e.routineBlockId === b.id);
    if (alterada) {
      itens.push({
        id: `excecao-${alterada.id}`,
        titulo: alterada.titulo || b.titulo,
        tipo: alterada.tipo || b.tipo,
        horaInicio: alterada.horaInicio || b.horaInicio,
        horaFim: alterada.horaFim || b.horaFim,
        cor: alterada.cor || b.cor,
        origem: "excecao",
      });
      return;
    }
    itens.push({ id: `bloco-${b.id}-${date}`, titulo: b.titulo, tipo: b.tipo, horaInicio: b.horaInicio, horaFim: b.horaFim, cor: b.cor, origem: "recorrente" });
  });

  excecoesDoDia
    .filter((e) => e.tipoExcecao === "novo")
    .forEach((e) => {
      itens.push({ id: `excecao-${e.id}`, titulo: e.titulo, tipo: e.tipo || "outro", horaInicio: e.horaInicio, horaFim: e.horaFim, cor: e.cor || "#AFA9EC", origem: "excecao" });
    });

  itens.sort((a, b) => (a.horaInicio || "").localeCompare(b.horaInicio || ""));
  return itens;
}

/** Estimativa de minutos por sessão, baseada na preferência de duração do usuário. */
export function estimarDuracaoBloco(routine) {
  return routine?.duracaoPreferida === "longa" ? 50 : 25;
}

/** Monta o "plano recomendado para hoje": quanto tempo por disciplina, com explicação. */
export function planoRecomendadoHoje(blocksHoje, routine) {
  const duracaoPorBloco = estimarDuracaoBloco(routine);
  const porDisciplina = {};
  blocksHoje.forEach((b) => {
    porDisciplina[b.disciplina] = (porDisciplina[b.disciplina] || 0) + duracaoPorBloco;
  });
  const itens = Object.entries(porDisciplina).map(([disciplina, minutos]) => ({ disciplina, minutos }));
  const total = itens.reduce((acc, i) => acc + i.minutos, 0);
  return { itens, total, duracaoPorBloco };
}

/**
 * Avisos contextuais — regras determinísticas (sem IA) que rodam toda
 * vez que os dados carregam. Cobre os dois exemplos centrais da visão
 * original: prova amanhã sem revisão feita, e meta do dia em risco.
 */
export function computeAvisos({ hoje, horaAtual, commitments, studyBlocks, metaHoje, minutosEstudadosHoje }) {
  const avisos = [];

  const amanha = addDays(hoje, 1);
  const provasAmanha = commitments.filter((c) => c.prazo === amanha);
  provasAmanha.forEach((c) => {
    const blocosPendentes = studyBlocks.filter((b) => b.commitmentId === c.id && !b.done).length;
    if (blocosPendentes > 0) {
      avisos.push({
        id: `prova-amanha-${c.id}`,
        cor: "critico",
        mensagem: `${c.disciplina} — ${c.assunto} é amanhã e você ainda tem ${blocosPendentes} bloco${blocosPendentes > 1 ? "s" : ""} de estudo pendente${blocosPendentes > 1 ? "s" : ""}.`,
      });
    }
  });

  if (metaHoje && horaAtual >= 19 && minutosEstudadosHoje < metaHoje) {
    avisos.push({
      id: "meta-risco",
      cor: "importante",
      mensagem: `Ainda faltam ${metaHoje - minutosEstudadosHoje} min pra bater sua meta de hoje.`,
    });
  }

  return avisos;
}

/** Deriva "2026.1" ou "2026.2" a partir de uma data — sem precisar de campo novo no banco. */
export function getSemestre(dateStr) {
  if (!dateStr) return "Sem data";
  const [ano, mes] = dateStr.split("-");
  const sem = Number(mes) <= 6 ? "1" : "2";
  return `${ano}.${sem}`;
}

export function uid() {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}
export function todayISO() {
  return new Date().toISOString().slice(0, 10);
}
export function addDays(iso, n) {
  const d = new Date(iso + "T00:00:00");
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
}
export function formatDateBR(iso) {
  if (!iso) return "sem data";
  const [y, m, d] = iso.split("-");
  return `${d}/${m}`;
}
export function weekdayShort(iso) {
  const days = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
  return days[new Date(iso + "T00:00:00").getDay()];
}

/* Planejador automático — lógica determinística, não usa IA */
const PERIODO_JANELAS = { manha: ["06:00", "12:00"], tarde: ["12:00", "18:00"], noite: ["18:00", "23:59"] };

/**
 * Escolhe, para um dia específico, qual período (manhã/tarde/noite)
 * está de fato livre na Rotina — preferindo o período favorito do
 * usuário, mas caindo para outro se aquele estiver tomado por aula,
 * trabalho ou sono naquele dia. Isso é o que faz o Planejador não
 * empurrar estudo em cima de um compromisso real.
 */
export function periodoDisponivelNoDia(date, routine, routineBlocks, routineExceptions, periodoPreferido) {
  const itens = getEffectiveRoutineItemsForDate(date, routine, routineBlocks, routineExceptions);
  const ordemTentativa = [periodoPreferido, ...Object.keys(PERIODO_JANELAS).filter((p) => p !== periodoPreferido)];
  for (const periodo of ordemTentativa) {
    const [inicioP, fimP] = PERIODO_JANELAS[periodo];
    const ocupadoMin = itens.reduce((acc, it) => {
      if (!it.horaInicio || !it.horaFim) return acc;
      const s = Math.max(timeToMinutes(it.horaInicio), timeToMinutes(inicioP));
      const e = Math.min(timeToMinutes(it.horaFim), timeToMinutes(fimP));
      return acc + Math.max(0, e - s);
    }, 0);
    if (ocupadoMin < 120) return periodo;
  }
  return periodoPreferido; // dia muito cheio mesmo assim — melhor sugerir algo do que nada
}

export function gerarBlocosDeEstudo(commitment, routine, routineBlocks = [], routineExceptions = []) {
  const hoje = todayISO();
  if (!commitment.prazo || commitment.prazo <= hoje) return [];
  const dias = [];
  for (let d = addDays(hoje, 1); d < commitment.prazo; d = addDays(d, 1)) dias.push(d);
  const periodoPara = (date) => periodoDisponivelNoDia(date, routine, routineBlocks, routineExceptions, routine?.periodoPreferido || "noite");

  if (dias.length === 0) {
    return [
      {
        commitmentId: commitment.id,
        disciplina: commitment.disciplina,
        assunto: `Revisão final — ${commitment.assunto}`,
        date: hoje,
        periodo: periodoPara(hoje),
        tipo: "revisao",
        done: false,
      },
    ];
  }

  const total = dias.length;
  const revisaoCount = total >= 3 ? 2 : total >= 2 ? 1 : 0;
  const contentDays = dias.slice(0, total - revisaoCount);
  const reviewDays = dias.slice(total - revisaoCount);
  const blocks = [];

  contentDays.forEach((date, i) => {
    blocks.push({
      commitmentId: commitment.id,
      disciplina: commitment.disciplina,
      assunto:
        contentDays.length > 1
          ? `${commitment.assunto} — parte ${i + 1}/${contentDays.length}`
          : commitment.assunto,
      date,
      periodo: periodoPara(date),
      tipo: "estudo",
      done: false,
    });
  });

  reviewDays.forEach((date, i) => {
    blocks.push({
      commitmentId: commitment.id,
      disciplina: commitment.disciplina,
      assunto:
        i === reviewDays.length - 1
          ? `Revisão final — ${commitment.assunto}`
          : `Revisão — ${commitment.assunto}`,
      date,
      periodo: periodoPara(date),
      tipo: "revisao",
      done: false,
    });
  });

  return blocks;
}

/* Detecção simples de padrão de distração — regra sobre sessões do Modo Foco */
export function computeInterruptionInsight(sessions) {
  const byPreset = {};
  sessions.forEach((s) => {
    const key = s.duracaoPresetMin || s.minutos;
    byPreset[key] = byPreset[key] || { interrupcoes: 0, count: 0 };
    byPreset[key].interrupcoes += s.interrupcoes || 0;
    byPreset[key].count += 1;
  });
  const entries = Object.entries(byPreset).filter(([, v]) => v.count >= 2);
  if (entries.length === 0) return null;

  let pior = null;
  entries.forEach(([dur, v]) => {
    const media = v.interrupcoes / v.count;
    if (media >= 1.5 && (!pior || media > pior.media)) pior = { dur: Number(dur), media };
  });
  if (!pior) return null;

  const menores = entries
    .map(([dur]) => Number(dur))
    .filter((dur) => dur < pior.dur)
    .sort((a, b) => a - b);

  if (menores.length > 0) {
    return `Você está interrompendo com frequência as sessões de ${pior.dur} min (média de ${pior.media.toFixed(1)} interrupções por sessão). Sessões de ${menores[0]} min podem funcionar melhor para você.`;
  }
  return `Você está interrompendo com frequência as sessões de ${pior.dur} min (média de ${pior.media.toFixed(1)} interrupções por sessão). Talvez sessões mais curtas ajudem.`;
}
