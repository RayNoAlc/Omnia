const fs = require('fs');
let tabs = fs.readFileSync('src/components/Tabs.jsx', 'utf8');

// FocoTab Sound Player replacement
const soundHtml = `
                {props.config?.enableLofi !== false && (
                  <div className="flex flex-col items-center justify-center gap-2 mt-6 w-full max-w-sm mx-auto">
                    {lofiSrc && <audio src={lofiSrc} autoPlay loop />}
                    <div className="text-xs uppercase font-bold opacity-50 mb-1" style={{ color: T.ink }}>Sons de Foco</div>
                    <div className="flex flex-wrap justify-center gap-2">
                      {[
                        { id: null, label: "Silêncio", icon: "🔇" },
                        { id: "https://stream.zeno.fm/f3wvbbqmdg8uv", label: "Lo-Fi", icon: "🎧" },
                        { id: "https://dl.espressive.com/rain.mp3", label: "Chuva", icon: "🌧️" },
                        { id: "https://dl.espressive.com/cafe.mp3", label: "Café", icon: "☕" },
                        { id: "https://dl.espressive.com/fire.mp3", label: "Fogueira", icon: "🔥" }
                      ].map(s => (
                        <button key={s.label} onClick={() => setLofiSrc(s.id)} className={\`px-3 py-1.5 text-xs font-bold rounded-full transition-all \${lofiSrc === s.id ? "shadow-md scale-105" : "opacity-60 hover:opacity-100"}\`} style={{ backgroundColor: lofiSrc === s.id ? T.brand : T.surfaceAlt, color: lofiSrc === s.id ? T.brandInk : T.ink }}>
                          {s.icon} {s.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
`;

tabs = tabs.replace(
  /\{props\.config\?\.enableLofi !== false && \([\s\S]*?\{lofiOn && <audio src="https:\/\/stream\.zeno\.fm\/f3wvbbqmdg8uv" autoPlay loop \/>\}[\s\S]*?<\/div>\s*\)\}/,
  soundHtml
);

tabs = tabs.replace(
  /const \[lofiOn, setLofiOn\] = useState\(false\);/,
  'const [lofiSrc, setLofiSrc] = useState(null);'
);

fs.writeFileSync('src/components/Tabs.jsx', tabs, 'utf8');
console.log("Injected Dynamic Sounds!");
