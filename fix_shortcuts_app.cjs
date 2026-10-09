const fs = require('fs');
let app = fs.readFileSync('src/App.jsx', 'utf8');

const shortcutsHtml = `
  // --- ATALHOS DE TECLADO ---
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) return;
      
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSearchQuery("");
        setShowSearch(true);
      } else if (e.key.toLowerCase() === 'f') {
        e.preventDefault();
        setTab("foco");
      } else if (e.key.toLowerCase() === 'c') {
        e.preventDefault();
        setTab("agenda");
      } else if (e.key.toLowerCase() === 'b') {
        e.preventDefault();
        setTab("biblioteca");
      } else if (e.key.toLowerCase() === 'h') {
        e.preventDefault();
        setTab("hoje");
      } else if (e.key === '?') {
        alert("Atalhos:\\nF: Foco\\nC: Calendário/Agenda\\nB: Biblioteca\\nH: Hoje\\nCtrl+K: Busca Global");
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // --- OMNIA SEARCH BACKLINKS ---
  useEffect(() => {
    const handleOmniaSearch = (e) => {
      if (typeof e.detail === "string") setSearchQuery(e.detail);
      setShowSearch(true);
    };
    window.addEventListener('omnia-search', handleOmniaSearch);
    return () => window.removeEventListener('omnia-search', handleOmniaSearch);
  }, []);
`;

app = app.replace(
  /const \[showSearch, setShowSearch\] = useState\(false\);/,
  'const [showSearch, setShowSearch] = useState(false);\n  const [searchQuery, setSearchQuery] = useState("");\n' + shortcutsHtml
);

app = app.replace(
  /setShowSearch\(false\)/,
  'setShowSearch(false)} initialQuery={searchQuery'
);

fs.writeFileSync('src/App.jsx', app, 'utf8');
console.log("Injected properly into App.jsx!");
