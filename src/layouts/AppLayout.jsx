import React, { useState, useEffect } from 'react';
import { LogOut, Menu, Palette, X, Download } from 'lucide-react';
import { TINT, applyTheme, THEMES, T } from '../components/ui';
import { sfx } from '../lib/soundEffects';
import { ReactiveBgmWidget } from '../components/ReactiveBgmWidget';
import { reactiveBgm } from '../lib/reactiveBgm';

export function AppLayout({ activeTab, onTabChange, onOpenTutorial, TABS, onLogout, isZen, config, children }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);

  useEffect(() => {
    window.__omniaSetTab = (tabId) => {
      try {
        sfx.tab();
        reactiveBgm.setTab(tabId);
        onTabChange(tabId);
      } catch (err) {
        console.error("Erro ao trocar de aba via QA:", err);
      }
    };
    return () => {
      delete window.__omniaSetTab;
    };
  }, [onTabChange]);

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
    <div className='flex h-screen overflow-hidden' style={{ backgroundColor: T.bg, color: T.ink, fontFamily: 'var(--font-family, inherit)' }}>
      {/* Subtle radial ambient highlight */}
      <div 
        className='fixed inset-0 pointer-events-none opacity-40 z-0'
        style={{
          background: `radial-gradient(circle at 15% 15%, ${T.brand}12, transparent 40%), radial-gradient(circle at 85% 85%, ${T.purple || T.brand}08, transparent 45%)`
        }}
      />

      {/* Sidebar (Desktop) */}
      <aside 
        className={`hidden ${isZen ? '' : 'md:flex'} w-64 flex-col border-r shadow-2xl relative transition-all duration-300`} 
        style={{ backgroundColor: T.surface, borderColor: T.border }}
      >
        <div className='p-6 flex items-center justify-center border-b' style={{ borderColor: T.border }}>
          <div className='h-16 w-36 transition-transform duration-300 hover:scale-105'>
            <div className='w-full h-full' style={{
              maskImage: 'url(/omnia.png)',
              WebkitMaskImage: 'url(/omnia.png)',
              maskSize: 'contain',
              WebkitMaskSize: 'contain',
              maskRepeat: 'no-repeat',
              WebkitMaskRepeat: 'no-repeat',
              maskPosition: 'center',
              WebkitMaskPosition: 'center',
              backgroundColor: 'var(--ink)'
            }} />
          </div>
        </div>

        <nav className='flex-1 px-3 py-5 space-y-1.5 overflow-y-auto custom-scrollbar'>
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                data-tab-nav={tab.id}
                onClick={() => {
                  sfx.tab();
                  reactiveBgm.setTab(tab.id);
                  onTabChange(tab.id);
                }}
                className={`group w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] haptic-press ${
                  isActive 
                    ? 'shadow-sm tab-active-glow pl-4' 
                    : 'hover:bg-white/[0.04] opacity-80 hover:opacity-100 hover:translate-x-0.5'
                }`}
                style={{
                  backgroundColor: isActive ? TINT.brand : 'transparent',
                  color: isActive ? T.brand : T.inkSoft,
                  border: isActive ? `1px solid ${T.brand}30` : '1px solid transparent'
                }}
              >
                <div 
                  className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all duration-200 ${
                    isActive ? 'scale-110 shadow-sm' : 'group-hover:scale-105'
                  }`}
                  style={{
                    backgroundColor: isActive ? `${T.brand}25` : 'transparent',
                    color: isActive ? T.brand : T.inkSoft
                  }}
                >
                  <Icon className={`w-4.5 h-4.5 ${isActive ? 'stroke-[2.5px]' : 'stroke-[1.75px]'}`} />
                </div>
                <span className="tracking-tight">{tab.label}</span>
              </button>
            );
          })}
        </nav>

        <div className='p-3.5 border-t space-y-2' style={{ borderColor: T.border, backgroundColor: 'rgba(0,0,0,0.02)' }}>
          {config?.enableMusic !== false && config?.enableBgm !== false && (
            <ReactiveBgmWidget currentTab={activeTab} className="mb-2" />
          )}
          {deferredPrompt && (
            <button 
              onClick={handleInstallPwa} 
              className='w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-bold rounded-xl shadow-sm hover:brightness-110 active:scale-[0.98] transition-all' 
              style={{ backgroundColor: T.brand, color: '#fff' }}
            >
              <Download className='w-3.5 h-3.5' /> Instalar App
            </button>
          )}
          <button 
            onClick={onLogout} 
            className='w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold rounded-xl transition-all duration-200 hover:bg-red-500/10 active:scale-[0.98]' 
            style={{ color: T.critico, border: `1px solid ${T.critico}20` }}
          >
            <LogOut className='w-3.5 h-3.5' /> Sair
          </button>
        </div>
      </aside>

      {/* Mobile Top Bar */}
      <div 
        className='md:hidden absolute top-0 left-0 right-0 h-16 border-b flex items-center justify-between px-4 z-30 backdrop-blur-xl' 
        style={{ backgroundColor: `${T.surface}EE`, borderColor: T.border }}
      >
        <div className='flex items-center'>
          <div className='h-9 w-24'>
            <div className='w-full h-full' style={{
              maskImage: 'url(/omnia.png)',
              WebkitMaskImage: 'url(/omnia.png)',
              maskSize: 'contain',
              WebkitMaskSize: 'contain',
              maskRepeat: 'no-repeat',
              WebkitMaskRepeat: 'no-repeat',
              maskPosition: 'center',
              WebkitMaskPosition: 'center',
              backgroundColor: 'var(--ink)'
            }} />
          </div>
        </div>
        <div className='flex items-center gap-2'>
          {deferredPrompt && (
            <button onClick={handleInstallPwa} className='px-3 py-1.5 text-xs font-bold rounded-lg shadow-sm active:scale-95 transition-transform' style={{ backgroundColor: T.brand, color: '#fff' }}>
              Baixar App
            </button>
          )}
          <button 
            onClick={() => setMobileOpen(!mobileOpen)} 
            className="p-2 rounded-xl transition-colors active:scale-95" 
            style={{ color: T.ink, backgroundColor: `${T.surfaceAlt}80` }}
          >
            {mobileOpen ? <X className='w-5 h-5' /> : <Menu className='w-5 h-5' />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className='md:hidden absolute inset-0 z-20 flex flex-col pt-16 backdrop-blur-2xl' style={{ backgroundColor: `${T.surface}FA` }}>
          <nav className='flex-1 px-4 py-5 space-y-1.5 overflow-y-auto custom-scrollbar'>
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  data-tab-nav={tab.id}
                  onClick={() => {
                    sfx.tab();
                    reactiveBgm.setTab(tab.id);
                    onTabChange(tab.id);
                    setMobileOpen(false);
                  }}
                  className={`w-full flex items-center gap-3.5 px-3.5 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
                    isActive ? 'shadow-sm tab-active-glow pl-4' : 'hover:bg-white/[0.04]'
                  }`}
                  style={{
                    backgroundColor: isActive ? TINT.brand : 'transparent',
                    color: isActive ? T.brand : T.inkSoft,
                    border: isActive ? `1px solid ${T.brand}30` : '1px solid transparent'
                  }}
                >
                  <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5px]' : 'stroke-[1.75px]'}`} />
                  {tab.label}
                </button>
              );
            })}
          </nav>
          <div className='p-4 border-t space-y-2' style={{ borderColor: T.border }}>
            {config?.enableMusic !== false && config?.enableBgm !== false && (
              <ReactiveBgmWidget currentTab={activeTab} className="mb-2" />
            )}
            <button onClick={onLogout} className='w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-bold rounded-xl active:scale-[0.98] transition-transform' style={{ backgroundColor: TINT.critico, color: T.critico }}>
              <LogOut className='w-4 h-4' /> Sair
            </button>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className='flex-1 overflow-y-auto custom-scrollbar md:pt-0 pt-16 relative' style={{ backgroundColor: T.bg }}>
        <div className='max-w-[1440px] mx-auto p-4 sm:p-6 md:p-8 min-h-full'>
          {children}
        </div>
      </main>
    </div>
  );
}
