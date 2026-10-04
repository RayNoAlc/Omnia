import { Settings, Home, Inbox as InboxIcon, Calendar, BookOpen, Headphones, MessageCircle, User, BarChart3 } from "lucide-react";

export const THEMES = {
  dark: {
    bg: '#0B1120', surface: '#141C2F', surfaceAlt: '#1E293B', ink: '#F1F5F9', inkSoft: '#94A3B8',
    border: 'rgba(255,255,255,0.08)', brand: '#3B82F6', brandDark: '#2563EB', critico: '#EF4444', importante: '#F59E0B',
    normal: '#3B82F6', baixa: '#94A3B8', purple: '#8B5CF6', pink: '#EC4899', brandInk: '#FFFFFF',
    tintBrand: 'rgba(59, 130, 246, 0.15)', tintCrítico: 'rgba(239, 68, 68, 0.15)', tintImportante: 'rgba(245, 158, 11, 0.15)', tintPurple: 'rgba(139, 92, 246, 0.15)'
  },
  light: {
    bg: '#F8FAFC', surface: '#FFFFFF', surfaceAlt: '#F1F5F9', ink: '#0F172A', inkSoft: '#64748B',
    border: 'rgba(0,0,0,0.1)', brand: '#2563EB', brandDark: '#1D4ED8', critico: '#DC2626', importante: '#D97706',
    normal: '#2563EB', baixa: '#64748B', purple: '#7C3AED', pink: '#DB2777', brandInk: '#FFFFFF',
    tintBrand: 'rgba(37, 99, 235, 0.1)', tintCrítico: 'rgba(220, 38, 38, 0.1)', tintImportante: 'rgba(217, 119, 6, 0.1)', tintPurple: 'rgba(124, 58, 237, 0.1)'
  },
  cyberpunk: {
    bg: '#0D0221', surface: '#1A0B2E', surfaceAlt: '#261447', ink: '#00FFCC', inkSoft: '#FF007F',
    border: '#FF007F', brand: '#00FFCC', brandDark: '#00E5B7', critico: '#FF007F', importante: '#F59E0B',
    normal: '#00FFCC', baixa: '#444444', purple: '#B537F2', pink: '#FF007F', brandInk: '#0D0221',
    tintBrand: 'rgba(0, 255, 204, 0.2)', tintCrítico: 'rgba(255, 0, 127, 0.2)', tintImportante: 'rgba(245, 158, 11, 0.2)', tintPurple: 'rgba(181, 55, 242, 0.2)'
  },
  lofi: {
    bg: '#FDF6E3', surface: '#F4E8D1', surfaceAlt: '#E9DAC1', ink: '#5C4A3D', inkSoft: '#8D7A68',
    border: 'rgba(92, 74, 61, 0.2)', brand: '#D4A373', brandDark: '#B8865C', critico: '#E07A5F', importante: '#F2CC8F',
    normal: '#D4A373', baixa: '#A3A3A3', purple: '#9E8EAB', pink: '#DDA1A8', brandInk: '#4A3B32',
    tintBrand: 'rgba(212, 163, 115, 0.2)', tintCrítico: 'rgba(224, 122, 95, 0.2)', tintImportante: 'rgba(242, 204, 143, 0.2)', tintPurple: 'rgba(158, 142, 171, 0.2)'
  }
};

export const applyTheme = (themeName) => {
  const theme = THEMES[themeName] || THEMES.dark;
  Object.keys(theme).forEach(key => {
    document.documentElement.style.setProperty('--' + key, theme[key]);
  });
  localStorage.setItem('omnia-theme', themeName);
};

export const T = {
  bg: 'var(--bg)', surface: 'var(--surface)', surfaceAlt: 'var(--surfaceAlt)',
  ink: 'var(--ink)', inkSoft: 'var(--inkSoft)', border: 'var(--border)',
  brand: 'var(--brand)', brandDark: 'var(--brandDark)', critico: 'var(--critico)',
  importante: 'var(--importante)', normal: 'var(--normal)', baixa: 'var(--baixa)',
  purple: 'var(--purple)', pink: 'var(--pink)', brandInk: 'var(--brandInk)'
};

export const TINT = {
  brand: 'var(--tintBrand)', critico: 'var(--tintCrítico)',
  importante: 'var(--tintImportante)', purple: 'var(--tintPurple)'
};


export const TIPO_LABELS = {
  prova: "Prova",
  trabalho: "Trabalho",
  aula: "Aula",
  entrega: "Entrega",
  seminario: "Seminário",
  outro: "Outro",
};

export const PRIORIDADE_META = {
  critico: { label: "Crítico", color: T.critico },
  importante: { label: "Importante", color: T.importante },
  normal: { label: "Normal", color: T.normal },
  baixa: { label: "Baixa", color: T.baixa },
};

export const PERIODO_LABELS = { manha: "Manhã", tarde: "Tarde", noite: "Noite" };

export const TABS = [

  { id: "hoje", label: "Hoje", icon: Home },
  { id: "inbox", label: "Inbox", icon: InboxIcon },
  { id: "agenda", label: "Agenda", icon: Calendar },
  { id: "desempenho", label: "Desempenho", icon: BarChart3 },
  { id: "biblioteca", label: "Biblioteca", icon: BookOpen },
  { id: "foco", label: "Foco", icon: Headphones },
  { id: "secretaria", label: "Secretária", icon: MessageCircle },
  { id: "rotina", label: "Minha Rotina", icon: User },
  { id: 'config', label: 'Configurações', icon: Settings }
];

export function PriorityDot({ prioridade }) {
  const meta = PRIORIDADE_META[prioridade] || PRIORIDADE_META.normal;
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-medium" style={{ color: meta.color }}>
      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: meta.color }} />
      {meta.label}
    </span>
  );
}

export function TypeTag({ tipo }) {
  return (
    <span
      className="text-[11px] font-mono uppercase tracking-wide px-1.5 py-0.5 rounded"
      style={{ backgroundColor: T.surfaceAlt, color: T.inkSoft, border: `1px solid ${T.border}` }}
    >
      {TIPO_LABELS[tipo] || tipo}
    </span>
  );
}

export function Card({ children, className = "", style = {} }) {
  return (
    <div
      className={`rounded-2xl p-4 ${className}`}
      style={{ backgroundColor: T.surface, border: `1px solid ${T.border}`, ...style }}
    >
      {children}
    </div>
  );
}

export function SectionLabel({ children }) {
  return (
    <div className="text-[11px] font-mono uppercase tracking-widest mb-2" style={{ color: T.inkSoft }}>
      {children}
    </div>
  );
}

export function EmptyState({ text }) {
  return (
    <div className="w-full px-6 text-sm text-center py-8 rounded-2xl" style={{ color: T.inkSoft, border: `1px dashed ${T.border}` }}>
      {text}
    </div>
  );
}

export function PrimaryButton({ children, onClick, disabled, className = "" }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-opacity disabled:opacity-50 ${className}`}
      style={{ backgroundColor: T.brand, color: T.brandInk }}
    >
      {children}
    </button>
  );
}

export function GhostButton({ children, onClick, className = "" }) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center justify-center gap-2 rounded-xl px-3 py-2 text-sm font-medium ${className}`}
      style={{ color: T.inkSoft, border: `1px solid ${T.border}`, backgroundColor: "transparent" }}
    >
      {children}
    </button>
  );
}
