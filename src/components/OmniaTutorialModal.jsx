import React, { useState, useEffect, useRef } from 'react';
import {
  X, Compass, BookOpen, ChevronRight, ChevronLeft, Search, Sparkles,
  CheckCircle2, Play, Lightbulb, ArrowRight, HelpCircle, Check,
  Clock, Calendar, Book, FileText, Award, GraduationCap, MessageCircle,
  BookHeart, Settings, Key, Sun, CalendarDays, Trophy, Zap, ChevronUp, ChevronDown,
  RotateCcw
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { T, TINT } from './ui';
import { sfx } from '../lib/soundEffects';
import { TUTORIAL_STEPS, OMNIA_MANUAL_SECTIONS, INTERACTIVE_QUESTS } from '../lib/tutorialData';

const SECTION_ICONS = {
  Sun: Sun,
  CalendarDays: CalendarDays,
  Calendar: Calendar,
  Clock: Clock,
  BookOpen: BookOpen,
  FileText: FileText,
  Award: Award,
  GraduationCap: GraduationCap,
  MessageCircle: MessageCircle,
  BookHeart: BookHeart,
  Settings: Settings,
  Key: Key,
};

export function OmniaTutorialModal({
  isOpen,
  onClose,
  activeTab,
  onTabChange,
  initialMode = 'tour',
  initialStepIndex = 0,
}) {
  const [mode, setMode] = useState(initialMode); // 'tour' | 'manual'
  const [questIdx, setQuestIdx] = useState(0);
  const [questCompleted, setQuestCompleted] = useState(false);
  const [questToast, setQuestToast] = useState(null);
  const [showLevelUpModal, setShowLevelUpModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeManualSection, setActiveManualSection] = useState('manual-hoje');
  const [isMinimized, setIsMinimized] = useState(false);

  const totalQuests = INTERACTIVE_QUESTS.length;
  const currentQuest = INTERACTIVE_QUESTS[questIdx] || INTERACTIVE_QUESTS[0];
  const progressPct = Math.round(((questIdx + 1) / totalQuests) * 100);

  // Sync mode with props when opened
  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      setShowLevelUpModal(false);
      setQuestCompleted(false);
      setQuestToast(null);
      if (initialStepIndex >= 0 && initialStepIndex < INTERACTIVE_QUESTS.length) {
        setQuestIdx(initialStepIndex);
      } else {
        setQuestIdx(0);
      }
    }
  }, [isOpen, initialMode, initialStepIndex]);

  // Navigate to quest tab if not already there
  useEffect(() => {
    if (!isOpen || mode !== 'tour' || showLevelUpModal) return;

    if (currentQuest.tab && onTabChange && activeTab !== currentQuest.tab) {
      onTabChange(currentQuest.tab);
    }
  }, [isOpen, mode, questIdx, currentQuest, activeTab, onTabChange, showLevelUpModal]);

  // Complete current quest helper
  const completeCurrentQuest = () => {
    if (questCompleted) return;
    setQuestCompleted(true);
    sfx.complete();

    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.8 },
        zIndex: 99999
      });
    } catch {}

    setQuestToast(currentQuest.successToast || '✨ Missão Cumprida! +50 XP');

    setTimeout(() => {
      setQuestToast(null);
      setQuestCompleted(false);

      if (questIdx < totalQuests - 1) {
        setQuestIdx(idx => idx + 1);
      } else {
        // Last quest finished! Level up celebration
        sfx.complete();
        try {
          confetti({
            particleCount: 120,
            spread: 80,
            origin: { y: 0.5 },
            zIndex: 99999
          });
        } catch {}
        setShowLevelUpModal(true);
      }
    }, 850);
  };

  // Event listener for hands-on interactive user actions
  useEffect(() => {
    if (!isOpen || mode !== 'tour' || showLevelUpModal) return;

    // Remove previous highlighted target elements
    document.querySelectorAll('.omnia-quest-target').forEach(el => {
      el.classList.remove('omnia-quest-target');
    });

    let targetEl = null;
    let actionEls = [];

    const handleActionClick = () => {
      completeCurrentQuest();
    };

    const timer = setTimeout(() => {
      // Find and spotlight target element
      if (currentQuest.targetSelector) {
        targetEl = document.querySelector(currentQuest.targetSelector);
        if (targetEl) {
          targetEl.classList.add('omnia-quest-target');
          targetEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }

      // Determine which elements trigger quest completion
      if (currentQuest.actionSelector) {
        actionEls = Array.from(document.querySelectorAll(currentQuest.actionSelector));
      } else if (targetEl) {
        actionEls = [targetEl];
      }

      // Attach click listeners to all action elements
      actionEls.forEach(el => {
        el.addEventListener('click', handleActionClick, { passive: true });
      });
    }, 380);

    return () => {
      clearTimeout(timer);
      actionEls.forEach(el => {
        el.removeEventListener('click', handleActionClick);
      });
      document.querySelectorAll('.omnia-quest-target').forEach(el => {
        el.classList.remove('omnia-quest-target');
      });
    };
  }, [isOpen, mode, questIdx, currentQuest, showLevelUpModal]);

  // Tab change watcher: if the quest objective is navigating to a tab, detect when activeTab matches
  useEffect(() => {
    if (!isOpen || mode !== 'tour' || showLevelUpModal) return;
    if (currentQuest.actionType === 'tab_change' && currentQuest.destinationTab) {
      if (activeTab === currentQuest.destinationTab) {
        completeCurrentQuest();
      }
    }
  }, [isOpen, mode, activeTab, currentQuest, showLevelUpModal]);

  // Skip action manually (for accessibility or user preference)
  const handleSkipAction = () => {
    sfx.pop();
    if (questIdx < totalQuests - 1) {
      setQuestIdx(idx => idx + 1);
    } else {
      setShowLevelUpModal(true);
    }
  };

  // Finish tutorial permanently and store flag
  const handleFinishTutorial = () => {
    sfx.pop();
    try {
      localStorage.setItem('omnia_tutorial_seen', 'true');
      localStorage.setItem('omnia_tutorial_completed', 'true');
    } catch {}
    setShowLevelUpModal(false);
    onClose();
  };

  // Jump to specific chapter in the reference manual
  const jumpToTabSection = (tabId) => {
    const foundSection = OMNIA_MANUAL_SECTIONS.find(s => s.tab === tabId);
    if (foundSection) {
      setActiveManualSection(foundSection.id);
    }
    setMode('manual');
  };

  if (!isOpen) return null;

  // Filter manual chapters if in manual mode
  const filteredManualSections = OMNIA_MANUAL_SECTIONS.filter(sec => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const titleMatch = sec.title.toLowerCase().includes(q);
    const descMatch = sec.description.toLowerCase().includes(q);
    const itemMatch = sec.items && sec.items.some(i => i.name.toLowerCase().includes(q) || i.desc.toLowerCase().includes(q));
    return titleMatch || descMatch || itemMatch;
  });

  const activeSectionData = OMNIA_MANUAL_SECTIONS.find(s => s.id === activeManualSection) || OMNIA_MANUAL_SECTIONS[0];

  return (
    <>
      {/* ---------------- 1. MODAL DE FORMATURA & LEVEL UP (VITÓRIA) ---------------- */}
      {showLevelUpModal && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div
            className="w-full max-w-lg rounded-3xl border shadow-2xl p-6 sm:p-8 text-center flex flex-col items-center relative overflow-hidden animate-scale-up"
            style={{ backgroundColor: T.surface, borderColor: T.brand, color: T.ink }}
          >
            {/* Glowing background halo */}
            <div
              className="absolute -top-24 left-1/2 -translate-x-1/2 w-72 h-72 rounded-full blur-3xl opacity-30 pointer-events-none"
              style={{ backgroundColor: T.brand }}
            />

            <div
              className="w-20 h-20 rounded-2xl flex items-center justify-center mb-5 border shadow-lg"
              style={{ backgroundColor: `${T.brand}22`, borderColor: T.brand, color: T.brand }}
            >
              <Trophy size={42} className="animate-bounce" />
            </div>

            <span className="px-3 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-wider bg-amber-500/20 text-amber-400 border border-amber-500/30 mb-2">
              FORMATURA DE RECRUTA CONCLUÍDA
            </span>

            <h2 className="text-2xl sm:text-3xl font-black tracking-tight" style={{ color: T.ink }}>
              Parabéns, Você Dominou o Omnia!
            </h2>

            <p className="text-sm mt-3 leading-relaxed" style={{ color: T.inkSoft }}>
              Você completou com sucesso todas as missões práticas de treinamento e colocou seus hábitos, foco e ferramentas para funcionar!
            </p>

            {/* Recompensa XP Box */}
            <div
              className="w-full my-5 p-4 rounded-2xl border flex items-center justify-between gap-3 text-left"
              style={{ backgroundColor: T.surfaceAlt, borderColor: T.border }}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-amber-500/20 text-amber-400 border border-amber-500/30 font-bold">
                  <Award size={20} />
                </div>
                <div>
                  <div className="font-bold text-sm" style={{ color: T.ink }}>Insígnia: Mestre dos Estudos</div>
                  <div className="text-xs" style={{ color: T.inkSoft }}>Desbloqueada no seu perfil acadêmico</div>
                </div>
              </div>
              <span className="font-mono font-bold text-sm text-emerald-400">+250 XP</span>
            </div>

            {/* Aviso Permanente de Onde Achar o Manual */}
            <div
              className="w-full p-3.5 rounded-xl border text-xs text-left mb-6 flex items-start gap-2.5"
              style={{ backgroundColor: 'rgba(56, 189, 248, 0.08)', borderColor: 'rgba(56, 189, 248, 0.25)', color: T.ink }}
            >
              <Compass size={18} className="text-sky-400 shrink-0 mt-0.5" />
              <div className="leading-relaxed">
                <strong className="text-sky-400 font-semibold">Onde achar o tutorial depois: </strong>
                O tutorial prático e o Manual Completo de 12 capítulos estão guardados permanentemente na aba de <strong>Configurações</strong> para você consultar sempre que tiver dúvidas sobre qualquer botão.
              </div>
            </div>

            <button
              type="button"
              onClick={handleFinishTutorial}
              className="w-full py-3.5 px-6 rounded-2xl font-bold text-sm shadow-xl transition-all haptic-press cursor-pointer hover:opacity-90 flex items-center justify-center gap-2"
              style={{ backgroundColor: T.brand, color: T.brandInk }}
            >
              <Sparkles size={16} /> Começar Minha Jornada Acadêmica!
            </button>
          </div>
        </div>
      )}

      {/* ---------------- 2. MODO QUEST INTERATIVO (GAME HUD NÃO-BLOQUEANTE) ---------------- */}
      {mode === 'tour' && !showLevelUpModal && (
        <>
          {/* Backdrop sutil sem bloquear cliques para manter foco visual */}
          <div
            className="fixed inset-0 z-[99960] pointer-events-none transition-opacity duration-300"
            style={{
              background: 'radial-gradient(circle at center, transparent 35%, rgba(0,0,0,0.55) 100%)',
            }}
          />

          {/* Toast de Missão Cumprida */}
          {questToast && (
            <div
              className="fixed top-6 left-1/2 -translate-x-1/2 z-[99995] px-5 py-3 rounded-2xl border shadow-2xl flex items-center gap-2.5 animate-bounce"
              style={{ backgroundColor: '#0f172a', borderColor: '#10b981', color: '#10b981' }}
            >
              <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />
              <span className="font-bold text-sm text-emerald-300">{questToast}</span>
            </div>
          )}

          {/* GAME QUEST HUD: Dock flutuante na parte inferior da tela */}
          <div
            className="fixed bottom-3 left-3 right-3 sm:left-1/2 sm:-translate-x-1/2 sm:w-full sm:max-w-xl z-[99990] animate-scale-up"
            style={{ color: T.ink }}
          >
            <div
              className="rounded-3xl border shadow-2xl backdrop-blur-xl overflow-hidden transition-all duration-200"
              style={{
                backgroundColor: `${T.surface}F2`,
                borderColor: T.brand,
                boxShadow: '0 20px 40px -10px rgba(0,0,0,0.6), 0 0 20px rgba(56, 189, 248, 0.25)',
              }}
            >
              {/* Barra de Progresso Superior */}
              <div className="w-full h-1.5 bg-slate-800 relative overflow-hidden">
                <div
                  className="h-full transition-all duration-300"
                  style={{
                    width: `${progressPct}%`,
                    backgroundColor: T.brand,
                  }}
                />
              </div>

              {/* Cabeçalho do HUD da Missão */}
              <div className="p-3.5 sm:p-4 flex items-center justify-between gap-3 border-b" style={{ borderColor: T.border }}>
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-2xl overflow-hidden shrink-0 border border-sky-400/30 bg-sky-500/10 flex items-center justify-center shadow-inner">
                    <img
                      src={currentQuest.avatar || '/owl_happy.png'}
                      alt="Guia"
                      className="w-8 h-8 object-contain animate-pet-breathe select-none"
                      onError={(e) => { e.currentTarget.src = "/owl_happy.png"; }}
                    />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold tracking-wider uppercase bg-sky-500/20 text-sky-400 border border-sky-500/40">
                        {currentQuest.badge}
                      </span>
                      <span className="text-[11px] font-mono font-semibold text-emerald-400">
                        +50 XP
                      </span>
                    </div>
                    <div className="font-bold text-xs sm:text-sm truncate mt-0.5" style={{ color: T.ink }}>
                      {currentQuest.title}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => { sfx.tab(); setMode('manual'); }}
                    className="px-2.5 py-1 rounded-xl text-xs font-semibold border flex items-center gap-1.5 transition-colors cursor-pointer hover:bg-white/5"
                    style={{ borderColor: T.border, color: T.inkSoft }}
                    title="Consultar Manual Completo & Documentação"
                  >
                    <BookOpen size={13} />
                    <span className="hidden sm:inline">Manual</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsMinimized(!isMinimized)}
                    className="p-1.5 rounded-xl text-slate-400 hover:text-white transition-colors cursor-pointer"
                    title={isMinimized ? "Expandir" : "Minimizar"}
                  >
                    {isMinimized ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>
                  <button
                    type="button"
                    onClick={handleFinishTutorial}
                    className="p-1.5 rounded-xl text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
                    title="Fechar Tutorial"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>

              {/* Corpo de Instruções da Missão */}
              {!isMinimized && (
                <div className="p-3.5 sm:p-4 space-y-3">
                  {/* Fala do Guia com balão */}
                  <div
                    className="p-3 rounded-2xl border text-xs sm:text-sm leading-relaxed"
                    style={{ backgroundColor: T.surfaceAlt, borderColor: T.border, color: T.inkSoft }}
                  >
                    <span className="font-bold mr-1.5" style={{ color: T.brand }}>{currentQuest.speaker}:</span>
                    {currentQuest.dialogue}
                  </div>

                  {/* Caixa de Ação Exigida (O que o jogador DEVE fazer) */}
                  <div
                    className="p-3 rounded-2xl border flex items-center justify-between gap-3 shadow-sm animate-pulse"
                    style={{
                      backgroundColor: `${T.brand}15`,
                      borderColor: T.brand,
                      color: T.ink,
                    }}
                  >
                    <div className="flex items-start gap-2.5 min-w-0">
                      <span className="text-base select-none">🎯</span>
                      <div className="text-xs sm:text-sm font-bold leading-tight" style={{ color: T.brand }}>
                        {currentQuest.actionPrompt}
                      </div>
                    </div>
                  </div>

                  {/* Dica do Guia */}
                  {currentQuest.hint && (
                    <div className="text-[11px] flex items-center gap-1.5 px-1" style={{ color: T.inkSoft }}>
                      <Lightbulb size={13} className="text-amber-400 shrink-0" />
                      <span>{currentQuest.hint}</span>
                    </div>
                  )}

                  {/* Barra de Ações do HUD */}
                  <div className="pt-2 border-t flex items-center justify-between gap-2 text-xs" style={{ borderColor: T.border }}>
                    <button
                      type="button"
                      onClick={handleFinishTutorial}
                      className="text-[11px] underline transition-opacity hover:opacity-80 cursor-pointer"
                      style={{ color: T.inkSoft }}
                    >
                      Sair do Tutorial
                    </button>

                    <button
                      type="button"
                      onClick={handleSkipAction}
                      className="px-3 py-1.5 rounded-xl font-semibold border flex items-center gap-1 transition-all haptic-press cursor-pointer hover:bg-white/5"
                      style={{ borderColor: T.border, color: T.ink }}
                      title="Avançar mesmo sem clicar na tela"
                    >
                      <span>Pular Ação (Avançar)</span>
                      <ChevronRight size={14} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* ---------------- 3. MODO MANUAL DE REFERÊNCIA (ENCICLOPÉDIA COMPLETA) ---------------- */}
      {mode === 'manual' && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-2 sm:p-4 bg-black/75 backdrop-blur-md animate-fade-in">
          <div
            className="w-full max-w-4xl max-h-[92vh] rounded-3xl border shadow-2xl flex flex-col overflow-hidden animate-scale-up"
            style={{ backgroundColor: T.surface, borderColor: T.border, color: T.ink }}
          >
            {/* Header do Manual */}
            <div className="p-4 sm:p-5 border-b flex flex-col sm:flex-row sm:items-center justify-between gap-3" style={{ borderColor: T.border }}>
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 border"
                  style={{ backgroundColor: `${T.brand}18`, borderColor: `${T.brand}30`, color: T.brand }}
                >
                  <BookOpen size={20} />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold tracking-tight" style={{ color: T.ink }}>
                    Manual do Omnia: Enciclopédia Acadêmica
                  </h3>
                  <p className="text-xs mt-0.5" style={{ color: T.inkSoft }}>
                    Guia de referência detalhado com 100% de botões, fórmulas, atalhos e recursos.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => { sfx.tab(); setMode('tour'); }}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold transition-all haptic-press flex items-center gap-1.5 cursor-pointer shadow-sm hover:opacity-90"
                  style={{ backgroundColor: T.brand, color: T.brandInk }}
                >
                  <Sparkles size={14} />
                  <span>Jogar Tour Interativo</span>
                </button>
                <button
                  type="button"
                  onClick={() => { sfx.pop(); onClose(); }}
                  className="p-2 rounded-xl text-slate-400 hover:text-white transition-colors cursor-pointer"
                  title="Fechar Manual"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Campo de Busca Rápida no Manual */}
            <div className="p-3 sm:p-4 border-b" style={{ borderColor: T.border, backgroundColor: T.surfaceAlt }}>
              <div className="relative">
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Pesquisar botões, recursos, atalhos, fórmulas (ex: Pomodoro, P1, BGM, Boss, Backup)..."
                  className="w-full pl-10 pr-4 py-2 rounded-xl text-xs sm:text-sm border outline-none transition-all focus:border-sky-500"
                  style={{ backgroundColor: T.surface, borderColor: T.border, color: T.ink }}
                />
              </div>
            </div>

            {/* Conteúdo com Layout Dividido: Categorias à Esquerda + Conteúdo à Direita */}
            <div className="flex-1 flex flex-col md:flex-row min-h-0 overflow-hidden">
              {/* Barra Lateral de Capítulos */}
              <div
                className="w-full md:w-64 border-b md:border-b-0 md:border-r overflow-y-auto p-2 sm:p-3 space-y-1 custom-scrollbar shrink-0 max-h-40 md:max-h-full"
                style={{ borderColor: T.border, backgroundColor: `${T.surfaceAlt}80` }}
              >
                {filteredManualSections.map(sec => {
                  const IconCmp = SECTION_ICONS[sec.icon] || BookOpen;
                  const isActive = activeManualSection === sec.id;
                  return (
                    <button
                      key={sec.id}
                      type="button"
                      onClick={() => { sfx.tab(); setActiveManualSection(sec.id); }}
                      className={`w-full flex items-center justify-between gap-2.5 px-3 py-2 rounded-xl text-left text-xs font-semibold transition-all cursor-pointer ${
                        isActive ? 'shadow-sm' : 'opacity-70 hover:opacity-100 hover:bg-white/5'
                      }`}
                      style={{
                        backgroundColor: isActive ? T.brand : 'transparent',
                        color: isActive ? T.brandInk : T.ink,
                      }}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <IconCmp size={15} className="shrink-0" />
                        <span className="truncate">{sec.title}</span>
                      </div>
                      <span className="text-[10px] font-mono opacity-80 shrink-0">
                        {sec.items ? sec.items.length : 0}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Painel Central com os Tópicos e Itens Detalhados */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 custom-scrollbar">
                {activeSectionData ? (
                  <>
                    <div className="border-b pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3" style={{ borderColor: T.border }}>
                      <div>
                        <div className="text-xs font-mono font-bold uppercase tracking-wider text-sky-400 mb-1">
                          Capítulo de Referência
                        </div>
                        <h4 className="text-lg sm:text-xl font-bold tracking-tight" style={{ color: T.ink }}>
                          {activeSectionData.title}
                        </h4>
                        <p className="text-xs sm:text-sm mt-1 leading-relaxed" style={{ color: T.inkSoft }}>
                          {activeSectionData.description}
                        </p>
                      </div>

                      {activeSectionData.tab && (
                        <button
                          type="button"
                          onClick={() => {
                            if (onTabChange) onTabChange(activeSectionData.tab);
                            setMode('tour');
                          }}
                          className="px-3 py-1.5 rounded-xl text-xs font-bold border transition-all haptic-press flex items-center gap-1.5 shrink-0 self-start sm:self-center cursor-pointer hover:bg-white/5"
                          style={{ borderColor: T.border, color: T.brand }}
                          title="Ir para esta aba e abrir o passo a passo"
                        >
                          <Play size={12} fill="currentColor" />
                          <span>Ver na Prática</span>
                        </button>
                      )}
                    </div>

                    {/* Lista Completa de Itens, Botões e Recursos */}
                    <div className="space-y-3">
                      <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
                        Recursos, Botões & Ações ({activeSectionData.items ? activeSectionData.items.length : 0}):
                      </div>
                      <div className="grid grid-cols-1 gap-3">
                        {activeSectionData.items && activeSectionData.items.map((item, idx) => (
                          <div
                            key={idx}
                            className="p-3.5 rounded-2xl border transition-all hover:border-sky-500/30"
                            style={{ backgroundColor: T.surfaceAlt, borderColor: T.border }}
                          >
                            <div className="flex items-center justify-between gap-2 mb-1">
                              <span className="font-bold text-xs sm:text-sm" style={{ color: T.ink }}>
                                {item.name}
                              </span>
                              {item.type && (
                                <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-semibold bg-white/5 border border-white/10" style={{ color: T.inkSoft }}>
                                  {item.type}
                                </span>
                              )}
                            </div>
                            <p className="text-xs leading-relaxed" style={{ color: T.inkSoft }}>
                              {item.desc}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-12 text-sm" style={{ color: T.inkSoft }}>
                    Nenhum tópico encontrado para sua pesquisa.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
