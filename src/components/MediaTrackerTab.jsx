import React, { useState, useMemo, useEffect } from "react";
import {
  BookOpen, Film, Tv, Headphones, FileText, Sparkles, Plus, Search,
  Star, Heart, Trash2, Edit3, Check, X, ExternalLink, Calendar,
  ArrowRight, BookMarked, Filter, Share2, Quote, Layers,
  SlidersHorizontal, Loader2, Image as ImageIcon, ChevronRight,
  TrendingUp, Library, Compass, Trophy, Users
} from "lucide-react";
import { T, TINT, Card, GhostButton, PrimaryButton } from "./ui";
import { sfx } from "../lib/soundEffects";
import { formatDateBR } from "../lib/utils";
import { KinborJournalModal } from "./KinborJournalModal";
import { MediaChallengesModal } from "./MediaChallengesModal";
import { BookClubModal } from "./BookClubModal";

export const MEDIA_TYPES = [
  { id: "livro", label: "Livro", icon: BookOpen, unit: "págs", color: "#6366f1" },
  { id: "serie", label: "Série", icon: Tv, unit: "eps", color: "#ec4899" },
  { id: "filme", label: "Filme", icon: Film, unit: "min", color: "#f59e0b" },
  { id: "anime", label: "Anime", icon: Sparkles, unit: "eps", color: "#8b5cf6" },
  { id: "podcast", label: "Podcast", icon: Headphones, unit: "eps", color: "#10b981" },
  { id: "artigo", label: "Artigo", icon: FileText, unit: "seções", color: "#06b6d4" },
];

export const MEDIA_STATUS = [
  { id: "lendo", label: "Consumindo", bg: "rgba(99, 102, 241, 0.15)", text: "#818cf8", border: "rgba(99, 102, 241, 0.3)" },
  { id: "quero_consumir", label: "Quero Ver/Ler", bg: "rgba(245, 158, 11, 0.15)", text: "#fbbf24", border: "rgba(245, 158, 11, 0.3)" },
  { id: "concluido", label: "Concluído", bg: "rgba(16, 185, 129, 0.15)", text: "#34d399", border: "rgba(16, 185, 129, 0.3)" },
  { id: "abandonado", label: "Pausado/Aband.", bg: "rgba(239, 68, 68, 0.15)", text: "#f87171", border: "rgba(239, 68, 68, 0.3)" },
];

