const fs = require('fs');
let tabs = fs.readFileSync('src/components/Tabs.jsx', 'utf8');

const breathingBtnHtml = `
              <div className="border-t pt-3 mt-1 w-full max-w-sm mx-auto" style={{ borderColor: T.border }}>
                <GhostButton className="w-full text-xs flex justify-center py-2" onClick={() => window.dispatchEvent(new Event('openBreathing'))}>
                  <Wind className="w-4 h-4 mr-2" /> Técnica de Respiração (Ansiedade)
                </GhostButton>
              </div>
`;

tabs = tabs.replace(
  /<div className="border-t pt-3 mt-1" style=\{\{ borderColor: T\.border \}\}>/,
  breathingBtnHtml + '\n              <div className="border-t pt-3 mt-1" style={{ borderColor: T.border }}>'
);

// We need state in FocoTab to show BreathingModal. We can just use an event listener inside FocoTab.
tabs = tabs.replace(
  /const \[roomCode, setRoomCode\] = useState\(""\);/,
  'const [roomCode, setRoomCode] = useState("");\n  const [showBreathing, setShowBreathing] = useState(false);\n  useEffect(() => {\n    const handler = () => setShowBreathing(true);\n    window.addEventListener("openBreathing", handler);\n    return () => window.removeEventListener("openBreathing", handler);\n  }, []);'
);

// Render BreathingModal inside FocoTab
tabs = tabs.replace(
  /\{showRoom && \(/,
  '{showBreathing && <BreathingModal onClose={() => setShowBreathing(false)} T={props.T || T} />}\n      {showRoom && ('
);

fs.writeFileSync('src/components/Tabs.jsx', tabs, 'utf8');
console.log("Injected Breathing Button!");
