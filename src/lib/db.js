import { supabase } from "./supabaseClient";

/* ---------------------------------------------------------------------- */
/* Rotina                                                                  */
/* ---------------------------------------------------------------------- */
function rowToRoutine(data) {
  return {
    id: data.id,
    dormir: data.dormir,
    acordar: data.acordar,
    periodoPreferido: data.periodo_preferido,
    duracaoPreferida: data.duracao_preferida,
    lazerMinimoMin: data.lazer_minimo_min,
    diasSono: data.dias_sono,
  };
}

export async function fetchRoutine(userId) {
  const { data, error } = await supabase
    .from("routines")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();
  if (error) throw error;
  return data ? rowToRoutine(data) : null;
}

export async function createDefaultRoutine(userId) {
  const { data, error } = await supabase
    .from("routines")
    .insert({ user_id: userId })
    .select()
    .single();
  if (error) throw error;
  return rowToRoutine(data);
}

export async function updateRoutine(userId, patch) {
  const row = {};
  if (patch.dormir !== undefined) row.dormir = patch.dormir;
  if (patch.acordar !== undefined) row.acordar = patch.acordar;
  if (patch.periodoPreferido !== undefined) row.periodo_preferido = patch.periodoPreferido;
  if (patch.duracaoPreferida !== undefined) row.duracao_preferida = patch.duracaoPreferida;
  if (patch.lazerMinimoMin !== undefined) row.lazer_minimo_min = patch.lazerMinimoMin;
  if (patch.diasSono !== undefined) row.dias_sono = patch.diasSono;
  const { error } = await supabase.from("routines").update(row).eq("user_id", userId);
  if (error) throw error;
}

/* ---------------------------------------------------------------------- */
/* Compromissos de rotina (recorrentes — substitui "aulas fixas")          */
/* ---------------------------------------------------------------------- */
function rowToRoutineBlock(b) {
  return {
    id: b.id,
    titulo: b.titulo,
    tipo: b.tipo,
    diaSemana: b.dia_semana,
    horaInicio: b.hora_inicio,
    horaFim: b.hora_fim,
    cor: b.cor,
    recorrente: b.recorrente,
    observacoes: b.observacoes,
  };
}

export async function fetchRoutineBlocks(userId) {
  const { data, error } = await supabase
    .from("routine_blocks")
    .select("*")
    .eq("user_id", userId)
    .order("hora_inicio");
  if (error) throw error;
  return data.map(rowToRoutineBlock);
}

export async function addRoutineBlock(userId, block) {
  const { data, error } = await supabase
    .from("routine_blocks")
    .insert({
      user_id: userId,
      titulo: block.titulo,
      tipo: block.tipo || "outro",
      dia_semana: block.diaSemana,
      hora_inicio: block.horaInicio,
      hora_fim: block.horaFim,
      cor: block.cor || "#2DD4A0",
      recorrente: block.recorrente !== undefined ? block.recorrente : true,
      observacoes: block.observacoes || null,
    })
    .select()
    .single();
  if (error) throw error;
  return rowToRoutineBlock(data);
}

export async function updateRoutineBlock(id, patch) {
  const row = {};
  if (patch.titulo !== undefined) row.titulo = patch.titulo;
  if (patch.tipo !== undefined) row.tipo = patch.tipo;
  if (patch.diaSemana !== undefined) row.dia_semana = patch.diaSemana;
  if (patch.horaInicio !== undefined) row.hora_inicio = patch.horaInicio;
  if (patch.horaFim !== undefined) row.hora_fim = patch.horaFim;
  if (patch.cor !== undefined) row.cor = patch.cor;
  if (patch.recorrente !== undefined) row.recorrente = patch.recorrente;
  if (patch.observacoes !== undefined) row.observacoes = patch.observacoes;
  const { data, error } = await supabase.from("routine_blocks").update(row).eq("id", id).select().single();
  if (error) throw error;
  return rowToRoutineBlock(data);
}

