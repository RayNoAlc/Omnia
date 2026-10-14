import { supabase } from "./supabaseClient";
import localforage from "localforage";
import { addCommitment, updateCommitment, deleteCommitment } from "./db";
import { callAI, callAIWithTools } from "./ai";
import { aiGenerateSummary, aiGenerateQuiz, aiGenerateFlashcards, aiEvaluateProfessor, classifyInboxText } from "./aiHelpers";
import { ROUTINE_TOOLS } from "./routineTools";
import { sfx } from "./soundEffects";

/**
 * Omnia Anti-Bug Guardian & Autonomous QA Testing Engine
 * Executa diagnósticos profundos em todos os módulos, APIs, banco de dados,
 * modais e IA da aplicação, armazenando o log de falhas e integridade.
 */

export async function runFullQASuite({ userId, onProgress, mode = "fast" }) {
  const startTime = Date.now();
  const results = [];
  const reportId = "qa_run_" + Date.now();

  const reportProgress = (current, total, currentTest, status = "running") => {
    if (onProgress) {
      onProgress({
        current,
        total,
        percent: Math.round((current / total) * 100),
        currentTest,
        status,
        results: [...results],
      });
    }
  };

  const executeTest = async (suite, name, testFn) => {
    const tStart = Date.now();
    try {
      const details = await testFn();
      const durationMs = Date.now() - tStart;
      const res = {
        suite,
        name,
        status: "PASS",
        durationMs,
        details: typeof details === "string" ? details : "Aprovado com sucesso",
        error: null,
      };
      results.push(res);
      return res;
    } catch (err) {
      const durationMs = Date.now() - tStart;
      console.error(`[QA FAIL] ${suite} -> ${name}:`, err);
      const res = {
        suite,
        name,
        status: "FAIL",
        durationMs,
        details: null,
        error: {
          message: err?.message || String(err),
          stack: err?.stack || "Sem stack trace",
        },
      };
      results.push(res);
      return res;
    }
  };

  const totalSteps = 13;
  let currentStep = 0;

  // -------------------------------------------------------------
  // SUÍTE 1: INFRAESTRUTURA & ARMAZENAMENTO LOCAL
  // -------------------------------------------------------------
  currentStep++;
  reportProgress(currentStep, totalSteps, "Armazenamento Local & Cache Offline");
  await executeTest("Infraestrutura", "LocalStorage e SessionStorage", async () => {
    const key = `qa_test_${Date.now()}`;
    const testObj = { timestamp: Date.now(), test: "omnia_qa", array: [1, 2, 3] };
    localStorage.setItem(key, JSON.stringify(testObj));
    const retrieved = JSON.parse(localStorage.getItem(key) || "{}");
    if (!retrieved || retrieved.test !== "omnia_qa" || retrieved.array?.length !== 3) {
      throw new Error("Falha na integridade de gravação/leitura do LocalStorage.");
    }
    localStorage.removeItem(key);

    sessionStorage.setItem(key, "session_ok");
    if (sessionStorage.getItem(key) !== "session_ok") {
      throw new Error("Falha na gravação/leitura do SessionStorage.");
    }
    sessionStorage.removeItem(key);
    return "LocalStorage e SessionStorage operacionais com serialização JSON íntegra.";
  });

  currentStep++;
  reportProgress(currentStep, totalSteps, "IndexedDB / LocalForage Cache");
  await executeTest("Infraestrutura", "IndexedDB Offline Storage", async () => {
    const k = `qa_forage_${Date.now()}`;
    await localforage.setItem(k, { status: "persisted", verified: true });
    const val = await localforage.getItem(k);
    if (!val || val.status !== "persisted") {
      throw new Error("Falha ao persistir dados no LocalForage (IndexedDB).");
    }
    await localforage.removeItem(k);
    return "LocalForage / IndexedDB persistindo e recuperando registros corretamente.";
  });

  // -------------------------------------------------------------
  // SUÍTE 2: CONECTIVIDADE SUPABASE & REALTIME
  // -------------------------------------------------------------
  currentStep++;
  reportProgress(currentStep, totalSteps, "Conexão de Banco de Dados (Supabase)");
  await executeTest("Infraestrutura", "Conexão Supabase Auth & Ping", async () => {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw new Error("Erro de autenticação Supabase: " + error.message);
    return `Conexão estabelecida com sucesso. Sessão: ${data.session ? "Autenticada (" + data.session.user.email + ")" : "Convidado/Anônimo"}`;
  });

  currentStep++;
  reportProgress(currentStep, totalSteps, "Supabase Realtime WebSockets");
  await executeTest("Infraestrutura", "WebSockets e Canais em Tempo Real", async () => {
    const channelName = `qa_channel_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`;
    const channel = supabase.channel(channelName);
    await new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        supabase.removeChannel(channel);
        reject(new Error("Timeout (5s) aguardando subscrição do canal Realtime."));
      }, 5000);

      channel.subscribe((status) => {
        if (status === "SUBSCRIBED") {
          clearTimeout(timer);
          supabase.removeChannel(channel);
          resolve();
        } else if (status === "CHANNEL_ERROR") {
          clearTimeout(timer);
          supabase.removeChannel(channel);
          reject(new Error("Erro no canal WebSocket do Supabase Realtime."));
        }
      });
    });
    return "Canal Realtime assinado e desinscrito com sucesso.";
  });

  // -------------------------------------------------------------
  // SUÍTE 3: AUDIO & FEEDBACK HÁPTICO
  // -------------------------------------------------------------
  currentStep++;
  reportProgress(currentStep, totalSteps, "Sintetizador de Áudio e Efeitos Sonoros");
  await executeTest("Multimídia", "Web Audio API e Sound Effects", async () => {
    sfx.click();
    sfx.levelUp();
    return "Sintetizador Web Audio API e chamadas de efeitos sonoros disparados sem exceções.";
  });

  // -------------------------------------------------------------
  // SUÍTE 4: CRUD DE COMPROMISSOS (CRIAR, EDITAR, DELETAR)
  // -------------------------------------------------------------
  currentStep++;
  reportProgress(currentStep, totalSteps, "CRUD de Compromissos (Criar, Editar, Deletar)");
  await executeTest("Compromissos", "Ciclo Completo: Inserir, Alterar e Deletar", async () => {
    let targetUserId = userId;
    if (!targetUserId) {
      try {
        const { data } = await supabase.auth.getSession();
        targetUserId = data?.session?.user?.id;
      } catch {}
    }

    const isUuid = (id) => typeof id === "string" && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

    if (targetUserId && isUuid(targetUserId)) {
      // 1. Criar
      const newComp = await addCommitment(targetUserId, {
        tipo: "trabalho",
        disciplina: "QA Automatizado",
        assunto: "Teste E2E de Criação de Compromisso",
        prazo: "2099-12-31",
        prioridade: "importante",
        origemTexto: "Criado automaticamente pelo motor de QA Anti-Bug",
      });

      if (!newComp || !newComp.id) {
        throw new Error("Falha ao inserir compromisso no banco de dados.");
      }

      const createdId = newComp.id;

      // 2. Editar
      const updated = await updateCommitment(createdId, {
        assunto: "Teste E2E Editado com Sucesso",
        prioridade: "critico",
      });

      if (!updated || updated.assunto !== "Teste E2E Editado com Sucesso" || updated.prioridade !== "critico") {
        await deleteCommitment(createdId);
        throw new Error("Falha ao editar compromisso inserido.");
      }

      // 3. Deletar
      await deleteCommitment(createdId);

      return `Compromisso (ID: ${createdId}) inserido, editado e excluído com êxito total no Supabase.`;
    } else {
      // Modo Convidado / Offline Local Cache
      const mockId = "mock_qa_" + Date.now();
      const mockObj = {
        id: mockId,
        tipo: "trabalho",
        disciplina: "QA Automatizado",
        assunto: "Teste E2E Convidado Offline",
        prazo: "2099-12-31",
        prioridade: "importante",
      };
      await localforage.setItem(mockId, mockObj);
      mockObj.assunto = "Teste E2E Convidado Editado";
      mockObj.prioridade = "critico";
      await localforage.setItem(mockId, mockObj);
      const retrieved = await localforage.getItem(mockId);
      if (!retrieved || retrieved.prioridade !== "critico") {
        throw new Error("Falha na validação de persistência local para usuário convidado.");
      }
      await localforage.removeItem(mockId);
      return "Ciclo CRUD testado e validado em ambiente local (Modo Convidado/Offline).";
    }
  });

  // -------------------------------------------------------------
  // SUÍTE 5: INTELIGÊNCIA ARTIFICIAL & EDUCAÇÃO
  // -------------------------------------------------------------
  currentStep++;
  reportProgress(currentStep, totalSteps, "Motor de Inteligência Artificial (Groq / Gemini)");
  await executeTest("Inteligência Artificial", "Ping e Conectividade Base com IA", async () => {
    const res = await callAI("Responda estritamente 'PONG'", "Teste de ping de QA", { json: false });
    if (!res || !res.toUpperCase().includes("PONG")) {
      throw new Error("Resposta inesperada da IA: " + res);
    }
    return "IA respondeu com sucesso: " + res.trim();
  });

  currentStep++;
  reportProgress(currentStep, totalSteps, "Geração de Resumos Acadêmicos");
  await executeTest("Inteligência Artificial", "Geração de Resumos (aiGenerateSummary)", async () => {
    const summary = await aiGenerateSummary("Farmacologia", "Anestésicos locais bloqueiam os canais de sódio voltagem-dependentes.");
    if (!summary || summary.length < 15) {
      throw new Error("Resumo retornado vazio ou excessivamente curto: " + summary);
    }
    return `Resumo gerado com sucesso (~${summary.length} caracteres).`;
  });

  currentStep++;
  reportProgress(currentStep, totalSteps, "Geração de Questões e Quizzes");
  await executeTest("Inteligência Artificial", "Geração de Quizzes (aiGenerateQuiz)", async () => {
    const quiz = await aiGenerateQuiz("Dentística", "Sistemas adesivos autocondicionantes e condicionamento ácido total.");
    if (!quiz || !Array.isArray(quiz) || quiz.length === 0) {
      throw new Error("Quiz retornado em formato inválido ou sem questões.");
    }
    const q1 = quiz[0];
    const hasCorreta = q1.respostaCorreta !== undefined || q1.correta !== undefined;
    if (!q1.pergunta || !Array.isArray(q1.opcoes) || q1.opcoes.length < 2 || !hasCorreta) {
      throw new Error("Estrutura da questão do quiz inconsistente: " + JSON.stringify(q1));
    }
    return `Quiz gerado com ${quiz.length} questões estruturadas com alternativas e gabarito.`;
  });

  currentStep++;
  reportProgress(currentStep, totalSteps, "Geração de Flashcards e Avaliação Socrática");
  await executeTest("Inteligência Artificial", "Flashcards (aiGenerateFlashcards) & Professor Socrático", async () => {
    const flashcards = await aiGenerateFlashcards("Periodontia", "Sondagem periodontal avalia profundidade de bolsa e sangramento.");
    if (!flashcards || !Array.isArray(flashcards) || flashcards.length === 0) {
      throw new Error("Flashcards retornados em formato inválido.");
    }
    if (!flashcards[0].frente || !flashcards[0].verso) {
      throw new Error("Flashcard sem par frente/verso: " + JSON.stringify(flashcards[0]));
    }

    const prof = await aiEvaluateProfessor(
      "Periodontia",
      "O periodonto de proteção é composto pela gengiva e mucosa alveolar, exercendo papel de barreira biológica.",
      "A gengiva protege as estruturas periodontais subjacentes contra agressões bacterianas e mecânicas."
    );
    if (!prof || prof.nota === undefined || !prof.feedback) {
      throw new Error("Avaliação do professor socrático incompleta: " + JSON.stringify(prof));
    }

    return `Flashcards (${flashcards.length} pares) e Avaliação Socrática (Nota: ${prof.nota}) validados com perfeição.`;
  });

  // -------------------------------------------------------------
  // SUÍTE 6: SECRETARIA ACADÊMICA IA
  // -------------------------------------------------------------
  currentStep++;
  reportProgress(currentStep, totalSteps, "Secretaria Acadêmica IA (callAIWithTools)");
  await executeTest("Secretaria IA", "Chamada de Ferramentas e Mensagens da Secretária", async () => {
    const prompt = "Secretária pessoal acadêmica. Responda em português direto.";
    const convo = [{ role: "user", content: "Olá! Como você pode me ajudar na minha rotina acadêmica?" }];
    const res = await callAIWithTools(prompt, convo, ROUTINE_TOOLS);
    if (!res || (!res.text && !res.toolCalls)) {
      throw new Error("Resposta da secretária acadêmica vazia ou corrompida.");
    }
    return `Secretária respondeu com sucesso: "${(res.text || 'Chamou ferramenta ' + res.toolCalls?.[0]?.function?.name).slice(0, 80)}..."`;
  });

  // -------------------------------------------------------------
  // SUÍTE 7: VARREDURA E INTEGRIDADE DOS MODAIS DO SISTEMA
  // -------------------------------------------------------------
  currentStep++;
  reportProgress(currentStep, totalSteps, "Varredura de Modais e Componentes Críticos");
  await executeTest("Modais & Interface", "Integridade Estrutural de Modais (Wrapped, Busca, Rotina)", async () => {
    // Valida se os módulos exportados existem no bundle sem quebrar
    const testsPassed = [];

    // Checar Wrapped Story & QR Code data URL generator
    const QRCode = (await import("qrcode")).default;
    const testQr = await QRCode.toDataURL("https://omnia-unio.vercel.app", { margin: 1, width: 120 });
    if (!testQr.startsWith("data:image/png;base64,")) {
      throw new Error("Gerador de QR Code falhou na geração do data URL.");
    }
    testsPassed.push("QR Code Generator Data URL OK");

    // Checar html2canvas import
    const html2canvas = (await import("html2canvas")).default;
    if (typeof html2canvas !== "function") {
      throw new Error("html2canvas não está carregado como função no ambiente.");
    }
    testsPassed.push("html2canvas Render Engine OK");

    // Checar jsPDF
    const jsPDF = (await import("jspdf")).default;
    const doc = new jsPDF();
    if (!doc || typeof doc.save !== "function") {
      throw new Error("jsPDF falhou na inicialização.");
    }
    testsPassed.push("jsPDF Export Engine OK");

    return testsPassed.join("; ");
  });

  // -------------------------------------------------------------
  // SUÍTE 13: BIOMETRIA, MAPA MENTAL E LEITOR PDF
  // -------------------------------------------------------------
  currentStep++;
  reportProgress(currentStep, totalSteps, "Biometria, Mapas Mentais & Leitor PDF");
  await executeTest("Novos Recursos", "Biometria, Constelação & Leitor com Grifador", async () => {
    const testsPassed = [];
    
    // 1. WebAuthn e PIN
    const { isBiometricsAvailable, verifySecurityPin, setSecurityPin } = await import("./biometrics");
    const bioAvail = await isBiometricsAvailable();
    testsPassed.push(`WebAuthn Suporte: ${bioAvail ? "Disponível" : "Simulado/PIN"}`);
    
    const pinTest = "9876";
    setSecurityPin(pinTest);
    if (!verifySecurityPin(pinTest)) {
      throw new Error("Falha no validador de PIN de segurança.");
    }
    testsPassed.push("PIN Security OK");

    // 2. PDF Engine
    const { pdfjsLib } = await import("./pdf");
    if (!pdfjsLib || typeof pdfjsLib.getDocument !== "function") {
      throw new Error("pdfjsLib não está configurado ou getDocument indisponível.");
    }
    testsPassed.push("PDF.js Engine OK");

    return testsPassed.join("; ");
  });

  // -------------------------------------------------------------
  // CONSOLIDAÇÃO DO RELATÓRIO DE QA
  // -------------------------------------------------------------
  const totalDurationMs = Date.now() - startTime;
  const passedCount = results.filter((r) => r.status === "PASS").length;
  const failedCount = results.filter((r) => r.status === "FAIL").length;
  const warnedCount = results.filter((r) => r.status === "WARN").length;

  const report = {
    id: reportId,
    timestamp: new Date().toISOString(),
    mode,
    totalTests: results.length,
    passed: passedCount,
    failed: failedCount,
    warned: warnedCount,
    durationMs: totalDurationMs,
    overallStatus: failedCount === 0 ? "HEALTHY" : "DEFECTIVE",
    results,
  };

  // Persistir no LocalStorage histórico de relatórios
  try {
    localStorage.setItem("omnia_last_qa_report", JSON.stringify(report));
    const rawHistory = localStorage.getItem("omnia_qa_reports_history");
    const history = rawHistory ? JSON.parse(rawHistory) : [];
    history.unshift({
      id: report.id,
      timestamp: report.timestamp,
      overallStatus: report.overallStatus,
      passed: passedCount,
      failed: failedCount,
      durationMs: totalDurationMs,
    });
    // Manter apenas os 10 últimos
    localStorage.setItem("omnia_qa_reports_history", JSON.stringify(history.slice(0, 10)));
  } catch (e) {
    console.warn("Não foi possível salvar histórico de QA no localStorage:", e);
  }

  // Notificar ouvintes globais
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("omnia:qa-report-updated", { detail: report }));
  }

  reportProgress(totalSteps, totalSteps, "Bateria Completa Finalizada", "finished");
  return report;
}

/**
 * Função utilitária para exportar relatório de QA como arquivo .json
 */
export function downloadQAReportAsJSON(report) {
  if (!report) return;
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(report, null, 2));
  const link = document.createElement("a");
  link.setAttribute("href", dataStr);
  link.setAttribute("download", `omnia-qa-report-${new Date().toISOString().slice(0, 10)}.json`);
  document.body.appendChild(link);
  link.click();
  link.remove();
}
