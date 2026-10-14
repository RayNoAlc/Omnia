import { Settings, Home, Inbox as InboxIcon, Calendar, BookOpen, Headphones, MessageCircle, User, BarChart3, BookHeart } from "lucide-react";
import { sfx } from "../lib/soundEffects";

export const THEMES = {

  hacker: {
    bg: "#000000",
    surface: "#0a0a0a",
    surfaceAlt: "#111111",
    border: "#003300",
    ink: "#00ff00",
    inkSoft: "#008800",
    brand: "#00ff00",
    brandInk: "#000000",
    critico: "#ff0000",
    importante: "#ffff00",
    normal: "#00ff00"
  },

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

export const resolveFontFamily = (val) => {
  if (!val) return "'Plus Jakarta Sans', 'Inter', system-ui, -apple-system, sans-serif";
  const str = String(val).toLowerCase().trim();

  // 1. Comic / Cursive / Relaxada
  if (str.includes("comic") || str.includes("cursive") || str === "casual" || str.includes("relaxada")) {
    return "'Comic Neue', 'Comic Sans MS', cursive, sans-serif";
  }

  // 2. Terminal / Monospace
  if (str.includes("mono") || str.includes("terminal") || str.includes("jetbrains") || str.includes("code")) {
    return "'JetBrains Mono', monospace";
  }

  // 3. Serifada / Livro / Merriweather / Georgia
  if (str.includes("georgia") || str.includes("merriweather") || (str.includes("serif") && !str.includes("sans"))) {
    return "'Merriweather', Georgia, serif";
  }

  // 4. Padrão / Sans-serif / Plus Jakarta Sans / Inter
  return "'Plus Jakarta Sans', 'Inter', system-ui, -apple-system, sans-serif";
};

export const applyFont = (fontVal) => {
  const family = resolveFontFamily(fontVal);
  if (typeof document !== 'undefined') {
    document.documentElement.style.setProperty('--font-family', family);
    document.documentElement.style.fontFamily = family;
    if (document.body) {
      document.body.style.fontFamily = family;
    }
  }
  if (typeof localStorage !== 'undefined' && fontVal) {
    localStorage.setItem('omnia-font', fontVal);
  }
};

// Auto-apply saved font on module evaluation
if (typeof window !== 'undefined') {
  try {
    const savedDirect = localStorage.getItem('omnia-font');
    if (savedDirect) {
      applyFont(savedDirect);
    } else {
      const saved = JSON.parse(localStorage.getItem('omnia_config') || '{}');
      applyFont(saved.fontFamily || 'Inter, sans-serif');
    }
  } catch (e) {
    applyFont('Inter, sans-serif');
  }
}

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
  fichamento: "Fichamento",
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
  { id: "diario", label: "Diário", icon: BookHeart },
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

export function Card({ children, className = "", style = {}, onClick, ...props }) {
  return (
    <div
      className={`double-bezel-card rounded-2xl p-4 md:p-5 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${onClick ? 'cursor-pointer hover:shadow-lg hover:-translate-y-0.5' : ''} ${className}`}
      style={{
        backgroundColor: T.surface,
        border: `1px solid ${T.border}`,
        ...style,
      }}
      onClick={onClick}
      {...props}
    >
      {children}
    </div>
  );
}

export function SectionLabel({ children }) {
  return (
    <div className="text-[11px] font-semibold uppercase tracking-[0.14em] mb-2.5 flex items-center gap-2" style={{ color: T.inkSoft }}>
      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: T.brand }} />
      {children}
    </div>
  );
}

export function EmptyState({ text, icon: Icon, action }) {
  return (
    <div
      className="w-full px-6 py-10 rounded-2xl flex flex-col items-center justify-center text-center transition-all duration-300"
      style={{ backgroundColor: 'rgba(255,255,255,0.015)', border: `1px dashed ${T.border}` }}
    >
      {Icon && (
        <div className="w-10 h-10 rounded-full flex items-center justify-center mb-3 shadow-inner" style={{ backgroundColor: T.surfaceAlt, color: T.inkSoft }}>
          <Icon className="w-5 h-5" />
        </div>
      )}
      <p className="text-sm font-medium max-w-sm" style={{ color: T.inkSoft }}>
        {text}
      </p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function PrimaryButton({ children, onClick, disabled, className = "", style = {}, ...props }) {
  const handleClick = (e) => {
    sfx.click();
    if (onClick) onClick(e);
  };
  return (
    <button
      onClick={handleClick}
      disabled={disabled}
      className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] active:scale-[0.975] hover:brightness-110 shadow-sm hover:shadow-md disabled:opacity-50 disabled:pointer-events-none ${className}`}
      style={{ backgroundColor: T.brand, color: T.brandInk, ...style }}
      {...props}
    >
      {children}
    </button>
  );
}

export function GhostButton({ children, onClick, className = "", style = {}, ...props }) {
  const handleClick = (e) => {
    sfx.click();
    if (onClick) onClick(e);
  };
  return (
    <button
      onClick={handleClick}
      className={`inline-flex items-center justify-center gap-2 rounded-xl px-3.5 py-2 text-sm font-medium transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] hover:bg-[var(--surfaceAlt)] active:scale-[0.975] ${className}`}
      style={{ color: T.inkSoft, border: `1px solid ${T.border}`, backgroundColor: "transparent", ...style }}
      {...props}
    >
      {children}
    </button>
  );
}
