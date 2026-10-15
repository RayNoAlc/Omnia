import React from "react";
import {
  Network, ShieldAlert, Layers, Archive, Lock, Volume2, Square, BarChart, Edit3, MessageCircle, BookHeart, Smile, Search, Maximize, Minimize, Type, PartyPopper, BookOpen, Briefcase, Book, Dumbbell, Utensils, Leaf, Trophy,
  Gamepad2, Calendar, Key, Flame, TrendingUp,
  CheckCircle, Globe, Wrench, Bird, Crown, Skull, Sunrise, Activity, Medal, Pin,
  Send, Play, Pause, RotateCcw, Check, X, Loader2, AlertCircle,
  Plus, Trash2, Clock, Sparkles, GraduationCap, RefreshCw,
  AlertTriangle, Info, LogOut, FileText, Image as ImageIcon, Mic, Paperclip, Download,
  Moon, SlidersHorizontal, Pencil, Target, CalendarDays, Headphones,
  Settings, Palette, Wind, Heart,
  Droplets, Sun, Sprout, Palmtree, Brain, Compass, Award, CalendarClock,
  Coins, ShoppingBag, VolumeX, CloudRain, Coffee, CheckCircle2, Meh, Frown,
  Laugh, Footprints, Zap, Glasses, Copy, Share2, Instagram, Users, Music, Filter, ChevronDown, ChevronUp,
  Swords, Apple, Cookie, Shield, User, Fingerprint, Highlighter, Hourglass, FlaskConical, PawPrint, QrCode, Bookmark
} from 'lucide-react';

import confetti from 'canvas-confetti';
import html2canvas from 'html2canvas';
import QRCode from 'qrcode';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import JSZip from 'jszip';
import * as ics from 'ics';
import { useState, useEffect, useRef, useMemo, lazy, Suspense } from "react";
import {
  T, TINT, THEMES, applyTheme, applyFont, resolveFontFamily, TIPO_LABELS, PRIORIDADE_META, PERIODO_LABELS, TABS,
  PriorityDot, TypeTag, Card, SectionLabel, EmptyState, PrimaryButton, GhostButton,
} from "./ui";
import { uid, todayISO, formatDateBR, weekdayShort, addDays, computeInterruptionInsight, fileToBase64, hexToRgba, getWeekRange, getEffectiveRoutineItemsForDate, planoRecomendadoHoje, computeAvisos, getSemestre, OMNIA_SECRET_DEV_COMMAND, isSecretDevCommand, executeGodModeCheat, isHideDevCommand, isToggleDevCommand, setDevMode, isDevModeActive } from "../lib/utils";
import { sfx } from "../lib/soundEffects";
import { reactiveBgm } from "../lib/reactiveBgm";
import { aiGenerateSummary, aiGenerateQuiz, aiEvaluateProfessor, aiParseSyllabus, aiGenerateFlashcards } from "../lib/aiHelpers";
import { callVision, callAudioTranscription, callAIWithTools, callAI } from "../lib/ai";
import { runQATour } from "../lib/qaTour";
import { runFullQASuite, downloadQAReportAsJSON } from "../lib/qaEngine";
import { ROUTINE_TOOLS, executeRoutineTool } from "../lib/routineTools";
import { PRESETS } from "../lib/useFocusTimer";
import { extractPdfText } from "../lib/pdf";
import { supabase } from "../lib/supabaseClient";
const ChatMarkdown = lazy(() => import("./ChatMarkdown").then((m) => ({ default: m.ChatMarkdown })));
import {
  addQuizAttempt, addProfessorAttempt,
  upsertSummary, addSession as dbAddSession, addCommitment, deleteCommitment,
  uploadMaterialFile, addMaterial, getMaterialSignedUrl, deleteMaterial,
  addNote, deleteNote,
} from "../lib/db";
import { MindMapModal } from "./MindMapModal";
import { PdfViewerModal } from "./PdfViewerModal";
import { CommunitySummariesModal } from "./CommunitySummariesModal";
import { isBiometricsAvailable, registerBiometrics, setSecurityPin } from "../lib/biometrics";

const MAX_FILE_MB = 8;

const TIPO_ARQUIVO_META = {
  pdf: { label: "PDF", icon: FileText },
  imagem: { label: "Foto", icon: ImageIcon },
  audio: { label: "Áudio", icon: Mic },
};

/* ---------------------------------------------------------------------- */
/* Header + navegação                                                      */
/* ---------------------------------------------------------------------- */


