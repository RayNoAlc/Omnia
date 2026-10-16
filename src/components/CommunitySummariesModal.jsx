import React, { useState, useMemo, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  Globe, X, Search, Sparkles, Download, ThumbsUp, BookOpen, Share2,
  Tag, Filter, Check, User, Heart, Send, Plus, Trash2, FileText, Layers,
  Bookmark, AlertCircle
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
    tags: ["stf", "recurso", "direito"],
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

export function CommunitySummariesModal({
  userId,
  userSummaries = [],
  summaries = [],
  notes = [],
  materials = [],
  commitments = [],
  onImportSummary,
  onClose
}) {
  const allSummaries = summaries && summaries.length > 0 ? summaries : userSummaries;

  // Carrega publicações salvas do usuário no localStorage
  const [communityList, setCommunityList] = useState(() => {
    try {
      const mySaved = JSON.parse(localStorage.getItem("omnia_community_materials") || "[]");
      if (Array.isArray(mySaved) && mySaved.length > 0) {
        return [...mySaved, ...INITIAL_COMMUNITY_SUMMARIES];
      }
    } catch {}
    return INITIAL_COMMUNITY_SUMMARIES;
  });

  const [search, setSearch] = useState("");
  const [selectedTag, setSelectedTag] = useState("all");
  const [userLikes, setUserLikes] = useState(new Set());
  const [importedIds, setImportedIds] = useState(new Set());
  const [previewSummary, setPreviewSummary] = useState(null);

  // Painel de Compartilhamento / Publicação
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishTab, setPublishTab] = useState("from_materials"); // 'from_materials' | 'from_scratch'
  const [selectedItemType, setSelectedItemType] = useState("all"); // 'all' | 'summary' | 'material' | 'note'
  const [selectedMaterialId, setSelectedMaterialId] = useState("");

  const [pubTitle, setPubTitle] = useState("");
  const [pubDiscipline, setPubDiscipline] = useState("");
  const [pubAuthor, setPubAuthor] = useState("Você (Estudante)");
  const [pubTags, setPubTags] = useState("");
  const [pubContent, setPubContent] = useState("");
  const [pubError, setPubError] = useState(null);
  const [pubSuccess, setPubSuccess] = useState(false);

  // Lista unificada de materiais disponíveis do usuário
  const userMaterialOptions = useMemo(() => {
    const list = [];

    // 1. Resumos
    (allSummaries || []).forEach(s => {
      list.push({
        id: `summary-${s.id}`,
        rawId: s.id,
        category: "summary",
        badge: "Resumo",
        title: s.titulo || `Resumo de ${s.disciplina || "Estudo"}`,
        disciplina: s.disciplina || "Geral",
        content: s.texto || s.markdown || "",
        tags: [s.disciplina?.toLowerCase() || "resumo", "estudo"],
      });
    });

    // 2. Materiais / PDFs
    (materials || []).forEach(m => {
      const title = m.nomeArquivo || `Material de ${m.disciplina || "Geral"}`;
      list.push({
        id: `material-${m.id}`,
        rawId: m.id,
        category: "material",
        badge: (m.tipoArquivo || "pdf").toUpperCase(),
        title: title,
        disciplina: m.disciplina || "Geral",
        content: m.textoExtraido || `Material de estudo: **${m.nomeArquivo}**\n\n*(Arquivo registrado na matéria ${m.disciplina || "Geral"})*`,
        tags: [m.disciplina?.toLowerCase() || "material", m.tipoArquivo || "pdf"],
      });
    });

    // 3. Anotações
    (notes || []).forEach(n => {
      const preview = (n.texto || "").slice(0, 45) + ((n.texto || "").length > 45 ? "..." : "");
      list.push({
        id: `note-${n.id}`,
        rawId: n.id,
        category: "note",
        badge: "Anotação",
        title: preview || `Anotação de ${n.disciplina || "Geral"}`,
        disciplina: n.disciplina || "Geral",
        content: n.texto || "",
        tags: [n.disciplina?.toLowerCase() || "anotação", "estudos"],
      });
    });

    return list;
  }, [allSummaries, materials, notes]);

  const filteredUserOptions = useMemo(() => {
    if (selectedItemType === "all") return userMaterialOptions;
    return userMaterialOptions.filter(item => item.category === selectedItemType);
  }, [userMaterialOptions, selectedItemType]);

  // Ao selecionar um material do usuário, autopreenche os campos da publicação
  const handleSelectMaterial = (item) => {
    sfx.pop();
    setSelectedMaterialId(item.id);
    setPubTitle(item.title);
    setPubDiscipline(item.disciplina);
    setPubContent(item.content);
    setPubTags(item.tags.filter(Boolean).join(", "));
    setPubError(null);
  };

  // Publicar material no Hub
  const handlePublish = () => {
    if (!pubTitle.trim()) {
      setPubError("Por favor, preencha o título da publicação.");
      return;
    }
    if (!pubDiscipline.trim()) {
      setPubError("Por favor, informe a disciplina.");
      return;
    }
    if (!pubContent.trim()) {
      setPubError("O conteúdo do material não pode ficar vazio.");
      return;
    }

    sfx.complete();
    setPubError(null);

    const parsedTags = pubTags
      .split(/[,;\s]+/)
      .map(t => t.replace(/^#/, "").trim().toLowerCase())
      .filter(Boolean);

    if (parsedTags.length === 0) {
      parsedTags.push(pubDiscipline.toLowerCase());
    }

    const newCommItem = {
      id: `comm-user-${Date.now()}`,
      titulo: pubTitle.trim(),
      disciplina: pubDiscipline.trim(),
      autor: pubAuthor.trim() || "Você (Estudante)",
      likes: 1,
      downloads: 0,
      tags: parsedTags,
      markdown: pubContent.trim(),
      isMine: true,
      createdAt: new Date().toISOString(),
    };

    const updated = [newCommItem, ...communityList];
    setCommunityList(updated);

    try {
      const mySaved = JSON.parse(localStorage.getItem("omnia_community_materials") || "[]");
      localStorage.setItem("omnia_community_materials", JSON.stringify([newCommItem, ...mySaved]));
    } catch (e) {}

    setPubSuccess(true);
    setTimeout(() => {
      setIsPublishing(false);
      setPubSuccess(false);
      setPubTitle("");
      setPubDiscipline("");
      setPubContent("");
      setPubTags("");
      setSelectedMaterialId("");
    }, 1000);
  };

  // Excluir publicação feita pelo usuário
  const handleDeleteMyPublication = (id) => {
    if (!confirm("Deseja remover esta publicação do Hub Comunitário?")) return;
    sfx.trash();
    setCommunityList(prev => prev.filter(item => item.id !== id));
    try {
      const mySaved = JSON.parse(localStorage.getItem("omnia_community_materials") || "[]");
      const filtered = mySaved.filter(item => item.id !== id);
      localStorage.setItem("omnia_community_materials", JSON.stringify(filtered));
    } catch (e) {}
  };

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

  // Lista dinâmica de tags disponíveis no Hub
  const availableTags = useMemo(() => {
    const tagsSet = new Set(["all", "exatas", "saúde", "direito", "algoritmos"]);
    communityList.forEach(item => {
      (item.tags || []).forEach(t => tagsSet.add(t));
      if (item.disciplina) tagsSet.add(item.disciplina.toLowerCase());
    });
    return Array.from(tagsSet).slice(0, 10);
  }, [communityList]);

  const filteredList = communityList.filter(item => {
    const matchesSearch = item.titulo.toLowerCase().includes(search.toLowerCase()) ||
                          item.disciplina.toLowerCase().includes(search.toLowerCase()) ||
                          item.markdown.toLowerCase().includes(search.toLowerCase()) ||
                          (item.autor || "").toLowerCase().includes(search.toLowerCase());
    const matchesTag = selectedTag === "all" ||
                       item.tags.includes(selectedTag) ||
                       item.disciplina.toLowerCase() === selectedTag;
    return matchesSearch && matchesTag;
  });

  // Atalho de fechar com tecla Escape
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        if (previewSummary) setPreviewSummary(null);
        else if (isPublishing) setIsPublishing(false);
        else onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [previewSummary, isPublishing, onClose]);

  const modalContent = (
    <div
      className="fixed inset-0 z-[99999] flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="w-full max-w-6xl xl:max-w-7xl h-[94vh] rounded-2xl sm:rounded-3xl flex flex-col shadow-2xl relative border overflow-hidden"
        style={{ backgroundColor: T.surface, borderColor: T.border }}
        onClick={(e) => e.stopPropagation()}
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
            <button
              type="button"
              onClick={() => {
                sfx.pop();
                setIsPublishing(!isPublishing);
              }}
              className="px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all active:scale-95 flex items-center gap-1.5 cursor-pointer shadow-sm"
              style={{
                backgroundColor: isPublishing ? T.surface : T.brand,
                color: isPublishing ? T.ink : T.brandInk,
                border: `1px solid ${isPublishing ? T.border : T.brand}`
              }}
            >
              {isPublishing ? <X size={14} /> : <Plus size={14} />}
              <span>{isPublishing ? "Fechar Painel" : "Adicionar Meu Material"}</span>
            </button>

            <button
              type="button"
              onClick={() => { sfx.click(); onClose(); }}
              className="p-2 rounded-xl border hover:opacity-80 transition-opacity ml-1 cursor-pointer"
              style={{ backgroundColor: T.surface, borderColor: T.border, color: T.ink }}
              title="Fechar (Esc)"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Painel de Publicação / Compartilhamento de Material */}
        {isPublishing && (
          <div className="p-4 sm:p-5 border-b animate-in slide-in-from-top-3 duration-200 overflow-y-auto max-h-[60vh] custom-scrollbar" style={{ backgroundColor: T.surfaceAlt, borderColor: T.border }}>
            <div className="max-w-4xl mx-auto space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <Sparkles size={16} className="text-purple-400" />
                  <span className="text-sm font-bold" style={{ color: T.ink }}>
                    Compartilhar no Hub Comunitário
                  </span>
                </div>

                {/* Alternador de Origem: Selecionar dos meus vs Criar do zero */}
                <div className="flex items-center gap-1 p-1 rounded-xl border" style={{ backgroundColor: T.surface, borderColor: T.border }}>
                  <button
                    type="button"
                    onClick={() => { sfx.pop(); setPublishTab("from_materials"); }}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      publishTab === "from_materials" ? "shadow-xs font-bold" : "opacity-75 hover:opacity-100"
                    }`}
                    style={{
                      backgroundColor: publishTab === "from_materials" ? `${T.brand}25` : "transparent",
                      color: publishTab === "from_materials" ? T.brand : T.ink
                    }}
                  >
                    Meus Materiais ({userMaterialOptions.length})
                  </button>

                  <button
                    type="button"
                    onClick={() => { sfx.pop(); setPublishTab("from_scratch"); }}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      publishTab === "from_scratch" ? "shadow-xs font-bold" : "opacity-75 hover:opacity-100"
                    }`}
                    style={{
                      backgroundColor: publishTab === "from_scratch" ? `${T.brand}25` : "transparent",
                      color: publishTab === "from_scratch" ? T.brand : T.ink
                    }}
                  >
                    Digitar Manualmente
                  </button>
                </div>
              </div>

              {/* Seção 1: Seleção de material existente */}
              {publishTab === "from_materials" && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2 flex-wrap text-xs">
                    <span className="font-semibold text-slate-300">Escolha um item da sua biblioteca para preencher:</span>
                    <div className="flex items-center gap-1">
                      {["all", "summary", "material", "note"].map((typeKey) => {
                        const labels = { all: "Todos", summary: "Resumos", material: "Documentos", note: "Notas" };
                        return (
                          <button
                            key={typeKey}
                            type="button"
                            onClick={() => setSelectedItemType(typeKey)}
                            className={`px-2 py-0.5 rounded text-[11px] font-medium border cursor-pointer ${
                              selectedItemType === typeKey ? "bg-purple-600 text-white border-purple-500" : "opacity-60 hover:opacity-100"
                            }`}
                            style={{ borderColor: selectedItemType === typeKey ? undefined : T.border }}
                          >
                            {labels[typeKey]}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {filteredUserOptions.length === 0 ? (
                    <div className="p-4 rounded-xl border text-center text-xs text-slate-400" style={{ backgroundColor: T.surface, borderColor: T.border }}>
                      Nenhum material cadastrado nesta categoria. Alterne para "Digitar Manualmente" para publicar!
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 max-h-40 overflow-y-auto custom-scrollbar p-1">
                      {filteredUserOptions.map((item) => {
                        const isSelected = selectedMaterialId === item.id;
                        return (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => handleSelectMaterial(item)}
                            className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-1.5 ${
                              isSelected ? "ring-2 ring-purple-500 shadow-md" : "hover:border-slate-500 opacity-80 hover:opacity-100"
                            }`}
                            style={{
                              backgroundColor: isSelected ? `${T.brand}15` : T.surface,
                              borderColor: isSelected ? T.brand : T.border
                            }}
                          >
                            <div className="flex items-center justify-between gap-1 w-full">
                              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded uppercase font-mono" style={{ backgroundColor: TINT.brand, color: T.brand }}>
                                {item.badge}
                              </span>
                              <span className="text-[10px] text-slate-400 truncate max-w-[120px]">{item.disciplina}</span>
                            </div>
                            <span className="text-xs font-semibold truncate w-full" style={{ color: T.ink }}>
                              {item.title}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* Seção 2: Formulário detalhado da publicação */}
              <div className="p-4 rounded-2xl border space-y-3" style={{ backgroundColor: T.surface, borderColor: T.border }}>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2 space-y-1">
                    <label className="text-[11px] font-semibold text-slate-400">Título do Material / Resumo *</label>
                    <input
                      type="text"
                      value={pubTitle}
                      onChange={(e) => setPubTitle(e.target.value)}
                      placeholder="Ex: Resumo de Biópsia e Técnicas Cirúrgicas"
                      className="w-full px-3 py-1.5 rounded-xl text-xs border outline-none font-medium"
                      style={{ backgroundColor: T.surfaceAlt, borderColor: T.border, color: T.ink }}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-400">Disciplina / Matéria *</label>
                    <input
                      type="text"
                      value={pubDiscipline}
                      onChange={(e) => setPubDiscipline(e.target.value)}
                      placeholder="Ex: Estomatologia"
                      className="w-full px-3 py-1.5 rounded-xl text-xs border outline-none font-medium"
                      style={{ backgroundColor: T.surfaceAlt, borderColor: T.border, color: T.ink }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-400">Tags (separadas por vírgula)</label>
                    <input
                      type="text"
                      value={pubTags}
                      onChange={(e) => setPubTags(e.target.value)}
                      placeholder="Ex: biópsia, estomatologia, saúde, odonto"
                      className="w-full px-3 py-1.5 rounded-xl text-xs border outline-none font-medium"
                      style={{ backgroundColor: T.surfaceAlt, borderColor: T.border, color: T.ink }}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-400">Autor / Seu Nome ou Curso</label>
                    <input
                      type="text"
                      value={pubAuthor}
                      onChange={(e) => setPubAuthor(e.target.value)}
                      placeholder="Ex: Você (Odontologia)"
                      className="w-full px-3 py-1.5 rounded-xl text-xs border outline-none font-medium"
                      style={{ backgroundColor: T.surfaceAlt, borderColor: T.border, color: T.ink }}
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-semibold text-slate-400">Conteúdo do Material / Texto formatado *</label>
                    <span className="text-[10px] text-slate-500 font-mono">{pubContent.length} caracteres</span>
                  </div>
                  <textarea
                    value={pubContent}
                    onChange={(e) => setPubContent(e.target.value)}
                    rows={4}
                    placeholder="Escreva ou cole aqui as anotações, resumo, tópicos ou pontos-chave do material..."
                    className="w-full p-3 rounded-xl text-xs border outline-none font-sans leading-relaxed custom-scrollbar"
                    style={{ backgroundColor: T.surfaceAlt, borderColor: T.border, color: T.ink }}
                  />
                </div>

                {pubError && (
                  <div className="flex items-center gap-1.5 text-xs text-rose-400 font-medium">
                    <AlertCircle size={14} />
                    <span>{pubError}</span>
                  </div>
                )}

                <div className="flex items-center justify-between pt-1">
                  <span className="text-[11px] text-slate-400 hidden sm:inline">
                    O material ficará visível para você e na lista colaborativa do app.
                  </span>

                  <div className="flex items-center gap-2 ml-auto">
                    <button
                      type="button"
                      onClick={() => setIsPublishing(false)}
                      className="px-3 py-1.5 rounded-xl text-xs font-semibold border hover:opacity-80 transition-opacity cursor-pointer"
                      style={{ backgroundColor: T.surfaceAlt, borderColor: T.border, color: T.ink }}
                    >
                      Cancelar
                    </button>

                    <button
                      type="button"
                      onClick={handlePublish}
                      disabled={pubSuccess}
                      className="px-4 py-1.5 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-500 text-white transition-all cursor-pointer shadow-sm flex items-center gap-1.5 disabled:opacity-50"
                    >
                      {pubSuccess ? <Check size={14} /> : <Send size={14} />}
                      <span>{pubSuccess ? "Publicado com Sucesso!" : "Publicar no Hub"}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Barra de Busca e Filtro de Tags */}
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
            {availableTags.map(tag => (
              <button
                key={tag}
                type="button"
                onClick={() => { sfx.pop(); setSelectedTag(tag); }}
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
            <div className="py-20 text-center text-slate-400 text-sm space-y-2">
              <p>Nenhum material encontrado com esses filtros.</p>
              <button
                type="button"
                onClick={() => setIsPublishing(true)}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-purple-600 text-white shadow-sm inline-flex items-center gap-1.5 cursor-pointer mt-2"
              >
                <Plus size={14} />
                <span>Seja o primeiro a adicionar nesta matéria!</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredList.map((item) => {
                const isImported = importedIds.has(item.id);
                const isLiked = userLikes.has(item.id);

                return (
                  <div
                    key={item.id}
                    className="p-4 rounded-2xl border flex flex-col justify-between transition-all hover:shadow-md relative group"
                    style={{ backgroundColor: T.surface, borderColor: T.border }}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full" style={{ backgroundColor: TINT.brand, color: T.brand }}>
                            {item.disciplina}
                          </span>
                          {item.isMine && (
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30">
                              Meu Material
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2 text-[11px] text-slate-400">
                          <div className="flex items-center gap-1">
                            <User size={12} />
                            <span>{item.autor}</span>
                          </div>
                          {item.isMine && (
                            <button
                              type="button"
                              onClick={() => handleDeleteMyPublication(item.id)}
                              className="text-slate-500 hover:text-rose-400 p-1 rounded-md transition-colors cursor-pointer"
                              title="Remover minha publicação do Hub"
                            >
                              <Trash2 size={13} />
                            </button>
                          )}
                        </div>
                      </div>

                      <h4 className="text-sm font-bold mb-2 line-clamp-2" style={{ color: T.ink }}>
                        {item.titulo}
                      </h4>

                      <div className="text-xs p-3 rounded-xl mb-3 line-clamp-4 whitespace-pre-wrap font-sans text-slate-400 leading-relaxed" style={{ backgroundColor: T.surfaceAlt }}>
                        {item.markdown}
                      </div>

                      <div className="flex flex-wrap gap-1 mb-3">
                        {(item.tags || []).map(t => (
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
                          onClick={() => { sfx.click(); setPreviewSummary(item); }}
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
                          <span>{isImported ? "Salvo!" : "Salvar"}</span>
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
          <div
            className="fixed inset-0 z-[100000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150"
            onClick={() => setPreviewSummary(null)}
          >
            <div
              className="w-full max-w-2xl max-h-[85vh] p-6 rounded-3xl border shadow-2xl flex flex-col"
              style={{ backgroundColor: T.surface, borderColor: T.border }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between pb-3 mb-3 border-b" style={{ borderColor: T.border }}>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full" style={{ backgroundColor: TINT.brand, color: T.brand }}>
                    {previewSummary.disciplina}
                  </span>
                  <h3 className="text-base font-bold mt-1" style={{ color: T.ink }}>{previewSummary.titulo}</h3>
                  <div className="text-xs text-slate-400 mt-0.5">Por {previewSummary.autor}</div>
                </div>
                <button type="button" onClick={() => setPreviewSummary(null)} className="p-1 rounded-lg text-slate-400 hover:text-white cursor-pointer">
                  <X size={18} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto pr-2 whitespace-pre-wrap text-sm leading-relaxed custom-scrollbar font-sans" style={{ color: T.inkSoft }}>
                {previewSummary.markdown}
              </div>

              <div className="pt-3 mt-3 border-t flex justify-end gap-2" style={{ borderColor: T.border }}>
                <button
                  type="button"
                  onClick={() => { handleImport(previewSummary); setPreviewSummary(null); }}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-500 text-white shadow-sm flex items-center gap-1.5 cursor-pointer active:scale-95"
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

  if (typeof document !== "undefined") {
    return createPortal(modalContent, document.body);
  }
  return modalContent;
}
