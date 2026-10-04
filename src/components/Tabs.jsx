import React from "react";
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as ics from 'ics';
import { useState, useEffect, useRef, lazy, Suspense } from "react";
import {
  Send, Play, Pause, RotateCcw, Check, X, Loader2, AlertCircle,
  Plus, Trash2, Clock, Sparkles, GraduationCap, RefreshCw,
  AlertTriangle, Info, LogOut, FileText, Image as ImageIcon, Mic, Paperclip, Download,
  Moon, SlidersHorizontal, Pencil, Target, CalendarDays, Headphones,
  Settings, Palette,
} from "lucide-react";
import {
  T, TINT, THEMES, applyTheme, TIPO_LABELS, PRIORIDADE_META, PERIODO_LABELS, TABS,
  PriorityDot, TypeTag, Card, SectionLabel, EmptyState, PrimaryButton, GhostButton,
} from "./ui";
import { uid, todayISO, formatDateBR, weekdayShort, addDays, computeInterruptionInsight, fileToBase64, hexToRgba, getWeekRange, getEffectiveRoutineItemsForDate, planoRecomendadoHoje, computeAvisos, getSemestre } from "../lib/utils";
import { aiGenerateSummary, aiGenerateQuiz, aiEvaluateProfessor, aiParseSyllabus } from "../lib/aiHelpers";
import { callVision, callAudioTranscription, callAIWithTools } from "../lib/ai";
import { ROUTINE_TOOLS, executeRoutineTool } from "../lib/routineTools";
import { PRESETS } from "../lib/useFocusTimer";
const ChatMarkdown = lazy(() => import("./ChatMarkdown").then((m) => ({ default: m.ChatMarkdown })));
import {
  addQuizAttempt, addProfessorAttempt,
  upsertSummary, addSession as dbAddSession, addCommitment,
  uploadMaterialFile, addMaterial, getMaterialSignedUrl, deleteMaterial,
  addNote, deleteNote,
} from "../lib/db";

const MAX_FILE_MB = 8;

const TIPO_ARQUIVO_META = {
  pdf: { label: "PDF", icon: FileText },
  imagem: { label: "Foto", icon: ImageIcon },
  audio: { label: "Áudio", icon: Mic },
};

/* ---------------------------------------------------------------------- */
/* Header + navegação                                                      */
/* ---------------------------------------------------------------------- */
export function Header({ onLogout }) {
  return (
    <div className="mb-5 flex items-start justify-between">
        <div className="flex items-center gap-5">
          <img src="/omnia.png" alt="Omnia" className="h-24 w-56 object-contain scale-110 drop-shadow-xl" style={{ filter: "brightness(1.5)" }} />
          <div>
            <div className="flex items-baseline gap-2">
              <h2 className="text-lg font-semibold tracking-tight" style={{ color: T.ink }}>Painel de Controle</h2>
            <span className="text-[10px] font-mono uppercase tracking-widest px-1.5 py-0.5 rounded" style={{ color: T.brand, border: `1px solid ${T.brand}` }}>
              beta
            </span>
          </div>
          <p className="text-sm mt-0.5" style={{ color: T.inkSoft }}>Jogue a bagunça aqui. A organização é comigo.</p>
        </div>
      </div>
      <button onClick={onLogout} className="flex items-center gap-1 text-xs mt-1" style={{ color: T.inkSoft }}>
        <LogOut className="w-3.5 h-3.5" /> Sair
      </button>
    </div>
  );
}

export function TabNav({ tab, setTab }) {
  return (
    <nav className="flex md:justify-center gap-1 overflow-x-auto mb-6 pb-1 -mx-1 px-1 custom-scrollbar" style={{ borderBottom: `1px solid ${T.border}` }}>
      {TABS.map((t) => {
        const Icon = t.icon;
        const active = tab === t.id;
        return (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className="flex items-center gap-1.5 whitespace-nowrap px-3 py-2 text-sm font-medium rounded-t-md transition-colors"
            style={{ color: active ? T.brand : T.inkSoft, borderBottom: active ? `2px solid ${T.brand}` : "2px solid transparent" }}
          >
            <Icon className="w-4 h-4" />
            {t.label}
          </button>
        );
      })}
    </nav>
  );
}

/* ---------------------------------------------------------------------- */
/* Aba: Hoje                                                                */
/* ---------------------------------------------------------------------- */
const getRoutineIcon = (type) => {
  const props = { size: 20, strokeWidth: 1.5, className: "opacity-80" };
  switch(type) {
    case "sono": return <Moon {...props} />;
    case "aula": return <BookOpen {...props} />;
    case "trabalho": return <Briefcase {...props} />;
    case "estudo": return <Book {...props} />;
    case "academia": return <Dumbbell {...props} />;
    case "refeicao": return <Utensils {...props} />;
    case "livre": return <Leaf {...props} />;
    case "lazer": return <Headphones {...props} />;
    case "esporte": return <Activity {...props} />;
    case "pessoal": return <Globe {...props} />;
    case "consulta": return <Target {...props} />;
    case "evento": return <Sparkles {...props} />;
    default: return <Pin {...props} />;
  }
};

function MetaHojeCard({ blocksHoje, routine, metaHoje, onSetMeta, minutosEstudadosHoje }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(metaHoje ? metaHoje / 60 : 2);
  const plano = planoRecomendadoHoje(blocksHoje, routine);
  const pct = metaHoje ? Math.min(100, Math.round((minutosEstudadosHoje / metaHoje) * 100)) : null;

  async function salvar() {
    await onSetMeta(Math.max(15, Math.round(draft * 60)));
    setEditing(false);
  }

  return (
    <Card>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5 text-xs" style={{ color: T.inkSoft }}><Target className="w-3.5 h-3.5" /> Meta de hoje</div>
        <button onClick={() => setEditing((e) => !e)} style={{ color: T.brand }}><Pencil className="w-3.5 h-3.5" /></button>
      </div>

      {editing ? (
        <div className="flex items-center gap-2 mb-1">
          <input type="number" min={0.25} step={0.25} value={draft} onChange={(e) => setDraft(Number(e.target.value) || 0)} className="w-20 rounded-md p-2 text-sm" style={{ backgroundColor: T.surfaceAlt, border: `1px solid ${T.border}`, color: T.ink }} />
          <span className="text-sm" style={{ color: T.inkSoft }}>horas</span>
          <PrimaryButton onClick={salvar}><Check className="w-4 h-4" /></PrimaryButton>
        </div>
      ) : metaHoje ? (
        <>
          <div className="flex items-baseline justify-between mb-1.5">
            <span className="text-sm font-medium" style={{ color: T.ink }}>{minutosEstudadosHoje} de {metaHoje} min</span>
            <span className="text-xs" style={{ color: T.brand }}>{pct}%</span>
          </div>
          <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: T.surfaceAlt }}>
            <div className="h-full" style={{ width: `${pct}%`, backgroundColor: T.brand }} />
          </div>
        </>
      ) : (
        <div className="text-xs" style={{ color: T.inkSoft }}>Nenhuma meta definida — clique no lápis pra dizer quantas horas quer estudar hoje.</div>
      )}

      {plano.itens.length > 0 && (
        <div className="mt-3 pt-3" style={{ borderTop: `1px solid ${T.border}` }}>
          <div className="text-[11px] font-mono uppercase tracking-wide mb-1.5" style={{ color: T.inkSoft }}>Plano recomendado pra hoje</div>
          {plano.itens.map((i) => (
            <div key={i.disciplina} className="flex items-center justify-between text-sm py-0.5">
              <span style={{ color: T.ink }}>{i.disciplina}</span>
              <span style={{ color: T.inkSoft }}>{i.minutos}min</span>
            </div>
          ))}
          <div className="flex items-center justify-between text-sm font-semibold pt-1 mt-1" style={{ borderTop: `1px solid ${T.border}`, color: T.brand }}>
            <span>Total</span>
            <span>{plano.total}min</span>
          </div>
          <div className="text-[11px] mt-1.5" style={{ color: T.inkSoft }}>
            Baseado na sua preferência por sessões {plano.duracaoPorBloco === 50 ? "longas" : "curtas"} ({plano.duracaoPorBloco}min) e nos blocos de estudo já planejados pra hoje.
          </div>
        </div>
      )}
    </Card>
  );
}