export function AudioReaderButton({ text, T }) {
  const [playing, setPlaying] = React.useState(false);
  const synth = window.speechSynthesis;
  
  const toggle = (e) => {
    e.stopPropagation();
    if (playing) {
      synth.cancel();
      setPlaying(false);
    } else {
      synth.cancel(); // clear previous
      // text can be very long or have markdown, just stripping basic markdown chars
      const cleanText = (text||"").replace(/[#*_~>]/g, "");
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.lang = 'pt-BR';
      utterance.onend = () => setPlaying(false);
      synth.speak(utterance);
      setPlaying(true);
    }
  };
  React.useEffect(() => {
    return () => { if(playing) synth.cancel(); }
  }, [playing]);

  return (
    <button onClick={toggle} title="Ouvir em Áudio" style={{ color: playing ? T.brand : T.inkSoft }} className="hover:opacity-70 transition-opacity ml-2">
      {playing ? <Square className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
    </button>
  );
}

export function formatTextWithTags(text, T) {
  if (!text) return null;
  const parts = text.split(/(#\w+)/g);
  return parts.map((part, i) => {
    if (part.startsWith('#')) {
      return <span key={i} className="inline-block px-1.5 py-0.5 rounded text-[10px] font-bold mx-1" style={{ backgroundColor: T.brand + '33', color: T.brand }}>{part}</span>;
    }
    return <span key={i}>{part}</span>;
  });
}

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
    <nav className="flex md:justify-center gap-1 overflow-x-auto mb-6 pb-2 -mx-1 px-1 custom-scrollbar" style={{ borderBottom: `1px solid ${T.border}` }}>
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


  const DEFAULT_HABIT_DEFINITIONS = [
    { id: "agua", label: "Beber Água (2L)", iconKey: "Droplets" },
    { id: "exercicio", label: "Atividade Física", iconKey: "Activity" },
    { id: "leitura", label: "Leitura Lazer", iconKey: "BookOpen" },
    { id: "luz", label: "Luz do Sol (15m)", iconKey: "Sun" },
  ];

  const OBVIOUS_HABIT_SUGGESTIONS = [
    { label: "Beber Água (2L)", iconKey: "Droplets" },
    { label: "Atividade Física", iconKey: "Activity" },
    { label: "Leitura Lazer", iconKey: "BookOpen" },
    { label: "Luz do Sol (15m)", iconKey: "Sun" },
    { label: "Meditação / Mindfulness", iconKey: "Brain" },
    { label: "Dormir Cedo (8h)", iconKey: "Moon" },
    { label: "Fio Dental & Higiene", iconKey: "Sparkles" },
    { label: "Alimentação Saudável", iconKey: "Utensils" },
    { label: "Revisão do Dia", iconKey: "RotateCcw" },
    { label: "Alongamento (10m)", iconKey: "Dumbbell" },
    { label: "Caminhada (5.000 passos)", iconKey: "Footprints" },
    { label: "Pausa Consciente / Café", iconKey: "Coffee" },
  ];

  function getHabitIconComponent(label, iconKey) {
    const map = {
      Droplets,
      Activity,
      BookOpen,
      Sun,
      Moon,
      Brain,
      Sparkles,
      Utensils,
      RotateCcw,
      Dumbbell,
      Footprints,
      Coffee,
      Target,
    };
    if (iconKey && map[iconKey]) return map[iconKey];
    const l = (label || '').toLowerCase();
    if (l.includes('água') || l.includes('agua') || l.includes('beber') || l.includes('hidrata')) return Droplets;
    if (l.includes('exerc') || l.includes('trein') || l.includes('academi') || l.includes('físic') || l.includes('fisic') || l.includes('corr')) return Activity;
    if (l.includes('livro') || l.includes('ler') || l.includes('leitur') || l.includes('estud')) return BookOpen;
    if (l.includes('sol') || l.includes('luz') || l.includes('manhã') || l.includes('manha')) return Sun;
    if (l.includes('dormir') || l.includes('sono') || l.includes('noite') || l.includes('cama')) return Moon;
    if (l.includes('medit') || l.includes('mente') || l.includes('respir') || l.includes('mindful') || l.includes('foco')) return Brain;
    if (l.includes('dent') || l.includes('fio') || l.includes('higien') || l.includes('skin') || l.includes('banho') || l.includes('limp')) return Sparkles;
    if (l.includes('com') || l.includes('aliment') || l.includes('diet') || l.includes('refeiç') || l.includes('refeic') || l.includes('saudáv') || l.includes('saudav')) return Utensils;
    if (l.includes('caminh') || l.includes('passo')) return Footprints;
    if (l.includes('along') || l.includes('postur')) return Dumbbell;
    if (l.includes('café') || l.includes('cafe') || l.includes('pausa')) return Coffee;
    if (l.includes('revis') || l.includes('revisão') || l.includes('revisao')) return RotateCcw;
    return Target;
  }

  function DailyHabits({ T, config, updateConfig }) {
    const today = todayISO();
    const [isEditing, setIsEditing] = useState(false);
    const [newText, setNewText] = useState("");
    const [editingId, setEditingId] = useState(null);
    const [editingText, setEditingText] = useState("");

    const [definitions, setDefinitions] = useState(() => {
      try {
        const saved = localStorage.getItem("omnia_habit_definitions");
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
        if (config?.userHabitDefinitions && Array.isArray(config.userHabitDefinitions)) {
          return config.userHabitDefinitions;
        }
      } catch (e) {}
      return DEFAULT_HABIT_DEFINITIONS;
    });

    const [completedMap, setCompletedMap] = useState(() => {
      try {
        const log = localStorage.getItem("omnia_habits_log_" + today);
        if (log) return JSON.parse(log);
        const legacy = localStorage.getItem("omnia_habits_" + today);
        if (legacy) {
          const parsed = JSON.parse(legacy);
          if (Array.isArray(parsed)) {
            const map = {};
            parsed.forEach((h) => { if (h.done) map[h.id] = true; });
            return map;
          }
        }
      } catch (e) {}
      return {};
    });

    useEffect(() => {
      try {
        localStorage.setItem("omnia_habit_definitions", JSON.stringify(definitions));
        if (updateConfig && config) {
          if (JSON.stringify(config.userHabitDefinitions) !== JSON.stringify(definitions)) {
            updateConfig({ ...config, userHabitDefinitions: definitions });
          }
        }
      } catch (e) {}
    }, [definitions]);

    useEffect(() => {
      try {
        localStorage.setItem("omnia_habits_log_" + today, JSON.stringify(completedMap));
        const legacy = definitions.map((d) => ({
          id: d.id,
          label: d.label,
          done: Boolean(completedMap[d.id]),
        }));
        localStorage.setItem("omnia_habits_" + today, JSON.stringify(legacy));
      } catch (e) {}
    }, [completedMap, definitions, today]);

    const toggleHabit = (id) => {
      const isNowDone = !completedMap[id];
      setCompletedMap((prev) => ({ ...prev, [id]: isNowDone }));
      if (isNowDone) {
        sfx.complete();
        if (window.confetti) {
          window.confetti({ particleCount: 30, spread: 50, origin: { y: 0.8 } });
        }
      } else {
        sfx.pop();
      }
    };

    const addHabit = (label, iconKey = null) => {
      const trimmed = (label || "").trim();
      if (!trimmed) return;
      if (definitions.some((d) => d.label.toLowerCase() === trimmed.toLowerCase())) {
        alert("Este hábito já está na sua lista!");
        return;
      }
      sfx.pop();
      const newId = "h_" + Date.now() + "_" + Math.random().toString(36).slice(2, 6);
      setDefinitions((prev) => [...prev, { id: newId, label: trimmed, iconKey }]);
      setNewText("");
    };

    const removeHabit = (id) => {
      sfx.click();
      setDefinitions((prev) => prev.filter((d) => d.id !== id));
      setCompletedMap((prev) => {
        const copy = { ...prev };
        delete copy[id];
        return copy;
      });
    };

    const saveEdit = (id) => {
      const trimmed = editingText.trim();
      if (trimmed) {
        setDefinitions((prev) => prev.map((d) => (d.id === id ? { ...d, label: trimmed } : d)));
      }
      setEditingId(null);
      setEditingText("");
    };

    const resetDefaults = () => {
      if (confirm("Deseja restaurar os hábitos padrão (Água, Exercício, Leitura, Sol)?")) {
        setDefinitions(DEFAULT_HABIT_DEFINITIONS);
      }
    };

    const totalCount = definitions.length;
    const doneCount = definitions.filter((d) => completedMap[d.id]).length;
    const progress = totalCount > 0 ? Math.round((doneCount / totalCount) * 100) : 0;

    const availableSuggestions = OBVIOUS_HABIT_SUGGESTIONS.filter(
      (sug) => !definitions.some((d) => d.label.toLowerCase() === sug.label.toLowerCase())
    );

    return (
      <Card style={{ marginTop: '1rem' }} data-tour="hoje-habitos">
        <div className="flex items-center justify-between mb-3">
          <div className="font-bold flex items-center gap-2" style={{ color: T.ink }}>
            <Sprout className="w-4 h-4 text-emerald-500" /> Rastreador de Hábitos
          </div>
          <div className="flex items-center gap-2">
            <span
              className="text-xs font-bold px-2 py-0.5 rounded-full"
              style={{ backgroundColor: T.brand + '22', color: T.brand }}
            >
              {doneCount}/{totalCount} ({progress}%)
            </span>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="text-xs font-semibold px-2 py-0.5 rounded-lg border transition-colors flex items-center gap-1"
              style={{
                borderColor: isEditing ? T.brand : T.border,
                backgroundColor: isEditing ? T.brand + '15' : 'transparent',
                color: isEditing ? T.brand : T.inkSoft,
              }}
              title={isEditing ? "Concluir edição" : "Editar hábitos"}
            >
              {isEditing ? (
                <>
                  <Check size={12} /> Concluir
                </>
              ) : (
                <>
                  <Pencil size={12} /> Editar
                </>
              )}
            </button>
          </div>
        </div>

        {/* MODO DE EDIÇÃO: Adicionar, Subtrair e Sugestões */}
        {isEditing ? (
          <div className="space-y-4 pt-1">
            {/* Campo para Adicionar Novo Hábito Personalizado */}
            <div>
              <div className="text-[11px] font-semibold mb-1" style={{ color: T.inkSoft }}>
                Adicionar Hábito Personalizado
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Ex: Meditar 10 min, Fio dental, Alongamento..."
                  value={newText}
                  onChange={(e) => setNewText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') addHabit(newText);
                  }}
                  className="flex-1 text-xs px-3 py-2 rounded-xl border outline-none transition-all"
                  style={{
                    backgroundColor: T.surfaceAlt,
                    borderColor: T.border,
                    color: T.ink,
                  }}
                />
                <button
                  onClick={() => addHabit(newText)}
                  disabled={!newText.trim()}
                  className="px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1 text-white shadow-sm transition-opacity disabled:opacity-40"
                  style={{ backgroundColor: T.brand }}
                >
                  <Plus size={14} /> Adicionar
                </button>
              </div>
            </div>

            {/* Sugestões Óbvias Prontas (1 clique) */}
            {availableSuggestions.length > 0 && (
              <div>
                <div className="text-[11px] font-semibold mb-1.5 flex items-center gap-1" style={{ color: T.inkSoft }}>
                  <Sparkles size={12} className="text-amber-500" /> Sugestões Prontas (Clique para adicionar):
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {availableSuggestions.map((sug) => {
                    const SugIcon = getHabitIconComponent(sug.label, sug.iconKey);
                    return (
                      <button
                        key={sug.label}
                        onClick={() => addHabit(sug.label, sug.iconKey)}
                        className="text-[11px] font-medium px-2 py-1 rounded-lg border transition-all flex items-center gap-1.5 hover:scale-[1.02] active:scale-95"
                        style={{
                          backgroundColor: T.surfaceAlt,
                          borderColor: T.border,
                          color: T.ink,
                        }}
                      >
                        <SugIcon size={12} className="text-emerald-500" />
                        <span>+ {sug.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Lista Atual de Hábitos com Opção de Editar / Remover */}
            <div>
              <div className="text-[11px] font-semibold mb-1.5" style={{ color: T.inkSoft }}>
                Seus Hábitos ({definitions.length}):
              </div>
              {definitions.length === 0 ? (
                <div className="text-center py-4 text-xs rounded-xl border border-dashed p-3" style={{ color: T.inkSoft, borderColor: T.border }}>
                  Nenhum hábito configurado. Adicione acima ou use as sugestões.
                </div>
              ) : (
                <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                  {definitions.map((h) => {
                    const IconCmp = getHabitIconComponent(h.label, h.iconKey);
                    const isRowEditing = editingId === h.id;
                    return (
                      <div
                        key={h.id}
                        className="flex items-center justify-between p-2 rounded-xl border transition-all"
                        style={{
                          backgroundColor: T.surfaceAlt,
                          borderColor: T.border,
                        }}
                      >
                        <div className="flex items-center gap-2 flex-1 mr-2 min-w-0">
                          <div
                            className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0 border"
                            style={{
                              backgroundColor: T.surface,
                              borderColor: T.border,
                            }}
                          >
                            <IconCmp size={13} style={{ color: T.brand }} />
                          </div>
                          {isRowEditing ? (
                            <input
                              autoFocus
                              type="text"
                              value={editingText}
                              onChange={(e) => setEditingText(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') saveEdit(h.id);
                                if (e.key === 'Escape') setEditingId(null);
                              }}
                              className="text-xs px-2 py-1 rounded border outline-none flex-1"
                              style={{
                                backgroundColor: T.surface,
                                borderColor: T.brand,
                                color: T.ink,
                              }}
                            />
                          ) : (
                            <span className="text-xs font-medium truncate" style={{ color: T.ink }}>
                              {h.label}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          {isRowEditing ? (
                            <button
                              onClick={() => saveEdit(h.id)}
                              className="p-1 rounded text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40"
                              title="Salvar alteração"
                            >
                              <Check size={14} />
                            </button>
                          ) : (
                            <button
                              onClick={() => {
                                setEditingId(h.id);
                                setEditingText(h.label);
                              }}
                              className="p-1 rounded hover:bg-slate-200 dark:hover:bg-gray-700 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                              title="Renomear hábito"
                            >
                              <Pencil size={13} />
                            </button>
                          )}
                          <button
                            onClick={() => removeHabit(h.id)}
                            className="p-1 rounded hover:bg-rose-50 dark:hover:bg-rose-950/40 text-slate-400 hover:text-rose-600 transition-colors"
                            title="Remover hábito"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Ações inferiores de edição */}
            <div className="flex items-center justify-between pt-2 border-t text-[11px]" style={{ borderColor: T.border }}>
              <button
                onClick={resetDefaults}
                className="hover:underline flex items-center gap-1"
                style={{ color: T.inkSoft }}
              >
                <RotateCcw size={11} /> Restaurar hábitos padrão
              </button>
              <button
                onClick={() => setIsEditing(false)}
                className="font-semibold hover:underline flex items-center gap-1"
                style={{ color: T.brand }}
              >
                <Check size={12} /> Finalizar Edição
              </button>
            </div>
          </div>
        ) : (
          /* MODO DE VISUALIZAÇÃO: Checklist Diário */
          <div>
            {definitions.length === 0 ? (
              <div className="text-center py-6 px-3 rounded-xl border border-dashed" style={{ borderColor: T.border }}>
                <p className="text-xs mb-2" style={{ color: T.inkSoft }}>
                  Você ainda não possui nenhum hábito configurado.
                </p>
                <button
                  onClick={() => setIsEditing(true)}
                  className="text-xs font-semibold px-3 py-1.5 rounded-xl text-white shadow-sm flex items-center gap-1 mx-auto"
                  style={{ backgroundColor: T.brand }}
                >
                  <Plus size={13} /> Adicionar Hábitos
                </button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {definitions.map((h) => {
                    const isDone = Boolean(completedMap[h.id]);
                    const IconCmp = getHabitIconComponent(h.label, h.iconKey);
                    return (
                      <button
                        key={h.id}
                        data-tour="habit-toggle"
                        onClick={() => toggleHabit(h.id)}
                        className="flex items-center gap-2 p-2 rounded-xl text-left transition-all border group"
                        style={{
                          backgroundColor: isDone ? T.brand + '15' : T.surfaceAlt,
                          borderColor: isDone ? T.brand : T.border,
                        }}
                      >
                        <div
                          className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 border transition-all"
                          style={{
                            backgroundColor: isDone ? T.brand : 'transparent',
                            borderColor: isDone ? T.brand : T.border,
                          }}
                        >
                          {isDone ? (
                            <Check className="w-3 h-3 text-white" />
                          ) : (
                            <IconCmp className="w-3 h-3" style={{ color: T.inkSoft }} />
                          )}
                        </div>
                        <span
                          className="text-xs font-medium truncate flex-1"
                          style={{
                            color: isDone ? T.ink : T.inkSoft,
                            textDecoration: isDone ? 'line-through' : 'none',
                          }}
                        >
                          {h.label}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Barra de Progresso e Conclusão */}
                <div className="mt-3">
                  <div
                    className="h-1.5 w-full rounded-full overflow-hidden"
                    style={{ backgroundColor: T.surfaceAlt }}
                  >
                    <div
                      className="h-full transition-all duration-500 ease-out rounded-full"
                      style={{
                        width: `${progress}%`,
                        backgroundColor: progress === 100 ? '#10b981' : T.brand,
                      }}
                    />
                  </div>
                  {progress === 100 && totalCount > 0 && (
                    <div className="flex items-center justify-center gap-1.5 mt-2 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                      <Sparkles size={12} /> Todos os hábitos de hoje foram concluídos!
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        )}
      </Card>
    );
  }


function MetaHojeCard({ blocksHoje, routine, metaHoje, onSetMeta, minutosEstudadosHoje, config }) {
  const isVacation = config?.vacationMode;
  if (isVacation) {
    return (
      <Card style={{ borderColor: T.brand, backgroundColor: T.brand + '22' }}>
        <div className='flex flex-col items-center justify-center p-4 text-center'>
          <Palmtree className="w-6 h-6 mb-2" style={{ color: T.brand }} />
          <h3 className='font-bold text-lg mb-2' style={{ color: T.brand }}>Modo Férias Ativado</h3>
          <p className='text-sm' style={{ color: T.inkSoft }}>Seus streaks estão congelados. Sem metas de estudo para hoje. Descanse!</p>
        </div>
      </Card>
    );
  }

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

export function HojeTab({ overdue, blocksHoje, commitmentsHoje, routineItemsHoje, proximos, overload, onToggleBlock, onGoInbox, onGoAgenda, onGoDiario, routine, metaHoje, onSetMeta, minutosEstudadosHoje, avisos, config, updateConfig, notes, onSaveNote }) {
  
  const [mood, setMood] = React.useState(null);
  const [journalText, setJournalText] = React.useState("");
  const hojeDateStr = todayISO().slice(0,10);
  const hasJournalToday = notes && notes.some(n => n.disciplina === "Diário de Bordo" && n.created_at && n.created_at.startsWith(hojeDateStr));

  const handleSaveJournal = async () => {
    if (!mood || !journalText.trim()) return alert("Escolha um humor e escreva algo!");
    const finalTxt = `Humor: ${mood}\n\n${journalText.trim()}`;
    if (onSaveNote) {
      await onSaveNote({ disciplina: "Diário de Bordo", texto: finalTxt });
      sfx.complete();
      if (config?.enableConfetti !== false) {
        confetti({
          particleCount: 80,
          spread: 60,
          origin: { y: 0.6 },
          colors: ['#3b82f6', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6'],
          zIndex: 9999
        });
      }
      setMood(null);
      setJournalText("");
    }
  };

  const items = [
    ...(config?.enableRoutine !== false ? routineItemsHoje.map((r) => ({ ...r, isRoutine: true, sortKey: r.horaInicio || "99:99" })) : []),
    ...blocksHoje.map((b) => ({ ...b, sortKey: { manha: "09:00", tarde: "15:00", noite: "19:00" }[b.periodo] || "12:00" })),
    ...commitmentsHoje.map((c) => ({ ...c, isCommitment: true, sortKey: "23:59" })),
  ];
  items.sort((a, b) => a.sortKey.localeCompare(b.sortKey));

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto pt-2">

        {/* Revisão Espaçada (Ideia 11) */}
        {config?.enableSpacedRepetition !== false && (() => {
          const hoje = new Date(todayISO() + "T12:00:00Z");
          const revs = (notes||[]).filter(n => {
            if (!n.created_at || n.disciplina === "Diário de Bordo") return false;
            const diffTime = Math.abs(hoje - new Date(n.created_at));
            const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
            return diffDays === 1 || diffDays === 7 || diffDays === 30 || diffDays === 90;
          });
          if (revs.length === 0) return null;
          return (
            <Card style={{ borderColor: T.brand, backgroundColor: T.brand + '11' }} className="mb-6">
              <SectionLabel><RotateCcw size={16} className="inline mr-2 -mt-0.5" /> Revisão Espaçada (Curva de Esquecimento)</SectionLabel>
              <p className="text-xs mb-3" style={{ color: T.inkSoft }}>A IA separou estas anotações (de 1, 7, 30 ou 90 dias atrás) para você revisar hoje e fixar o conteúdo a longo prazo!</p>
              <div className="flex gap-3 overflow-x-auto custom-scrollbar pb-2 snap-x">
                {revs.map(r => {
                  const d = new Date(r.created_at);
                  const daysAgo = Math.floor(Math.abs(hoje - d) / (1000 * 60 * 60 * 24));
                  return (
                    <div key={r.id} className="min-w-[240px] max-w-[240px] snap-center rounded-lg p-3 text-sm flex flex-col justify-between" style={{ backgroundColor: T.surface, border: `1px solid ${T.border}` }}>
                      <div>
                        <div className="font-bold mb-1 truncate" style={{ color: T.brand }}>{r.disciplina}</div>
                        <div className="line-clamp-4 text-xs whitespace-pre-wrap" style={{ color: T.inkSoft }}>{formatTextWithTags(r.texto, T)}</div>
                      </div>
                      <div className="mt-3 flex justify-between items-center">
                        <AudioReaderButton text={r.texto} T={T} />
                        <div className="text-[10px] font-bold uppercase text-right" style={{ color: T.ink }}>Há {daysAgo} dias</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          );
        })()}

      
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
                        {item.isRoutine ? item.titulo : `${item.disciplina} — ${item.assunto}`}
                      </div>
                      <div className="text-sm mt-0.5" style={{ color: T.inkSoft }}>
                        {item.isRoutine
                          ? `${item.horaInicio?.slice(0, 5)} - ${item.horaFim?.slice(0, 5)}`
                          : `${PERIODO_LABELS[item.periodo] || ""} ${item.isCommitment ? `• ${TIPO_LABELS[item.tipo]}` : item.tipo === "revisao" ? "• revisão" : "• estudo"}`}
                      </div>
                    </div>
                    {item.isCommitment && <PriorityDot prioridade={item.prioridade} />}
                  </div>
                ))}
              </div>
            )}
          </Card>
          
          {config?.enableStudyGoals !== false && (
            <MetaHojeCard blocksHoje={blocksHoje} routine={routine} metaHoje={metaHoje} onSetMeta={onSetMeta} minutosEstudadosHoje={minutosEstudadosHoje} config={config} />
          )}
          {config?.enableHabits !== false && (
            <DailyHabits T={T} config={config} updateConfig={updateConfig} />
          )}
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
                    <button key={c.id} onClick={onGoAgenda} className="w-full text-left outline-none focus:outline-none bg-transparent hover:bg-transparent group">
                      <div className="flex items-center justify-between p-3 rounded-lg transition-transform group-hover:scale-[1.01] origin-left transform-gpu overflow-hidden" style={{ backgroundColor: T.surfaceAlt, border: `1px solid ${T.border}` }}>
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
        
        {/* Diário de Bordo (Idea 36 & 38) */}
        <div className="lg:col-span-12">
          {config?.enableJournal !== false && !hasJournalToday && (
            <Card style={{ backgroundColor: T.surfaceAlt, borderColor: T.border }}>
              <div className="max-w-3xl mx-auto">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <BookHeart className="w-5 h-5" style={{ color: T.brand }} />
                    <h3 className="text-lg font-bold" style={{ color: T.ink }}>Diário de Bordo</h3>
                  </div>
                  {onGoDiario && (
                    <button
                      type="button"
                      onClick={() => { sfx.pop(); onGoDiario(); }}
                      className="text-xs font-semibold flex items-center gap-1.5 transition-opacity hover:opacity-80"
                      style={{ color: T.brand }}
                    >
                      <span>Abrir Diário Completo</span>
                      <BookHeart className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
                <p className="text-sm mb-4 md:text-center" style={{ color: T.inkSoft }}>Como você está se sentindo hoje? Faça um rápido check-in mental.</p>
                
                <div className="flex gap-2 mb-4 flex-wrap md:justify-center">
                  {[
                    { id: "Excelente", label: "Excelente", icon: Laugh, color: "#10b981" },
                    { id: "Bem", label: "Bem", icon: Smile, color: "#3b82f6" },
                    { id: "Neutro", label: "Neutro", icon: Meh, color: "#94a3b8" },
                    { id: "Cansado", label: "Cansado", icon: Frown, color: "#f59e0b" },
                    { id: "Exausto", label: "Exausto", icon: Skull, color: "#ef4444" }
                  ].map(m => {
                    const IconCmp = m.icon;
                    const isSelected = mood === m.id;
                    return (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => { sfx.pop(); setMood(m.id); }}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border"
                        style={{
                          backgroundColor: isSelected ? T.brand + '22' : T.bg,
                          borderColor: isSelected ? T.brand : T.border,
                          color: isSelected ? T.ink : T.inkSoft
                        }}
                      >
                        <IconCmp className="w-4 h-4" style={{ color: isSelected ? T.brand : m.color }} />
                        <span>{m.label}</span>
                      </button>
                    );
                  })}
                </div>

                <textarea
                  value={journalText} onChange={e => setJournalText(e.target.value)}
                  placeholder="Escreva sobre o seu dia, suas vitórias ou desabafos..."
                  className="w-full p-3 rounded-xl text-sm outline-none resize-none min-h-[100px] mb-3 md:text-center"
                  style={{ backgroundColor: T.bg, color: T.ink, border: `1px solid ${T.border}` }}
                />
                
                <div className="flex justify-end md:justify-center">
                  <button onClick={handleSaveJournal} className="px-6 py-2 rounded-xl text-sm font-bold transition-opacity hover:opacity-80 shadow-sm" style={{ backgroundColor: T.brand, color: T.bg }}>
                    Salvar no Diário
                  </button>
                </div>
              </div>
            </Card>
          )}
          
          {config?.enableJournal !== false && hasJournalToday && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 rounded-xl text-sm" style={{ backgroundColor: T.surfaceAlt, color: T.inkSoft, border: `1px solid ${T.border}` }}>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: '#10b98122', color: '#10b981' }}>
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-semibold text-sm" style={{ color: T.ink }}>Check-in mental realizado hoje!</div>
                  <div className="text-xs" style={{ color: T.inkSoft }}>Sua reflexão foi salva no Diário de Bordo exclusivo.</div>
                </div>
              </div>
              {onGoDiario && (
                <button
                  type="button"
                  onClick={() => { sfx.pop(); onGoDiario(); }}
                  className="px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 hover:opacity-90"
                  style={{ backgroundColor: T.brand + '22', color: T.brand, border: `1px solid ${T.brand}44` }}
                >
                  <BookHeart className="w-4 h-4" />
                  <span>Abrir Diário Completo</span>
                </button>
              )}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
/* ---------------------------------------------------------------------- */
/* Aba: Inbox                                                               */
/* ---------------------------------------------------------------------- */
export function InboxTab({ userId, onSubmit, loading, error, pendingReview, setPendingReview, onConfirm, onSaveNote, setMaterials, initialInboxText, setInitialInboxText }) {
  const [text, setText] = useState(initialInboxText || "");
  useEffect(() => { if (initialInboxText) { setText(initialInboxText); if (setInitialInboxText) setInitialInboxText(""); } }, [initialInboxText, setInitialInboxText]);
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
  const [showMapa, setShowMapa] = useState(false);

    const [viewMode, setViewMode] = useState("lista"); // "lista" | "kanban"


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

        <div className="flex justify-end mb-4">
          <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
            <button onClick={() => setViewMode("lista")} className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${viewMode === "lista" ? "bg-white dark:bg-gray-700 shadow" : "opacity-50"}`} style={{ color: viewMode === "lista" ? T.brand : T.ink }}>Lista</button>
            <button onClick={() => setViewMode("kanban")} className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${viewMode === "kanban" ? "bg-white dark:bg-gray-700 shadow" : "opacity-50"}`} style={{ color: viewMode === "kanban" ? T.brand : T.ink }}>Kanban</button>
            <button onClick={() => setViewMode("calendario")} className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${viewMode === "calendario" ? "bg-white dark:bg-gray-700 shadow" : "opacity-50"}`} style={{ color: viewMode === "calendario" ? T.brand : T.ink }}>Google Cal</button>
          </div>
        </div>

        
        {viewMode === "calendario" ? (
          <div className="w-full overflow-x-auto custom-scrollbar pb-4">
            <div className="min-w-[700px] grid grid-cols-7 gap-2">
              {Array.from({ length: 7 }, (_, i) => {
                const d = addDays(hoje, i);
                const dayBlocks = studyBlocks.filter(b => !b.concluido && b.date === d);
                const dayComms = commitments.filter(c => !c.concluido && c.prazo === d);
                return (
                  <div key={d} className="flex flex-col gap-2">
                    <div className="text-center p-2 rounded-t-xl font-bold text-xs" style={{ backgroundColor: i === 0 ? T.brand : T.surfaceAlt, color: i === 0 ? T.brandInk : T.inkSoft }}>
                      {i === 0 ? "Hoje" : d.slice(8,10) + "/" + d.slice(5,7)}
                    </div>
                    {["manha", "tarde", "noite"].map(per => {
                      const blocks = dayBlocks.filter(b => b.periodo === per);
                      return (
                        <div key={per} className="flex flex-col gap-1 p-2 min-h-[80px] rounded-lg text-xs" style={{ backgroundColor: T.surfaceAlt, border: `1px solid ${T.border}` }}>
                          <span className="text-[10px] font-bold uppercase opacity-50 mb-1" style={{ color: T.ink }}>{per}</span>
                          {blocks.map(b => (
                            <div key={b.id} className="p-1 rounded cursor-pointer hover:opacity-80" style={{ backgroundColor: T.brand + '33', color: T.brand, borderLeft: `3px solid ${T.brand}` }} onClick={() => setOpenCommitment(commitments.find(c => c.id === b.commitment_id))}>
                              {b.assunto}
                            </div>
                          ))}
                        </div>
                      )
                    })}
                    <div className="flex flex-col gap-1 p-2 rounded-lg text-xs mt-1" style={{ border: `1px dashed ${T.importante}66` }}>
                      <span className="text-[10px] font-bold uppercase mb-1" style={{ color: T.importante }}>Vence hoje</span>
                      {dayComms.length === 0 && <span className="text-[10px] opacity-40" style={{ color: T.inkSoft }}>Nada</span>}
                      {dayComms.map(c => (
                        <div key={c.id} className="p-1 rounded cursor-pointer truncate flex items-center gap-1" style={{ backgroundColor: T.importante + '22', color: T.importante }} onClick={() => setOpenCommitment(c)}>
                          <Flame className="w-3 h-3 inline text-amber-500 shrink-0" />
                          <span className="truncate">{c.assunto}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : viewMode === "kanban" ? (

          <div className="flex flex-col md:flex-row gap-4 overflow-x-auto custom-scrollbar pb-4 items-start">
            {["A Fazer", "Atrasados", "Concluídos"].map(col => {
              let items = [];
              if (col === "A Fazer") items = commitments.filter(c => !c.concluido && (!c.prazo || c.prazo >= hoje));
              else if (col === "Atrasados") items = commitments.filter(c => !c.concluido && c.prazo && c.prazo < hoje);
              else if (col === "Concluídos") items = commitments.filter(c => c.concluido);
              
              return (
                <div key={col} className="flex-1 min-w-[280px] rounded-xl p-3" style={{ backgroundColor: T.surfaceAlt, border: `1px solid ${T.border}` }}>
                  <div className="font-bold text-sm mb-3 px-1 flex justify-between items-center" style={{ color: T.inkSoft }}>
                    {col} <span className="bg-black/10 dark:bg-white/10 px-2 py-0.5 rounded-full text-[10px]">{items.length}</span>
                  </div>
                  <div className="space-y-2">
                    {items.map(c => (
                      <Card key={c.id} className="cursor-pointer hover:border-blue-500 transition-colors p-3" onClick={() => setOpenCommitment(c)}>
                        <div className="text-[10px] font-bold uppercase mb-1" style={{ color: T.brand }}>{c.disciplina}</div>
                        <div className="text-sm font-medium leading-snug mb-2">{c.assunto}</div>
                        {c.prazo && <div className="text-xs" style={{ color: col === "Atrasados" ? T.critico : T.inkSoft }}>{formatDateBR(c.prazo)}</div>}
                      </Card>
                    ))}
                    {items.length === 0 && <div className="text-xs text-center py-4 italic opacity-50">Vazio</div>}
                  </div>
                </div>
              );
            })}
          </div>
        ) : dates.length === 0 ? (
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
                        {item.kind === "routine" ? item.titulo : `${item.disciplina} — ${item.assunto}`}
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
                        <button onClick={(e) => { e.stopPropagation(); const ans = prompt("Para excluir permanentemente, digite o nome exato do compromisso:\n\n" + item.assunto); if (ans === item.assunto) { onDeleteCommitment(item.id); } else if (ans !== null) { alert("Nome incorreto. Exclusão cancelada."); } }} style={{ color: T.inkSoft }}><Trash2 className="w-4 h-4" /></button>
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
            onDeleteCommitment={onDeleteCommitment}
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
  if (sessions.some(s => s.minutos >= 120)) badges.push({ ic: <Activity size={24} />, n: "Maratonista", d: "Sessão de +2h" });
  if (sessions.length >= 10) badges.push({ ic: <Medal size={24} />, n: "Iniciante", d: "10 sessões" });
  if (sessions.length >= 50) badges.push({ ic: <Award size={24} />, n: "Veterano", d: "50 sessões" });
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

export function getPetSprite(petId = 'none', state = 'happy') {
  if (!petId || petId === 'none' || petId === 'coruja') {
    return `/owl_${state}.png`;
  }
  if (['gato', 'shiba', 'panda', 'raposa', 'coelho'].includes(petId)) {
    return `/pet_${petId}_${state}_v3.png`;
  }
  if (petId.startsWith('pet_')) {
    return `/${petId}_${state}_v3.png`;
  }
  return `/owl_${petId}_${state}.png`;
}

export const STUDY_PETS = [
  { id: 'none', name: 'Coruja Omnia', desc: 'Guardiã clássica da rotina e sabedoria acadêmica', title: 'Mestre da Rotina', price: 0, preview: '/owl_happy.png' },
  { id: 'gato', name: 'Gato Mochi', desc: 'Companheiro zen, aconchegante e leitor voraz', title: 'Guardião da Calma', price: 60, preview: '/pet_gato_happy_v3.png' },
  { id: 'shiba', name: 'Shiba Bento', desc: 'Leal, animado e sempre pronto para mais um pomodoro', title: 'Foco e Lealdade', price: 90, preview: '/pet_shiba_happy_v3.png' },
  { id: 'panda', name: 'Panda Bamboo', desc: 'Serenidade pura e foco sem pressa nem ansiedade', title: 'Mestre da Serenidade', price: 120, preview: '/pet_panda_happy_v3.png' },
  { id: 'raposa', name: 'Raposa Kitsune', desc: 'Astuta, veloz nas matérias difíceis e curiosa', title: 'Sábia e Astuta', price: 150, preview: '/pet_raposa_happy_v3.png' },
  { id: 'coelho', name: 'Coelho Pipoca', desc: 'Ágil nos prazos, focado e cheio de energia para revisar', title: 'Veloz nos Prazos', price: 180, preview: '/pet_coelho_happy_v3.png' },
];

export const OWL_SKINS = STUDY_PETS;

export const PET_SNACKS = [
  { id: 'maca', name: 'Maçã de Foco', icon: Apple, cost: 15, energy: 20, xp: 25, desc: 'Fruta fresca que renova a mente e alivia a preguiça.' },
  { id: 'biscoito', name: 'Biscoito Crocante', icon: Cookie, cost: 30, energy: 35, xp: 55, desc: 'Com gotas de chocolate e determinação acadêmica.' },
  { id: 'cafe', name: 'Café Expresso Turbo', icon: Coffee, cost: 50, energy: 50, xp: 95, desc: 'Dose forte de cafeína para sessões intensas de estudo.' },
  { id: 'pocao', name: 'Poção Estelar', icon: FlaskConical, cost: 80, energy: 100, xp: 180, desc: 'Elixir misterioso que restaura a energia máxima e inspiração!' },
];

export const BOSS_ROSTER = [
  {
    id: 'procrastinacao',
    name: 'Gólem da Procrastinação',
    title: 'Devorador de Minutos',
    icon: Hourglass,
    spriteIdle: '/boss_procrastinacao_idle.png',
    spriteHurt: '/boss_procrastinacao_hurt.png',
    maxHp: 1000,
    weakness: 'Blocos contínuos de foco',
    desc: 'Alimenta-se de notificações e vídeos curtos. Foco contínuo quebra sua carapaça de pedra!',
    themeColor: '#f59e0b',
  },
  {
    id: 'materia_acumulada',
    name: 'Dragão dos Prazos Atrasados',
    title: 'Incendiário Semestral',
    icon: Flame,
    spriteIdle: '/boss_materia_acumulada_idle.png',
    spriteHurt: '/boss_materia_acumulada_hurt.png',
    maxHp: 1800,
    weakness: 'Revisão ativa e resumos',
    desc: 'Um réptil gigante que cospe pilhas de PDFs não lidos. Cada minuto de foco extingue suas chamas!',
    themeColor: '#ef4444',
  },
  {
    id: 'burnout',
    name: 'Espectro da Exaustão Mental',
    title: 'Lorde da Névoa Cerebral',
    icon: Skull,
    spriteIdle: '/boss_burnout_idle.png',
    spriteHurt: '/boss_burnout_hurt.png',
    maxHp: 2500,
    weakness: 'Pomodoro com pausas conscientes',
    desc: 'Tenta fazer você desistir pelo cansaço. Mantenha o ritmo calmo para dissipá-lo!',
    themeColor: '#8b5cf6',
  },
  {
    id: 'tcc_final',
    name: 'Titã da Prova Final',
    title: 'Chefe Supremo do Semestre',
    icon: Swords,
    spriteIdle: '/boss_tcc_final_idle.png',
    spriteHurt: '/boss_tcc_final_hurt.png',
    maxHp: 3600,
    weakness: 'Sessão profunda acima de 45 min',
    desc: 'O desafio definitivo de todo universitário. Derrubá-lo garante lenda e glória acadêmica!',
    themeColor: '#ec4899',
  }
];

function OmniaWrapped({ sessions = [], quizAttempts = [], professorAttempts = [], commitments = [], config = {} }) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [sharingStory, setSharingStory] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const storyCardRef = useRef(null);

  useEffect(() => {
    QRCode.toDataURL("https://omnia-unio.vercel.app", {
      margin: 1,
      width: 180,
      color: {
        dark: "#070d1e",
        light: "#ffffff",
      },
    })
      .then((url) => setQrCodeUrl(url))
      .catch((err) => console.error("Erro ao gerar QR Code:", err));
  }, []);

  const [currentSkinId, setCurrentSkinId] = useState(() => {
    try {
      const localCfg = JSON.parse(localStorage.getItem("omnia_config") || "{}");
      return localCfg.petSkin || localCfg.equippedSkin || config?.petSkin || config?.equippedSkin || "none";
    } catch {
      return config?.petSkin || config?.equippedSkin || "none";
    }
  });

  if (!sessions || sessions.length === 0) return null;

  const totalMinutos = sessions.reduce((acc, s) => acc + (Number(s.minutos) || 0), 0);
  const totalSessoes = sessions.length;
  const mediaMinutos = totalSessoes > 0 ? Math.round(totalMinutos / totalSessoes) : 0;

  // Formatação inteligente do tempo para nunca exibir 0h seco
  let tempoStr = "";
  if (totalMinutos < 60) {
    tempoStr = totalMinutos > 0 ? `${totalMinutos} min` : "0 min";
  } else {
    const h = Math.floor(totalMinutos / 60);
    const m = totalMinutos % 60;
    tempoStr = m > 0 ? `${h}h ${m}m` : `${h}h`;
  }

  // Top Disciplina
  const discMap = {};
  sessions.forEach((s) => {
    const d = s.disciplina || "Geral";
    discMap[d] = (discMap[d] || 0) + (Number(s.minutos) || 0);
  });
  const topDisc = Object.keys(discMap).sort((a, b) => discMap[b] - discMap[a])[0] || "Livre";
  const displayTopDisc = topDisc && topDisc.length > 18 ? topDisc.slice(0, 16) + "…" : topDisc;
  const topDiscMin = discMap[topDisc] || 0;
  const pctTop = totalMinutos > 0 ? Math.round((topDiscMin / totalMinutos) * 100) : 100;

  // Turno de ouro mais produtivo
  const periodCount = { "Manhã": 0, "Tarde": 0, "Noite": 0, "Madrugada": 0 };
  sessions.forEach((s) => {
    if (s.date) {
      const h = new Date(s.date).getHours();
      if (h >= 6 && h < 12) periodCount["Manhã"]++;
      else if (h >= 12 && h < 18) periodCount["Tarde"]++;
      else if (h >= 18 && h < 24) periodCount["Noite"]++;
      else periodCount["Madrugada"]++;
    }
  });
  const topPeriodo = Object.keys(periodCount).sort((a, b) => periodCount[b] - periodCount[a])[0] || "Tarde";

  // Streak / Ofensiva
  const streak = Math.max(
    parseInt(localStorage.getItem("omnia_streak_days") || "0") || 0,
    Number(config?.streak) || 0
  );

  // Perfil acadêmico baseado nos hábitos reais
  let perfilTitulo = "Estrategista Metódico";
  let perfilDesc = "Constância equilibrada entre blocos de foco, pausas e energia.";
  let PerfilIcon = Target;

  if (mediaMinutos >= 45) {
    perfilTitulo = "Maratonista de Imersão";
    perfilDesc = "Foco sustentado com facilidade para mergulhar em temas complexos.";
    PerfilIcon = Activity;
  } else if (topPeriodo === "Noite" || topPeriodo === "Madrugada") {
    perfilTitulo = "Coruja Noturna";
    perfilDesc = "Pico de produtividade no silêncio e na tranquilidade noturna.";
    PerfilIcon = Moon;
  } else if ((quizAttempts?.length || 0) >= 3 || (professorAttempts?.length || 0) >= 1) {
    perfilTitulo = "Praticante Ativo";
    perfilDesc = "Domínio de autoexplicação e recuperação ativa para reter conteúdos.";
    PerfilIcon = Brain;
  } else if (streak >= 3) {
    perfilTitulo = "Guardião da Constância";
    perfilDesc = "Hábito inabalável com ofensiva diária mantida com disciplina.";
    PerfilIcon = Flame;
  }

  // Mascote de estudo equipado pelo usuário
  const activeSkin = STUDY_PETS.find((s) => s.id === currentSkinId) || STUDY_PETS[0];
  const mascotSrc = getPetSprite(activeSkin.id, 'happy');

  const handleOpen = () => {
    try {
      const localCfg = JSON.parse(localStorage.getItem("omnia_config") || "{}");
      const sid = localCfg.petSkin || localCfg.equippedSkin || config?.petSkin || config?.equippedSkin || "none";
      setCurrentSkinId(sid);
    } catch {}
    setOpen(true);
    sfx.levelUp();
    if (window.confetti) {
      window.confetti({ particleCount: 65, spread: 75, origin: { y: 0.6 } });
    }
  };

  const handleCopy = () => {
    sfx.click();
    const text = `[OMNIA WRAPPED - Retrospectiva Acadêmica]
Tempo Total Focado: ${tempoStr}
Sessões Concluídas: ${totalSessoes} (média ~${mediaMinutos} min/sessão)
Disciplina Mais Estudada: ${topDisc} (${pctTop}% do foco)
Perfil de Estudo: ${perfilTitulo}
Mascote Companheiro: ${activeSkin.name} (${activeSkin.title || 'Mestre da Rotina'})
Ofensiva: ${streak > 0 ? `${streak} dias consecutivos` : 'Ativo'}
Plataforma: Omnia (omnia-unio.vercel.app)`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleShareStory = async () => {
    sfx.click();
    const cardEl = storyCardRef.current;
    if (!cardEl) return;
    setSharingStory(true);
    try {
      let qr = qrCodeUrl;
      if (!qr) {
        try {
          qr = await QRCode.toDataURL("https://omnia-unio.vercel.app", {
            margin: 1,
            width: 180,
            color: { dark: "#070d1e", light: "#ffffff" },
          });
          setQrCodeUrl(qr);
        } catch (e) {
          console.error("QR Code error:", e);
        }
      }

      // Sincroniza imagem do QR Code
      const qrImgEl = document.getElementById("omnia-story-qr-img");
      if (qrImgEl && qr) {
        qrImgEl.src = qr;
      }

      // Torna o card temporariamente visível no topo da viewport para renderização perfeita no html2canvas
      cardEl.style.left = "0px";
      cardEl.style.top = "0px";
      cardEl.style.zIndex = "999999";
      cardEl.style.opacity = "1";
      cardEl.style.visibility = "visible";

      if (document.fonts && document.fonts.ready) {
        await document.fonts.ready;
      }
      await new Promise((r) => setTimeout(r, 250));

      // Injeta override temporário para impedir que o Tailwind (img { display: block })
      // quebre o cálculo de baseline de fontes no FontMetrics do html2canvas
      const styleFix = document.createElement("style");
      styleFix.id = "h2c-fontmetrics-fix";
      styleFix.innerHTML = "img { display: inline !important; }";
      document.head.appendChild(styleFix);

      let canvas;
      try {
        canvas = await html2canvas(cardEl, {
          scale: 2,
          useCORS: true,
          allowTaint: true,
          backgroundColor: "#070d1e",
          logging: false,
          width: 450,
          height: 800,
          x: 0,
          y: 0,
          scrollX: 0,
          scrollY: 0,
          onclone: (clonedDoc) => {
            const cloneStyle = clonedDoc.createElement("style");
            cloneStyle.innerHTML = "img { display: inline !important; }";
            clonedDoc.head.appendChild(cloneStyle);
          },
        });
      } finally {
        styleFix.remove();
      }

      // Retorna para o estado oculto
      cardEl.style.left = "-9999px";
      cardEl.style.opacity = "0";
      cardEl.style.zIndex = "-9999";
      cardEl.style.visibility = "hidden";

      canvas.toBlob(async (blob) => {
        if (!blob) {
          setSharingStory(false);
          return;
        }
        const file = new File([blob], `omnia-wrapped-story-${todayISO()}.png`, { type: "image/png" });

        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          try {
            await navigator.share({
              files: [file],
              title: "Omnia Wrapped",
              text: "Minha retrospectiva na Omnia! 🦉✨",
            });
            setSharingStory(false);
            return;
          } catch (err) {
            if (err.name !== "AbortError") console.error(err);
          }
        }

        // Fallback: download da imagem no formato 9:16 para stories
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.download = `omnia_wrapped_story_${todayISO()}.png`;
        link.href = url;
        link.click();
        URL.revokeObjectURL(url);

        try {
          await navigator.clipboard.writeText(
            `Meu Omnia Wrapped 🦉✨\nTempo focado: ${tempoStr}\nDisciplina: ${topDisc}\nOfensiva: ${streak} dias\nCoruja: ${activeSkin.name}\nomnia-unio.vercel.app`
          );
        } catch (e) {}

        alert("Imagem do Story pronta e baixada com sucesso! Você já pode postar nos seus Stories.");
        setSharingStory(false);
      }, "image/png", 0.95);
    } catch (err) {
      if (cardEl) {
        cardEl.style.left = "-9999px";
        cardEl.style.opacity = "0";
        cardEl.style.zIndex = "-9999";
        cardEl.style.visibility = "hidden";
      }
      console.error("Erro ao gerar Story:", err);
      alert("Não foi possível gerar a imagem automaticamente. Você pode usar o botão 'Copiar Resumo'!");
      setSharingStory(false);
    }
  };

  return (
    <>
      {/* Banner de Abertura Adaptativo ao Tema */}
      <div
        className="p-4 sm:p-5 rounded-2xl border transition-all hover:shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
        style={{ backgroundColor: T.surfaceAlt, borderColor: T.border }}
      >
        <div className="flex items-center gap-3.5">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border"
            style={{ backgroundColor: TINT.brand, color: T.brand, borderColor: T.border }}
          >
            <Sparkles size={22} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-base tracking-tight" style={{ color: T.ink }}>
                Omnia Wrapped
              </h3>
              <span
                className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full border"
                style={{ backgroundColor: TINT.brand, color: T.brand, borderColor: T.border }}
              >
                Retrospectiva
              </span>
            </div>
            <p className="text-xs mt-0.5" style={{ color: T.inkSoft }}>
              Descubra seus recordes de foco, disciplina favorita e seu perfil de estudante.
            </p>
          </div>
        </div>
        <button
          onClick={handleOpen}
          className="w-full sm:w-auto px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-transform active:scale-95 shadow-sm hover:opacity-95"
          style={{ backgroundColor: T.brand, color: T.brandInk }}
        >
          <Sparkles size={16} /> Ver Meu Wrapped
        </button>
      </div>

      {/* Modal Adaptativo ao Tema */}
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-md"
          onClick={() => setOpen(false)}
        >
          <div
            className="relative w-full max-w-lg rounded-3xl p-5 sm:p-7 shadow-2xl border flex flex-col max-h-[92vh] overflow-hidden"
            style={{ backgroundColor: T.surface, borderColor: T.border, color: T.ink }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Efeitos de iluminação ambiente que usam as cores do tema */}
            <div
              className="absolute -top-24 -right-24 w-60 h-60 rounded-full blur-3xl pointer-events-none opacity-20"
              style={{ backgroundColor: T.brand }}
            />
            <div
              className="absolute -bottom-24 -left-24 w-60 h-60 rounded-full blur-3xl pointer-events-none opacity-15"
              style={{ backgroundColor: T.purple }}
            />

            {/* Cabeçalho do Modal */}
            <div className="flex items-start justify-between gap-4 mb-5 shrink-0 relative z-10">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full border flex items-center gap-1"
                    style={{ backgroundColor: TINT.brand, color: T.brand, borderColor: T.border }}
                  >
                    <Sparkles size={11} /> Retrospectiva Acadêmica
                  </span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-black tracking-tight" style={{ color: T.ink }}>
                  Omnia Wrapped
                </h2>
                <p className="text-xs sm:text-sm" style={{ color: T.inkSoft }}>
                  Sua jornada de evolução e foco em números
                </p>
              </div>

              <button
                onClick={() => setOpen(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center transition-colors border shrink-0"
                style={{ backgroundColor: T.surfaceAlt, borderColor: T.border, color: T.inkSoft }}
                title="Fechar"
              >
                <X size={16} />
              </button>
            </div>

            {/* Conteúdo com Scroll Suave */}
            <div className="overflow-y-auto space-y-3.5 pr-1 relative z-10 flex-1">
              {/* Card Destaque: Tempo Total */}
              <div
                className="p-4 sm:p-5 rounded-2xl border text-center relative overflow-hidden"
                style={{ backgroundColor: T.surfaceAlt, borderColor: T.border }}
              >
                <div
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold mb-2 border"
                  style={{ backgroundColor: TINT.brand, color: T.brand, borderColor: T.border }}
                >
                  <Clock size={13} /> Tempo Total Dedicado
                </div>
                <div className="text-4xl sm:text-5xl font-black tracking-tight my-1" style={{ color: T.brand }}>
                  {tempoStr}
                </div>
                <div className="text-xs font-medium" style={{ color: T.inkSoft }}>
                  Distribuídos em <span className="font-bold" style={{ color: T.ink }}>{totalSessoes} sessões</span> de foco (média de ~{mediaMinutos} min)
                </div>
              </div>

              {/* Grid 2 Colunas: Disciplina + Ofensiva/Consistência */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Disciplina Favorita */}
                <div
                  className="p-4 rounded-2xl border flex flex-col items-center justify-center text-center"
                  style={{ backgroundColor: T.surfaceAlt, borderColor: T.border }}
                >
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <div
                      className="w-7 h-7 rounded-lg flex items-center justify-center border"
                      style={{ backgroundColor: TINT.purple, color: T.purple, borderColor: T.border }}
                    >
                      <BookOpen size={14} />
                    </div>
                    <span className="text-[11px] font-bold uppercase tracking-wider" style={{ color: T.inkSoft }}>
                      Disciplina Favorita
                    </span>
                  </div>
                  <div className="my-1">
                    <div className="text-lg font-black truncate max-w-full" style={{ color: T.ink }} title={topDisc}>
                      {topDisc}
                    </div>
                    <div className="text-xs mt-0.5" style={{ color: T.inkSoft }}>
                      <span className="font-bold" style={{ color: T.purple }}>{pctTop}%</span> do seu tempo focado ({topDiscMin} min)
                    </div>
                  </div>
                </div>

                {/* Ofensiva / Constância */}
                <div
                  className="p-4 rounded-2xl border flex flex-col items-center justify-center text-center"
                  style={{ backgroundColor: T.surfaceAlt, borderColor: T.border }}
                >
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <div
                      className="w-7 h-7 rounded-lg flex items-center justify-center border"
                      style={{ backgroundColor: TINT.importante, color: T.importante, borderColor: T.border }}
                    >
                      <Flame size={14} />
                    </div>
                    <span className="text-[11px] font-bold uppercase tracking-wider" style={{ color: T.inkSoft }}>
                      Ritmo & Ofensiva
                    </span>
                  </div>
                  <div className="my-1">
                    <div className="text-lg font-black" style={{ color: streak > 0 ? T.importante : T.ink }}>
                      {streak > 0 ? `${streak} Dias Seguidos` : `${totalSessoes} Sessões`}
                    </div>
                    <div className="text-xs mt-0.5" style={{ color: T.inkSoft }}>
                      Turno mais produtivo: <span className="font-semibold" style={{ color: T.ink }}>{topPeriodo}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card de Perfil com Mascote da Coruja na cor equipada */}
              <div
                className="p-4 rounded-2xl border flex items-center gap-4"
                style={{ backgroundColor: T.surfaceAlt, borderColor: T.border }}
              >
                {/* Mascote Sprite na cor equipada */}
                <div
                  className="w-16 h-16 rounded-2xl border overflow-hidden shrink-0 flex items-center justify-center p-1 shadow-sm"
                  style={{ backgroundColor: T.surface, borderColor: T.border }}
                >
                  <img
                    src={mascotSrc}
                    alt={activeSkin.name}
                    className="w-14 h-14 object-contain"
                    style={{ imageRendering: "pixelated" }}
                    onError={(e) => { e.currentTarget.src = "/owl_happy.png"; }}
                  />
                </div>

                {/* Descrição do Perfil */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                    <div className="flex items-center gap-1.5">
                      <PerfilIcon size={14} style={{ color: T.brand }} />
                      <span className="text-xs font-bold uppercase tracking-wider" style={{ color: T.brand }}>
                        {perfilTitulo}
                      </span>
                    </div>
                    <span
                      className="text-[10px] px-2 py-0.5 rounded-full font-bold border ml-auto"
                      style={{ backgroundColor: TINT.brand, color: T.brand, borderColor: T.border }}
                    >
                      {activeSkin.name}
                    </span>
                  </div>
                  <p className="text-xs leading-relaxed" style={{ color: T.inkSoft }}>
                    {perfilDesc}
                  </p>
                </div>
              </div>
            </div>

            {/* Rodapé com Ações Adaptativas */}
            <div className="mt-4 pt-3 border-t flex flex-col sm:flex-row items-center gap-2.5 shrink-0 relative z-10" style={{ borderColor: T.border }}>
              <button
                onClick={handleShareStory}
                disabled={sharingStory}
                className="w-full sm:flex-1 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-transform active:scale-95 shadow-sm hover:opacity-95 text-white disabled:opacity-50"
                style={{
                  background: 'linear-gradient(135deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)',
                }}
              >
                {sharingStory ? (
                  <>
                    <Loader2 size={15} className="animate-spin" />
                    <span>Gerando Story...</span>
                  </>
                ) : (
                  <>
                    <Instagram size={15} />
                    <span>Compartilhar nos Stories</span>
                  </>
                )}
              </button>

              <button
                onClick={handleCopy}
                className="w-full sm:flex-1 py-2.5 px-4 rounded-xl border text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-colors hover:opacity-90"
                style={{ backgroundColor: T.surfaceAlt, borderColor: T.border, color: T.ink }}
              >
                {copied ? (
                  <>
                    <Check size={15} className="text-emerald-500" />
                    <span>Copiado!</span>
                  </>
                ) : (
                  <>
                    <Copy size={15} style={{ color: T.inkSoft }} />
                    <span>Copiar Resumo</span>
                  </>
                )}
              </button>

              <button
                onClick={() => setOpen(false)}
                className="w-full sm:w-auto py-2.5 px-5 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-transform active:scale-95 shadow-sm hover:opacity-95"
                style={{ backgroundColor: T.brand, color: T.brandInk }}
              >
                <Sparkles size={15} /> Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Template de Instagram Story (9:16 - 450x800px) */}
      <div
        id="omnia-story-card"
        ref={storyCardRef}
        style={{
          position: "fixed",
          left: "-9999px",
          top: 0,
          width: "450px",
          height: "800px",
          background: "linear-gradient(160deg, #070d1e 0%, #151638 45%, #050814 100%)",
          color: "#ffffff",
          fontFamily: "'Plus Jakarta Sans', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
          padding: "32px 24px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          boxSizing: "border-box",
          overflow: "hidden",
          zIndex: "-9999",
          opacity: 0,
          visibility: "hidden",
        }}
      >
        {/* Glow ambient background effects */}
        <div style={{ position: "absolute", top: "-50px", right: "-50px", width: "240px", height: "240px", borderRadius: "50%", background: "#3b82f6", filter: "blur(70px)", opacity: 0.35, pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: "-60px", left: "-60px", width: "260px", height: "260px", borderRadius: "50%", background: "#ec4899", filter: "blur(80px)", opacity: 0.25, pointerEvents: "none" }} />
        <div style={{ position: "absolute", top: "40%", right: "-40px", width: "180px", height: "180px", borderRadius: "50%", background: "#8b5cf6", filter: "blur(70px)", opacity: 0.3, pointerEvents: "none" }} />

        {/* Top Header */}
        <div style={{ position: "relative", zIndex: 10, display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", paddingBottom: "2px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "rgba(59, 130, 246, 0.2)", border: "1px solid rgba(59, 130, 246, 0.4)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <Sparkles size={18} color="#60a5fa" />
            </div>
            <div>
              <div style={{ fontSize: "16px", fontWeight: "900", letterSpacing: "-0.5px", lineHeight: "1.2" }}>OMNIA WRAPPED</div>
              <div style={{ fontSize: "10px", color: "rgba(255,255,255,0.6)", textTransform: "uppercase", letterSpacing: "1px", lineHeight: "1.2", marginTop: "2px" }}>Retrospectiva Acadêmica</div>
            </div>
          </div>
          <div style={{ display: "inline-block", padding: "5px 14px", borderRadius: "999px", background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.18)", fontSize: "11px", fontWeight: "800", lineHeight: "1", textAlign: "center" }}>
            2026
          </div>
        </div>

        {/* Hero: Mascote da Coruja na cor equipada */}
        <div style={{ position: "relative", zIndex: 10, textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", width: "100%" }}>
          <div style={{ width: "130px", height: "130px", margin: "0 auto", borderRadius: "28px", background: "rgba(255, 255, 255, 0.06)", border: "1px solid rgba(255, 255, 255, 0.16)", display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(12px)", boxShadow: "0 14px 32px rgba(0,0,0,0.45)" }}>
            <img
              src={mascotSrc}
              alt={activeSkin.name}
              style={{ width: "105px", height: "105px", objectFit: "contain", imageRendering: "pixelated", display: "block" }}
            />
          </div>
          <div style={{ marginTop: "12px", display: "inline-block", padding: "5px 16px", borderRadius: "999px", background: "rgba(96, 165, 250, 0.18)", border: "1px solid rgba(96, 165, 250, 0.35)", fontSize: "11px", fontWeight: "800", color: "#93c5fd", lineHeight: "1", textAlign: "center" }}>
            {activeSkin.name}
          </div>
          <div style={{ marginTop: "10px", width: "100%", fontSize: "22px", fontWeight: "900", color: "#ffffff", lineHeight: "1.2", textAlign: "center", letterSpacing: "-0.3px" }}>
            {perfilTitulo}
          </div>
          <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.68)", maxWidth: "330px", margin: "4px auto 0", lineHeight: "1.4", textAlign: "center", width: "100%" }}>
            {perfilDesc}
          </div>
        </div>

        {/* Big Highlights: Stats com alinhamento rigorosamente simétrico e centralização perfeita */}
        <div style={{ position: "relative", zIndex: 10, display: "flex", flexDirection: "column", gap: "10px", width: "100%" }}>
          {/* Main Stat Card com centralização vertical e horizontal perfeita */}
          <div style={{
            background: "rgba(255, 255, 255, 0.07)",
            border: "1px solid rgba(255, 255, 255, 0.14)",
            borderRadius: "22px",
            padding: "16px 20px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
            boxSizing: "border-box",
            width: "100%",
            minHeight: "116px",
            boxShadow: "0 8px 24px rgba(0,0,0,0.25)"
          }}>
            <div style={{ width: "100%", textAlign: "center", fontSize: "11px", textTransform: "uppercase", fontWeight: "800", letterSpacing: "1px", color: "#93c5fa", lineHeight: "1.2", margin: "0 0 4px 0", padding: 0 }}>
              Tempo Total Dedicado
            </div>
            <div style={{ width: "100%", textAlign: "center", fontSize: "40px", fontWeight: "900", letterSpacing: "-1px", color: "#60a5fa", lineHeight: "1.1", margin: "0 0 4px 0", padding: 0 }}>
              {tempoStr}
            </div>
            <div style={{ width: "100%", textAlign: "center", fontSize: "11px", color: "rgba(255,255,255,0.65)", lineHeight: "1.2", margin: 0, padding: 0 }}>
              {totalSessoes} sessões de foco • média de ~{mediaMinutos} min
            </div>
          </div>

          {/* 2-Column Stats Grid com centralização vertical balanceada */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", width: "100%" }}>
            <div style={{
              background: "rgba(255, 255, 255, 0.05)",
              border: "1px solid rgba(255, 255, 255, 0.12)",
              borderRadius: "20px",
              padding: "14px 12px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              textAlign: "center",
              boxSizing: "border-box",
              width: "100%",
              minHeight: "96px",
              boxShadow: "0 6px 18px rgba(0,0,0,0.2)"
            }}>
              <div style={{ width: "100%", textAlign: "center", fontSize: "10px", textTransform: "uppercase", fontWeight: "800", letterSpacing: "0.5px", color: "#c084fc", lineHeight: "1.2", margin: "0 0 4px 0", padding: 0 }}>
                Top Disciplina
              </div>
              <div style={{ width: "100%", textAlign: "center", fontSize: "17px", fontWeight: "900", color: "#ffffff", lineHeight: "1.2", margin: "0 0 4px 0", padding: 0, overflow: "visible" }} title={topDisc}>
                {displayTopDisc}
              </div>
              <div style={{ width: "100%", textAlign: "center", fontSize: "10px", color: "rgba(255,255,255,0.65)", lineHeight: "1.2", margin: 0, padding: 0 }}>
                {pctTop}% do foco total
              </div>
            </div>

            <div style={{
              background: "rgba(255, 255, 255, 0.05)",
              border: "1px solid rgba(255, 255, 255, 0.12)",
              borderRadius: "20px",
              padding: "14px 12px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              textAlign: "center",
              boxSizing: "border-box",
              width: "100%",
              minHeight: "96px",
              boxShadow: "0 6px 18px rgba(0,0,0,0.2)"
            }}>
              <div style={{ width: "100%", textAlign: "center", fontSize: "10px", textTransform: "uppercase", fontWeight: "800", letterSpacing: "0.5px", color: "#fb923c", lineHeight: "1.2", margin: "0 0 4px 0", padding: 0 }}>
                Ofensiva Diária
              </div>
              <div style={{ width: "100%", textAlign: "center", fontSize: "17px", fontWeight: "900", color: "#ffffff", lineHeight: "1.2", margin: "0 0 4px 0", padding: 0, overflow: "visible" }}>
                {streak > 0 ? `${streak} Dias Seguidos` : `${totalSessoes} Sessões`}
              </div>
              <div style={{ width: "100%", textAlign: "center", fontSize: "10px", color: "rgba(255,255,255,0.65)", lineHeight: "1.2", margin: 0, padding: 0 }}>
                Turno: {topPeriodo}
              </div>
            </div>
          </div>
        </div>

        {/* Footer com QR Code para acessar o site (Apenas no story gerado) */}
        <div style={{ position: "relative", zIndex: 10, display: "flex", alignItems: "center", justifyContent: "space-between", borderTop: "1px solid rgba(255, 255, 255, 0.12)", paddingTop: "14px", width: "100%", boxSizing: "border-box" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{ width: "52px", height: "52px", borderRadius: "12px", background: "#ffffff", padding: "4px", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 14px rgba(0,0,0,0.4)", flexShrink: 0 }}>
              <img
                id="omnia-story-qr-img"
                src={qrCodeUrl || "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='44' height='44'></svg>"}
                alt="QR Code omnia-unio.vercel.app"
                style={{ width: "44px", height: "44px", display: "block" }}
              />
            </div>
            <div style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
              <div style={{ fontSize: "12px", fontWeight: "800", color: "#ffffff", letterSpacing: "-0.2px", lineHeight: "1.2" }}>
                Acesse a plataforma
              </div>
              <div style={{ fontSize: "10px", fontWeight: "600", color: "#93c5fd", letterSpacing: "0.2px", marginTop: "2px", lineHeight: "1.2" }}>
                omnia-unio.vercel.app
              </div>
            </div>
          </div>

          <div style={{ padding: "6px 14px", borderRadius: "999px", background: "rgba(255, 255, 255, 0.08)", border: "1px solid rgba(255, 255, 255, 0.15)", fontSize: "10px", fontWeight: "700", color: "rgba(255, 255, 255, 0.75)", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "6px", lineHeight: "1" }}>
            <QrCode size={13} style={{ flexShrink: 0 }} />
            <span>Escaneie o QR</span>
          </div>
        </div>
      </div>
    </>
  );
}


function Arquetipos({ sessions, quizAttempts, professorAttempts, notes, commitments }) {
  const [selectedClass, setSelectedClass] = useState(localStorage.getItem('omnia_rpg_class') || null);
  
  const bonusXp = parseInt(localStorage.getItem('omnia_bonus_xp') || '0') || 0;
  const xpSessions = sessions.reduce((a, s) => a + s.minutos * 10, 0);
  const xpQuiz = quizAttempts.reduce((a, q) => a + q.acertos * 50, 0);
  const xpProf = professorAttempts.reduce((a, p) => a + (p.nota || 0) * 100, 0);
  const totalXp = xpSessions + xpQuiz + xpProf + bonusXp;
  
    const diasSemanaMap = {"Dom":0, "Seg":0, "Ter":0, "Qua":0, "Qui":0, "Sex":0, "Sáb":0};
    const periodosMap = {"Manhã":0, "Tarde":0, "Noite":0, "Madrugada":0};
    
    sessions.forEach(s => {
      if (!s.date) return;
      const wDay = weekdayShort(s.date);
      if (diasSemanaMap[wDay] !== undefined) diasSemanaMap[wDay] += s.minutos;
      
      const hour = parseInt(s.date.split('T')[1]?.split(':')[0] || "12");
      if (hour >= 6 && hour < 12) periodosMap["Manhã"] += s.minutos;
      else if (hour >= 12 && hour < 18) periodosMap["Tarde"] += s.minutos;
      else if (hour >= 18 && hour < 24) periodosMap["Noite"] += s.minutos;
      else periodosMap["Madrugada"] += s.minutos;
    });

    const maxDia = Math.max(...Object.values(diasSemanaMap), 1);
    const picoPeriodo = Object.keys(periodosMap).reduce((a, b) => periodosMap[a] > periodosMap[b] ? a : b);

  const level = Math.floor(totalXp / 1000) + 1;
  const streak = parseInt(localStorage.getItem("omnia_streak_days") || "0");

    const conquistas = [
      { nome: "Primeiro Passo", desc: "Começou a focar", icone: "sparkles", earned: sessions.length > 0 },
      { nome: "Caminhante", desc: "Completou 5 sessões", icone: "footprints", earned: sessions.length >= 5 },
      { nome: "Mestre do Foco", desc: "Completou 50 sessões", icone: "brain", earned: sessions.length >= 50 },
      { nome: "On Fire!", desc: "Streak de 3 dias", icone: "flame", earned: streak >= 3 },
      { nome: "Imbatível", desc: "Streak de 7 dias", icone: "trophy", earned: streak >= 7 },
      { nome: "Sabe Tudo", desc: "Gabaritou um Quiz", icone: "award", earned: quizAttempts.some(q => q.acertos === q.total && q.total > 0) },
      { nome: "Aprovado", desc: "Tirou 10 com o Professor", icone: "graduation", earned: professorAttempts.some(p => p.nota === 10) },
      { nome: "Organizado", desc: "Enviou 10 materiais", icone: "book", earned: notes.length + commitments.length > 10 }
    ];


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

export function DesempenhoTab({ commitments, sessions, quizAttempts, professorAttempts, config, notes }) {
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
  const bonusXp = parseInt(localStorage.getItem('omnia_bonus_xp') || '0') || 0;
  const xpSessions = sessions.reduce((a, s) => a + s.minutos * 10, 0);
  const xpQuiz = quizAttempts.reduce((a, q) => a + q.acertos * 50, 0);
  const xpProf = professorAttempts.reduce((a, p) => a + (p.nota || 0) * 100, 0);
  const totalXp = xpSessions + xpQuiz + xpProf + bonusXp;
  const level = Math.floor(totalXp / 1000) + 1;
  const xpProximoNivel = level * 1000;
  const progressoNivel = ((totalXp % 1000) / 1000) * 100;

  const datasAtividades = Array.from(new Set([
    ...sessions.map(s => s.date && s.date.slice(0,10)),
    ...quizAttempts.map(q => q.date && q.date.slice(0,10)),
    ...professorAttempts.map(p => p.date && p.date.slice(0,10)),
  ])).filter(Boolean).sort().reverse();
  
  let streak = Math.max(parseInt(localStorage.getItem("omnia_streak_days") || "0"), 0);
  let calcStreak = 0;
  let d = new Date();
  for (let i = 0; i < 365; i++) {
    const dIso = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
    if (datasAtividades.includes(dIso)) {
      calcStreak++;
    } else if (i === 0) {
      // today no activity yet, streak not broken
    } else {
      break;
    }
    d.setDate(d.getDate() - 1);
  }
  if (calcStreak > streak) streak = calcStreak;

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
        <Arquetipos sessions={sessions} quizAttempts={quizAttempts} professorAttempts={professorAttempts} notes={notes} commitments={commitments} />
        <OmniaWrapped sessions={sessions} quizAttempts={quizAttempts} professorAttempts={professorAttempts} commitments={commitments} config={config} />
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
function MaterialsList({ materiaisDisc, onDeleteMaterial, onOpenPdfViewer }) {
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

  async function handleOpenPdfHighlight(m) {
    try {
      let url = urls[m.id];
      if (!url) {
        url = await getMaterialSignedUrl(m.storagePath);
        setUrls((prev) => ({ ...prev, [m.id]: url }));
      }
      if (onOpenPdfViewer) {
        onOpenPdfViewer({ url, title: m.nomeArquivo, id: m.id, disciplina: m.disciplina });
      } else {
        window.open(url, "_blank");
      }
    } catch {
      // fallback
    }
  }

  if (materiaisDisc.length === 0) return null;

  return (
    <div className="space-y-1.5 mb-2">
      {materiaisDisc.map((m) => {
        const isPdf = m.tipoArquivo === "pdf" || (m.nomeArquivo || "").toLowerCase().endsWith(".pdf");
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
            {isPdf && onOpenPdfViewer && (
              <button
                type="button"
                onClick={() => handleOpenPdfHighlight(m)}
                title="Abrir no Leitor com Grifador"
                className="px-2 py-0.5 rounded text-[10px] font-semibold flex items-center gap-1 hover:opacity-85 transition-opacity"
                style={{ backgroundColor: TINT.brand, color: T.brand }}
              >
                <Highlighter className="w-3 h-3" /> Grifar
              </button>
            )}
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


function FlashcardsPanel({ disciplina, sourceTexts, onClose }) {
  const [loading, setLoading] = useState(false);
  const [cards, setCards] = useState(null);
  const [flippedIndex, setFlippedIndex] = useState({});

  async function generate() {
    setLoading(true);
    try {
      const parsed = await aiGenerateFlashcards(disciplina, sourceTexts);
      if (parsed && parsed.length > 0) setCards(parsed);
    } catch(e) {
      alert("Erro ao gerar flashcards.");
    } finally {
      setLoading(false);
    }
  }

  const toggleFlip = (i) => setFlippedIndex(prev => ({...prev, [i]: !prev[i]}));

  return (
    <Card style={{ borderColor: T.brand }} className="mb-3">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold text-sm" style={{ color: T.ink }}>Flashcards de {disciplina}</h3>
        <GhostButton onClick={onClose} className="px-2 py-1 text-xs">Fechar</GhostButton>
      </div>
      {!cards ? (
        <div className="text-center py-6">
          <p className="text-sm mb-4" style={{ color: T.inkSoft }}>Gere cartões de memorização (Frente e Verso) baseados nas anotações deste tópico usando Inteligência Artificial.</p>
          <PrimaryButton onClick={generate} disabled={loading}>
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Layers className="w-4 h-4" />} Gerar Flashcards
          </PrimaryButton>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {cards.map((c, i) => (
            <div 
              key={i} 
              onClick={() => toggleFlip(i)}
              className="cursor-pointer min-h-[120px] rounded-xl flex items-center justify-center p-4 text-center transition-all duration-300 transform"
              style={{ backgroundColor: flippedIndex[i] ? T.surfaceAlt : T.surface, border: `2px solid ${flippedIndex[i] ? T.brand : T.border}`, color: T.ink }}
            >
              <span className="text-sm font-medium">{flippedIndex[i] ? c.verso : c.frente}</span>
            </div>
          ))}
          <div className="col-span-full mt-2 text-center text-xs opacity-50">Clique nos cartões para virá-los</div>
        </div>
      )}
    </Card>
  );
}

function QuizPanel({ disciplina, sourceTexts, userId, commitmentId, setQuizAttempts, onClose }) {
  const [tipoQuiz, setTipoQuiz] = useState("multipla");
  const [loading, setLoading] = useState(false);
  const [quiz, setQuiz] = useState(null);

  
  const exportarQuizPDF = () => {
    if (!quiz || !quiz.questions || quiz.questions.length === 0) return;
    try {
      const doc = new jsPDF();
      doc.setFontSize(18);
      doc.text(`Quiz: ${disciplina}`, 14, 22);
      doc.setFontSize(12);
      
      let y = 35;
      quiz.questions.forEach((q, i) => {
        if (y > 270) { doc.addPage(); y = 20; }
        const questionText = doc.splitTextToSize(`${i + 1}. ${q.pergunta}`, 180);
        doc.text(questionText, 14, y);
        y += questionText.length * 6 + 5;
        
        if (quiz.tipo === "multipla" && q.opcoes) {
          q.opcoes.forEach((op, j) => {
            if (y > 280) { doc.addPage(); y = 20; }
            const opText = doc.splitTextToSize(`   ${String.fromCharCode(65 + j)}) ${op}`, 180);
            doc.text(opText, 14, y);
            y += opText.length * 6 + 3;
          });
          y += 5;
        } else if (quiz.tipo === "vf") {
          doc.text("   (  ) Verdadeiro   (  ) Falso", 14, y);
          y += 10;
        } else if (quiz.tipo === "discursiva") {
          y += 20; // Espaço para resposta
          doc.line(14, y, 196, y);
          y += 10;
        }
      });
      doc.save(`Quiz_${disciplina}.pdf`);
    } catch(e) {
      console.error(e);
      alert("Erro ao exportar PDF.");
    }
  };


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

function DisciplinaCard({ userId, disc, notasDisc, compromissosDisc, materiaisDisc, onDeleteNote, onDeleteMaterial, onOpenCommitment, onDeleteCommitment, summaries, setSummaries, setQuizAttempts, setProfessorAttempts, setCommitments, onOpenPdfViewer }) {
  const [panel, setPanel] = useState(null);
  const [resumoLoading, setResumoLoading] = useState(false);
  const [resumoDraft, setResumoDraft] = useState("");
  const [salvandoResumo, setSalvandoResumo] = useState(false);

  const downloadPdf = () => {
    try {
      const doc = new jsPDF();
      doc.setFontSize(16);
      doc.text("Resumo: " + (disc || "Omnia"), 14, 22);
      doc.setFontSize(12);
      const lines = doc.splitTextToSize(resumoDraft, 180);
      let y = 32;
      lines.forEach(line => {
        if (y > 280) {
          doc.addPage();
          y = 20;
        }
        doc.text(line, 14, y);
        y += 7;
      });
      doc.save(`Resumo_${disc || "Omnia"}.pdf`);
    } catch(e) {
      alert("Erro ao exportar PDF.");
    }
  };

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
            <button onClick={() => setPanel("flashcards")} className="text-xs px-2 py-1 rounded" style={{ color: T.brand, border: `1px solid ${T.border}` }}>Flashcards</button>
            <button onClick={() => handleSyllabus(disc, sourceTexts)} disabled={syllabusLoading} className="text-xs px-2 py-1 rounded flex items-center gap-1 transition-transform hover:scale-105" style={{ color: "#ffffff", backgroundColor: T.brand, border: `1px solid ${T.brand}` }}>{syllabusLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />} Analisar Syllabus</button>
        </div>
      </div>

      <MaterialsList materiaisDisc={materiaisDisc} onDeleteMaterial={onDeleteMaterial} onOpenPdfViewer={onOpenPdfViewer} />

      <div className="space-y-2 mb-2">
        {compromissosDisc.map((c) => (
          <button key={c.id} onClick={() => onOpenCommitment(c)} className="w-full text-left outline-none focus:outline-none bg-transparent hover:bg-transparent group">
            <Card className="py-2.5 flex items-center justify-between transition-transform group-hover:scale-[1.01] origin-left transform-gpu">
              <div className="text-sm">{c.assunto}</div>
                <div className="flex items-center gap-3 shrink-0">
                  <TypeTag tipo={c.tipo} />
                  <button onClick={(e) => { e.stopPropagation(); const ans = prompt("Para excluir permanentemente, digite o nome exato do compromisso:\n\n" + c.assunto); if (ans === c.assunto) { onDeleteCommitment(c.id); } else if (ans !== null) { alert("Nome incorreto. Exclusão cancelada."); } }} style={{ color: T.inkSoft }} className="hover:text-red-500 transition-colors"><Trash2 className="w-4 h-4" /></button>
                </div>
              </Card>
            </button>
        ))}
        {notasDisc.map((n) => (
          <Card key={n.id} className="py-2.5 flex items-start justify-between gap-2">
            <div className="text-sm" style={{ color: T.inkSoft }}>{formatTextWithTags(n.texto, T)}</div>
              <div className="flex gap-2"><AudioReaderButton text={n.texto} T={T} /><button onClick={() => onDeleteNote(n.id)} style={{ color: T.inkSoft }} className="shrink-0"><Trash2 className="w-3.5 h-3.5" /></button></div>
          </Card>
        ))}
      </div>

      {panel === "resumo" && (
        <Card style={{ borderColor: T.brand }} className="mb-3">
          {resumoLoading ? (
            <div className="flex items-center gap-2 text-sm" style={{ color: T.inkSoft }}><Loader2 className="w-4 h-4 animate-spin" /> Gerando resumo...</div>
          ) : (
            <>
              
                {/* Speed Reading Pacer (Idea 3) */}
                <div className="flex items-center gap-2 mb-3 p-2 rounded-lg border" style={{ backgroundColor: T.surfaceAlt, borderColor: T.border }}>
                  <Activity className="w-4 h-4" style={{ color: T.brand }} />
                  <span className="text-xs font-bold" style={{ color: T.ink }}>Metrônomo de Leitura:</span>
                  <input type="number" id="pacerBpm" defaultValue={60} min={30} max={300} className="w-16 text-xs p-1 rounded" style={{ backgroundColor: T.bg, color: T.ink, border: `1px solid ${T.border}` }} />
                  <span className="text-xs" style={{ color: T.inkSoft }}>BPM</span>
                  <GhostButton className="text-xs px-2 py-1 ml-auto" onClick={() => {
                    if (window.readingPacerInterval) {
                      clearInterval(window.readingPacerInterval);
                      window.readingPacerInterval = null;
                      alert("Metrônomo parado.");
                    } else {
                      const bpm = parseInt(document.getElementById('pacerBpm').value) || 60;
                      const ms = (60 / bpm) * 1000;
                      if(!window.pacerAudioCtx) window.pacerAudioCtx = new (window.AudioContext || window.webkitAudioContext)(); const audioCtx = window.pacerAudioCtx; if (audioCtx.state === 'suspended') audioCtx.resume();
                      window.readingPacerInterval = setInterval(() => {
                        const osc = audioCtx.createOscillator();
                        osc.type = "sine";
                        osc.frequency.setValueAtTime(800, audioCtx.currentTime);
                        osc.connect(audioCtx.destination);
                        osc.start();
                        osc.stop(audioCtx.currentTime + 0.05);
                      }, ms);
                      alert(`Metrônomo iniciado a ${bpm} BPM! Leia uma linha por bipe. Feche a aba ou clique de novo para parar.`);
                    }
                  }}>
                    <Volume2 className="w-3.5 h-3.5 inline mr-1" /> Tocar / Parar
                  </GhostButton>
                </div>

                <textarea value={resumoDraft} onChange={(e) => { setResumoDraft(e.target.value); setResumoSalvo(false); }} rows={8} className="w-full rounded-md p-3 text-sm" style={inputStyle} />
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                <PrimaryButton onClick={() => saveResumo(false)} disabled={salvandoResumo}>
                  {salvandoResumo ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />} Salvar
                </PrimaryButton>
                <GhostButton onClick={() => setPanel(null)}>Fechar</GhostButton>
                <button onClick={downloadPdf} className="text-xs px-2 py-1 rounded transition-transform hover:scale-105 ml-auto flex items-center gap-1" style={{ color: T.brand, border: `1px solid ${T.brand}` }} title="Exportar para PDF">
                  <Download className="w-3.5 h-3.5" /> Baixar PDF
                </button>
                <button onClick={() => saveResumo(true)} disabled={salvandoResumo} className="text-xs px-2.5 py-1 rounded transition-transform hover:scale-105 flex items-center gap-1" style={{ color: T.brand, border: `1px solid ${T.brand}` }}>
                  <CalendarClock className="w-3.5 h-3.5" /> Salvar e Agendar Revisões (1, 3, 7 d)
                </button>
                {resumoSalvo && (
                  <span className="text-xs font-semibold flex items-center gap-1 text-emerald-400">
                    <Check className="w-3.5 h-3.5 inline" /> Salvo com sucesso!
                  </span>
                )}
                {erroSalvarResumo && <span className="text-xs" style={{ color: T.critico }}>Erro: {erroSalvarResumo}</span>}
              </div>
            </>
          )}
        </Card>
      )}

      {panel === "flashcards" && (
          <FlashcardsPanel disciplina={disc} sourceTexts={sourceTexts} onClose={() => setPanel(null)} />
        )}

        {panel === "flashcards" && (
          <FlashcardsPanel disciplina={disc} sourceTexts={sourceTexts} onClose={() => setPanel(null)} />
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
  const [viewingPdfModal, setViewingPdfModal] = useState(null);

  const [panel, setPanel] = useState(null);
  const [resumoLoading, setResumoLoading] = useState(false);
  const [resumoDraft, setResumoDraft] = useState("");
  const [salvandoResumo, setSalvandoResumo] = useState(false);

  const downloadPdf = () => {
    try {
      const doc = new jsPDF();
      doc.setFontSize(16);
      doc.text("Resumo: " + ((commitment && commitment.disciplina) || (commitment && commitment.assunto) || "Omnia"), 14, 22);
      doc.setFontSize(12);
      const lines = doc.splitTextToSize(resumoDraft, 180);
      let y = 32;
      lines.forEach(line => {
        if (y > 280) {
          doc.addPage();
          y = 20;
        }
        doc.text(line, 14, y);
        y += 7;
      });
      doc.save(`Resumo_${(commitment && commitment.disciplina) || (commitment && commitment.assunto) || "Omnia"}.pdf`);
    } catch(e) {
      alert("Erro ao exportar PDF.");
    }
  };

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
                <span style={{ color: T.inkSoft }}>{formatTextWithTags(n.texto, T)}</span>
                  <div className="flex gap-2"><AudioReaderButton text={n.texto} T={T} /><button onClick={() => handleDeleteNote(n.id)} style={{ color: T.inkSoft }} className="shrink-0"><Trash2 className="w-3.5 h-3.5" /></button></div>
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
              const isPdf = m.tipoArquivo === "pdf" || (m.nomeArquivo || "").toLowerCase().endsWith(".pdf");
              const meta = TIPO_ARQUIVO_META[m.tipoArquivo] || TIPO_ARQUIVO_META.pdf;
              const Icon = meta.icon;
              return (
                <div key={m.id} className="flex items-center gap-2 text-xs rounded-md p-2" style={{ backgroundColor: T.surfaceAlt, border: `1px solid ${T.border}` }}>
                  <Icon className="w-3.5 h-3.5 shrink-0" style={{ color: T.inkSoft }} />
                  <button onClick={() => handleOpenMaterial(m)} className="flex-1 truncate text-left" style={{ color: T.ink }}>{m.nomeArquivo}</button>
                  {isPdf && (
                    <button
                      type="button"
                      onClick={async () => {
                        try {
                          const url = await getMaterialSignedUrl(m.storagePath);
                          setViewingPdfModal({ url, title: m.nomeArquivo, id: m.id, disciplina: commitment?.disciplina || "Geral" });
                        } catch {}
                      }}
                      title="Abrir no Leitor com Grifador"
                      className="px-2 py-0.5 rounded text-[10px] font-semibold flex items-center gap-1 hover:opacity-85 transition-opacity"
                      style={{ backgroundColor: TINT.brand, color: T.brand }}
                    >
                      <Highlighter className="w-3 h-3" /> Grifar
                    </button>
                  )}
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
                
                {/* Speed Reading Pacer (Idea 3) */}
                <div className="flex items-center gap-2 mb-3 p-2 rounded-lg border" style={{ backgroundColor: T.surfaceAlt, borderColor: T.border }}>
                  <Activity className="w-4 h-4" style={{ color: T.brand }} />
                  <span className="text-xs font-bold" style={{ color: T.ink }}>Metrônomo de Leitura:</span>
                  <input type="number" id="pacerBpm" defaultValue={60} min={30} max={300} className="w-16 text-xs p-1 rounded" style={{ backgroundColor: T.bg, color: T.ink, border: `1px solid ${T.border}` }} />
                  <span className="text-xs" style={{ color: T.inkSoft }}>BPM</span>
                  <GhostButton className="text-xs px-2 py-1 ml-auto" onClick={() => {
                    if (window.readingPacerInterval) {
                      clearInterval(window.readingPacerInterval);
                      window.readingPacerInterval = null;
                      alert("Metrônomo parado.");
                    } else {
                      const bpm = parseInt(document.getElementById('pacerBpm').value) || 60;
                      const ms = (60 / bpm) * 1000;
                      if(!window.pacerAudioCtx) window.pacerAudioCtx = new (window.AudioContext || window.webkitAudioContext)(); const audioCtx = window.pacerAudioCtx; if (audioCtx.state === 'suspended') audioCtx.resume();
                      window.readingPacerInterval = setInterval(() => {
                        const osc = audioCtx.createOscillator();
                        osc.type = "sine";
                        osc.frequency.setValueAtTime(800, audioCtx.currentTime);
                        osc.connect(audioCtx.destination);
                        osc.start();
                        osc.stop(audioCtx.currentTime + 0.05);
                      }, ms);
                      alert(`Metrônomo iniciado a ${bpm} BPM! Leia uma linha por bipe. Feche a aba ou clique de novo para parar.`);
                    }
                  }}>
                    <Volume2 className="w-3.5 h-3.5 inline mr-1" /> Tocar / Parar
                  </GhostButton>
                </div>

                  <textarea value={resumoDraft} onChange={(e) => { setResumoDraft(e.target.value); setResumoSalvo(false); }} rows={7} className="w-full rounded-md p-3 text-sm" style={inputStyle} />
                <div className="flex items-center gap-2 mt-2 flex-wrap">
                  <PrimaryButton onClick={() => saveResumo(false)} disabled={salvandoResumo}>
                    {salvandoResumo ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />} Salvar
                  </PrimaryButton>
                  <GhostButton onClick={() => setPanel(null)}>Fechar</GhostButton>
                  {resumoSalvo && (
                    <span className="text-xs font-semibold flex items-center gap-1 text-emerald-400">
                      <Check className="w-3.5 h-3.5 inline" /> Salvo com sucesso!
                    </span>
                  )}
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

      {viewingPdfModal && (
        <PdfViewerModal
          fileUrl={viewingPdfModal.url}
          fileName={viewingPdfModal.title}
          materialId={viewingPdfModal.id}
          disciplina={viewingPdfModal.disciplina}
          onClose={() => setViewingPdfModal(null)}
          onSaveNote={(noteData) => {
            if (setNotes) {
              const newN = {
                id: uid(),
                disciplina: noteData.disciplina || commitment?.disciplina || "Geral",
                commitmentId: commitment?.id || null,
                texto: noteData.texto,
                created_at: new Date().toISOString()
              };
              setNotes(prev => [newN, ...(prev || [])]);
            }
          }}
        />
      )}
    </>
  );
}

function CompromissoWorkspaceModal({
  userId, commitment, notes, materials, summaries, quizAttempts, professorAttempts,
  setNotes, setMaterials, setSummaries, setQuizAttempts, setProfessorAttempts, onClose, onDeleteCommitment
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
            <div className="flex items-center gap-4 shrink-0">
              {onDeleteCommitment && (
                <button onClick={() => { const ans = prompt("Para excluir permanentemente, digite o nome exato do compromisso:\n\n" + commitment.assunto); if (ans === commitment.assunto) { onDeleteCommitment(commitment.id); onClose(); } else if (ans !== null) { alert("Nome incorreto. Exclusão cancelada."); } }} style={{ color: T.critico }} className="hover:opacity-80 transition-opacity" title="Excluir"><Trash2 className="w-5 h-5" /></button>
              )}
              <button onClick={onClose} style={{ color: T.inkSoft }} className="hover:opacity-80 transition-opacity"><X className="w-5 h-5" /></button>
            </div>
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


function MapaMentalModal({ notes, commitments, onClose, T }) {
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);

  useEffect(() => {
    // Basic force-directed / radial layout manually calculated
    const disciplinas = Array.from(new Set([
      ...notes.map(n => n.disciplina),
      ...commitments.map(c => c.disciplina)
    ])).filter(Boolean);

    const centerX = 400;
    const centerY = 300;
    
    let nds = [];
    let eds = [];

    // Root node
    nds.push({ id: 'root', label: 'Meu Cérebro', x: centerX, y: centerY, r: 40, color: T.brand });

    const angleStep = (2 * Math.PI) / disciplinas.length;
    disciplinas.forEach((disc, i) => {
      const angle = i * angleStep;
      const radius = 180; // Distance from center
      const dx = centerX + radius * Math.cos(angle);
      const dy = centerY + radius * Math.sin(angle);
      
      nds.push({ id: disc, label: disc, x: dx, y: dy, r: 30, color: T.brandInk || '#555' });
      eds.push({ from: 'root', to: disc });

      // Count items for this disc
      const count = notes.filter(n => n.disciplina === disc).length + commitments.filter(c => c.disciplina === disc).length;
      if (count > 0) {
        const cAngle = angle + (Math.PI / 4);
        const cRadius = 60;
        const cx = dx + cRadius * Math.cos(cAngle);
        const cy = dy + cRadius * Math.sin(cAngle);
        nds.push({ id: disc+'_items', label: `${count} Itens`, x: cx, y: cy, r: 20, color: T.inkSoft });
        eds.push({ from: disc, to: disc+'_items' });
      }
    });

    setNodes(nds);
    setEdges(eds);
  }, [notes, commitments]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <Card className="w-full max-w-4xl h-[80vh] flex flex-col p-0 overflow-hidden" style={{ backgroundColor: T.bg, borderColor: T.border }}>
        <div className="flex justify-between items-center p-4 border-b" style={{ borderColor: T.border }}>
          <h2 className="text-lg font-bold" style={{ color: T.ink }}><Network className="inline mr-2" /> Árvore de Conhecimento</h2>
          <GhostButton onClick={onClose}>Fechar</GhostButton>
        </div>
        <div className="flex-1 overflow-auto relative bg-grid-pattern">
          <svg width="100%" height="100%" viewBox="0 0 800 600" preserveAspectRatio="xMidYMid meet">
            {edges.map((e, i) => {
              const from = nodes.find(n => n.id === e.from);
              const to = nodes.find(n => n.id === e.to);
              if(!from || !to) return null;
              return (
                <line key={i} x1={from.x} y1={from.y} x2={to.x} y2={to.y} stroke={T.border} strokeWidth="2" opacity="0.6" />
              );
            })}
            {nodes.map(n => (
              <g key={n.id} className="transition-transform hover:scale-110 cursor-pointer" style={{ transformOrigin: `${n.x}px ${n.y}px` }}>
                <circle cx={n.x} cy={n.y} r={n.r} fill={n.color} />
                <text x={n.x} y={n.y + n.r + 15} textAnchor="middle" fill={T.ink} fontSize={n.id === 'root' ? 14 : 12} fontWeight="bold">
                  {n.label.length > 20 ? n.label.slice(0, 20) + '...' : n.label}
                </text>
              </g>
            ))}
          </svg>
        </div>
      </Card>
    </div>
  );
}


  function ReadingGoalCalculator({ T }) {
    const [total, setTotal] = useState(300);
    const [current, setCurrent] = useState(45);
    const [deadline, setDeadline] = useState("");
    
    let result = null;
    if (deadline && total > current) {
      const today = new Date();
      const end = new Date(deadline);
      const diff = Math.ceil((end - today) / (1000 * 60 * 60 * 24));
      if (diff > 0) {
        result = Math.ceil((total - current) / diff);
      }
    }

    return (
      <Card className="mt-4">
        <div className="flex items-center gap-2 mb-4 font-bold" style={{ color: T.ink }}>
          <BookOpen className="w-5 h-5" style={{ color: T.brand }} /> Metas de Leitura
        </div>
        <p className="text-xs mb-4" style={{ color: T.inkSoft }}>Calcule quantas páginas você precisa ler por dia para terminar aquele livro ou PDF a tempo.</p>
        
        <div className="grid grid-cols-3 gap-2 mb-4">
          <div>
            <label className="text-[10px] font-bold uppercase opacity-60">Total de Págs</label>
            <input type="number" value={total} onChange={e => setTotal(e.target.value)} className="w-full p-2 rounded border mt-1 text-sm bg-transparent" style={{ borderColor: T.border, color: T.ink }} />
          </div>
          <div>
            <label className="text-[10px] font-bold uppercase opacity-60">Pág. Atual</label>
            <input type="number" value={current} onChange={e => setCurrent(e.target.value)} className="w-full p-2 rounded border mt-1 text-sm bg-transparent" style={{ borderColor: T.border, color: T.ink }} />
          </div>
          <div>
            <label className="text-[10px] font-bold uppercase opacity-60">Prazo (Data)</label>
            <input type="date" value={deadline} onChange={e => setDeadline(e.target.value)} className="w-full p-2 rounded border mt-1 text-sm bg-transparent" style={{ borderColor: T.border, color: T.ink }} />
          </div>
        </div>

        {result !== null && (
          <div className="p-3 rounded-lg flex items-center justify-between" style={{ backgroundColor: T.brand + '22', border: `1px solid ${T.brand}55` }}>
            <div>
              <div className="text-xs font-bold" style={{ color: T.brandInk }}>Ritmo Necessário</div>
              <div className="text-[10px]" style={{ color: T.inkSoft }}>Para terminar no prazo estipulado</div>
            </div>
            <div className="text-xl font-black" style={{ color: T.brand }}>
              {result} <span className="text-xs font-normal">págs/dia</span>
            </div>
          </div>
        )}
      </Card>
    );
  }


export function BibliotecaTab({ userId, setCommitments, onDeleteCommitment, notes, commitments, materials, quizAttempts, professorAttempts, onDeleteNote, summaries, setSummaries, setNotes, setMaterials, setQuizAttempts, setProfessorAttempts }) {
  const [openCommitment, setOpenCommitment] = useState(null);
  const [showMapa, setShowMapa] = useState(false);
  const [showMindMap, setShowMindMap] = useState(false);
  const [showCommunityHub, setShowCommunityHub] = useState(false);
  const [viewingPdf, setViewingPdf] = useState(null);

  async function handleDeleteMaterialLib(m) {
    await deleteMaterial(m.id, m.storagePath);
    setMaterials((prev) => prev.filter((x) => x.id !== m.id));
  }

  // Diário de Bordo tem sua própria aba dedicada e não deve se misturar com materiais de estudo
  const notasAcademicas = (notes || []).filter((n) => {
    const disc = (n.disciplina || "").toLowerCase();
    return disc !== "diário de bordo" && disc !== "diario de bordo" && disc !== "diário" && disc !== "diario";
  });

  const disciplinas = Array.from(new Set([
    ...notasAcademicas.map((n) => n.disciplina),
    ...commitments.map((c) => c.disciplina),
    ...materials.map((m) => m.disciplina),
  ])).filter((d) => {
    if (!d) return false;
    const lower = d.toLowerCase();
    return lower !== "diário de bordo" && lower !== "diario de bordo" && lower !== "diário" && lower !== "diario";
  });

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
      
        {showMapa && <MapaMentalModal notes={notasAcademicas} commitments={commitments} onClose={() => setShowMapa(false)} T={T} />}
        {showMindMap && (
          <MindMapModal
            disciplinas={disciplinas}
            commitments={commitments}
            notes={notasAcademicas}
            materials={materials}
            summaries={summaries}
            onClose={() => setShowMindMap(false)}
          />
        )}
        {showCommunityHub && (
          <CommunitySummariesModal
            summaries={summaries}
            onClose={() => setShowCommunityHub(false)}
            onImportSummary={(imported) => {
              if (setSummaries) {
                setSummaries(prev => [imported, ...(prev || [])]);
              }
            }}
            T={T}
          />
        )}
        {viewingPdf && (
          <PdfViewerModal
            fileUrl={viewingPdf.url}
            fileName={viewingPdf.title}
            materialId={viewingPdf.id}
            disciplina={viewingPdf.disciplina}
            onClose={() => setViewingPdf(null)}
            onSaveNote={(noteData) => {
              if (setNotes) {
                const newNote = {
                  id: uid(),
                  disciplina: noteData.disciplina || "Geral",
                  texto: noteData.texto,
                  created_at: new Date().toISOString()
                };
                setNotes(prev => [newNote, ...(prev || [])]);
              }
            }}
          />
        )}

        <div className="flex flex-wrap gap-2 justify-between items-center">
          <ExportarBiblioteca userId={userId} commitments={commitments} notes={notasAcademicas} materials={materials} summaries={summaries} disciplinas={disciplinas} semestres={semestres.filter((s) => s !== "Sem data")} />
          <div className="flex items-center gap-2 flex-wrap">
            <PrimaryButton onClick={() => setShowMindMap(true)}>
              <Brain className="w-4 h-4 mr-1.5 text-cyan-400" /> Mapa Mental
            </PrimaryButton>
            <GhostButton onClick={() => setShowCommunityHub(true)}>
              <Globe className="w-4 h-4 mr-1.5 text-emerald-400" /> Hub Comunitário
            </GhostButton>
          </div>
        </div>


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
                  <div className="flex items-center gap-3 shrink-0">
                      <PriorityDot prioridade={c.prioridade} />
                      <button onClick={(e) => { e.stopPropagation(); const ans = prompt("Para excluir permanentemente, digite o nome exato do compromisso:\n\n" + c.assunto); if (ans === c.assunto) { onDeleteCommitment(c.id); } else if (ans !== null) { alert("Nome incorreto. Exclusão cancelada."); } }} style={{ color: T.inkSoft }} className="hover:text-red-500 transition-colors"><Trash2 className="w-4 h-4" /></button>
                    </div>
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
              setCommitments={setCommitments}
              notasDisc={notasAcademicas.filter((n) => n.disciplina === disc && !n.commitmentId)}
              compromissosDisc={commitments.filter((c) => c.disciplina === disc)}
              materiaisDisc={materials.filter((m) => m.disciplina === disc && !m.commitmentId)}
              onDeleteNote={onDeleteNote}
              onDeleteMaterial={handleDeleteMaterialLib}
              onOpenCommitment={setOpenCommitment}
                onDeleteCommitment={onDeleteCommitment}
              summaries={summaries}
              setSummaries={setSummaries}
              setQuizAttempts={setQuizAttempts}
              setProfessorAttempts={setProfessorAttempts}
              onOpenPdfViewer={setViewingPdf}
            />
          ))}
        </div>
      )}

      {openCommitment && (
        <CompromissoWorkspaceModal
          userId={userId}
          commitment={openCommitment}
            onDeleteCommitment={onDeleteCommitment}
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


function FocusPet({ timerOn, streak, petName, onNameChange, config, updateConfig, phase, remaining }) {
  const [editing, setEditing] = useState(false);
  const [showStore, setShowStore] = useState(false);
  const [storeTab, setStoreTab] = useState('pets'); // 'pets' | 'snacks'
  const [feedback, setFeedback] = useState(null);
  const [eatingEffect, setEatingEffect] = useState(null);

  const [petEnergy, setPetEnergy] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("omnia_config") || "{}");
      return typeof saved.petEnergy === 'number' ? saved.petEnergy : 80;
    } catch {
      return 80;
    }
  });

  // Estado local sincronizado imediatamente para responsividade sem engasgos
  const [localOwned, setLocalOwned] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("omnia_config") || "{}");
      const list = saved.ownedSkins || config?.ownedSkins || [];
      return Array.from(new Set(['none', ...list.filter(id => STUDY_PETS.some(s => s.id === id && s.id !== 'none'))]));
    } catch {
      return ['none', ...(config?.ownedSkins || [])];
    }
  });

  const [localSkinId, setLocalSkinId] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("omnia_config") || "{}");
      const sid = saved.petSkin || saved.equippedSkin || config?.petSkin || config?.equippedSkin || 'none';
      return STUDY_PETS.some(s => s.id === sid) ? sid : 'none';
    } catch {
      return config?.petSkin || 'none';
    }
  });

  const [localCoins, setLocalCoins] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("omnia_config") || "{}");
      if (typeof saved.coins === 'number' && saved.coins > 0) return saved.coins;
      if (typeof config?.coins === 'number' && config.coins > 0) return config.coins;
      return 350; // Moedas de boas-vindas
    } catch {
      return 350;
    }
  });

  // Manter em sincronia se a prop config mudar
  useEffect(() => {
    if (config?.ownedSkins && Array.isArray(config.ownedSkins)) {
      setLocalOwned(prev => Array.from(new Set([...prev, ...config.ownedSkins.filter(id => STUDY_PETS.some(s => s.id === id))])));
    }
    if (config?.petSkin && STUDY_PETS.some(s => s.id === config.petSkin)) {
      setLocalSkinId(config.petSkin);
    }
    if (typeof config?.coins === 'number') {
      setLocalCoins(config.coins);
    }
  }, [config?.ownedSkins, config?.petSkin, config?.coins]);

  // Escuta eventos de storage locais (ex: foco concluído ou outra aba)
  useEffect(() => {
    const handleStorage = () => {
      try {
        const saved = JSON.parse(localStorage.getItem("omnia_config") || "{}");
        if (saved.ownedSkins && Array.isArray(saved.ownedSkins)) {
          setLocalOwned(prev => Array.from(new Set([...prev, ...saved.ownedSkins.filter(id => STUDY_PETS.some(s => s.id === id))])));
        }
        if (saved.petSkin && STUDY_PETS.some(s => s.id === saved.petSkin)) {
          setLocalSkinId(saved.petSkin);
        }
        if (typeof saved.coins === 'number') {
          setLocalCoins(saved.coins);
        }
      } catch {}
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const activePet = STUDY_PETS.find(s => s.id === localSkinId) || STUDY_PETS[0];
  const [tempName, setTempName] = useState(petName || activePet.name);

  useEffect(() => {
    if (!petName || STUDY_PETS.some(p => p.name === petName)) {
      setTempName(activePet.name);
      if (onNameChange) onNameChange(activePet.name);
    }
  }, [localSkinId]);

  const claimBonus = (e) => {
    if (e) e.stopPropagation();
    sfx.coin?.();
    if (typeof confetti === 'function') {
      confetti({ particleCount: 45, spread: 55, origin: { y: 0.6 } });
    }
    const newCoins = localCoins + 100;
    setLocalCoins(newCoins);
    setFeedback("🪙 +100 moedas de estudo resgatadas com sucesso!");
    setTimeout(() => setFeedback(null), 3500);

    const nextConfig = { ...config, coins: newCoins };
    try {
      const fresh = JSON.parse(localStorage.getItem("omnia_config") || "{}");
      localStorage.setItem("omnia_config", JSON.stringify({ ...fresh, ...nextConfig }));
      window.dispatchEvent(new Event("storage"));
    } catch {}
    if (updateConfig) updateConfig(nextConfig);
  };

  const buySkin = (pet) => {
    const isOwned = localOwned.includes(pet.id);
    const shouldChangeName = !petName || STUDY_PETS.some(p => p.name === petName);
    const targetName = shouldChangeName ? pet.name : petName;

    if (isOwned) {
      sfx.pop();
      setLocalSkinId(pet.id);
      if (shouldChangeName) {
        setTempName(pet.name);
        if (onNameChange) onNameChange(pet.name);
      }
      setFeedback(`✨ ${pet.name} equipado com sucesso!`);
      setTimeout(() => setFeedback(null), 2500);

      const nextConfig = {
        ...config,
        petSkin: pet.id,
        petHat: pet.id,
        equippedSkin: pet.id,
        petName: targetName,
      };
      try {
        const fresh = JSON.parse(localStorage.getItem("omnia_config") || "{}");
        localStorage.setItem("omnia_config", JSON.stringify({ ...fresh, ...nextConfig }));
        window.dispatchEvent(new Event("storage"));
      } catch {}
      if (updateConfig) updateConfig(nextConfig);
      return;
    }

    if (localCoins >= pet.price) {
      sfx.coin();
      if (typeof confetti === 'function') {
        confetti({ particleCount: 70, spread: 70, origin: { y: 0.6 } });
      }
      const newCoins = Math.max(0, localCoins - pet.price);
      const newOwned = Array.from(new Set([...localOwned, pet.id]));

      setLocalCoins(newCoins);
      setLocalOwned(newOwned);
      setLocalSkinId(pet.id);
      if (shouldChangeName) {
        setTempName(pet.name);
        if (onNameChange) onNameChange(pet.name);
      }
      setFeedback(`🎉 ${pet.name} desbloqueado e equipado!`);
      setTimeout(() => setFeedback(null), 3500);

      const nextConfig = {
        ...config,
        coins: newCoins,
        ownedSkins: newOwned,
        petSkin: pet.id,
        petHat: pet.id,
        equippedSkin: pet.id,
        petName: targetName,
      };
      try {
        const fresh = JSON.parse(localStorage.getItem("omnia_config") || "{}");
        localStorage.setItem("omnia_config", JSON.stringify({ ...fresh, ...nextConfig }));
        window.dispatchEvent(new Event("storage"));
      } catch {}
      if (updateConfig) updateConfig(nextConfig);
    } else {
      sfx.bump?.() || sfx.click?.();
      const faltam = pet.price - localCoins;
      setFeedback(`Faltam ${faltam} moedas para desbloquear ${pet.name}. Clique em +100 Moedas acima ou conclua um foco!`);
      setTimeout(() => setFeedback(null), 4000);
    }
  };

  const feedPet = (snack) => {
    if (localCoins < snack.cost) {
      sfx.bump?.() || sfx.click?.();
      setFeedback(`Faltam ${snack.cost - localCoins} moedas para comprar ${snack.name}.`);
      setTimeout(() => setFeedback(null), 3000);
      return;
    }
    sfx.coin?.() || sfx.pop?.();
    if (typeof confetti === 'function') {
      confetti({ particleCount: 35, spread: 60, origin: { y: 0.6 } });
    }
    const newCoins = localCoins - snack.cost;
    const newEnergy = Math.min(100, petEnergy + snack.energy);
    setLocalCoins(newCoins);
    setPetEnergy(newEnergy);
    setEatingEffect(`${snack.icon} +${snack.energy}%`);
    setTimeout(() => setEatingEffect(null), 2500);

    const happyPhrases = [
      `Nhac! Que ${snack.name} saborosa! 😋`,
      `Obrigado! Minha energia subiu para ${newEnergy}%! ⚡`,
      `Estou com foco total abastecido! 🚀`,
      `Delícia! Pronto para estudar com você! ✨`
    ];
    setBubble(happyPhrases[Math.floor(Math.random() * happyPhrases.length)]);
    setTimeout(() => setBubble(null), 6000);

    setFeedback(`😋 ${activePet.name} adorou o petisco! (+${snack.energy}% energia, +${snack.xp} XP)`);
    setTimeout(() => setFeedback(null), 3500);

    const nextConfig = { ...config, coins: newCoins, petEnergy: newEnergy };
    try {
      const fresh = JSON.parse(localStorage.getItem("omnia_config") || "{}");
      localStorage.setItem("omnia_config", JSON.stringify({ ...fresh, ...nextConfig }));
      const curXp = parseInt(localStorage.getItem("omnia_xp") || "0", 10) || 0;
      localStorage.setItem("omnia_xp", String(curXp + snack.xp));
      window.dispatchEvent(new Event("storage"));
    } catch {}
    if (updateConfig) updateConfig(nextConfig);
  };

  const [bubble, setBubble] = useState(null);
  useEffect(() => {
    if (config?.enableSincereOwl === false) return;
    const phrases = {
      idle: ["Pronto para começar?", "Um pomodoro por dia...", "A procrastinação é sua inimiga!"],
      work: ["Foco total!", "Não olhe para o celular...", "Continue assim!"],
      rest: ["Respire fundo...", "Beba uma água!", "Estique as pernas um pouquinho."]
    };
    const interval = setInterval(() => {
      if (Math.random() > 0.3) {
        const arr = phrases[phase] || phrases.idle;
        setBubble(arr[Math.floor(Math.random() * arr.length)]);
        setTimeout(() => setBubble(null), 8000);
      }
    }, 30000);
    return () => clearInterval(interval);
  }, [phase, config?.enableSincereOwl]);

  const sleepSrc = getPetSprite(localSkinId, 'sleep');
  const focusSrc = getPetSprite(localSkinId, 'focus');
  const happySrc = getPetSprite(localSkinId, 'happy');

  let currentSrc = sleepSrc;
  let status = "Dormindo...";
  let animClass = "animate-pet-breathe";

  if (timerOn) {
    currentSrc = focusSrc;
    status = "Focando!";
    animClass = "animate-pet-focus";
  } else if (config?.vacationMode) {
    currentSrc = sleepSrc;
    status = "De férias";
    animClass = "animate-pet-breathe";
  } else if (streak > 5) {
    currentSrc = happySrc;
    status = activePet.title || "Mestre da Rotina";
    animClass = "animate-pet-cool";
  } else if (streak > 0) {
    currentSrc = happySrc;
    status = "Animado";
    animClass = "animate-pet-cool";
  } else {
    currentSrc = sleepSrc;
    status = "Esperando você estudar...";
    animClass = "animate-pet-breathe";
  }

  return (
    <div className="flex flex-col items-center gap-2 relative mt-4">
      {showStore && (
        <div className="absolute bottom-full mb-3 bg-white dark:bg-gray-800 border border-slate-200 dark:border-gray-700 p-4 rounded-2xl shadow-2xl w-88 max-w-[94vw] z-50">
          <div className="flex justify-between items-center mb-2.5 pb-2 border-b border-slate-100 dark:border-gray-700">
            <div className="flex items-center gap-2">
              <Sparkles size={16} className="text-amber-500" />
              <h4 className="font-bold text-sm text-slate-800 dark:text-slate-100">
                {storeTab === 'pets' ? 'Mascotes de Estudo' : 'Petiscos & Cuidados'}
              </h4>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={claimBonus}
                className="text-[11px] font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1 bg-amber-50 dark:bg-amber-950/60 hover:bg-amber-100 dark:hover:bg-amber-900/60 px-2 py-0.5 rounded-full border border-amber-300 dark:border-amber-700/60 transition-all hover:scale-105 active:scale-95"
                title="Resgatar moedas de estudo bônus"
              >
                <Plus size={11} /> 100 Moedas
              </button>
              <span className="text-xs font-mono font-bold text-amber-500 flex items-center gap-1 bg-slate-100 dark:bg-gray-900 px-2 py-0.5 rounded-full border border-slate-200 dark:border-gray-700">
                <Coins size={12} /> {localCoins}
              </span>
              <button onClick={() => setShowStore(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5" title="Fechar">
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Abas da Loja: Mascotes vs Petiscos */}
          <div className="flex gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-gray-900 mb-3 border border-slate-200 dark:border-gray-700">
            <button
              type="button"
              onClick={() => setStoreTab('pets')}
              className={`flex-1 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                storeTab === 'pets'
                  ? 'bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 shadow-xs'
                  : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              <PawPrint size={13} />
              <span>Mascotes</span>
            </button>
            <button
              type="button"
              onClick={() => setStoreTab('snacks')}
              className={`flex-1 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                storeTab === 'snacks'
                  ? 'bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 shadow-xs'
                  : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              <Cookie size={13} />
              <span>Petiscos & Lanches</span>
            </button>
          </div>

          {feedback && (
            <div className="mb-2.5 p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-300 text-xs font-medium text-center">
              {feedback}
            </div>
          )}

          {/* Aba 1: Mascotes */}
          {storeTab === 'pets' && (
            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
              {STUDY_PETS.map((pet) => {
                const owned = localOwned.includes(pet.id);
                const selected = localSkinId === pet.id;
                return (
                  <div
                    key={pet.id}
                    className={`flex items-center justify-between p-2 rounded-xl border transition-all ${
                      selected
                        ? 'border-blue-500 bg-blue-50/70 dark:bg-blue-950/40 ring-1 ring-blue-500'
                        : 'border-slate-200 dark:border-gray-700/80 hover:bg-slate-50 dark:hover:bg-gray-700/50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-lg bg-slate-100 dark:bg-gray-900 border border-slate-200 dark:border-gray-700 flex items-center justify-center overflow-hidden flex-shrink-0">
                        <img
                          src={pet.preview}
                          alt={pet.name}
                          className="w-10 h-10 object-contain select-none"
                          style={{ imageRendering: 'pixelated' }}
                          onError={(e) => { e.currentTarget.src = "/owl_happy.png"; }}
                        />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                          {pet.name}
                          {selected && <Check size={12} className="text-blue-500" />}
                        </div>
                        <div className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-1">
                          {pet.desc}
                        </div>
                      </div>
                    </div>

                    <div>
                      {selected ? (
                        <span className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 px-2.5 py-1 rounded-md bg-blue-100/60 dark:bg-blue-900/40">
                          Em uso
                        </span>
                      ) : owned ? (
                        <button
                          type="button"
                          onClick={() => buySkin(pet)}
                          className="text-[11px] font-semibold text-slate-700 dark:text-slate-200 hover:text-blue-600 bg-slate-100 dark:bg-gray-700 hover:bg-slate-200 dark:hover:bg-gray-600 px-2.5 py-1 rounded-md transition-colors"
                        >
                          Usar
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => buySkin(pet)}
                          className={`text-[11px] font-semibold flex items-center gap-1 px-2.5 py-1 rounded-md transition-all ${
                            localCoins >= pet.price
                              ? 'bg-amber-500 hover:bg-amber-600 active:scale-95 text-white shadow-sm cursor-pointer'
                              : 'bg-amber-500/20 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-300/40 cursor-pointer hover:bg-amber-500/30'
                          }`}
                          title={localCoins >= pet.price ? `Desbloquear ${pet.name}` : `Faltam ${pet.price - localCoins} moedas`}
                        >
                          <Coins size={11} /> {pet.price}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Aba 2: Petiscos e Cuidados */}
          {storeTab === 'snacks' && (
            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
              <div className="p-2.5 rounded-xl border mb-2 flex items-center justify-between" style={{ backgroundColor: 'rgba(16, 185, 129, 0.08)', borderColor: 'rgba(16, 185, 129, 0.25)' }}>
                <div className="flex items-center gap-2">
                  <Zap size={16} className="text-emerald-500" />
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Energia de {activePet.name}:</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-20 h-2 rounded-full bg-slate-200 dark:bg-gray-700 overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full transition-all duration-300" style={{ width: `${petEnergy}%` }} />
                  </div>
                  <span className="text-xs font-bold font-mono text-emerald-500">{petEnergy}%</span>
                </div>
              </div>

              {PET_SNACKS.map((snack) => (
                <div
                  key={snack.id}
                  className="flex items-center justify-between p-2 rounded-xl border border-slate-200 dark:border-gray-700/80 hover:bg-slate-50 dark:hover:bg-gray-700/40 transition-all"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="p-1.5 rounded-lg bg-slate-100 dark:bg-gray-900 border border-slate-200 dark:border-gray-700 flex items-center justify-center w-10 h-10 select-none text-emerald-500">
                      {React.createElement(snack.icon, { size: 18 })}
                    </span>
                    <div>
                      <div className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                        {snack.name}
                        <span className="text-[10px] text-emerald-500 font-semibold flex items-center gap-0.5">
                          +{snack.energy}% <Zap size={10} className="fill-emerald-500" />
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-1">
                        {snack.desc}
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => feedPet(snack)}
                    className={`text-[11px] font-semibold flex items-center gap-1 px-2.5 py-1 rounded-md transition-all ${
                      localCoins >= snack.cost
                        ? 'bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white shadow-xs cursor-pointer'
                        : 'bg-emerald-500/20 text-emerald-600 border border-emerald-300/40 cursor-pointer hover:bg-emerald-500/30'
                    }`}
                    title={localCoins >= snack.cost ? `Alimentar ${activePet.name}` : `Faltam ${snack.cost - localCoins} moedas`}
                  >
                    <Coins size={11} /> {snack.cost}
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="mt-3 pt-2 border-t border-slate-100 dark:border-gray-700 text-center">
            <span className="text-[10px] text-slate-400 dark:text-slate-500 flex items-center justify-center gap-1">
              <Sparkles size={11} /> Conclua blocos de foco (+25 moedas) para acumular moedas de estudo
            </span>
          </div>
        </div>
      )}

      {/* Avatar do Mascote com Balão de Fala no Ápice Superior */}
      <div className="relative">
        {eatingEffect && (
          <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full bg-emerald-500 text-white font-bold text-xs shadow-lg animate-bounce z-40 whitespace-nowrap">
            {eatingEffect}
          </div>
        )}

        {bubble && (
          <div
            className="absolute bottom-full mb-2.5 left-1/2 -translate-x-1/2 whitespace-nowrap bg-white dark:bg-gray-800 border shadow-lg rounded-xl px-3 py-1.5 text-xs font-semibold z-30 animate-bounce pointer-events-none"
            style={{ borderColor: T.border, color: T.ink }}
          >
            {bubble}
            <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[5px] border-r-[5px] border-t-[6px] border-l-transparent border-r-transparent border-t-white dark:border-t-gray-800" />
          </div>
        )}

        <div
          className="w-24 h-24 rounded-full overflow-hidden border-2 relative cursor-pointer shadow-sm flex items-center justify-center p-1 transition-all hover:scale-105 hover:shadow-md hover:border-blue-400 active:scale-95"
          style={{ borderColor: T.border, backgroundColor: T.surfaceAlt }}
          onClick={() => setShowStore(!showStore)}
          title="Clique para escolher seu mascote de estudo ou alimentá-lo"
        >
          <img
            key={currentSrc}
            src={currentSrc}
            alt={status}
            className={`w-20 h-20 object-contain select-none filter drop-shadow-md ${animClass}`}
            style={{ imageRendering: 'pixelated' }}
            onError={(e) => { e.currentTarget.src = "/owl_happy.png"; }}
          />
        </div>

        {/* Botão de personalização sutil no canto do avatar sem cobrir o pet */}
        <button
          type="button"
          onClick={() => setShowStore(!showStore)}
          className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-blue-500 hover:bg-blue-600 text-white shadow-md flex items-center justify-center transition-transform hover:scale-110 active:scale-90 z-20 cursor-pointer"
          title="Personalizar mascote e petiscos"
        >
          <Sparkles size={12} />
        </button>
      </div>
      <div className="text-center flex flex-col items-center">
        {editing ? (
          <input
            autoFocus
            className="text-xs font-bold text-center bg-transparent border-b outline-none"
            style={{ color: T.ink, borderColor: T.border }}
            value={tempName}
            onChange={(e) => setTempName(e.target.value)}
            onBlur={() => { setEditing(false); onNameChange(tempName); }}
            onKeyDown={(e) => { if(e.key==='Enter') e.target.blur(); }}
          />
        ) : (
          <div className="text-xs font-bold cursor-pointer hover:underline" style={{ color: T.ink }} onClick={() => setEditing(true)}>
            {tempName}
          </div>
        )}
        <div className="text-[10px]" style={{ color: T.inkSoft }}>{status}</div>

        {/* Pílula de Energia do Pet */}
        <button
          type="button"
          onClick={() => { setShowStore(true); setStoreTab('snacks'); }}
          className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold border cursor-pointer hover:opacity-85 transition-opacity mt-1.5"
          style={{
            backgroundColor: petEnergy > 60 ? 'rgba(16, 185, 129, 0.1)' : petEnergy > 30 ? 'rgba(245, 158, 11, 0.1)' : 'rgba(239, 68, 68, 0.1)',
            borderColor: petEnergy > 60 ? 'rgba(16, 185, 129, 0.3)' : petEnergy > 30 ? 'rgba(245, 158, 11, 0.3)' : 'rgba(239, 68, 68, 0.3)',
            color: petEnergy > 60 ? '#10b981' : petEnergy > 30 ? '#f59e0b' : '#ef4444'
          }}
          title="Energia do mascote. Clique para alimentá-lo com petiscos!"
        >
          <Zap size={11} className={petEnergy > 60 ? "fill-emerald-400 text-emerald-400" : ""} />
          <span>Energia: {petEnergy}%</span>
          <span className="opacity-70">• {petEnergy > 70 ? 'Saciado' : petEnergy > 30 ? 'Fome leve' : 'Com fome'}</span>
        </button>
      </div>
    </div>
  );
}

function BreathingModal({ onClose, T }) {
  const STAGES = [
    { label: "Inspire...", instruction: "Puxe o ar suavemente pelo nariz", duration: 4, scale: 1.25, color: T.brand },
    { label: "Segure o ar...", instruction: "Mantenha o ar nos pulmões com calma", duration: 4, scale: 1.25, color: T.brandDark || T.brand },
    { label: "Expire...", instruction: "Solte o ar lentamente pela boca", duration: 4, scale: 0.8, color: T.inkSoft },
    { label: "Segure...", instruction: "Fique sem ar tranquilamente", duration: 4, scale: 0.8, color: T.border }
  ];

  const [stageIndex, setStageIndex] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(4);
  const [cycles, setCycles] = useState(0);
  const [isRunning, setIsRunning] = useState(true);

  useEffect(() => {
    if (!isRunning) return;
    const timer = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev > 1) return prev - 1;
        setStageIndex((curr) => {
          const next = (curr + 1) % STAGES.length;
          if (next === 0) setCycles((c) => c + 1);
          return next;
        });
        return 4;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isRunning, STAGES.length]);

  const current = STAGES[stageIndex];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div
        className="w-full max-w-md p-6 rounded-2xl flex flex-col items-center text-center shadow-2xl relative border"
        style={{ backgroundColor: T.surface, borderColor: T.border }}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:opacity-70 transition-opacity cursor-pointer"
          style={{ color: T.inkSoft }}
          title="Fechar"
          aria-label="Fechar"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 mb-2">
          <Wind className="w-5 h-5" style={{ color: T.brand }} />
          <h3 className="text-lg font-bold" style={{ color: T.ink }}>Respiração Guiada (Box Breathing)</h3>
        </div>

        <p className="text-xs mb-6 max-w-xs" style={{ color: T.inkSoft }}>
          Técnica 4-4-4-4 para desacelerar o ritmo cardíaco, reduzir o cortisol e restaurar o foco.
        </p>

        <div className="relative w-48 h-48 flex items-center justify-center my-4">
          <div
            className="absolute rounded-full transition-all duration-1000 ease-in-out border-2"
            style={{
              width: `${current.scale * 120}px`,
              height: `${current.scale * 120}px`,
              borderColor: current.color,
              backgroundColor: current.color + "18",
              boxShadow: `0 0 30px ${current.color}33`,
            }}
          />
          <div className="relative z-10 flex flex-col items-center">
            <span className="text-4xl font-extrabold font-mono" style={{ color: T.ink }}>
              {secondsLeft}
            </span>
            <span className="text-xs font-semibold mt-1 uppercase tracking-wider" style={{ color: current.color }}>
              {current.label}
            </span>
          </div>
        </div>

        <p className="text-sm font-medium mb-4 h-6" style={{ color: T.ink }}>
          {current.instruction}
        </p>

        <div className="flex items-center gap-4 text-xs font-mono mb-4" style={{ color: T.inkSoft }}>
          <span>Ciclos completos: <strong style={{ color: T.brand }}>{cycles}</strong></span>
        </div>

        <div className="flex gap-2 w-full">
          <button
            onClick={() => setIsRunning(!isRunning)}
            className="flex-1 py-2.5 rounded-xl text-xs font-bold transition-opacity hover:opacity-90 border"
            style={{ backgroundColor: T.surfaceAlt, borderColor: T.border, color: T.ink }}
          >
            {isRunning ? "Pausar" : "Continuar"}
          </button>
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl text-xs font-bold transition-opacity hover:opacity-90"
            style={{ backgroundColor: T.brand, color: T.bg }}
          >
            Concluir
          </button>
        </div>
      </div>
    </div>
  );
}

export function parseMusicUrl(inputUrl) {
  if (!inputUrl || typeof inputUrl !== 'string') return null;
  const raw = inputUrl.trim();

  // Se o usuário colou o código <iframe> de incorporação completo
  if (raw.includes('<iframe') && raw.includes('src=')) {
    const srcMatch = raw.match(/src=["']([^"']+)["']/i);
    if (srcMatch) {
      return parseMusicUrl(srcMatch[1]);
    }
  }

  // 1. Spotify (Playlists, Álbuns, Faixas, Artistas, Podcasts)
  const spotifyMatch = raw.match(/(playlist|album|track|show|episode|artist)\/([a-zA-Z0-9]+)/i);
  if (raw.includes('spotify.com') || raw.startsWith('spotify:') || spotifyMatch) {
    if (spotifyMatch) {
      const type = spotifyMatch[1].toLowerCase();
      const id = spotifyMatch[2];
      return {
        type: 'spotify',
        label: 'Spotify',
        embedUrl: `https://open.spotify.com/embed/${type}/${id}?utm_source=generator&theme=0`,
        key: `spotify:${type}/${id}`,
      };
    }
  }

  // 2. YouTube Music & YouTube (Playlists, Músicas, Vídeos)
  if (raw.includes('music.youtube.com') || raw.includes('youtube.com') || raw.includes('youtu.be')) {
    try {
      const isYtMusic = raw.includes('music.youtube.com');
      const label = isYtMusic ? 'YouTube Music' : 'YouTube';

      const shortMatch = raw.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/i);
      let videoId = shortMatch ? shortMatch[1] : null;

      const vMatch = raw.match(/[?&]v=([a-zA-Z0-9_-]{11})/i);
      if (vMatch) videoId = vMatch[1];

      const embedMatch = raw.match(/\/embed\/([a-zA-Z0-9_-]{11})/i);
      if (embedMatch) videoId = embedMatch[1];

      const listMatch = raw.match(/[?&]list=([a-zA-Z0-9_-]+)/i);
      const listId = listMatch ? listMatch[1] : null;

      if (listId && !videoId) {
        return {
          type: 'youtube',
          label,
          embedUrl: `https://www.youtube-nocookie.com/embed/videoseries?list=${listId}`,
          key: `yt:list:${listId}`,
        };
      }

      if (videoId && listId) {
        return {
          type: 'youtube',
          label,
          embedUrl: `https://www.youtube-nocookie.com/embed/${videoId}?list=${listId}`,
          key: `yt:${videoId}:${listId}`,
        };
      }

      if (videoId) {
        return {
          type: 'youtube',
          label,
          embedUrl: `https://www.youtube-nocookie.com/embed/${videoId}`,
          key: `yt:${videoId}`,
        };
      }
    } catch (e) {
      console.warn('Erro ao processar link do YouTube:', e);
    }
  }

  return null;
}

export function FocoTab(props) {
  const { isZen, setIsZen } = props;
  const { config, updateConfig } = props;
  const { commitments, sessions, metaHoje, timer, userId, notes, materials, summaries, quizAttempts, professorAttempts, setNotes, setMaterials, setSummaries, setQuizAttempts, setProfessorAttempts } = props;
  const [lofiSrc, setLofiSrc] = useState(null);
  const [lofiOn, setLofiOn] = useState(false);
  const [soundVolume, setSoundVolume] = useState(0.7);
  const [activeMasterMenu, setActiveMasterMenu] = useState(null); // 'actions' | 'audio' | 'room' | null
  const [activePrepAccessory, setActivePrepAccessory] = useState(null); // 'pet' | 'room' | null
  const audioRef = useRef(null);

  const [musicInput, setMusicInput] = useState("");
  const [musicError, setMusicError] = useState(null);

  const isAudioEnabled = props.config?.enableMusic !== false && props.config?.enableLofi !== false;
  useEffect(() => {
    if (!isAudioEnabled) {
      if (lofiSrc) setLofiSrc(null);
      if (lofiOn) setLofiOn(false);
    }
  }, [isAudioEnabled]);

  const activeMusic = useMemo(() => {
    if (!isAudioEnabled) return null;
    if (props.config?.musicUrl) {
      const isSpotify = props.config.musicType === 'spotify' || props.config.musicUrl.includes('spotify.com');
      return {
        type: isSpotify ? 'spotify' : 'youtube',
        label: props.config.musicLabel || (isSpotify ? 'Spotify' : 'YouTube Music'),
        embedUrl: props.config.musicUrl,
      };
    }
    if (props.config?.spotifyUrl) {
      return {
        type: 'spotify',
        label: 'Spotify',
        embedUrl: `https://open.spotify.com/embed/${props.config.spotifyUrl}?utm_source=generator&theme=0`,
      };
    }
    return null;
  }, [isAudioEnabled, props.config?.musicUrl, props.config?.musicType, props.config?.musicLabel, props.config?.spotifyUrl]);

  const activeAudioInfo = useMemo(() => {
    if (lofiSrc) {
      const soundMap = {
        "https://stream.zeno.fm/f3wvbbqmdg8uv": "Lo-Fi",
        "/sounds/chuva.mp3": "Chuva",
        "/sounds/cafe.mp3": "Café",
        "/sounds/fogueira.mp3": "Fogueira",
      };
      const name = soundMap[lofiSrc] || "Ambiente";
      return { active: true, label: `${name} (${Math.round(soundVolume * 100)}%)`, type: 'ambient' };
    }
    if (activeMusic) {
      return { active: true, label: activeMusic.label, type: 'music' };
    }
    if (lofiOn) {
      return { active: true, label: "Rádio Lo-Fi Girl", type: 'radio' };
    }
    return { active: false, label: "Sons & Música", type: 'none' };
  }, [lofiSrc, soundVolume, activeMusic, lofiOn]);

  const handleAddMusic = (rawUrl) => {
    const val = (rawUrl !== undefined ? rawUrl : musicInput || "").trim();
    if (!val) return;
    const parsed = parseMusicUrl(val);
    if (!parsed) {
      setMusicError("Link inválido. Cole um link do Spotify ou YouTube Music (playlist ou música).");
      return;
    }
    setMusicError(null);
    setMusicInput("");
    sfx.complete();

    const nextConfig = {
      ...props.config,
      musicUrl: parsed.embedUrl,
      musicType: parsed.type,
      musicLabel: parsed.label,
      spotifyUrl: parsed.type === "spotify"
        ? parsed.embedUrl.replace("https://open.spotify.com/embed/", "").replace("?utm_source=generator&theme=0", "")
        : null
    };

    try {
      const fresh = JSON.parse(localStorage.getItem("omnia_config") || "{}");
      localStorage.setItem("omnia_config", JSON.stringify({ ...fresh, ...nextConfig }));
      window.dispatchEvent(new Event("storage"));
    } catch {}
    if (props.updateConfig) props.updateConfig(nextConfig);
  };

  const handleRemoveMusic = () => {
    sfx.click();
    setMusicError(null);
    const nextConfig = {
      ...props.config,
      musicUrl: null,
      musicType: null,
      musicLabel: null,
      spotifyUrl: null,
    };
    try {
      const fresh = JSON.parse(localStorage.getItem("omnia_config") || "{}");
      localStorage.setItem("omnia_config", JSON.stringify({ ...fresh, ...nextConfig }));
      window.dispatchEvent(new Event("storage"));
    } catch {}
    if (props.updateConfig) props.updateConfig(nextConfig);
  };

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = soundVolume;
    }
  }, [soundVolume, lofiSrc]);

  useEffect(() => {
    reactiveBgm.duck(Boolean(lofiSrc || activeMusic || lofiOn));
    return () => reactiveBgm.duck(false);
  }, [lofiSrc, activeMusic, lofiOn]);

  const [showRoom, setShowRoom] = useState(false);
  const [roomCode, setRoomCode] = useState("");
  const [showBreathing, setShowBreathing] = useState(false);
  const [bossFightActive, setBossFightActive] = useState(() => {
    try {
      const saved = localStorage.getItem("omnia_boss_active");
      return saved !== null ? saved === "true" : true;
    } catch { return true; }
  });
  const [selectedBossId, setSelectedBossId] = useState(() => {
    try {
      return localStorage.getItem("omnia_selected_boss") || BOSS_ROSTER[0].id;
    } catch { return BOSS_ROSTER[0].id; }
  });
  const [bossHurtTrigger, setBossHurtTrigger] = useState(false);

  const selectedBoss = useMemo(() => {
    return BOSS_ROSTER.find(b => b.id === selectedBossId) || BOSS_ROSTER[0];
  }, [selectedBossId]);

  const selectBoss = (id) => {
    setSelectedBossId(id);
    try { localStorage.setItem("omnia_selected_boss", id); } catch {}
  };

  const toggleBossMode = () => {
    setBossFightActive(prev => {
      const next = !prev;
      try { localStorage.setItem("omnia_boss_active", String(next)); } catch {}
      return next;
    });
  };

  useEffect(() => {
    const handler = () => setShowBreathing(true);
    window.addEventListener("openBreathing", handler);
    return () => window.removeEventListener("openBreathing", handler);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        if (activePrepAccessory) setActivePrepAccessory(null);
        if (showBreathing) setShowBreathing(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activePrepAccessory, showBreathing]);

    useEffect(() => {
      const handleFsChange = () => {
        if (!document.fullscreenElement && isZen) {
          setIsZen(false);
        }
      };
      document.addEventListener('fullscreenchange', handleFsChange);
      return () => document.removeEventListener('fullscreenchange', handleFsChange);
    }, [isZen, setIsZen]);

    const toggleZen = () => {
      if (!isZen) {
        document.documentElement.requestFullscreen().catch(()=>{});
        setIsZen(true);
      } else {
        document.exitFullscreen().catch(()=>{});
        setIsZen(false);
      }
    };


    const [showHealthBreak, setShowHealthBreak] = useState(false);

      const [lastHealthBreak, setLastHealthBreak] = useState(0);
      useEffect(() => {
        if (config?.enableHealthBreak === false) return;
        if (timer.isRunning && timer.phase === 'work') {
          const elapsed = (timer.workSeconds || 999999) - timer.remaining;
          const currentInterval = Math.floor(elapsed / 1200);
          
          if (currentInterval > 0 && currentInterval > lastHealthBreak) {
            setShowHealthBreak(true);
            setLastHealthBreak(currentInterval);
            setTimeout(() => setShowHealthBreak(false), 8000);
          }
        } else if (timer.phase !== 'work') {
          setLastHealthBreak(0);
        }
      }, [timer.remaining, timer.isRunning, timer.phase, config?.enableHealthBreak, timer.workSeconds, lastHealthBreak]);


  
  const [copiedType, setCopiedType] = useState(null);

  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const r = params.get("room");
      if (r && !timer.roomId) {
        setRoomCode(r.toUpperCase());
        setShowRoom(true);
      }
    } catch (e) {}
  }, [timer.roomId]);

  function handleCreateRoom() {
    sfx.complete();
    const code = Math.random().toString(36).substring(2, 7).toUpperCase();
    const userName = config?.petName || "Colega";
    const userSkin = config?.petSkin || "none";
    timer.joinRoom(code, true, { name: userName, skin: userSkin, id: userId });
    setRoomCode(code);
    setShowRoom(true);
    try {
      navigator.clipboard.writeText(code);
      setCopiedType('code');
      setTimeout(() => setCopiedType(null), 2500);
    } catch (e) {}
  }

  function handleJoinRoom() {
    if (!roomCode.trim()) return;
    sfx.complete();
    const clean = roomCode.trim().toUpperCase();
    const userName = config?.petName || "Colega";
    const userSkin = config?.petSkin || "none";
    timer.joinRoom(clean, false, { name: userName, skin: userSkin, id: userId });
    setShowRoom(true);
  }

  function handleCopyCode() {
    sfx.click();
    const c = timer.roomId || roomCode;
    if (c) {
      navigator.clipboard.writeText(c).catch(() => {});
      setCopiedType('code');
      setTimeout(() => setCopiedType(null), 2500);
    }
  }

  function handleCopyLink() {
    sfx.click();
    const link = `${window.location.origin}${window.location.pathname}?room=${timer.roomId || roomCode}`;
    navigator.clipboard.writeText(link).catch(() => {});
    setCopiedType('link');
    setTimeout(() => setCopiedType(null), 2500);
  }

  function handleLeaveRoom() {
    sfx.click();
    timer.leaveRoom();
    setRoomCode("");
  }

  const datasAtividades = Array.from(new Set((sessions||[]).map(s => s.date ? s.date.slice(0,10) : ""))).filter(Boolean).sort().reverse();
  let streak = Math.max(parseInt(localStorage.getItem("omnia_streak_days") || "0"), 0);
  let calcStreak = 0;
  let d = new Date();
  for (let i = 0; i < 365; i++) {
    const dIso = d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
    if (datasAtividades.includes(dIso)) calcStreak++;
    else if (i !== 0) break;
  }
  if (calcStreak > streak) streak = calcStreak;
  const {
    selectedId, setSelectedId, presetIdx, setPresetIdx, customMin, setCustomMin,
    useCustom, setUseCustom, phase, running, remaining, ciclosConsecutivos, ultimaSessao,
    selectedCommitment, workSeconds,
    iniciar, pausar, continuar, reiniciarCiclo, encerrar, roomId, isHost, joinRoom, leaveRoom, members,
  } = timer;

  const mins = String(Math.floor(remaining / 60)).padStart(2, "0");
  const secs = String(remaining % 60).padStart(2, "0");
  const totalHoje = sessions.filter((s) => s.date === todayISO()).reduce((acc, s) => acc + s.minutos, 0);

  const compromissosOrdenados = [...commitments].sort((a, b) => (a.prazo || "9999-99-99").localeCompare(b.prazo || "9999-99-99"));

  const totalDuration = workSeconds || 1500;
  const elapsedSeconds = Math.max(0, totalDuration - remaining);
  const progressRatio = Math.min(1, Math.max(0, elapsedSeconds / Math.max(1, totalDuration)));
  const bossCurrentHp = Math.max(0, Math.round(selectedBoss.maxHp * (1 - progressRatio)));
  const bossDamageDealt = selectedBoss.maxHp - bossCurrentHp;
  const bossHpPct = Math.round((bossCurrentHp / selectedBoss.maxHp) * 100);

  /* ------------------------- Modo imersivo (sessão ativa) ------------------------- */
  if (phase !== "idle") {
    return (
      <div className="space-y-5">
        {lofiSrc && (
          <audio
            key={lofiSrc}
            ref={audioRef}
            src={lofiSrc}
            autoPlay
            loop
            playsInline
          />
        )}
        <Card className="text-center py-7 relative overflow-hidden">
          <div
            className="absolute top-0 left-4 px-2 py-0.5 text-[10px] font-mono uppercase tracking-widest rounded-b"
            style={{ backgroundColor: T.brand, color: T.brandInk }}
          >
            Modo Foco
          </div>
          {roomId && (
            <div
              className="absolute top-0 right-4 px-2.5 py-0.5 text-[10px] font-mono uppercase tracking-wider rounded-b flex items-center gap-1.5"
              style={{ backgroundColor: TINT.brand, color: T.brand, border: `1px solid ${T.border}`, borderTop: 0 }}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Sala #{roomId}</span>
              <span className="opacity-70 font-semibold">• {isHost ? "Host" : "Convidado"}</span>
            </div>
          )}
          <div className="text-[11px] font-mono uppercase tracking-widest mb-1.5 mt-2" style={{ color: T.inkSoft }}>
            {phase === "work" ? (running ? "Foco" : "Pausado") : "Pausa"}
          </div>
          {selectedCommitment && (
            <div className="text-sm font-medium mb-1 truncate px-4" style={{ color: T.ink }}>
              {selectedCommitment.disciplina} — {selectedCommitment.assunto}
            </div>
          )}
          <div className="text-5xl font-mono font-semibold tabular-nums my-3" style={{ color: T.ink }}>{mins}:{secs}</div>

          {/* Botão de Ação Primária */}
          <div className="flex items-center justify-center gap-3 mb-4">
            {running ? (
              <button
                type="button"
                onClick={() => { sfx.click(); pausar(); }}
                className="px-6 py-2 rounded-xl font-semibold text-xs sm:text-sm flex items-center gap-2 shadow-sm transition-all active:scale-95 border cursor-pointer hover:opacity-90"
                style={{
                  backgroundColor: T.surfaceAlt,
                  borderColor: T.border,
                  color: T.ink,
                }}
              >
                <Pause className="w-4 h-4 text-amber-500" />
                <span>Pausar</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => { sfx.click(); continuar(); }}
                className="px-6 py-2 rounded-xl font-semibold text-xs sm:text-sm flex items-center gap-2 shadow-md transition-all active:scale-95 cursor-pointer hover:opacity-95"
                style={{
                  backgroundColor: T.brand,
                  color: T.brandInk,
                }}
              >
                <Play className="w-4 h-4 fill-current" />
                <span>Continuar</span>
              </button>
            )}
          </div>

          {/* Mascote de Foco */}
          {config?.enablePet !== false && (
            <div className="my-2">
              <FocusPet
                timerOn={phase === "work" && running}
                streak={streak}
                petName={config?.petName}
                onNameChange={(n) => updateConfig({...config, petName: n})}
                config={config}
                updateConfig={updateConfig}
                phase={phase}
              />
            </div>
          )}

          {/* Batalha RPG contra o Chefe */}
          {config?.enableBossFight !== false && bossFightActive && selectedBoss && phase === "work" && (
            <div
              className="my-3 mx-auto max-w-md p-3.5 rounded-2xl border transition-all relative overflow-hidden"
              style={{
                backgroundColor: T.surfaceAlt,
                borderColor: selectedBoss.themeColor || T.border,
                boxShadow: running ? `0 0 16px ${selectedBoss.themeColor}33` : "none",
              }}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2.5 text-left min-w-0">
                  <div
                    className={`w-10 h-10 rounded-xl shrink-0 flex items-center justify-center overflow-hidden border p-0.5 ${running ? "animate-pulse" : ""}`}
                    style={{ backgroundColor: `${selectedBoss.themeColor}18`, borderColor: `${selectedBoss.themeColor}44` }}
                  >
                    {selectedBoss.spriteIdle ? (
                      <img src={selectedBoss.spriteIdle} alt="" className="w-full h-full object-contain" style={{ imageRendering: 'pixelated' }} />
                    ) : (
                      React.createElement(selectedBoss.icon || Swords, { size: 20, style: { color: selectedBoss.themeColor } })
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold flex items-center gap-1.5 truncate" style={{ color: T.ink }}>
                      <span className="truncate">{selectedBoss.name}</span>
                      <span
                        className="text-[9px] px-1.5 py-0.2 rounded-full font-mono uppercase font-bold shrink-0"
                        style={{ backgroundColor: `${selectedBoss.themeColor}22`, color: selectedBoss.themeColor, border: `1px solid ${selectedBoss.themeColor}44` }}
                      >
                        Chefe RPG
                      </span>
                    </div>
                    <div className="text-[10px] truncate" style={{ color: T.inkSoft }}>
                      {selectedBoss.title}
                    </div>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className="text-xs font-mono font-bold" style={{ color: selectedBoss.themeColor }}>
                    {bossCurrentHp} / {selectedBoss.maxHp} HP
                  </div>
                  <div className="text-[10px]" style={{ color: T.inkSoft }}>
                    {bossHpPct}% restante
                  </div>
                </div>
              </div>

              {/* Arena Visual do Chefão com Sprite e Reação de Dano */}
              <div className="my-2.5 flex flex-col items-center justify-center relative">
                <div
                  className={`relative cursor-pointer transition-all flex items-center justify-center p-1 rounded-2xl ${
                    bossHurtTrigger ? "animate-boss-hurt" : running ? "animate-boss-idle" : "hover:scale-105"
                  }`}
                  onClick={() => {
                    sfx.pop();
                    setBossHurtTrigger(true);
                    setTimeout(() => setBossHurtTrigger(false), 650);
                  }}
                  title="Clique para desferir um golpe de foco no chefão!"
                >
                  <img
                    src={bossHurtTrigger ? (selectedBoss.spriteHurt || selectedBoss.spriteIdle) : (selectedBoss.spriteIdle || selectedBoss.preview)}
                    alt={selectedBoss.name}
                    className="w-28 h-28 sm:w-32 sm:h-32 object-contain select-none filter drop-shadow-xl transition-transform"
                    style={{ imageRendering: 'pixelated' }}
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                  {bossHurtTrigger && (
                    <div className="absolute -top-1 -right-2 bg-rose-600 text-white font-mono font-black text-[11px] px-2.5 py-0.5 rounded-full shadow-lg border border-rose-300 animate-bounce z-10">
                      💥 GOLPE DE FOCO!
                    </div>
                  )}
                </div>
                <div className="text-[10px] text-slate-400 mt-1 flex items-center gap-1.5 flex-wrap justify-center">
                  <span>Toque no chefe para golpear</span> • <span className="text-emerald-400 font-semibold">Cada minuto de estudo reduz o HP</span>
                </div>
              </div>

              {/* Barra de Vida do Boss */}
              <div className="w-full h-3 rounded-full overflow-hidden bg-slate-800 border border-slate-700/60 relative">
                <div
                  className="h-full transition-all duration-300 relative rounded-full"
                  style={{
                    width: `${Math.max(0, Math.min(100, bossHpPct))}%`,
                    backgroundColor: selectedBoss.themeColor || "#ef4444",
                  }}
                >
                  {running && (
                    <div className="absolute inset-0 bg-white/20 animate-pulse" />
                  )}
                </div>
              </div>

              <div className="mt-2 flex items-center justify-between text-[11px]" style={{ color: T.inkSoft }}>
                <span className="flex items-center gap-1">
                  <Swords size={12} className="text-rose-400" />
                  <span>Dano no chefe: <strong className="font-mono text-emerald-400">-{bossDamageDealt} HP</strong></span>
                </span>
                <span className="truncate max-w-[190px] text-right flex items-center gap-1" title={selectedBoss.weakness}>
                  <Target size={11} className="text-amber-400 shrink-0" />
                  <span>{selectedBoss.weakness}</span>
                </span>
              </div>
            </div>
          )}

          {/* Barra de Botões Mestres */}
          <div className="mt-5 pt-4 border-t max-w-md mx-auto" style={{ borderColor: T.border }}>
            <div className="flex items-center justify-center gap-2 flex-wrap">
              {/* Botão Mestre 1: Ações */}
              <button
                type="button"
                onClick={() => {
                  sfx.click();
                  setActiveMasterMenu(prev => prev === 'actions' ? null : 'actions');
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                  activeMasterMenu === 'actions'
                    ? 'shadow-sm scale-[1.03]'
                    : 'opacity-75 hover:opacity-100 hover:scale-[1.01]'
                }`}
                style={{
                  backgroundColor: activeMasterMenu === 'actions' ? T.brand : T.surfaceAlt,
                  color: activeMasterMenu === 'actions' ? T.brandInk : T.ink,
                  border: `1px solid ${activeMasterMenu === 'actions' ? T.brand : T.border}`,
                }}
                title="Ações da sessão"
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>Ações</span>
                {activeMasterMenu === 'actions' ? (
                  <ChevronUp className="w-3 h-3 opacity-80" />
                ) : (
                  <ChevronDown className="w-3 h-3 opacity-60" />
                )}
              </button>

              {/* Botão Mestre 2: Sons & Música */}
              {isAudioEnabled && (
                <button
                  type="button"
                  onClick={() => {
                    sfx.click();
                    setActiveMasterMenu(prev => prev === 'audio' ? null : 'audio');
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                    activeMasterMenu === 'audio'
                      ? 'shadow-sm scale-[1.03]'
                      : 'opacity-75 hover:opacity-100 hover:scale-[1.01]'
                  }`}
                  style={{
                    backgroundColor: activeMasterMenu === 'audio' ? T.brand : T.surfaceAlt,
                    color: activeMasterMenu === 'audio' ? T.brandInk : T.ink,
                    border: `1px solid ${activeMasterMenu === 'audio' ? T.brand : T.border}`,
                  }}
                  title="Configurar sons ambiente e músicas"
                >
                  <Headphones className="w-3.5 h-3.5" />
                  <span>{activeAudioInfo.label}</span>
                  {activeAudioInfo.active && (
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse inline-block" />
                  )}
                  {activeMasterMenu === 'audio' ? (
                    <ChevronUp className="w-3 h-3 opacity-80" />
                  ) : (
                    <ChevronDown className="w-3 h-3 opacity-60" />
                  )}
                </button>
              )}

              {/* Botão Mestre 3: Modo Zen */}
              <button
                type="button"
                onClick={() => {
                  sfx.click();
                  toggleZen();
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                  isZen ? 'shadow-sm scale-[1.03]' : 'opacity-75 hover:opacity-100 hover:scale-[1.01]'
                }`}
                style={{
                  backgroundColor: isZen ? TINT.brand : T.surfaceAlt,
                  color: isZen ? T.brand : T.ink,
                  border: `1px solid ${isZen ? T.brand : T.border}`,
                }}
                title={isZen ? "Sair da tela cheia" : "Tela cheia imersiva"}
              >
                <Maximize className="w-3.5 h-3.5" />
                <span>{isZen ? "Sair do Zen" : "Modo Zen"}</span>
              </button>

              {/* Botão Mestre 4: Sala (se sala ativa) */}
              {config?.enableMultiplayer !== false && roomId && (
                <button
                  type="button"
                  onClick={() => {
                    sfx.click();
                    setActiveMasterMenu(prev => prev === 'room' ? null : 'room');
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                    activeMasterMenu === 'room'
                      ? 'shadow-sm scale-[1.03]'
                      : 'opacity-75 hover:opacity-100 hover:scale-[1.01]'
                  }`}
                  style={{
                    backgroundColor: activeMasterMenu === 'room' ? T.brand : T.surfaceAlt,
                    color: activeMasterMenu === 'room' ? T.brandInk : T.ink,
                    border: `1px solid ${activeMasterMenu === 'room' ? T.brand : T.border}`,
                  }}
                  title="Ver colegas na sala"
                >
                  <Users className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Sala ({members && members.length > 0 ? members.length : 1})</span>
                  {activeMasterMenu === 'room' ? (
                    <ChevronUp className="w-3 h-3 opacity-80" />
                  ) : (
                    <ChevronDown className="w-3 h-3 opacity-60" />
                  )}
                </button>
              )}
            </div>

            {/* Gavetas de Acessórios (Collapsible Drawers) */}
            {/* Drawer 1: Ações da Sessão */}
            {activeMasterMenu === 'actions' && (
              <div
                className="mt-3.5 p-3.5 rounded-2xl border text-left transition-all animate-in fade-in slide-in-from-top-1 duration-150"
                style={{ backgroundColor: T.surfaceAlt, borderColor: T.border }}
              >
                <div className="flex items-center justify-between pb-2 mb-2.5 border-b" style={{ borderColor: T.border }}>
                  <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider" style={{ color: T.ink }}>
                    <SlidersHorizontal className="w-3.5 h-3.5" style={{ color: T.brand }} />
                    <span>Ações da Sessão</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveMasterMenu(null)}
                    className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {(!roomId || isHost) && (
                    <button
                      type="button"
                      onClick={() => { sfx.click(); reiniciarCiclo(); }}
                      className="flex-1 min-w-[120px] px-3 py-2 rounded-xl text-xs font-medium border flex items-center justify-center gap-1.5 transition-all opacity-85 hover:opacity-100 active:scale-95 cursor-pointer"
                      style={{ backgroundColor: T.surface, borderColor: T.border, color: T.ink }}
                    >
                      <RotateCcw className="w-3.5 h-3.5 text-amber-500" />
                      <span>Reiniciar ciclo</span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => { sfx.click(); encerrar(); }}
                    className="flex-1 min-w-[120px] px-3 py-2 rounded-xl text-xs font-medium border flex items-center justify-center gap-1.5 transition-all text-rose-500 border-rose-200 dark:border-rose-900/50 hover:bg-rose-50 dark:hover:bg-rose-950/30 active:scale-95 cursor-pointer"
                    style={{ backgroundColor: T.surface }}
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>{roomId && !isHost ? "Encerrar meu foco" : "Encerrar sessão"}</span>
                  </button>
                  {roomId && !isHost && (
                    <button
                      type="button"
                      onClick={() => { sfx.click(); handleLeaveRoom(); }}
                      className="flex-1 min-w-[120px] px-3 py-2 rounded-xl text-xs font-medium border flex items-center justify-center gap-1.5 transition-all text-rose-500 border-rose-200 dark:border-rose-900/50 hover:bg-rose-50 dark:hover:bg-rose-950/30 active:scale-95 cursor-pointer"
                      style={{ backgroundColor: T.surface }}
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sair da Sala</span>
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Drawer 2: Sons & Trilha Sonora */}
            {isAudioEnabled && activeMasterMenu === 'audio' && (
              <div
                className="mt-3.5 p-3.5 rounded-2xl border text-left transition-all animate-in fade-in slide-in-from-top-1 duration-150"
                style={{ backgroundColor: T.surfaceAlt, borderColor: T.border }}
              >
              <div className="flex items-center justify-between pb-2 mb-3 border-b" style={{ borderColor: T.border }}>
                <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider" style={{ color: T.ink }}>
                  <Headphones className="w-3.5 h-3.5" style={{ color: T.brand }} />
                  <span>Sons de Foco & Música</span>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveMasterMenu(null)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Ruídos Ambiente */}
              <div className="space-y-2 mb-3.5">
                <div className="text-[10px] font-mono uppercase tracking-wider opacity-70" style={{ color: T.inkSoft }}>
                  Ruídos Ambientes
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { id: null, label: "Silêncio", icon: VolumeX },
                    { id: "https://stream.zeno.fm/f3wvbbqmdg8uv", label: "Lo-Fi", icon: Headphones },
                    { id: "/sounds/chuva.mp3", label: "Chuva", icon: CloudRain },
                    { id: "/sounds/cafe.mp3", label: "Café", icon: Coffee },
                    { id: "/sounds/fogueira.mp3", label: "Fogueira", icon: Flame }
                  ].map((s) => {
                    const IconCmp = s.icon;
                    const active = lofiSrc === s.id;
                    return (
                      <button
                        key={s.label}
                        type="button"
                        onClick={() => { sfx.click(); setLofiSrc(s.id); }}
                        className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                          active ? "shadow-sm font-semibold" : "opacity-70 hover:opacity-100"
                        }`}
                        style={{
                          backgroundColor: active ? T.brand : T.surface,
                          color: active ? T.brandInk : T.ink,
                          border: `1px solid ${active ? T.brand : T.border}`
                        }}
                      >
                        <IconCmp className="w-3.5 h-3.5" />
                        <span>{s.label}</span>
                      </button>
                    );
                  })}
                </div>

                {lofiSrc && (
                  <div className="flex items-center gap-2.5 mt-2 px-3 py-1.5 rounded-xl border shadow-2xs" style={{ backgroundColor: T.surface, borderColor: T.border }}>
                    {soundVolume === 0 ? (
                      <VolumeX size={14} style={{ color: T.inkSoft }} />
                    ) : (
                      <Volume2 size={14} style={{ color: T.brand }} />
                    )}
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.05"
                      value={soundVolume}
                      onChange={(e) => setSoundVolume(parseFloat(e.target.value))}
                      className="w-full accent-blue-500 h-1.5 cursor-pointer"
                      title="Volume do Som Ambiente"
                    />
                    <span className="text-[10px] font-mono w-7 text-right font-medium" style={{ color: T.inkSoft }}>
                      {Math.round(soundVolume * 100)}%
                    </span>
                  </div>
                )}
              </div>

              {/* Player Spotify & YouTube Music */}
              <div className="pt-3 border-t space-y-2" style={{ borderColor: T.border }}>
                <div className="text-[10px] font-mono uppercase tracking-wider opacity-70" style={{ color: T.inkSoft }}>
                  Música (Spotify & YouTube)
                </div>

                {!activeMusic ? (
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        placeholder="Link do Spotify ou YouTube Music..."
                        value={musicInput}
                        onChange={(e) => {
                          setMusicInput(e.target.value);
                          if (musicError) setMusicError(null);
                        }}
                        className="w-full text-xs p-2 rounded-lg outline-none transition-all"
                        style={{
                          backgroundColor: T.surface,
                          color: T.ink,
                          border: `1px solid ${musicError ? '#ef4444' : T.border}`,
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddMusic(e.target.value);
                          }
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => handleAddMusic()}
                        disabled={!musicInput.trim()}
                        className={`px-3 py-2 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-all ${
                          musicInput.trim()
                            ? 'bg-blue-600 hover:bg-blue-700 text-white cursor-pointer shadow-sm active:scale-95'
                            : 'bg-slate-200 dark:bg-gray-800 text-slate-400 dark:text-gray-500 cursor-not-allowed opacity-60'
                        }`}
                      >
                        <Music size={13} />
                        <span>Tocar</span>
                      </button>
                    </div>

                    {musicError && (
                      <div className="text-[11px] text-rose-500 dark:text-rose-400 px-1 font-medium">
                        {musicError}
                      </div>
                    )}

                    <div className="flex items-center justify-between text-[11px] px-1" style={{ color: T.inkSoft }}>
                      <div className="flex items-center gap-2">
                        <span className="flex items-center gap-1 font-medium">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
                          Spotify
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1 font-medium">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-500 inline-block" />
                          YouTube Music
                        </span>
                      </div>
                      <GhostButton
                        className="text-xs py-1 px-2.5"
                        onClick={() => setLofiOn(!lofiOn)}
                        style={{ color: lofiOn ? T.brand : T.inkSoft }}
                      >
                        <Headphones className="w-3.5 h-3.5 mr-1" />
                        {lofiOn ? 'Rádio Lo-Fi Ativa' : 'Ligar Rádio Lo-Fi'}
                      </GhostButton>
                    </div>
                  </div>
                ) : (
                  <div className="relative group w-full flex flex-col gap-1.5">
                    <div className="flex items-center justify-between px-1 text-xs font-medium" style={{ color: T.inkSoft }}>
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`w-2 h-2 rounded-full ${
                            activeMusic.type === 'spotify' ? 'bg-emerald-500' : 'bg-red-500'
                          } animate-pulse`}
                        />
                        <span className="font-semibold" style={{ color: T.ink }}>
                          {activeMusic.label}
                        </span>
                        <span className="text-[10px] opacity-70">conectado</span>
                      </div>
                      <button
                        type="button"
                        onClick={handleRemoveMusic}
                        className="text-[11px] text-slate-400 hover:text-rose-500 transition-colors flex items-center gap-1 cursor-pointer"
                        title="Trocar ou remover playlist"
                      >
                        <X size={12} /> Trocar playlist
                      </button>
                    </div>

                    <div className="relative rounded-xl overflow-hidden border shadow-sm" style={{ borderColor: T.border, backgroundColor: T.surface }}>
                      {activeMusic.type === 'spotify' ? (
                        <iframe
                          style={{ borderRadius: '12px' }}
                          src={activeMusic.embedUrl}
                          width="100%"
                          height="152"
                          frameBorder="0"
                          allowFullScreen=""
                          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                          loading="lazy"
                          title="Spotify Player"
                        />
                      ) : (
                        <iframe
                          style={{ borderRadius: '12px' }}
                          src={activeMusic.embedUrl}
                          width="100%"
                          height="180"
                          frameBorder="0"
                          allowFullScreen=""
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          loading="lazy"
                          title="YouTube Music Player"
                        />
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Rádio Lo-Fi Girl */}
              {lofiOn && (
                <div className="pt-3 border-t flex flex-col items-center" style={{ borderColor: T.border }}>
                  <div className="flex items-center justify-between w-full mb-1.5 px-1 text-xs" style={{ color: T.inkSoft }}>
                    <span className="font-medium">Rádio Lo-Fi Girl</span>
                    <button
                      type="button"
                      onClick={() => setLofiOn(false)}
                      className="text-rose-500 hover:underline text-[11px] cursor-pointer"
                    >
                      Desligar
                    </button>
                  </div>
                  <iframe
                    width="280"
                    height="157"
                    src="https://www.youtube.com/embed/lTRiuFIWV54?autoplay=1"
                    title="Lofi Girl"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="rounded-lg shadow-md"
                  />
                </div>
              )}
            </div>
            )}

            {/* Drawer 3: Sala de Estudos */}
            {config?.enableMultiplayer !== false && activeMasterMenu === 'room' && roomId && (
              <div
                className="mt-3.5 p-3.5 rounded-2xl border text-left transition-all animate-in fade-in slide-in-from-top-1 duration-150"
                style={{ backgroundColor: T.surfaceAlt, borderColor: T.border }}
              >
                <div className="flex items-center justify-between pb-2 mb-2.5 border-b" style={{ borderColor: T.border }}>
                  <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider" style={{ color: T.ink }}>
                    <Users className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Estudando Juntos ({members && members.length > 0 ? members.length : 1})</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveMasterMenu(null)}
                    className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="flex flex-wrap gap-2 mb-3">
                  {(members && members.length > 0 ? members : [{ name: config?.petName || "Você", skin: config?.petSkin || "none", isHost }]).map((m, idx) => {
                    const skinImg = getPetSprite(m.skin, 'happy');
                    return (
                      <div
                        key={m.joinedAt || idx}
                        className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs border shadow-2xs"
                        style={{ backgroundColor: T.surface, borderColor: T.border, color: T.ink }}
                      >
                        <img src={skinImg} alt="" className="w-4 h-4 rounded-full object-cover" onError={(e) => { e.currentTarget.src = '/owl_happy.png'; }} />
                        <span className="font-medium truncate max-w-[110px]">{m.name || "Colega"}</span>
                        {m.isHost && <Crown className="w-3 h-3 text-amber-500 ml-0.5" />}
                      </div>
                    );
                  })}
                </div>

                <div className="flex items-center gap-2 pt-2 border-t" style={{ borderColor: T.border }}>
                  <button
                    type="button"
                    onClick={handleCopyCode}
                    className="flex-1 py-1.5 px-2.5 rounded-lg text-xs font-medium border flex items-center justify-center gap-1.5 transition-all cursor-pointer opacity-90 hover:opacity-100"
                    style={{ backgroundColor: T.surface, borderColor: T.border, color: T.ink }}
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>{copiedType === 'code' ? 'Copiado!' : 'Copiar Código'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleCopyLink}
                    className="flex-1 py-1.5 px-2.5 rounded-lg text-xs font-medium border flex items-center justify-center gap-1.5 transition-all cursor-pointer opacity-90 hover:opacity-100"
                    style={{ backgroundColor: T.surface, borderColor: T.border, color: T.ink }}
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    <span>{copiedType === 'link' ? 'Link Copiado!' : 'Copiar Link'}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
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
                  <span className="flex items-center gap-1" style={{ color: totalHoje >= metaHoje ? T.brand : T.ink }}>
                    {totalHoje}/{metaHoje} min
                    {totalHoje >= metaHoje && <CheckCircle2 size={13} className="text-emerald-400" />}
                  </span>
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
        <div data-tour="foco-presets" className="flex flex-wrap gap-2 mb-3">
          {PRESETS.map((p, i) => (
            <button key={p.label} data-preset={p.label} onClick={() => { setUseCustom(false); setPresetIdx(i); }} className="px-3 py-1.5 rounded-md text-sm cursor-pointer transition-all active:scale-95"
              style={{ backgroundColor: !useCustom && presetIdx === i ? T.brand : T.surfaceAlt, color: !useCustom && presetIdx === i ? T.brandInk : T.ink, border: `1px solid ${T.border}` }}>
              {p.label}
            </button>
          ))}
          <button onClick={() => setUseCustom(true)} className="px-3 py-1.5 rounded-md text-sm flex items-center gap-1 cursor-pointer transition-all active:scale-95"
            style={{ backgroundColor: useCustom ? T.brand : T.surfaceAlt, color: useCustom ? T.brandInk : T.ink, border: `1px solid ${T.border}` }}>
            Personalizado
          </button>
          {useCustom && (
            <input type="number" min={5} value={customMin} onChange={(e) => setCustomMin(Number(e.target.value) || 5)} className="w-16 rounded-md p-1.5 text-sm text-center" style={{ backgroundColor: T.surfaceAlt, border: `1px solid ${T.border}` }} />
          )}
        </div>
        {roomId && !isHost ? (
          <div className="text-center py-2.5 px-3 rounded-lg text-xs font-medium border" style={{ backgroundColor: TINT.brand, borderColor: T.border, color: T.brand }}>
            Aguardando o Anfitrião iniciar a sessão para a sala #{roomId}...
          </div>
        ) : (
          <PrimaryButton data-tour="foco-start" onClick={iniciar} className="w-full">
            <Play className="w-4 h-4" /> {roomId ? "Iniciar foco para toda a sala" : "Iniciar sessão de foco"}
          </PrimaryButton>
        )}
      </Card>

      {(config?.enablePet !== false || config?.enableBreathing !== false || config?.enableMultiplayer !== false || config?.enableBossFight !== false) && (
        <div className="space-y-3">
          <div className="flex items-center justify-center gap-2 flex-wrap">
            {config?.enablePet !== false && (
              <button
                type="button"
                data-tour="foco-pet"
                onClick={() => {
                  sfx.click();
                  setActivePrepAccessory(prev => prev === 'pet' ? null : 'pet');
                }}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                  activePrepAccessory === 'pet' ? 'shadow-sm scale-[1.02]' : 'opacity-80 hover:opacity-100 hover:scale-[1.01]'
                }`}
                style={{
                  backgroundColor: activePrepAccessory === 'pet' ? T.brand : T.surfaceAlt,
                  color: activePrepAccessory === 'pet' ? T.brandInk : T.ink,
                  border: `1px solid ${activePrepAccessory === 'pet' ? T.brand : T.border}`,
                }}
                title="Personalizar mascote de estudo"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Mascote ({config?.petName || "Pet"})</span>
                {activePrepAccessory === 'pet' ? <ChevronUp className="w-3 h-3 opacity-80" /> : <ChevronDown className="w-3 h-3 opacity-60" />}
              </button>
            )}

            {config?.enableBreathing !== false && (
              <button
                type="button"
                data-tour="foco-breathing"
                onClick={() => {
                  sfx.pop();
                  setShowBreathing(true);
                }}
                className="px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer opacity-80 hover:opacity-100 hover:scale-[1.01]"
                style={{
                  backgroundColor: T.surfaceAlt,
                  color: T.ink,
                  border: `1px solid ${T.border}`,
                }}
                title="Exercício guiado de respiração 4x4"
              >
                <Wind className="w-3.5 h-3.5 text-sky-400" />
                <span>Exercício de Respiração</span>
              </button>
            )}

            {config?.enableMultiplayer !== false && (
              <button
                type="button"
                data-tour="foco-room"
                onClick={() => {
                  sfx.click();
                  setActivePrepAccessory(prev => prev === 'room' ? null : 'room');
                }}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                  activePrepAccessory === 'room' ? 'shadow-sm scale-[1.02]' : 'opacity-80 hover:opacity-100 hover:scale-[1.01]'
                }`}
                style={{
                  backgroundColor: activePrepAccessory === 'room' ? T.brand : T.surfaceAlt,
                  color: activePrepAccessory === 'room' ? T.brandInk : T.ink,
                  border: `1px solid ${activePrepAccessory === 'room' ? T.brand : T.border}`,
                }}
                title="Estudo em grupo ao vivo"
              >
                <Globe className="w-3.5 h-3.5 text-emerald-400" />
                <span>{roomId ? `Sala #${roomId}` : "Sala de Estudos"}</span>
                {activePrepAccessory === 'room' ? <ChevronUp className="w-3 h-3 opacity-80" /> : <ChevronDown className="w-3 h-3 opacity-60" />}
              </button>
            )}

            {config?.enableBossFight !== false && (
              <button
                type="button"
                data-tour="foco-boss"
                onClick={() => {
                  sfx.click();
                  setActivePrepAccessory(prev => prev === 'boss' ? null : 'boss');
                }}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                  activePrepAccessory === 'boss' ? 'shadow-sm scale-[1.02]' : 'opacity-80 hover:opacity-100 hover:scale-[1.01]'
                }`}
                style={{
                  backgroundColor: activePrepAccessory === 'boss' ? T.brand : T.surfaceAlt,
                  color: activePrepAccessory === 'boss' ? T.brandInk : T.ink,
                  border: `1px solid ${activePrepAccessory === 'boss' ? T.brand : T.border}`,
                }}
                title="Desafiar Chefe de Foco RPG"
              >
                <Swords className="w-3.5 h-3.5 text-rose-500" />
                <span>{bossFightActive ? `Chefe (${selectedBoss.name.split(' ')[0]})` : "Batalha RPG"}</span>
                {activePrepAccessory === 'boss' ? <ChevronUp className="w-3 h-3 opacity-80" /> : <ChevronDown className="w-3 h-3 opacity-60" />}
              </button>
            )}
          </div>

          {/* Gaveta do Mascote */}
          {config?.enablePet !== false && activePrepAccessory === 'pet' && (
            <Card className="animate-in fade-in slide-in-from-top-1 duration-150">
              <div className="flex items-center justify-between pb-2 mb-2 border-b" style={{ borderColor: T.border }}>
                <SectionLabel className="mb-0 flex items-center gap-1.5">
                  <Sparkles size={16} className="text-amber-500" />
                  <span>Mascote de Foco & Companhia</span>
                </SectionLabel>
                <button
                  type="button"
                  onClick={() => setActivePrepAccessory(null)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer"
                  title="Fechar"
                  aria-label="Fechar"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
              <FocusPet timerOn={false} streak={streak} petName={config?.petName} onNameChange={(n) => updateConfig({...config, petName: n})} config={config} updateConfig={updateConfig} phase="idle" />
            </Card>
          )}

          {/* Gaveta da Sala Multiplayer */}
          {config?.enableMultiplayer !== false && activePrepAccessory === 'room' && (
            <Card className="animate-in fade-in slide-in-from-top-1 duration-150">
              <div className="flex items-center justify-between pb-2 mb-3 border-b" style={{ borderColor: T.border }}>
                <SectionLabel className="mb-0 flex items-center gap-1.5">
                  <Globe size={16} className="text-emerald-500" />
                  <span>Modo Multiplayer {roomId ? `(#${roomId})` : ""}</span>
                </SectionLabel>
                <button
                  type="button"
                  onClick={() => setActivePrepAccessory(null)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer"
                  title="Fechar"
                  aria-label="Fechar"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              {roomId ? (
                <div className="p-3.5 rounded-xl border flex flex-col gap-3" style={{ backgroundColor: T.surfaceAlt, borderColor: T.border }}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="relative flex h-2.5 w-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                      </span>
                      <div>
                        <div className="text-xs font-mono font-bold tracking-wider" style={{ color: T.ink }}>
                          SALA #{roomId}
                        </div>
                        <div className="text-[10px]" style={{ color: T.inkSoft }}>
                          {isHost ? "Você é o Anfitrião" : "Conectado como Convidado"}
                        </div>
                      </div>
                    </div>

                    <span
                      className="px-2 py-0.5 rounded text-[10px] font-semibold flex items-center gap-1"
                      style={{
                        backgroundColor: isHost ? (TINT.amber || TINT.brand) : TINT.brand,
                        color: isHost ? (T.amber || T.brand) : T.brand,
                        border: `1px solid ${T.border}`
                      }}
                    >
                      {isHost ? <Crown size={12} className="text-amber-500" /> : <Users size={12} />}
                      {isHost ? "Host" : "Convidado"}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <GhostButton
                      onClick={handleCopyCode}
                      className="text-xs py-2 flex items-center justify-center gap-1.5"
                    >
                      {copiedType === 'code' ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                      <span>{copiedType === 'code' ? "Copiado!" : "Copiar código"}</span>
                    </GhostButton>

                    <GhostButton
                      onClick={handleCopyLink}
                      className="text-xs py-2 flex items-center justify-center gap-1.5"
                    >
                      {copiedType === 'link' ? <Check size={14} className="text-emerald-500" /> : <Share2 size={14} />}
                      <span>{copiedType === 'link' ? "Copiado!" : "Copiar link"}</span>
                    </GhostButton>
                  </div>

                  <div className="border-t pt-2.5" style={{ borderColor: T.border }}>
                    <div className="text-[11px] font-semibold flex items-center justify-between mb-2" style={{ color: T.inkSoft }}>
                      <span className="flex items-center gap-1">
                        <Users size={13} /> Presentes na sala ({members && members.length > 0 ? members.length : 1})
                      </span>
                      <span className="text-[10px] opacity-70">Ao vivo</span>
                    </div>

                    <div className="flex flex-col gap-1.5 max-h-40 overflow-y-auto pr-1">
                      {(members && members.length > 0 ? members : [{ name: config?.petName || "Você", skin: config?.petSkin || "none", isHost }]).map((m, idx) => {
                        const skinImg = getPetSprite(m.skin, 'happy');
                        return (
                          <div
                            key={m.joinedAt || idx}
                            className="flex items-center justify-between px-2.5 py-1.5 rounded-lg border text-xs"
                            style={{ backgroundColor: T.surface, borderColor: T.border }}
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <img
                                src={skinImg}
                                alt=""
                                className="w-5 h-5 rounded-full object-cover border flex-shrink-0"
                                style={{ borderColor: T.border }}
                                onError={(e) => { e.currentTarget.src = '/owl_happy.png'; }}
                              />
                              <span className="font-medium truncate" style={{ color: T.ink }}>{m.name || "Colega"}</span>
                            </div>
                            <div className="flex items-center gap-1 flex-shrink-0">
                              {m.isHost && (
                                <span className="flex items-center gap-0.5 text-[10px] font-medium text-amber-500">
                                  <Crown size={11} /> Host
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <GhostButton
                    onClick={handleLeaveRoom}
                    className="w-full text-xs text-rose-500 hover:text-rose-600 border-rose-200 mt-1 flex items-center justify-center gap-1"
                  >
                    <LogOut size={13} /> Sair da Sala
                  </GhostButton>
                </div>
              ) : (
                <div className="flex flex-col gap-2.5">
                  <PrimaryButton onClick={handleCreateRoom} className="w-full text-xs py-2.5">
                    <Plus size={14} className="mr-1" /> Criar Sala de Estudos
                  </PrimaryButton>

                  <div className="relative flex py-1 items-center">
                    <div className="flex-grow border-t" style={{ borderColor: T.border }}></div>
                    <span className="flex-shrink mx-2 text-[10px] uppercase font-semibold" style={{ color: T.inkSoft }}>ou entrar em sala</span>
                    <div className="flex-grow border-t" style={{ borderColor: T.border }}></div>
                  </div>

                  <div className="flex gap-2">
                    <input
                      value={roomCode}
                      onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                      placeholder="CÓDIGO (EX: A9K2F)"
                      maxLength={8}
                      className="flex-1 rounded-lg p-2 text-xs font-mono font-semibold tracking-wider text-center uppercase"
                      style={{ backgroundColor: T.surfaceAlt, color: T.ink, border: `1px solid ${T.border}` }}
                      onKeyDown={(e) => { if (e.key === 'Enter') handleJoinRoom(); }}
                    />
                    <GhostButton
                      onClick={handleJoinRoom}
                      className="text-xs px-4"
                      disabled={!roomCode.trim()}
                    >
                      Entrar
                    </GhostButton>
                  </div>
                </div>
              )}
            </Card>
          )}

          {/* Gaveta da Batalha RPG (Boss Fight) */}
          {config?.enableBossFight !== false && activePrepAccessory === 'boss' && (
            <Card className="animate-in fade-in slide-in-from-top-1 duration-150">
              <div className="flex items-center justify-between pb-2 mb-3 border-b" style={{ borderColor: T.border }}>
                <SectionLabel className="mb-0 flex items-center gap-1.5">
                  <Swords size={16} className="text-rose-500" />
                  <span>Batalha RPG no Foco — Escolha seu Desafio</span>
                </SectionLabel>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => { sfx.click(); toggleBossMode(); }}
                    className="text-xs px-2.5 py-1 rounded-lg border font-medium cursor-pointer transition-colors flex items-center gap-1.5"
                    style={{
                      borderColor: bossFightActive ? T.brand : T.border,
                      backgroundColor: bossFightActive ? TINT.brand : T.surfaceAlt,
                      color: bossFightActive ? T.brand : T.inkSoft
                    }}
                  >
                    <Swords size={13} className={bossFightActive ? "text-blue-400" : "opacity-60"} />
                    <span>{bossFightActive ? "Modo Ativo" : "Desativado"}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActivePrepAccessory(null)}
                    className="p-1 rounded-lg text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                    title="Fechar"
                    aria-label="Fechar"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {BOSS_ROSTER.map((boss) => {
                  const isSelected = selectedBossId === boss.id;
                  return (
                    <button
                      key={boss.id}
                      type="button"
                      onClick={() => { sfx.pop(); selectBoss(boss.id); }}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer relative overflow-hidden ${
                        isSelected ? "shadow-sm scale-[1.01]" : "opacity-80 hover:opacity-100"
                      }`}
                      style={{
                        backgroundColor: isSelected ? TINT.brand : T.surfaceAlt,
                        borderColor: isSelected ? (boss.themeColor || T.brand) : T.border,
                      }}
                    >
                      <div className="flex items-start gap-2.5">
                        <div
                          className="w-12 h-12 rounded-xl shrink-0 flex items-center justify-center p-0.5 border overflow-hidden"
                          style={{ backgroundColor: `${boss.themeColor}15`, borderColor: `${boss.themeColor}33` }}
                        >
                          {boss.spriteIdle ? (
                            <img src={boss.spriteIdle} alt={boss.name} className="w-full h-full object-contain select-none" style={{ imageRendering: 'pixelated' }} />
                          ) : (
                            React.createElement(boss.icon || Swords, { size: 22, style: { color: boss.themeColor } })
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="text-xs font-bold truncate" style={{ color: T.ink }}>
                            {boss.name}
                          </div>
                          <div className="text-[11px] font-medium" style={{ color: boss.themeColor }}>
                            {boss.title} • {boss.maxHp} HP
                          </div>
                          <div className="text-[10px] mt-1 line-clamp-2" style={{ color: T.inkSoft }}>
                            {boss.desc}
                          </div>
                          <div className="text-[10px] mt-1.5 font-medium text-emerald-400 flex items-center gap-1">
                            <Target size={11} className="shrink-0" />
                            <span>{boss.weakness}</span>
                          </div>
                        </div>
                      </div>
                      {isSelected && (
                        <span className="absolute top-2 right-2 w-2 h-2 rounded-full" style={{ backgroundColor: boss.themeColor || T.brand }} />
                      )}
                    </button>
                  );
                })}
              </div>
            </Card>
          )}
        </div>
      )}

      {config?.enableBreathing !== false && showBreathing && <BreathingModal onClose={() => setShowBreathing(false)} T={props.T || T} />}

      <Card className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm" style={{ color: T.inkSoft }}><Clock className="w-4 h-4" /> Estudado hoje</div>
        <div className="text-sm font-semibold" style={{ color: T.brand }}>{totalHoje} min</div>
      </Card>
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/* Aba: Diário de Bordo                                                    */
/* ---------------------------------------------------------------------- */
export function DiarioTab({
  userId,
  notes = [],
  onSaveNote,
  onDeleteNote,
  config,
  updateConfig,
}) {
  const [mood, setMood] = useState(null);
  const [reflectionText, setReflectionText] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMoodFilter, setSelectedMoodFilter] = useState("all");
  const [copiedId, setCopiedId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  const MOODS = [
    { id: "Excelente", label: "Excelente", icon: Laugh, color: "#10b981", bg: "#10b98118", border: "#10b98144" },
    { id: "Bem", label: "Bem", icon: Smile, color: "#3b82f6", bg: "#3b82f618", border: "#3b82f644" },
    { id: "Neutro", label: "Neutro", icon: Meh, color: "#94a3b8", bg: "#94a3b818", border: "#94a3b844" },
    { id: "Cansado", label: "Cansado", icon: Frown, color: "#f59e0b", bg: "#f59e0b18", border: "#f59e0b44" },
    { id: "Exausto", label: "Exausto", icon: Skull, color: "#ef4444", bg: "#ef444418", border: "#ef444444" },
  ];

  const PROMPTS = [
    "Pelo que você é grato hoje?",
    "Qual foi a sua maior vitória ou aprendizado?",
    "O que drenou a sua energia e o que você aprendeu com isso?",
    "Como estão sua mente e seu corpo neste instante?",
    "O que você deseja priorizar amanhã?",
  ];

  const TAGS = [
    "#gratidão", "#vitória", "#desafio", "#aprendizado",
    "#foco", "#desabafo", "#energia", "#descanso"
  ];

  function formatDiarioDate(isoString) {
    if (!isoString) return "Sem data";
    try {
      const d = new Date(isoString);
      if (isNaN(d.getTime())) return isoString;
      return d.toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return isoString;
    }
  }

  // Filtra as anotações exclusivas do Diário de Bordo
  const diarioNotes = (notes || [])
    .filter((n) => {
      const d = (n.disciplina || "").toLowerCase();
      return d === "diário de bordo" || d === "diario de bordo" || d === "diário" || d === "diario";
    })
    .map((n) => {
      const rawText = n.texto || "";
      const match = rawText.match(/^Humor:\s*([^\n\r]+)/i);
      const parsedMoodId = match ? match[1].trim() : null;
      const cleanContent = rawText.replace(/^Humor:\s*[^\n\r]+\n*/i, "").trim();
      const moodMeta = MOODS.find((m) => m.id.toLowerCase() === (parsedMoodId || "").toLowerCase()) || {
        id: parsedMoodId || "Neutro",
        label: parsedMoodId || "Neutro",
        icon: Smile,
        color: "#94a3b8",
        bg: "#94a3b818",
        border: "#94a3b844",
      };
      return {
        id: n.id,
        created_at: n.created_at,
        disciplina: n.disciplina,
        moodId: moodMeta.id,
        moodMeta,
        content: cleanContent || rawText,
        rawText,
      };
    })
    .sort((a, b) => (b.created_at || "").localeCompare(a.created_at || ""));

  const hojeDateStr = todayISO().slice(0, 10);
  const hasJournalToday = diarioNotes.some((n) => n.created_at && n.created_at.startsWith(hojeDateStr));

  // Humor predominante nos últimos 7 dias
  const ultimosSeteDias = diarioNotes.filter((n) => {
    if (!n.created_at) return false;
    const diff = Math.abs(new Date() - new Date(n.created_at)) / (1000 * 60 * 60 * 24);
    return diff <= 7;
  });
  const moodCounts = {};
  ultimosSeteDias.forEach((n) => {
    moodCounts[n.moodId] = (moodCounts[n.moodId] || 0) + 1;
  });
  let predominantMood = null;
  let maxCount = 0;
  Object.entries(moodCounts).forEach(([mId, count]) => {
    if (count > maxCount) {
      maxCount = count;
      predominantMood = MOODS.find((m) => m.id === mId) || null;
    }
  });

  // Salvar novo registro
  async function handleSave() {
    if (!mood) {
      alert("Por favor, selecione como você está se sentindo hoje!");
      return;
    }
    if (!reflectionText.trim()) {
      alert("Escreva uma breve reflexão ou pensamento antes de salvar.");
      return;
    }
    setSaving(true);
    try {
      const finalTexto = `Humor: ${mood}\n\n${reflectionText.trim()}`;
      if (onSaveNote) {
        await onSaveNote({ disciplina: "Diário de Bordo", texto: finalTexto });
      }
      sfx.complete();
      if (config?.enableConfetti !== false) {
        confetti({
          particleCount: 80,
          spread: 60,
          origin: { y: 0.6 },
          colors: ['#3b82f6', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6'],
          zIndex: 9999
        });
      }
      setMood(null);
      setReflectionText("");
    } catch (err) {
      console.error(err);
      alert("Erro ao salvar no diário. Tente novamente.");
    } finally {
      setSaving(false);
    }
  }

  // Copiar reflexão
  function handleCopy(entry) {
    const textToCopy = `[Diário de Bordo - ${formatDiarioDate(entry.created_at)} | Humor: ${entry.moodMeta.label}]\n\n${entry.content}`;
    navigator.clipboard.writeText(textToCopy);
    setCopiedId(entry.id);
    sfx.pop();
    setTimeout(() => setCopiedId(null), 2000);
  }

  // Deletar reflexão
  async function handleDelete(id) {
    if (onDeleteNote) {
      await onDeleteNote(id);
      sfx.trash();
      setDeleteConfirmId(null);
    }
  }

  // Exportar Diário para Markdown
  function handleExportMarkdown() {
    if (diarioNotes.length === 0) {
      alert("Não há registros no Diário para exportar.");
      return;
    }
    let md = `# Diário de Bordo - Omnia\n\n`;
    md += `*Exportado em: ${new Date().toLocaleDateString("pt-BR")} às ${new Date().toLocaleTimeString("pt-BR")}*\n`;
    md += `*Total de reflexões registradas: ${diarioNotes.length}*\n\n`;
    md += `---\n\n`;

    diarioNotes.forEach((entry) => {
      const dataStr = formatDiarioDate(entry.created_at);
      md += `## ${dataStr} — Humor: ${entry.moodMeta.label}\n\n`;
      md += `${entry.content}\n\n`;
      md += `---\n\n`;
    });

    const blob = new Blob([md], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `diario_de_bordo_omnia_${todayISO().slice(0, 10)}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    sfx.complete();
  }

  function handleAddTag(tag) {
    sfx.pop();
    setReflectionText((prev) => (prev ? `${prev.trim()} ${tag} ` : `${tag} `));
  }

  function handleApplyPrompt(promptText) {
    sfx.pop();
    setReflectionText((prev) => (prev ? `${prev.trim()}\n\n*${promptText}*\n` : `*${promptText}*\n`));
  }

  // Filtragem da lista
  const filteredNotes = diarioNotes.filter((entry) => {
    if (selectedMoodFilter !== "all" && entry.moodId.toLowerCase() !== selectedMoodFilter.toLowerCase()) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const inContent = entry.content.toLowerCase().includes(q);
      const inMood = entry.moodMeta.label.toLowerCase().includes(q);
      const inDate = (entry.created_at || "").toLowerCase().includes(q);
      if (!inContent && !inMood && !inDate) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto pt-2">
      {/* Top Banner / Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl border" style={{ backgroundColor: T.surfaceAlt, borderColor: T.border }}>
        <div className="flex items-start sm:items-center gap-3">
          <div className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 shadow-sm" style={{ backgroundColor: T.brand + '22', color: T.brand }}>
            <BookHeart className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight" style={{ color: T.ink }}>Diário de Bordo</h1>
            <p className="text-xs sm:text-sm mt-0.5" style={{ color: T.inkSoft }}>
              Seu refúgio reservado para saúde mental, humor e reflexões diárias — isolado das matérias de estudo.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleExportMarkdown}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all border hover:opacity-80"
            style={{ backgroundColor: T.bg, borderColor: T.border, color: T.ink }}
            title="Baixar todas as reflexões em arquivo .md"
          >
            <Download className="w-4 h-4" />
            <span>Exportar (.md)</span>
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Card className="flex items-center gap-3 p-4">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: hasJournalToday ? '#10b98122' : '#f59e0b22', color: hasJournalToday ? '#10b981' : '#f59e0b' }}>
            {hasJournalToday ? <CheckCircle2 className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
          </div>
          <div>
            <div className="text-xs font-medium" style={{ color: T.inkSoft }}>Status de Hoje</div>
            <div className="text-sm font-bold" style={{ color: T.ink }}>
              {hasJournalToday ? "Check-in realizado" : "Check-in pendente"}
            </div>
          </div>
        </Card>

        <Card className="flex items-center gap-3 p-4">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: T.brand + '22', color: T.brand }}>
            <BookHeart className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-medium" style={{ color: T.inkSoft }}>Total de Registros</div>
            <div className="text-sm font-bold" style={{ color: T.ink }}>
              {diarioNotes.length} {diarioNotes.length === 1 ? "reflexão" : "reflexões"}
            </div>
          </div>
        </Card>

        <Card className="flex items-center gap-3 p-4">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: (predominantMood?.color || T.inkSoft) + '22', color: predominantMood?.color || T.inkSoft }}>
            {predominantMood ? (
              <predominantMood.icon className="w-5 h-5" />
            ) : (
              <Sparkles className="w-5 h-5" />
            )}
          </div>
          <div>
            <div className="text-xs font-medium" style={{ color: T.inkSoft }}>Humor Recente (7 dias)</div>
            <div className="text-sm font-bold" style={{ color: T.ink }}>
              {predominantMood ? predominantMood.label : "Em monitoramento"}
            </div>
          </div>
        </Card>
      </div>

      {/* Main Grid: Novo Registro + Linha do Tempo */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Formulário de Registro (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <Card className="p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4" style={{ color: T.brand }} />
                <h2 className="text-base font-bold" style={{ color: T.ink }}>Check-in de Hoje</h2>
              </div>
              {hasJournalToday && (
                <span className="text-[11px] px-2 py-0.5 rounded-full font-medium" style={{ backgroundColor: '#10b98122', color: '#10b981' }}>
                  Hoje concluído
                </span>
              )}
            </div>

            {/* Mood selector */}
            <div className="mb-4">
              <label className="block text-xs font-semibold mb-2" style={{ color: T.inkSoft }}>
                Como você está se sentindo agora?
              </label>
              <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
                {MOODS.map((m) => {
                  const IconCmp = m.icon;
                  const isSelected = mood === m.id;
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => { sfx.pop(); setMood(m.id); }}
                      className="flex flex-col items-center justify-center py-2.5 px-1 rounded-xl text-[11px] font-semibold transition-all border text-center"
                      style={{
                        backgroundColor: isSelected ? m.bg : T.bg,
                        borderColor: isSelected ? m.color : T.border,
                        color: isSelected ? m.color : T.inkSoft,
                        boxShadow: isSelected ? `0 0 10px ${m.color}33` : "none",
                      }}
                    >
                      <IconCmp className="w-5 h-5 mb-1" style={{ color: m.color }} />
                      <span className="truncate w-full">{m.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Inspiração / Perguntas-guia */}
            <div className="mb-3">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-semibold" style={{ color: T.inkSoft }}>Perguntas de apoio</span>
              </div>
              <div className="flex gap-1.5 overflow-x-auto custom-scrollbar pb-2 text-xs">
                {PROMPTS.map((p, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleApplyPrompt(p)}
                    className="px-2.5 py-1 rounded-lg shrink-0 text-[11px] transition-opacity hover:opacity-80 border"
                    style={{ backgroundColor: T.bg, borderColor: T.border, color: T.inkSoft }}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            {/* Textarea */}
            <div className="mb-3">
              <textarea
                value={reflectionText}
                onChange={(e) => setReflectionText(e.target.value)}
                placeholder="Escreva livremente sobre o seu dia, aprendizados, conquistas ou o que estiver passando pela sua cabeça..."
                rows={5}
                className="w-full p-3 rounded-xl text-sm outline-none resize-none transition-colors border"
                style={{
                  backgroundColor: T.bg,
                  borderColor: T.border,
                  color: T.ink,
                }}
              />
              <div className="flex items-center justify-between mt-1 text-[11px]" style={{ color: T.inkSoft }}>
                <span>{reflectionText.length} caracteres</span>
                <span>Visível apenas para você</span>
              </div>
            </div>

            {/* Quick tags */}
            <div className="mb-4">
              <span className="text-[11px] font-medium block mb-1.5" style={{ color: T.inkSoft }}>Tags rápidas</span>
              <div className="flex flex-wrap gap-1.5">
                {TAGS.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => handleAddTag(tag)}
                    className="px-2 py-0.5 rounded-md text-[11px] font-medium transition-all hover:opacity-80 border"
                    style={{ backgroundColor: T.bg, borderColor: T.border, color: T.brand }}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            {/* Submit button */}
            <PrimaryButton
              onClick={handleSave}
              disabled={saving}
              className="w-full flex items-center justify-center gap-2 py-2.5"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Salvando reflexão...</span>
                </>
              ) : (
                <>
                  <BookHeart className="w-4 h-4" />
                  <span>Salvar no Diário de Bordo</span>
                </>
              )}
            </PrimaryButton>
          </Card>
        </div>

        {/* Linha do Tempo e Histórico (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <Card className="p-5">
            {/* Header + Search */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div>
                <h2 className="text-base font-bold" style={{ color: T.ink }}>Histórico & Linha do Tempo</h2>
                <p className="text-xs" style={{ color: T.inkSoft }}>Suas anotações pessoais guardadas em ordem cronológica</p>
              </div>
              <div className="relative w-full sm:w-56">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2" style={{ color: T.inkSoft }} />
                <input
                  type="text"
                  placeholder="Buscar no diário..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 rounded-xl text-xs outline-none border"
                  style={{ backgroundColor: T.bg, borderColor: T.border, color: T.ink }}
                />
              </div>
            </div>

            {/* Mood filter pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto custom-scrollbar pb-2 mb-4 text-xs">
              <button
                type="button"
                onClick={() => { sfx.pop(); setSelectedMoodFilter("all"); }}
                className="px-2.5 py-1 rounded-lg text-xs font-semibold shrink-0 transition-all border"
                style={{
                  backgroundColor: selectedMoodFilter === "all" ? T.brand + '22' : T.bg,
                  borderColor: selectedMoodFilter === "all" ? T.brand : T.border,
                  color: selectedMoodFilter === "all" ? T.brand : T.inkSoft,
                }}
              >
                Todos ({diarioNotes.length})
              </button>
              {MOODS.map((m) => {
                const count = diarioNotes.filter((n) => n.moodId.toLowerCase() === m.id.toLowerCase()).length;
                const isSelected = selectedMoodFilter.toLowerCase() === m.id.toLowerCase();
                const IconCmp = m.icon;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => { sfx.pop(); setSelectedMoodFilter(m.id); }}
                    className="px-2.5 py-1 rounded-lg text-xs font-medium shrink-0 transition-all border flex items-center gap-1"
                    style={{
                      backgroundColor: isSelected ? m.bg : T.bg,
                      borderColor: isSelected ? m.color : T.border,
                      color: isSelected ? m.color : T.inkSoft,
                    }}
                  >
                    <IconCmp className="w-3.5 h-3.5" style={{ color: m.color }} />
                    <span>{m.label} ({count})</span>
                  </button>
                );
              })}
            </div>

            {/* Entries list */}
            {filteredNotes.length === 0 ? (
              <div className="text-center py-12 px-4 rounded-xl border border-dashed" style={{ borderColor: T.border }}>
                <BookHeart className="w-10 h-10 mx-auto mb-3 opacity-40" style={{ color: T.brand }} />
                <h3 className="text-sm font-semibold mb-1" style={{ color: T.ink }}>
                  {searchQuery || selectedMoodFilter !== "all" ? "Nenhuma reflexão encontrada com estes filtros." : "Nenhuma reflexão registrada ainda."}
                </h3>
                <p className="text-xs max-w-sm mx-auto" style={{ color: T.inkSoft }}>
                  {searchQuery || selectedMoodFilter !== "all"
                    ? "Tente buscar por outro termo ou selecione 'Todos' para ver o histórico completo."
                    : "Faça seu primeiro check-in mental preenchendo o formulário ao lado!"}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredNotes.map((entry) => {
                  const MoodIcon = entry.moodMeta.icon;
                  const isDeleting = deleteConfirmId === entry.id;
                  const isCopied = copiedId === entry.id;

                  return (
                    <div
                      key={entry.id}
                      className="p-4 rounded-xl border transition-all"
                      style={{
                        backgroundColor: T.bg,
                        borderColor: T.border,
                      }}
                    >
                      {/* Entry Header */}
                      <div className="flex items-center justify-between gap-2 mb-2.5">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border"
                            style={{
                              backgroundColor: entry.moodMeta.bg,
                              borderColor: entry.moodMeta.border,
                              color: entry.moodMeta.color,
                            }}
                          >
                            <MoodIcon className="w-3.5 h-3.5" />
                            <span>{entry.moodMeta.label}</span>
                          </span>
                          <span className="text-xs font-medium" style={{ color: T.inkSoft }}>
                            {formatDiarioDate(entry.created_at)}
                          </span>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleCopy(entry)}
                            className="p-1.5 rounded-lg text-xs transition-colors hover:opacity-80"
                            style={{ color: isCopied ? '#10b981' : T.inkSoft }}
                            title="Copiar texto"
                          >
                            {isCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                          </button>

                          {isDeleting ? (
                            <div className="flex items-center gap-1 bg-red-500/10 p-1 rounded-lg border border-red-500/30">
                              <span className="text-[10px] text-red-400 font-bold px-1">Excluir?</span>
                              <button
                                type="button"
                                onClick={() => handleDelete(entry.id)}
                                className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-red-500 text-white hover:bg-red-600"
                              >
                                Sim
                              </button>
                              <button
                                type="button"
                                onClick={() => setDeleteConfirmId(null)}
                                className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-700 text-slate-200 hover:bg-slate-600"
                              >
                                Não
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setDeleteConfirmId(entry.id)}
                              className="p-1.5 rounded-lg text-xs transition-colors hover:text-red-500"
                              style={{ color: T.inkSoft }}
                              title="Excluir reflexão"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Entry Body */}
                      <p className="text-xs sm:text-sm whitespace-pre-wrap leading-relaxed" style={{ color: T.ink }}>
                        {entry.content}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/* Aba: Secretária (chat)                                                   */
/* ---------------------------------------------------------------------- */
export function SecretariaTab({ userId, routine, routineBlocks, routineExceptions, commitments, studyBlocks, notes, sessions, setRoutineBlocks, setRoutineExceptions, config, updateConfig }) {
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

    // Comando para esconder opções de desenvolvedor
    if (isHideDevCommand(question)) {
      setDevMode(false);
      sfx.complete();
      setMessages((prev) => [
        ...prev,
        { role: "user", text: question },
        {
          role: "assistant",
          text: `🔒 **OPÇÕES DE DESENVOLVEDOR OCULTADAS**\n\nO modo de desenvolvedor foi desativado com sucesso.\n- A Central de testes/QA e relatórios de diagnóstico foram ocultados da aba Configurações.\n- Todos os atalhos de depuração foram desarmados.\n\n*Para reexibir no futuro, você pode usar o comando \`/dev\` ou clicar 5 vezes no título da aba Configurações.*`
        }
      ]);
      setInput("");
      return;
    }

    // Comando para alternar / ativar modo desenvolvedor
    if (isToggleDevCommand(question)) {
      const next = !isDevModeActive();
      setDevMode(next);
      sfx.pop();
      setMessages((prev) => [
        ...prev,
        { role: "user", text: question },
        {
          role: "assistant",
          text: next
            ? `⚡ **MODO DESENVOLVEDOR ATIVADO**\n\nAs opções de desenvolvedor e o painel de QA agora estão visíveis na aba **Configurações > IA & Ferramentas**.\n\n*Para ocultar novamente a qualquer momento, digite \`/hide-dev\`.*`
            : `🔒 **MODO DESENVOLVEDOR OCULTADO**\n\nAs opções de desenvolvedor e diagnósticos foram ocultados com sucesso.`
        }
      ]);
      setInput("");
      return;
    }

    // Comando para iniciar o tutorial completo / abrir manual de assistência
    const lowerQ = question.toLowerCase().trim();
    if (
      lowerQ === "/tutorial" ||
      lowerQ === "/tour" ||
      lowerQ === "/guia" ||
      lowerQ === "/ajuda" ||
      lowerQ === "/manual" ||
      lowerQ === "tutorial" ||
      lowerQ === "tour" ||
      lowerQ === "ajuda" ||
      lowerQ === "como usar" ||
      lowerQ === "como funciona"
    ) {
      if (typeof window.startOmniaTutorial === "function") {
        window.startOmniaTutorial({ mode: 'tour' });
      }
      sfx.pop();
      setMessages((prev) => [
        ...prev,
        { role: "user", text: question },
        {
          role: "assistant",
          text: `🧭 **TUTORIAL COMPLETO INICIADO!**\n\nAbri o **Tour Interativo Guiado** na sua tela.\nEle percorrerá todas as 10 abas do Omnia, ensinando passo a passo como usar cada botão e funcionalidade.\n\n*Você também pode abrir o **Manual Completo** a qualquer momento clicando no botão "Manual" no cabeçalho do tutorial ou pela busca \`Ctrl+K\`.*`
        }
      ]);
      setInput("");
      return;
    }

    // Comando complexo escondido de desenvolvedor para testes rápidos
    if (isSecretDevCommand(question)) {
      executeGodModeCheat(config, updateConfig);
      setMessages((prev) => [
        ...prev,
        { role: "user", text: question },
        {
          role: "assistant",
          text: `⚡ **MODO DESENVOLVEDOR ATIVADO (GOD MODE)** ⚡\n\n\`\`\`text\n[OMNIA DEV CHEAT INJETADO COM SUCESSO]\n💰 Moedas de Estudo:  99.999 liberadas para a Loja!\n⭐ Experiência (XP):  100.000 XP concedidos (Nível Máximo Desbloqueado)!\n🔥 Ofensiva (Streak): 99 Dias consecutivos ativados!\n🐾 Mascotes de Foco:  Todos os 6 pets (Coruja, Gato, Shiba, Panda, Raposa, Coelho) liberados!\n🎓 Arquétipos:        Todas as classes de estudante desbloqueadas!\n\`\`\`\n*Ambiente 100% liberado para seus testes rápidos.*`
        }
      ]);
      setInput("");
      return;
    }

    // Comando de QA / Teste rápido
    if (question.toLowerCase() === "/qa" || question.toLowerCase() === "qa" || question.toLowerCase() === "teste") {
      setMessages((prev) => [
        ...prev,
        { role: "user", text: question },
        {
          role: "assistant",
          text: `🛡️ **CENTRAL DE QA & ANTI-BUG GUARDIAN** 🛡️\n\nO motor de testes contínuos e antibugs da aplicação está ativo e disponível na aba **Configurações**.\n\nEle audita automaticamente:\n- ✅ **CRUD de Compromissos**: Criação, edição e exclusão de compromissos.\n- ✅ **Inteligência Artificial**: Resumos, Quizzes, Flashcards e Avaliação Socrática.\n- ✅ **Secretaria IA**: Processamento de mensagens e ferramentas de rotina.\n- ✅ **Banco de Dados & Storage**: Supabase, WebSockets, LocalStorage e Cache Offline.\n- ✅ **Modais**: Integridade de renderização de todos os modais da aplicação.`
        }
      ]);
      setInput("");
      return;
    }

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

  const [scratch, setScratch] = useState(() => localStorage.getItem("omnia_scratch") || "");
    useEffect(() => { localStorage.setItem("omnia_scratch", scratch); }, [scratch]);

    return (
      <div className="flex flex-col lg:flex-row gap-4 h-[75vh]">
        <div className="flex flex-col flex-1 border rounded-xl p-4 shadow-sm" style={{ backgroundColor: T.surface, borderColor: T.border }}>
  
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
    
    {config?.enableScratchpad !== false && (
      <div className="flex flex-col w-full lg:w-1/3 border rounded-xl p-4 shadow-sm" style={{ backgroundColor: T.surfaceAlt, borderColor: T.border }}>
        <h3 className="font-bold mb-4 flex items-center gap-2" style={{ color: T.ink }}><Edit3 size={18} /> Lousa em Branco</h3>
        <textarea
          value={scratch}
          onChange={(e) => setScratch(e.target.value)}
          placeholder="Use este espaço para rascunhos rápidos ou anotações enquanto conversa com a IA..."
          className="flex-1 w-full bg-transparent border-none outline-none resize-none text-sm"
          style={{ color: T.inkSoft }}
        />
      </div>
    )}
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


  function RoutineTemplatesModal({ onClose, onAddBlock, T }) {
    const templates = [
      {
        id: "enem",
        name: "Vestibulando ENEM (Forte)",
        icon: GraduationCap,
        desc: "Foco intenso de manhã e tarde. Simulados no fim de semana.",
        blocks: [
          { id: "1", diaSemana: "Seg", horaInicio: "08:00", horaFim: "12:00", tipo: "estudo", titulo: "Matemática" },
          { id: "2", diaSemana: "Seg", horaInicio: "14:00", horaFim: "18:00", tipo: "estudo", titulo: "Natureza" },
          { id: "3", diaSemana: "Ter", horaInicio: "08:00", horaFim: "12:00", tipo: "estudo", titulo: "Humanas" },
          { id: "4", diaSemana: "Ter", horaInicio: "14:00", horaFim: "18:00", tipo: "estudo", titulo: "Linguagens" },
          { id: "5", diaSemana: "Qua", horaInicio: "08:00", horaFim: "12:00", tipo: "estudo", titulo: "Redação" },
          { id: "6", diaSemana: "Sab", horaInicio: "13:00", horaFim: "18:00", tipo: "estudo", titulo: "Simulado" }
        ]
      },
      {
        id: "trabalho",
        name: "Trabalho + Estudo Noturno",
        icon: Briefcase,
        desc: "Trabalho durante o dia, estudos concentrados à noite.",
        blocks: [
          { id: "1", diaSemana: "Seg", horaInicio: "19:30", horaFim: "22:30", tipo: "estudo", titulo: "Revisão Diária" },
          { id: "2", diaSemana: "Ter", horaInicio: "19:30", horaFim: "22:30", tipo: "estudo", titulo: "Leitura" },
          { id: "3", diaSemana: "Qua", horaInicio: "19:30", horaFim: "22:30", tipo: "estudo", titulo: "Exercícios" },
          { id: "4", diaSemana: "Qui", horaInicio: "19:30", horaFim: "22:30", tipo: "estudo", titulo: "Revisão Diária" },
          { id: "5", diaSemana: "Sab", horaInicio: "09:00", horaFim: "13:00", tipo: "estudo", titulo: "Aprofundamento" },
          { id: "w1", diaSemana: "Seg", horaInicio: "09:00", horaFim: "18:00", tipo: "trabalho", titulo: "Trabalho" },
          { id: "w2", diaSemana: "Ter", horaInicio: "09:00", horaFim: "18:00", tipo: "trabalho", titulo: "Trabalho" },
          { id: "w3", diaSemana: "Qua", horaInicio: "09:00", horaFim: "18:00", tipo: "trabalho", titulo: "Trabalho" },
          { id: "w4", diaSemana: "Qui", horaInicio: "09:00", horaFim: "18:00", tipo: "trabalho", titulo: "Trabalho" },
          { id: "w5", diaSemana: "Sex", horaInicio: "09:00", horaFim: "18:00", tipo: "trabalho", titulo: "Trabalho" }
        ]
      },
      {
        id: "concurso",
        name: "Concurseiro Policial",
        icon: Target,
        desc: "Direito, Português, RLM e treino físico (TAF) intercalado.",
        blocks: [
          { id: "1", diaSemana: "Seg", horaInicio: "08:00", horaFim: "11:00", tipo: "estudo", titulo: "Direito Penal" },
          { id: "2", diaSemana: "Seg", horaInicio: "14:00", horaFim: "16:00", tipo: "estudo", titulo: "Português" },
          { id: "3", diaSemana: "Seg", horaInicio: "17:00", horaFim: "18:30", tipo: "exercicio", titulo: "TAF" },
          { id: "4", diaSemana: "Ter", horaInicio: "08:00", horaFim: "11:00", tipo: "estudo", titulo: "Constitucional" },
          { id: "5", diaSemana: "Ter", horaInicio: "17:00", horaFim: "18:30", tipo: "exercicio", titulo: "TAF" }
        ]
      }
    ];

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pt-10" style={{ backgroundColor: "rgba(0,0,0,0.6)", backdropFilter: "blur(5px)" }} onClick={onClose}>
        <div className="w-full max-w-lg rounded-2xl shadow-xl p-6" style={{ backgroundColor: T.surface, border: `1px solid ${T.border}` }} onClick={e => e.stopPropagation()}>
          <h2 className="text-xl font-bold mb-2" style={{ color: T.ink }}>Templates da Comunidade</h2>
          <p className="text-sm mb-6" style={{ color: T.inkSoft }}>Baixe uma rotina pré-configurada para substituir a sua atual.</p>
          
          <div className="flex flex-col gap-3">
            {templates.map(t => (
              <button key={t.id} onClick={() => {
                if (window.confirm("Isso vai apagar seus blocos de rotina atuais. Tem certeza?")) {
                  // Apagar os antigos (simulação, ou chamar delete pra cada, mas pra simplificar vamos adicionar novos)
                  // Como não temos a função exata de limpar tudo aqui dentro, vamos apenas alertar no MVP, ou chamar o backend.
                  // Wait, setRoutineBlocks só atualiza estado local se não for o DB hook. 
                  // In RotinaTab, we don't have setRoutineBlocks prop! We only have onAddBlock.
                  // We can just call onAddBlock for each one!
                  if (onAddBlock) {
                    t.blocks.forEach(b => onAddBlock(b));
                    alert(t.name + " adicionada! Verifique seu calendário.");
                    onClose();
                  } else {
                    alert("Função onAddBlock não encontrada.");
                  }
                }
              }} className="p-4 rounded-xl text-left transition-all hover:scale-[1.02] border" style={{ backgroundColor: T.surfaceAlt, borderColor: T.border }}>
                <div className="font-bold text-lg mb-1 flex items-center gap-2" style={{ color: T.ink }}>
                  {t.icon && <t.icon className="w-5 h-5 text-blue-400" />}
                  <span>{t.name}</span>
                </div>
                <div className="text-sm" style={{ color: T.inkSoft }}>{t.desc}</div>
              </button>
            ))}
          </div>
          <div className="mt-6 flex justify-end">
            <GhostButton onClick={onClose}>Cancelar</GhostButton>
          </div>
        </div>
      </div>
    );
  }


export function RotinaTab({ config, routine, routineBlocks, routineExceptions, onUpdateRoutine, onAddBlock, onUpdateBlock, onDeleteBlock, onDeleteException }) {
const [exporting, setExporting] = useState(false);
const [showTemplates, setShowTemplates] = useState(false);
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
      {showTemplates && <RoutineTemplatesModal onClose={() => setShowTemplates(false)} onAddBlock={onAddBlock} T={T} />}
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
<div className="flex flex-wrap items-center gap-2">
          <GhostButton onClick={() => setShowTemplates(true)} style={{ color: T.brand }}><Globe className="w-3.5 h-3.5 mr-1" /> Explorar Templates</GhostButton>
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
                         className="absolute left-1 right-1 rounded p-1.5 text-left transition-transform hover:scale-[1.01] origin-left overflow-hidden"
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




// Dev QA & Anti-Bug Guardian System
function QAAutomatedSystem({ userId }) {
  const [report, setReport] = useState(() => {
    try {
      const saved = localStorage.getItem("omnia_last_qa_report");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [history, setHistory] = useState(() => {
    try {
      const h = localStorage.getItem("omnia_qa_reports_history");
      return h ? JSON.parse(h) : [];
    } catch {
      return [];
    }
  });

  const [running, setRunning] = useState(false);
  const [runningType, setRunningType] = useState(null); // 'fast' | 'tour'
  const [progress, setProgress] = useState({ percent: 0, current: 0, total: 12, currentTest: "", status: "idle" });
  const [filter, setFilter] = useState("all"); // 'all' | 'fail' | 'pass'
  const [showHistory, setShowHistory] = useState(false);
  const [expandedTest, setExpandedTest] = useState(null);

  useEffect(() => {
    const handler = (e) => {
      if (e.detail) {
        setReport(e.detail);
        try {
          const h = localStorage.getItem("omnia_qa_reports_history");
          if (h) setHistory(JSON.parse(h));
        } catch {}
      }
    };
    window.addEventListener("omnia:qa-report-updated", handler);
    return () => window.removeEventListener("omnia:qa-report-updated", handler);
  }, []);

  const handleRunFast = async () => {
    if (running) return;
    setRunning(true);
    setRunningType("fast");
    sfx.click();
    try {
      const rep = await runFullQASuite({
        userId,
        mode: "fast",
        onProgress: (p) => setProgress(p),
      });
      setReport(rep);
      if (rep.failed === 0) sfx.levelUp();
    } catch (err) {
      console.error("Erro na execução do QA:", err);
    } finally {
      setRunning(false);
      setRunningType(null);
    }
  };

  const handleRunTour = async () => {
    if (running) return;
    setRunning(true);
    setRunningType("tour");
    sfx.click();
    try {
      const rep = await runQATour({
        userId,
        onProgress: (msg) => {
          setProgress((prev) => ({ ...prev, currentTest: msg }));
        },
      });
      if (rep) setReport(rep);
    } catch (err) {
      console.error("Erro no QA Tour:", err);
    } finally {
      setRunning(false);
      setRunningType(null);
    }
  };

  useEffect(() => {
    window.__omniaStartTour = handleRunTour;
    window.__omniaRunTour = handleRunTour;
    return () => {
      delete window.__omniaStartTour;
      delete window.__omniaRunTour;
    };
  }, []);

  const handleDownload = () => {
    sfx.click();
    downloadQAReportAsJSON(report);
  };

  const handleClear = () => {
    sfx.click();
    localStorage.removeItem("omnia_last_qa_report");
    localStorage.removeItem("omnia_qa_reports_history");
    setReport(null);
    setHistory([]);
  };

  const filteredResults = useMemo(() => {
    if (!report?.results) return [];
    if (filter === "fail") return report.results.filter((r) => r.status === "FAIL");
    if (filter === "pass") return report.results.filter((r) => r.status === "PASS");
    return report.results;
  }, [report, filter]);

  const healthy = report && report.failed === 0;
  const defective = report && report.failed > 0;

  return (
    <section
      id="omnia-qa-panel"
      className="p-5 sm:p-7 rounded-3xl shadow-md border mt-8 transition-all"
      style={{ backgroundColor: T.surface, borderColor: defective ? "#ef4444" : T.border }}
    >
      {/* Cabeçalho do Painel QA */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2.5 mb-1.5 flex-wrap">
            <span
              className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full border flex items-center gap-1.5 shadow-sm"
              style={{
                backgroundColor: defective ? "rgba(239, 68, 68, 0.15)" : healthy ? "rgba(34, 197, 94, 0.15)" : TINT.brand,
                borderColor: defective ? "#ef4444" : healthy ? "#22c55e" : T.brand,
                color: defective ? "#ef4444" : healthy ? "#22c55e" : T.brand,
              }}
            >
              <Activity size={14} className={running ? "animate-spin" : ""} />
              {healthy
                ? "SISTEMA 100% OPERACIONAL"
                : defective
                ? `ALERTA: ${report.failed} FALHA(S) IDENTIFICADA(S)`
                : "CENTRAL DE AUTOTESTE & ANTIBUGS"}
            </span>

            {report && (
              <span className="text-xs text-gray-400 font-mono">
                Última auditoria: {new Date(report.timestamp).toLocaleTimeString()} ({report.durationMs}ms)
              </span>
            )}
          </div>

          <h3 className="text-2xl font-black tracking-tight" style={{ color: T.ink }}>
            Omnia Anti-Bug Guardian
          </h3>
          <p className="text-xs sm:text-sm mt-1 max-w-2xl leading-relaxed" style={{ color: T.inkSoft }}>
            Motor contínuo de autoteste E2E da aplicação. Audita programaticamente o ciclo de vida de compromissos,
            banco de dados, cache offline, chamadas de IA (resumos, quizzes, flashcards, professor), secretaria e modais vitais.
          </p>
        </div>

        {/* Botões de Ação Principal */}
        <div className="flex items-center gap-2.5 flex-wrap w-full md:w-auto">
          <button
            onClick={handleRunFast}
            disabled={running}
            className="flex-1 md:flex-none px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-transform active:scale-95 shadow-sm hover:opacity-95 text-white disabled:opacity-50"
            style={{ backgroundColor: T.brand, color: T.brandInk }}
            title="Executa bateria programática rápida de todos os testes em background"
          >
            {running && runningType === "fast" ? (
              <>
                <Loader2 size={16} className="animate-spin" /> Testando...
              </>
            ) : (
              <>
                <Play size={16} /> Diagnóstico Anti-Bug
              </>
            )}
          </button>

          <button
            onClick={handleRunTour}
            disabled={running}
            className="flex-1 md:flex-none px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm border flex items-center justify-center gap-2 transition-transform active:scale-95 hover:opacity-90 disabled:opacity-50"
            style={{ backgroundColor: T.surfaceAlt, borderColor: T.border, color: T.ink }}
            title="Executa robô visual que navega pelas abas e abre modais na tela"
          >
            {running && runningType === "tour" ? (
              <>
                <Loader2 size={16} className="animate-spin" /> No Tour...
              </>
            ) : (
              <>
                <Activity size={16} className="text-blue-400" /> Tour Visual E2E
              </>
            )}
          </button>

          {report && (
            <button
              onClick={handleDownload}
              className="p-2.5 rounded-xl border flex items-center justify-center transition-colors hover:opacity-90"
              style={{ backgroundColor: T.surfaceAlt, borderColor: T.border, color: T.ink }}
              title="Baixar Relatório de Diagnóstico (JSON)"
            >
              <Download size={16} />
            </button>
          )}

          {report && (
            <button
              onClick={handleClear}
              className="p-2.5 rounded-xl border flex items-center justify-center transition-colors hover:opacity-90 text-rose-400"
              style={{ backgroundColor: T.surfaceAlt, borderColor: T.border }}
              title="Limpar Relatórios Anteriores"
            >
              <Trash2 size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Barra de Progresso Ativa */}
      {running && (
        <div className="mb-6 p-4 rounded-2xl border bg-black/40" style={{ borderColor: T.brand }}>
          <div className="flex items-center justify-between text-xs font-mono mb-2">
            <span className="flex items-center gap-2 text-blue-400 font-bold">
              <Loader2 size={13} className="animate-spin" />
              Executando: {progress.currentTest || "Varrendo subsistemas..."}
            </span>
            <span className="font-bold text-blue-400">
              {progress.current || 0}/{progress.total || 12} ({progress.percent || 0}%)
            </span>
          </div>
          <div className="w-full bg-gray-800 rounded-full h-2.5 overflow-hidden">
            <div
              className="h-2.5 rounded-full transition-all duration-300"
              style={{
                width: `${progress.percent || 5}%`,
                background: "linear-gradient(90deg, #3b82f6 0%, #22c55e 100%)",
              }}
            />
          </div>
        </div>
      )}

      {/* Cards de Métricas do Último Diagnóstico */}
      {report && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <div className="p-3.5 rounded-2xl border text-center" style={{ backgroundColor: T.surfaceAlt, borderColor: T.border }}>
            <div className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Total Auditado</div>
            <div className="text-2xl font-black mt-0.5" style={{ color: T.ink }}>{report.totalTests}</div>
            <div className="text-[10px] text-gray-400">testes automatizados</div>
          </div>

          <div className="p-3.5 rounded-2xl border text-center" style={{ backgroundColor: "rgba(34, 197, 94, 0.08)", borderColor: "rgba(34, 197, 94, 0.3)" }}>
            <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-500">Aprovados</div>
            <div className="text-2xl font-black mt-0.5 text-emerald-500">{report.passed}</div>
            <div className="text-[10px] text-emerald-400/80">100% conformes</div>
          </div>

          <div
            className="p-3.5 rounded-2xl border text-center"
            style={{
              backgroundColor: report.failed > 0 ? "rgba(239, 68, 68, 0.1)" : T.surfaceAlt,
              borderColor: report.failed > 0 ? "rgba(239, 68, 68, 0.4)" : T.border,
            }}
          >
            <div className="text-[11px] font-bold uppercase tracking-wider" style={{ color: report.failed > 0 ? "#ef4444" : T.inkSoft }}>
              Falhas
            </div>
            <div className="text-2xl font-black mt-0.5" style={{ color: report.failed > 0 ? "#ef4444" : T.ink }}>
              {report.failed}
            </div>
            <div className="text-[10px]" style={{ color: report.failed > 0 ? "#ef4444" : T.inkSoft }}>
              {report.failed > 0 ? "requer correção" : "zero bugs"}
            </div>
          </div>

          <div className="p-3.5 rounded-2xl border text-center" style={{ backgroundColor: T.surfaceAlt, borderColor: T.border }}>
            <div className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Tempo de Execução</div>
            <div className="text-2xl font-black mt-0.5" style={{ color: T.brand }}>
              {report.durationMs < 1000 ? `${report.durationMs}ms` : `${(report.durationMs / 1000).toFixed(1)}s`}
            </div>
            <div className="text-[10px] text-gray-400">tempo total</div>
          </div>
        </div>
      )}

      {/* Cheat Dev Card Integrado */}
      <div
        className="flex items-center justify-between p-4 rounded-2xl border mb-6"
        style={{ borderColor: "rgba(234, 179, 8, 0.3)", backgroundColor: "rgba(234, 179, 8, 0.08)" }}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-500 flex items-center justify-center shrink-0 border border-amber-500/30">
            <Sparkles size={20} />
          </div>
          <div>
            <div className="font-bold text-sm" style={{ color: T.ink }}>
              Dev Cheat: Liberar 99.999 Moedas, XP Máximo e Todos os Pets
            </div>
            <div className="text-xs mt-0.5 text-gray-400">
              Desbloqueia os 6 mascotes, todas as classes de arquétipos, 99 dias de streak e moedas ilimitadas para testes.
            </div>
          </div>
        </div>
        <PrimaryButton onClick={() => executeGodModeCheat(null, null)}>Ativar God Mode</PrimaryButton>
      </div>

      {/* Resultados dos Testes com Filtros */}
      {report && (
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-2 border-b pb-3" style={{ borderColor: T.border }}>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setFilter("all")}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${
                  filter === "all" ? "bg-blue-600 text-white" : "hover:bg-white/5 text-gray-400"
                }`}
              >
                Todos ({report.results.length})
              </button>
              <button
                onClick={() => setFilter("fail")}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${
                  filter === "fail" ? "bg-rose-600 text-white" : "hover:bg-white/5 text-gray-400"
                }`}
              >
                Falhas ({report.failed})
              </button>
              <button
                onClick={() => setFilter("pass")}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${
                  filter === "pass" ? "bg-emerald-600 text-white" : "hover:bg-white/5 text-gray-400"
                }`}
              >
                Aprovados ({report.passed})
              </button>
            </div>

            {history.length > 1 && (
              <button
                onClick={() => setShowHistory(!showHistory)}
                className="text-xs font-bold flex items-center gap-1 text-gray-400 hover:text-white"
              >
                <Clock size={13} /> Histórico ({history.length})
                {showHistory ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
              </button>
            )}
          </div>

          {/* Histórico Colapsável */}
          {showHistory && (
            <div className="p-3 rounded-xl border bg-black/30 space-y-2 mb-3 text-xs font-mono" style={{ borderColor: T.border }}>
              <div className="font-bold text-gray-400 uppercase text-[10px]">Últimas Execuções de QA:</div>
              {history.map((h, idx) => (
                <div key={h.id || idx} className="flex items-center justify-between py-1 border-b border-gray-800 last:border-none">
                  <span className="text-gray-400">{new Date(h.timestamp).toLocaleString()}</span>
                  <span className={h.failed === 0 ? "text-emerald-400 font-bold" : "text-rose-400 font-bold"}>
                    {h.failed === 0 ? `PASSOU (${h.passed}/${h.passed})` : `FALHOU (${h.failed} erros)`}
                  </span>
                  <span className="text-gray-500">{h.durationMs}ms</span>
                </div>
              ))}
            </div>
          )}

          {/* Lista de Testes Individuais */}
          <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
            {filteredResults.map((t, idx) => {
              const isFail = t.status === "FAIL";
              const isExpanded = expandedTest === idx;
              return (
                <div
                  key={idx}
                  className="p-3 rounded-xl border transition-all"
                  style={{
                    backgroundColor: isFail ? "rgba(239, 68, 68, 0.06)" : T.surfaceAlt,
                    borderColor: isFail ? "rgba(239, 68, 68, 0.3)" : T.border,
                  }}
                >
                  <div className="flex items-center justify-between gap-3 flex-wrap">
                    <div className="flex items-center gap-2.5 min-w-0">
                      {isFail ? (
                        <AlertCircle size={17} className="text-rose-500 shrink-0" />
                      ) : (
                        <CheckCircle size={17} className="text-emerald-500 shrink-0" />
                      )}
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span
                            className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border"
                            style={{
                              backgroundColor: isFail ? "rgba(239,68,68,0.15)" : "rgba(59,130,246,0.1)",
                              borderColor: isFail ? "rgba(239,68,68,0.3)" : "rgba(59,130,246,0.3)",
                              color: isFail ? "#ef4444" : "#60a5fa",
                            }}
                          >
                            {t.suite}
                          </span>
                          <span className="font-bold text-xs sm:text-sm" style={{ color: T.ink }}>
                            {t.name}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5 shrink-0 text-xs font-mono">
                      <span className="text-gray-400">{t.durationMs}ms</span>
                      <span
                        className="font-bold px-2 py-0.5 rounded text-[10px]"
                        style={{
                          backgroundColor: isFail ? "#ef4444" : "#22c55e",
                          color: "#ffffff",
                        }}
                      >
                        {t.status}
                      </span>
                      {isFail && (
                        <button
                          onClick={() => setExpandedTest(isExpanded ? null : idx)}
                          className="text-[11px] underline text-rose-400 hover:text-rose-300 ml-1"
                        >
                          {isExpanded ? "Ocultar" : "Ver Erro"}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Detalhes do Sucesso */}
                  {!isFail && t.details && (
                    <div className="text-[11px] text-gray-400 mt-1 pl-7 font-mono">
                      {t.details}
                    </div>
                  )}

                  {/* Caixa de Erro e Diagnóstico Anti-Bug */}
                  {isFail && (
                    <div className="mt-2.5 pl-7">
                      <div className="p-3 rounded-lg bg-black/60 border border-rose-500/30 text-rose-300 font-mono text-xs overflow-x-auto">
                        <div className="font-bold text-rose-400">Falha: {t.error?.message}</div>
                        {isExpanded && t.error?.stack && (
                          <pre className="mt-2 text-[10px] text-gray-400 whitespace-pre-wrap">
                            {t.error.stack}
                          </pre>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Estado Vazio Antes de Rodar */}
      {!report && !running && (
        <div className="py-8 text-center border rounded-2xl border-dashed" style={{ borderColor: T.border }}>
          <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-400 flex items-center justify-center mx-auto mb-3 border border-blue-500/20">
            <Activity size={24} />
          </div>
          <div className="font-bold text-base" style={{ color: T.ink }}>
            Nenhum diagnóstico executado nesta sessão
          </div>
          <p className="text-xs max-w-md mx-auto mt-1" style={{ color: T.inkSoft }}>
            Clique em <strong>"Diagnóstico Anti-Bug"</strong> para testar todas as APIs, banco de dados, IA e modais,
            ou inicie o <strong>"Tour Visual E2E"</strong> para acompanhar a varredura na tela.
          </p>
        </div>
      )}
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

export function generateMarkdownBackup(commitments, notes, summaries) {
  let md = "# Backup Omnia\n\nGerado em: " + new Date().toLocaleString() + "\n\n";
  const disciplinas = Array.from(new Set([...notes.map(n=>n.disciplina), ...commitments.map(c=>c.disciplina)])).filter(Boolean);
  
  disciplinas.forEach(d => {
    md += `## Disciplina: ${d}\n\n`;
    const cDisc = commitments.filter(c => c.disciplina === d);
    if(cDisc.length) {
      md += "### Compromissos\n";
      cDisc.forEach(c => md += `- [${c.concluido ? 'x' : ' '}] ${c.assunto} (Prazo: ${c.prazo||'N/A'})\n`);
      md += "\n";
    }
    const nDisc = notes.filter(n => n.disciplina === d);
    if(nDisc.length) {
      md += "### Anotações\n";
      nDisc.forEach(n => md += `> ${n.texto}\n\n`);
    }
    const sDisc = summaries.filter(s => s.disciplina === d && !s.commitmentId);
    if(sDisc.length) {
      md += "### Resumos\n";
      sDisc.forEach(s => md += `${s.markdown}\n\n`);
    }
    md += "---\n\n";
  });
  return md;
}

export function ConfigTab(props) {
  return React.createElement(ConfigErrorBoundary, null, React.createElement(ConfigTabInner, props));
}

function ConfigTabInner({ config = {}, updateConfig, userId, commitments, notes, summaries }) {
  const [devClicks, setDevClicks] = useState(0);
  const [isDev, setIsDev] = useState(() => isDevModeActive());
  const [bgmState, setBgmState] = useState(() => reactiveBgm.getState());

  useEffect(() => {
    const handleDevChange = (e) => setIsDev(Boolean(e.detail));
    window.addEventListener("omnia:dev-mode-changed", handleDevChange);
    return () => window.removeEventListener("omnia:dev-mode-changed", handleDevChange);
  }, []);

  useEffect(() => {
    return reactiveBgm.subscribe((s) => setBgmState({ ...s }));
  }, []);
  const safeConfig = {
    enableRoutine: true,
    enableHabits: true,
    enablePet: true,
    enableMusic: true,
    enableLofi: true,
    enableBgm: true,
    enableBreathing: true,
    enableMultiplayer: true,
    enableSpacedRepetition: true,
    enableStudyGoals: true,
    enableAnalytics: true,
    enableHealthBreak: true,
    enableScratchpad: true,
    enableSincereOwl: true,
    enableJournal: true,
    fontFamily: "Inter, sans-serif",
    enableConfetti: true,
    enablePdf: true,
    enableCalendar: true,
    enableGamification: true,
    enableSfx: true,
    enableAntiDistraction: true,
    enableBossFight: true,
    enableBiometricLock: false,
    enableMindMap: true,
    enableCommunityHub: true,
    showArchived: false,
    vacationMode: false,
    ...(config || {})
  };
  const handleToggle = (key) => {
    const nextVal = !safeConfig[key];
    if (key === 'enableMusic' || key === 'enableLofi') {
      updateConfig({ ...safeConfig, enableMusic: nextVal, enableLofi: nextVal });
      return;
    }
    if (key === 'enableBgm' && !nextVal) {
      if (reactiveBgm.getState().isPlaying) {
        reactiveBgm.stop();
      }
    }
    if (key === 'enableBiometricLock' && nextVal) {
      isBiometricsAvailable().then((avail) => {
        if (avail) {
          registerBiometrics("Estudante Omnia").catch(() => {});
        } else {
          const pin = prompt("Defina um PIN numérico de 4 a 6 dígitos para proteger seus dados:", "1234");
          if (pin && pin.trim()) {
            setSecurityPin(pin.trim());
          }
        }
      });
    }
    updateConfig({ ...safeConfig, [key]: nextVal });
  };
  const [activeCategory, setActiveCategory] = useState("aparencia");
  const [activeTheme, setActiveTheme] = useState(() => (typeof localStorage !== "undefined" ? localStorage.getItem("omnia-theme") || "aiko" : "aiko"));

  const selectTheme = (t) => {
    sfx.pop();
    setActiveTheme(t);
    applyTheme(t);
  };

  const ToggleRow = ({ icon: Icon, iconColor, title, desc, checked, onChange, disabled }) => (
    <div
      onClick={() => {
        if (!disabled) {
          sfx.click();
          onChange();
        }
      }}
      className="flex items-center justify-between p-3.5 rounded-xl border transition-all cursor-pointer hover:border-sky-500/30"
      style={{ backgroundColor: T.surfaceAlt, borderColor: T.border }}
    >
      <div className="flex items-center gap-3 min-w-0 pr-3">
        {Icon && (
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border border-white/5 bg-white/5"
            style={{ color: iconColor || T.brand }}
          >
            <Icon size={18} />
          </div>
        )}
        <div className="min-w-0">
          <div className="font-semibold text-sm truncate" style={{ color: T.ink }}>{title}</div>
          {desc && <div className="text-xs mt-0.5 line-clamp-1" style={{ color: T.inkSoft }}>{desc}</div>}
        </div>
      </div>
      <div
        className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors shrink-0 ${checked ? 'bg-sky-500' : 'bg-slate-700/60'}`}
        style={{ backgroundColor: checked ? T.brand : undefined }}
      >
        <div
          className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-200 ${checked ? 'translate-x-5' : 'translate-x-0'}`}
        />
      </div>
    </div>
  );

  return (
    <div className='max-w-4xl mx-auto space-y-6 pb-12'>
      {/* Header com easter egg de desenvolvedor */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-4" style={{ borderColor: T.border }}>
        <div>
          <h2
            onClick={() => {
              if (isDev) {
                setDevClicks(c => {
                  const next = c + 1;
                  if (next >= 3) {
                    setDevMode(false);
                    sfx.pop();
                    return 0;
                  }
                  return next;
                });
              } else {
                setDevClicks(c => {
                  const next = c + 1;
                  if (next >= 5) {
                    setDevMode(true);
                    sfx.pop();
                    return 0;
                  }
                  return next;
                });
              }
            }}
            className='text-2xl sm:text-3xl font-bold select-none cursor-pointer tracking-tight'
            style={{ color: T.ink }}
            title={isDev ? "Clique 3x para esconder opções de dev" : "Configurações"}
          >
            Configurações
          </h2>
          <p className="text-xs sm:text-sm mt-0.5" style={{ color: T.inkSoft }}>
            Personalize sua experiência de estudo, estética e módulos do Omnia.
          </p>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
          <button
            type="button"
            onClick={() => {
              sfx.pop();
              if (window.startOmniaTutorial) {
                window.startOmniaTutorial({ mode: "tour", stepIndex: 0 });
              }
            }}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all haptic-press flex items-center gap-1.5 cursor-pointer hover:opacity-90 shadow-xs"
            style={{ backgroundColor: T.surfaceAlt, borderColor: T.border, color: T.ink }}
            title="Abrir Tutorial Interativo e Manual Completo do Omnia"
          >
            <Compass size={14} style={{ color: T.brand }} />
            <span>Guia & Manual</span>
          </button>
          {isDev && (
            <>
              <span className="px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-amber-500/20 text-amber-400 border border-amber-500/40 animate-pulse">
                DEV MODE ATIVO
              </span>
              <button
                type="button"
                onClick={() => {
                  setDevMode(false);
                  sfx.pop();
                }}
                className="px-2.5 py-1 rounded-full text-xs font-medium bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 transition-colors flex items-center gap-1 cursor-pointer"
                title="Esconder todas as opções de desenvolvedor e diagnósticos QA"
              >
                <Shield size={12} /> Esconder Opções de Dev
              </button>
            </>
          )}
        </div>
      </div>

      {/* Navegação por Categorias com Abas de Pílula */}
      <div className="flex items-center gap-1.5 p-1.5 rounded-2xl border overflow-x-auto no-scrollbar shadow-xs" style={{ backgroundColor: T.surface, borderColor: T.border }}>
        {[
          { id: 'aparencia', label: 'Aparência & Estilo', icon: Palette },
          { id: 'modulos', label: 'Módulos & Recursos', icon: SlidersHorizontal },
          { id: 'dados', label: 'Dados & Segurança', icon: Shield },
          { id: 'integracoes', label: 'IA & Ferramentas', icon: Key },
        ].map(cat => {
          const Icon = cat.icon;
          const isActive = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => { sfx.tab(); setActiveCategory(cat.id); }}
              className={`flex-1 min-w-[130px] flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs sm:text-sm font-semibold transition-all haptic-press cursor-pointer ${
                isActive ? 'shadow-sm' : 'opacity-70 hover:opacity-100'
              }`}
              style={{
                backgroundColor: isActive ? T.brand : 'transparent',
                color: isActive ? T.brandInk : T.ink,
              }}
            >
              <Icon size={16} />
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* ---------------- 1. ABA APARÊNCIA & ESTILO ---------------- */}
      {activeCategory === 'aparencia' && (
        <div className="space-y-6">
          <section className='p-6 rounded-2xl shadow-sm border' style={{ backgroundColor: T.surface, borderColor: T.border }}>
            <div className='flex items-center gap-3 mb-2'>
              <Palette className='w-5 h-5' style={{ color: T.brand }} />
              <h3 className='text-lg font-bold' style={{ color: T.ink }}>Temas de Cor</h3>
            </div>
            <p className='mb-5 text-xs sm:text-sm' style={{ color: T.inkSoft }}>
              Escolha a atmosfera visual do Omnia. A logo e a interface se adaptam automaticamente.
            </p>
            
            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5'>
              {Object.keys(THEMES).map(t => {
                const isSelected = activeTheme === t;
                const themeName = t === 'dark' ? 'Omnia Dark' : t === 'light' ? 'Omnia Light' : t === 'cyberpunk' ? 'Cyberpunk Neon' : t === 'hacker' ? 'Modo Hacker' : t === 'aiko' ? 'Aiko' : 'Lo-Fi Café';
                return (
                  <button
                    key={t}
                    type="button"
                    onClick={() => selectTheme(t)}
                    className='flex items-center justify-between p-4 rounded-xl border transition-all haptic-press cursor-pointer text-left'
                    style={{
                      backgroundColor: THEMES[t].bg,
                      borderColor: isSelected ? THEMES[t].brand : THEMES[t].border,
                      boxShadow: isSelected ? `0 0 12px ${THEMES[t].brand}44` : 'none',
                    }}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="flex -space-x-1">
                        <div className='w-4 h-4 rounded-full border border-black/20 shadow-xs' style={{ backgroundColor: THEMES[t].brand }} />
                        <div className='w-4 h-4 rounded-full border border-black/20 shadow-xs' style={{ backgroundColor: THEMES[t].surface }} />
                      </div>
                      <span className='font-bold text-sm' style={{ color: THEMES[t].ink }}>{themeName}</span>
                    </div>
                    {isSelected && (
                      <span className='text-[10px] font-bold px-2 py-0.5 rounded-full border' style={{ backgroundColor: THEMES[t].brand, color: THEMES[t].brandInk, borderColor: THEMES[t].brand }}>
                        Ativo
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </section>

          <section className='p-6 rounded-2xl shadow-sm border' style={{ backgroundColor: T.surface, borderColor: T.border }}>
            <div className='flex items-center gap-3 mb-2'>
              <Type className='w-5 h-5' style={{ color: T.brand }} />
              <h3 className='text-lg font-bold' style={{ color: T.ink }}>Tipografia e Fontes</h3>
            </div>
            <p className='mb-5 text-xs sm:text-sm' style={{ color: T.inkSoft }}>
              Selecione o estilo tipográfico que mais favorece sua concentração e leitura.
            </p>
            
            <div className='grid grid-cols-1 sm:grid-cols-2 gap-3.5'>
              {[
                { id: "Inter, sans-serif", name: "Padrão (Inter)", desc: "Limpa, moderna e altamente legível", family: "'Inter', sans-serif" },
                { id: "Georgia, serif", name: "Foco (Serifada)", desc: "Estilo livro clássico impresso", family: "'Merriweather', Georgia, serif" },
                { id: "monospace", name: "Terminal", desc: "Monoespaçada técnica de desenvolvedor", family: "'JetBrains Mono', monospace" },
                { id: "Comic Sans MS, cursive", name: "Relaxada", desc: "Divertida, amigável e descontraída", family: "'Comic Neue', 'Comic Sans MS', cursive, sans-serif" }
              ].map(f => {
                const activeFont = resolveFontFamily(safeConfig.fontFamily);
                const isSelected = resolveFontFamily(f.id) === activeFont;
                return (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => {
                      sfx.pop();
                      updateConfig({ ...safeConfig, fontFamily: f.id });
                      applyFont(f.id);
                    }}
                    className='flex flex-col p-4 rounded-xl border transition-all text-left cursor-pointer haptic-press'
                    style={{
                      backgroundColor: isSelected ? (TINT.brand || T.brand + '22') : T.surfaceAlt,
                      borderColor: isSelected ? T.brand : T.border,
                      fontFamily: f.family,
                    }}
                  >
                    <div className='flex items-center justify-between w-full'>
                      <span className='font-bold text-sm sm:text-base' style={{ color: T.ink }}>{f.name}</span>
                      {isSelected && (
                        <span className='text-[10px] uppercase font-bold px-2 py-0.5 rounded-full' style={{ backgroundColor: T.brand, color: T.brandInk }}>
                          Ativa
                        </span>
                      )}
                    </div>
                    <span className='text-xs mt-1' style={{ color: T.inkSoft }}>{f.desc}</span>
                    <div className='mt-2.5 text-xs opacity-75 font-medium' style={{ color: T.ink, fontFamily: f.family }}>
                      Aa Bb Cc 123 • O rápido cachorro pulou sobre o foco
                    </div>
                  </button>
                );
              })}
            </div>
          </section>
        </div>
      )}

      {/* ---------------- 2. ABA MÓDULOS & RECURSOS ---------------- */}
      {activeCategory === 'modulos' && (
        <div className="space-y-6">
          {/* Card Central de Tutorial & Enciclopédia Omnia */}
          <div className="p-4 sm:p-5 rounded-2xl border flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs" style={{ backgroundColor: T.surface, borderColor: T.border }}>
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border" style={{ backgroundColor: `${T.brand}18`, borderColor: `${T.brand}30`, color: T.brand }}>
                <Compass size={22} />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-bold text-sm sm:text-base" style={{ color: T.ink }}>Tutorial Completo & Enciclopédia Omnia</span>
                  <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full font-bold bg-sky-500/20 text-sky-400 border border-sky-500/30">
                    100% Cobertura
                  </span>
                </div>
                <p className="text-xs sm:text-sm mt-1 max-w-xl" style={{ color: T.inkSoft }}>
                  Aprenda a usar cada botão, fórmula, atalho e recurso das 10 abas do aplicativo com passo a passo interativo e manual completo pesquisável.
                </p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => {
                  sfx.pop();
                  if (window.startOmniaTutorial) {
                    window.startOmniaTutorial({ mode: "tour", stepIndex: 0 });
                  }
                }}
                className="px-3.5 py-2 rounded-xl text-xs font-bold transition-all haptic-press flex items-center gap-1.5 cursor-pointer shadow-sm hover:opacity-90"
                style={{ backgroundColor: T.brand, color: T.brandInk }}
              >
                <Sparkles size={14} /> Iniciar Tour
              </button>
              <button
                type="button"
                onClick={() => {
                  sfx.pop();
                  if (window.startOmniaTutorial) {
                    window.startOmniaTutorial({ mode: "manual" });
                  }
                }}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all haptic-press flex items-center gap-1.5 cursor-pointer hover:opacity-90"
                style={{ backgroundColor: T.surfaceAlt, borderColor: T.border, color: T.ink }}
              >
                <BookOpen size={14} /> Abrir Manual
              </button>
            </div>
          </div>

          {/* Perfis Rápidos de Foco */}
          <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl border' style={{ backgroundColor: T.surface, borderColor: T.border }}>
            <div>
              <div className='text-sm font-bold flex items-center gap-1.5' style={{ color: T.ink }}>
                <Zap size={16} className="text-amber-400" />
                <span>Atalhos de Perfil Rápido</span>
              </div>
              <div className='text-xs mt-0.5' style={{ color: T.inkSoft }}>
                Alterne entre ambiente ultra minimalista e recursos completos com 1 clique.
              </div>
            </div>
            <div className='flex flex-wrap gap-2'>
              <button
                type='button'
                onClick={() => {
                  sfx.click();
                  if (reactiveBgm.getState().isPlaying) reactiveBgm.stop();
                  updateConfig({
                    ...safeConfig,
                    enableRoutine: false, enableHabits: false, enablePet: false,
                    enableMusic: false, enableLofi: false, enableBgm: false,
                    enableBreathing: false, enableMultiplayer: false, enableSpacedRepetition: false,
                    enableStudyGoals: false, enableJournal: false, enableGamification: false,
                    enableSfx: false, enableConfetti: false, enableHealthBreak: false,
                    enableAntiDistraction: false, enableBossFight: false, enableBiometricLock: false,
                    enableMindMap: false, enableCommunityHub: false, enableScratchpad: false,
                    enableSincereOwl: false, enableAnalytics: false, enableCalendar: false,
                    enablePdf: false, vacationMode: false, showArchived: false,
                  });
                }}
                className='px-3 py-1.5 rounded-xl text-xs font-bold border transition-all active:scale-95 flex items-center gap-1.5 cursor-pointer hover:opacity-90'
                style={{ backgroundColor: T.surfaceAlt, borderColor: T.critico, color: T.critico }}
              >
                <Zap size={13} /> Modo Minimalista
              </button>
              <button
                type='button'
                onClick={() => {
                  sfx.complete();
                  updateConfig({
                    ...safeConfig,
                    enableRoutine: true, enableHabits: true, enablePet: true,
                    enableMusic: true, enableLofi: true, enableBgm: true,
                    enableBreathing: true, enableMultiplayer: true, enableSpacedRepetition: true,
                    enableStudyGoals: true, enableJournal: true, enableGamification: true,
                    enableSfx: true, enableConfetti: true, enableHealthBreak: true,
                    enableAntiDistraction: true, enableBossFight: true, enableMindMap: true,
                    enableCommunityHub: true, enableScratchpad: true, enableSincereOwl: true,
                    enableAnalytics: true, enableCalendar: true, enablePdf: true,
                  });
                }}
                className='px-3 py-1.5 rounded-xl text-xs font-bold transition-all active:scale-95 flex items-center gap-1.5 cursor-pointer hover:opacity-90 shadow-sm'
                style={{ backgroundColor: T.brand, color: T.brandInk }}
              >
                <Sparkles size={13} /> Ativar Todos
              </button>
            </div>
          </div>

          {/* Subgrupo 1: Estudos & Organização */}
          <section className='p-6 rounded-2xl shadow-sm border' style={{ backgroundColor: T.surface, borderColor: T.border }}>
            <div className="flex items-center gap-2 mb-4 pb-2 border-b" style={{ borderColor: T.border }}>
              <BookOpen size={18} style={{ color: T.brand }} />
              <h3 className="font-bold text-base" style={{ color: T.ink }}>Estudos & Organização</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <ToggleRow
                icon={User} iconColor="#6366f1"
                title="Grade Semanal de Rotina"
                desc="Aba Minha Rotina e blocos de horários fixos no Hoje"
                checked={safeConfig.enableRoutine !== false}
                onChange={() => handleToggle('enableRoutine')}
              />
              <ToggleRow
                icon={CheckCircle2} iconColor="#10b981"
                title="Hábitos Diários"
                desc="Checklist de hábitos recorrentes no painel Hoje"
                checked={safeConfig.enableHabits !== false}
                onChange={() => handleToggle('enableHabits')}
              />
              <ToggleRow
                icon={Target} iconColor="#f43f5e"
                title="Metas Diárias de Foco"
                desc="Meta de minutos e medidor de progresso diário"
                checked={safeConfig.enableStudyGoals !== false}
                onChange={() => handleToggle('enableStudyGoals')}
              />
              <ToggleRow
                icon={RotateCcw} iconColor="#f59e0b"
                title="Revisão Espaçada"
                desc="Anotações de 1, 7, 30 e 90 dias na curva do esquecimento"
                checked={safeConfig.enableSpacedRepetition !== false}
                onChange={() => handleToggle('enableSpacedRepetition')}
              />
              <ToggleRow
                icon={BookHeart} iconColor="#ec4899"
                title="Diário de Bordo & Humor"
                desc="Registro emocional diário e reflexões pessoais"
                checked={Boolean(safeConfig.enableJournal)}
                onChange={() => handleToggle('enableJournal')}
              />
              <ToggleRow
                icon={Brain} iconColor="#8b5cf6"
                title="Mapas Mentais 2D"
                desc="Teia visual interativa de matérias e resumos"
                checked={safeConfig.enableMindMap !== false}
                onChange={() => handleToggle('enableMindMap')}
              />
              <ToggleRow
                icon={Edit3} iconColor="#38bdf8"
                title="Lousa em Branco"
                desc="Bloco de anotações rápidas na Secretaria"
                checked={Boolean(safeConfig.enableScratchpad)}
                onChange={() => handleToggle('enableScratchpad')}
              />
            </div>
          </section>

          {/* Subgrupo 2: Foco, Sons & Bem-estar */}
          <section className='p-6 rounded-2xl shadow-sm border' style={{ backgroundColor: T.surface, borderColor: T.border }}>
            <div className="flex items-center gap-2 mb-4 pb-2 border-b" style={{ borderColor: T.border }}>
              <Headphones size={18} style={{ color: T.brand }} />
              <h3 className="font-bold text-base" style={{ color: T.ink }}>Foco, Sons & Bem-estar</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <ToggleRow
                icon={Headphones} iconColor="#3b82f6"
                title="Player de Músicas & Ruídos"
                desc="Spotify, YouTube Music e sons da natureza no Foco"
                checked={safeConfig.enableMusic !== false && safeConfig.enableLofi !== false}
                onChange={() => handleToggle('enableMusic')}
              />
              <ToggleRow
                icon={Wind} iconColor="#38bdf8"
                title="Exercícios de Respiração"
                desc="Técnica Box Breathing (4x4) para controle da ansiedade"
                checked={safeConfig.enableBreathing !== false}
                onChange={() => handleToggle('enableBreathing')}
              />
              <ToggleRow
                icon={Heart} iconColor="#f43f5e"
                title="Pausas Ativas"
                desc="Lembretes periódicos de postura e hidratação"
                checked={Boolean(safeConfig.enableHealthBreak)}
                onChange={() => handleToggle('enableHealthBreak')}
              />
              <ToggleRow
                icon={ShieldAlert} iconColor="#f59e0b"
                title="Alerta Anti-Distração"
                desc="Aviso sonoro ao trocar de aba durante o foco"
                checked={safeConfig.enableAntiDistraction !== false}
                onChange={() => handleToggle('enableAntiDistraction')}
              />
              <ToggleRow
                icon={Users} iconColor="#a855f7"
                title="Salas Multiplayer em Grupo"
                desc="Sincronização de cronômetro com amigos via código"
                checked={safeConfig.enableMultiplayer !== false}
                onChange={() => handleToggle('enableMultiplayer')}
              />
            </div>

            {/* Trilha Sonora Reativa (BGM com controles expansíveis) */}
            <div className="mt-4 p-4 rounded-xl border" style={{ backgroundColor: T.surfaceAlt, borderColor: T.border }}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border border-white/5 bg-white/5 text-emerald-400">
                    <Music size={18} className={bgmState.isPlaying ? "animate-pulse" : ""} />
                  </div>
                  <div>
                    <div className="font-semibold text-sm flex items-center gap-2" style={{ color: T.ink }}>
                      <span>Trilha Sonora Reativa (BGM Procedural)</span>
                      {safeConfig.enableBgm !== false && bgmState.isPlaying && (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                          {bgmState.name}
                        </span>
                      )}
                    </div>
                    <div className="text-xs mt-0.5" style={{ color: T.inkSoft }}>Música procedural adaptada dinamicamente a cada aba</div>
                  </div>
                </div>
                <div
                  onClick={() => handleToggle('enableBgm')}
                  className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors shrink-0 cursor-pointer ${safeConfig.enableBgm !== false ? 'bg-sky-500' : 'bg-slate-700/60'}`}
                  style={{ backgroundColor: safeConfig.enableBgm !== false ? T.brand : undefined }}
                >
                  <div className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-200 ${safeConfig.enableBgm !== false ? 'translate-x-5' : 'translate-x-0'}`} />
                </div>
              </div>

              {safeConfig.enableBgm !== false && (
                <div className="pt-3.5 mt-3.5 border-t space-y-3" style={{ borderColor: T.border }}>
                  <div className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1.5" style={{ color: T.inkSoft }}>
                      <Volume2 size={14} /> Volume da Trilha
                    </span>
                    <span className="font-mono font-bold" style={{ color: T.brand }}>{Math.round(bgmState.volume * 100)}%</span>
                  </div>
                  <input
                    type="range" min="0" max="1" step="0.02" value={bgmState.volume}
                    onChange={(e) => reactiveBgm.setVolume(parseFloat(e.target.value))}
                    className="w-full h-1.5 rounded-lg appearance-none cursor-pointer accent-blue-500"
                    style={{ backgroundColor: "rgba(255,255,255,0.15)" }}
                  />
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                    <span className="text-xs" style={{ color: T.inkSoft }}>Ambiente sonoro:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {[
                        { id: 'auto', label: 'Auto' },
                        { id: 'foco', label: 'Foco' },
                        { id: 'hoje', label: 'Manhã' },
                        { id: 'biblioteca', label: 'Estudo' },
                        { id: 'secretaria', label: 'IA' },
                        { id: 'desempenho', label: 'Vitória' }
                      ].map(preset => {
                        const isPresetActive = (bgmState.presetOverride || 'auto') === preset.id;
                        return (
                          <button
                            key={preset.id}
                            type="button"
                            onClick={() => { sfx.pop(); reactiveBgm.setPreset(preset.id); }}
                            className="px-2 py-1 rounded-lg text-xs font-semibold border transition-all cursor-pointer"
                            style={{
                              backgroundColor: isPresetActive ? T.brand : T.surface,
                              color: isPresetActive ? T.brandInk : T.ink,
                              borderColor: isPresetActive ? T.brand : T.border,
                            }}
                          >
                            {preset.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Efeitos Sonoros SFX com botões de teste */}
            <div className="mt-3 p-4 rounded-xl border flex flex-col gap-3" style={{ backgroundColor: T.surfaceAlt, borderColor: T.border }}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border border-white/5 bg-white/5 text-cyan-400">
                    <Volume2 size={18} />
                  </div>
                  <div>
                    <div className="font-semibold text-sm" style={{ color: T.ink }}>Efeitos Sonoros dos Botões (SFX)</div>
                    <div className="text-xs mt-0.5" style={{ color: T.inkSoft }}>Feedbacks auditivos em tarefas, timers e cliques</div>
                  </div>
                </div>
                <div
                  onClick={() => { handleToggle('enableSfx'); sfx.click(); }}
                  className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors shrink-0 cursor-pointer ${safeConfig.enableSfx !== false ? 'bg-sky-500' : 'bg-slate-700/60'}`}
                  style={{ backgroundColor: safeConfig.enableSfx !== false ? T.brand : undefined }}
                >
                  <div className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-200 ${safeConfig.enableSfx !== false ? 'translate-x-5' : 'translate-x-0'}`} />
                </div>
              </div>

              {safeConfig.enableSfx !== false && (
                <div className="pt-2.5 border-t flex flex-wrap items-center justify-between gap-2 text-xs" style={{ borderColor: T.border }}>
                  <span style={{ color: T.inkSoft }}>Testar sons:</span>
                  <div className="flex flex-wrap gap-1.5">
                    <button type="button" onClick={() => sfx.click()} className="px-2.5 py-1 rounded-lg border text-xs cursor-pointer hover:opacity-80 active:scale-95" style={{ backgroundColor: T.surface, color: T.ink, borderColor: T.border }}>
                      Clique
                    </button>
                    <button type="button" onClick={() => sfx.pop()} className="px-2.5 py-1 rounded-lg border text-xs cursor-pointer hover:opacity-80 active:scale-95" style={{ backgroundColor: T.surface, color: T.ink, borderColor: T.border }}>
                      Pop
                    </button>
                    <button type="button" onClick={() => sfx.complete()} className="px-2.5 py-1 rounded-lg border text-xs cursor-pointer hover:opacity-80 active:scale-95" style={{ backgroundColor: T.surface, color: T.ink, borderColor: T.border }}>
                      Sino
                    </button>
                    <button type="button" onClick={() => sfx.coin()} className="px-2.5 py-1 rounded-lg border text-xs cursor-pointer hover:opacity-80 active:scale-95" style={{ backgroundColor: T.surface, color: T.ink, borderColor: T.border }}>
                      Moeda
                    </button>
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* Subgrupo 3: Gamificação & Recompensas */}
          <section className='p-6 rounded-2xl shadow-sm border' style={{ backgroundColor: T.surface, borderColor: T.border }}>
            <div className="flex items-center gap-2 mb-4 pb-2 border-b" style={{ borderColor: T.border }}>
              <Gamepad2 size={18} style={{ color: T.brand }} />
              <h3 className="font-bold text-base" style={{ color: T.ink }}>Gamificação & Recompensas</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <ToggleRow
                icon={Sparkles} iconColor="#f59e0b"
                title="Mascotes & Sprites de Foco"
                desc="Avatares interativos, loja de skins e falas animadas"
                checked={safeConfig.enablePet !== false}
                onChange={() => handleToggle('enablePet')}
              />
              <ToggleRow
                icon={Swords} iconColor="#ef4444"
                title="Batalhas RPG de Foco (Boss)"
                desc="Chefes da procrastinação com barra de HP em tempo real"
                checked={safeConfig.enableBossFight !== false}
                onChange={() => handleToggle('enableBossFight')}
              />
              <ToggleRow
                icon={Gamepad2} iconColor="#8b5cf6"
                title="Gamificação Completa"
                desc="XP, Níveis, Streaks e ranking na aba Desempenho"
                checked={Boolean(safeConfig.enableGamification)}
                onChange={() => handleToggle('enableGamification')}
              />
              <ToggleRow
                icon={PartyPopper} iconColor="#ec4899"
                title="Animações de Conclusão"
                desc="Chuva de confetes comemorativos ao concluir tarefas"
                checked={Boolean(safeConfig.enableConfetti)}
                onChange={() => handleToggle('enableConfetti')}
              />
              <ToggleRow
                icon={Bird} iconColor="#06b6d4"
                title="Coruja Sincera"
                desc="Dicas, avisos e feedbacks sobre seu ritmo de estudo"
                checked={Boolean(safeConfig.enableSincereOwl)}
                onChange={() => handleToggle('enableSincereOwl')}
              />
              <ToggleRow
                icon={BarChart} iconColor="#3b82f6"
                title="Dashboard de Análises"
                desc="Gráficos semanais e horários de pico de estudo"
                checked={Boolean(safeConfig.enableAnalytics)}
                onChange={() => handleToggle('enableAnalytics')}
              />
              <ToggleRow
                icon={Palmtree} iconColor="#10b981"
                title="Modo Férias (Anti-Burnout)"
                desc="Congela streaks e zera metas para descanso sem culpa"
                checked={Boolean(safeConfig.vacationMode)}
                onChange={() => handleToggle('vacationMode')}
              />
            </div>
          </section>
        </div>
      )}

      {/* ---------------- 3. ABA DADOS & PRIVACIDADE ---------------- */}
      {activeCategory === 'dados' && (
        <div className="space-y-6">
          <section className='p-6 rounded-2xl shadow-sm border' style={{ backgroundColor: T.surface, borderColor: T.border }}>
            <div className="flex items-center gap-2 mb-4 pb-2 border-b" style={{ borderColor: T.border }}>
              <Download size={18} style={{ color: T.brand }} />
              <h3 className="font-bold text-base" style={{ color: T.ink }}>Backup & Exportação</h3>
            </div>
            
            <div className="p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4" style={{ backgroundColor: T.surfaceAlt, borderColor: T.border }}>
              <div>
                <div className="font-bold text-sm" style={{ color: T.ink }}>Backup Completo em Markdown (.md)</div>
                <div className="text-xs mt-0.5" style={{ color: T.inkSoft }}>Exporta todas as suas anotações, compromissos e resumos de forma limpa</div>
              </div>
              <PrimaryButton
                onClick={() => {
                  sfx.complete();
                  const blob = new Blob([generateMarkdownBackup(commitments, notes, summaries)], { type: 'text/markdown' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `backup_omnia_${todayISO()}.md`;
                  a.click();
                }}
                className="text-xs py-2 px-4 shadow-sm shrink-0"
              >
                <Download size={14} className="mr-1.5" /> Baixar .md
              </PrimaryButton>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <ToggleRow
                icon={Calendar} iconColor="#3b82f6"
                title="Sincronizar Calendário (.ics)"
                desc="Exportação para Google Calendar, Apple e Outlook"
                checked={Boolean(safeConfig.enableCalendar)}
                onChange={() => handleToggle('enableCalendar')}
              />
              <ToggleRow
                icon={FileText} iconColor="#10b981"
                title="Exportar PDF da Rotina"
                desc="Download da grade horária semanal formatada"
                checked={Boolean(safeConfig.enablePdf)}
                onChange={() => handleToggle('enablePdf')}
              />
            </div>
          </section>

          <section className='p-6 rounded-2xl shadow-sm border' style={{ backgroundColor: T.surface, borderColor: T.border }}>
            <div className="flex items-center gap-2 mb-4 pb-2 border-b" style={{ borderColor: T.border }}>
              <Shield size={18} style={{ color: T.brand }} />
              <h3 className="font-bold text-base" style={{ color: T.ink }}>Segurança & Arquivamento</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <ToggleRow
                icon={Fingerprint} iconColor="#06b6d4"
                title="Bloqueio Biométrico / PIN"
                desc="Exige Windows Hello, Face ID, Touch ID ou PIN"
                checked={Boolean(safeConfig.enableBiometricLock)}
                onChange={() => handleToggle('enableBiometricLock')}
              />
              <ToggleRow
                icon={Archive} iconColor="#8b5cf6"
                title="Mostrar Itens Arquivados"
                desc="Exibir notas e matérias com tag #arquivado"
                checked={Boolean(safeConfig.showArchived)}
                onChange={() => handleToggle('showArchived')}
              />
              <ToggleRow
                icon={Globe} iconColor="#10b981"
                title="Hub Comunitário de Resumos"
                desc="Acesso ao feed público e compartilhamento cooperativo"
                checked={safeConfig.enableCommunityHub !== false}
                onChange={() => handleToggle('enableCommunityHub')}
              />
            </div>
          </section>
        </div>
      )}

      {/* ---------------- 4. ABA IA & FERRAMENTAS ---------------- */}
      {activeCategory === 'integracoes' && (
        <div className="space-y-6">
          {/* Chave de API Groq */}
          <section className='p-6 rounded-2xl shadow-sm border' style={{ backgroundColor: T.surface, borderColor: T.border }}>
            <div className='flex items-center gap-3 mb-2'>
              <Key className='w-5 h-5' style={{ color: T.brand }} />
              <h3 className='text-lg font-bold' style={{ color: T.ink }}>Inteligência Artificial Pessoal</h3>
            </div>
            <p className='mb-3 text-xs sm:text-sm' style={{ color: T.inkSoft }}>
              Insira sua chave de API pessoal da Groq para obter limite de IA exclusivo e velocidade máxima. Se deixar em branco, o Omnia utilizará a infraestrutura padrão.
            </p>
            <a href='https://console.groq.com/keys' target='_blank' rel='noopener noreferrer' className='text-xs underline mb-3 inline-block font-semibold' style={{ color: T.brand }}>
              → Obter chave gratuita em console.groq.com/keys
            </a>
            <input
              type='password'
              placeholder='gsk_...'
              value={safeConfig.groqApiKey || ''}
              onChange={(e) => updateConfig({ ...safeConfig, groqApiKey: e.target.value })}
              className='w-full p-3 rounded-xl text-sm font-mono'
              style={{ backgroundColor: T.surfaceAlt, color: T.ink, border: `1px solid ${T.border}` }}
            />
            {safeConfig.groqApiKey && (
              <p className='text-xs mt-2 font-medium flex items-center gap-1 text-emerald-400'>
                <Check size={14} /> Chave pessoal configurada e ativa
              </p>
            )}
          </section>

          {/* Web Clipper & Extensão do Chrome */}
          <section className='p-6 rounded-2xl shadow-sm border' style={{ backgroundColor: T.surface, borderColor: T.border }}>
            <div className='flex items-center gap-3 mb-2'>
              <Paperclip className='w-5 h-5' style={{ color: T.brand }} />
              <h3 className='text-lg font-bold' style={{ color: T.ink }}>Extensão & Web Clipper Oficial</h3>
            </div>
            <p className='mb-4 text-xs sm:text-sm' style={{ color: T.inkSoft }}>
              Capture materiais, textos de artigos e bloqueie sites que roubam seu foco direto no Chrome ou Edge.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl border flex flex-col justify-between" style={{ backgroundColor: T.surfaceAlt, borderColor: T.border }}>
                <div>
                  <div className="font-bold text-sm mb-1" style={{ color: T.ink }}>1. Bookmarklet Inteligente</div>
                  <div className="text-xs mb-3" style={{ color: T.inkSoft }}>Arraste para sua barra de favoritos para capturar textos de qualquer página sem precisar instalar extensões.</div>
                </div>
                <div className="flex justify-center pt-2">
                  <a 
                    href="javascript:(function(){const sel=window.getSelection().toString();const text=sel?sel:document.body.innerText;const title=document.title;const url=window.location.href;const target='https://omnia-unio.vercel.app/?clipperTitle='+encodeURIComponent(title)+'&clipperUrl='+encodeURIComponent(url)+'&clipperText='+encodeURIComponent(text.substring(0,3000));window.open(target,'_blank');})();"
                    className="px-4 py-2 font-bold text-white rounded-full shadow cursor-grab active:cursor-grabbing text-xs"
                    style={{ backgroundColor: T.brand }}
                    title="Arraste para a barra de favoritos"
                    onClick={e => e.preventDefault()}
                  >
                    <span className="flex items-center gap-1.5">
                      <Bookmark size={13} />
                      <span>Omnia Clipper (Favorito)</span>
                    </span>
                  </a>
                </div>
              </div>

              <div className="p-4 rounded-xl border flex flex-col justify-between" style={{ backgroundColor: T.surfaceAlt, borderColor: T.border }}>
                <div>
                  <div className="font-bold text-sm mb-1" style={{ color: T.ink }}>2. Extensão do Navegador (.zip)</div>
                  <div className="text-xs mb-3" style={{ color: T.inkSoft }}>Bloqueia sites viciantes durante as sessões e adiciona o ícone oficial da coruja ao Chrome.</div>
                </div>
                <GhostButton
                  onClick={async () => {
                    try {
                      sfx.complete();
                      const zip = new JSZip();
                      const mResp = await fetch('/extension/manifest.json');
                      const bResp = await fetch('/extension/background.js');
                      const pResp = await fetch('/extension/popup.html');
                      const jResp = await fetch('/extension/popup.js');
                      zip.file('manifest.json', await mResp.text());
                      zip.file('background.js', await bResp.text());
                      zip.file('popup.html', await pResp.text());
                      zip.file('popup.js', await jResp.text());
                      const blob = await zip.generateAsync({ type: 'blob' });
                      const a = document.createElement('a');
                      a.href = URL.createObjectURL(blob);
                      a.download = 'omnia-chrome-extension.zip';
                      a.click();
                    } catch (e) {
                      alert('Erro ao empacotar extensão.');
                    }
                  }}
                  className="text-xs py-2 w-full flex items-center justify-center gap-1.5"
                >
                  <Download size={14} /> Baixar Extensão (.zip)
                </GhostButton>
              </div>
            </div>
          </section>

          {/* Central de Autoteste & Diagnóstico QA (Oculto se Dev Mode desativado) */}
          {isDev && <QAAutomatedSystem userId={userId} />}
        </div>
      )}
    </div>
  );
}

export function GlobalSearchModal({ onClose, commitments, notes, materials, setTab, initialQuery = "" }) {
  const [q, setQ] = React.useState(initialQuery);
  React.useEffect(() => {
    const handleKeyDown = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const lowerQ = q.toLowerCase();
  const resCommitments = commitments.filter(c => c.assunto?.toLowerCase().includes(lowerQ) || c.disciplina?.toLowerCase().includes(lowerQ)).slice(0, 3);
  const resNotes = notes.filter(n => n.texto?.toLowerCase().includes(lowerQ) || n.disciplina?.toLowerCase().includes(lowerQ)).slice(0, 3);
  const resMaterials = materials.filter(m => m.name?.toLowerCase().includes(lowerQ) || m.disciplina?.toLowerCase().includes(lowerQ)).slice(0, 3);

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] px-4" style={{ backgroundColor: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }} onClick={onClose}>
      <div className="w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden" style={{ backgroundColor: T.bg, border: `1px solid ${T.border}` }} onClick={e => e.stopPropagation()}>
        <div className="flex items-center p-4 border-b" style={{ borderColor: T.border, backgroundColor: T.surface }}>
          <Search className="w-5 h-5 mr-3" style={{ color: T.inkSoft }} />
          <input autoFocus type="text" placeholder="Buscar compromissos, notas, materiais..." value={q} onChange={e => setQ(e.target.value)} className="flex-1 bg-transparent border-none outline-none text-lg" style={{ color: T.ink }} />
          <button onClick={onClose} className="px-2 py-1 text-xs rounded border ml-2" style={{ color: T.inkSoft, borderColor: T.border }}>ESC</button>
        </div>
        {q && (
          <div className="max-h-[60vh] overflow-y-auto p-2 space-y-4">
            {isHideDevCommand(q) && (
              <div className="p-3 rounded-xl border border-rose-500 bg-rose-500/10 flex items-center justify-between">
                <div>
                  <div className="font-bold text-sm text-rose-400 flex items-center gap-1.5">
                    <Shield size={16} /> [DEV] Esconder Opções de Desenvolvedor
                  </div>
                  <div className="text-xs text-slate-400">Oculta suite de testes QA, ferramentas de debug e badges de dev</div>
                </div>
                <button
                  onClick={() => { setDevMode(false); onClose(); }}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold bg-rose-600 text-white hover:bg-rose-500 transition-colors shadow"
                >
                  Esconder Agora
                </button>
              </div>
            )}
            {isToggleDevCommand(q) && !isHideDevCommand(q) && (
              <div className="p-3 rounded-xl border border-amber-500 bg-amber-500/10 flex items-center justify-between">
                <div>
                  <div className="font-bold text-sm text-amber-400 flex items-center gap-1.5">
                    <Sparkles size={16} /> [DEV] Alternar Modo Desenvolvedor
                  </div>
                  <div className="text-xs text-slate-400">Ativa ou desativa ferramentas de desenvolvedor e suite de QA</div>
                </div>
                <button
                  onClick={() => { setDevMode(!isDevModeActive()); onClose(); }}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold bg-amber-500 text-black hover:bg-amber-400 transition-colors shadow"
                >
                  Alternar Agora
                </button>
              </div>
            )}
            {isSecretDevCommand(q) && (
              <div className="p-3 rounded-xl border border-amber-500 bg-amber-500/10 flex items-center justify-between">
                <div>
                  <div className="font-bold text-sm text-amber-500 flex items-center gap-1.5">
                    <Sparkles size={16} /> [DEV CHEAT] Ativar God Mode
                  </div>
                  <div className="text-xs text-slate-400">Liberar 99.999 Moedas, 100.000 XP (Nível Máximo) e 99 Streaks</div>
                </div>
                <button
                  onClick={() => { executeGodModeCheat(null, null); onClose(); }}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold bg-amber-500 text-black hover:bg-amber-400 transition-colors shadow"
                >
                  Ativar Agora
                </button>
              </div>
            )}
            {(lowerQ.includes("tour") || lowerQ.includes("tutorial") || lowerQ.includes("guia") || lowerQ.includes("ajuda") || lowerQ.includes("manual") || lowerQ.includes("como usar")) && (
              <div className="p-3.5 rounded-2xl border border-sky-500 bg-sky-500/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="font-bold text-sm text-sky-400 flex items-center gap-1.5">
                    <Compass size={17} /> [TUTORIAL] Guia Completo & Assistência 100%
                  </div>
                  <div className="text-xs text-slate-300 mt-0.5">
                    Tour passo a passo por todas as 10 abas, explicando cada botão e função do Omnia com total clareza.
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => {
                      onClose();
                      if (typeof window.startOmniaTutorial === "function") {
                        window.startOmniaTutorial({ mode: 'manual' });
                      }
                    }}
                    className="px-3 py-1.5 rounded-xl text-xs font-semibold border border-sky-400/40 text-sky-300 hover:bg-sky-400/10 transition-colors shadow flex items-center gap-1.5 cursor-pointer"
                  >
                    <BookOpen size={13} /> Manual
                  </button>
                  <button
                    onClick={() => {
                      onClose();
                      if (typeof window.startOmniaTutorial === "function") {
                        window.startOmniaTutorial({ mode: 'tour' });
                      }
                    }}
                    className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-sky-600 text-white hover:bg-sky-500 transition-colors shadow flex items-center gap-1.5 cursor-pointer"
                  >
                    <Play size={13} fill="currentColor" /> Iniciar Tour
                  </button>
                </div>
              </div>
            )}
            {resCommitments.length > 0 && (
              <div>
                <div className="text-xs font-bold px-3 py-1 uppercase" style={{ color: T.brand }}>Compromissos</div>
                {resCommitments.map(c => (
                  <button key={c.id} onClick={() => { setTab("agenda"); onClose(); }} className="w-full text-left px-3 py-2 rounded-xl hover:opacity-80 transition-all flex items-center justify-between" style={{ backgroundColor: T.surfaceAlt }}>
                    <span style={{ color: T.ink }} className="font-medium truncate">{c.disciplina} - {c.assunto}</span>
                  </button>
                ))}
              </div>
            )}
            {resNotes.length > 0 && (
              <div>
                <div className="text-xs font-bold px-3 py-1 uppercase" style={{ color: T.brand }}>Anotações</div>
                {resNotes.map(n => {
                  const isDiario = (n.disciplina || "").toLowerCase().includes("diário") || (n.disciplina || "").toLowerCase().includes("diario");
                  return (
                    <button key={n.id} onClick={() => { setTab(isDiario ? "diario" : "biblioteca"); onClose(); }} className="w-full text-left px-3 py-2 rounded-xl hover:opacity-80 transition-all flex items-center justify-between" style={{ backgroundColor: T.surfaceAlt }}>
                      <span style={{ color: T.ink }} className="font-medium truncate">{n.disciplina} - {n.texto.slice(0, 40)}...</span>
                    </button>
                  );
                })}
              </div>
            )}
            {resMaterials.length > 0 && (
              <div>
                <div className="text-xs font-bold px-3 py-1 uppercase" style={{ color: T.brand }}>Materiais</div>
                {resMaterials.map(m => (
                  <button key={m.id} onClick={() => { setTab("biblioteca"); onClose(); }} className="w-full text-left px-3 py-2 rounded-xl hover:opacity-80 transition-all flex items-center justify-between" style={{ backgroundColor: T.surfaceAlt }}>
                    <span style={{ color: T.ink }} className="font-medium truncate">{m.disciplina} - {m.name}</span>
                  </button>
                ))}
              </div>
            )}
            {resCommitments.length === 0 && resNotes.length === 0 && resMaterials.length === 0 && (
              <div className="p-4 text-center text-sm" style={{ color: T.inkSoft }}>Nenhum resultado encontrado.</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
