const fs = require('fs');
let tabs = fs.readFileSync('src/components/Tabs.jsx', 'utf8');

const modulesStart = tabs.indexOf("<h3 className='text-xl font-bold' style={{ color: T.ink }}>M");
if (modulesStart > -1) {
  const sectionStart = tabs.lastIndexOf("<section className='p-6", modulesStart);
  const sectionEnd = tabs.indexOf("</section>", sectionStart) + 10;
  
  const correctSection = `
        <section className='p-6 rounded-2xl shadow-sm border' style={{ backgroundColor: T.surface, borderColor: T.border }}>
          <div className='flex items-center gap-3 mb-4'>
            <Settings className='w-6 h-6' style={{ color: T.brand }} />
            <h3 className='text-xl font-bold' style={{ color: T.ink }}>Módulos Opcionais</h3>
          </div>
          <p className='mb-6' style={{ color: T.inkSoft }}>Ative ou desative funcionalidades secundárias para manter a interface limpa e objetiva.</p>
  
          <div className='space-y-4'>
            <label className='flex items-center justify-between p-4 rounded-xl border cursor-pointer hover:opacity-80 transition-opacity' style={{ borderColor: T.border, backgroundColor: T.bg }}>
              <div>
                <div className='font-bold' style={{ color: T.ink }}><BookHeart size={20} className="inline mr-2 -mt-1" /> Diário de Bordo e Humor</div>
                <div className='text-sm mt-1' style={{ color: T.inkSoft }}>Card na aba Hoje para registrar seu humor e pensamentos diários.</div>
              </div>
              <input type='checkbox' checked={safeConfig.enableJournal} onChange={() => handleToggle('enableJournal')} className='w-6 h-6 accent-blue-500' />
            </label>

            <label className='flex items-center justify-between p-4 rounded-xl border cursor-pointer hover:opacity-80 transition-opacity' style={{ borderColor: T.border, backgroundColor: T.bg }}>
              <div>
                <div className='font-bold' style={{ color: T.ink }}><MessageCircle size={20} className="inline mr-2 -mt-1" /> Coruja Sincera</div>
                <div className='text-sm mt-1' style={{ color: T.inkSoft }}>Balões de fala com dicas e avisos sobre o seu foco e progresso.</div>
              </div>
              <input type='checkbox' checked={safeConfig.enableSincereOwl} onChange={() => handleToggle('enableSincereOwl')} className='w-6 h-6 accent-blue-500' />
            </label>

            <label className='flex items-center justify-between p-4 rounded-xl border cursor-pointer hover:opacity-80 transition-opacity' style={{ borderColor: T.border, backgroundColor: T.bg }}>
              <div>
                <div className='font-bold' style={{ color: T.ink }}><PartyPopper size={20} className="inline mr-2 -mt-1" /> Animações de Conclusão</div>
                <div className='text-sm mt-1' style={{ color: T.inkSoft }}>Disparar confetes ao marcar tarefas como concluídas.</div>
              </div>
              <input type='checkbox' checked={safeConfig.enableConfetti} onChange={() => handleToggle('enableConfetti')} className='w-6 h-6 accent-blue-500' />
            </label>

            <label className='flex items-center justify-between p-4 rounded-xl border cursor-pointer hover:opacity-80 transition-opacity' style={{ borderColor: T.border, backgroundColor: T.bg }}>
              <div>
                <div className='font-bold' style={{ color: T.ink }}><Gamepad2 size={20} className="inline mr-2 -mt-1" /> Gamificação Completa</div>
                <div className='text-sm mt-1' style={{ color: T.inkSoft }}>Aba Desempenho, XP, Nível e Streak.</div>
              </div>
              <input type='checkbox' checked={safeConfig.enableGamification} onChange={() => handleToggle('enableGamification')} className='w-6 h-6 accent-blue-500' />
            </label>
  
            <label className='flex items-center justify-between p-4 rounded-xl border cursor-pointer hover:opacity-80 transition-opacity' style={{ borderColor: T.border, backgroundColor: T.bg }}>
              <div>
                <div className='font-bold' style={{ color: T.ink }}><Headphones size={20} className="inline mr-2 -mt-1" /> Modo Imersivo Lo-Fi</div>
                <div className='text-sm mt-1' style={{ color: T.inkSoft }}>Player de música ambiente integrado na aba Foco.</div>
              </div>
              <input type='checkbox' checked={safeConfig.enableLofi} onChange={() => handleToggle('enableLofi')} className='w-6 h-6 accent-blue-500' />
            </label>
  
            <label className='flex items-center justify-between p-4 rounded-xl border cursor-pointer hover:opacity-80 transition-opacity' style={{ borderColor: T.border, backgroundColor: T.bg }}>
              <div>
                <div className='font-bold' style={{ color: T.ink }}><Calendar size={20} className="inline mr-2 -mt-1" /> Sincronizar Calendário (Google/Apple)</div>
                <div className='text-sm mt-1' style={{ color: T.inkSoft }}>Botão para exportar arquivos .ics da Rotina.</div>
              </div>
              <input type='checkbox' checked={safeConfig.enableCalendar} onChange={() => handleToggle('enableCalendar')} className='w-6 h-6 accent-blue-500' />
            </label>
  
            <label className='flex items-center justify-between p-4 rounded-xl border cursor-pointer hover:opacity-80 transition-opacity' style={{ borderColor: T.border, backgroundColor: T.bg }}>
              <div>
                <div className='font-bold' style={{ color: T.ink }}><FileText size={20} className="inline mr-2 -mt-1" /> Gerar PDF da Rotina</div>
                <div className='text-sm mt-1' style={{ color: T.inkSoft }}>Botão para baixar a Tabela de Horários em PDF.</div>
              </div>
              <input type='checkbox' checked={safeConfig.enablePdf} onChange={() => handleToggle('enablePdf')} className='w-6 h-6 accent-blue-500' />
            </label>
          </div>
        </section>`;
        
  tabs = tabs.substring(0, sectionStart) + correctSection + tabs.substring(sectionEnd);
  fs.writeFileSync('src/components/Tabs.jsx', tabs, 'utf8');
  console.log("Fixed ConfigTab syntax again!");
}
