const fs = require('fs');
let tabs = fs.readFileSync('src/components/Tabs.jsx', 'utf8');

const storeHtml = `
function FocusPet({ timerOn, streak, petName, onNameChange, config, updateConfig, phase, remaining }) {
  const [editing, setEditing] = useState(false);
  const [tempName, setTempName] = useState(petName || "Coruja Omnia");
  const [showStore, setShowStore] = useState(false);

  const HATS = [
    { id: 'none', icon: '', price: 0, name: 'Sem Chapéu' },
    { id: 'cap', icon: '🧢', price: 100, name: 'Boné' },
    { id: 'crown', icon: '👑', price: 500, name: 'Coroa' },
    { id: 'grad', icon: '🎓', price: 300, name: 'Formatura' },
    { id: 'tophat', icon: '🎩', price: 200, name: 'Cartola' },
    { id: 'cowboy', icon: '🤠', price: 250, name: 'Cowboy' },
    { id: 'party', icon: '🥳', price: 50, name: 'Festa' },
  ];

  const coins = config?.coins || 0;
  const ownedHats = config?.ownedHats || ['none'];
  const currentHatId = config?.petHat || 'none';
  const currentHat = HATS.find(h => h.id === currentHatId)?.icon || '';

  const buyHat = (hat) => {
    if (ownedHats.includes(hat.id)) {
      updateConfig({ ...config, petHat: hat.id });
    } else if (coins >= hat.price) {
      if(confirm(\`Comprar \${hat.name} por \${hat.price} moedas?\`)) {
        updateConfig({ ...config, coins: coins - hat.price, ownedHats: [...ownedHats, hat.id], petHat: hat.id });
      }
    } else {
      alert("Você não tem moedas suficientes! Complete mais blocos de foco.");
    }
  };

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
    }, 30000);
    return () => clearInterval(interval);
  }, [phase, config?.enableSincereOwl]);

  let position = "0%";
  let status = "Dormindo...";
  if (timerOn) { position = "50%"; status = "Focando!"; }
  else if (streak > 5) { position = "100%"; status = "Mestre da Rotina"; }
  else if (streak > 0) { position = "100%"; status = "Animado"; }
  else { position = "0%"; status = "Esperando você estudar..."; }

  return (
    <div className="flex flex-col items-center gap-2 relative mt-4">
      {showStore && (
        <div className="absolute bottom-full mb-4 bg-white dark:bg-gray-800 border p-4 rounded-xl shadow-xl w-64 z-50">
          <div className="flex justify-between items-center mb-2">
            <h4 className="font-bold text-sm">Loja da Coruja</h4>
            <div className="text-sm font-mono text-yellow-500 font-bold">🪙 {coins}</div>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {HATS.map(hat => {
              const owned = ownedHats.includes(hat.id);
              const selected = currentHatId === hat.id;
              return (
                <button key={hat.id} onClick={() => buyHat(hat)} className={\`p-2 text-center rounded border transition-all \${selected ? 'ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-900/30' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}\`}>
                  <div className="text-2xl mb-1">{hat.icon || '🦉'}</div>
                  <div className="text-[10px] truncate">{owned ? 'Usar' : \`🪙 \${hat.price}\`}</div>
                </button>
              );
            })}
          </div>
          <button onClick={() => setShowStore(false)} className="mt-3 w-full text-xs text-center text-gray-500">Fechar</button>
        </div>
      )}

      {bubble && (
        <div className="absolute bottom-[80px] bg-white dark:bg-gray-800 border shadow-lg rounded-xl px-3 py-2 text-sm z-10 animate-bounce">
          {bubble}
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-r-[6px] border-t-[8px] border-l-transparent border-r-transparent border-t-white dark:border-t-gray-800"></div>
        </div>
      )}

      <div className="w-24 h-24 rounded-full overflow-hidden border-2 relative cursor-pointer group" style={{ borderColor: T.border, backgroundColor: T.surfaceAlt }} onClick={() => setShowStore(!showStore)}>
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity z-20">
          <span className="text-white text-xs font-bold">🪙 Loja</span>
        </div>
        {currentHat && <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 text-4xl z-10 select-none pointer-events-none drop-shadow-md">{currentHat}</div>}
        <div className="flex w-[300%] h-full transition-transform duration-500 ease-in-out" style={{ transform: \`translateX(-\${position})\` }}>
          <div className="w-1/3 h-full flex items-center justify-center text-5xl">😴</div>
          <div className="w-1/3 h-full flex items-center justify-center text-5xl animate-bounce">📖</div>
          <div className="w-1/3 h-full flex items-center justify-center text-5xl">🦉</div>
        </div>
      </div>
      <div className="text-center">
        {editing ? (
          <input
            autoFocus
            className="text-xs font-bold text-center bg-transparent border-b outline-none"
            style={{ color: T.ink, borderColor: T.border }}
            value={tempName}
            onChange={(e) => setTempName(e.target.value)}
            onBlur={() => { setEditing(false); onNameChange(tempName); }}
            onKeyDown={(e) => { if(e.key==='Enter') e.target.blur(); }}
          />
        ) : (
          <div className="text-xs font-bold cursor-pointer hover:underline" style={{ color: T.ink }} onClick={() => setEditing(true)}>
            {tempName}
          </div>
        )}
        <div className="text-[10px]" style={{ color: T.inkSoft }}>{status}</div>
      </div>
    </div>
  );
}
`;

tabs = tabs.replace(
  /function FocusPet\(\{[\s\S]*?<\/div>\s*<\/div>\s*\)\;\s*\}/,
  storeHtml
);

// We need to pass updateConfig to FocusPet
tabs = tabs.replace(
  /<FocusPet timerOn=\{phase === "work" && running\} streak=\{streak\} petName=\{config\?\.petName\} onNameChange=\{\(n\) => updateConfig\(\{...config, petName: n\}\)\} \/>/,
  '<FocusPet timerOn={phase === "work" && running} streak={streak} petName={config?.petName} onNameChange={(n) => updateConfig({...config, petName: n})} config={config} updateConfig={updateConfig} phase={phase} />'
);

fs.writeFileSync('src/components/Tabs.jsx', tabs, 'utf8');
console.log("Injected Owl Store!");
