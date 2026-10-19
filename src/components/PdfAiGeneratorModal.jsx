import React, { useState, useEffect, useMemo, useCallback } from "react";
import { createPortal } from "react-dom";
import {
  Sparkles, X, BookOpen, CheckCircle2, XCircle, HelpCircle,
  RotateCcw, Copy, Check, Bookmark, ArrowRight, ArrowLeft,
  ChevronDown, ChevronUp, FileText, Layers, CheckSquare, Square,
  Loader2, AlertCircle, RefreshCw, Eye, Pin, ListChecks,
  Scale, PenTool, Highlighter, StickyNote, FileEdit, Trophy
} from "lucide-react";
import confetti from "canvas-confetti";
import { T } from "./ui";
import { sfx } from "../lib/soundEffects";
import { callAI } from "../lib/ai";
import { ChatMarkdown } from "./ChatMarkdown";

/**
 * Escaneia as coordenadas de cada grifo no PDF e extrai o texto subjacente
 * utilizando a geometria das caixas de texto do PDF.js.
 */
export async function scanHighlightsText(pdfDoc, highlightsToScan) {
  if (!pdfDoc || !highlightsToScan || highlightsToScan.length === 0) return [];

  // Agrupa os grifos por página para evitar ler a mesma página várias vezes
  const pageMap = new Map();
  for (const h of highlightsToScan) {
    const pageNum = h.page || 1;
    if (!pageMap.has(pageNum)) {
      pageMap.set(pageNum, []);
    }
    pageMap.get(pageNum).push(h);
  }

  const results = [];

  for (const [pageNum, pageHighlights] of pageMap.entries()) {
    try {
      const page = await pdfDoc.getPage(pageNum);
      const viewport = page.getViewport({ scale: 1.0 });
      const textContent = await page.getTextContent();
      const textItems = textContent.items || [];

      // Converte coordenadas de cada item de texto para o espaço do viewport (scale 1.0)
      const parsedItems = [];
      for (const item of textItems) {
        if (!item.str || !item.str.trim()) continue;

        let vx = 0;
        let vy = 0;
        if (typeof viewport.convertToViewportPoint === "function") {
          const pt = viewport.convertToViewportPoint(item.transform[4], item.transform[5]);
          vx = pt[0];
          vy = pt[1];
        } else {
          vx = item.transform[4];
          vy = viewport.height - item.transform[5];
        }

        const fontHeight = Math.hypot(item.transform[2], item.transform[3]) || item.height || 12;
        const width = item.width || (item.str.length * fontHeight * 0.55);

        parsedItems.push({
          str: item.str,
          x: vx,
          y: vy - fontHeight,
          width: width,
          height: fontHeight,
          baselineY: vy,
        });
      }

      // Para cada grifo desta página, localiza os itens de texto contidos na caixa
      for (const h of pageHighlights) {
        // Tolerância de 6px para acomodar variações de arrasto manual
        const pad = 6;
        const hBox = {
          left: h.x - pad,
          right: h.x + h.width + pad,
          top: h.y - pad,
          bottom: h.y + h.height + pad,
        };

        const matchingItems = [];
        for (const item of parsedItems) {
          const itemRight = item.x + item.width;
          const itemBottom = item.y + item.height;

          // Teste de intersecção de caixas delimitadoras AABB
          const overlaps = !(
            itemRight < hBox.left ||
            item.x > hBox.right ||
            itemBottom < hBox.top ||
            item.y > hBox.bottom
          );

          if (overlaps) {
            matchingItems.push(item);
          }
        }

        // Ordena os itens em ordem de leitura natural (linha por linha, esquerda para direita)
        matchingItems.sort((a, b) => {
          if (Math.abs(a.y - b.y) > 5) {
            return a.y - b.y;
          }
          return a.x - b.x;
        });

        const extractedText = matchingItems.map((i) => i.str).join(" ").replace(/\s+/g, " ").trim();
        const userNote = (h.note || "").trim();

        results.push({
          highlightId: h.id,
          page: pageNum,
          isStickyNote: !!h.isStickyNote,
          color: h.stickyColor || "yellow",
          extractedText: extractedText,
          userNote: userNote,
          hasContent: !!(extractedText || userNote),
        });
      }
    } catch (err) {
      console.warn(`[scanHighlightsText] Aviso ao escanear pág. ${pageNum}:`, err);
      // Fallback: mantém as notas do aluno caso o motor de texto falhe
      for (const h of pageHighlights) {
        results.push({
          highlightId: h.id,
          page: pageNum,
          isStickyNote: !!h.isStickyNote,
          color: h.stickyColor || "yellow",
          extractedText: "",
          userNote: (h.note || "").trim(),
          hasContent: !!(h.note && h.note.trim()),
        });
      }
    }
  }

  return results;
}

