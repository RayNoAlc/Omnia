import { runFullQASuite } from "./qaEngine";
import { sfx } from "./soundEffects";

/**
 * Omnia Anti-Bug Guardian - Tour Visual E2E Automatizado e Integrado
 * 
 * Navega fisicamente por TODAS as 10 abas da aplicação, demonstra os recursos
 * interativos na tela do usuário com cursor holográfico e HUD inteligente,
 * abre e fecha gavetas/modais de forma segura e executa o diagnóstico completo.
 */
export async function runQATour({ userId, onProgress } = {}) {
  let isCancelled = false;
  const cancelCallbacks = [];

  const wait = (ms) =>
    new Promise((resolve) => {
      const timer = setTimeout(() => {
        resolve();
      }, ms);
      cancelCallbacks.push(() => {
        clearTimeout(timer);
        resolve();
      });
    });

  // Limpeza de instâncias e resíduos anteriores
  const oldCursor = document.getElementById("omnia-qa-cursor");
  if (oldCursor) oldCursor.remove();
  const oldBanner = document.getElementById("omnia-qa-banner");
  if (oldBanner) oldBanner.remove();
  const oldHighlight = document.getElementById("omnia-qa-highlight-style");
  if (oldHighlight) oldHighlight.remove();

  // Injeta estilos de destaque e animações para o tour
  const styleEl = document.createElement("style");
  styleEl.id = "omnia-qa-highlight-style";
  styleEl.innerHTML = `
    @keyframes omniaPulseHalo {
      0%, 100% {
        box-shadow: 0 0 0 2px #38bdf8, 0 0 16px rgba(56, 189, 248, 0.65);
      }
      50% {
        box-shadow: 0 0 0 4px #0ea5e9, 0 0 28px rgba(14, 165, 233, 0.9);
      }
    }
    .omnia-tour-highlighted {
      position: relative !important;
      animation: omniaPulseHalo 1.4s ease-in-out infinite !important;
      outline: none !important;
      transition: all 0.3s ease !important;
    }
    @keyframes omniaRadarPing {
      0% { transform: scale(1); opacity: 0.9; }
      50% { transform: scale(1.35); opacity: 0.3; }
      100% { transform: scale(1); opacity: 0.9; }
    }
  `;
  document.head.appendChild(styleEl);

  // 1. Cria cursor fantasma com visual holográfico e transição fluida
  const cursor = document.createElement("div");
  cursor.id = "omnia-qa-cursor";
  cursor.style.width = "28px";
  cursor.style.height = "28px";
  cursor.style.borderRadius = "50%";
  cursor.style.backgroundColor = "rgba(56, 189, 248, 0.75)";
  cursor.style.border = "2px solid #38bdf8";
  cursor.style.boxShadow = "0 0 16px rgba(56, 189, 248, 0.9), 0 0 32px rgba(56, 189, 248, 0.4)";
  cursor.style.position = "fixed";
  cursor.style.zIndex = "999999";
  cursor.style.pointerEvents = "none";
  cursor.style.transition = "top 0.45s cubic-bezier(0.16, 1, 0.3, 1), left 0.45s cubic-bezier(0.16, 1, 0.3, 1), transform 0.2s ease, background-color 0.2s ease, border-color 0.2s ease";
  cursor.style.top = "50%";
  cursor.style.left = "50%";
  cursor.style.transform = "translate(-50%, -50%)";
  document.body.appendChild(cursor);

  // 2. Cria banner flutuante no topo com HUD holográfico e botão de cancelamento
  const banner = document.createElement("div");
  banner.id = "omnia-qa-banner";
  banner.style.position = "fixed";
  banner.style.top = "18px";
  banner.style.left = "50%";
  banner.style.transform = "translateX(-50%)";
  banner.style.backgroundColor = "rgba(10, 16, 30, 0.94)";
  banner.style.color = "#38bdf8";
  banner.style.border = "1px solid rgba(56, 189, 248, 0.45)";
  banner.style.backdropFilter = "blur(16px)";
  banner.style.padding = "10px 18px";
  banner.style.borderRadius = "999px";
  banner.style.zIndex = "999998";
  banner.style.fontWeight = "700";
  banner.style.fontSize = "12px";
  banner.style.fontFamily = "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, sans-serif";
  banner.style.boxShadow = "0 10px 40px rgba(0, 0, 0, 0.8), 0 0 24px rgba(56, 189, 248, 0.25)";
  banner.style.display = "flex";
  banner.style.alignItems = "center";
  banner.style.gap = "12px";
  banner.style.maxWidth = "90vw";
  banner.style.boxSizing = "border-box";

  banner.innerHTML = `
    <div style="display:flex;align-items:center;gap:8px;flex-shrink:0">
      <span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:#38bdf8;animation:omniaRadarPing 1.8s infinite"></span>
      <span id="omnia-qa-step-badge" style="background:rgba(56,189,248,0.18);border:1px solid rgba(56,189,248,0.4);color:#bae6fd;padding:2px 8px;border-radius:999px;font-size:11px;font-weight:800;letter-spacing:0.5px">TOUR 1/10</span>
    </div>
    <span id="omnia-qa-banner-txt" style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:480px;color:#f8fafc">Iniciando tour guiado interativo...</span>
    <button id="omnia-qa-cancel-btn" title="Pressione Esc ou clique para interromper o tour" style="margin-left:auto;background:rgba(239,68,68,0.18);border:1px solid rgba(239,68,68,0.4);color:#fca5a5;padding:3px 10px;border-radius:999px;font-size:11px;font-weight:800;cursor:pointer;display:flex;align-items:center;gap:4px;transition:all 0.2s ease">
      ✕ Parar (Esc)
    </button>
  `;
  document.body.appendChild(banner);

  let currentHighlightedEl = null;

  const clearHighlight = () => {
    if (currentHighlightedEl) {
      currentHighlightedEl.classList.remove("omnia-tour-highlighted");
      currentHighlightedEl = null;
    }
  };

  const setHighlight = (el) => {
    clearHighlight();
    if (el) {
      el.classList.add("omnia-tour-highlighted");
      currentHighlightedEl = el;
    }
  };

  // Encerramento limpo e seguro
  const cleanup = () => {
    clearHighlight();
    if (cursor && cursor.parentNode) cursor.remove();
    if (banner && banner.parentNode) banner.remove();
    if (styleEl && styleEl.parentNode) styleEl.remove();
    document.removeEventListener("keydown", handleKeyDown);
  };

  const handleCancel = (reason = "Tour cancelado pelo usuário.") => {
    if (isCancelled) return;
    isCancelled = true;
    cancelCallbacks.forEach((cb) => {
      try { cb(); } catch {}
    });
    const txt = document.getElementById("omnia-qa-banner-txt");
    if (txt) txt.textContent = reason;
    sfx.click();
    setTimeout(cleanup, 900);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Escape" || e.code === "Escape") {
      handleCancel();
    }
  };
  document.addEventListener("keydown", handleKeyDown);

  const cancelBtn = document.getElementById("omnia-qa-cancel-btn");
  if (cancelBtn) {
    cancelBtn.addEventListener("click", () => handleCancel());
  }

  const updateBanner = (msg, step = null) => {
    if (isCancelled) return;
    const txt = document.getElementById("omnia-qa-banner-txt");
    if (txt) txt.textContent = msg;
    if (step) {
      const badge = document.getElementById("omnia-qa-step-badge");
      if (badge) badge.textContent = `ETAPA ${step}/10`;
    }
    if (onProgress) onProgress(msg);
  };

  // Localizador inteligente de elementos (suporta seletores CSS múltiplos, text=, aria e title)
  const findElement = (queries) => {
    const list = Array.isArray(queries) ? queries : [queries];

    for (const query of list) {
      if (!query || typeof query !== "string") continue;
      const trimmed = query.trim();

      // Estratégia 1: Busca baseada em texto
      if (trimmed.startsWith("text=")) {
        const needle = trimmed.replace("text=", "").trim().toLowerCase();
        const clickables = Array.from(
          document.querySelectorAll("button, a, [role='button'], [role='tab'], input, textarea, h1, h2, h3, h4, span, div, card")
        );
        const match = clickables.find((e) => {
          if (!e) return false;
          const rect = e.getBoundingClientRect();
          if (rect.width === 0 && rect.height === 0) return false;
          const t = (e.textContent || e.innerText || e.getAttribute("title") || e.getAttribute("aria-label") || "").toLowerCase();
          return t.includes(needle);
        });
        if (match) return match;
      } else {
        // Estratégia 2: Seletor CSS protegido por try/catch
        try {
          const el = document.querySelector(trimmed);
          if (el) {
            const rect = el.getBoundingClientRect();
            if (rect.width > 0 || rect.height > 0) return el;
          }
        } catch {}

        // Estratégia 3: Fallback sem prefixo interpretado como texto se não for seletor puro
        const clickables = Array.from(
          document.querySelectorAll("button, a, [role='button'], [role='tab'], input, textarea, h1, h2, h3, h4, span, div")
        );
        const needle = trimmed.toLowerCase();
        const textMatch = clickables.find((e) => {
          if (!e) return false;
          const rect = e.getBoundingClientRect();
          if (rect.width === 0 && rect.height === 0) return false;
          const t = (e.textContent || e.innerText || e.getAttribute("title") || e.getAttribute("aria-label") || "").toLowerCase();
          return t.includes(needle);
        });
        if (textMatch) return textMatch;
      }
    }
    return null;
  };

  // Move o cursor suavemente para o elemento com scroll suave e halo de foco
  const pointToElement = async (el) => {
    if (!el || isCancelled) return;
    try {
      el.scrollIntoView({ behavior: "smooth", block: "center", inline: "nearest" });
    } catch {}
    await wait(280);
    if (isCancelled) return;

    const rect = el.getBoundingClientRect();
    const targetX = Math.max(16, Math.min(window.innerWidth - 16, rect.left + rect.width / 2));
    const targetY = Math.max(16, Math.min(window.innerHeight - 16, rect.top + rect.height / 2));

    cursor.style.left = `${targetX}px`;
    cursor.style.top = `${targetY}px`;
    setHighlight(el);
    await wait(420);
  };

  // Efeito de clique do cursor com feedback háptico e sonoro
  const clickAnimation = async () => {
    if (isCancelled) return;
    cursor.style.transform = "translate(-50%, -50%) scale(0.65)";
    cursor.style.backgroundColor = "rgba(34, 197, 94, 0.95)";
    cursor.style.borderColor = "#22c55e";
    cursor.style.boxShadow = "0 0 24px rgba(34, 197, 94, 0.95)";
    sfx.click();
    await wait(140);
    if (isCancelled) return;
    cursor.style.transform = "translate(-50%, -50%) scale(1)";
    cursor.style.backgroundColor = "rgba(56, 189, 248, 0.75)";
    cursor.style.borderColor = "#38bdf8";
    cursor.style.boxShadow = "0 0 16px rgba(56, 189, 248, 0.9)";
  };

  // Navega para uma aba garantindo sincronia física e React
  const navigateToTab = async (tabId, label, stepNumber) => {
    if (isCancelled) return;
    updateBanner(label, stepNumber);

    // 1. Procura e clica no botão da barra lateral
    const navBtn = findElement([
      `button[data-tab-nav="${tabId}"]`,
      `[data-tab-nav="${tabId}"]`,
      `button:has([data-tab-nav="${tabId}"])`
    ]);

    if (navBtn) {
      await pointToElement(navBtn);
      await clickAnimation();
      try { navBtn.click(); } catch {}
    }

    // 2. Dispara a ponte oficial de estado do Omnia
    if (typeof window.__omniaSetTab === "function") {
      window.__omniaSetTab(tabId);
    }

    // 3. Aguarda renderização da tela
    await wait(950);
  };

  // Localiza um elemento e clica nele com animação
  const moveAndClick = async (queries, label) => {
    if (isCancelled) return false;
    const el = findElement(queries);
    if (el) {
      if (label) updateBanner(label);
      await pointToElement(el);
      await clickAnimation();
      try {
        el.click();
      } catch (err) {
        console.warn("[QA Tour] Erro no clique:", err);
      }
      await wait(650);
      return true;
    }
    return false;
  };

  // Move o cursor para destacar um elemento na tela
  const moveCursorTo = async (queries, label) => {
    if (isCancelled) return false;
    const el = findElement(queries);
    if (el) {
      if (label) updateBanner(label);
      await pointToElement(el);
      await wait(750);
      return true;
    }
    return false;
  };

  // Fecha qualquer modal ou gaveta atualmente aberta com resiliência total
  const closeOpenModal = async (label) => {
    if (isCancelled) return;
    if (label) updateBanner(label);

    // 1. Dispara evento Escape global para acionar listeners dos modais
    try {
      window.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", code: "Escape", keyCode: 27, which: 27, bubbles: true }));
    } catch {}
    await wait(180);

    // 2. Busca e aciona botões de fechar explícitos
    const closeBtn = findElement([
      "button[aria-label*='fechar' i]",
      "button[title*='fechar' i]",
      "button:has(svg.lucide-x)",
      "text=Fechar",
      "text=Cancelar"
    ]);

    if (closeBtn) {
      await pointToElement(closeBtn);
      await clickAnimation();
      try { closeBtn.click(); } catch {}
    }
    await wait(450);
    clearHighlight();
  };

  try {
    // =================================================================
    // ETAPA 1: ABA HOJE (Métricas de Foco, Metas, Hábitos e Curva de Esquecimento)
    // =================================================================
    await navigateToTab("hoje", "Painel Principal: Metas de Estudo, Hábitos & Planejamento do Dia", 1);
    if (isCancelled) return;

    await moveCursorTo(["text=O que eu deveria estar fazendo", "h2", "h3"], "Verificando planejamento prioritário e tarefas de hoje");
    await moveCursorTo(["text=Meta de Estudo", "text=sessões", "text=horas estudadas", ".lucide-clock"], "Acompanhando horas estudadas e meta diária de foco");
    
    // Hábitos diários e revisão espaçada
    try {
      await moveCursorTo(["text=Hábitos Diários", "text=Água", "text=Atividade Física", ".lucide-droplets"], "Monitor de hábitos saudáveis e bem-estar universitário");
    } catch {}

    try {
      await moveCursorTo(["text=Revisão Espaçada", "text=Curva de Esquecimento", ".lucide-rotate-ccw"], "Revisão inteligente para reter conteúdos estudados");
    } catch {}

    await moveCursorTo(["text=compromisso", "text=Semana pesada", ".lucide-alert-circle", ".lucide-info"], "Verificando alertas inteligentes e prazos de provas");
    await wait(600);

    // =================================================================
    // ETAPA 2: ABA INBOX (Captura com IA, Transcrição e Uploads)
    // =================================================================
    await navigateToTab("inbox", "Inbox Inteligente: Captura Rápida com Classificação por IA", 2);
    if (isCancelled) return;

    await moveCursorTo(["textarea", "text=Central de entrada"], "Área de entrada: jogue qualquer pensamento, tarefa ou áudio aqui");
    await moveCursorTo(["text=PDF", "button:has(.lucide-file-text)"], "Suporte a leitura e extração automática de textos de PDFs");
    await moveCursorTo(["text=Foto", "button:has(.lucide-image)"], "Visão Computacional para fotos de lousas e cadernos");
    await moveCursorTo(["text=Áudio", "button:has(.lucide-mic)"], "Transcrição de áudio via inteligência artificial integrada");
    await wait(600);

    // =================================================================
    // ETAPA 3: ABA AGENDA (Kanban por Status, Calendário & Lista)
    // =================================================================
    await navigateToTab("agenda", "Agenda Acadêmica: Visualização Kanban, Google Cal & Lista", 3);
    if (isCancelled) return;

    try {
      await moveAndClick(["text=Kanban", "button:has-text('Kanban')"], "Alternando para Visão Kanban (A Fazer / Em Andamento / Concluído)");
      await wait(700);
      await moveCursorTo([".grid", "text=A Fazer", "text=Em Andamento"], "Compromissos organizados por estágios com tags de prioridade");
      await moveAndClick(["text=Lista", "text=Calendário", "text=Google Cal"], "Retornando para a visualização principal em lista/datas");
    } catch {}
    await wait(600);

    // =================================================================
    // ETAPA 4: ABA BIBLIOTECA (Mapa Mental Interativo & Resumos IA)
    // =================================================================
    await navigateToTab("biblioteca", "Biblioteca: Disciplinas, Mapa Mental & Resumos IA", 4);
    if (isCancelled) return;

    await moveCursorTo(["text=Disciplinas", ".lucide-book-open"], "Repositório central de matérias e anotações acadêmicas");
    
    try {
      const openedMap = await moveAndClick(
        ["text=Mapa Mental", "button:has(.lucide-brain)", "text=Árvore de Conhecimento"],
        "Abrindo Modal: Mapa Mental Interativo (Grafo de Conhecimento)"
      );
      if (openedMap) {
        await wait(1400);
        await closeOpenModal("Fechando Mapa Mental Interativo");
      }
    } catch (e) {
      console.warn("[QA Tour] Erro mapa mental:", e);
    }

    try {
      const openedCommunity = await moveAndClick(
        ["text=Comunidade", "button:has(.lucide-globe)", "text=Resumos Compartilhados"],
        "Explorando Resumos e Materiais Compartilhados da Comunidade"
      );
      if (openedCommunity) {
        await wait(1200);
        await closeOpenModal("Fechando Comunidade");
      }
    } catch {}

    await moveCursorTo(["text=Pergunte ao Professor", "text=Simulado", "text=Quiz"], "Acesso a simulados, quizzes e autoexplicação guiada por IA");
    await wait(600);

    // =================================================================
    // ETAPA 5: ABA FOCO (Pomodoro, Mascotes, Chefes RPG, Sons & Respiração)
    // =================================================================
    await navigateToTab("foco", "Modo Foco: Pomodoro, Mascotes, Chefes RPG & Sons Lo-Fi", 5);
    if (isCancelled) return;

    // Cronômetro principal e Presets
    await moveCursorTo([".font-mono", "[data-timer]", "text=Foco", "text=Pausado"], "Cronômetro Pomodoro imersivo com ciclos de estudo e descanso");
    await moveCursorTo(["[data-tour='foco-presets']", "text=25 min", "text=50 min", "button[data-preset]"], "Presets rápidos de foco (25 min clássico, 50 min intensivo ou custom)");

    // Gaveta de Mascotes de Estudo
    try {
      const openedPet = await moveAndClick(
        ["[data-tour='foco-pet']", "button[title*='mascote' i]", "text=Mascote", "text=Pet"],
        "Abrindo Seletor de Mascotes Companheiros (Coruja, Gato, Shiba...)"
      );
      if (openedPet) {
        await wait(1300);
        await closeOpenModal("Fechando Seletor de Mascotes");
      }
    } catch (e) {
      console.warn("[QA Tour] Erro mascote:", e);
    }

    // Batalha RPG contra Chefes (Procrastinação, Ansiedade)
    try {
      const openedBoss = await moveAndClick(
        ["[data-tour='foco-boss']", "button[title*='chefe' i]", "button[title*='batalha' i]", "text=Batalha RPG", "text=Chefe"],
        "Abrindo Batalha RPG contra Chefes da Procrastinação & Ansiedade"
      );
      if (openedBoss) {
        await wait(1300);
        await closeOpenModal("Fechando Menu de Batalha RPG");
      }
    } catch (e) {
      console.warn("[QA Tour] Erro chefes RPG:", e);
    }

    // Sala de Estudos Multiplayer
    try {
      const openedRoom = await moveAndClick(
        ["[data-tour='foco-room']", "button[title*='grupo' i]", "text=Sala de Estudos"],
        "Abrindo Sala de Estudos Multiplayer ao Vivo"
      );
      if (openedRoom) {
        await wait(1200);
        await closeOpenModal("Fechando Sala de Estudos");
      }
    } catch (e) {
      console.warn("[QA Tour] Erro sala:", e);
    }

    // Exercício guiado de Respiração Box Breathing
    try {
      const openedBreath = await moveAndClick(
        ["[data-tour='foco-breathing']", "button[title*='respiração' i]", "text=Exercício de Respiração"],
        "Demonstrando Exercício de Respiração Box Breathing 4x4"
      );
      if (openedBreath) {
        await wait(1300);
        await closeOpenModal("Fechando Exercício de Respiração");
      }
    } catch (e) {
      console.warn("[QA Tour] Erro respiração:", e);
    }

    // Sons de Estudo / Lo-Fi
    await moveCursorTo(
      ["text=Sons & Música", "text=Lo-Fi", "button[title*='música' i]", "text=Ambiente"],
      "Player de sons relaxantes: Lo-Fi Girl, Chuva, Café e Fogueira"
    );
    await wait(600);

    // =================================================================
    // ETAPA 6: ABA DESEMPENHO (Métricas, Heatmap & Omnia Wrapped)
    // =================================================================
    await navigateToTab("desempenho", "Desempenho: Horas Estudadas, Heatmap & Omnia Wrapped", 6);
    if (isCancelled) return;

    await moveCursorTo(["text=Tempo Total", "text=Métricas", ".lucide-bar-chart-3"], "Estatísticas de produtividade detalhadas por matéria e turno");
    await moveCursorTo([".grid", "text=Histórico", "svg"], "Heatmap de consistência diária no estilo contribuições do GitHub");
    await moveCursorTo(["text=Arquétipos", "text=Classe", "text=Alquimista", "text=Estrategista"], "Arquétipos acadêmicos no estilo RPG de evolução do estudante");

    try {
      const openedWrapped = await moveAndClick("text=Ver Meu Wrapped", "Abrindo Retrospectiva: Omnia Wrapped (Stories + QR Code)");
      if (openedWrapped) {
        await wait(1500);
        await closeOpenModal("Fechando Omnia Wrapped");
      }
    } catch (e) {
      console.warn("[QA Tour] Erro wrapped:", e);
    }
    await wait(600);

    // =================================================================
    // ETAPA 7: ABA DIÁRIO (Diário de Bordo & Registro de Humor)
    // =================================================================
    await navigateToTab("diario", "Diário de Bordo: Registro de Humor & Reflexão Diária", 7);
    if (isCancelled) return;

    await moveCursorTo(["text=Excelente", "text=Bem", "text=Neutro", "text=Cansado", ".lucide-smile"], "Seletor de estado emocional e humor do dia");
    await moveCursorTo(["textarea", "text=reflexão", "text=Como foi o seu dia"], "Área de registro de vitórias, desafios e aprendizados");
    await moveCursorTo(["text=Histórico", "text=Entradas Anteriores"], "Linha do tempo permanente de evolução emocional e foco");
    await wait(600);

    // =================================================================
    // ETAPA 8: ABA SECRETÁRIA (Assistente Virtual IA Acadêmica)
    // =================================================================
    await navigateToTab("secretaria", "Secretária Acadêmica: Inteligência Artificial com Contexto Real", 8);
    if (isCancelled) return;

    await moveCursorTo(["text=Secretária", ".lucide-message-circle"], "Assistente que conhece sua grade horária, matérias e prazos de prova");
    await moveCursorTo(["textarea", "input[placeholder*='Pergunte' i]", "input[placeholder*='secretária' i]"], "Chat com ações automatizadas na rotina e recomendações");
    await wait(600);

    // =================================================================
    // ETAPA 9: ABA MINHA ROTINA (Grade Semanal & Encaixe de Estudos)
    // =================================================================
    await navigateToTab("rotina", "Minha Rotina: Grade Semanal & Encaixe Automático de Blocos", 9);
    if (isCancelled) return;

    await moveCursorTo(["table", ".grid", "text=Segunda", "text=Terça"], "Grade horária semanal com blocos fixos de aula, sono e trabalho");
    await moveCursorTo(["text=Turno", "text=Preferência", "text=Manhã", "text=Noite"], "Algoritmo que distribui blocos de estudo nos seus melhores horários livres");
    await wait(600);

    // =================================================================
    // ETAPA 10: CONFIGURAÇÕES & MOTOR DE TESTES ANTI-BUG GUARDIAN
    // =================================================================
    await navigateToTab("config", "Configurações: Temas, Biometria & Diagnóstico Anti-Bug", 10);
    if (isCancelled) return;

    await moveCursorTo(["text=Temas", "text=Cyberpunk", "text=Lofi", ".lucide-palette"], "Customização visual completa: Dark, Cyberpunk, Café, Lofi e fontes");
    await moveCursorTo(["text=Biometria", "text=Segurança", ".lucide-shield-check", ".lucide-fingerprint"], "Proteção de privacidade biométrica (Touch ID / Face ID / PIN)");

    // Rola suavemente até o painel de QA Anti-Bug Guardian
    const qaPanel = document.getElementById("omnia-qa-panel");
    if (qaPanel) {
      qaPanel.scrollIntoView({ behavior: "smooth", block: "center" });
      await wait(450);
      await pointToElement(qaPanel);
    }

    updateBanner("Executando Suíte Completa de Diagnósticos Anti-Bugs...", 10);

    // Executa a bateria completa com atualização do banner em tempo real
    const report = await runFullQASuite({
      userId,
      mode: "tour",
      onProgress: (p) => {
        updateBanner(`[Teste ${p.current}/${p.total}] ${p.currentTest}...`, 10);
      },
    });

    if (report && report.failed === 0) {
      updateBanner(`🎉 TOUR CONCLUÍDO! Todas as 10 abas operacionais (0 falhas nos ${report.passed} testes)!`, 10);
      sfx.levelUp();
    } else {
      updateBanner(`Tour concluído com diagnóstico: ${report?.passed || 0} Aprovados, ${report?.failed || 0} Falhas.`, 10);
    }

    await wait(3200);
    cleanup();
    return report;
  } catch (err) {
    console.error("[QA Tour Error]:", err);
    updateBanner("Erro durante o Tour: " + (err.message || String(err)));
    await wait(2800);
    cleanup();
    throw err;
  }
}
