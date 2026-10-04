const fs = require('fs');
let tabs = fs.readFileSync('src/components/Tabs.jsx', 'utf8');

tabs = tabs.replace(/Configuraes/g, "Configurações");
tabs = tabs.replace(/AparǦncia e Temas/g, "Aparência e Temas");
tabs = tabs.replace(/se ajustarǭ automaticamente/g, "se ajustará automaticamente");
tabs = tabs.replace(/Lo-Fi CafǸ/g, "Lo-Fi Café");
tabs = tabs.replace(/Mdulos Opcionais/g, "Módulos Opcionais");
tabs = tabs.replace(/funcionalidades secundǭrias para/g, "funcionalidades secundárias para");

tabs = tabs.replace(/YZ Gamificaǜo Completa/g, "🎮 Gamificação Completa");
tabs = tabs.replace(/Nvel e Streak/g, "Nível e Streak");

tabs = tabs.replace(/YZ Modo Imersivo Lo-Fi/g, "🎧 Modo Imersivo Lo-Fi");
tabs = tabs.replace(/mǧsica ambiente integrado/g, "música ambiente integrado");

tabs = tabs.replace(/Y"\. Sincronizar Calendǭrio/g, "📅 Sincronizar Calendário");
tabs = tabs.replace(/Botǜo para exportar/g, "Botão para exportar");

tabs = tabs.replace(/Y"" Gerar PDF da Rotina/g, "📄 Gerar PDF da Rotina");
tabs = tabs.replace(/Botǜo para baixar/g, "Botão para baixar");
tabs = tabs.replace(/Tabela de Horǭrios/g, "Tabela de Horários");

fs.writeFileSync('src/components/Tabs.jsx', tabs, 'utf8');
