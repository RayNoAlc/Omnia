const fs = require('fs');
let layout = fs.readFileSync('src/layouts/AppLayout.jsx', 'utf8');

if (!layout.includes('Palette')) {
  layout = layout.replace('LogOut, Menu', 'LogOut, Menu, Palette, X');
}

if (!layout.includes('ThemeModal')) {
  const modalCode = "import { applyTheme, THEMES } from '../components/ui';\n\nfunction ThemeModal({ onClose }) {\n" +
"  return (\n" +
"    <div className=\"fixed inset-0 z-50 flex items-center justify-center p-4\" style={{ backgroundColor: 'rgba(13,25,23,0.65)' }} onClick={onClose}>\n" +
"      <div className=\"w-full max-w-sm rounded-2xl p-5 shadow-2xl\" style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }} onClick={e => e.stopPropagation()}>\n" +
"        <div className=\"flex items-center justify-between mb-4\">\n" +
"          <h3 className=\"text-lg font-bold\" style={{ color: 'var(--ink)' }}>Loja de Temas</h3>\n" +
"          <button onClick={onClose} style={{ color: 'var(--inkSoft)' }}><X className=\"w-5 h-5\" /></button>\n" +
"        </div>\n" +
"        <div className=\"space-y-3\">\n" +
"          {Object.keys(THEMES).map(t => (\n" +
"            <button key={t} onClick={() => { applyTheme(t); onClose(); }} className=\"w-full flex items-center justify-between p-3 rounded-lg border hover:opacity-80 transition-opacity\"\n" +
"              style={{ backgroundColor: THEMES[t].bg, borderColor: THEMES[t].border }}>\n" +
"              <span className=\"font-bold capitalize\" style={{ color: THEMES[t].ink }}>{t === 'dark' ? 'Omnia Dark (Padrão)' : t === 'light' ? 'Omnia Light' : t === 'cyberpunk' ? 'Cyberpunk Neon' : 'Lo-Fi Café'}</span>\n" +
"              <div className=\"flex gap-1\">\n" +
"                <div className=\"w-4 h-4 rounded-full\" style={{ backgroundColor: THEMES[t].brand }}></div>\n" +
"                <div className=\"w-4 h-4 rounded-full\" style={{ backgroundColor: THEMES[t].surface }}></div>\n" +
"              </div>\n" +
"            </button>\n" +
"          ))}\n" +
"        </div>\n" +
"      </div>\n" +
"    </div>\n" +
"  );\n" +
"}\n\n";

  layout = layout.replace('export function AppLayout', modalCode + 'export function AppLayout');
  
  // Inject state
  layout = layout.replace(
    /const \[isMobileMenuOpen, setIsMobileMenuOpen\] = useState\(false\);/,
    "const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);\n  const [isThemeModalOpen, setIsThemeModalOpen] = useState(false);"
  );
  
  // Inject button above Sair (Desktop)
  const desktopBtn = "<button onClick={() => setIsThemeModalOpen(true)} className=\"w-full flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg hover:bg-opacity-50 transition-colors\" style={{ color: T.inkSoft }}>\n" +
"              <Palette className=\"w-4 h-4\" /> Temas & Cores\n" +
"            </button>\n" +
"            <button onClick={onLogout}";
  layout = layout.replace(/<button onClick=\{onLogout\}/, desktopBtn);

  // Inject button above Sair (Mobile)
  const mobileBtn = "<button onClick={() => { setIsThemeModalOpen(true); setIsMobileMenuOpen(false); }} className=\"w-full flex items-center justify-center gap-2 px-4 py-3 mb-2 text-base font-bold rounded-xl\" style={{ backgroundColor: 'var(--surfaceAlt)', color: 'var(--ink)' }}>\n" +
"               <Palette className=\"w-5 h-5\" /> Temas\n" +
"              </button>\n" +
"               <button onClick={onLogout}";
  layout = layout.replace(/<button onClick=\{onLogout\}/, mobileBtn);

  // Inject Modal Render
  layout = layout.replace(
    /{isMobileMenuOpen && \(/,
    "{isThemeModalOpen && <ThemeModal onClose={() => setIsThemeModalOpen(false)} />}\n\n        {isMobileMenuOpen && ("
  );
}

fs.writeFileSync('src/layouts/AppLayout.jsx', layout, 'utf8');
