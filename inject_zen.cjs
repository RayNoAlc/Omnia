const fs = require('fs');

let tabs = fs.readFileSync('src/components/Tabs.jsx', 'utf8');

// Add Maximize and Minimize to lucide-react import
if (!tabs.includes('Maximize,')) {
  tabs = tabs.replace(/import \{\s*/, 'import {\n  Maximize, Minimize, ');
}

// Modify FocoTab signature
tabs = tabs.replace(
  /export function FocoTab\(props\) \{/,
  'export function FocoTab(props) {\n    const { isZen, setIsZen } = props;'
);

// Add the Zen Mode button in FocoTab
// We will put it right next to the Room Code / Lofi buttons
const zenButtonHtml = `
          <button
            onClick={() => {
              if (!isZen && document.documentElement.requestFullscreen) {
                document.documentElement.requestFullscreen().catch(()=>{});
              } else if (isZen && document.exitFullscreen) {
                document.exitFullscreen().catch(()=>{});
              }
              setIsZen(!isZen);
            }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl transition-all font-bold"
            style={{ backgroundColor: isZen ? T.brand : T.surfaceAlt, color: isZen ? T.bg : T.inkSoft }}
          >
            {isZen ? <Minimize size={18} /> : <Maximize size={18} />}
            {isZen ? "Sair do Zen" : "Modo Zen"}
          </button>
`;

// Insert the zenButtonHtml right before Lofi button
tabs = tabs.replace(
  /(\{\s*config\?\.enableLofi &&\s*\(\s*<button\s*onClick=\{.*?setLofiOn)/,
  zenButtonHtml + '\n          $1'
);

fs.writeFileSync('src/components/Tabs.jsx', tabs, 'utf8');
console.log("Updated FocoTab with Zen Mode button!");
