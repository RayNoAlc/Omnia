const fs = require('fs');
let tabs = fs.readFileSync('src/components/Tabs.jsx', 'utf8');

const newFocusPet = `
function FocusPet({ timerOn, streak }) {
  let position = "0%";
  let status = "Dormindo...";
  
  if (timerOn) { position = "50%"; status = "Focando!"; }
  else if (streak > 5) { position = "100%"; status = "Mestre da Rotina"; }
  else if (streak > 0) { position = "100%"; status = "Animado"; }
  else { position = "0%"; status = "Esperando você estudar..."; }

  return (
    <div className="flex flex-col items-center justify-center p-4">
      <div 
        style={{
          width: 80, height: 80,
          backgroundImage: "url('/pet_sprites.png')",
          backgroundSize: "300% 100%",
          backgroundPosition: \`\${position} 50%\`,
          marginBottom: 8,
          transition: "background-position 0.4s steps(1)",
          imageRendering: "pixelated"
        }}
        className={timerOn ? "animate-bounce" : ""}
      />
      <div className="text-sm font-bold" style={{ color: T.ink }}>Coruja Omnia</div>
      <div className="text-xs" style={{ color: T.inkSoft }}>{status}</div>
    </div>
  );
}
`;

tabs = tabs.replace(
  /function FocusPet\(\{ timerOn, streak \}\) \{[\s\S]*?return \([\s\S]*?<\/Card>\s*\);\s*\}/,
  newFocusPet.trim()
);

fs.writeFileSync('src/components/Tabs.jsx', tabs, 'utf8');
