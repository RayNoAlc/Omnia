import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  X, ChevronLeft, ChevronRight, Plus, Download, Sparkles, Image as ImageIcon,
  Type, Heart, Star, Coffee, Sun, Cloud, CloudRain, Wind, Moon,
  Trash2, Move, RotateCw, Palette, Layers, Check, Copy, Share2,
  Calendar, BookOpen, Quote, Smile, Meh, Frown
} from "lucide-react";
import html2canvas from "html2canvas";
import { T, TINT } from "./ui";
import { sfx } from "../lib/soundEffects";
import { fetchKinborPages, saveKinborPage, deleteKinborPage } from "../lib/db";

// Estilos de papel Kinbor
export const PAPER_STYLES = [
  { id: "grid_kinbor", label: "Grid Kinbor (3.7mm)", bg: "#FAF7F2", gridColor: "rgba(180, 160, 140, 0.22)", type: "grid" },
  { id: "dots", label: "Pontilhado (Dot Grid)", bg: "#F8F5EE", gridColor: "rgba(140, 125, 110, 0.28)", type: "dots" },
  { id: "marfim_liso", label: "Marfim Puro", bg: "#FCF9F2", gridColor: "transparent", type: "blank" },
  { id: "dark_grid", label: "Papel Noturno", bg: "#1E1F24", gridColor: "rgba(255, 255, 255, 0.08)", type: "grid", dark: true },
];

// Padrões de Washi Tape (Fitas Adesivas Decorativas)
export const WASHI_PATTERNS = [
  { id: "washi_xadrez_salmao", name: "Xadrez Pêssego", bg: "#fed7aa", pattern: "repeating-linear-gradient(45deg, rgba(251, 146, 60, 0.25) 0px, rgba(251, 146, 60, 0.25) 8px, transparent 8px, transparent 16px)" },
  { id: "washi_menta_grid", name: "Menta Quadriculada", bg: "#dcfce7", pattern: "linear-gradient(rgba(34, 197, 94, 0.25) 1px, transparent 1px), linear-gradient(90deg, rgba(34, 197, 94, 0.25) 1px, transparent 1px)" },
  { id: "washi_lavanda_floral", name: "Lavanda Suave", bg: "#f3e8ff", pattern: "repeating-linear-gradient(-45deg, rgba(168, 85, 247, 0.2) 0px, rgba(168, 85, 247, 0.2) 6px, transparent 6px, transparent 12px)" },
  { id: "washi_kraft_retro", name: "Papel Kraft", bg: "#d7ba89", pattern: "none" },
  { id: "washi_amarelo_poa", name: "Amarelo Mostarda", bg: "#fef08a", pattern: "radial-gradient(rgba(202, 138, 4, 0.3) 1.5px, transparent 1.5px)" },
  { id: "washi_azul_mar", name: "Azul Brisa", bg: "#e0f2fe", pattern: "repeating-linear-gradient(0deg, rgba(14, 165, 233, 0.2) 0px, rgba(14, 165, 233, 0.2) 4px, transparent 4px, transparent 8px)" },
];

// Stickers e Selos Autorais do Omnia
export const KINBOR_STICKERS = [
  { id: "selo_favorito", label: "Selo Favorito", type: "stamp", color: "#e11d48", text: "★ FAVORITO ★" },
  { id: "selo_cinco_estrelas", label: "5 Estrelas", type: "stamp", color: "#d97706", text: "★★★★★ 5/5" },
  { id: "selo_leitura_feita", label: "Leitura Concluída", type: "stamp", color: "#059669", text: "✔ LIDO & APROVADO" },
  { id: "selo_obra_prima", label: "Obra Prima", type: "stamp", color: "#7c3aed", text: "✦ OBRA-PRIMA ✦" },
  { id: "sticker_cafe", label: "Café", emoji: "☕", size: 48 },
  { id: "sticker_livros", label: "Livros", emoji: "📚", size: 48 },
  { id: "sticker_estrelas", label: "Brilhos", emoji: "✨", size: 48 },
  { id: "sticker_coracao", label: "Coração", emoji: "💖", size: 48 },
  { id: "sticker_vela", label: "Vela", emoji: "🕯️", size: 48 },
  { id: "sticker_gato", label: "Gatinho", emoji: "🐾", size: 48 },
  { id: "sticker_lua", label: "Fase da Lua", emoji: "🌙", size: 48 },
  { id: "sticker_flor", label: "Flor Seca", emoji: "🥀", size: 48 },
  { id: "sticker_musica", label: "Música", emoji: "🎧", size: 48 },
  { id: "sticker_pipoca", label: "Pipoca", emoji: "🍿", size: 48 },
];

