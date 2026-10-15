import React, { useState, useEffect, useRef } from 'react';
import {
  X, Compass, BookOpen, ChevronRight, ChevronLeft, Search, Sparkles,
  CheckCircle2, Play, Lightbulb, ArrowRight, HelpCircle, Check,
  Clock, Calendar, Book, FileText, Award, GraduationCap, MessageCircle,
  BookHeart, Settings, Key, Sun, CalendarDays
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { T, TINT } from './ui';
import { sfx } from '../lib/soundEffects';
import { TUTORIAL_STEPS, OMNIA_MANUAL_SECTIONS } from '../lib/tutorialData';

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
  const [currentStepIdx, setCurrentStepIdx] = useState(initialStepIndex);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeManualSection, setActiveManualSection] = useState('manual-hoje');
  const [completedSteps, setCompletedSteps] = useState(() => {
    try {
      const saved = localStorage.getItem('omnia_completed_tutorial_steps');
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });

  const step = TUTORIAL_STEPS[currentStepIdx] || TUTORIAL_STEPS[0];
  const totalSteps = TUTORIAL_STEPS.length;
  const progressPct = Math.round(((currentStepIdx + 1) / totalSteps) * 100);

  // Sync mode with props when reopened
  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      if (initialStepIndex >= 0 && initialStepIndex < TUTORIAL_STEPS.length) {
        setCurrentStepIdx(initialStepIndex);
      }
    }
  }, [isOpen, initialMode, initialStepIndex]);

  // When step changes, switch tab and scroll target element into view
  useEffect(() => {
    if (!isOpen || mode !== 'tour') return;

    if (step.tab && onTabChange && activeTab !== step.tab) {
      onTabChange(step.tab);
    }

    // Mark step as viewed in localStorage
    setCompletedSteps(prev => {
      if (prev.includes(step.id)) return prev;
      const next = [...prev, step.id];
      try { localStorage.setItem('omnia_completed_tutorial_steps', JSON.stringify(next)); } catch {}
      return next;
    });

    // Remove previous highlights
    document.querySelectorAll('.omnia-tour-highlighted').forEach(el => {
      el.classList.remove('omnia-tour-highlighted');
    });

    // Try highlighting target after brief delay for tab transition
    const timer = setTimeout(() => {
      if (step.targetSelector) {
        const targetEl = document.querySelector(step.targetSelector);
        if (targetEl) {
          targetEl.classList.add('omnia-tour-highlighted');
          targetEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }
    }, 280);

    return () => {
      clearTimeout(timer);
      document.querySelectorAll('.omnia-tour-highlighted').forEach(el => {
        el.classList.remove('omnia-tour-highlighted');
      });
    };
  }, [isOpen, mode, currentStepIdx, step, activeTab, onTabChange]);

  const handleNext = () => {
    sfx.pop();
    if (currentStepIdx < totalSteps - 1) {
      setCurrentStepIdx(i => i + 1);
    } else {
      // Completed last step!
      confetti({ particleCount: 80, spread: 70, origin: { y: 0.7 } });
      sfx.complete();
      onClose();
    }
  };

  const handlePrev = () => {
    sfx.pop();
    if (currentStepIdx > 0) {
      setCurrentStepIdx(i => i - 1);
    }
  };

  const jumpToStep = (index) => {
    sfx.tab();
    setCurrentStepIdx(index);
    setMode('tour');
  };

  const jumpToTabSection = (tabId) => {
    const foundIdx = TUTORIAL_STEPS.findIndex(s => s.tab === tabId);
    if (foundIdx !== -1) {
      jumpToStep(foundIdx);
    } else {
      setMode('tour');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[99999] flex flex-col justify-end sm:justify-center items-center p-2 sm:p-4 animate-fade-in" style={{ backgroundColor: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(6px)' }}>
      {/* ---------------- MODO TOUR INTERATIVO ---------------- */}
      {mode === 'tour' && (
        <div
          className="w-full max-w-2xl rounded-3xl border shadow-2xl overflow-hidden flex flex-col relative transition-all animate-scale-up"
          style={{
            backgroundColor: T.surface,
            borderColor: T.border,
            color: T.ink,
          }}
          onClick={(e) => e.stopPropagation()}
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

          {/* Header do Card */}
          <div className="p-4 sm:p-5 flex items-start justify-between gap-3 border-b" style={{ borderColor: T.border }}>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <span
                  className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold tracking-wider uppercase border"
                  style={{
                    backgroundColor: `${T.brand}18`,
                    color: T.brand,
                    borderColor: `${T.brand}40`,
                  }}
                >
                  {step.badge}
                </span>
                <span className="text-xs font-mono font-medium" style={{ color: T.inkSoft }}>
                  Passo {currentStepIdx + 1} de {totalSteps} ({progressPct}%)
                </span>
              </div>
              <h3 className="text-base sm:text-xl font-bold tracking-tight truncate" style={{ color: T.ink }}>
                {step.title}
              </h3>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={() => { sfx.tab(); setMode('manual'); }}
                className="px-2.5 py-1 rounded-xl text-xs font-semibold border flex items-center gap-1.5 transition-colors cursor-pointer hover:bg-white/5"
                style={{ borderColor: T.border, color: T.inkSoft }}
                title="Abrir Manual Completo e Índice"
              >
                <BookOpen size={13} />
                <span className="hidden sm:inline">Manual</span>
              </button>
              <button
                type="button"
                onClick={() => { sfx.pop(); onClose(); }}
                className="p-1.5 rounded-xl text-slate-400 hover:text-white transition-colors cursor-pointer"
                title="Fechar Tutorial"
                aria-label="Fechar Tutorial"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Conteúdo Central Explicativo */}
          <div className="p-4 sm:p-6 space-y-4 max-h-[60vh] overflow-y-auto custom-scrollbar">
            <p className="text-xs sm:text-sm leading-relaxed" style={{ color: T.inkSoft }}>
              {step.description}
            </p>

            {step.features && step.features.length > 0 && (
              <div
                className="p-3.5 rounded-2xl border space-y-2"
                style={{ backgroundColor: T.surfaceAlt, borderColor: T.border }}
              >
                <div className="text-xs font-bold flex items-center gap-1.5" style={{ color: T.brand }}>
                  <Sparkles size={14} />
                  <span>Recursos & Como Usar Cada Botão:</span>
                </div>
                <ul className="space-y-1.5">
                  {step.features.map((feat, idx) => (
                    <li key={idx} className="text-xs flex items-start gap-2 leading-relaxed" style={{ color: T.ink }}>
                      <CheckCircle2 size={13} className="shrink-0 mt-0.5 text-emerald-400" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {step.tip && (
              <div
                className="p-3 rounded-2xl border flex items-start gap-2.5"
                style={{
                  backgroundColor: 'rgba(245, 158, 11, 0.08)',
                  borderColor: 'rgba(245, 158, 11, 0.25)',
                }}
              >
                <Lightbulb size={16} className="text-amber-400 shrink-0 mt-0.5" />
                <div className="text-xs leading-relaxed text-amber-200">
                  <strong className="font-semibold text-amber-300">Dica Pro: </strong>
                  {step.tip}
                </div>
              </div>
            )}
          </div>

          {/* Rodapé de Navegação */}
          <div
            className="p-3 sm:p-4 border-t flex items-center justify-between gap-2 flex-wrap"
            style={{ backgroundColor: T.surfaceAlt, borderColor: T.border }}
          >
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handlePrev}
                disabled={currentStepIdx === 0}
                className="px-3 py-2 rounded-xl text-xs font-semibold border flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/5"
                style={{ borderColor: T.border, color: T.ink }}
              >
                <ChevronLeft size={14} /> Anterior
              </button>

              <button
                type="button"
                onClick={() => { sfx.pop(); onClose(); }}
                className="px-2.5 py-2 text-xs text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
              >
                Pular
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleNext}
                className="px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 shadow-md hover:brightness-110 active:scale-95 transition-all cursor-pointer"
                style={{ backgroundColor: T.brand, color: T.brandInk || '#fff' }}
              >
                <span>{currentStepIdx === totalSteps - 1 ? 'Concluir Tutorial' : step.actionText || 'Próximo Passo'}</span>
                {currentStepIdx === totalSteps - 1 ? <Check size={14} /> : <ChevronRight size={14} />}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ---------------- MODO MANUAL COMPLETO & ÍNDICE ---------------- */}
      {mode === 'manual' && (
        <div
          className="w-full max-w-4xl max-h-[85vh] rounded-3xl border shadow-2xl overflow-hidden flex flex-col relative animate-scale-up"
          style={{
            backgroundColor: T.surface,
            borderColor: T.border,
            color: T.ink,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header do Manual */}
          <div className="p-4 sm:p-5 flex items-center justify-between border-b gap-3" style={{ borderColor: T.border }}>
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 border"
                style={{ backgroundColor: `${T.brand}18`, borderColor: `${T.brand}30`, color: T.brand }}
              >
                <BookOpen size={20} />
              </div>
              <div>
                <h3 className="text-lg sm:text-xl font-bold tracking-tight" style={{ color: T.ink }}>
                  Manual Completo & Central de Ajuda
                </h3>
                <p className="text-xs" style={{ color: T.inkSoft }}>
                  Documentação detalhada de cada botão, fórmula e função do Omnia
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => { sfx.tab(); setMode('tour'); }}
                className="px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm hover:brightness-110 transition-all cursor-pointer"
                style={{ backgroundColor: T.brand, color: T.brandInk || '#fff' }}
              >
                <Play size={12} fill="currentColor" /> Tour Interativo
              </button>
              <button
                type="button"
                onClick={() => { sfx.pop(); onClose(); }}
                className="p-1.5 rounded-xl text-slate-400 hover:text-white transition-colors cursor-pointer"
                title="Fechar"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Barra de Busca no Manual */}
          <div className="p-3 sm:p-4 border-b flex items-center gap-2" style={{ backgroundColor: T.surfaceAlt, borderColor: T.border }}>
            <Search size={16} className="text-slate-400 shrink-0 ml-1" />
            <input
              type="text"
              placeholder="Buscar botão, recurso ou função (ex: Pomodoro, Chefões, PDF, Biometria, Aiko, Flashcards)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 bg-transparent border-none outline-none text-xs sm:text-sm text-slate-100 placeholder:text-slate-500"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="text-xs text-slate-400 hover:text-white px-2 py-0.5 rounded cursor-pointer"
              >
                Limpar
              </button>
            )}
          </div>

          {/* Corpo do Manual: Menu Lateral + Detalhes */}
          <div className="flex-1 flex flex-col md:flex-row overflow-hidden min-h-0">
            {/* Lista de Seções */}
            <div className="w-full md:w-64 border-b md:border-b-0 md:border-r overflow-y-auto custom-scrollbar p-2 space-y-1 shrink-0" style={{ borderColor: T.border, backgroundColor: 'rgba(0,0,0,0.02)' }}>
              {OMNIA_MANUAL_SECTIONS.map((sec) => {
                const isSelected = activeManualSection === sec.id;
                const IconComp = SECTION_ICONS[sec.iconName] || HelpCircle;
                return (
                  <button
                    key={sec.id}
                    type="button"
                    onClick={() => { sfx.tab(); setActiveManualSection(sec.id); }}
                    className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2.5 transition-all cursor-pointer ${
                      isSelected ? 'shadow-sm' : 'opacity-70 hover:opacity-100 hover:bg-white/5'
                    }`}
                    style={{
                      backgroundColor: isSelected ? TINT.brand : 'transparent',
                      color: isSelected ? T.brand : T.ink,
                      border: isSelected ? `1px solid ${T.brand}30` : '1px solid transparent',
                    }}
                  >
                    <IconComp size={15} className="shrink-0" />
                    <span className="truncate">{sec.title}</span>
                  </button>
                );
              })}
            </div>

            {/* Conteúdo da Seção Ativa / Resultados de Busca */}
            <div className="flex-1 p-4 sm:p-6 overflow-y-auto custom-scrollbar space-y-4">
              {(() => {
                const currentSec = OMNIA_MANUAL_SECTIONS.find(s => s.id === activeManualSection) || OMNIA_MANUAL_SECTIONS[0];
                const query = searchQuery.toLowerCase().trim();

                let displayedItems = currentSec.items;
                let displayedTitle = currentSec.title;
                let displayedSummary = currentSec.summary;
                let currentTab = currentSec.tab;

                if (query) {
                  // Global search across all sections
                  const matches = [];
                  OMNIA_MANUAL_SECTIONS.forEach(s => {
                    s.items.forEach(it => {
                      if (
                        it.name.toLowerCase().includes(query) ||
                        it.desc.toLowerCase().includes(query) ||
                        it.type.toLowerCase().includes(query) ||
                        s.title.toLowerCase().includes(query)
                      ) {
                        matches.push({ ...it, sectionTitle: s.title, sectionTab: s.tab });
                      }
                    });
                  });

                  return (
                    <div className="space-y-4">
                      <div className="text-xs font-bold" style={{ color: T.brand }}>
                        Encontradas {matches.length} funções para &quot;{searchQuery}&quot;:
                      </div>
                      {matches.length === 0 ? (
                        <div className="p-8 text-center text-xs text-slate-400">
                          Nenhuma função encontrada com esse termo. Tente buscar por palavras como &quot;Pomodoro&quot;, &quot;PDF&quot;, &quot;Petiscos&quot; ou &quot;Chefão&quot;.
                        </div>
                      ) : (
                        matches.map((item, idx) => (
                          <div
                            key={idx}
                            className="p-3.5 rounded-2xl border space-y-1.5 transition-all hover:border-slate-500/40"
                            style={{ backgroundColor: T.surfaceAlt, borderColor: T.border }}
                          >
                            <div className="flex items-center justify-between gap-2 flex-wrap">
                              <div className="text-xs font-bold text-slate-100 flex items-center gap-1.5">
                                <span>{item.name}</span>
                                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full border border-slate-700 text-slate-400">
                                  {item.type}
                                </span>
                              </div>
                              <button
                                type="button"
                                onClick={() => jumpToTabSection(item.sectionTab)}
                                className="text-[10px] font-semibold text-sky-400 hover:underline flex items-center gap-1 cursor-pointer"
                              >
                                Ver na aba {item.sectionTitle.split('.')[1] || ''} <ArrowRight size={10} />
                              </button>
                            </div>
                            <p className="text-xs leading-relaxed text-slate-300">
                              {item.desc}
                            </p>
                          </div>
                        ))
                      )}
                    </div>
                  );
                }

                return (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between gap-3 flex-wrap pb-2 border-b" style={{ borderColor: T.border }}>
                      <div>
                        <h4 className="text-base sm:text-lg font-bold" style={{ color: T.ink }}>
                          {displayedTitle}
                        </h4>
                        <p className="text-xs mt-0.5" style={{ color: T.inkSoft }}>
                          {displayedSummary}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => jumpToTabSection(currentTab)}
                        className="px-3 py-1.5 rounded-xl text-xs font-bold border flex items-center gap-1.5 transition-all cursor-pointer hover:bg-white/5"
                        style={{ borderColor: T.brand, color: T.brand }}
                        title="Ir para a aba e ver na prática"
                      >
                        <Play size={11} fill="currentColor" /> Tour desta Aba
                      </button>
                    </div>

                    <div className="space-y-3">
                      {displayedItems.map((item, idx) => (
                        <div
                          key={idx}
                          className="p-3.5 rounded-2xl border space-y-1.5 transition-all"
                          style={{ backgroundColor: T.surfaceAlt, borderColor: T.border }}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-xs font-bold" style={{ color: T.ink }}>
                              {item.name}
                            </span>
                            <span
                              className="text-[10px] font-mono px-2 py-0.5 rounded-full border text-slate-400"
                              style={{ borderColor: T.border }}
                            >
                              {item.type}
                            </span>
                          </div>
                          <p className="text-xs leading-relaxed whitespace-pre-line" style={{ color: T.inkSoft }}>
                            {item.desc}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>

          {/* Rodapé do Manual */}
          <div className="p-3 sm:p-4 border-t flex items-center justify-between gap-3 text-xs" style={{ backgroundColor: T.surfaceAlt, borderColor: T.border, color: T.inkSoft }}>
            <span className="flex items-center gap-1.5">
              <Compass size={14} className="text-sky-400" />
              <span>Omnia Guia Completo • 100% de cobertura das funções</span>
            </span>
            <button
              type="button"
              onClick={() => { sfx.pop(); onClose(); }}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold border cursor-pointer hover:bg-white/5"
              style={{ borderColor: T.border, color: T.ink }}
            >
              Fechar Manual
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
