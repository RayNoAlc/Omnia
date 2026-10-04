const fs = require('fs');

let code = fs.readFileSync('src/lib/useFocusTimer.js', 'utf8');

// add import
if (!code.includes('import { supabase }')) {
  code = code.replace('import { addSession as dbAddSession } from "./db";', 'import { addSession as dbAddSession } from "./db";\nimport { supabase } from "./supabaseClient";');
}

// add state
code = code.replace(
  'const phaseEndHandled = useRef(false);',
  `const phaseEndHandled = useRef(false);
  const [roomId, setRoomId] = useState(null);
  const [isHost, setIsHost] = useState(false);
  const channelRef = useRef(null);

  useEffect(() => {
    return () => {
      if (channelRef.current) supabase.removeChannel(channelRef.current);
    };
  }, []);

  const joinRoom = useCallback((id, host = false) => {
    if (channelRef.current) supabase.removeChannel(channelRef.current);
    setRoomId(id);
    setIsHost(host);
    const channel = supabase.channel(\`room_\${id}\`, { config: { broadcast: { ack: false } } });
    
    channel.on('broadcast', { event: 'focus_sync' }, ({ payload }) => {
      if (!host) {
        setPhase(payload.phase);
        setRunning(payload.running);
        setEndsAt(payload.endsAt);
        setPausedRemaining(payload.pausedRemaining);
        setCustomMin(payload.customMin);
        setPresetIdx(payload.presetIdx);
        setUseCustom(payload.useCustom);
      }
    }).subscribe();
    
    channelRef.current = channel;
  }, [setPhase, setRunning, setEndsAt, setPausedRemaining, setCustomMin, setPresetIdx, setUseCustom]);

  const leaveRoom = useCallback(() => {
    if (channelRef.current) supabase.removeChannel(channelRef.current);
    channelRef.current = null;
    setRoomId(null);
    setIsHost(false);
  }, []);

  const broadcast = useCallback((newState) => {
    if (channelRef.current && isHost) {
      channelRef.current.send({
        type: 'broadcast',
        event: 'focus_sync',
        payload: {
          phase, running, endsAt, pausedRemaining, customMin, presetIdx, useCustom,
          ...newState
        }
      });
    }
  }, [isHost, phase, running, endsAt, pausedRemaining, customMin, presetIdx, useCustom]);
`
);

// update methods
code = code.replace(
  /function iniciar\(\) \{[\s\S]*?setRunning\(true\);\s*\}/,
  `function iniciar() {
    setPhase("work");
    const e = Date.now() + workSeconds * 1000;
    setEndsAt(e);
    setRunning(true);
    broadcast({ phase: "work", endsAt: e, running: true });
  }`
);

code = code.replace(
  /function pausar\(\) \{[\s\S]*?setRunning\(false\);\s*\}/,
  `function pausar() {
    setPausedRemaining(remaining);
    setRunning(false);
    broadcast({ pausedRemaining: remaining, running: false });
  }`
);

code = code.replace(
  /function continuar\(\) \{[\s\S]*?setRunning\(true\);\s*\}/,
  `function continuar() {
    const e = Date.now() + pausedRemaining * 1000;
    setEndsAt(e);
    setRunning(true);
    broadcast({ endsAt: e, running: true });
  }`
);

code = code.replace(
  /function reiniciarCiclo\(\) \{[\s\S]*?setRunning\(false\);\s*\}/,
  `function reiniciarCiclo() {
    const base = phase === "rest" ? restSeconds : workSeconds;
    setRunning(false);
    setPausedRemaining(base);
    const e = Date.now() + base * 1000;
    setEndsAt(e);
    broadcast({ running: false, pausedRemaining: base, endsAt: e });
  }`
);

code = code.replace(
  /function encerrar\(\) \{[\s\S]*?setPhase\("idle"\);\s*\}/,
  `function encerrar() {
    setRunning(false);
    setPhase("idle");
    broadcast({ running: false, phase: "idle" });
  }`
);

// export new things
code = code.replace(
  'iniciar, pausar, continuar, reiniciarCiclo, encerrar,',
  'iniciar, pausar, continuar, reiniciarCiclo, encerrar, roomId, isHost, joinRoom, leaveRoom, broadcast,'
);

fs.writeFileSync('src/lib/useFocusTimer.js', code, 'utf8');

// Tabs.jsx
let tabs = fs.readFileSync('src/components/Tabs.jsx', 'utf8');

const roomUI = `
  const [showRoom, setShowRoom] = useState(false);
  const [roomCode, setRoomCode] = useState("");
  
  function createRoom() {
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    timer.joinRoom(code, true);
  }
`;

tabs = tabs.replace('const [lofiOn, setLofiOn] = useState(false);', 'const [lofiOn, setLofiOn] = useState(false);\n' + roomUI);

// add to return in timer object destructure
tabs = tabs.replace(
  'iniciar, pausar, continuar, reiniciarCiclo, encerrar,',
  'iniciar, pausar, continuar, reiniciarCiclo, encerrar, roomId, isHost, joinRoom, leaveRoom,'
);

// add UI to FocoTab setup
const renderRoomUI = `
      <Card className="mb-4">
        <SectionLabel>Sessão Compartilhada (Multiplayer)</SectionLabel>
        {roomId ? (
          <div className="flex items-center justify-between bg-green-500/10 p-3 rounded-lg border border-green-500/20">
            <div>
              <span className="font-bold text-green-600 block">Você está na sala: {roomId}</span>
              <span className="text-xs text-green-700/80">{isHost ? "Você é o Host (seu Pomodoro controla a sala)" : "Você é o Convidado (seu Pomodoro segue o Host)"}</span>
            </div>
            <button onClick={() => leaveRoom()} className="text-xs text-red-500 px-3 py-1 border border-red-500 rounded">Sair</button>
          </div>
        ) : (
          <div className="flex gap-2">
            <PrimaryButton onClick={createRoom} className="flex-1">Criar Sala</PrimaryButton>
            <input value={roomCode} onChange={e => setRoomCode(e.target.value)} placeholder="Código" className="w-24 p-2 text-sm rounded bg-transparent border border-gray-300" style={{ color: T.ink }} />
            <GhostButton onClick={() => joinRoom(roomCode, false)} disabled={!roomCode}>Entrar</GhostButton>
          </div>
        )}
      </Card>
`;

tabs = tabs.replace(
  '{/* Seleǜo de Disciplina */}',
  renderRoomUI + '\n      {/* Seleǜo de Disciplina */}'
);
tabs = tabs.replace(
  '{/* Seleção de Disciplina */}',
  renderRoomUI + '\n      {/* Seleção de Disciplina */}'
);

fs.writeFileSync('src/components/Tabs.jsx', tabs, 'utf8');

console.log("Multiplayer injected");
