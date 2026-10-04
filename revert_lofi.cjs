const fs = require('fs');
let tabs = fs.readFileSync('src/components/Tabs.jsx', 'utf8');

const toggleCode = "            <div className=\"flex items-center justify-center gap-2 mt-4\">\n" +
"              <GhostButton onClick={() => setLofiOn(!lofiOn)} style={{ color: lofiOn ? T.brand : T.inkSoft }}>\n" +
"                <Headphones className=\"w-4 h-4\" /> {lofiOn ? 'Lo-Fi: Ligado' : 'Lo-Fi: Desligado'}\n" +
"              </GhostButton>\n" +
"            </div>\n" +
"            {lofiOn && <iframe width=\"2\" height=\"2\" src=\"https://www.youtube.com/embed/jfKfPfyJRdk?autoplay=1\" allow=\"autoplay\" style={{ opacity: 0.01, position: 'absolute' }} />}\n";

tabs = tabs.replace(toggleCode, "");

fs.writeFileSync('src/components/Tabs.jsx', tabs, 'utf8');