export async function deleteRoutineBlock(id) {
  const { error } = await supabase.from("routine_blocks").delete().eq("id", id);
  if (error) throw error;
}

/* ---------------------------------------------------------------------- */
/* Exceções pontuais da rotina (usadas pela Secretária)                    */
/* ---------------------------------------------------------------------- */
function rowToException(e) {
  return {
    id: e.id,
    routineBlockId: e.routine_block_id,
    data: e.data,
    tipoExcecao: e.tipo_excecao,
    titulo: e.titulo,
    tipo: e.tipo,
    horaInicio: e.hora_inicio,
    horaFim: e.hora_fim,
    cor: e.cor,
    observacoes: e.observacoes,
  };
}

export async function fetchRoutineExceptions(userId) {
  const { data, error } = await supabase.from("routine_exceptions").select("*").eq("user_id", userId);
  if (error) throw error;
  return data.map(rowToException);
}

export async function addRoutineException(userId, exc) {
  const { data, error } = await supabase
    .from("routine_exceptions")
    .insert({
      user_id: userId,
      routine_block_id: exc.routineBlockId || null,
      data: exc.data,
      tipo_excecao: exc.tipoExcecao,
      titulo: exc.titulo || null,
      tipo: exc.tipo || null,
      hora_inicio: exc.horaInicio || null,
      hora_fim: exc.horaFim || null,
      cor: exc.cor || null,
      observacoes: exc.observacoes || null,
    })
    .select()
    .single();
  if (error) throw error;
  return rowToException(data);
}

export async function deleteRoutineException(id) {
  const { error } = await supabase.from("routine_exceptions").delete().eq("id", id);
  if (error) throw error;
}

/* ---------------------------------------------------------------------- */
/* Compromissos                                                            */
/* ---------------------------------------------------------------------- */
function rowToCommitment(c) {
  return {
    id: c.id,
    tipo: c.tipo,
    disciplina: c.disciplina,
    assunto: c.assunto,
    prazo: c.prazo,
    prioridade: c.prioridade,
    origemTexto: c.origem_texto,
    createdAt: c.created_at,
  };
}

export async function fetchCommitments(userId) {
  const { data, error } = await supabase
    .from("commitments")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data.map(rowToCommitment);
}
export async function addCommitment(userId, commitment) {
  const { data, error } = await supabase
    .from("commitments")
    .insert({
      user_id: userId,
      tipo: commitment.tipo,
      disciplina: commitment.disciplina || "Sem disciplina",
      assunto: commitment.assunto || "Sem assunto",
      prazo: commitment.prazo || null,
      prioridade: commitment.prioridade || "normal",
      origem_texto: commitment.origemTexto,
    })
    .select()
    .single();
  if (error) throw error;
  return rowToCommitment(data);
}
export async function updateCommitment(id, patch) {
  const row = {};
  if (patch.tipo !== undefined) row.tipo = patch.tipo;
  if (patch.disciplina !== undefined) row.disciplina = patch.disciplina;
  if (patch.assunto !== undefined) row.assunto = patch.assunto;
  if (patch.prazo !== undefined) row.prazo = patch.prazo;
  if (patch.prioridade !== undefined) row.prioridade = patch.prioridade;
  const { data, error } = await supabase.from("commitments").update(row).eq("id", id).select().single();
  if (error) throw error;
  return rowToCommitment(data);
}
export async function deleteCommitment(id) {
  const { error } = await supabase.from("commitments").delete().eq("id", id);
  if (error) throw error;
}

