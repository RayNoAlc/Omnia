import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  FileText, X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, RotateCcw,
  Highlighter, Eraser, Download, Bookmark, Plus, Loader2, Save, Check
} from "lucide-react";
import { pdfjsLib } from "../lib/pdf";
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
  const [scale, setScale] = useState(1.2);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  // 1. Carrega o documento PDF
  useEffect(() => {
    let isCancelled = false;
    setLoading(true);
    setError(null);

    const loadPdf = async () => {
      try {
        let loadingTask;
        if (fileBlob) {
          const buffer = await fileBlob.arrayBuffer();
          loadingTask = pdfjsLib.getDocument({ data: buffer });
        } else if (actualUrl) {
          loadingTask = pdfjsLib.getDocument(actualUrl);
        } else {
          throw new Error("Nenhum arquivo ou URL de PDF fornecido.");
        }

        const doc = await loadingTask.promise;
        if (!isCancelled) {
          setPdfDoc(doc);
          setNumPages(doc.numPages);
          setPageNum(1);
          setLoading(false);
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
  }, [fileUrl, fileBlob]);

  // 2. Renderiza a página atual no canvas
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

      canvas.height = viewport.height;
      canvas.width = viewport.width;

      const renderContext = {
        canvasContext: ctx,
        viewport: viewport
      };

      const task = page.render(renderContext);
      renderTaskRef.current = task;
      await task.promise;
    } catch (err) {
      if (err.name !== "RenderingCancelledException") {
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

  // 3. Captura do mouse para desenhar grifos
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

  const currentPageHighlights = highlights.filter(h => h.page === pageNum);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="w-full max-w-5xl h-[94vh] rounded-3xl flex flex-col shadow-2xl relative border overflow-hidden"
        style={{ backgroundColor: T.surface, borderColor: T.border }}
      >
        {/* Top Header */}
        <div className="px-5 py-3 border-b flex items-center justify-between gap-3 flex-wrap" style={{ borderColor: T.border, backgroundColor: T.surfaceAlt }}>
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-500 shrink-0">
              <FileText size={18} />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-bold truncate" style={{ color: T.ink }} title={actualName}>
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

          {/* Barra de Ferramentas de Grifo */}
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
                <span>{savedFeedback ? "Salvo nas Notas!" : "Anotar Página"}</span>
              </button>
            )}

            {/* Zoom */}
            <div className="flex items-center gap-1 p-1 rounded-xl border" style={{ backgroundColor: T.surface, borderColor: T.border }}>
              <button
                type="button"
                onClick={() => { sfx.pop(); setScale(s => Math.min(2.5, s + 0.2)); }}
                className="p-1 rounded-lg hover:opacity-80 active:scale-95 transition-all"
                title="Aumentar zoom"
                style={{ color: T.ink }}
              >
                <ZoomIn size={14} />
              </button>
              <button
                type="button"
                onClick={() => { sfx.pop(); setScale(s => Math.max(0.6, s - 0.2)); }}
                className="p-1 rounded-lg hover:opacity-80 active:scale-95 transition-all"
                title="Diminuir zoom"
                style={{ color: T.ink }}
              >
                <ZoomOut size={14} />
              </button>
              <button
                type="button"
                onClick={() => { sfx.click(); setScale(1.2); }}
                className="p-1 rounded-lg hover:opacity-80 active:scale-95 transition-all"
                title="Zoom padrão"
                style={{ color: T.inkSoft }}
              >
                <RotateCcw size={14} />
              </button>
            </div>

            <button
              type="button"
              onClick={() => { sfx.click(); onClose(); }}
              className="p-2 rounded-xl border hover:opacity-80 transition-opacity cursor-pointer"
              style={{ backgroundColor: T.surface, borderColor: T.border, color: T.ink }}
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Área Central: Visualizador Canvas com Overlay de Grifos */}
        <div
          ref={containerRef}
          className="flex-1 w-full overflow-auto p-4 flex flex-col items-center justify-start custom-scrollbar relative"
          style={{ backgroundColor: "#0b1120" }}
        >
          {loading ? (
            <div className="flex flex-col items-center justify-center h-full py-20 gap-3 text-slate-400">
              <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
              <span className="text-xs font-medium">Renderizando páginas do PDF...</span>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center h-full py-20 gap-2 text-rose-400 text-center max-w-sm">
              <span className="text-sm font-semibold">{error}</span>
            </div>
          ) : (
            <div className="relative shadow-2xl rounded-lg overflow-hidden border border-slate-700/60 bg-white">
              {/* Canvas da Página PDF */}
              <canvas
                ref={canvasRef}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                className={isHighlighterActive ? "cursor-crosshair select-none block" : "select-text block"}
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
              Clique e arraste sobre o texto para grifar. Os grifos ficam salvos automaticamente.
            </div>

            <div className="flex items-center gap-2 mx-auto sm:mx-0">
              <button
                type="button"
                disabled={pageNum <= 1}
                onClick={() => { sfx.pop(); setPageNum(p => Math.max(1, p - 1)); }}
                className="p-1.5 rounded-lg border disabled:opacity-30 hover:opacity-80 active:scale-95 transition-all cursor-pointer"
                style={{ backgroundColor: T.surface, borderColor: T.border, color: T.ink }}
              >
                <ChevronLeft size={16} />
              </button>

              <span className="font-mono font-semibold px-2 py-0.5 rounded-lg border" style={{ backgroundColor: T.surface, borderColor: T.border, color: T.ink }}>
                {pageNum} / {numPages}
              </span>

              <button
                type="button"
                disabled={pageNum >= numPages}
                onClick={() => { sfx.pop(); setPageNum(p => Math.min(numPages, p + 1)); }}
                className="p-1.5 rounded-lg border disabled:opacity-30 hover:opacity-80 active:scale-95 transition-all cursor-pointer"
                style={{ backgroundColor: T.surface, borderColor: T.border, color: T.ink }}
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
