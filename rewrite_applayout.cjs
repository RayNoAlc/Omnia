const fs = require('fs');

const layoutCode = \import React, { useState, useEffect } from "react";
import { LogOut, Menu, Palette, X, Download } from "lucide-react";
import { TINT } from "../components/ui";

import { applyTheme, THEMES, T } from '../components/ui';

function ThemeModal({ onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(13,25,23,0.65)' }} onClick={onClose}>
      <div className="w-full max-w-sm rounded-2xl p-5 shadow-2xl" style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }} onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold" style={{ color: 'var(--ink)' }}>Loja de Temas</h3>
          <button onClick={onClose} style={{ color: 'var(--inkSoft)' }}><X className="w-5 h-5" /></button>
        </div>
        <div className="space-y-3">
          {Object.keys(THEMES).map(t => (
            <button key={t} onClick={() => { applyTheme(t); onClose(); }} className="w-full flex items-center justify-between p-3 rounded-lg border hover:opacity-80 transition-opacity"
              style={{ backgroundColor: THEMES[t].bg, borderColor: THEMES[t].border }}>
              <span className="font-bold capitalize" style={{ color: THEMES[t].ink }}>{t === 'dark' ? 'Omnia Dark (Padrão)' : t === 'light' ? 'Omnia Light' : t === 'cyberpunk' ? 'Cyberpunk Neon' : 'Lo-Fi Café'}</span>
              <div className="flex gap-1">
                <div className="w-4 h-4 rounded-full" style={{ backgroundColor: THEMES[t].brand }}></div>
                <div className="w-4 h-4 rounded-full" style={{ backgroundColor: THEMES[t].surface }}></div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export function AppLayout({ activeTab, onTabChange, TABS, onLogout, children }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isThemeModalOpen, setIsThemeModalOpen] = useState(false);

  const [deferredPrompt, setDeferredPrompt] = useState(null);
  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallPwa = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') setDeferredPrompt(null);
  };

  return (
    <div className="flex h-screen overflow-hidden" style={{ backgroundColor: T.bg, color: T.ink }}>
      {/* Sidebar (Desktop) */}
      <aside className="hidden md:flex w-64 flex-col border-r shadow-lg relative z-20" style={{ backgroundColor: T.surface, borderColor: T.border }}>
        <div className="p-6 flex items-center justify-center">
          <img src="/omnia.png" alt="Omnia" className="h-28 w-48 object-contain scale-110 drop-shadow-lg" style={{ filter: "brightness(1.5)" }} />
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto custom-scrollbar">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={\w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 \\}
                style={{
                  backgroundColor: isActive ? TINT.brand : "transparent",
                  color: isActive ? T.brand : T.inkSoft,
                }}
              >
                <Icon className={\w-5 h-5 \\} />
                {tab.label}
              </button>
            );
          })}
        </nav>
        <div className="p-4 border-t" style={{ borderColor: T.border }}>
          {deferredPrompt && (
            <button onClick={handleInstallPwa} className="w-full flex items-center gap-2 px-3 py-2 mb-2 text-sm font-bold rounded-lg hover:opacity-80 transition-opacity" style={{ backgroundColor: T.brand, color: '#fff' }}>
              <Download className="w-4 h-4" /> Instalar App
            </button>
          )}
          <button onClick={() => setIsThemeModalOpen(true)} className="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg hover:bg-opacity-50 transition-colors" style={{ color: T.inkSoft }}>
            <Palette className="w-4 h-4" /> Temas & Cores
          </button>
          <button onClick={onLogout} className="w-full flex items-center gap-2 px-3 py-2 mt-2 text-sm font-medium rounded-lg hover:bg-opacity-50 transition-colors" style={{ color: T.critico }}>
            <LogOut className="w-4 h-4" /> Sair
          </button>
        </div>
      </aside>

      {/* Mobile Top Bar */}
      <div className="md:hidden absolute top-0 left-0 right-0 h-16 border-b flex items-center justify-between px-4 z-30" style={{ backgroundColor: T.surface, borderColor: T.border }}>
        <div className="flex items-center">
          <img src="/omnia.png" alt="Omnia" className="h-12 w-32 object-contain scale-110" style={{ filter: "brightness(1.5)" }} />
        </div>
        <div className="flex items-center gap-3">
          {deferredPrompt && (
            <button onClick={handleInstallPwa} className="px-3 py-1.5 text-xs font-bold rounded-lg shadow-sm" style={{ backgroundColor: T.brand, color: '#fff' }}>
              Baixar App
            </button>
          )}
          <button onClick={() => setMobileOpen(!mobileOpen)} style={{ color: T.ink }}>
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {isThemeModalOpen && <ThemeModal onClose={() => setIsThemeModalOpen(false)} />}

      {mobileOpen && (
        <div className="md:hidden absolute inset-0 z-20 flex flex-col pt-16" style={{ backgroundColor: T.surface }}>
          <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    onTabChange(tab.id);
                    setMobileOpen(false);
                  }}
                  className={\w-full flex items-center gap-4 px-4 py-3 rounded-xl text-base font-medium transition-colors \\}
                  style={{
                    backgroundColor: isActive ? TINT.brand : "transparent",
                    color: isActive ? T.brand : T.inkSoft,
                  }}
                >
                  <Icon className={\w-6 h-6 \\} />
                  {tab.label}
                </button>
              );
            })}
          </nav>
          <div className="p-6 border-t" style={{ borderColor: T.border }}>
            <button onClick={() => { setIsThemeModalOpen(true); setMobileOpen(false); }} className="w-full flex items-center justify-center gap-2 px-4 py-3 mb-3 text-base font-bold rounded-xl" style={{ backgroundColor: 'var(--surfaceAlt)', color: 'var(--ink)' }}>
              <Palette className="w-5 h-5" /> Temas
            </button>
            <button onClick={onLogout} className="w-full flex items-center justify-center gap-2 px-4 py-3 text-base font-bold rounded-xl" style={{ backgroundColor: TINT.critico, color: T.critico }}>
              <LogOut className="w-5 h-5" /> Sair
            </button>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto custom-scrollbar md:pt-0 pt-16 relative bg-gradient-to-br from-[var(--bg-from)] to-[var(--bg-to)]" style={{ '--bg-from': T.bg, '--bg-to': '#0f172a' }}>
        <div className="max-w-[1400px] mx-auto p-4 md:p-8 min-h-full">
          {children}
        </div>
      </main>
    </div>
  );
}
\;

fs.writeFileSync('src/layouts/AppLayout.jsx', layoutCode, 'utf8');
