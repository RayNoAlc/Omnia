export async function runQATour() {
  const wait = (ms) => new Promise(res => setTimeout(res, ms));

  // Função helper para criar um "cursor" fantasma que voa pela tela
  const cursor = document.createElement("div");
  cursor.style.width = "20px";
  cursor.style.height = "20px";
  cursor.style.borderRadius = "50%";
  cursor.style.backgroundColor = "rgba(255, 0, 0, 0.5)";
  cursor.style.border = "2px solid red";
  cursor.style.position = "fixed";
  cursor.style.zIndex = "999999";
  cursor.style.pointerEvents = "none";
  cursor.style.transition = "all 0.5s ease-out";
  cursor.style.top = "50%";
  cursor.style.left = "50%";
  document.body.appendChild(cursor);

  const moveAndClick = async (selector, text) => {
    let el = null;
    if (selector.startsWith('text=')) {
      const txt = selector.split('=')[1];
      el = Array.from(document.querySelectorAll('button, a, div')).find(e => e.textContent.includes(txt) && e.offsetParent !== null);
    } else {
      el = document.querySelector(selector);
    }
    
    if (el) {
      const rect = el.getBoundingClientRect();
      cursor.style.top = (rect.top + rect.height/2) + "px";
      cursor.style.left = (rect.left + rect.width/2) + "px";
      await wait(600); // Wait for cursor to move
      
      // Simulate click visual
      cursor.style.transform = "scale(0.5)";
      cursor.style.backgroundColor = "rgba(0, 255, 0, 0.8)";
      await wait(150);
      cursor.style.transform = "scale(1)";
      cursor.style.backgroundColor = "rgba(255, 0, 0, 0.5)";
      
      el.click();
      if(text) console.log(`%c[QA] %c${text}`, "color: yellow", "color: lightgreen");
    } else {
      console.warn(`[QA] Não achou elemento: ${selector}`);
    }
    await wait(600);
  };

  const notify = (msg) => {
    const d = document.createElement("div");
    d.textContent = "🤖 QA Test: " + msg;
    d.style.position = "fixed";
    d.style.top = "20px";
    d.style.left = "50%";
    d.style.transform = "translateX(-50%)";
    d.style.backgroundColor = "#000";
    d.style.color = "#0f0";
    d.style.padding = "10px 20px";
    d.style.borderRadius = "8px";
    d.style.zIndex = "999998";
    d.style.fontWeight = "bold";
    d.style.fontFamily = "monospace";
    document.body.appendChild(d);
    setTimeout(() => d.remove(), 2500);
  };

  notify("Iniciando Tour Automatizado de QA...");
  await wait(2000);

  // 1. Aba Hoje
  notify("Acessando a aba Hoje e carrossel de Revisão Espaçada...");
  await moveAndClick("text=Hoje", "Clicou Aba Hoje");
  await wait(1000);

  // 2. Aba Agenda
  notify("Testando aba Agenda e Kanban...");
  await moveAndClick("text=Agenda", "Clicou Aba Agenda");
  await moveAndClick("text=Kanban", "Alternou para Kanban");
  await wait(1500);
  await moveAndClick("text=Lista", "Voltou para Lista");
  await moveAndClick("text=Google Cal", "Visualizou Bloqueio de Tempo (Calendário)");
  await wait(2000);
  await moveAndClick("text=Lista", "Voltou para Lista");

  // 3. Aba Biblioteca
  notify("Verificando Biblioteca e Árvore de Conhecimento...");
  await moveAndClick("text=Biblioteca", "Clicou Aba Biblioteca");
  await wait(1000);
  await moveAndClick("text=Árvore de Conhecimento", "Abriu Mapa Mental");
  await wait(2500); // Visualizar
  await moveAndClick("text=ESC", "Fechou Mapa Mental");

  // 4. Aba Inbox
  notify("Testando Inbox da IA...");
  await moveAndClick("text=Inbox", "Clicou Aba Inbox");
  await wait(1500);

  // 5. Aba Foco
  notify("Verificando Pomodoro e Loja da Coruja...");
  await moveAndClick("text=Foco", "Clicou Aba Foco");
  await wait(1500);
  await moveAndClick("text=Loja", "Abriu Loja da Coruja");
  await wait(2000);
  await moveAndClick("text=Fechar", "Fechou Loja");
  
  // 6. Aba Desempenho
  notify("Consultando Dashboard Acadêmico e Analytics...");
  await moveAndClick("text=Desempenho", "Clicou Aba Desempenho");
  await wait(2500);

  // 7. Configurações e Temas
  notify("Testando Temas Sazonais...");
  await moveAndClick("text=Config", "Clicou Aba Configurações");
  await wait(1500);
  await moveAndClick("text=Modo Hacker", "Ativou Tema Hacker");
  await wait(1000);
  await moveAndClick("text=Modo Férias", "Ativou Modo Férias (Burnout)");
  await wait(1500);
  await moveAndClick("text=Modo Férias", "Desativou Modo Férias");
  await wait(2000);
  await moveAndClick("text=Omnia Dark", "Voltou Tema Original");

  notify("✅ Testes Visuais Concluídos com Sucesso!");
  await wait(1500);
  cursor.remove();
}
