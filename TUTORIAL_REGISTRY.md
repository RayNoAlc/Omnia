# 📖 Omnia Tutorial Registry & Memory Guideline

> **REGRA DE OURO DO OMNIA:**
> Absolutamente **TODA E QUALQUER nova funcionalidade, botão, comando, tela ou recurso** adicionado ao Omnia **DEVE ser obrigatoriamente incluído e explicado** no Tutorial Interativo e no Manual Completo da aplicação (`src/lib/tutorialData.js`).
> Nenhuma função deve jamais ficar de fora do tutorial.

---

## 📌 Como Manter o Tutorial Sempre 100% Atualizado

Sempre que implementar ou modificar algo no Omnia, siga este checklist obrigatório:

1. **Atualizar `src/lib/tutorialData.js`:**
   - Adicione o novo passo ou atualize a descrição do passo existente em `TUTORIAL_STEPS`.
   - Adicione o item detalhado (nome, tipo, descrição do botão/função) na respectiva seção em `OMNIA_MANUAL_SECTIONS`.
2. **Definir `targetSelector` ou Âncora Visual:**
   - Se a nova função for um botão ou card interativo, certifique-se de que o seletor CSS aponte para ele ou para seu contêiner na aba correspondente.
3. **Validar no Tour Interativo:**
   - O tour deve conseguir navegar até a aba da nova funcionalidade e exibir as explicações em português claro, com dicas práticas.
4. **Validar no Manual de Referência:**
   - O novo recurso deve aparecer na busca instantânea da Central de Ajuda & Manual da aplicação.

---

## 📋 Lista de Abas e Seções Cobertas:
1. **Hoje (`hoje`)**: Painel Diário, Mascotes Pixel Art (6 pets), Alimentação/Petiscos, Moedas, Avisos Críticos, Blocos do Dia.
2. **Rotina (`rotina`)**: Grade Semanal, Blocos Fixos, Exceções, Rastreador de Hábitos (Habit Tracker), Exportação .ics.
3. **Agenda (`agenda`)**: Compromissos, Provas, Algoritmo de Distribuição de Estudo, Exportação PDF/ICS.
4. **Foco (`foco`)**: Timer Pomodoro Adaptativo, Batalha RPG contra Chefões (4 bosses e sprites hurt), Modo Zen, Sala Multiplayer, Respiração Guiada, Pausas Saudáveis, Scratchpad, BGM Lofi.
5. **Biblioteca (`biblioteca`)**: Upload em Nuvem, Leitor de PDF Integrado, Mapas Mentais, Resumos da Comunidade.
6. **Resumos (`resumos`)**: Sínteses Inteligentes por IA Gemini, Markdown/LaTeX, Flashcards com Repetição Espaçada, Exportação PDF.
7. **Simulados (`quiz`)**: Provas geradas por IA, Feedback didático pós-resposta, Histórico de pontuação e XP.
8. **Avaliador de Professores (`professor`)**: Análise pedagógica de bancas/docentes por IA, Estratégias de estudo para prova.
9. **Secretária Acadêmica IA (`secretaria`)**: Chat multimodal com IA, comandos especiais (`/tour`, `/hide-dev`, `/dev`), transcrição de áudio e visão computacional.
10. **Diário de Bordo (`diario`)**: Registro de humor diário, prompts reflexivos, tags emocionais, linha do tempo.
11. **Configurações (`config`)**: Temas visuais (Aiko e outros), tipografia, bloqueio biométrico/PIN, toggles de módulos, backups, Extensão Chrome.
12. **Recursos Globais**: Busca rápida (`Ctrl + K`), atalhos de teclado (`F`, `C`, `B`, `H`, `?`), Omnia Wrapped, instalação PWA.
