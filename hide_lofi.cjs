const fs = require('fs');
let tabs = fs.readFileSync('src/components/Tabs.jsx', 'utf8');

const targetStr = '<GhostButton onClick={() => setLofiOn(!lofiOn)}';

tabs = tabs.replace(
  '<div className="flex items-center justify-center gap-2 mt-4">\n              <GhostButton onClick={() => setLofiOn(!lofiOn)} style={{ color: lofiOn ? T.brand : T.inkSoft }}>\n                <Headphones className="w-4 h-4" /> {lofiOn ? \'Lo-Fi: Ligado\' : \'Lo-Fi: Desligado\'}\n              </GhostButton>\n            </div>',
  '{props.config?.enableLofi !== false && (\n            <div className="flex items-center justify-center gap-2 mt-4">\n              <GhostButton onClick={() => setLofiOn(!lofiOn)} style={{ color: lofiOn ? T.brand : T.inkSoft }}>\n                <Headphones className="w-4 h-4" /> {lofiOn ? \'Lo-Fi: Ligado\' : \'Lo-Fi: Desligado\'}\n              </GhostButton>\n            </div>\n            )}'
);

fs.writeFileSync('src/components/Tabs.jsx', tabs, 'utf8');