/* ---------------------------------------------------------------------- */
/* Blocos de estudo                                                        */
/* ---------------------------------------------------------------------- */
function rowToBlock(b) {
  return {
    id: b.id,
    commitmentId: b.commitment_id,
    disciplina: b.disciplina,
    assunto: b.assunto,
    date: b.date,
    periodo: b.periodo,
    tipo: b.tipo,
    done: b.done,
  };
}
export async function fetchStudyBlocks(userId) {
  const { data, error } = await supabase.from("study_blocks").select("*").eq("user_id", userId);
  if (error) throw error;
  return data.map(rowToBlock);
}
export async function insertStudyBlocks(userId, blocks) {
  if (!blocks || blocks.length === 0) return [];
  const rows = blocks.map((b) => ({
    user_id: userId,
    commitment_id: b.commitmentId,
    disciplina: b.disciplina,
    assunto: b.assunto,
    date: b.date,
    periodo: b.periodo,
    tipo: b.tipo,
    done: b.done || false,
  }));
  const { data, error } = await supabase.from("study_blocks").insert(rows).select();
  if (error) throw error;
  return data.map(rowToBlock);
}
export async function deletePendingBlocksForCommitment(commitmentId) {
  const { error } = await supabase
    .from("study_blocks")
    .delete()
    .eq("commitment_id", commitmentId)
    .eq("done", false);
  if (error) throw error;
}
export async function toggleBlockDone(id, done) {
  const { error } = await supabase.from("study_blocks").update({ done }).eq("id", id);
  if (error) throw error;
}

/* ---------------------------------------------------------------------- */
/* Anotações                                                                */
/* ---------------------------------------------------------------------- */
export async function fetchNotes(userId) {
  const { data, error } = await supabase
    .from("notes")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data.map((n) => ({ id: n.id, disciplina: n.disciplina, texto: n.texto, commitmentId: n.commitment_id, createdAt: n.created_at }));
}
export async function addNote(userId, note) {
  const { data, error } = await supabase
    .from("notes")
    .insert({
      user_id: userId,
      disciplina: note.disciplina || "Geral",
      texto: note.texto,
      commitment_id: note.commitmentId || null,
    })
    .select()
    .single();
  if (error) throw error;
  return { id: data.id, disciplina: data.disciplina, texto: data.texto, commitmentId: data.commitment_id, createdAt: data.created_at };
}
export async function deleteNote(id) {
  if (!id) return;
  try {
    const { error } = await supabase.from("notes").delete().eq("id", id);
    if (error) console.warn("Aviso ao deletar nota do Supabase:", error.message || error);
  } catch (err) {
    console.warn("Exceção ao deletar nota:", err);
  }
}

/* ---------------------------------------------------------------------- */
/* Resumos                                                                  */
/* ---------------------------------------------------------------------- */
function rowToSummary(s) {
  return { id: s.id, disciplina: s.disciplina, commitmentId: s.commitment_id, texto: s.texto };
}
export async function fetchSummaries(userId) {
  const { data, error } = await supabase.from("summaries").select("*").eq("user_id", userId);
  if (error) throw error;
  return data.map(rowToSummary);
}
/**
 * Cria ou atualiza um resumo. Se commitmentId for informado, o resumo é
 * específico daquele compromisso; senão, é o resumo geral da disciplina.
 * Feito com select + insert/update manual (em vez de upsert automático)
 * porque a tabela tem duas regras de unicidade diferentes (uma para cada
 * caso), e índices parciais não se dão bem com o upsert do PostgREST.
 */
export async function upsertSummary(userId, { disciplina, commitmentId, texto }) {
  let query = supabase.from("summaries").select("id").eq("user_id", userId);
  query = commitmentId ? query.eq("commitment_id", commitmentId) : query.eq("disciplina", disciplina).is("commitment_id", null);
  const { data: existing, error: selError } = await query.maybeSingle();
  if (selError) throw selError;

  if (existing) {
    const { data, error } = await supabase
      .from("summaries")
      .update({ texto, disciplina })
      .eq("id", existing.id)
      .select()
      .single();
    if (error) throw error;
    return rowToSummary(data);
  }
  const { data, error } = await supabase
    .from("summaries")
    .insert({ user_id: userId, disciplina, commitment_id: commitmentId || null, texto })
    .select()
    .single();
  if (error) throw error;
  return rowToSummary(data);
}

