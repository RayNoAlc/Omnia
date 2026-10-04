const fs = require('fs');
let tabs = fs.readFileSync('src/components/Tabs.jsx', 'utf8');

const searchStr = '          </PrimaryButton>\n        </Card>';
const index = tabs.indexOf(searchStr, tabs.indexOf('Iniciar sess'));

if (index !== -1) {
  const injectionBlock = `
        <Card>
          <div className="flex flex-col gap-3">
            <FocusPet timerOn={false} streak={streak} />
            <div className="border-t pt-3 mt-1" style={{ borderColor: T.border }}>
              <div className="flex justify-between items-center cursor-pointer" onClick={() => setShowRoom(!showRoom)}>
                <SectionLabel>🌐 Modo Multiplayer</SectionLabel>
                <span className="text-xs" style={{ color: T.brand }}>{showRoom ? "Esconder" : "Mostrar"}</span>
              </div>
              {showRoom && (
                <div className="mt-3 flex flex-col gap-2">
                  <PrimaryButton onClick={createRoom} className="w-full text-xs">Criar Sala de Estudos</PrimaryButton>
                  <div className="flex gap-2">
                    <input value={roomCode} onChange={e => setRoomCode(e.target.value)} placeholder="Código da sala" className="flex-1 rounded p-1.5 text-xs text-center" style={{ backgroundColor: T.surfaceAlt, color: T.ink, border: \`1px solid \${T.border}\` }} />
                    <GhostButton onClick={() => timer.joinRoom(roomCode, false)} className="text-xs" disabled={!roomCode}>Entrar</GhostButton>
                  </div>
                </div>
              )}
            </div>
          </div>
        </Card>
`;

  tabs = tabs.substring(0, index + searchStr.length) + '\n' + injectionBlock + tabs.substring(index + searchStr.length);
  fs.writeFileSync('src/components/Tabs.jsx', tabs, 'utf8');
  console.log("Injected successfully!");
} else {
  console.log("Could not find the injection point.");
}
