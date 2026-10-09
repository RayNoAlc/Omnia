const fs = require('fs');
let tabs = fs.readFileSync('src/components/Tabs.jsx', 'utf8');

const pacerHtml = `
                {/* Speed Reading Pacer (Idea 3) */}
                <div className="flex items-center gap-2 mb-3 p-2 rounded-lg border" style={{ backgroundColor: T.surfaceAlt, borderColor: T.border }}>
                  <Activity className="w-4 h-4" style={{ color: T.brand }} />
                  <span className="text-xs font-bold" style={{ color: T.ink }}>Metrônomo de Leitura:</span>
                  <input type="number" id="pacerBpm" defaultValue={60} min={30} max={300} className="w-16 text-xs p-1 rounded" style={{ backgroundColor: T.bg, color: T.ink, border: \`1px solid \${T.border}\` }} />
                  <span className="text-xs" style={{ color: T.inkSoft }}>BPM</span>
                  <GhostButton className="text-xs px-2 py-1 ml-auto" onClick={() => {
                    if (window.readingPacerInterval) {
                      clearInterval(window.readingPacerInterval);
                      window.readingPacerInterval = null;
                      alert("Metrônomo parado.");
                    } else {
                      const bpm = parseInt(document.getElementById('pacerBpm').value) || 60;
                      const ms = (60 / bpm) * 1000;
                      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
                      window.readingPacerInterval = setInterval(() => {
                        const osc = audioCtx.createOscillator();
                        osc.type = "sine";
                        osc.frequency.setValueAtTime(800, audioCtx.currentTime);
                        osc.connect(audioCtx.destination);
                        osc.start();
                        osc.stop(audioCtx.currentTime + 0.05);
                      }, ms);
                      alert(\`Metrônomo iniciado a \${bpm} BPM! Leia uma linha por bipe. Feche a aba ou clique de novo para parar.\`);
                    }
                  }}>▶️ Tocar / Parar</GhostButton>
                </div>
`;

// Inject into CompromissoWorkspaceModal resumo
tabs = tabs.replace(
  /<textarea value=\{resumoDraft\} onChange=\{\(e\) => \{ setResumoDraft\(e\.target\.value\); setResumoSalvo\(false\); \}\} rows=\{7\}/,
  pacerHtml + '\n                  <textarea value={resumoDraft} onChange={(e) => { setResumoDraft(e.target.value); setResumoSalvo(false); }} rows={7}'
);

// Inject into DisciplinaCard resumo
tabs = tabs.replace(
  /<textarea value=\{resumoDraft\} onChange=\{\(e\) => \{ setResumoDraft\(e\.target\.value\); setResumoSalvo\(false\); \}\} rows=\{8\}/,
  pacerHtml + '\n                <textarea value={resumoDraft} onChange={(e) => { setResumoDraft(e.target.value); setResumoSalvo(false); }} rows={8}'
);

fs.writeFileSync('src/components/Tabs.jsx', tabs, 'utf8');
console.log("Injected Speed Reading Pacer!");
