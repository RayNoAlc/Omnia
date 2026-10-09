const fs = require('fs');
let tabs = fs.readFileSync('src/components/Tabs.jsx', 'utf8');

tabs = tabs.replace(
  /\{lofiOn && <audio src="https:\/\/stream\.zeno\.fm\/f3wvbbqmdg8uv" autoPlay loop \/>\}/,
  `{lofiSrc && <audio src={lofiSrc} autoPlay loop />}
                  <div className="text-xs uppercase font-bold opacity-50 mb-1" style={{ color: T.ink }}>Sons de Foco</div>
                  <div className="flex flex-wrap justify-center gap-2 mb-4">
                    {[
                      { id: null, label: "Silêncio", icon: "🔇" },
                      { id: "https://stream.zeno.fm/f3wvbbqmdg8uv", label: "Lo-Fi", icon: "🎧" },
                      { id: "https://cdn.freesound.org/previews/189/189043_1955047-lq.mp3", label: "Chuva", icon: "🌧️" },
                      { id: "https://cdn.freesound.org/previews/208/208579_3735166-lq.mp3", label: "Café", icon: "☕" },
                      { id: "https://cdn.freesound.org/previews/209/209590_3905081-lq.mp3", label: "Fogueira", icon: "🔥" }
                    ].map(s => (
                      <button key={s.label} onClick={() => setLofiSrc(s.id)} className={\`px-3 py-1.5 text-xs font-bold rounded-full transition-all \${lofiSrc === s.id ? "shadow-md scale-105" : "opacity-60 hover:opacity-100"}\`} style={{ backgroundColor: lofiSrc === s.id ? T.brand : T.surfaceAlt, color: lofiSrc === s.id ? T.brandInk : T.ink }}>
                        {s.icon} {s.label}
                      </button>
                    ))}
                  </div>`
);

tabs = tabs.replace(
  /const \[lofiOn, setLofiOn\] = useState\(false\);/,
  'const [lofiSrc, setLofiSrc] = useState(null);'
);

fs.writeFileSync('src/components/Tabs.jsx', tabs, 'utf8');
console.log("Injected Dynamic Sounds carefully!");
