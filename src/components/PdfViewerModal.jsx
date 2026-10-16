import React, { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import {
  FileText, X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, RotateCcw,
  Highlighter, Eraser, Download, Bookmark, Plus, Loader2, Save, Check,
  Maximize2, Minimize2
} from "lucide-react";
import { pdfjsLib } from "../lib/pdf";
import { supabase } from "../lib/supabaseClient";
import { getMaterialSignedUrl } from "../lib/db";
import { T, PrimaryButton, GhostButton } from "./ui";
import { sfx } from "../lib/soundEffects";

const HIGHLIGHT_COLORS = [
  { id: "yellow", name: "Amarelo Neon", bg: "rgba(250, 204, 21, 0.42)", border: "#eab308" },
  { id: "green", name: "Verde Menta", bg: "rgba(74, 222, 128, 0.42)", border: "#22c55e" },
  { id: "purple", name: "Lilás Foco", bg: "rgba(192, 132, 252, 0.42)", border: "#a855f7" },
  { id: "pink", name: "Rosa Destaque", bg: "rgba(244, 114, 182, 0.42)", border: "#ec4899" },
];

export function PdfViewerModal({
  fileUrl,
  pdfUrl,
  fileBlob,
  storagePath,
  fileName = "Documento.pdf",
  pdfTitle,
  materialId = "temp",
  disciplina = "Geral",
  onClose,
  onSaveNote
}) {
  const actualUrl = fileUrl || pdfUrl;
  const actualName = pdfTitle || fileName;
  const [pdfDoc, setPdfDoc] = useState(null);
  const [numPages, setNumPages] = useState(0);
  const [pageNum, setPageNum] = useState(1);
  const [scale, setScale] = useState(1.0);
  const [fitMode, setFitMode] = useState("page"); // 'page' | 'width' | 'manual'
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);

  // Ferramentas de grifo
  const [isHighlighterActive, setIsHighlighterActive] = useState(true);
  const [selectedColor, setSelectedColor] = useState(HIGHLIGHT_COLORS[0]);
  const [highlights, setHighlights] = useState(() => {
    try {
      const key = `omnia_highlights_${materialId}`;
      const saved = JSON.parse(localStorage.getItem(key) || "[]");
      return Array.isArray(saved) ? saved : [];
    } catch {
      return [];
    }
  });

  const [isDrawing, setIsDrawing] = useState(false);
  const [drawStart, setDrawStart] = useState({ x: 0, y: 0 });
  const [currentBox, setCurrentBox] = useState(null);
  const [savedFeedback, setSavedFeedback] = useState(false);

  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const renderTaskRef = useRef(null);

  // Calcula escala de auto-fit baseado no tamanho visível do container
  const calculateFitScale = useCallback(async (doc, num, mode) => {
    if (!doc || !containerRef.current) return null;
    try {
      const page = await doc.getPage(num);
      const unscaledViewport = page.getViewport({ scale: 1.0 });
      const containerW = containerRef.current.clientWidth - 48;
      const containerH = containerRef.current.clientHeight - 48;
      if (containerW <= 0 || containerH <= 0) return null;

      const scaleW = containerW / unscaledViewport.width;
      const scaleH = containerH / unscaledViewport.height;

      if (mode === "width") {
        return Math.max(0.35, Math.min(2.5, Number(scaleW.toFixed(2))));
      }
      // 'page' mode: ajusta tanto largura quanto altura para exibir a página inteira
      return Math.max(0.35, Math.min(2.5, Number(Math.min(scaleW, scaleH).toFixed(2))));
    } catch {
      return null;
    }
  }, []);

  // 1. Carrega o documento PDF
  useEffect(() => {
    let isCancelled = false;
    setLoading(true);
    setError(null);

    const loadPdf = async () => {
      try {
        let loadingTask = null;
        let buffer = null;

        // Estratégia 1: fileBlob local
        if (fileBlob) {
          buffer = await fileBlob.arrayBuffer();
        }

        // Estratégia 2: Download direto autenticado do Supabase Storage
        if (!buffer && storagePath) {
          try {
            const { data: blobData, error: dlErr } = await supabase.storage
              .from("materials")
              .download(storagePath);
            if (!dlErr && blobData) {
              buffer = await blobData.arrayBuffer();
            }
          } catch (dlEx) {
            console.warn("Download direto por storagePath falhou, tentando URLs:", dlEx);
          }
        }

        // Estratégia 3: Fetch do arrayBuffer via actualUrl
        if (!buffer && actualUrl) {
          try {
            const resp = await fetch(actualUrl);
            if (resp.ok) {
              buffer = await resp.arrayBuffer();
            }
          } catch (fetchEx) {
            console.warn("Fetch direto de actualUrl falhou:", fetchEx);
          }
        }

        // Estratégia 4: Gerar nova signedUrl e dar fetch
        if (!buffer && storagePath) {
          try {
            const freshUrl = await getMaterialSignedUrl(storagePath);
            if (freshUrl) {
              const resp = await fetch(freshUrl);
              if (resp.ok) {
                buffer = await resp.arrayBuffer();
              }
            }
          } catch (signEx) {
            console.warn("Renovação de signedUrl falhou:", signEx);
          }
        }

        const cmapConfig = {
          cMapUrl: "https://cdn.jsdelivr.net/npm/pdfjs-dist@4.10.38/cmaps/",
          cMapPacked: true,
        };

        if (buffer) {
          loadingTask = pdfjsLib.getDocument({
            data: new Uint8Array(buffer),
            ...cmapConfig,
          });
        } else if (actualUrl) {
          loadingTask = pdfjsLib.getDocument({
            url: actualUrl,
            ...cmapConfig,
          });
        } else {
          throw new Error("Nenhum arquivo ou URL de PDF fornecido.");
        }

        const doc = await loadingTask.promise;
        if (!isCancelled) {
          setPdfDoc(doc);
          setNumPages(doc.numPages);
          setPageNum(1);
          setLoading(false);

          // Ajuste inicial inteligente para que a página ou slide caiba perfeitamente
          const initialFit = await calculateFitScale(doc, 1, "page");
          if (initialFit) {
            setScale(initialFit);
            setFitMode("page");
          }
        }
      } catch (err) {
        if (!isCancelled) {
          console.error("Erro ao carregar PDF:", err);
          setError("Não foi possível carregar as páginas do PDF. Verifique o link ou o arquivo.");
          setLoading(false);
        }
      }
    };

    loadPdf();
    return () => { isCancelled = true; };
  }, [fileUrl, pdfUrl, fileBlob, storagePath, reloadKey, calculateFitScale]);

  // Recalcula a escala em caso de redimensionamento da janela
  useEffect(() => {
    const handleResize = async () => {
      if (fitMode !== "manual" && pdfDoc) {
        const fit = await calculateFitScale(pdfDoc, pageNum, fitMode);
        if (fit) setScale(fit);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [pdfDoc, pageNum, fitMode, calculateFitScale]);

  // Navegação de páginas com auto-ajuste de escala
  const handlePageChange = async (newPage) => {
    sfx.pop();
    setPageNum(newPage);
    if (fitMode !== "manual" && pdfDoc) {
      const fit = await calculateFitScale(pdfDoc, newPage, fitMode);
      if (fit) setScale(fit);
    }
  };

  // Atalhos de teclado (Setas para trocar páginas, + / - para zoom, Escape para fechar)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return;
      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "ArrowLeft") {
        handlePageChange(Math.max(1, pageNum - 1));
      } else if (e.key === "ArrowRight") {
        handlePageChange(Math.min(numPages || pageNum, pageNum + 1));
      } else if (e.key === "+" || e.key === "=") {
        setFitMode("manual");
        setScale(s => Math.min(2.5, Number((s + 0.15).toFixed(2))));
      } else if (e.key === "-") {
        setFitMode("manual");
        setScale(s => Math.max(0.35, Number((s - 0.15).toFixed(2))));
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [pageNum, numPages, onClose]);

  // 2. Renderiza a página atual no canvas com suporte a High-DPI (Retina/4K)
  const renderPage = useCallback(async (doc, num, currentScale) => {
    if (!doc || !canvasRef.current) return;

    if (renderTaskRef.current) {
      renderTaskRef.current.cancel();
    }

    try {
      const page = await doc.getPage(num);
      const viewport = page.getViewport({ scale: currentScale });
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");

      const dpr = window.devicePixelRatio || 1;
      canvas.width = Math.floor(viewport.width * dpr);
      canvas.height = Math.floor(viewport.height * dpr);
      canvas.style.width = `${Math.floor(viewport.width)}px`;
      canvas.style.height = `${Math.floor(viewport.height)}px`;

      const transform = dpr !== 1 ? [dpr, 0, 0, dpr, 0, 0] : null;

      const renderContext = {
        canvasContext: ctx,
        transform: transform,
        viewport: viewport
      };

      const task = page.render(renderContext);
      renderTaskRef.current = task;
      await task.promise;
    } catch (err) {
      if (err?.name !== "RenderingCancelledException") {
        console.error("Erro ao renderizar página:", err);
      }
    }
  }, []);

  useEffect(() => {
    if (pdfDoc) {
      renderPage(pdfDoc, pageNum, scale);
    }
  }, [pdfDoc, pageNum, scale, renderPage]);

  // Salva grifos no localStorage
  const saveHighlights = (newHighlights) => {
    setHighlights(newHighlights);
    try {
      localStorage.setItem(`omnia_highlights_${materialId}`, JSON.stringify(newHighlights));
    } catch (e) {}
  };

  // 3. Captura do mouse / touch para desenhar grifos
  const handleMouseDown = (e) => {
    if (!isHighlighterActive) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setIsDrawing(true);
    setDrawStart({ x, y });
    setCurrentBox({ x, y, width: 0, height: 0 });
  };

  const handleMouseMove = (e) => {
    if (!isDrawing || !isHighlighterActive) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const currentX = e.clientX - rect.left;
    const currentY = e.clientY - rect.top;

    const x = Math.min(drawStart.x, currentX);
    const y = Math.min(drawStart.y, currentY);
    const width = Math.abs(currentX - drawStart.x);
    const height = Math.abs(currentY - drawStart.y);

    setCurrentBox({ x, y, width, height });
  };

  const handleTouchStart = (e) => {
    if (!isHighlighterActive || !e.touches || !e.touches[0] || !canvasRef.current) return;
    const touch = e.touches[0];
    const rect = canvasRef.current.getBoundingClientRect();
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;

    setIsDrawing(true);
    setDrawStart({ x, y });
    setCurrentBox({ x, y, width: 0, height: 0 });
  };

  const handleTouchMove = (e) => {
    if (!isDrawing || !isHighlighterActive || !e.touches || !e.touches[0] || !canvasRef.current) return;
    const touch = e.touches[0];
    const rect = canvasRef.current.getBoundingClientRect();
    const currentX = touch.clientX - rect.left;
    const currentY = touch.clientY - rect.top;

    const x = Math.min(drawStart.x, currentX);
    const y = Math.min(drawStart.y, currentY);
    const width = Math.abs(currentX - drawStart.x);
    const height = Math.abs(currentY - drawStart.y);

    setCurrentBox({ x, y, width, height });
  };

  const handleMouseUp = () => {
    if (!isDrawing) return;
    setIsDrawing(false);

    if (currentBox && currentBox.width > 12 && currentBox.height > 8) {
      sfx.pop();
      const newH = [
        ...highlights,
        {
          id: Date.now().toString(36),
          page: pageNum,
          x: currentBox.x / scale,
          y: currentBox.y / scale,
          width: currentBox.width / scale,
          height: currentBox.height / scale,
          color: selectedColor.bg,
          border: selectedColor.border,
          createdAt: new Date().toISOString()
        }
      ];
      saveHighlights(newH);
    }
    setCurrentBox(null);
  };

  const removeHighlight = (hId) => {
    sfx.click();
    const filtered = highlights.filter(h => h.id !== hId);
    saveHighlights(filtered);
  };

  const clearAllPageHighlights = () => {
    sfx.click();
    const filtered = highlights.filter(h => h.page !== pageNum);
    saveHighlights(filtered);
  };

  const handleExportToNotes = () => {
    if (!onSaveNote) return;
    sfx.complete();
    const pageHighlights = highlights.filter(h => h.page === pageNum);
    const noteText = `🔖 Anotação do documento: **${actualName}** (Pág. ${pageNum})\n\nTotal de ${pageHighlights.length} trecho(s) grifado(s) nesta página.\nData: ${new Date().toLocaleDateString('pt-BR')}`;
    onSaveNote({
      disciplina: disciplina || "Geral",
      texto: noteText,
    });
    setSavedFeedback(true);
    setTimeout(() => setSavedFeedback(false), 2500);
  };

  const handleFitPage = async () => {
    sfx.click();
    setFitMode("page");
    if (pdfDoc) {
      const fit = await calculateFitScale(pdfDoc, pageNum, "page");
      if (fit) setScale(fit);
    }
  };

  const handleFitWidth = async () => {
    sfx.click();
    setFitMode("width");
    if (pdfDoc) {
      const fit = await calculateFitScale(pdfDoc, pageNum, "width");
      if (fit) setScale(fit);
    }
  };

  const handleZoomIn = () => {
    sfx.pop();
    setFitMode("manual");
    setScale((s) => Math.min(2.5, Number((s + 0.15).toFixed(2))));
  };

  const handleZoomOut = () => {
    sfx.pop();
    setFitMode("manual");
    setScale((s) => Math.max(0.35, Number((s - 0.15).toFixed(2))));
  };

  const currentPageHighlights = highlights.filter(h => h.page === pageNum);

  const modalContent = (
    <div
      className="fixed inset-0 z-[99999] flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className={`w-full ${
          isFullscreen
            ? "h-full max-w-none rounded-none border-0 m-0"
            : "max-w-6xl xl:max-w-7xl h-[95vh] rounded-2xl sm:rounded-3xl border"
        } flex flex-col shadow-2xl relative overflow-hidden transition-all duration-200`}
        style={{ backgroundColor: T.surface, borderColor: T.border }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="px-5 py-3 border-b flex items-center justify-between gap-3 flex-wrap" style={{ borderColor: T.border, backgroundColor: T.surfaceAlt }}>
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-500 shrink-0">
              <FileText size={18} />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-bold truncate max-w-xs sm:max-w-md lg:max-w-lg" style={{ color: T.ink }} title={actualName}>
                {actualName}
              </h3>
              <div className="text-[11px] flex items-center gap-2" style={{ color: T.inkSoft }}>
                <span>{disciplina}</span>
                <span>•</span>
                <span>{numPages > 0 ? `${numPages} página(s)` : "Carregando..."}</span>
                {currentPageHighlights.length > 0 && (
                  <>
                    <span>•</span>
                    <span className="text-amber-500 font-semibold">{currentPageHighlights.length} grifo(s) nesta página</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Barra de Ferramentas de Grifo e Visualização */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Seletor de Cores do Grifa-Texto */}
            <div className="flex items-center gap-1.5 p-1 rounded-xl border" style={{ backgroundColor: T.surface, borderColor: T.border }}>
              <button
                type="button"
                onClick={() => setIsHighlighterActive(!isHighlighterActive)}
                className={`p-1.5 rounded-lg transition-all flex items-center gap-1 text-xs font-semibold cursor-pointer ${
                  isHighlighterActive ? "shadow-xs" : "opacity-60"
                }`}
                style={{
                  backgroundColor: isHighlighterActive ? T.brand : "transparent",
                  color: isHighlighterActive ? T.brandInk : T.ink
                }}
                title={isHighlighterActive ? "Grifador ativo" : "Grifador desativado"}
              >
                <Highlighter size={14} />
                <span className="hidden sm:inline">Grifador</span>
              </button>

              {isHighlighterActive && (
                <div className="flex items-center gap-1 pl-1 border-l" style={{ borderColor: T.border }}>
                  {HIGHLIGHT_COLORS.map(c => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => { sfx.pop(); setSelectedColor(c); }}
                      className={`w-5 h-5 rounded-full border transition-all cursor-pointer ${
                        selectedColor.id === c.id ? "scale-115 ring-2 ring-blue-500 ring-offset-1" : "hover:scale-105"
                      }`}
                      style={{ backgroundColor: c.border, borderColor: T.border }}
                      title={c.name}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Apagar grifos da página */}
            {currentPageHighlights.length > 0 && (
              <button
                type="button"
                onClick={clearAllPageHighlights}
                className="p-2 rounded-xl border text-xs font-semibold hover:opacity-80 transition-opacity flex items-center gap-1 cursor-pointer text-rose-500"
                style={{ backgroundColor: T.surface, borderColor: T.border }}
                title="Limpar todos os grifos desta página"
              >
                <Eraser size={14} />
                <span className="hidden sm:inline">Limpar</span>
              </button>
            )}

            {/* Exportar grifos para nota */}
            {onSaveNote && (
              <button
                type="button"
                onClick={handleExportToNotes}
                className="px-2.5 py-1.5 rounded-xl border text-xs font-semibold hover:opacity-90 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer"
                style={{ backgroundColor: savedFeedback ? "rgba(16, 185, 129, 0.15)" : T.surface, borderColor: savedFeedback ? "#10b981" : T.border, color: savedFeedback ? "#10b981" : T.ink }}
                title="Criar anotação com referência a esta página"
              >
                {savedFeedback ? <Check size={14} /> : <Bookmark size={14} />}
                <span className="hidden sm:inline">{savedFeedback ? "Salvo nas Notas!" : "Anotar Página"}</span>
              </button>
            )}

            {/* Controles de Escala / Zoom */}
            <div className="flex items-center gap-1 p-1 rounded-xl border" style={{ backgroundColor: T.surface, borderColor: T.border }}>
              <button
                type="button"
                onClick={handleFitPage}
                className={`px-2 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  fitMode === "page" ? "shadow-xs font-bold" : "hover:opacity-80"
                }`}
                style={{
                  backgroundColor: fitMode === "page" ? `${T.brand}25` : "transparent",
                  color: fitMode === "page" ? T.brand : T.ink
                }}
                title="Ajustar slide/página inteira na tela"
              >
                Ajustar
              </button>

              <button
                type="button"
                onClick={handleFitWidth}
                className={`px-2 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer hidden sm:inline-block ${
                  fitMode === "width" ? "shadow-xs font-bold" : "hover:opacity-80"
                }`}
                style={{
                  backgroundColor: fitMode === "width" ? `${T.brand}25` : "transparent",
                  color: fitMode === "width" ? T.brand : T.ink
                }}
                title="Ajustar à largura"
              >
                Largura
              </button>

              <div className="w-[1px] h-4 mx-0.5" style={{ backgroundColor: T.border }} />

              <button
                type="button"
                onClick={handleZoomOut}
                className="p-1 rounded-lg hover:opacity-80 active:scale-95 transition-all cursor-pointer"
                title="Diminuir zoom (-)"
                style={{ color: T.ink }}
              >
                <ZoomOut size={14} />
              </button>

              <span className="text-[11px] font-mono px-1 select-none min-w-[3ch] text-center" style={{ color: T.inkSoft }}>
                {Math.round(scale * 100)}%
              </span>

              <button
                type="button"
                onClick={handleZoomIn}
                className="p-1 rounded-lg hover:opacity-80 active:scale-95 transition-all cursor-pointer"
                title="Aumentar zoom (+)"
                style={{ color: T.ink }}
              >
                <ZoomIn size={14} />
              </button>
            </div>

            {/* Alternar Tela Cheia */}
            <button
              type="button"
              onClick={() => { sfx.pop(); setIsFullscreen(!isFullscreen); }}
              className="p-2 rounded-xl border hover:opacity-80 transition-opacity cursor-pointer hidden sm:flex items-center justify-center"
              style={{ backgroundColor: T.surface, borderColor: T.border, color: T.ink }}
              title={isFullscreen ? "Restaurar tamanho normal" : "Tela cheia"}
            >
              {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
            </button>

            {/* Fechar */}
            <button
              type="button"
              onClick={() => { sfx.click(); onClose(); }}
              className="p-2 rounded-xl border hover:opacity-80 transition-opacity cursor-pointer"
              style={{ backgroundColor: T.surface, borderColor: T.border, color: T.ink }}
              title="Fechar leitor (Esc)"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Área Central: Visualizador Canvas com Overlay de Grifos */}
        <div
          ref={containerRef}
          className="flex-1 w-full overflow-auto p-3 sm:p-6 flex flex-col items-center justify-center custom-scrollbar relative"
          style={{ backgroundColor: "#0b1120" }}
        >
          {loading ? (
            <div className="flex flex-col items-center justify-center h-full py-20 gap-3 text-slate-400">
              <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
              <span className="text-xs font-medium">Renderizando páginas do PDF...</span>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center h-full py-20 gap-3 text-rose-400 text-center max-w-sm">
              <span className="text-sm font-semibold">{error}</span>
              <div className="flex items-center gap-2 mt-2">
                <button
                  type="button"
                  onClick={() => setReloadKey(k => k + 1)}
                  className="px-3 py-1.5 rounded-xl border text-xs font-semibold bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer"
                >
                  Tentar novamente
                </button>
                {actualUrl && (
                  <a
                    href={actualUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 rounded-xl border text-xs font-semibold bg-blue-600/20 border-blue-500/40 text-blue-400 hover:bg-blue-600/30 transition-all"
                  >
                    Abrir no navegador
                  </a>
                )}
              </div>
            </div>
          ) : (
            <div
              className="relative shadow-2xl rounded-lg overflow-hidden border border-slate-700/60 bg-white shrink-0 my-auto"
              style={{
                width: canvasRef.current?.style?.width || "auto",
                height: canvasRef.current?.style?.height || "auto",
              }}
            >
              {/* Canvas da Página PDF */}
              <canvas
                ref={canvasRef}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleMouseUp}
                className={isHighlighterActive ? "cursor-crosshair select-none block touch-none" : "select-text block"}
              />

              {/* Grifos Persistidos Renderizados Sobre a Página */}
              {currentPageHighlights.map((h) => (
                <div
                  key={h.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (confirm("Deseja remover este grifo?")) {
                      removeHighlight(h.id);
                    }
                  }}
                  className="absolute cursor-pointer transition-opacity hover:opacity-75 group"
                  style={{
                    left: `${h.x * scale}px`,
                    top: `${h.y * scale}px`,
                    width: `${h.width * scale}px`,
                    height: `${h.height * scale}px`,
                    backgroundColor: h.color,
                    borderBottom: `2px solid ${h.border}`,
                    mixBlendMode: "multiply"
                  }}
                  title="Clique para remover este grifo"
                />
              ))}

              {/* Caixa de Grifo Temporária Durante o Arraste */}
              {isDrawing && currentBox && (
                <div
                  className="absolute pointer-events-none"
                  style={{
                    left: `${currentBox.x}px`,
                    top: `${currentBox.y}px`,
                    width: `${currentBox.width}px`,
                    height: `${currentBox.height}px`,
                    backgroundColor: selectedColor.bg,
                    border: `1.5px dashed ${selectedColor.border}`,
                    mixBlendMode: "multiply"
                  }}
                />
              )}
            </div>
          )}
        </div>

        {/* Rodapé: Paginação */}
        {numPages > 0 && (
          <div className="px-5 py-2.5 border-t flex items-center justify-between text-xs" style={{ borderColor: T.border, backgroundColor: T.surfaceAlt }}>
            <div className="text-[11px] text-slate-400 hidden sm:block">
              Clique e arraste para grifar. Use as setas ← → do teclado para navegar.
            </div>

            <div className="flex items-center gap-2 mx-auto sm:mx-0">
              <button
                type="button"
                disabled={pageNum <= 1}
                onClick={() => handlePageChange(Math.max(1, pageNum - 1))}
                className="p-1.5 rounded-lg border disabled:opacity-30 hover:opacity-80 active:scale-95 transition-all cursor-pointer"
                style={{ backgroundColor: T.surface, borderColor: T.border, color: T.ink }}
                title="Página anterior (←)"
              >
                <ChevronLeft size={16} />
              </button>

              <span className="font-mono font-semibold px-2 py-0.5 rounded-lg border" style={{ backgroundColor: T.surface, borderColor: T.border, color: T.ink }}>
                {pageNum} / {numPages}
              </span>

              <button
                type="button"
                disabled={pageNum >= numPages}
                onClick={() => handlePageChange(Math.min(numPages, pageNum + 1))}
                className="p-1.5 rounded-lg border disabled:opacity-30 hover:opacity-80 active:scale-95 transition-all cursor-pointer"
                style={{ backgroundColor: T.surface, borderColor: T.border, color: T.ink }}
                title="Próxima página (→)"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  if (typeof document !== "undefined") {
    return createPortal(modalContent, document.body);
  }
  return modalContent;
}
