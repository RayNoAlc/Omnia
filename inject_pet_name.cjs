const fs = require('fs');
let file = 'src/components/Tabs.jsx';
let content = fs.readFileSync(file, 'utf8');

const oldFocusPet = /function FocusPet\(\{ timerOn, streak \}\) \{[\s\S]*?return \([\s\S]*?<\/div>\s*\);\s*\}/;

const newFocusPet = `function FocusPet({ timerOn, streak, petName, onNameChange }) {
  const [editing, setEditing] = useState(false);
  const [tempName, setTempName] = useState(petName || "Coruja Omnia");

  let position = "0%";
  let status = "Dormindo...";
  
  if (timerOn) { position = "50%"; status = "Focando!"; }
  else if (streak > 5) { position = "100%"; status = "Mestre da Rotina"; }
  else if (streak > 0) { position = "100%"; status = "Animado"; }
  else { position = "0%"; status = "Esperando você estudar..."; }

  let animClass = "pet-breathe";
  if (timerOn) animClass = "pet-focus";
  else if (streak > 0) animClass = "pet-cool";

  const handleSave = () => {
    setEditing(false);
    if (onNameChange) onNameChange(tempName);
  };

  return (
    <div className="flex flex-col items-center justify-center p-4">
      <div 
        style={{
          width: 80, height: 80,
          backgroundImage: "url('/pet_sprites.png')",
          backgroundSize: "300% auto",
          backgroundPosition: \`\${position} 50%\`,
          marginBottom: 8,
          transition: "background-position 0.4s steps(1)",
          imageRendering: "pixelated"
        }}
        className={animClass}
      />
      
      {editing ? (
        <div className="flex items-center gap-2 mt-1">
          <input 
            autoFocus
            value={tempName}
            onChange={e => setTempName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSave()}
            onBlur={handleSave}
            className="text-sm font-bold text-center rounded px-2 py-1 outline-none"
            style={{ backgroundColor: T.surfaceAlt, color: T.ink, width: '120px' }}
          />
        </div>
      ) : (
        <div 
          className="text-sm font-bold cursor-pointer hover:opacity-80 transition-opacity" 
          style={{ color: T.ink }}
          onClick={() => setEditing(true)}
          title="Clique para renomear"
        >
          {petName || "Coruja Omnia"} ✏️
        </div>
      )}
      <div className="text-xs mt-1" style={{ color: T.inkSoft }}>{status}</div>
    </div>
  );
}`;

content = content.replace(oldFocusPet, newFocusPet);

// Also need to pass petName and onNameChange from FocoTab down to FocusPet
// In FocoTab props:
// export function FocoTab(props) {
// const { ..., config, updateConfig } = props;
content = content.replace(
  /export function FocoTab\(props\) \{/,
  'export function FocoTab(props) {\n  const { config, updateConfig } = props;'
);

// FocusPet instance:
// <FocusPet timerOn={timer.isRunning} streak={streak} />
content = content.replace(
  /<FocusPet timerOn=\{timer\.isRunning\} streak=\{streak\} \/>/g,
  '<FocusPet timerOn={timer.isRunning} streak={streak} petName={config?.petName} onNameChange={(n) => updateConfig({...config, petName: n})} />'
);

fs.writeFileSync(file, content, 'utf8');
console.log("Updated FocusPet!");
