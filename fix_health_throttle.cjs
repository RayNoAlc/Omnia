const fs = require('fs');
let tabs = fs.readFileSync('src/components/Tabs.jsx', 'utf8');

const newHealthLogic = `
      const [lastHealthBreak, setLastHealthBreak] = useState(0);
      useEffect(() => {
        if (config?.enableHealthBreak === false) return;
        if (timer.isRunning && timer.phase === 'work') {
          const elapsed = (timer.workSeconds || 999999) - timer.remaining;
          const currentInterval = Math.floor(elapsed / 1200);
          
          if (currentInterval > 0 && currentInterval > lastHealthBreak) {
            setShowHealthBreak(true);
            setLastHealthBreak(currentInterval);
            setTimeout(() => setShowHealthBreak(false), 8000);
          }
        } else if (timer.phase !== 'work') {
          setLastHealthBreak(0);
        }
      }, [timer.remaining, timer.isRunning, timer.phase, config?.enableHealthBreak, timer.workSeconds, lastHealthBreak]);
`;

tabs = tabs.replace(
  /const \[showHealthBreak, setShowHealthBreak\] = useState\(false\);\s*useEffect\(\(\) => \{[\s\S]*?\}, \[timer\.remaining, timer\.isRunning, timer\.phase, config\?\.enableHealthBreak, timer\.duration\]\);/,
  'const [showHealthBreak, setShowHealthBreak] = useState(false);\n' + newHealthLogic
);

fs.writeFileSync('src/components/Tabs.jsx', tabs, 'utf8');
console.log("Fixed Health Break throttling bug!");
