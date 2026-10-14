import React, { useState, useMemo, useRef, useEffect } from "react";
import {
  Brain, X, ZoomIn, ZoomOut, RotateCcw, Search, Sparkles, BookOpen,
  FileText, Target, CheckCircle2, Layers, Filter, Compass, Maximize, ExternalLink
} from "lucide-react";
import { T, TINT, Card, SectionLabel, PrimaryButton, GhostButton } from "./ui";
import { sfx } from "../lib/soundEffects";

const DISCIPLINE_PALETTE = [
  "#3b82f6", "#10b981", "#f59e0b", "#ec4899", "#8b5cf6",
  "#06b6d4", "#f97316", "#14b8a6", "#6366f1", "#e11d48"
];

const NODE_ICONS = {
  root: Brain,
  discipline: BookOpen,
  summary: Sparkles,
  note: FileText,
  commitment: Target,
  material: Layers,
};

export function MindMapModal({
  disciplinas = [],
  commitments = [],
  notes = [],
  materials = [],
  summaries = [],
  onClose
}) {
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [selectedNode, setSelectedNode] = useState(null);
  const [selectedDiscipline, setSelectedDiscipline] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const containerRef = useRef(null);

  const effectiveDisciplinas = useMemo(() => {
    if (disciplinas && disciplinas.length > 0) return disciplinas;
    return Array.from(new Set([
      ...notes.map((n) => n.disciplina),
      ...commitments.map((c) => c.disciplina),
      ...materials.map((m) => m.disciplina),
    ])).filter(Boolean);
  }, [disciplinas, notes, commitments, materials]);

  // Paleta de cores para cada disciplina
  const disciplineColorMap = useMemo(() => {
    const map = {};
    effectiveDisciplinas.forEach((d, idx) => {
      map[d] = DISCIPLINE_PALETTE[idx % DISCIPLINE_PALETTE.length];
    });
    return map;
  }, [effectiveDisciplinas]);

  // Estruturação dos nós e arestas da teia de conceitos
  const { nodes, links } = useMemo(() => {
    const n = [];
    const l = [];

    const width = 1100;
    const height = 750;
    const centerX = width / 2;
    const centerY = height / 2;

    // 1. Nó Central (Cérebro Omnia)
    n.push({
      id: "root",
      type: "root",
      label: "Meu Universo de Estudos",
      sublabel: `${effectiveDisciplinas.length} disciplinas conectadas`,
      x: centerX,
      y: centerY,
      radius: 46,
      color: "#3b82f6",
    });

    const activeDisciplinas = selectedDiscipline === "all"
      ? effectiveDisciplinas
      : effectiveDisciplinas.filter(d => d === selectedDiscipline);

    const discCount = activeDisciplinas.length;
    const discRadius = Math.min(260, 180 + discCount * 12);

    activeDisciplinas.forEach((disc, idx) => {
      const angle = (idx / (discCount || 1)) * 2 * Math.PI - Math.PI / 2;
      const discX = centerX + discRadius * Math.cos(angle);
      const discY = centerY + discRadius * Math.sin(angle);
      const discColor = disciplineColorMap[disc] || "#6366f1";
      const discId = `disc-${disc}`;

      // 2. Nó da Disciplina
      const dNotes = notes.filter(note => note.disciplina === disc);
      const dSummaries = summaries.filter(s => s.disciplina === disc);
      const dCommitments = commitments.filter(c => c.disciplina === disc);
      const dMaterials = materials.filter(m => m.disciplina === disc);

      const totalItems = dNotes.length + dSummaries.length + dCommitments.length + dMaterials.length;

      n.push({
        id: discId,
        type: "discipline",
        label: disc,
        sublabel: `${totalItems} itens vinculados`,
        discipline: disc,
        x: discX,
        y: discY,
        radius: 36,
        color: discColor,
      });

      // Conexão Central -> Disciplina
      l.push({
        source: "root",
        target: discId,
        color: discColor,
        sourceX: centerX,
        sourceY: centerY,
        targetX: discX,
        targetY: discY,
        width: 2.5,
      });

      // 3. Nós Filhos (Anotações, Resumos, Compromissos, Materiais)
      const leafItems = [
        ...dSummaries.slice(0, 3).map(s => ({ ...s, leafType: "summary", label: s.titulo || `Resumo: ${disc}` })),
        ...dNotes.slice(0, 3).map(nt => ({ ...nt, leafType: "note", label: (nt.texto || "").slice(0, 30) + "..." })),
        ...dCommitments.slice(0, 3).map(c => ({ ...c, leafType: "commitment", label: c.assunto || "Compromisso" })),
        ...dMaterials.slice(0, 2).map(m => ({ ...m, leafType: "material", label: m.nome || "Documento" })),
      ];

      const leafCount = leafItems.length;
      const leafOrbit = 105;

      leafItems.forEach((item, lIdx) => {
        // Espalhamento radial em leque ao redor do nó da disciplina
        const fanSpread = Math.PI * 0.9;
        const leafAngle = angle - (fanSpread / 2) + ((lIdx + 0.5) / (leafCount || 1)) * fanSpread;
        const leafX = discX + leafOrbit * Math.cos(leafAngle);
        const leafY = discY + leafOrbit * Math.sin(leafAngle);
        const leafId = `leaf-${item.leafType}-${item.id || lIdx}`;

        n.push({
          id: leafId,
          type: item.leafType,
          label: item.label,
          discipline: disc,
          data: item,
          x: leafX,
          y: leafY,
          radius: 20,
          color: discColor,
        });

        l.push({
          source: discId,
          target: leafId,
          color: discColor,
          sourceX: discX,
          sourceY: discY,
          targetX: leafX,
          targetY: leafY,
          width: 1.2,
        });
      });
    });

    return { nodes: n, links: l };
  }, [effectiveDisciplinas, commitments, notes, materials, summaries, selectedDiscipline, disciplineColorMap]);

  // Filtro de busca
  const filteredNodes = useMemo(() => {
    if (!searchQuery.trim()) return nodes;
    const q = searchQuery.toLowerCase();
    return nodes.map(node => ({
      ...node,
      isHighlighted: (node.label || "").toLowerCase().includes(q) || (node.discipline || "").toLowerCase().includes(q)
    }));
  }, [nodes, searchQuery]);

  // Controles de Arraste da Tela (Pan)
  const handleMouseDown = (e) => {
    if (e.target.closest("button") || e.target.closest(".interactive-node")) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    setPan({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
  };

  const handleMouseUp = () => setIsDragging(false);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="w-full max-w-6xl h-[92vh] rounded-3xl flex flex-col shadow-2xl relative border overflow-hidden"
        style={{ backgroundColor: T.surface, borderColor: T.border }}
      >
        {/* Top Header */}
        <div className="px-5 py-3.5 border-b flex items-center justify-between gap-3 flex-wrap" style={{ borderColor: T.border, backgroundColor: T.surfaceAlt }}>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-500">
              <Brain size={20} />
            </div>
            <div>
              <h3 className="text-base font-bold flex items-center gap-2" style={{ color: T.ink }}>
                <span>Mapa Mental</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-500 border border-blue-500/20">
                  Interativo
                </span>
              </h3>
              <p className="text-xs" style={{ color: T.inkSoft }}>
                Explore a teia interativa que une suas matérias, anotações e resumos.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Campo de Busca Rápida */}
            <div className="relative">
              <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar no mapa..."
                className="pl-8 pr-3 py-1.5 rounded-xl text-xs border outline-none w-36 sm:w-48 transition-all focus:w-56"
                style={{ backgroundColor: T.surface, borderColor: T.border, color: T.ink }}
              />
            </div>

            {/* Controles de Zoom */}
            <div className="flex items-center gap-1 p-1 rounded-xl border" style={{ backgroundColor: T.surface, borderColor: T.border }}>
              <button
                type="button"
                onClick={() => { sfx.pop(); setZoom(z => Math.min(2.0, z + 0.15)); }}
                className="p-1.5 rounded-lg hover:opacity-80 active:scale-95 transition-all"
                title="Aumentar zoom"
                style={{ color: T.ink }}
              >
                <ZoomIn size={15} />
              </button>
              <button
                type="button"
                onClick={() => { sfx.pop(); setZoom(z => Math.max(0.5, z - 0.15)); }}
                className="p-1.5 rounded-lg hover:opacity-80 active:scale-95 transition-all"
                title="Diminuir zoom"
                style={{ color: T.ink }}
              >
                <ZoomOut size={15} />
              </button>
              <button
                type="button"
                onClick={() => { sfx.click(); setZoom(1); setPan({ x: 0, y: 0 }); }}
                className="p-1.5 rounded-lg hover:opacity-80 active:scale-95 transition-all"
                title="Centralizar mapa"
                style={{ color: T.inkSoft }}
              >
                <RotateCcw size={15} />
              </button>
            </div>

            <button
              type="button"
              onClick={() => { sfx.click(); onClose(); }}
              className="p-2 rounded-xl border hover:opacity-80 transition-opacity ml-1"
              style={{ backgroundColor: T.surface, borderColor: T.border, color: T.ink }}
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Barra de Filtro de Disciplina */}
        <div className="px-5 py-2 border-b flex items-center gap-1.5 overflow-x-auto text-xs custom-scrollbar" style={{ borderColor: T.border, backgroundColor: T.surface }}>
          <span className="text-[11px] font-semibold flex items-center gap-1 mr-1 shrink-0" style={{ color: T.inkSoft }}>
            <Filter size={12} /> Filtrar:
          </span>
          <button
            type="button"
            onClick={() => { sfx.pop(); setSelectedDiscipline("all"); }}
            className={`px-2.5 py-1 rounded-lg font-semibold transition-all shrink-0 cursor-pointer ${
              selectedDiscipline === "all" ? "shadow-xs scale-102" : "opacity-75 hover:opacity-100"
            }`}
            style={{
              backgroundColor: selectedDiscipline === "all" ? T.brand : T.surfaceAlt,
              color: selectedDiscipline === "all" ? T.brandInk : T.ink,
              border: `1px solid ${selectedDiscipline === "all" ? T.brand : T.border}`,
            }}
          >
            Todas ({effectiveDisciplinas.length})
          </button>
          {effectiveDisciplinas.map(disc => {
            const isSel = selectedDiscipline === disc;
            const color = disciplineColorMap[disc] || "#6366f1";
            return (
              <button
                key={disc}
                type="button"
                onClick={() => { sfx.pop(); setSelectedDiscipline(disc); }}
                className={`px-2.5 py-1 rounded-lg font-semibold transition-all shrink-0 cursor-pointer flex items-center gap-1.5 ${
                  isSel ? "shadow-xs scale-102" : "opacity-75 hover:opacity-100"
                }`}
                style={{
                  backgroundColor: isSel ? color : T.surfaceAlt,
                  color: isSel ? "#ffffff" : T.ink,
                  border: `1px solid ${isSel ? color : T.border}`,
                }}
              >
                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: isSel ? "#fff" : color }} />
                <span>{disc}</span>
              </button>
            );
          })}
        </div>

        {/* Canvas SVG Interativo */}
        <div
          ref={containerRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          className="flex-1 w-full h-full relative cursor-grab active:cursor-grabbing select-none overflow-hidden"
          style={{ backgroundColor: T.bg }}
        >
          <svg
            className="w-full h-full"
            viewBox="0 0 1100 750"
            style={{
              transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
              transformOrigin: "center center",
              transition: isDragging ? "none" : "transform 0.15s ease-out"
            }}
          >
            <defs>
              <radialGradient id="rootGlow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.35" />
                <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
              </radialGradient>
              <filter id="shadowGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="2" stdDeviation="4" floodOpacity="0.25" />
              </filter>
            </defs>

            {/* Conexões (Arestas / Linhas Curvas) */}
            {links.map((link, idx) => {
              const dx = link.targetX - link.sourceX;
              const dy = link.targetY - link.sourceY;
              const cx = link.sourceX + dx * 0.5;
              const cy = link.sourceY + dy * 0.5 - (dx * 0.1); // Leve curvatura natural

              return (
                <path
                  key={`link-${idx}`}
                  d={`M ${link.sourceX} ${link.sourceY} Q ${cx} ${cy} ${link.targetX} ${link.targetY}`}
                  fill="none"
                  stroke={link.color}
                  strokeWidth={link.width}
                  strokeOpacity={0.45}
                  strokeDasharray={link.source === "root" ? "none" : "3,3"}
                  className="transition-all"
                />
              );
            })}

            {/* Nós Interativos */}
            {filteredNodes.map((node) => {
              const isSelected = selectedNode?.id === node.id;
              const isHighlighted = node.isHighlighted;

              return (
                <g
                  key={node.id}
                  transform={`translate(${node.x}, ${node.y})`}
                  onClick={(e) => {
                    e.stopPropagation();
                    sfx.click();
                    setSelectedNode(node);
                  }}
                  className="interactive-node cursor-pointer group"
                >
                  {/* Halo de Brilho */}
                  {node.type === "root" && (
                    <circle r={node.radius + 18} fill="url(#rootGlow)" className="animate-pulse" />
                  )}

                  {/* Círculo Principal do Nó */}
                  <circle
                    r={isSelected ? node.radius + 4 : node.radius}
                    fill={node.type === "root" ? "#1e293b" : "#0f172a"}
                    stroke={isSelected ? "#fff" : node.color}
                    strokeWidth={isSelected ? 3.5 : isHighlighted ? 3 : 2}
                    filter="url(#shadowGlow)"
                    className="transition-all duration-200 group-hover:scale-105"
                  />

                  {/* Ícone Vetorial Lucide (sem emojis) */}
                  {(() => {
                    const IconCmp = NODE_ICONS[node.type] || Brain;
                    const iconSize = node.type === "root" ? 28 : node.type === "discipline" ? 20 : 13;
                    const iconColor = node.type === "root" ? "#60a5fa" : (node.color || "#94a3b8");
                    return (
                      <g transform={`translate(${-iconSize / 2}, ${-iconSize / 2})`} pointerEvents="none">
                        <IconCmp size={iconSize} color={iconColor} strokeWidth={2.2} />
                      </g>
                    );
                  })()}

                  {/* Rótulo de Texto */}
                  <text
                    y={node.radius + 14}
                    textAnchor="middle"
                    fontSize={node.type === "root" ? 12 : node.type === "discipline" ? 11 : 9.5}
                    fontWeight={node.type === "leaf" ? "normal" : "bold"}
                    fill={isHighlighted ? "#fbbf24" : "#f1f5f9"}
                    className="select-none pointer-events-none drop-shadow-sm"
                  >
                    {node.label.length > 24 ? node.label.slice(0, 22) + "..." : node.label}
                  </text>
                </g>
              );
            })}
          </svg>

          {/* Dica de Navegação */}
          <div className="absolute bottom-3 left-4 text-[11px] px-3 py-1 rounded-full border bg-slate-900/70 text-slate-300 backdrop-blur-xs flex items-center gap-1.5" style={{ borderColor: T.border }}>
            <Compass size={13} className="text-blue-400" />
            <span>Arraste para navegar pelo mapa • Clique em um nó para ver os detalhes</span>
          </div>

          {/* Painel Lateral com Detalhes do Nó Selecionado */}
          {selectedNode && (
            <div
              className="absolute bottom-3 right-4 w-80 max-w-[90vw] p-4 rounded-2xl border shadow-2xl backdrop-blur-md animate-in slide-in-from-right-2 duration-150"
              style={{ backgroundColor: T.surface, borderColor: selectedNode.color || T.border }}
            >
              <div className="flex items-center justify-between pb-2 mb-2.5 border-b" style={{ borderColor: T.border }}>
                <div className="flex items-center gap-2.5">
                  {(() => {
                    const IconCmp = NODE_ICONS[selectedNode.type] || Brain;
                    return (
                      <div className="p-2 rounded-xl" style={{ backgroundColor: (selectedNode.color || "#3b82f6") + '22', color: selectedNode.color || "#3b82f6" }}>
                        <IconCmp size={18} />
                      </div>
                    );
                  })()}
                  <div>
                    <h4 className="text-xs font-bold capitalize" style={{ color: T.ink }}>
                      {selectedNode.type === 'root' ? 'Núcleo' : selectedNode.type === 'discipline' ? 'Disciplina' : selectedNode.type === 'summary' ? 'Resumo IA' : selectedNode.type === 'note' ? 'Anotação' : selectedNode.type === 'commitment' ? 'Compromisso' : 'Material'}
                    </h4>
                    <span className="text-[10px] font-mono text-slate-400">{selectedNode.discipline || "Visão Geral"}</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedNode(null)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                >
                  <X size={15} />
                </button>
              </div>

              <div className="text-xs font-medium mb-2" style={{ color: T.ink }}>
                {selectedNode.label}
              </div>

              {selectedNode.sublabel && (
                <div className="text-[11px] mb-2" style={{ color: T.inkSoft }}>
                  {selectedNode.sublabel}
                </div>
              )}

              {selectedNode.data?.texto && (
                <div className="text-[11px] p-2 rounded-xl mb-2.5 line-clamp-4 whitespace-pre-wrap font-sans" style={{ backgroundColor: T.surfaceAlt, color: T.inkSoft }}>
                  {selectedNode.data.texto}
                </div>
              )}

              {selectedNode.data?.markdown && (
                <div className="text-[11px] p-2 rounded-xl mb-2.5 line-clamp-4 whitespace-pre-wrap font-mono" style={{ backgroundColor: T.surfaceAlt, color: T.inkSoft }}>
                  {selectedNode.data.markdown.slice(0, 180)}...
                </div>
              )}

              {selectedNode.data?.prazo && (
                <div className="text-[10px] mb-2 font-mono" style={{ color: T.brand }}>
                  Prazo: {selectedNode.data.prazo} • {selectedNode.data.tipo}
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2 border-t" style={{ borderColor: T.border }}>
                <button
                  type="button"
                  onClick={() => setSelectedNode(null)}
                  className="px-3 py-1 rounded-lg text-xs font-semibold hover:opacity-80 transition-opacity"
                  style={{ backgroundColor: T.surfaceAlt, color: T.ink }}
                >
                  Fechar
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
