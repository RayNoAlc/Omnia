const fs = require('fs');
let tabs = fs.readFileSync('src/components/Tabs.jsx', 'utf8');

const spotifyHtml = `
            {/* Player Spotify (Idea 15) */}
            <div className="mt-8">
              <h3 className="font-bold mb-3 text-sm flex items-center gap-2" style={{ color: T.inkSoft }}><Headphones className="w-4 h-4" /> Som para Focar (Spotify)</h3>
              {!config?.spotifyUrl ? (
                <div className="flex gap-2">
                  <input type="text" placeholder="Cole o link de uma Playlist do Spotify..." className="flex-1 text-sm p-2 rounded-md" style={{ backgroundColor: T.surface, color: T.ink, border: \`1px solid \${T.border}\` }} onKeyDown={(e) => {
                    if(e.key === 'Enter' && e.target.value.includes('spotify.com')) {
                      const url = e.target.value;
                      const match = url.match(/(playlist|album|track)\/([a-zA-Z0-9]+)/);
                      if (match) {
                        handleConfigChange({ ...config, spotifyUrl: match[0] });
                      } else {
                        alert("Link inválido. Copie o link do Spotify.");
                      }
                    }
                  }} />
                  <GhostButton onClick={() => alert("Copie o link no app do Spotify: Compartilhar > Copiar Link e cole aqui, apertando Enter.")}>?</GhostButton>
                </div>
              ) : (
                <div className="relative group">
                  <iframe style={{ borderRadius: '12px' }} src={\`https://open.spotify.com/embed/\${config.spotifyUrl}?utm_source=generator&theme=0\`} width="100%" height="152" frameBorder="0" allowFullScreen="" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy"></iframe>
                  <button onClick={() => handleConfigChange({ ...config, spotifyUrl: null })} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg" title="Remover Playlist"><X className="w-3 h-3" /></button>
                </div>
              )}
            </div>
`;

tabs = tabs.replace(
  /\{\/\* Timer de Foco \*\/\}[\s\S]*?<div className="w-full flex justify-center mb-6">\s*<div className="w-64">[\s\S]*?<\/div>\s*<\/div>/,
  match => match + '\n' + spotifyHtml
);

fs.writeFileSync('src/components/Tabs.jsx', tabs, 'utf8');
console.log("Injected Spotify Player!");
