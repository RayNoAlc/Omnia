import React from 'react';
import localforage from 'localforage';
import { useState, useEffect, useRef } from "react";
import { Loader2 } from "lucide-react";
import { supabase } from "./lib/supabaseClient";
import Auth from "./components/Auth";
import {
  Header, TabNav, HojeTab, InboxTab, AgendaTab, DesempenhoTab,
  BibliotecaTab, FocoTab, SecretariaTab, RotinaTab, ConfigTab,
} from "./components/Tabs";
import { T } from "./components/ui";
import confetti from "canvas-confetti";
import {
  fetchRoutine, createDefaultRoutine, updateRoutine,
  fetchRoutineBlocks, addRoutineBlock, updateRoutineBlock, deleteRoutineBlock,
  fetchRoutineExceptions, deleteRoutineException,
  fetchCommitments, addCommitment, deleteCommitment,
  fetchStudyBlocks, insertStudyBlocks, deletePendingBlocksForCommitment, toggleBlockDone,
  fetchNotes, addNote, deleteNote,
  fetchSummaries, fetchQuizAttempts, fetchProfessorAttempts, fetchSessions, fetchMaterials,
  fetchStudyGoals, upsertStudyGoal,
} from "./lib/db";
import { classifyInboxText } from "./lib/aiHelpers";
import { gerarBlocosDeEstudo, todayISO, addDays, uid, getEffectiveRoutineItemsForDate, computeAvisos } from "./lib/utils";
import { useFocusTimer } from "./lib/useFocusTimer";
import { AppLayout } from "./layouts/AppLayout";
import { TABS, applyTheme } from "./components/ui";
import { GlobalSearchModal } from "./components/Tabs.jsx";


class GlobalErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = { hasError: false, error: null }; }
  static getDerivedStateFromError(error) { return { hasError: true, error: error }; }
  componentDidCatch(error, errorInfo) { console.error("Global Crash:", error, errorInfo); }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '2rem', color: 'red', backgroundColor: '#1e1e1e', height: '100vh', fontFamily: 'monospace' }}>
          <h2>Erro Fatal no App.jsx</h2>
          <pre style={{ whiteSpace: 'pre-wrap' }}>{this.state.error && this.state.error.stack}</pre>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  return React.createElement(GlobalErrorBoundary, null, React.createElement(AppInner, null));
}

