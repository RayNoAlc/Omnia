const fs = require('fs');
let tabs = fs.readFileSync('src/components/Tabs.jsx', 'utf8');

// Add Maximize to lucide-react import
if (!tabs.includes('Maximize,')) {
  tabs = tabs.replace(/import \{\s*/, 'import {\n  Maximize, ');
}

// In FocoTab, add the fullscreenchange listener
const zenEffect = `
    useEffect(() => {
      const handleFsChange = () => {
        if (!document.fullscreenElement && isZen) {
          setIsZen(false);
        }
      };
      document.addEventListener('fullscreenchange', handleFsChange);
      return () => document.removeEventListener('fullscreenchange', handleFsChange);
    }, [isZen, setIsZen]);

    const toggleZen = () => {
      if (!isZen) {
        document.documentElement.requestFullscreen().catch(()=>{});
        setIsZen(true);
      } else {
        document.exitFullscreen().catch(()=>{});
        setIsZen(false);
      }
    };
`;

tabs = tabs.replace(
  /const \[roomCode, setRoomCode\] = useState\(""\);/,
  'const [roomCode, setRoomCode] = useState("");\n' + zenEffect
);

// Add the button
tabs = tabs.replace(
  /<GhostButton onClick=\{encerrar\}><X className="w-4 h-4" \/> Encerrar sessão<\/GhostButton>/,
  '<GhostButton onClick={encerrar}><X className="w-4 h-4" /> Encerrar sessão</GhostButton>\n              <GhostButton onClick={toggleZen} style={{ color: isZen ? T.brand : T.inkSoft }}><Maximize className="w-4 h-4" /> {isZen ? "Sair do Zen" : "Modo Zen"}</GhostButton>'
);

fs.writeFileSync('src/components/Tabs.jsx', tabs, 'utf8');
console.log("Fixed Zen Mode button and ESC listener!");
