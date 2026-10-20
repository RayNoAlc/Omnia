import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { createPortal } from "react-dom";
import {
  FileText, X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, RotateCcw, RotateCw,
  Highlighter, Eraser, Download, Bookmark, Plus, Loader2, Save, Check,
  Maximize2, Minimize2, StickyNote, Trash2, Pin, MessageSquare, ExternalLink, Sparkles,
  Move, Columns, Hand
} from "lucide-react";
import { pdfjsLib } from "../lib/pdf";
import { supabase } from "../lib/supabaseClient";
import { getMaterialSignedUrl } from "../lib/db";
import { T, PrimaryButton, GhostButton } from "./ui";
import { sfx } from "../lib/soundEffects";
import { PdfAiGeneratorModal } from "./PdfAiGeneratorModal";

const HIGHLIGHT_COLORS = [
  { id: "yellow", name: "Amarelo Neon", bg: "rgba(250, 204, 21, 0.42)", border: "#eab308" },
  { id: "green", name: "Verde Menta", bg: "rgba(74, 222, 128, 0.42)", border: "#22c55e" },
  { id: "purple", name: "Lilás Foco", bg: "rgba(192, 132, 252, 0.42)", border: "#a855f7" },
  { id: "pink", name: "Rosa Destaque", bg: "rgba(244, 114, 182, 0.42)", border: "#ec4899" },
];

const POST_IT_THEMES = {
  yellow: {
    bg: "#fef9c3",
    border: "#fde047",
    text: "#713f12",
    accent: "#eab308",
    name: "Amarelo"
  },
  green: {
    bg: "#dcfce7",
    border: "#86efac",
    text: "#14532d",
    accent: "#22c55e",
    name: "Verde"
  },
  purple: {
    bg: "#f3e8ff",
    border: "#d8b4fe",
    text: "#581c87",
    accent: "#a855f7",
    name: "Lilás"
  },
  pink: {
    bg: "#fce7f3",
    border: "#f472b6",
    text: "#831843",
    accent: "#ec4899",
    name: "Rosa"
  },
};