/* ---------------------------------------------------------------------- */
/* Quiz                                                                     */
/* ---------------------------------------------------------------------- */
export async function fetchQuizAttempts(userId) {
  const { data, error } = await supabase.from("quiz_attempts").select("*").eq("user_id", userId);
  if (error) throw error;
  return data.map((q) => ({ id: q.id, disciplina: q.disciplina, commitmentId: q.commitment_id, date: q.date, acertos: q.acertos, total: q.total }));
}
export async function addQuizAttempt(userId, attempt) {
  const { data, error } = await supabase
    .from("quiz_attempts")
    .insert({
      user_id: userId,
      disciplina: attempt.disciplina,
      commitment_id: attempt.commitmentId || null,
      date: attempt.date,
      acertos: attempt.acertos,
      total: attempt.total,
    })
    .select()
    .single();
  if (error) throw error;
  return { id: data.id, disciplina: data.disciplina, commitmentId: data.commitment_id, date: data.date, acertos: data.acertos, total: data.total };
}

/* ---------------------------------------------------------------------- */
/* Modo Professor                                                           */
/* ---------------------------------------------------------------------- */
export async function fetchProfessorAttempts(userId) {
  const { data, error } = await supabase.from("professor_attempts").select("*").eq("user_id", userId);
  if (error) throw error;
  return data.map((p) => ({ id: p.id, disciplina: p.disciplina, commitmentId: p.commitment_id, nota: p.nota, date: p.date }));
}
export async function addProfessorAttempt(userId, attempt) {
  const { data, error } = await supabase
    .from("professor_attempts")
    .insert({
      user_id: userId,
      disciplina: attempt.disciplina,
      commitment_id: attempt.commitmentId || null,
      nota: attempt.nota,
      date: attempt.date,
    })
    .select()
    .single();
  if (error) throw error;
  return { id: data.id, disciplina: data.disciplina, commitmentId: data.commitment_id, nota: data.nota, date: data.date };
}

/* ---------------------------------------------------------------------- */
/* Sessões de foco                                                          */
/* ---------------------------------------------------------------------- */
export async function fetchSessions(userId) {
  const { data, error } = await supabase.from("sessions").select("*").eq("user_id", userId);
  if (error) throw error;
  return data.map((s) => ({
    id: s.id,
    disciplina: s.disciplina,
    commitmentId: s.commitment_id,
    minutos: s.minutos,
    duracaoPresetMin: s.duracao_preset_min,
    interrupcoes: s.interrupcoes,
    date: s.date,
  }));
}
/* ---------------------------------------------------------------------- */
/* Materiais (PDF, foto, áudio capturados na Inbox)                        */
/* ---------------------------------------------------------------------- */
function rowToMaterial(m) {
  return {
    id: m.id,
    disciplina: m.disciplina,
    commitmentId: m.commitment_id,
    tipoArquivo: m.tipo_arquivo,
    nomeArquivo: m.nome_arquivo,
    storagePath: m.storage_path,
    textoExtraido: m.texto_extraido,
    status: m.status,
    createdAt: m.created_at,
  };
}

/** Envia o arquivo bruto para o bucket "materials", numa pasta por usuário. */
export async function uploadMaterialFile(userId, file) {
  const safeName = file.name.replace(/[^\w.\-]+/g, "_");
  const path = `${userId}/${Date.now()}-${safeName}`;
  const { error } = await supabase.storage.from("materials").upload(path, file);
  if (error) throw error;
  return path;
}

export async function fetchMaterials(userId) {
  const { data, error } = await supabase
    .from("materials")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data.map(rowToMaterial);
}

