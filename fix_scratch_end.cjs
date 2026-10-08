const fs = require('fs');
let tabs = fs.readFileSync('src/components/Tabs.jsx', 'utf8');

const targetStr = `      <div className="flex items-center gap-2 pt-3" style={{ borderTop: \`1px solid \${T.border}\` }}>
        <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && send()} placeholder="Pergunte ou pe\uFFFD\uFFFDa uma mudan\uFFFD\uFFFDa na rotina..." className="flex-1 rounded-md p-2.5 text-sm outline-none" style={{ backgroundColor: T.surfaceAlt, border: \`1px solid \${T.border}\`, color: T.ink }} />
        <PrimaryButton onClick={send} disabled={loading || !input.trim()}><Send className="w-4 h-4" /></PrimaryButton>
      </div>
    </div>
  );
}`;

// I will just use regex to replace the end of SecretariaTab safely.
// Let's find "      </div>\r\n    </div>\r\n  );\r\n}"
// Since there's mojibake in the input placeholder, it's safer to match just the button and the end tags.

const replacement = `
        <PrimaryButton onClick={send} disabled={loading || !input.trim()}><Send className="w-4 h-4" /></PrimaryButton>
      </div>
    </div>
    
    {config?.enableScratchpad !== false && (
      <div className="flex flex-col w-full lg:w-1/3 border rounded-xl p-4 shadow-sm" style={{ backgroundColor: T.surfaceAlt, borderColor: T.border }}>
        <h3 className="font-bold mb-4 flex items-center gap-2" style={{ color: T.ink }}><Edit3 size={18} /> Lousa em Branco</h3>
        <textarea
          value={scratch}
          onChange={(e) => setScratch(e.target.value)}
          placeholder="Use este espaço para rascunhos rápidos ou anotações enquanto conversa com a IA..."
          className="flex-1 w-full bg-transparent border-none outline-none resize-none text-sm"
          style={{ color: T.inkSoft }}
        />
      </div>
    )}
  </div>
  );
}`;

tabs = tabs.replace(/<PrimaryButton onClick=\{send\} disabled=\{loading \|\| !input\.trim\(\)\}\><Send className="w-4 h-4" \/><\/PrimaryButton>\s*<\/div>\s*<\/div>\s*\);\s*\}/m, replacement);

fs.writeFileSync('src/components/Tabs.jsx', tabs, 'utf8');
console.log("Fixed Scratchpad closing tags!");