export function PdfViewerModal({
  fileUrl,
  pdfUrl,
  fileBlob,
  storagePath,
  fileName = "Documento.pdf",
  pdfTitle,
  materialId = "temp",
  disciplina = "Geral",
  initialPage = 1,
  onClose,
  onSaveNote
}) {
  const actualUrl = fileUrl || pdfUrl;
  const actualName = pdfTitle || fileName;
  const startingPage = Math.max(1, parseInt(initialPage, 10) || 1);
  const [pdfDoc, setPdfDoc] = useState(null);
  const [numPages, setNumPages] = useState(0);
  const [pageNum, setPageNum] = useState(startingPage);
  const [scale, setScale] = useState(1.0);
  const [fitMode, setFitMode] = useState("page"); // 'page' | 'width' | 'manual'
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [pageSize, setPageSize] = useState(null);

  // Ferramentas de grifo e Post-it (no mobile inicia em modo leitura/navegação para evitar conflito com scroll por toque)
  const [isHighlighterActive, setIsHighlighterActive] = useState(() => {
    if (typeof window !== "undefined" && window.innerWidth < 768) return false;
    return true;
  });
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

  // Adaptação Mobile: Post-it Bottom Sheet dedicado
  const [mobileEditingSticky, setMobileEditingSticky] = useState(null);

  // Bloco de Notas / Post-its Drawer
  const [isNotesDrawerOpen, setIsNotesDrawerOpen] = useState(false);
  const [activeHighlightId, setActiveHighlightId] = useState(null);
  const [drawerScope, setDrawerScope] = useState("page"); // "page" | "all"

  // Estado de Arraste e Redimensionamento de Post-its
  const [dragState, setDragState] = useState(null); // { id, startX, startY, origX, origY, currentX, currentY }
  const [resizeState, setResizeState] = useState(null); // { id, startX, startY, origW, origH, currentW, currentH }

  // Gerador de Resumos e Questões por IA
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [aiModalScope, setAiModalScope] = useState("all"); // "single" | "page" | "all" | "custom"
  const [aiModalTargetId, setAiModalTargetId] = useState(null);

  const handleOpenAiModal = (scope = "all", targetId = null) => {
    sfx.pop();
    setAiModalScope(scope);
    setAiModalTargetId(targetId);
    setIsAiModalOpen(true);
  };

  const highlightedPages = useMemo(() => {
    return Array.from(new Set(highlights.map(h => h.page))).sort((a, b) => a - b);
  }, [highlights]);

  const currentPageHighlights = useMemo(() => {
    return highlights.filter((h) => h.page === pageNum);
  }, [highlights, pageNum]);

  const pageNotes = useMemo(() => {
    return highlights.filter((h) => h.page === pageNum && (h.isStickyNote || (h.note && h.note.trim())));
  }, [highlights, pageNum]);

  const allNotes = useMemo(() => {
    return highlights.filter((h) => h.isStickyNote || (h.note && h.note.trim()));
  }, [highlights]);

  const displayedNotes = useMemo(() => {
    return drawerScope === "page" ? currentPageHighlights : highlights;
  }, [drawerScope, currentPageHighlights, highlights]);

  const [isDrawing, setIsDrawing] = useState(false);
  const [drawStart, setDrawStart] = useState({ x: 0, y: 0 });
  const [currentBox, setCurrentBox] = useState(null);
  const [savedFeedback, setSavedFeedback] = useState(false);

  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const pageWrapperRef = useRef(null);
  const renderTaskRef = useRef(null);

  // Escala atual armazenada em ref para acesso instantâneo em event listeners de toque sem closures defasadas
  const scaleRef = useRef(scale);
  useEffect(() => {
    scaleRef.current = scale;
  }, [scale]);

  // Gestos de Touch: Pinch-to-Zoom com 2 dedos no mobile (60-120fps via transform + render vetorial na soltura)
  const [isPinching, setIsPinching] = useState(false);
  const [pinchScaleFactor, setPinchScaleFactor] = useState(1);
  const [pinchOrigin, setPinchOrigin] = useState({ x: 0, y: 0 });
  const [pinchDisplayScale, setPinchDisplayScale] = useState(scale);
  const pinchDataRef = useRef({
    active: false,
    startDistance: 0,
    initialScale: 1,
    centerX: 0,
    centerY: 0,
    targetScale: 1,
    originX: 0,
    originY: 0,
  });

  // Listener touch passivo=false no container para prevenir zoom nativo da página e controlar pinch com precisão
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const finishPinch = () => {
      if (!pinchDataRef.current.active) return;
      const { targetScale, initialScale, originX, originY } = pinchDataRef.current;
      pinchDataRef.current.active = false;

      setIsPinching(false);
      setPinchScaleFactor(1);

      const finalScale = Number(targetScale.toFixed(2));
      if (Math.abs(finalScale - initialScale) > 0.02) {
        sfx.pop();
        setFitMode("manual");
        setScale(finalScale);

        // Compensa o scroll para manter o ponto pinçado centralizado na tela
        if (containerRef.current && initialScale > 0) {
          const ratio = finalScale / initialScale;
          const currentScrollLeft = containerRef.current.scrollLeft;
          const currentScrollTop = containerRef.current.scrollTop;
          const deltaX = originX * (ratio - 1);
          const deltaY = originY * (ratio - 1);

          requestAnimationFrame(() => {
            if (containerRef.current) {
              containerRef.current.scrollLeft = Math.max(0, currentScrollLeft + deltaX);
              containerRef.current.scrollTop = Math.max(0, currentScrollTop + deltaY);
            }
          });
        }
      }
    };

    const handleContainerTouchStart = (e) => {
      if (e.touches && e.touches.length === 2) {
        // Intercepta pinch de dois dedos
        e.preventDefault();
        setIsDrawing(false);
        setCurrentBox(null);

        const t1 = e.touches[0];
        const t2 = e.touches[1];
        const dist = Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY);
        const midX = (t1.clientX + t2.clientX) / 2;
        const midY = (t1.clientY + t2.clientY) / 2;

        let originX = 0;
        let originY = 0;
        if (pageWrapperRef.current) {
          const rect = pageWrapperRef.current.getBoundingClientRect();
          originX = midX - rect.left;
          originY = midY - rect.top;
        }

        pinchDataRef.current = {
          active: true,
          startDistance: Math.max(dist, 10),
          initialScale: scaleRef.current,
          centerX: midX,
          centerY: midY,
          targetScale: scaleRef.current,
          originX,
          originY,
        };

        setPinchOrigin({ x: originX, y: originY });
        setPinchScaleFactor(1);
        setPinchDisplayScale(scaleRef.current);
        setIsPinching(true);
      } else if (pinchDataRef.current.active && (!e.touches || e.touches.length < 2)) {
        finishPinch();
      }
    };

    const handleContainerTouchMove = (e) => {
      if (e.touches && e.touches.length === 2 && pinchDataRef.current.active) {
        e.preventDefault(); // Evita zoom da página inteira no navegador

        const t1 = e.touches[0];
        const t2 = e.touches[1];
        const dist = Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY);
        const ratio = dist / pinchDataRef.current.startDistance;

        const rawScale = pinchDataRef.current.initialScale * ratio;
        // Limita zoom entre 35% e 300%
        const clampedScale = Math.max(0.35, Math.min(3.0, rawScale));
        const factor = clampedScale / pinchDataRef.current.initialScale;

        pinchDataRef.current.targetScale = clampedScale;
        setPinchScaleFactor(factor);
        setPinchDisplayScale(clampedScale);
      }
    };

    const handleContainerTouchEnd = (e) => {
      if (pinchDataRef.current.active) {
        if (!e.touches || e.touches.length < 2) {
          finishPinch();
        }
      }
    };

    const handleContainerTouchCancel = () => {
      if (pinchDataRef.current.active) {
        finishPinch();
      }
    };

    // Suporte também a pinch com touchpad no laptop (Ctrl + Wheel)
    const handleContainerWheel = (e) => {
      if (e.ctrlKey) {
        e.preventDefault();
        const zoomFactor = e.deltaY < 0 ? 1.08 : 0.92;
        setFitMode("manual");
        setScale((prev) => Math.max(0.35, Math.min(3.0, Number((prev * zoomFactor).toFixed(2)))));
      }
    };

    container.addEventListener("touchstart", handleContainerTouchStart, { passive: false });
    container.addEventListener("touchmove", handleContainerTouchMove, { passive: false });
    container.addEventListener("touchend", handleContainerTouchEnd, { passive: false });
    container.addEventListener("touchcancel", handleContainerTouchCancel, { passive: false });
    container.addEventListener("wheel", handleContainerWheel, { passive: false });

    return () => {
      container.removeEventListener("touchstart", handleContainerTouchStart);
      container.removeEventListener("touchmove", handleContainerTouchMove);
      container.removeEventListener("touchend", handleContainerTouchEnd);
      container.removeEventListener("touchcancel", handleContainerTouchCancel);
      container.removeEventListener("wheel", handleContainerWheel);
    };
  }, []);

  // Calcula escala de auto-fit baseado no tamanho visível do container com margem de respiro confortável
  const calculateFitScale = useCallback(async (doc, num, mode) => {
    if (!doc || !containerRef.current) return null;
    try {
      const page = await doc.getPage(num);
      const unscaledViewport = page.getViewport({ scale: 1.0 });
      const containerW = containerRef.current.clientWidth - 80;
      const containerH = containerRef.current.clientHeight - 80;
      if (containerW <= 0 || containerH <= 0) return null;

      const scaleW = containerW / unscaledViewport.width;
      const scaleH = containerH / unscaledViewport.height;

      if (mode === "width") {
        return Math.max(0.35, Math.min(2.0, Number((scaleW * 0.95).toFixed(2))));
      }
      // 'page' mode: ajusta tanto largura quanto altura para exibir a página inteira com margem confortável (sem zoom apertado)
      const pageScale = Math.min(scaleW, scaleH) * 0.88;
      return Math.max(0.35, Math.min(1.5, Number(pageScale.toFixed(2))));
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
          try {
            buffer = await fileBlob.arrayBuffer();
          } catch (blobErr) {
            console.warn("Falha ao ler fileBlob:", blobErr);
          }
        }

        // Estratégia 2: Download direto autenticado do Supabase Storage (ignora CORS)
        if (!buffer && storagePath) {
          try {
            const { data: blobData, error: dlErr } = await supabase.storage
              .from("materials")
              .download(storagePath);
            if (!dlErr && blobData) {
              buffer = await blobData.arrayBuffer();
            } else if (storagePath.includes("%")) {
              const decodedPath = decodeURIComponent(storagePath);
              const { data: bData2, error: dlErr2 } = await supabase.storage
                .from("materials")
                .download(decodedPath);
              if (!dlErr2 && bData2) {
                buffer = await bData2.arrayBuffer();
              }
            }
          } catch (dlEx) {
            console.warn("Download direto por storagePath falhou, tentando URLs assinadas:", dlEx);
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

        // Estratégia 4: Gerar nova signedUrl e dar fetch (ou passar direto para pdfjs)
        let workingUrl = actualUrl;
        if (!buffer && storagePath) {
          try {
            const freshUrl = await getMaterialSignedUrl(storagePath);
            if (freshUrl) {
              workingUrl = freshUrl;
              try {
                const resp = await fetch(freshUrl);
                if (resp.ok) {
                  buffer = await resp.arrayBuffer();
                }
              } catch (signFetchEx) {
                console.warn("Fetch de freshUrl falhou (possível CORS), abrindo direto via URL no pdfjs:", signFetchEx);
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
        } else if (workingUrl) {
          loadingTask = pdfjsLib.getDocument({
            url: workingUrl,
            ...cmapConfig,
          });
        } else {
          throw new Error("Não foi possível carregar as páginas do PDF. Verifique se o arquivo ainda existe no armazenamento.");
        }

        const doc = await loadingTask.promise;
        if (!isCancelled) {
          const targetPage = Math.min(Math.max(1, startingPage), doc.numPages);
          setPdfDoc(doc);
          setNumPages(doc.numPages);
          setPageNum(targetPage);
          setLoading(false);

          // Ajuste inicial inteligente para que a página caiba confortavelmente na tela
          const initialFit = await calculateFitScale(doc, targetPage, "page");
          if (initialFit) {
            setScale(initialFit);
            setFitMode("page");
          }

          // Recalcula logo após a renderização do layout para garantir proporção perfeita
          setTimeout(async () => {
            if (!isCancelled) {
              const freshFit = await calculateFitScale(doc, targetPage, "page");
              if (freshFit) {
                setScale(freshFit);
                setFitMode("page");
              }
            }
          }, 90);
        }
      } catch (err) {
        if (!isCancelled) {
          console.error("Erro ao carregar PDF:", err);
          setError("Não foi possível carregar as páginas do PDF. Verifique se o arquivo existe ou tente novamente.");
          setLoading(false);
        }
      }
    };

    loadPdf();
    return () => { isCancelled = true; };
  }, [fileUrl, pdfUrl, fileBlob, storagePath, reloadKey, calculateFitScale, startingPage]);

  // Sincroniza página se a prop initialPage mudar dinamicamente
  useEffect(() => {
    if (initialPage && pdfDoc) {
      const p = Math.min(Math.max(1, parseInt(initialPage, 10) || 1), pdfDoc.numPages);
      setPageNum(p);
    }
  }, [initialPage, pdfDoc]);

  // Observador reativo de redimensionamento do container (responsivo a drawers, modais e telas móveis)
  useEffect(() => {
    if (!containerRef.current || !pdfDoc) return;
    const el = containerRef.current;
    let resizeTimer = null;
    const ro = new ResizeObserver(() => {
      if (fitMode !== "manual" && pdfDoc) {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(async () => {
          const fit = await calculateFitScale(pdfDoc, pageNum, fitMode);
          if (fit && fit > 0) {
            setScale(fit);
          }
        }, 50);
      }
    });
    ro.observe(el);
    return () => {
      clearTimeout(resizeTimer);
      ro.disconnect();
    };
  }, [pdfDoc, pageNum, fitMode, calculateFitScale, isNotesDrawerOpen]);

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

      const cssW = Math.floor(viewport.width);
      const cssH = Math.floor(viewport.height);
      canvas.width = Math.floor(viewport.width * dpr);
      canvas.height = Math.floor(viewport.height * dpr);
      canvas.style.width = `${cssW}px`;
      canvas.style.height = `${cssH}px`;
      setPageSize({ width: cssW, height: cssH });

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
    if (isPinching || (e.touches && e.touches.length > 1)) {
      if (isDrawing) {
        setIsDrawing(false);
        setCurrentBox(null);
      }
      return;
    }
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
    if (isPinching || (e.touches && e.touches.length > 1)) {
      if (isDrawing) {
        setIsDrawing(false);
        setCurrentBox(null);
      }
      return;
    }
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
      const newHId = Date.now().toString(36);
      const newH = [
        ...highlights,
        {
          id: newHId,
          page: pageNum,
          x: currentBox.x / scale,
          y: currentBox.y / scale,
          width: currentBox.width / scale,
          height: currentBox.height / scale,
          color: selectedColor.bg,
          border: selectedColor.border,
          stickyColor: selectedColor.id || "yellow",
          note: "",
          createdAt: new Date().toISOString()
        }
      ];
      saveHighlights(newH);
      setActiveHighlightId(newHId);
    }
    setCurrentBox(null);
  };

  const updateHighlight = (hId, patch = {}) => {
    const updated = highlights.map(h => {
      if (h.id === hId) {
        return {
          ...h,
          ...patch,
          updatedAt: new Date().toISOString(),
        };
      }
      return h;
    });
    saveHighlights(updated);
  };

  const updateHighlightNote = (hId, text, extraProps = {}) => {
    updateHighlight(hId, { note: text, ...extraProps });
  };

  const ROTATION_PRESETS = [0, 3, -3, 90];

  const handleCycleRotation = (h) => {
    sfx.pop();
    const currentRot = h.rotation || 0;
    const currentIdx = ROTATION_PRESETS.indexOf(currentRot);
    const nextRot = currentIdx >= 0 && currentIdx < ROTATION_PRESETS.length - 1
      ? ROTATION_PRESETS[currentIdx + 1]
      : ROTATION_PRESETS[0];

    updateHighlight(h.id, { rotation: nextRot });
  };

  const handleToggleOrientation = (h) => {
    sfx.pop();
    const curW = h.width || 170;
    const curH = h.height || 110;

    // Se estiver em modo Paisagem (largura >= altura), inverte para Retrato
    if (curW >= curH) {
      updateHighlight(h.id, {
        width: Math.min(curH, 160),
        height: Math.max(curW, 210),
      });
    } else {
      // Se estiver em modo Retrato, inverte para Paisagem
      updateHighlight(h.id, {
        width: Math.max(curH, 220),
        height: Math.min(curW, 130),
      });
    }
  };

  const handleTogglePin = (h) => {
    sfx.pop();
    const nextPinned = !h.isPinned;
    updateHighlight(h.id, { isPinned: nextPinned });
  };

  const handleSetStickyPresetSize = (h, sizeKey) => {
    sfx.pop();
    if (sizeKey === "p") {
      updateHighlight(h.id, { width: 140, height: 95 });
    } else if (sizeKey === "m") {
      updateHighlight(h.id, { width: 200, height: 130 });
    } else if (sizeKey === "g") {
      updateHighlight(h.id, { width: 280, height: 180 });
    }
  };

  const handleStartDragSticky = (e, h) => {
    if (isPinching || pinchDataRef.current?.active) return;
    if (e.touches && e.touches.length > 1) return;
    if (h.isPinned) return; // Se fixado, bloqueia arraste
    if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA" || e.target.closest("button") || e.target.closest(".resize-handle")) {
      return;
    }
    e.stopPropagation();
    if (e.cancelable) e.preventDefault();
    const clientX = e.clientX !== undefined ? e.clientX : e.touches?.[0]?.clientX;
    const clientY = e.clientY !== undefined ? e.clientY : e.touches?.[0]?.clientY;
    if (clientX === undefined || clientY === undefined) return;

    setActiveHighlightId(h.id);
    setDragState({
      id: h.id,
      startX: clientX,
      startY: clientY,
      origX: h.x,
      origY: h.y,
      currentX: h.x,
      currentY: h.y,
    });
  };

  const handleStartResizeSticky = (e, h) => {
    if (isPinching || pinchDataRef.current?.active) return;
    if (e.touches && e.touches.length > 1) return;
    e.stopPropagation();
    if (e.cancelable) e.preventDefault();

    const clientX = e.clientX !== undefined ? e.clientX : e.touches?.[0]?.clientX;
    const clientY = e.clientY !== undefined ? e.clientY : e.touches?.[0]?.clientY;
    if (clientX === undefined || clientY === undefined) return;

    setActiveHighlightId(h.id);
    setResizeState({
      id: h.id,
      startX: clientX,
      startY: clientY,
      origW: h.width || 170,
      origH: h.height || 110,
      currentW: h.width || 170,
      currentH: h.height || 110,
    });
  };

  // Efeito global de ponteiro para arraste suave
  useEffect(() => {
    if (!dragState) return;

    const handlePointerMove = (e) => {
      const clientX = e.clientX !== undefined ? e.clientX : e.touches?.[0]?.clientX;
      const clientY = e.clientY !== undefined ? e.clientY : e.touches?.[0]?.clientY;
      if (clientX === undefined || clientY === undefined) return;

      const deltaX = (clientX - dragState.startX) / scale;
      const deltaY = (clientY - dragState.startY) / scale;

      const maxW = canvasRef.current ? canvasRef.current.clientWidth / scale : 1200;
      const maxH = canvasRef.current ? canvasRef.current.clientHeight / scale : 1800;

      const newX = Math.max(0, Math.min(maxW - 50, dragState.origX + deltaX));
      const newY = Math.max(0, Math.min(maxH - 40, dragState.origY + deltaY));

      setDragState(prev => prev ? { ...prev, currentX: newX, currentY: newY } : null);
    };

    const handlePointerUp = () => {
      setDragState(prev => {
        if (prev) {
          const finalX = prev.currentX !== undefined ? Math.round(prev.currentX) : Math.round(prev.origX);
          const finalY = prev.currentY !== undefined ? Math.round(prev.currentY) : Math.round(prev.origY);
          updateHighlight(prev.id, { x: finalX, y: finalY });
          sfx.pop();
        }
        return null;
      });
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
    window.addEventListener("pointercancel", handlePointerUp);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
      window.removeEventListener("pointercancel", handlePointerUp);
    };
  }, [dragState, scale]);

  // Efeito global de ponteiro para redimensionamento suave
  useEffect(() => {
    if (!resizeState) return;

    const handlePointerMove = (e) => {
      const clientX = e.clientX !== undefined ? e.clientX : e.touches?.[0]?.clientX;
      const clientY = e.clientY !== undefined ? e.clientY : e.touches?.[0]?.clientY;
      if (clientX === undefined || clientY === undefined) return;

      const deltaW = (clientX - resizeState.startX) / scale;
      const deltaH = (clientY - resizeState.startY) / scale;

      const newW = Math.max(120, Math.min(700, resizeState.origW + deltaW));
      const newH = Math.max(70, Math.min(700, resizeState.origH + deltaH));

      setResizeState(prev => prev ? { ...prev, currentW: newW, currentH: newH } : null);
    };

    const handlePointerUp = () => {
      setResizeState(prev => {
        if (prev) {
          const finalW = prev.currentW !== undefined ? Math.round(prev.currentW) : Math.round(prev.origW);
          const finalH = prev.currentH !== undefined ? Math.round(prev.currentH) : Math.round(prev.origH);
          updateHighlight(prev.id, { width: finalW, height: finalH });
          sfx.click();
        }
        return null;
      });
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
    window.addEventListener("pointercancel", handlePointerUp);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
      window.removeEventListener("pointercancel", handlePointerUp);
    };
  }, [resizeState, scale]);

  const handleAddPageStickyNote = (color = selectedColor) => {
    sfx.pop();
    const existingCount = currentPageHighlights.filter(h => h.isStickyNote).length;

    // Calcula posição inicial visível e centralizada na área que o usuário está olhando
    let posX = 80;
    let posY = 100;
    if (containerRef.current && canvasRef.current) {
      const containerEl = containerRef.current;
      const canvasEl = canvasRef.current;
      const cRect = containerEl.getBoundingClientRect();
      const cvRect = canvasEl.getBoundingClientRect();

      // Posição visível relativa ao canvas atual
      const visibleTop = Math.max(0, cRect.top - cvRect.top);
      const visibleLeft = Math.max(0, cRect.left - cvRect.left);
      const visibleW = Math.min(cvRect.width, cRect.width);
      const visibleH = Math.min(cvRect.height, cRect.height);

      const offset = (existingCount % 4) * 20;
      posX = Math.max(30, ((visibleLeft + visibleW / 2) / scale) - 90 + offset);
      posY = Math.max(30, ((visibleTop + visibleH / 3) / scale) - 60 + offset);

      const maxCanvasW = canvasEl ? (canvasEl.clientWidth / scale) - 200 : 600;
      const maxCanvasH = canvasEl ? (canvasEl.clientHeight / scale) - 150 : 800;
      posX = Math.min(Math.max(20, posX), Math.max(20, maxCanvasW));
      posY = Math.min(Math.max(20, posY), Math.max(20, maxCanvasH));
    }

    const newSticky = {
      id: Date.now().toString(36),
      page: pageNum,
      x: Math.round(posX),
      y: Math.round(posY),
      width: 180,
      height: 120,
      isStickyNote: true,
      color: color.bg,
      border: color.border,
      stickyColor: color.id || "yellow",
      note: "",
      isPinned: false,
      rotation: 0,
      createdAt: new Date().toISOString()
    };
    const nextH = [...highlights, newSticky];
    saveHighlights(nextH);
    setActiveHighlightId(newSticky.id);
    if (typeof window !== "undefined" && window.innerWidth < 768) {
      setMobileEditingSticky(newSticky);
    } else {
      setIsNotesDrawerOpen(true);
    }
  };

  const handleExportPostItToNotes = (h) => {
    if (!onSaveNote) return;
    sfx.complete();
    const noteContent = (h.note || "").trim();
    const typeLabel = h.isStickyNote ? "Post-it" : "Anotação de Grifo";
    const noteText = `🔖 ${typeLabel}: **${actualName}** (Pág. ${h.page})\n\n"${noteContent}"\n\nData: ${new Date().toLocaleDateString('pt-BR')}`;
    
    onSaveNote({
      disciplina: disciplina || "Geral",
      texto: noteText,
    });
    setSavedFeedback(true);
    setTimeout(() => setSavedFeedback(false), 2500);
  };

  const removeHighlight = (hId) => {
    sfx.click();
    const filtered = highlights.filter(h => h.id !== hId);
    saveHighlights(filtered);
    if (activeHighlightId === hId) setActiveHighlightId(null);
  };

  const clearAllPageHighlights = () => {
    sfx.click();
    const filtered = highlights.filter(h => h.page !== pageNum);
    saveHighlights(filtered);
    setActiveHighlightId(null);
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
        {/* Top Header - Mobile (Compact, limpo e voltado para toque) */}
        <div className="flex md:hidden px-3.5 py-2.5 border-b items-center justify-between gap-2 shrink-0 select-none" style={{ borderColor: T.border, backgroundColor: T.surfaceAlt }}>
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-500 shrink-0">
              <FileText size={16} />
            </div>
            <div className="min-w-0">
              <h3 className="text-xs font-bold truncate" style={{ color: T.ink }} title={actualName}>
                {actualName}
              </h3>
              <div className="text-[10px] truncate" style={{ color: T.inkSoft }}>
                <span>{disciplina}</span>
                {currentPageHighlights.length > 0 && (
                  <span className="text-amber-400 font-semibold ml-1.5">
                    • {currentPageHighlights.length} grifo(s)
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Paginação rápida no Header Mobile */}
          {numPages > 0 && (
            <div className="flex items-center gap-1 shrink-0 p-0.5 rounded-xl border bg-black/10" style={{ borderColor: T.border }}>
              <button
                type="button"
                disabled={pageNum <= 1}
                onClick={() => handlePageChange(Math.max(1, pageNum - 1))}
                className="w-8 h-8 rounded-lg flex items-center justify-center disabled:opacity-30 active:scale-95 transition-all text-slate-300"
                title="Página anterior"
              >
                <ChevronLeft size={16} />
              </button>
              <span className="text-[11px] font-mono font-bold px-1 min-w-[3.5ch] text-center" style={{ color: T.ink }}>
                {pageNum}/{numPages}
              </span>
              <button
                type="button"
                disabled={pageNum >= numPages}
                onClick={() => handlePageChange(Math.min(numPages, pageNum + 1))}
                className="w-8 h-8 rounded-lg flex items-center justify-center disabled:opacity-30 active:scale-95 transition-all text-slate-300"
                title="Próxima página"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          )}

          {/* Botão Fechar no Mobile */}
          <button
            type="button"
            onClick={() => { sfx.click(); onClose(); }}
            className="w-9 h-9 rounded-xl border flex items-center justify-center text-slate-300 active:scale-95 shrink-0"
            style={{ backgroundColor: T.surface, borderColor: T.border }}
            title="Fechar leitor"
          >
            <X size={18} />
          </button>
        </div>

        {/* Top Header - Desktop (100% preservado e oculto no mobile) */}
        <div className="hidden md:flex px-5 py-3 border-b items-center justify-between gap-3 flex-wrap" style={{ borderColor: T.border, backgroundColor: T.surfaceAlt }}>
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
                {pageNotes.length > 0 && (
                  <>
                    <span>•</span>
                    <span className="text-emerald-400 font-semibold">{pageNotes.length} post-it(s)</span>
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

            {/* Botão de Adicionar Post-it Rápido */}
            <button
              type="button"
              onClick={() => handleAddPageStickyNote()}
              className="px-2.5 py-1.5 rounded-xl border text-xs font-semibold hover:opacity-90 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
              style={{
                backgroundColor: "rgba(234, 179, 8, 0.15)",
                borderColor: "rgba(234, 179, 8, 0.4)",
                color: "#eab308"
              }}
              title="Colar um novo post-it nesta página"
            >
              <Plus size={14} />
              <span className="hidden sm:inline">+ Post-it</span>
            </button>

            {/* Gerador de Resumos e Questões por IA */}
            <button
              type="button"
              onClick={() => handleOpenAiModal(highlights.some(h => h.page === pageNum) ? "page" : "all")}
              className="px-2.5 py-1.5 rounded-xl border text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95"
              style={{
                background: "linear-gradient(135deg, rgba(168, 85, 247, 0.22), rgba(59, 130, 246, 0.22))",
                borderColor: "rgba(168, 85, 247, 0.5)",
                color: "#c084fc",
              }}
              title="Gerar resumos, questões ou flashcards por IA baseados em seus grifos e anotações"
            >
              <Sparkles size={14} className="text-purple-400" />
              <span className="hidden sm:inline">Gerar com IA</span>
              {highlights.length > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-purple-500/30 text-purple-200">
                  {highlights.length}
                </span>
              )}
            </button>

            {/* Botão de Abrir/Fechar Bloco de Notas Lateral */}
            <button
              type="button"
              onClick={() => {
                sfx.click();
                setIsNotesDrawerOpen(!isNotesDrawerOpen);
              }}
              className={`px-2.5 py-1.5 rounded-xl border text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                isNotesDrawerOpen ? "shadow-xs" : "hover:opacity-85"
              }`}
              style={{
                backgroundColor: isNotesDrawerOpen ? T.brand : T.surface,
                borderColor: isNotesDrawerOpen ? T.brand : T.border,
                color: isNotesDrawerOpen ? T.brandInk : T.ink
              }}
              title={isNotesDrawerOpen ? "Recolher bloco de notas" : "Abrir bloco de notas e post-its"}
            >
              <StickyNote size={14} />
              <span className="hidden sm:inline">Bloco de Notas</span>
              {pageNotes.length > 0 && (
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                    isNotesDrawerOpen ? "bg-black/20 text-white" : "bg-amber-400 text-black"
                  }`}
                >
                  {pageNotes.length}
                </span>
              )}
            </button>

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

        {/* Área Central: Visualizador Canvas + Bloco de Notas Lateral */}
        <div className="flex-1 w-full flex overflow-hidden relative" style={{ backgroundColor: "#0b1120" }}>
          {/* Indicador Flutuante de Zoom em Tempo Real durante gesto de Pinça (Pinch-to-Zoom) */}
          {isPinching && (
            <div className="absolute top-5 left-1/2 -translate-x-1/2 z-50 pointer-events-none transition-all animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center gap-2.5 px-4 py-2 rounded-full bg-slate-900/95 backdrop-blur-md border border-cyan-500/50 text-cyan-300 font-bold text-xs shadow-2xl tracking-wide select-none">
                <ZoomIn size={16} className="text-cyan-400 animate-pulse" />
                <span>Zoom: {Math.round(pinchDisplayScale * 100)}%</span>
              </div>
            </div>
          )}

          {/* Visualizador Canvas com Overlay de Grifos */}
          <div
            ref={containerRef}
            onClick={() => setActiveHighlightId(null)}
            className="flex-1 h-full overflow-auto custom-scrollbar relative"
          >
            {loading ? (
              <div className="flex flex-col items-center justify-center h-full py-20 gap-3 text-slate-400">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                <span className="text-xs font-medium">Renderizando páginas do PDF...</span>
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center h-full py-20 gap-3 text-rose-400 text-center max-w-sm mx-auto">
                <span className="text-sm font-semibold">{error}</span>
                <div className="flex items-center gap-2 mt-2 justify-center">
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
              <div className="w-fit min-w-full min-h-full flex flex-col items-center justify-center p-4 sm:p-8">
                <div
                  ref={pageWrapperRef}
                  className="relative shadow-2xl rounded-lg border border-slate-700/60 bg-white shrink-0 my-auto"
                  style={{
                    width: pageSize ? `${pageSize.width}px` : "auto",
                    height: pageSize ? `${pageSize.height}px` : "auto",
                    transform: isPinching ? `scale(${pinchScaleFactor})` : "none",
                    transformOrigin: `${pinchOrigin.x}px ${pinchOrigin.y}px`,
                    willChange: isPinching ? "transform" : "auto",
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

                {/* Grifos e Post-its Renderizados Sobre a Página */}
                {currentPageHighlights.map((h, idx) => {
                  const isSelected = activeHighlightId === h.id;
                  const theme = POST_IT_THEMES[h.stickyColor] || POST_IT_THEMES.yellow;
                  const hasNote = Boolean(h.note && h.note.trim());

                  if (h.isStickyNote) {
                    const isDraggingThis = dragState?.id === h.id;
                    const isResizingThis = resizeState?.id === h.id;
                    const curX = isDraggingThis ? dragState.currentX : h.x;
                    const curY = isDraggingThis ? dragState.currentY : h.y;
                    const curW = isResizingThis ? resizeState.currentW : (h.width || 180);
                    const curH = isResizingThis ? resizeState.currentH : (h.height || 120);
                    const rotation = h.rotation || 0;
                    const isPinned = Boolean(h.isPinned);

                    return (
                      <div
                        key={h.id}
                        onPointerDown={(e) => handleStartDragSticky(e, h)}
                        onClick={(e) => {
                          e.stopPropagation();
                          sfx.pop();
                          setActiveHighlightId(h.id);
                          if (typeof window !== "undefined" && window.innerWidth < 768) {
                            setMobileEditingSticky(h);
                          }
                        }}
                        className={`absolute rounded-2xl border p-2.5 flex flex-col group select-none transition-shadow ${
                          isSelected
                            ? "ring-2 ring-amber-400 ring-offset-2 ring-offset-slate-900 z-30"
                            : "z-20 hover:shadow-xl"
                        } ${isDraggingThis ? "z-50 opacity-95 scale-[1.03]" : ""} ${
                          !isPinned ? "cursor-grab active:cursor-grabbing" : ""
                        }`}
                        style={{
                          left: `${curX * scale}px`,
                          top: `${curY * scale}px`,
                          width: `${Math.max(120, curW * scale)}px`,
                          height: `${Math.max(70, curH * scale)}px`,
                          backgroundColor: theme.bg,
                          borderColor: theme.border,
                          color: theme.text,
                          transform: `rotate(${rotation}deg)`,
                          transformOrigin: "center center",
                          boxShadow: isDraggingThis
                            ? "0 22px 35px -5px rgba(0, 0, 0, 0.45), 0 10px 10px -5px rgba(0, 0, 0, 0.2)"
                            : isSelected
                            ? "0 10px 25px -5px rgba(0, 0, 0, 0.35)"
                            : "0 4px 14px rgba(0,0,0,0.18)",
                          touchAction: "none"
                        }}
                      >
                        {/* Alfinete / Pin visual no topo central quando fixado */}
                        {isPinned && (
                          <div
                            className="absolute -top-2.5 left-1/2 -translate-x-1/2 z-40 drop-shadow-md select-none pointer-events-none"
                            title="Post-it fixado no local"
                          >
                            <Pin size={16} className="text-red-500 fill-red-500 drop-shadow" />
                          </div>
                        )}

                        {/* Barra Superior / Header: Alça de Arraste e Ferramentas */}
                        <div
                          onPointerDown={(e) => handleStartDragSticky(e, h)}
                          className={`flex items-center justify-between pb-1 mb-1 border-b border-black/10 text-[10px] font-bold ${
                            isPinned ? "cursor-default" : "cursor-grab active:cursor-grabbing hover:bg-black/5"
                          } rounded px-1 -mx-0.5 transition-colors`}
                          title={
                            isPinned
                              ? "Post-it fixado no local (clique no alfinete para desafixar e mover)"
                              : "Arraste aqui para mover o post-it pelo documento"
                          }
                        >
                          <div className="flex items-center gap-1 select-none">
                            {!isPinned && <Move size={11} className="opacity-60" />}
                            <span>Post-it #{idx + 1}</span>
                            {rotation !== 0 && (
                              <span className="font-mono text-[9px] opacity-60">({rotation}°)</span>
                            )}
                          </div>

                          <div className="flex items-center gap-0.5 opacity-85 group-hover:opacity-100" onClick={(e) => e.stopPropagation()}>
                            {/* Botão de Estudo Rápido com IA */}
                            <button
                              type="button"
                              onClick={() => handleOpenAiModal("single", h.id)}
                              className="p-1 rounded hover:bg-black/10 text-purple-700 transition-colors cursor-pointer"
                              title="Gerar resumo ou quiz a partir deste post-it com IA"
                            >
                              <Sparkles size={11} className="text-purple-700" />
                            </button>

                            {/* Botão de Fixar / Desafixar */}
                            <button
                              type="button"
                              onClick={() => handleTogglePin(h)}
                              className={`p-1 rounded transition-colors cursor-pointer ${
                                isPinned ? "bg-amber-400 text-amber-950 font-bold shadow-xs" : "hover:bg-black/10 text-black/70"
                              }`}
                              title={isPinned ? "Desafixar post-it (permitir mover)" : "Fixar post-it no local (evitar mover)"}
                            >
                              <Pin size={11} className={isPinned ? "fill-current" : ""} />
                            </button>

                            {/* Botão de Girar / Inclinar */}
                            <button
                              type="button"
                              onClick={() => handleCycleRotation(h)}
                              className="p-1 rounded hover:bg-black/10 text-black/70 transition-colors cursor-pointer"
                              title={`Girar / Inclinar post-it (atual: ${rotation}°)`}
                            >
                              <RotateCw size={11} />
                            </button>

                            {/* Botão de Alternar Retrato / Paisagem */}
                            <button
                              type="button"
                              onClick={() => handleToggleOrientation(h)}
                              className="p-1 rounded hover:bg-black/10 text-black/70 transition-colors cursor-pointer"
                              title="Alternar orientação (Retrato ↔ Paisagem)"
                            >
                              <Columns size={11} className={curW < curH ? "rotate-90" : ""} />
                            </button>

                            {/* Botão de Excluir */}
                            <button
                              type="button"
                              onClick={() => removeHighlight(h.id)}
                              className="p-1 rounded hover:bg-black/10 text-rose-700 transition-colors cursor-pointer"
                              title="Excluir post-it"
                            >
                              <Trash2 size={11} />
                            </button>
                          </div>
                        </div>

                        {/* Textarea para anotação */}
                        <textarea
                          value={h.note || ""}
                          onClick={(e) => e.stopPropagation()}
                          onPointerDown={(e) => e.stopPropagation()}
                          onChange={(e) => updateHighlightNote(h.id, e.target.value)}
                          placeholder="Escreva seu post-it..."
                          className="w-full flex-1 bg-transparent border-0 resize-none outline-none text-xs leading-relaxed font-sans placeholder-black/40 custom-scrollbar select-text"
                          style={{ color: theme.text }}
                        />

                        {/* Alça de Redimensionamento no Canto Inferior Direito */}
                        <div
                          onPointerDown={(e) => handleStartResizeSticky(e, h)}
                          className="resize-handle absolute bottom-0 right-0 w-7 h-7 flex items-end justify-end p-1.5 cursor-se-resize select-none z-30 group/resize hover:scale-125 active:scale-95 transition-transform"
                          title="Arraste aqui para redimensionar o post-it"
                        >
                          <svg width="12" height="12" viewBox="0 0 12 12" className="text-black/40 group-hover/resize:text-black/90 transition-colors drop-shadow-xs">
                            <path d="M11 1L1 11M11 5L5 11M11 9L9 11" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                          </svg>
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div
                      key={h.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        sfx.pop();
                        setActiveHighlightId(h.id);
                        setIsNotesDrawerOpen(true);
                      }}
                      className={`absolute cursor-pointer transition-all group ${
                        isSelected ? "ring-2 ring-amber-400 ring-offset-1 z-20" : "hover:opacity-90 z-10"
                      }`}
                      style={{
                        left: `${h.x * scale}px`,
                        top: `${h.y * scale}px`,
                        width: `${h.width * scale}px`,
                        height: `${h.height * scale}px`,
                        backgroundColor: h.color,
                        borderBottom: `2px solid ${h.border}`,
                        mixBlendMode: "multiply"
                      }}
                      title={hasNote ? `Anotação: "${h.note}"` : "Clique para abrir anotação deste grifo"}
                    >
                      {/* Mini Pin de Post-it no cantinho do Grifo */}
                      <div
                        className="absolute -top-3.5 -right-3 z-30 transition-transform group-hover:scale-115 flex items-center gap-1"
                        onClick={(e) => {
                          e.stopPropagation();
                          sfx.pop();
                          setActiveHighlightId(h.id);
                          setIsNotesDrawerOpen(true);
                        }}
                      >
                        <span
                          className={`px-1.5 py-0.5 rounded-md text-[10px] font-bold flex items-center gap-0.5 shadow-md border cursor-pointer ${
                            hasNote ? "bg-amber-300 text-amber-950 border-amber-400" : "bg-slate-800 text-slate-300 border-slate-600 opacity-60 group-hover:opacity-100"
                          }`}
                          title={hasNote ? h.note : "Adicionar anotação a este grifo"}
                        >
                          {hasNote ? <MessageSquare size={10} className="shrink-0" /> : <Plus size={10} className="shrink-0" />}
                          {hasNote && <span className="max-w-[80px] truncate hidden sm:inline text-[9px]">{h.note}</span>}
                        </span>
                      </div>
                    </div>
                  );
                })}

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
              </div>
            )}
          </div>

          {/* Bloco de Notas / Post-its Lateral Retrátil no Desktop, Bottom Sheet no Mobile */}
          {isNotesDrawerOpen && (
            <>
              {/* Backdrop para fechar no toque fora no mobile */}
              <div
                className="md:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-xs"
                onClick={() => setIsNotesDrawerOpen(false)}
              />
              <aside
                className="fixed inset-x-0 bottom-0 md:static md:inset-auto max-h-[85vh] md:max-h-none w-full md:w-80 lg:w-96 rounded-t-3xl md:rounded-none border-t md:border-t-0 md:border-l flex flex-col shadow-2xl z-50 md:z-30 transition-all duration-200 shrink-0"
                style={{ backgroundColor: T.surface, borderColor: T.border }}
                onClick={(e) => e.stopPropagation()}
              >
                {/* Alça de arraste visual para mobile */}
                <div className="md:hidden w-12 h-1.5 rounded-full bg-slate-600/50 mx-auto mt-2.5 mb-1" />
              {/* Header do Drawer */}
              <div className="px-4 py-3 border-b flex items-center justify-between" style={{ borderColor: T.border, backgroundColor: T.surfaceAlt }}>
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-amber-500/15 text-amber-500 border border-amber-500/30">
                    <StickyNote size={16} />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold" style={{ color: T.ink }}>Bloco de Post-its</h4>
                    <p className="text-[10px]" style={{ color: T.inkSoft }}>
                      {drawerScope === "page" ? `Pág. ${pageNum} (${pageNotes.length} nota(s))` : `Documento todo (${allNotes.length} nota(s))`}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleAddPageStickyNote()}
                    className="px-2 py-1 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer active:scale-95 transition-all shadow-xs"
                    style={{ backgroundColor: T.brand, color: T.brandInk }}
                    title="Colar novo post-it nesta página"
                  >
                    <Plus size={13} />
                    <span>Post-it</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsNotesDrawerOpen(false)}
                    className="p-1 rounded-lg text-slate-400 hover:text-white cursor-pointer"
                    title="Recolher bloco de notas"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>

              {/* Filtro: Página Atual vs Documento Inteiro */}
              <div className="px-3 py-2 border-b flex items-center gap-2 text-xs" style={{ borderColor: T.border, backgroundColor: T.surface }}>
                <button
                  type="button"
                  onClick={() => setDrawerScope("page")}
                  className={`flex-1 py-1 px-2 rounded-lg font-semibold text-[11px] transition-all cursor-pointer ${
                    drawerScope === "page" ? "bg-amber-500/20 text-amber-400 border border-amber-500/40" : "text-slate-400 hover:text-white"
                  }`}
                >
                  Nesta Página ({pageNotes.length})
                </button>
                <button
                  type="button"
                  onClick={() => setDrawerScope("all")}
                  className={`flex-1 py-1 px-2 rounded-lg font-semibold text-[11px] transition-all cursor-pointer ${
                    drawerScope === "all" ? "bg-amber-500/20 text-amber-400 border border-amber-500/40" : "text-slate-400 hover:text-white"
                  }`}
                >
                  No Arquivo ({allNotes.length})
                </button>
              </div>

              {/* Botão de Geração com IA no Drawer */}
              <div className="px-3 py-2 border-b" style={{ borderColor: T.border, backgroundColor: T.surfaceAlt }}>
                <button
                  type="button"
                  onClick={() => handleOpenAiModal(drawerScope === "page" ? "page" : "all")}
                  className="w-full py-1.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs active:scale-98 border"
                  style={{
                    background: "linear-gradient(135deg, rgba(168, 85, 247, 0.25), rgba(99, 102, 241, 0.25))",
                    borderColor: "rgba(168, 85, 247, 0.5)",
                    color: "#d8b4fe",
                  }}
                  title="Gerar resumo ou questões com IA a partir dos grifos e post-its"
                >
                  <Sparkles size={13} className="text-purple-400" />
                  <span>Gerar Resumo ou Questões com IA</span>
                </button>
              </div>

              {/* Lista de Notas / Post-its */}
              <div className="flex-1 overflow-y-auto p-3 space-y-3 custom-scrollbar">
                {displayedNotes.length === 0 ? (
                  <div className="flex-1 flex flex-col items-center justify-center p-6 text-center text-slate-400 gap-3">
                    <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
                      <StickyNote size={28} />
                    </div>
                    <div>
                      <h5 className="text-sm font-bold text-white mb-1">
                        {drawerScope === "page" ? "Nenhum post-it nesta página" : "Nenhum post-it no documento"}
                      </h5>
                      <p className="text-xs text-slate-400 max-w-xs leading-relaxed">
                        Grife um trecho no documento para vincular uma anotação ou cole um post-it solto.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleAddPageStickyNote()}
                      className="mt-2 px-3.5 py-2 rounded-xl text-xs font-bold bg-amber-400 hover:bg-amber-300 text-black shadow-md flex items-center gap-1.5 cursor-pointer active:scale-95 transition-all"
                    >
                      <Plus size={14} />
                      <span>+ Colar Novo Post-it</span>
                    </button>
                  </div>
                ) : (
                  displayedNotes.map((h, i) => {
                    const isSelected = activeHighlightId === h.id;
                    const theme = POST_IT_THEMES[h.stickyColor] || (h.border === "#22c55e" ? POST_IT_THEMES.green : h.border === "#a855f7" ? POST_IT_THEMES.purple : h.border === "#ec4899" ? POST_IT_THEMES.pink : POST_IT_THEMES.yellow);

                    return (
                      <div
                        key={h.id}
                        onClick={() => {
                          setActiveHighlightId(h.id);
                          if (h.page !== pageNum) handlePageChange(h.page);
                          if (typeof window !== "undefined" && window.innerWidth < 768 && h.isStickyNote) {
                            setMobileEditingSticky(h);
                          }
                        }}
                        className={`rounded-2xl p-3 border transition-all cursor-pointer relative shadow-sm ${
                          isSelected ? "ring-2 ring-amber-400 shadow-md scale-[1.01]" : "hover:border-slate-500"
                        }`}
                        style={{
                          backgroundColor: theme.bg,
                          borderColor: isSelected ? "#eab308" : theme.border,
                          color: theme.text
                        }}
                      >
                        {/* Card Header */}
                        <div className="flex items-center justify-between pb-2 mb-2 border-b border-black/10">
                          <div className="flex items-center gap-1.5">
                            {h.isStickyNote ? <Pin size={13} className="text-amber-600 shrink-0" /> : <Highlighter size={13} className="text-yellow-600 shrink-0" />}
                            <span className="text-xs font-bold">
                              {h.isStickyNote ? `Post-it #${i + 1}` : `Grifo Pág. ${h.page}`}
                            </span>
                            {h.page !== pageNum && (
                              <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-black/10 font-mono font-bold">
                                Ir p/ Pág. {h.page}
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-1">
                            {/* Seletor de Cor do Post-it */}
                            <div className="flex items-center gap-0.5 bg-black/5 p-0.5 rounded-lg">
                              {Object.keys(POST_IT_THEMES).map(cKey => (
                                <button
                                  key={cKey}
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    updateHighlightNote(h.id, h.note || "", { stickyColor: cKey });
                                  }}
                                  className={`w-3.5 h-3.5 rounded-full transition-transform ${
                                    (h.stickyColor || "yellow") === cKey ? "scale-125 ring-1 ring-black" : "opacity-70 hover:opacity-100"
                                  }`}
                                  style={{ backgroundColor: POST_IT_THEMES[cKey].accent }}
                                  title={`Mudar para ${POST_IT_THEMES[cKey].name}`}
                                />
                              ))}
                            </div>

                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                removeHighlight(h.id);
                              }}
                              className="p-1 rounded-md hover:bg-black/10 text-rose-700 transition-colors cursor-pointer"
                              title="Excluir este grifo / post-it"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </div>

                        {/* Controles de Fixação, Orientação e Tamanho do Post-it no Drawer */}
                        {h.isStickyNote && (
                          <div
                            className="flex items-center justify-between gap-1 py-1 px-1.5 rounded-lg bg-black/5 text-[10px] mb-2 flex-wrap"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <div className="flex items-center gap-1">
                              {/* Fixar / Desafixar */}
                              <button
                                type="button"
                                onClick={() => handleTogglePin(h)}
                                className={`px-1.5 py-0.5 rounded font-bold flex items-center gap-1 cursor-pointer transition-colors ${
                                  h.isPinned ? "bg-amber-400 text-amber-950 shadow-xs" : "bg-black/10 hover:bg-black/15 text-black/80"
                                }`}
                                title={h.isPinned ? "Fixado (clique para liberar movimento)" : "Clique para fixar no local"}
                              >
                                <Pin size={10} className={h.isPinned ? "fill-current" : ""} />
                                <span>{h.isPinned ? "Fixado" : "Livre"}</span>
                              </button>

                              {/* Girar */}
                              <button
                                type="button"
                                onClick={() => handleCycleRotation(h)}
                                className="px-1.5 py-0.5 rounded font-bold bg-black/10 hover:bg-black/15 text-black/80 flex items-center gap-1 cursor-pointer transition-colors"
                                title="Girar / Inclinar post-it (0°, 3°, -3°, 90°)"
                              >
                                <RotateCw size={10} />
                                <span>{h.rotation ? `${h.rotation}°` : "0°"}</span>
                              </button>

                              {/* Orientação Retrato / Paisagem */}
                              <button
                                type="button"
                                onClick={() => handleToggleOrientation(h)}
                                className="px-1.5 py-0.5 rounded font-bold bg-black/10 hover:bg-black/15 text-black/80 flex items-center gap-1 cursor-pointer transition-colors"
                                title="Alternar entre Retrato e Paisagem"
                              >
                                <Columns size={10} className={(h.width || 180) < (h.height || 120) ? "rotate-90" : ""} />
                                <span>{(h.width || 180) < (h.height || 120) ? "Retrato" : "Paisagem"}</span>
                              </button>
                            </div>

                            {/* Presets de Tamanho */}
                            <div className="flex items-center gap-0.5">
                              <span className="opacity-60 text-[9px]">Tam:</span>
                              {["p", "m", "g"].map((sKey) => (
                                <button
                                  key={sKey}
                                  type="button"
                                  onClick={() => handleSetStickyPresetSize(h, sKey)}
                                  className="w-4 h-4 rounded text-[9px] font-bold flex items-center justify-center bg-black/10 hover:bg-black/20 text-black/80 cursor-pointer uppercase transition-colors"
                                  title={`Tamanho ${sKey.toUpperCase()}`}
                                >
                                  {sKey}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Textarea para Anotação do Post-it */}
                        <textarea
                          value={h.note || ""}
                          onClick={(e) => e.stopPropagation()}
                          onChange={(e) => updateHighlightNote(h.id, e.target.value)}
                          placeholder={h.isStickyNote ? "Escreva sua anotação aqui..." : "Adicionar anotação vinculada a este grifo..."}
                          rows={3}
                          className="w-full bg-transparent border-0 resize-none outline-none text-xs leading-relaxed font-sans placeholder-black/45 custom-scrollbar"
                          style={{ color: theme.text }}
                        />

                        {/* Card Footer: Salvar nas Notas do Aluno e Gerar IA */}
                        <div className="flex items-center justify-between pt-2 mt-1 border-t border-black/10 text-[10px] gap-1 flex-wrap">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenAiModal("single", h.id);
                            }}
                            className="px-2 py-0.5 rounded-md font-bold text-[10px] bg-purple-500/20 hover:bg-purple-500/30 text-purple-900 border border-purple-400/40 transition-all flex items-center gap-1 cursor-pointer active:scale-95"
                            title="Gerar resumo ou questões com IA a partir apenas deste grifo/post-it"
                          >
                            <Sparkles size={10} className="text-purple-700" />
                            <span>IA Desta Nota</span>
                          </button>

                          {onSaveNote && (h.note && h.note.trim()) && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleExportPostItToNotes(h);
                              }}
                              className="px-2 py-0.5 rounded-md font-bold text-[10px] bg-black/10 hover:bg-black/20 transition-all flex items-center gap-1 cursor-pointer"
                              title="Exportar esta anotação para o caderno de notas da matéria"
                            >
                              <Bookmark size={10} />
                              <span>Salvar no Caderno</span>
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </aside>
            </>
          )}

          {/* Dock de Ações Flutuante Mobile (Zona do Polegar) */}
          <div className="md:hidden absolute bottom-3 inset-x-3 z-30 flex items-center justify-between p-1.5 rounded-2xl border shadow-2xl backdrop-blur-xl animate-in slide-in-from-bottom-2 duration-200" style={{ backgroundColor: `${T.surface}EE`, borderColor: T.border }}>
            {/* Alternar Modo: Navegar vs Grifar */}
            <button
              type="button"
              onClick={() => {
                sfx.pop();
                setIsHighlighterActive(!isHighlighterActive);
              }}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all active:scale-95 shadow-xs ${
                isHighlighterActive
                  ? "bg-amber-400 text-black shadow-amber-500/20"
                  : "bg-white/10 text-slate-200 hover:bg-white/15"
              }`}
            >
              {isHighlighterActive ? <Highlighter size={14} /> : <Hand size={14} />}
              <span>{isHighlighterActive ? "Grifar" : "Navegar"}</span>
            </button>

            {/* Seletor rápido de cores quando grifando */}
            {isHighlighterActive && (
              <div className="flex items-center gap-1 px-1">
                {HIGHLIGHT_COLORS.map(c => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => { sfx.pop(); setSelectedColor(c); }}
                    className={`w-6 h-6 rounded-full border transition-all ${
                      selectedColor.id === c.id ? "scale-115 ring-2 ring-blue-400 ring-offset-1" : "opacity-70"
                    }`}
                    style={{ backgroundColor: c.border, borderColor: T.border }}
                    title={c.name}
                  />
                ))}
              </div>
            )}

            {/* Botão + Post-it */}
            <button
              type="button"
              onClick={() => handleAddPageStickyNote()}
              className="flex items-center gap-1 px-2.5 py-2 rounded-xl text-xs font-bold border active:scale-95 transition-all text-amber-300 bg-amber-500/20 border-amber-500/40"
              title="Colar Post-it nesta página"
            >
              <Plus size={14} />
              <span>Post-it</span>
            </button>

            {/* Botão Bloco de Notas / Post-its Drawer */}
            <button
              type="button"
              onClick={() => {
                sfx.click();
                setIsNotesDrawerOpen(!isNotesDrawerOpen);
              }}
              className={`relative p-2 rounded-xl border text-xs font-semibold active:scale-95 transition-all ${
                isNotesDrawerOpen ? "bg-amber-400 text-black" : "bg-white/10 text-slate-200"
              }`}
              style={{ borderColor: T.border }}
              title="Abrir bloco de notas"
            >
              <StickyNote size={16} />
              {pageNotes.length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-amber-400 text-black font-bold text-[9px] flex items-center justify-center">
                  {pageNotes.length}
                </span>
              )}
            </button>

            {/* Botão IA */}
            <button
              type="button"
              onClick={() => handleOpenAiModal("all")}
              className="p-2 rounded-xl border text-purple-300 bg-purple-500/20 border-purple-500/40 active:scale-95 transition-all"
              title="Estudar com IA a partir dos grifos e post-its"
            >
              <Sparkles size={16} />
            </button>

            {/* Ajustar à tela */}
            <button
              type="button"
              onClick={handleFitPage}
              className="p-2 rounded-xl border text-slate-300 bg-white/10 hover:bg-white/15 active:scale-95 transition-all"
              style={{ borderColor: T.border }}
              title="Ajustar slide à tela"
            >
              <Maximize2 size={16} />
            </button>
          </div>
        </div>

        {/* Rodapé: Paginação (Desktop) */}
        {numPages > 0 && (
          <div className="hidden md:flex px-5 py-2.5 border-t items-center justify-between text-xs flex-wrap gap-2" style={{ borderColor: T.border, backgroundColor: T.surfaceAlt }}>
            <div className="flex items-center gap-2 flex-wrap">
              <div className="text-[11px] text-slate-400 hidden sm:block">
                Arraste para grifar. Setas ← → para navegar.
              </div>
              {highlightedPages.length > 0 && (
                <div className="flex items-center gap-1.5 sm:pl-2 sm:border-l" style={{ borderColor: T.border }}>
                  <span className="text-[11px] text-amber-400 font-semibold flex items-center gap-1 shrink-0">
                    <Bookmark size={12} /> Págs Marcadas:
                  </span>
                  <div className="flex items-center gap-1 flex-wrap">
                    {highlightedPages.map(p => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => handlePageChange(p)}
                        className={`px-1.5 py-0.5 rounded text-[11px] font-mono font-bold transition-all cursor-pointer ${
                          pageNum === p
                            ? "bg-amber-400 text-black shadow-xs ring-1 ring-amber-300"
                            : "border hover:opacity-80"
                        }`}
                        style={pageNum !== p ? { backgroundColor: T.surface, borderColor: T.border, color: T.ink } : {}}
                        title={`Ir direto para a página ${p}`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>
              )}
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

        {/* Modal Bottom Sheet Mobile para Edição Confortável de Post-it */}
        {mobileEditingSticky && (
          <div
            className="fixed inset-0 z-[100000] flex items-end justify-center bg-black/60 backdrop-blur-xs animate-in fade-in"
            onClick={() => setMobileEditingSticky(null)}
          >
            <div
              className="w-full max-h-[85vh] flex flex-col rounded-t-3xl border-t shadow-2xl p-4 overflow-y-auto animate-in slide-in-from-bottom duration-200"
              style={{ backgroundColor: T.surface, borderColor: T.border }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Alça de Arraste */}
              <div className="w-12 h-1.5 rounded-full bg-slate-600/50 mx-auto mb-3" />

              {/* Cabeçalho */}
              <div className="flex items-center justify-between pb-3 border-b mb-3" style={{ borderColor: T.border }}>
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-amber-400/20 text-amber-400">
                    <StickyNote size={18} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold" style={{ color: T.ink }}>
                      Editar Post-it (Pág. {mobileEditingSticky.page})
                    </h4>
                    <span className="text-[11px]" style={{ color: T.inkSoft }}>
                      Toque para digitar e personalizar com facilidade
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setMobileEditingSticky(null)}
                  className="p-2 rounded-xl text-slate-400 hover:text-white"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Textarea confortável */}
              <textarea
                value={mobileEditingSticky.note || ""}
                onChange={(e) => {
                  const val = e.target.value;
                  setMobileEditingSticky((prev) => prev ? { ...prev, note: val } : null);
                  updateHighlightNote(mobileEditingSticky.id, val);
                }}
                placeholder="Escreva sua anotação ou resumo aqui..."
                rows={4}
                className="w-full p-3.5 rounded-2xl text-base leading-relaxed border outline-none resize-none mb-3"
                style={{
                  backgroundColor: (POST_IT_THEMES[mobileEditingSticky.stickyColor] || POST_IT_THEMES.yellow).bg,
                  borderColor: (POST_IT_THEMES[mobileEditingSticky.stickyColor] || POST_IT_THEMES.yellow).border,
                  color: (POST_IT_THEMES[mobileEditingSticky.stickyColor] || POST_IT_THEMES.yellow).text,
                }}
              />

              {/* Controles de Cores */}
              <div className="mb-3">
                <label className="text-xs font-semibold block mb-1.5" style={{ color: T.inkSoft }}>Cor do Post-it:</label>
                <div className="flex items-center gap-2">
                  {Object.keys(POST_IT_THEMES).map((cKey) => {
                    const isCur = (mobileEditingSticky.stickyColor || "yellow") === cKey;
                    return (
                      <button
                        key={cKey}
                        type="button"
                        onClick={() => {
                          sfx.pop();
                          setMobileEditingSticky(prev => ({ ...prev, stickyColor: cKey }));
                          updateHighlightNote(mobileEditingSticky.id, mobileEditingSticky.note || "", { stickyColor: cKey });
                        }}
                        className={`flex-1 py-2 px-1 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border transition-all ${
                          isCur ? "ring-2 ring-amber-400 ring-offset-2 scale-105" : "opacity-80"
                        }`}
                        style={{
                          backgroundColor: POST_IT_THEMES[cKey].accent,
                          color: "#1e293b",
                          borderColor: isCur ? "#eab308" : "transparent"
                        }}
                      >
                        <span>{POST_IT_THEMES[cKey].name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Controles: Fixação, Giro e Orientação */}
              <div className="grid grid-cols-3 gap-2 mb-4">
                {/* Fixar / Livre */}
                <button
                  type="button"
                  onClick={() => {
                    handleTogglePin(mobileEditingSticky);
                    setMobileEditingSticky(prev => ({ ...prev, isPinned: !prev.isPinned }));
                  }}
                  className={`py-2 px-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border transition-all ${
                    mobileEditingSticky.isPinned ? "bg-amber-400 text-amber-950 border-amber-400" : "hover:bg-white/5"
                  }`}
                  style={!mobileEditingSticky.isPinned ? { backgroundColor: T.surfaceAlt, borderColor: T.border, color: T.ink } : {}}
                >
                  <Pin size={14} className={mobileEditingSticky.isPinned ? "fill-current" : ""} />
                  <span>{mobileEditingSticky.isPinned ? "Fixado" : "Livre"}</span>
                </button>

                {/* Girar */}
                <button
                  type="button"
                  onClick={() => {
                    handleCycleRotation(mobileEditingSticky);
                    const curRot = mobileEditingSticky.rotation || 0;
                    const idx = ROTATION_PRESETS.indexOf(curRot);
                    const nextRot = idx >= 0 && idx < ROTATION_PRESETS.length - 1 ? ROTATION_PRESETS[idx + 1] : ROTATION_PRESETS[0];
                    setMobileEditingSticky(prev => ({ ...prev, rotation: nextRot }));
                  }}
                  className="py-2 px-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border"
                  style={{ backgroundColor: T.surfaceAlt, borderColor: T.border, color: T.ink }}
                >
                  <RotateCw size={14} />
                  <span>{mobileEditingSticky.rotation ? `${mobileEditingSticky.rotation}°` : "0°"}</span>
                </button>

                {/* Retrato / Paisagem */}
                <button
                  type="button"
                  onClick={() => {
                    handleToggleOrientation(mobileEditingSticky);
                    const curW = mobileEditingSticky.width || 170;
                    const curH = mobileEditingSticky.height || 110;
                    const newW = curW >= curH ? Math.min(curH, 160) : Math.max(curH, 220);
                    const newH = curW >= curH ? Math.max(curW, 210) : Math.min(curW, 130);
                    setMobileEditingSticky(prev => ({ ...prev, width: newW, height: newH }));
                  }}
                  className="py-2 px-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border"
                  style={{ backgroundColor: T.surfaceAlt, borderColor: T.border, color: T.ink }}
                >
                  <Columns size={14} className={(mobileEditingSticky.width || 170) < (mobileEditingSticky.height || 110) ? "rotate-90" : ""} />
                  <span>{(mobileEditingSticky.width || 170) < (mobileEditingSticky.height || 110) ? "Retrato" : "Paisagem"}</span>
                </button>
              </div>

              {/* Botões Inferiores */}
              <div className="flex items-center gap-2 pt-2 border-t" style={{ borderColor: T.border }}>
                <button
                  type="button"
                  onClick={() => {
                    removeHighlight(mobileEditingSticky.id);
                    setMobileEditingSticky(null);
                  }}
                  className="p-3 rounded-xl border text-rose-500 hover:bg-rose-500/10 flex items-center justify-center"
                  style={{ borderColor: "rgba(244, 63, 94, 0.3)" }}
                  title="Excluir Post-it"
                >
                  <Trash2 size={16} />
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const hId = mobileEditingSticky.id;
                    setMobileEditingSticky(null);
                    handleOpenAiModal("single", hId);
                  }}
                  className="flex-1 py-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5"
                  style={{
                    background: "linear-gradient(135deg, rgba(168, 85, 247, 0.2), rgba(59, 130, 246, 0.2))",
                    borderColor: "rgba(168, 85, 247, 0.5)",
                    color: "#c084fc",
                  }}
                >
                  <Sparkles size={14} />
                  <span>Estudar com IA</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    sfx.complete();
                    setMobileEditingSticky(null);
                  }}
                  className="flex-1 py-3 rounded-xl text-xs font-bold shadow-md active:scale-95 transition-all text-center"
                  style={{ backgroundColor: T.brand, color: T.brandInk }}
                >
                  Concluir
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal de Geração de Resumos e Questões por IA */}
        {isAiModalOpen && (
          <PdfAiGeneratorModal
            isOpen={isAiModalOpen}
            onClose={() => setIsAiModalOpen(false)}
            pdfDoc={pdfDoc}
            highlights={highlights}
            currentPage={pageNum}
            initialScope={aiModalScope}
            initialHighlightId={aiModalTargetId}
            fileName={actualName}
            disciplina={disciplina}
            onSaveNote={onSaveNote}
          />
        )}
      </div>
    </div>
  );

  if (typeof document !== "undefined") {
    return createPortal(modalContent, document.body);
  }
  return modalContent;
}
