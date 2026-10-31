import React, { useState, useEffect, useMemo } from "react";
import {
  X, Users, BookOpen, MessageCircle, Send, Heart, Star, Sparkles,
  Share2, Plus, Check, AlertCircle, Eye, EyeOff, Calendar, UserPlus,
  ArrowRight, Bookmark, Compass
} from "lucide-react";
import { T, TINT } from "./ui";
import { sfx } from "../lib/soundEffects";
import { formatDateBR } from "../lib/utils";

export function BookClubModal({
  isOpen,
  onClose,
  userId,
  mediaItems = [],
  onRecommendMedia,
}) {
  const [activeTab, setActiveTab] = useState("clubes"); // 'clubes' | 'amigos' | 'indicacoes'
  const [clubs, setClubs] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(`omnia_book_clubs_${userId || "guest"}`) || "null");
      if (Array.isArray(saved) && saved.length > 0) return saved;
    } catch (e) {}

    // Clube padrão da comunidade inicial
    return [
      {
        id: "clube_omnia_oficial",
        nome: "Clube do Livro Omnia",
        descricao: "Espaço de leituras mensais, reflexões profundas e amizade literária.",
        livroAtual: {
          titulo: "A Metamorfose",
          autor: "Franz Kafka",
          capaUrl: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=300",
          metaAtual: "Capítulos 1 e 2",
          prazo: "2026-11-15",
          totalCapitulos: 3,
        },
        membros: [
          { id: "1", nome: "Lulu (Curadora)", avatar: "🌸", lendo: "Capítulo 2" },
          { id: "2", nome: "Você", avatar: "✨", lendo: "Iniciando" },
          { id: "3", nome: "Ana Clara", avatar: "📚", lendo: "Capítulo 2" },
        ],
        discussao: [
          {
            id: "msg_1",
            autor: "Lulu",
            avatar: "🌸",
            meta: "Capítulo 1",
            texto: "A sensação de acordar transformado é uma metáfora tão forte sobre a sobrecarga da rotina moderna! O que acharam da reação da família?",
            isSpoiler: false,
            data: "Hoje às 14:20"
          },
          {
            id: "msg_2",
            autor: "Ana Clara",
            avatar: "📚",
            meta: "Capítulo 2",
            texto: "A parte da maçã no capítulo 2 me partiu o coração. Revela muito sobre como as pessoas tratam quem não consegue mais produzir.",
            isSpoiler: true,
            data: "Hoje às 15:45"
          }
        ]
      }
    ];
  });

  const [friends, setFriends] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(`omnia_friends_${userId || "guest"}`) || "null");
      if (Array.isArray(saved) && saved.length > 0) return saved;
    } catch (e) {}
    return [
      { id: "f_1", nome: "Lulu", avatar: "🌸", lendoAgora: "Cem Anos de Solidão", progresso: "Pág 180 / 448" },
      { id: "f_2", nome: "Beatriz", avatar: "🌿", lendoAgora: "Duna", progresso: "Pág 310 / 680" },
      { id: "f_3", nome: "Gabriel", avatar: "☕", lendoAgora: "O Hobbit", progresso: "Pág 95 / 310" },
    ];
  });

  const [recommendations, setRecommendations] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(`omnia_recommendations_${userId || "guest"}`) || "null");
      if (Array.isArray(saved) && saved.length > 0) return saved;
    } catch (e) {}
    return [
      {
        id: "rec_1",
        de: "Lulu",
        avatar: "🌸",
        obra: "O Pequeno Príncipe",
        autor: "Antoine de Saint-Exupéry",
        capaUrl: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=300",
        mensagem: "Lembrei muito de você quando reli este trecho sobre o essencial ser invisível aos olhos!",
        data: "Ontem"
      }
    ];
  });

  const [selectedClubId, setSelectedClubId] = useState(clubs[0]?.id || null);
  const [newDiscussionText, setNewDiscussionText] = useState("");
  const [isSpoilerMarked, setIsSpoilerMarked] = useState(false);
  const [revealedSpoilers, setRevealedSpoilers] = useState(new Set());
  const [newFriendEmail, setNewFriendEmail] = useState("");

  const activeClub = useMemo(() => {
    return clubs.find(c => c.id === selectedClubId) || clubs[0];
  }, [clubs, selectedClubId]);

  // Salvar no LocalStorage ao alterar
  useEffect(() => {
    try {
      localStorage.setItem(`omnia_book_clubs_${userId || "guest"}`, JSON.stringify(clubs));
    } catch (e) {}
  }, [clubs, userId]);

  useEffect(() => {
    try {
      localStorage.setItem(`omnia_friends_${userId || "guest"}`, JSON.stringify(friends));
    } catch (e) {}
  }, [friends, userId]);

  // Enviar mensagem no clube
  const handleSendMessage = () => {
    if (!newDiscussionText.trim() || !activeClub) return;
    sfx.pop();
    const newMsg = {
      id: `msg_${Date.now()}`,
      autor: "Você",
      avatar: "✨",
      meta: activeClub.livroAtual?.metaAtual || "Geral",
      texto: newDiscussionText.trim(),
      isSpoiler: isSpoilerMarked,
      data: "Agora mesmo"
    };

    const updatedClubs = clubs.map(c => {
      if (c.id === activeClub.id) {
        return {
          ...c,
          discussao: [...(c.discussao || []), newMsg]
        };
      }
      return c;
    });

    setClubs(updatedClubs);
    setNewDiscussionText("");
    setIsSpoilerMarked(false);
  };

  // Toggle spoiler reveal
  const toggleSpoiler = (msgId) => {
    sfx.pop();
    setRevealedSpoilers(prev => {
      const next = new Set(prev);
      if (next.has(msgId)) next.delete(msgId);
      else next.add(msgId);
      return next;
    });
  };

  // Adicionar Amigo
  const handleAddFriend = () => {
    if (!newFriendEmail.trim()) return;
    sfx.pop();
    const namePart = newFriendEmail.split("@")[0];
    const capitalized = namePart.charAt(0).toUpperCase() + namePart.slice(1);
    const newF = {
      id: `f_${Date.now()}`,
      nome: capitalized,
      avatar: "✨",
      lendoAgora: "Explorando a Estante",
      progresso: "Novo amigo"
    };
    setFriends(prev => [newF, ...prev]);
    setNewFriendEmail("");
    alert(`Amigo adicionado com sucesso! Agora você pode ver as leituras de ${capitalized}.`);
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
            <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-rose-500/20 text-rose-400">
              <Users size={18} />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold leading-tight" style={{ color: T.ink }}>
                Social & Clube do Livro
              </h2>
              <p className="text-[11px] opacity-70" style={{ color: T.inkSoft }}>
                Leituras compartilhadas, discussões sem spoiler e indicações de amigos.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Abas Internas */}
        <div className="flex items-center border-b px-4 sm:px-5 gap-2" style={{ borderColor: T.border, backgroundColor: T.surfaceAlt }}>
          <button
            type="button"
            onClick={() => { sfx.tab(); setActiveTab("clubes"); }}
            className={`py-3 px-3 text-xs font-bold border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === "clubes" ? "border-brand text-brand" : "border-transparent opacity-70 hover:opacity-100"
            }`}
            style={{ color: activeTab === "clubes" ? T.brand : T.inkSoft }}
          >
            <BookOpen size={14} />
            <span>Clube do Livro</span>
          </button>

          <button
            type="button"
            onClick={() => { sfx.tab(); setActiveTab("amigos"); }}
            className={`py-3 px-3 text-xs font-bold border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === "amigos" ? "border-brand text-brand" : "border-transparent opacity-70 hover:opacity-100"
            }`}
            style={{ color: activeTab === "amigos" ? T.brand : T.inkSoft }}
          >
            <Users size={14} />
            <span>Amigos ({friends.length})</span>
          </button>

          <button
            type="button"
            onClick={() => { sfx.tab(); setActiveTab("indicacoes"); }}
            className={`py-3 px-3 text-xs font-bold border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === "indicacoes" ? "border-brand text-brand" : "border-transparent opacity-70 hover:opacity-100"
            }`}
            style={{ color: activeTab === "indicacoes" ? T.brand : T.inkSoft }}
          >
            <Sparkles size={14} />
            <span>Indicações ({recommendations.length})</span>
          </button>
        </div>

        {/* Corpo do Modal com Rolagem */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 sm:p-6 space-y-4">
          {/* TAB 1: O Clube do Livro */}
          {activeTab === "clubes" && activeClub && (
            <div className="space-y-4">
              {/* Card da Leitura Coletiva Atual */}
              <div
                className="p-4 sm:p-5 rounded-3xl border shadow-lg relative overflow-hidden flex flex-col sm:flex-row items-center gap-4"
                style={{ backgroundColor: T.surfaceAlt, borderColor: T.border }}
              >
                {activeClub.livroAtual?.capaUrl && (
                  <img
                    src={activeClub.livroAtual.capaUrl}
                    alt=""
                    className="w-20 h-28 object-cover rounded-xl shadow-md shrink-0 border border-black/10"
                  />
                )}

                <div className="flex-1 space-y-1.5 text-center sm:text-left">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-500/20 text-amber-300">
                    <BookOpen size={11} /> Leitura Conjunta da Turma
                  </div>
                  <h3 className="text-base sm:text-lg font-black leading-tight" style={{ color: T.ink }}>
                    {activeClub.livroAtual?.titulo}
                  </h3>
                  <p className="text-xs opacity-75 font-medium" style={{ color: T.inkSoft }}>
                    {activeClub.livroAtual?.autor} • Meta Atual: <strong className="text-amber-400">{activeClub.livroAtual?.metaAtual}</strong>
                  </p>
                  {activeClub.livroAtual?.prazo && (
                    <div className="text-[11px] font-mono opacity-80 pt-1" style={{ color: T.inkSoft }}>
                      📅 Prazo para discussão: {formatDateBR(activeClub.livroAtual.prazo)}
                    </div>
                  )}
                </div>

                {/* Lista de Membros e Status */}
                <div className="border-t sm:border-t-0 sm:border-l pt-3 sm:pt-0 sm:pl-4 border-slate-700/60 flex sm:flex-col items-center sm:items-start gap-2 shrink-0">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Progresso do Clube:</span>
                  <div className="flex -space-x-1.5 overflow-hidden">
                    {activeClub.membros.map(m => (
                      <div
                        key={m.id}
                        className="w-7 h-7 rounded-full bg-slate-800 border-2 border-slate-900 flex items-center justify-center text-xs shadow-sm"
                        title={`${m.nome}: ${m.lendo}`}
                      >
                        {m.avatar}
                      </div>
                    ))}
                  </div>
                  <span className="text-[11px] font-semibold text-emerald-400">
                    {activeClub.membros.length} amigos lendo juntos
                  </span>
                </div>
              </div>

              {/* Mural de Discussões */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Mural de Discussão dos Capítulos:
                  </span>
                  <span className="text-[11px] text-amber-400/90 font-medium">
                    🛡️ Com proteção anti-spoiler
                  </span>
                </div>

                {/* Mensagens da Turma */}
                <div className="space-y-2.5 max-h-60 overflow-y-auto custom-scrollbar pr-1">
                  {activeClub.discussao?.map((msg) => {
                    const isRevealed = revealedSpoilers.has(msg.id);

                    return (
                      <div
                        key={msg.id}
                        className="p-3 rounded-2xl border transition-all"
                        style={{ backgroundColor: T.surfaceAlt, borderColor: T.border }}
                      >
                        <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-white/5">
                          <div className="flex items-center gap-2">
                            <span className="text-base">{msg.avatar}</span>
                            <span className="text-xs font-bold" style={{ color: T.ink }}>{msg.autor}</span>
                            <span className="text-[10px] px-2 py-0.2 rounded-md bg-white/5 font-mono text-slate-400">
                              {msg.meta}
                            </span>
                          </div>
                          <span className="text-[10px] opacity-60 text-slate-400">{msg.data}</span>
                        </div>

                        {/* Conteúdo com Proteção Anti-Spoiler */}
                        {msg.isSpoiler && !isRevealed ? (
                          <div
                            onClick={() => toggleSpoiler(msg.id)}
                            className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs font-semibold flex items-center justify-between cursor-pointer hover:bg-rose-500/15 transition-colors"
                          >
                            <span className="flex items-center gap-1.5">
                              <EyeOff size={14} /> Contém Spoiler deste capítulo! Clique para revelar.
                            </span>
                            <span className="text-[10px] underline uppercase font-bold">Ver</span>
                          </div>
                        ) : (
                          <div className="relative">
                            <p className="text-xs leading-relaxed" style={{ color: T.ink }}>
                              {msg.texto}
                            </p>
                            {msg.isSpoiler && (
                              <button
                                type="button"
                                onClick={() => toggleSpoiler(msg.id)}
                                className="mt-1 text-[10px] text-rose-400 hover:underline flex items-center gap-1 cursor-pointer"
                              >
                                <Eye size={12} /> Ocultar spoiler novamente
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Campo de Envio de Mensagem */}
                <div className="p-3 rounded-2xl border space-y-2" style={{ backgroundColor: T.surfaceAlt, borderColor: T.border }}>
                  <textarea
                    rows={2}
                    placeholder="Compartilhe o que você achou dos capítulos atuais..."
                    value={newDiscussionText}
                    onChange={(e) => setNewDiscussionText(e.target.value)}
                    className="w-full p-2.5 rounded-xl text-xs bg-slate-900 border border-slate-700 text-white outline-none custom-scrollbar"
                  />
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 cursor-pointer select-none text-xs">
                      <input
                        type="checkbox"
                        checked={isSpoilerMarked}
                        onChange={(e) => setIsSpoilerMarked(e.target.checked)}
                        className="rounded text-rose-500 focus:ring-0 cursor-pointer"
                      />
                      <span className={isSpoilerMarked ? "text-rose-400 font-bold" : "text-slate-400"}>
                        ⚠️ Marcar como Spoiler
                      </span>
                    </label>

                    <button
                      type="button"
                      onClick={handleSendMessage}
                      className="px-4 py-1.5 rounded-xl text-xs font-bold bg-brand text-white shadow-md hover:brightness-110 active:scale-95 flex items-center gap-1.5 cursor-pointer"
                    >
                      <Send size={13} /> Enviar
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Amigos e O que estão lendo */}
          {activeTab === "amigos" && (
            <div className="space-y-4">
              {/* Adicionar Amigo */}
              <div className="p-3.5 rounded-2xl border" style={{ backgroundColor: T.surfaceAlt, borderColor: T.border }}>
                <label className="text-xs font-bold block mb-1.5" style={{ color: T.ink }}>
                  Adicionar Amigo no Omnia
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="E-mail ou nome de usuário do seu amigo..."
                    value={newFriendEmail}
                    onChange={(e) => setNewFriendEmail(e.target.value)}
                    className="flex-1 px-3 py-2 rounded-xl text-xs bg-slate-900 border border-slate-700 text-white outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleAddFriend}
                    className="px-3.5 py-2 rounded-xl text-xs font-bold bg-brand text-white shadow-md hover:brightness-110 active:scale-95 flex items-center gap-1 cursor-pointer"
                  >
                    <UserPlus size={14} /> Conectar
                  </button>
                </div>
              </div>

              {/* Lista de Amigos e Leituras Atuais */}
              <div className="space-y-2">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-400 px-1">
                  Estante dos Amigos:
                </div>
                {friends.map((f) => (
                  <div
                    key={f.id}
                    className="p-3 rounded-2xl border flex items-center justify-between gap-3"
                    style={{ backgroundColor: T.surfaceAlt, borderColor: T.border }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-lg shadow-sm">
                        {f.avatar}
                      </div>
                      <div>
                        <div className="text-xs font-bold" style={{ color: T.ink }}>{f.nome}</div>
                        <div className="text-[11px] text-amber-400 font-medium flex items-center gap-1 mt-0.5">
                          <BookOpen size={12} /> {f.lendoAgora}
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-white/5 text-slate-400">
                        {f.progresso}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: Indicações Recebidas */}
          {activeTab === "indicacoes" && (
            <div className="space-y-3">
              {recommendations.length === 0 ? (
                <div className="p-8 text-center text-xs opacity-70" style={{ color: T.inkSoft }}>
                  Você ainda não recebeu nenhuma indicação. Peça para seus amigos recomendarem livros pelo app!
                </div>
              ) : (
                recommendations.map((rec) => (
                  <div
                    key={rec.id}
                    className="p-4 rounded-3xl border flex items-start gap-4 shadow-sm"
                    style={{ backgroundColor: T.surfaceAlt, borderColor: T.border }}
                  >
                    {rec.capaUrl && (
                      <img src={rec.capaUrl} alt="" className="w-16 h-24 object-cover rounded-xl shadow-md shrink-0 border border-black/10" />
                    )}

                    <div className="flex-1 space-y-1.5">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-rose-400">
                        <Heart size={14} className="fill-current" /> Recomendação de {rec.de}
                      </div>
                      <h4 className="text-sm font-black" style={{ color: T.ink }}>{rec.obra}</h4>
                      <div className="text-[11px] opacity-75 font-medium" style={{ color: T.inkSoft }}>{rec.autor}</div>
                      <div className="p-2.5 rounded-xl bg-white/[0.04] border border-white/5 text-xs italic mt-1" style={{ color: T.ink }}>
                        "{rec.mensagem}"
                      </div>
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