export function HojeTab({ overdue, blocksHoje, commitmentsHoje, routineItemsHoje, proximos, overload, onToggleBlock, onGoInbox, onGoAgenda, routine, metaHoje, onSetMeta, minutosEstudadosHoje, avisos }) {
  const items = [
    ...routineItemsHoje.map((r) => ({ ...r, isRoutine: true, sortKey: r.horaInicio || "99:99" })),
    ...blocksHoje.map((b) => ({ ...b, sortKey: { manha: "09:00", tarde: "15:00", noite: "19:00" }[b.periodo] || "12:00" })),
    ...commitmentsHoje.map((c) => ({ ...c, isCommitment: true, sortKey: "23:59" })),
  ];
  items.sort((a, b) => a.sortKey.localeCompare(b.sortKey));

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto pt-2">
      
      {/* Alertas Globais (Topo) */}
      {(overdue.length > 0 || overload.length >= 2 || avisos.length > 0) && (
        <div className="space-y-3 mb-6">
          {overdue.length > 0 && (
            <Card style={{ borderColor: T.critico, backgroundColor: TINT.critico }}>
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" style={{ color: T.critico }} />
                <div className="text-sm" style={{ color: T.critico }}>
                  <strong>{overdue.length} compromisso{overdue.length > 1 ? "s" : ""} vencido{overdue.length > 1 ? "s" : ""}:</strong>{" "}
                  {overdue.map((o) => o.assunto).join(", ")}
                </div>
              </div>
            </Card>
          )}
          {overload.length >= 2 && (
            <Card style={{ borderColor: T.importante, backgroundColor: TINT.importante }}>
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" style={{ color: T.importante }} />
                <div className="text-sm" style={{ color: T.importante }}>
                  <strong>Semana pesada:</strong> {overload.length} compromissos nos próximos 7 dias —{" "}
                  {overload.map((c) => `${c.disciplina} em ${formatDateBR(c.prazo)}`).join(", ")}.
                </div>
              </div>
            </Card>
          )}
          {avisos.map((a) => (
            <Card key={a.id} style={{ borderColor: T[a.cor], backgroundColor: TINT[a.cor] }}>
              <div className="flex items-start gap-2">
                <Info className="w-4 h-4 mt-0.5 shrink-0" style={{ color: T[a.cor] }} />
                <div className="text-sm" style={{ color: T[a.cor] }}>{a.mensagem}</div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* COLUNA ESQUERDA: Painel do Dia */}
        <div className="lg:col-span-7 space-y-8">
          
          <Card className="p-5" style={{ boxShadow: "0 4px 20px rgba(0,0,0,0.2)", border: `1px solid ${T.surfaceAlt}` }}>
            <div className="flex justify-between items-end mb-4 border-b pb-2" style={{ borderColor: T.border }}>
              <h2 className="font-semibold text-lg" style={{ color: T.ink }}>O que eu deveria estar fazendo agora?</h2>
              <span className="text-xs font-mono uppercase tracking-wider" style={{ color: T.inkSoft }}>{weekdayShort(todayISO())}, {formatDateBR(todayISO())}</span>
            </div>
            
            {items.length === 0 ? (
              <EmptyState text="Nada planejado para hoje ainda. Jogue algo na Inbox para começar." />
            ) : (
              <div className="space-y-3">
                {items.map((item) => (
                  <div key={item.id} className="flex items-center gap-4 rounded-lg p-3 transition-colors" style={{ backgroundColor: T.surfaceAlt, border: `1px solid ${item.done ? T.brandDark : T.border}` }}>
                    {item.isRoutine && (
                      <div className="w-8 text-center shrink-0 text-xl" title={item.tipo}>{getRoutineIcon(item.tipo)}</div>
                    )}
                    {!item.isCommitment && !item.isRoutine && (
                      <button
                        onClick={() => onToggleBlock(item.id)}
                        className="w-6 h-6 rounded shrink-0 flex items-center justify-center transition-all"
                        style={{ border: `1.5px solid ${item.done ? T.brand : T.border}`, backgroundColor: item.done ? T.brand : "transparent" }}
                      >
                        {item.done && <Check className="w-4 h-4" style={{ color: T.bg }} />}
                      </button>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="text-base font-medium truncate" style={{ color: T.ink, textDecoration: item.done ? "line-through" : "none" }}>
                        {item.isRoutine ? item.titulo : `${item.disciplina} — {item.assunto}`}
                      </div>
                      <div className="text-sm mt-0.5" style={{ color: T.inkSoft }}>
                        {item.isRoutine
                          ? `${item.horaInicio?.slice(0, 5)} - ${item.horaFim?.slice(0, 5)}`
                          : `${PERIODO_LABELS[item.periodo] || ""} ${item.isCommitment ? `? ${TIPO_LABELS[item.tipo]}` : item.tipo === "revisao" ? "? revisão" : "? estudo"}`}
                      </div>
                    </div>
                    {item.isCommitment && <PriorityDot prioridade={item.prioridade} />}
                  </div>
                ))}
              </div>
            )}
          </Card>
          
          <MetaHojeCard blocksHoje={blocksHoje} routine={routine} metaHoje={metaHoje} onSetMeta={onSetMeta} minutosEstudadosHoje={minutosEstudadosHoje} />
        </div>

        {/* COLUNA DIREITA: Checklist e Prazos */}
        <div className="lg:col-span-5 space-y-8 mt-2 lg:mt-0">
          
          <Card className="p-5 flex flex-col h-full" style={{ boxShadow: "0 4px 20px rgba(0,0,0,0.2)", border: `1px solid ${T.surfaceAlt}` }}>
            <h2 className="font-semibold text-lg mb-4 border-b pb-2" style={{ color: T.ink, borderColor: T.border }}>Próximos Prazos e Tarefas</h2>
            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
              {proximos.length === 0 ? (
                <EmptyState text="Nenhum prazo futuro registrado." />
              ) : (
                <div className="space-y-3">
                  {proximos.map((c) => (
                    <button key={c.id} onClick={onGoAgenda} className="w-full text-left rounded-lg outline-none focus:outline-none transition-transform hover:scale-[1.02] overflow-hidden bg-transparent">
                      <div className="flex items-center justify-between p-3 rounded-lg" style={{ backgroundColor: T.surfaceAlt, border: `1px solid ${T.border}` }}>
                        <div className="min-w-0 pr-3">
                          <div className="text-sm font-medium truncate" style={{ color: T.ink }}>{c.disciplina} — {c.assunto}</div>
                          <div className="text-xs mt-1" style={{ color: T.inkSoft }}>
                            {formatDateBR(c.prazo)} • {weekdayShort(c.prazo)}
                          </div>
                        </div>
                        <TypeTag tipo={c.tipo} />
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
            
            <div className="mt-6 pt-6" style={{ borderTop: `1px solid ${T.border}` }}>
              <button onClick={onGoInbox} className="w-full py-3 rounded-lg text-sm font-bold uppercase tracking-wider transition-colors shadow-lg" style={{ backgroundColor: TINT.brand, color: T.brand, border: `1px solid ${T.brand}` }}>
                + Central de Entrada
              </button>
            </div>
          </Card>
        </div>
        
      </div>
    </div>
  );
}
/* ---------------------------------------------------------------------- */
/* Aba: Inbox                                                               */
/* ---------------------------------------------------------------------- */
export function InboxTab({ userId, onSubmit, loading, error, pendingReview, setPendingReview, onConfirm, onSaveNote, setMaterials }) {
  const [text, setText] = useState("");
  const [pendingFile, setPendingFile] = useState(null); // { file, tipoArquivo }
  const [extracting, setExtracting] = useState(null); // "pdf" | "imagem" | "audio" | null
  const [fileError, setFileError] = useState(null);

  const pdfInputRef = useRef(null);
  const imgInputRef = useRef(null);
  const audioInputRef = useRef(null);

  async function handleSubmit() {
    if (!text.trim() || loading) return;
    const value = text;
    setText("");
    await onSubmit(value);
  }

  function checkSize(file) {
    if (file.size > MAX_FILE_MB * 1024 * 1024) {
      setFileError(`Esse arquivo passa de ${MAX_FILE_MB}MB. Tente um arquivo menor.`);
      return false;
    }
    return true;
  }

  async function handleFilePicked(e, tipoArquivo) {
    const file = e.target.files?.[0];
    e.target.value = ""; // permite escolher o mesmo arquivo de novo depois
    if (!file || !checkSize(file)) return;

    setFileError(null);
    setExtracting(tipoArquivo);
    try {
      let extracted = "";
      if (tipoArquivo === "pdf") {
        const { extractPdfText } = await import("../lib/pdf");
        extracted = await extractPdfText(file);
        if (!extracted.trim()) {
          throw new Error("Não achei texto nesse PDF (pode ser um PDF escaneado como imagem — tente enviar como Foto).");
        }
      } else if (tipoArquivo === "imagem") {
        const { base64, mimeType } = await fileToBase64(file);
        extracted = await callVision(base64, mimeType);
      } else if (tipoArquivo === "audio") {
        const { base64, mimeType } = await fileToBase64(file);
        extracted = await callAudioTranscription(base64, mimeType);
      }
      // Guardamos o texto COMPLETO extraído junto do arquivo. A caixa de
      // texto mostra o mesmo conteúdo para o usuário revisar/editar, mas
      // é o texto completo que vai para a Biblioteca — é ele que alimenta
      // resumo, quiz e Modo Professor depois.
      setText(extracted);
      setPendingFile({ file, tipoArquivo, textoCompleto: extracted });
    } catch (err) {
      setFileError(err.message || "Não consegui processar esse arquivo. Tente outro ou digite manualmente.");
    } finally {
      setExtracting(null);
    }
  }

  async function persistMaterial(file, data, commitmentId) {
    try {
      const path = await uploadMaterialFile(userId, file.file);
      const saved = await addMaterial(userId, {
        disciplina: data.disciplina,
        commitmentId: commitmentId || null,
        tipoArquivo: file.tipoArquivo,
        nomeArquivo: file.file.name,
        storagePath: path,
        textoExtraido: file.textoCompleto || data.origemTexto,
      });
      // Atualiza a Biblioteca na hora — antes o arquivo só aparecia
      // depois de recarregar a página.
      setMaterials((prev) => [saved, ...prev]);
    } catch (err) {
      setFileError("O compromisso foi salvo, mas não consegui anexar o arquivo à Biblioteca: " + (err.message || String(err)));
    }
  }

  async function handleConfirm(data) {
    const file = pendingFile;
    setPendingFile(null);
    const novoCommitment = await onConfirm(data);
    if (file) await persistMaterial(file, data, novoCommitment?.id);
  }
  async function handleSaveNote(data) {
    const file = pendingFile;
    setPendingFile(null);
    await onSaveNote(data);
    if (file) await persistMaterial(file, data, null);
  }
  function handleDiscard() {
    setPendingFile(null);
    setPendingReview(null);
  }

  const extractingLabel = {
    pdf: "Lendo o PDF...",
    imagem: "Analisando a imagem...",
    audio: "Transcrevendo o áudio...",
  };

  return (
    <div className="space-y-4">
      <Card>
        <SectionLabel>Central de entrada</SectionLabel>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder='Ex: "Professor de Anatomia falou que sexta tem prova e vai cair ATM e músculos da mastigação."'
          rows={4}
          className="w-full rounded-md p-3 text-sm outline-none resize-none"
          style={{ backgroundColor: T.surfaceAlt, border: `1px solid ${T.border}`, color: T.ink }}
        />

        <div className="flex flex-wrap items-center gap-2 mt-3">
          <button
            onClick={() => pdfInputRef.current?.click()}
            disabled={!!extracting}
            className="flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-md disabled:opacity-50"
            style={{ color: T.inkSoft, border: `1px solid ${T.border}` }}
          >
            <FileText className="w-3.5 h-3.5" /> PDF
          </button>
          <button
            onClick={() => imgInputRef.current?.click()}
            disabled={!!extracting}
            className="flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-md disabled:opacity-50"
            style={{ color: T.inkSoft, border: `1px solid ${T.border}` }}
          >
            <ImageIcon className="w-3.5 h-3.5" /> Foto
          </button>
          <button
            onClick={() => audioInputRef.current?.click()}
            disabled={!!extracting}
            className="flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-md disabled:opacity-50"
            style={{ color: T.inkSoft, border: `1px solid ${T.border}` }}
          >
            <Mic className="w-3.5 h-3.5" /> Áudio
          </button>

          <input ref={pdfInputRef} type="file" accept="application/pdf" className="hidden" onChange={(e) => handleFilePicked(e, "pdf")} />
          <input ref={imgInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleFilePicked(e, "imagem")} />
          <input ref={audioInputRef} type="file" accept="audio/*" className="hidden" onChange={(e) => handleFilePicked(e, "audio")} />
        </div>

        {extracting && (
          <div className="flex items-center gap-2 text-xs mt-2" style={{ color: T.brand }}>
            <Loader2 className="w-3.5 h-3.5 animate-spin" /> {extractingLabel[extracting]}
          </div>
        )}
        {fileError && <div className="text-xs mt-2" style={{ color: T.critico }}>{fileError}</div>}
        {pendingFile && !extracting && (
          <div className="flex items-center gap-1.5 text-xs mt-2" style={{ color: T.inkSoft }}>
            <Paperclip className="w-3.5 h-3.5" /> Anexado: {pendingFile.file.name} — será salvo na Biblioteca ao confirmar.
          </div>
        )}

        <div className="flex items-center gap-2 mt-3">
          <PrimaryButton onClick={handleSubmit} disabled={loading || !text.trim() || !!extracting}>
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            {loading ? "Interpretando..." : "Interpretar"}
          </PrimaryButton>
          {error && <span className="text-xs" style={{ color: T.critico }}>{error}</span>}
        </div>
      </Card>

      {pendingReview && (
        <PendingReviewCard data={pendingReview} onChange={setPendingReview} onConfirm={handleConfirm} onSaveNote={handleSaveNote} onDiscard={handleDiscard} />
      )}
    </div>
  );
}

function PendingReviewCard({ data, onChange, onConfirm, onSaveNote, onDiscard }) {
  const incerto = data.incerto || [];
  const field = (key, el) => (
    <div>
      <label className="text-[11px] font-mono uppercase tracking-wide flex items-center gap-1" style={{ color: incerto.includes(key) ? T.importante : T.inkSoft }}>
        {key}
        {incerto.includes(key) && <AlertCircle className="w-3 h-3" />}
      </label>
      {el}
    </div>
  );
  const inputStyle = { backgroundColor: T.surfaceAlt, border: `1px solid ${T.border}`, color: T.ink };

  return (
    <Card style={{ borderColor: T.brand }}>
      <div className="flex items-start gap-2 mb-3">
        <Sparkles className="w-4 h-4 mt-0.5 shrink-0" style={{ color: T.brand }} />
        <div className="text-sm overflow-y-auto max-h-64 flex-1 pr-2 custom-scrollbar" style={{ color: T.inkSoft }}>
          {data.resumo ? (
            <Suspense fallback={<span>{data.resumo}</span>}>
              <ChatMarkdown text={data.resumo} />
            </Suspense>
          ) : (
            "Confira e ajuste antes de adicionar à agenda."
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-3">
        {field("tipo", (
          <select value={data.tipo} onChange={(e) => onChange({ ...data, tipo: e.target.value })} className="w-full rounded-md p-2 text-sm mt-1" style={inputStyle}>
            {Object.entries(TIPO_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
        ))}
        {field("prioridade", (
          <select value={data.prioridade} onChange={(e) => onChange({ ...data, prioridade: e.target.value })} className="w-full rounded-md p-2 text-sm mt-1" style={inputStyle}>
            {Object.entries(PRIORIDADE_META).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
          </select>
        ))}
        {field("disciplina", (
          <input value={data.disciplina || ""} onChange={(e) => onChange({ ...data, disciplina: e.target.value })} className="w-full rounded-md p-2 text-sm mt-1" style={inputStyle} />
        ))}
        {field("prazo", (
          <input type="date" value={data.prazo || ""} onChange={(e) => onChange({ ...data, prazo: e.target.value })} className="w-full rounded-md p-2 text-sm mt-1" style={inputStyle} />
        ))}
        <div className="col-span-2">
          {field("assunto", (
            <input value={data.assunto || ""} onChange={(e) => onChange({ ...data, assunto: e.target.value })} className="w-full rounded-md p-2 text-sm mt-1" style={inputStyle} />
          ))}
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <PrimaryButton onClick={() => onConfirm(data)}><Check className="w-4 h-4" /> Adicionar à agenda</PrimaryButton>
        <GhostButton onClick={() => onSaveNote(data)}>Guardar só como anotação</GhostButton>
        <GhostButton onClick={onDiscard}><X className="w-4 h-4" /> Descartar</GhostButton>
      </div>
    </Card>
  );
}

/* ---------------------------------------------------------------------- */
/* Aba: Agenda                                                              */
/* ---------------------------------------------------------------------- */
function PlanosAtivos({ commitments, studyBlocks, onReplan, onReduzir }) {
  const hoje = todayISO();
  const planos = commitments.filter((c) => c.prazo && c.prazo >= hoje && studyBlocks.some((b) => b.commitmentId === c.id));
  if (planos.length === 0) return null;

  return (
    <div className="mb-5">
      <SectionLabel>Planos de estudo ativos</SectionLabel>
      <div className="space-y-2">
        {planos.map((c) => {
          const blocks = studyBlocks.filter((b) => b.commitmentId === c.id);
          const done = blocks.filter((b) => b.done).length;
          const pct = blocks.length ? Math.round((done / blocks.length) * 100) : 0;
          return (
            <Card key={c.id}>
              <div className="flex items-center justify-between mb-1.5">
                <div className="text-sm font-medium">{c.disciplina} — {c.assunto}</div>
                <span className="text-xs font-mono" style={{ color: T.inkSoft }}>{formatDateBR(c.prazo)}</span>
              </div>
              <div className="h-1.5 rounded-full overflow-hidden mb-2" style={{ backgroundColor: T.surfaceAlt }}>
                <div className="h-full" style={{ width: `${pct}%`, backgroundColor: T.brand }} />
              </div>
              <div className="flex flex-wrap gap-2">
                <GhostButton onClick={() => onReplan(c)}><RefreshCw className="w-3.5 h-3.5" /> Não consegui seguir — replanejar</GhostButton>
                <GhostButton onClick={() => onReduzir(c)}>Adiantei — reduzir carga futura</GhostButton>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

export function AgendaTab({
  userId, commitments, studyBlocks, onDeleteCommitment, onToggleBlock, onReplan, onReduzir,
  routine, routineBlocks, routineExceptions,
  notes, materials, summaries, quizAttempts, professorAttempts,
  setNotes, setMaterials, setSummaries, setQuizAttempts, setProfessorAttempts,
}) {
  const [openCommitment, setOpenCommitment] = useState(null);

  const merged = [
    ...commitments.map((c) => ({ ...c, kind: "commitment", date: c.prazo || "9999-99-99" })),
    ...studyBlocks.map((b) => ({ ...b, kind: "block" })),
  ];

  const hoje = todayISO();
  const janela = Array.from({ length: 14 }, (_, i) => addDays(hoje, i));
  janela.forEach((date) => {
    getEffectiveRoutineItemsForDate(date, routine, routineBlocks, routineExceptions).forEach((r) => {
      merged.push({ ...r, kind: "routine", date });
    });
  });

  const grouped = {};
  merged.forEach((item) => { grouped[item.date] = grouped[item.date] || []; grouped[item.date].push(item); });
  Object.keys(grouped).forEach((date) => {
    grouped[date].sort((a, b) => {
      const ta = a.kind === "routine" ? a.horaInicio || "12:00" : { manha: "09:00", tarde: "15:00", noite: "19:00" }[a.periodo] || "12:00";
      const tb = b.kind === "routine" ? b.horaInicio || "12:00" : { manha: "09:00", tarde: "15:00", noite: "19:00" }[b.periodo] || "12:00";
      return ta.localeCompare(tb);
    });
  });
  const dates = Object.keys(grouped).sort();

  return (
    <div>
      <PlanosAtivos commitments={commitments} studyBlocks={studyBlocks} onReplan={onReplan} onReduzir={onReduzir} />
      {dates.length === 0 ? (
        <EmptyState text="Sua agenda está vazia. Adicione algo pela Inbox." />
      ) : (
        <div className="space-y-4">
          {dates.map((date) => (
            <div key={date}>
              <SectionLabel>{date === "9999-99-99" ? "Sem data" : `${weekdayShort(date)} · ${formatDateBR(date)}`}</SectionLabel>
              <div className="space-y-2">
                {grouped[date].map((item) => (
                  <Card
                    key={item.id}
                    className="flex items-center gap-3 py-2.5"
                    style={item.kind === "commitment" ? { cursor: "pointer" } : item.kind === "routine" ? { borderLeft: `3px solid ${item.cor}` } : {}}
                    onClick={item.kind === "commitment" ? () => setOpenCommitment(item) : undefined}
                  >
                    {item.kind === "block" && (
                      <button
                        onClick={() => onToggleBlock(item.id)}
                        className="w-5 h-5 rounded shrink-0 flex items-center justify-center"
                        style={{ border: `1.5px solid ${item.done ? T.brand : T.border}`, backgroundColor: item.done ? T.brand : "transparent" }}
                      >
                        {item.done && <Check className="w-3.5 h-3.5" style={{ color: T.brandInk }} />}
                      </button>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate" style={{ textDecoration: item.done ? "line-through" : "none" }}>
                        {item.kind === "routine" ? item.titulo : `${item.disciplina} — {item.assunto}`}
                      </div>
                      <div className="text-xs mt-0.5" style={{ color: T.inkSoft }}>
                        {item.kind === "commitment" && TIPO_LABELS[item.tipo]}
                        {item.kind === "block" && `Bloco de ${item.tipo === "revisao" ? "revisão" : "estudo"} · ${PERIODO_LABELS[item.periodo]}`}
                        {item.kind === "routine" && `${item.horaInicio?.slice(0, 5)}–${item.horaFim?.slice(0, 5)}`}
                      </div>
                    </div>
                    {item.kind === "commitment" ? (
                      <div className="flex items-center gap-3 shrink-0">
                        <PriorityDot prioridade={item.prioridade} />
                        <button onClick={(e) => { e.stopPropagation(); onDeleteCommitment(item.id); }} style={{ color: T.inkSoft }}><Trash2 className="w-4 h-4" /></button>
                      </div>
                    ) : null}
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {openCommitment && (
        <CompromissoWorkspaceModal
          userId={userId}
          commitment={openCommitment}
          notes={notes}
          materials={materials}
          summaries={summaries}
          quizAttempts={quizAttempts}
          professorAttempts={professorAttempts}
          setNotes={setNotes}
          setMaterials={setMaterials}
          setSummaries={setSummaries}
          setQuizAttempts={setQuizAttempts}
          setProfessorAttempts={setProfessorAttempts}
          onClose={() => setOpenCommitment(null)}
        />
      )}
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/* Aba: Desempenho                                                          */
/* ---------------------------------------------------------------------- */

function Heatmap({ sessions }) {
  const daily = {};
  (sessions || []).forEach(s => {
    const d = (s.date || "").slice(0,10);
    daily[d] = (daily[d] || 0) + s.minutos;
  });
  
  const today = new Date();
  const days = [];
  for (let i = 100; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const iso = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
    days.push({ iso, min: daily[iso] || 0 });
  }

  return (
    <Card className="p-5 mt-6">
      <SectionLabel>Gráfico de Calor (Últimos 100 dias)</SectionLabel>
      <div className="flex flex-wrap gap-1 mt-4">
        {days.map(d => {
          let color = T.surfaceAlt;
          if (d.min > 0) color = "rgba(59, 130, 246, 0.3)";
          if (d.min > 30) color = "rgba(59, 130, 246, 0.6)";
          if (d.min > 60) color = T.brand;
          return <div key={d.iso} title={d.iso + ": " + d.min + " min"} className="w-3 h-3 rounded-sm hover:scale-150 transition-transform cursor-crosshair" style={{ backgroundColor: color }} />
        })}
      </div>
    </Card>
  )
}


function Badges({ sessions }) {
  const badges = [];
  if (sessions.some(s => { const d = new Date(s.date); return d.getDay() === 0; })) badges.push({ ic: <Skull size={24} />, n: "Sobrevivente", d: "Estudou num Domingo" });
  if (sessions.some(s => { const h = parseInt((s.date || "T00:00:00").slice(11,13)); return h >= 4 && h <= 6; })) badges.push({ ic: <Sunrise size={24} />, n: "Madrugador", d: "Estudou antes das 7h" });
  if (sessions.some(s => s.minutos >= 120)) badges.push({ ic: "🏃", n: "Maratonista", d: "Sessão de +2h" });
  if (sessions.length >= 10) badges.push({ ic: <Medal size={24} />, n: "Iniciante", d: "10 sessões" });
  if (sessions.length >= 50) badges.push({ ic: "🥈", n: "Veterano", d: "50 sessões" });
  if (sessions.length >= 100) badges.push({ ic: <Crown size={24} />, n: "Lenda", d: "100 sessões" });

  return (
    <Card className="mt-6">
      <SectionLabel>Conquistas Secretas</SectionLabel>
      <div className="flex gap-4 flex-wrap mt-2">
        {badges.length === 0 ? <EmptyState text="Estude para desbloquear medalhas!" /> : 
         badges.map(b => (
           <div key={b.n} className="flex flex-col items-center p-3 rounded-xl border text-center hover:scale-110 transition-transform" style={{ borderColor: T.border, backgroundColor: T.surfaceAlt, width: 100 }}>
             <span className="text-3xl mb-1">{b.ic}</span>
             <span className="text-xs font-bold" style={{ color: T.ink }}>{b.n}</span>
             <span className="text-[9px]" style={{ color: T.inkSoft }}>{b.d}</span>
           </div>
         ))
        }
      </div>
    </Card>
  );
}

function OmniaWrapped({ sessions }) {
  const [open, setOpen] = useState(false);
  if (!sessions || sessions.length === 0) return null;
  
  const totalMinutos = sessions.reduce((a,s) => a + s.minutos, 0);
  const discMap = {};
  sessions.forEach(s => { discMap[s.disciplina] = (discMap[s.disciplina] || 0) + s.minutos; });
  const topDisc = Object.keys(discMap).sort((a,b) => discMap[b] - discMap[a])[0];

  return (
    <>
      <PrimaryButton onClick={() => setOpen(true)} className="w-full mt-6 py-4 text-lg animate-pulse" style={{ background: 'linear-gradient(45deg, #FF007A, #7928CA)', color: 'white', border: 'none' }}>
        <span className="flex items-center gap-2 justify-center"><Sparkles size={16}/> Ver Meu Omnia Wrapped</span>
      </PrimaryButton>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={() => setOpen(false)}>
          <div className="rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl scale-in-center" style={{ background: 'linear-gradient(135deg, #111, #333)', color: '#fff', border: '2px solid #555' }} onClick={e => e.stopPropagation()}>
            <h2 className="text-4xl font-black mb-6 bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-violet-500">Omnia Wrapped</h2>
            <div className="space-y-6 text-xl">
              <p>Você estudou <br/><span className="text-5xl font-black text-pink-400">{Math.round(totalMinutos/60)}h</span></p>
              <p>Sua disciplina favorita foi <br/><span className="text-3xl font-bold text-violet-400">{topDisc}</span></p>
              <p>Você fez <span className="font-bold text-yellow-400">{sessions.length}</span> sessões!</p>
            </div>
            <button onClick={() => setOpen(false)} className="mt-8 px-6 py-2 rounded-full font-bold bg-white text-black hover:bg-gray-200">Incrível</button>
          </div>
        </div>
      )}
    </>
  );
}


function Arquetipos({ sessions, quizAttempts, professorAttempts }) {
  const [selectedClass, setSelectedClass] = useState(localStorage.getItem('omnia_rpg_class') || null);
  
  const xpSessions = sessions.reduce((a, s) => a + s.minutos * 10, 0);
  const xpQuiz = quizAttempts.reduce((a, q) => a + q.acertos * 50, 0);
  const xpProf = professorAttempts.reduce((a, p) => a + (p.nota || 0) * 100, 0);
  const totalXp = xpSessions + xpQuiz + xpProf;
  const level = Math.floor(totalXp / 1000) + 1;

  const handleSelect = (c) => {
    if (level < 5) return alert("Você precisa atingir o Nível 5 para escolher uma classe!");
    localStorage.setItem('omnia_rpg_class', c);
    setSelectedClass(c);
    // reload to apply bonuses
    window.location.reload();
  };

  const classes = [
    { id: 'coruja', name: <span className="flex items-center gap-2">O Coruja <Bird size={16} /></span>, desc: '+50% XP em sessões à noite (após 19h).' },
    { id: 'maratonista', name: <span className="flex items-center gap-2">O Maratonista <Activity size={16} /></span>, desc: '+50% XP em sessões de Foco de 2h+.' },
    { id: 'estrategista', name: <span className="flex items-center gap-2">O Estrategista <Target size={16} /></span>, desc: '+20% XP em Quizzes e Modo Professor.' }
  ];

  return (
    <Card className="mt-6 p-6" style={{ borderColor: T.brand, background: 'linear-gradient(to right, rgba(0,0,0,0.2), transparent)' }}>
      <SectionLabel>Classes de Estudante (Nível 5+)</SectionLabel>
      <div className="text-sm mb-4" style={{ color: T.inkSoft }}>Ao atingir o Nível 5, você pode escolher um arquétipo que reflete seu estilo de estudo e ganhar bônus de XP passivos.</div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {classes.map(c => {
          const isSelected = selectedClass === c.id;
          const locked = level < 5 && !isSelected;
          return (
            <div key={c.id} onClick={() => handleSelect(c.id)} className="p-4 rounded-xl border cursor-pointer transition-all hover:scale-105" style={{ borderColor: isSelected ? T.importante : T.border, backgroundColor: isSelected ? TINT.importante : T.surfaceAlt, opacity: locked ? 0.5 : 1 }}>
              <div className="font-bold text-lg mb-1" style={{ color: T.ink }}>{c.name}</div>
              <div className="text-xs" style={{ color: T.inkSoft }}>{c.desc}</div>
              {isSelected && <div className="mt-2 text-xs font-bold uppercase" style={{ color: T.importante }}>Classe Ativa</div>}
              {locked && <div className="mt-2 text-[10px] uppercase" style={{ color: T.critico }}>Bloqueado</div>}
            </div>
          )
        })}
      </div>
    </Card>
  );
}

export function DesempenhoTab({ commitments, sessions, quizAttempts, professorAttempts }) {
  const hoje = todayISO();
  const disciplinas = Array.from(new Set([
    ...commitments.map((c) => c.disciplina),
    ...quizAttempts.map((q) => q.disciplina),
    ...professorAttempts.map((p) => p.disciplina),
    ...sessions.map((s) => s.disciplina),
  ])).filter((d) => d && d !== "Livre");

  const stats = disciplinas.map((disc) => {
    const quizzes = quizAttempts.filter((q) => q.disciplina === disc);
    const totalAcertos = quizzes.reduce((a, q) => a + q.acertos, 0);
    const totalQuestoes = quizzes.reduce((a, q) => a + q.total, 0);
    const quizPct = totalQuestoes ? Math.round((totalAcertos / totalQuestoes) * 100) : null;
    const profs = professorAttempts.filter((p) => p.disciplina === disc);
    const notaMedia = profs.length ? Number((profs.reduce((a, p) => a + (p.nota || 0), 0) / profs.length).toFixed(1)) : null;
    const minutos = sessions.filter((s) => s.disciplina === disc).reduce((a, s) => a + s.minutos, 0);
    return { disc, quizPct, notaMedia, minutos, temDados: quizPct !== null || notaMedia !== null };
  });

  const comDados = stats.filter((s) => s.temDados);
  const maisFraca = comDados.length
    ? comDados.reduce((pior, atual) => {
        const scoreAtual = atual.quizPct ?? (atual.notaMedia !== null ? atual.notaMedia * 10 : 100);
        const scorePior = pior.quizPct ?? (pior.notaMedia !== null ? pior.notaMedia * 10 : 100);
        return scoreAtual < scorePior ? atual : pior;
      })
    : null;

  const overloadWindow = commitments.filter((c) => c.prazo && c.prazo >= hoje && c.prazo <= addDays(hoje, 7)).sort((a, b) => a.prazo.localeCompare(b.prazo));
  const interruptionInsight = computeInterruptionInsight(sessions);
  const xpSessions = sessions.reduce((a, s) => a + s.minutos * 10, 0);
  const xpQuiz = quizAttempts.reduce((a, q) => a + q.acertos * 50, 0);
  const xpProf = professorAttempts.reduce((a, p) => a + (p.nota || 0) * 100, 0);
  const totalXp = xpSessions + xpQuiz + xpProf;
  const level = Math.floor(totalXp / 1000) + 1;
  const xpProximoNivel = level * 1000;
  const progressoNivel = ((totalXp % 1000) / 1000) * 100;

  const datasAtividades = Array.from(new Set([
    ...sessions.map(s => s.date && s.date.slice(0,10)),
    ...quizAttempts.map(q => q.date && q.date.slice(0,10)),
    ...professorAttempts.map(p => p.date && p.date.slice(0,10)),
  ])).filter(Boolean).sort().reverse();
  
  let streak = 0;
  let d = new Date();
  for (let i = 0; i < 365; i++) {
    const dIso = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
    if (datasAtividades.includes(dIso)) {
      streak++;
    } else if (i === 0) {
      // today no activity yet, streak not broken
    } else {
      break;
    }
    d.setDate(d.getDate() - 1);
  }

  return (
          <div className="space-y-5">
        <Card>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex-1 w-full">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-bold" style={{ color: T.brand }}><Sparkles size={16} className="inline mr-1 -mt-1"/> Nível {level}</span>
                <span className="text-xs" style={{ color: T.inkSoft }}>{totalXp} / {xpProximoNivel} XP</span>
              </div>
              <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: T.surfaceAlt }}>
                <div className="h-full transition-all" style={{ width: progressoNivel + '%', backgroundColor: T.brand }} />
              </div>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <div className="flex flex-col items-center p-2 px-4 rounded-lg" style={{ backgroundColor: T.surfaceAlt }}>
                <span className="text-[10px] uppercase font-semibold tracking-wider" style={{ color: T.inkSoft }}>Ofensiva</span>
                <div className="flex items-center gap-1 font-bold text-lg" style={{ color: streak > 0 ? T.importante : T.ink }}><Flame size={20} className="inline mr-1 -mt-1"/> {streak} {streak === 1 ? 'dia' : 'dias'}</div>
              </div>
            </div>
          </div>
        </Card>

      {overloadWindow.length >= 2 && (
        <Card style={{ borderColor: T.importante, backgroundColor: TINT.importante }}>
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" style={{ color: T.importante }} />
            <div className="text-sm" style={{ color: T.importante }}>
              <strong>Semana pesada:</strong> {overloadWindow.length} compromissos nos próximos 7 dias —{" "}
              {overloadWindow.map((c) => `${c.disciplina} em ${formatDateBR(c.prazo)}`).join(", ")}. Recomendo começar pelo mais próximo o quanto antes.
            </div>
          </div>
        </Card>
      )}

      {maisFraca && (
        <Card style={{ borderColor: T.critico }}>
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" style={{ color: T.critico }} />
            <div className="text-sm">
              <strong>Ponto de atenção — {maisFraca.disc}:</strong>{" "}
              {maisFraca.minutos > 0 ? `você já estudou ${maisFraca.minutos} min, mas ` : ""}
              seu desempenho ali ainda está{" "}
              {maisFraca.quizPct !== null ? `em ${maisFraca.quizPct}% de acerto nos quizzes` : `com nota média ${maisFraca.notaMedia}/10 no Modo Professor`}.
              Vale revisar o resumo e tentar de novo.
            </div>
          </div>
        </Card>
      )}

      {interruptionInsight && (
        <Card>
          <div className="flex items-start gap-2">
            <Info className="w-4 h-4 mt-0.5 shrink-0" style={{ color: T.brand }} />
            <div className="text-sm" style={{ color: T.inkSoft }}>{interruptionInsight}</div>
          </div>
        </Card>
      )}

      
        {/* GAMIFICATION MODULE */}
        <Arquetipos sessions={sessions} quizAttempts={quizAttempts} professorAttempts={professorAttempts} />
        <OmniaWrapped sessions={sessions} />
        <Badges sessions={sessions} />
        <Heatmap sessions={sessions} />
        
        <div>
          <SectionLabel>Desempenho por disciplina</SectionLabel>
        {stats.length === 0 ? (
          <EmptyState text="Ainda não há dados suficientes. Faça um quiz ou use o Modo Professor na Biblioteca." />
        ) : (
          <div className="grid gap-2">
            {stats.map((s) => (
              <Card key={s.disc} className="flex items-center justify-between">
                <div className="text-sm font-medium">{s.disc}</div>
                <div className="flex items-center gap-3 text-xs" style={{ color: T.inkSoft }}>
                  <span>{s.minutos} min</span>
                  {s.quizPct !== null && <span>Quiz: {s.quizPct}%</span>}
                  {s.notaMedia !== null && <span>Professor: {s.notaMedia}/10</span>}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/* Aba: Biblioteca                                                          */
/* ---------------------------------------------------------------------- */
function MaterialsList({ materiaisDisc, onDeleteMaterial }) {
  const [urls, setUrls] = useState({});

  async function handleOpen(m) {
    if (urls[m.id]) {
      window.open(urls[m.id], "_blank");
      return;
    }
    try {
      const url = await getMaterialSignedUrl(m.storagePath);
      setUrls((prev) => ({ ...prev, [m.id]: url }));
      window.open(url, "_blank");
    } catch {
      // silencioso — o link só não abre
    }
  }

  if (materiaisDisc.length === 0) return null;

  return (
    <div className="space-y-1.5 mb-2">
      {materiaisDisc.map((m) => {
        const meta = TIPO_ARQUIVO_META[m.tipoArquivo] || TIPO_ARQUIVO_META.pdf;
        const Icon = meta.icon;
        return (
          <div
            key={m.id}
            className="w-full flex items-center gap-2 text-xs rounded-md p-2"
            style={{ backgroundColor: T.surfaceAlt, border: `1px solid ${T.border}`, color: T.inkSoft }}
          >
            <Icon className="w-3.5 h-3.5 shrink-0" />
            <button onClick={() => handleOpen(m)} className="flex-1 truncate text-left">{m.nomeArquivo}</button>
            <span className="text-[10px] font-mono uppercase" style={{ color: T.inkSoft }}>{meta.label}</span>
            <button onClick={() => handleOpen(m)} title="Abrir"><Download className="w-3.5 h-3.5 shrink-0" /></button>
            {onDeleteMaterial && (
              <button onClick={() => onDeleteMaterial(m)} title="Excluir"><Trash2 className="w-3.5 h-3.5 shrink-0" /></button>
            )}
          </div>
        );
      })}
    </div>
  );
}

const TIPOS_QUIZ = [
  { tipo: "multipla", label: "Múltipla escolha" },
  { tipo: "vf", label: "Verdadeiro/Falso" },
  { tipo: "discursiva", label: "Discursiva" },
  { tipo: "flashcard", label: "Flashcard" },
];

function QuizPanel({ disciplina, sourceTexts, userId, commitmentId, setQuizAttempts, onClose }) {
  const [tipoQuiz, setTipoQuiz] = useState("multipla");
  const [loading, setLoading] = useState(false);
  const [quiz, setQuiz] = useState(null);

  async function gerar() {
    setLoading(true);
    setQuiz(null);
    try {
      const questions = await aiGenerateQuiz(disciplina, sourceTexts, tipoQuiz);
      if (questions.length === 0) { setQuiz({ tipo: tipoQuiz, questions: [], error: true, erroMsg: "A IA não devolveu nenhuma questão." }); return; }
      if (tipoQuiz === "multipla" || tipoQuiz === "vf") {
        setQuiz({ tipo: tipoQuiz, questions, answers: questions.map(() => null), submitted: false, score: 0 });
      } else if (tipoQuiz === "discursiva") {
        setQuiz({ tipo: tipoQuiz, questions, revelado: questions.map(() => false) });
      } else {
        setQuiz({ tipo: tipoQuiz, questions, indice: 0, flipped: false, sabia: 0, naoSabia: 0, concluido: false });
      }
    } catch (e) {
      setQuiz({ tipo: tipoQuiz, questions: [], error: true, erroMsg: e.message || String(e) });
    } finally {
      setLoading(false);
    }
  }

  function selecionar(qIdx, valor) {
    if (quiz.submitted) return;
    setQuiz((prev) => ({ ...prev, answers: prev.answers.map((a, i) => (i === qIdx ? valor : a)) }));
  }

  async function corrigir() {
    const acertos = quiz.questions.reduce((acc, q, i) => {
      const certo = quiz.tipo === "vf" ? quiz.answers[i] === q.correta : quiz.answers[i] === q.respostaCorreta;
      return acc + (certo ? 1 : 0);
    }, 0);
    setQuiz((prev) => ({ ...prev, submitted: true, score: acertos }));
    const saved = await addQuizAttempt(userId, { disciplina, commitmentId: commitmentId || null, date: todayISO(), acertos, total: quiz.questions.length });
    setQuizAttempts((prev) => [saved, ...prev]);
  }

  function revelar(qIdx) {
    setQuiz((prev) => ({ ...prev, revelado: prev.revelado.map((r, i) => (i === qIdx ? true : r)) }));
  }

  function flip() { setQuiz((prev) => ({ ...prev, flipped: !prev.flipped })); }
  function proximoFlashcard(sabia) {
    setQuiz((prev) => {
      const sabiaNovo = prev.sabia + (sabia ? 1 : 0);
      const naoSabiaNovo = prev.naoSabia + (sabia ? 0 : 1);
      if (prev.indice + 1 < prev.questions.length) {
        return { ...prev, flipped: false, sabia: sabiaNovo, naoSabia: naoSabiaNovo, indice: prev.indice + 1 };
      }
      return { ...prev, flipped: false, sabia: sabiaNovo, naoSabia: naoSabiaNovo, concluido: true };
    });
  }
  async function salvarFlashcardResultado() {
    const saved = await addQuizAttempt(userId, { disciplina, commitmentId: commitmentId || null, date: todayISO(), acertos: quiz.sabia, total: quiz.questions.length });
    setQuizAttempts((prev) => [saved, ...prev]);
    setQuiz((prev) => ({ ...prev, salvo: true }));
  }

  return (
    <Card style={{ borderColor: T.brand }}>
      <div className="flex flex-wrap gap-1.5 mb-3">
        {TIPOS_QUIZ.map((t) => (
          <button
            key={t.tipo}
            onClick={() => { setTipoQuiz(t.tipo); setQuiz(null); }}
            className="text-xs px-2 py-1 rounded-md"
            style={{ backgroundColor: tipoQuiz === t.tipo ? T.brand : T.surfaceAlt, color: tipoQuiz === t.tipo ? T.brandInk : T.inkSoft, border: `1px solid ${T.border}` }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {!quiz && !loading && (
        <PrimaryButton onClick={gerar}><Sparkles className="w-4 h-4" /> Gerar</PrimaryButton>
      )}
      {loading && <div className="flex items-center gap-2 text-sm" style={{ color: T.inkSoft }}><Loader2 className="w-4 h-4 animate-spin" /> Gerando...</div>}
      {quiz && !loading && quiz.error && <div className="text-sm" style={{ color: T.critico }}>Não consegui gerar agora: {quiz.erroMsg || "tente de novo."}</div>}

      {quiz && !loading && !quiz.error && (quiz.tipo === "multipla" || quiz.tipo === "vf") && (
        <div className="space-y-4">
          {quiz.questions.map((q, qi) => (
            <div key={qi}>
              <div className="text-sm font-medium mb-1.5">{qi + 1}. {quiz.tipo === "vf" ? q.afirmacao : q.pergunta}</div>
              <div className="space-y-1">
                {(quiz.tipo === "vf" ? ["Verdadeiro", "Falso"] : q.opcoes).map((op, oi) => {
                  const valor = quiz.tipo === "vf" ? oi === 0 : oi;
                  const selected = quiz.answers[qi] === valor;
                  const isCorrect = quiz.tipo === "vf" ? valor === q.correta : oi === q.respostaCorreta;
                  let bg = T.surfaceAlt, border = T.border;
                  if (quiz.submitted) {
                    if (isCorrect) { bg = TINT.brand; border = T.normal; }
                    else if (selected && !isCorrect) { bg = TINT.critico; border = T.critico; }
                  } else if (selected) { border = T.brand; }
                  return (
                    <button key={oi} onClick={() => selecionar(qi, valor)} disabled={quiz.submitted} className="w-full text-left text-sm rounded-md p-2" style={{ backgroundColor: bg, border: `1px solid ${border}` }}>
                      {op}
                    </button>
                  );
                })}
              </div>
              {quiz.submitted && <div className="text-xs mt-1" style={{ color: T.inkSoft }}>{q.explicacao}</div>}
            </div>
          ))}
          {!quiz.submitted ? (
            <PrimaryButton onClick={corrigir} disabled={quiz.answers.includes(null)}>Corrigir</PrimaryButton>
          ) : (
            <div className="text-sm font-semibold" style={{ color: T.brand }}>Você acertou {quiz.score} de {quiz.questions.length}.</div>
          )}
        </div>
      )}

      {quiz && !loading && !quiz.error && quiz.tipo === "discursiva" && (
        <div className="space-y-4">
          {quiz.questions.map((q, qi) => (
            <div key={qi}>
              <div className="text-sm font-medium mb-1.5">{qi + 1}. {q.pergunta}</div>
              {quiz.revelado[qi] ? (
                <div className="text-sm rounded-md p-2" style={{ backgroundColor: T.surfaceAlt, color: T.inkSoft }}>{q.respostaModelo}</div>
              ) : (
                <GhostButton onClick={() => revelar(qi)}>Ver resposta modelo</GhostButton>
              )}
            </div>
          ))}
        </div>
      )}

      {quiz && !loading && !quiz.error && quiz.tipo === "flashcard" && (
        <div>
          {!quiz.concluido ? (
            <>
              <div className="text-xs mb-2" style={{ color: T.inkSoft }}>{quiz.indice + 1} de {quiz.questions.length}</div>
              <button onClick={flip} className="w-full rounded-lg p-6 text-center text-sm mb-3" style={{ backgroundColor: T.surfaceAlt, border: `1px solid ${T.border}`, minHeight: 100 }}>
                {quiz.flipped ? quiz.questions[quiz.indice].verso : quiz.questions[quiz.indice].frente}
              </button>
              {quiz.flipped ? (
                <div className="flex gap-2">
                  <GhostButton onClick={() => proximoFlashcard(false)}>Não sabia</GhostButton>
                  <PrimaryButton onClick={() => proximoFlashcard(true)}>Sabia</PrimaryButton>
                </div>
              ) : (
                <div className="text-xs text-center" style={{ color: T.inkSoft }}>Toque no cartão pra virar</div>
              )}
            </>
          ) : (
            <div className="text-sm">
              <div className="font-semibold mb-2" style={{ color: T.brand }}>Você sabia {quiz.sabia} de {quiz.questions.length}.</div>
              {!quiz.salvo && <GhostButton onClick={salvarFlashcardResultado}><Check className="w-4 h-4" /> Salvar resultado</GhostButton>}
            </div>
          )}
        </div>
      )}

      <div className="flex gap-2 mt-3">
        {quiz && <GhostButton onClick={() => setQuiz(null)}>Gerar de novo</GhostButton>}
        <GhostButton onClick={onClose}>Fechar</GhostButton>
      </div>
    </Card>
  );
}

function DisciplinaCard({ userId, disc, notasDisc, compromissosDisc, materiaisDisc, onDeleteNote, onDeleteMaterial, onOpenCommitment, summaries, setSummaries, setQuizAttempts, setProfessorAttempts }) {
  const [panel, setPanel] = useState(null);
  const [resumoLoading, setResumoLoading] = useState(false);
  const [resumoDraft, setResumoDraft] = useState("");
  const [salvandoResumo, setSalvandoResumo] = useState(false);
  const [resumoSalvo, setResumoSalvo] = useState(false);
  const [erroSalvarResumo, setErroSalvarResumo] = useState(null);
  const [profLoading, setProfLoading] = useState(false);
  const [profAnswer, setProfAnswer] = useState("");
  const [syllabusLoading, setSyllabusLoading] = useState(false);
  const [syllabusCount, setSyllabusCount] = useState(null);
  const [profResult, setProfResult] = useState(null);

  const existingSummary = summaries.find((s) => s.disciplina === disc && !s.commitmentId);
  const sourceTexts = [...notasDisc.map((n) => n.texto), ...materiaisDisc.map((m) => m.textoExtraido).filter(Boolean)].join("\n---\n");
  const inputStyle = { backgroundColor: T.surfaceAlt, border: `1px solid ${T.border}`, color: T.ink };

  
  async function handleSyllabus(disc, textos) {
    setSyllabusLoading(true);
    setSyllabusCount(null);
    try {
      const items = await aiParseSyllabus(disc, textos);
      if (items && items.length > 0) {
        for (const item of items) {
          const c = await addCommitment(userId, {
            tipo: item.tipo,
            disciplina: disc,
            assunto: item.assunto,
            prazo: item.prazo,
            concluido: false
          });
          if (setCommitments) setCommitments(prev => [...prev, c]);
        }
        setSyllabusCount(items.length);
        setTimeout(() => setSyllabusCount(null), 5000);
      } else {
        alert("A IA não encontrou nenhuma data importante neste arquivo.");
      }
    } catch(e) {
      alert(e.message);
    } finally {
      setSyllabusLoading(false);
    }
  }

  async function openResumo() {
    setPanel("resumo");
    setResumoSalvo(false);
    setErroSalvarResumo(null);
    if (existingSummary) { setResumoDraft(existingSummary.texto); return; }
    setResumoLoading(true);
    try {
      const texto = await aiGenerateSummary(disc, sourceTexts);
      setResumoDraft(texto);
    } catch (e) {
      setResumoDraft("Não foi possível gerar o resumo agora: " + (e.message || String(e)));
    } finally {
      setResumoLoading(false);
    }
  }
  async function saveResumo() {
    setSalvandoResumo(true);
    setErroSalvarResumo(null);
    setResumoSalvo(false);
    try {
      const saved = await upsertSummary(userId, { disciplina: disc, commitmentId: null, texto: resumoDraft });
      setSummaries((prev) => {
        const exists = prev.some((s) => s.disciplina === disc && !s.commitmentId);
        return exists ? prev.map((s) => (s.disciplina === disc && !s.commitmentId ? saved : s)) : [...prev, saved];
      });
      setResumoSalvo(true);
    } catch (e) {
      setErroSalvarResumo(e.message || String(e));
    } finally {
      setSalvandoResumo(false);
    }
  }

  function openProfessor() { setPanel("professor"); setProfResult(null); setProfAnswer(""); }
  async function submitProfessor() {
    if (!profAnswer.trim()) return;
    setProfLoading(true);
    try {
      const result = await aiEvaluateProfessor(disc, sourceTexts, profAnswer);
      setProfResult(result);
      const saved = await addProfessorAttempt(userId, { disciplina: disc, nota: result.nota, date: todayISO() });
      setProfessorAttempts((prev) => [saved, ...prev]);
    } catch (e) {
      setProfResult({ nota: null, pontosCorretos: [], faltando: [], feedback: "Não consegui avaliar agora: " + (e.message || String(e)) });
    } finally {
      setProfLoading(false);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-2 flex-wrap gap-y-1">
        <SectionLabel>{disc} · {notasDisc.length + compromissosDisc.length} item(ns)</SectionLabel>
        <div className="flex gap-1">
          <button onClick={openResumo} className="text-xs px-2 py-1 rounded" style={{ color: T.brand, border: `1px solid ${T.border}` }}>Resumo</button>
          <button onClick={() => setPanel("quiz")} className="text-xs px-2 py-1 rounded" style={{ color: T.brand, border: `1px solid ${T.border}` }}>Quiz</button>
          <button onClick={openProfessor} className="text-xs px-2 py-1 rounded" style={{ color: T.brand, border: `1px solid ${T.border}` }}>Modo Professor</button>
            <button onClick={() => handleSyllabus(disc, sourceTexts)} disabled={syllabusLoading} className="text-xs px-2 py-1 rounded flex items-center gap-1 transition-transform hover:scale-105" style={{ color: "#ffffff", backgroundColor: T.brand, border: `1px solid ${T.brand}` }}>{syllabusLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />} Analisar Syllabus</button>
        </div>
      </div>

      <MaterialsList materiaisDisc={materiaisDisc} onDeleteMaterial={onDeleteMaterial} />

      <div className="space-y-2 mb-2">
        {compromissosDisc.map((c) => (
          <button key={c.id} onClick={() => onOpenCommitment(c)} className="w-full text-left rounded-lg outline-none focus:outline-none overflow-hidden bg-transparent">
            <Card className="py-2.5 flex items-center justify-between">
              <div className="text-sm">{c.assunto}</div>
              <TypeTag tipo={c.tipo} />
            </Card>
          </button>
        ))}
        {notasDisc.map((n) => (
          <Card key={n.id} className="py-2.5 flex items-start justify-between gap-2">
            <div className="text-sm" style={{ color: T.inkSoft }}>{n.texto}</div>
            <button onClick={() => onDeleteNote(n.id)} style={{ color: T.inkSoft }} className="shrink-0"><Trash2 className="w-3.5 h-3.5" /></button>
          </Card>
        ))}
      </div>

      {panel === "resumo" && (
        <Card style={{ borderColor: T.brand }} className="mb-3">
          {resumoLoading ? (
            <div className="flex items-center gap-2 text-sm" style={{ color: T.inkSoft }}><Loader2 className="w-4 h-4 animate-spin" /> Gerando resumo...</div>
          ) : (
            <>
              <textarea value={resumoDraft} onChange={(e) => { setResumoDraft(e.target.value); setResumoSalvo(false); }} rows={8} className="w-full rounded-md p-3 text-sm" style={inputStyle} />
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                <PrimaryButton onClick={() => saveResumo(false)} disabled={salvandoResumo}>
                  {salvandoResumo ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />} Salvar
                </PrimaryButton>
                <GhostButton onClick={() => setPanel(null)}>Fechar</GhostButton>
                  <button onClick={() => saveResumo(true)} disabled={salvandoResumo} className="text-xs px-2 py-1 rounded transition-transform hover:scale-105" style={{ color: T.brand, border: `1px solid ${T.brand}` }}>⏳ Salvar e Agendar Revisões (1, 3, 7 d)</button>
                  <button onClick={() => saveResumo(true)} disabled={salvandoResumo} className="text-xs px-2 py-1 rounded transition-transform hover:scale-105" style={{ color: T.brand, border: `1px solid ${T.brand}` }}>⏳ Salvar e Agendar Revisões (1, 3, 7 d)</button>
                {resumoSalvo && <span className="text-xs" style={{ color: T.brand }}>Salvo âœ“</span>}
                {erroSalvarResumo && <span className="text-xs" style={{ color: T.critico }}>Erro: {erroSalvarResumo}</span>}
              </div>
            </>
          )}
        </Card>
      )}

      {panel === "quiz" && (
        <QuizPanel disciplina={disc} sourceTexts={sourceTexts} userId={userId} commitmentId={null} setQuizAttempts={setQuizAttempts} onClose={() => setPanel(null)} />
      )}

      {panel === "professor" && (
        <Card style={{ borderColor: T.brand }} className="mb-3">
          {!profResult ? (
            <>
              <p className="text-sm mb-2" style={{ color: T.inkSoft }}>Explique com suas próprias palavras o que você entendeu sobre {disc}.</p>
              <textarea value={profAnswer} onChange={(e) => setProfAnswer(e.target.value)} rows={5} className="w-full rounded-md p-3 text-sm" style={inputStyle} placeholder="Escreva sua explicação..." />
              <div className="flex gap-2 mt-2">
                <PrimaryButton onClick={submitProfessor} disabled={profLoading || !profAnswer.trim()}>
                  {profLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <GraduationCap className="w-4 h-4" />} Avaliar
                </PrimaryButton>
                <GhostButton onClick={() => setPanel(null)}>Fechar</GhostButton>
              </div>
            </>
          ) : (
            <div className="space-y-2">
              <div className="text-2xl font-mono font-semibold" style={{ color: T.brand }}>{profResult.nota ?? "—"}/10</div>
              <p className="text-sm">{profResult.feedback}</p>
              {profResult.pontosCorretos && profResult.pontosCorretos.length > 0 && (
                <div>
                  <div className="text-xs font-mono uppercase tracking-wide" style={{ color: T.normal }}>Você acertou</div>
                  <ul className="text-sm list-disc list-inside">{profResult.pontosCorretos.map((p, i) => <li key={i}>{p}</li>)}</ul>
                </div>
              )}
              {profResult.faltando && profResult.faltando.length > 0 && (
                <div>
                  <div className="text-xs font-mono uppercase tracking-wide" style={{ color: T.importante }}>Faltou mencionar</div>
                  <ul className="text-sm list-disc list-inside">{profResult.faltando.map((p, i) => <li key={i}>{p}</li>)}</ul>
                </div>
              )}
              <div className="flex gap-2 pt-1">
                <GhostButton onClick={() => { setProfResult(null); setProfAnswer(""); }}>Tentar novamente</GhostButton>
                <GhostButton onClick={() => setPanel(null)}>Fechar</GhostButton>
              </div>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/* Modal: Espaço de Trabalho do Compromisso                                */
/* ---------------------------------------------------------------------- */
function CompromissoWorkspaceContent({
  userId, commitment, notes, materials, summaries, quizAttempts, professorAttempts,
  setNotes, setMaterials, setSummaries, setQuizAttempts, setProfessorAttempts,
}) {
  const [newNote, setNewNote] = useState("");
  const [addingNote, setAddingNote] = useState(false);

  const [panel, setPanel] = useState(null);
  const [resumoLoading, setResumoLoading] = useState(false);
  const [resumoDraft, setResumoDraft] = useState("");
  const [salvandoResumo, setSalvandoResumo] = useState(false);
  const [resumoSalvo, setResumoSalvo] = useState(false);
  const [erroSalvarResumo, setErroSalvarResumo] = useState(null);
  const [profLoading, setProfLoading] = useState(false);
  const [profAnswer, setProfAnswer] = useState("");
  const [profResult, setProfResult] = useState(null);

  const [extracting, setExtracting] = useState(null);
  const [fileError, setFileError] = useState(null);
  const pdfInputRef = useRef(null);
  const imgInputRef = useRef(null);
  const audioInputRef = useRef(null);

  const notasC = notes.filter((n) => n.commitmentId === commitment.id);
  const materiaisC = materials.filter((m) => m.commitmentId === commitment.id);
  const existingSummary = summaries.find((s) => s.commitmentId === commitment.id);
  const quizzesC = quizAttempts.filter((q) => q.commitmentId === commitment.id);
  const profAttemptsC = professorAttempts.filter((p) => p.commitmentId === commitment.id);
  const sourceTexts = [...notasC.map((n) => n.texto), ...materiaisC.map((m) => m.textoExtraido).filter(Boolean)].join("\n---\n");
  const inputStyle = { backgroundColor: T.surfaceAlt, border: `1px solid ${T.border}`, color: T.ink };

  async function handleAddNote() {
    if (!newNote.trim() || addingNote) return;
    setAddingNote(true);
    try {
      const saved = await addNote(userId, { disciplina: commitment.disciplina, texto: newNote, commitmentId: commitment.id });
      setNotes((prev) => [saved, ...prev]);
      setNewNote("");
    } finally {
      setAddingNote(false);
    }
  }
  async function handleDeleteNote(id) {
    await deleteNote(id);
    setNotes((prev) => prev.filter((n) => n.id !== id));
  }

  function checkSize(file) {
    if (file.size > MAX_FILE_MB * 1024 * 1024) {
      setFileError(`Esse arquivo passa de ${MAX_FILE_MB}MB. Tente um arquivo menor.`);
      return false;
    }
    return true;
  }
  async function handleFilePicked(e, tipoArquivo) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || !checkSize(file)) return;
    setFileError(null);
    setExtracting(tipoArquivo);
    try {
      let extracted = "";
      if (tipoArquivo === "pdf") {
        const { extractPdfText } = await import("../lib/pdf");
        extracted = await extractPdfText(file);
        if (!extracted.trim()) throw new Error("Não achei texto nesse PDF (tente enviar como Foto se for escaneado).");
      } else if (tipoArquivo === "imagem") {
        const { base64, mimeType } = await fileToBase64(file);
        extracted = await callVision(base64, mimeType);
      } else if (tipoArquivo === "audio") {
        const { base64, mimeType } = await fileToBase64(file);
        extracted = await callAudioTranscription(base64, mimeType);
      }
      const path = await uploadMaterialFile(userId, file);
      const saved = await addMaterial(userId, {
        disciplina: commitment.disciplina, commitmentId: commitment.id,
        tipoArquivo, nomeArquivo: file.name, storagePath: path, textoExtraido: extracted,
      });
      setMaterials((prev) => [saved, ...prev]);
    } catch (err) {
      setFileError(err.message || "Não consegui processar esse arquivo.");
    } finally {
      setExtracting(null);
    }
  }
  async function handleOpenMaterial(m) {
    try {
      const url = await getMaterialSignedUrl(m.storagePath);
      window.open(url, "_blank");
    } catch {
      // link não abriu, sem problema
    }
  }
  async function handleDeleteMaterial(m) {
    await deleteMaterial(m.id, m.storagePath);
    setMaterials((prev) => prev.filter((x) => x.id !== m.id));
  }

  async function openResumo() {
    setPanel("resumo");
    setResumoSalvo(false);
    setErroSalvarResumo(null);
    if (existingSummary) { setResumoDraft(existingSummary.texto); return; }
    setResumoLoading(true);
    try {
      const texto = await aiGenerateSummary(commitment.disciplina, sourceTexts);
      setResumoDraft(texto);
    } catch (e) {
      setResumoDraft("Não foi possível gerar o resumo agora: " + (e.message || String(e)));
    } finally {
      setResumoLoading(false);
    }
  }
  async function saveResumo() {
    setSalvandoResumo(true);
    setErroSalvarResumo(null);
    setResumoSalvo(false);
    try {
      const saved = await upsertSummary(userId, { disciplina: commitment.disciplina, commitmentId: commitment.id, texto: resumoDraft });
      setSummaries((prev) => {
        const exists = prev.some((s) => s.commitmentId === commitment.id);
        return exists ? prev.map((s) => (s.commitmentId === commitment.id ? saved : s)) : [...prev, saved];
      });
      setResumoSalvo(true);
    } catch (e) {
      setErroSalvarResumo(e.message || String(e));
    } finally {
      setSalvandoResumo(false);
    }
  }

  function openProfessor() { setPanel("professor"); setProfResult(null); setProfAnswer(""); }
  async function submitProfessor() {
    if (!profAnswer.trim()) return;
    setProfLoading(true);
    try {
      const result = await aiEvaluateProfessor(commitment.disciplina, sourceTexts, profAnswer);
      setProfResult(result);
      const saved = await addProfessorAttempt(userId, { disciplina: commitment.disciplina, commitmentId: commitment.id, nota: result.nota, date: todayISO() });
      setProfessorAttempts((prev) => [saved, ...prev]);
    } catch (e) {
      setProfResult({ nota: null, pontosCorretos: [], faltando: [], feedback: "Não consegui avaliar agora: " + (e.message || String(e)) });
    } finally {
      setProfLoading(false);
    }
  }

  const extractingLabel = { pdf: "Lendo o PDF...", imagem: "Analisando a imagem...", audio: "Transcrevendo o áudio..." };

  return (
    <>
      {/* Anotações */}
      <div className="mb-4">
        <SectionLabel>Anotações</SectionLabel>
        <div className="flex gap-2 mb-2">
          <input
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAddNote()}
            placeholder="Ex: essa pergunta não vai mais cair..."
            className="flex-1 rounded-md p-2 text-sm"
            style={inputStyle}
          />
          <GhostButton onClick={handleAddNote}>{addingNote ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}</GhostButton>
        </div>
        {notasC.length === 0 ? (
          <div className="text-xs" style={{ color: T.inkSoft }}>Nenhuma anotação ainda.</div>
        ) : (
          <div className="space-y-1.5">
            {notasC.map((n) => (
              <div key={n.id} className="flex items-start justify-between gap-2 text-sm rounded-md p-2" style={{ backgroundColor: T.surfaceAlt, border: `1px solid ${T.border}` }}>
                <span style={{ color: T.inkSoft }}>{n.texto}</span>
                <button onClick={() => handleDeleteNote(n.id)} style={{ color: T.inkSoft }} className="shrink-0"><Trash2 className="w-3.5 h-3.5" /></button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Materiais */}
      <div className="mb-4">
        <SectionLabel>Materiais</SectionLabel>
        <div className="flex flex-wrap items-center gap-2 mb-2">
          <button onClick={() => pdfInputRef.current?.click()} disabled={!!extracting} className="flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-md disabled:opacity-50" style={{ color: T.inkSoft, border: `1px solid ${T.border}` }}>
            <FileText className="w-3.5 h-3.5" /> PDF
          </button>
          <button onClick={() => imgInputRef.current?.click()} disabled={!!extracting} className="flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-md disabled:opacity-50" style={{ color: T.inkSoft, border: `1px solid ${T.border}` }}>
            <ImageIcon className="w-3.5 h-3.5" /> Foto
          </button>
          <button onClick={() => audioInputRef.current?.click()} disabled={!!extracting} className="flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-md disabled:opacity-50" style={{ color: T.inkSoft, border: `1px solid ${T.border}` }}>
            <Mic className="w-3.5 h-3.5" /> Áudio
          </button>
          <input ref={pdfInputRef} type="file" accept="application/pdf" className="hidden" onChange={(e) => handleFilePicked(e, "pdf")} />
          <input ref={imgInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleFilePicked(e, "imagem")} />
          <input ref={audioInputRef} type="file" accept="audio/*" className="hidden" onChange={(e) => handleFilePicked(e, "audio")} />
        </div>
        {extracting && (
          <div className="flex items-center gap-2 text-xs mb-2" style={{ color: T.brand }}>
            <Loader2 className="w-3.5 h-3.5 animate-spin" /> {extractingLabel[extracting]}
          </div>
        )}
        {fileError && <div className="text-xs mb-2" style={{ color: T.critico }}>{fileError}</div>}
        {materiaisC.length === 0 ? (
          <div className="text-xs" style={{ color: T.inkSoft }}>Nenhum material enviado ainda.</div>
        ) : (
          <div className="space-y-1.5">
            {materiaisC.map((m) => {
              const meta = TIPO_ARQUIVO_META[m.tipoArquivo] || TIPO_ARQUIVO_META.pdf;
              const Icon = meta.icon;
              return (
                <div key={m.id} className="flex items-center gap-2 text-xs rounded-md p-2" style={{ backgroundColor: T.surfaceAlt, border: `1px solid ${T.border}` }}>
                  <Icon className="w-3.5 h-3.5 shrink-0" style={{ color: T.inkSoft }} />
                  <button onClick={() => handleOpenMaterial(m)} className="flex-1 truncate text-left" style={{ color: T.ink }}>{m.nomeArquivo}</button>
                  <button onClick={() => handleDeleteMaterial(m)} style={{ color: T.inkSoft }} className="shrink-0"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Ações de IA */}
      <div>
        <SectionLabel>Estudar este compromisso</SectionLabel>
        <div className="flex flex-wrap gap-2 mb-3">
          <button onClick={openResumo} className="text-xs px-2.5 py-1.5 rounded-md" style={{ color: T.brand, border: `1px solid ${T.border}` }}>Resumo</button>
          <button onClick={() => setPanel("quiz")} className="text-xs px-2.5 py-1.5 rounded-md" style={{ color: T.brand, border: `1px solid ${T.border}` }}>
            Quiz {quizzesC.length > 0 && `(${quizzesC[0].acertos}/${quizzesC[0].total} na última)`}
          </button>
          <button onClick={openProfessor} className="text-xs px-2.5 py-1.5 rounded-md" style={{ color: T.brand, border: `1px solid ${T.border}` }}>
            Modo Professor {profAttemptsC.length > 0 && `(${profAttemptsC[0].nota}/10 na última)`}
          </button>
        </div>

        {panel === "resumo" && (
          <Card style={{ borderColor: T.brand }}>
            {resumoLoading ? (
              <div className="flex items-center gap-2 text-sm" style={{ color: T.inkSoft }}><Loader2 className="w-4 h-4 animate-spin" /> Gerando resumo...</div>
            ) : (
              <>
                <textarea value={resumoDraft} onChange={(e) => { setResumoDraft(e.target.value); setResumoSalvo(false); }} rows={7} className="w-full rounded-md p-3 text-sm" style={inputStyle} />
                <div className="flex items-center gap-2 mt-2 flex-wrap">
                  <PrimaryButton onClick={() => saveResumo(false)} disabled={salvandoResumo}>
                    {salvandoResumo ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />} Salvar
                  </PrimaryButton>
                  <GhostButton onClick={() => setPanel(null)}>Fechar</GhostButton>
                  {resumoSalvo && <span className="text-xs" style={{ color: T.brand }}>Salvo âœ“</span>}
                  {erroSalvarResumo && <span className="text-xs" style={{ color: T.critico }}>Erro: {erroSalvarResumo}</span>}
                </div>
              </>
            )}
          </Card>
        )}

        {panel === "quiz" && (
          <QuizPanel disciplina={commitment.disciplina} sourceTexts={sourceTexts} userId={userId} commitmentId={commitment.id} setQuizAttempts={setQuizAttempts} onClose={() => setPanel(null)} />
        )}

        {panel === "professor" && (
          <Card style={{ borderColor: T.brand }}>
            {!profResult ? (
              <>
                <p className="text-sm mb-2" style={{ color: T.inkSoft }}>Explique com suas próprias palavras o que você entendeu sobre {commitment.assunto}.</p>
                <textarea value={profAnswer} onChange={(e) => setProfAnswer(e.target.value)} rows={5} className="w-full rounded-md p-3 text-sm" style={inputStyle} placeholder="Escreva sua explicação..." />
                <div className="flex gap-2 mt-2">
                  <PrimaryButton onClick={submitProfessor} disabled={profLoading || !profAnswer.trim()}>
                    {profLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <GraduationCap className="w-4 h-4" />} Avaliar
                  </PrimaryButton>
                  <GhostButton onClick={() => setPanel(null)}>Fechar</GhostButton>
                </div>
              </>
            ) : (
              <div className="space-y-2">
                <div className="text-2xl font-mono font-semibold" style={{ color: T.brand }}>{profResult.nota ?? "—"}/10</div>
                <p className="text-sm">{profResult.feedback}</p>
                {profResult.pontosCorretos && profResult.pontosCorretos.length > 0 && (
                  <div>
                    <div className="text-xs font-mono uppercase tracking-wide" style={{ color: T.normal }}>Você acertou</div>
                    <ul className="text-sm list-disc list-inside">{profResult.pontosCorretos.map((p, i) => <li key={i}>{p}</li>)}</ul>
                  </div>
                )}
                {profResult.faltando && profResult.faltando.length > 0 && (
                  <div>
                    <div className="text-xs font-mono uppercase tracking-wide" style={{ color: T.importante }}>Faltou mencionar</div>
                    <ul className="text-sm list-disc list-inside">{profResult.faltando.map((p, i) => <li key={i}>{p}</li>)}</ul>
                  </div>
                )}
                <div className="flex gap-2 pt-1">
                  <GhostButton onClick={() => { setProfResult(null); setProfAnswer(""); }}>Tentar novamente</GhostButton>
                  <GhostButton onClick={() => setPanel(null)}>Fechar</GhostButton>
                </div>
              </div>
            )}
          </Card>
        )}
      </div>
    </>
  );
}

function CompromissoWorkspaceModal({
  userId, commitment, notes, materials, summaries, quizAttempts, professorAttempts,
  setNotes, setMaterials, setSummaries, setQuizAttempts, setProfessorAttempts, onClose,
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center" style={{ backgroundColor: "rgba(13,25,23,0.65)" }} onClick={onClose}>
      <div
        className="w-full sm:max-w-lg max-h-[90vh] overflow-y-auto rounded-t-xl sm:rounded-xl p-4"
        style={{ backgroundColor: T.surface }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between mb-3">
          <div className="min-w-0">
            <div className="text-xs font-mono uppercase tracking-widest mb-1" style={{ color: T.inkSoft }}>{commitment.disciplina}</div>
            <h2 className="text-lg font-semibold truncate" style={{ color: T.ink }}>{commitment.assunto}</h2>
            <div className="flex items-center gap-3 mt-1">
              <TypeTag tipo={commitment.tipo} />
              <PriorityDot prioridade={commitment.prioridade} />
              {commitment.prazo && <span className="text-xs font-mono" style={{ color: T.inkSoft }}>{formatDateBR(commitment.prazo)}</span>}
            </div>
          </div>
          <button onClick={onClose} style={{ color: T.inkSoft }} className="shrink-0"><X className="w-5 h-5" /></button>
        </div>

        <CompromissoWorkspaceContent
          userId={userId} commitment={commitment} notes={notes} materials={materials}
          summaries={summaries} quizAttempts={quizAttempts} professorAttempts={professorAttempts}
          setNotes={setNotes} setMaterials={setMaterials} setSummaries={setSummaries}
          setQuizAttempts={setQuizAttempts} setProfessorAttempts={setProfessorAttempts}
        />
      </div>
    </div>
  );
}

function ExportarBiblioteca({ userId, commitments, notes, materials, summaries, disciplinas, semestres }) {
  const [escopo, setEscopo] = useState("tudo");
  const [valor, setValor] = useState("");
  const [exporting, setExporting] = useState(false);
  const [progresso, setProgresso] = useState("");
  const [erro, setErro] = useState(null);
  const inputStyle = { backgroundColor: T.surfaceAlt, border: `1px solid ${T.border}`, color: T.ink };

  async function exportar() {
    if ((escopo === "semestre" || escopo === "disciplina") && !valor) {
      setErro(`Escolha ${escopo === "semestre" ? "um semestre" : "uma disciplina"} antes de exportar.`);
      return;
    }
    setErro(null);
    setExporting(true);
    setProgresso("Selecionando conteúdo...");
    try {
      const noEscopo = (item, dataField) => {
        if (escopo === "tudo") return true;
        if (escopo === "disciplina") return item.disciplina === valor;
        return getSemestre(item[dataField]) === valor;
      };

      const commitmentsFiltrados = commitments.filter((c) => noEscopo(c, "prazo"));
      const idsCommitments = new Set(commitmentsFiltrados.map((c) => c.id));
      const notesFiltradas = notes.filter((n) => noEscopo(n, "createdAt"));
      const materiaisFiltrados = materials.filter((m) => noEscopo(m, "createdAt"));
      const summariesFiltrados = summaries.filter((s) =>
        escopo === "tudo" ? true : escopo === "disciplina" ? s.disciplina === valor : s.commitmentId ? idsCommitments.has(s.commitmentId) : false
      );

      const { default: JSZip } = await import("jszip");
      const zip = new JSZip();

      zip.file(
        "dados.json",
        JSON.stringify(
          {
            exportadoEm: new Date().toISOString(),
            escopo,
            valor: valor || null,
            compromissos: commitmentsFiltrados,
            anotacoes: notesFiltradas,
            resumos: summariesFiltrados,
            materiais: materiaisFiltrados.map((m) => ({ nomeArquivo: m.nomeArquivo, disciplina: m.disciplina, tipoArquivo: m.tipoArquivo, textoExtraido: m.textoExtraido })),
          },
          null,
          2
        )
      );

      const pasta = zip.folder("materiais");
      for (let i = 0; i < materiaisFiltrados.length; i++) {
        const m = materiaisFiltrados[i];
        setProgresso(`Baixando arquivo ${i + 1} de ${materiaisFiltrados.length}...`);
        try {
          const url = await getMaterialSignedUrl(m.storagePath);
          const resp = await fetch(url);
          const blob = await resp.blob();
          pasta.file(m.nomeArquivo, blob);
        } catch {
          // um arquivo falhar não deve travar o backup inteiro
        }
      }

      setProgresso("Compactando...");
      const blob = await zip.generateAsync({ type: "blob" });
      const nomeArquivo = escopo === "tudo" ? "Vida_Universitaria_completo.zip" : `Vida_Universitaria_${String(valor).replace(/\s+/g, "_")}.zip`;
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = nomeArquivo;
      a.click();
      URL.revokeObjectURL(a.href);
    } catch (e) {
      setErro("Não consegui gerar o backup: " + (e.message || String(e)));
    } finally {
      setExporting(false);
      setProgresso("");
    }
  }

  return (
    <Card>
      <SectionLabel>Backup / Exportar</SectionLabel>
      <div className="flex flex-wrap gap-2 items-center mb-2">
        <select value={escopo} onChange={(e) => { setEscopo(e.target.value); setValor(""); }} className="rounded-md p-2 text-sm" style={inputStyle}>
          <option value="tudo">Tudo</option>
          <option value="semestre">Por semestre</option>
          <option value="disciplina">Por disciplina</option>
        </select>
        {escopo === "semestre" && (
          <select value={valor} onChange={(e) => setValor(e.target.value)} className="rounded-md p-2 text-sm" style={inputStyle}>
            <option value="">Selecione...</option>
            {semestres.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        )}
        {escopo === "disciplina" && (
          <select value={valor} onChange={(e) => setValor(e.target.value)} className="rounded-md p-2 text-sm" style={inputStyle}>
            <option value="">Selecione...</option>
            {disciplinas.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
        )}
        <PrimaryButton onClick={exportar} disabled={exporting}>
          {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />} Exportar
        </PrimaryButton>
      </div>
      {progresso && <div className="text-xs" style={{ color: T.inkSoft }}>{progresso}</div>}
      {erro && <div className="text-xs" style={{ color: T.critico }}>{erro}</div>}
    </Card>
  );
}

export function BibliotecaTab({ userId, setCommitments, notes, commitments, materials, quizAttempts, professorAttempts, onDeleteNote, summaries, setSummaries, setNotes, setMaterials, setQuizAttempts, setProfessorAttempts }) {
  const [openCommitment, setOpenCommitment] = useState(null);

  async function handleDeleteMaterialLib(m) {
    await deleteMaterial(m.id, m.storagePath);
    setMaterials((prev) => prev.filter((x) => x.id !== m.id));
  }

  const disciplinas = Array.from(new Set([
    ...notes.map((n) => n.disciplina),
    ...commitments.map((c) => c.disciplina),
    ...materials.map((m) => m.disciplina),
  ])).filter(Boolean);

  const compromissosOrdenados = [...commitments].sort((a, b) => (a.prazo || "9999-99-99").localeCompare(b.prazo || "9999-99-99"));
  const compromissosPorSemestre = {};
  compromissosOrdenados.forEach((c) => {
    const sem = getSemestre(c.prazo);
    compromissosPorSemestre[sem] = compromissosPorSemestre[sem] || [];
    compromissosPorSemestre[sem].push(c);
  });
  const semestres = Object.keys(compromissosPorSemestre).sort((a, b) => (a === "Sem data" ? 1 : b === "Sem data" ? -1 : b.localeCompare(a)));

  if (disciplinas.length === 0 && compromissosOrdenados.length === 0) {
    return <EmptyState text="Ainda não há materiais organizados. Envie anotações, PDFs, fotos ou áudios pela Inbox." />;
  }

  return (
    <div className="space-y-6">
      <ExportarBiblioteca userId={userId} commitments={commitments} notes={notes} materials={materials} summaries={summaries} disciplinas={disciplinas} semestres={semestres.filter((s) => s !== "Sem data")} />

      {semestres.map((sem) => (
        <div key={sem}>
          <SectionLabel>{sem === "Sem data" ? "Compromissos sem data" : `Semestre ${sem}`}</SectionLabel>
          <div className="grid gap-2">
            {compromissosPorSemestre[sem].map((c) => (
              <button key={c.id} onClick={() => setOpenCommitment(c)} className="w-full text-left rounded-lg outline-none focus:outline-none overflow-hidden bg-transparent">
                <Card className="flex items-center justify-between py-2.5">
                  <div className="min-w-0">
                    <div className="text-sm font-medium truncate">{c.disciplina} — {c.assunto}</div>
                    <div className="text-xs mt-0.5" style={{ color: T.inkSoft }}>
                      {c.prazo ? formatDateBR(c.prazo) : "Sem data"} — {TIPO_LABELS[c.tipo]}
                    </div>
                  </div>
                  <PriorityDot prioridade={c.prioridade} />
                </Card>
              </button>
            ))}
          </div>
        </div>
      ))}

      {disciplinas.length > 0 && (
        <div className="space-y-6">
          <SectionLabel>Por disciplina — conteúdo geral</SectionLabel>
          {disciplinas.map((disc) => (
            <DisciplinaCard
              key={disc}
              userId={userId}
              disc={disc}
              notasDisc={notes.filter((n) => n.disciplina === disc && !n.commitmentId)}
              compromissosDisc={commitments.filter((c) => c.disciplina === disc)}
              materiaisDisc={materials.filter((m) => m.disciplina === disc && !m.commitmentId)}
              onDeleteNote={onDeleteNote}
              onDeleteMaterial={handleDeleteMaterialLib}
              onOpenCommitment={setOpenCommitment}
              summaries={summaries}
              setSummaries={setSummaries}
              setQuizAttempts={setQuizAttempts}
              setProfessorAttempts={setProfessorAttempts}
            />
          ))}
        </div>
      )}

      {openCommitment && (
        <CompromissoWorkspaceModal
          userId={userId}
          commitment={openCommitment}
          notes={notes}
          materials={materials}
          summaries={summaries}
          quizAttempts={quizAttempts}
          professorAttempts={professorAttempts}
          setNotes={setNotes}
          setMaterials={setMaterials}
          setSummaries={setSummaries}
          setQuizAttempts={setQuizAttempts}
          setProfessorAttempts={setProfessorAttempts}
          onClose={() => setOpenCommitment(null)}
        />
      )}
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/* Aba: Foco                                                                */
/* ---------------------------------------------------------------------- */

function FocusPet({ timerOn, streak, petName, onNameChange }) {
  const [editing, setEditing] = useState(false);
  const [tempName, setTempName] = useState(petName || "Coruja Omnia");

  let position = "0%";
  let status = "Dormindo...";
  
  if (timerOn) { position = "50%"; status = "Focando!"; }
  else if (streak > 5) { position = "100%"; status = "Mestre da Rotina"; }
  else if (streak > 0) { position = "100%"; status = "Animado"; }
  else { position = "0%"; status = "Esperando você estudar..."; }

  let animClass = "animate-pet-breathe";
  if (timerOn) animClass = "animate-pet-focus";
  else if (streak > 0) animClass = "animate-pet-cool";

  const handleSave = () => {
    setEditing(false);
    if (onNameChange) onNameChange(tempName);
  };

  return (
    <div className="flex flex-col items-center justify-center p-4">
      <div 
        style={{
          width: 80, height: 80,
          backgroundImage: "url('/pet_sprites.png')",
          backgroundSize: "300% auto",
          backgroundPosition: `${position} 50%`,
          marginBottom: 8,
          transition: "background-position 0.4s steps(1)",
          imageRendering: "pixelated"
        }}
        className={animClass}
      />
      
      {editing ? (
        <div className="flex items-center gap-2 mt-1">
          <input 
            autoFocus
            value={tempName}
            onChange={e => setTempName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSave()}
            onBlur={handleSave}
            className="text-sm font-bold text-center rounded px-2 py-1 outline-none"
            style={{ backgroundColor: T.surfaceAlt, color: T.ink, width: '120px' }}
          />
        </div>
      ) : (
        <div 
          className="text-sm font-bold cursor-pointer hover:opacity-80 transition-opacity" 
          style={{ color: T.ink }}
          onClick={() => setEditing(true)}
          title="Clique para renomear"
        >
          {petName || "Coruja Omnia"} <Pencil size={14} className="inline ml-1 opacity-50"/>
        </div>
      )}
      <div className="text-xs mt-1" style={{ color: T.inkSoft }}>{status}</div>
    </div>
  );
}

export function FocoTab(props) {
  const { config, updateConfig } = props;
  const { commitments, sessions, metaHoje, timer, userId, notes, materials, summaries, quizAttempts, professorAttempts, setNotes, setMaterials, setSummaries, setQuizAttempts, setProfessorAttempts } = props;
  const [lofiOn, setLofiOn] = useState(false);

  const [showRoom, setShowRoom] = useState(false);
  const [roomCode, setRoomCode] = useState("");
  
  function createRoom() {
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    timer.joinRoom(code, true);
  }

  const datasAtividades = Array.from(new Set((sessions||[]).map(s => s.date ? s.date.slice(0,10) : ""))).filter(Boolean).sort().reverse();
  let streak = 0;
  let d = new Date();
  for (let i = 0; i < 365; i++) {
    const dIso = d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
    if (datasAtividades.includes(dIso)) streak++;
    else if (i !== 0) break;
  }
  const {
    selectedId, setSelectedId, presetIdx, setPresetIdx, customMin, setCustomMin,
    useCustom, setUseCustom, phase, running, remaining, ciclosConsecutivos, ultimaSessao,
    selectedCommitment, workSeconds,
    iniciar, pausar, continuar, reiniciarCiclo, encerrar, roomId, isHost, joinRoom, leaveRoom,
  } = timer;

  const mins = String(Math.floor(remaining / 60)).padStart(2, "0");
  const secs = String(remaining % 60).padStart(2, "0");
  const totalHoje = sessions.filter((s) => s.date === todayISO()).reduce((acc, s) => acc + s.minutos, 0);

  const compromissosOrdenados = [...commitments].sort((a, b) => (a.prazo || "9999-99-99").localeCompare(b.prazo || "9999-99-99"));

  /* ------------------------- Modo imersivo (sessão ativa) ------------------------- */
  if (phase !== "idle") {
    return (
      <div className="space-y-5">
        <Card className="text-center py-8 relative overflow-hidden">
          <div
            className="absolute top-0 left-4 px-2 py-0.5 text-[10px] font-mono uppercase tracking-widest rounded-b"
            style={{ backgroundColor: T.brand, color: T.brandInk }}
          >
            Modo Foco
          </div>
          <div className="text-[11px] font-mono uppercase tracking-widest mb-2 mt-2" style={{ color: T.inkSoft }}>
            {phase === "work" ? (running ? "Foco" : "Pausado") : "Pausa"}
          </div>
          {selectedCommitment && (
            <div className="text-sm font-medium mb-1" style={{ color: T.ink }}>
              {selectedCommitment.disciplina} — {selectedCommitment.assunto}
            </div>
          )}
          <div className="text-5xl font-mono font-semibold tabular-nums mb-4" style={{ color: T.ink }}>{mins}:{secs}</div>
          <div className="flex items-center justify-center gap-2 flex-wrap">
            {running ? (
              <GhostButton onClick={pausar}><Pause className="w-4 h-4" /> Pausar</GhostButton>
            ) : (
              <PrimaryButton onClick={continuar}><Play className="w-4 h-4" /> Continuar</PrimaryButton>
            )}
            <GhostButton onClick={reiniciarCiclo}><RotateCcw className="w-4 h-4" /> Reiniciar ciclo</GhostButton>
            <GhostButton onClick={encerrar}><X className="w-4 h-4" /> Encerrar sessão</GhostButton>
          </div>
            <FocusPet timerOn={phase === "work" && running} streak={streak} />
            {props.config?.enableLofi !== false && (
            <div className="flex items-center justify-center gap-2 mt-4">
              <GhostButton onClick={() => setLofiOn(!lofiOn)} style={{ color: lofiOn ? T.brand : T.inkSoft }}>
                <Headphones className="w-4 h-4" /> {lofiOn ? 'Lo-Fi: Ligado' : 'Lo-Fi: Desligado'}
              </GhostButton>
            </div>
            )}
            {lofiOn && (
  <div className="mt-6 flex justify-center">
    <iframe width="280" height="157" src="https://www.youtube.com/embed/lTRiuFIWV54?autoplay=1" title="Lofi Girl" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen className="rounded-lg shadow-md" />
  </div>
)}

        </Card>

        {phase === "rest" && ultimaSessao && (
          <Card style={{ borderColor: T.brand }}>
            <SectionLabel>Sessão concluída</SectionLabel>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between"><span style={{ color: T.inkSoft }}><Book size={14} className="inline mr-1 -mt-0.5" /> Disciplina</span><span style={{ color: T.ink }}>{ultimaSessao.disciplina}</span></div>
              <div className="flex justify-between"><span style={{ color: T.inkSoft }}><Clock size={14} className="inline mr-1 -mt-0.5" /> Essa sessão</span><span style={{ color: T.ink }}>{ultimaSessao.minutos} min</span></div>
              <div className="flex justify-between"><span style={{ color: T.inkSoft }}><TrendingUp size={14} className="inline mr-1 -mt-0.5" /> Total hoje</span><span style={{ color: T.ink }}>{totalHoje} min</span></div>
              {metaHoje && (
                <div className="flex justify-between">
                  <span style={{ color: T.inkSoft }}><Target size={14} className="inline mr-1 -mt-0.5" /> Meta</span>
                  <span style={{ color: totalHoje >= metaHoje ? T.brand : T.ink }}>{totalHoje}/{metaHoje} min {totalHoje >= metaHoje ? "✅" : ""}</span>
                </div>
              )}
            </div>
            {ciclosConsecutivos >= 3 && (
              <div className="text-xs mt-2 pt-2" style={{ color: T.importante, borderTop: `1px solid ${T.border}` }}>
                Você já fez {ciclosConsecutivos} ciclos seguidos hoje. Uma pausa mais longa (15–20min) antes de continuar ajuda a manter o rendimento.
              </div>
            )}
          </Card>
        )}

        {selectedCommitment ? (
          <CompromissoWorkspaceContent
            userId={userId} commitment={selectedCommitment} notes={notes} materials={materials}
            summaries={summaries} quizAttempts={quizAttempts} professorAttempts={professorAttempts}
            setNotes={setNotes} setMaterials={setMaterials} setSummaries={setSummaries}
            setQuizAttempts={setQuizAttempts} setProfessorAttempts={setProfessorAttempts}
          />
        ) : (
          <EmptyState text="Sessão livre — sem compromisso vinculado, sem material aqui embaixo. Encerre e escolha um compromisso se quiser acessar resumos e quizzes durante o foco." />
        )}
      </div>
    );
  }

  /* ------------------------------- Tela de preparo -------------------------------- */
  return (
    <div className="space-y-5">
      <Card>
        <SectionLabel>Focar em</SectionLabel>
        <div className="space-y-1.5 mb-1 max-h-52 overflow-y-auto pr-1">
          <button
            onClick={() => setSelectedId("livre")}
            className="w-full text-left rounded-lg p-2.5"
            style={{
              backgroundColor: selectedId === "livre" ? TINT.brand : T.surfaceAlt,
              border: `1px solid ${selectedId === "livre" ? T.brand : T.border}`,
            }}
          >
            <div className="text-sm font-medium" style={{ color: T.ink }}>Sessão livre</div>
            <div className="text-xs" style={{ color: T.inkSoft }}>Sem compromisso específico</div>
          </button>
          {compromissosOrdenados.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelectedId(c.id)}
              className="w-full text-left rounded-lg p-2.5"
              style={{
                backgroundColor: selectedId === c.id ? TINT.brand : T.surfaceAlt,
                border: `1px solid ${selectedId === c.id ? T.brand : T.border}`,
              }}
            >
              <div className="text-sm font-medium truncate" style={{ color: T.ink }}>{c.disciplina} — {c.assunto}</div>
              <div className="text-xs" style={{ color: T.inkSoft }}>{c.prazo ? formatDateBR(c.prazo) : "Sem data"} — {TIPO_LABELS[c.tipo]}</div>
            </button>
          ))}
        </div>
      </Card>

      <Card>
        <SectionLabel>Duração</SectionLabel>
        <div className="flex flex-wrap gap-2 mb-3">
          {PRESETS.map((p, i) => (
            <button key={p.label} onClick={() => { setUseCustom(false); setPresetIdx(i); }} className="px-3 py-1.5 rounded-md text-sm"
              style={{ backgroundColor: !useCustom && presetIdx === i ? T.brand : T.surfaceAlt, color: !useCustom && presetIdx === i ? T.brandInk : T.ink, border: `1px solid ${T.border}` }}>
              {p.label}
            </button>
          ))}
          <button onClick={() => setUseCustom(true)} className="px-3 py-1.5 rounded-md text-sm flex items-center gap-1"
            style={{ backgroundColor: useCustom ? T.brand : T.surfaceAlt, color: useCustom ? T.brandInk : T.ink, border: `1px solid ${T.border}` }}>
            Personalizado
          </button>
          {useCustom && (
            <input type="number" min={5} value={customMin} onChange={(e) => setCustomMin(Number(e.target.value) || 5)} className="w-16 rounded-md p-1.5 text-sm text-center" style={{ backgroundColor: T.surfaceAlt, border: `1px solid ${T.border}` }} />
          )}
        </div>
        <PrimaryButton onClick={iniciar} className="w-full">
          <Play className="w-4 h-4" /> Iniciar sessão de foco
        </PrimaryButton>
      </Card>

        <Card>
          <div className="flex flex-col gap-3">
            <FocusPet timerOn={false} streak={streak} />
            <div className="border-t pt-3 mt-1" style={{ borderColor: T.border }}>
              <div className="flex justify-between items-center cursor-pointer" onClick={() => setShowRoom(!showRoom)}>
                <SectionLabel><Globe size={18} className="inline mr-2 -mt-0.5" /> Modo Multiplayer</SectionLabel>
                <span className="text-xs" style={{ color: T.brand }}>{showRoom ? "Esconder" : "Mostrar"}</span>
              </div>
              {showRoom && (
                <div className="mt-3 flex flex-col gap-2">
                  <PrimaryButton onClick={createRoom} className="w-full text-xs">Criar Sala de Estudos</PrimaryButton>
                  <div className="flex gap-2">
                    <input value={roomCode} onChange={e => setRoomCode(e.target.value)} placeholder="Código da sala" className="flex-1 rounded p-1.5 text-xs text-center" style={{ backgroundColor: T.surfaceAlt, color: T.ink, border: `1px solid ${T.border}` }} />
                    <GhostButton onClick={() => timer.joinRoom(roomCode, false)} className="text-xs" disabled={!roomCode}>Entrar</GhostButton>
                  </div>
                </div>
              )}
            </div>
          </div>
        </Card>


      <Card className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm" style={{ color: T.inkSoft }}><Clock className="w-4 h-4" /> Estudado hoje</div>
        <div className="text-sm font-semibold" style={{ color: T.brand }}>{totalHoje} min</div>
      </Card>
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/* Aba: Secretária (chat)                                                   */
/* ---------------------------------------------------------------------- */
export function SecretariaTab({
  userId, routine, routineBlocks, routineExceptions, commitments, studyBlocks, notes, sessions, setRoutineBlocks, setRoutineExceptions,
}) {
  const [messages, setMessages] = useState(() => {
    try {
      const saved = sessionStorage.getItem("secretariaMessages");
      if (saved) return JSON.parse(saved);
    } catch(e) {}
    return [
      { role: "assistant", text: "Oi! Além de responder perguntas, agora também consigo mexer na sua rotina — pode pedir pra criar, mudar ou cancelar um compromisso." },
    ];
  });

  useEffect(() => {
    sessionStorage.setItem("secretariaMessages", JSON.stringify(messages));
  }, [messages]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const endRef = useRef(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  function buildSystemPrompt() {
    const hoje = todayISO();
    const dia = weekdayShort(hoje);
    // Contexto compacto — formato pipe para economizar tokens
    const rec = routineBlocks.map((b) => `${b.id}|${b.titulo}`);
    const exc = routineExceptions.filter((e) => e.data >= hoje).slice(0, 10).map((e) => `${e.data}|${e.tipoExcecao}|${e.titulo||""}|${e.horaInicio||""}-${e.horaFim||""}`);
    const cmp = commitments.slice(0, 10).map((c) => `${c.disciplina} — {c.assunto}|${c.prazo||"sem prazo"}`);
    const minHoje = sessions.filter((s) => s.date === hoje).reduce((a, s) => a + s.minutos, 0);
    return `Secretária pessoal de estudante de Odontologia. Português BR, direto e prático.

Regras:
- Tabela/grade inteira -> criar_multiplos_compromissos_recorrentes. Para mudar a cor de materias/disciplinas inteiras, chame a ferramenta pintar_materia_pelo_nome passando o NOME da materia.\n  - Ao mudar cores, use formato HEX (ex: #FF0000, #2DD4A0). Mantenha outros dados iguais se não pedido para mudar.

Recorrentes(id|titulo|dia|hora|cor): ${rec.length ? rec.join("; ") : "nenhum"}\n
Exceções futuras: ${exc.length ? exc.join("; ") : "nenhuma"}
Compromissos: ${cmp.length ? cmp.join("; ") : "nenhum"}
Min.estudados hoje: ${minHoje}`;
  }

  async function send() {
    if (!input.trim() || loading) return;
    const question = input.trim();
    setMessages((prev) => [...prev, { role: "user", text: question }]);
    setInput("");
    setLoading(true);
    try {
      const sys = buildSystemPrompt();
      const convo = [{ role: "user", content: question }];
      let response = await callAIWithTools(sys, convo, ROUTINE_TOOLS);

      let iterations = 0;
      while (response.toolCalls && response.toolCalls.length > 0 && iterations < 4) {
          convo.push({ role: "assistant", content: response.text || null, tool_calls: response.toolCalls });
          
          let hasPintar = false;
          for (const call of response.toolCalls) {
            if (call.function.name === "pintar_materia_pelo_nome") hasPintar = true;
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
        }

      setMessages((prev) => [...prev, { role: "assistant", text: response.text || "Feito." }]);
    } catch (e) {
      setMessages((prev) => [...prev, { role: "assistant", text: "Não consegui responder agora: " + (e.message || String(e)) }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col" style={{ height: "60vh" }}>
      <div className="flex-1 overflow-y-auto space-y-3 pr-1">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className="max-w-[85%] rounded-lg px-3 py-2" style={{ backgroundColor: m.role === "user" ? T.brand : T.surface, color: m.role === "user" ? T.brandInk : T.ink, border: m.role === "user" ? "none" : `1px solid ${T.border}` }}>
              {m.role === "user" ? (
                <span className="text-sm">{m.text}</span>
              ) : (
                <Suspense fallback={<span className="text-sm">{m.text}</span>}>
                  <ChatMarkdown text={m.text} />
                </Suspense>
              )}
            </div>
          </div>
        ))}
        {loading && <Loader2 className="w-4 h-4 animate-spin" style={{ color: T.inkSoft }} />}
        <div ref={endRef} />
      </div>
      <div className="flex items-center gap-2 pt-3" style={{ borderTop: `1px solid ${T.border}` }}>
        <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && send()} placeholder="Pergunte ou peça uma mudança na rotina..." className="flex-1 rounded-md p-2.5 text-sm outline-none" style={{ backgroundColor: T.surfaceAlt, border: `1px solid ${T.border}`, color: T.ink }} />
        <PrimaryButton onClick={send} disabled={loading || !input.trim()}><Send className="w-4 h-4" /></PrimaryButton>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/* Aba: Minha Rotina                                                        */
/* ---------------------------------------------------------------------- */
const DIAS_SEMANA = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];
const DIA_LABEL_LONGO = { Seg: "Segunda", Ter: "Terça", Qua: "Quarta", Qui: "Quinta", Sex: "Sexta", Sáb: "Sábado", Dom: "Domingo" };
const TIPOS_ROTINA = [
  { tipo: "aula", label: "Aula", cor: "#2DD4A0" },
  { tipo: "trabalho", label: "Trabalho", cor: "#F0997B" },
  { tipo: "estudo", label: "Estudo", cor: "#5DCAA5" },
  { tipo: "academia", label: "Academia", cor: "#ED93B1" },
  { tipo: "refeicao", label: "Refeição", cor: "#F5C775" },
  { tipo: "sono", label: "Sono", cor: "#AFA9EC" },
  { tipo: "livre", label: "Horário livre", cor: "#8FA39D" },
  { tipo: "lazer", label: "Lazer", cor: "#ED93B1" },
  { tipo: "esporte", label: "Esporte", cor: "#F0997B" },
  { tipo: "pessoal", label: "Compromisso pessoal", cor: "#AFA9EC" },
  { tipo: "consulta", label: "Consulta", cor: "#F5C775" },
  { tipo: "evento", label: "Evento", cor: "#5DCAA5" },
];

function ModalShell({ title, onClose, children, footer }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center" style={{ backgroundColor: "rgba(13,25,23,0.65)" }} onClick={onClose}>
      <div
        className="w-full sm:max-w-md max-h-[90vh] overflow-y-auto rounded-t-2xl sm:rounded-2xl p-5"
        style={{ backgroundColor: T.surface, border: `1px solid ${T.border}` }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold" style={{ color: T.ink }}>{title}</h3>
          <button onClick={onClose} style={{ color: T.inkSoft }}><X className="w-5 h-5" /></button>
        </div>
        <div className="space-y-3">{children}</div>
        {footer && <div className="flex flex-wrap gap-2 mt-5">{footer}</div>}
      </div>
    </div>
  );
}

function SonoModal({ routine, onSave, onClose }) {
  const [dormir, setDormir] = useState(routine.dormir);
  const [acordar, setAcordar] = useState(routine.acordar);
  const [dias, setDias] = useState(routine.diasSono && routine.diasSono.length ? routine.diasSono : DIAS_SEMANA);
  const [saving, setSaving] = useState(false);
  const inputStyle = { backgroundColor: T.surfaceAlt, border: `1px solid ${T.border}`, color: T.ink };

  function toggleDia(dia) {
    setDias((prev) => (prev.includes(dia) ? prev.filter((d) => d !== dia) : [...prev, dia]));
  }
  async function handleSave() {
    setSaving(true);
    try {
      await onSave({ dormir, acordar, diasSono: dias });
      onClose();
    } finally {
      setSaving(false);
    }
  }

  return (
    <ModalShell
      title="Sono"
      onClose={onClose}
      footer={
        <>
          <PrimaryButton onClick={handleSave} disabled={saving}>
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />} Salvar
          </PrimaryButton>
          <GhostButton onClick={onClose}>Cancelar</GhostButton>
        </>
      }
    >
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs" style={{ color: T.inkSoft }}>Dormir</label>
          <input type="time" value={dormir} onChange={(e) => setDormir(e.target.value)} className="w-full rounded-md p-2 text-sm mt-1" style={inputStyle} />
        </div>
        <div>
          <label className="text-xs" style={{ color: T.inkSoft }}>Acordar</label>
          <input type="time" value={acordar} onChange={(e) => setAcordar(e.target.value)} className="w-full rounded-md p-2 text-sm mt-1" style={inputStyle} />
        </div>
      </div>
      <div>
        <label className="text-xs" style={{ color: T.inkSoft }}>Dias em que esse horário se aplica</label>
        <div className="flex flex-wrap gap-1.5 mt-1.5">
          {DIAS_SEMANA.map((d) => (
            <button
              key={d}
              onClick={() => toggleDia(d)}
              className="text-xs px-2.5 py-1 rounded-full"
              style={{
                backgroundColor: dias.includes(d) ? T.brand : T.surfaceAlt,
                color: dias.includes(d) ? T.brandInk : T.inkSoft,
                border: `1px solid ${T.border}`,
              }}
            >
              {d}
            </button>
          ))}
        </div>
      </div>
    </ModalShell>
  );
}

function PreferenciasModal({ routine, onSave, onClose }) {
  const [periodoPreferido, setPeriodoPreferido] = useState(routine.periodoPreferido);
  const [duracaoPreferida, setDuracaoPreferida] = useState(routine.duracaoPreferida);
  const [lazerMinimoMin, setLazerMinimoMin] = useState(routine.lazerMinimoMin);
  const [saving, setSaving] = useState(false);
  const inputStyle = { backgroundColor: T.surfaceAlt, border: `1px solid ${T.border}`, color: T.ink };

  async function handleSave() {
    setSaving(true);
    try {
      await onSave({ periodoPreferido, duracaoPreferida, lazerMinimoMin });
      onClose();
    } finally {
      setSaving(false);
    }
  }

  return (
    <ModalShell
      title="Preferências de estudo"
      onClose={onClose}
      footer={
        <>
          <PrimaryButton onClick={handleSave} disabled={saving}>
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />} Salvar
          </PrimaryButton>
          <GhostButton onClick={onClose}>Cancelar</GhostButton>
        </>
      }
    >
      <div>
        <label className="text-xs" style={{ color: T.inkSoft }}>Período preferido</label>
        <select value={periodoPreferido} onChange={(e) => setPeriodoPreferido(e.target.value)} className="w-full rounded-md p-2 text-sm mt-1" style={inputStyle}>
          <option value="manha">Manhã</option>
          <option value="tarde">Tarde</option>
          <option value="noite">Noite</option>
        </select>
      </div>
      <div>
        <label className="text-xs" style={{ color: T.inkSoft }}>Duração das sessões</label>
        <select value={duracaoPreferida} onChange={(e) => setDuracaoPreferida(e.target.value)} className="w-full rounded-md p-2 text-sm mt-1" style={inputStyle}>
          <option value="curta">Curtas</option>
          <option value="longa">Longas</option>
        </select>
      </div>
      <div>
        <label className="text-xs" style={{ color: T.inkSoft }}>Lazer mínimo por dia (minutos)</label>
        <input type="number" min={0} value={lazerMinimoMin} onChange={(e) => setLazerMinimoMin(Number(e.target.value) || 0)} className="w-full rounded-md p-2 text-sm mt-1" style={inputStyle} />
      </div>
    </ModalShell>
  );
}

function CompromissoRotinaModal({ block, defaultDia, onSave, onDelete, onClose }) {
  const isEdit = !!block;
  const tipoConhecido = block && TIPOS_ROTINA.some((t) => t.tipo === block.tipo);
  const [titulo, setTitulo] = useState(block?.titulo || "");
  const [tipoSel, setTipoSel] = useState(block ? (tipoConhecido ? block.tipo : "personalizado") : "aula");
  const [tipoCustom, setTipoCustom] = useState(block && !tipoConhecido ? block.tipo : "");
  const [diaSemana, setDiaSemana] = useState(block?.diaSemana || defaultDia || "Seg");
  const [horaInicio, setHoraInicio] = useState(block?.horaInicio?.slice(0, 5) || "08:00");
  const [horaFim, setHoraFim] = useState(block?.horaFim?.slice(0, 5) || "09:00");
  const [cor, setCor] = useState(block?.cor || TIPOS_ROTINA[0].cor);
  const [recorrente, setRecorrente] = useState(block?.recorrente !== undefined ? block.recorrente : true);
  const [observacoes, setObservacoes] = useState(block?.observacoes || "");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const inputStyle = { backgroundColor: T.surfaceAlt, border: `1px solid ${T.border}`, color: T.ink };

  function handleTipoChange(value) {
    setTipoSel(value);
    if (value !== "personalizado") {
      const found = TIPOS_ROTINA.find((t) => t.tipo === value);
      if (found) setCor(found.cor);
    }
  }

  async function handleSave() {
    if (!titulo.trim() || horaFim <= horaInicio) return;
    const tipoFinal = tipoSel === "personalizado" ? (tipoCustom.trim() || "outro") : tipoSel;
    setSaving(true);
    try {
      await onSave({
        titulo: titulo.trim(), tipo: tipoFinal, diaSemana, horaInicio, horaFim,
        cor, recorrente, observacoes: observacoes.trim() || null,
      });
      onClose();
    } finally {
      setSaving(false);
    }
  }
  async function handleDelete() {
    setDeleting(true);
    try {
      await onDelete(block.id);
      onClose();
    } finally {
      setDeleting(false);
    }
  }

  return (
    <ModalShell
      title={isEdit ? "Editar compromisso" : "Novo compromisso"}
      onClose={onClose}
      footer={
        <>
          <PrimaryButton onClick={handleSave} disabled={saving || !titulo.trim() || horaFim <= horaInicio}>
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />} Salvar
          </PrimaryButton>
          {isEdit && (
            <GhostButton onClick={handleDelete}>
              {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />} Excluir
            </GhostButton>
          )}
          <GhostButton onClick={onClose}>Cancelar</GhostButton>
        </>
      }
    >
      <div>
        <label className="text-xs" style={{ color: T.inkSoft }}>Nome</label>
        <input value={titulo} onChange={(e) => setTitulo(e.target.value)} placeholder="Ex: Aula de Anatomia" className="w-full rounded-md p-2 text-sm mt-1" style={inputStyle} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs" style={{ color: T.inkSoft }}>Tipo</label>
          <select value={tipoSel} onChange={(e) => handleTipoChange(e.target.value)} className="w-full rounded-md p-2 text-sm mt-1" style={inputStyle}>
            {TIPOS_ROTINA.map((t) => <option key={t.tipo} value={t.tipo}>{t.label}</option>)}
            <option value="personalizado">Personalizado...</option>
          </select>
        </div>
        <div>
          <label className="text-xs" style={{ color: T.inkSoft }}>Cor</label>
          <input type="color" value={cor} onChange={(e) => setCor(e.target.value)} className="w-full rounded-md mt-1" style={{ height: 38, border: `1px solid ${T.border}`, backgroundColor: T.surfaceAlt }} />
        </div>
      </div>

      {tipoSel === "personalizado" && (
        <div>
          <label className="text-xs" style={{ color: T.inkSoft }}>Nome do tipo</label>
          <input value={tipoCustom} onChange={(e) => setTipoCustom(e.target.value)} placeholder="Ex: Voluntariado" className="w-full rounded-md p-2 text-sm mt-1" style={inputStyle} />
        </div>
      )}

      <div>
        <label className="text-xs" style={{ color: T.inkSoft }}>Dia da semana</label>
        <select value={diaSemana} onChange={(e) => setDiaSemana(e.target.value)} className="w-full rounded-md p-2 text-sm mt-1" style={inputStyle}>
          {DIAS_SEMANA.map((d) => <option key={d} value={d}>{DIA_LABEL_LONGO[d]}</option>)}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs" style={{ color: T.inkSoft }}>Início</label>
          <input type="time" value={horaInicio} onChange={(e) => setHoraInicio(e.target.value)} className="w-full rounded-md p-2 text-sm mt-1" style={inputStyle} />
        </div>
        <div>
          <label className="text-xs" style={{ color: T.inkSoft }}>Fim</label>
          <input type="time" value={horaFim} onChange={(e) => setHoraFim(e.target.value)} className="w-full rounded-md p-2 text-sm mt-1" style={inputStyle} />
        </div>
      </div>
      {horaFim <= horaInicio && <div className="text-xs" style={{ color: T.critico }}>O horário final precisa ser depois do inicial.</div>}

      <div>
        <label className="flex items-center gap-2 text-xs" style={{ color: T.inkSoft }}>
          <input type="checkbox" checked={recorrente} onChange={(e) => setRecorrente(e.target.checked)} />
          Recorrente (toda semana, nesse dia e horário)
        </label>
      </div>

      <div>
        <label className="text-xs" style={{ color: T.inkSoft }}>Observações</label>
        <textarea value={observacoes} onChange={(e) => setObservacoes(e.target.value)} rows={2} className="w-full rounded-md p-2 text-sm mt-1" style={inputStyle} placeholder="Opcional" />
      </div>
    </ModalShell>
  );
}

export function RotinaTab({ config, routine, routineBlocks, routineExceptions, onUpdateRoutine, onAddBlock, onUpdateBlock, onDeleteBlock, onDeleteException }) {
const [exporting, setExporting] = useState(false);
const gridRef = useRef(null);
  const exportarCalendario = () => {
    const byDayMap = { Seg: 'MO', Ter: 'TU', Qua: 'WE', Qui: 'TH', Sex: 'FR', Sab: 'SA', Dom: 'SU' };
    const events = routineBlocks.map(b => {
      const today = new Date();
      const currentDay = today.getDay();
      const dayMap = { Dom: 0, Seg: 1, Ter: 2, Qua: 3, Qui: 4, Sex: 5, Sab: 6 };
      const targetDay = dayMap[b.diaSemana];
      let daysUntil = targetDay - currentDay;
      if (daysUntil < 0) daysUntil += 7;
      const nextDate = new Date(today);
      nextDate.setDate(today.getDate() + daysUntil);
      
      const startHour = parseInt(b.horaInicio.split(':')[0]);
      const startMin = parseInt(b.horaInicio.split(':')[1]);
      
      const [eh, em] = b.horaFim.split(':').map(Number);
      const endTotalMins = eh * 60 + em;
      const startTotalMins = startHour * 60 + startMin;
      let durationMins = endTotalMins - startTotalMins;
      if (durationMins < 0) durationMins += 24 * 60;
      const h = Math.floor(durationMins / 60);
      const m = durationMins % 60;
      
      return {
        title: b.titulo,
        start: [nextDate.getFullYear(), nextDate.getMonth() + 1, nextDate.getDate(), startHour, startMin],
        duration: { hours: h, minutes: m },
        recurrenceRule: 'FREQ=WEEKLY;BYDAY=' + byDayMap[b.diaSemana],
        description: 'Omnia: ' + b.titulo,
      };
    });
    
    ics.createEvents(events, (error, value) => {
      if (error) {
        console.error(error);
        return;
      }
      const blob = new Blob([value], { type: 'text/calendar' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'Omnia-Rotina.ics';
      link.click();
      URL.revokeObjectURL(url);
    });
  };

const exportarGrade = () => {
  setExporting(true);
  try {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text('Meu Horário - Omnia', 14, 22);
    
    const dias = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab', 'Dom'];
    const nomesDias = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'];
    
    let yPos = 30;
    
    dias.forEach((dia, i) => {
      const blocosDoDia = routineBlocks.filter(b => b.diaSemana === dia).sort((a,b) => a.horaInicio.localeCompare(b.horaInicio));
      if (blocosDoDia.length === 0) return;
      
      doc.setFontSize(14);
      doc.text(nomesDias[i], 14, yPos + 10);
      
      const tableData = blocosDoDia.map(b => [
        b.horaInicio.slice(0,5) + ' - ' + b.horaFim.slice(0,5),
        b.titulo
      ]);
      
      autoTable(doc, {
        startY: yPos + 15,
        head: [['Horário', 'Compromisso']],
        body: tableData,
        theme: 'striped',
        headStyles: { fillColor: '#2563EB' },
        margin: { top: 10, bottom: 10 }
      });
      
      yPos = doc.lastAutoTable.finalY + 10;
      if (yPos > 250) {
        doc.addPage();
        yPos = 20;
      }
    });
    
    doc.save('Meus-Horarios-Omnia.pdf');
  } catch (err) {
    console.error('Erro ao gerar PDF', err);
  }
  setExporting(false);
};

  const [modal, setModal] = useState(null);
  const [dragging, setDragging] = useState(null); // "sono" | "preferencias" | { block, dia } | null

  if (!routine) return null;

  
  
  function handleDrop(e, targetDay) {
    e.preventDefault();
    
    // Always get ID from dataTransfer as source of truth
    const draggedId = e.dataTransfer.getData("text/plain");
    const block = routineBlocks.find(b => b.id === draggedId);
    if (!block) {
       setDragging(null);
       return;
    }
    
    const sourceDay = dragging ? dragging.sourceDay : block.diaSemana; // Fallback
    
    // We get the offsetY from the container. 
    // To be precise regardless of children, we use getBoundingClientRect
    const rect = e.currentTarget.getBoundingClientRect();
    const y = e.clientY - rect.top;
    
    // Calculate new start minutes
    const HOUR_HEIGHT = 60;
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
    const newStart = `${h}:${m}`;
    
    // calculate duration to preserve it
    const [sh, sm] = block.horaInicio.split(":").map(Number);
    const [eh, em] = block.horaFim.split(":").map(Number);
    let dur = (eh * 60 + em) - (sh * 60 + sm);
    if (dur < 0) dur += 24 * 60; // Crosses midnight
    
    let endMin = finalStartMin + dur;
    let finalEndMin = endMin % (24 * 60);
    
    const newEnd = `${String(Math.floor(finalEndMin / 60)).padStart(2, '0')}:${String(finalEndMin % 60).padStart(2, '0')}`;
    
    let newDia = block.diaSemana;
    if (sourceDay !== targetDay) { newDia = targetDay; }
    
    console.log("Dropping block:", block.id, "newStart:", newStart, "newEnd:", newEnd, "dias:", newDia);
    onUpdateBlock(block.id, { diaSemana: newDia, horaInicio: newStart, horaFim: newEnd });
    
    setDragging(null);
  }


  const blocksByDay = {};
  DIAS_SEMANA.forEach((d) => { blocksByDay[d] = []; });
  routineBlocks.forEach((b) => { if (blocksByDay[b.diaSemana]) blocksByDay[b.diaSemana].push(b); });
  Object.keys(blocksByDay).forEach((d) => blocksByDay[d].sort((a, b) => a.horaInicio.localeCompare(b.horaInicio)));

  const diasSono = routine.diasSono && routine.diasSono.length ? routine.diasSono : DIAS_SEMANA;
  const [semanaInicio, semanaFim] = getWeekRange(todayISO());
  const excecoesSemana = routineExceptions
    .filter((e) => e.data >= semanaInicio && e.data <= semanaFim)
    .sort((a, b) => a.data.localeCompare(b.data));

  function descreverExcecao(ex) {
    const blocoRelacionado = ex.routineBlockId ? routineBlocks.find((b) => b.id === ex.routineBlockId) : null;
    if (ex.tipoExcecao === "cancelamento") {
      return `Cancelado em ${formatDateBR(ex.data)}${blocoRelacionado ? ` — ${blocoRelacionado.titulo}` : ""}`;
    }
    if (ex.tipoExcecao === "alteracao") {
      return `${ex.titulo || blocoRelacionado?.titulo || "Compromisso"} muda em ${formatDateBR(ex.data)}${ex.horaInicio ? ` para ${ex.horaInicio.slice(0, 5)}–${ex.horaFim?.slice(0, 5) || ""}` : ""}`;
    }
    return `${ex.titulo || "Compromisso avulso"} — só em ${formatDateBR(ex.data)}${ex.horaInicio ? `, ${ex.horaInicio.slice(0, 5)}–${ex.horaFim?.slice(0, 5) || ""}` : ""}`;
  }

  const parseTime = (timeStr) => {
    if (!timeStr) return 0;
    const [h, m] = timeStr.split(":").map(Number);
    return h * 60 + m;
  };

  const wakeMin = parseTime(routine.acordar || "06:00");
  let sleepMin = parseTime(routine.dormir || "23:00");
  if (sleepMin <= wakeMin) sleepMin += 24 * 60;
  
  const totalMinutes = sleepMin - wakeMin;
  const HOUR_HEIGHT = 60;
  const Y_OFFSET = 12;
  
  const hourLines = [];
  const startHourMin = Math.floor(wakeMin / 60) * 60;
  for (let m = startHourMin; m <= sleepMin + 60; m += 60) {
    if (m < wakeMin) continue;
    const h = Math.floor(m / 60) % 24;
    hourLines.push({
      label: `${h.toString().padStart(2, "0")}:00`,
      top: ((m - wakeMin) / 60) * HOUR_HEIGHT + Y_OFFSET
    });
  }
  
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <Card>
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-1.5 text-xs" style={{ color: T.inkSoft }}><Moon className="w-3.5 h-3.5" /> Sono</div>
            <button onClick={() => setModal("sono")} style={{ color: T.brand }}><Pencil className="w-3.5 h-3.5" /></button>
          </div>
          <div className="text-sm font-medium" style={{ color: T.ink }}>{routine.dormir} — {routine.acordar}</div>
          <div className="text-[11px] mt-0.5" style={{ color: T.inkSoft }}>{diasSono.length === 7 ? "Todos os dias" : diasSono.join(", ")}</div>
        </Card>
        <Card>
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-1.5 text-xs" style={{ color: T.inkSoft }}><SlidersHorizontal className="w-3.5 h-3.5" /> Estudo</div>
            <button onClick={() => setModal("preferencias")} style={{ color: T.brand }}><Pencil className="w-3.5 h-3.5" /></button>
          </div>
          <div className="text-sm font-medium" style={{ color: T.ink }}>{PERIODO_LABELS[routine.periodoPreferido]} — {routine.duracaoPreferida === "curta" ? "curtas" : "longas"}</div>
          <div className="text-[11px] mt-0.5" style={{ color: T.inkSoft }}>{routine.lazerMinimoMin} min de lazer/dia</div>
        </Card>
      </div>

      {excecoesSemana.length > 0 && (
        <div>
          <SectionLabel>Alterações pontuais desta semana</SectionLabel>
          <div className="space-y-1.5">
            {excecoesSemana.map((ex) => (
              <Card key={ex.id} className="py-2 flex items-center justify-between gap-2">
                <span className="text-sm" style={{ color: T.ink }}>{descreverExcecao(ex)}</span>
                <button onClick={() => onDeleteException(ex.id)} style={{ color: T.inkSoft }} className="shrink-0"><Trash2 className="w-3.5 h-3.5" /></button>
              </Card>
            ))}
          </div>
        </div>
      )}

      <div>
        <div className="flex items-center justify-between mb-2">
<SectionLabel>Grade da Semana</SectionLabel>
<div className="flex items-center gap-2">
{config?.enableCalendar !== false && (
  <GhostButton onClick={exportarCalendario}>
    <CalendarDays className="w-3.5 h-3.5" /> Sincronizar Calendário
  </GhostButton>
)}
{config?.enablePdf !== false && (
  <GhostButton onClick={exportarGrade} disabled={exporting}>
{exporting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
{exporting ? "Gerando..." : "Gerar PDF"}
</GhostButton>
)}
<GhostButton onClick={() => setModal({ block: null, dia: "Seg" })}><Plus className="w-3.5 h-3.5" /> Novo</GhostButton>
          </div>
        </div>
        <div className="overflow-x-auto custom-scrollbar -mx-1 px-1 pb-1 mt-4" ref={gridRef} style={{ borderRadius: "12px", padding: "16px", backgroundColor: T.surface }}>
          <div className="min-w-[800px] md:min-w-[700px]">
            <div className="flex ml-12 border-b mb-2" style={{ borderColor: T.border }}>
              {DIAS_SEMANA.map(dia => (
                <div key={dia} className="flex-1 text-center text-xs font-semibold pb-2" style={{ color: T.inkSoft }}>
                  {DIA_LABEL_LONGO[dia]}
                </div>
              ))}
            </div>
            
            <div className="flex relative rounded-b-lg border" style={{ height: (totalMinutes / 60) * HOUR_HEIGHT + Y_OFFSET + 20, backgroundColor: T.surfaceAlt, borderColor: T.border }}>
              <div className="w-12 shrink-0 border-r relative" style={{ borderColor: T.border }}>
                {hourLines.map((line, i) => (
                  <div key={i} className="absolute w-full text-right pr-2 text-[10px]" style={{ top: line.top - 6, color: T.inkSoft }}>
                    {line.label}
                  </div>
                ))}
              </div>
              
              {DIAS_SEMANA.map((dia, idx) => (
                <div key={dia} className="flex-1 relative border-r last:border-0" style={{ borderColor: T.border }} onDragOver={(e) => e.preventDefault()} onDrop={(e) => handleDrop(e, dia)}>
                  {hourLines.map((line, i) => (
                      <div key={i} className="absolute w-full border-t pointer-events-none" style={{ top: line.top, height: 1, borderColor: T.border }}></div>
                    ))}
                  
                  {blocksByDay[dia].map((b) => {
                     const startM = parseTime(b.horaInicio);
                     let adjStart = startM < wakeMin && startM < 4 * 60 ? startM + 24 * 60 : startM; 
                     const endM = parseTime(b.horaFim);
                     let adjEnd = endM <= adjStart ? endM + 24 * 60 : endM;
                     
                     if (adjStart < wakeMin) adjStart = wakeMin;
                     if (adjEnd > sleepMin) adjEnd = sleepMin;
                     if (adjEnd <= adjStart) return null;
                     
                     const top = ((adjStart - wakeMin) / 60) * HOUR_HEIGHT + Y_OFFSET;
                     const height = ((adjEnd - adjStart) / 60) * HOUR_HEIGHT;
                     
                     return (
                       <button
                         key={b.id}
                         onClick={() => setModal({ block: b, dia })} draggable onDragStart={(e) => { e.stopPropagation(); e.dataTransfer.setData("text/plain", b.id); setDragging({ id: b.id, sourceDay: dia }); }} onDragEnd={() => setDragging(null)}
                         className="absolute left-1 right-1 rounded p-1.5 text-left transition-transform hover:scale-[1.02] overflow-hidden"
                         style={{ top, height, backgroundColor: hexToRgba(b.cor, 0.2), borderLeft: `3px solid ${b.cor}` }}
                       >
                         <div className="text-[11px] font-bold truncate leading-tight" style={{ color: T.ink }}>{b.titulo}</div>
                         <div className="text-[9px] mt-0.5 opacity-80 truncate" style={{ color: T.inkSoft }}>{b.horaInicio.slice(0, 5)} - {b.horaFim.slice(0, 5)}</div>
                       </button>
                     );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      {modal === "sono" && <SonoModal routine={routine} onSave={onUpdateRoutine} onClose={() => setModal(null)} />}
      {modal === "preferencias" && <PreferenciasModal routine={routine} onSave={onUpdateRoutine} onClose={() => setModal(null)} />}
      {modal && typeof modal === "object" && (
        <CompromissoRotinaModal
          block={modal.block}
          defaultDia={modal.dia}
          onSave={(data) => (modal.block ? onUpdateBlock(modal.block.id, data) : onAddBlock(data))}
          onDelete={onDeleteBlock}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  );
}




// Dev QA Component
function QAAutomatedSystem({ userId }) {
  const [logs, setLogs] = useState([]);
  const [running, setRunning] = useState(false);

  const addLog = (msg, type = "info") => setLogs(prev => [...prev, { time: new Date().toLocaleTimeString(), msg, type }]);

  async function runAllTests() {
    setRunning(true);
    setLogs([]);
    addLog("Iniciando bateria de testes automatizados QA...", "info");

    // 1. Storage Test
    try {
      addLog("Testando LocalStorage e IndexedDB...", "info");
      localStorage.setItem("qa_test", "ok");
      if (localStorage.getItem("qa_test") !== "ok") throw new Error("LocalStorage falhou");
      localStorage.removeItem("qa_test");
      addLog("Storage OK.", "success");
    } catch(e) { addLog("Erro Storage: " + e.message, "error"); }

    // 2. Database CRUD Test
    try {
      addLog("Testando Supabase CRUD...", "info");
      const tempId = "qa-" + Math.random().toString(36).substr(2, 5);
      const { addCommitment, deleteCommitment } = await import("../lib/db.js");
      const c = await addCommitment(userId, { tipo: 'outro', disciplina: 'QA_TEST', assunto: 'Teste Automatizado', prazo: '2099-12-31', concluido: false });
      if (!c || !c.id) throw new Error("Falha ao inserir compromisso.");
      await deleteCommitment(c.id);
      addLog("Supabase CRUD OK.", "success");
    } catch(e) { addLog("Erro Supabase: " + e.message, "error"); }

    // 3. AI Connection Test
    try {
      addLog("Testando conexão Groq (callAI)...", "info");
      const { callAI } = await import("../lib/ai.js");
      const res = await callAI("Responda apenas 'OK'", "Teste de QA", { json: false });
      if (!res.includes("OK")) throw new Error("Resposta da IA inesperada: " + res);
      addLog("Conexão Groq OK.", "success");
    } catch(e) { addLog("Erro Groq IA: " + e.message, "error"); }

    // 4. Supabase Realtime
    try {
      addLog("Testando Supabase Realtime WebSockets...", "info");
      const { supabase } = await import("../lib/supabaseClient.js");
      const channel = supabase.channel('qa_test_channel');
      await new Promise((resolve, reject) => {
        channel.subscribe(async (status) => {
          if (status === 'SUBSCRIBED') {
            await supabase.removeChannel(channel);
            resolve();
          } else if (status === 'CHANNEL_ERROR') {
            reject(new Error("Falha ao assinar canal"));
          }
        });
        setTimeout(() => reject(new Error("Timeout no WebSocket")), 5000);
      });
      addLog("Supabase Realtime OK.", "success");
    } catch(e) { addLog("Erro Realtime: " + e.message, "error"); }

    addLog("Bateria de testes finalizada.", "info");
    setRunning(false);
  }

  return (
    <section className='p-6 rounded-2xl shadow-sm border mt-6' style={{ backgroundColor: T.surface, borderColor: T.importante }}>
      <div className='flex items-center justify-between mb-4'>
        <h3 className='text-xl font-bold' style={{ color: T.importante }}><Wrench size={20} className="inline mr-2 -mt-1" /> Painel do Desenvolvedor (QA)</h3>
        <PrimaryButton onClick={runAllTests} disabled={running}>{running ? "Rodando Testes..." : "Executar Testes QA"}</PrimaryButton>
      </div>
      <div className='bg-black p-4 rounded-lg h-64 overflow-y-auto font-mono text-xs shadow-inner'>
        {logs.length === 0 && <span className="text-gray-500">Aguardando execução...</span>}
        {logs.map((l, i) => (
          <div key={i} className={`mb-1 ${l.type === 'error' ? 'text-red-500' : l.type === 'success' ? 'text-green-500' : 'text-blue-300'}`}>
            <span className="text-gray-600">[{l.time}]</span> {l.msg}
          </div>
        ))}
      </div>
    </section>
  );
}

class ConfigErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = { hasError: false, error: null }; }
  static getDerivedStateFromError(error) { return { hasError: true, error: error }; }
  componentDidCatch(error, errorInfo) { console.error("ConfigTab Error:", error, errorInfo); }
  render() {
    if (this.state.hasError) {
      return React.createElement('div', { className: 'p-10 text-red-500 font-bold' }, 'Erro fatal: ' + (this.state.error && this.state.error.message));
    }
    return this.props.children;
  }
}
export function ConfigTab(props) {
  return React.createElement(ConfigErrorBoundary, null, React.createElement(ConfigTabInner, props));
}

function ConfigTabInner({ config = {}, updateConfig, userId }) {
  const [devClicks, setDevClicks] = useState(0);
  const isDev = devClicks >= 5;
  const safeConfig = { enablePdf: true, enableCalendar: true, enableGamification: true, enableLofi: true, ...(config || {}) };
  const handleToggle = (key) => {
    updateConfig({ ...safeConfig, [key]: !safeConfig[key] });
  };
  return (
    <div className='max-w-3xl mx-auto space-y-6'>
      <h2 onClick={() => setDevClicks(c => c + 1)} className='text-3xl font-bold mb-6 select-none cursor-pointer' style={{ color: T.ink }}>Configurações</h2>

      <section className='p-6 rounded-2xl shadow-sm border' style={{ backgroundColor: T.surface, borderColor: T.border }}>
        <div className='flex items-center gap-3 mb-4'>
          <Palette className='w-6 h-6' style={{ color: T.brand }} />
          <h3 className='text-xl font-bold' style={{ color: T.ink }}>Aparência e Temas</h3>
        </div>
        <p className='mb-6' style={{ color: T.inkSoft }}>Personalize as cores do aplicativo. A logo se ajustará automaticamente ao tema escolhido.</p>
        
        <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
          {Object.keys(THEMES).map(t => (
            <button key={t} onClick={() => applyTheme(t)} className='flex items-center justify-between p-4 rounded-xl border hover:opacity-80 transition-opacity'
              style={{ backgroundColor: THEMES[t].bg, borderColor: THEMES[t].border }}>
              <span className='font-bold capitalize' style={{ color: THEMES[t].ink }}>{t === 'dark' ? 'Omnia Dark' : t === 'light' ? 'Omnia Light' : t === 'cyberpunk' ? 'Cyberpunk Neon' : 'Lo-Fi Café'}</span>
              <div className='flex gap-2'>
                <div className='w-5 h-5 rounded-full shadow-sm' style={{ backgroundColor: THEMES[t].brand }}></div>
                <div className='w-5 h-5 rounded-full shadow-sm' style={{ backgroundColor: THEMES[t].surface }}></div>
              </div>
            </button>
          ))}
        </div>
      </section>

      <section className='p-6 rounded-2xl shadow-sm border' style={{ backgroundColor: T.surface, borderColor: T.border }}>
        <div className='flex items-center gap-3 mb-4'>
          <Settings className='w-6 h-6' style={{ color: T.brand }} />
          <h3 className='text-xl font-bold' style={{ color: T.ink }}>Módulos Opcionais</h3>
        </div>
        <p className='mb-6' style={{ color: T.inkSoft }}>Ative ou desative funcionalidades secundárias para manter a interface limpa e objetiva.</p>

        <div className='space-y-4'>
          <label className='flex items-center justify-between p-4 rounded-xl border cursor-pointer hover:opacity-80 transition-opacity' style={{ borderColor: T.border, backgroundColor: T.bg }}>
            <div>
              <div className='font-bold' style={{ color: T.ink }}><Gamepad2 size={20} className="inline mr-2 -mt-1" /> Gamificação Completa</div>
              <div className='text-sm mt-1' style={{ color: T.inkSoft }}>Aba Desempenho, XP, Nível e Streak.</div>
            </div>
            <input type='checkbox' checked={safeConfig.enableGamification} onChange={() => handleToggle('enableGamification')} className='w-6 h-6 accent-blue-500' />
          </label>

          <label className='flex items-center justify-between p-4 rounded-xl border cursor-pointer hover:opacity-80 transition-opacity' style={{ borderColor: T.border, backgroundColor: T.bg }}>
            <div>
              <div className='font-bold' style={{ color: T.ink }}><Headphones size={20} className="inline mr-2 -mt-1" /> Modo Imersivo Lo-Fi</div>
              <div className='text-sm mt-1' style={{ color: T.inkSoft }}>Player de música ambiente integrado na aba Foco.</div>
            </div>
            <input type='checkbox' checked={safeConfig.enableLofi} onChange={() => handleToggle('enableLofi')} className='w-6 h-6 accent-blue-500' />
          </label>

          <label className='flex items-center justify-between p-4 rounded-xl border cursor-pointer hover:opacity-80 transition-opacity' style={{ borderColor: T.border, backgroundColor: T.bg }}>
            <div>
              <div className='font-bold' style={{ color: T.ink }}><Calendar size={20} className="inline mr-2 -mt-1" /> Sincronizar Calendário (Google/Apple)</div>
              <div className='text-sm mt-1' style={{ color: T.inkSoft }}>Botão para exportar arquivos .ics da Rotina.</div>
            </div>
            <input type='checkbox' checked={safeConfig.enableCalendar} onChange={() => handleToggle('enableCalendar')} className='w-6 h-6 accent-blue-500' />
          </label>

          <label className='flex items-center justify-between p-4 rounded-xl border cursor-pointer hover:opacity-80 transition-opacity' style={{ borderColor: T.border, backgroundColor: T.bg }}>
            <div>
              <div className='font-bold' style={{ color: T.ink }}><FileText size={20} className="inline mr-2 -mt-1" /> Gerar PDF da Rotina</div>
              <div className='text-sm mt-1' style={{ color: T.inkSoft }}>Botão para baixar a Tabela de Horários em PDF.</div>
            </div>
            <input type='checkbox' checked={safeConfig.enablePdf} onChange={() => handleToggle('enablePdf')} className='w-6 h-6 accent-blue-500' />
          </label>
        </div>
      </section>

      <section className='p-6 rounded-2xl shadow-sm border' style={{ backgroundColor: T.surface, borderColor: T.border }}>
        <div className='flex items-center gap-3 mb-4'>
          <h3 className='text-xl font-bold' style={{ color: T.ink }}><Key size={20} className="inline mr-2 -mt-1" /> Inteligência Artificial</h3>
        </div>
        <p className='mb-4 text-sm' style={{ color: T.inkSoft }}>Insira sua própria chave de API da Groq para ter limite de uso individual, independente dos outros usuários. Deixe em branco para usar a chave padrão do Omnia.</p>
        <a href='https://console.groq.com/keys' target='_blank' rel='noopener noreferrer' className='text-xs underline mb-4 block' style={{ color: T.brand }}>→ Criar chave gratuita em console.groq.com/keys</a>
        <input
          type='password'
          placeholder='gsk_...'
          value={safeConfig.groqApiKey || ''}
          onChange={(e) => updateConfig({ ...safeConfig, groqApiKey: e.target.value })}
          className='w-full p-3 rounded-xl text-sm'
          style={{ backgroundColor: T.surfaceAlt, color: T.ink, border: `1px solid ${T.border}` }}
        />
        {safeConfig.groqApiKey && <p className='text-xs mt-2' style={{ color: T.brand }}><Check size={14} className="inline mr-1 -mt-0.5" /> Chave pessoal configurada</p>}
      </section>
      {isDev && <QAAutomatedSystem userId={userId} />}
    </div>
  );
}