export async function addMaterial(userId, material) {
  const { data, error } = await supabase
    .from("materials")
    .insert({
      user_id: userId,
      disciplina: material.disciplina || null,
      commitment_id: material.commitmentId || null,
      tipo_arquivo: material.tipoArquivo,
      nome_arquivo: material.nomeArquivo,
      storage_path: material.storagePath,
      texto_extraido: material.textoExtraido || null,
      status: material.status || "pronto",
    })
    .select()
    .single();
  if (error) throw error;
  return rowToMaterial(data);
}

/** Apaga o registro E o arquivo físico no armazenamento. */
export async function deleteMaterial(id, storagePath) {
  const { error } = await supabase.from("materials").delete().eq("id", id);
  if (error) throw error;
  if (storagePath) {
    await supabase.storage.from("materials").remove([storagePath]).catch(() => {});
  }
}

/** Gera um link temporário (1h) para baixar/visualizar o arquivo original com suporte resiliente a caracteres especiais. */
export async function getMaterialSignedUrl(path) {
  if (!path) return null;
  // 1. Tenta com o caminho original fornecido
  try {
    const { data, error } = await supabase.storage.from("materials").createSignedUrl(path, 3600);
    if (!error && data?.signedUrl) return data.signedUrl;
  } catch (err) {
    console.warn("createSignedUrl original falhou:", err);
  }

  // 2. Se tiver caracteres especiais ou % codificados, tenta versão decodificada
  try {
    const cleanPath = path.includes("%") ? decodeURIComponent(path) : path;
    const { data, error } = await supabase.storage.from("materials").createSignedUrl(cleanPath, 3600);
    if (!error && data?.signedUrl) return data.signedUrl;
  } catch (err) {
    console.warn("createSignedUrl decodificado falhou:", err);
  }

  // 3. Tenta encodeURI preservando barras
  try {
    const parts = path.split("/");
    const encodedPath = parts.map(encodeURIComponent).join("/");
    const { data, error } = await supabase.storage.from("materials").createSignedUrl(encodedPath, 3600);
    if (!error && data?.signedUrl) return data.signedUrl;
  } catch (err) {
    console.warn("createSignedUrl codificado por partes falhou:", err);
  }

  // 4. Fallback para getPublicUrl
  try {
    const { data } = supabase.storage.from("materials").getPublicUrl(path);
    if (data?.publicUrl) return data.publicUrl;
  } catch {}

  return null;
}

/* ---------------------------------------------------------------------- */
/* Metas de estudo diárias                                                  */
/* ---------------------------------------------------------------------- */
export async function fetchStudyGoals(userId) {
  const { data, error } = await supabase.from("study_goals").select("*").eq("user_id", userId);
  if (error) throw error;
  return data.map((g) => ({ id: g.id, date: g.date, metaMinutos: g.meta_minutos }));
}

export async function upsertStudyGoal(userId, date, metaMinutos) {
  const { data, error } = await supabase
    .from("study_goals")
    .upsert({ user_id: userId, date, meta_minutos: metaMinutos }, { onConflict: "user_id,date" })
    .select()
    .single();
  if (error) throw error;
  return { id: data.id, date: data.date, metaMinutos: data.meta_minutos };
}

export async function addSession(userId, session) {
  const { data, error } = await supabase
    .from("sessions")
    .insert({
      user_id: userId,
      disciplina: session.disciplina,
      commitment_id: session.commitmentId || null,
      minutos: session.minutos,
      duracao_preset_min: session.duracaoPresetMin,
      interrupcoes: session.interrupcoes,
      date: session.date,
    })
    .select()
    .single();
  if (error) throw error;
  return {
    id: data.id,
    disciplina: data.disciplina,
    commitmentId: data.commitment_id,
    minutos: data.minutos,
    duracaoPresetMin: data.duracao_preset_min,
    interrupcoes: data.interrupcoes,
    date: data.date,
  };
}