export function MediaTrackerTab({
  userId,
  mediaItems = [],
  onSaveMedia,
  onDeleteMedia,
  onOpenKinbor,
}) {
  const [search, setSearch] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [onlyFavorites, setOnlyFavorites] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isKinborOpen, setIsKinborOpen] = useState(false);
  const [kinborTargetMedia, setKinborTargetMedia] = useState(null);
  const [isChallengesOpen, setIsChallengesOpen] = useState(false);
  const [isBookClubOpen, setIsBookClubOpen] = useState(false);

  // Métricas rápidas
  const stats = useMemo(() => {
    const total = mediaItems.length;
    const concluidos = mediaItems.filter(m => m.status === "concluido").length;
    const lendo = mediaItems.filter(m => m.status === "lendo").length;
    const favoritos = mediaItems.filter(m => m.favorito).length;
    const resenhas = mediaItems.filter(m => m.resenha?.textoLivre?.trim()).length;
    return { total, concluidos, lendo, favoritos, resenhas };
  }, [mediaItems]);

  // Lista filtrada
  const filteredItems = useMemo(() => {
    const q = search.trim().toLowerCase();
    return mediaItems.filter(item => {
      if (selectedType !== "all" && item.tipo !== selectedType) return false;
      if (selectedStatus !== "all" && item.status !== selectedStatus) return false;
      if (onlyFavorites && !item.favorito) return false;

      if (!q) return true;
      const matchTitle = (item.titulo || "").toLowerCase().includes(q);
      const matchSub = (item.subtitulo || "").toLowerCase().includes(q);
      const matchAuthor = (item.autorCriador || "").toLowerCase().includes(q);
      const matchReview = (item.resenha?.textoLivre || "").toLowerCase().includes(q);
      return matchTitle || matchSub || matchAuthor || matchReview;
    });
  }, [mediaItems, search, selectedType, selectedStatus, onlyFavorites]);

  const handleCreateNew = (prefilledType = "livro") => {
    sfx.pop();
    setEditingItem({
      tipo: prefilledType,
      titulo: "",
      subtitulo: "",
      autorCriador: "",
      capaUrl: "",
      status: "lendo",
      progressoAtual: 0,
      progressoTotal: 100,
      nota: 5,
      favorito: false,
      dataInicio: new Date().toISOString().split("T")[0],
      dataFim: "",
      generos: [],
      resenha: {
        textoLivre: "",
        citacoesFavoritas: [],
        licoesAprendidas: "",
      }
    });
    setIsModalOpen(true);
  };

  const handleEdit = (item) => {
    sfx.pop();
    setEditingItem({ ...item });
    setIsModalOpen(true);
  };

  const handleToggleFavorite = async (e, item) => {
    e.stopPropagation();
    sfx.pop();
    await onSaveMedia({ ...item, favorito: !item.favorito });
  };

  const handleQuickProgress = async (e, item, delta) => {
    e.stopPropagation();
    sfx.pop();
    const newProgress = Math.max(0, Math.min(item.progressoTotal || 9999, (item.progressoAtual || 0) + delta));
    const isNowFinished = item.progressoTotal > 0 && newProgress >= item.progressoTotal;
    await onSaveMedia({
      ...item,
      progressoAtual: newProgress,
      status: isNowFinished ? "concluido" : item.status === "quero_consumir" ? "lendo" : item.status,
      dataFim: isNowFinished && !item.dataFim ? new Date().toISOString().split("T")[0] : item.dataFim
    });
  };

  return (
    <div className="space-y-6 pb-20 animate-in fade-in duration-200">
      {/* Top Banner / Cabeçalho Aconchegante */}
      <div
        className="p-5 sm:p-7 rounded-3xl border shadow-xl relative overflow-hidden backdrop-blur-xl transition-all"
        style={{
          backgroundColor: T.surface,
          borderColor: T.border,
          backgroundImage: `radial-gradient(circle at 90% 10%, ${T.brand}15, transparent 50%)`
        }}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="space-y-1.5 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold tracking-wide uppercase" style={{ backgroundColor: `${T.brand}18`, color: T.brand }}>
              <Library size={14} /> Espaço Cultural & Mídias
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight" style={{ color: T.ink }}>
              Minha Estante & Leituras
            </h1>
            <p className="text-xs sm:text-sm font-medium opacity-80" style={{ color: T.inkSoft }}>
              Acompanhe livros, séries e filmes, exercite a escrita com resenhas profundas e colecione memórias no estilo Kinbor.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={() => {
                sfx.tab();
                setKinborTargetMedia(null);
                setIsKinborOpen(true);
              }}
              className="px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-md border cursor-pointer"
              style={{
                backgroundColor: T.surfaceAlt,
                color: T.ink,
                borderColor: `${T.brand}40`
              }}
            >
              <BookMarked size={16} className="text-amber-400" />
              <span>Caderno Kinbor</span>
            </button>

            <button
              type="button"
              onClick={() => {
                sfx.tab();
                setIsChallengesOpen(true);
              }}
              className="px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-md border cursor-pointer"
              style={{
                backgroundColor: T.surfaceAlt,
                color: T.ink,
                borderColor: "rgba(245, 158, 11, 0.4)"
              }}
            >
              <Trophy size={16} className="text-amber-400" />
              <span>Desafios & Cards</span>
            </button>

            <button
              type="button"
              onClick={() => {
                sfx.tab();
                setIsBookClubOpen(true);
              }}
              className="px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-md border cursor-pointer"
              style={{
                backgroundColor: T.surfaceAlt,
                color: T.ink,
                borderColor: "rgba(139, 92, 246, 0.4)"
              }}
            >
              <Users size={16} className="text-purple-400" />
              <span>Clube & Social</span>
            </button>

            <button
              type="button"
              onClick={() => handleCreateNew("livro")}
              className="px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all hover:brightness-110 active:scale-[0.98] shadow-lg cursor-pointer"
              style={{ backgroundColor: T.brand, color: "#fff" }}
            >
              <Plus size={16} strokeWidth={2.5} />
              <span>Adicionar Obra</span>
            </button>
          </div>
        </div>

        {/* Métricas Rápidas / Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 mt-6 pt-5 border-t" style={{ borderColor: `${T.border}80` }}>
          <div className="p-3 rounded-2xl border flex items-center gap-3" style={{ backgroundColor: T.surfaceAlt, borderColor: T.border }}>
            <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: "rgba(99, 102, 241, 0.15)", color: "#818cf8" }}>
              <BookOpen size={18} />
            </div>
            <div className="min-w-0">
              <div className="text-lg font-black leading-none" style={{ color: T.ink }}>{stats.lendo}</div>
              <div className="text-[11px] font-medium truncate mt-0.5" style={{ color: T.inkSoft }}>Consumindo agora</div>
            </div>
          </div>

          <div className="p-3 rounded-2xl border flex items-center gap-3" style={{ backgroundColor: T.surfaceAlt, borderColor: T.border }}>
            <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: "rgba(16, 185, 129, 0.15)", color: "#34d399" }}>
              <Check size={18} strokeWidth={2.5} />
            </div>
            <div className="min-w-0">
              <div className="text-lg font-black leading-none" style={{ color: T.ink }}>{stats.concluidos}</div>
              <div className="text-[11px] font-medium truncate mt-0.5" style={{ color: T.inkSoft }}>Obras concluídas</div>
            </div>
          </div>

          <div className="p-3 rounded-2xl border flex items-center gap-3" style={{ backgroundColor: T.surfaceAlt, borderColor: T.border }}>
            <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: "rgba(244, 63, 94, 0.15)", color: "#fb7185" }}>
              <Heart size={18} className="fill-rose-500" />
            </div>
            <div className="min-w-0">
              <div className="text-lg font-black leading-none" style={{ color: T.ink }}>{stats.favoritos}</div>
              <div className="text-[11px] font-medium truncate mt-0.5" style={{ color: T.inkSoft }}>Favoritos da vida</div>
            </div>
          </div>

          <div className="p-3 rounded-2xl border flex items-center gap-3" style={{ backgroundColor: T.surfaceAlt, borderColor: T.border }}>
            <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: "rgba(245, 158, 11, 0.15)", color: "#fbbf24" }}>
              <Edit3 size={18} />
            </div>
            <div className="min-w-0">
              <div className="text-lg font-black leading-none" style={{ color: T.ink }}>{stats.resenhas}</div>
              <div className="text-[11px] font-medium truncate mt-0.5" style={{ color: T.inkSoft }}>Resenhas escritas</div>
            </div>
          </div>
        </div>
      </div>

      {/* Barra de Filtros, Categorias e Pesquisa */}
      <div className="space-y-3">
        {/* Campo de Pesquisa e Botões de Status */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 opacity-50" style={{ color: T.inkSoft }} />
            <input
              type="text"
              placeholder="Buscar por título, autor, resenha ou citação..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl border text-sm font-medium outline-none transition-all placeholder:text-slate-500"
              style={{
                backgroundColor: T.surface,
                borderColor: T.border,
                color: T.ink
              }}
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-white"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Toggle de Favoritos */}
          <button
            type="button"
            onClick={() => {
              sfx.pop();
              setOnlyFavorites(!onlyFavorites);
            }}
            className={`px-3.5 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-2 border transition-all cursor-pointer ${
              onlyFavorites ? "bg-rose-500/20 border-rose-500/50 text-rose-400" : "opacity-80 hover:opacity-100"
            }`}
            style={{
              backgroundColor: onlyFavorites ? undefined : T.surface,
              borderColor: onlyFavorites ? undefined : T.border,
              color: onlyFavorites ? undefined : T.inkSoft
            }}
          >
            <Heart size={15} className={onlyFavorites ? "fill-rose-500 text-rose-500" : ""} />
            <span>Apenas Favoritos</span>
          </button>
        </div>

        {/* Pílulas de Formatos / Tipos de Mídia */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 custom-scrollbar">
          <button
            type="button"
            onClick={() => { sfx.pop(); setSelectedType("all"); }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer border ${
              selectedType === "all" ? "shadow-sm" : "opacity-70 hover:opacity-100"
            }`}
            style={{
              backgroundColor: selectedType === "all" ? TINT.brand : T.surface,
              color: selectedType === "all" ? T.brand : T.inkSoft,
              borderColor: selectedType === "all" ? `${T.brand}40` : T.border
            }}
          >
            Todos os Formatos
          </button>
          {MEDIA_TYPES.map((type) => {
            const Icon = type.icon;
            const isSel = selectedType === type.id;
            return (
              <button
                key={type.id}
                type="button"
                onClick={() => { sfx.pop(); setSelectedType(type.id); }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 flex items-center gap-1.5 transition-all cursor-pointer border ${
                  isSel ? "shadow-sm" : "opacity-70 hover:opacity-100"
                }`}
                style={{
                  backgroundColor: isSel ? `${type.color}25` : T.surface,
                  color: isSel ? type.color : T.inkSoft,
                  borderColor: isSel ? `${type.color}60` : T.border
                }}
              >
                <Icon size={14} />
                <span>{type.label}</span>
              </button>
            );
          })}
        </div>

        {/* Pílulas de Status */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 custom-scrollbar">
          <button
            type="button"
            onClick={() => { sfx.pop(); setSelectedStatus("all"); }}
            className={`px-3 py-1 rounded-lg text-xs font-semibold shrink-0 transition-all cursor-pointer border ${
              selectedStatus === "all" ? "brightness-110 font-bold" : "opacity-60 hover:opacity-90"
            }`}
            style={{
              backgroundColor: selectedStatus === "all" ? T.surfaceAlt : "transparent",
              color: selectedStatus === "all" ? T.ink : T.inkSoft,
              borderColor: selectedStatus === "all" ? T.border : "transparent"
            }}
          >
            Todos os Status
          </button>
          {MEDIA_STATUS.map((st) => {
            const isSel = selectedStatus === st.id;
            return (
              <button
                key={st.id}
                type="button"
                onClick={() => { sfx.pop(); setSelectedStatus(st.id); }}
                className={`px-3 py-1 rounded-lg text-xs font-semibold shrink-0 transition-all cursor-pointer border ${
                  isSel ? "brightness-110 font-bold" : "opacity-60 hover:opacity-90"
                }`}
                style={{
                  backgroundColor: isSel ? st.bg : "transparent",
                  color: isSel ? st.text : T.inkSoft,
                  borderColor: isSel ? st.border : "transparent"
                }}
              >
                {st.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Grid de Mídias / Estante */}
      {filteredItems.length === 0 ? (
        <div
          className="p-12 text-center rounded-3xl border flex flex-col items-center justify-center gap-3"
          style={{ backgroundColor: T.surface, borderColor: T.border }}
        >
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ backgroundColor: `${T.brand}15`, color: T.brand }}>
            <Library size={28} />
          </div>
          <div className="text-base font-bold" style={{ color: T.ink }}>
            {search || selectedType !== "all" || selectedStatus !== "all" || onlyFavorites
              ? "Nenhuma obra encontrada para estes filtros"
              : "Sua estante ainda está vazia"}
          </div>
          <p className="text-xs max-w-sm opacity-70" style={{ color: T.inkSoft }}>
            {search || selectedType !== "all" || selectedStatus !== "all" || onlyFavorites
              ? "Tente ajustar a busca ou limpar os filtros de formato e status."
              : "Adicione seu primeiro livro, filme ou série para acompanhar seu progresso e escrever resenhas."}
          </p>
          <button
            type="button"
            onClick={() => handleCreateNew("livro")}
            className="mt-2 px-4 py-2 rounded-xl text-xs font-bold shadow-md cursor-pointer flex items-center gap-1.5"
            style={{ backgroundColor: T.brand, color: "#fff" }}
          >
            <Plus size={15} /> Cadastrar Obra Agora
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredItems.map((item) => {
            const typeConfig = MEDIA_TYPES.find(t => t.tipo === item.tipo) || MEDIA_TYPES.find(t => t.id === item.tipo) || MEDIA_TYPES[0];
            const statusConfig = MEDIA_STATUS.find(s => s.id === item.status) || MEDIA_STATUS[0];
            const Icon = typeConfig.icon;
            const progressPct = item.progressoTotal > 0
              ? Math.min(100, Math.round((item.progressoAtual / item.progressoTotal) * 100))
              : 0;

            return (
              <div
                key={item.id}
                onClick={() => handleEdit(item)}
                className="group rounded-3xl border p-3.5 flex flex-col justify-between transition-all duration-200 hover:shadow-xl hover:scale-[1.01] active:scale-[0.99] cursor-pointer relative overflow-hidden"
                style={{
                  backgroundColor: T.surface,
                  borderColor: T.border,
                }}
              >
                {/* Linha Superior: Imagem/Capa + Badges */}
                <div className="space-y-3">
                  <div className="relative aspect-[3/4] w-full rounded-2xl overflow-hidden shadow-inner border" style={{ borderColor: `${T.border}60`, backgroundColor: T.surfaceAlt }}>
                    {item.capaUrl ? (
                      <img
                        src={item.capaUrl}
                        alt={item.titulo}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        loading="lazy"
                        onError={(e) => {
                          e.target.style.display = "none";
                          if (e.target.nextSibling) e.target.nextSibling.style.display = "flex";
                        }}
                      />
                    ) : null}

                    {/* Fallback de Capa Elegante */}
                    <div
                      className={`w-full h-full flex flex-col items-center justify-center p-4 text-center ${item.capaUrl ? "hidden" : "flex"}`}
                      style={{ background: `linear-gradient(135deg, ${typeConfig.color}25, ${T.surfaceAlt})` }}
                    >
                      <Icon size={32} style={{ color: typeConfig.color }} className="mb-2 opacity-80" />
                      <div className="text-xs font-bold line-clamp-3" style={{ color: T.ink }}>{item.titulo}</div>
                      {item.autorCriador && (
                        <div className="text-[10px] opacity-70 truncate mt-1" style={{ color: T.inkSoft }}>{item.autorCriador}</div>
                      )}
                    </div>

                    {/* Botão de Favorito no Canto Superior */}
                    <button
                      type="button"
                      onClick={(e) => handleToggleFavorite(e, item)}
                      className="absolute top-2.5 right-2.5 p-2 rounded-full bg-slate-900/70 backdrop-blur-md transition-transform hover:scale-110 active:scale-90"
                      title={item.favorito ? "Remover dos favoritos" : "Marcar como favorito"}
                    >
                      <Heart
                        size={15}
                        className={item.favorito ? "fill-rose-500 text-rose-500 animate-in zoom-in-75 duration-150" : "text-white/80 hover:text-white"}
                      />
                    </button>

                    {/* Badge do Formato */}
                    <div
                      className="absolute top-2.5 left-2.5 px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider backdrop-blur-md flex items-center gap-1 shadow-sm"
                      style={{ backgroundColor: `${typeConfig.color}E6`, color: "#fff" }}
                    >
                      <Icon size={12} />
                      <span>{typeConfig.label}</span>
                    </div>

                    {/* Badge do Status na Base da Capa */}
                    <div
                      className="absolute bottom-2.5 left-2.5 px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wide backdrop-blur-md border shadow-sm"
                      style={{
                        backgroundColor: statusConfig.bg,
                        color: statusConfig.text,
                        borderColor: statusConfig.border
                      }}
                    >
                      {statusConfig.label}
                    </div>
                  </div>

                  {/* Informações Textuais */}
                  <div className="space-y-1">
                    <h3 className="text-sm font-bold truncate leading-tight" style={{ color: T.ink }} title={item.titulo}>
                      {item.titulo}
                    </h3>
                    {item.autorCriador && (
                      <p className="text-xs truncate opacity-75" style={{ color: T.inkSoft }}>
                        {item.autorCriador}
                      </p>
                    )}
                  </div>

                  {/* Avaliação em Estrelas */}
                  {item.nota > 0 && (
                    <div className="flex items-center gap-0.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          size={13}
                          className={star <= item.nota ? "fill-amber-400 text-amber-400" : "text-slate-600/40"}
                        />
                      ))}
                      <span className="text-[11px] font-bold ml-1.5 opacity-80" style={{ color: T.inkSoft }}>
                        {item.nota}/5
                      </span>
                    </div>
                  )}

                  {/* Trecho de Citação ou Resenha */}
                  {item.resenha?.citacoesFavoritas?.[0] ? (
                    <div className="p-2 rounded-xl border text-[11px] italic line-clamp-2" style={{ backgroundColor: T.surfaceAlt, borderColor: `${T.border}70`, color: T.inkSoft }}>
                      "{item.resenha.citacoesFavoritas[0]}"
                    </div>
                  ) : item.resenha?.textoLivre ? (
                    <p className="text-[11px] line-clamp-2 opacity-70" style={{ color: T.inkSoft }}>
                      {item.resenha.textoLivre}
                    </p>
                  ) : null}
                </div>

                {/* Linha Inferior: Barra de Progresso + Controles Rápidos */}
                <div className="mt-4 pt-3 border-t space-y-2" style={{ borderColor: `${T.border}60` }}>
                  <div className="flex items-center justify-between text-[11px] font-semibold" style={{ color: T.inkSoft }}>
                    <span>Progresso ({progressPct}%)</span>
                    <span>
                      {item.progressoAtual} / {item.progressoTotal} {typeConfig.unit}
                    </span>
                  </div>

                  {/* Barra de Progresso Visual */}
                  <div className="w-full h-2 rounded-full overflow-hidden" style={{ backgroundColor: `${T.brand}18` }}>
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{
                        width: `${progressPct}%`,
                        backgroundColor: progressPct >= 100 ? "#10b981" : T.brand
                      }}
                    />
                  </div>

                  {/* Ajustes Rápidos (+1 / -1) */}
                  <div className="flex items-center justify-between pt-1">
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={(e) => handleQuickProgress(e, item, -1)}
                        className="px-2 py-0.5 rounded-md border text-[11px] font-bold hover:bg-white/10 active:scale-95 transition-all"
                        style={{ color: T.inkSoft, borderColor: T.border }}
                        title="Diminuir 1"
                      >
                        -1
                      </button>
                      <button
                        type="button"
                        onClick={(e) => handleQuickProgress(e, item, 1)}
                        className="px-2 py-0.5 rounded-md border text-[11px] font-bold hover:bg-white/10 active:scale-95 transition-all"
                        style={{ color: T.inkSoft, borderColor: T.border }}
                        title="Avançar 1"
                      >
                        +1
                      </button>
                      {item.tipo === "livro" && (
                        <button
                          type="button"
                          onClick={(e) => handleQuickProgress(e, item, 10)}
                          className="px-2 py-0.5 rounded-md border text-[11px] font-bold hover:bg-white/10 active:scale-95 transition-all"
                          style={{ color: T.inkSoft, borderColor: T.border }}
                          title="Avançar 10 páginas"
                        >
                          +10
                        </button>
                      )}
                    </div>

                    <span className="text-[11px] font-bold text-brand group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
                      Editar <ChevronRight size={12} />
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal de Criação / Edição de Mídia */}
      {isModalOpen && editingItem && (
        <MediaFormModal
          item={editingItem}
          onClose={() => {
            setIsModalOpen(false);
            setEditingItem(null);
          }}
          onSave={async (saved) => {
            await onSaveMedia(saved);
            setIsModalOpen(false);
            setEditingItem(null);
          }}
          onDelete={async (id) => {
            if (window.confirm("Deseja realmente excluir permanentemente esta obra da sua estante?")) {
              await onDeleteMedia(id);
              setIsModalOpen(false);
              setEditingItem(null);
            }
          }}
          onOpenKinborForMedia={(media) => {
            setIsModalOpen(false);
            setEditingItem(null);
            setKinborTargetMedia(media);
            setIsKinborOpen(true);
          }}
        />
      )}

      {/* Caderno Estético Kinbor */}
      {isKinborOpen && (
        <KinborJournalModal
          userId={userId}
          isOpen={isKinborOpen}
          onClose={() => setIsKinborOpen(false)}
          initialMedia={kinborTargetMedia}
          allMedia={mediaItems}
        />
      )}

      {/* Desafios & Sharelists Modal */}
      {isChallengesOpen && (
        <MediaChallengesModal
          isOpen={isChallengesOpen}
          onClose={() => setIsChallengesOpen(false)}
          mediaItems={mediaItems}
        />
      )}

      {/* Clube do Livro & Social Modal */}
      {isBookClubOpen && (
        <BookClubModal
          isOpen={isBookClubOpen}
          onClose={() => setIsBookClubOpen(false)}
          userId={userId}
          mediaItems={mediaItems}
        />
      )}
    </div>
  );
}

/* ========================================================================== */
/* Modal de Edição / Criação com Busca Google Books & Oficina de Escrita       */
/* ========================================================================== */
function MediaFormModal({ item, onClose, onSave, onDelete, onOpenKinborForMedia }) {
  const [activeTab, setActiveTab] = useState("dados"); // 'dados' | 'escrita'
  const [formData, setFormData] = useState({ ...item });
  const [googleSearchQuery, setGoogleSearchQuery] = useState("");
  const [isSearchingGoogle, setIsSearchingGoogle] = useState(false);
  const [googleResults, setGoogleResults] = useState([]);
  const [newCitation, setNewCitation] = useState("");

  // Busca integrada no Google Books API
  const handleSearchGoogleBooks = async () => {
    if (!googleSearchQuery.trim()) return;
    setIsSearchingGoogle(true);
    sfx.pop();
    try {
      const resp = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(googleSearchQuery)}&maxResults=5`);
      if (resp.ok) {
        const data = await resp.json();
        setGoogleResults(data.items || []);
      }
    } catch (err) {
      console.warn("Erro ao buscar no Google Books:", err);
    } finally {
      setIsSearchingGoogle(false);
    }
  };

  const handleSelectGoogleBook = (b) => {
    sfx.pop();
    const info = b.volumeInfo || {};
    const cover = info.imageLinks?.thumbnail || info.imageLinks?.smallThumbnail || "";
    // Google Books costuma vir com http, forçar https
    const secureCover = cover.replace(/^http:\/\//i, "https://");

    setFormData(prev => ({
      ...prev,
      titulo: info.title || prev.titulo,
      subtitulo: info.subtitle || prev.subtitulo,
      autorCriador: info.authors ? info.authors.join(", ") : prev.autorCriador,
      capaUrl: secureCover || prev.capaUrl,
      progressoTotal: info.pageCount || prev.progressoTotal || 100,
      tipo: "livro",
      generos: info.categories || prev.generos,
    }));
    setGoogleResults([]);
    setGoogleSearchQuery("");
  };

  const handleAddCitation = () => {
    if (!newCitation.trim()) return;
    sfx.pop();
    const current = formData.resenha?.citacoesFavoritas || [];
    setFormData(prev => ({
      ...prev,
      resenha: {
        ...prev.resenha,
        citacoesFavoritas: [...current, newCitation.trim()]
      }
    }));
    setNewCitation("");
  };

  const handleRemoveCitation = (index) => {
    sfx.pop();
    const current = formData.resenha?.citacoesFavoritas || [];
    setFormData(prev => ({
      ...prev,
      resenha: {
        ...prev.resenha,
        citacoesFavoritas: current.filter((_, i) => i !== index)
      }
    }));
  };

  // Contagem de palavras da resenha
  const wordCount = useMemo(() => {
    const text = formData.resenha?.textoLivre || "";
    return text.trim() ? text.trim().split(/\s+/).length : 0;
  }, [formData.resenha?.textoLivre]);

  const typeConfig = MEDIA_TYPES.find(t => t.id === formData.tipo) || MEDIA_TYPES[0];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5"
      style={{ backgroundColor: "rgba(0,0,0,0.65)", backdropFilter: "blur(6px)" }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl max-h-[92vh] rounded-3xl border shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        style={{ backgroundColor: T.surface, borderColor: T.border }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header do Modal */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b" style={{ borderColor: T.border }}>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${typeConfig.color}20`, color: typeConfig.color }}>
              <typeConfig.icon size={18} />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold leading-tight" style={{ color: T.ink }}>
                {formData.id ? "Editar Obra" : "Nova Obra na Estante"}
              </h2>
              <p className="text-[11px] opacity-70" style={{ color: T.inkSoft }}>
                Preencha os dados e registre suas impressões.
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

        {/* Abas Internas: Dados vs. Oficina de Escrita */}
        <div className="flex items-center border-b px-4 sm:px-5 gap-2" style={{ borderColor: T.border, backgroundColor: T.surfaceAlt }}>
          <button
            type="button"
            onClick={() => { sfx.tab(); setActiveTab("dados"); }}
            className={`py-3 px-3 text-xs font-bold border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === "dados" ? "border-brand text-brand" : "border-transparent opacity-70 hover:opacity-100"
            }`}
            style={{ color: activeTab === "dados" ? T.brand : T.inkSoft }}
          >
            <BookOpen size={14} />
            <span>Informações da Obra</span>
          </button>

          <button
            type="button"
            onClick={() => { sfx.tab(); setActiveTab("escrita"); }}
            className={`py-3 px-3 text-xs font-bold border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === "escrita" ? "border-brand text-brand" : "border-transparent opacity-70 hover:opacity-100"
            }`}
            style={{ color: activeTab === "escrita" ? T.brand : T.inkSoft }}
          >
            <Edit3 size={14} />
            <span>Oficina de Escrita & Resenha</span>
            {wordCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-brand/20 text-brand">
                {wordCount} pal.
              </span>
            )}
          </button>
        </div>

        {/* Corpo do Formulário com Rolagem */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 sm:p-6 space-y-4">
          {activeTab === "dados" && (
            <div className="space-y-4">
              {/* Busca Automática no Google Books (para agilizar o cadastro de livros) */}
              <div className="p-3.5 rounded-2xl border" style={{ backgroundColor: T.surfaceAlt, borderColor: `${T.border}` }}>
                <label className="text-xs font-bold flex items-center justify-between mb-2" style={{ color: T.ink }}>
                  <span className="flex items-center gap-1.5">
                    <Sparkles size={14} className="text-amber-400" /> Auto-completar pelo Google Books
                  </span>
                  <span className="text-[10px] font-normal opacity-70" style={{ color: T.inkSoft }}>Grátis & Opcional</span>
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Digite o título do livro (ex: Duna, O Hobbit, 1984)..."
                    value={googleSearchQuery}
                    onChange={(e) => setGoogleSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSearchGoogleBooks()}
                    className="flex-1 px-3 py-2 rounded-xl text-xs font-medium border outline-none"
                    style={{ backgroundColor: T.surface, borderColor: T.border, color: T.ink }}
                  />
                  <button
                    type="button"
                    onClick={handleSearchGoogleBooks}
                    disabled={isSearchingGoogle}
                    className="px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 bg-brand text-white shadow-sm hover:brightness-110 active:scale-95 disabled:opacity-50"
                  >
                    {isSearchingGoogle ? <Loader2 size={13} className="animate-spin" /> : <Search size={13} />}
                    <span>Buscar</span>
                  </button>
                </div>

                {/* Resultados da Busca */}
                {googleResults.length > 0 && (
                  <div className="mt-3 space-y-1.5 max-h-48 overflow-y-auto custom-scrollbar">
                    <div className="text-[10px] uppercase font-bold tracking-wider opacity-70" style={{ color: T.inkSoft }}>
                      Selecione para preencher:
                    </div>
                    {googleResults.map((b) => {
                      const vInfo = b.volumeInfo || {};
                      const thumb = vInfo.imageLinks?.thumbnail || vInfo.imageLinks?.smallThumbnail;
                      return (
                        <div
                          key={b.id}
                          onClick={() => handleSelectGoogleBook(b)}
                          className="flex items-center gap-3 p-2 rounded-xl border hover:bg-white/5 cursor-pointer transition-colors"
                          style={{ borderColor: T.border, backgroundColor: T.surface }}
                        >
                          {thumb ? (
                            <img src={thumb} alt="" className="w-8 h-11 object-cover rounded shadow-sm shrink-0" />
                          ) : (
                            <div className="w-8 h-11 rounded bg-slate-700/50 flex items-center justify-center shrink-0">
                              <BookOpen size={14} className="opacity-50" />
                            </div>
                          )}
                          <div className="min-w-0 flex-1">
                            <div className="text-xs font-bold truncate" style={{ color: T.ink }}>{vInfo.title}</div>
                            <div className="text-[10px] opacity-70 truncate" style={{ color: T.inkSoft }}>
                              {vInfo.authors?.join(", ") || "Autor não informado"} • {vInfo.pageCount ? `${vInfo.pageCount} págs` : "Págs n/d"}
                            </div>
                          </div>
                          <span className="text-[10px] font-bold text-brand px-2 py-1 rounded bg-brand/10">Usar</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Formato / Tipo */}
              <div>
                <label className="text-xs font-bold block mb-1.5" style={{ color: T.ink }}>Formato da Mídia</label>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  {MEDIA_TYPES.map((t) => {
                    const isSel = formData.tipo === t.id;
                    const TIcon = t.icon;
                    return (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => { sfx.pop(); setFormData(prev => ({ ...prev, tipo: t.id })); }}
                        className={`p-2 rounded-xl border flex flex-col items-center justify-center gap-1 text-xs font-bold transition-all cursor-pointer ${
                          isSel ? "shadow-sm scale-[1.02]" : "opacity-70 hover:opacity-100"
                        }`}
                        style={{
                          backgroundColor: isSel ? `${t.color}25` : T.surfaceAlt,
                          borderColor: isSel ? `${t.color}80` : T.border,
                          color: isSel ? t.color : T.inkSoft
                        }}
                      >
                        <TIcon size={16} />
                        <span>{t.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Título e Subtítulo */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold block mb-1" style={{ color: T.ink }}>Título *</label>
                  <input
                    type="text"
                    required
                    placeholder="Nome da obra..."
                    value={formData.titulo}
                    onChange={(e) => setFormData(prev => ({ ...prev, titulo: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl text-xs font-semibold border outline-none"
                    style={{ backgroundColor: T.surfaceAlt, borderColor: T.border, color: T.ink }}
                  />
                </div>
                <div>
                  <label className="text-xs font-bold block mb-1" style={{ color: T.ink }}>Autor / Criador / Diretor</label>
                  <input
                    type="text"
                    placeholder="Quem produziu ou escreveu..."
                    value={formData.autorCriador}
                    onChange={(e) => setFormData(prev => ({ ...prev, autorCriador: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl text-xs font-semibold border outline-none"
                    style={{ backgroundColor: T.surfaceAlt, borderColor: T.border, color: T.ink }}
                  />
                </div>
              </div>

              {/* URL da Capa */}
              <div>
                <label className="text-xs font-bold block mb-1" style={{ color: T.ink }}>URL da Capa / Imagem</label>
                <div className="flex items-center gap-2">
                  <input
                    type="url"
                    placeholder="https://exemplo.com/capa.jpg"
                    value={formData.capaUrl}
                    onChange={(e) => setFormData(prev => ({ ...prev, capaUrl: e.target.value }))}
                    className="flex-1 px-3 py-2 rounded-xl text-xs font-medium border outline-none"
                    style={{ backgroundColor: T.surfaceAlt, borderColor: T.border, color: T.ink }}
                  />
                  {formData.capaUrl && (
                    <img src={formData.capaUrl} alt="Preview" className="w-8 h-10 object-cover rounded shadow-sm border" style={{ borderColor: T.border }} />
                  )}
                </div>
              </div>

              {/* Status e Avaliação (Estrelas) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold block mb-1" style={{ color: T.ink }}>Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl text-xs font-semibold border outline-none cursor-pointer"
                    style={{ backgroundColor: T.surfaceAlt, borderColor: T.border, color: T.ink }}
                  >
                    {MEDIA_STATUS.map(st => (
                      <option key={st.id} value={st.id} style={{ backgroundColor: T.surface, color: T.ink }}>
                        {st.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold block mb-1" style={{ color: T.ink }}>Avaliação (Nota)</label>
                  <div className="flex items-center gap-1.5 pt-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => { sfx.pop(); setFormData(prev => ({ ...prev, nota: star })); }}
                        className="p-1 transition-transform hover:scale-125"
                      >
                        <Star
                          size={18}
                          className={star <= (formData.nota || 0) ? "fill-amber-400 text-amber-400" : "text-slate-600/50"}
                        />
                      </button>
                    ))}
                    <span className="text-xs font-bold ml-2" style={{ color: T.ink }}>
                      {formData.nota ? `${formData.nota} / 5` : "Sem nota"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Progresso Atual e Total */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold block mb-1" style={{ color: T.ink }}>
                    Progresso Atual ({typeConfig.unit})
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.progressoAtual}
                    onChange={(e) => setFormData(prev => ({ ...prev, progressoAtual: Math.max(0, parseInt(e.target.value, 10) || 0) }))}
                    className="w-full px-3 py-2 rounded-xl text-xs font-semibold border outline-none"
                    style={{ backgroundColor: T.surfaceAlt, borderColor: T.border, color: T.ink }}
                  />
                </div>

                <div>
                  <label className="text-xs font-bold block mb-1" style={{ color: T.ink }}>
                    Total ({typeConfig.unit})
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.progressoTotal}
                    onChange={(e) => setFormData(prev => ({ ...prev, progressoTotal: Math.max(1, parseInt(e.target.value, 10) || 1) }))}
                    className="w-full px-3 py-2 rounded-xl text-xs font-semibold border outline-none"
                    style={{ backgroundColor: T.surfaceAlt, borderColor: T.border, color: T.ink }}
                  />
                </div>
              </div>

              {/* Favorito Checkbox */}
              <div className="pt-1">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={formData.favorito}
                    onChange={(e) => setFormData(prev => ({ ...prev, favorito: e.target.checked }))}
                    className="w-4 h-4 rounded text-rose-500 focus:ring-0 cursor-pointer"
                  />
                  <span className="text-xs font-bold flex items-center gap-1.5" style={{ color: T.ink }}>
                    <Heart size={14} className={formData.favorito ? "fill-rose-500 text-rose-500" : ""} />
                    Marcar como Obra Favorita da Vida
                  </span>
                </label>
              </div>
            </div>
          )}

          {activeTab === "escrita" && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-2xl border" style={{ backgroundColor: `${T.brand}10`, borderColor: `${T.brand}30` }}>
                <div className="flex items-center gap-2 text-xs font-bold text-brand">
                  <Edit3 size={15} /> Exercício do Hábito de Escrita (by Lulu)
                </div>
                <p className="text-[11px] opacity-80 mt-1" style={{ color: T.inkSoft }}>
                  Escreva com suas próprias palavras: o que a história fez você sentir? Que ideias ou questionamentos ficaram na sua mente?
                </p>
              </div>

              {/* Resenha / Texto Livre */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold" style={{ color: T.ink }}>Minha Resenha & Reflexões</label>
                  <span className="text-[11px] font-mono opacity-70" style={{ color: T.inkSoft }}>
                    {wordCount} palavras • {(formData.resenha?.textoLivre || "").length} caracteres
                  </span>
                </div>
                <textarea
                  rows={8}
                  placeholder="Escreva livremente sua resenha ou ensaio sobre a obra..."
                  value={formData.resenha?.textoLivre || ""}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    resenha: { ...prev.resenha, textoLivre: e.target.value }
                  }))}
                  className="w-full p-3.5 rounded-2xl text-xs font-medium border outline-none leading-relaxed custom-scrollbar"
                  style={{ backgroundColor: T.surfaceAlt, borderColor: T.border, color: T.ink }}
                />
              </div>

              {/* Citações Marcantes */}
              <div>
                <label className="text-xs font-bold block mb-1.5" style={{ color: T.ink }}>
                  Frases & Citações Marcantes
                </label>
                <div className="flex items-center gap-2 mb-2">
                  <input
                    type="text"
                    placeholder="Adicione um trecho ou fala que tocou você..."
                    value={newCitation}
                    onChange={(e) => setNewCitation(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleAddCitation()}
                    className="flex-1 px-3 py-2 rounded-xl text-xs font-medium border outline-none"
                    style={{ backgroundColor: T.surfaceAlt, borderColor: T.border, color: T.ink }}
                  />
                  <button
                    type="button"
                    onClick={handleAddCitation}
                    className="px-3.5 py-2 rounded-xl text-xs font-bold bg-brand text-white shadow-sm hover:brightness-110 active:scale-95"
                  >
                    Adicionar
                  </button>
                </div>

                {/* Lista de Citações */}
                {formData.resenha?.citacoesFavoritas?.length > 0 && (
                  <div className="space-y-1.5">
                    {formData.resenha.citacoesFavoritas.map((cit, idx) => (
                      <div
                        key={idx}
                        className="flex items-start justify-between gap-2 p-2.5 rounded-xl border text-xs italic"
                        style={{ backgroundColor: T.surfaceAlt, borderColor: T.border, color: T.ink }}
                      >
                        <div className="flex items-start gap-2 min-w-0">
                          <Quote size={13} className="shrink-0 text-brand mt-0.5 opacity-80" />
                          <span className="leading-relaxed">"{cit}"</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveCitation(idx)}
                          className="text-slate-400 hover:text-rose-400 p-1 shrink-0"
                          title="Remover citação"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Rodapé / Ações */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-t" style={{ borderColor: T.border, backgroundColor: T.surfaceAlt }}>
          {formData.id ? (
            <button
              type="button"
              onClick={() => onDelete(formData.id)}
              className="px-3 py-2 rounded-xl text-xs font-bold text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/30 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Trash2 size={14} /> Excluir Obra
            </button>
          ) : <div />}

          <div className="flex items-center gap-2">
            {formData.titulo && onOpenKinborForMedia && (
              <button
                type="button"
                onClick={() => {
                  sfx.tab();
                  onOpenKinborForMedia(formData);
                }}
                className="px-3 py-2 rounded-xl text-xs font-bold border border-amber-500/40 bg-amber-500/10 text-amber-300 hover:bg-amber-500/20 transition-all flex items-center gap-1.5 cursor-pointer"
                title="Decorar esta obra no caderno Kinbor"
              >
                <Sparkles size={14} className="text-amber-400" />
                <span className="hidden sm:inline">Colagem Kinbor</span>
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold border hover:bg-white/5 transition-all cursor-pointer"
              style={{ color: T.inkSoft, borderColor: T.border }}
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={() => {
                if (!formData.titulo.trim()) {
                  alert("Por favor, preencha o título da obra.");
                  return;
                }
                sfx.pop();
                onSave(formData);
              }}
              className="px-5 py-2 rounded-xl text-xs font-bold bg-brand text-white shadow-lg hover:brightness-110 active:scale-95 transition-all cursor-pointer"
            >
              Salvar na Estante
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
