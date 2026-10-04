const fs = require('fs');
let ui = fs.readFileSync('src/components/ui.jsx', 'utf8');

const newUI = "export const THEMES = {\n" +
"  dark: {\n" +
"    bg: '#0B1120', surface: '#141C2F', surfaceAlt: '#1E293B', ink: '#F1F5F9', inkSoft: '#94A3B8',\n" +
"    border: 'rgba(255,255,255,0.08)', brand: '#3B82F6', brandDark: '#2563EB', critico: '#EF4444', importante: '#F59E0B',\n" +
"    normal: '#3B82F6', baixa: '#94A3B8', purple: '#8B5CF6', pink: '#EC4899',\n" +
"    tintBrand: 'rgba(59, 130, 246, 0.15)', tintCritico: 'rgba(239, 68, 68, 0.15)', tintImportante: 'rgba(245, 158, 11, 0.15)', tintPurple: 'rgba(139, 92, 246, 0.15)'\n" +
"  },\n" +
"  light: {\n" +
"    bg: '#F8FAFC', surface: '#FFFFFF', surfaceAlt: '#F1F5F9', ink: '#0F172A', inkSoft: '#64748B',\n" +
"    border: 'rgba(0,0,0,0.1)', brand: '#2563EB', brandDark: '#1D4ED8', critico: '#DC2626', importante: '#D97706',\n" +
"    normal: '#2563EB', baixa: '#64748B', purple: '#7C3AED', pink: '#DB2777',\n" +
"    tintBrand: 'rgba(37, 99, 235, 0.1)', tintCritico: 'rgba(220, 38, 38, 0.1)', tintImportante: 'rgba(217, 119, 6, 0.1)', tintPurple: 'rgba(124, 58, 237, 0.1)'\n" +
"  },\n" +
"  cyberpunk: {\n" +
"    bg: '#0D0221', surface: '#1A0B2E', surfaceAlt: '#261447', ink: '#00FFCC', inkSoft: '#FF007F',\n" +
"    border: '#FF007F', brand: '#00FFCC', brandDark: '#00E5B7', critico: '#FF007F', importante: '#F59E0B',\n" +
"    normal: '#00FFCC', baixa: '#444444', purple: '#B537F2', pink: '#FF007F',\n" +
"    tintBrand: 'rgba(0, 255, 204, 0.2)', tintCritico: 'rgba(255, 0, 127, 0.2)', tintImportante: 'rgba(245, 158, 11, 0.2)', tintPurple: 'rgba(181, 55, 242, 0.2)'\n" +
"  },\n" +
"  lofi: {\n" +
"    bg: '#FDF6E3', surface: '#F4E8D1', surfaceAlt: '#E9DAC1', ink: '#5C4A3D', inkSoft: '#8D7A68',\n" +
"    border: 'rgba(92, 74, 61, 0.2)', brand: '#D4A373', brandDark: '#B8865C', critico: '#E07A5F', importante: '#F2CC8F',\n" +
"    normal: '#D4A373', baixa: '#A3A3A3', purple: '#9E8EAB', pink: '#DDA1A8',\n" +
"    tintBrand: 'rgba(212, 163, 115, 0.2)', tintCritico: 'rgba(224, 122, 95, 0.2)', tintImportante: 'rgba(242, 204, 143, 0.2)', tintPurple: 'rgba(158, 142, 171, 0.2)'\n" +
"  }\n" +
"};\n\n" +
"export const applyTheme = (themeName) => {\n" +
"  const theme = THEMES[themeName] || THEMES.dark;\n" +
"  Object.keys(theme).forEach(key => {\n" +
"    document.documentElement.style.setProperty('--' + key, theme[key]);\n" +
"  });\n" +
"  localStorage.setItem('omnia-theme', themeName);\n" +
"};\n\n" +
"export const T = {\n" +
"  bg: 'var(--bg)', surface: 'var(--surface)', surfaceAlt: 'var(--surfaceAlt)',\n" +
"  ink: 'var(--ink)', inkSoft: 'var(--inkSoft)', border: 'var(--border)',\n" +
"  brand: 'var(--brand)', brandDark: 'var(--brandDark)', critico: 'var(--critico)',\n" +
"  importante: 'var(--importante)', normal: 'var(--normal)', baixa: 'var(--baixa)',\n" +
"  purple: 'var(--purple)', pink: 'var(--pink)'\n" +
"};\n\n" +
"export const TINT = {\n" +
"  brand: 'var(--tintBrand)', critico: 'var(--tintCritico)',\n" +
"  importante: 'var(--tintImportante)', purple: 'var(--tintPurple)'\n" +
"};\n";

ui = ui.replace(
  /export const T = \{[\s\S]*?export const TINT = \{[\s\S]*?\};/,
  newUI
);

fs.writeFileSync('src/components/ui.jsx', ui, 'utf8');