export function PdfAiGeneratorModal({
  isOpen,
  onClose,
  pdfDoc,
  highlights = [],
  currentPage = 1,
  initialScope = "all", // "single" | "page" | "all" | "custom"
  initialHighlightId = null,
  fileName = "Documento",
  disciplina = "Geral",
  onSaveNote,
}) {
  const [scope, setScope] = useState(initialScope);
  const [targetHighlightId, setTargetHighlightId] = useState(initialHighlightId);
  const [selectedHighlightIds, setSelectedHighlightIds] = useState(() => {
    if (initialScope === "single" && initialHighlightId) return [initialHighlightId];
    if (initialScope === "page") return highlights.filter((h) => h.page === currentPage).map((h) => h.id);
    return highlights.map((h) => h.id);
  });

  const [genType, setGenType] = useState("resumo"); // 'resumo' | 'quiz' | 'vf' | 'discursiva' | 'flashcards'
  const [isScanning, setIsScanning] = useState(false);
  const [scannedItems, setScannedItems] = useState([]);
  const [showScannedPreview, setShowScannedPreview] = useState(false);

  // Estados de Geração e IA
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState(null);
  const [generatedResult, setGeneratedResult] = useState(null); // markdown string ou JSON array/object

  // Estados do Quiz Interativo
  const [quizAnswers, setQuizAnswers] = useState({});
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0);
  const [isQuizFinished, setIsQuizFinished] = useState(false);

  // Estados dos Flashcards Interativos
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isCardFlipped, setIsCardFlipped] = useState(false);

  // Feedback de ações
  const [copiedFeedback, setCopiedFeedback] = useState(false);
  const [savedFeedback, setSavedFeedback] = useState(false);

  // Sincroniza escopo inicial ao abrir
  useEffect(() => {
    if (isOpen) {
      setScope(initialScope);
      if (initialHighlightId) {
        setTargetHighlightId(initialHighlightId);
        setSelectedHighlightIds([initialHighlightId]);
      } else if (initialScope === "page") {
        const pageH = highlights.filter((h) => h.page === currentPage).map((h) => h.id);
        setSelectedHighlightIds(pageH.length > 0 ? pageH : highlights.map((h) => h.id));
      } else {
        setSelectedHighlightIds(highlights.map((h) => h.id));
      }
      setGeneratedResult(null);
      setGenerationError(null);
      setQuizAnswers({});
      setCurrentQuizIndex(0);
      setIsQuizFinished(false);
      setCurrentCardIndex(0);
      setIsCardFlipped(false);
    }
  }, [isOpen, initialScope, initialHighlightId, currentPage, highlights]);

  // Filtra os grifos selecionados para escanear de acordo com o escopo
  const activeHighlightsToScan = useMemo(() => {
    if (scope === "single") {
      const found = highlights.find((h) => h.id === targetHighlightId);
      return found ? [found] : (highlights.length > 0 ? [highlights[0]] : []);
    }
    if (scope === "page") {
      return highlights.filter((h) => h.page === currentPage);
    }
    if (scope === "custom") {
      return highlights.filter((h) => selectedHighlightIds.includes(h.id));
    }
    return highlights; // 'all'
  }, [scope, targetHighlightId, currentPage, selectedHighlightIds, highlights]);

  // Executa o escaneamento do PDF quando a seleção mudar
  useEffect(() => {
    let isMounted = true;
    if (!isOpen || !pdfDoc) return;

    if (activeHighlightsToScan.length === 0) {
      setScannedItems([]);
      return;
    }

    const runScan = async () => {
      setIsScanning(true);
      try {
        const items = await scanHighlightsText(pdfDoc, activeHighlightsToScan);
        if (isMounted) {
          setScannedItems(items);
        }
      } catch (e) {
        console.error("Erro no escaneamento:", e);
      } finally {
        if (isMounted) setIsScanning(false);
      }
    };

    runScan();
    return () => { isMounted = false; };
  }, [isOpen, pdfDoc, activeHighlightsToScan]);

  // Formata o contexto que será entregue à IA
  const buildAiContext = useCallback(() => {
    const validItems = scannedItems.filter((i) => i.hasContent);
    if (validItems.length === 0) {
      // Se não há texto grifado detectado (ex: PDF escaneado sem OCR e sem notas escritas)
      return `O usuário solicitou geração baseada no material "${fileName}", disciplina "${disciplina}", porém nenhum texto pôde ser extraído diretamente das marcações. Crie um conteúdo relevante de introdução e pontos-chave essenciais sobre "${disciplina}".`;
    }

    const lines = [];
    validItems.forEach((item, idx) => {
      const parts = [];
      if (item.extractedText) {
        parts.push(`- **Trecho Grifado no Documento (Página ${item.page}):**\n  "${item.extractedText}"`);
      }
      if (item.userNote) {
        parts.push(`- **Anotação/Post-it do Aluno (Página ${item.page}):**\n  "${item.userNote}"`);
      }
      if (parts.length > 0) {
        lines.push(`### Ponto #${idx + 1} (Página ${item.page})\n${parts.join("\n")}`);
      }
    });

    return lines.join("\n\n");
  }, [scannedItems, fileName, disciplina]);

  // Chamada de geração com IA
  const handleGenerate = async () => {
    sfx.pop();
    setIsGenerating(true);
    setGenerationError(null);
    setGeneratedResult(null);
    setQuizAnswers({});
    setCurrentQuizIndex(0);
    setIsQuizFinished(false);
    setCurrentCardIndex(0);
    setIsCardFlipped(false);

    try {
      const contextText = buildAiContext();
      let systemPrompt = "";
      let isJson = false;

      if (genType === "resumo") {
        systemPrompt = `Você é um tutor acadêmico e especialista em síntese pedagógica.
O usuário forneceu trechos grifados e anotações pessoais feitos diretamente no documento "${fileName}", referente à disciplina "${disciplina}".
Sua tarefa é gerar um RESUMO ESTRUTURADO DE ALTO IMPACTO baseado estritamente nesses grifos e anotações.

Estruture o resumo em Markdown limpo e atraente com:
- 📌 **Ideias Centrais & Conceitos Chave**
- 🔍 **Aprofundamento dos Pontos Grifados**
- 💡 **Dicas Práticas & Atenção para Provas** (destacando dúvidas e post-its anotados)
- 🎯 **Síntese Rápida / Takeaways**

Conecte as ideias de forma lógica e didática. Seja objetivo, claro e mantenha tom universitário motivador.`;
        isJson = false;
      } else if (genType === "quiz") {
        systemPrompt = `Você é um professor universitário criando um simulado de prova com questões de múltipla escolha sobre "${disciplina}" baseado nos grifos e anotações do aluno no material "${fileName}".

Crie exatamente 5 questões de múltipla escolha profundas e bem formuladas baseadas nos conceitos fornecidos.
Responda EXCLUSIVAMENTE em JSON válido, sem nenhum texto ou bloco markdown ao redor, no formato:
[
  {
    "pergunta": "Enunciado claro e contextualizado...",
    "opcoes": [
      "Alternativa A",
      "Alternativa B",
      "Alternativa C",
      "Alternativa D"
    ],
    "respostaCorreta": 0, // índice numérico de 0 a 3 da alternativa correta
    "explicacao": "Explicação pedagógica completa esclarecendo por que esta opção é a correta e conectando com o trecho grifado."
  }
]`;
        isJson = true;
      } else if (genType === "vf") {
        systemPrompt = `Você é um professor criando afirmações de Verdadeiro ou Falso para fixação de conteúdo universitário sobre "${disciplina}" baseado nos grifos e anotações do documento "${fileName}".

Crie exatamente 5 afirmações balanceadas (misture verdadeiras e falsas) para testar compreensão fina e evitar pegadinhas.
Responda EXCLUSIVAMENTE em JSON válido, sem nenhum texto ou bloco markdown ao redor, no formato:
[
  {
    "afirmacao": "Texto da afirmação para o aluno julgar...",
    "correta": true, // ou false
    "explicacao": "Justificativa clara explicando por que é verdadeira ou falsa."
  }
]`;
        isJson = true;
      } else if (genType === "discursiva") {
        systemPrompt = `Você é um avaliador universitário criando questões discursivas de prova baseadas nos grifos e notas do documento "${fileName}" sobre "${disciplina}".

Crie exatamente 3 questões abertas reflexivas que exijam capacidade de síntese e raciocínio crítico.
Responda EXCLUSIVAMENTE em JSON válido, sem nenhum texto ou bloco markdown ao redor, no formato:
[
  {
    "pergunta": "Enunciado da questão dissertativa...",
    "criterio": "Pontos-chave que a resposta do aluno deve conter...",
    "respostaModelo": "Resposta modelo completa e bem redigida esperada pela banca avaliadora."
  }
]`;
        isJson = true;
      } else if (genType === "flashcards") {
        systemPrompt = `Você é um especialista em memorização ativa e flashcards para vestibulares e faculdade.
Com base nos grifos e anotações do documento "${fileName}" sobre "${disciplina}", crie entre 6 e 8 flashcards curtos e focados para repetição espaçada.

Responda EXCLUSIVAMENTE em JSON válido, sem nenhum texto ou bloco markdown ao redor, no formato:
[
  {
    "frente": "Conceito, termo ou pergunta direta...",
    "verso": "Definição clara, resposta objetiva ou regra mnemônica..."
  }
]`;
        isJson = true;
      }

      const response = await callAI(systemPrompt, contextText, { json: isJson });
      setGeneratedResult(response);
      sfx.celebrate();
    } catch (err) {
      console.error("Erro na geração da IA:", err);
      setGenerationError(err?.message || "Ocorreu um erro ao processar com a IA.");
      sfx.hit();
    } finally {
      setIsGenerating(false);
    }
  };

  // Copia o conteúdo para a área de transferência
  const handleCopy = () => {
    sfx.click();
    let textToCopy = "";
    if (typeof generatedResult === "string") {
      textToCopy = generatedResult;
    } else if (Array.isArray(generatedResult)) {
      if (genType === "quiz") {
        textToCopy = generatedResult
          .map(
            (q, i) =>
              `Questão ${i + 1}: ${q.pergunta}\n${q.opcoes
                .map((opt, oIdx) => `  ${String.fromCharCode(65 + oIdx)}) ${opt}`)
                .join("\n")}\n\n✓ Resposta Correta: ${String.fromCharCode(65 + q.respostaCorreta)}\n💡 Explicação: ${q.explicacao}`
          )
          .join("\n\n---\n\n");
      } else if (genType === "vf") {
        textToCopy = generatedResult
          .map((v, i) => `Item ${i + 1}: ${v.afirmacao}\n✓ Julgamento: ${v.correta ? "VERDADEIRO" : "FALSO"}\n💡 ${v.explicacao}`)
          .join("\n\n");
      } else if (genType === "discursiva") {
        textToCopy = generatedResult
          .map((d, i) => `Questão ${i + 1}: ${d.pergunta}\n\nCritérios: ${d.criterio}\n\nResposta Modelo:\n${d.respostaModelo}`)
          .join("\n\n---\n\n");
      } else if (genType === "flashcards") {
        textToCopy = generatedResult.map((f, i) => `${i + 1}. [Frente]: ${f.frente}\n   [Verso]: ${f.verso}`).join("\n\n");
      }
    }

    navigator.clipboard.writeText(textToCopy);
    setCopiedFeedback(true);
    setTimeout(() => setCopiedFeedback(false), 2000);
  };

  // Salva o conteúdo gerado diretamente no caderno de notas da disciplina
  const handleSaveToNotes = async () => {
    if (!onSaveNote || !generatedResult) return;
    sfx.complete();

    let textToSave = "";
    const headerPrefix = `**Material de Estudo Gerado por IA**\nArquivo: **${fileName}**\nDisciplina: **${disciplina}**\nData: ${new Date().toLocaleDateString("pt-BR")}\n\n`;

    if (typeof generatedResult === "string") {
      textToSave = `${headerPrefix}## Resumo dos Grifos & Anotações\n\n${generatedResult}`;
    } else if (Array.isArray(generatedResult)) {
      if (genType === "quiz") {
        textToSave = `${headerPrefix}## Simulado de Questões\n\n` +
          generatedResult
            .map(
              (q, i) =>
                `### Questão ${i + 1}\n**${q.pergunta}**\n\n${q.opcoes
                  .map((opt, oIdx) => `- **${String.fromCharCode(65 + oIdx)})** ${opt}`)
                  .join("\n")}\n\n> **Gabarito:** Alternativa ${String.fromCharCode(65 + q.respostaCorreta)}\n> **Explicação:** ${q.explicacao}`
            )
            .join("\n\n---\n\n");
      } else if (genType === "vf") {
        textToSave = `${headerPrefix}## Questões de Verdadeiro ou Falso\n\n` +
          generatedResult
            .map((v, i) => `### Afirmação ${i + 1}\n"${v.afirmacao}"\n\n> **Resultado:** ${v.correta ? "VERDADEIRO" : "FALSO"}\n> **Justificativa:** ${v.explicacao}`)
            .join("\n\n---\n\n");
      } else if (genType === "discursiva") {
        textToSave = `${headerPrefix}## Questões Discursivas\n\n` +
          generatedResult
            .map((d, i) => `### Questão ${i + 1}\n**${d.pergunta}**\n\n*Critérios esperados:* ${d.criterio}\n\n**Resposta Modelo:**\n${d.respostaModelo}`)
            .join("\n\n---\n\n");
      } else if (genType === "flashcards") {
        textToSave = `${headerPrefix}## Flashcards de Memorização\n\n` +
          generatedResult.map((f, i) => `**Card #${i + 1}**\n- **Pergunta/Termo:** ${f.frente}\n- **Resposta/Definição:** ${f.verso}`).join("\n\n");
      }
    }

    try {
      await onSaveNote({
        disciplina: disciplina || "Geral",
        texto: textToSave,
      });
      setSavedFeedback(true);
      setTimeout(() => setSavedFeedback(false), 2500);
    } catch (e) {
      console.error("Erro ao salvar nota:", e);
    }
  };

  // Manipulador de clique no Quiz de Múltipla Escolha
  const handleSelectQuizOption = (qIdx, optIdx) => {
    if (quizAnswers[qIdx] !== undefined) return; // Já respondeu
    sfx.click();
    const isCorrect = optIdx === generatedResult[qIdx].respostaCorreta;
    if (isCorrect) {
      sfx.pop();
    } else {
      sfx.hit();
    }
    const nextAnswers = { ...quizAnswers, [qIdx]: optIdx };
    setQuizAnswers(nextAnswers);

    // Se completou todas as questões
    if (Object.keys(nextAnswers).length === generatedResult.length) {
      setIsQuizFinished(true);
      const score = Object.entries(nextAnswers).filter(
        ([idx, chosen]) => chosen === generatedResult[idx].respostaCorreta
      ).length;
      if (score >= Math.ceil(generatedResult.length * 0.7)) {
        confetti({ particleCount: 75, spread: 70, origin: { y: 0.6 } });
      }
    }
  };

  // Alterna seleção na modalidade personalizada
  const toggleSelectHighlight = (hId) => {
    sfx.click();
    setSelectedHighlightIds((prev) =>
      prev.includes(hId) ? prev.filter((id) => id !== hId) : [...prev, hId]
    );
  };

  if (!isOpen) return null;

  const modalContent = (
    <div
      className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 animate-fadeIn"
      style={{ zIndex: 100000 }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-4xl max-h-[92vh] flex flex-col rounded-3xl border shadow-2xl overflow-hidden animate-scaleIn"
        style={{ backgroundColor: T.surface, borderColor: T.border }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div
          className="px-5 py-4 border-b flex items-center justify-between shrink-0"
          style={{
            borderColor: T.border,
            background: "linear-gradient(135deg, rgba(168, 85, 247, 0.12), rgba(59, 130, 246, 0.12))",
          }}
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-purple-500 to-indigo-500 text-white shadow-md">
              <Sparkles size={20} className="animate-spin-slow" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold" style={{ color: T.ink }}>
                  Gerador de Estudos por IA
                </h3>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-400 border border-purple-500/30">
                  Grifos & Notas
                </span>
              </div>
              <p className="text-xs truncate max-w-[280px] sm:max-w-md" style={{ color: T.inkSoft }}>
                {fileName} • {disciplina}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Corpo do Modal */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 custom-scrollbar">
          {/* Seletor de Escopo: Granularidade (Somente uma, página, todas, personalizada) */}
          <div className="rounded-2xl p-3.5 border space-y-3" style={{ backgroundColor: T.surfaceAlt, borderColor: T.border }}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5" style={{ color: T.inkSoft }}>
                <Layers size={14} /> Selecione a Base dos Grifos:
              </span>
              <span className="text-[11px] font-mono text-purple-400 font-semibold">
                {activeHighlightsToScan.length} item(ns) selecionado(s)
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => {
                  sfx.click();
                  setScope("single");
                  if (!targetHighlightId && highlights.length > 0) {
                    setTargetHighlightId(highlights[0].id);
                  }
                }}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition-all border text-center flex flex-col items-center gap-1 cursor-pointer ${
                  scope === "single"
                    ? "bg-purple-500/25 border-purple-500 text-purple-300 shadow-xs ring-1 ring-purple-400/40"
                    : "border-transparent hover:border-slate-700 text-slate-400"
                }`}
                style={scope !== "single" ? { backgroundColor: T.surface } : {}}
              >
                <span className="flex items-center gap-1.5 font-bold">
                  <Pin size={13} className="text-pink-400" /> Somente Esta
                </span>
                <span className="text-[10px] font-normal opacity-70">1 anotação específica</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  sfx.click();
                  setScope("page");
                }}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition-all border text-center flex flex-col items-center gap-1 cursor-pointer ${
                  scope === "page"
                    ? "bg-purple-500/25 border-purple-500 text-purple-300 shadow-xs ring-1 ring-purple-400/40"
                    : "border-transparent hover:border-slate-700 text-slate-400"
                }`}
                style={scope !== "page" ? { backgroundColor: T.surface } : {}}
              >
                <span className="flex items-center gap-1.5 font-bold">
                  <FileText size={13} className="text-blue-400" /> Esta Página
                </span>
                <span className="text-[10px] font-normal opacity-70">Pág. {currentPage} ({highlights.filter(h => h.page === currentPage).length})</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  sfx.click();
                  setScope("all");
                }}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition-all border text-center flex flex-col items-center gap-1 cursor-pointer ${
                  scope === "all"
                    ? "bg-purple-500/25 border-purple-500 text-purple-300 shadow-xs ring-1 ring-purple-400/40"
                    : "border-transparent hover:border-slate-700 text-slate-400"
                }`}
                style={scope !== "all" ? { backgroundColor: T.surface } : {}}
              >
                <span className="flex items-center gap-1.5 font-bold">
                  <Layers size={13} className="text-emerald-400" /> Todo o Arquivo
                </span>
                <span className="text-[10px] font-normal opacity-70">Todas ({highlights.length})</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  sfx.click();
                  setScope("custom");
                }}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition-all border text-center flex flex-col items-center gap-1 cursor-pointer ${
                  scope === "custom"
                    ? "bg-purple-500/25 border-purple-500 text-purple-300 shadow-xs ring-1 ring-purple-400/40"
                    : "border-transparent hover:border-slate-700 text-slate-400"
                }`}
                style={scope !== "custom" ? { backgroundColor: T.surface } : {}}
              >
                <span className="flex items-center gap-1.5 font-bold">
                  <ListChecks size={13} className="text-purple-400" /> Personalizado
                </span>
                <span className="text-[10px] font-normal opacity-70">Escolher caixas</span>
              </button>
            </div>

            {/* Sub-seletor quando scope === "single" */}
            {scope === "single" && highlights.length > 0 && (
              <div className="pt-2 border-t flex flex-col gap-1.5" style={{ borderColor: T.border }}>
                <label className="text-[11px] font-medium text-slate-400">
                  Escolha qual grifo ou post-it deseja usar:
                </label>
                <select
                  value={targetHighlightId || ""}
                  onChange={(e) => {
                    sfx.click();
                    setTargetHighlightId(e.target.value);
                  }}
                  className="w-full text-xs p-2 rounded-xl border outline-none font-sans"
                  style={{ backgroundColor: T.surface, borderColor: T.border, color: T.ink }}
                >
                  {highlights.map((h, i) => (
                    <option key={h.id} value={h.id}>
                      {h.isStickyNote ? `[Post-it] Pág. ${h.page}` : `[Grifo] Pág. ${h.page}`}
                      {h.note ? ` — "${h.note.slice(0, 45)}${h.note.length > 45 ? "..." : ""}"` : ` (#${i + 1})`}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Sub-seletor com checkboxes quando scope === "custom" */}
            {scope === "custom" && (
              <div className="pt-2 border-t max-h-40 overflow-y-auto space-y-1.5 custom-scrollbar" style={{ borderColor: T.border }}>
                {highlights.map((h) => {
                  const isChecked = selectedHighlightIds.includes(h.id);
                  return (
                    <div
                      key={h.id}
                      onClick={() => toggleSelectHighlight(h.id)}
                      className={`flex items-center gap-2 p-2 rounded-xl text-xs border cursor-pointer transition-all ${
                        isChecked ? "bg-purple-500/15 border-purple-500/50 text-white" : "border-slate-800 text-slate-400 hover:text-white"
                      }`}
                      style={!isChecked ? { backgroundColor: T.surface } : {}}
                    >
                      {isChecked ? <CheckSquare size={14} className="text-purple-400 shrink-0" /> : <Square size={14} className="shrink-0" />}
                      <span className="font-bold shrink-0 flex items-center gap-1">
                        {h.isStickyNote ? <StickyNote size={12} className="text-amber-400" /> : <Highlighter size={12} className="text-yellow-400" />}
                        <span>{h.isStickyNote ? "Post-it" : "Grifo"} (Pág. {h.page}):</span>
                      </span>
                      <span className="truncate flex-1">
                        {h.note || "Trecho destacado no documento"}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Painel Informativo do Scanner do PDF */}
          <div className="rounded-2xl p-3 border text-xs" style={{ backgroundColor: T.surface, borderColor: T.border }}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {isScanning ? (
                  <Loader2 size={15} className="animate-spin text-purple-400" />
                ) : (
                  <CheckCircle2 size={15} className="text-emerald-400" />
                )}
                <span className="font-semibold" style={{ color: T.ink }}>
                  {isScanning
                    ? "Escaneando o texto correspondente no PDF..."
                    : `${scannedItems.length} marcação(ões) escaneada(s) do PDF com sucesso`}
                </span>
              </div>

              {scannedItems.length > 0 && (
                <button
                  type="button"
                  onClick={() => setShowScannedPreview(!showScannedPreview)}
                  className="text-[11px] font-bold text-purple-400 hover:text-purple-300 flex items-center gap-1 cursor-pointer"
                >
                  <Eye size={12} />
                  <span>{showScannedPreview ? "Ocultar Trechos" : "Ver Trechos Escaneados"}</span>
                  {showScannedPreview ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                </button>
              )}
            </div>

            {/* Visualização detalhada do que foi escaneado e alimentará a IA */}
            {showScannedPreview && scannedItems.length > 0 && (
              <div className="mt-3 pt-3 border-t max-h-56 overflow-y-auto space-y-2.5 custom-scrollbar" style={{ borderColor: T.border }}>
                {scannedItems.map((item, idx) => (
                  <div key={idx} className="p-2.5 rounded-xl border text-[11px] space-y-1" style={{ backgroundColor: T.surfaceAlt, borderColor: T.border }}>
                    <div className="flex items-center justify-between font-bold text-purple-400">
                      <span className="flex items-center gap-1.5">
                        {item.isStickyNote ? <StickyNote size={13} className="text-amber-400" /> : <Highlighter size={13} className="text-yellow-400" />}
                        <span>{item.isStickyNote ? "Post-it" : "Trecho Grifado"} — Página {item.page}</span>
                      </span>
                    </div>
                    {item.extractedText && (
                      <p className="text-slate-300 italic bg-black/20 p-1.5 rounded-lg border border-black/10">
                        "{item.extractedText}"
                      </p>
                    )}
                    {item.userNote && (
                      <p className="text-amber-300 font-medium flex items-center gap-1.5">
                        <FileEdit size={12} className="shrink-0 text-amber-400" />
                        <span>Anotação do Aluno:</span>
                        <span className="text-slate-200">{item.userNote}</span>
                      </p>
                    )}
                    {!item.extractedText && !item.userNote && (
                      <p className="text-slate-500 italic">Nenhum texto contido nesta caixa.</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Seletor de Tipo de Geração (Resumo vs Questões vs Flashcards) */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5" style={{ color: T.inkSoft }}>
              <BookOpen size={14} /> Escolha o que deseja gerar:
            </label>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {[
                { id: "resumo", label: "Resumo Estruturado", icon: FileText, color: "text-blue-400", desc: "Síntese didática" },
                { id: "quiz", label: "Quiz Múltipla Escolha", icon: HelpCircle, color: "text-pink-400", desc: "5 questões com gabarito" },
                { id: "vf", label: "Verdadeiro / Falso", icon: Scale, color: "text-amber-400", desc: "5 itens de fixação" },
                { id: "discursiva", label: "Questões Discursivas", icon: PenTool, color: "text-emerald-400", desc: "3 abertas com resposta" },
                { id: "flashcards", label: "Flashcards", icon: Sparkles, color: "text-purple-400", desc: "Memorização ativa" },
              ].map((tab) => {
                const IconComponent = tab.icon;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => {
                      sfx.click();
                      setGenType(tab.id);
                    }}
                    className={`p-2.5 rounded-2xl border text-center transition-all flex flex-col items-center justify-center gap-1.5 cursor-pointer ${
                      genType === tab.id
                        ? "bg-gradient-to-b from-purple-500/25 to-indigo-500/25 border-purple-500 shadow-md ring-1 ring-purple-400"
                        : "border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white"
                    }`}
                    style={genType !== tab.id ? { backgroundColor: T.surfaceAlt } : {}}
                  >
                    <IconComponent size={20} className={tab.color} />
                    <span className={`text-xs font-bold ${genType === tab.id ? "text-purple-300" : ""}`}>
                      {tab.label}
                    </span>
                    <span className="text-[10px] opacity-60 leading-tight">
                      {tab.desc}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Botão de Ação Principal: Gerar com IA */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              disabled={isGenerating || isScanning || activeHighlightsToScan.length === 0}
              onClick={handleGenerate}
              className="flex-1 py-3 px-4 rounded-2xl font-bold text-sm text-white shadow-lg flex items-center justify-center gap-2 cursor-pointer active:scale-98 transition-all disabled:opacity-40 disabled:pointer-events-none"
              style={{
                background: "linear-gradient(135deg, #9333ea, #4f46e5)",
              }}
            >
              {isGenerating ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  <span>Gerando com Inteligência Artificial...</span>
                </>
              ) : (
                <>
                  <Sparkles size={18} />
                  <span>Gerar {genType === "resumo" ? "Resumo" : genType === "flashcards" ? "Flashcards" : "Questões"} Agora</span>
                </>
              )}
            </button>
          </div>

          {/* Alerta de Erro */}
          {generationError && (
            <div className="p-4 rounded-2xl bg-rose-500/15 border border-rose-500/40 text-rose-300 text-xs flex items-start gap-2.5">
              <AlertCircle size={16} className="shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Não foi possível concluir a geração:</p>
                <p className="mt-0.5 opacity-90 leading-relaxed">{generationError}</p>
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* EXIBIÇÃO DO RESULTADO GERADO */}
          {/* ============================================================== */}
          {generatedResult && (
            <div className="space-y-4 pt-3 border-t animate-fadeIn" style={{ borderColor: T.border }}>
              {/* Barra de Ferramentas do Resultado */}
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-purple-400 flex items-center gap-1.5">
                    <Sparkles size={14} /> Resultado Gerado com Sucesso!
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="px-3 py-1.5 rounded-xl border text-xs font-semibold hover:opacity-90 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer"
                    style={{ backgroundColor: T.surfaceAlt, borderColor: T.border, color: T.ink }}
                  >
                    {copiedFeedback ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                    <span>{copiedFeedback ? "Copiado!" : "Copiar"}</span>
                  </button>

                  {onSaveNote && (
                    <button
                      type="button"
                      onClick={handleSaveToNotes}
                      className="px-3 py-1.5 rounded-xl border text-xs font-bold hover:opacity-95 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
                      style={{
                        backgroundColor: savedFeedback ? "rgba(16, 185, 129, 0.2)" : "rgba(147, 51, 234, 0.2)",
                        borderColor: savedFeedback ? "#10b981" : "#9333ea",
                        color: savedFeedback ? "#34d399" : "#c084fc",
                      }}
                    >
                      {savedFeedback ? <Check size={14} /> : <Bookmark size={14} />}
                      <span>{savedFeedback ? "Salvo no Caderno!" : "Salvar no Caderno"}</span>
                    </button>
                  )}
                </div>
              </div>

              {/* TIPO 1: RESUMO EM MARKDOWN */}
              {genType === "resumo" && typeof generatedResult === "string" && (
                <div className="p-5 rounded-2xl border leading-relaxed custom-scrollbar max-h-[500px] overflow-y-auto" style={{ backgroundColor: T.surfaceAlt, borderColor: T.border }}>
                  <ChatMarkdown text={generatedResult} />
                </div>
              )}

              {/* TIPO 2: QUIZ DE MÚLTIPLA ESCOLHA INTERATIVO */}
              {genType === "quiz" && Array.isArray(generatedResult) && (
                <div className="space-y-4">
                  {/* Stepper e Progresso */}
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-300">
                      Questão {currentQuizIndex + 1} de {generatedResult.length}
                    </span>
                    <span className="font-mono text-purple-400 font-semibold">
                      Respondidas: {Object.keys(quizAnswers).length} / {generatedResult.length}
                    </span>
                  </div>

                  {/* Barra de Progresso */}
                  <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: T.surfaceAlt }}>
                    <div
                      className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 transition-all duration-300"
                      style={{ width: `${((currentQuizIndex + 1) / generatedResult.length) * 100}%` }}
                    />
                  </div>

                  {/* Card da Questão Atual */}
                  {generatedResult[currentQuizIndex] && (
                    <div className="p-5 rounded-2xl border space-y-4" style={{ backgroundColor: T.surfaceAlt, borderColor: T.border }}>
                      <p className="text-sm sm:text-base font-semibold leading-relaxed" style={{ color: T.ink }}>
                        {generatedResult[currentQuizIndex].pergunta}
                      </p>

                      {/* Alternativas */}
                      <div className="space-y-2">
                        {generatedResult[currentQuizIndex].opcoes.map((opt, optIdx) => {
                          const isAnswered = quizAnswers[currentQuizIndex] !== undefined;
                          const isSelected = quizAnswers[currentQuizIndex] === optIdx;
                          const isCorrect = optIdx === generatedResult[currentQuizIndex].respostaCorreta;

                          let btnStyle = "border-slate-800 hover:border-slate-700 text-slate-300";
                          let bg = T.surface;
                          let letterBg = "bg-black/20 text-slate-400";

                          if (isAnswered) {
                            if (isCorrect) {
                              btnStyle = "border-emerald-500/70 text-emerald-200 ring-1 ring-emerald-500";
                              bg = "rgba(16, 185, 129, 0.15)";
                              letterBg = "bg-emerald-500 text-black";
                            } else if (isSelected) {
                              btnStyle = "border-rose-500/70 text-rose-200 ring-1 ring-rose-500";
                              bg = "rgba(244, 63, 94, 0.15)";
                              letterBg = "bg-rose-500 text-white";
                            }
                          }

                          return (
                            <button
                              key={optIdx}
                              type="button"
                              disabled={isAnswered}
                              onClick={() => handleSelectQuizOption(currentQuizIndex, optIdx)}
                              className={`w-full text-left p-3 rounded-xl border text-xs sm:text-sm font-medium transition-all flex items-start gap-3 cursor-pointer ${btnStyle} ${
                                !isAnswered ? "active:scale-[0.99] hover:bg-white/5" : ""
                              }`}
                              style={{ backgroundColor: bg }}
                            >
                              <span className={`w-6 h-6 rounded-lg text-xs font-bold flex items-center justify-center shrink-0 ${letterBg}`}>
                                {String.fromCharCode(65 + optIdx)}
                              </span>
                              <span className="flex-1 pt-0.5 leading-relaxed">{opt}</span>
                              {isAnswered && isCorrect && <CheckCircle2 size={18} className="text-emerald-400 shrink-0 mt-0.5" />}
                              {isAnswered && isSelected && !isCorrect && <XCircle size={18} className="text-rose-400 shrink-0 mt-0.5" />}
                            </button>
                          );
                        })}
                      </div>

                      {/* Caixa de Explicação Pedagógica (aparece após responder) */}
                      {quizAnswers[currentQuizIndex] !== undefined && (
                        <div className="p-3.5 rounded-xl bg-purple-500/10 border border-purple-500/30 text-xs leading-relaxed animate-fadeIn space-y-1">
                          <span className="font-bold text-purple-300 flex items-center gap-1.5">
                            <Sparkles size={13} className="text-amber-400" /> Explicação Pedagógica:
                          </span>
                          <p className="text-slate-300">
                            {generatedResult[currentQuizIndex].explicacao}
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Navegação entre Questões */}
                  <div className="flex items-center justify-between">
                    <button
                      type="button"
                      disabled={currentQuizIndex === 0}
                      onClick={() => {
                        sfx.click();
                        setCurrentQuizIndex((prev) => Math.max(0, prev - 1));
                      }}
                      className="px-3 py-1.5 rounded-xl border text-xs font-semibold disabled:opacity-30 hover:opacity-80 transition-all flex items-center gap-1 cursor-pointer"
                      style={{ backgroundColor: T.surfaceAlt, borderColor: T.border, color: T.ink }}
                    >
                      <ArrowLeft size={14} /> Anterior
                    </button>

                    <button
                      type="button"
                      disabled={currentQuizIndex >= generatedResult.length - 1}
                      onClick={() => {
                        sfx.click();
                        setCurrentQuizIndex((prev) => Math.min(generatedResult.length - 1, prev + 1));
                      }}
                      className="px-4 py-1.5 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-500 text-white disabled:opacity-30 transition-all flex items-center gap-1 cursor-pointer shadow-sm"
                    >
                      Próxima <ArrowRight size={14} />
                    </button>
                  </div>

                  {/* Resumo Final de Pontuação quando concluído */}
                  {isQuizFinished && (
                    <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-500/20 to-emerald-500/20 border border-purple-500/40 text-center space-y-2 animate-scaleIn">
                      <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto mb-1">
                        <Trophy size={20} />
                      </div>
                      <h4 className="text-sm font-bold text-white">Quiz Concluído!</h4>
                      <p className="text-xs text-slate-300">
                        Você acertou{" "}
                        <strong className="text-emerald-400 font-mono text-sm">
                          {
                            Object.entries(quizAnswers).filter(
                              ([idx, chosen]) => chosen === generatedResult[idx].respostaCorreta
                            ).length
                          }
                        </strong>{" "}
                        de {generatedResult.length} questões!
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* TIPO 3: VERDADEIRO OU FALSO INTERATIVO */}
              {genType === "vf" && Array.isArray(generatedResult) && (
                <div className="space-y-3">
                  {generatedResult.map((v, idx) => {
                    const isAnswered = quizAnswers[idx] !== undefined;
                    const chosen = quizAnswers[idx];
                    const isRight = isAnswered && chosen === v.correta;

                    return (
                      <div
                        key={idx}
                        className="p-4 rounded-2xl border space-y-3"
                        style={{ backgroundColor: T.surfaceAlt, borderColor: T.border }}
                      >
                        <div className="flex items-start gap-2.5">
                          <span className="font-bold text-xs text-purple-400 shrink-0 mt-0.5">#{idx + 1}</span>
                          <p className="text-xs sm:text-sm font-medium leading-relaxed" style={{ color: T.ink }}>
                            {v.afirmacao}
                          </p>
                        </div>

                        {/* Botões V ou F */}
                        <div className="flex items-center gap-2 pt-1">
                          <button
                            type="button"
                            disabled={isAnswered}
                            onClick={() => {
                              sfx.click();
                              setQuizAnswers((prev) => ({ ...prev, [idx]: true }));
                              if (v.correta === true) sfx.pop();
                              else sfx.hit();
                            }}
                            className={`flex-1 py-1.5 px-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer ${
                              isAnswered && v.correta === true
                                ? "bg-emerald-500/25 border-emerald-500 text-emerald-300"
                                : isAnswered && chosen === true && !v.correta
                                ? "bg-rose-500/25 border-rose-500 text-rose-300"
                                : "border-slate-800 hover:border-slate-700 text-slate-300 hover:bg-white/5"
                            }`}
                            style={!isAnswered ? { backgroundColor: T.surface } : {}}
                          >
                            <Check size={14} /> Verdadeiro
                          </button>

                          <button
                            type="button"
                            disabled={isAnswered}
                            onClick={() => {
                              sfx.click();
                              setQuizAnswers((prev) => ({ ...prev, [idx]: false }));
                              if (v.correta === false) sfx.pop();
                              else sfx.hit();
                            }}
                            className={`flex-1 py-1.5 px-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer ${
                              isAnswered && v.correta === false
                                ? "bg-emerald-500/25 border-emerald-500 text-emerald-300"
                                : isAnswered && chosen === false && v.correta
                                ? "bg-rose-500/25 border-rose-500 text-rose-300"
                                : "border-slate-800 hover:border-slate-700 text-slate-300 hover:bg-white/5"
                            }`}
                            style={!isAnswered ? { backgroundColor: T.surface } : {}}
                          >
                            <X size={14} /> Falso
                          </button>
                        </div>

                        {/* Explicação após responder */}
                        {isAnswered && (
                          <div
                            className={`p-2.5 rounded-xl border text-[11px] leading-relaxed animate-fadeIn ${
                              isRight
                                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-200"
                                : "bg-rose-500/10 border-rose-500/30 text-rose-200"
                            }`}
                          >
                            <span className="font-bold flex items-center gap-1.5">
                              {isRight ? <CheckCircle2 size={13} className="text-emerald-400 inline shrink-0" /> : <XCircle size={13} className="text-rose-400 inline shrink-0" />}
                              <span>{isRight ? "Acertou!" : "Incorreto!"} Gabarito: {v.correta ? "Verdadeiro" : "Falso"}.</span>
                            </span>{" "}
                            {v.explicacao}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* TIPO 4: QUESTÕES DISCURSIVAS */}
              {genType === "discursiva" && Array.isArray(generatedResult) && (
                <div className="space-y-4">
                  {generatedResult.map((d, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-2xl border space-y-3"
                      style={{ backgroundColor: T.surfaceAlt, borderColor: T.border }}
                    >
                      <div className="flex items-start gap-2">
                        <span className="px-2 py-0.5 rounded-lg bg-purple-500/20 text-purple-300 text-xs font-bold font-mono shrink-0">
                          Q{idx + 1}
                        </span>
                        <h4 className="text-xs sm:text-sm font-semibold leading-relaxed" style={{ color: T.ink }}>
                          {d.pergunta}
                        </h4>
                      </div>

                      {d.criterio && (
                        <div className="p-2.5 rounded-xl bg-black/20 border border-black/15 text-[11px] text-amber-300">
                          <span className="font-bold">Critérios de Avaliação:</span> {d.criterio}
                        </div>
                      )}

                      {/* Resposta Modelo Expansível */}
                      <details className="group rounded-xl border p-2.5 cursor-pointer text-xs" style={{ backgroundColor: T.surface, borderColor: T.border }}>
                        <summary className="font-bold text-purple-400 group-hover:text-purple-300 flex items-center justify-between outline-none">
                          <span>Ver Resposta Modelo do Professor</span>
                          <ChevronDown size={14} className="group-open:rotate-180 transition-transform" />
                        </summary>
                        <div className="mt-2.5 pt-2.5 border-t text-slate-300 leading-relaxed custom-scrollbar max-h-48 overflow-y-auto" style={{ borderColor: T.border }}>
                          {d.respostaModelo}
                        </div>
                      </details>
                    </div>
                  ))}
                </div>
              )}

              {/* TIPO 5: FLASHCARDS COM GIRO 3D */}
              {genType === "flashcards" && Array.isArray(generatedResult) && (
                <div className="space-y-4">
                  {/* Stepper */}
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span className="font-bold">
                      Card {currentCardIndex + 1} de {generatedResult.length}
                    </span>
                    <span>Toque no cartão para girar</span>
                  </div>

                  {/* Cartão Interativo 3D */}
                  {generatedResult[currentCardIndex] && (
                    <div
                      onClick={() => {
                        sfx.pop();
                        setIsCardFlipped(!isCardFlipped);
                      }}
                      className="min-h-[220px] p-6 rounded-3xl border flex flex-col justify-between items-center text-center cursor-pointer transition-all duration-300 shadow-xl hover:scale-[1.01]"
                      style={{
                        background: isCardFlipped
                          ? "linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(5, 150, 105, 0.2))"
                          : "linear-gradient(135deg, rgba(147, 51, 234, 0.15), rgba(79, 70, 229, 0.2))",
                        borderColor: isCardFlipped ? "#10b981" : "#8b5cf6",
                      }}
                    >
                      <span className={`text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                        isCardFlipped ? "bg-emerald-500/25 text-emerald-300" : "bg-purple-500/25 text-purple-300"
                      }`}>
                        {isCardFlipped ? "Verso / Resposta" : "Frente / Pergunta"}
                      </span>

                      <p className="text-sm sm:text-base font-medium my-4 leading-relaxed max-w-md" style={{ color: T.ink }}>
                        {isCardFlipped
                          ? generatedResult[currentCardIndex].verso
                          : generatedResult[currentCardIndex].frente}
                      </p>

                      <span className="text-[10px] text-slate-400 flex items-center gap-1 font-mono">
                        <RotateCcw size={11} /> Clique para virar
                      </span>
                    </div>
                  )}

                  {/* Navegação entre Flashcards */}
                  <div className="flex items-center justify-between">
                    <button
                      type="button"
                      disabled={currentCardIndex === 0}
                      onClick={() => {
                        sfx.click();
                        setIsCardFlipped(false);
                        setCurrentCardIndex((prev) => Math.max(0, prev - 1));
                      }}
                      className="px-3.5 py-2 rounded-xl border text-xs font-semibold disabled:opacity-30 hover:opacity-80 transition-all flex items-center gap-1 cursor-pointer"
                      style={{ backgroundColor: T.surfaceAlt, borderColor: T.border, color: T.ink }}
                    >
                      <ArrowLeft size={14} /> Anterior
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        sfx.pop();
                        setIsCardFlipped(!isCardFlipped);
                      }}
                      className="px-4 py-2 rounded-xl border text-xs font-bold flex items-center gap-1.5 cursor-pointer hover:bg-white/5"
                      style={{ borderColor: T.border, color: T.ink }}
                    >
                      <RotateCcw size={13} /> Virar Cartão
                    </button>

                    <button
                      type="button"
                      disabled={currentCardIndex >= generatedResult.length - 1}
                      onClick={() => {
                        sfx.click();
                        setIsCardFlipped(false);
                        setCurrentCardIndex((prev) => Math.min(generatedResult.length - 1, prev + 1));
                      }}
                      className="px-3.5 py-2 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-500 text-white disabled:opacity-30 transition-all flex items-center gap-1 cursor-pointer shadow-sm"
                    >
                      Próximo <ArrowRight size={14} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  if (typeof document !== "undefined") {
    return createPortal(modalContent, document.body);
  }
  return modalContent;
}