export function KinborJournalModal({
  userId,
  isOpen,
  onClose,
  initialMedia = null,
  allMedia = [],
}) {
  const [pages, setPages] = useState([]);
  const [activePageIndex, setActivePageIndex] = useState(0);
  const [selectedElementId, setSelectedElementId] = useState(null);
  const [activeToolDrawer, setActiveToolDrawer] = useState(null); // 'washi' | 'stickers' | 'polaroid' | 'text' | 'paper'
  const [dragState, setDragState] = useState(null);
  const [isExporting, setIsExporting] = useState(false);

  const notebookRef = useRef(null);

  // Carrega páginas do usuário
  useEffect(() => {
    if (!isOpen) return;
    (async () => {
      const loaded = await fetchKinborPages(userId);
      if (loaded && loaded.length > 0) {
        setPages(loaded);
        setActivePageIndex(0);
      } else {
        // Cria primeira página padrão
        const firstPage = createEmptyPage(initialMedia);
        setPages([firstPage]);
        setActivePageIndex(0);
        await saveKinborPage(userId, firstPage);
      }
    })();
  }, [isOpen, userId]);

  function createEmptyPage(media = null) {
    const today = new Date().toISOString().split("T")[0];
    const initialElements = [];

    // Se iniciado a partir de uma mídia específica, já cria a polaroid da capa automaticamente!
    if (media) {
      initialElements.push({
        id: `polaroid_${Date.now()}`,
        tipo: "polaroid",
        x: 40,
        y: 80,
        width: 170,
        height: 230,
        rotation: -3,
        zIndex: 10,
        conteudo: {
          imagemUrl: media.capaUrl || "",
          legenda: media.titulo || "Minha Leitura",
          autor: media.autorCriador || "",
        }
      });

      // Adiciona uma fitinha washi tape no topo da foto
      initialElements.push({
        id: `washi_${Date.now() + 1}`,
        tipo: "washi_tape",
        x: 75,
        y: 70,
        width: 100,
        height: 24,
        rotation: -4,
        zIndex: 15,
        conteudo: {
          washiPattern: "washi_xadrez_salmao"
        }
      });

      // Se houver citação favorita, cria um recorte de papel
      if (media.resenha?.citacoesFavoritas?.[0]) {
        initialElements.push({
          id: `memo_${Date.now() + 2}`,
          tipo: "nota_adesiva",
          x: 230,
          y: 90,
          width: 200,
          height: 140,
          rotation: 2,
          zIndex: 12,
          conteudo: {
            texto: `"${media.resenha.citacoesFavoritas[0]}"`,
            autor: media.titulo,
            corFundo: "#fef08a"
          }
        });
      }
    }

    return {
      id: `page_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      dataRegistro: today,
      titulo: media ? media.titulo : "Página do Diário",
      mediaId: media?.id || null,
      estiloPapel: "grid_kinbor",
      clima: "cafe",
      humor: "calmo",
      elementos: initialElements
    };
  }

  const currentPage = pages[activePageIndex] || pages[0] || null;

  // Atualiza a página ativa
  const updateCurrentPage = async (patch) => {
    if (!currentPage) return;
    const updated = { ...currentPage, ...patch };
    const updatedPages = [...pages];
    updatedPages[activePageIndex] = updated;
    setPages(updatedPages);
    await saveKinborPage(userId, updated);
  };

  // Criação de nova página em branco
  const handleCreatePage = async () => {
    sfx.pop();
    const newP = createEmptyPage();
    const updated = [newP, ...pages];
    setPages(updated);
    setActivePageIndex(0);
    await saveKinborPage(userId, newP);
  };

  // Excluir página
  const handleDeletePage = async () => {
    if (pages.length <= 1) {
      alert("Você precisa manter pelo menos uma página no seu caderno.");
      return;
    }
    if (window.confirm("Deseja realmente arrancar e excluir esta página do seu Kinbor?")) {
      sfx.pop();
      const pageId = currentPage.id;
      const filtered = pages.filter(p => p.id !== pageId);
      setPages(filtered);
      setActivePageIndex(Math.max(0, activePageIndex - 1));
      await deleteKinborPage(userId, pageId);
    }
  };

  // Adicionar elementos à página
  const handleAddElement = (newElement) => {
    sfx.pop();
    const currentElements = currentPage?.elementos || [];
    const maxZ = currentElements.reduce((max, el) => Math.max(max, el.zIndex || 1), 10);
    const elementWithZ = {
      ...newElement,
      id: `el_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      zIndex: maxZ + 1,
    };
    updateCurrentPage({
      elementos: [...currentElements, elementWithZ]
    });
    setSelectedElementId(elementWithZ.id);
    setActiveToolDrawer(null);
  };

  // Remover elemento selecionado
  const handleDeleteElement = (elId) => {
    sfx.pop();
    const currentElements = currentPage?.elementos || [];
    updateCurrentPage({
      elementos: currentElements.filter(el => el.id !== elId)
    });
    setSelectedElementId(null);
  };

  // Girar elemento em +15 graus
  const handleRotateElement = (elId) => {
    sfx.pop();
    const currentElements = currentPage?.elementos || [];
    updateCurrentPage({
      elementos: currentElements.map(el => {
        if (el.id === elId) {
          const nextRot = ((el.rotation || 0) + 15) % 360;
          return { ...el, rotation: nextRot };
        }
        return el;
      })
    });
  };

  // Arraste de elemento na página (drag and drop)
  const handleStartDrag = (e, el) => {
    e.stopPropagation();
    setSelectedElementId(el.id);
    const clientX = e.clientX !== undefined ? e.clientX : e.touches?.[0]?.clientX;
    const clientY = e.clientY !== undefined ? e.clientY : e.touches?.[0]?.clientY;
    if (clientX === undefined || clientY === undefined) return;

    setDragState({
      id: el.id,
      startX: clientX,
      startY: clientY,
      origX: el.x,
      origY: el.y,
    });
  };

  useEffect(() => {
    if (!dragState) return;

    const handlePointerMove = (e) => {
      const clientX = e.clientX !== undefined ? e.clientX : e.touches?.[0]?.clientX;
      const clientY = e.clientY !== undefined ? e.clientY : e.touches?.[0]?.clientY;
      if (clientX === undefined || clientY === undefined) return;

      const deltaX = clientX - dragState.startX;
      const deltaY = clientY - dragState.startY;

      const currentElements = currentPage?.elementos || [];
      const updated = currentElements.map(el => {
        if (el.id === dragState.id) {
          return {
            ...el,
            x: Math.max(0, Math.round(dragState.origX + deltaX)),
            y: Math.max(0, Math.round(dragState.origY + deltaY)),
          };
        }
        return el;
      });

      // Atualiza visualmente
      const updatedPages = [...pages];
      updatedPages[activePageIndex] = { ...currentPage, elementos: updated };
      setPages(updatedPages);
    };

    const handlePointerUp = async () => {
      if (dragState) {
        setDragState(null);
        // Persiste a posição final
        await saveKinborPage(userId, pages[activePageIndex]);
      }
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
    window.addEventListener("touchmove", handlePointerMove, { passive: false });
    window.addEventListener("touchend", handlePointerUp);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
      window.removeEventListener("touchmove", handlePointerMove);
      window.removeEventListener("touchend", handlePointerUp);
    };
  }, [dragState, currentPage, pages, activePageIndex, userId]);

  // Exportar página como imagem de alta resolução (PNG)
  const handleExportImage = async () => {
    if (!notebookRef.current) return;
    setIsExporting(true);
    sfx.pop();
    try {
      const canvas = await html2canvas(notebookRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: null,
      });
      const dataUrl = canvas.toDataURL("image/png");
      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = `kinbor_${currentPage?.dataRegistro || "scrapbook"}.png`;
      a.click();
    } catch (err) {
      console.warn("Erro ao exportar página Kinbor:", err);
    } finally {
      setIsExporting(false);
    }
  };

  if (!isOpen || !currentPage) return null;

  const currentPaper = PAPER_STYLES.find(p => p.id === currentPage.estiloPapel) || PAPER_STYLES[0];

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col overflow-hidden"
      style={{ backgroundColor: "#121316", color: "#e2e8f0" }}
    >
      {/* Top Bar / Menu Artesanal do Kinbor */}
      <div className="h-14 sm:h-16 px-3 sm:px-6 border-b flex items-center justify-between shrink-0 bg-slate-900/90 backdrop-blur-xl border-slate-800">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-white/10 text-slate-300 hover:text-white transition-all cursor-pointer"
            title="Voltar para a estante"
          >
            <ChevronLeft size={20} />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs sm:text-sm font-black tracking-wider uppercase text-amber-300">
                Caderno Kinbor
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-400/10 text-amber-300 border border-amber-400/20 font-bold hidden sm:inline">
                Hobonichi Edition
              </span>
            </div>
            <div className="text-[11px] text-slate-400 font-mono">
              Página {activePageIndex + 1} de {pages.length} • {currentPage.dataRegistro}
            </div>
          </div>
        </div>

        {/* Controles de Navegação de Páginas */}
        <div className="flex items-center gap-1 sm:gap-2">
          <button
            type="button"
            disabled={activePageIndex >= pages.length - 1}
            onClick={() => { sfx.pop(); setActivePageIndex(i => i + 1); setSelectedElementId(null); }}
            className="p-1.5 rounded-xl border border-slate-700 bg-slate-800 text-slate-300 hover:text-white disabled:opacity-40 cursor-pointer"
            title="Página anterior"
          >
            <ChevronLeft size={16} />
          </button>

          <button
            type="button"
            disabled={activePageIndex <= 0}
            onClick={() => { sfx.pop(); setActivePageIndex(i => i - 1); setSelectedElementId(null); }}
            className="p-1.5 rounded-xl border border-slate-700 bg-slate-800 text-slate-300 hover:text-white disabled:opacity-40 cursor-pointer"
            title="Próxima página"
          >
            <ChevronRight size={16} />
          </button>

          <button
            type="button"
            onClick={handleCreatePage}
            className="px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30 transition-all flex items-center gap-1 cursor-pointer"
            title="Adicionar nova folha em branco"
          >
            <Plus size={14} />
            <span className="hidden sm:inline">Nova Folha</span>
          </button>

          <button
            type="button"
            onClick={handleExportImage}
            disabled={isExporting}
            className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            title="Salvar / Exportar página como imagem"
          >
            <Download size={17} />
          </button>

          <button
            type="button"
            onClick={handleDeletePage}
            className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
            title="Arrancar página"
          >
            <Trash2 size={17} />
          </button>
        </div>
      </div>

      {/* Toolbar Flutuante Inferior / Ações de Colagem */}
      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-40 max-w-[94vw] bg-slate-900/95 backdrop-blur-2xl border border-slate-700/80 rounded-2xl p-1.5 shadow-2xl flex items-center gap-1 sm:gap-1.5 overflow-x-auto">
        <button
          type="button"
          onClick={() => { sfx.pop(); setActiveToolDrawer(activeToolDrawer === "polaroid" ? null : "polaroid"); }}
          className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
            activeToolDrawer === "polaroid" ? "bg-amber-400 text-slate-900 shadow-md" : "text-slate-200 hover:bg-white/10"
          }`}
        >
          <ImageIcon size={15} />
          <span>Foto / Polaroid</span>
        </button>

        <button
          type="button"
          onClick={() => { sfx.pop(); setActiveToolDrawer(activeToolDrawer === "washi" ? null : "washi"); }}
          className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
            activeToolDrawer === "washi" ? "bg-amber-400 text-slate-900 shadow-md" : "text-slate-200 hover:bg-white/10"
          }`}
        >
          <div className="w-3.5 h-2.5 rounded-xs border border-current bg-current/30" />
          <span>Washi Tape</span>
        </button>

        <button
          type="button"
          onClick={() => { sfx.pop(); setActiveToolDrawer(activeToolDrawer === "stickers" ? null : "stickers"); }}
          className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
            activeToolDrawer === "stickers" ? "bg-amber-400 text-slate-900 shadow-md" : "text-slate-200 hover:bg-white/10"
          }`}
        >
          <Sparkles size={15} />
          <span>Stickers & Selos</span>
        </button>

        <button
          type="button"
          onClick={() => { sfx.pop(); setActiveToolDrawer(activeToolDrawer === "memo" ? null : "memo"); }}
          className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
            activeToolDrawer === "memo" ? "bg-amber-400 text-slate-900 shadow-md" : "text-slate-200 hover:bg-white/10"
          }`}
        >
          <Quote size={15} />
          <span>Recorte de Citação</span>
        </button>

        <button
          type="button"
          onClick={() => { sfx.pop(); setActiveToolDrawer(activeToolDrawer === "paper" ? null : "paper"); }}
          className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
            activeToolDrawer === "paper" ? "bg-amber-400 text-slate-900 shadow-md" : "text-slate-200 hover:bg-white/10"
          }`}
        >
          <Palette size={15} />
          <span>Papel</span>
        </button>
      </div>

      {/* Gavetas de Ferramentas / Drawers */}
      {activeToolDrawer && (
        <div
          className="absolute bottom-20 left-1/2 -translate-x-1/2 z-40 w-[92vw] max-w-lg bg-slate-900/98 backdrop-blur-2xl border border-slate-700 rounded-3xl p-4 shadow-2xl animate-in fade-in slide-in-from-bottom-3 duration-150"
        >
          <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-800">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-300">
              {activeToolDrawer === "washi" && "Escolha uma Fita Washi Tape"}
              {activeToolDrawer === "stickers" && "Adesivos & Carimbos Autorais"}
              {activeToolDrawer === "polaroid" && "Colar Foto ou Capa de Livro"}
              {activeToolDrawer === "memo" && "Adicionar Recorte de Papel / Citação"}
              {activeToolDrawer === "paper" && "Estilo da Folha de Papel"}
            </span>
            <button type="button" onClick={() => setActiveToolDrawer(null)} className="text-slate-400 hover:text-white">
              <X size={16} />
            </button>
          </div>

          {/* Drawer: Washi Tapes */}
          {activeToolDrawer === "washi" && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {WASHI_PATTERNS.map((tape) => (
                <button
                  key={tape.id}
                  type="button"
                  onClick={() => {
                    handleAddElement({
                      tipo: "washi_tape",
                      x: 100,
                      y: 120,
                      width: 130,
                      height: 28,
                      rotation: Math.floor(Math.random() * 8) - 4,
                      conteudo: { washiPattern: tape.id }
                    });
                  }}
                  className="p-2 rounded-xl border border-slate-800 hover:border-amber-400 flex flex-col items-center gap-1.5 transition-all cursor-pointer group"
                >
                  <div
                    className="w-full h-6 rounded-xs shadow-sm border border-black/10 opacity-90 group-hover:opacity-100"
                    style={{ backgroundColor: tape.bg, backgroundImage: tape.pattern }}
                  />
                  <span className="text-[10px] font-bold text-slate-300">{tape.name}</span>
                </button>
              ))}
            </div>
          )}

          {/* Drawer: Stickers e Selos */}
          {activeToolDrawer === "stickers" && (
            <div className="space-y-3 max-h-60 overflow-y-auto custom-scrollbar">
              <div>
                <div className="text-[10px] uppercase font-bold text-slate-400 mb-1.5">Carimbos de Avaliação:</div>
                <div className="grid grid-cols-2 gap-2">
                  {KINBOR_STICKERS.filter(s => s.type === "stamp").map((stamp) => (
                    <button
                      key={stamp.id}
                      type="button"
                      onClick={() => {
                        handleAddElement({
                          tipo: "carimbo",
                          x: 150,
                          y: 150,
                          width: 140,
                          height: 40,
                          rotation: Math.floor(Math.random() * 12) - 6,
                          conteudo: { stickerId: stamp.id, texto: stamp.text, corFundo: stamp.color }
                        });
                      }}
                      className="p-2 rounded-xl border border-dashed text-xs font-black tracking-wider uppercase text-center transition-transform hover:scale-105 active:scale-95 cursor-pointer"
                      style={{ borderColor: stamp.color, color: stamp.color, backgroundColor: `${stamp.color}15` }}
                    >
                      {stamp.text}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="text-[10px] uppercase font-bold text-slate-400 mb-1.5">Adesivos Temáticos:</div>
                <div className="grid grid-cols-6 sm:grid-cols-7 gap-2">
                  {KINBOR_STICKERS.filter(s => s.emoji).map((stk) => (
                    <button
                      key={stk.id}
                      type="button"
                      onClick={() => {
                        handleAddElement({
                          tipo: "sticker",
                          x: 120,
                          y: 120,
                          width: 50,
                          height: 50,
                          rotation: Math.floor(Math.random() * 16) - 8,
                          conteudo: { stickerId: stk.id, texto: stk.emoji }
                        });
                      }}
                      className="w-11 h-11 rounded-xl bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-2xl transition-transform hover:scale-125 cursor-pointer"
                      title={stk.label}
                    >
                      {stk.emoji}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Drawer: Foto / Polaroid */}
          {activeToolDrawer === "polaroid" && (
            <div className="space-y-3">
              {/* Obras da Estante para colar rápido */}
              {allMedia.length > 0 && (
                <div>
                  <div className="text-[10px] uppercase font-bold text-slate-400 mb-1.5">Colar Capa da Minha Estante:</div>
                  <div className="flex items-center gap-2 overflow-x-auto pb-1 custom-scrollbar">
                    {allMedia.filter(m => m.capaUrl).slice(0, 8).map(m => (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => {
                          handleAddElement({
                            tipo: "polaroid",
                            x: 60,
                            y: 80,
                            width: 160,
                            height: 220,
                            rotation: Math.floor(Math.random() * 6) - 3,
                            conteudo: { imagemUrl: m.capaUrl, legenda: m.titulo }
                          });
                        }}
                        className="shrink-0 w-12 h-16 rounded-md overflow-hidden border border-slate-700 hover:border-amber-400 hover:scale-105 transition-all"
                        title={m.titulo}
                      >
                        <img src={m.capaUrl} alt="" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <label className="text-xs font-bold block mb-1 text-slate-300">Ou Cole uma URL de Imagem / Foto</label>
                <div className="flex items-center gap-2">
                  <input
                    type="url"
                    id="kinbor_img_input"
                    placeholder="https://exemplo.com/foto.jpg"
                    className="flex-1 px-3 py-2 rounded-xl text-xs bg-slate-800 border border-slate-700 text-white outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const inp = document.getElementById("kinbor_img_input");
                      if (inp && inp.value.trim()) {
                        handleAddElement({
                          tipo: "polaroid",
                          x: 70,
                          y: 80,
                          width: 170,
                          height: 220,
                          rotation: Math.floor(Math.random() * 6) - 3,
                          conteudo: { imagemUrl: inp.value.trim(), legenda: "Momento Especial" }
                        });
                        inp.value = "";
                      }
                    }}
                    className="px-3.5 py-2 rounded-xl text-xs font-bold bg-amber-400 text-slate-900 shadow-md"
                  >
                    Colar
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Drawer: Recorte de Citação / Memo */}
          {activeToolDrawer === "memo" && (
            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold block mb-1 text-slate-300">Texto ou Citação</label>
                <textarea
                  id="kinbor_memo_input"
                  rows={3}
                  placeholder="Escreva sua citação ou pensamento para recortar e colar..."
                  className="w-full p-2.5 rounded-xl text-xs bg-slate-800 border border-slate-700 text-white outline-none"
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-slate-400">Estilo papel kraft amarelado</span>
                <button
                  type="button"
                  onClick={() => {
                    const inp = document.getElementById("kinbor_memo_input");
                    if (inp && inp.value.trim()) {
                      handleAddElement({
                        tipo: "nota_adesiva",
                        x: 80,
                        y: 100,
                        width: 190,
                        height: 120,
                        rotation: Math.floor(Math.random() * 6) - 3,
                        conteudo: { texto: `"${inp.value.trim()}"`, corFundo: "#fef08a" }
                      });
                      inp.value = "";
                    }
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-amber-400 text-slate-900"
                >
                  Colar na Folha
                </button>
              </div>
            </div>
          )}

          {/* Drawer: Papel */}
          {activeToolDrawer === "paper" && (
            <div className="grid grid-cols-2 gap-2">
              {PAPER_STYLES.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => {
                    sfx.pop();
                    updateCurrentPage({ estiloPapel: p.id });
                    setActiveToolDrawer(null);
                  }}
                  className={`p-3 rounded-2xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                    currentPage.estiloPapel === p.id ? "border-amber-400 bg-amber-400/10 text-amber-300 font-bold" : "border-slate-800 bg-slate-800/60 text-slate-300"
                  }`}
                >
                  <span className="text-xs">{p.label}</span>
                  <div className="w-5 h-5 rounded-md border border-slate-600 shadow-sm" style={{ backgroundColor: p.bg }} />
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Área Central: O Caderno Aberto (Estilo Hobonichi / Kinbor) */}
      <div className="flex-1 overflow-auto custom-scrollbar p-3 sm:p-8 flex items-center justify-center relative">
        <div
          ref={notebookRef}
          onClick={() => setSelectedElementId(null)}
          className="relative rounded-3xl shadow-2xl transition-all select-none border border-black/10 overflow-hidden"
          style={{
            width: "100%",
            maxWidth: "760px",
            minHeight: "680px",
            backgroundColor: currentPaper.bg,
            color: currentPaper.dark ? "#e2e8f0" : "#332d29",
            backgroundImage: currentPaper.type === "grid"
              ? `linear-gradient(${currentPaper.gridColor} 1px, transparent 1px), linear-gradient(90deg, ${currentPaper.gridColor} 1px, transparent 1px)`
              : currentPaper.type === "dots"
              ? `radial-gradient(${currentPaper.gridColor} 1px, transparent 1px)`
              : "none",
            backgroundSize: currentPaper.type === "grid" ? "14px 14px" : "16px 16px",
            boxShadow: "0 25px 60px -15px rgba(0, 0, 0, 0.7), 0 0 0 1px rgba(0,0,0,0.15)"
          }}
        >
          {/* Fita de Cetim / Marcador de Página caindo do topo */}
          <div
            className="absolute top-0 right-14 w-6 h-28 pointer-events-none z-30 drop-shadow-md"
            style={{
              backgroundColor: "#b91c1c",
              clipPath: "polygon(0 0, 100% 0, 100% 100%, 50% 85%, 0 100%)",
              opacity: 0.95
            }}
          />

          {/* Cabeçalho Autoral Kinbor (Data, Dia da Semana, Clima & Humor) */}
          <div className="p-5 sm:p-8 pb-4 flex items-start justify-between border-b border-black/5">
            <div className="space-y-1">
              <div className="flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-black tracking-tight font-serif">
                  {formatKinborDate(currentPage.dataRegistro)}
                </span>
                <span className="text-xs uppercase font-bold tracking-widest opacity-60">
                  {formatKinborWeekday(currentPage.dataRegistro)}
                </span>
              </div>
              <input
                type="text"
                placeholder="Título da página ou obra..."
                value={currentPage.titulo || ""}
                onChange={(e) => updateCurrentPage({ titulo: e.target.value })}
                className="text-xs sm:text-sm font-bold bg-transparent border-none outline-none p-0 w-full opacity-80 focus:opacity-100 placeholder:opacity-40"
              />
            </div>

            {/* Ícones de Clima e Humor Interativos */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1 opacity-70 hover:opacity-100 transition-opacity">
                {["sol", "chuva", "nuvem", "cafe"].map((cKey) => (
                  <button
                    key={cKey}
                    type="button"
                    onClick={() => { sfx.pop(); updateCurrentPage({ clima: cKey }); }}
                    className={`p-1 rounded-md transition-transform hover:scale-110 cursor-pointer ${
                      currentPage.clima === cKey ? "scale-110 opacity-100 text-amber-500 font-bold" : "opacity-40"
                    }`}
                  >
                    {cKey === "sol" && "☀️"}
                    {cKey === "chuva" && "🌧️"}
                    {cKey === "nuvem" && "☁️"}
                    {cKey === "cafe" && "☕"}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Régua Sutil de Linha do Tempo na Margem Esquerda (Kinbor Hours: 06h às 24h) */}
          <div className="absolute left-2 top-28 bottom-8 w-6 flex flex-col justify-between text-[8px] font-mono opacity-25 pointer-events-none select-none">
            {["06", "08", "10", "12", "14", "16", "18", "20", "22", "24"].map(h => (
              <span key={h}>{h}</span>
            ))}
          </div>

          {/* Canvas de Elementos Livres (Colagens, Polaroids, Stickers) */}
          <div className="relative min-h-[560px] p-6 pl-10">
            {currentPage.elementos?.map((el) => {
              const isSelected = selectedElementId === el.id;

              return (
                <div
                  key={el.id}
                  onPointerDown={(e) => handleStartDrag(e, el)}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedElementId(el.id);
                  }}
                  className={`absolute group cursor-grab active:cursor-grabbing transition-shadow ${
                    isSelected ? "ring-2 ring-amber-400 ring-offset-2 ring-offset-slate-900 z-50" : ""
                  }`}
                  style={{
                    left: `${el.x}px`,
                    top: `${el.y}px`,
                    width: el.width ? `${el.width}px` : "auto",
                    height: el.height ? `${el.height}px` : "auto",
                    transform: `rotate(${el.rotation || 0}deg)`,
                    transformOrigin: "center center",
                    zIndex: el.zIndex || 10,
                    touchAction: "none"
                  }}
                >
                  {/* Controles de Rotação e Exclusão ao Selecionar */}
                  {isSelected && (
                    <div className="absolute -top-7 right-0 flex items-center gap-1 bg-slate-900/90 backdrop-blur-md rounded-lg p-1 shadow-md z-50">
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); handleRotateElement(el.id); }}
                        className="p-1 text-slate-300 hover:text-white"
                        title="Girar"
                      >
                        <RotateCw size={12} />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); handleDeleteElement(el.id); }}
                        className="p-1 text-slate-300 hover:text-rose-400"
                        title="Excluir"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  )}

                  {/* 1. Polaroid / Recorte de Foto */}
                  {el.tipo === "polaroid" && (
                    <div
                      className="p-2 pb-3.5 bg-white rounded-lg shadow-md border border-black/10 flex flex-col items-center select-none"
                      style={{ color: "#1f2937" }}
                    >
                      <div className="w-full aspect-[3/4] bg-slate-100 rounded overflow-hidden shadow-inner mb-2">
                        {el.conteudo?.imagemUrl ? (
                          <img src={el.conteudo.imagemUrl} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-300">
                            <ImageIcon size={28} />
                          </div>
                        )}
                      </div>
                      <div className="text-[11px] font-bold font-serif text-center truncate w-full px-1">
                        {el.conteudo?.legenda || "Memória"}
                      </div>
                    </div>
                  )}

                  {/* 2. Washi Tape (Fita Adesiva Decorativa) */}
                  {el.tipo === "washi_tape" && (
                    <div
                      className="w-full h-full rounded-xs shadow-sm opacity-90 hover:opacity-100 transition-opacity"
                      style={{
                        backgroundColor: (WASHI_PATTERNS.find(w => w.id === el.conteudo?.washiPattern) || WASHI_PATTERNS[0]).bg,
                        backgroundImage: (WASHI_PATTERNS.find(w => w.id === el.conteudo?.washiPattern) || WASHI_PATTERNS[0]).pattern,
                        boxShadow: "0 1px 3px rgba(0,0,0,0.15)"
                      }}
                    />
                  )}

                  {/* 3. Carimbo / Stamp */}
                  {el.tipo === "carimbo" && (
                    <div
                      className="px-3 py-1 rounded border-2 border-dashed font-black uppercase text-xs tracking-wider select-none shadow-xs"
                      style={{
                        borderColor: el.conteudo?.corFundo || "#e11d48",
                        color: el.conteudo?.corFundo || "#e11d48",
                        backgroundColor: `${el.conteudo?.corFundo || "#e11d48"}12`
                      }}
                    >
                      {el.conteudo?.texto || "APROVADO"}
                    </div>
                  )}

                  {/* 4. Sticker / Adesivo */}
                  {el.tipo === "sticker" && (
                    <div className="text-3xl sm:text-4xl select-none filter drop-shadow">
                      {el.conteudo?.texto || "☕"}
                    </div>
                  )}

                  {/* 5. Nota Adesiva / Recorte de Citação */}
                  {el.tipo === "nota_adesiva" && (
                    <div
                      className="p-3 rounded-xl shadow-md border border-black/10 text-xs italic select-none leading-relaxed"
                      style={{
                        backgroundColor: el.conteudo?.corFundo || "#fef08a",
                        color: "#422006",
                        fontFamily: "var(--font-serif, serif)"
                      }}
                    >
                      {el.conteudo?.texto || "Minha citação"}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function formatKinborDate(isoStr) {
  if (!isoStr) return "";
  try {
    const parts = isoStr.split("-");
    const months = ["JAN", "FEV", "MAR", "ABR", "MAI", "JUN", "JUL", "AGO", "SET", "OUT", "NOV", "DEZ"];
    const day = parts[2];
    const month = months[parseInt(parts[1], 10) - 1];
    return `${day} ${month}`;
  } catch {
    return isoStr;
  }
}

function formatKinborWeekday(isoStr) {
  if (!isoStr) return "";
  try {
    const d = new Date(isoStr + "T12:00:00");
    const weekdays = ["DOMINGO", "SEGUNDA", "TERÇA", "QUARTA", "QUINTA", "SEXTA", "SÁBADO"];
    return weekdays[d.getDay()];
  } catch {
    return "";
  }
}