/* ---------------------------------------------------------------------- */
/* Mídias & Leituras (Lulu Hub)                                           */
/* ---------------------------------------------------------------------- */
export async function fetchMediaItems(userId) {
  const localKey = `omnia_media_items_${userId || "guest"}`;
  let localData = [];
  try {
    localData = JSON.parse(localStorage.getItem(localKey) || "[]");
    if (!Array.isArray(localData)) localData = [];
  } catch (e) {
    localData = [];
  }

  if (!userId) return localData;

  try {
    const { data, error } = await supabase
      .from("media_items")
      .select("*")
      .eq("user_id", userId)
      .order("updated_at", { ascending: false });

    if (!error && Array.isArray(data)) {
      const mapped = data.map((d) => ({
        id: d.id,
        tipo: d.tipo || "livro",
        titulo: d.titulo || "",
        subtitulo: d.subtitulo || "",
        autorCriador: d.autor_criador || "",
        capaUrl: d.capa_url || "",
        status: d.status || "quero_consumir",
        progressoAtual: Number(d.progresso_atual || 0),
        progressoTotal: Number(d.progresso_total || 0),
        nota: d.nota !== undefined && d.nota !== null ? Number(d.nota) : null,
        favorito: Boolean(d.favorito),
        dataInicio: d.data_inicio || null,
        dataFim: d.data_fim || null,
        generos: Array.isArray(d.generos) ? d.generos : [],
        resenha: d.resenha || { textoLivre: "", citacoesFavoritas: [] },
        kinborPageId: d.kinbor_page_id || null,
        createdAt: d.created_at,
        updatedAt: d.updated_at,
      }));
      try {
        localStorage.setItem(localKey, JSON.stringify(mapped));
      } catch (e) {}
      return mapped;
    }
  } catch (err) {
    console.warn("Supabase media_items indisponível, usando cache local:", err);
  }

  return localData;
}

