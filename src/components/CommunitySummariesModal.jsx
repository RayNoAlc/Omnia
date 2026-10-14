import React, { useState } from "react";
import {
  Globe, X, Search, Sparkles, Download, ThumbsUp, BookOpen, Share2,
  Tag, Filter, Check, User, Heart, Send
} from "lucide-react";
import { T, TINT, Card, SectionLabel, PrimaryButton, GhostButton } from "./ui";
import { sfx } from "../lib/soundEffects";

// Resumos acadêmicos colaborativos de exemplo para o Hub Comunitário
const INITIAL_COMMUNITY_SUMMARIES = [
  {
    id: "comm-1",
    titulo: "Guia Rápido: Teorema Fundamental do Cálculo & Integrais",
    disciplina: "Cálculo I",
    autor: "Ana Clara (Engenharia)",
    likes: 42,
    downloads: 128,
    tags: ["integrais", "derivadas", "exatas"],
    markdown: `### Teorema Fundamental do Cálculo (TFC)\n\nO TFC estabelece a conexão vital entre a **diferenciação** e a **integração**:\n\n1. **Parte 1:** Se $f$ é contínua em $[a, b]$, então $g(x) = \\int_{a}^{x} f(t) dt$ é diferenciável e $g'(x) = f(x)$.\n2. **Parte 2:** $\\int_{a}^{b} f(x) dx = F(b) - F(a)$, onde $F$ é qualquer antiderivada de $f$.\n\n*Dica de prova:* Sempre verifique se a função é contínua no intervalo fechado antes de aplicar!`
  },
  {
    id: "comm-2",
    titulo: "Ciclo Cardíaco & Potencial de Ação Miocárdico",
    disciplina: "Fisiologia Humana",
    autor: "Lucas M. (Medicina)",
    likes: 67,
    downloads: 215,
    tags: ["coração", "sístole", "saúde"],
    markdown: `### Fases do Ciclo Cardíaco\n\n1. **Sístole Ventricular:** Contração isovolumétrica seguida de ejeção rápida.\n2. **Diástole Ventricular:** Relaxamento isovolumétrico seguido de enchimento rápido e contração atrial.\n\n*Ponto de ouro:* Abertura das valvas semilunares ocorre apenas quando a pressão ventricular supera a pressão aórtica/pulmonar!`
  },
  {
    id: "comm-3",
    titulo: "Controle de Constitucionalidade: Difuso vs Concentrado",
    disciplina: "Direito Constitucional",
    autor: "Beatriz R. (Direito)",
    likes: 54,
    downloads: 180,
    tags: ["STF", "recurso extraordinário", "ADI"],
    markdown: `### Tabela Comparativa\n\n- **Controle Difuso:** Exercido por qualquer juiz ou tribunal; efeito inter partes (salvo resolução do Senado).\n- **Controle Concentrado:** Competência exclusiva do STF via ADI, ADC, ADO e ADPF; efeito erga omnes e vinculante.\n\n*Regra de Ouro:* A cláusula de reserva de plenário (Art. 97 da CF) exige maioria absoluta para declarar inconstitucionalidade.`
  },
  {
    id: "comm-4",
    titulo: "Estruturas de Dados Essenciais: Árvores Binárias & Grafos",
    disciplina: "Ciência da Computação",
    autor: "Rodrigo T. (Computação)",
    likes: 89,
    downloads: 310,
    tags: ["algoritmos", "grafos", "complexidade"],
    markdown: `### Árvores Binárias de Busca (BST)\n\n- **Propriedade:** Para qualquer nó $N$, valores à esquerda $< N <$ valores à direita.\n- **Busca:** Média $O(\\log n)$, Pior caso $O(n)$ se a árvore estiver desbalanceada.\n- **Solução:** Árvores AVL ou Red-Black mantêm balanceamento automático com rotações simples e duplas.`
  }
];

