const fs = require('fs');
let tabs = fs.readFileSync('src/components/Tabs.jsx', 'utf8');

// Inject the Dev QA Panel
const devQAPanel = `
// Dev QA Component
function QAAutomatedSystem({ userId }) {
  const [logs, setLogs] = useState([]);
  const [running, setRunning] = useState(false);

  const addLog = (msg, type = "info") => setLogs(prev => [...prev, { time: new Date().toLocaleTimeString(), msg, type }]);

  async function runAllTests() {
    setRunning(true);
    setLogs([]);
    addLog("Iniciando bateria de testes automatizados QA...", "info");

    // 1. Storage Test
    try {
      addLog("Testando LocalStorage e IndexedDB...", "info");
      localStorage.setItem("qa_test", "ok");
      if (localStorage.getItem("qa_test") !== "ok") throw new Error("LocalStorage falhou");
      localStorage.removeItem("qa_test");
      addLog("Storage OK.", "success");
    } catch(e) { addLog("Erro Storage: " + e.message, "error"); }

    // 2. Database CRUD Test
    try {
      addLog("Testando Supabase CRUD...", "info");
      const tempId = "qa-" + Math.random().toString(36).substr(2, 5);
      const { addCommitment, deleteCommitment } = require("../lib/db");
      const c = await addCommitment(userId, { tipo: 'outro', disciplina: 'QA_TEST', assunto: 'Teste Automatizado', prazo: '2099-12-31', concluido: false });
      if (!c || !c.id) throw new Error("Falha ao inserir compromisso.");
      await deleteCommitment(c.id);
      addLog("Supabase CRUD OK.", "success");
    } catch(e) { addLog("Erro Supabase: " + e.message, "error"); }

    // 3. AI Connection Test
    try {
      addLog("Testando conexão Groq (callAI)...", "info");
      const { callAI } = require("../lib/ai");
      const res = await callAI("Responda apenas 'OK'", "Teste de QA", { json: false });
      if (!res.includes("OK")) throw new Error("Resposta da IA inesperada: " + res);
      addLog("Conexão Groq OK.", "success");
    } catch(e) { addLog("Erro Groq IA: " + e.message, "error"); }

    // 4. Supabase Realtime
    try {
      addLog("Testando Supabase Realtime WebSockets...", "info");
      const { supabase } = require("../lib/supabaseClient");
      const channel = supabase.channel('qa_test_channel');
      await new Promise((resolve, reject) => {
        channel.subscribe(async (status) => {
          if (status === 'SUBSCRIBED') {
            await supabase.removeChannel(channel);
            resolve();
          } else if (status === 'CHANNEL_ERROR') {
            reject(new Error("Falha ao assinar canal"));
          }
        });
        setTimeout(() => reject(new Error("Timeout no WebSocket")), 5000);
      });
      addLog("Supabase Realtime OK.", "success");
    } catch(e) { addLog("Erro Realtime: " + e.message, "error"); }

    addLog("Bateria de testes finalizada.", "info");
    setRunning(false);
  }

  return (
    <section className='p-6 rounded-2xl shadow-sm border mt-6' style={{ backgroundColor: T.surface, borderColor: T.importante }}>
      <div className='flex items-center justify-between mb-4'>
        <h3 className='text-xl font-bold' style={{ color: T.importante }}>🛠️ Painel do Desenvolvedor (QA)</h3>
        <PrimaryButton onClick={runAllTests} disabled={running}>{running ? "Rodando Testes..." : "Executar Testes QA"}</PrimaryButton>
      </div>
      <div className='bg-black p-4 rounded-lg h-64 overflow-y-auto font-mono text-xs shadow-inner'>
        {logs.length === 0 && <span className="text-gray-500">Aguardando execução...</span>}
        {logs.map((l, i) => (
          <div key={i} className={\`mb-1 \${l.type === 'error' ? 'text-red-500' : l.type === 'success' ? 'text-green-500' : 'text-blue-300'}\`}>
            <span className="text-gray-600">[{l.time}]</span> {l.msg}
          </div>
        ))}
      </div>
    </section>
  );
}
`;

tabs = tabs.replace("class ConfigErrorBoundary extends React.Component {", devQAPanel + "\nclass ConfigErrorBoundary extends React.Component {");

// Add secret clicks to ConfigTabInner
tabs = tabs.replace(
  "function ConfigTabInner({ config = {}, updateConfig }) {",
  "function ConfigTabInner({ config = {}, updateConfig, userId }) {\n  const [devClicks, setDevClicks] = useState(0);\n  const isDev = devClicks >= 5;"
);

tabs = tabs.replace(
  "<h2 className='text-3xl font-bold mb-6' style={{ color: T.ink }}>Configurações</h2>",
  "<h2 onClick={() => setDevClicks(c => c + 1)} className='text-3xl font-bold mb-6 select-none cursor-pointer' style={{ color: T.ink }}>Configurações</h2>"
);

tabs = tabs.replace(
  "      </div>\n    );\n  }",
  "        {isDev && <QAAutomatedSystem userId={userId} />}\n      </div>\n    );\n  }"
);

// Pass userId to ConfigTab
let app = fs.readFileSync('src/App.jsx', 'utf8');
app = app.replace(
  '{tab === "config" && <ConfigTab config={config} updateConfig={updateConfig} />}',
  '{tab === "config" && <ConfigTab config={config} updateConfig={updateConfig} userId={userId} />}'
);

fs.writeFileSync('src/components/Tabs.jsx', tabs, 'utf8');
fs.writeFileSync('src/App.jsx', app, 'utf8');