function AppInner() {
  const [session, setSession] = useState(undefined);
  const [config, setConfig] = useState({ enablePdf: true, enableCalendar: true, enableGamification: true, enableLofi: true });
  useEffect(() => {
    applyTheme(localStorage.getItem("omnia-theme") || "dark");
    const savedCfg = localStorage.getItem("omnia_config");
    if (savedCfg) { const parsed = JSON.parse(savedCfg); if (parsed) setConfig(parsed); }
  }, []); // undefined = carregando, null = deslogado
  const [tab, setTab] = useState("hoje");
  const [isZen, setIsZen] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [initialInboxText, setInitialInboxText] = useState("");
  
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const clipperText = params.get('clipperText');
    const clipperTitle = params.get('clipperTitle');
    const clipperUrl = params.get('clipperUrl');
    
    if (clipperText || clipperUrl) {
      const compiled = `[${clipperTitle || 'Sem Título'}](${clipperUrl || ''})\n\n${clipperText || ''}`;
      setInitialInboxText(compiled);
      setTab("inbox");
      
      // Clean URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  const updateConfig = (newCfg) => { setConfig(newCfg); localStorage.setItem("omnia_config", JSON.stringify(newCfg)); };
  const [dataLoaded, setDataLoaded] = useState(false);

  const [routine, setRoutine] = useState(null);
  const [routineBlocks, setRoutineBlocks] = useState([]);
  const [routineExceptions, setRoutineExceptions] = useState([]);
  const [commitments, setCommitments] = useState([]);
  const [studyBlocks, setStudyBlocks] = useState([]);
  const [notes, setNotes] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [summaries, setSummaries] = useState([]);
  const [quizAttempts, setQuizAttempts] = useState([]);
  const [professorAttempts, setProfessorAttempts] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [studyGoals, setStudyGoals] = useState([]);

  const [inboxLoading, setInboxLoading] = useState(false);
  const [inboxError, setInboxError] = useState(null);
  const [pendingReview, setPendingReview] = useState(null);

  /* ---------------- Notificacoes ---------------- */
  const notifiedBlocks = useRef(new Set());
  useEffect(() => {
    if (!dataLoaded || routineBlocks.length === 0) return;
    
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
    
    const interval = setInterval(() => {
      if (!('Notification' in window) || Notification.permission !== 'granted') return;
      
      const now = new Date();
      const dias = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'];
      const diaAtual = dias[now.getDay()];
      
      const h = now.getHours();
      const m = now.getMinutes();
      const currentMins = h * 60 + m;
      
      routineBlocks.forEach(b => {
        if (b.diaSemana !== diaAtual) return;
        const [bH, bM] = b.horaInicio.split(':').map(Number);
        const blockMins = bH * 60 + bM;
        
        const diff = blockMins - currentMins;
        if (diff <= 10 && diff >= 0) {
          const key = b.id + '-' + now.toDateString();
          if (!notifiedBlocks.current.has(key)) {
            new Notification('Omnia - Lembrete', {
              body: b.titulo + ' começa em ' + diff + ' minutos!',
              icon: '/omnia.png'
            });
            notifiedBlocks.current.add(key);
          }
        }
      });
    }, 10000);
    
    return () => clearInterval(interval);
  }, [dataLoaded, routineBlocks]);

  /* ---------------- Autenticacao ---------------- */
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, sess) => {
      setSession(sess);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  /* ---------------- Carregamento de dados ---------------- */
  useEffect(() => {
    if (!session) { setDataLoaded(false); return; }
    const userId = session.user.id;
    (async () => {
      const cache = await localforage.getItem('omnia_cache_' + userId);
      if (cache) {
        setRoutine(cache.r || null);
        setRoutineBlocks(cache.rb || []);
        setRoutineExceptions(cache.rex || []);
        setCommitments(cache.c || []);
        setStudyBlocks(cache.sb || []);
        setNotes(cache.n || []);
        setSessions(cache.s || []);
        setSummaries(cache.sm || []);
        setQuizAttempts(cache.qa || []);
        setProfessorAttempts(cache.pa || []);
        setMaterials(cache.mt || []);
        setStudyGoals(cache.sg || []);
        setDataLoaded(true);
      }
      
      if (navigator.onLine) {
        let r = await fetchRoutine(userId);
        if (!r) r = await createDefaultRoutine(userId);
        const [rb, rex, c, sb, n, s, sm, qa, pa, mt, sg] = await Promise.all([
          fetchRoutineBlocks(userId),
          fetchRoutineExceptions(userId),
          fetchCommitments(userId),
          fetchStudyBlocks(userId),
          fetchNotes(userId),
          fetchSessions(userId),
          fetchSummaries(userId),
          fetchQuizAttempts(userId),
          fetchProfessorAttempts(userId),
          fetchMaterials(userId),
          fetchStudyGoals(userId),
        ]);
        
        setRoutine(r); setRoutineBlocks(rb); setRoutineExceptions(rex); setCommitments(c); setStudyBlocks(sb);
        setNotes(n); setSessions(s); setSummaries(sm); setQuizAttempts(qa); setProfessorAttempts(pa);
        setMaterials(mt); setStudyGoals(sg);
        
        await localforage.setItem('omnia_cache_' + userId, { r, rb, rex, c, sb, n, s, sm, qa, pa, mt, sg });
        setDataLoaded(true);
      }
    })();
  }, [session]);

  const userId = session?.user?.id;

  const focusTimer = useFocusTimer({ userId, commitments, setSessions });

  const disciplinasConhecidas = Array.from(
    new Set([...commitments.map((c) => c.disciplina), ...notes.map((n) => n.disciplina)])
  ).filter(Boolean);

  /* ---------------- Inbox / classificação por IA ---------------- */
  async function handleInboxSubmit(text) {
    if (!text.trim() || inboxLoading) return;
    setInboxLoading(true);
    setInboxError(null);
    try {
      const result = await classifyInboxText(text, disciplinasConhecidas);
      setPendingReview({ ...result, origemTexto: text, id: uid() });
    } catch (e) {
      setInboxError("Não consegui interpretar agora. Tente de novo ou preencha manualmente na revisão.");
      setPendingReview({
        tipo: "outro", disciplina: "", assunto: text.slice(0, 60), prazo: null, prioridade: "normal",
        resumo: "Classificação automática indisponível — revise os campos manualmente.",
        incerto: ["tipo", "disciplina", "prazo", "prioridade"], origemTexto: text, id: uid(),
      });
    } finally {
      setInboxLoading(false);
    }
  }

  async function confirmPendingReview(edited) {
    const saved = await addCommitment(userId, edited);
    setCommitments((prev) => [saved, ...prev]);
    if (saved.tipo === "prova" && saved.prazo) {
      const blocks = gerarBlocosDeEstudo(saved, routine, routineBlocks, routineExceptions);
      if (blocks.length) {
        const savedBlocks = await insertStudyBlocks(userId, blocks);
        setStudyBlocks((prev) => [...prev, ...savedBlocks]);
      }
    }
    setPendingReview(null);
    return saved;
  }

  async function saveAsNote(edited) {
    const texto = edited.texto || edited.origemTexto || "";
    const saved = await addNote(userId, { disciplina: edited.disciplina || "Geral", texto });
    setNotes((prev) => [saved, ...prev]);
    setPendingReview(null);
  }

  async function handleDeleteCommitment(id) {
    await deleteCommitment(id); // cascade apaga os study_blocks relacionados no banco
    setCommitments((prev) => prev.filter((c) => c.id !== id));
    setStudyBlocks((prev) => prev.filter((b) => b.commitmentId !== id));
  }
  async function handleDeleteNote(id) {
    await deleteNote(id);
    setNotes((prev) => prev.filter((n) => n.id !== id));
  }
  async function handleToggleBlock(id) {
    const block = studyBlocks.find((b) => b.id === id);
    if (!block) return;
    if (!block.done && config?.enableConfetti !== false) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#3b82f6', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6'],
        zIndex: 9999
      });
    }
    await toggleBlockDone(id, !block.done);
    setStudyBlocks((prev) => prev.map((b) => (b.id === id ? { ...b, done: !b.done } : b)));
  }

  /* ---------------- Replanejamento dinâmico ---------------- */
  async function handleReplan(commitment) {
    await deletePendingBlocksForCommitment(commitment.id);
    const novos = gerarBlocosDeEstudo(commitment, routine, routineBlocks, routineExceptions);
    const saved = novos.length ? await insertStudyBlocks(userId, novos) : [];
    setStudyBlocks((prev) => [...prev.filter((b) => b.commitmentId !== commitment.id || b.done), ...saved]);
  }
  async function handleReduzir(commitment) {
    await deletePendingBlocksForCommitment(commitment.id);
    const hoje = todayISO();
    const revisaoDate = addDays(commitment.prazo, -1) > hoje ? addDays(commitment.prazo, -1) : hoje;
    let saved = [];
    if (revisaoDate < commitment.prazo) {
      saved = await insertStudyBlocks(userId, [{
        commitmentId: commitment.id, disciplina: commitment.disciplina,
        assunto: `Revisão final — ${commitment.assunto}`, date: revisaoDate,
        periodo: routine.periodoPreferido || "noite", tipo: "revisao", done: false,
      }]);
    }
    setStudyBlocks((prev) => [...prev.filter((b) => b.commitmentId !== commitment.id || b.done), ...saved]);
  }

  /* ---------------- Rotina ---------------- */
  async function handleUpdateRoutine(patch) {
    setRoutine((prev) => ({ ...prev, ...patch }));
    await updateRoutine(userId, patch);
  }
  async function handleAddRoutineBlock(block) {
    const saved = await addRoutineBlock(userId, block);
    setRoutineBlocks((prev) => [...prev, saved]);
  }
  async function handleUpdateRoutineBlock(id, patch) {
    const saved = await updateRoutineBlock(id, patch);
    setRoutineBlocks((prev) => prev.map((b) => (b.id === id ? saved : b)));
  }
  async function handleDeleteRoutineBlock(id) {
    await deleteRoutineBlock(id);
    setRoutineBlocks((prev) => prev.filter((b) => b.id !== id));
  }
  async function handleDeleteException(id) {
    await deleteRoutineException(id);
    setRoutineExceptions((prev) => prev.filter((e) => e.id !== id));
  }

  /* ---------------- Renderização ---------------- */
  if (session === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: T.bg }}>
        <Loader2 className="w-6 h-6 animate-spin" style={{ color: T.inkSoft }} />
      </div>
    );
  }
  if (!session) return <Auth />;

  const hoje = todayISO();
  const overdue = commitments.filter((c) => c.prazo && c.prazo < hoje);
  const blocksHoje = studyBlocks.filter((b) => b.date === hoje);
  const commitmentsHoje = visibleCommitments.filter((c) => c.prazo === hoje);
  const proximos = commitments.filter((c) => c.prazo && c.prazo > hoje).sort((a, b) => a.prazo.localeCompare(b.prazo)).slice(0, 4);
  const overloadWindow = commitments.filter((c) => c.prazo && c.prazo >= hoje && c.prazo <= addDays(hoje, 7)).sort((a, b) => a.prazo.localeCompare(b.prazo));
  const routineItemsHoje = getEffectiveRoutineItemsForDate(hoje, routine, routineBlocks, routineExceptions);
  const metaHoje = studyGoals.find((g) => g.date === hoje)?.metaMinutos || null;
  const minutosEstudadosHoje = sessions.filter((s) => s.date === hoje).reduce((a, s) => a + s.minutos, 0);

  async function handleSetMeta(minutos) {
    const saved = await upsertStudyGoal(userId, hoje, minutos);
    setStudyGoals((prev) => {
      const outros = prev.filter((g) => g.date !== hoje);
      return [...outros, saved];
    });
  }

  const avisos = computeAvisos({ hoje, horaAtual: new Date().getHours(), commitments, studyBlocks, metaHoje, minutosEstudadosHoje });

    
  const visibleCommitments = config?.showArchived ? commitments : commitments.filter(c => !(c.assunto||"").toLowerCase().includes('#arquivado') && !(c.disciplina||"").toLowerCase().includes('#arquivado'));
  const visibleNotes = config?.showArchived ? notes : notes.filter(n => !(n.texto||"").toLowerCase().includes('#arquivado') && !(n.disciplina||"").toLowerCase().includes('#arquivado'));

  const visibleTabs = TABS.filter(t => t.id !== "desempenho" || config?.enableGamification);
    return (
    <AppLayout activeTab={tab} onTabChange={setTab} TABS={visibleTabs} onLogout={() => supabase.auth.signOut()} isZen={isZen}>
      {!dataLoaded ? (
        <div className="py-16 flex justify-center" style={{ color: T.inkSoft }}>
          <Loader2 className="w-5 h-5 animate-spin" />
        </div>
      ) : (
        <>
          {tab === "hoje" && (
            <HojeTab overdue={overdue} blocksHoje={blocksHoje} commitmentsHoje={commitmentsHoje} routineItemsHoje={routineItemsHoje} proximos={proximos} overload={overloadWindow} onToggleBlock={handleToggleBlock} onGoInbox={() => setTab("inbox")} onGoAgenda={() => setTab("agenda")} routine={routine} metaHoje={metaHoje} onSetMeta={handleSetMeta} minutosEstudadosHoje={minutosEstudadosHoje} avisos={avisos} config={config} notes={visibleNotes} onSaveNote={saveAsNote} />
          )}
          {tab === "inbox" && (
            <InboxTab userId={userId} initialInboxText={initialInboxText} setInitialInboxText={setInitialInboxText} onSubmit={handleInboxSubmit} loading={inboxLoading} error={inboxError}
              pendingReview={pendingReview} setPendingReview={setPendingReview}
              onConfirm={confirmPendingReview} onSaveNote={saveAsNote} setMaterials={setMaterials} />
          )}
          {tab === "agenda" && (
            <AgendaTab userId={userId} commitments={visibleCommitments} studyBlocks={studyBlocks}
              onDeleteCommitment={handleDeleteCommitment} onToggleBlock={handleToggleBlock}
              onReplan={handleReplan} onReduzir={handleReduzir}
              routine={routine} routineBlocks={routineBlocks} routineExceptions={routineExceptions}
              notes={visibleNotes} materials={materials} summaries={summaries}
              quizAttempts={quizAttempts} professorAttempts={professorAttempts}
              setNotes={setNotes} setMaterials={setMaterials} setSummaries={setSummaries}
              setQuizAttempts={setQuizAttempts} setProfessorAttempts={setProfessorAttempts} />
          )}
          {tab === "desempenho" && (
            <DesempenhoTab commitments={visibleCommitments} sessions={sessions}
              quizAttempts={quizAttempts} professorAttempts={professorAttempts} />
          )}
          {tab === "biblioteca" && (
            <BibliotecaTab userId={userId} setCommitments={setCommitments} onDeleteCommitment={handleDeleteCommitment} notes={visibleNotes} commitments={visibleCommitments} materials={materials}
              quizAttempts={quizAttempts} professorAttempts={professorAttempts}
              onDeleteNote={handleDeleteNote} summaries={summaries} setSummaries={setSummaries}
              setNotes={setNotes} setMaterials={setMaterials}
              setQuizAttempts={setQuizAttempts} setProfessorAttempts={setProfessorAttempts} />
          )}
          {tab === "foco" && (
              <FocoTab isZen={isZen} setIsZen={setIsZen} config={config} updateConfig={updateConfig} userId={userId} commitments={visibleCommitments} sessions={sessions} metaHoje={metaHoje} timer={focusTimer}
              notes={visibleNotes} materials={materials} summaries={summaries}
              quizAttempts={quizAttempts} professorAttempts={professorAttempts}
              setNotes={setNotes} setMaterials={setMaterials} setSummaries={setSummaries}
              setQuizAttempts={setQuizAttempts} setProfessorAttempts={setProfessorAttempts} />
          )}
          {tab === "secretaria" && (
            <SecretariaTab userId={userId} routine={routine} routineBlocks={routineBlocks} routineExceptions={routineExceptions} commitments={visibleCommitments} studyBlocks={studyBlocks} notes={visibleNotes} sessions={sessions} setRoutineBlocks={setRoutineBlocks} setRoutineExceptions={setRoutineExceptions} config={config} />
          )}
          {tab === "config" && <ConfigTab config={config} updateConfig={updateConfig} userId={userId} />}
            {tab === "rotina" && (
            <RotinaTab config={config} routine={routine} routineBlocks={routineBlocks} routineExceptions={routineExceptions} onUpdateRoutine={handleUpdateRoutine}
              onAddBlock={handleAddRoutineBlock} onUpdateBlock={handleUpdateRoutineBlock} onDeleteBlock={handleDeleteRoutineBlock}
              onDeleteException={handleDeleteException} />
          )}
        </>
      )}
      {showSearch && <GlobalSearchModal onClose={() => setShowSearch(false)} setTab={setTab} commitments={visibleCommitments} notes={visibleNotes} materials={materials} />}
    </AppLayout>
  );
}