export function CommunitySummariesModal({ userSummaries = [], onImportSummary, onClose }) {
  const [search, setSearch] = useState("");
  const [selectedTag, setSelectedTag] = useState("all");
  const [communityList, setCommunityList] = useState(INITIAL_COMMUNITY_SUMMARIES);
  const [userLikes, setUserLikes] = useState(new Set());
  const [importedIds, setImportedIds] = useState(new Set());
  const [publishing, setPublishing] = useState(false);
  const [selectedUserSummaryId, setSelectedUserSummaryId] = useState("");
  const [previewSummary, setPreviewSummary] = useState(null);

  const toggleLike = (id) => {
    sfx.pop();
    setCommunityList(prev => prev.map(item => {
      if (item.id === id) {
        const isLiked = userLikes.has(id);
        const nextLikes = new Set(userLikes);
        if (isLiked) {
          nextLikes.delete(id);
          setUserLikes(nextLikes);
          return { ...item, likes: item.likes - 1 };
        } else {
          nextLikes.add(id);
          setUserLikes(nextLikes);
          return { ...item, likes: item.likes + 1 };
        }
      }
      return item;
    }));
  };

  const handleImport = (summary) => {
    sfx.complete();
    setImportedIds(prev => new Set([...prev, summary.id]));
    if (onImportSummary) {
      onImportSummary({
        titulo: summary.titulo,
        disciplina: summary.disciplina,
        markdown: summary.markdown + `\n\n*(Importado do Hub Comunitário • Criado por ${summary.autor})*`,
      });
    }
  };

  const handlePublish = () => {
    if (!selectedUserSummaryId) return;
    const toPublish = userSummaries.find(s => s.id === selectedUserSummaryId);
    if (!toPublish) return;

    sfx.complete();
    const newCommItem = {
      id: `comm-user-${Date.now()}`,
      titulo: toPublish.titulo || `Resumo de ${toPublish.disciplina}`,
      disciplina: toPublish.disciplina,
      autor: "Você (Estudante Omnia)",
      likes: 1,
      downloads: 0,
      tags: [toPublish.disciplina.toLowerCase(), "estudo"],
      markdown: toPublish.markdown || "",
    };

    setCommunityList([newCommItem, ...communityList]);
    setPublishing(false);
    setSelectedUserSummaryId("");
  };

  const filteredList = communityList.filter(item => {
    const matchesSearch = item.titulo.toLowerCase().includes(search.toLowerCase()) ||
                          item.disciplina.toLowerCase().includes(search.toLowerCase()) ||
                          item.markdown.toLowerCase().includes(search.toLowerCase());
    const matchesTag = selectedTag === "all" || item.tags.includes(selectedTag);
    return matchesSearch && matchesTag;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="w-full max-w-5xl h-[92vh] rounded-3xl flex flex-col shadow-2xl relative border overflow-hidden"
        style={{ backgroundColor: T.surface, borderColor: T.border }}
      >
        {/* Top Header */}
        <div className="px-5 py-3.5 border-b flex items-center justify-between gap-3 flex-wrap" style={{ borderColor: T.border, backgroundColor: T.surfaceAlt }}>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-400">
              <Globe size={20} />
            </div>
            <div>
              <h3 className="text-base font-bold flex items-center gap-2" style={{ color: T.ink }}>
                <span>Hub Comunitário de Resumos</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20">
                  Colaborativo
                </span>
              </h3>
              <p className="text-xs" style={{ color: T.inkSoft }}>
                Descubra e compartilhe resumos de matérias com outros universitários.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {userSummaries.length > 0 && (
              <button
                type="button"
                onClick={() => setPublishing(!publishing)}
                className="px-3 py-1.5 rounded-xl text-xs font-bold border transition-all active:scale-95 flex items-center gap-1.5 cursor-pointer shadow-xs"
                style={{ backgroundColor: T.brand, color: T.brandInk, borderColor: T.brand }}
              >
                <Share2 size={13} />
                <span>{publishing ? "Cancelar Publicação" : "Compartilhar Resumo"}</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => { sfx.click(); onClose(); }}
              className="p-2 rounded-xl border hover:opacity-80 transition-opacity ml-1 cursor-pointer"
              style={{ backgroundColor: T.surface, borderColor: T.border, color: T.ink }}
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Modal de Publicação */}
        {publishing && (
          <div className="p-4 border-b animate-in slide-in-from-top-2 duration-150" style={{ backgroundColor: T.surfaceAlt, borderColor: T.border }}>
            <div className="text-xs font-bold mb-2 flex items-center gap-1.5" style={{ color: T.ink }}>
              <Sparkles size={14} className="text-purple-400" />
              <span>Escolha um dos seus resumos para publicar na comunidade:</span>
            </div>
            <div className="flex gap-2 items-center flex-wrap">
              <select
                value={selectedUserSummaryId}
                onChange={(e) => setSelectedUserSummaryId(e.target.value)}
                className="flex-1 py-1.5 px-3 rounded-xl text-xs border outline-none font-medium"
                style={{ backgroundColor: T.surface, borderColor: T.border, color: T.ink }}
              >
                <option value="">Selecione um resumo...</option>
                {userSummaries.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.titulo || s.disciplina} ({s.disciplina})
                  </option>
                ))}
              </select>
              <button
                type="button"
                disabled={!selectedUserSummaryId}
                onClick={handlePublish}
                className="px-4 py-1.5 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-500 text-white disabled:opacity-40 transition-all cursor-pointer flex items-center gap-1"
              >
                <Send size={13} />
                <span>Publicar Agora</span>
              </button>
            </div>
          </div>
        )}

        {/* Barra de Busca e Filtro */}
        <div className="px-5 py-3 border-b flex items-center justify-between gap-3 flex-wrap" style={{ borderColor: T.border, backgroundColor: T.surface }}>
          <div className="relative flex-1 min-w-[220px]">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por assunto, matéria ou autor..."
              className="w-full pl-9 pr-3 py-2 rounded-xl text-xs border outline-none font-medium"
              style={{ backgroundColor: T.surfaceAlt, borderColor: T.border, color: T.ink }}
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto custom-scrollbar pb-1 text-xs">
            {["all", "exatas", "saúde", "STF", "algoritmos"].map(tag => (
              <button
                key={tag}
                type="button"
                onClick={() => setSelectedTag(tag)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold capitalize transition-all cursor-pointer ${
                  selectedTag === tag ? "bg-purple-600 text-white shadow-xs" : "opacity-75 hover:opacity-100"
                }`}
                style={{
                  backgroundColor: selectedTag === tag ? undefined : T.surfaceAlt,
                  color: selectedTag === tag ? undefined : T.ink,
                  border: `1px solid ${selectedTag === tag ? "transparent" : T.border}`
                }}
              >
                {tag === "all" ? "Todos os Temas" : `#${tag}`}
              </button>
            ))}
          </div>
        </div>

        {/* Lista de Resumos Comunitários */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 custom-scrollbar" style={{ backgroundColor: T.bg }}>
          {filteredList.length === 0 ? (
            <div className="py-16 text-center text-slate-400 text-sm">
              Nenhum resumo encontrado com esses filtros.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredList.map((item) => {
                const isImported = importedIds.has(item.id);
                const isLiked = userLikes.has(item.id);

                return (
                  <div
                    key={item.id}
                    className="p-4 rounded-2xl border flex flex-col justify-between transition-all hover:shadow-md"
                    style={{ backgroundColor: T.surface, borderColor: T.border }}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full" style={{ backgroundColor: TINT.brand, color: T.brand }}>
                          {item.disciplina}
                        </span>
                        <div className="flex items-center gap-1 text-[11px] text-slate-400">
                          <User size={12} />
                          <span>{item.autor}</span>
                        </div>
                      </div>

                      <h4 className="text-sm font-bold mb-2 line-clamp-2" style={{ color: T.ink }}>
                        {item.titulo}
                      </h4>

                      <div className="text-xs p-3 rounded-xl mb-3 line-clamp-4 whitespace-pre-wrap font-sans text-slate-400" style={{ backgroundColor: T.surfaceAlt }}>
                        {item.markdown}
                      </div>

                      <div className="flex flex-wrap gap-1 mb-3">
                        {item.tags.map(t => (
                          <span key={t} className="text-[10px] px-2 py-0.5 rounded-md border text-slate-400" style={{ borderColor: T.border, backgroundColor: T.surfaceAlt }}>
                            #{t}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="pt-3 border-t flex items-center justify-between gap-2" style={{ borderColor: T.border }}>
                      <button
                        type="button"
                        onClick={() => toggleLike(item.id)}
                        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                          isLiked ? "text-rose-500 border-rose-500/30 bg-rose-500/10" : "text-slate-400 hover:text-rose-400"
                        }`}
                        style={{ borderColor: isLiked ? undefined : T.border }}
                      >
                        <Heart size={14} className={isLiked ? "fill-rose-500 text-rose-500" : ""} />
                        <span>{item.likes}</span>
                      </button>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setPreviewSummary(item)}
                          className="px-2.5 py-1.5 rounded-xl text-xs font-medium border hover:opacity-80 transition-opacity cursor-pointer"
                          style={{ backgroundColor: T.surfaceAlt, borderColor: T.border, color: T.ink }}
                        >
                          Ler Completo
                        </button>

                        <button
                          type="button"
                          disabled={isImported}
                          onClick={() => handleImport(item)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs ${
                            isImported
                              ? "bg-emerald-500 text-white"
                              : "bg-purple-600 hover:bg-purple-500 text-white active:scale-95"
                          }`}
                        >
                          {isImported ? <Check size={13} /> : <Download size={13} />}
                          <span>{isImported ? "Importado" : "Salvar"}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Modal de Prévia Completa do Resumo */}
        {previewSummary && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
            <div className="w-full max-w-2xl max-h-[85vh] p-6 rounded-3xl border shadow-2xl flex flex-col" style={{ backgroundColor: T.surface, borderColor: T.border }}>
              <div className="flex items-center justify-between pb-3 mb-3 border-b" style={{ borderColor: T.border }}>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full" style={{ backgroundColor: TINT.brand, color: T.brand }}>
                    {previewSummary.disciplina}
                  </span>
                  <h3 className="text-base font-bold mt-1" style={{ color: T.ink }}>{previewSummary.titulo}</h3>
                </div>
                <button type="button" onClick={() => setPreviewSummary(null)} className="p-1 rounded-lg text-slate-400 hover:text-white">
                  <X size={18} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto pr-2 whitespace-pre-wrap text-sm leading-relaxed custom-scrollbar" style={{ color: T.inkSoft }}>
                {previewSummary.markdown}
              </div>

              <div className="pt-3 mt-3 border-t flex justify-end gap-2" style={{ borderColor: T.border }}>
                <button
                  type="button"
                  onClick={() => { handleImport(previewSummary); setPreviewSummary(null); }}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-500 text-white shadow-sm flex items-center gap-1.5"
                >
                  <Download size={14} />
                  <span>Importar para Minha Biblioteca</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
