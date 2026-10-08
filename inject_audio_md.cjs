const fs = require('fs');
let tabs = fs.readFileSync('src/components/Tabs.jsx', 'utf8');

// Add Volume2, Square to lucide-react import
if (!tabs.includes('Volume2,')) {
  tabs = tabs.replace(/import \{\s*/, 'import {\n  Volume2, Square, Download, ');
}

// Add the AudioReaderButton component
const audioComponent = `
export function AudioReaderButton({ text, T }) {
  const [playing, setPlaying] = React.useState(false);
  const synth = window.speechSynthesis;
  
  const toggle = (e) => {
    e.stopPropagation();
    if (playing) {
      synth.cancel();
      setPlaying(false);
    } else {
      synth.cancel(); // clear previous
      // text can be very long or have markdown, just stripping basic markdown chars
      const cleanText = (text||"").replace(/[#*_~>]/g, "");
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.lang = 'pt-BR';
      utterance.onend = () => setPlaying(false);
      synth.speak(utterance);
      setPlaying(true);
    }
  };
  React.useEffect(() => {
    return () => { if(playing) synth.cancel(); }
  }, [playing]);

  return (
    <button onClick={toggle} title="Ouvir em Áudio" style={{ color: playing ? T.brand : T.inkSoft }} className="hover:opacity-70 transition-opacity ml-2">
      {playing ? <Square className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
    </button>
  );
}
`;

tabs = tabs.replace(
  /export function formatTextWithTags/,
  audioComponent + '\nexport function formatTextWithTags'
);

// Add AudioReaderButton to Notes in DisciplinaCard (in BibliotecaTab)
tabs = tabs.replace(
  /<div className="text-sm" style=\{\{ color: T\.inkSoft \}\}>\{n\.texto\}<\/div>\s*<button onClick=\{\(\) => onDeleteNote\(n\.id\)\}/g,
  '<div className="text-sm" style={{ color: T.inkSoft }}>{formatTextWithTags(n.texto, T)}</div>\n              <div className="flex gap-2"><AudioReaderButton text={n.texto} T={T} /><button onClick={() => onDeleteNote(n.id)} style={{ color: T.inkSoft }} className="shrink-0"><Trash2 className="w-3.5 h-3.5" /></button></div>'
);

// Add AudioReaderButton to Notes in CompromissoWorkspaceModal
tabs = tabs.replace(
  /<span style=\{\{ color: T\.inkSoft \}\}>\{n\.texto\}<\/span>\s*<button onClick=\{\(\) => handleDeleteNote\(n\.id\)\}/g,
  '<span style={{ color: T.inkSoft }}>{formatTextWithTags(n.texto, T)}</span>\n                  <div className="flex gap-2"><AudioReaderButton text={n.texto} T={T} /><button onClick={() => handleDeleteNote(n.id)} style={{ color: T.inkSoft }} className="shrink-0"><Trash2 className="w-3.5 h-3.5" /></button></div>'
);

// Add Markdown Export to ConfigTab
const mdExportHtml = `
            <div className='flex items-center justify-between p-4 rounded-xl border' style={{ borderColor: T.border, backgroundColor: T.bg }}>
              <div>
                <div className='font-bold' style={{ color: T.ink }}><Download size={20} className="inline mr-2 -mt-1" /> Backup Completo (Markdown)</div>
                <div className='text-sm mt-1' style={{ color: T.inkSoft }}>Exportar todas as suas anotações, compromissos e resumos em um único arquivo de texto legível.</div>
              </div>
              <GhostButton onClick={() => {
                const blob = new Blob([generateMarkdownBackup(commitments, notes, summaries)], { type: 'text/markdown' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = \`backup_omnia_\${new Date().toISOString().slice(0,10)}.md\`;
                a.click();
              }}>Baixar .md</GhostButton>
            </div>
`;

tabs = tabs.replace(
  /<p className='mb-6' style=\{\{ color: T\.inkSoft \}\}>Ative ou desative funcionalidades secundárias para manter a interface limpa e objetiva\.<\/p>\s*<div className='space-y-4'>/,
  '<p className=\'mb-6\' style={{ color: T.inkSoft }}>Ative ou desative funcionalidades secundárias para manter a interface limpa e objetiva.</p>\n          <div className=\'space-y-4\'>\n' + mdExportHtml
);

const mdGenerator = `
export function generateMarkdownBackup(commitments, notes, summaries) {
  let md = "# Backup Omnia\\n\\nGerado em: " + new Date().toLocaleString() + "\\n\\n";
  const disciplinas = Array.from(new Set([...notes.map(n=>n.disciplina), ...commitments.map(c=>c.disciplina)])).filter(Boolean);
  
  disciplinas.forEach(d => {
    md += \`## Disciplina: \${d}\\n\\n\`;
    const cDisc = commitments.filter(c => c.disciplina === d);
    if(cDisc.length) {
      md += "### Compromissos\\n";
      cDisc.forEach(c => md += \`- [\${c.concluido ? 'x' : ' '}] \${c.assunto} (Prazo: \${c.prazo||'N/A'})\\n\`);
      md += "\\n";
    }
    const nDisc = notes.filter(n => n.disciplina === d);
    if(nDisc.length) {
      md += "### Anotações\\n";
      nDisc.forEach(n => md += \`> \${n.texto}\\n\\n\`);
    }
    const sDisc = summaries.filter(s => s.disciplina === d && !s.commitmentId);
    if(sDisc.length) {
      md += "### Resumos\\n";
      sDisc.forEach(s => md += \`\${s.markdown}\\n\\n\`);
    }
    md += "---\\n\\n";
  });
  return md;
}
`;

tabs = tabs.replace(
  /export function ConfigTab/,
  mdGenerator + '\nexport function ConfigTab'
);

// We need to pass commitments, notes, summaries to ConfigTab!
tabs = tabs.replace(
  /export function ConfigTab\(\{ userId, config, updateConfig \}\)/,
  'export function ConfigTab({ userId, config, updateConfig, commitments, notes, summaries })'
);

fs.writeFileSync('src/components/Tabs.jsx', tabs, 'utf8');
console.log("Injected Audio Reader and Markdown Export!");
