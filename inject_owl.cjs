const fs = require('fs');
let tabs = fs.readFileSync('src/components/Tabs.jsx', 'utf8');

// Update FocusPet signature
tabs = tabs.replace(
  /function FocusPet\(\{ timerOn, streak, petName, onNameChange \}\) \{/,
  'function FocusPet({ timerOn, streak, petName, onNameChange, config, phase, remaining }) {'
);

const owlLogic = `
    const [bubble, setBubble] = useState(null);
    useEffect(() => {
      if (config?.enableSincereOwl === false) return;
      const phrases = {
        idle: ["Pronto para começar?", "Um pomodoro por dia...", "A procrastinação é sua inimiga!"],
        work: ["Foco total!", "Não olhe para o celular...", "Continue assim!"],
        rest: ["Respire fundo...", "Beba uma água!", "Estique as pernas um pouquinho."]
      };
      
      const interval = setInterval(() => {
        if (Math.random() > 0.3) {
          const arr = phrases[phase] || phrases.idle;
          setBubble(arr[Math.floor(Math.random() * arr.length)]);
          setTimeout(() => setBubble(null), 8000);
        }
      }, 30000); // Check every 30 seconds
      return () => clearInterval(interval);
    }, [phase, config?.enableSincereOwl]);
`;

tabs = tabs.replace(
  /const \[tempName, setTempName\] = useState\(petName \|\| "Coruja Omnia"\);/,
  'const [tempName, setTempName] = useState(petName || "Coruja Omnia");\n' + owlLogic
);

// Add the bubble div rendering inside FocusPet
tabs = tabs.replace(
  /<div \s*style=\{\{\s*width: 80, height: 80,/,
  `{bubble && (
          <div className="absolute -top-10 bg-white border shadow-md text-xs px-3 py-1 rounded-2xl animate-fade-in z-10" style={{ color: '#000', borderColor: T.border, whiteSpace: 'nowrap' }}>
            {bubble}
            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-white border-b border-r transform rotate-45" style={{ borderColor: T.border }}></div>
          </div>
        )}
        <div 
          style={{
            width: 80, height: 80,`
);

// FocusPet needs relative positioning for absolute bubble
tabs = tabs.replace(
  /<div className="flex flex-col items-center justify-center p-4">/,
  '<div className="flex flex-col items-center justify-center p-4 relative">'
);

// Update FocoTab to pass config and phase and remaining to FocusPet
tabs = tabs.replace(
  /<FocusPet timerOn=\{timer\.isRunning\} streak=\{streak\} petName=\{config\?\.petName\} onNameChange=\{\(n\) => updateConfig\(\{ \.\.\.config, petName: n \}\)\} \/>/,
  '<FocusPet timerOn={timer.isRunning} streak={streak} petName={config?.petName} onNameChange={(n) => updateConfig({ ...config, petName: n })} config={config} phase={timer.phase} remaining={timer.remaining} />'
);

fs.writeFileSync('src/components/Tabs.jsx', tabs, 'utf8');
console.log("Injected Sincere Owl logic!");