export async function saveMediaItem(userId, item) {
  const localKey = `omnia_media_items_${userId || "guest"}`;
  const now = new Date().toISOString();
  const id = item.id || `media_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

  const formattedItem = {
    ...item,
    id,
    progressoAtual: Number(item.progressoAtual || 0),
    progressoTotal: Number(item.progressoTotal || 0),
    updatedAt: now,
    createdAt: item.createdAt || now,
  };

  try {
    const local = JSON.parse(localStorage.getItem(localKey) || "[]");
    const filtered = local.filter((x) => x.id !== id);
    const updated = [formattedItem, ...filtered];
    localStorage.setItem(localKey, JSON.stringify(updated));
  } catch (e) {}

  if (!userId) return formattedItem;

  try {
    const row = {
      id,
      user_id: userId,
      tipo: formattedItem.tipo || "livro",
      titulo: formattedItem.titulo || "",
      subtitulo: formattedItem.subtitulo || "",
      autor_criador: formattedItem.autorCriador || "",
      capa_url: formattedItem.capaUrl || "",
      status: formattedItem.status || "quero_consumir",
      progresso_atual: formattedItem.progressoAtual,
      progresso_total: formattedItem.progressoTotal,
      nota: formattedItem.nota,
      favorito: formattedItem.favorito,
      data_inicio: formattedItem.dataInicio || null,
      data_fim: formattedItem.dataFim || null,
      generos: formattedItem.generos || [],
      resenha: formattedItem.resenha || {},
      kinbor_page_id: formattedItem.kinborPageId || null,
      updated_at: now,
    };

    const { data, error } = await supabase
      .from("media_items")
      .upsert(row, { onConflict: "id" })
      .select()
      .maybeSingle();

    if (!error && data) {
      return formattedItem;
    }
  } catch (err) {
    console.warn("Supabase upsert media_items falhou, mantido local:", err);
  }

  return formattedItem;
}

export async function deleteMediaItem(userId, id) {
  if (!id) return;
  const localKey = `omnia_media_items_${userId || "guest"}`;
  try {
    const local = JSON.parse(localStorage.getItem(localKey) || "[]");
    const updated = local.filter((x) => x.id !== id);
    localStorage.setItem(localKey, JSON.stringify(updated));
  } catch (e) {}

  if (!userId) return;
  try {
    await supabase.from("media_items").delete().eq("id", id).eq("user_id", userId);
  } catch (err) {
    console.warn("Aviso ao deletar media_item do Supabase:", err);
  }
}

/* ---------------------------------------------------------------------- */
/* Caderno Estético Kinbor (Páginas & Colagens)                           */
/* ---------------------------------------------------------------------- */
export async function fetchKinborPages(userId) {
  const localKey = `omnia_kinbor_pages_${userId || "guest"}`;
  let localData = [];
  try {
    localData = JSON.parse(localStorage.getItem(localKey) || "[]");
    if (!Array.isArray(localData)) localData = [];
  } catch (e) {
    localData = [];
  }

  if (!userId) return localData;

  try {
    const { data, error } = await supabase
      .from("kinbor_pages")
      .select("*")
      .eq("user_id", userId)
      .order("data_registro", { ascending: false });

    if (!error && Array.isArray(data)) {
      const mapped = data.map((p) => ({
        id: p.id,
        dataRegistro: p.data_registro,
        titulo: p.titulo || "",
        mediaId: p.media_id || null,
        estiloPapel: p.estilo_papel || "grid_kinbor",
        clima: p.clima || "sol",
        humor: p.humor || "calmo",
        elementos: Array.isArray(p.elementos) ? p.elementos : [],
        createdAt: p.created_at,
        updatedAt: p.updated_at,
      }));
      try {
        localStorage.setItem(localKey, JSON.stringify(mapped));
      } catch (e) {}
      return mapped;
    }
  } catch (err) {
    console.warn("Supabase kinbor_pages indisponível, usando cache local:", err);
  }

  return localData;
}

export async function saveKinborPage(userId, page) {
  const localKey = `omnia_kinbor_pages_${userId || "guest"}`;
  const now = new Date().toISOString();
  const id = page.id || `kinbor_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

  const formattedPage = {
    ...page,
    id,
    updatedAt: now,
    createdAt: page.createdAt || now,
  };

  try {
    const local = JSON.parse(localStorage.getItem(localKey) || "[]");
    const filtered = local.filter((x) => x.id !== id);
    const updated = [formattedPage, ...filtered];
    localStorage.setItem(localKey, JSON.stringify(updated));
  } catch (e) {}

  if (!userId) return formattedPage;

  try {
    const row = {
      id,
      user_id: userId,
      data_registro: formattedPage.dataRegistro || now.split("T")[0],
      titulo: formattedPage.titulo || "",
      media_id: formattedPage.mediaId || null,
      estilo_papel: formattedPage.estiloPapel || "grid_kinbor",
      clima: formattedPage.clima || "sol",
      humor: formattedPage.humor || "calmo",
      elementos: formattedPage.elementos || [],
      updated_at: now,
    };

    const { data, error } = await supabase
      .from("kinbor_pages")
      .upsert(row, { onConflict: "id" })
      .select()
      .maybeSingle();

    if (!error && data) {
      return formattedPage;
    }
  } catch (err) {
    console.warn("Supabase upsert kinbor_pages falhou, mantido local:", err);
  }

  return formattedPage;
}

export async function deleteKinborPage(userId, id) {
  if (!id) return;
  const localKey = `omnia_kinbor_pages_${userId || "guest"}`;
  try {
    const local = JSON.parse(localStorage.getItem(localKey) || "[]");
    const updated = local.filter((x) => x.id !== id);
    localStorage.setItem(localKey, JSON.stringify(updated));
  } catch (e) {}

  if (!userId) return;
  try {
    await supabase.from("kinbor_pages").delete().eq("id", id).eq("user_id", userId);
  } catch (err) {
    console.warn("Aviso ao deletar kinbor_page do Supabase:", err);
  }
}
