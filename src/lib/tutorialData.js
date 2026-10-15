/**
 * Omnia Knowledge Base & Master Tutorial Registry
 * 
 * REGRA DE OURO DO OMNIA:
 * Qualquer nova funcionalidade, botão, comando ou recurso adicionado ao Omnia
 * DEVE ser registrado neste arquivo para ser incluído no Tour Interativo
 * e no Manual de Referência do Estudante. Nenhuma função deve ficar de fora.
 */

export const TUTORIAL_STEPS = [
  // --- 1. INTRODUÇÃO GERAL ---
  {
    id: 'intro-welcome',
    tab: 'hoje',
    targetSelector: null,
    badge: 'BOAS-VINDAS',
    title: 'Bem-vindo ao Omnia: Sua Vida Universitária em um Só Lugar',
    description: 'O Omnia é seu ecossistema acadêmico integrado, combinando gestão de tempo, inteligência artificial, materiais de aula, gamificação e foco sem ansiedade.',
    features: [
      'Navegação fluida entre 10 abas especializadas na sua jornada acadêmica.',
      'Sincronização de rotina, compromissos, simulados e materiais com a nuvem.',
      'Assistência contínua por IA para resumir aulas, criar flashcards e prever bancas de professores.'
    ],
    tip: 'Você pode reabrir este tutorial ou consultar o Manual a qualquer momento pressionando Ctrl+K ou digitando /tutorial na Secretária.',
    actionText: 'Começar o Tour Completo'
  },

  // --- 2. ABA HOJE ---
  {
    id: 'hoje-overview',
    tab: 'hoje',
    targetSelector: '[data-tab-nav="hoje"]',
    badge: '1. ABA HOJE',
    title: 'Painel Central & Visão Geral do Dia',
    description: 'Aqui começa o seu dia. O painel central reúne métricas de estudo, blocos de foco agendados, avisos de urgência e seu mascote companheiro.',
    features: [
      'Frase motivacional diária personalizada para manter o ritmo acadêmico.',
      'Métricas ao vivo: minutos estudados hoje, blocos concluídos e tarefas pendentes.',
      'Avisos inteligentes com contagem regressiva para provas e entregas críticas.'
    ],
    tip: 'Confira este painel logo pela manhã para alinhar suas prioridades sem estresse.',
    actionText: 'Conhecer o Mascote'
  },
  {
    id: 'hoje-pet-companion',
    tab: 'hoje',
    targetSelector: null,
    badge: '1. ABA HOJE • MASCOTE',
    title: 'Mascote de Foco, Cuidados & Loja de Skins',
    description: 'Seu companheiro de estudo reage em tempo real ao seu progresso. Ele dorme quando você descansa, foca com você no timer e comemora suas ofensivas.',
    features: [
      '6 Mascotes Únicos em pixel art: Coruja Omnia, Gato Mochi, Shiba Bento, Panda Bamboo, Raposa Kitsune e Coelho Pipoca.',
      'Renomear Mascote: clique sobre o nome do mascote para dar a ele um apelido personalizado.',
      'Loja de Skins & Petiscos: use moedas de estudo para desbloquear novos pets ou alimentá-los (Maçã, Biscoito, Café Turbo ou Poção Estelar).',
      'Energia & Nível: alimente seu mascote para restaurar sua energia e mantê-lo animado.'
    ],
    tip: 'Ao concluir sessões de foco você recebe +25 moedas de estudo para gastar na loja!',
    actionText: 'Ver Rotina & Hábitos'
  },

  // --- 3. ABA ROTINA ---
  {
    id: 'rotina-grid',
    tab: 'rotina',
    targetSelector: '[data-tab-nav="rotina"]',
    badge: '2. ABA ROTINA',
    title: 'Grade Semanal Fixa & Gestão de Hábitos',
    description: 'Organize sua estrutura semanal contínua para não perder prazos nem negligenciar sono, saúde e academia.',
    features: [
      'Grade Semanal Completa: visualize sua semana de segunda a domingo das 06h às 23h.',
      'Blocos Fixos: cadastre aulas da faculdade, estágio, trabalho, academia e horários de sono.',
      'Botão "Novo Bloco": defina horário de início, término, dia da semana, cor e disciplina.',
      'Ajuste de Exceções: registre feriados ou dias pontuais em que a rotina normal não se aplica.',
      'Rastreador de Hábitos (Habit Tracker): marque hábitos diários e acompanhe suas streaks consecutivas.'
    ],
    tip: 'Clique em "Exportar Calendário (.ics)" para sincronizar com Google Calendar ou Apple Agenda.',
    actionText: 'Ver Agenda & Tarefas'
  },

  // --- 4. ABA AGENDA ---
  {
    id: 'agenda-commitments',
    tab: 'agenda',
    targetSelector: '[data-tab-nav="agenda"]',
    badge: '3. ABA AGENDA',
    title: 'Compromissos, Provas & Algoritmo de Blocos',
    description: 'O cérebro do seu planejamento. Cadastre prazos e deixe o algoritmo calcular automaticamente sua carga horária de revisão.',
    features: [
      'Novo Compromisso: cadastre Provas, Trabalhos, Entregas, Apresentações e Eventos com peso e data limite.',
      'Algoritmo Inteligente de Estudo: gera blocos de estudo distribuídos nos dias anteriores para nunca acumular matéria de véspera.',
      'Filtros Avançados: visualize por disciplina, tipo de atividade ou apenas tarefas pendentes.',
      'Exportação em PDF Analítico: gere um relatório formal com tabelas de prazos e notas para arquivar ou imprimir.',
      'Exportar .ics: adicione alertas diretamente no calendário do seu smartphone.'
    ],
    tip: 'Prioridades Críticas e Altas recebem blocos de revisão com maior frequência no seu cronograma.',
    actionText: 'Conhecer o Foco & Batalha RPG'
  },

  // --- 5. ABA FOCO ---
  {
    id: 'foco-pomodoro-rpg',
    tab: 'foco',
    targetSelector: '[data-tab-nav="foco"]',
    badge: '4. ABA FOCO',
    title: 'Pomodoro Adaptativo & Batalha RPG contra Chefões',
    description: 'Entre na zona de foco supremo enquanto derrota os monstros acadêmicos com o poder da sua concentração.',
    features: [
      'Presets de Pomodoro: alterne entre Pomodoro Clássico (25/5), Deep Work (50/10), Sprint Rápido (15/3) ou personalize minutos livremente.',
      'Batalha RPG de Chefões: enfrente o Gólem da Procrastinação, Dragão dos Prazos Atrasados, Espectro da Exaustão Mental ou o Titã da Prova Final.',
      'Dano em Tempo Real: cada minuto focado diminui o HP do chefão. Toque nele na tela para ver o efeito clássico de dano crítico!',
      'Modo Zen (Tela Cheia): remove todas as distrações visuais para uma imersão 100% silenciosa.',
      'Respiração Guiada (Box Breathing 4-4-4-4): acalme o coração e reduza a ansiedade antes de começar a estudar.',
      'Pausa Saudável: alertas discretos a cada 20 min lembrando de beber água, alongar e descansar a vista.',
      'Scratchpad de Rascunho: anote pensamentos intrusivos sem sair da tela de foco.'
    ],
    tip: 'Descubra a fraqueza de cada chefão no card de combate para derrotá-lo com maior bônus de XP!',
    actionText: 'Ver Sala Multiplayer'
  },
  {
    id: 'foco-multiplayer-audio',
    tab: 'foco',
    targetSelector: null,
    badge: '4. ABA FOCO • MULTIPLAYER & ÁUDIO',
    title: 'Estudo em Grupo Síncrono & Trilha Sonora BGM',
    description: 'Estude acompanhado de colegas em tempo real e relaxe a mente com trilhas sonoras sintetizadas.',
    features: [
      'Sala de Estudo Multiplayer: crie uma sala privada ou compartilhe o link com sua turma para estudarem juntos.',
      'Presença em Tempo Real: veja os mascotes dos seus amigos estudando lado a lado com você.',
      'BGM Reativa: sintetizador procedural de música ambiente chill / lofi sintetizado via Web Audio.',
      'Players Integrados: conecte playlists do YouTube Music ou Spotify diretamente na sessão.'
    ],
    tip: 'Estudar em grupo aumenta o compromisso mútuo e reduz em 60% a tentação de abrir redes sociais.',
    actionText: 'Conhecer a Biblioteca'
  },

  // --- 6. ABA BIBLIOTECA ---
  {
    id: 'biblioteca-materials',
    tab: 'biblioteca',
    targetSelector: '[data-tab-nav="biblioteca"]',
    badge: '5. ABA BIBLIOTECA',
    title: 'Materiais de Aula, Leitor PDF & Mapas Mentais',
    description: 'Centralize todos os PDFs, slides e notas da faculdade em um repositório seguro e inteligente.',
    features: [
      'Upload Direto de Arquivos: envie PDFs, documentos e imagens que ficam salvos na nuvem.',
      'Leitor de PDF Integrado: visualize materiais diretamente no app com zoom, busca textual e modo noturno.',
      'Mapa Mental Interativo: converta qualquer material em um mapa conceitual navegável com um clique.',
      'Resumos da Comunidade: acesse materiais compartilhados por outros estudantes da rede Omnia.',
      'Filtros por Disciplina e Semestre: nunca mais perca um PDF de cálculo ou anatomia.'
    ],
    tip: 'Os textos extraídos dos seus PDFs podem ser enviados diretamente para a IA gerar resumos e simulados.',
    actionText: 'Explorar Resumos & IA'
  },

  // --- 7. ABA RESUMOS ---
  {
    id: 'resumos-ia-flashcards',
    tab: 'resumos',
    targetSelector: '[data-tab-nav="resumos"]',
    badge: '6. ABA RESUMOS',
    title: 'Sínteses Inteligentes & Flashcards com Repetição Espaçada',
    description: 'Acelere seu aprendizado com resumos acadêmicos estruturados e memorização de longo prazo.',
    features: [
      'Gerador de Resumos por IA: cole notas ou anexe documentos para receber resumos estruturados com conceitos-chave.',
      'Suporte a Markdown & LaTeX: tabelas organizadas, blocos de código com destaque e fórmulas matemáticas elegantes.',
      'Flashcards Inteligentes: gere perguntas e respostas automaticamente para memorizar definições difíceis.',
      'Repetição Espaçada (Spaced Repetition): o algoritmo calcula o dia ideal para revisar cada cartão antes de você esquecer.',
      'Exportar Resumo em PDF: formate e imprima resumos de aula com cabeçalho limpo.'
    ],
    tip: 'Revisar flashcards 10 minutos por dia aumenta a retenção de matéria em até 80% antes das provas.',
    actionText: 'Ver Simulados & Quiz'
  },

  // --- 8. ABA QUIZ ---
  {
    id: 'quiz-simulados',
    tab: 'quiz',
    targetSelector: '[data-tab-nav="quiz"]',
    badge: '7. ABA QUIZ',
    title: 'Simulados Dinâmicos & Testes de Conhecimento',
    description: 'Treine com questões inéditas formuladas pela IA com base exatamente no conteúdo da sua disciplina.',
    features: [
      'Geração de Provas por IA: escolha a matéria e a quantidade de perguntas para gerar um teste customizado.',
      'Múltipla Escolha Interativa: responda com temporizador opcional para simular a pressão da prova.',
      'Correção Didática Imediata: entenda por que a alternativa correta é a certa e onde estava a pegadinha das incorretas.',
      'Histórico de Desempenho: acompanhe sua evolução percentual e receba recompensas de XP e moedas ao acertar.'
    ],
    tip: 'Fazer simulados práticos é o método cientificamente comprovado com maior eficácia para notas máximas.',
    actionText: 'Ver Avaliador de Professores'
  },

  // --- 9. ABA PROFESSOR ---
  {
    id: 'professor-evaluator',
    tab: 'professor',
    targetSelector: '[data-tab-nav="professor"]',
    badge: '8. ABA PROFESSOR',
    title: 'Análise de Bancas & Estratégia de Prova',
    description: 'Descubra com antecedência como cada professor cobra a matéria para estudar exatamente o que cai.',
    features: [
      'Análise Pedagógica por IA: insira o nome do docente e a ementa da matéria para decifrar seu padrão de avaliação.',
      'Estilo de Prova: identifique se a preferência do professor é cálculo passo a passo, conceitos teóricos ou pegadinhas de múltipla escolha.',
      'Recomendações Estratégicas: dicas práticas de como formatar respostas dissertativas para garantir nota 10.',
      'Histórico de Docentes: consulte a qualquer momento as estratégias de professores de semestres anteriores.'
    ],
    tip: 'Cada professor tem um viés acadêmico. Saber o que ele valoriza economiza dezenas de horas de estudo cego.',
    actionText: 'Conhecer a Secretária IA'
  },

  // --- 10. ABA SECRETÁRIA ---
  {
    id: 'secretaria-chat',
    tab: 'secretaria',
    targetSelector: '[data-tab-nav="secretaria"]',
    badge: '9. ABA SECRETÁRIA',
    title: 'Sua Tutora & Secretária Acadêmica 24 Horas',
    description: 'Um canal direto de conversa com uma inteligência artificial que conhece sua grade, tarefas e histórico.',
    features: [
      'Chat com IA Acadêmica: tire dúvidas conceituais, peça cronogramas de estudo ou reescreva parágrafos acadêmicos.',
      'Visão Computacional: envie fotos de exercícios difíceis, gráficos ou anotações na lousa para a IA resolver e explicar.',
      'Entrada por Áudio: grave mensagens de voz quando estiver sem tempo para digitar.',
      'Comandos Especiais:',
      '  • /tutorial ou /guia: abre o tutorial completo da aplicação a qualquer instante.',
      '  • /hide-dev: esconde opções de desenvolvedor e diagnósticos de teste.',
      '  • /dev: alterna as ferramentas de desenvolvedor.',
      '  • /qa: aciona a checagem rápida de integridade dos módulos.'
    ],
    tip: 'Experimente pedir: "Secretária, planeje minha rotina de revisão para a prova de sexta-feira".',
    actionText: 'Ver Diário de Bordo'
  },

  // --- 11. ABA DIÁRIO ---
  {
    id: 'diario-wellness',
    tab: 'diario',
    targetSelector: '[data-tab-nav="diario"]',
    badge: '10. ABA DIÁRIO',
    title: 'Diário de Bordo, Humor & Saúde Mental',
    description: 'Acompanhe seu bem-estar emocional e mantenha um registro reflexivo da sua evolução acadêmica.',
    features: [
      'Rastreador de Humor: registre se você está se sentindo Excelente, Bem, Neutro, Cansado ou Exausto.',
      'Prompts Norteadores: perguntas guiadas para reflexão diária (vitórias, lições aprendidas, gratidão, energias drenadas).',
      'Tags Emocionais: categorize com facilidade (#foco, #ansiedade, #vitória, #gratidão).',
      'Linha do Tempo: revise seus desabafos e memórias para notar o quanto você amadureceu ao longo do semestre.'
    ],
    tip: 'Escrever por apenas 3 minutos ao final do dia diminui a ansiedade e melhora comprovadamente a qualidade do sono.',
    actionText: 'Ver Configurações & Personalização'
  },

  // --- 12. ABA CONFIGURAÇÕES ---
  {
    id: 'config-settings',
    tab: 'config',
    targetSelector: '[data-tab-nav="config"]',
    badge: '11. CONFIGURAÇÕES',
    title: 'Personalização Estética, Temas, Biometria & Módulos',
    description: 'Adapte o Omnia exatamente ao seu gosto visual, garantindo privacidade biométrica e controle total dos recursos.',
    features: [
      'Aparência & Estilo: escolha entre os temas elegantes como Aiko (estética rosada pastel suave), Minimal, Cyberpunk, Café e Floresta.',
      'Tipografia Ergonômica: alterne entre fontes modernas (Plus Jakarta Sans, Inter, Fira Code, Outfit e Serifas).',
      'Módulos & Recursos: ligue ou desligue pets, chefões RPG, música ambiente, gamificação e diário com um único interruptor.',
      'Dados & Segurança: ative o Bloqueio Biométrico (Touch ID / Face ID / WebAuthn) ou defina um PIN numérico para proteger seus dados em computadores compartilhados.',
      'Exportação Total: faça backup de todas as suas matérias, notas e compromissos em arquivos JSON ou Markdown.',
      'Extensão do Chrome: baixe o pacote .zip para recortar materiais de qualquer página da web direto para o Omnia.'
    ],
    tip: 'No tema Aiko com fonte Plus Jakarta Sans, a legibilidade para longas sessões de leitura é máxima!',
    actionText: 'Ver Atalhos Globais'
  },

  // --- 13. RECURSOS GLOBAIS ---
  {
    id: 'global-shortcuts-search',
    tab: 'hoje',
    targetSelector: null,
    badge: '12. RECURSOS GLOBAIS',
    title: 'Busca Global, Atalhos de Teclado & Instalação PWA',
    description: 'Acelere sua navegação com recursos mestres disponíveis em qualquer lugar do aplicativo.',
    features: [
      'Busca Global (Ctrl + K): localize instantaneamente qualquer compromisso, nota, resumo, material ou comando.',
      'Atalhos de Teclado Rápidos:',
      '  • F: Navega direto para a aba Foco',
      '  • C: Abre a Agenda / Calendário',
      '  • B: Abre a Biblioteca de Materiais',
      '  • H: Retorna ao Painel Hoje',
      '  • ?: Exibe o resumo de atalhos',
      'Retrospectiva Omnia Wrapped: gere cartões com estatísticas anuais dos seus estudos e compartilhe com amigos.',
      'Instalar como PWA: clique em "Instalar App" para ter o Omnia como aplicativo nativo no celular ou PC com suporte offline.'
    ],
    tip: 'Pressione Ctrl+K a qualquer momento para buscar qualquer matéria ou abrir o tutorial.',
    actionText: 'Concluir Tutorial'
  }
];

