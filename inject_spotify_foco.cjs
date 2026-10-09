const fs = require('fs');
let tabs = fs.readFileSync('src/components/Tabs.jsx', 'utf8');

const spotifyHtml = `
              {props.config?.enableLofi !== false && (
              <div className="flex flex-col items-center justify-center gap-4 mt-6 w-full max-w-sm mx-auto">
                {lofiOn && <audio src="https://stream.zeno.fm/f3wvbbqmdg8uv" autoPlay loop />}
                
                {/* Spotify Integrado (Idea 15) */}
                <div className="w-full">
                  {!props.config?.spotifyUrl ? (
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-2">
                        <input type="text" placeholder="Link Playlist Spotify..." className="flex-1 text-sm p-2 rounded-md outline-none" style={{ backgroundColor: T.surfaceAlt, color: T.ink, border: \`1px solid \${T.border}\` }} onKeyDown={(e) => {
                          if(e.key === 'Enter') {
                            const url = e.target.value;
                            const match = url.match(/(playlist|album|track|show|episode)\/([a-zA-Z0-9]+)/);
                            if (match) {
                              props.updateConfig({ ...props.config, spotifyUrl: \`\${match[1]}/\${match[2]}\` });
                            } else {
                              alert("Link inválido. Cole um link do Spotify (playlist, track, etc).");
                            }
                          }
                        }} />
                      </div>
                      <div className="flex gap-2">
                        <GhostButton className="flex-1 text-xs" onClick={() => setLofiOn(!lofiOn)} style={{ color: lofiOn ? T.brand : T.inkSoft }}>
                          <Headphones className="w-4 h-4 mr-1" /> {lofiOn ? 'Rádio Lo-Fi Ligada' : 'Ligar Rádio Lo-Fi'}
                        </GhostButton>
                      </div>
                    </div>
                  ) : (
                    <div className="relative group w-full">
                      <iframe style={{ borderRadius: '12px' }} src={\`https://open.spotify.com/embed/\${props.config.spotifyUrl}?utm_source=generator&theme=0\`} width="100%" height="152" frameBorder="0" allowFullScreen="" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy"></iframe>
                      <button onClick={() => props.updateConfig({ ...props.config, spotifyUrl: null })} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg z-10" title="Remover Playlist"><X className="w-3 h-3" /></button>
                    </div>
                  )}
                </div>
              </div>
              )}
`;

tabs = tabs.replace(
  /\{props\.config\?\.enableLofi !== false && \([\s\S]*?\{lofiOn \? 'Lo-Fi: Ligado' : 'Lo-Fi: Desligado'\}[\s\S]*?<\/GhostButton>[\s\S]*?<\/div>[\s\S]*?\)\}/,
  spotifyHtml
);

fs.writeFileSync('src/components/Tabs.jsx', tabs, 'utf8');
console.log("Injected Spotify!");
