import React, { useState, useRef, useMemo } from "react";
import {
  X, Trophy, Sparkles, Calendar, Share2, Download, Check, Star,
  Heart, BookOpen, Film, Tv, ChevronRight, Award, Compass, Layers
} from "lucide-react";
import html2canvas from "html2canvas";
import { T, TINT } from "./ui";
import { sfx } from "../lib/soundEffects";
import { formatDateBR } from "../lib/utils";

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

export function MediaChallengesModal({
  isOpen,
  onClose,
  mediaItems = [],
}) {
  const [activeTab, setActiveTab] = useState("abecedario"); // 'abecedario' | 'sharelist' | 'timeline'
  const [selectedShareTemplate, setSelectedShareTemplate] = useState("top3"); // 'top3' | 'recent' | 'stats'
  const [isExporting, setIsExporting] = useState(false);

  const shareCardRef = useRef(null);

  // Mapeamento do Abecedário (A a Z)
  const alphabetMap = useMemo(() => {
    const map = {};
    ALPHABET.forEach(letter => { map[letter] = []; });

    mediaItems.forEach(item => {
      if (!item.titulo) return;
      // Normaliza para pegar a primeira letra desconsiderando artigos (O, A, The)
      const cleanTitle = item.titulo.trim().replace(/^(O|A|Os|As|Um|Uma|The)\s+/i, "");
      const firstLetter = cleanTitle.charAt(0).toUpperCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      if (map[firstLetter]) {
        map[firstLetter].push(item);
      }
    });

    const completedCount = ALPHABET.filter(letter => map[letter].length > 0).length;
    return { map, completedCount };
  }, [mediaItems]);

  // Melhores do Ano (Top Favoritos com maior nota)
  const topMedia = useMemo(() => {
    return [...mediaItems]
      .filter(m => (m.nota && m.nota >= 4) || m.favorito)
      .sort((a, b) => {
        if (b.favorito !== a.favorito) return b.favorito ? 1 : -1;
        return (b.nota || 0) - (a.nota || 0);
      })
      .slice(0, 5);
  }, [mediaItems]);

  // Mídias Concluídas em Linha do Tempo
  const timelineMedia = useMemo(() => {
    return [...mediaItems]
      .filter(m => m.status === "concluido")
      .sort((a, b) => (b.dataFim || b.updatedAt || "").localeCompare(a.dataFim || a.updatedAt || ""));
  }, [mediaItems]);

  // Exportar card de sharelist para imagem (Instagram Stories / Feed)
  const handleExportShareCard = async () => {
    if (!shareCardRef.current) return;
    setIsExporting(true);
    sfx.pop();
    try {
      const canvas = await html2canvas(shareCardRef.current, {
        scale: 3,
        useCORS: true,
        backgroundColor: null,
      });
      const dataUrl = canvas.toDataURL("image/png");
      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = `omnia_sharelist_${selectedShareTemplate}.png`;
      a.click();
    } catch (err) {
      console.warn("Erro ao exportar sharelist:", err);
    } finally {
      setIsExporting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5"
      style={{ backgroundColor: "rgba(0,0,0,0.75)", backdropFilter: "blur(8px)" }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl max-h-[92vh] rounded-3xl border shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        style={{ backgroundColor: T.surface, borderColor: T.border, color: T.ink }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header do Modal */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b" style={{ borderColor: T.border }}>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-amber-500/20 text-amber-400">
              <Trophy size={18} />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold leading-tight" style={{ color: T.ink }}>
                Desafios & Sharelists
              </h2>
              <p className="text-[11px] opacity-70" style={{ color: T.inkSoft }}>
                Abecedário cultural de A a Z e cards estéticos para compartilhar.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Abas Internas */}
        <div className="flex items-center border-b px-4 sm:px-5 gap-2" style={{ borderColor: T.border, backgroundColor: T.surfaceAlt }}>
          <button
            type="button"
            onClick={() => { sfx.tab(); setActiveTab("abecedario"); }}
            className={`py-3 px-3 text-xs font-bold border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === "abecedario" ? "border-brand text-brand" : "border-transparent opacity-70 hover:opacity-100"
            }`}
            style={{ color: activeTab === "abecedario" ? T.brand : T.inkSoft }}
          >
            <Sparkles size={14} />
            <span>Abecedário (A–Z)</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-brand/20 text-brand font-bold">
              {alphabetMap.completedCount}/26
            </span>
          </button>

          <button
            type="button"
            onClick={() => { sfx.tab(); setActiveTab("sharelist"); }}
            className={`py-3 px-3 text-xs font-bold border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === "sharelist" ? "border-brand text-brand" : "border-transparent opacity-70 hover:opacity-100"
            }`}
            style={{ color: activeTab === "sharelist" ? T.brand : T.inkSoft }}
          >
            <Share2 size={14} />
            <span>Sharelists (Cards)</span>
          </button>

          <button
            type="button"
            onClick={() => { sfx.tab(); setActiveTab("timeline"); }}
            className={`py-3 px-3 text-xs font-bold border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === "timeline" ? "border-brand text-brand" : "border-transparent opacity-70 hover:opacity-100"
            }`}
            style={{ color: activeTab === "timeline" ? T.brand : T.inkSoft }}
          >
            <Calendar size={14} />
            <span>Linha do Tempo</span>
          </button>
        </div>

        {/* Conteúdo com Rolagem */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 sm:p-6 space-y-4">
          {/* TAB 1: Desafio do Abecedário de A a Z */}
          {activeTab === "abecedario" && (
            <div className="space-y-4">
              {/* Barra de Progresso Geral */}
              <div className="p-4 rounded-2xl border" style={{ backgroundColor: T.surfaceAlt, borderColor: T.border }}>
                <div className="flex items-center justify-between text-xs font-bold mb-2">
                  <span className="flex items-center gap-1.5 text-amber-400">
                    <Award size={15} /> Progresso do Desafio A–Z
                  </span>
                  <span style={{ color: T.ink }}>
                    {alphabetMap.completedCount} de 26 Letras ({Math.round((alphabetMap.completedCount / 26) * 100)}%)
                  </span>
                </div>
                <div className="w-full h-2.5 rounded-full overflow-hidden bg-slate-800">
                  <div
                    className="h-full rounded-full transition-all duration-500 bg-gradient-to-r from-amber-500 to-brand"
                    style={{ width: `${(alphabetMap.completedCount / 26) * 100}%` }}
                  />
                </div>
              </div>

              {/* Grade de Letras do Alfabeto */}
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2.5">
                {ALPHABET.map((letter) => {
                  const itemsForLetter = alphabetMap.map[letter] || [];
                  const isDone = itemsForLetter.length > 0;
                  const firstItem = itemsForLetter[0];

                  return (
                    <div
                      key={letter}
                      className={`p-2.5 rounded-2xl border flex flex-col justify-between transition-all relative overflow-hidden group ${
                        isDone ? "border-amber-400/50 shadow-md" : "border-slate-800 opacity-60"
                      }`}
                      style={{
                        backgroundColor: isDone ? `${T.surfaceAlt}` : "rgba(0,0,0,0.2)",
                        minHeight: "115px"
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <span className={`text-base font-black ${isDone ? "text-amber-400 font-serif" : "text-slate-500"}`}>
                          {letter}
                        </span>
                        {isDone && (
                          <span className="w-4 h-4 rounded-full bg-amber-400/20 text-amber-400 text-[10px] font-bold flex items-center justify-center">
                            ✓
                          </span>
                        )}
                      </div>

                      {isDone && firstItem ? (
                        <div className="mt-1 space-y-1">
                          {firstItem.capaUrl && (
                            <div className="w-full h-12 rounded overflow-hidden shadow-inner border border-black/10">
                              <img src={firstItem.capaUrl} alt="" className="w-full h-full object-cover" />
                            </div>
                          )}
                          <div className="text-[10px] font-bold truncate" style={{ color: T.ink }} title={firstItem.titulo}>
                            {firstItem.titulo}
                          </div>
                        </div>
                      ) : (
                        <div className="text-[10px] italic text-slate-500 text-center py-2">
                          Vazio
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: Sharelists (Cards Prontos para Redes Sociais) */}
          {activeTab === "sharelist" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                  <button
                    type="button"
                    onClick={() => { sfx.pop(); setSelectedShareTemplate("top3"); }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer border ${
                      selectedShareTemplate === "top3" ? "bg-amber-400 text-slate-900 border-amber-400" : "bg-slate-800 text-slate-300 border-slate-700"
                    }`}
                  >
                    Top Favoritos
                  </button>
                  <button
                    type="button"
                    onClick={() => { sfx.pop(); setSelectedShareTemplate("recent"); }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer border ${
                      selectedShareTemplate === "recent" ? "bg-amber-400 text-slate-900 border-amber-400" : "bg-slate-800 text-slate-300 border-slate-700"
                    }`}
                  >
                    Lidos Recentemente
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleExportShareCard}
                  disabled={isExporting}
                  className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-brand text-white shadow-md hover:brightness-110 flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <Download size={14} />
                  <span>{isExporting ? "Gerando..." : "Baixar Imagem"}</span>
                </button>
              </div>

              {/* O Card Visual a ser Exportado */}
              <div className="flex justify-center p-2">
                <div
                  ref={shareCardRef}
                  className="w-full max-w-sm rounded-3xl p-6 shadow-2xl relative overflow-hidden select-none border border-amber-500/30"
                  style={{
                    backgroundColor: "#16171d",
                    color: "#f8fafc",
                    backgroundImage: "radial-gradient(circle at 10% 10%, rgba(245, 158, 11, 0.15), transparent 50%), radial-gradient(circle at 90% 90%, rgba(99, 102, 241, 0.15), transparent 50%)"
                  }}
                >
                  {/* Topo do Card */}
                  <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-amber-400/20 text-amber-300 flex items-center justify-center font-bold text-xs">
                        ✦
                      </div>
                      <span className="text-xs font-bold tracking-widest uppercase text-slate-300">
                        Omnia Cultural
                      </span>
                    </div>
                    <span className="text-[10px] font-mono text-slate-400">
                      {new Date().toLocaleDateString("pt-BR", { month: "short", year: "numeric" }).toUpperCase()}
                    </span>
                  </div>

                  {/* Conteúdo Dinâmico */}
                  <div className="py-5 space-y-4">
                    <div className="text-center space-y-1">
                      <h3 className="text-lg font-black tracking-tight text-amber-300 font-serif">
                        {selectedShareTemplate === "top3" ? "Meus Favoritos da Vida" : "Minhas Leituras Recentes"}
                      </h3>
                      <p className="text-[11px] text-slate-400">Compartilhado via Omnia App</p>
                    </div>

                    <div className="space-y-3">
                      {(selectedShareTemplate === "top3" ? topMedia : timelineMedia).slice(0, 4).map((m, idx) => (
                        <div
                          key={m.id}
                          className="flex items-center gap-3 p-2.5 rounded-2xl bg-white/[0.04] border border-white/5"
                        >
                          {m.capaUrl ? (
                            <img src={m.capaUrl} alt="" className="w-10 h-14 object-cover rounded-lg shadow-md shrink-0" />
                          ) : (
                            <div className="w-10 h-14 rounded-lg bg-slate-800 flex items-center justify-center shrink-0 text-slate-500">
                              <BookOpen size={16} />
                            </div>
                          )}

                          <div className="min-w-0 flex-1">
                            <div className="text-xs font-bold truncate text-slate-100">{m.titulo}</div>
                            <div className="text-[10px] text-slate-400 truncate mt-0.5">{m.autorCriador || "Autor"}</div>
                            {m.nota > 0 && (
                              <div className="flex items-center gap-0.5 mt-1 text-amber-400">
                                {[...Array(m.nota)].map((_, i) => (
                                  <Star key={i} size={10} className="fill-current" />
                                ))}
                              </div>
                            )}
                          </div>

                          <div className="text-xs font-black text-amber-400/80 font-serif px-2">
                            #{idx + 1}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Rodapé do Card */}
                  <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-500">
                    <span>Organizado com carinho</span>
                    <span className="font-bold text-slate-400">omnia-unio.vercel.app</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Linha do Tempo / Histórico de Leituras */}
          {activeTab === "timeline" && (
            <div className="space-y-3">
              {timelineMedia.length === 0 ? (
                <div className="p-8 text-center text-xs opacity-70" style={{ color: T.inkSoft }}>
                  Nenhuma obra concluída ainda. Conforme você terminar suas leituras, elas aparecerão aqui em ordem cronológica!
                </div>
              ) : (
                timelineMedia.map((m) => (
                  <div
                    key={m.id}
                    className="p-3 rounded-2xl border flex items-center justify-between gap-3"
                    style={{ backgroundColor: T.surfaceAlt, borderColor: T.border }}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {m.capaUrl ? (
                        <img src={m.capaUrl} alt="" className="w-9 h-12 object-cover rounded-lg shadow-sm shrink-0" />
                      ) : (
                        <div className="w-9 h-12 rounded-lg bg-slate-800 flex items-center justify-center shrink-0">
                          <BookOpen size={16} />
                        </div>
                      )}
                      <div className="min-w-0">
                        <div className="text-xs font-bold truncate" style={{ color: T.ink }}>{m.titulo}</div>
                        <div className="text-[11px] opacity-70 truncate mt-0.5" style={{ color: T.inkSoft }}>
                          {m.autorCriador || "Autor"}
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      {m.dataFim && (
                        <div className="text-[10px] font-mono opacity-70" style={{ color: T.inkSoft }}>
                          Concluído em {formatDateBR(m.dataFim)}
                        </div>
                      )}
                      {m.nota > 0 && (
                        <div className="text-xs font-bold text-amber-400">
                          {m.nota}/5 ★
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
