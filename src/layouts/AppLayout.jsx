import React, { useState, useEffect } from 'react';
import { LogOut, Menu, Palette, X, Download } from 'lucide-react';
import { TINT, applyTheme, THEMES, T } from '../components/ui';

export function AppLayout({ activeTab, onTabChange, TABS, onLogout, children }) {
  const [mobileOpen, setMobileOpen] = useState(false);
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
    <div className='flex h-screen overflow-hidden' style={{ backgroundColor: T.bg, color: T.ink }}>
      {/* Sidebar (Desktop) */}
      <aside className='hidden md:flex w-64 flex-col border-r shadow-lg relative z-20' style={{ backgroundColor: T.surface, borderColor: T.border }}>
        <div className='p-6 flex items-center justify-center'>
          <div className='h-20 w-40'><div className='w-full h-full' style={{
            maskImage: 'url(/omnia.png)',
            WebkitMaskImage: 'url(/omnia.png)',
            maskSize: 'contain',
            WebkitMaskSize: 'contain',
            maskRepeat: 'no-repeat',
            WebkitMaskRepeat: 'no-repeat',
            maskPosition: 'center',
            WebkitMaskPosition: 'center',
            backgroundColor: 'var(--ink)'
          }} /></div>
        </div>
        <nav className='flex-1 px-3 py-4 space-y-1 overflow-y-auto custom-scrollbar'>
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${isActive ? 'shadow-sm' : 'hover:bg-opacity-50'}`}
                style={{
                  backgroundColor: isActive ? TINT.brand : 'transparent',
                  color: isActive ? T.brand : T.inkSoft,
                }}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'animate-pulse' : ''}`} />
                {tab.label}
              </button>
            );
          })}
        </nav>
        <div className='p-4 border-t' style={{ borderColor: T.border }}>
          {deferredPrompt && (
            <button onClick={handleInstallPwa} className='w-full flex items-center gap-2 px-3 py-2 mb-2 text-sm font-bold rounded-lg hover:opacity-80 transition-opacity' style={{ backgroundColor: T.brand, color: '#fff' }}>
              <Download className='w-4 h-4' /> Instalar App
            </button>
          )}
                    <button onClick={onLogout} className='w-full flex items-center gap-2 px-3 py-2 mt-2 text-sm font-medium rounded-lg hover:bg-opacity-50 transition-colors' style={{ color: T.critico }}>
            <LogOut className='w-4 h-4' /> Sair
          </button>
        </div>
      </aside>

      {/* Mobile Top Bar */}
      <div className='md:hidden absolute top-0 left-0 right-0 h-16 border-b flex items-center justify-between px-4 z-30' style={{ backgroundColor: T.surface, borderColor: T.border }}>
        <div className='flex items-center'>
          <div className='h-10 w-28'><div className='w-full h-full' style={{
            maskImage: 'url(/omnia.png)',
            WebkitMaskImage: 'url(/omnia.png)',
            maskSize: 'contain',
            WebkitMaskSize: 'contain',
            maskRepeat: 'no-repeat',
            WebkitMaskRepeat: 'no-repeat',
            maskPosition: 'center',
            WebkitMaskPosition: 'center',
            backgroundColor: 'var(--ink)'
          }} /></div>
        </div>
        <div className='flex items-center gap-3'>
          {deferredPrompt && (
            <button onClick={handleInstallPwa} className='px-3 py-1.5 text-xs font-bold rounded-lg shadow-sm' style={{ backgroundColor: T.brand, color: '#fff' }}>
              Baixar App
            </button>
          )}
          <button onClick={() => setMobileOpen(!mobileOpen)} style={{ color: T.ink }}>
            {mobileOpen ? <X className='w-6 h-6' /> : <Menu className='w-6 h-6' />}
          </button>
        </div>
      </div>

            {mobileOpen && (
        <div className='md:hidden absolute inset-0 z-20 flex flex-col pt-16' style={{ backgroundColor: T.surface }}>
          <nav className='flex-1 px-4 py-6 space-y-2 overflow-y-auto'>
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
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${isActive ? 'shadow-sm' : 'hover:bg-opacity-50'}`}
                  style={{
                    backgroundColor: isActive ? TINT.brand : 'transparent',
                    color: isActive ? T.brand : T.inkSoft,
                  }}
                >
                  <Icon className={`w-5 h-5 ${isActive ? 'animate-pulse' : ''}`} />
                  {tab.label}
                </button>
              );
            })}
          </nav>
          <div className='p-6 border-t' style={{ borderColor: T.border }}>
                        <button onClick={onLogout} className='w-full flex items-center justify-center gap-2 px-4 py-3 text-base font-bold rounded-xl' style={{ backgroundColor: TINT.critico, color: T.critico }}>
              <LogOut className='w-5 h-5' /> Sair
            </button>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className='flex-1 overflow-y-auto custom-scrollbar md:pt-0 pt-16 relative' style={{ backgroundColor: T.bg }}>
        <div className='max-w-[1400px] mx-auto p-4 md:p-8 min-h-full'>
          {children}
        </div>
      </main>
    </div>
  );
}