/**
 * Enciclopédia & Manual Completo de Referência do Estudante
 * Documenta com profundidade cada botão, fórmula e funcionalidade.
 */
export const OMNIA_MANUAL_SECTIONS = [
  {
    id: 'manual-hoje',
    title: '1. Painel Hoje & Mascote Companheiro',
    tab: 'hoje',
    iconName: 'Sun',
    summary: 'Central de comando diário com métricas de estudo, mascote interativo e avisos prioritários.',
    items: [
      {
        name: 'Frase Motivacional & Saudação',
        type: 'Elemento Visual',
        desc: 'Adapta a saudação ao horário (Bom dia, Boa tarde, Boa noite) e exibe pensamentos inspiradores de grandes acadêmicos e cientistas.'
      },
      {
        name: 'Métricas Rápidas (Cards de Topo)',
        type: 'Indicadores',
        desc: 'Exibe o tempo total estudado no dia atual em minutos, a contagem de tarefas e os blocos de estudo completados.'
      },
      {
        name: 'Mascote de Foco (Pet Companion)',
        type: 'Mascote Interativo',
        desc: 'Companheiro animado em pixel art que reage ao status de estudo: "Dormindo..." quando ocioso, "Focando!" com óculos escuros no timer de trabalho, e "Mestre da Rotina" quando em ofensiva alta.'
      },
      {
        name: 'Alimentação do Mascote (Petiscos)',
        type: 'Gamificação & Cuidado',
        desc: 'Disponibiliza 4 alimentos: Maçã de Foco (15 moedas / +20 energia), Biscoito Crocante (30 moedas / +35 energia), Café Expresso (50 moedas / +50 energia) e Poção Estelar (80 moedas / +100 energia). Mantém a barra de energia no verde.'
      },
      {
        name: 'Loja de Mascotes & Moedas de Estudo',
        type: 'Economia do App',
        desc: 'Permite trocar de mascote entre Coruja, Gato, Shiba, Panda, Raposa e Coelho. Moedas são obtidas estudando com foco (+25 moedas por bloco) ou pelo botão bônus (+100 moedas).'
      },
      {
        name: 'Avisos Inteligentes de Provas & Entregas',
        type: 'Alertas Críticos',
        desc: 'Varre os compromissos cadastrados e avisa quando uma prova ou entrega está a menos de 7 dias, destacando urgência máxima em vermelho ou laranja.'
      },
      {
        name: 'Blocos de Estudo do Dia',
        type: 'Lista Interativa',
        desc: 'Exibe os blocos que você deve estudar hoje. Cada bloco possui checkbox de conclusão, indicador da disciplina e tempo estimado.'
      }
    ]
  },
  {
    id: 'manual-rotina',
    title: '2. Rotina Semanal & Rastreador de Hábitos',
    tab: 'rotina',
    iconName: 'CalendarDays',
    summary: 'Estruturação contínua dos horários fixos e construção de hábitos duradouros.',
    items: [
      {
        name: 'Grade Horária Semanal',
        type: 'Tabela Dinâmica',
        desc: 'Grade matricial visual dividida por dias da semana (Seg a Dom) e faixas horárias (das 06h às 23h), facilitando enxergar janelas livres.'
      },
      {
        name: 'Botão "Novo Bloco de Rotina"',
        type: 'Ação / Formulário',
        desc: 'Abre o formulário para registrar aula presencial, estágio, sono, academia ou refeição, escolhendo cor e dias de recorrência.'
      },
      {
        name: 'Ajuste de Exceções',
        type: 'Gerenciador',
        desc: 'Permite desativar ou alterar blocos em datas comemorativas ou feriados sem deletar a rotina padrão.'
      },
      {
        name: 'Rastreador de Hábitos (Habits Tracker)',
        type: 'Gamificação & Disciplina',
        desc: 'Checklist diário para hábitos saudáveis (beber água, ler 10 páginas, dormir antes da meia-noite). Registra a ofensiva contínua.'
      },
      {
        name: 'Exportação .ics para Celular',
        type: 'Integração Externa',
        desc: 'Gera um arquivo de padrão universal iCalendar (.ics) compatível com Google Agenda, Apple Calendar, Outlook e Thunderbird.'
      }
    ]
  },
  {
    id: 'manual-agenda',
    title: '3. Agenda, Prazos & Algoritmo de Blocos',
    tab: 'agenda',
    iconName: 'Calendar',
    summary: 'Gerenciamento de datas acadêmicas cruciais e distribuição inteligente de estudo pré-prova.',
    items: [
      {
        name: 'Cadastro de Compromisso Acadêmico',
        type: 'Formulário Completo',
        desc: 'Registra data, disciplina, título, tipo (Prova, Trabalho, Apresentação, Entrega, Evento) e prioridade (Baixa, Média, Alta, Crítica).'
      },
      {
        name: 'Algoritmo de Geração de Blocos',
        type: 'Automação Inteligente',
        desc: 'Calcula a distância em dias até a entrega e distribui blocos de estudo diários nos horários livres da sua rotina, garantindo preparação gradual.'
      },
      {
        name: 'Exportar Tabela em PDF',
        type: 'Relatório',
        desc: 'Compila todos os compromissos em um documento PDF diagramado com jsPDF e tabelas analíticas para consulta impressa ou arquivamento.'
      },
      {
        name: 'Filtros Rápidos por Disciplina e Tipo',
        type: 'Navegação',
        desc: 'Permite isolar apenas as provas de uma matéria específica ou focar exclusivamente nas tarefas com prazo mais apertado.'
      }
    ]
  },
  {
    id: 'manual-foco',
    title: '4. Foco, Pomodoro & Batalha RPG contra Chefões',
    tab: 'foco',
    iconName: 'Clock',
    summary: 'Ambiente imersivo com cronômetro adaptativo, chefões RPG reativos e ferramentas de relaxamento.',
    items: [
      {
        name: 'Timer Pomodoro & Presets',
        type: 'Cronômetro',
        desc: 'Controle de Trabalho e Pausa. Botões pré-configurados: Pomodoro Tradicional (25m/5m), Deep Work (50m/10m), Sprint (15m/3m) ou minutos livres.'
      },
      {
        name: 'Arena RPG de Chefões Acadêmicos',
        type: 'Gamificação & Estudo',
        desc: 'Combata 4 monstros: Gólem da Procrastinação, Dragão dos Prazos Atrasados, Espectro da Exaustão Mental e Titã da Prova Final. Cada minuto reduz o HP do chefe.'
      },
      {
        name: 'Golpe de Foco Interativo (Sprite Hurt)',
        type: 'Animação & Reação',
        desc: 'Ao tocar no chefão durante a sessão, ele entra no estado "levando dano" em tom carmesim vibrante com balão de dano crítico e tremor visual.'
      },
      {
        name: 'Sala de Estudo Multiplayer',
        type: 'Estudo em Grupo',
        desc: 'Crie uma sala com código exclusivo para estudar remotamente com amigos. Mostra o tempo ativo e o mascote de cada participante conectado.'
      },
      {
        name: 'Modo Zen (Tela Cheia)',
        type: 'Foco Extremo',
        desc: 'Oculta navegação, abas e bordas, deixando na tela apenas o tempo restante, o mascote e a barra de progresso.'
      },
      {
        name: 'Exercício de Respiração (Box Breathing 4-4-4-4)',
        type: 'Saúde Mental',
        desc: 'Guia visual para inspirar em 4s, segurar por 4s, expirar em 4s e segurar por 4s. Ideal para momentos de bloqueio criativo ou ansiedade.'
      },
      {
        name: 'Alerta de Pausa Saudável (Health Break)',
        type: 'Ergonomia',
        desc: 'Aviso visual postural disparado a cada 20 minutos de estudo contínuo recomendando beber água e alongar.'
      },
      {
        name: 'BGM Reativa & Lofi Player',
        type: 'Áudio & Música',
        desc: 'Sintetizador de trilha sonora em tempo real via Web Audio com modulações acústicas harmônicas, além de integração com Spotify e YouTube Music.'
      },
      {
        name: 'Scratchpad Anti-Distração',
        type: 'Bloco de Notas Rápido',
        desc: 'Espaço para anotar lembretes e ideias relâmpago que surgem durante o estudo, evitando abrir navegadores ou celular.'
      }
    ]
  },
  {
    id: 'manual-biblioteca',
    title: '5. Biblioteca de Materiais & Mapas Mentais',
    tab: 'biblioteca',
    iconName: 'BookOpen',
    summary: 'Repositório de arquivos na nuvem com leitor integrado e mapas conceituais.',
    items: [
      {
        name: 'Upload de Arquivos',
        type: 'Armazenamento',
        desc: 'Envie PDFs, slides em PowerPoint, imagens de caderno e documentos texto para o armazenamento em nuvem do Supabase.'
      },
      {
        name: 'Leitor de PDF Integrado (PdfViewerModal)',
        type: 'Visualizador',
        desc: 'Lê documentos sem precisar de softwares externos, com suporte a busca interna, controle de zoom, índice e modo noturno.'
      },
      {
        name: 'Gerador de Mapa Mental (MindMapModal)',
        type: 'Visualização Cognitiva',
        desc: 'Estrutura os tópicos centrais do arquivo em uma árvore conceitual interativa, facilitando a fixação de temas densos.'
      },
      {
        name: 'Resumos da Comunidade (CommunityHub)',
        type: 'Colaboração',
        desc: 'Acesse resumos e fichamentos disponibilizados por outros universitários cadastrados na plataforma.'
      }
    ]
  },
  {
    id: 'manual-resumos',
    title: '6. Resumos Acadêmicos & Flashcards',
    tab: 'resumos',
    iconName: 'FileText',
    summary: 'Sínteses enriquecidas com IA Gemini e repetição espaçada para memorização permanente.',
    items: [
      {
        name: 'Gerador de Resumos por IA',
        type: 'Inteligência Artificial',
        desc: 'Transforma anotações brutas ou capítulos inteiros em sínteses com títulos claros, tópicos de memorização e termos essenciais.'
      },
      {
        name: 'Editor Markdown & Fórmulas LaTeX',
        type: 'Editor de Texto',
        desc: 'Suporte completo a fórmulas matemáticas KaTeX ($...$ e $$...$$), tabelas, citações em bloco e formatação acadêmica.'
      },
      {
        name: 'Flashcards com Repetição Espaçada',
        type: 'Método Científico',
        desc: 'Cartões de pergunta e resposta. Ao responder se lembrou facilmente ou com dificuldade, o algoritmo reprograma a data de revisão futura ideal.'
      },
      {
        name: 'Exportar Resumo em PDF Formatado',
        type: 'Exportação',
        desc: 'Converte o resumo markdown em PDF diagramado para impressão e compartilhamento com colegas.'
      }
    ]
  },
  {
    id: 'manual-quiz',
    title: '7. Simulados & Banco de Questões',
    tab: 'quiz',
    iconName: 'Award',
    summary: 'Testes práticos gerados por IA com correção analítica e gamificação.',
    items: [
      {
        name: 'Criador de Simulados por Matéria',
        type: 'Gerador de Questões',
        desc: 'Formula questões de nível universitário a partir dos materiais e tópicos selecionados com 4 alternativas balanceadas.'
      },
      {
        name: 'Explicação Didática Pós-Resposta',
        type: 'Feedback',
        desc: 'Ao selecionar uma alternativa, a IA detalha o raciocínio correto e desmonta as armadilhas conceituais das alternativas erradas.'
      },
      {
        name: 'Histórico & Pontuação',
        type: 'Métricas',
        desc: 'Mede taxa de acertos ao longo do tempo e premia o estudante com pontos de experiência (XP) e moedas virtuais.'
      }
    ]
  },
  {
    id: 'manual-professor',
    title: '8. Avaliador & Decodificador de Professores',
    tab: 'professor',
    iconName: 'GraduationCap',
    summary: 'Mapeamento estratégico do estilo de cobrança de bancas e docentes.',
    items: [
      {
        name: 'Análise de Perfil de Docente por IA',
        type: 'Diagnóstico Estratégico',
        desc: 'Avalia a linha pedagógica do professor (exigência em demonstrações matemáticas, apreço por referências bibliográficas clássicas, pegadinhas em pegadinhas conceituais).'
      },
      {
        name: 'Roteiro de Estudos Direcionado',
        type: 'Plano Tático',
        desc: 'Gera uma lista com o que priorizar e o que você pode economizar tempo na preparação para as provas daquele professor específico.'
      }
    ]
  },
  {
    id: 'manual-secretaria',
    title: '9. Secretária Acadêmica IA & Comandos de Voz',
    tab: 'secretaria',
    iconName: 'MessageCircle',
    summary: 'Assistente pessoal 24h para organização de rotina, dúvidas e diagnósticos.',
    items: [
      {
        name: 'Chat Conversacional com Memória',
        type: 'Assistente IA',
        desc: 'Responde dúvidas acadêmicas, ajuda a montar cronogramas de estudo e analisa exercícios com total empatia.'
      },
      {
        name: 'Visão Computacional (Fotos & Anexos)',
        type: 'Multimodal',
        desc: 'Envie fotografias de equações na lousa, diagramas de livros ou listas de exercícios para obter resolução passo a passo.'
      },
      {
        name: 'Transcrição de Áudio',
        type: 'Voz',
        desc: 'Grave sua dúvida pelo microfone quando estiver caminhando ou sem tempo para digitar.'
      },
      {
        name: 'Comandos Especiais:',
        type: 'Comandos de Texto',
        desc: '• /tutorial ou /guia: abre o tutorial interativo completo.\n• /hide-dev: esconde ferramentas de teste QA e opções de dev.\n• /dev: alterna o modo desenvolvedor.'
      }
    ]
  },
  {
    id: 'manual-diario',
    title: '10. Diário de Bordo & Registro de Humor',
    tab: 'diario',
    iconName: 'BookHeart',
    summary: 'Espaço seguro para reflexão pessoal, desabafo acadêmico e monitoramento emocional.',
    items: [
      {
        name: 'Seleção de Humor Emocional',
        type: 'Check-in Diário',
        desc: '5 estados de ânimo (Excelente, Bem, Neutro, Cansado, Exausto) com cores dinâmicas para traçar o mapa do seu semestre.'
      },
      {
        name: 'Perguntas Norteadoras (Prompts)',
        type: 'Reflexão Guiada',
        desc: 'Sugestões de temas como "Pelo que você é grato hoje?", "Qual foi a maior vitória?" e "O que drenou sua energia?".'
      },
      {
        name: 'Tags de Categorização',
        type: 'Organização',
        desc: 'Associe tags como #gratidão, #vitória, #desafio, #aprendizado e filtre suas anotações antigas por tema.'
      }
    ]
  },
  {
    id: 'manual-config',
    title: '11. Configurações, Segurança & Temas',
    tab: 'config',
    iconName: 'Settings',
    summary: 'Controle de aparência, módulos opcionais, privacidade biométrica e backups.',
    items: [
      {
        name: 'Temas Visuais (Aiko, Minimal, Cyberpunk...)',
        type: 'Estética',
        desc: 'Muda toda a paleta do site. O tema Aiko aplica um visual suave em tons rosáceos e clean ideal para leitura.'
      },
      {
        name: 'Tipografia (Fontes do Sistema)',
        type: 'Aparência',
        desc: 'Selecione entre Plus Jakarta Sans, Inter, Fira Code (para programadores), Outfit ou Serifada.'
      },
      {
        name: 'Bloqueio Biométrico / PIN de Segurança',
        type: 'Privacidade',
        desc: 'Protege seus dados com leitor de impressão digital (Touch ID / WebAuthn) ou senha numérica PIN de 4 a 6 dígitos.'
      },
      {
        name: 'Interruptores de Módulos',
        type: 'Customização',
        desc: 'Ative ou desative recursos específicos: Mascotes, Batalha RPG contra Chefões, Música Ambiente BGM, Gamificação, etc.'
      },
      {
        name: 'Backup de Dados (Exportar JSON / Markdown)',
        type: 'Segurança',
        desc: 'Baixe todos os seus dados em um clique para garantir que nada seja perdido mesmo trocando de computador.'
      },
      {
        name: 'Extensão do Google Chrome',
        type: 'Ferramenta Externa',
        desc: 'Baixe o pacote .zip da extensão oficial para capturar textos de artigos científicos e páginas da internet direto para o Omnia.'
      }
    ]
  },
  {
    id: 'manual-atalhos',
    title: '12. Atalhos de Teclado & Dicas Pro',
    tab: 'hoje',
    iconName: 'Key',
    summary: 'Teclas de atalho universais para navegar como um mestre da produtividade.',
    items: [
      {
        name: 'Ctrl + K (ou Cmd + K)',
        type: 'Atalho Universal',
        desc: 'Abre a Busca Global instantânea em qualquer aba do aplicativo para encontrar compromissos, notas ou materiais.'
      },
      {
        name: 'Tecla F',
        type: 'Atalho Rápido',
        desc: 'Navega instantaneamente para a aba Foco & Pomodoro.'
      },
      {
        name: 'Tecla C',
        type: 'Atalho Rápido',
        desc: 'Navega instantaneamente para a Agenda & Calendário.'
      },
      {
        name: 'Tecla B',
        type: 'Atalho Rápido',
        desc: 'Navega instantaneamente para a Biblioteca de Materiais.'
      },
      {
        name: 'Tecla H',
        type: 'Atalho Rápido',
        desc: 'Navega de volta para a aba Hoje.'
      },
      {
        name: 'Tecla ?',
        type: 'Ajuda',
        desc: 'Exibe a listagem completa dos atalhos de teclado do Omnia.'
      },
      {
        name: 'PWA (Progressive Web App)',
        type: 'Instalação',
        desc: 'Instale o Omnia no Windows, Mac, Android ou iPhone para utilizar como aplicativo nativo em tela inteira mesmo offline.'
      }
    ]
  }
];
