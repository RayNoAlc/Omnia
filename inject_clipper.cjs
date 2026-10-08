const fs = require('fs');
let app = fs.readFileSync('src/App.jsx', 'utf8');

// Add initialInboxText state
app = app.replace(
  /const \[showSearch, setShowSearch\] = useState\(false\);/,
  'const [showSearch, setShowSearch] = useState(false);\n  const [initialInboxText, setInitialInboxText] = useState("");'
);

// Add URL parser effect
const urlParserEffect = `
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const clipperText = params.get('clipperText');
    const clipperTitle = params.get('clipperTitle');
    const clipperUrl = params.get('clipperUrl');
    
    if (clipperText || clipperUrl) {
      const compiled = \`[\${clipperTitle || 'Sem Título'}](\${clipperUrl || ''})\\n\\n\${clipperText || ''}\`;
      setInitialInboxText(compiled);
      setTab("inbox");
      
      // Clean URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);
`;

app = app.replace(
  /const updateConfig = \(newCfg\) => \{ setConfig\(newCfg\); localStorage\.setItem\("omnia_config", JSON\.stringify\(newCfg\)\); \};/,
  urlParserEffect + '\n  const updateConfig = (newCfg) => { setConfig(newCfg); localStorage.setItem("omnia_config", JSON.stringify(newCfg)); };'
);

// Pass initialInboxText to InboxTab
app = app.replace(
  /<InboxTab userId=\{userId\} \/>/,
  '<InboxTab userId={userId} initialInboxText={initialInboxText} setInitialInboxText={setInitialInboxText} />'
);

// Update InboxTab in Tabs.jsx
let tabs = fs.readFileSync('src/components/Tabs.jsx', 'utf8');
tabs = tabs.replace(
  /export function InboxTab\(\{ userId \}\) \{/,
  'export function InboxTab({ userId, initialInboxText, setInitialInboxText }) {'
);

tabs = tabs.replace(
  /const \[texto, setTexto\] = useState\(""\);/,
  'const [texto, setTexto] = useState(initialInboxText || "");\n  useEffect(() => { if (initialInboxText) { setTexto(initialInboxText); setInitialInboxText(""); } }, [initialInboxText, setInitialInboxText]);'
);

// Add Web Clipper Bookmarklet UI in ConfigTab
const clipperHtml = `
        <section className='p-6 rounded-2xl shadow-sm border' style={{ backgroundColor: T.surface, borderColor: T.border }}>
          <div className='flex items-center gap-3 mb-4'>
            <Paperclip className='w-6 h-6' style={{ color: T.brand }} />
            <h3 className='text-xl font-bold' style={{ color: T.ink }}>Web Clipper (Favorito)</h3>
          </div>
          <p className='mb-4 text-sm' style={{ color: T.inkSoft }}>Arraste o botão abaixo para a barra de favoritos do seu navegador. Quando estiver em qualquer site ou artigo, clique no favorito para enviar o texto automaticamente para a Inbox do Omnia!</p>
          <div className="p-4 rounded border flex items-center justify-center bg-gray-100 dark:bg-gray-800">
            <a 
              href="javascript:(function(){const sel=window.getSelection().toString();const text=sel?sel:document.body.innerText;const title=document.title;const url=window.location.href;const target='https://omnia-unio.vercel.app/?clipperTitle='+encodeURIComponent(title)+'&clipperUrl='+encodeURIComponent(url)+'&clipperText='+encodeURIComponent(text.substring(0,3000));window.open(target,'_blank');})();"
              className="px-4 py-2 font-bold text-white rounded-full shadow cursor-grab active:cursor-grabbing"
              style={{ backgroundColor: T.brand }}
              title="Arraste para a barra de favoritos"
              onClick={e => e.preventDefault()}
            >
              Omnia Clipper
            </a>
          </div>
        </section>
`;

tabs = tabs.replace(
  /<section className='p-6 rounded-2xl shadow-sm border' style=\{\{ backgroundColor: T\.surface, borderColor: T\.border \}\}>\s*<div className='flex items-center gap-3 mb-4'>\s*<h3 className='text-xl font-bold' style=\{\{ color: T\.ink \}\}><Key size=\{20\} className="inline mr-2 -mt-1" \/> Inteligência Artificial<\/h3>/,
  clipperHtml + '\n        <section className=\'p-6 rounded-2xl shadow-sm border\' style={{ backgroundColor: T.surface, borderColor: T.border }}>\n          <div className=\'flex items-center gap-3 mb-4\'>\n            <h3 className=\'text-xl font-bold\' style={{ color: T.ink }}><Key size={20} className="inline mr-2 -mt-1" /> Inteligência Artificial</h3>'
);

fs.writeFileSync('src/App.jsx', app, 'utf8');
fs.writeFileSync('src/components/Tabs.jsx', tabs, 'utf8');
console.log("Injected Web Clipper!");
