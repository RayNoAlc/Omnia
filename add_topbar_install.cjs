const fs = require('fs');
let layout = fs.readFileSync('src/layouts/AppLayout.jsx', 'utf8');

const targetStr = "<button onClick={() => setMobileOpen(!mobileOpen)} style={{ color: T.ink }}>";
const replacementStr = "<div className=\"flex items-center gap-3\">\n" +
"            {deferredPrompt && (\n" +
"              <button onClick={handleInstallPwa} className=\"px-3 py-1.5 text-xs font-bold rounded-lg shadow-sm\" style={{ backgroundColor: T.brand, color: '#fff' }}>\n" +
"                Baixar App\n" +
"              </button>\n" +
"            )}\n" +
"            <button onClick={() => setMobileOpen(!mobileOpen)} style={{ color: T.ink }}>";

layout = layout.replace(targetStr, replacementStr);
layout = layout.replace(
  "{mobileOpen ? <X className=\"w-6 h-6\" /> : <Menu className=\"w-6 h-6\" />}\n          </button>",
  "{mobileOpen ? <X className=\"w-6 h-6\" /> : <Menu className=\"w-6 h-6\" />}\n            </button>\n          </div>"
);

fs.writeFileSync('src/layouts/AppLayout.jsx', layout, 'utf8');
