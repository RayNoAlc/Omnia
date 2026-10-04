const fs = require('fs');
let tabs = fs.readFileSync('src/components/Tabs.jsx', 'utf8');

const target = "<GhostButton onClick={encerrar}><X className=\"w-4 h-4\" />";
const idx1 = tabs.indexOf(target);
if (idx1 !== -1) {
  const targetEnd = "            </div>\n";
  const idx2 = tabs.indexOf(targetEnd, idx1);
  if (idx2 !== -1) {
    const before = tabs.slice(0, idx2 + "            </div>\n".length);
    const after = tabs.slice(idx2 + "            </div>\n".length);
    
    const toggleCode = "            <div className=\"flex items-center justify-center gap-2 mt-4\">\n" +
"              <GhostButton onClick={() => setLofiOn(!lofiOn)} style={{ color: lofiOn ? T.brand : T.inkSoft }}>\n" +
"                <Headphones className=\"w-4 h-4\" /> {lofiOn ? 'Lo-Fi: Ligado' : 'Lo-Fi: Desligado'}\n" +
"              </GhostButton>\n" +
"            </div>\n" +
"            {lofiOn && <iframe width=\"2\" height=\"2\" src=\"https://www.youtube.com/embed/jfKfPfyJRdk?autoplay=1\" allow=\"autoplay\" style={{ opacity: 0.01, position: 'absolute' }} />}\n";

    fs.writeFileSync('src/components/Tabs.jsx', before + toggleCode + after, 'utf8');
    console.log("Success");
  } else { console.log("End not found"); }
} else { console.log("Start not found"); }
