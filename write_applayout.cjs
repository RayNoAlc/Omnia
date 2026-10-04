const fs = require('fs');

const layoutCode = "import React, { useState, useEffect } from 'react';\n" +
"import { LogOut, Menu, Palette, X, Download } from 'lucide-react';\n" +
"import { TINT, applyTheme, THEMES, T } from '../components/ui';\n\n" +
"function ThemeModal({ onClose }) {\n" +
"  return (\n" +
"    <div className='fixed inset-0 z-50 flex items-center justify-center p-4' style={{ backgroundColor: 'rgba(13,25,23,0.65)' }} onClick={onClose}>\n" +
"      <div className='w-full max-w-sm rounded-2xl p-5 shadow-2xl' style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }} onClick={e => e.stopPropagation()}>\n" +
"        <div className='flex items-center justify-between mb-4'>\n" +
"          <h3 className='text-lg font-bold' style={{ color: 'var(--ink)' }}>Loja de Temas</h3>\n" +
"          <button onClick={onClose} style={{ color: 'var(--inkSoft)' }}><X className='w-5 h-5' /></button>\n" +
"        </div>\n" +
"        <div className='space-y-3'>\n" +
"          {Object.keys(THEMES).map(t => (\n" +
"            <button key={t} onClick={() => { applyTheme(t); onClose(); }} className='w-full flex items-center justify-between p-3 rounded-lg border hover:opacity-80 transition-opacity'\n" +
"              style={{ backgroundColor: THEMES[t].bg, borderColor: THEMES[t].border }}>\n" +
"              <span className='font-bold capitalize' style={{ color: THEMES[t].ink }}>{t === 'dark' ? 'Omnia Dark (Padrão)' : t === 'light' ? 'Omnia Light' : t === 'cyberpunk' ? 'Cyberpunk Neon' : 'Lo-Fi Café'}</span>\n" +
"              <div className='flex gap-1'>\n" +
"                <div className='w-4 h-4 rounded-full' style={{ backgroundColor: THEMES[t].brand }}></div>\n" +
"                <div className='w-4 h-4 rounded-full' style={{ backgroundColor: THEMES[t].surface }}></div>\n" +
"              </div>\n" +
"            </button>\n" +
"          ))}\n" +
"        </div>\n" +
"      </div>\n" +
"    </div>\n" +
"  );\n" +
"}\n\n" +
"export function AppLayout({ activeTab, onTabChange, TABS, onLogout, children }) {\n" +
"  const [mobileOpen, setMobileOpen] = useState(false);\n" +
"  const [isThemeModalOpen, setIsThemeModalOpen] = useState(false);\n" +
"  const [deferredPrompt, setDeferredPrompt] = useState(null);\n\n" +
"  useEffect(() => {\n" +
"    const handler = (e) => {\n" +
"      e.preventDefault();\n" +
"      setDeferredPrompt(e);\n" +
"    };\n" +
"    window.addEventListener('beforeinstallprompt', handler);\n" +
"    return () => window.removeEventListener('beforeinstallprompt', handler);\n" +
"  }, []);\n\n" +
"  const handleInstallPwa = async () => {\n" +
"    if (!deferredPrompt) return;\n" +
"    deferredPrompt.prompt();\n" +
"    const { outcome } = await deferredPrompt.userChoice;\n" +
"    if (outcome === 'accepted') setDeferredPrompt(null);\n" +
"  };\n\n" +
"  return (\n" +
"    <div className='flex h-screen overflow-hidden' style={{ backgroundColor: T.bg, color: T.ink }}>\n" +
"      {/* Sidebar (Desktop) */}\n" +
"      <aside className='hidden md:flex w-64 flex-col border-r shadow-lg relative z-20' style={{ backgroundColor: T.surface, borderColor: T.border }}>\n" +
"        <div className='p-6 flex items-center justify-center'>\n" +
"          <img src='/omnia.png' alt='Omnia' className='h-28 w-48 object-contain scale-110 drop-shadow-lg' style={{ filter: 'brightness(1.5)' }} />\n" +
"        </div>\n" +
"        <nav className='flex-1 px-3 py-4 space-y-1 overflow-y-auto custom-scrollbar'>\n" +
"          {TABS.map((tab) => {\n" +
"            const Icon = tab.icon;\n" +
"            const isActive = activeTab === tab.id;\n" +
"            return (\n" +
"              <button\n" +
"                key={tab.id}\n" +
"                onClick={() => onTabChange(tab.id)}\n" +
"                className={w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 }\n" +
"                style={{\n" +
"                  backgroundColor: isActive ? TINT.brand : 'transparent',\n" +
"                  color: isActive ? T.brand : T.inkSoft,\n" +
"                }}\n" +
"              >\n" +
"                <Icon className={w-5 h-5 } />\n" +
"                {tab.label}\n" +
"              </button>\n" +
"            );\n" +
"          })}\n" +
"        </nav>\n" +
"        <div className='p-4 border-t' style={{ borderColor: T.border }}>\n" +
"          {deferredPrompt && (\n" +
"            <button onClick={handleInstallPwa} className='w-full flex items-center gap-2 px-3 py-2 mb-2 text-sm font-bold rounded-lg hover:opacity-80 transition-opacity' style={{ backgroundColor: T.brand, color: '#fff' }}>\n" +
"              <Download className='w-4 h-4' /> Instalar App\n" +
"            </button>\n" +
"          )}\n" +
"          <button onClick={() => setIsThemeModalOpen(true)} className='w-full flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg hover:bg-opacity-50 transition-colors' style={{ color: T.inkSoft }}>\n" +
"            <Palette className='w-4 h-4' /> Temas & Cores\n" +
"          </button>\n" +
"          <button onClick={onLogout} className='w-full flex items-center gap-2 px-3 py-2 mt-2 text-sm font-medium rounded-lg hover:bg-opacity-50 transition-colors' style={{ color: T.critico }}>\n" +
"            <LogOut className='w-4 h-4' /> Sair\n" +
"          </button>\n" +
"        </div>\n" +
"      </aside>\n\n" +
"      {/* Mobile Top Bar */}\n" +
"      <div className='md:hidden absolute top-0 left-0 right-0 h-16 border-b flex items-center justify-between px-4 z-30' style={{ backgroundColor: T.surface, borderColor: T.border }}>\n" +
"        <div className='flex items-center'>\n" +
"          <img src='/omnia.png' alt='Omnia' className='h-12 w-32 object-contain scale-110' style={{ filter: 'brightness(1.5)' }} />\n" +
"        </div>\n" +
"        <div className='flex items-center gap-3'>\n" +
"          {deferredPrompt && (\n" +
"            <button onClick={handleInstallPwa} className='px-3 py-1.5 text-xs font-bold rounded-lg shadow-sm' style={{ backgroundColor: T.brand, color: '#fff' }}>\n" +
"              Baixar App\n" +
"            </button>\n" +
"          )}\n" +
"          <button onClick={() => setMobileOpen(!mobileOpen)} style={{ color: T.ink }}>\n" +
"            {mobileOpen ? <X className='w-6 h-6' /> : <Menu className='w-6 h-6' />}\n" +
"          </button>\n" +
"        </div>\n" +
"      </div>\n\n" +
"      {isThemeModalOpen && <ThemeModal onClose={() => setIsThemeModalOpen(false)} />}\n\n" +
"      {mobileOpen && (\n" +
"        <div className='md:hidden absolute inset-0 z-20 flex flex-col pt-16' style={{ backgroundColor: T.surface }}>\n" +
"          <nav className='flex-1 px-4 py-6 space-y-2 overflow-y-auto'>\n" +
"            {TABS.map((tab) => {\n" +
"              const Icon = tab.icon;\n" +
"              const isActive = activeTab === tab.id;\n" +
"              return (\n" +
"                <button\n" +
"                  key={tab.id}\n" +
"                  onClick={() => {\n" +
"                    onTabChange(tab.id);\n" +
"                    setMobileOpen(false);\n" +
"                  }}\n" +
"                  className={w-full flex items-center gap-4 px-4 py-3 rounded-xl text-base font-medium transition-colors }\n" +
"                  style={{\n" +
"                    backgroundColor: isActive ? TINT.brand : 'transparent',\n" +
"                    color: isActive ? T.brand : T.inkSoft,\n" +
"                  }}\n" +
"                >\n" +
"                  <Icon className={w-6 h-6 } />\n" +
"                  {tab.label}\n" +
"                </button>\n" +
"              );\n" +
"            })}\n" +
"          </nav>\n" +
"          <div className='p-6 border-t' style={{ borderColor: T.border }}>\n" +
"            <button onClick={() => { setIsThemeModalOpen(true); setMobileOpen(false); }} className='w-full flex items-center justify-center gap-2 px-4 py-3 mb-3 text-base font-bold rounded-xl' style={{ backgroundColor: 'var(--surfaceAlt)', color: 'var(--ink)' }}>\n" +
"              <Palette className='w-5 h-5' /> Temas\n" +
"            </button>\n" +
"            <button onClick={onLogout} className='w-full flex items-center justify-center gap-2 px-4 py-3 text-base font-bold rounded-xl' style={{ backgroundColor: TINT.critico, color: T.critico }}>\n" +
"              <LogOut className='w-5 h-5' /> Sair\n" +
"            </button>\n" +
"          </div>\n" +
"        </div>\n" +
"      )}\n\n" +
"      {/* Main Content Area */}\n" +
"      <main className='flex-1 overflow-y-auto custom-scrollbar md:pt-0 pt-16 relative bg-gradient-to-br from-[var(--bg-from)] to-[var(--bg-to)]' style={{ '--bg-from': T.bg, '--bg-to': '#0f172a' }}>\n" +
"        <div className='max-w-[1400px] mx-auto p-4 md:p-8 min-h-full'>\n" +
"          {children}\n" +
"        </div>\n" +
"      </main>\n" +
"    </div>\n" +
"  );\n" +
"}\n";

fs.writeFileSync('src/layouts/AppLayout.jsx', layoutCode, 'utf8');
